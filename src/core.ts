/**
 * glyphfield: an interactive glyph-matrix backdrop.
 *
 * A dim grid of code characters, a few changing every frame, lit in one colour at a time that drifts through a
 * palette. A block caret marks the cell under the pointer, with a crosshair through its row and column. When the
 * pointer rests, a square patch blooms there and a word decodes: the patch scrambles, stillness closes in from its
 * rim, the word opens from its middle, holds, then scrambles back out from its ends as the stillness lifts. With no
 * pointer, an idle typist moves a caret along the lines and drops a decode now and then. A click sends a ripple out.
 *
 * It keeps out of the way of your content: glyphs behind elements marked `data-glyph-quiet` stay dimmer, and words
 * never decode behind elements marked `data-glyph-cover`, where nobody would see them.
 *
 * The hidden message: if the pointer rests long enough, the words stop and the `message` lines decode in the open
 * space nearest the pointer, a line at a time, like a terminal answering.
 *
 * Rendering: the quiet layer lives on an offscreen canvas where only changed cells are repainted; each frame copies it
 * and draws just the lit cells on top. The loop pauses while the canvas is off screen, and draws one still frame for
 * people who prefer reduced motion.
 */

export type CursorMode = 'crosshair' | 'caret' | 'none'
export type IdleMode = 'typist' | 'none'

/** Every duration, in milliseconds. */
export type Timing = {
  /** stillness before the pointer counts as resting */
  restAfter: number
  /** for the square patch to open */
  grow: number
  /** for the stillness to close in from the rim of the patch to its middle */
  converge: number
  /** between letters appearing (middle first) and leaving (ends first) */
  letterGap: number
  /** the decoded word stays */
  hold: number
  /** a leaving letter flickers through random glyphs before it dims */
  unscramble: number
  /** for the stillness to lift again, from the word back out to the rim */
  release: number
  /** between words while the pointer keeps resting */
  rest: number
  /** per character for the idle typist */
  typeSpeed: number
  /** an idle trail cell stays lit */
  trail: number
  /** the lit glyphs keep one colour */
  toneHold: number
  /** blending into the next colour */
  toneBlend: number
  /** a click ripple lives */
  ripple: number
  /** for the hidden message's patch to open */
  messageOpen: number
  /** between the message's letters locking in along a line */
  messageChar: number
  /** between the message's lines starting */
  messageLine: number
  /** for the message to scramble away */
  messageOut: number
}

export type GlyphFieldOptions = {
  /** Characters the field is made of. */
  charset?: string
  /** Words that decode where the pointer rests, picked at random. */
  words?: string[]
  /** Colours the lit glyphs drift through, one at a time. Any CSS colour, including `var(--brand)`. */
  colors?: string[]
  /** Colour of the dim glyphs. Defaults to the canvas's text colour. */
  glyphColor?: string
  /** Colour of decoded words and the hidden message. Defaults to the canvas's text colour. */
  wordColor?: string
  /** Colour of the glyph inside the block caret, usually the page background. */
  caretInk?: string
  fontFamily?: string
  /** Glyph size in px. */
  fontSize?: number
  /** Row height in px. */
  lineHeight?: number
  /** Opacity of the dim glyphs. */
  glyphOpacity?: number
  /** Opacity of the dim glyphs behind `data-glyph-quiet` elements. */
  quietOpacity?: number
  /** Share of dim glyphs that change each frame. */
  mutation?: number
  /** What follows the pointer: a block caret with a crosshair through it, the caret alone, or nothing. */
  cursor?: CursorMode
  /** Decode a word where the pointer rests. */
  decodeOnRest?: boolean
  /** What happens with no pointer: an idle typist moving a caret along the lines, or nothing. */
  idle?: IdleMode
  /** A click sends a ripple out. */
  ripple?: boolean
  /** A hidden message, a line per string, that decodes once the pointer has rested for `messageAfter`. */
  message?: string[]
  /** Milliseconds of resting before the hidden message shows. */
  messageAfter?: number
  /** Fade the field out toward the bottom, starting this far down (0 to 1). `false` keeps it even. */
  fade?: number | false
  /** Elements, inside the parent, behind which glyphs stay dimmer. */
  quietSelector?: string
  /** Elements, inside the parent, behind which words never decode. */
  coverSelector?: string
  /** Seed for the randomness, so the field plays the same way every time (screenshots, tests, video). */
  seed?: number
  /** Run the animation loop. Set to `false` to drive frames yourself with `tick(ms)`. */
  autoplay?: boolean
  /** Draw a still frame instead of animating when the user prefers reduced motion. */
  respectReducedMotion?: boolean
  /** Override any duration. */
  timing?: Partial<Timing>
  /** Called when a word starts decoding. */
  onDecode?: (word: string) => void
  /** Called when the hidden message shows (`true`) and when it goes (`false`). */
  onMessage?: (shown: boolean) => void
}

/** Where to decode: a point in the canvas (px), or an element whose centre to use. */
export type DecodeTarget = { x: number; y: number } | Element

export type GlyphField = {
  /** Decode `text` at a point or over an element (default: a random open spot, clear of your content). Holds for `hold` ms. */
  decode(text: string, at?: DecodeTarget): void
  /** Show the hidden message now (or other lines), near a point or element. It stays until `hideMessage()`. */
  showMessage(lines?: string[], at?: DecodeTarget): void
  hideMessage(): void
  /** Change any options; only what changed is re-applied. */
  setOptions(options: GlyphFieldOptions): void
  /** Re-measure the layout and re-read the colours, e.g. after moving things around without a resize. */
  refresh(): void
  pause(): void
  resume(): void
  /** Draw the frame at time `ms`. For `autoplay: false`. */
  tick(ms: number): void
  destroy(): void
}

export const DEFAULT_CHARSET = 'abcdefghijklmnopqrstuvwxyz0123456789{}[]()<>/=+-*;:.#$&|_'

export const DEFAULT_WORDS = [
  'react', 'typescript', 'javascript', 'node', 'vite', 'tailwind', 'postgres', 'api', 'graphql', 'docker', 'git',
  'commit', 'merge', 'rebase', 'branch', 'deploy', 'ship', 'build', 'debug', 'refactor', 'review', 'test', 'lint',
  'compile', 'runtime', 'async', 'await', 'promise', 'render', 'hooks', 'state', 'component', 'schema', 'query',
  'cache', 'webhook', 'terminal', 'shell', 'design', 'agent', 'prompt', 'context', 'tokens', 'model', 'llm',
  'inference', 'embedding', 'vector', 'eval', 'reasoning', 'workflow', 'automate', 'pipeline', 'iterate',
]

export const DEFAULT_TIMING: Timing = {
  restAfter: 350,
  grow: 260,
  converge: 1200,
  letterGap: 45,
  hold: 1100,
  unscramble: 320,
  release: 900,
  rest: 700,
  typeSpeed: 70,
  trail: 650,
  toneHold: 4200,
  toneBlend: 900,
  ripple: 1600,
  messageOpen: 500,
  messageChar: 32,
  messageLine: 420,
  messageOut: 700,
}

const DEFAULTS = {
  charset: DEFAULT_CHARSET,
  words: DEFAULT_WORDS,
  colors: ['#ff5c8a', '#45b8ff', '#ffd23f', '#3ee6a8', '#ff8c42'],
  glyphColor: 'currentColor',
  wordColor: 'currentColor',
  caretInk: '#0b0b0f',
  fontFamily: 'ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace',
  fontSize: 14,
  lineHeight: 22,
  glyphOpacity: 0.11,
  quietOpacity: 0.045,
  mutation: 0.0025,
  cursor: 'crosshair' as CursorMode,
  decodeOnRest: true,
  idle: 'typist' as IdleMode,
  ripple: true,
  message: [] as string[],
  messageAfter: 7000,
  fade: false as number | false,
  quietSelector: '[data-glyph-quiet]',
  coverSelector: '[data-glyph-cover]',
  seed: undefined as number | undefined,
  autoplay: true,
  respectReducedMotion: true,
}

/** The value every option takes when you leave it out. */
export const DEFAULT_OPTIONS: Readonly<typeof DEFAULTS> = DEFAULTS

type Resolved = typeof DEFAULTS & { timing: Timing; onDecode?: (word: string) => void; onMessage?: (shown: boolean) => void }

const BLOOM_PX = 130 // half-size of the square patch that blooms where a word decodes
const CROSS_REACH = 0.45 // share of the width/height the crosshair lines reach before fading out
const RIPPLE_SPEED = 0.5 // px per ms
const RIPPLE_BAND = 46 // px width of a ripple's ring
const MESSAGE_FLICKER = 220 // ms a message letter flickers through glyphs before it locks

/** mulberry32: a small, fast seeded generator, so a seeded field plays the same way every time. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const sameValue = (a: unknown, b: unknown) =>
  a === b || (Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]))

type Word = { col: number; row: number; ac: number; ar: number; text: string; t0: number; releaseAge?: number; manual?: boolean }
type Message = { col: number; row: number; lines: string[]; t0: number; releaseAge?: number; manual?: boolean }
type Box = { x0: number; x1: number; y0: number; y1: number }

export function createGlyphField(canvas: HTMLCanvasElement, options: GlyphFieldOptions = {}): GlyphField {
  const ctx = canvas.getContext('2d')
  const base = document.createElement('canvas')
  const bctx = base.getContext('2d')
  const area = canvas.parentElement
  if (!ctx || !bctx || !area) throw new Error('glyphfield: the canvas needs a 2D context and a parent element')

  let o: Resolved = { ...DEFAULTS, ...strip(options), timing: { ...DEFAULT_TIMING, ...options.timing } }
  let random = o.seed === undefined ? Math.random : seeded(o.seed)
  const pick = (s: string | string[]) => s[(random() * s.length) | 0]

  let w = 0, h = 0, dpr = 1, cellW = 9, cols = 0, rows = 0
  let grid: string[] = []
  let quiet: Box[] = [] // where glyphs stay dimmer
  let cover: Box[] = [] // where a word can't be seen
  let tones: number[][] = [], glyph = '', ink = '', caretInk = ''
  let font = ''
  let raf = 0, running = false, visible = true, paused = false, destroyed = false
  let lastNow = 0

  // --- colours: any CSS colour (var(), oklch(), named) is resolved through the DOM, then through a 1px canvas to RGB
  const probe = document.createElement('span')
  probe.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none'
  probe.setAttribute('aria-hidden', 'true')
  const pixel = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const resolve = (color: string) => {
    probe.style.color = ''
    probe.style.color = color === 'currentColor' ? getComputedStyle(canvas).color : color
    return getComputedStyle(probe).color
  }
  const toRgb = (color: string) => {
    if (!pixel) return [255, 255, 255]
    pixel.clearRect(0, 0, 1, 1)
    pixel.fillStyle = color
    pixel.fillRect(0, 0, 1, 1)
    const [r, g, b] = pixel.getImageData(0, 0, 1, 1).data
    return [r, g, b]
  }
  const readColors = () => {
    area.appendChild(probe)
    tones = (o.colors.length ? o.colors : DEFAULTS.colors).map((c) => toRgb(resolve(c)))
    glyph = resolve(o.glyphColor)
    ink = resolve(o.wordColor)
    caretInk = resolve(o.caretInk)
    probe.remove()
  }
  /** The single colour lit glyphs wear right now: one tone, blending into the next at the end of its turn. */
  const litColor = (now: number) => {
    const { toneHold, toneBlend } = o.timing
    const turn = now / toneHold, i = Math.floor(turn) % tones.length
    const a = tones[i], b = tones[(i + 1) % tones.length]
    const t = Math.max(0, ((turn % 1) * toneHold - (toneHold - toneBlend)) / toneBlend)
    return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * t)).join(',')})`
  }

  const inside = (boxes: Box[], x: number, y: number) => boxes.some((b) => x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1)
  const inQuiet = (x: number, y: number) => inside(quiet, x, y)
  const covered = (x: number, y: number) => inside(cover, x, y)
  const cellX = (c: number) => c * cellW + cellW / 2
  const cellY = (r: number) => r * o.lineHeight + o.lineHeight / 2
  const readableBottom = () => h * (o.fade === false ? 0.95 : Math.max(0.2, o.fade - 0.04))

  const paintBase = (i: number) => {
    const c = i % cols, r = (i / cols) | 0, x = cellX(c), y = cellY(r)
    bctx.clearRect(c * cellW, r * o.lineHeight, cellW, o.lineHeight)
    bctx.globalAlpha = inQuiet(x, y) ? o.quietOpacity : o.glyphOpacity
    bctx.fillText(grid[i], x, y)
  }
  const paintAllBase = () => {
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    bctx.clearRect(0, 0, w, h)
    bctx.font = font
    bctx.textAlign = 'center'
    bctx.textBaseline = 'middle'
    bctx.fillStyle = glyph
    for (let i = 0; i < grid.length; i++) paintBase(i)
  }

  const measureZones = () => {
    const me = canvas.getBoundingClientRect()
    const boxes = (sel: string, pad: number) =>
      [...area.querySelectorAll(sel)].map((el) => {
        const r = el.getBoundingClientRect()
        return { x0: r.left - me.left - pad, x1: r.right - me.left + pad, y0: r.top - me.top - pad, y1: r.bottom - me.top + pad }
      })
    quiet = boxes(o.quietSelector, 16)
    cover = boxes(o.coverSelector, 24)
  }

  const layout = () => {
    dpr = Math.min(devicePixelRatio || 1, 2)
    w = canvas.clientWidth
    h = canvas.clientHeight
    for (const c of [canvas, base]) {
      c.width = Math.max(1, w * dpr)
      c.height = Math.max(1, h * dpr)
    }
    font = `500 ${o.fontSize}px ${o.fontFamily}`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.font = font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    cellW = Math.ceil(ctx.measureText('M').width + 3)
    cols = Math.max(1, Math.ceil(w / cellW))
    rows = Math.max(1, Math.ceil(h / o.lineHeight))
    grid = Array.from({ length: cols * rows }, () => pick(o.charset))
    measureZones()
    paintAllBase()
    applyFade()
  }
  const applyFade = () => {
    const mask = o.fade === false ? '' : `linear-gradient(to bottom, #000 ${Math.round(o.fade * 100)}%, transparent)`
    canvas.style.maskImage = mask
    canvas.style.setProperty('-webkit-mask-image', mask)
  }

  // --- the caret: the pointer's cell, or the idle typist's when there is no pointer ---
  const caret = { c: -1, r: -1 }
  const pointer = { active: false, lastMoveAt: -1e9 }
  const trail = new Map<number, number>() // cell → when it was lit
  const typist = { c: 2, r: 3, nextAt: 0, untilStop: 40 }
  const ripples: { x: number; y: number; t0: number }[] = []
  let word: Word | null = null
  let wordEndedAt = -1e9
  let message: Message | null = null
  let messageTriedFor = -1 // the rest (by when it began) the message last tried to appear in

  const light = (c: number, r: number, now: number) => {
    if (c >= 0 && r >= 0 && c < cols && r < rows) trail.set(r * cols + c, now)
  }

  const T = () => o.timing
  const steps = (wd: Word) => Math.ceil((wd.text.length - 1) / 2) // letter steps from the middle to an end
  const revealEnd = (wd: Word) => T().converge + steps(wd) * T().letterGap
  const releaseAge = (wd: Word) => Math.min(wd.releaseAge ?? Infinity, revealEnd(wd) + T().hold)
  const wordLife = (wd: Word) => releaseAge(wd) + Math.max(T().release, steps(wd) * T().letterGap + T().unscramble)
  const startWord = (now: number, text: string, c: number, r: number, manual = false) => {
    if (!text) return
    text = text.slice(0, cols)
    const col = Math.min(cols - text.length, Math.max(0, c - Math.floor(text.length / 2)))
    word = { col, row: Math.min(rows - 1, Math.max(0, r)), ac: c, ar: r, text, t0: now, manual }
    o.onDecode?.(text)
  }

  /** A random cell where `len` letters fit in open space, clear of quiet and cover elements (or the middle). */
  const openSpot = (len: number) => {
    for (let tries = 0; tries < 300; tries++) {
      const c = Math.floor(len / 2) + ((random() * Math.max(1, cols - len)) | 0), r = 1 + ((random() * Math.max(1, rows - 2)) | 0)
      let fits = true
      for (let j = -Math.floor(len / 2) - 1; j <= Math.ceil(len / 2) + 1 && fits; j++) fits = open(Math.min(cols - 1, Math.max(0, c + j)), r)
      if (fits) return { c, r }
    }
    return { c: Math.floor(cols / 2), r: Math.floor(rows / 2) }
  }

  const toCellOf = (at: DecodeTarget | undefined) => {
    if (!at) return { c: Math.floor(cols / 2), r: Math.floor(rows / 2) }
    let x: number, y: number
    if (at instanceof Element) {
      const me = canvas.getBoundingClientRect(), r = at.getBoundingClientRect()
      x = r.left + r.width / 2 - me.left
      y = r.top + r.height / 2 - me.top
    } else ({ x, y } = at)
    return { c: Math.min(cols - 1, Math.max(0, Math.floor(x / cellW))), r: Math.min(rows - 1, Math.max(0, Math.floor(y / o.lineHeight))) }
  }

  // --- the hidden message ---
  // open, readable space: not behind quiet or cover elements, and above where the field fades out
  const open = (c: number, r: number) => {
    const x = cellX(c), y = cellY(r)
    return r >= 1 && y < readableBottom() && !inQuiet(x, y) && !covered(x, y)
  }
  const messageWidth = (lines: string[]) => Math.max(0, ...lines.map((l) => l.length))
  const messageRevealed = (m: Message) => T().messageOpen + (m.lines.length - 1) * T().messageLine + messageWidth(m.lines) * T().messageChar
  /** The open block nearest (c, r) that fits the whole message, with a cell of margin around it. */
  const placeMessage = (lines: string[], near: { c: number; r: number }) => {
    const bw = messageWidth(lines) + 2, bh = lines.length + 2
    let best: { col: number; row: number } | null = null, bestD = Infinity
    for (let r = 0; r + bh <= rows; r++) {
      for (let c = 0; c + bw <= cols; c++) {
        const d = Math.hypot(c + bw / 2 - near.c, (r + bh / 2 - near.r) * (o.lineHeight / cellW))
        if (d >= bestD) continue
        let fits = true
        for (let rr = r; rr < r + bh && fits; rr++) for (let cc = c; cc < c + bw && fits; cc += 2) fits = open(cc, rr) && open(Math.min(cc + 1, c + bw - 1), rr)
        if (fits) {
          best = { col: c + 1, row: r + 1 }
          bestD = d
        }
      }
    }
    return best
  }
  const startMessage = (now: number, lines: string[], near: { c: number; r: number }, manual: boolean) => {
    const at = placeMessage(lines, near)
    if (!at) return false
    message = { ...at, lines, t0: now, manual }
    if (word && word.releaseAge === undefined) word.releaseAge = now - word.t0
    o.onMessage?.(true)
    return true
  }

  const typistStep = (now: number) => {
    // types along the line; now and then breaks to a new line, and every so often drops a decode where it is and
    // keeps typing while that word plays out behind it (one word at a time)
    if (now < typist.nextAt) return
    typist.c++
    if (typist.c >= cols - 2 || random() < 0.015) {
      typist.r = 1 + ((random() * Math.max(1, rows - 2)) | 0)
      typist.c = (random() * cols * 0.8) | 0
    }
    typist.nextAt = now + T().typeSpeed * (0.6 + random() * 0.8)
    caret.c = typist.c
    caret.r = typist.r
    light(caret.c, caret.r, now)
    // it only decodes in open space: never behind quiet elements (too dim to read) or cover elements (hidden)
    const x = cellX(caret.c), y = cellY(caret.r)
    if (--typist.untilStop <= 0 && !word && !message && o.decodeOnRest && o.words.length && !inQuiet(x, y) && !covered(x, y)) {
      typist.untilStop = 25 + ((random() * 45) | 0)
      startWord(now, pick(o.words), caret.c, caret.r)
    }
  }

  const frame = (now: number) => {
    lastNow = now
    const t = T()
    while (ripples.length && now - ripples[0].t0 > t.ripple) ripples.shift()
    for (const [i, at] of trail) if (now - at > t.trail) trail.delete(i)

    // the quiet layer: a few glyphs change, and only their cells are repainted
    const n = Math.max(1, (grid.length * o.mutation) | 0)
    for (let k = 0; k < n; k++) {
      const i = (random() * grid.length) | 0
      grid[i] = pick(o.charset)
      paintBase(i)
    }

    // who drives the caret, and whether it is resting
    if (!pointer.active && o.idle === 'typist') typistStep(now)
    const resting = pointer.active && now - pointer.lastMoveAt > t.restAfter
    if (word && now - word.t0 > wordLife(word)) {
      word = null
      wordEndedAt = now
    }

    // a long enough rest brings out the hidden message instead of another word; moving or leaving sends it away
    if (pointer.active && !message && o.message.length && now - pointer.lastMoveAt > o.messageAfter && messageTriedFor !== pointer.lastMoveAt) {
      messageTriedFor = pointer.lastMoveAt // once per rest, whether it fits or not
      startMessage(now, o.message, caret, false)
    }
    if (message && message.releaseAge === undefined && !message.manual && (!pointer.active || !resting)) message.releaseAge = now - message.t0
    if (message && message.releaseAge !== undefined && now - message.t0 > message.releaseAge + t.messageOut) {
      message = null
      wordEndedAt = now
      o.onMessage?.(false)
    }

    if (pointer.active && resting && !word && !message && o.decodeOnRest && o.words.length && now - wordEndedAt > t.rest) startWord(now, pick(o.words), caret.c, caret.r)
    if (pointer.active && !resting && word && !word.manual && word.releaseAge === undefined) word.releaseAge = now - word.t0 // moved away: send it back

    const lit = new Map<number, { k: number; scramble: boolean }>()
    const put = (i: number, k: number, scramble: boolean) => {
      const was = lit.get(i)
      if (!was || k > was.k) lit.set(i, { k, scramble: scramble || !!was?.scramble })
    }

    // the idle typist's trail, and the crosshair through the pointer's caret
    for (const [i, at] of trail) {
      const k = 1 - (now - at) / t.trail
      put(i, 0.25 + k * 0.75, k > 0.55)
    }
    if (pointer.active && caret.c >= 0 && o.cursor === 'crosshair') {
      const reachC = cols * CROSS_REACH, reachR = rows * CROSS_REACH
      for (let c = 0; c < cols; c++) {
        const k = 1 - Math.abs(c - caret.c) / reachC
        if (k > 0) put(caret.r * cols + c, k * 0.6, false)
      }
      for (let r = 0; r < rows; r++) {
        const k = 1 - Math.abs(r - caret.r) / reachR
        if (k > 0) put(r * cols + caret.c, k * 0.6, false)
      }
    }

    // the square patch around a word: opens, scrambles, stillness closes in, word decodes, lifts, closes
    const wordCells = new Map<number, string>()
    if (word) {
      const age = now - word.t0
      const rel = Math.max(0, Math.min(1, (age - releaseAge(word)) / t.release))
      const opened = Math.min(1, age / t.grow) * (1 - rel)
      const converged = Math.min(1, age / t.converge)
      const rc = Math.max(2, Math.round((BLOOM_PX * opened) / cellW)), rr = Math.max(1, Math.round((BLOOM_PX * opened) / o.lineHeight))
      for (let r = Math.max(0, word.ar - rr); r <= Math.min(rows - 1, word.ar + rr); r++) {
        for (let c = Math.max(0, word.ac - rc); c <= Math.min(cols - 1, word.ac + rc); c++) {
          const d = Math.max(Math.abs(c - word.ac) / rc, Math.abs(r - word.ar) / rr) // square distance, 0 middle → 1 rim
          const still = converged >= 1 - d && !(rel > 0 && d <= rel)
          put(r * cols + c, (0.35 + 0.65 * (1 - d)) * Math.max(opened, 0.2), !still)
        }
      }
      const mid = (word.text.length - 1) / 2
      for (let j = 0; j < word.text.length; j++) {
        const step = Math.ceil(Math.abs(j - mid))
        const shownAt = t.converge + step * t.letterGap
        const leaveAt = releaseAge(word) + (steps(word) - step) * t.letterGap
        const i = word.row * cols + word.col + j
        if (age >= shownAt && age < leaveAt) wordCells.set(i, word.text[j])
        else if (age >= leaveAt && age < leaveAt + t.unscramble) wordCells.set(i, pick(o.charset))
        else put(i, 1, true)
      }
    }

    // the hidden message: a patch opens and scrambles, then each line decodes left to right, a line after the last;
    // the patch goes still once it's all there. On release the letters scramble out from the line ends.
    if (message) {
      const m = message, age = now - m.t0, bw = messageWidth(m.lines)
      const out = m.releaseAge === undefined ? 0 : Math.min(1, (age - m.releaseAge) / t.messageOut)
      const opened = Math.min(1, age / t.messageOpen) * (1 - out)
      const settled = age > messageRevealed(m) + MESSAGE_FLICKER && out === 0
      for (let r = m.row - 1; r <= m.row + m.lines.length; r++) {
        for (let c = m.col - 2; c <= m.col + bw + 1; c++) {
          if (r >= 0 && c >= 0 && r < rows && c < cols) put(r * cols + c, 0.18 + 0.3 * opened, !settled)
        }
      }
      m.lines.forEach((line, l) => {
        for (let j = 0; j < line.length && m.col + j < cols; j++) {
          const i = (m.row + l) * cols + m.col + j
          const lockAt = t.messageOpen + l * t.messageLine + j * t.messageChar
          const leaveAt = m.releaseAge === undefined ? Infinity : m.releaseAge + (line.length - j) * 8
          if (age >= leaveAt + MESSAGE_FLICKER) continue
          if (age >= leaveAt || (age >= lockAt - MESSAGE_FLICKER && age < lockAt)) wordCells.set(i, line[j] === ' ' ? ' ' : pick(o.charset))
          else if (age >= lockAt) wordCells.set(i, line[j])
        }
      })
    }

    for (const rp of ripples) {
      const ra = now - rp.t0, radius = ra * RIPPLE_SPEED, fade = 1 - ra / t.ripple
      const rc0 = Math.max(0, Math.floor((rp.x - radius - RIPPLE_BAND) / cellW)), rc1 = Math.min(cols - 1, Math.ceil((rp.x + radius + RIPPLE_BAND) / cellW))
      const rr0 = Math.max(0, Math.floor((rp.y - radius - RIPPLE_BAND) / o.lineHeight)), rr1 = Math.min(rows - 1, Math.ceil((rp.y + radius + RIPPLE_BAND) / o.lineHeight))
      for (let r = rr0; r <= rr1; r++) for (let c = rc0; c <= rc1; c++) {
        const ring = (1 - Math.abs(Math.hypot(cellX(c) - rp.x, cellY(r) - rp.y) - radius) / RIPPLE_BAND) * fade
        if (ring > 0.05) put(r * cols + c, ring, true)
      }
    }

    // draw: the quiet copy, then lit cells, then the decoded text, then the caret
    ctx.clearRect(0, 0, w, h)
    ctx.globalAlpha = 1
    ctx.drawImage(base, 0, 0, w, h)
    const color = litColor(now)
    ctx.fillStyle = color
    for (const [i, { k, scramble }] of lit) {
      if (wordCells.has(i)) continue
      const c = i % cols, r = (i / cols) | 0, x = cellX(c), y = cellY(r)
      ctx.clearRect(c * cellW, r * o.lineHeight, cellW, o.lineHeight)
      ctx.globalAlpha = Math.min(1, k) * (inQuiet(x, y) ? 0.5 : 1)
      ctx.fillText(scramble ? pick(o.charset) : grid[i], x, y)
    }
    ctx.fillStyle = ink
    for (const [i, ch] of wordCells) {
      const c = i % cols, r = (i / cols) | 0, x = cellX(c), y = cellY(r)
      ctx.clearRect(c * cellW, r * o.lineHeight, cellW, o.lineHeight)
      ctx.globalAlpha = inQuiet(x, y) ? 0.55 : 1
      ctx.fillText(ch, x, y)
    }
    const showCaret = pointer.active ? o.cursor !== 'none' : o.idle === 'typist'
    if (showCaret && caret.c >= 0 && !wordCells.has(caret.r * cols + caret.c)) {
      // a block caret in inverse video; it blinks while resting, like a terminal waiting for input
      const blinkOff = resting && Math.floor(now / 530) % 2 === 1
      if (!blinkOff) {
        const x = cellX(caret.c), y = cellY(caret.r)
        ctx.globalAlpha = inQuiet(x, y) ? 0.55 : 0.95
        ctx.fillStyle = color
        ctx.fillRect(caret.c * cellW, caret.r * o.lineHeight + 2, cellW, o.lineHeight - 4)
        ctx.fillStyle = caretInk
        ctx.fillText(grid[caret.r * cols + caret.c] ?? '', x, y)
      }
    }
    ctx.globalAlpha = 1
  }

  // --- the loop: runs while on screen, not paused, autoplaying, and motion is welcome ---
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
  const still = () => o.respectReducedMotion && motionQuery.matches
  const loop = (now: number) => {
    frame(now)
    if (running) raf = requestAnimationFrame(loop)
  }
  const sync = () => {
    const should = !destroyed && visible && !paused && o.autoplay && !still()
    if (should && !running) {
      running = true
      raf = requestAnimationFrame(loop)
    } else if (!should && running) {
      running = false
      cancelAnimationFrame(raf)
    }
    if (!should && !destroyed && o.autoplay) frame(performance.now()) // a still frame
  }

  // --- input ---
  const toCell = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    const x = e.clientX - r.left, y = e.clientY - r.top
    return { x, y, c: Math.min(cols - 1, Math.max(0, Math.floor(x / cellW))), r: Math.min(rows - 1, Math.max(0, Math.floor(y / o.lineHeight))) }
  }
  const onMove = (e: PointerEvent) => {
    const cell = toCell(e)
    if (cell.c === caret.c && cell.r === caret.r && pointer.active) return
    caret.c = cell.c
    caret.r = cell.r
    pointer.active = true
    pointer.lastMoveAt = performance.now()
  }
  const onLeave = () => {
    pointer.active = false
    typist.c = caret.c
    typist.r = caret.r // the typist carries on from where the pointer left
    if (o.idle === 'none') caret.c = caret.r = -1
  }
  const onDown = (e: PointerEvent) => {
    if (!o.ripple) return
    const { x, y } = toCell(e)
    ripples.push({ x, y, t0: performance.now() })
  }

  readColors()
  layout()
  document.fonts?.ready.then(() => {
    if (destroyed) return
    layout() // the font may arrive after first paint; re-measure the cells with it
    sync()
  })
  const themeWatch = new MutationObserver(() => {
    readColors()
    paintAllBase()
    if (!running) frame(lastNow || performance.now())
  })
  themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] })
  const schemeQuery = matchMedia('(prefers-color-scheme: dark)')
  const onScheme = () => {
    readColors()
    paintAllBase()
  }
  schemeQuery.addEventListener('change', onScheme)
  motionQuery.addEventListener('change', sync)
  const sizeWatch = new ResizeObserver(() => {
    layout()
    if (!running) frame(lastNow || performance.now())
  })
  sizeWatch.observe(canvas)
  const seen = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    sync()
  })
  seen.observe(canvas)
  area.addEventListener('pointermove', onMove)
  area.addEventListener('pointerleave', onLeave)
  area.addEventListener('pointerdown', onDown)
  sync()

  return {
    decode(text, at) {
      const cell = at ? toCellOf(at) : openSpot(text.length)
      startWord(lastNow || performance.now(), text, cell.c, cell.r, true)
    },
    showMessage(lines = o.message, at) {
      if (message) message.releaseAge = (lastNow || performance.now()) - message.t0
      if (lines.length) startMessage(lastNow || performance.now(), lines, at ? toCellOf(at) : caret.c >= 0 ? caret : toCellOf(undefined), true)
    },
    hideMessage() {
      if (message && message.releaseAge === undefined) message.releaseAge = (lastNow || performance.now()) - message.t0
    },
    setOptions(next) {
      const changed = (Object.keys(next) as (keyof GlyphFieldOptions)[]).filter((k) =>
        k === 'timing' ? !sameValue(JSON.stringify({ ...DEFAULT_TIMING, ...next.timing }), JSON.stringify(o.timing)) : !sameValue(next[k], o[k as keyof Resolved]),
      )
      if (!changed.length) return
      o = { ...o, ...strip(next), timing: next.timing ? { ...DEFAULT_TIMING, ...next.timing } : o.timing }
      const has = (...keys: (keyof GlyphFieldOptions)[]) => keys.some((k) => changed.includes(k))
      if (has('seed')) random = o.seed === undefined ? Math.random : seeded(o.seed)
      if (has('colors', 'glyphColor', 'wordColor', 'caretInk')) readColors()
      if (has('fontFamily', 'fontSize', 'lineHeight', 'charset', 'quietSelector', 'coverSelector', 'seed')) layout()
      else if (has('glyphOpacity', 'quietOpacity', 'colors', 'glyphColor')) paintAllBase()
      if (has('fade')) applyFade()
      if (has('idle') && o.idle === 'none' && !pointer.active) caret.c = caret.r = -1
      sync()
    },
    refresh() {
      readColors()
      layout()
      if (!running) frame(lastNow || performance.now())
    },
    pause() {
      paused = true
      sync()
    },
    resume() {
      paused = false
      sync()
    },
    tick(ms) {
      frame(ms)
    },
    destroy() {
      destroyed = true
      running = false
      cancelAnimationFrame(raf)
      themeWatch.disconnect()
      sizeWatch.disconnect()
      seen.disconnect()
      schemeQuery.removeEventListener('change', onScheme)
      motionQuery.removeEventListener('change', sync)
      area.removeEventListener('pointermove', onMove)
      area.removeEventListener('pointerleave', onLeave)
      area.removeEventListener('pointerdown', onDown)
      canvas.style.maskImage = ''
      canvas.style.removeProperty('-webkit-mask-image')
    },
  }
}

/** Options without `undefined` values, so an explicit `undefined` falls back to the default instead of erasing it. */
function strip(options: GlyphFieldOptions) {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(options)) if (v !== undefined && k !== 'timing') out[k] = v
  return out as Partial<Resolved>
}
