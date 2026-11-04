import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { content, money, type Room } from '../content'
import { esc, roman } from '../render/page'
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
    const index = content.rooms.items.indexOf(room)
    return `
    <div class="detail__inner">
      <figure class="detail__figure">
        <div class="detail__media" data-flip-id="room-${room.id}">${slides}</div>
        <figcaption class="caption detail__caption">Plate ${roman(index)}. ${esc(room.name)}, ${esc(room.view.toLowerCase())} view.</figcaption>
      </figure>
      <div class="detail__info" data-detail-info>
        <button type="button" class="detail__close label" data-close aria-label="Close room details">Close</button>
        <p class="label">Plate ${roman(index)} · ${esc(room.view)} view</p>
        <h2 class="detail__title display" id="detail-title">${esc(room.name)}</h2>
        <p class="detail__desc dropcap">${esc(room.description)}</p>
        <dl class="facts">
          <div><dt class="label">Size</dt><dd>${esc(room.size)}</dd></div>
          <div><dt class="label">Sleeps</dt><dd>${room.sleeps}</dd></div>
          <div><dt class="label">Bed</dt><dd>${esc(room.bed)}</dd></div>
        </dl>
        <p class="label">In the room</p>
        <ul class="amenities">${room.amenities.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
        <div class="thumbs" role="group" aria-label="Gallery">${thumbs}</div>
        <div class="detail__foot">
          <p class="detail__price">${money(room.price)} <em>${esc(content.rooms.perNight)}</em></p>
          <button type="button" class="btn btn--ink" data-book>Reserve this room</button>
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
    const cardMedia = card.querySelector<HTMLElement>('.plate__media')
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
      duration: 1.4,
      ease: 'expo.inOut',
      scale: true,
      onComplete: () => {
        busy = false
      },
    })
    gsap.from(dialog.querySelectorAll('[data-detail-info] > *'), {
      autoAlpha: 0,
      y: 24,
      stagger: 0.07,
      duration: 1.2,
      delay: 0.8,
      ease: 'sine.out',
    })
  }

  const close = (then?: () => void): void => {
    if (!active || busy) return
    const { card } = active
    const cardMedia = card.querySelector<HTMLElement>('.plate__media')
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
    gsap.to(dialog.querySelectorAll('[data-detail-info] > *, .detail__caption'), { autoAlpha: 0, duration: 0.5, ease: 'sine.inOut' })
    dialog.classList.add('is-closing')
    const state = Flip.getState(media)
    gsap.delayedCall(0.45, () => {
      dialog.close()
      gsap.set(cardMedia, { autoAlpha: 1 })
      Flip.from(state, {
        targets: cardMedia,
        duration: 1.3,
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
