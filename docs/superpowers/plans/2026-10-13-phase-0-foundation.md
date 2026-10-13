# ZakyDev Phase 0 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old Vite app with a pnpm/Turborepo monorepo (Next.js web, NestJS API, shared package) that serves a tested bilingual placeholder page with the ZakyDev tokens, fonts, themes and typed content.

**Architecture:** `apps/web` is a statically generated Next.js App Router site with `/en` and `/ar`. `packages/shared` holds locale constants and the zod-validated home content that both apps import. `apps/api` is a NestJS/Fastify service with a health endpoint only.

**Tech Stack:** pnpm, Turborepo, TypeScript, Next.js (App Router), Tailwind CSS 4, next-intl, NestJS + Fastify, zod, Biome, Vitest, Playwright, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-13-zakydev-home-design.md` (read sections 3, 4, 6, 7 before starting). Visual reference: `docs/prototype/home-v23/`.

## Global Constraints

- Work on branch `rebuild/zakydev`; never commit to `main`.
- Use the current stable release of every dependency. Before installing a framework, look up its current docs (Context7) and adapt config syntax if it differs from this plan; record the installed versions in `docs/VERSIONS.md`.
- No secrets in the repository. `.env.example` lists names only.
- No third-party runtime requests from the web app (no CDN scripts, no Google Fonts links).
- No animation library and no three.js in this phase.
- Colours, fonts and mark geometry exactly as in spec section 3.
- Logical CSS properties only (`ms-`, `pe-`, `start`, `end`).
- Commit message format: `<type>: <description>` (feat, fix, refactor, docs, test, chore, perf, ci).
- Email address anywhere in code or content: `youssef@zakydev.com`.

## Review Focus

- A request to `/` with `Accept-Language: ar` must land on `/ar`; with anything else, `/en`. (Task 4)
- An unknown locale such as `/fr` must return 404, not crash. (Task 4)
- A visitor whose system theme is light must get light on first paint with no flash. (Task 4)
- Content with a missing Arabic key must fail the build, not render `undefined`. (Task 3)
- The API must refuse to boot with an invalid `PORT`, with a readable message. (Task 5)

---

### Task 1: Branch, remove the old app, monorepo root

**Files:**
- Delete: `src/`, `api/`, `public/`, `index.html`, `vite.config.ts`, `tailwind.config.ts`, `eslint.config.js`, `vercel.json`, `emailjs-template.html`, `components.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `package.json`, `package-lock.json`, `README.md`, `DEPLOYMENT.md`, `PRODUCTION_SETUP.md`, `node_modules/`
- Create: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.nvmrc`, `biome.json`, `.env.example`, `README.md`, `docs/VERSIONS.md`, `packages/config/tsconfig.base.json`, `packages/config/package.json`
- Modify: `.gitignore`

**Interfaces:**
- Produces: workspace globs `apps/*`, `packages/*`; root scripts `lint`, `typecheck`, `test`, `build`, `dev`; TS base config `@zakydev/config/tsconfig.base.json`.

- [ ] **Step 1: Switch to the branch** (it already exists and holds the spec, plans and prototype)

```bash
git fetch origin && git checkout rebuild/zakydev && git pull
```

- [ ] **Step 2: Remove the old application**

```bash
git rm -r -q src api public index.html vite.config.ts tailwind.config.ts eslint.config.js vercel.json emailjs-template.html components.json tsconfig.json tsconfig.app.json tsconfig.node.json package.json package-lock.json README.md DEPLOYMENT.md PRODUCTION_SETUP.md
```

Then delete the untracked `node_modules` directory by hand (it belongs to the old app). `DEPLOYMENT.md` contained a real database password that remains in git history; that is the owner's item in spec section 12 and is not fixed by this deletion.

- [ ] **Step 3: Write the root files**

`.nvmrc`:
```
24
```

`pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

`package.json`:
```json
{
  "name": "zakydev",
  "private": true,
  "type": "module",
  "engines": { "node": ">=24" },
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "biome check .",
    "format": "biome check --write .",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "e2e": "turbo run e2e"
  },
  "devDependencies": {}
}
```

`turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**", "!.next/cache/**"], "env": ["REQUIRE_CONFIRMED", "NEXT_PUBLIC_*", "NODE_ENV"] },
    "typecheck": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"] },
    "e2e": { "dependsOn": ["build"], "cache": false },
    "dev": { "cache": false, "persistent": true }
  }
}
```

`biome.json`:
```json
{
  "$schema": "https://biomejs.dev/schemas/latest/schema.json",
  "files": { "ignore": ["**/dist", "**/.next", "**/node_modules", "docs/prototype", "**/test-results", "**/playwright-report"] },
  "formatter": { "indentStyle": "space", "indentWidth": 2, "lineWidth": 110 },
  "javascript": { "formatter": { "quoteStyle": "single", "semicolons": "always" } },
  "linter": { "rules": { "recommended": true } }
}
```

`.env.example`:
```
# apps/web
NEXT_PUBLIC_SITE_URL=
# set to 1 for production builds: the build fails while any text is still unconfirmed
REQUIRE_CONFIRMED=
# apps/api
PORT=
LOG_LEVEL=
```

`packages/config/package.json`:
```json
{ "name": "@zakydev/config", "version": "0.0.0", "private": true, "files": ["tsconfig.base.json"] }
```

`packages/config/tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

Append to `.gitignore`:
```
.turbo/
.next/
out/
test-results/
playwright-report/
```

`README.md`:
```markdown
# ZakyDev

Personal site of Youssef Zaky. Monorepo: `apps/web` (Next.js), `apps/api` (NestJS),
`packages/shared` (content and schemas).

    pnpm install
    pnpm dev        # web on :3000, api on :4000
    pnpm lint && pnpm typecheck && pnpm test && pnpm build

Design: `DESIGN.md`. Spec and plans: `docs/superpowers/`. Visual reference: `docs/prototype/home-v23/`.
```

- [ ] **Step 4: Install tooling and record versions**

```bash
corepack enable && corepack prepare pnpm@latest --activate
pnpm add -D -w turbo typescript @biomejs/biome
pnpm pkg set packageManager="pnpm@$(pnpm --version)"
```

Create `docs/VERSIONS.md` with a table of package and installed version (from `pnpm ls -w --depth 0`), and append to it in every later task that installs something.

- [ ] **Step 5: Verify**

Run: `pnpm lint`
Expected: exits 0 ("Checked N files", no errors). If Biome reports a schema or key mismatch for its current version, run `pnpm biome migrate --write` and re-run.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: replace the Vite app with a pnpm and Turborepo workspace"
```

---

### Task 2: Shared package — locales

**Files:**
- Create: `packages/shared/package.json`, `packages/shared/tsconfig.json`, `packages/shared/vitest.config.ts`, `packages/shared/src/index.ts`, `packages/shared/src/locales.ts`
- Test: `packages/shared/src/locales.test.ts`

**Interfaces:**
- Produces: `LOCALES: readonly ['en','ar']`, `type Locale = 'en' | 'ar'`, `DEFAULT_LOCALE: 'en'`, `isLocale(x: string): x is Locale`, `dirOf(l: Locale): 'ltr' | 'rtl'`, `pickLocale(acceptLanguage: string | null): Locale`.

- [ ] **Step 1: Package files**

`packages/shared/package.json`:
```json
{
  "name": "@zakydev/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": { "typecheck": "tsc --noEmit", "test": "vitest run" }
}
```

`packages/shared/tsconfig.json`:
```json
{ "extends": "@zakydev/config/tsconfig.base.json", "compilerOptions": { "noEmit": true }, "include": ["src"] }
```

`packages/shared/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({ test: { include: ['src/**/*.test.ts'] } });
```

```bash
pnpm --filter @zakydev/shared add zod
pnpm --filter @zakydev/shared add -D vitest typescript @zakydev/config@workspace:*
```

- [ ] **Step 2: Write the failing test**

`packages/shared/src/locales.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, LOCALES, dirOf, isLocale, pickLocale } from './locales';

describe('locales', () => {
  it('lists exactly English and Arabic', () => {
    expect(LOCALES).toEqual(['en', 'ar']);
    expect(DEFAULT_LOCALE).toBe('en');
  });
  it('recognises valid locales only', () => {
    expect(isLocale('ar')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
  });
  it('gives the writing direction', () => {
    expect(dirOf('en')).toBe('ltr');
    expect(dirOf('ar')).toBe('rtl');
  });
  it('picks Arabic only when it is the preferred language', () => {
    expect(pickLocale('ar-BH,ar;q=0.9,en;q=0.8')).toBe('ar');
    expect(pickLocale('en-US,ar;q=0.5')).toBe('en');
    expect(pickLocale('fr-FR')).toBe('en');
    expect(pickLocale(null)).toBe('en');
    expect(pickLocale('')).toBe('en');
  });
});
```

- [ ] **Step 3: Run it and see it fail**

Run: `pnpm --filter @zakydev/shared test`
Expected: FAIL, cannot resolve `./locales`.

- [ ] **Step 4: Implement**

`packages/shared/src/locales.ts`:
```ts
export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);

export const dirOf = (locale: Locale): 'ltr' | 'rtl' => (locale === 'ar' ? 'rtl' : 'ltr');

/** The first language tag in an Accept-Language header decides. */
export const pickLocale = (acceptLanguage: string | null): Locale => {
  const first = (acceptLanguage ?? '').split(',')[0]?.trim().toLowerCase() ?? '';
  return first.startsWith('ar') ? 'ar' : DEFAULT_LOCALE;
};
```

`packages/shared/src/index.ts`:
```ts
export * from './locales';
```

- [ ] **Step 5: Run it and see it pass**

Run: `pnpm --filter @zakydev/shared test`
Expected: 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add shared locale helpers"
```

---

### Task 3: Shared package — home content and its schema

**Files:**
- Create: `packages/shared/src/content/schema.ts`, `packages/shared/src/content/home.en.ts`, `packages/shared/src/content/home.ar.ts`, `packages/shared/src/content/index.ts`
- Modify: `packages/shared/src/index.ts`
- Test: `packages/shared/src/content/home.test.ts`

**Interfaces:**
- Consumes: `Locale` from Task 2.
- Produces: `homeContentSchema`, `type HomeContent = z.infer<typeof homeContentSchema>`, `home: Record<Locale, HomeContent>`, `getHome(locale: Locale, opts?: { requireConfirmed?: boolean }): HomeContent`, `unconfirmedPaths(content: HomeContent): string[]`.

A text value is either a string or `{ text: string; unconfirmed: true }`. Use the helper `u('…')` for unconfirmed text. The list of unconfirmed items is spec section 12, item 1.

- [ ] **Step 1: Write the failing test**

`packages/shared/src/content/home.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getHome, home, homeContentSchema, unconfirmedPaths } from './index';

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
    const words = (l: 'en' | 'ar') => home[l].hero.headline.flat().map((w) => w.t).join(' ');
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
  it('lists unconfirmed text and can refuse it', () => {
    expect(unconfirmedPaths(home.en).length).toBeGreaterThan(0);
    expect(() => getHome('en', { requireConfirmed: true })).toThrow(/unconfirmed/i);
    expect(getHome('en').hero.place).toBeDefined();
  });
});
```

- [ ] **Step 2: Run it and see it fail**

Run: `pnpm --filter @zakydev/shared test`
Expected: FAIL, cannot resolve `./index`.

- [ ] **Step 3: Schema**

`packages/shared/src/content/schema.ts`:
```ts
import { z } from 'zod';

export const text = z.union([z.string().min(1), z.object({ text: z.string().min(1), unconfirmed: z.literal(true) })]);
export type Text = z.infer<typeof text>;
export const u = (value: string): Text => ({ text: value, unconfirmed: true });
export const plain = (value: Text): string => (typeof value === 'string' ? value : value.text);

const word = z.object({ t: z.string().min(1), key: z.boolean().optional(), gold: z.boolean().optional() });
const diagram = z.enum(['request-path', 'provider-fallback', 'server-sync']);

export const homeContentSchema = z.object({
  nav: z.object({ work: z.string(), process: z.string(), about: z.string(), contact: z.string(), switchLanguage: z.string(), switchTheme: z.string(), skip: z.string() }),
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
        url: z.string().url(),
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
    steps: z.array(z.object({ name: z.string(), sentence: z.string(), gives: text, tools: z.array(z.string()) })).length(5),
  }),
  about: z.object({
    label: z.string(),
    heading: z.string(),
    loop: z.array(z.object({ name: z.string(), tools: text })).length(7),
    facts: z.array(z.object({ id: z.enum(['place', 'job', 'marshal', 'games']), label: z.string(), body: text })).length(4),
    disclaimer: z.string(),
  }),
  contact: z.object({
    label: z.string(),
    heading: z.string(),
    sentence: z.string(),
    email: z.string().email(),
    copy: z.string(),
    copied: z.string(),
    meta: z.tuple([z.string(), z.string(), text]),
    github: z.string().url(),
    linkedin: z.string().url(),
    footer: z.string(),
  }),
  seo: z.object({ title: z.string(), description: z.string() }),
});
export type HomeContent = z.infer<typeof homeContentSchema>;
```

- [ ] **Step 4: English content**

`packages/shared/src/content/home.en.ts`:
```ts
import { type HomeContent, u } from './schema';

export const homeEn: HomeContent = {
  nav: { work: 'Work', process: 'Process', about: 'About', contact: 'Contact', switchLanguage: 'Switch to Arabic', switchTheme: 'Switch theme', skip: 'Skip to content' },
  hero: {
    titles: ['Software engineer', u('Full-stack developer')],
    place: 'Bahrain',
    availability: u('Available for new projects'),
    headline: [
      [{ t: 'I' }, { t: 'build' }, { t: 'software', key: true }],
      [{ t: 'that' }, { t: 'holds', gold: true }, { t: 'up', gold: true }],
      [{ t: 'under' }, { t: 'pressure.' }],
    ],
    sentence: 'I design, build and launch',
    rotating: ['marketplaces', 'AI assistants', 'multiplayer games', 'hospital systems'],
    steps: ['Design', 'Build', 'Launch'],
    primary: 'See my work',
    secondary: 'Start a project',
    scroll: 'Scroll',
  },
  work: { label: 'My work', visit: 'Visit live site' },
  projects: [
    { id: 'nuammer', name: 'Nuammer', url: 'https://nuammer.com', image: '/projects/nuammer.jpg', imageAlt: 'Nuammer home page', category: 'Supplier directory for the Gulf', description: 'Find and compare trusted suppliers, in Arabic and English.', meta: ['Oct 2025 – now', 'Freelance', 'Designed, built, launched'], diagram: 'request-path', caption: 'One clear path from screen to data.', tools: ['Next.js', 'NestJS', 'Prisma', 'MySQL', 'Docker', 'GitHub Actions'] },
    { id: 'wazifi', name: 'Wazifi', url: 'https://wazifi.vercel.app', image: '/projects/wazifi.jpg', imageAlt: 'Wazifi home page', category: 'AI career assistant', description: 'Builds your résumé and matches you with jobs.', meta: ['Apr – Aug 2026', u('My own product'), 'Designed, built, launched'], diagram: 'provider-fallback', caption: 'If one AI service fails, another answers.', tools: ['Next.js', 'Supabase', 'PostgreSQL · RLS', 'Vercel AI SDK'] },
    { id: 'talmeeha', name: 'Talmeeha', url: 'https://talmeeha.vercel.app', image: '/projects/talmeeha.jpg', imageAlt: 'Talmeeha home page', category: 'Multiplayer Arabic word game', description: 'Play live with friends. Everyone sees the same round.', meta: ['May – Aug 2026', u('My own product'), 'Designed, built, launched'], diagram: 'server-sync', caption: 'The server keeps every player in sync.', tools: ['Next.js', 'Supabase Realtime', 'Server-owned state'] },
  ],
  process: {
    label: 'How I work',
    youGet: 'You get',
    steps: [
      { name: 'Understand', sentence: 'We talk first. I learn the problem and who it is for.', gives: u('A clear plan'), tools: [] },
      { name: 'Design', sentence: 'I draw every screen before I write code.', gives: u('Screens you can click through'), tools: [] },
      { name: 'Build', sentence: 'Interface, logic and data, built together.', gives: u('A working version, early'), tools: ['Next.js', 'NestJS', 'PostgreSQL'] },
      { name: 'Test', sentence: 'I try to break it before your users can.', gives: u('Fewer surprises'), tools: ['Vitest', 'Playwright'] },
      { name: 'Launch', sentence: 'It goes live, and I stay to keep it healthy.', gives: u('A live product, looked after'), tools: ['Docker', 'GitHub Actions', 'Vercel'] },
    ],
  },
  about: {
    label: "Who's behind it",
    heading: 'One engineer, from A to Z.',
    loop: [
      { name: 'Idea', tools: 'Brief · user flow' },
      { name: 'Design', tools: 'Wireframes' },
      { name: 'Code', tools: 'Next.js · NestJS' },
      { name: 'Data', tools: 'PostgreSQL · Prisma' },
      { name: 'Test', tools: 'Vitest · Playwright' },
      { name: 'Deploy', tools: 'Docker · GitHub Actions' },
      { name: 'Monitor', tools: u('Logs · health checks') },
    ],
    facts: [
      { id: 'place', label: 'Based in', body: 'Bahrain. I work in Arabic and English.' },
      { id: 'job', label: 'Day job', body: u('I build software for a hospital.') },
      { id: 'marshal', label: 'Track marshal', body: 'Bahrain International Circuit since 2019. F1 and WEC weekends: flags, safety, quick calls.' },
      { id: 'games', label: 'After work', body: u('League of Legends, Valorant and TFT. Read the map, make the call, adapt.') },
    ],
    disclaimer: "ZakyDev isn't endorsed by Riot Games.",
  },
  contact: {
    label: 'Contact',
    heading: 'What needs building?',
    sentence: 'Tell me about it in a few lines.',
    email: 'youssef@zakydev.com',
    copy: 'Copy email',
    copied: 'Copied',
    meta: ['Bahrain · UTC+3', 'Arabic · English', u('Reply within two working days')],
    github: 'https://github.com/joe7mohamed',
    linkedin: 'https://linkedin.com/in/youssef7mohamed',
    footer: 'ZakyDev · Youssef Zaky · Bahrain',
  },
  seo: { title: 'Youssef Zaky — Software engineer | ZakyDev', description: 'Software engineer in Bahrain. I design, build and launch web apps, start to finish.' },
};
```

- [ ] **Step 5: Arabic content**

`packages/shared/src/content/home.ar.ts`:
```ts
import { type HomeContent, u } from './schema';

export const homeAr: HomeContent = {
  nav: { work: 'أعمالي', process: 'طريقتي', about: 'عنّي', contact: 'تواصل', switchLanguage: 'Switch to English', switchTheme: 'تبديل المظهر', skip: 'انتقل إلى المحتوى' },
  hero: {
    titles: ['مهندس برمجيات', u('مطوّر Full-Stack')],
    place: 'البحرين',
    availability: u('متاح لمشاريع جديدة'),
    headline: [[{ t: 'أبني' }, { t: 'برمجيات', key: true }], [{ t: 'تصمد', gold: true }, { t: 'تحت' }], [{ t: 'الضغط.' }]],
    sentence: 'أصمّم وأبني وأطلق',
    rotating: ['منصات تجارية', 'مساعدين بالذكاء الاصطناعي', 'ألعابًا جماعية', 'أنظمة مستشفيات'],
    steps: ['تصميم', 'بناء', 'إطلاق'],
    primary: 'شاهد أعمالي',
    secondary: 'ابدأ مشروعك',
    scroll: 'مرّر للأسفل',
  },
  work: { label: 'أعمالي', visit: 'زر الموقع' },
  projects: [
    { id: 'nuammer', name: 'Nuammer', url: 'https://nuammer.com', image: '/projects/nuammer.jpg', imageAlt: 'الصفحة الرئيسية لموقع Nuammer', category: 'دليل موردين للخليج', description: 'ابحث عن موردين موثوقين وقارن بينهم، بالعربية والإنجليزية.', meta: ['أكتوبر 2025 – الآن', 'عمل حر', 'تصميم وبناء وإطلاق'], diagram: 'request-path', caption: 'مسار واحد واضح من الشاشة إلى البيانات.', tools: ['Next.js', 'NestJS', 'Prisma', 'MySQL', 'Docker', 'GitHub Actions'] },
    { id: 'wazifi', name: 'Wazifi', url: 'https://wazifi.vercel.app', image: '/projects/wazifi.jpg', imageAlt: 'الصفحة الرئيسية لموقع Wazifi', category: 'مساعد وظيفي بالذكاء الاصطناعي', description: 'يبني سيرتك الذاتية ويرشّح لك الوظائف المناسبة.', meta: ['أبريل – أغسطس 2026', u('مشروعي الخاص'), 'تصميم وبناء وإطلاق'], diagram: 'provider-fallback', caption: 'إذا تعطّلت خدمة ذكاء اصطناعي، تجيب أخرى.', tools: ['Next.js', 'Supabase', 'PostgreSQL · RLS', 'Vercel AI SDK'] },
    { id: 'talmeeha', name: 'Talmeeha', url: 'https://talmeeha.vercel.app', image: '/projects/talmeeha.jpg', imageAlt: 'الصفحة الرئيسية للعبة Talmeeha', category: 'لعبة كلمات عربية جماعية', description: 'العب مباشرة مع أصدقائك، والجميع يرى الجولة نفسها.', meta: ['مايو – أغسطس 2026', u('مشروعي الخاص'), 'تصميم وبناء وإطلاق'], diagram: 'server-sync', caption: 'الخادم يُبقي كل اللاعبين على الحالة نفسها.', tools: ['Next.js', 'Supabase Realtime', 'Server-owned state'] },
  ],
  process: {
    label: 'كيف أعمل',
    youGet: 'تحصل على',
    steps: [
      { name: 'أفهم', sentence: 'نتحدث أولًا. أفهم المشكلة ومن سيستخدم الحل.', gives: u('خطة واضحة'), tools: [] },
      { name: 'أصمّم', sentence: 'أرسم كل شاشة قبل أن أكتب الكود.', gives: u('شاشات يمكنك تجربتها'), tools: [] },
      { name: 'أبني', sentence: 'الواجهة والقواعد والبيانات، تُبنى معًا.', gives: u('نسخة تعمل، مبكرًا'), tools: ['Next.js', 'NestJS', 'PostgreSQL'] },
      { name: 'أختبر', sentence: 'أحاول كسره قبل أن يفعل مستخدموك.', gives: u('مفاجآت أقل'), tools: ['Vitest', 'Playwright'] },
      { name: 'أطلق', sentence: 'يصبح متاحًا للناس، وأبقى لأحافظ عليه.', gives: u('منتج يعمل، مع متابعة'), tools: ['Docker', 'GitHub Actions', 'Vercel'] },
    ],
  },
  about: {
    label: 'من أنا',
    heading: 'مهندس واحد، من الألف إلى الياء.',
    loop: [
      { name: 'الفكرة', tools: 'Brief · user flow' },
      { name: 'التصميم', tools: 'Wireframes' },
      { name: 'الكود', tools: 'Next.js · NestJS' },
      { name: 'البيانات', tools: 'PostgreSQL · Prisma' },
      { name: 'الاختبار', tools: 'Vitest · Playwright' },
      { name: 'النشر', tools: 'Docker · GitHub Actions' },
      { name: 'المراقبة', tools: u('Logs · health checks') },
    ],
    facts: [
      { id: 'place', label: 'المكان', body: 'البحرين. أعمل بالعربية والإنجليزية.' },
      { id: 'job', label: 'العمل', body: u('أبني برمجيات لمستشفى.') },
      { id: 'marshal', label: 'مارشال الحلبة', body: 'حلبة البحرين الدولية منذ 2019. سباقات F1 و WEC: أعلام، سلامة، وقرارات سريعة.' },
      { id: 'games', label: 'بعد الدوام', body: u('League of Legends و Valorant و TFT. أقرأ الخريطة، أقرّر، وأتكيّف.') },
    ],
    disclaimer: 'ZakyDev غير معتمد من Riot Games.',
  },
  contact: {
    label: 'تواصل',
    heading: 'ما الذي تريد بناءه؟',
    sentence: 'اكتب لي عنه في سطور قليلة.',
    email: 'youssef@zakydev.com',
    copy: 'انسخ البريد',
    copied: 'تم النسخ',
    meta: ['البحرين · UTC+3', 'العربية · الإنجليزية', u('أردّ خلال يومي عمل')],
    github: 'https://github.com/joe7mohamed',
    linkedin: 'https://linkedin.com/in/youssef7mohamed',
    footer: 'ZakyDev · Youssef Zaky · Bahrain',
  },
  seo: { title: 'يوسف زكي — مهندس برمجيات | ZakyDev', description: 'مهندس برمجيات في البحرين. أصمّم تطبيقات الويب وأبنيها وأطلقها، من البداية إلى النهاية.' },
};
```

- [ ] **Step 6: Index with validation**

`packages/shared/src/content/index.ts`:
```ts
import type { Locale } from '../locales';
import { homeAr } from './home.ar';
import { homeEn } from './home.en';
import { type HomeContent, homeContentSchema } from './schema';

export * from './schema';

export const home: Record<Locale, HomeContent> = { en: homeContentSchema.parse(homeEn), ar: homeContentSchema.parse(homeAr) };

/** Dotted paths of every text still waiting for the owner's confirmation. */
export const unconfirmedPaths = (content: HomeContent): string[] => {
  const found: string[] = [];
  const walk = (value: unknown, path: string): void => {
    if (Array.isArray(value)) value.forEach((item, i) => walk(item, `${path}[${i}]`));
    else if (value && typeof value === 'object') {
      if ((value as { unconfirmed?: boolean }).unconfirmed === true) found.push(path);
      else for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k);
    }
  };
  walk(content, '');
  return found;
};

export const getHome = (locale: Locale, opts: { requireConfirmed?: boolean } = {}): HomeContent => {
  const content = home[locale];
  if (opts.requireConfirmed) {
    const paths = unconfirmedPaths(content);
    if (paths.length > 0) throw new Error(`Unconfirmed content in "${locale}": ${paths.join(', ')}`);
  }
  return content;
};
```

Add to `packages/shared/src/index.ts`:
```ts
export * from './content';
```

- [ ] **Step 7: Run tests**

Run: `pnpm --filter @zakydev/shared test && pnpm --filter @zakydev/shared typecheck`
Expected: all tests pass, typecheck exits 0.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add typed bilingual home content with a confirmation gate"
```

---

### Task 4: Web app — scaffold, tokens, fonts, locales, themes, placeholder page

**Files:**
- Create: `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/next.config.ts`, `apps/web/postcss.config.mjs`, `apps/web/src/app/globals.css`, `apps/web/src/app/[locale]/layout.tsx`, `apps/web/src/app/[locale]/page.tsx`, `apps/web/src/app/[locale]/not-found.tsx`, `apps/web/src/proxy.ts`, `apps/web/src/lib/fonts.ts`, `apps/web/src/lib/theme-script.ts`, `apps/web/src/components/Mark.tsx`, `apps/web/src/components/ThemeToggle.tsx`, `apps/web/public/projects/{nuammer,wazifi,talmeeha}.jpg`, `apps/web/public/icons/*.svg`, `apps/web/playwright.config.ts`
- Test: `apps/web/e2e/foundation.spec.ts`

**Interfaces:**
- Consumes: `LOCALES`, `isLocale`, `dirOf`, `pickLocale`, `getHome`, `plain` from `@zakydev/shared`.
- Produces: `<Mark size?: number className?: string />`; CSS variables of spec 3.2 on `:root` and `[data-theme="light"]`; font-face variables `--face-display`, `--face-body`, `--face-mono`, `--face-display-ar`, `--face-body-ar` and the per-language stacks `--stack-display`, `--stack-body`, `--lh-display`, `--lh-body`; `data-theme` attribute on `<html>` set before paint.

Before writing config, read the current Next.js docs for: App Router project structure, `next/font/google`, the request interception file (named `proxy.ts` in Next 16; `middleware.ts` before), and Tailwind 4 with PostCSS. Adjust file names to the installed version.

- [ ] **Step 1: Create the app and copy assets**

```bash
mkdir -p apps/web && cd apps/web
pnpm init
pnpm add next react react-dom @zakydev/shared@workspace:*
pnpm add -D typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss @playwright/test @axe-core/playwright @zakydev/config@workspace:*
pnpm exec playwright install chromium
mkdir -p public/projects public/icons public/brand
cp ../../docs/prototype/home-v23/img/*.jpg public/projects/
cp ../../docs/prototype/home-v23/icons/*.svg public/icons/
cp ../../docs/prototype/home-v23/brand/*.svg public/brand/
```

Set `"name": "web"`, `"private": true` and `"type": "module"` in `apps/web/package.json`, and these scripts:
```json
{ "dev": "next dev -p 3000", "build": "next build", "start": "next start -p 3000", "typecheck": "tsc --noEmit", "e2e": "playwright test" }
```

- [ ] **Step 2: Write the failing end-to-end test**

`apps/web/playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  webServer: { command: 'pnpm build && pnpm start', url: 'http://localhost:3000/en', reuseExistingServer: !process.env.CI, timeout: 180_000 },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
});
```

`apps/web/e2e/foundation.spec.ts`:
```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('English page is left-to-right with the agreed headline', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('I build software that holds up under pressure.');
});

test('Arabic page is right-to-left with the agreed headline', async ({ page }) => {
  await page.goto('/ar');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('أبني برمجيات تصمد تحت الضغط.');
});

test('root redirects by preferred language', async ({ browser }) => {
  const ar = await browser.newContext({ locale: 'ar-BH' });
  const arPage = await ar.newPage();
  await arPage.goto('/');
  await expect(arPage).toHaveURL(/\/ar$/);
  const fr = await browser.newContext({ locale: 'fr-FR' });
  const frPage = await fr.newPage();
  await frPage.goto('/');
  await expect(frPage).toHaveURL(/\/en$/);
});

test('unknown locale is a 404', async ({ page }) => {
  const response = await page.goto('/fr');
  expect(response?.status()).toBe(404);
});

test('theme follows the system on first paint and the toggle after', async ({ browser }) => {
  const light = await browser.newContext({ colorScheme: 'light' });
  const page = await light.newPage();
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Switch theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('makes no third-party requests', async ({ page }) => {
  const foreign: string[] = [];
  page.on('request', (r) => { if (!r.url().startsWith('http://localhost:3000')) foreign.push(r.url()); });
  await page.goto('/ar');
  await page.waitForLoadState('networkidle');
  expect(foreign).toEqual([]);
});

for (const path of ['/en', '/ar']) {
  test(`no accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
```

- [ ] **Step 3: Run it and see it fail**

Run: `pnpm --filter web e2e`
Expected: FAIL (no app to build).

- [ ] **Step 4: Config, fonts, tokens**

`apps/web/tsconfig.json`:
```json
{
  "extends": "@zakydev/config/tsconfig.base.json",
  "compilerOptions": { "lib": ["dom", "dom.iterable", "ES2023"], "jsx": "preserve", "noEmit": true, "incremental": true, "plugins": [{ "name": "next" }], "paths": { "@/*": ["./src/*"] } },
  "include": ["next-env.d.ts", "src", ".next/types/**/*.ts", "e2e", "playwright.config.ts"],
  "exclude": ["node_modules"]
}
```

`apps/web/next.config.ts`:
```ts
import type { NextConfig } from 'next';

const security = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const config: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@zakydev/shared'],
  poweredByHeader: false,
  async headers() {
    return [{ source: '/(.*)', headers: security }];
  },
};

export default config;
```

`apps/web/postcss.config.mjs`:
```js
export default { plugins: { '@tailwindcss/postcss': {} } };
```

`apps/web/src/lib/fonts.ts`:
```ts
import { Amiri, Fraunces, Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';

// The variables are named --face-* so they never collide with the theme's --font-* stacks.
export const display = Fraunces({ subsets: ['latin'], axes: ['SOFT', 'opsz'], variable: '--face-display', display: 'swap' });
export const body = Geist({ subsets: ['latin'], variable: '--face-body', display: 'swap' });
export const mono = Geist_Mono({ subsets: ['latin'], variable: '--face-mono', display: 'swap' });
export const displayAr = Amiri({ subsets: ['arabic'], weight: ['400', '700'], variable: '--face-display-ar', display: 'swap', preload: false });
export const bodyAr = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600'], variable: '--face-body-ar', display: 'swap', preload: false });
```

`next/font` downloads the files at build time and serves them from the site, so there are no runtime requests to Google.

`apps/web/src/app/globals.css`:
```css
@import "tailwindcss";

:root {
  color-scheme: dark;
  --bg: #0f0e0c;
  --panel: #181613;
  --ink: #f3efe6;
  --muted: #a8a192;
  --hair: rgb(243 239 230 / 0.14);
  --gold: #d4af37;
  --accent: #d4af37;
  --on-gold: #14120e;
  --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --quick: 180ms;
  --std: 450ms;
  --slow: 900ms;
}
[data-theme="light"] {
  color-scheme: light;
  --bg: #faf9f6;
  --panel: #f1eee6;
  --ink: #1a1814;
  --muted: #6a6457;
  --hair: rgb(26 24 20 / 0.14);
  --accent: #8a6d1f;
}

@theme inline {
  --color-bg: var(--bg);
  --color-panel: var(--panel);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --color-hair: var(--hair);
  --color-gold: var(--gold);
  --color-accent: var(--accent);
  --color-on-gold: var(--on-gold);
  --font-display: var(--stack-display);
  --font-sans: var(--stack-body);
  --font-mono: var(--face-mono), ui-monospace, Menlo, monospace;
}

/* Complete stacks per language. The Arabic faces are only loaded on /ar, so they are only named there. */
html { --stack-display: var(--face-display), Georgia, serif; --stack-body: var(--face-body), system-ui, sans-serif; --lh-display: 1.02; --lh-body: 1.55; background: var(--bg); color: var(--ink); }
html[lang="ar"] { --stack-display: var(--face-display-ar), var(--face-display), serif; --stack-body: var(--face-body-ar), var(--face-body), system-ui, sans-serif; --lh-display: 1.3; --lh-body: 1.7; }
html[lang="ar"] * { letter-spacing: 0 !important; }
body { margin: 0; font-family: var(--stack-body); line-height: var(--lh-body); overflow-x: clip; }
h1, h2, h3 { font-family: var(--stack-display); line-height: var(--lh-display); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 6px; }
```

- [ ] **Step 5: Theme without a flash**

`apps/web/src/lib/theme-script.ts`:
```ts
/** Runs in <head> before first paint. Stored choice wins, then the system setting, then dark. */
export const themeScript = `(function(){try{var s=localStorage.getItem('zk-theme');var t=s==='light'||s==='dark'?s:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;
```

`apps/web/src/components/ThemeToggle.tsx`:
```tsx
'use client';

export function ThemeToggle({ label }: { label: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try {
      localStorage.setItem('zk-theme', next);
    } catch {
      // private mode: the choice lasts for this page only
    }
  };
  return (
    <button type="button" aria-label={label} onClick={toggle} className="grid size-11 place-items-center rounded-full border border-hair">
      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
        <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 3a7 7 0 0 1 0 14z" fill="currentColor" />
      </svg>
    </button>
  );
}
```

- [ ] **Step 6: Mark, layout, page, 404, locale redirect**

`apps/web/src/components/Mark.tsx`:
```tsx
const FULL = { upper: 'M12 15H50L36.2 28', lower: 'M27.8 36L14 49H52', width: 7 };
const SMALL = { upper: 'M12 15H50L38 26.5', lower: 'M26 37.5L14 49H52', width: 9 };

export function Mark({ size = 28, className }: { size?: number; className?: string }) {
  const cut = size < 32 ? SMALL : FULL;
  const common = { fill: 'none', strokeWidth: cut.width, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <path d={cut.upper} stroke="var(--ink)" {...common} />
      <path d={cut.lower} stroke="var(--accent)" {...common} />
    </svg>
  );
}
```

`apps/web/src/app/[locale]/layout.tsx`:
```tsx
import { LOCALES, dirOf, getHome, isLocale } from '@zakydev/shared';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { body, bodyAr, display, displayAr, mono } from '@/lib/fonts';
import { themeScript } from '@/lib/theme-script';
import '../globals.css';

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { seo } = getHome(locale);
  return { title: seo.title, description: seo.description, alternates: { canonical: `/${locale}`, languages: { en: '/en', ar: '/ar', 'x-default': '/en' } } };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const fonts = [display.variable, body.variable, mono.variable, ...(locale === 'ar' ? [displayAr.variable, bodyAr.variable] : [])].join(' ');
  return (
    <html lang={locale} dir={dirOf(locale)} className={fonts} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static string defined in this repo, must run before paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

`apps/web/src/app/[locale]/page.tsx`:
```tsx
import { getHome, isLocale, plain } from '@zakydev/shared';
import { notFound } from 'next/navigation';
import { Mark } from '@/components/Mark';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = getHome(locale, { requireConfirmed: process.env.REQUIRE_CONFIRMED === '1' });
  return (
    <>
      <header className="flex items-center gap-3 p-6">
        <Mark />
        <span className="font-medium">zakydev</span>
        <span className="ms-auto">
          <ThemeToggle label={c.nav.switchTheme} />
        </span>
      </header>
      <main className="px-6 py-24">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">
          {plain(c.hero.titles[0] ?? '')} · {c.hero.place}
        </p>
        <h1 className="mt-4 text-[clamp(2.6rem,11vw,10rem)]">
          {c.hero.headline.map((line) => line.map((w) => w.t).join(' ')).join(' ')}
        </h1>
        <p className="mt-8">
          <a href={`mailto:${c.contact.email}`} className="underline decoration-gold underline-offset-4">
            {c.contact.email}
          </a>
        </p>
      </main>
    </>
  );
}
```

`apps/web/src/app/[locale]/not-found.tsx`:
```tsx
export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center p-6">
      <h1 className="font-display text-5xl">404</h1>
    </main>
  );
}
```

`apps/web/src/proxy.ts` (name it `middleware.ts` and export `middleware` if the installed Next version predates `proxy.ts`):
```ts
import { pickLocale } from '@zakydev/shared';
import { type NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const locale = pickLocale(request.headers.get('accept-language'));
  return NextResponse.redirect(new URL(`/${locale}`, request.url), 307);
}

export const config = { matcher: ['/'] };
```

Because `dynamicParams = false`, `/fr` is not generated and returns 404.

- [ ] **Step 7: Run the tests**

Run: `pnpm --filter web typecheck && pnpm --filter web e2e`
Expected: typecheck exits 0; 16 tests pass (8 per project). If axe reports a contrast violation, fix the token usage on the page, not the test.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: scaffold the web app with tokens, fonts, locales and themes"
```

---

### Task 5: API — health endpoint with validated environment

**Files:**
- Create: `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/api/vitest.config.ts`, `apps/api/src/main.ts`, `apps/api/src/app.module.ts`, `apps/api/src/config/env.ts`, `apps/api/src/health/health.controller.ts`
- Test: `apps/api/src/config/env.test.ts`, `apps/api/test/health.e2e.test.ts`

**Interfaces:**
- Produces: `parseEnv(source: Record<string, string | undefined>): { PORT: number; LOG_LEVEL: 'fatal'|'error'|'warn'|'info'|'debug'|'trace' }`; `GET /v1/health` → `200 { "status": "ok" }`.

Read the current NestJS docs for the Fastify adapter and for ESM/`vitest` setup before installing; use the decorator and compiler settings they give for the installed version.

- [ ] **Step 1: Install**

```bash
mkdir -p apps/api && cd apps/api && pnpm init
pnpm add @nestjs/common @nestjs/core @nestjs/platform-fastify reflect-metadata rxjs zod @fastify/helmet
pnpm add -D typescript @types/node vitest unplugin-swc @swc/core @nestjs/testing @zakydev/config@workspace:*
```

Set `"type": "module"` and `"private": true` in `apps/api/package.json` (`pnpm init` does not, and `main.ts` uses ES modules with top-level `await`). Scripts in `apps/api/package.json`:
```json
{ "build": "tsc -p tsconfig.json", "start": "node dist/main.js", "dev": "node --watch --import @swc-node/register/esm-register src/main.ts", "typecheck": "tsc --noEmit", "test": "vitest run" }
```
If `dev` needs `@swc-node/register`, add it as a dev dependency.

`apps/api/tsconfig.json`:
```json
{
  "extends": "@zakydev/config/tsconfig.base.json",
  "compilerOptions": { "module": "NodeNext", "moduleResolution": "NodeNext", "outDir": "dist", "rootDir": "src", "experimentalDecorators": true, "emitDecoratorMetadata": true, "exactOptionalPropertyTypes": false },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts"]
}
```

`apps/api/vitest.config.ts`:
```ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: { include: ['src/**/*.test.ts', 'test/**/*.test.ts'] },
});
```

- [ ] **Step 2: Write the failing tests**

`apps/api/src/config/env.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { parseEnv } from './env.js';

describe('parseEnv', () => {
  it('applies defaults', () => {
    expect(parseEnv({})).toEqual({ PORT: 4000, LOG_LEVEL: 'info' });
  });
  it('reads values', () => {
    expect(parseEnv({ PORT: '8080', LOG_LEVEL: 'debug' })).toEqual({ PORT: 8080, LOG_LEVEL: 'debug' });
  });
  it('refuses an invalid port with a readable message', () => {
    expect(() => parseEnv({ PORT: 'abc' })).toThrow(/PORT/);
    expect(() => parseEnv({ PORT: '70000' })).toThrow(/PORT/);
  });
  it('refuses an unknown log level', () => {
    expect(() => parseEnv({ LOG_LEVEL: 'loud' })).toThrow(/LOG_LEVEL/);
  });
});
```

`apps/api/test/health.e2e.test.ts`:
```ts
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('GET /v1/health', () => {
  let app: NestFastifyApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.setGlobalPrefix('v1');
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });
  afterAll(async () => {
    await app.close();
  });
  it('answers ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });
  it('answers 404 for unknown routes without a stack trace', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/nope' });
    expect(res.statusCode).toBe(404);
    expect(res.body).not.toMatch(/at .*\.ts/);
  });
});
```

- [ ] **Step 3: Run and see them fail**

Run: `pnpm --filter api test`
Expected: FAIL, modules not found.

- [ ] **Step 4: Implement**

`apps/api/src/config/env.ts`:
```ts
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});
export type Env = z.infer<typeof schema>;

export const parseEnv = (source: Record<string, string | undefined>): Env => {
  const result = schema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment: ${problems}`);
  }
  return result.data;
};
```

`apps/api/src/health/health.controller.ts`:
```ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
```

`apps/api/src/app.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller.js';

@Module({ controllers: [HealthController] })
export class AppModule {}
```

`apps/api/src/main.ts`:
```ts
import 'reflect-metadata';
import helmet from '@fastify/helmet';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { parseEnv } from './config/env.js';

const env = parseEnv(process.env);
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: { level: env.LOG_LEVEL } }));
await app.register(helmet);
app.setGlobalPrefix('v1');
await app.listen(env.PORT, '0.0.0.0');
```

- [ ] **Step 5: Run and see them pass**

Run: `pnpm --filter api test && pnpm --filter api typecheck && pnpm --filter api build`
Expected: 6 tests pass; typecheck and build exit 0.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add the API service with a health endpoint and validated env"
```

---

### Task 6: Continuous integration

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: root scripts from Task 1; `e2e` from Task 4.

- [ ] **Step 1: Workflow**

`.github/workflows/ci.yml`:
```yaml
name: ci
on:
  push:
    branches: [main, "rebuild/**"]
  pull_request:
permissions:
  contents: read
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
      - run: pnpm --filter web exec playwright install --with-deps chromium
      - run: pnpm e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: apps/web/playwright-report
```

- [ ] **Step 2: Verify locally**

Run: `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm e2e`
Expected: every command exits 0.

- [ ] **Step 3: Commit and push**

```bash
git add -A && git commit -m "ci: lint, typecheck, test, build and end-to-end on every push"
git push -u origin rebuild/zakydev
```

Open the Actions tab and confirm the run is green. If it fails, fix the cause and push again; do not weaken a check.

---

### Task 7: Deployment proof (needs the owner)

This task cannot be completed without the owner's hosting account. Stop and ask for access before starting; do not invent credentials.

**Files:**
- Create: `docs/DEPLOY.md`

- [ ] **Step 1: Confirm with the owner** which host is used (the earlier decision was Cloudways Velocity), that `zakydev.com` points to it, and how secrets are entered. Record the answers in `docs/DEPLOY.md`.
- [ ] **Step 2: Deploy `apps/web`** as a Node app running `node apps/web/.next/standalone/apps/web/server.js` after copying `apps/web/public` and `apps/web/.next/static` next to it (verify the exact standalone path in the build output). Set `NEXT_PUBLIC_SITE_URL`.
- [ ] **Step 3: Deploy `apps/api`** running `node apps/api/dist/main.js` with `PORT` and `LOG_LEVEL`.
- [ ] **Step 4: Verify from outside**

```bash
curl -sI https://zakydev.com/en | head -n 1          # HTTP/2 200
curl -s  https://zakydev.com/ar | grep -o '<html[^>]*>'   # contains lang="ar" dir="rtl"
curl -s  https://api.zakydev.com/v1/health            # {"status":"ok"}
```

- [ ] **Step 5: Run Lighthouse (mobile) on `/en` and `/ar`** and record the scores in `docs/DEPLOY.md`. Gates: Performance ≥ 90, Accessibility 100, Best Practices 100, SEO 100.
- [ ] **Step 6: Commit**

```bash
git add docs/DEPLOY.md && git commit -m "docs: record the deployment procedure and first results"
```
