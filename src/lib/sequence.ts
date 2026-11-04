import type { Sequence } from '../content'

/**
 * Loads a numbered WebP frame sequence progressively and draws the nearest
 * loaded frame to a canvas with `object-fit: cover` behaviour.
 *
 * Frames load coarse-to-fine (every 16th, then 8th, 4th, 2nd, all) so the
 * whole scroll range is usable early on a slow connection.
 */
export class FrameSequence {
  private frames: (HTMLImageElement | null)[]
  private ctx: CanvasRenderingContext2D
  private current = -1
  private wanted = 0
  private started = false

  constructor(
    private canvas: HTMLCanvasElement,
    private seq: Sequence,
  ) {
    this.frames = new Array(seq.count).fill(null)
    this.ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D
  }

  url(i: number): string {
    return `${this.seq.path}${String(i + 1).padStart(this.seq.digits, '0')}.${this.seq.ext}`
  }

  /** Start fetching. The first frame is awaited so the canvas is never blank. */
  async load(onFirst?: () => void): Promise<void> {
    if (this.started) return
    this.started = true
    await this.fetch(0)
    this.render(this.wanted, true)
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
    // A few parallel lanes keep the network busy without flooding it.
    let next = 0
    const lane = async (): Promise<void> => {
      while (next < order.length) {
        const i = order[next++]
        await this.fetch(i)
        if (Math.abs(i - this.wanted) < Math.abs(this.current - this.wanted)) this.render(this.wanted, true)
      }
    }
    await Promise.all([lane(), lane(), lane(), lane()])
  }

  private fetch(i: number): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        this.frames[i] = img
        resolve()
      }
      img.onerror = () => resolve()
      img.src = this.url(i)
    })
  }

  private nearest(i: number): number {
    for (let d = 0; d < this.seq.count; d++) {
      if (this.frames[i - d]) return i - d
      if (this.frames[i + d]) return i + d
    }
    return -1
  }

  /** Match the canvas backing store to its CSS size (capped DPR for memory). */
  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.round(this.canvas.clientWidth * dpr)
    const h = Math.round(this.canvas.clientHeight * dpr)
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }
    this.render(this.wanted, true)
  }

  /** Draw frame for progress p (0..1). */
  draw(p: number): void {
    this.wanted = Math.round(Math.min(1, Math.max(0, p)) * (this.seq.count - 1))
    this.render(this.wanted)
  }

  private render(i: number, force = false): void {
    const n = this.nearest(i)
    if (n < 0 || (n === this.current && !force)) return
    this.current = n
    const img = this.frames[n] as HTMLImageElement
    const { width: cw, height: ch } = this.canvas
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const w = img.naturalWidth * s
    const h = img.naturalHeight * s
    this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
  }
}
