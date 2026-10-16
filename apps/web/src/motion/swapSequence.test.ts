import { describe, expect, it } from 'vitest';
import { type Animatable, runSwap } from './swapSequence';

/** A fake element whose animations settle only when the test says so; cancelling rejects, like the browser. */
const fakeElement = () => {
  const pending: { resolve(): void; reject(): void }[] = [];
  const el: Animatable = {
    getAnimations: () => [],
    animate: () => {
      let resolve = () => {};
      let reject = () => {};
      const finished = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      finished.catch(() => {});
      pending.push({ resolve, reject });
      return { finished, cancel: () => reject() };
    },
  };
  return { el, pending };
};
const flush = () => new Promise((r) => setTimeout(r, 0));

describe('runSwap', () => {
  it('commits the value once the flip-out finishes', async () => {
    const { el, pending } = fakeElement();
    const seen: string[] = [];
    runSwap(el, 'B', (v) => seen.push(v));
    pending[0]?.resolve();
    await flush();
    expect(seen).toEqual(['B']);
  });
  it('never commits B after C was requested (A to B to C)', async () => {
    const { el, pending } = fakeElement();
    const seen: string[] = [];
    const cancelB = runSwap(el, 'B', (v) => seen.push(v));
    cancelB();
    runSwap(el, 'C', (v) => seen.push(v));
    await flush();
    pending[1]?.resolve();
    await flush();
    expect(seen).toEqual(['C']);
  });
  it('commits when the animation fails without being cancelled', async () => {
    const { el, pending } = fakeElement();
    const seen: string[] = [];
    runSwap(el, 'B', (v) => seen.push(v));
    pending[0]?.reject();
    await flush();
    expect(seen).toEqual(['B']);
  });
});
