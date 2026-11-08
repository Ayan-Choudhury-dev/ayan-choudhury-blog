/**
 * Procedural paper textures — zero image assets, everything baked
 * into data URLs once at init so the runtime cost is pure compositing.
 */

import { mulberry32, range, chance, type Rng } from './rng';

function canvas2d(w: number, h: number): { c: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('oldpress: 2D canvas unavailable');
  return { c, ctx };
}

/** Draw a radial-gradient blob (used for stains, blotches, vignettes). */
function blob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
): void {
  const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
  g.addColorStop(0, colorWithAlpha(color, alpha));
  g.addColorStop(1, colorWithAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

const HEX = /^#?[0-9a-f]{6}$/i;

/** '#8b6c42' + 0.5 -> 'rgba(139,108,66,0.5)' */
export function colorWithAlpha(hex: string, alpha: number): string {
  let h = hex;
  if (HEX.test(h)) h = h.startsWith('#') ? h.slice(1) : h;
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export interface PaperTileOptions {
  /** Warm base tint, e.g. '#f4eddc' */
  base: string;
  /** Fiber/streak color, e.g. '#8a7a5c' */
  fiber?: string;
  /** 0..1 — how pronounced fibers are */
  roughness?: number;
}

/**
 * Seamless paper-fiber tile: fine per-pixel grain + wrapped fiber strokes.
 * Used as the repeating texture of the underlay.
 */
export function makePaperTile(seed: number, size = 256, opts: PaperTileOptions): string {
  const rng = mulberry32(seed);
  const roughness = opts.roughness ?? 0.5;
  const fiber = opts.fiber ?? '#8a7a5c';
  const { c, ctx } = canvas2d(size, size);

  ctx.fillStyle = opts.base;
  ctx.fillRect(0, 0, size, size);

  // Fine per-pixel mottle (seamless: independent per pixel)
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rng() - 0.5) * 18 * roughness;
    d[i] = clamp255(d[i] + n);
    d[i + 1] = clamp255(d[i + 1] + n * 0.9);
    d[i + 2] = clamp255(d[i + 2] + n * 0.7);
  }
  ctx.putImageData(img, 0, 0);

  // Long soft fibers — drawn wrapped so the tile stays seamless
  const fibers = Math.round(range(rng, 26, 40));
  ctx.lineCap = 'round';
  for (let i = 0; i < fibers; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const len = range(rng, 20, 90);
    const ang = range(rng, -0.35, 0.35) + (chance(rng, 0.5) ? 0 : Math.PI / 2); // mostly H/V grain
    const dx = Math.cos(ang) * len;
    const dy = Math.sin(ang) * len;
    ctx.strokeStyle = colorWithAlpha(fiber, range(rng, 0.02, 0.06) * (0.5 + roughness));
    ctx.lineWidth = range(rng, 0.6, 1.6);
    for (const ox of [0, -size, size]) {
      for (const oy of [0, -size, size]) {
        ctx.beginPath();
        ctx.moveTo(x + ox, y + oy);
        // slight curve so fibers feel organic
        ctx.quadraticCurveTo(
          x + ox + dx * 0.5 + range(rng, -3, 3),
          y + oy + dy * 0.5 + range(rng, -3, 3),
          x + ox + dx,
          y + oy + dy,
        );
        ctx.stroke();
      }
    }
  }

  return c.toDataURL('image/png');
}

export interface GrainOptions {
  /** 0..1 contrast of the noise */
  strength?: number;
}

/**
 * Monochrome noise tile for the film-grain overlay.
 * Mid-gray centered so it disappears under multiply at low opacity.
 */
export function makeGrainTile(seed: number, size = 144, opts: GrainOptions = {}): string {
  const rng = mulberry32(seed);
  const strength = opts.strength ?? 0.5;
  const { c, ctx } = canvas2d(size, size);
  const img = ctx.createImageData(size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = clamp255(128 + (rng() - 0.5) * 255 * strength);
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

export interface AgingOptions {
  /** 0..1 — density of foxing spots */
  spots?: number;
  /** 0..1 — big uneven yellowing patches */
  blotches?: number;
  /** 0..1 — probability of one coffee-ring stain */
  ring?: number;
  /** Stain hue, e.g. '#8b6c42' */
  color?: string;
}

/**
 * Large non-repeating aging layer: foxing spots, yellowing patches,
 * optional coffee ring. Stretched over the viewport (cover).
 */
export function makeAgingLayer(seed: number, opts: AgingOptions = {}, size = 1024): string {
  const rng: Rng = mulberry32(seed);
  const spots = opts.spots ?? 0.4;
  const blotches = opts.blotches ?? 0.4;
  const color = opts.color ?? '#8b6c42';
  const { c, ctx } = canvas2d(size, size);

  // Big uneven yellowing patches first (under everything)
  const patchCount = Math.round(blotches * range(rng, 5, 9));
  for (let i = 0; i < patchCount; i++) {
    blob(
      ctx,
      rng() * size,
      rng() * size,
      range(rng, size * 0.15, size * 0.45),
      '#b08a45',
      range(rng, 0.03, 0.09) * (0.5 + blotches),
    );
  }

  // Foxing: small age spots
  const spotCount = Math.round(spots * range(rng, 30, 70));
  for (let i = 0; i < spotCount; i++) {
    blob(
      ctx,
      rng() * size,
      rng() * size,
      range(rng, 3, 22),
      color,
      range(rng, 0.04, 0.14) * (0.5 + spots),
    );
  }

  // Occasional coffee ring
  if (opts.ring && chance(rng, opts.ring)) {
    const x = range(rng, size * 0.2, size * 0.8);
    const y = range(rng, size * 0.2, size * 0.8);
    const r = range(rng, 60, 130);
    ctx.strokeStyle = colorWithAlpha(color, range(rng, 0.08, 0.16));
    ctx.lineWidth = range(rng, 5, 12);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    // partial second arc for a dried-ring look
    ctx.strokeStyle = colorWithAlpha(color, range(rng, 0.04, 0.08));
    ctx.lineWidth = range(rng, 10, 18);
    ctx.beginPath();
    ctx.arc(x, y, r + range(rng, 2, 8), rng() * Math.PI, rng() * Math.PI + Math.PI);
    ctx.stroke();
  }

  return c.toDataURL('image/png');
}

function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}
