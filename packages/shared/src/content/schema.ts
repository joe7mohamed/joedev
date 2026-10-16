import { z } from 'zod';

export const text = z.union([
  z.string().min(1),
  z.object({ text: z.string().min(1), unconfirmed: z.literal(true) }),
]);
export type Text = z.infer<typeof text>;
export const u = (value: string): Text => ({ text: value, unconfirmed: true });
export const plain = (value: Text): string => (typeof value === 'string' ? value : value.text);

const word = z.object({ t: z.string().min(1), key: z.boolean().optional(), gold: z.boolean().optional() });
const diagram = z.enum(['request-path', 'provider-fallback', 'server-sync']);

export const homeContentSchema = z.object({
  nav: z.object({
    work: z.string(),
    process: z.string(),
    about: z.string(),
    contact: z.string(),
    switchLanguage: z.string(),
    switchTheme: z.string(),
    skip: z.string(),
  }),
  hero: z.object({
    titles: z.array(text).min(1),
    place: z.string(),
    availability: text,
    headline: z.array(z.array(word).min(1)).min(1),
    sentence: z.string(),
    rotating: z.array(z.string()).min(2),
    steps: z.tuple([z.string(), z.string(), z.string()]),
    primary: z.string(),
    secondary: z.string(),
    scroll: z.string(),
  }),
  work: z.object({ label: z.string(), visit: z.string() }),
  projects: z
    .array(
      z.object({
        id: z.enum(['nuammer', 'wazifi', 'talmeeha']),
        name: z.string(),
        url: z.url(),
        image: z.string(),
        imageAlt: z.string(),
        category: z.string(),
        description: z.string(),
        meta: z.tuple([z.string(), text, z.string()]),
        diagram,
        caption: z.string(),
        tools: z.array(z.string()).min(1),
      }),
    )
    .length(3),
  process: z.object({
    label: z.string(),
    youGet: z.string(),
    steps: z
      .array(z.object({ name: z.string(), sentence: z.string(), gives: text, tools: z.array(z.string()) }))
      .length(5),
  }),
  about: z.object({
    label: z.string(),
    heading: z.string(),
    loop: z.array(z.object({ name: z.string(), tools: text })).length(7),
    facts: z
      .array(z.object({ id: z.enum(['place', 'job', 'marshal', 'games']), label: z.string(), body: text }))
      .length(4),
    disclaimer: z.string(),
  }),
  contact: z.object({
    label: z.string(),
    heading: z.string(),
    sentence: z.string(),
    email: z.email(),
    copy: z.string(),
    copied: z.string(),
    meta: z.tuple([z.string(), z.string(), text]),
    github: z.url(),
    linkedin: z.url(),
    footer: z.string(),
  }),
  seo: z.object({ title: z.string(), description: z.string() }),
});
export type HomeContent = z.infer<typeof homeContentSchema>;
