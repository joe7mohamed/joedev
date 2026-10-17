import { getHome } from '@zakydev/shared';
import { describe, expect, it } from 'vitest';
import { personLd, serializeLd } from './structured-data';

describe('personLd', () => {
  it('describes the person from the shared content', () => {
    expect(personLd(getHome('en'), 'https://zakydev.com')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Youssef Zaky',
      alternateName: 'ZakyDev',
      jobTitle: 'Software engineer',
      email: 'mailto:youssef@zakydev.com',
      address: { '@type': 'PostalAddress', addressCountry: 'BH' },
      sameAs: ['https://github.com/joe7mohamed', 'https://linkedin.com/in/youssef7mohamed'],
      url: 'https://zakydev.com',
    });
  });

  it('takes the job title in the page language', () => {
    expect(personLd(getHome('ar'), 'https://zakydev.com').jobTitle).toBe('مهندس برمجيات');
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
