/** The loading screen's arithmetic (prototype `landing()`), as pure functions of time and finished jobs. */

/** The counter never runs ahead of this much time since the loader started, so it always visibly counts. */
const MIN_MS = 900;
/**
 * After this long on the page clock the loader stops waiting and reads 1. Counted from navigation start, so the
 * lock (420 ms) and the start of the fly (250 ms) always fall before the head script's own 6 s timeout.
 */
const GIVE_UP_MS = 5000;
/** The shown value eases 16% of the way to its target per 60 Hz frame, and snaps to 1 above 0.992. */
const EASE = 0.16;
const SNAP = 0.992;
const FRAME_MS = 1000 / 60;

export type LoadState = {
  /** Jobs finished (fonts, screenshots). */
  loaded: number;
  total: number;
  /** ms since the loader started. */
  sinceStart: number;
  /** ms on the page clock (performance.now()). */
  pageTime: number;
};

/** What the counter heads for: the share of finished jobs, capped by the minimum time; 1 once it gives up. */
export const targetOf = ({ loaded, total, sinceStart, pageTime }: LoadState): number => {
  if (pageTime >= GIVE_UP_MS) return 1;
  const share = total > 0 ? loaded / total : 1;
  return Math.min(1, share, sinceStart / MIN_MS);
};

/** Moves the shown value toward the target over `dt` ms at the same pace at any frame rate. */
export const stepShown = (shown: number, target: number, dt: number): number => {
  const next = shown + (target - shown) * (1 - (1 - EASE) ** (dt / FRAME_MS));
  return target === 1 && next > SNAP ? 1 : next;
};

/** The counter's digits: two at least, `00` to `100`. */
export const countOf = (shown: number): string => String(Math.round(shown * 100)).padStart(2, '0');
