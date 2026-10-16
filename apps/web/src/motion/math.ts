export type Rect = { x: number; y: number; w: number; h: number };

export const clamp = (v: number, lo = 0, hi = 1): number => Math.min(hi, Math.max(lo, v));
export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
export const smooth = (t: number): number => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
export const range = (v: number, start: number, length: number): number => smooth((v - start) / length);

export const sceneProgress = (
  top: number,
  height: number,
  viewport: number,
  tail = 0,
): { progress: number; body: number; out: number } => {
  const travel = height - viewport;
  if (travel <= 0) {
    const done = top < 0 ? 1 : 0;
    return { progress: done, body: done, out: done };
  }
  const scrolled = clamp(-top, 0, travel);
  const bodyTravel = Math.max(1, travel - clamp(tail, 0, travel));
  return {
    progress: scrolled / travel,
    body: clamp(scrolled / bodyTravel),
    out: tail > 0 ? clamp((scrolled - bodyTravel) / tail) : 0,
  };
};

export const stepAt = (progress: number, steps: number): { index: number; local: number } => {
  const scaled = clamp(progress) * steps;
  const index = Math.min(steps - 1, Math.floor(scaled));
  return { index, local: clamp(scaled - index) };
};

export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: mix(a.x, b.x, t),
  y: mix(a.y, b.y, t),
  w: mix(a.w, b.w, t),
  h: mix(a.h, b.h, t),
});
