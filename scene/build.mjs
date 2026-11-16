// Genera hooks/scene.ts: la escena SVG de la colonia de Clawds.
// Uso: node scene/build.mjs   (desde la carpeta del mod)
// Opcional: node scene/build.mjs <carpeta> también escribe dos vistas previas
// en esa carpeta: clawds-animado.html y clawds-quieto.html (como la dibuja la
// app cuando congela el fondo).
//
// Diseño: la app de escritorio puede congelar el fondo (pone animation:none a
// todo). Por eso cada pose quieta ya cuenta la escena, y la animación es un
// extra: las poses van en style="transform:..." y las animaciones en clases.
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

const C = {
  bg: '#F4EFE6',
  dot: '#E7DFCF',
  ground: '#E6DBC6',
  shadow: '#DED1BA',
  body: '#D97757',
  eye: '#2B2018',
  cream: '#FFF8EC',
  wood: '#CDAE80',
  woodDark: '#A9875C',
  leaf: '#9DBF86',
  leafDark: '#7FA66A',
  water: '#B7D3EC',
  waterDark: '#8DB4DB',
  yellow: '#F2C14E',
  blue: '#7FA8D6',
  pink: '#EBA6A0',
  red: '#E0786A',
  purple: '#B49AD6',
  green: '#7FAE6B',
  brick: '#D9A07B',
  gray: '#6E6259',
  soft: '#B4A385',
}

// Un Clawd mide 12 x 8.5 unidades. Con S = 4 queda de 48 x 34.
const S = 4
const CH = 8.5 * S
const top = gy => gy - CH
const sitTop = gy => gy - 6.9 * S
const r = (x, y, w, h, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}"${extra}/>`
const st = (cls, style) => `${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''}`
const anim = (cls, delay) => st(cls, delay !== undefined ? `animation-delay:${delay}s` : '')

const HATS = {
  party: c => `<path d="M4.6 0L6 -3.6L7.4 0Z" fill="${c ?? C.purple}"/><circle cx="6" cy="-3.7" r=".55" fill="${C.yellow}"/>`,
  crown: () => `<path d="M3.6 0V-2.1L4.8 -1.1L6 -2.7L7.2 -1.1L8.4 -2.1V0Z" fill="${C.yellow}"/>`,
  hard: () => `<path d="M3.2 0.1A2.8 2.2 0 0 1 8.8 0.1Z" fill="${C.yellow}"/>${r(2.6, -0.3, 6.8, 0.6, ` fill="${C.yellow}"`)}`,
  bow: () => `<path d="M8 -0.6L9.4 -1.6V0.4ZM8 -0.6L6.6 -1.6V0.4Z" fill="${C.pink}"/>`,
  beret: () => `<ellipse cx="6.3" cy="-0.2" rx="2.6" ry=".9" fill="${C.gray}"/>`,
}

/**
 * Un Clawd con su esquina superior izquierda en (x, y).
 * Pose quieta: tilt (grados), armL/armR (grados), step (piernas alternadas), sit.
 * Animación: body, armLc/armRc, legs ('walk'), move (a escala de escena).
 */
function clawd(x, y, o = {}) {
  const s = o.s ?? S
  const legH = o.sit ? 1.2 : 3
  const lift = o.step ? 'transform:translateY(-.9px)' : ''
  const legs =
    `<g${st(o.legs)}>` +
    r(2.5, 5.5, 1, legH, ' class="la"') +
    r(4, 5.5, 1, legH, ` class="lb"${lift ? ` style="${lift}"` : ''}`) +
    r(7, 5.5, 1, legH, ' class="la"') +
    r(8.5, 5.5, 1, legH, ` class="lb"${lift ? ` style="${lift}"` : ''}`) +
    `</g>`
  const arm = (side, deg, cls) =>
    `<g${st(`a${side}${cls ? ` ${cls}` : ''}`, [deg ? `transform:rotate(${deg}deg)` : '', o.armDelay !== undefined ? `animation-delay:${o.armDelay}s` : ''].filter(Boolean).join(';'))}>${
      side === 'L' ? r(-0.2, 3, 2.4, 2) : r(9.8, 3, 2.4, 2)
    }${side === 'R' ? (o.handR ?? '') : (o.handL ?? '')}</g>`
  const dx = o.look ?? 0
  let eyes
  if (o.eyes === 'sleep') {
    eyes = `<g fill="${C.eye}">${r(3.7, 2.5, 1.6, 0.45)}${r(6.7, 2.5, 1.6, 0.45)}</g>`
  } else if (o.eyes === 'happy') {
    eyes = `<path d="M3.8 2.9L4.5 2.1L5.2 2.9M6.8 2.9L7.5 2.1L8.2 2.9" stroke="${C.eye}" stroke-width=".5" fill="none"/>`
  } else {
    eyes = `<g fill="${C.eye}"${anim('blink', o.blinkDelay ?? -((x * 7 + y * 3) % 40) / 10)}>${r(4 + dx, 1.6, 1, 1.6)}${r(7 + dx, 1.6, 1, 1.6)}</g>`
  }
  const hat = o.hat ? HATS[o.hat](o.hatColor) : ''
  const shadow = o.shadow === false ? '' : `<ellipse cx="6" cy="${o.sit ? 6.9 : 8.6}" rx="5.2" ry=".7" fill="${C.shadow}"/>`
  const bodyStyle = [o.tilt ? `transform:rotate(${o.tilt}deg)` : '', o.delay !== undefined ? `animation-delay:${o.delay}s` : '']
    .filter(Boolean)
    .join(';')
  const inner =
    `<g${st(`ib${o.body ? ` ${o.body}` : ''}`, bodyStyle)}>` +
    (o.behind ?? '') +
    legs +
    arm('L', o.armL, o.armLc) +
    arm('R', o.armR, o.armRc) +
    r(2, 0, 8, 6) +
    eyes +
    hat +
    (o.extra ?? '') +
    `</g>`
  const placed = `<g transform="translate(${x} ${y}) scale(${s})" fill="${C.body}">${shadow}${inner}</g>`
  return o.move ? `<g${anim(o.move, o.moveDelay)}>${placed}</g>` : placed
}

// ---------- Utilería ----------
const ground = (x, gy, w) => r(x, gy - 2, w, 6, ` rx="3" fill="${C.ground}"`)
const star = (cx, cy, k, cls = 'twinkle', delay = 0) =>
  `<path${st(cls, `transform-origin:${cx}px ${cy}px;animation-delay:${delay}s`)} fill="${C.yellow}" d="M${cx} ${cy - 9 * k}L${cx + 2.4 * k} ${cy - 2.4 * k}L${cx + 9 * k} ${cy}L${cx + 2.4 * k} ${cy + 2.4 * k}L${cx} ${cy + 9 * k}L${cx - 2.4 * k} ${cy + 2.4 * k}L${cx - 9 * k} ${cy}L${cx - 2.4 * k} ${cy - 2.4 * k}Z"/>`
const heart = (cx, cy, k, color = C.red) =>
  `<path fill="${color}" d="M${cx} ${cy + 8 * k}C${cx - 12 * k} ${cy} ${cx - 9 * k} ${cy - 9 * k} ${cx} ${cy - 4 * k}C${cx + 9 * k} ${cy - 9 * k} ${cx + 12 * k} ${cy} ${cx} ${cy + 8 * k}Z"/>`
const balloon = (cx, cy, rr, color) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rr}" ry="${rr * 1.2}" fill="${color}"/><path d="M${cx - 3} ${cy + rr * 1.2 + 4}L${cx} ${cy + rr * 1.2 - 1}L${cx + 3} ${cy + rr * 1.2 + 4}Z" fill="${color}"/><ellipse cx="${cx - rr * 0.35}" cy="${cy - rr * 0.4}" rx="${rr * 0.22}" ry="${rr * 0.35}" fill="#fff" opacity=".4"/>`
const line = (d, color = C.soft, w = 1.5) => `<path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`
const tree = (x, gy, h = 100, k = 1) =>
  r(x - 5 * k, gy - h, 10 * k, h, ` fill="${C.woodDark}"`) +
  `<circle cx="${x}" cy="${gy - h - 8 * k}" r="${34 * k}" fill="${C.leaf}"/>` +
  `<circle cx="${x - 26 * k}" cy="${gy - h + 10 * k}" r="${22 * k}" fill="${C.leaf}"/>` +
  `<circle cx="${x + 26 * k}" cy="${gy - h + 10 * k}" r="${22 * k}" fill="${C.leaf}"/>` +
  `<circle cx="${x - 10 * k}" cy="${gy - h - 18 * k}" r="${9 * k}" fill="${C.leafDark}" opacity=".5"/>` +
  `<circle cx="${x + 16 * k}" cy="${gy - h + 4 * k}" r="${7 * k}" fill="${C.leafDark}" opacity=".5"/>`
const flower = (x, gy, h, color) =>
  line(`M${x} ${gy}V${gy - h}`, C.green, 1.6) +
  [0, 72, 144, 216, 288]
    .map(a => `<circle cx="${(x + 4 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(gy - h + 4 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" r="3" fill="${color}"/>`)
    .join('') +
  `<circle cx="${x}" cy="${gy - h}" r="2.2" fill="${C.yellow}"/>`
const butterfly = (x, y, color, delay = 0) =>
  `<g${st('flutter', `transform-origin:${x}px ${y}px;animation-delay:${delay}s`)}><ellipse cx="${x - 4}" cy="${y - 2}" rx="4.5" ry="3.5" fill="${color}"/><ellipse cx="${x + 4}" cy="${y - 2}" rx="4.5" ry="3.5" fill="${color}"/><ellipse cx="${x - 3}" cy="${y + 3}" rx="3" ry="2.5" fill="${color}"/><ellipse cx="${x + 3}" cy="${y + 3}" rx="3" ry="2.5" fill="${color}"/>${r(x - 0.7, y - 4, 1.4, 9, ` fill="${C.gray}"`)}</g>`
const note = (x, y, ch, delay) =>
  `<text${anim('drift', delay)} x="${x}" y="${y}" font-family="system-ui,sans-serif" font-size="18" fill="${C.soft}">${ch}</text>`
const zz = (x, y, size, delay) =>
  `<text${anim('drift', delay)} x="${x}" y="${y}" font-family="ui-monospace,Menlo,monospace" font-weight="700" font-size="${size}" fill="${C.soft}">z</text>`
const tuft = (x, gy) => line(`M${x - 4} ${gy}L${x - 2} ${gy - 6}M${x} ${gy}V${gy - 8}M${x + 4} ${gy}L${x + 2} ${gy - 6}`, C.leafDark, 1.4)

// Cada viñeta vive en una celda de 320 x 250; el piso de la celda está en y = 215.
const G = 215
const cell = (col, row, body) => `<g transform="translate(${col * 320} ${row * 250})">${body}</g>`

const V = []

// ---------- Fila 1 ----------
// Pirámide de 6 con corona arriba y un fan que la anima.
V.push(
  cell(
    0,
    0,
    ground(40, G, 250) +
      `<g class="wob" style="transform-origin:160px ${G}px">` +
      [88, 136, 184].map((x, i) => clawd(x, top(G), { body: 'strain', delay: -i * 0.3 })).join('') +
      [112, 160].map(x => clawd(x, top(G) - CH, { shadow: false, armL: 20, armR: -20 })).join('') +
      clawd(136, top(G) - 2 * CH, { shadow: false, hat: 'crown', armL: 70, armR: -70, armLc: 'waveL', armRc: 'waveR', eyes: 'happy' }) +
      `</g>` +
      clawd(238, top(G), { body: 'hop', armL: 60, armR: -60, eyes: 'happy', hat: 'party', hatColor: C.blue }) +
      star(270, 120, 0.8, 'twinkle', -0.4),
  ),
)

// Globos: dos en el piso y uno que ya va flotando.
V.push(
  cell(
    1,
    0,
    ground(30, G, 260) +
      line(`M104 189Q114 160 112 132`) +
      balloon(112, 110, 16, C.red) +
      clawd(60, top(G), { armR: -60, look: 0.3 }) +
      `<g class="float">` +
      line(`M184 126Q194 100 190 80`) +
      balloon(190, 54, 20, C.blue) +
      clawd(140, 118, { shadow: false, armR: -60, legs: 'walkSlow', step: true, eyes: 'happy' }) +
      `</g>` +
      line(`M226 189Q218 160 214 132`) +
      balloon(214, 112, 15, C.yellow) +
      clawd(222, top(G), { armL: 60, armR: -70, armRc: 'waveR', look: -0.4 }),
  ),
)

// Cometa: uno la vuela corriendo y otro festeja.
V.push(
  cell(
    2,
    0,
    ground(10, G, 290) +
      line(`M116 190Q190 150 250 58`, C.soft, 1.2) +
      `<g class="kite" style="transform-origin:250px 56px">` +
      `<path d="M250 26L268 54L250 86L232 54Z" fill="${C.purple}"/>` +
      line(`M250 26V86M232 54H268`, '#fff', 1) +
      line(`M250 86Q240 104 248 118Q256 132 244 146`, C.soft, 1.2) +
      `<path d="M242 101l6 3l-6 3zM250 123l6 3l-6 3z" fill="${C.pink}"/>` +
      `</g>` +
      clawd(70, top(G), { armR: -50, tilt: -6, step: true, legs: 'walk', body: 'bob', look: 0.4 }) +
      clawd(14, top(G), { armL: 60, armR: -60, body: 'hop', eyes: 'happy', delay: -0.3 }),
  ),
)

// Pelota: dos se la pasan y el de en medio brinca para quitársela.
V.push(
  cell(
    3,
    0,
    ground(20, G, 280) +
      clawd(40, top(G), { armR: -35, look: 0.4 }) +
      clawd(232, top(G), { armL: 35, look: -0.4 }) +
      clawd(136, top(G) - 14, { body: 'jump', armL: 70, armR: -70, look: -0.3 }) +
      `<g class="bx"><g class="by"><g class="spin" style="transform-origin:110px 112px">` +
      `<circle cx="110" cy="112" r="8" fill="${C.yellow}"/><path d="M102 112a8 8 0 0 1 16 0z" fill="${C.blue}"/>` +
      `</g></g></g>` +
      line(`M84 150q8 -18 18 -30`, C.soft, 1) +
      line(`M92 156q8 -18 18 -30`, C.soft, 1),
  ),
)

// Columpio: uno se columpia y otro lo empuja.
V.push(
  cell(
    4,
    0,
    ground(20, G, 280) +
      tree(220, G, 118) +
      r(126, 95, 94, 6, ` rx="3" fill="${C.woodDark}"`) +
      `<g class="swing" style="transform-origin:158px 98px;transform:rotate(-14deg)">` +
      line(`M140 98V175M176 98V175`, C.woodDark, 1.6) +
      r(130, 174, 56, 5, ` rx="2" fill="${C.wood}"`) +
      clawd(134, sitTop(174), { sit: true, shadow: false, armL: 60, armR: -60, eyes: 'happy' }) +
      `</g>` +
      clawd(54, top(G), { armR: -10, tilt: 10, step: true, look: 0.4 }),
  ),
)

// ---------- Fila 2 ----------
// Picnic.
V.push(
  cell(
    0,
    1,
    ground(20, G, 280) +
      clawd(130, top(196), { hat: 'party', armL: 60, armR: -60, eyes: 'happy', body: 'hop', shadow: false }) +
      r(50, 196, 220, 20, ` rx="3" fill="url(#chk)"`) +
      clawd(54, sitTop(206), { sit: true, look: 0.4, shadow: false }) +
      clawd(218, sitTop(206), { sit: true, look: -0.4, shadow: false, armL: 20 }) +
      `<path d="M112 200a12 12 0 0 0 24 0z" fill="${C.green}"/><path d="M114.5 200a9.5 9.5 0 0 0 19 0z" fill="${C.red}"/>` +
      `<g fill="${C.eye}">${r(119, 202, 1.4, 2)}${r(124, 204, 1.4, 2)}${r(129, 202, 1.4, 2)}</g>` +
      r(160, 186, 26, 14, ` rx="2" fill="${C.cream}"`) +
      r(160, 186, 26, 5, ` rx="2" fill="${C.pink}"`) +
      r(172, 176, 2, 10, ` fill="${C.blue}"`) +
      `<ellipse class="flick" style="transform-origin:173px 176px" cx="173" cy="173" rx="2" ry="3.2" fill="${C.yellow}"/>`,
  ),
)

// Desfile con bandera: cruza toda la escena cuando hay animación.
{
  const flag = `<g fill="${C.woodDark}">${r(11.8, -6, 0.5, 10)}</g><path d="M12.3 -6L16.5 -4.7L12.3 -3.4Z" fill="${C.blue}"/>`
  const walkers = []
  for (let i = 0; i < 6; i++) {
    walkers.push(
      clawd(12 + i * 50, top(G), {
        legs: 'walk',
        body: 'bob',
        step: i % 2 === 1,
        delay: -i * 0.13,
        armR: i === 5 ? -60 : 0,
        extra: i === 5 ? flag : '',
        hat: i === 2 ? 'party' : i === 4 ? 'bow' : undefined,
        look: 0.4,
      }),
    )
  }
  V.push(cell(1, 1, ground(10, G, 300) + `<g class="parade">${walkers.join('')}</g>`))
}

// Choca esas, con dos que festejan.
V.push(
  cell(
    2,
    1,
    ground(10, G, 300) +
      clawd(92, top(G), { move: 'toR', armR: -62, armRc: 'hiR', look: 0.4 }) +
      clawd(140, top(G), { move: 'toL', armL: 62, armLc: 'hiL', look: -0.4 }) +
      star(140, 168, 1.1, 'burst') +
      star(124, 158, 0.55, 'burst', 0.08) +
      star(156, 156, 0.6, 'burst', 0.12) +
      clawd(232, top(G), { armL: 60, armR: -60, body: 'hop', hat: 'party', hatColor: C.pink, eyes: 'happy' }) +
      clawd(22, top(G), { armL: 45, armR: -45, body: 'hop', delay: -0.4, eyes: 'happy' }),
  ),
)

// Pintor con modelo.
V.push(
  cell(
    3,
    1,
    ground(10, G, 300) +
      line(`M178 140L160 215M178 140L196 215M178 140V215`, C.woodDark, 2) +
      r(150, 146, 56, 40, ` rx="2" fill="${C.cream}" stroke="${C.wood}" stroke-width="2"`) +
      `<g fill="${C.body}">${r(166, 156, 24, 15)}${r(161, 162, 5, 4)}${r(190, 162, 5, 4)}${r(168, 171, 2, 7)}${r(173, 171, 2, 7)}${r(181, 171, 2, 7)}${r(186, 171, 2, 7)}</g>` +
      `<g fill="${C.eye}">${r(172, 160, 2, 3)}${r(182, 160, 2, 3)}</g>` +
      clawd(96, top(G), {
        hat: 'beret',
        armR: -45,
        armRc: 'paint',
        handR: line(`M12 4L15.5 0.5`, C.woodDark, 0.5) + `<circle cx="15.6" cy="0.4" r=".6" fill="${C.blue}"/>`,
        armL: 25,
        handL: `<ellipse cx="-0.5" cy="4.6" rx="2.2" ry="1.3" fill="${C.cream}"/><circle cx="-1.3" cy="4.4" r=".4" fill="${C.red}"/><circle cx="0" cy="4.2" r=".4" fill="${C.blue}"/>`,
        look: 0.5,
      }) +
      clawd(234, top(G), { armL: 70, armR: -20, eyes: 'happy', hat: 'bow', handL: line('M-0.2 4L-0.9 2.2', C.green, 0.35) + `<circle cx="-0.9" cy="1.9" r=".9" fill="${C.pink}"/><circle cx="-0.9" cy="1.9" r=".35" fill="${C.yellow}"/>` }),
  ),
)

// Pesca: uno con caña, uno con red y un pez que salta.
V.push(
  cell(
    4,
    1,
    `<ellipse cx="190" cy="212" rx="98" ry="20" fill="${C.water}"/><ellipse cx="200" cy="208" rx="60" ry="9" fill="#fff" opacity=".35"/>` +
      ground(10, G, 96) +
      ground(258, G, 52) +
      `<ellipse cx="80" cy="208" rx="22" ry="8" fill="${C.soft}"/>` +
      clawd(58, sitTop(202), { sit: true, armR: -30, shadow: false, look: 0.5 }) +
      line(`M104 188L172 122`, C.woodDark, 2) +
      line(`M172 122L192 206`, C.soft, 0.8) +
      `<g class="bobber"><circle cx="192" cy="207" r="3.2" fill="${C.red}"/><path d="M188.8 207a3.2 3.2 0 0 0 6.4 0z" fill="#fff"/></g>` +
      `<path d="M18 196h22l-3 19h-16z" fill="${C.blue}"/><path d="M26 196l3 -6l3 6z" fill="${C.waterDark}"/>` +
      `<g class="fishjump" style="transform-origin:236px 196px"><path d="M228 190q8 -8 16 0q-8 8 -16 0z" fill="${C.waterDark}"/><path d="M244 190l6 -4v8z" fill="${C.waterDark}"/></g>` +
      clawd(262, top(G), {
        armL: 40,
        handL: line(`M0 4L-6 -6`, C.woodDark, 0.5) + `<ellipse cx="-6.5" cy="-7.5" rx="2.4" ry="1.6" fill="none" stroke="${C.soft}" stroke-width=".4"/>`,
        look: -0.5,
      }),
  ),
)

// ---------- Fila 3 ----------
// Subibaja con público.
V.push(
  cell(
    0,
    2,
    ground(20, G, 280) +
      `<path d="M150 186L130 ${G}H170Z" fill="${C.woodDark}"/>` +
      `<g class="saw" style="transform-origin:150px 184px;transform:rotate(-9deg)">` +
      r(40, 180, 220, 7, ` rx="3" fill="${C.wood}"`) +
      clawd(44, 180 - CH, { shadow: false, armL: 40, armR: -40, armLc: 'cheerL', armRc: 'cheerR' }) +
      clawd(208, 180 - CH, { shadow: false, armL: 60, armR: -60, eyes: 'happy', armLc: 'cheerL', armRc: 'cheerR', armDelay: -1.2 }) +
      `</g>` +
      clawd(268, top(G), { s: 3.2, armL: 50, armR: -50, body: 'hop', eyes: 'happy' }),
  ),
)

// Fogata con bombones.
V.push(
  cell(
    1,
    2,
    ground(20, G, 280) +
      clawd(140, 190 - 8.5 * 3.4, { s: 3.4, armL: 15, armR: -15, look: 0.1 }) +
      r(138, 202, 44, 7, ` rx="3" fill="${C.woodDark}" transform="rotate(14 160 205)"`) +
      r(138, 202, 44, 7, ` rx="3" fill="${C.woodDark}" transform="rotate(-14 160 205)"`) +
      `<g class="flame" style="transform-origin:160px 204px"><path d="M160 177C169 186 171 197 160 204C149 197 151 186 160 177Z" fill="${C.red}"/><path d="M160 187C165 192 166 198 160 203C154 198 155 192 160 187Z" fill="${C.yellow}"/></g>` +
      star(146, 170, 0.35, 'twinkle', -0.2) +
      star(176, 166, 0.3, 'twinkle', -1.1) +
      clawd(74, sitTop(G), { sit: true, armR: -15, look: 0.5 }) +
      line(`M122 201L150 190`, C.woodDark, 1.4) +
      r(148, 186, 7, 5, ` rx="2" fill="${C.cream}"`) +
      clawd(196, sitTop(G), { sit: true, armL: 15, look: -0.5, eyes: 'happy' }),
  ),
)

// Corazón: dos tomados de la mano.
V.push(
  cell(
    2,
    2,
    ground(40, G, 240) +
      clawd(110, top(G), { armR: -20, eyes: 'happy', body: 'sway2' }) +
      clawd(158, top(G), { armL: 20, eyes: 'happy', body: 'sway2', delay: -1.5 }) +
      `<g class="pulse" style="transform-origin:158px 150px">${heart(158, 150, 1.3)}</g>` +
      `<g${anim('drift', -0.6)}>${heart(138, 124, 0.55, C.pink)}</g>` +
      `<g${anim('drift', -1.8)}>${heart(178, 116, 0.6, C.pink)}</g>` +
      `<g${anim('drift', -2.6)}>${heart(160, 100, 0.45, C.red)}</g>`,
  ),
)

// Construcción: muro de ladrillos, escalera y casco.
{
  let bricks = ''
  for (let row = 0; row < 8; row++) {
    const y = G - 10 - row * 11
    const off = row % 2 ? 10 : 0
    for (let col = 0; col < 7; col++) {
      const x = 160 + off + col * 20
      if (x + 18 > 300) continue
      if (row >= 6 && col < 2) continue
      if (row === 7 && col > 3) continue
      bricks += r(x, y, 18, 9, ` rx="1" fill="${C.brick}"`)
    }
  }
  V.push(
    cell(
      3,
      2,
      ground(10, G, 300) +
        bricks +
        r(130, 120, 3, 95, ` fill="${C.wood}"`) +
        r(148, 120, 3, 95, ` fill="${C.wood}"`) +
        [0, 1, 2, 3, 4, 5, 6].map(i => r(130, 128 + i * 13, 21, 2.5, ` fill="${C.wood}"`)).join('') +
        clawd(116, 124, { shadow: false, hat: 'hard', armL: 70, armR: -70, extra: r(3, -5.5, 6, 2.6, ` rx=".3" fill="${C.brick}"`), look: 0.4 }) +
        clawd(62, top(G), { hat: 'hard', step: true, legs: 'walk', body: 'bob', armL: 60, armR: -60, extra: r(3.2, -5.4, 5.6, 2.4, ` rx=".3" fill="${C.brick}"`), look: 0.4 }) +
        clawd(6, top(G), { hat: 'hard', armR: -25, look: 0.5 }),
    ),
  )
}

// Siesta en hamaca.
V.push(
  cell(
    4,
    2,
    ground(10, G, 300) +
      tree(56, G, 104, 0.85) +
      tree(274, G, 104, 0.85) +
      `<path d="M62 140Q165 228 268 140Q165 206 62 140Z" fill="${C.cream}" stroke="${C.wood}" stroke-width="2"/>` +
      clawd(116, 154, { sit: true, shadow: false, eyes: 'sleep', tilt: 8, body: 'breathe' }) +
      clawd(166, 156, { sit: true, shadow: false, eyes: 'sleep', tilt: -6, body: 'breathe', delay: -1.6 }) +
      `<path d="M62 140Q165 216 268 140" stroke="${C.wood}" stroke-width="2" fill="none"/>` +
      zz(200, 140, 12, -0.4) +
      zz(212, 126, 15, -1.4) +
      zz(226, 110, 18, -2.4),
  ),
)

// ---------- Fila 4 ----------
// Conga con gorros de fiesta.
V.push(
  cell(
    0,
    3,
    ground(10, G, 300) +
      [20, 74, 128, 182, 236]
        .map((x, i) =>
          clawd(x, top(G), {
            hat: 'party',
            hatColor: [C.purple, C.blue, C.pink, C.green, C.yellow][i],
            tilt: i % 2 ? 6 : -6,
            body: 'dance',
            delay: -i * 0.2,
            step: i % 2 === 0,
            eyes: i === 2 ? 'happy' : undefined,
            look: 0.4,
          }),
        )
        .join('') +
      note(56, 160, '♪', -0.3) +
      note(150, 150, '♫', -1.2) +
      note(250, 158, '♪', -2.1),
  ),
)

// Cuerda: dos le dan y uno brinca.
V.push(
  cell(
    1,
    3,
    ground(10, G, 300) +
      clawd(30, top(G), { body: 'turn', look: 0.4 }) +
      clawd(242, top(G), { body: 'turn', look: -0.4 }) +
      `<g class="rope" style="transform-origin:160px 197px">${line(`M79 197Q160 229 241 197`, C.woodDark, 2)}</g>` +
      clawd(136, top(G) - 16, { body: 'jump', armL: 40, armR: -40, eyes: 'happy', shadow: false }) +
      `<ellipse cx="160" cy="215" rx="16" ry="2" fill="${C.shadow}"/>`,
  ),
)

// Jardín: uno riega, otro planta y vuelan mariposas.
V.push(
  cell(
    2,
    3,
    ground(10, G, 300) +
      [
        [168, 22, C.pink],
        [186, 16, C.purple],
        [204, 26, C.red],
        [222, 18, C.yellow],
        [240, 24, C.blue],
      ]
        .map(([x, h, c]) => flower(x, G - 2, h, c))
        .join('') +
      clawd(96, top(G), {
        armR: -15,
        look: 0.5,
        handR: `<path d="M11.4 3.4h4.2v3.2h-4.2z" fill="${C.blue}"/><path d="M15.6 4.2l2.6 -1.4" stroke="${C.blue}" stroke-width=".6"/><path d="M12 3.4q1.7 -1.8 3.4 0" stroke="${C.blue}" stroke-width=".5" fill="none"/>`,
      }) +
      `<g class="drip" fill="${C.waterDark}"><circle cx="171" cy="198" r="1.6"/><circle cx="168" cy="205" r="1.4"/><circle cx="174" cy="207" r="1.3"/></g>` +
      clawd(258, top(G), { armL: 30, look: -0.4, extra: `` }) +
      butterfly(130, 140, C.purple, -0.3) +
      butterfly(230, 150, C.yellow, -0.8),
  ),
)

// Foto de grupo.
V.push(
  cell(
    3,
    3,
    ground(10, G, 300) +
      clawd(26, top(G), {
        armR: 0,
        look: 0.5,
        handR: r(11.6, 2.4, 4.6, 3.4, ` rx=".4" fill="${C.gray}"`) + `<circle cx="13.9" cy="4.1" r="1" fill="${C.blue}"/>`,
      }) +
      star(102, 186, 0.7, 'twinkle', -0.2) +
      clawd(150, top(G), { armL: 60, armR: -20, eyes: 'happy', look: -0.3 }) +
      clawd(198, top(G) - 10, { armL: 70, armR: -70, eyes: 'happy', hat: 'party', hatColor: C.yellow, body: 'hop' }) +
      clawd(246, top(G), { armL: 20, armR: -60, eyes: 'happy', look: -0.3 }),
  ),
)

// Persecución de mariposa.
V.push(
  cell(
    4,
    3,
    ground(10, G, 300) +
      [40, 104, 168]
        .map(
          (x, i) =>
            line(`M${x - 18} ${G - 22}h12M${x - 22} ${G - 14}h14`, C.soft, 1.2) +
            clawd(x, top(G) - (i === 2 ? 8 : 0), {
              tilt: 8,
              step: i % 2 === 0,
              legs: 'walk',
              body: 'run',
              delay: -i * 0.25,
              armR: i === 2 ? -55 : -20,
              armL: 30,
              look: 0.5,
            }),
        )
        .join('') +
      butterfly(258, 150, C.pink, -0.5),
  ),
)

// ---------- Ambiente ----------
const ambient = []
;[
  [305, 215],
  [628, 465],
  [312, 715],
  [948, 965],
  [1268, 215],
  [632, 965],
  [1590, 465],
  [8, 715],
].forEach(([x, gy]) => ambient.push(tuft(x, gy)))
;[
  [300, 40, 0.7, -0.4],
  [620, 300, 0.6, -1.2],
  [960, 40, 0.7, -2.1],
  [1270, 300, 0.6, -0.6],
  [310, 540, 0.6, -1.6],
  [960, 560, 0.7, -2.6],
  [640, 800, 0.6, -0.9],
  [1270, 800, 0.6, -1.9],
  [1560, 40, 0.7, -2.4],
  [30, 300, 0.6, -1.1],
].forEach(([x, y, k, d]) => ambient.push(star(x, y, k, 'twinkle', d)))

// ---------- Animaciones (extra: la app puede congelarlas) ----------
const css = `
g,path,text,ellipse{transform-box:view-box}
.ib{transform-origin:6px 8.5px}
.blink{transform-origin:6px 2.4px;animation:blink 4.2s infinite}
@keyframes blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}
.aL{transform-origin:2px 4px}.aR{transform-origin:10px 4px}
.waveR{animation:waveR .9s ease-in-out infinite}.waveL{animation:waveL .9s ease-in-out infinite}
@keyframes waveR{0%,100%{transform:rotate(-50deg)}50%{transform:rotate(-100deg)}}
@keyframes waveL{0%,100%{transform:rotate(50deg)}50%{transform:rotate(100deg)}}
.cheerR{animation:cheerR 2.4s ease-in-out infinite}.cheerL{animation:cheerL 2.4s ease-in-out infinite}
@keyframes cheerR{0%,100%{transform:rotate(-20deg)}50%{transform:rotate(-70deg)}}
@keyframes cheerL{0%,100%{transform:rotate(20deg)}50%{transform:rotate(70deg)}}
.paint{animation:paint 1.1s ease-in-out infinite}
@keyframes paint{0%,100%{transform:rotate(-35deg)}50%{transform:rotate(-55deg)}}
.walk .la,.walk .lb,.walkSlow .la,.walkSlow .lb{animation:leg .5s steps(1) infinite}
.walk .lb{animation-delay:-.25s}
.walkSlow .la,.walkSlow .lb{animation-duration:.9s}.walkSlow .lb{animation-delay:-.45s}
@keyframes leg{0%{transform:translateY(0)}50%{transform:translateY(-.9px)}}
.bob{animation:bob .5s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-.35px)}}
.run{animation:run .5s ease-in-out infinite}
@keyframes run{0%,100%{transform:translateY(0) rotate(8deg)}50%{transform:translateY(-1px) rotate(8deg)}}
.hop{animation:hop 1.3s ease-in-out infinite}
@keyframes hop{0%,100%{transform:translateY(0) scale(1.04,.94)}20%{transform:translateY(0) scale(1)}50%{transform:translateY(-2.6px) scale(.98,1.03)}80%{transform:translateY(0) scale(1)}}
.strain{animation:strain 3s ease-in-out infinite alternate}
@keyframes strain{0%{transform:scale(1.03,.95)}100%{transform:scale(1)}}
.wob{animation:wob 3s ease-in-out infinite alternate}
@keyframes wob{0%{transform:rotate(-2.5deg)}100%{transform:rotate(2.5deg)}}
.float{animation:float 3.6s ease-in-out infinite alternate}
@keyframes float{0%{transform:translateY(0)}100%{transform:translateY(-18px)}}
.kite{animation:kite 2.6s ease-in-out infinite alternate}
@keyframes kite{0%{transform:rotate(-7deg)}100%{transform:rotate(7deg)}}
.bx{animation:bx 1.4s linear infinite alternate}
@keyframes bx{0%{transform:translateX(-23px)}100%{transform:translateX(123px)}}
.by{animation:by 1.4s infinite}
@keyframes by{0%{transform:translateY(74px);animation-timing-function:cubic-bezier(.3,.7,.6,1)}50%{transform:translateY(-14px);animation-timing-function:cubic-bezier(.4,0,.7,.3)}100%{transform:translateY(74px)}}
.spin{animation:spin 1.4s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.jump{animation:jump 1.2s ease-in-out infinite}
@keyframes jump{0%,100%{transform:translateY(0)}45%,55%{transform:translateY(4px) scale(1.05,.94)}}
.swing{animation:swing 2.4s ease-in-out infinite alternate}
@keyframes swing{0%{transform:rotate(-18deg)}100%{transform:rotate(18deg)}}
.parade{animation:parade 40s linear infinite}
@keyframes parade{0%{transform:translateX(-700px)}100%{transform:translateX(1300px)}}
.toR{animation:toR 2.8s ease-in-out infinite}.toL{animation:toL 2.8s ease-in-out infinite}
@keyframes toR{0%,100%{transform:translateX(-30px)}42%,58%{transform:translateX(0)}}
@keyframes toL{0%,100%{transform:translateX(30px)}42%,58%{transform:translateX(0)}}
.hiR{animation:hiR 2.8s ease-in-out infinite}.hiL{animation:hiL 2.8s ease-in-out infinite}
@keyframes hiR{0%,100%{transform:rotate(0)}36%,62%{transform:rotate(-62deg)}}
@keyframes hiL{0%,100%{transform:rotate(0)}36%,62%{transform:rotate(62deg)}}
.burst{animation:burst 2.8s ease-out infinite}
@keyframes burst{0%,40%{transform:scale(0);opacity:0}48%{transform:scale(1.2);opacity:1}62%{transform:scale(.4);opacity:0}100%{transform:scale(0);opacity:0}}
.saw{animation:saw 2.4s ease-in-out infinite alternate}
@keyframes saw{0%{transform:rotate(-10deg)}100%{transform:rotate(10deg)}}
.flame{animation:flame .5s ease-in-out infinite alternate}
@keyframes flame{0%{transform:scale(1,1)}100%{transform:scale(.9,1.1)}}
.flick{animation:flame .4s ease-in-out infinite alternate}
.sway2{animation:sway2 3s ease-in-out infinite}
@keyframes sway2{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
.pulse{animation:pulse 1.1s ease-in-out infinite}
@keyframes pulse{0%,100%{transform:scale(1)}30%{transform:scale(1.18)}45%{transform:scale(.96)}}
.drift{animation:drift 3.3s ease-out infinite}
@keyframes drift{0%{transform:translate(0,14px);opacity:0}20%{opacity:1}100%{transform:translate(10px,-40px);opacity:0}}
.breathe{animation:breathe 3.4s ease-in-out infinite}
@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.04,.93)}}
.dance{animation:dance 1.2s ease-in-out infinite}
@keyframes dance{0%,100%{transform:translateY(0) rotate(-6deg)}25%{transform:translateY(-2px) rotate(0)}50%{transform:translateY(0) rotate(6deg)}75%{transform:translateY(-2px) rotate(0)}}
.turn{animation:turn 1.2s ease-in-out infinite}
@keyframes turn{0%,100%{transform:translateY(0)}50%{transform:translateY(-.5px)}}
.rope{animation:rope 1.2s ease-in-out infinite}
@keyframes rope{0%,100%{transform:scaleY(1)}50%{transform:scaleY(-1)}}
.bobber{animation:bobber 1.6s ease-in-out infinite}
@keyframes bobber{0%,100%{transform:translateY(0)}50%{transform:translateY(2px)}}
.fishjump{animation:fishjump 3s ease-in-out infinite}
@keyframes fishjump{0%,60%,100%{transform:translateY(16px) rotate(0);opacity:0}70%{opacity:1}80%{transform:translateY(-6px) rotate(-30deg);opacity:1}92%{transform:translateY(14px) rotate(-60deg);opacity:0}}
.drip{animation:drip 1s linear infinite}
@keyframes drip{0%{transform:translateY(-4px);opacity:0}30%{opacity:1}100%{transform:translateY(10px);opacity:0}}
.flutter{animation:flutter .35s ease-in-out infinite alternate}
@keyframes flutter{0%{transform:scaleX(1)}100%{transform:scaleX(.35)}}
.twinkle{animation:twinkle 3.2s ease-in-out infinite}
@keyframes twinkle{0%,100%{transform:scale(.4);opacity:.3}50%{transform:scale(1);opacity:.9}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`
  .replace(/\n/g, '')
  .replace(/\s*([{}:;,])\s*/g, '$1')

const defs = `<defs><pattern id="d" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.4" fill="${C.dot}"/></pattern><pattern id="chk" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${C.cream}"/><rect width="6" height="6" fill="${C.pink}"/><rect x="6" y="6" width="6" height="6" fill="${C.pink}"/></pattern></defs>`

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><style>${css}</style>` +
  defs +
  `<rect width="1600" height="1000" fill="${C.bg}"/><rect width="1600" height="1000" fill="url(#d)"/>` +
  ambient.join('') +
  V.join('') +
  `</svg>`

if (svg.length > 131072) {
  throw new Error(`La escena mide ${svg.length} caracteres; el límite es 131072.`)
}

writeFileSync(
  join(here, '..', 'hooks', 'scene.ts'),
  `// Generado por scene/build.mjs. No lo edites a mano: cambia build.mjs y vuelve a correrlo.\nexport const SCENE = ${JSON.stringify(svg)}\n`,
)
const clawds = (svg.match(/scale\([\d.]+\)" fill/g) ?? []).length
console.log(`scene.ts: ${svg.length} caracteres, ${clawds} Clawds`)

const previewDir = process.argv[2]
if (previewDir) {
  // Así congela la app el fondo: una regla que apaga toda animación.
  const frozen = svg.replace('</style>', '</style><style>*{animation:none!important;transition:none!important}</style>')
  const page = (title, source) =>
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>html,body{margin:0;height:100%;background:${C.bg}}img{display:block;width:100vw;height:100vh}</style><img alt="Escena de Clawds" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}">`
  writeFileSync(join(previewDir, 'clawds-animado.html'), page('Clawds animado', svg))
  writeFileSync(join(previewDir, 'clawds-quieto.html'), page('Clawds quieto', frozen))
  console.log(`vistas previas en ${previewDir}`)
}
