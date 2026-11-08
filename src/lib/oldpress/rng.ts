export type Rng = () => number;

/**
 * mulberry32 — tiny, fast, deterministic PRNG.
 * Same seed => same "aging" across reloads.
 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a string into a 32-bit seed so `theme: 'pulp'` can derive sub-seeds. */
export function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const range = (rng: Rng, min: number, max: number): number => min + rng() * (max - min);

export const int = (rng: Rng, min: number, max: number): number =>
  Math.floor(range(rng, min, max + 1));

export const chance = (rng: Rng, p: number): boolean => rng() < p;

export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function signed(rng: Rng, magnitude: number): number {
  return (rng() * 2 - 1) * magnitude;
}
