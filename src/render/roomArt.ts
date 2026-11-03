import type { Room } from '../content'

/**
 * Generated room illustrations. Each room in content.json gets three views
 * coloured by its palette, so the template ships with zero photos and stays
 * tiny. Supply `images` in content.json to use photos instead.
 */

export type ArtVariant = 'bed' | 'bath' | 'terrace'
export const ART_VARIANTS: ArtVariant[] = ['bed', 'bath', 'terrace']
const VARIANT_LABEL: Record<ArtVariant, string> = {
  bed: 'bedroom',
  bath: 'bathroom',
  terrace: 'terrace',
}

let uid = 0

function view(id: string, x: number, y: number, w: number, h: number, night: boolean): string {
  const sky = night ? ['#0b1430', '#2b3768'] : ['#9ccbe6', '#f3e4cc']
  const far = night ? '#1d2748' : '#8fb0c2'
  const mid = night ? '#141b33' : '#5f8b84'
  const lake = night ? '#1a2850' : '#7fb0c4'
  const horizon = y + h * 0.62
  const peak = (px: number, ph: number) => `L${x + w * px} ${y + h * ph}`
  return `
  <clipPath id="${id}-clip"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
  <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
  <g clip-path="url(#${id}-clip)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}-sky)"/>
    ${
      night
        ? `<circle cx="${x + w * 0.72}" cy="${y + h * 0.22}" r="${h * 0.07}" fill="#f4ecd2"/>` +
          [0.1, 0.25, 0.4, 0.55, 0.86, 0.92]
            .map((sx, i) => `<circle cx="${x + w * sx}" cy="${y + h * (0.1 + (i % 3) * 0.1)}" r="1.6" fill="#fff"/>`)
            .join('')
        : `<circle cx="${x + w * 0.3}" cy="${y + h * 0.3}" r="${h * 0.09}" fill="#fff4d8"/>`
    }
    <path d="M${x} ${horizon}${peak(0.15, 0.4)}${peak(0.3, 0.52)}${peak(0.5, 0.26)}${peak(0.68, 0.48)}${peak(0.84, 0.34)}L${x + w} ${horizon}Z" fill="${far}"/>
    <path d="M${x} ${horizon + 2}C${x + w * 0.3} ${y + h * 0.52} ${x + w * 0.6} ${y + h * 0.66} ${x + w} ${y + h * 0.54}V${horizon + 6}H${x}Z" fill="${mid}"/>
    <rect x="${x}" y="${horizon + 4}" width="${w}" height="${h}" fill="${lake}"/>
    <path d="M${x + w * 0.1} ${horizon + h * 0.12}h${w * 0.18}M${x + w * 0.55} ${horizon + h * 0.2}h${w * 0.25}" stroke="#fff" stroke-opacity="0.3" stroke-width="2"/>
  </g>`
}

function bed(room: Room, id: string, night: boolean): string {
  const p = room.palette
  return `
  <rect width="800" height="600" fill="${p.wall}"/>
  <path d="M0 40H800M0 18H800" stroke="${p.wood}" stroke-width="10" opacity="0.5"/>
  ${view(id, 440, 80, 290, 250, night)}
  <rect x="432" y="72" width="306" height="266" fill="none" stroke="${p.wood}" stroke-width="16"/>
  <path d="M585 80V330M440 205H730" stroke="${p.wood}" stroke-width="7"/>
  <path d="M0 440H800V600H0Z" fill="${p.floor}"/>
  <path d="M0 480H800M0 530H800M0 580H800" stroke="#000" stroke-opacity="0.12" stroke-width="2"/>
  <ellipse cx="280" cy="520" rx="260" ry="48" fill="${p.accent}" opacity="0.35"/>
  <rect x="90" y="236" width="340" height="150" rx="10" fill="${p.wood}"/>
  <rect x="62" y="348" width="396" height="72" rx="14" fill="#f8f4ec"/>
  <rect x="120" y="318" width="120" height="44" rx="18" fill="#fffdf8"/>
  <rect x="268" y="318" width="120" height="44" rx="18" fill="#fffdf8"/>
  <path d="M62 380H458V452Q458 470 440 470H80Q62 470 62 452Z" fill="${p.fabric}"/>
  <path d="M62 392H458" stroke="#fff" stroke-opacity="0.35" stroke-width="4"/>
  <rect x="70" y="470" width="14" height="22" fill="${p.wood}"/><rect x="436" y="470" width="14" height="22" fill="${p.wood}"/>
  <radialGradient id="${id}-lamp"><stop offset="0" stop-color="${p.accent}" stop-opacity="${night ? 0.55 : 0.2}"/><stop offset="1" stop-color="${p.accent}" stop-opacity="0"/></radialGradient>
  <circle cx="512" cy="322" r="${night ? 170 : 90}" fill="url(#${id}-lamp)"/>
  <rect x="476" y="390" width="74" height="72" rx="4" fill="${p.wood}"/>
  <rect x="507" y="340" width="10" height="52" fill="#2a2a2a"/>
  <path d="M484 344L494 300H530L540 344Z" fill="${p.accent}"/>
  <rect x="604" y="420" width="120" height="40" rx="6" fill="#262421"/><rect x="636" y="380" width="56" height="44" rx="4" fill="#33302c"/>
  <rect x="642" y="392" width="44" height="26" rx="3" fill="${night ? '#ff9a48' : '#5a4636'}"/>`
}

function bath(room: Room, id: string, night: boolean): string {
  const p = room.palette
  return `
  <rect width="800" height="600" fill="${p.wall}"/>
  ${view(id, 110, 60, 580, 290, night)}
  <rect x="102" y="52" width="596" height="306" fill="none" stroke="${p.wood}" stroke-width="16"/>
  <path d="M303 60V350M497 60V350" stroke="${p.wood}" stroke-width="6"/>
  <path d="M0 430H800V600H0Z" fill="#d9d2c6"/>
  <path d="M100 430V600M200 430V600M300 430V600M400 430V600M500 430V600M600 430V600M700 430V600M0 500H800" stroke="#000" stroke-opacity="0.08" stroke-width="2"/>
  <path d="M200 372H600Q600 492 500 492H300Q200 492 200 372Z" fill="${p.accent}"/>
  <path d="M220 372H580Q580 392 560 396H240Q220 392 220 372Z" fill="#fff" opacity="0.4"/>
  <ellipse cx="400" cy="372" rx="206" ry="16" fill="#efe7da"/>
  <ellipse cx="400" cy="374" rx="186" ry="10" fill="#9fc3cf"/>
  <rect x="270" y="488" width="14" height="26" fill="${p.wood}"/><rect x="516" y="488" width="14" height="26" fill="${p.wood}"/>
  <path d="M590 300V330Q590 340 600 340" stroke="#8a8a8a" stroke-width="6" fill="none"/>
  <rect x="660" y="380" width="70" height="90" rx="10" fill="${p.wood}"/>
  <path d="M695 380C650 330 660 290 690 270C700 310 700 340 695 380ZM695 380C730 330 760 320 770 296C740 300 712 330 695 380ZM695 380C680 320 640 330 620 310C640 350 670 370 695 380Z" fill="#4f7a4a"/>
  <rect x="70" y="300" width="10" height="200" fill="${p.wood}"/>
  <rect x="58" y="320" width="34" height="110" rx="6" fill="${p.fabric}"/>`
}

function terrace(room: Room, id: string, night: boolean): string {
  const p = room.palette
  return `
  ${view(id, 0, 0, 800, 470, night)}
  <path d="M0 470H800V600H0Z" fill="${p.wood}"/>
  <path d="M0 500H800M0 535H800M0 572H800" stroke="#000" stroke-opacity="0.18" stroke-width="3"/>
  <rect x="0" y="330" width="800" height="12" fill="${p.wood}"/>
  <rect x="0" y="420" width="800" height="10" fill="${p.wood}"/>
  ${Array.from({ length: 11 }, (_, i) => `<rect x="${i * 80 + 4}" y="330" width="9" height="140" fill="${p.wood}"/>`).join('')}
  <path d="M120 540L180 430H300L270 540Z" fill="${p.fabric}"/>
  <path d="M180 430L150 360H250L300 430Z" fill="${p.fabric}" opacity="0.85"/>
  <path d="M500 540L560 430H680L650 540Z" fill="${p.fabric}"/>
  <path d="M560 430L530 360H630L680 430Z" fill="${p.fabric}" opacity="0.85"/>
  <rect x="360" y="470" width="90" height="12" rx="3" fill="#2d2925"/><rect x="398" y="482" width="14" height="60" fill="#2d2925"/>
  <rect x="372" y="448" width="18" height="22" rx="3" fill="#f3ede3"/><rect x="414" y="448" width="18" height="22" rx="3" fill="#f3ede3"/>
  <radialGradient id="${id}-lantern"><stop offset="0" stop-color="${p.accent}" stop-opacity="${night ? 0.6 : 0.2}"/><stop offset="1" stop-color="${p.accent}" stop-opacity="0"/></radialGradient>
  <circle cx="740" cy="500" r="${night ? 110 : 50}" fill="url(#${id}-lantern)"/>
  <rect x="724" y="478" width="32" height="46" rx="5" fill="#2d2925"/><rect x="730" y="486" width="20" height="30" rx="3" fill="${night ? '#ffb45e' : p.accent}"/>`
}

const DRAW: Record<ArtVariant, (room: Room, id: string, night: boolean) => string> = { bed, bath, terrace }

/** Returns an inline SVG string for one room view. */
export function roomArt(room: Room, variant: ArtVariant, night = false, extraClass = ''): string {
  const id = `ra${uid++}`
  return `<svg class="art ${extraClass}" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration of the ${room.name} ${VARIANT_LABEL[variant]}">${DRAW[variant](room, id, night)}</svg>`
}

/** Media for a room view: a photo when content.json provides one, else generated art. */
export function roomMedia(room: Room, index: number, night = false): string {
  const src = room.images[index]
  if (src) {
    return `<img class="art" src="${src}" alt="${room.name}, photo ${index + 1}" loading="lazy" decoding="async" width="800" height="600">`
  }
  return roomArt(room, ART_VARIANTS[index % ART_VARIANTS.length], night)
}

export function galleryCount(room: Room): number {
  return Math.max(room.images.length, ART_VARIANTS.length)
}
