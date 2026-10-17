import { afterEach, describe, expect, it, vi } from 'vitest';

type Fake = ReturnType<typeof fakePage>;

/** A page with one pinned hero section, a manual animation-frame queue and a mutable <html> class list. */
const fakePage = () => {
  const classes = new Set<string>();
  const frames: (() => void)[] = [];
  const writes: string[] = [];
  const attributes = new Map<string, string>();
  const section = {
    dataset: {} as Record<string, string>,
    style: {
      setProperty: (name: string, value: string) => writes.push(`${name}=${value}`),
      removeProperty: (name: string) => writes.push(`-${name}`),
    },
    setAttribute: (name: string, value: string) => {
      attributes.set(name, value);
      writes.push(`${name}=${value}`);
    },
    removeAttribute: (name: string) => attributes.delete(name),
    hasAttribute: (name: string) => attributes.has(name),
    getBoundingClientRect: () => ({ top: 0, height: 1800 }),
    previousElementSibling: null,
    nextElementSibling: null,
  };
  const sticky = { children: [], getBoundingClientRect: () => ({ height: 900 }) };
  let watcher: (() => void) | null = null;
  vi.stubGlobal('window', {
    scrollY: 0,
    innerHeight: 900,
    requestAnimationFrame: (fn: () => void) => frames.push(fn),
    cancelAnimationFrame: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  });
  vi.stubGlobal('document', {
    documentElement: { classList: { contains: (c: string) => classes.has(c) } },
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  });
  vi.stubGlobal('requestAnimationFrame', (fn: () => void) => frames.push(fn));
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    'MutationObserver',
    class {
      constructor(callback: () => void) {
        watcher = callback;
      }
      observe() {}
      disconnect() {
        watcher = null;
      }
    },
  );
  const flush = (): void => {
    for (let i = 0; i < 20 && frames.length > 0; i++) for (const fn of frames.splice(0)) fn();
  };
  const release = (): void => {
    classes.delete('loading');
    watcher?.();
  };
  return { classes, writes, section, sticky, flush, release };
};

const startEngine = async (page: Fake) => {
  vi.resetModules();
  const { engine } = await import('./engine');
  engine.register('hero', page.section as never, page.sticky as never);
  engine.start();
  return engine;
};

describe('engine', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('writes a scene value only when it changed', async () => {
    const page = fakePage();
    const engine = await startEngine(page);
    page.flush();
    const first = page.writes.length;
    expect(first).toBeGreaterThan(0);
    engine.invalidate();
    page.flush();
    expect(page.writes.length).toBe(first);
    engine.stop();
  });

  it('writes nothing while the loading screen holds the page, then catches up once it is released', async () => {
    const page = fakePage();
    page.classes.add('loading');
    const engine = await startEngine(page);
    const seen = vi.fn();
    engine.subscribe(seen);
    page.flush();
    expect(page.writes).toEqual([]);
    expect(seen).not.toHaveBeenCalled();
    page.release();
    page.flush();
    expect(page.writes).toContain('--p=0.0000');
    expect(seen).toHaveBeenCalled();
    engine.stop();
  });

  it('reports a failing listener and still calls the others (spec 6.5)', async () => {
    const page = fakePage();
    const reported = vi.fn();
    vi.stubGlobal('reportError', reported);
    const engine = await startEngine(page);
    const failure = new Error('island failed');
    engine.subscribe(() => {
      throw failure;
    });
    const after = vi.fn();
    engine.subscribe(after);
    page.flush();
    expect(reported).toHaveBeenCalledWith(failure);
    expect(after).toHaveBeenCalled();
    engine.stop();
  });
});
