import { describe, expect, it } from 'vitest';
import { initialTyper, stepTyper, textOf } from './typer';

const texts = ['ab', 'xyz'];
const run = (steps: number) => {
  let state = initialTyper;
  const seen: string[] = [];
  for (let i = 0; i < steps; i++) {
    state = stepTyper(state, texts).state;
    seen.push(`${state.phase}:${textOf(state, texts)}`);
  }
  return seen;
};

describe('typer', () => {
  it('types, holds, deletes, then moves to the next text and loops', () => {
    expect(run(12)).toEqual([
      'typing:a',
      'holding:ab',
      'deleting:ab',
      'deleting:a',
      'waiting:',
      'typing:x',
      'typing:xy',
      'holding:xyz',
      'deleting:xyz',
      'deleting:xy',
      'deleting:x',
      'waiting:',
    ]);
  });
  it('returns to the first text after the last', () => {
    expect(run(13)[12]).toBe('typing:a');
  });
  it('uses a long delay only while holding', () => {
    let state = initialTyper;
    const delays: number[] = [];
    for (let i = 0; i < 3; i++) {
      const next = stepTyper(state, texts);
      state = next.state;
      delays.push(next.delay);
    }
    expect(delays[1]).toBe(3000);
    expect(delays[0]).toBeLessThan(120);
  });
  it('copes with a single text and with an empty list', () => {
    expect(stepTyper(initialTyper, ['a']).state.phase).toBe('holding');
    expect(textOf(initialTyper, [])).toBe('');
    expect(() => stepTyper(initialTyper, [])).not.toThrow();
  });
});
