import { z } from 'zod';

export const text = z.union([
  z.string().min(1),
  z.object({ text: z.string().min(1), unconfirmed: z.literal(true) }),
]);
export type Text = z.infer<typeof text>;
export const u = (value: string): Text => ({ text: value, unconfirmed: true });
export const plain = (value: Text): string => (typeof value === 'string' ? value : value.text);

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
    footer: z.string().min(1),
  }),
  seo: z.object({ title: z.string().min(1), description: z.string().min(1) }),
});
export type HomeContent = z.infer<typeof homeContentSchema>;
