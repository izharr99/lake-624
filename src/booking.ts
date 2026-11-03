import { content, money, type Room } from './content'

const DAY_MS = 86_400_000

/** Local calendar date as yyyy-mm-dd (what <input type="date"> expects). */
const iso = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const parse = (v: string): number | null => {
  const t = Date.parse(`${v}T00:00:00Z`)
  return Number.isNaN(t) ? null : t
}
const pretty = (v: string): string =>
  new Date(`${v}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

export interface Quote {
  room: Room
  nights: number
  subtotal: number
  cleaning: number
  tax: number
  total: number
}

/** Pure price calculation, exported so it is easy to test or reuse. */
export function quote(room: Room, nights: number): Quote {
  const { cleaningFee, taxRate } = content.booking
  const subtotal = room.price * nights
  const cleaning = nights > 0 ? cleaningFee : 0
  const tax = (subtotal + cleaning) * taxRate
  return { room, nights, subtotal, cleaning, tax, total: subtotal + cleaning + tax }
}

let roomSelect: HTMLSelectElement | null = null
let refresh: () => void = () => {}

export function selectRoom(id: string): void {
  if (!roomSelect) return
  roomSelect.value = id
  refresh()
}

export function initBooking(): void {
  const form = document.querySelector<HTMLFormElement>('[data-booking]')
  if (!form) return
  const $ = <T extends Element>(sel: string) => form.querySelector<T>(sel) as T
  roomSelect = $<HTMLSelectElement>('[data-f-room]')
  const inEl = $<HTMLInputElement>('[data-f-in]')
  const outEl = $<HTMLInputElement>('[data-f-out]')
  const guestsEl = $<HTMLSelectElement>('[data-f-guests]')
  const nameEl = $<HTMLInputElement>('[data-f-name]')
  const summary = $<HTMLElement>('[data-summary]')
  const error = $<HTMLElement>('[data-error]')
  const wa = $<HTMLAnchorElement>('[data-wa]')
  const mail = $<HTMLAnchorElement>('[data-mail]')
  const { booking, brand, contact, rooms } = content

  const today = new Date()
  const start = new Date(today.getTime() + 14 * DAY_MS)
  inEl.min = iso(today)
  outEl.min = iso(new Date(today.getTime() + DAY_MS))
  inEl.value = iso(start)
  outEl.value = iso(new Date(start.getTime() + 3 * DAY_MS))

  const setLinks = (enabled: boolean, message = ''): void => {
    for (const a of [wa, mail]) {
      a.setAttribute('aria-disabled', String(!enabled))
      if (!enabled) a.removeAttribute('href')
    }
    if (!enabled) return
    wa.href = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`
    mail.href = `mailto:${contact.email}?subject=${encodeURIComponent(`Booking request: ${brand.fullName}`)}&body=${encodeURIComponent(message)}`
  }

  refresh = (): void => {
    const room = rooms.items.find((r) => r.id === roomSelect?.value) ?? rooms.items[0]
    const a = parse(inEl.value)
    const b = parse(outEl.value)
    const guests = Number(guestsEl.value)
    if (a !== null) outEl.min = iso(new Date(a + DAY_MS))
    const nights = a !== null && b !== null ? Math.round((b - a) / DAY_MS) : 0

    let problem = ''
    if (a === null || b === null) problem = 'Choose your check in and check out dates.'
    else if (a < parse(iso(today))!) problem = 'Check in cannot be in the past.'
    else if (nights < booking.minNights) problem = 'Check out must be after check in.'
    else if (nights > booking.maxNights) problem = `Stays are limited to ${booking.maxNights} nights. Message us for longer.`
    else if (guests > room.sleeps) problem = `The ${room.name} sleeps up to ${room.sleeps}. Pick a larger room or fewer guests.`

    error.textContent = problem
    const q = quote(room, problem ? 0 : nights)
    summary.innerHTML = problem
      ? `<div class="summary__row"><dt>${money(room.price)} × nights</dt><dd>-</dd></div>`
      : `
      <div class="summary__row"><dt>${money(room.price)} × ${nights} ${nights === 1 ? 'night' : 'nights'}</dt><dd>${money(q.subtotal)}</dd></div>
      <div class="summary__row"><dt>${booking.cleaningLabel}</dt><dd>${money(q.cleaning)}</dd></div>
      <div class="summary__row"><dt>${booking.taxLabel} (${Math.round(booking.taxRate * 100)}%)</dt><dd>${money(q.tax)}</dd></div>
      <div class="summary__row summary__total"><dt>Estimated total</dt><dd>${money(q.total)}</dd></div>`

    if (problem) {
      setLinks(false)
      return
    }
    const name = nameEl.value.trim()
    const lines = [
      `Hello ${brand.fullName}, I would like to request a booking.`,
      '',
      `Room: ${room.name}`,
      `Check in: ${pretty(inEl.value)}`,
      `Check out: ${pretty(outEl.value)}`,
      `Nights: ${nights}`,
      `Guests: ${guests}`,
      `Estimated total: ${money(q.total)} (${rooms.currency})`,
    ]
    if (name) lines.push('', `Name: ${name}`)
    setLinks(true, lines.join('\n'))
  }

  form.addEventListener('input', refresh)
  form.addEventListener('change', refresh)
  form.addEventListener('submit', (e) => e.preventDefault())
  for (const a of [wa, mail]) {
    a.addEventListener('click', (e) => {
      if (a.getAttribute('aria-disabled') === 'true') e.preventDefault()
    })
  }
  refresh()
}
