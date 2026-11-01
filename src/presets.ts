import type { GlyphFieldOptions } from './core'

/** Starting points; spread one and override what you like: `{ ...PRESETS.terminal, words: [...] }`. */
export const PRESETS = {
  /** Colourful and lively: the palette drifts, the crosshair follows, words decode. */
  vivid: {
    colors: ['#ff5c8a', '#45b8ff', '#ffd23f', '#3ee6a8', '#ff8c42'],
    cursor: 'crosshair',
    idle: 'typist',
  },
  /** A green phosphor terminal. */
  terminal: {
    colors: ['#3ee6a8', '#7dffc8'],
    glyphColor: '#3ee6a8',
    wordColor: '#eafff5',
    caretInk: '#06140e',
    cursor: 'caret',
    glyphOpacity: 0.14,
  },
  /** Falling-code flavour: half-width katakana and digits in green. */
  matrix: {
    charset: 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789',
    colors: ['#00ff66'],
    glyphColor: '#00ff66',
    wordColor: '#d6ffe4',
    caretInk: '#001a0a',
    mutation: 0.006,
  },
  /** Quiet: one soft colour, no crosshair, no idle typist. For pages where the backdrop should barely be there. */
  minimal: {
    colors: ['currentColor'],
    cursor: 'caret',
    idle: 'none',
    ripple: false,
    glyphOpacity: 0.07,
  },
} satisfies Record<string, GlyphFieldOptions>

export type PresetName = keyof typeof PRESETS
