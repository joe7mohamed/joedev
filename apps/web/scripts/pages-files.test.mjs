import { describe, expect, it } from 'vitest';
import { missingFrom, REQUIRED } from './pages-files.mjs';

describe('missingFrom', () => {
  it('requires both home pages, the 404 page Pages needs to answer 404, and what the pages link', () => {
    for (const file of [
      'index.html',
      'ar.html',
      '404.html',
      'opengraph-image',
      'ar/opengraph-image',
      'sitemap.xml',
    ])
      expect(REQUIRED).toContain(file);
  });

  it('names every required file the export lacks, and nothing when all are there', () => {
    expect(missingFrom('/out', () => true)).toEqual([]);
    expect(missingFrom('/out', (path) => path !== '/out/404.html')).toEqual(['404.html']);
  });
});
