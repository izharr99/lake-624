/**
 * Hand-built SVG landscape for the hero. Every element that changes with
 * time of day carries a data-* hook that motion/hero.ts drives.
 * viewBox is 1600 x 1000; the lodge sits in the horizontal centre so the
 * `slice` crop keeps it in frame on narrow phones.
 */

export const SCENE_W = 1600
export const SCENE_H = 1000
/** The picture window the camera flies into (scene units). */
export const TARGET_WINDOW = { x: 772, y: 676, w: 56, h: 40 }

/** Small deterministic PRNG so the scene renders identically every load. */
function rng(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function stars(): string {
  const r = rng(7)
  let out = ''
  for (let i = 0; i < 90; i++) {
    const x = (r() * SCENE_W).toFixed(0)
    const y = (r() * 520).toFixed(0)
    const rad = (0.8 + r() * 1.8).toFixed(2)
    out += `<circle cx="${x}" cy="${y}" r="${rad}" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`
  }
  return out
}

function pines(seed: number, baseY: number, from: number, to: number, minH: number, maxH: number): string {
  const r = rng(seed)
  let d = ''
  let x = from
  while (x < to) {
    const h = minH + r() * (maxH - minH)
    const w = h * (0.32 + r() * 0.12)
    const y = baseY + r() * 10
    d += `M${(x - w / 2).toFixed(1)} ${y.toFixed(1)}L${x.toFixed(1)} ${(y - h).toFixed(1)}L${(x + w / 2).toFixed(1)} ${y.toFixed(1)}Z`
    x += w * (0.45 + r() * 0.5)
  }
  return d
}

const FAR =
  'M0 640L120 520L210 580L330 420L430 520L520 470L640 300L760 450L830 400L920 480L1040 330L1160 470L1260 410L1380 520L1480 450L1600 540V760H0Z'
const SNOW =
  'M596 362L640 300L684 362L664 352L652 366L640 350L626 366L614 352Z M1000 386L1040 330L1082 390L1062 380L1050 392L1038 378L1024 392L1012 380Z M300 462L330 420L358 458L344 452L330 462L316 452Z'
const MID =
  'M0 700C150 610 260 640 380 600C500 560 600 650 720 620C860 585 960 640 1080 600C1220 555 1350 640 1600 610V780H0Z'

interface Win {
  x: number
  y: number
  w: number
  h: number
}

const WINDOWS: Win[] = [
  TARGET_WINDOW,
  { x: 742, y: 682, w: 20, h: 30 },
  { x: 838, y: 682, w: 20, h: 30 },
  { x: 786, y: 616, w: 28, h: 26 },
  { x: 888, y: 700, w: 22, h: 18 },
  { x: 922, y: 700, w: 22, h: 18 },
  { x: 664, y: 702, w: 18, h: 16 },
]

export function sceneSVG(): string {
  const wins = WINDOWS.map(
    (w, i) =>
      `<rect data-window ${i === 0 ? 'data-target' : ''} x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" rx="1.5"/>`,
  ).join('')
  const glows = WINDOWS.map(
    (w) => `<circle cx="${w.x + w.w / 2}" cy="${w.y + w.h / 2}" r="${Math.max(w.w, w.h) * 1.6}" fill="url(#g-glow)"/>`,
  ).join('')
  const reflections = WINDOWS.filter((w) => w.y > 660)
    .map((w) => `<rect x="${w.x + w.w * 0.3}" y="${746 + (w.y - 676) * 0.2}" width="${w.w * 0.4}" height="${50 + w.h}" rx="2"/>`)
    .join('')

  return `
<svg class="scene" viewBox="0 0 ${SCENE_W} ${SCENE_H}" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Illustrated lodge on a mountain lake, moving from sunrise to night as you scroll" data-scene>
  <defs>
    <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" data-stop="skyTop"/>
      <stop offset="0.55" data-stop="skyMid"/>
      <stop offset="0.78" data-stop="skyHorizon"/>
    </linearGradient>
    <linearGradient id="g-water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" data-stop="water"/>
      <stop offset="1" data-stop="near"/>
    </linearGradient>
    <radialGradient id="g-sun">
      <stop offset="0" stop-color="#fff6dc"/>
      <stop offset="0.35" stop-color="#ffe2a6" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#ffcf8a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g-moon">
      <stop offset="0" stop-color="#f4ecd2" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#f4ecd2" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="g-reflect" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffcf85" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#ffcf85" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="g-waterclip"><rect y="728" width="${SCENE_W}" height="272"/></clipPath>
    <radialGradient id="g-glow">
      <stop offset="0" stop-color="#ffc977" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#ffb35c" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${SCENE_W}" height="${SCENE_H}" fill="url(#g-sky)"/>
  <g data-stars fill="#fff">${stars()}</g>

  <g data-sun>
    <circle r="190" fill="url(#g-sun)"/>
    <circle r="46" fill="#fff3d6"/>
  </g>
  <g data-moon opacity="0">
    <circle r="150" fill="url(#g-moon)"/>
    <circle r="30" fill="#f4ecd2"/>
    <circle r="7" cx="-8" cy="-6" fill="#ddd3b6"/>
    <circle r="4" cx="10" cy="9" fill="#ddd3b6"/>
  </g>

  <g data-layer="far">
    <path d="${FAR}" data-fill="far"/>
    <path d="${SNOW}" fill="#fff" data-snow opacity="0.5"/>
  </g>
  <g data-layer="mid">
    <path d="${MID}" data-fill="mid"/>
    <path d="${pines(3, 702, -20, 1620, 26, 58)}" data-fill="mid" opacity="0.9"/>
  </g>

  <rect y="728" width="${SCENE_W}" height="272" fill="url(#g-water)"/>
  <g clip-path="url(#g-waterclip)" opacity="0.22">
    <g transform="translate(0 1460) scale(1 -1)">
      <path d="${MID}" data-fill="mid"/>
    </g>
  </g>
  <g data-sun-trail opacity="0.6" fill="#ffe6b0">
    <rect x="-40" y="0" width="80" height="4" rx="2"/>
    <rect x="-28" y="18" width="56" height="3" rx="1.5"/>
    <rect x="-52" y="40" width="104" height="3" rx="1.5"/>
    <rect x="-22" y="66" width="44" height="3" rx="1.5"/>
    <rect x="-34" y="96" width="68" height="3" rx="1.5"/>
  </g>
  <g data-shimmer stroke="#fff" stroke-opacity="0.18" stroke-width="2" stroke-linecap="round">
    <path d="M120 790h90M330 820h60M1180 800h110M1400 850h70M520 900h80M1040 930h90M240 960h70"/>
  </g>

  <g data-layer="near">
    <path d="${pines(11, 734, -20, 640, 50, 120)}" data-fill="near"/>
    <path d="${pines(19, 734, 980, 1620, 50, 130)}" data-fill="near"/>
    <path d="M0 734H1600V742H0Z" data-fill="near"/>
  </g>

  <g data-lodge>
    <g data-window-reflect fill="url(#g-reflect)" opacity="0">${reflections}</g>
    <path d="M700 742h12v60h-12zM770 742h12v60h-12z" data-fill="near"/>
    <path d="M690 738h104v8H690z" data-fill="near"/>
    <path d="M652 735V696l38-22 38 22v39z" data-fill="near"/>
    <path d="M730 735V660H870V735z" data-fill="near"/>
    <path d="M712 664L800 566L888 664z" data-fill="near"/>
    <path d="M870 735V692H962V735z" data-fill="near"/>
    <path d="M862 696L916 668L970 696z" data-fill="near"/>
    <rect x="842" y="590" width="12" height="40" data-fill="near"/>
    <g data-glows opacity="0">${glows}</g>
    <g data-windows>${wins}</g>
    <path d="M800 676v40M772 696h56" stroke-width="2" data-stroke="near"/>
  </g>

  <g data-layer="front">
    <path d="M-40 1000L-40 760C40 780 120 800 170 860C220 920 260 960 300 1000Z" data-fill="near"/>
    <path d="M1640 1000V780C1560 800 1490 850 1440 900C1400 940 1380 970 1360 1000Z" data-fill="near"/>
    <path d="${pines(29, 1010, 1380, 1640, 160, 260)}" data-fill="near"/>
    <path d="${pines(31, 1010, -40, 240, 160, 280)}" data-fill="near"/>
  </g>
</svg>`
}
