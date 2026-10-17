import { type HomeContent, plain } from '@zakydev/shared';

/** ISO 3166 code of the country the person works from (spec: Bahrain). */
const COUNTRY = 'BH';

export interface PersonLd {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  alternateName: string;
  jobTitle: string;
  email: string;
  address: { '@type': 'PostalAddress'; addressCountry: string };
  sameAs: string[];
  url: string;
}

/** schema.org Person for the home page, every value from the shared content. */
export const personLd = (content: HomeContent, url: string): PersonLd => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: content.site.name,
  alternateName: content.site.brand,
  jobTitle: plain(content.hero.titles[0] ?? ''),
  email: `mailto:${content.contact.email}`,
  address: { '@type': 'PostalAddress', addressCountry: COUNTRY },
  sameAs: [content.contact.github, content.contact.linkedin],
  url,
});

/** JSON for a <script> element: `<` is escaped, so no string can close the element. */
export const serializeLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');
