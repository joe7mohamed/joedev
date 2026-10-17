import { type HomeContent, type Locale, plain } from '@zakydev/shared';

/** ISO 3166 code of the country the person works from (spec: Bahrain). */
const COUNTRY = 'BH';
/** The languages the person works in (about.facts, "I work in Arabic and English"), as BCP 47 tags. */
const LANGUAGES = ['ar', 'en'];

export interface PersonLd {
  '@type': 'Person';
  name: string;
  alternateName: string[];
  jobTitle: string;
  email: string;
  address: { '@type': 'PostalAddress'; addressLocality: string; addressCountry: string };
  knowsLanguage: string[];
  knowsAbout: string[];
  image: string;
  sameAs: string[];
  url: string;
}

export interface ProfilePageLd {
  '@context': 'https://schema.org';
  '@type': 'ProfilePage';
  url: string;
  inLanguage: Locale;
  mainEntity: PersonLd;
}

/** Where the page and the person live: the page's canonical URL, the site's root and the page's sharing image. */
export interface LdUrls {
  locale: Locale;
  pageUrl: string;
  siteUrl: string;
  imageUrl: string;
}

/** How the content joins a technology and a detail of it in one tool chip ("PostgreSQL · RLS"). */
const JOINER = ' · ';
/**
 * Tool names in the content that are not technologies on their own: a practice ("Server-owned state") and a feature
 * of a technology already listed ("RLS", PostgreSQL's row-level security).
 */
export const NOT_TECHNOLOGIES: ReadonlySet<string> = new Set(['Server-owned state', 'RLS']);

/**
 * The technologies named by the projects and the process steps: joined chips split, practices and features left
 * out, each once, in the order they first appear.
 */
export const knowsAbout = (content: HomeContent): string[] => [
  ...new Set(
    [...content.projects.flatMap((p) => p.tools), ...content.process.steps.flatMap((s) => s.tools)]
      .flatMap((tool) => tool.split(JOINER))
      .filter((name) => !NOT_TECHNOLOGIES.has(name)),
  ),
];

/** schema.org ProfilePage of the home page, its Person the main entity; every value from the shared content. */
export const profilePageLd = (content: HomeContent, urls: LdUrls): ProfilePageLd => {
  const { site } = content;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: urls.pageUrl,
    inLanguage: urls.locale,
    mainEntity: {
      '@type': 'Person',
      name: site.name,
      // the Latin name only where the page names the person in another script
      alternateName: [...(site.latinName === site.name ? [] : [site.latinName]), site.brand],
      jobTitle: plain(content.hero.titles[0] ?? ''),
      email: `mailto:${content.contact.email}`,
      address: { '@type': 'PostalAddress', addressLocality: site.city, addressCountry: COUNTRY },
      knowsLanguage: LANGUAGES,
      knowsAbout: knowsAbout(content),
      image: urls.imageUrl,
      sameAs: [content.contact.github, content.contact.linkedin],
      url: urls.siteUrl,
    },
  };
};

/** JSON for a <script> element: `<` is escaped, so no string can close the element. */
export const serializeLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');
