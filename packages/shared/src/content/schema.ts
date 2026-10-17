import { z } from 'zod';
import type { Text } from '../text';

// No JIT: zod probes for it with `Function("")`, which the site's Content-Security-Policy (no 'unsafe-eval') reports
// as a violation wherever this module runs in the browser.
z.config({ jitless: true });

export const text: z.ZodType<Text> = z.union([
  z.string().min(1),
  z.object({ text: z.string().min(1), unconfirmed: z.literal(true) }),
]);

const word = z.object({ t: z.string().min(1), key: z.boolean().optional(), gold: z.boolean().optional() });
const label = z.string().min(1);
/** Each "how it works" drawing with exactly the words it places (prototype app.js SIGS), in drawing order. */
const diagrams = {
  'request-path': z.tuple([label, label, label]),
  'provider-fallback': z.tuple([label, label, label]),
  'server-sync': z.tuple([label]),
} as const;

const projectFields = {
  id: z.enum(['nuammer', 'wazifi', 'talmeeha']),
  name: z.string().min(1),
  url: z.url(),
  image: z.string().min(1),
  imageAlt: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  meta: z.tuple([z.string().min(1), text, z.string().min(1)]),
  caption: z.string().min(1),
  tools: z.array(z.string().min(1)).min(1),
};

export const homeContentSchema = z.object({
  nav: z.object({
    work: z.string().min(1),
    process: z.string().min(1),
    about: z.string().min(1),
    contact: z.string().min(1),
    switchLanguage: z.string().min(1),
    switchTheme: z.string().min(1),
    skip: z.string().min(1),
    sections: text,
  }),
  hero: z.object({
    titles: z.array(text).min(1),
    place: z.string().min(1),
    availability: text,
    headline: z.array(z.array(word).min(1)).min(1),
    sentence: z.string().min(1),
    rotating: z.array(z.string().min(1)).min(2),
    steps: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
    primary: z.string().min(1),
    secondary: z.string().min(1),
    scroll: z.string().min(1),
  }),
  work: z.object({ label: z.string().min(1), visit: z.string().min(1) }),
  projects: z
    .array(
      z.discriminatedUnion('diagram', [
        z.object({
          ...projectFields,
          diagram: z.literal('request-path'),
          diagramLabels: diagrams['request-path'],
        }),
        z.object({
          ...projectFields,
          diagram: z.literal('provider-fallback'),
          diagramLabels: diagrams['provider-fallback'],
        }),
        z.object({
          ...projectFields,
          diagram: z.literal('server-sync'),
          diagramLabels: diagrams['server-sync'],
        }),
      ]),
    )
    .length(3),
  process: z.object({
    label: z.string().min(1),
    youGet: z.string().min(1),
    /** The badge the build drawing shows once the app is live (prototype index.html line 102). */
    live: text,
    steps: z
      .array(
        z.object({
          name: z.string().min(1),
          sentence: z.string().min(1),
          gives: text,
          tools: z.array(z.string().min(1)),
        }),
      )
      .length(5),
  }),
  about: z.object({
    label: z.string().min(1),
    heading: z.string().min(1),
    loop: z.array(z.object({ name: z.string().min(1), tools: text })).length(7),
    facts: z
      .array(
        z.object({ id: z.enum(['place', 'job', 'marshal', 'games']), label: z.string().min(1), body: text }),
      )
      .length(4),
    /** The words drawn inside the card scenes (prototype app.js FACT_ICONS); game names are text only (spec 5.6). */
    sceneLabels: z.object({
      coordinates: z.string().min(1),
      healthcare: text,
      circuit: z.string().min(1),
      games: z.tuple([text, text, text]),
    }),
    disclaimer: z.string().min(1),
  }),
  contact: z.object({
    label: z.string().min(1),
    heading: z.string().min(1),
    sentence: z.string().min(1),
    email: z.email(),
    copy: z.string().min(1),
    copied: z.string().min(1),
    meta: z.tuple([z.string().min(1), z.string().min(1), text]),
    github: z.url(),
    linkedin: z.url(),
    githubLabel: z.string().min(1),
    linkedinLabel: z.string().min(1),
    footer: z.string().min(1),
  }),
  seo: z.object({ title: z.string().min(1), description: z.string().min(1) }),
  /**
   * The person and the site (structured data, sharing image, manifest). `name` is in the page's language;
   * `latinName`, `brand` and `domain` are the same in every locale, for whatever must stay Latin.
   */
  site: z.object({
    name: z.string().min(1),
    latinName: z.string().min(1),
    brand: z.string().min(1),
    domain: z.string().min(1),
  }),
});
export type HomeContent = z.infer<typeof homeContentSchema>;
