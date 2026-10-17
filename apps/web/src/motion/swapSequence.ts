const OUT = 180;
const IN = 500;
const EASE = 'cubic-bezier(.2,.8,.2,1)';
/**
 * The prototype fades the word while it turns edge-on. Here the text stays at full opacity, so a contrast check never
 * catches it half transparent; a clip that closes toward the middle line hides it instead. Open, the clip leaves room
 * for the underline, descenders and the halo; its sides stay half an em out, past the halo's reach on any word.
 */
const OPEN = 'inset(-40% -0.5em)';
const SHUT = 'inset(50% -0.5em)';

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
      { transform: 'none', clipPath: OPEN },
      { transform: 'rotateX(-80deg) translateY(-35%)', clipPath: SHUT },
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
          { transform: 'rotateX(80deg) translateY(35%)', clipPath: SHUT },
          { transform: 'none', clipPath: OPEN },
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
