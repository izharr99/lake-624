import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let lenis: Lenis | null = null

/** Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger stays in sync. */
export function initSmooth(): Lenis {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

/** Scroll to an element or y position, smooth when Lenis is running. */
export function scrollToTarget(target: HTMLElement | number): void {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.6 })
    return
  }
  const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top: y })
}

export function lockScroll(locked: boolean): void {
  if (!lenis) return
  if (locked) lenis.stop()
  else lenis.start()
}

/** Route in-page anchor links through Lenis so pinned sections resolve correctly. */
export function bindAnchors(): void {
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
    if (!a) return
    const id = a.getAttribute('href')?.slice(1)
    const el = id ? document.getElementById(id) : null
    if (!el) return
    e.preventDefault()
    scrollToTarget(id === 'top' ? 0 : el)
    history.replaceState(null, '', `#${id}`)
  })
}
