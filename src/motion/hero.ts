import { gsap } from 'gsap'
import { content } from '../content'
import { COLOR_KEYS, formatMinutes, samplePath, samplePhases, type ColorKey } from '../lib/phase'
import { SCENE_H, SCENE_W, TARGET_WINDOW } from '../render/scene'

const GLASS_DARK = '#2a3040'
const GLASS_LIT = '#ffd28c'

/** Sun and moon arcs as [dayProgress, x, y] in scene units. Kept near the centre for phones. */
const SUN: [number, number, number][] = [
  [0, 640, 660],
  [0.25, 700, 210],
  [0.5, 900, 470],
  [0.68, 980, 780],
]
const MOON: [number, number, number][] = [
  [0.6, 560, 800],
  [1, 650, 220],
]

/** Share of the pinned timeline spent on day to night; the rest is the fly-through. */
const DAY_END = 0.6

type Box = [number, number, number, number]

export function initHero(reduced: boolean): void {
  const stage = document.querySelector<HTMLElement>('[data-hero-stage]')
  const svg = document.querySelector<SVGSVGElement>('[data-scene]')
  if (!stage || !svg) return
  const { phases } = content.hero

  // Cache everything the colour pass touches once.
  const fills = new Map<ColorKey, Element[]>()
  const strokes = new Map<ColorKey, Element[]>()
  const stops = new Map<ColorKey, Element[]>()
  for (const k of COLOR_KEYS) {
    fills.set(k, [...svg.querySelectorAll(`[data-fill="${k}"]`)])
    strokes.set(k, [...svg.querySelectorAll(`[data-stroke="${k}"]`)])
    stops.set(k, [...svg.querySelectorAll(`[data-stop="${k}"]`)])
  }
  const q = <T extends Element>(sel: string) => svg.querySelector<T>(sel) as T
  const sun = q<SVGGElement>('[data-sun]')
  const moon = q<SVGGElement>('[data-moon]')
  const trail = q<SVGGElement>('[data-sun-trail]')
  const starsEl = q<SVGGElement>('[data-stars]')
  const snow = q<SVGPathElement>('[data-snow]')
  const glows = q<SVGGElement>('[data-glows]')
  const reflect = q<SVGGElement>('[data-window-reflect]')
  const windows = [...svg.querySelectorAll<SVGRectElement>('[data-window]')]
  const clockTime = stage.querySelector<HTMLElement>('[data-clock-time]')
  const clockLabel = stage.querySelector<HTMLElement>('[data-clock-label]')
  const clockBar = stage.querySelector<HTMLElement>('[data-clock-bar]')
  const glass = gsap.utils.interpolate(GLASS_DARK, GLASS_LIT)

  let lastLabel = ''
  const paint = (p: number): void => {
    const s = samplePhases(phases, p)
    for (const k of COLOR_KEYS) {
      const c = s.colors[k]
      fills.get(k)?.forEach((el) => el.setAttribute('fill', c))
      strokes.get(k)?.forEach((el) => el.setAttribute('stroke', c))
      stops.get(k)?.forEach((el) => el.setAttribute('stop-color', c))
    }
    document.documentElement.style.setProperty('--hero-ink', s.colors.text)

    const [sx, sy] = samplePath(SUN, p)
    const sunVisible = p < SUN[SUN.length - 1][0] ? 1 : 0
    sun.setAttribute('transform', `translate(${sx} ${sy})`)
    sun.setAttribute('opacity', String(sunVisible))
    const low = gsap.utils.clamp(0, 1, (sy - 300) / 400)
    trail.setAttribute('transform', `translate(${sx} 744)`)
    trail.setAttribute('opacity', String(sunVisible * (0.25 + low * 0.6)))
    const [mx, my] = samplePath(MOON, p)
    moon.setAttribute('transform', `translate(${mx} ${my})`)
    moon.setAttribute('opacity', String(gsap.utils.clamp(0, 1, (p - 0.6) / 0.15)))

    starsEl.setAttribute('opacity', s.stars.toFixed(3))
    snow.setAttribute('opacity', (0.55 - s.stars * 0.35).toFixed(3))
    const lit = s.windows
    const g = glass(lit)
    windows.forEach((w) => w.setAttribute('fill', g))
    glows.setAttribute('opacity', lit.toFixed(3))
    reflect.setAttribute('opacity', (lit * 0.55).toFixed(3))

    if (clockTime) clockTime.textContent = formatMinutes(s.minutes)
    if (clockLabel && s.label !== lastLabel) {
      clockLabel.textContent = s.label
      lastLabel = s.label
    }
    if (clockBar) clockBar.style.transform = `scaleX(${p})`
  }

  if (reduced) {
    // Static fallback: a single evening frame, no pinning.
    paint(0.8)
    return
  }

  paint(0)

  // The fly-through works in viewBox space so the vector art stays crisp at
  // any zoom. `start` matches what the browser shows for the current screen,
  // `end` is a box tight around the picture window.
  let start: Box = [0, 0, SCENE_W, SCENE_H]
  let end: Box = start
  const measure = (): void => {
    const a = stage.clientWidth / stage.clientHeight
    const sceneA = SCENE_W / SCENE_H
    const w = a < sceneA ? SCENE_H * a : SCENE_W
    const h = w / a
    start = [(SCENE_W - w) / 2, SCENE_H - h, w, h]
    const cx = TARGET_WINDOW.x + TARGET_WINDOW.w / 2
    const cy = TARGET_WINDOW.y + TARGET_WINDOW.h / 2
    const fx = (cx - start[0]) / w
    const fy = (cy - start[1]) / h
    // Smallest zoom where the window glass covers the whole screen, plus margin.
    const kx = (TARGET_WINDOW.w * 0.5) / (Math.max(fx, 1 - fx) * w)
    const ky = (TARGET_WINDOW.h * 0.5) / (Math.max(fy, 1 - fy) * h)
    const k = Math.min(kx, ky) * 0.8
    end = [cx - fx * w * k, cy - fy * h * k, w * k, h * k]
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice')
  }
  const zoom = { t: 0 }
  const applyZoom = (): void => {
    // Exponential width change reads as a constant-speed dolly.
    const k = Math.pow(end[2] / start[2], zoom.t)
    const cx = TARGET_WINDOW.x + TARGET_WINDOW.w / 2
    const cy = TARGET_WINDOW.y + TARGET_WINDOW.h / 2
    const fx = (cx - start[0]) / start[2]
    const fy = (cy - start[1]) / start[3]
    const w = start[2] * k
    const h = start[3] * k
    svg.setAttribute('viewBox', `${cx - fx * w} ${cy - fy * h} ${w} ${h}`)
  }
  measure()
  applyZoom()

  const day = { p: 0 }
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '[data-hero]',
      start: 'top top',
      end: () => `+=${window.innerHeight * 6}`,
      pin: stage,
      scrub: 0.8,
      invalidateOnRefresh: true,
      // Once the camera is inside the (light) room, the nav switches to dark ink.
      onUpdate: (self) => document.documentElement.classList.toggle('nav-dark', self.progress > DAY_END + 0.2),
      onRefresh: () => {
        measure()
        applyZoom()
      },
    },
  })

  tl.to(day, { p: 1, duration: DAY_END, onUpdate: () => paint(day.p) }, 0)
    .to('[data-hint]', { autoAlpha: 0, duration: 0.05 }, 0.01)
    .to('[data-layer="far"]', { y: -24, duration: DAY_END }, 0)
    .to('[data-layer="mid"]', { y: -10, duration: DAY_END }, 0)
    .to('[data-layer="front"]', { y: 30, scale: 1.04, transformOrigin: '50% 100%', duration: DAY_END }, 0)
    .fromTo('[data-hero-copy] .hero__title', { yPercent: 0 }, { yPercent: -18, duration: DAY_END }, 0)
    .to('[data-hero-copy]', { autoAlpha: 0, y: -60, duration: 0.1 }, DAY_END - 0.14)
    .to('[data-clock]', { autoAlpha: 0, duration: 0.05 }, DAY_END + 0.02)
    .to('[data-layer="front"]', { scale: 1.6, y: 260, duration: 0.26, ease: 'power2.in' }, DAY_END)
    .to(zoom, { t: 1, duration: 0.26, ease: 'power3.in', onUpdate: applyZoom }, DAY_END)
    .fromTo(
      '[data-interior]',
      { autoAlpha: 0, scale: 1.25 },
      { autoAlpha: 1, scale: 1, duration: 0.1, ease: 'power2.out' },
      DAY_END + 0.22,
    )
    .fromTo(
      '[data-arrival] > *',
      { autoAlpha: 0, y: 40 },
      { autoAlpha: 1, y: 0, stagger: 0.02, duration: 0.06, ease: 'power2.out' },
      DAY_END + 0.3,
    )
    .to({}, { duration: 0.04 })
}
