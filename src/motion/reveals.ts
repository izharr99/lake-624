import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/** Word-by-word quote reveal, rising quote cards and section headings. */
export function initReveals(reduced: boolean): void {
  if (reduced) return

  document.querySelectorAll<HTMLElement>('[data-reveal-words]').forEach((el) => {
    gsap.fromTo(
      el.querySelectorAll('.w'),
      { opacity: 0.14 },
      {
        opacity: 1,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
      },
    )
  })

  gsap.set('[data-rise]', { autoAlpha: 0, y: 50 })
  ScrollTrigger.batch('[data-rise]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out' }),
  })

  document.querySelectorAll<HTMLElement>('.book .display, .footer__brand').forEach((el) => {
    gsap.from(el, {
      yPercent: 40,
      autoAlpha: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
  })
}
