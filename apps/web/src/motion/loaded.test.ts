import { describe, expect, it } from 'vitest';
import { whenLoaded } from './loaded';

/** A fake <html> whose class list can change, and a MutationObserver that reports those changes. */
const page = (loading: boolean) => {
  const classes = new Set(loading ? ['intro', 'loading'] : ['intro']);
  const observers = new Set<() => void>();
  const root = { classList: { contains: (c: string) => classes.has(c) } };
  class Observer {
    constructor(private readonly callback: () => void) {}
    observe(): void {
      observers.add(this.callback);
    }
    disconnect(): void {
      observers.delete(this.callback);
    }
  }
  const clear = (): void => {
    classes.delete('loading');
    for (const notify of [...observers]) notify();
  };
  return { root, Observer, clear, observers };
};

describe('whenLoaded', () => {
  it('runs at once from the page clock origin when no loader is showing', () => {
    const { root, Observer } = page(false);
    const seen: number[] = [];
    whenLoaded(
      (at) => seen.push(at),
      root,
      () => 1234,
      Observer,
    );
    expect(seen).toEqual([0]);
  });

  it('waits for the loader to clear and reports when it did', () => {
    const { root, Observer, clear, observers } = page(true);
    const seen: number[] = [];
    let clock = 500;
    whenLoaded(
      (at) => seen.push(at),
      root,
      () => clock,
      Observer,
    );
    expect(seen).toEqual([]);
    clock = 2100;
    clear();
    expect(seen).toEqual([2100]);
    expect(observers.size).toBe(0);
  });

  it('ignores class changes that leave the loader showing', () => {
    const { root, Observer, observers } = page(true);
    const seen: number[] = [];
    whenLoaded(
      (at) => seen.push(at),
      root,
      () => 0,
      Observer,
    );
    for (const notify of [...observers]) notify();
    expect(seen).toEqual([]);
  });

  it('never runs once cancelled', () => {
    const { root, Observer, clear, observers } = page(true);
    const seen: number[] = [];
    const cancel = whenLoaded(
      (at) => seen.push(at),
      root,
      () => 0,
      Observer,
    );
    cancel();
    clear();
    expect(seen).toEqual([]);
    expect(observers.size).toBe(0);
  });
});
