export type TyperState = {
  index: number;
  shown: number;
  phase: 'typing' | 'holding' | 'deleting' | 'waiting';
};
export const initialTyper: TyperState = { index: 0, shown: 0, phase: 'typing' };

const TYPE_MS = 64;
const HOLD_MS = 3000;
const DELETE_MS = 26;
const WAIT_MS = 380;

export const textOf = (state: TyperState, texts: string[]): string =>
  (texts[state.index] ?? '').slice(0, state.shown);

/** One tick of the title animation. `delay` is how long to wait before the next tick. */
export const stepTyper = (state: TyperState, texts: string[]): { state: TyperState; delay: number } => {
  const full = (texts[state.index] ?? '').length;
  if (texts.length === 0) return { state, delay: HOLD_MS };
  if (state.phase === 'typing') {
    const shown = Math.min(full, state.shown + 1);
    return shown >= full
      ? { state: { ...state, shown, phase: 'holding' }, delay: HOLD_MS }
      : { state: { ...state, shown }, delay: TYPE_MS };
  }
  if (state.phase === 'holding') return { state: { ...state, phase: 'deleting' }, delay: DELETE_MS };
  if (state.phase === 'deleting') {
    const shown = state.shown - 1;
    return shown <= 0
      ? { state: { ...state, shown: 0, phase: 'waiting' }, delay: WAIT_MS }
      : { state: { ...state, shown }, delay: DELETE_MS };
  }
  return {
    state: { index: (state.index + 1) % texts.length, shown: 1, phase: full === 0 ? 'waiting' : 'typing' },
    delay: TYPE_MS,
  };
};
