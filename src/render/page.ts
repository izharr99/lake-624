import { content, money } from '../content'
import { roomMedia } from './roomArt'

const { brand, hero, arrival, rooms, day, reviews, booking, footer, nav, contact, credits } = content

export const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
export const roman = (n: number): string => ROMAN[n] ?? String(n + 1)
const folio = (n: number): string => `<span class="folio" aria-hidden="true">${String(n).padStart(2, '0')}</span>`

function navHTML(): string {
  return `
<header class="nav" data-nav>
  <a class="nav__brand" href="#top" aria-label="${esc(brand.fullName)}, back to top">${esc(brand.name)}</a>
  <p class="nav__issue label">${esc(brand.issueTitle)} · ${esc(brand.issue)} · ${esc(brand.season)}</p>
  <nav aria-label="Primary">
    <ul class="nav__links">
      ${nav.map((n) => `<li><a class="label" href="${n.href}">${esc(n.label)}</a></li>`).join('')}
    </ul>
  </nav>
</header>`
}

function heroHTML(): string {
  const { desktop, mobile } = hero.sequence
  const first = hero.phases[0]
  const frame = (seq: typeof desktop, i: number): string =>
    `${seq.path}${String(i).padStart(seq.digits, '0')}.${seq.ext}`
  // The poster is the first frame for motion users; reduced-motion users get a sunset still.
  const pick = (seq: typeof desktop): number => (matchMedia('(prefers-reduced-motion: reduce)').matches ? Math.round(seq.count * 0.82) : 1)
  return `
<section class="hero" id="top" aria-labelledby="hero-title" data-hero>
  <div class="hero__stage" data-hero-stage>
    <picture class="hero__poster">
      <source media="(max-aspect-ratio: 9/10)" srcset="${frame(mobile, pick(mobile))}" width="${mobile.width}" height="${mobile.height}">
      <img src="${frame(desktop, pick(desktop))}" width="${desktop.width}" height="${desktop.height}" alt="${esc(hero.alt)}" fetchpriority="high">
    </picture>
    <canvas class="hero__canvas" data-seq aria-hidden="true"></canvas>
    <div class="hero__grade" data-grade aria-hidden="true"></div>
    <figure class="hero__photo hero__exterior" data-exterior>
      <img src="${hero.exterior.src}" alt="${esc(hero.exterior.alt)}" loading="lazy" decoding="async" style="object-position:${hero.exterior.focus[0] * 100}% ${hero.exterior.focus[1] * 100}%">
    </figure>
    <figure class="hero__photo hero__interior" data-interior>
      <img src="${hero.interior.src}" alt="${esc(hero.interior.alt)}" loading="lazy" decoding="async" style="object-position:50% 78%">
    </figure>
    <div class="hero__vignette" aria-hidden="true"></div>
    <div class="hero__copy" data-hero-copy>
      <p class="label">${esc(hero.kicker)}</p>
      <h1 class="hero__title" id="hero-title">${esc(hero.title)}</h1>
      <p class="hero__lede">${esc(hero.lede)}</p>
    </div>
    <p class="hero__clock" data-clock>
      <span class="label">${esc(hero.caption)}</span>
      <span class="hero__time" data-clock-time>${first.time}</span>
      <span class="hero__phase" data-clock-label>${esc(first.label)}</span>
      <span class="hero__bar" aria-hidden="true"><span data-clock-bar></span></span>
    </p>
    <div class="hero__arrival" data-arrival>
      <p class="label">${esc(arrival.kicker)}</p>
      <h2 class="display">${esc(arrival.title)}</h2>
      <p class="dropcap">${esc(arrival.body)}</p>
    </div>
    <p class="hero__hint label" data-hint><span>${esc(hero.scrollHint)}</span></p>
  </div>
</section>`
}

function roomsHTML(): string {
  const cards = rooms.items
    .map(
      (r, i) => `
    <li class="rail__item">
      <button class="plate" type="button" data-room="${r.id}" aria-haspopup="dialog" aria-label="Open ${esc(r.name)}, ${money(r.price)} ${esc(rooms.perNight)}">
        <span class="plate__media" data-flip-id="room-${r.id}">${roomMedia(r, 0)}</span>
        <span class="plate__caption">
          <span class="label">Plate ${roman(i)} · ${esc(r.view)}</span>
          <span class="plate__name">${esc(r.name)}</span>
          <span class="plate__short">${esc(r.short)}</span>
          <span class="plate__meta"><span class="label">${esc(r.size)} · Sleeps ${r.sleeps}</span><span class="plate__price">${money(r.price)} <em>${esc(rooms.perNight)}</em></span></span>
        </span>
      </button>
    </li>`,
    )
    .join('')
  return `
<section class="rooms" id="rooms" data-nav-ink="dark" aria-labelledby="rooms-title" data-rooms>
  <div class="rooms__pin" data-rooms-pin>
    <div class="spread-head">
      <p class="label">${esc(rooms.kicker)}</p>
      <h2 class="display" id="rooms-title" data-lines>${esc(rooms.title)}</h2>
      <p class="spread-head__intro">${esc(rooms.intro)}</p>
    </div>
    <ul class="rail" data-rail>${cards}</ul>
    <div class="rooms__foot">
      <span class="label">${esc(rooms.hint)}</span>
      <span class="rooms__progress" aria-hidden="true"><span data-rail-progress></span></span>
      ${folio(12)}
    </div>
  </div>
</section>
<dialog class="detail" data-detail aria-labelledby="detail-title"></dialog>`
}

const ROUTE =
  'M250 470C210 420 190 330 260 270C330 210 420 240 470 200C520 160 600 120 690 170C770 210 820 260 860 230C900 200 930 260 900 320C870 380 790 380 760 430C730 480 650 520 570 500C490 480 450 400 380 420C330 434 300 500 250 470Z'

function dayHTML(): string {
  const stops = day.stops
    .map(
      (s, i) => `
      <li class="stop" data-stop-card="${i}">
        ${s.image ? `<img class="stop__img" src="${s.image}" alt="${esc(s.title)}" loading="lazy" decoding="async">` : ''}
        <span class="label">Stop ${roman(i)}</span>
        <span class="stop__time">${esc(s.time)}</span>
        <h3 class="stop__title">${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
      </li>`,
    )
    .join('')
  return `
<section class="day" id="day" data-nav-ink="dark" aria-labelledby="day-title" data-day>
  <div class="day__pin" data-day-pin>
    <div class="spread-head">
      <p class="label">${esc(day.kicker)}</p>
      <h2 class="display" id="day-title" data-lines>${esc(day.title)}</h2>
      <p class="spread-head__intro">${esc(day.body)}</p>
    </div>
    <div class="day__grid">
      <figure class="day__map">
        <svg class="map" viewBox="0 0 1000 700" role="img" aria-label="Map of the lake with the day's route drawn around it" data-map>
          <path class="map__contour" d="M90 140C260 40 520 60 700 90C880 120 960 260 930 400C900 560 720 650 520 640C300 630 120 600 70 450C30 330 0 200 90 140Z"/>
          <path class="map__contour" d="M40 110C240 0 560 20 740 50C930 90 1010 260 980 420C950 600 740 690 520 690C280 690 80 650 30 470C0 340 -30 180 40 110Z"/>
          <path class="map__lake" d="M170 210C300 130 520 140 670 170C810 200 860 300 830 400C800 510 660 560 500 556C330 552 200 520 160 420C130 340 90 260 170 210Z"/>
          <path class="map__ripple" d="M300 300h80M560 260h110M420 440h90M620 420h60M250 380h40M700 330h50"/>
          <g class="map__peaks"><path d="M60 620l40-60 40 60M120 640l50-80 50 80M880 110l40-60 40 60M820 130l36-50 36 50"/></g>
          <path class="map__route-bg" d="${ROUTE}"/>
          <path class="map__route" d="${ROUTE}" data-route/>
          <g data-markers></g>
          <text class="map__label" x="500" y="360">Lake Solvei</text>
          <g class="map__compass" transform="translate(930 620)"><path d="M0 -34L7 0L0 34L-7 0Z"/><text y="-42">N</text></g>
        </svg>
        <figcaption class="caption">Fig. 2. The route, drawn as the day goes by.</figcaption>
      </figure>
      <ol class="stops" data-stops>${stops}</ol>
    </div>
  </div>
</section>`
}

function reviewsHTML(): string {
  const words = reviews.featured.quote
    .split(' ')
    .map((w) => `<span class="w">${esc(w)}</span>`)
    .join(' ')
  return `
<section class="reviews" id="reviews" data-nav-ink="dark" aria-labelledby="reviews-title">
  <div class="wrap reviews__grid">
    <p class="label reviews__kicker" id="reviews-title">${esc(reviews.kicker)}<br><span class="muted">${esc(reviews.rating)}</span></p>
    <figure class="pull">
      <blockquote data-reveal-words><p>${words}</p></blockquote>
      <figcaption class="label">${esc(reviews.featured.name)} · <span class="muted">${esc(reviews.featured.detail)}</span></figcaption>
    </figure>
    <ul class="quotes">
      ${reviews.items
        .map(
          (r) => `<li class="quote" data-rise>
        <figure><blockquote><p>${esc(r.quote)}</p></blockquote>
        <figcaption class="label">${esc(r.name)}<br><span class="muted">${esc(r.detail)}</span></figcaption></figure></li>`,
        )
        .join('')}
    </ul>
    ${folio(31)}
  </div>
</section>`
}

function bookingHTML(): string {
  const maxGuests = Math.max(...rooms.items.map((r) => r.sleeps))
  const words = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']
  return `
<section class="book" id="book" data-nav-ink="dark" aria-labelledby="book-title">
  <div class="wrap book__grid">
    <div class="book__intro">
      <p class="label">${esc(booking.kicker)}</p>
      <h2 class="display" id="book-title" data-lines>${esc(booking.title)}</h2>
      <p class="dropcap">${esc(booking.body)}</p>
      <figure class="book__plate">
        <img src="${booking.image.src}" alt="${esc(booking.image.alt)}" loading="lazy" decoding="async">
        <figcaption class="caption">${esc(booking.image.caption ?? '')}</figcaption>
      </figure>
      <address class="book__contact">
        <span class="label">The concierge</span>
        <a href="mailto:${contact.email}">${esc(contact.email)}</a>
        <span>${esc(contact.phoneDisplay)}</span>
        <span class="muted">${esc(contact.address)}</span>
      </address>
    </div>
    <form class="card" data-booking novalidate aria-label="${esc(booking.cardTitle)}">
      <div class="card__head">
        <p class="label">${esc(booking.cardTitle)}</p>
        <p class="card__brand">${esc(brand.fullName)}</p>
        <span class="card__rule" aria-hidden="true">✦</span>
      </div>
      <p class="letter">
        <span>Dear concierge, I would like to reserve the</span>
        <label class="inline"><span class="sr">Room</span><select name="room" data-f-room>
          ${rooms.items.map((r) => `<option value="${r.id}">${esc(r.name)}</option>`).join('')}
        </select></label>
        <span>for</span>
        <label class="inline"><span class="sr">Guests</span><select name="guests" data-f-guests>
          ${Array.from({ length: maxGuests }, (_, i) => `<option value="${i + 1}"${i === 1 ? ' selected' : ''}>${words[i] ?? i + 1} ${i === 0 ? 'guest' : 'guests'}</option>`).join('')}
        </select></label>
        <span>, arriving on</span>
        <label class="inline"><span class="sr">Check in</span><input type="date" name="in" required data-f-in></label>
        <span>and leaving on</span>
        <label class="inline"><span class="sr">Check out</span><input type="date" name="out" required data-f-out></label>.
        <span>Kindly hold it under the name</span>
        <label class="inline inline--name"><span class="sr">Your name</span><input type="text" name="name" autocomplete="name" placeholder="your name" data-f-name></label>.
      </p>
      <p class="label card__account">The account</p>
      <dl class="summary" data-summary aria-live="polite"></dl>
      <p class="form__error" data-error role="alert"></p>
      <div class="card__actions">
        <a class="btn btn--ink" data-wa target="_blank" rel="noopener">${esc(booking.whatsappLabel)}</a>
        <a class="btn btn--line" data-mail>${esc(booking.emailLabel)}</a>
      </div>
      <p class="caption card__note">${esc(booking.note)}</p>
    </form>
  </div>
</section>`
}

function footerHTML(): string {
  return `
<footer class="footer" data-nav-ink="light">
  <figure class="footer__plate">
    <img src="${footer.image.src}" alt="${esc(footer.image.alt)}" loading="lazy" decoding="async">
    <figcaption class="caption">${esc(footer.image.caption ?? '')}</figcaption>
  </figure>
  <div class="wrap footer__grid">
    <p class="footer__brand">${esc(brand.name)}</p>
    <p class="footer__line">${esc(footer.line)}</p>
    <div class="footer__cols">
      <p><span class="label">Find us</span>${esc(contact.address)}<br>${esc(brand.coordinates)}</p>
      <p><span class="label">Write</span><a href="mailto:${contact.email}">${esc(contact.email)}</a><br>${esc(contact.phoneDisplay)}</p>
      <p><span class="label">Colophon</span>${esc(footer.colophon)}</p>
    </div>
    <div class="footer__credits">
      <p class="footer__byline">
        <span class="label">${esc(credits.label)}</span>
        <a href="${credits.url}" target="_blank" rel="noopener">${esc(credits.author)}</a>
      </p>
      <ul class="footer__links">
        <li><a class="label" href="${credits.repo}" target="_blank" rel="noopener">${esc(credits.repoLabel)}</a></li>
        <li><a class="label" href="${credits.mediaUrl}" target="_blank" rel="noopener">${esc(credits.mediaLabel)}</a></li>
      </ul>
    </div>
    <p class="caption footer__credit">${esc(brand.issueTitle)} · ${esc(brand.issue)} · ${esc(brand.established)}. ${esc(footer.credit)} ${esc(credits.license)}</p>
  </div>
</footer>`
}

export function renderPage(root: HTMLElement): void {
  root.innerHTML = `${navHTML()}<main>${heroHTML()}${roomsHTML()}${dayHTML()}${reviewsHTML()}${bookingHTML()}</main>${footerHTML()}`
}
