import { gsap } from 'gsap'
import { content } from '../content'

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * Itinerary map: the route draws itself with scroll, markers are placed
 * along the path from each stop's `at` value, and the matching card shows.
 */
export function initDay(reduced: boolean): void {
  const pin = document.querySelector<HTMLElement>('[data-day-pin]')
  const route = document.querySelector<SVGPathElement>('[data-route]')
  const markersG = document.querySelector<SVGGElement>('[data-markers]')
  if (!pin || !route || !markersG) return
  const { stops } = content.day
  const len = route.getTotalLength()

  const markers = stops.map((s, i) => {
    const pt = route.getPointAtLength(len * s.at)
    const g = document.createElementNS(SVG_NS, 'g')
    g.setAttribute('class', 'marker')
    g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`)
    g.innerHTML = `<circle r="22"/><text dy="7">${i + 1}</text>`
    markersG.appendChild(g)
    return g
  })
  const traveller = document.createElementNS(SVG_NS, 'circle')
  traveller.setAttribute('r', '9')
  traveller.setAttribute('class', 'map__traveller')
  markersG.appendChild(traveller)

  const cards = [...pin.querySelectorAll<HTMLElement>('[data-stop-card]')]

  if (reduced) {
    markers.forEach((m) => m.classList.add('is-on'))
    traveller.remove()
    return
  }

  document.documentElement.classList.add('has-day-motion')
  route.style.strokeDasharray = `${len}`
  route.style.strokeDashoffset = `${len}`

  let current = -1
  const setActive = (idx: number): void => {
    if (idx === current) return
    current = idx
    cards.forEach((c, i) => c.classList.toggle('is-active', i === idx))
    markers.forEach((m, i) => m.classList.toggle('is-on', i <= idx))
  }
  setActive(0)

  const state = { p: 0 }
  gsap.to(state, {
    p: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => `+=${window.innerHeight * 3}`,
      pin: true,
      scrub: 1.4,
    },
    onUpdate: () => {
      const p = state.p
      route.style.strokeDashoffset = `${len * (1 - p)}`
      const pt = route.getPointAtLength(len * p)
      traveller.setAttribute('cx', pt.x.toFixed(1))
      traveller.setAttribute('cy', pt.y.toFixed(1))
      let idx = 0
      stops.forEach((s, i) => {
        if (p >= s.at - 0.02) idx = i
      })
      setActive(idx)
    },
  })
}
