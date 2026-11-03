import '@fontsource-variable/fraunces'
import '@fontsource-variable/fraunces/wght-italic.css'
import '@fontsource-variable/inter'
import './styles.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import { content } from './content'
import { renderPage } from './render/page'
import { initBooking } from './booking'
import { bindAnchors, initSmooth } from './motion/smooth'
import { initHero } from './motion/hero'
import { initRail } from './motion/rail'
import { initDetail } from './motion/detail'
import { initDay } from './motion/day'
import { initReveals } from './motion/reveals'
import { initNavInk } from './motion/nav'

gsap.registerPlugin(ScrollTrigger, Flip)

// Theme colours come from content.json: theme.paperDeep -> --paper-deep
const rootStyle = document.documentElement.style
for (const [key, value] of Object.entries(content.theme)) {
  rootStyle.setProperty(`--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`, value)
}

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
document.documentElement.classList.toggle('is-reduced', reduced)
document.documentElement.classList.toggle('is-motion', !reduced)

const app = document.getElementById('app')
if (app) {
  renderPage(app)
  if (!reduced) initSmooth()
  bindAnchors()
  initBooking()
  initHero(reduced)
  initRail(reduced)
  initDetail(reduced)
  initDay(reduced)
  initReveals(reduced)
  initNavInk()

  // Fonts change text metrics; re-measure pins once they are in.
  document.fonts?.ready.then(() => ScrollTrigger.refresh())

  // Honour a deep link like /#book after the pins have created their spacers.
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1))
    if (target) requestAnimationFrame(() => target.scrollIntoView())
  }
}
