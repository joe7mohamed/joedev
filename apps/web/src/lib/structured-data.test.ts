import { getHome } from '@zakydev/shared';
import { describe, expect, it } from 'vitest';
import { knowsAbout, profilePageLd, serializeLd } from './structured-data';

const TOOLS = [
  'Next.js',
  'NestJS',
  'Prisma',
  'MySQL',
  'Docker',
  'GitHub Actions',
  'Supabase',
  'PostgreSQL',
  'Vercel AI SDK',
  'Supabase Realtime',
  'Vitest',
  'Playwright',
  'Vercel',
];

describe('profilePageLd', () => {
  it('describes the English page and the person from the shared content', () => {
    expect(
      profilePageLd(getHome('en'), {
        locale: 'en',
        pageUrl: 'https://zakydev.com',
        siteUrl: 'https://zakydev.com',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      url: 'https://zakydev.com',
      inLanguage: 'en',
      mainEntity: {
        '@type': 'Person',
        name: 'Youssef Zaky',
        alternateName: ['ZakyDev'],
        jobTitle: 'Software engineer',
        email: 'mailto:youssef@zakydev.com',
        address: { '@type': 'PostalAddress', addressLocality: 'Manama', addressCountry: 'BH' },
        knowsLanguage: ['ar', 'en'],
        knowsAbout: TOOLS,
        sameAs: ['https://github.com/joe7mohamed', 'https://linkedin.com/in/youssef7mohamed'],
        url: 'https://zakydev.com',
      },
    });
  });

  it('names the person in Arabic on the Arabic page, with the Latin name as an alternate', () => {
    const ld = profilePageLd(getHome('ar'), {
      locale: 'ar',
      pageUrl: 'https://zakydev.com/ar',
      siteUrl: 'https://zakydev.com',
    });
    expect(ld.url).toBe('https://zakydev.com/ar');
    expect(ld.inLanguage).toBe('ar');
    expect(ld.mainEntity.name).toBe('يوسف زكي');
    expect(ld.mainEntity.alternateName).toEqual(['Youssef Zaky', 'ZakyDev']);
    expect(ld.mainEntity.jobTitle).toBe('مهندس برمجيات');
    expect(ld.mainEntity.address.addressLocality).toBe('المنامة');
    // no image until there is a portrait: the sharing card is text, not a picture of the person (review, Minor 4)
    expect(ld.mainEntity).not.toHaveProperty('image');
    // the person's own address is the site, the same on both pages
    expect(ld.mainEntity.url).toBe('https://zakydev.com');
  });
});

describe('knowsAbout', () => {
  it('lists every tool of the projects and the steps once, in order of first use', () => {
    expect(knowsAbout(getHome('en'))).toEqual(TOOLS);
    expect(knowsAbout(getHome('ar'))).toEqual(TOOLS);
  });

  it('names technologies only: joined entries are split, what the content marks as no technology is left out', () => {
    for (const l of ['en', 'ar'] as const) {
      const list = knowsAbout(getHome(l));
      expect(list.filter((name) => name.includes(' · '))).toEqual([]);
      expect(list.filter((name) => getHome(l).nonTechnologies.includes(name))).toEqual([]);
      expect(new Set(list).size).toBe(list.length);
    }
    // the content does hold both kinds, so the filter is doing work
    const raw = getHome('en').projects.flatMap((p) => p.tools);
    expect(raw).toContain('PostgreSQL · RLS');
    expect(raw).toContain('Server-owned state');
  });
});

describe('serializeLd', () => {
  it('never lets a string close the script element', () => {
    const data = { name: '</script><script>alert(1)</script>' };
    const out = serializeLd(data);
    expect(out).not.toContain('<');
    expect(JSON.parse(out)).toEqual(data);
  });
});
