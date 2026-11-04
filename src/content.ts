import raw from './content.json'

/** Clock keyframe for the hero time-lapse. `at` is progress through the footage, 0..1. */
export interface Phase {
  at: number
  time: string
  label: string
}

/** A numbered WebP frame sequence in /public, e.g. /seq/d/001.webp. */
export interface Sequence {
  path: string
  count: number
  digits: number
  ext: string
  width: number
  height: number
}

export interface Picture {
  src: string
  alt: string
  caption?: string
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
  /** Photo paths in /public. When empty, illustrated art is generated from `palette`. */
  images: string[]
}

export interface Stop {
  /** Position along the trail, 0..1 */
  at: number
  time: string
  title: string
  text: string
  image?: string
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
    issue: string
    issueTitle: string
    season: string
  }
  contact: { whatsapp: string; email: string; phoneDisplay: string; address: string }
  theme: Record<string, string>
  nav: { label: string; href: string }[]
  hero: {
    kicker: string
    title: string
    lede: string
    caption: string
    scrollHint: string
    alt: string
    sequence: { desktop: Sequence; mobile: Sequence }
    exterior: Picture & { focus: number[]; time: string; label: string }
    interior: Picture
    phases: Phase[]
  }
  arrival: { kicker: string; title: string; body: string }
  rooms: {
    kicker: string
    title: string
    intro: string
    hint: string
    currency: string
    currencySymbol: string
    perNight: string
    items: Room[]
  }
  day: { kicker: string; title: string; body: string; mapLabel: string; stops: Stop[] }
  reviews: { kicker: string; featured: Review; items: Review[]; rating: string }
  booking: {
    kicker: string
    title: string
    body: string
    cardTitle: string
    cleaningFee: number
    taxRate: number
    taxLabel: string
    cleaningLabel: string
    minNights: number
    maxNights: number
    whatsappLabel: string
    emailLabel: string
    note: string
    image: Picture
  }
  footer: { line: string; colophon: string; credit: string; image: Picture }
  credits: {
    label: string
    author: string
    url: string
    repo: string
    repoLabel: string
    license: string
    mediaLabel: string
    mediaUrl: string
  }
}

export const content: Content = raw

export const money = (n: number): string =>
  `${content.rooms.currencySymbol}${Math.round(n).toLocaleString('en-US')}`
