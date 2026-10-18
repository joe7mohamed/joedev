import { SHOT_TYPES, type ShotSources } from '@/lib/shot-files';
import { countOf, stepShown, targetOf } from './progress';

/** Prototype `landing()`: the halves lock, the mark waits, then flies onto the header's mark. */
const LOCK_MS = 420;
const LOCK_SNAP = { duration: 300, easing: 'cubic-bezier(.34,1.7,.5,1)' };
const FLY = { duration: 750, easing: 'cubic-bezier(.65,0,.35,1)' };
/** The page (and the hero build) is released this far into the fly. */
const RELEASE_MS = 250;
const BACKDROP_MS = 500;
const METER = { duration: 300, easing: 'ease-out', drop: 10 };
/** The header's words and buttons fade in once the mark has landed, as in the prototype. */
const HEADER_FADE = { delay: 200, duration: 600 };
const HEADER_TARGET = '[data-brand] svg';
const HEADER_REST = '[data-brand] > span, [data-menu], [data-controls]';

type Parts = {
  mark: SVGSVGElement;
  halves: SVGGElement[];
  count: HTMLElement;
  bar: HTMLElement;
  meter: HTMLElement;
};

const partsOf = (root: HTMLElement): Parts | null => {
  const mark = root.querySelector('svg');
  const count = root.querySelector<HTMLElement>('[data-loader-count] b');
  const bar = root.querySelector<HTMLElement>('[data-loader-track] u');
  const meter = root.querySelector<HTMLElement>('[data-loader-meter]');
  const halves = [...root.querySelectorAll<SVGGElement>('[data-half]')];
  return mark && count && bar && meter ? { mark, halves, count, bar, meter } : null;
};

/**
 * One job per screenshot, through a `<picture>` like the page's own (work/ShotPicture.tsx), so the browser picks the
 * same file, AVIF or WebP, and the page later finds it in the cache. It is never added to the document.
 */
const loadImage = ({ avif, fallback }: ShotSources): Promise<void> =>
  new Promise((resolve) => {
    const picture = document.createElement('picture');
    const source = document.createElement('source');
    source.type = SHOT_TYPES.avif;
    source.srcset = avif;
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    picture.append(source, image);
    image.src = fallback;
  });

const fontsReady = (): Promise<unknown> => document.fonts?.ready ?? Promise.resolve();

/** Counts finished jobs; a failed job counts as finished, so the loader never waits on it. */
const trackJobs = (images: ShotSources[]): { loaded(): number; total: number } => {
  const jobs = [fontsReady(), ...images.map(loadImage)];
  let loaded = 0;
  const count = (): void => {
    loaded += 1;
  };
  for (const job of jobs) job.then(count, count);
  return { loaded: () => loaded, total: jobs.length };
};

/**
 * The header's own mark stays hidden until the flying mark lands on it; its words and buttons fade in after.
 * These animations fill nothing and outlive the overlay, so the header always ends at its resting style.
 */
const holdHeader = (target: Element | null): void => {
  target?.animate([{ opacity: 0 }, { opacity: 0 }], { duration: FLY.duration });
  const total = FLY.duration + HEADER_FADE.delay + HEADER_FADE.duration;
  const hidden = { opacity: 0, offset: (FLY.duration + HEADER_FADE.delay) / total, easing: 'ease' };
  for (const el of document.querySelectorAll(HEADER_REST))
    el.animate([{ opacity: 0 }, hidden, { opacity: 1 }], { duration: total });
};

/** Releases the page: the loader overlay hides and the hero build plays. The head script already marked it seen. */
export const releasePage = (): void => {
  document.documentElement.classList.remove('loading');
};

type Box = { left: number; top: number; width: number; height: number };
const boxOf = ({ left, top, width, height }: DOMRect): Box => ({ left, top, width, height });
const centreOf = (r: Box): { x: number; y: number } => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

/** The translate and scale that put `from` onto `to`, both viewport rectangles. */
const flightTo = (from: Box, to: Box): string => {
  const a = centreOf(from);
  const b = centreOf(to);
  return `translate(${b.x - a.x}px, ${b.y - a.y}px) scale(${to.width / from.width})`;
};

/**
 * Runs the loading screen on its server-rendered overlay: counts real progress, locks the halves, flies the mark
 * onto the header's, releases the page (removes html.loading) and calls `done`, which removes the overlay. A
 * pointer or key press skips straight to the lock and the fly. Returns a cleanup that stops everything; releasing
 * the page when the loader goes away early is the caller's (Loader) job.
 */
export function runLoader(root: HTMLElement, images: ShotSources[], done: () => void): () => void {
  const html = document.documentElement;
  const parts = partsOf(root);
  if (!parts) {
    releasePage();
    done();
    return () => undefined;
  }
  const { mark, halves, count, bar, meter } = parts;
  const jobs = trackJobs(images);
  const animations: Animation[] = [];
  const timers: number[] = [];
  const start = performance.now();
  let last = start;
  let shown = 0;
  let raf = 0;
  let phase: 'count' | 'lock' | 'fly' = 'count';

  const play = (el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions): Animation => {
    const animation = el.animate(keyframes, options);
    animations.push(animation);
    return animation;
  };
  const later = (run: () => void, ms: number): void => {
    timers.push(window.setTimeout(run, ms));
  };
  const paint = (): void => {
    count.textContent = countOf(shown);
    bar.style.transform = `scaleX(${shown})`;
  };

  /** Stops everything this run started; the overlay is hidden from then on (it leaves the DOM with `done`). */
  const stop = (): void => {
    cancelAnimationFrame(raf);
    for (const timer of timers) window.clearTimeout(timer);
    for (const animation of animations) animation.cancel();
    window.removeEventListener('pointerdown', skip);
    window.removeEventListener('keydown', skip);
    root.removeAttribute('data-locked');
    root.removeAttribute('data-flying');
  };
  const finish = (): void => {
    stop();
    done();
  };

  /** The backdrop fades to the page and the counter drops away. */
  const fadeOverlay = (): void => {
    const from = getComputedStyle(root).backgroundColor;
    play(root, [{ backgroundColor: from }, { backgroundColor: 'transparent' }], {
      duration: BACKDROP_MS,
      fill: 'forwards',
    });
    play(meter, [{ opacity: 1 }, { opacity: 0, transform: `translateY(${METER.drop}px)` }], {
      ...METER,
      fill: 'forwards',
    });
  };

  /**
   * Flies the mark onto the header's. Releasing the page can move both ends (the scrollbar gutter the lock
   * reserved is gone where scrollbars are hidden), so `reaim`, called after the release, aims the flight again
   * from where the mark starts now to where the header's mark is now.
   */
  const launch = (target: Element | null): { flight: Animation; reaim(): void } => {
    const from = mark.getBoundingClientRect();
    const to = target?.getBoundingClientRect();
    if (!target || !to?.width) {
      const flight = play(mark, [{ opacity: 1 }, { opacity: 0 }], { ...FLY, fill: 'forwards' });
      return { flight, reaim: () => undefined };
    }
    const aim = (start: Box, end: Box): Keyframe[] => [
      { transform: 'none' },
      { transform: flightTo(start, end) },
    ];
    const flight = play(mark, aim(from, to), { ...FLY, fill: 'forwards' });
    // the mark sits in the middle of the overlay, so it moves with the overlay's centre
    const centre = centreOf(root.getBoundingClientRect());
    const reaim = (): void => {
      const now = target.getBoundingClientRect();
      const moved = centreOf(root.getBoundingClientRect());
      const start = {
        ...boxOf(from),
        left: from.left + moved.x - centre.x,
        top: from.top + moved.y - centre.y,
      };
      if (now.left !== to.left || now.top !== to.top || start.left !== from.left || start.top !== from.top)
        (flight.effect as KeyframeEffect).setKeyframes(aim(start, now));
    };
    return { flight, reaim };
  };

  const fly = (): void => {
    if (phase === 'fly') return;
    phase = 'fly';
    // the head script's 6 s safety timeout came first: the overlay is already hidden, so there is nothing to fly
    if (!html.classList.contains('loading')) {
      finish();
      return;
    }
    const target = document.querySelector(HEADER_TARGET);
    root.toggleAttribute('data-flying', true);
    holdHeader(target);
    fadeOverlay();
    const { flight, reaim } = launch(target);
    later(() => {
      releasePage();
      reaim();
    }, RELEASE_MS);
    flight.finished.then(finish, () => undefined);
  };

  const lock = (wait: number): void => {
    phase = 'lock';
    shown = 1;
    paint();
    // read where the searching halves are before the lock stops their loop, then snap them home from there
    const from = halves.map((half) => getComputedStyle(half).transform);
    root.toggleAttribute('data-locked', true);
    halves.forEach((half, i) => {
      play(half, [{ transform: from[i] ?? 'none' }, { transform: 'none' }], LOCK_SNAP);
    });
    later(fly, wait);
  };

  const tick = (now: number): void => {
    // the safety timeout came first (a very slow start): the overlay is already hidden
    if (!html.classList.contains('loading')) {
      finish();
      return;
    }
    const target = targetOf({
      loaded: jobs.loaded(),
      total: jobs.total,
      sinceStart: now - start,
      pageTime: now,
    });
    shown = stepShown(shown, target, now - last);
    last = now;
    paint();
    if (shown < 1) raf = requestAnimationFrame(tick);
    else lock(LOCK_MS);
  };

  const skip = (): void => {
    if (phase === 'count') {
      cancelAnimationFrame(raf);
      lock(0);
    } else if (phase === 'lock') fly();
  };

  raf = requestAnimationFrame(tick);
  window.addEventListener('pointerdown', skip);
  window.addEventListener('keydown', skip);
  return stop;
}
