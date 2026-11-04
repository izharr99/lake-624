import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

/**
 * Editorial reveals: headings rise line by line out of a mask, the pull quote
 * inks in word by word, and smaller pieces fade up slowly. Long sine and expo
 * eases only, so nothing snaps.
 */
export function initReveals(reduced: boolean): void {
  if (reduced) return

  document.querySelectorAll<HTMLElement>('[data-lines]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 105,
          duration: 1.8,
          stagger: 0.14,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }),
    })
  })

  document.querySelectorAll<HTMLElement>('[data-reveal-words]').forEach((el) => {
    gsap.fromTo(
      el.querySelectorAll('.w'),
      { opacity: 0.12 },
      {
        opacity: 1,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 50%', scrub: 1.2 },
      },
    )
  })

  gsap.set('[data-rise]', { autoAlpha: 0, y: 36 })
  ScrollTrigger.batch('[data-rise]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.2, duration: 1.6, ease: 'sine.out' }),
  })

  document.querySelectorAll<HTMLElement>('.dropcap, .spread-head__intro, .card, .footer__brand, .footer__cols').forEach((el) => {
    if (el.closest('[data-hero]')) return
    gsap.from(el, {
      autoAlpha: 0,
      y: 30,
      duration: 1.6,
      ease: 'sine.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
  })
}
