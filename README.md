# Tema Clawds

Tema claro para la app de Claude Code (escritorio y móvil): paleta crema con el naranja de Clawd como acento y un fondo con 64 Clawds pequeños en 20 escenas (pirámide, globos, cometa, pelota, columpio, picnic, desfile, choca esas, pintor, pesca, subibaja, fogata, corazón, construcción, hamaca, conga, cuerda, jardín, foto y persecución). Cada pose se entiende quieta, porque la app de escritorio puede congelar el fondo; si deja animar, también se mueven. En la terminal no se dibuja.

![Vista previa del fondo](vista-previa.png)

## Instalar

En una terminal con Claude Code abierto:

```
/plugin install clawds --marketplace BEG-lag/tema-clawds
```

Desde la terminal, sin abrir Claude Code:

```bash
claude plugin install clawds --marketplace BEG-lag/tema-clawds
```

En la app de escritorio, donde `/plugin` no funciona: clic en + junto al cuadro de mensaje, luego Plugins, Add marketplace con `BEG-lag/tema-clawds`, y luego Add plugin.

El repositorio es privado: solo se instala si tienes acceso a él en GitHub y tu computadora ya tiene una credencial de git para github.com (una llave SSH, o `gh auth login` y luego `gh auth setup-git`). La instalación no la pide.

Después de instalarlo, abre una sesión nueva en la app (en modo claro) y mándale cualquier mensaje.

## Archivos

| Archivo | Qué es |
| --- | --- |
| `hooks/register.tsx` | Fija los colores y el fondo al iniciar cada sesión |
| `hooks/scene.ts` | La escena SVG (generada, no se edita a mano) |
| `hooks/make-colors.js` | Generador de paleta del sistema de diseño (no se edita) |
| `scene/build.mjs` | Dibuja la escena; aquí se cambian Clawds, juegos y colores |
| `.claude-plugin/marketplace.json` | Marketplace para instalarlo |

## Cambiar la escena

Desde la carpeta del tema:

```bash
node scene/build.mjs
```

## Actualizar después de un cambio

```bash
claude plugin marketplace update mods-beg && claude plugin update clawds@mods-beg
```

## Notas

- Usar la app en modo claro: la app de escritorio todavía no respeta el modo que pide el tema.
- Clawd es la mascota de Claude Code (Anthropic). Este tema es un proyecto personal, sin relación oficial con Anthropic.
