import { describe, expect, it } from 'vitest';
import { homePath } from './home-path';
import { homeUrl, siteUrl } from './site';

// Owner decision 2026-10-17: English lives at the plain domain, Arabic at /ar.
describe('homePath', () => {
  it('puts English at the plain domain and Arabic at /ar', () => {
    expect(homePath('en')).toBe('/');
    expect(homePath('ar')).toBe('/ar');
  });
});

describe('homeUrl', () => {
  it('is the absolute address of each home page, the root written as Next writes the canonical (no slash)', () => {
    expect(homeUrl('en')).toBe(siteUrl);
    expect(homeUrl('ar')).toBe(`${siteUrl}/ar`);
  });
});
