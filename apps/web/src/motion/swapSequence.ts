const OUT = 180;
const IN = 500;
const EASE = 'cubic-bezier(.2,.8,.2,1)';

type Playback = { finished: Promise<unknown>; cancel(): void };
export type Animatable = {
  animate(keyframes: Keyframe[], options: KeyframeAnimationOptions): Playback;
  getAnimations(): { cancel(): void }[];
};

/**
 * Flip out, commit the new value, flip in. Returns a cancel function; after it is
 * called nothing is committed, so an interrupted swap can never show a stale value.
 */
export function runSwap(el: Animatable, value: string, commit: (value: string) => void): () => void {
  for (const running of el.getAnimations()) running.cancel();
  const out = el.animate(
    [
      { transform: 'none', opacity: 1 },
      { transform: 'rotateX(-80deg) translateY(-35%)', opacity: 0 },
    ],
    { duration: OUT, easing: 'ease-in', fill: 'none' },
  );
  let cancelled = false;
  out.finished
    .then(() => {
      if (cancelled) return;
      commit(value);
      el.animate(
        [
          { transform: 'rotateX(80deg) translateY(35%)', opacity: 0 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: IN, easing: EASE, fill: 'none' },
      );
    })
    .catch(() => {
      if (!cancelled) commit(value);
    });
  return () => {
    cancelled = true;
    out.cancel();
  };
}
