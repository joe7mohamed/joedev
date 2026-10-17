import { afterEach, describe, expect, it, vi } from 'vitest';

const load = async (flag: string | undefined, search: string) => {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_E2E', flag);
  vi.stubGlobal('window', { location: { search } });
  return import('./e2e');
};

describe('e2e switches', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('reads query parameters only in an E2E build', async () => {
    const e2e = await load('1', '?bg=soft');
    expect(e2e.isE2E).toBe(true);
    expect(e2e.param('bg')).toBe('soft');
    expect(e2e.param('freeze')).toBeNull();
  });

  it('ignores them in any other build', async () => {
    const e2e = await load(undefined, '?bg=soft');
    expect(e2e.isE2E).toBe(false);
    expect(e2e.param('bg')).toBeNull();
  });
});
