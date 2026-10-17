import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { getHome, home, homeContentSchema, plain, unconfirmedPaths } from './index';

describe('home content', () => {
  it('is valid in both locales', () => {
    expect(() => homeContentSchema.parse(home.en)).not.toThrow();
    expect(() => homeContentSchema.parse(home.ar)).not.toThrow();
  });
  it('has the same shape in both locales', () => {
    expect(home.ar.projects.map((p) => p.id)).toEqual(home.en.projects.map((p) => p.id));
    expect(home.ar.process.steps).toHaveLength(5);
    expect(home.en.process.steps).toHaveLength(5);
    expect(home.ar.about.loop).toHaveLength(7);
    expect(home.en.hero.rotating).toHaveLength(home.ar.hero.rotating.length);
  });
  it('uses the agreed headline and email', () => {
    const words = (l: 'en' | 'ar') =>
      home[l].hero.headline
        .flat()
        .map((w) => w.t)
        .join(' ');
    expect(words('en')).toBe('I build software that holds up under pressure.');
    expect(words('ar')).toBe('أبني برمجيات تصمد تحت الضغط.');
    expect(home.en.contact.email).toBe('youssef@zakydev.com');
  });
  it('marks exactly one zoom word per headline', () => {
    for (const l of ['en', 'ar'] as const) {
      expect(home[l].hero.headline.flat().filter((w) => w.key)).toHaveLength(1);
    }
  });
  it('rejects content with a missing field', () => {
    const broken = structuredClone(home.ar) as Record<string, unknown>;
    delete (broken.hero as Record<string, unknown>).headline;
    expect(() => homeContentSchema.parse(broken)).toThrow();
  });
  it('names the section menu in both locales', () => {
    expect(plain(home.en.nav.sections)).toBe('Sections');
    expect(plain(home.ar.nav.sections)).toBe('الأقسام');
  });
  it('names the live badge of the build drawing in both locales', () => {
    expect(plain(home.en.process.live)).toBe('LIVE');
    expect(plain(home.ar.process.live)).toBe('LIVE');
  });
  it('labels each project diagram in both locales', () => {
    const counts = { 'request-path': 3, 'provider-fallback': 3, 'server-sync': 1 } as const;
    for (const l of ['en', 'ar'] as const) {
      for (const p of home[l].projects) expect(p.diagramLabels).toHaveLength(counts[p.diagram]);
    }
    expect(home.en.projects[0]?.diagramLabels).toEqual(['NEXT.JS', 'NESTJS', 'MYSQL']);
  });
  it('labels the about card drawings in both locales', () => {
    for (const l of ['en', 'ar'] as const) {
      const labels = home[l].about.sceneLabels;
      expect(labels.coordinates).toBe('26.07°N 50.56°E');
      expect(plain(labels.healthcare)).toBe('HEALTHCARE → CODE');
      expect(labels.circuit).toBe('BIC · SINCE 2019');
      expect(labels.games.map(plain)).toEqual(['LOL', 'VALORANT', 'TFT']);
    }
    expect(unconfirmedPaths(home.en)).toContain('about.sceneLabels.games[0]');
    expect(unconfirmedPaths(home.ar)).toContain('about.sceneLabels.healthcare');
  });
  it('names the profile links with their brand names in both locales', () => {
    for (const l of ['en', 'ar'] as const) {
      expect(home[l].contact.githubLabel).toBe('GitHub');
      expect(home[l].contact.linkedinLabel).toBe('LinkedIn');
    }
  });
  it('never compiles its parsers with eval (the site sends a CSP without unsafe-eval)', () => {
    expect(z.config().jitless).toBe(true);
  });
  it('names the person, the brand and the domain the same way in both locales', () => {
    for (const l of ['en', 'ar'] as const) {
      expect(home[l].site).toEqual({ name: 'Youssef Zaky', brand: 'ZakyDev', domain: 'zakydev.com' });
    }
  });
  it('rejects diagram labels that do not fit their drawing', () => {
    const broken = structuredClone(home.en) as unknown as { projects: { diagramLabels: string[] }[] };
    (broken.projects[2] as { diagramLabels: string[] }).diagramLabels = ['SERVER', 'EXTRA'];
    expect(() => homeContentSchema.parse(broken)).toThrow();
  });
  it('rejects an empty string', () => {
    const broken = structuredClone(home.ar) as Record<string, unknown>;
    (broken.nav as Record<string, unknown>).work = '';
    expect(() => homeContentSchema.parse(broken)).toThrow();
    const brokenStep = structuredClone(home.ar);
    const firstStep = brokenStep.process.steps[0];
    if (!firstStep) throw new Error('expected a first process step');
    firstStep.tools = [''];
    expect(() => homeContentSchema.parse(brokenStep)).toThrow();
  });
  it('lists unconfirmed text and can refuse it', () => {
    expect(unconfirmedPaths(home.en).length).toBeGreaterThan(0);
    expect(() => getHome('en', { requireConfirmed: true })).toThrow(/unconfirmed/i);
    expect(getHome('en').hero.place).toBeDefined();
  });
});
