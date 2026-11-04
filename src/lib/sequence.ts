import type { Sequence } from '../content'

/**
 * Scroll-scrubbed image sequence player tuned for smoothness.
 *
 * - Compressed frames are fetched once as <img> (cheap to keep around).
 * - A sliding window of frames around the playhead is decoded off the main
 *   thread into ImageBitmaps; only decoded bitmaps are ever drawn, so a draw
 *   never triggers a synchronous decode.
 * - The playhead is fractional and eased every tick, and adjacent frames are
 *   cross-blended by the fractional part, so the picture changes continuously
 *   on every display frame instead of stepping between frames.
 * - The canvas is sized only on resize and redrawn only when the blend changes.
 */
const AHEAD = 20
const BEHIND = 10
const KEEP = 30

export class FrameSequence {
  private imgs: (HTMLImageElement | null)[]
  private bitmaps = new Map<number, ImageBitmap>()
  private pending = new Set<number>()
  private ctx: CanvasRenderingContext2D
  private target = 0
  private head = 0
  private drawn = ''
  private started = false
  private disposed = false

  constructor(
    private canvas: HTMLCanvasElement,
    private seq: Sequence,
  ) {
    this.imgs = new Array(seq.count).fill(null)
    this.ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D
    this.ctx.imageSmoothingQuality = 'high'
  }

  private url(i: number): string {
    return `${this.seq.path}${String(i + 1).padStart(this.seq.digits, '0')}.${this.seq.ext}`
  }

  /** Fetch every frame, coarse to fine, so the whole range is usable early. */
  async load(onFirst?: () => void): Promise<void> {
    if (this.started) return
    this.started = true
    await this.fetch(0)
    await this.decode(0)
    this.paint(true)
    onFirst?.()
    const order: number[] = []
    const seen = new Set<number>([0])
    for (const step of [16, 8, 4, 2, 1]) {
      for (let i = 0; i < this.seq.count; i += step) {
        if (!seen.has(i)) {
          seen.add(i)
          order.push(i)
        }
      }
    }
    let next = 0
    const lane = async (): Promise<void> => {
      while (next < order.length && !this.disposed) {
        await this.fetch(order[next++])
        this.schedule()
      }
    }
    await Promise.all([lane(), lane(), lane(), lane()])
  }

  dispose(): void {
    this.disposed = true
    this.bitmaps.forEach((b) => b.close())
    this.bitmaps.clear()
  }

  private fetch(i: number): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        this.imgs[i] = img
        resolve()
      }
      img.onerror = () => resolve()
      img.src = this.url(i)
    })
  }

  private async decode(i: number): Promise<void> {
    const img = this.imgs[i]
    if (!img || this.bitmaps.has(i) || this.pending.has(i)) return
    this.pending.add(i)
    try {
      const bmp = await createImageBitmap(img)
      if (this.disposed) bmp.close()
      else this.bitmaps.set(i, bmp)
    } catch {
      /* decode failure: the nearest decoded neighbour is drawn instead */
    }
    this.pending.delete(i)
  }

  /** Decode the window around the playhead, release bitmaps far from it. */
  private schedule(): void {
    const c = Math.round(this.head)
    const lo = Math.max(0, c - BEHIND)
    const hi = Math.min(this.seq.count - 1, c + AHEAD)
    // Nearest first, so the frames needed next are ready first.
    for (let d = 0; d <= AHEAD; d++) {
      for (const i of [c + d, c - d]) {
        if (i >= lo && i <= hi && this.imgs[i] && !this.bitmaps.has(i) && !this.pending.has(i)) {
          void this.decode(i).then(() => this.paint())
        }
      }
    }
    for (const [i, b] of this.bitmaps) {
      if (i < c - KEEP || i > c + KEEP) {
        b.close()
        this.bitmaps.delete(i)
      }
    }
  }

  /**
   * Size the backing store once per resize. It never exceeds what the source
   * frames can fill (cover scale x 1.25), so retina screens don't pay fill-rate
   * for pixels the footage doesn't have.
   */
  resize(): void {
    const cw = this.canvas.clientWidth || 1
    const ch = this.canvas.clientHeight || 1
    const coverScale = Math.max(cw / this.seq.width, ch / this.seq.height)
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5, Math.max(1, 1.25 / coverScale))
    const w = Math.round(this.canvas.clientWidth * dpr)
    const h = Math.round(this.canvas.clientHeight * dpr)
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
      this.ctx.imageSmoothingQuality = 'high'
    }
    this.paint(true)
  }

  /** Set the scroll target, 0..1. The visible playhead eases towards it in tick(). */
  seek(p: number, jump = false): void {
    this.target = Math.min(1, Math.max(0, p)) * (this.seq.count - 1)
    if (jump) this.head = this.target
  }

  /** Call once per animation frame. */
  tick(): void {
    const d = this.target - this.head
    if (Math.abs(d) < 0.002) this.head = this.target
    else this.head += d * 0.22
    this.schedule()
    this.paint()
  }

  private nearestDecoded(i: number): number {
    for (let d = 0; d < this.seq.count; d++) {
      if (this.bitmaps.has(i - d)) return i - d
      if (this.bitmaps.has(i + d)) return i + d
    }
    return -1
  }

  private cover(bmp: ImageBitmap, alpha: number): void {
    const { width: cw, height: ch } = this.canvas
    const s = Math.max(cw / bmp.width, ch / bmp.height)
    const w = bmp.width * s
    const h = bmp.height * s
    this.ctx.globalAlpha = alpha
    this.ctx.drawImage(bmp, (cw - w) / 2, (ch - h) / 2, w, h)
  }

  private paint(force = false): void {
    const f = Math.floor(this.head)
    const t = this.head - f
    const a = this.bitmaps.has(f) ? f : this.nearestDecoded(f)
    if (a < 0) return
    const b = f + 1
    const blend = a === f && t > 0.01 && this.bitmaps.has(b) ? Math.round(t * 48) / 48 : 0
    const key = `${a}:${blend}`
    if (!force && key === this.drawn) return
    this.drawn = key
    this.cover(this.bitmaps.get(a) as ImageBitmap, 1)
    if (blend > 0) this.cover(this.bitmaps.get(b) as ImageBitmap, blend)
    this.ctx.globalAlpha = 1
  }
}
