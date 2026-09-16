/**
 * Deterministic [0, 1) value for a given seed (mulberry32). Use instead of
 * `Math.random()` in render so server and client produce identical markup.
 */
export function seededRandom(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
