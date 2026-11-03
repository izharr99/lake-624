import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { content, money, type Room } from '../content'
import { esc } from '../render/page'
import { galleryCount, roomMedia } from '../render/roomArt'
import { lockScroll, scrollToTarget } from './smooth'
import { selectRoom } from '../booking'

/**
 * Shared-element room detail. The card image and the dialog image share a
 * data-flip-id, so Flip morphs one into the other on open and back on close.
 */
export function initDetail(reduced: boolean): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-detail]')
  if (!dialog) return
  let active: { room: Room; card: HTMLButtonElement } | null = null
  let busy = false

  const render = (room: Room, night: boolean): string => {
    const n = galleryCount(room)
    const slides = Array.from(
      { length: n },
      (_, i) => `<div class="gallery__slide${i === 0 ? ' is-active' : ''}" data-slide="${i}">${roomMedia(room, i, i === 0 ? night : false)}</div>`,
    ).join('')
    const thumbs = Array.from(
      { length: n },
      (_, i) =>
        `<button type="button" class="thumb${i === 0 ? ' is-active' : ''}" data-thumb="${i}" aria-label="Show image ${i + 1} of ${n}" aria-pressed="${i === 0}">${roomMedia(room, i, i === 0 ? night : false)}</button>`,
    ).join('')
    return `
    <div class="detail__inner">
      <div class="detail__media" data-flip-id="room-${room.id}">${slides}</div>
      <div class="detail__info" data-detail-info>
        <button type="button" class="detail__close" data-close aria-label="Close room details"><span aria-hidden="true">×</span></button>
        <div class="thumbs" role="group" aria-label="Gallery">${thumbs}</div>
        <p class="kicker">${esc(room.view)} view · ${esc(room.size)} · sleeps ${room.sleeps}</p>
        <h2 class="detail__title display" id="detail-title">${esc(room.name)}</h2>
        <p class="detail__desc">${esc(room.description)}</p>
        <ul class="amenities">${room.amenities.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
        <div class="detail__foot">
          <p class="detail__price"><strong>${money(room.price)}</strong> <span class="muted">${esc(content.rooms.perNight)}</span><br><span class="muted small">${esc(room.bed)}</span></p>
          <button type="button" class="btn btn--primary" data-book>Book this room</button>
        </div>
      </div>
    </div>`
  }

  const showSlide = (i: number): void => {
    dialog.querySelectorAll<HTMLElement>('[data-slide]').forEach((s) => s.classList.toggle('is-active', s.dataset.slide === String(i)))
    dialog.querySelectorAll<HTMLButtonElement>('[data-thumb]').forEach((t) => {
      const on = t.dataset.thumb === String(i)
      t.classList.toggle('is-active', on)
      t.setAttribute('aria-pressed', String(on))
    })
  }

  const open = (card: HTMLButtonElement): void => {
    const room = content.rooms.items.find((r) => r.id === card.dataset.room)
    const cardMedia = card.querySelector<HTMLElement>('.card__media')
    if (!room || !cardMedia || busy) return
    const night = cardMedia.dataset.night === 'true'
    active = { room, card }
    dialog.innerHTML = render(room, night)
    lockScroll(true)
    if (reduced) {
      dialog.showModal()
      return
    }
    busy = true
    const state = Flip.getState(cardMedia)
    dialog.showModal()
    const media = dialog.querySelector<HTMLElement>('.detail__media')
    gsap.set(cardMedia, { autoAlpha: 0 })
    Flip.from(state, {
      targets: media,
      duration: 0.9,
      ease: 'expo.inOut',
      scale: true,
      onComplete: () => {
        busy = false
      },
    })
    gsap.from(dialog.querySelectorAll('[data-detail-info] > *'), {
      autoAlpha: 0,
      y: 30,
      stagger: 0.05,
      duration: 0.6,
      delay: 0.45,
      ease: 'power3.out',
    })
  }

  const close = (then?: () => void): void => {
    if (!active || busy) return
    const { card } = active
    const cardMedia = card.querySelector<HTMLElement>('.card__media')
    const media = dialog.querySelector<HTMLElement>('.detail__media')
    const finish = (): void => {
      dialog.close()
      lockScroll(false)
      active = null
      busy = false
      card.focus({ preventScroll: true })
      then?.()
    }
    if (reduced || !cardMedia || !media) {
      finish()
      return
    }
    busy = true
    // Return to the first slide so the image that lands back on the card matches it.
    showSlide(0)
    gsap.to(dialog.querySelectorAll('[data-detail-info] > *'), { autoAlpha: 0, duration: 0.25 })
    dialog.classList.add('is-closing')
    const state = Flip.getState(media)
    gsap.delayedCall(0.2, () => {
      dialog.close()
      gsap.set(cardMedia, { autoAlpha: 1 })
      Flip.from(state, {
        targets: cardMedia,
        duration: 0.8,
        ease: 'expo.inOut',
        scale: true,
        zIndex: 50,
        onComplete: () => {
          dialog.classList.remove('is-closing')
          finish()
        },
      })
    })
  }

  document.querySelectorAll<HTMLButtonElement>('[data-room]').forEach((card) => card.addEventListener('click', () => open(card)))

  dialog.addEventListener('click', (e) => {
    const t = e.target as HTMLElement
    if (t === dialog || t.closest('[data-close]')) close()
    const thumb = t.closest<HTMLButtonElement>('[data-thumb]')
    if (thumb) showSlide(Number(thumb.dataset.thumb))
    if (t.closest('[data-book]') && active) {
      const id = active.room.id
      close(() => {
        selectRoom(id)
        const book = document.getElementById('book')
        if (book) scrollToTarget(book)
      })
    }
  })
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault()
    close()
  })
}
