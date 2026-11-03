import raw from './content.json'

/** Colour keyframe for the day-to-night hero. `at` is scroll progress 0..1. */
export interface Phase {
  at: number
  time: string
  label: string
  skyTop: string
  skyMid: string
  skyHorizon: string
  far: string
  mid: string
  near: string
  water: string
  text: string
  /** 0..1 how lit the lodge windows are */
  windows: number
  /** 0..1 star visibility */
  stars: number
}

export interface RoomPalette {
  wall: string
  floor: string
  wood: string
  fabric: string
  accent: string
}

export interface Room {
  id: string
  name: string
  short: string
  description: string
  price: number
  size: string
  sleeps: number
  bed: string
  view: string
  palette: RoomPalette
  amenities: string[]
  /** Optional photo paths in /public. When empty, illustrated art is generated from `palette`. */
  images: string[]
}

export interface Stop {
  /** Position along the trail, 0..1 */
  at: number
  time: string
  title: string
  text: string
}

export interface Review {
  quote: string
  name: string
  detail: string
}

export interface Content {
  brand: {
    name: string
    fullName: string
    tagline: string
    description: string
    location: string
    coordinates: string
    established: string
  }
  contact: { whatsapp: string; email: string; phoneDisplay: string; address: string }
  theme: Record<string, string>
  nav: { label: string; href: string }[]
  hero: { kicker: string; title: string; lede: string; scrollHint: string; phases: Phase[] }
  arrival: { kicker: string; title: string; body: string }
  rooms: {
    kicker: string
    title: string
    hint: string
    currency: string
    currencySymbol: string
    perNight: string
    items: Room[]
  }
  day: { kicker: string; title: string; body: string; stops: Stop[] }
  reviews: { kicker: string; featured: Review; items: Review[]; rating: string }
  booking: {
    kicker: string
    title: string
    body: string
    cleaningFee: number
    taxRate: number
    taxLabel: string
    cleaningLabel: string
    minNights: number
    maxNights: number
    whatsappLabel: string
    emailLabel: string
    note: string
  }
  footer: { line: string; credit: string }
}

export const content: Content = raw

export const money = (n: number): string =>
  `${content.rooms.currencySymbol}${Math.round(n).toLocaleString('en-US')}`
