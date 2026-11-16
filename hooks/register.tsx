import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene'

// Papel crema con el naranja de Clawd como acento. Solo modo claro.
// Sin overrideColorScheme: la versión 2.1.322 lo rechaza y la app de escritorio lo ignora.
const { theme, problems } = makeColors({
  label: 'Clawds',
  only: 'light',
  roles: { accent: '#D97757', danger: '#C0353F', success: '#4E7D3A', warning: '#B07A12', pro: '#7A5BA6' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#EFE8DC',
        'surface-1': '#F5F0E7',
        'surface-2': '#FBF8F2',
        'text-primary': '#211C17',
        'text-secondary': '#4B433A',
        'text-muted': '#6A6054',
      },
    },
  },
})

const SCENE_NAME = 'clawds'

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE_NAME, glass: { blur: 14, tint: '#FBF8F2', opacity: 0.62 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    try {
      const set = await $.theme.set(LOOK)

      if (!set.isDrawn) {
        $.ui.status(set.reason)
      }
    } catch (error) {
      $.ui.toast(`Tema Clawds: ${String(error)}`)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== SCENE_NAME) {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        source={SCENE}
        alt="Una colonia de Clawds jugando: torre, pelota, globo, desfile, subibaja, baile y cuerda"
        isInteractive
      />
    )
  })
}
