import { gsap } from 'gsap'

/** Pins the rooms section and converts vertical scroll into a sideways rail. */
export function initRail(reduced: boolean): void {
  const pin = document.querySelector<HTMLElement>('[data-rooms-pin]')
  const rail = document.querySelector<HTMLElement>('[data-rail]')
  const bar = document.querySelector<HTMLElement>('[data-rail-progress]')
  if (!pin || !rail || reduced) return

  const distance = (): number => Math.max(0, rail.scrollWidth - window.innerWidth)

  const move = gsap.to(rail, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (bar) bar.style.transform = `scaleX(${self.progress})`
      },
    },
  })

  // Inner parallax: each illustration drifts inside its frame as it crosses the screen.
  rail.querySelectorAll<HTMLElement>('.card__media .art').forEach((art) => {
    gsap.fromTo(
      art,
      { xPercent: -6 },
      {
        xPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: art.parentElement,
          containerAnimation: move,
          start: 'left right',
          end: 'right left',
          scrub: true,
        },
      },
    )
  })
}
