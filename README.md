# glyphfield

An interactive glyph-matrix backdrop. It follows the pointer, decodes words where it rests, and keeps out of the way
of your content.

- **Knows what's on top of it.** Glyphs dim behind your headline and never decode behind images, so the effect never
  fights your content. Mark elements with `data-glyph-quiet` and `data-glyph-cover`.
- **Scriptable.** Decode any word from code, or hide a message that appears when someone keeps their cursor still.
- **Small and dependency-free.** A plain TypeScript core, with a thin React wrapper. Pauses off screen, and draws a
  still frame for people who prefer reduced motion.
- **Follows your theme.** Colours can be any CSS colour, including `var(--brand)`, and update when your theme changes.
- **Reproducible.** Give it a `seed` and it plays the same way every time, for screenshots, tests and video renders.

```sh
npm i glyphfield
```

## React

```tsx
import { GlyphField } from 'glyphfield/react'

export function Hero() {
  return (
    <section style={{ position: 'relative', isolation: 'isolate' }}>
      <GlyphField style={{ zIndex: -1 }} />
      <h1 data-glyph-quiet>Rest your cursor. Watch it decode.</h1>
      <img data-glyph-cover src="/portrait.jpg" alt="" />
    </section>
  )
}
```

The field fills its parent and listens for the pointer on it, so give the parent `position: relative` and put the
field first. Options can change on any render.

### Driving it from code

```tsx
const field = useRef<GlyphFieldHandle>(null)

<GlyphField ref={field} message={['> you found it.', '> say hi below.']} />

field.current?.decode('shipped')            // a random open spot, clear of your content
field.current?.decode('hello', buttonEl)    // over an element
field.current?.showMessage()                // the hidden message, now
```

## Plain JavaScript

```js
import { createGlyphField } from 'glyphfield'

const field = createGlyphField(document.querySelector('canvas'), { words: ['hello', 'world'] })
field.decode('hi')
field.destroy()
```

The canvas should fill a positioned parent (`position: absolute; inset: 0; width: 100%; height: 100%`).

## Options

| Option | Default | |
| --- | --- | --- |
| `words` | developer words | Words that decode where the pointer rests. |
| `charset` | `a-z0-9{}[]()<>…` | Characters the field is made of. |
| `colors` | five vivid colours | The lit glyphs drift through these, one at a time. Any CSS colour. |
| `glyphColor` | text colour | Colour of the dim glyphs. |
| `wordColor` | text colour | Colour of decoded words and the message. |
| `caretInk` | `#0b0b0f` | The glyph inside the block caret; usually your background. |
| `fontFamily`, `fontSize`, `lineHeight` | monospace, `14`, `22` | Glyph font, size and row height (px). |
| `glyphOpacity`, `quietOpacity` | `0.11`, `0.045` | Dim glyphs, and dim glyphs behind quiet elements. |
| `mutation` | `0.0025` | Share of dim glyphs that change each frame. |
| `cursor` | `'crosshair'` | `'crosshair'`, `'caret'` or `'none'`. |
| `idle` | `'typist'` | With no pointer: an idle typist, or `'none'`. |
| `decodeOnRest` | `true` | Decode a word where the pointer rests. |
| `ripple` | `true` | A click sends a ripple out. |
| `message`, `messageAfter` | `[]`, `7000` | Hidden lines, and how long the pointer rests before they show. |
| `fade` | `false` | Fade out toward the bottom, starting this far down (0–1). |
| `quietSelector`, `coverSelector` | `[data-glyph-quiet]`, `[data-glyph-cover]` | Where glyphs stay dim, and where words never decode. |
| `seed` | random | Fixed randomness, so it plays the same way every time. |
| `autoplay` | `true` | `false` to draw frames yourself with `tick(ms)`. |
| `respectReducedMotion` | `true` | A still frame instead of animation for reduced motion. |
| `timing` | | Override any duration; see `DEFAULT_TIMING`. |
| `onDecode`, `onMessage` | | Called when a word decodes, and when the message shows or goes. |

Presets to start from: `PRESETS.vivid`, `PRESETS.terminal`, `PRESETS.matrix`, `PRESETS.minimal`.

```tsx
import { GlyphField, PRESETS } from 'glyphfield/react'

<GlyphField {...PRESETS.terminal} words={['ssh', 'grep', 'vim']} />
```

## Playground

```sh
npm install
npm run dev
```

## Licence

MIT
