import { clamp } from '@/motion/math';

const RADIUS = 220;
const BASE_WEIGHT = 560;
const EXTRA_WEIGHT = 340;
const SOFTNESS = 100;
/** Below this pull a letter is left at its resting weight. */
const MIN_PULL = 0.02;

type Letter = { el: HTMLElement; x: number; y: number; pull: number };

/** Letter centres in viewport coordinates, from layout offsets, which ignore the letters' own animation. */
const measure = (h1: HTMLElement): Letter[] => {
  const box = h1.getBoundingClientRect();
  return [...h1.querySelectorAll<HTMLElement>('[data-ch]')].map((el) => {
    const word = el.offsetParent as HTMLElement | null;
    const left = (word?.offsetLeft ?? 0) + el.offsetLeft;
    const top = (word?.offsetTop ?? 0) + el.offsetTop;
    return { el, x: box.left + left + el.offsetWidth / 2, y: box.top + top + el.offsetHeight / 2, pull: 0 };
  });
};

const weigh = (letter: Letter, pull: number): void => {
  const rounded = pull > MIN_PULL ? Math.round(pull * 100) / 100 : 0;
  if (rounded === letter.pull) return;
  letter.pull = rounded;
  if (rounded === 0) letter.el.style.removeProperty('--fv');
  else
    letter.el.style.setProperty(
      '--fv',
      `"wght" ${Math.round(BASE_WEIGHT + EXTRA_WEIGHT * rounded)}, "SOFT" ${Math.round(SOFTNESS * rounded)}`,
    );
};

/**
 * Letters near a mouse pointer gain weight and softness (spec 5.3). Updates at most once per animation frame.
 * Letter centres are measured only after a resize or a font load, never on a move; the heavier letter is drawn
 * over a box of fixed width (hero.css), so the centres stay true. `live` says whether the effect may show.
 */
export function trackPointerWeight(h1: HTMLElement, live: () => boolean): { clear(): void; dispose(): void } {
  let letters: Letter[] = [];
  let dirty = true;
  let raf = 0;
  let at: { x: number; y: number } | null = null;
  const clear = (): void => {
    for (const letter of letters) weigh(letter, 0);
  };
  const flush = (): void => {
    raf = 0;
    if (!at || !live()) {
      clear();
      return;
    }
    if (dirty) {
      clear();
      letters = measure(h1);
      dirty = false;
    }
    const { x, y } = at;
    for (const letter of letters) weigh(letter, clamp(1 - Math.hypot(x - letter.x, y - letter.y) / RADIUS));
  };
  const move = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') return;
    at = { x: event.clientX, y: event.clientY };
    if (!raf) raf = requestAnimationFrame(flush);
  };
  const out = (event: PointerEvent): void => {
    if (event.relatedTarget) return;
    at = null;
    clear();
  };
  const invalidate = (): void => {
    dirty = true;
  };
  const observer = new ResizeObserver(invalidate);
  observer.observe(h1);
  const sticky = h1.closest('[data-sticky]');
  if (sticky) observer.observe(sticky);
  document.fonts?.ready.then(invalidate).catch(() => undefined);
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerout', out);
  return {
    clear,
    dispose() {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerout', out);
      at = null;
      clear();
    },
  };
}
