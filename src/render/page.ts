import { content, money } from '../content'
import { sceneSVG } from './scene'
import { roomArt, roomMedia } from './roomArt'

const { brand, hero, arrival, rooms, day, reviews, booking, footer, nav } = content

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

/** The room shown inside the window during the fly-through. */
export const ARRIVAL_ROOM = rooms.items.find((r) => r.id === 'alpenglow-suite') ?? rooms.items[0]

function navHTML(): string {
  return `
<header class="nav" data-nav>
  <a class="nav__brand" href="#top" aria-label="${esc(brand.fullName)}, back to top">${esc(brand.name)}</a>
  <nav aria-label="Primary">
    <ul class="nav__links">
      ${nav.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('')}
    </ul>
  </nav>
</header>`
}

function heroHTML(): string {
  const first = hero.phases[0]
  return `
<section class="hero" id="top" aria-labelledby="hero-title" data-hero>
  <div class="hero__stage" data-hero-stage>
    <div class="hero__scene" data-scene-wrap>${sceneSVG()}</div>
    <div class="hero__interior" data-interior aria-hidden="true">${roomArt(ARRIVAL_ROOM, 'bed', true)}</div>
    <div class="hero__copy" data-hero-copy>
      <p class="kicker">${esc(hero.kicker)}</p>
      <h1 class="hero__title" id="hero-title">${esc(hero.title)}</h1>
      <p class="hero__lede">${esc(hero.lede)}</p>
    </div>
    <div class="hero__clock" data-clock aria-live="off">
      <span class="hero__time" data-clock-time>${first.time}</span>
      <span class="hero__phase" data-clock-label>${esc(first.label)}</span>
      <span class="hero__bar"><span data-clock-bar></span></span>
    </div>
    <div class="hero__arrival" data-arrival>
      <p class="kicker">${esc(arrival.kicker)}</p>
      <h2 class="display">${esc(arrival.title)}</h2>
      <p>${esc(arrival.body)}</p>
    </div>
    <p class="hero__hint" data-hint><span>${esc(hero.scrollHint)}</span></p>
  </div>
</section>`
}

function roomsHTML(): string {
  const cards = rooms.items
    .map(
      (r, i) => `
    <li class="rail__item">
      <button class="card" type="button" data-room="${r.id}" aria-haspopup="dialog" aria-label="Open ${esc(r.name)}, ${money(r.price)} ${esc(rooms.perNight)}">
        <span class="card__media" data-flip-id="room-${r.id}" data-night="${i % 2 === 1}">${roomMedia(r, 0, i % 2 === 1)}</span>
        <span class="card__body">
          <span class="card__index">${String(i + 1).padStart(2, '0')}</span>
          <span class="card__name">${esc(r.name)}</span>
          <span class="card__short">${esc(r.short)}</span>
          <span class="card__meta"><span>${esc(r.size)} · sleeps ${r.sleeps}</span><strong>${money(r.price)}<small> / night</small></strong></span>
        </span>
      </button>
    </li>`,
    )
    .join('')
  return `
<section class="rooms" id="rooms" data-nav-ink="dark" aria-labelledby="rooms-title" data-rooms>
  <div class="rooms__pin" data-rooms-pin>
    <div class="section-head">
      <p class="kicker">${esc(rooms.kicker)}</p>
      <h2 class="display" id="rooms-title">${esc(rooms.title)}</h2>
      <p class="muted">${esc(rooms.hint)}</p>
    </div>
    <ul class="rail" data-rail>${cards}</ul>
    <div class="rooms__progress" aria-hidden="true"><span data-rail-progress></span></div>
  </div>
</section>
<dialog class="detail" data-detail aria-labelledby="detail-title"></dialog>`
}

function dayHTML(): string {
  const stops = day.stops
    .map(
      (s, i) => `
      <li class="stop" data-stop-card="${i}">
        <span class="stop__time">${esc(s.time)}</span>
        <h3 class="stop__title">${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
      </li>`,
    )
    .join('')
  return `
<section class="day" id="day" data-nav-ink="dark" aria-labelledby="day-title" data-day>
  <div class="day__pin" data-day-pin>
    <div class="section-head">
      <p class="kicker">${esc(day.kicker)}</p>
      <h2 class="display" id="day-title">${esc(day.title)}</h2>
      <p class="muted">${esc(day.body)}</p>
    </div>
    <div class="day__grid">
      <svg class="map" viewBox="0 0 1000 700" role="img" aria-label="Map of the lake with the day's route drawn around it" data-map>
        <path class="map__land" d="M0 0H1000V700H0Z"/>
        <path class="map__contour" d="M90 140C260 40 520 60 700 90C880 120 960 260 930 400C900 560 720 650 520 640C300 630 120 600 70 450C30 330 0 200 90 140Z"/>
        <path class="map__lake" d="M170 210C300 130 520 140 670 170C810 200 860 300 830 400C800 510 660 560 500 556C330 552 200 520 160 420C130 340 90 260 170 210Z"/>
        <path class="map__ripple" d="M300 300h80M560 260h110M420 440h90M620 420h60"/>
        <g class="map__peaks"><path d="M60 620l40-60 40 60zM120 640l50-80 50 80zM880 110l40-60 40 60zM820 130l36-50 36 50z"/></g>
        <path class="map__route-bg" d="${ROUTE}"/>
        <path class="map__route" d="${ROUTE}" data-route/>
        <g data-markers></g>
        <text class="map__label" x="470" y="360">Lake Solvei</text>
      </svg>
      <ol class="stops" data-stops>${stops}</ol>
    </div>
  </div>
</section>`
}

const ROUTE =
  'M250 470C210 420 190 330 260 270C330 210 420 240 470 200C520 160 600 120 690 170C770 210 820 260 860 230C900 200 930 260 900 320C870 380 790 380 760 430C730 480 650 520 570 500C490 480 450 400 380 420C330 434 300 500 250 470Z'

function reviewsHTML(): string {
  const words = reviews.featured.quote
    .split(' ')
    .map((w) => `<span class="w">${esc(w)}</span>`)
    .join(' ')
  return `
<section class="reviews" id="reviews" data-nav-ink="dark" aria-labelledby="reviews-title">
  <div class="wrap">
    <p class="kicker" id="reviews-title">${esc(reviews.kicker)} · ${esc(reviews.rating)}</p>
    <figure class="featured">
      <blockquote data-reveal-words><p>${words}</p></blockquote>
      <figcaption>${esc(reviews.featured.name)}, <span class="muted">${esc(reviews.featured.detail)}</span></figcaption>
    </figure>
    <ul class="quotes">
      ${reviews.items
        .map(
          (r) => `<li class="quote" data-rise>
        <figure><blockquote><p>${esc(r.quote)}</p></blockquote>
        <figcaption>${esc(r.name)} <span class="muted">${esc(r.detail)}</span></figcaption></figure></li>`,
        )
        .join('')}
    </ul>
  </div>
</section>`
}

function bookingHTML(): string {
  const maxGuests = Math.max(...rooms.items.map((r) => r.sleeps))
  return `
<section class="book" id="book" data-nav-ink="light" aria-labelledby="book-title">
  <div class="wrap book__grid">
    <div class="section-head">
      <p class="kicker">${esc(booking.kicker)}</p>
      <h2 class="display" id="book-title">${esc(booking.title)}</h2>
      <p>${esc(booking.body)}</p>
      <address class="book__contact">
        <a href="mailto:${content.contact.email}">${esc(content.contact.email)}</a><br>
        <span>${esc(content.contact.phoneDisplay)}</span><br>
        <span class="muted">${esc(content.contact.address)}</span>
      </address>
    </div>
    <form class="form" data-booking novalidate>
      <label class="field field--wide">
        <span>Room</span>
        <select name="room" data-f-room>
          ${rooms.items.map((r) => `<option value="${r.id}">${esc(r.name)}, ${money(r.price)} / night</option>`).join('')}
        </select>
      </label>
      <label class="field"><span>Check in</span><input type="date" name="in" required data-f-in></label>
      <label class="field"><span>Check out</span><input type="date" name="out" required data-f-out></label>
      <label class="field">
        <span>Guests</span>
        <select name="guests" data-f-guests>
          ${Array.from({ length: maxGuests }, (_, i) => `<option value="${i + 1}"${i === 1 ? ' selected' : ''}>${i + 1} ${i === 0 ? 'guest' : 'guests'}</option>`).join('')}
        </select>
      </label>
      <label class="field"><span>Your name</span><input type="text" name="name" autocomplete="name" placeholder="Optional" data-f-name></label>
      <dl class="summary" data-summary aria-live="polite"></dl>
      <p class="form__error" data-error role="alert"></p>
      <div class="form__actions">
        <a class="btn btn--primary" data-wa target="_blank" rel="noopener">${esc(booking.whatsappLabel)}</a>
        <a class="btn" data-mail>${esc(booking.emailLabel)}</a>
      </div>
      <p class="form__note muted">${esc(booking.note)}</p>
    </form>
  </div>
</section>`
}

function footerHTML(): string {
  return `
<footer class="footer" data-nav-ink="light">
  <div class="wrap">
    <p class="footer__brand">${esc(brand.fullName)}</p>
    <p class="footer__line">${esc(footer.line)}</p>
    <p class="muted">${esc(brand.coordinates)} · ${esc(brand.established)}</p>
    <p class="muted small">${esc(footer.credit)}</p>
  </div>
</footer>`
}

export function renderPage(root: HTMLElement): void {
  root.innerHTML = `${navHTML()}<main>${heroHTML()}${roomsHTML()}${dayHTML()}${reviewsHTML()}${bookingHTML()}</main>${footerHTML()}`
}

export { esc }
