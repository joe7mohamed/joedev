import { describe, expect, it } from 'vitest';
import { themeScript } from './theme-script';

type Env = {
  stored?: string | null;
  light?: boolean;
  motion?: boolean;
  seen?: boolean;
  storageThrows?: boolean;
};

/** Runs the head script against a fake page and returns what it left on <html> and the timers it set. */
const run = ({ stored = null, light = false, motion = true, seen = false, storageThrows = false }: Env) => {
  const classes = new Set<string>();
  const html = {
    dataset: {} as Record<string, string>,
    classList: {
      add: (c: string) => classes.add(c),
      remove: (c: string) => classes.delete(c),
      contains: (c: string) => classes.has(c),
    },
  };
  const timers: { run: () => void; ms: number }[] = [];
  const written: Record<string, string> = {};
  const storage = (value: string | null) => ({
    getItem: () => {
      if (storageThrows) throw new Error('blocked');
      return value;
    },
    setItem: (key: string, v: string) => {
      if (storageThrows) throw new Error('blocked');
      written[key] = v;
    },
  });
  const matchMedia = (query: string) => ({
    matches: query.includes('color-scheme: light') ? light : query.includes('no-preference') ? motion : false,
  });
  new Function('document', 'localStorage', 'sessionStorage', 'matchMedia', 'setTimeout', themeScript)(
    { documentElement: html },
    storage(stored),
    storage(seen ? '1' : null),
    matchMedia,
    (fn: () => void, ms: number) => timers.push({ run: fn, ms }),
  );
  return { html, classes, timers, written };
};

describe('head script', () => {
  it('keeps the stored theme, then the system theme, then dark', () => {
    expect(run({ stored: 'light' }).html.dataset.theme).toBe('light');
    expect(run({ light: true }).html.dataset.theme).toBe('light');
    expect(run({}).html.dataset.theme).toBe('dark');
  });

  it('shows the loader on the first visit of the session when motion is allowed', () => {
    const { classes, timers } = run({});
    expect(classes.has('intro')).toBe(true);
    expect(classes.has('loading')).toBe(true);
    expect(timers.map((t) => t.ms)).toEqual([6000]);
  });

  it('marks the loader seen for the session as soon as it shows', () => {
    expect(run({}).written).toEqual({ 'zk-intro': '1' });
    expect(run({ seen: true }).written).toEqual({});
    expect(run({ motion: false }).written).toEqual({});
  });

  it('removes the loader after 6 s even if no app script ever runs', () => {
    const { classes, timers } = run({});
    for (const timer of timers) timer.run();
    expect(classes.has('loading')).toBe(false);
    expect(classes.has('intro')).toBe(true);
  });

  it('shows no loader once it has been seen in this session', () => {
    const { classes, timers } = run({ seen: true });
    expect(classes.has('loading')).toBe(false);
    expect(classes.has('intro')).toBe(true);
    expect(timers).toEqual([]);
  });

  it('shows no loader and no intro with reduced motion', () => {
    const { classes, timers } = run({ motion: false });
    expect(classes.has('loading')).toBe(false);
    expect(classes.has('intro')).toBe(false);
    expect(timers).toEqual([]);
  });

  it('treats unreadable storage as seen', () => {
    const { html, classes, timers } = run({ storageThrows: true });
    expect(classes.has('loading')).toBe(false);
    expect(classes.has('intro')).toBe(true);
    expect(html.dataset.theme).toBe('dark');
    expect(timers).toEqual([]);
  });
});
