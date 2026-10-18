import { describe, expect, it } from 'vitest';
import { homePath, localeOf, segmentsOf } from './home-path';

// Pages round (owner decision 2026-10-18): both home pages are real routes of app/[[...locale]], with no rewrite.
describe('segmentsOf', () => {
  it('gives English no segment, so it is the root route, and Arabic the one segment ar', () => {
    expect(segmentsOf('en')).toEqual([]);
    expect(segmentsOf('ar')).toEqual(['ar']);
  });

  it('matches homePath', () => {
    for (const locale of ['en', 'ar'] as const)
      expect(`/${segmentsOf(locale).join('/')}`).toBe(homePath(locale));
  });
});

describe('localeOf', () => {
  it('reads the root as English and /ar as Arabic', () => {
    expect(localeOf(undefined)).toBe('en');
    expect(localeOf([])).toBe('en');
    expect(localeOf(['ar'])).toBe('ar');
  });

  it('is null for every other address, so it is a 404: /en is a redirect, never a page', () => {
    for (const segments of [['en'], ['fr'], ['ar', 'x'], ['en', 'x'], ['']])
      expect(localeOf(segments), segments.join('/')).toBeNull();
  });
});
