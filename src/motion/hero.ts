import { gsap } from 'gsap'
import { content } from '../content'
import { sampleClock } from '../lib/phase'
import { FrameSequence } from '../lib/sequence'

/** Share of the pinned timeline spent scrubbing the time-lapse. */
const FOOTAGE_END = 0.6

const portrait = (): boolean => window.innerWidth / window.innerHeight < 0.9

/**
 * Hero: a real sunrise-to-sunset time-lapse scrubbed by scroll on a canvas,
 * graded into blue hour, then a slow crossfade to the lodge at dusk and a
 * camera push through its lit window into a room.
 */
export function initHero(reduced: boolean): void {
  const stage = document.querySelector<HTMLElement>('[data-hero-stage]')
  const canvas = document.querySelector<HTMLCanvasElement>('[data-seq]')
  if (!stage || !canvas) return
  const { hero } = content
  const clockTime = stage.querySelector<HTMLElement>('[data-clock-time]')
  const clockLabel = stage.querySelector<HTMLElement>('[data-clock-label]')
  const clockBar = stage.querySelector<HTMLElement>('[data-clock-bar]')

  let lastLabel = ''
  const setClock = (time: string, label: string, bar: number): void => {
    if (clockTime) clockTime.textContent = time
    if (clockLabel && label !== lastLabel) {
      clockLabel.textContent = label
      lastLabel = label
    }
    if (clockBar) clockBar.style.transform = `scaleX(${bar})`
  }

  if (reduced) {
    // Static: the poster frame (sunset) stays; no canvas, no pin.
    canvas.remove()
    return
  }

  let usePortrait = portrait()
  let seq = new FrameSequence(canvas, usePortrait ? hero.sequence.mobile : hero.sequence.desktop)
  const footage = { p: 0 }
  const draw = (): void => {
    seq.draw(footage.p)
    const c = sampleClock(hero.phases, footage.p)
    setClock(c.time, c.label, footage.p)
  }
  seq.resize()
  // The poster <img> covers the first paint; start streaming frames once the page is idle.
  const begin = (): void => {
    seq.load(() => stage.classList.add('is-seq-ready'))
  }
  if ('requestIdleCallback' in window) requestIdleCallback(begin, { timeout: 1200 })
  else setTimeout(begin, 300)

  const [fx, fy] = hero.exterior.focus
  const origin = `${fx * 100}% ${fy * 100}%`

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '[data-hero]',
      start: 'top top',
      end: () => `+=${window.innerHeight * 9}`,
      pin: stage,
      scrub: 1.6,
      invalidateOnRefresh: true,
      onRefresh: () => {
        // Swap to the other sequence if the device rotated across the threshold.
        if (portrait() !== usePortrait) {
          usePortrait = portrait()
          seq = new FrameSequence(canvas, usePortrait ? hero.sequence.mobile : hero.sequence.desktop)
          seq.load()
        }
        seq.resize()
        draw()
      },
      // Once the camera is inside the warm room, the nav switches to dark ink.
      onUpdate: (self) => document.documentElement.classList.toggle('nav-dark', self.progress > 0.9),
    },
  })

  tl.to(footage, { p: 1, duration: FOOTAGE_END, onUpdate: draw }, 0)
    .to('[data-hint]', { autoAlpha: 0, duration: 0.04 }, 0.01)
    .fromTo('[data-hero-copy] .hero__title', { yPercent: 0 }, { yPercent: -8, duration: FOOTAGE_END }, 0)
    .to('[data-hero-copy]', { autoAlpha: 0, y: -30, duration: 0.07, ease: 'sine.inOut' }, 0.4)
    // Blue hour: grade the last frames down before the lodge appears.
    .to('[data-grade]', { opacity: 1, duration: 0.08, ease: 'sine.inOut' }, FOOTAGE_END - 0.04)
    .fromTo(
      '[data-exterior]',
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.08, ease: 'sine.inOut', onStart: () => setClock(hero.exterior.time, hero.exterior.label, 1) },
      FOOTAGE_END + 0.02,
    )
    .fromTo('[data-exterior] img', { scale: 1.06 }, { scale: 1, duration: 0.1, ease: 'sine.out' }, FOOTAGE_END + 0.02)
    .to('[data-clock]', { autoAlpha: 0, duration: 0.04, ease: 'sine.inOut' }, FOOTAGE_END + 0.12)
    // Camera push towards the lit windows.
    .to('[data-exterior] img', { scale: 7, transformOrigin: origin, duration: 0.2, ease: 'power2.in' }, FOOTAGE_END + 0.12)
    .to('[data-exterior]', { autoAlpha: 0, duration: 0.05, ease: 'sine.in' }, FOOTAGE_END + 0.27)
    .fromTo(
      '[data-interior]',
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.06, ease: 'sine.out' },
      FOOTAGE_END + 0.26,
    )
    .fromTo('[data-interior] img', { scale: 1.25 }, { scale: 1, duration: 0.1, ease: 'sine.out' }, FOOTAGE_END + 0.26)
    .fromTo(
      '[data-arrival] > *',
      { autoAlpha: 0, y: 30 },
      { autoAlpha: 1, y: 0, stagger: 0.012, duration: 0.05, ease: 'sine.out' },
      FOOTAGE_END + 0.32,
    )
    .to({}, { duration: 0.03 })

  let resizeTimer = 0
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => seq.resize(), 120)
  })
}
