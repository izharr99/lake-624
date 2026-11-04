import type { Phase } from '../content'

const toMinutes = (t: string): number => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export const formatMinutes = (mins: number): string => {
  const m = Math.round(mins) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** Clock time and label at footage progress p (0..1), interpolated between keyframes. */
export function sampleClock(phases: Phase[], p: number): { time: string; label: string } {
  let i = 0
  while (i < phases.length - 2 && p > phases[i + 1].at) i++
  const a = phases[i]
  const b = phases[i + 1] ?? a
  const t = Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at || 1)))
  const mins = toMinutes(a.time) + (toMinutes(b.time) - toMinutes(a.time)) * t
  return { time: formatMinutes(mins), label: t < 0.5 ? a.label : b.label }
}
