import { forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties } from 'react'
import { createGlyphField, type GlyphField as Field, type GlyphFieldOptions } from './core'

export type GlyphFieldProps = GlyphFieldOptions & {
  className?: string
  style?: CSSProperties
}

/** What a ref to `<GlyphField>` can do. */
export type GlyphFieldHandle = Pick<Field, 'decode' | 'showMessage' | 'hideMessage' | 'refresh' | 'pause' | 'resume' | 'tick'>

/**
 * The glyph field as a React component. It fills its parent (give the parent `position: relative`) and listens for the
 * pointer on that parent, so put it first inside the section it should sit behind. Options can change on any render;
 * only what changed is re-applied.
 */
export const GlyphField = forwardRef<GlyphFieldHandle, GlyphFieldProps>(function GlyphField({ className, style, ...options }, ref) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const field = useRef<Field | null>(null)
  const latest = useRef(options)
  latest.current = options

  useEffect(() => {
    if (!canvas.current) return
    field.current = createGlyphField(canvas.current, latest.current)
    return () => {
      field.current?.destroy()
      field.current = null
    }
  }, [])

  useEffect(() => {
    field.current?.setOptions(options)
  })

  useImperativeHandle(
    ref,
    () => ({
      decode: (text, at) => field.current?.decode(text, at),
      showMessage: (lines, at) => field.current?.showMessage(lines, at),
      hideMessage: () => field.current?.hideMessage(),
      refresh: () => field.current?.refresh(),
      pause: () => field.current?.pause(),
      resume: () => field.current?.resume(),
      tick: (ms) => field.current?.tick(ms),
    }),
    [],
  )

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }}
    />
  )
})

export type { GlyphFieldOptions, CursorMode, IdleMode, Timing, DecodeTarget } from './core'
export { DEFAULT_CHARSET, DEFAULT_WORDS, DEFAULT_TIMING, DEFAULT_OPTIONS } from './core'
export { PRESETS, type PresetName } from './presets'
