import { useRef, useState } from 'react'
import { DEFAULT_OPTIONS, GlyphField, PRESETS, type GlyphFieldHandle, type GlyphFieldOptions, type PresetName } from '../src/react'

type Config = Required<
  Pick<
    GlyphFieldOptions,
    | 'colors' | 'words' | 'charset' | 'glyphColor' | 'wordColor' | 'caretInk' | 'fontSize' | 'lineHeight' | 'glyphOpacity'
    | 'mutation' | 'cursor' | 'idle' | 'decodeOnRest' | 'ripple' | 'message' | 'messageAfter' | 'fade'
  >
>

// the playground themes its colours from the page, so the field follows the light/dark switch
const BASE: Config = {
  colors: [...DEFAULT_OPTIONS.colors],
  words: [...DEFAULT_OPTIONS.words],
  charset: DEFAULT_OPTIONS.charset,
  glyphColor: 'var(--muted)',
  wordColor: 'var(--fg)',
  caretInk: 'var(--bg)',
  fontSize: DEFAULT_OPTIONS.fontSize,
  lineHeight: DEFAULT_OPTIONS.lineHeight,
  glyphOpacity: DEFAULT_OPTIONS.glyphOpacity,
  mutation: DEFAULT_OPTIONS.mutation,
  cursor: DEFAULT_OPTIONS.cursor,
  idle: DEFAULT_OPTIONS.idle,
  decodeOnRest: DEFAULT_OPTIONS.decodeOnRest,
  ripple: DEFAULT_OPTIONS.ripple,
  message: ['> you found the hidden message.', '> set it with the message prop.'],
  messageAfter: 5000,
  fade: 0.7,
}

const FONT = '"Geist Mono", ui-monospace, monospace'

/** The JSX for the current settings: only what differs from the defaults. */
function toCode(c: Config) {
  const props: string[] = []
  const lit = (v: unknown) => (typeof v === 'string' ? `"${v}"` : `{${JSON.stringify(v)}}`)
  for (const [k, v] of Object.entries(c) as [keyof Config, unknown][]) {
    const d = (DEFAULT_OPTIONS as Record<string, unknown>)[k]
    if (JSON.stringify(v) === JSON.stringify(d)) continue
    if (k === 'words' && Array.isArray(v) && v.length > 6) props.push(`  words={${JSON.stringify(v.slice(0, 6)).replace(/]$/, ', …]')}}`)
    else props.push(`  ${k}=${lit(v)}`)
  }
  return [
    `import { GlyphField } from 'glyphfield/react'`,
    ``,
    `<section style={{ position: 'relative' }}>`,
    `  <GlyphField`,
    ...props.map((p) => `  ${p}`),
    `  />`,
    `  <h1 data-glyph-quiet>Your headline</h1>`,
    `  <img data-glyph-cover src="…" />`,
    `</section>`,
  ].join('\n')
}

export default function App() {
  const [c, setC] = useState<Config>(BASE)
  const [preset, setPreset] = useState<PresetName | 'custom'>('vivid')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [word, setWord] = useState('hello')
  const [copied, setCopied] = useState<string | null>(null)
  const [panel, setPanel] = useState(true)
  const field = useRef<GlyphFieldHandle>(null)

  const set = <K extends keyof Config>(k: K, v: Config[K]) => {
    setC((prev) => ({ ...prev, [k]: v }))
    setPreset('custom')
  }
  const applyPreset = (name: PresetName) => {
    setC({ ...BASE, ...(PRESETS[name] as Partial<Config>) })
    setPreset(name)
  }
  const flipTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    setTheme(next)
  }
  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
      setTimeout(() => setCopied(null), 1400)
    } catch {
      setCopied(null)
    }
  }
  const code = toCode(c)

  return (
    <div className={`app ${panel ? 'with-panel' : ''}`}>
      <main className="stage">
        <GlyphField ref={field} {...c} fontFamily={FONT} />

        <header className="bar">
          <span className="logo">glyphfield</span>
          <div className="bar-actions">
            <button className="pill install" onClick={() => copy('npm i glyphfield', 'install')}>
              <code>npm i glyphfield</code>
              <span className="muted">{copied === 'install' ? 'copied' : 'copy'}</span>
            </button>
            {!panel && (
              <button className="pill" onClick={() => setPanel(true)} aria-expanded={false}>
                Settings
              </button>
            )}
          </div>
        </header>

        <div className="hero">
          <div className="copy" data-glyph-quiet>
            <p className="eyebrow">An interactive backdrop for React and plain JS</p>
            <h1>Rest your cursor. Watch it decode.</h1>
            <p className="lede">
              A glyph matrix that follows the pointer, decodes words where it rests, and keeps out of the way of your
              content. Hold still for {Math.round(c.messageAfter / 1000)} seconds for the hidden message.
            </p>
          </div>
        </div>
      </main>

      <aside className="panel" aria-label="Settings">
        <button className="panel-close" onClick={() => setPanel(false)} aria-expanded={panel}>
          Hide settings
        </button>
        <div className="panel-body">
          <Section title="Preset">
            <div className="chips">
              {(Object.keys(PRESETS) as PresetName[]).map((p) => (
                <button key={p} className={`chip ${preset === p ? 'on' : ''}`} onClick={() => applyPreset(p)}>
                  {p}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Try it">
            <div className="row">
              <input value={word} onChange={(e) => setWord(e.target.value)} aria-label="Word to decode" maxLength={24} />
              <button onClick={() => field.current?.decode(word)}>Decode</button>
            </div>
            <div className="row">
              <button onClick={() => field.current?.showMessage()}>Show message</button>
              <button onClick={() => field.current?.hideMessage()}>Hide message</button>
            </div>
          </Section>

          <Section title="Behaviour">
            <Select label="Cursor" value={c.cursor} options={['crosshair', 'caret', 'none']} onChange={(v) => set('cursor', v)} />
            <Select label="Idle" value={c.idle} options={['typist', 'none']} onChange={(v) => set('idle', v)} />
            <Toggle label="Decode where the cursor rests" value={c.decodeOnRest} onChange={(v) => set('decodeOnRest', v)} />
            <Toggle label="Ripple on click" value={c.ripple} onChange={(v) => set('ripple', v)} />
          </Section>

          <Section title="Look">
            <div className="colors">
              {c.colors.map((col, i) => (
                <span key={i} className="swatch">
                  <input
                    type="color"
                    value={/^#[0-9a-f]{6}$/i.test(col) ? col : '#888888'}
                    onChange={(e) => set('colors', c.colors.map((x, j) => (j === i ? e.target.value : x)))}
                    aria-label={`Colour ${i + 1}`}
                  />
                  {c.colors.length > 1 && (
                    <button className="x" onClick={() => set('colors', c.colors.filter((_, j) => j !== i))} aria-label={`Remove colour ${i + 1}`}>
                      ×
                    </button>
                  )}
                </span>
              ))}
              {c.colors.length < 6 && (
                <button className="add" onClick={() => set('colors', [...c.colors, '#ffffff'])} aria-label="Add colour">
                  +
                </button>
              )}
            </div>
            <Range label="Glyph size" value={c.fontSize} min={10} max={24} step={1} unit="px" onChange={(v) => set('fontSize', v)} />
            <Range label="Row height" value={c.lineHeight} min={14} max={36} step={1} unit="px" onChange={(v) => set('lineHeight', v)} />
            <Range label="Glyph opacity" value={c.glyphOpacity} min={0.02} max={0.3} step={0.01} onChange={(v) => set('glyphOpacity', v)} />
            <Range label="Flicker" value={c.mutation} min={0} max={0.02} step={0.0005} onChange={(v) => set('mutation', v)} />
            <Range label="Fade from" value={c.fade === false ? 1 : c.fade} min={0.3} max={1} step={0.01} onChange={(v) => set('fade', v >= 1 ? false : v)} format={(v) => (v >= 1 ? 'off' : `${Math.round(v * 100)}%`)} />
            <Toggle label="Light page" value={theme === 'light'} onChange={flipTheme} />
          </Section>

          <Section title="Words">
            <textarea
              rows={3}
              value={c.words.join(', ')}
              onChange={(e) => set('words', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              aria-label="Words, comma separated"
            />
          </Section>

          <Section title="Hidden message">
            <textarea rows={3} value={c.message.join('\n')} onChange={(e) => set('message', e.target.value.split('\n'))} aria-label="Hidden message, a line per row" />
            <Range label="Shows after resting" value={c.messageAfter} min={2000} max={15000} step={500} onChange={(v) => set('messageAfter', v)} format={(v) => `${(v / 1000).toFixed(1)}s`} />
          </Section>

          <Section title="Code">
            <pre className="code">
              <code>{code}</code>
            </pre>
            <button onClick={() => copy(code, 'code')}>{copied === 'code' ? 'Copied' : 'Copy code'}</button>
          </Section>
        </div>
      </aside>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="field toggle">
      <span>{label}</span>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

function Range(props: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void; format?: (v: number) => string }) {
  const { label, value, min, max, step, unit = '', onChange, format } = props
  return (
    <label className="field range">
      <span>
        {label}
        <output>{format ? format(value) : `${value}${unit}`}</output>
      </span>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}
