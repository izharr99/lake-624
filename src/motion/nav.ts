import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Sections declare data-nav-ink="dark|light"; while one sits under the nav
 * the nav text switches to match. Over the hero it follows the time of day.
 */
export function initNavInk(): void {
  const root = document.documentElement
  document.querySelectorAll<HTMLElement>('[data-nav-ink]').forEach((section) => {
    const ink = section.dataset.navInk
    ScrollTrigger.create({
      trigger: section,
      start: 'top 40px',
      end: 'bottom 40px',
      onToggle: (self) => {
        if (!self.isActive) return
        root.classList.toggle('nav-dark', ink === 'dark')
        root.classList.toggle('nav-light', ink === 'light')
      },
      onLeaveBack: () => {
        // Scrolled back above the first marked section: hand control back to the hero.
        if (section === document.querySelector('[data-nav-ink]')) root.classList.remove('nav-dark', 'nav-light')
      },
    })
  })
}
