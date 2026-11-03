import { gsap } from 'gsap'
import type { Phase } from '../content'

export type ColorKey = 'skyTop' | 'skyMid' | 'skyHorizon' | 'far' | 'mid' | 'near' | 'water' | 'text'
export const COLOR_KEYS: ColorKey[] = ['skyTop', 'skyMid', 'skyHorizon', 'far', 'mid', 'near', 'water', 'text']

export interface PhaseSample {
  colors: Record<ColorKey, string>
  windows: number
  stars: number
  minutes: number
  label: string
}

const toMinutes = (t: string): number => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export const formatMinutes = (mins: number): string => {
  const m = Math.round(mins) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** Samples the content.json phase keyframes at progress p (0..1). */
export function samplePhases(phases: Phase[], p: number): PhaseSample {
  let i = 0
  while (i < phases.length - 2 && p > phases[i + 1].at) i++
  const a = phases[i]
  const b = phases[i + 1] ?? a
  const span = b.at - a.at || 1
  const t = gsap.utils.clamp(0, 1, (p - a.at) / span)
  const colors = {} as Record<ColorKey, string>
  // Text flips quickly around the middle of a segment so it never sits at a
  // low-contrast halfway grey against the sky.
  const textT = gsap.utils.clamp(0, 1, (t - 0.4) / 0.2)
  for (const k of COLOR_KEYS) colors[k] = gsap.utils.interpolate(a[k], b[k], k === 'text' ? textT : t)
  return {
    colors,
    windows: a.windows + (b.windows - a.windows) * t,
    stars: a.stars + (b.stars - a.stars) * t,
    minutes: toMinutes(a.time) + (toMinutes(b.time) - toMinutes(a.time)) * t,
    label: t < 0.5 ? a.label : b.label,
  }
}

/** Piecewise-linear path through [progress, x, y] keyframes. */
export function samplePath(keys: [number, number, number][], p: number): [number, number] {
  if (p <= keys[0][0]) return [keys[0][1], keys[0][2]]
  for (let i = 0; i < keys.length - 1; i++) {
    const [p0, x0, y0] = keys[i]
    const [p1, x1, y1] = keys[i + 1]
    if (p <= p1) {
      const t = (p - p0) / (p1 - p0)
      return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]
    }
  }
  const last = keys[keys.length - 1]
  return [last[1], last[2]]
}
