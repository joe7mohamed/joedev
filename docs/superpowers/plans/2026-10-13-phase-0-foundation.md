# ZakyDev Phase 0 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old Vite app with an npm-workspaces/Turborepo monorepo (Next.js web app and a shared package) that serves a tested bilingual placeholder page with the ZakyDev tokens, fonts, themes and typed content.

**Architecture:** `apps/web` is a statically generated Next.js App Router site with `/en` and `/ar`, deployed to Cloudways Velocity (Starter) as one Node app running `next start`. `packages/shared` holds locale constants and the zod-validated home content. There is no API service in Phase 0 or Phase 1 (owner decision 2026-10-16); it is added with the contact form in a later phase, and `apps/` keeps room for it.

**Tech Stack:** Node 24 LTS with its bundled npm 11 (workspaces), Turborepo 2, TypeScript 7, Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, zod 4, Biome 2, Vitest 5, Playwright, GitHub Actions. Locale routing is our own (`[locale]` segment + `proxy.ts`); no i18n library.

**Spec:** `docs/superpowers/specs/2026-10-13-zakydev-home-design.md` (read sections 3, 4, 6, 7 before starting). Visual reference: `docs/prototype/home-v23/`.

## Stack notes (checked against current docs on 2026-10-16)

Versions at that date: next 16.4.2, react 19.3.1, typescript 7.0.2, tailwindcss 4.3.3, @biomejs/biome 2.5.15, vitest 5.0.5, @playwright/test 1.64.1, turbo 2.11.8, zod 4.6.7; Node 24 bundles npm 11.19. Still check each before installing and record what was installed. Because of `min-release-age=3` (below), npm resolves anything published in the last three days to its previous version. That is intended.

- **npm 11** (bundled with Node 24, the same npm Cloudways Velocity runs). Owner decision 2026-10-16: npm, not pnpm. Do not install npm 12 globally: it is `latest`, but the host runs npm 11.
  - Workspaces are declared in the root `package.json`. An internal package is referenced as `"@zakydev/shared": "*"`, because `workspace:*` is pnpm-only and npm rejects it.
  - Keep the range `*`. A range the local package cannot satisfy makes npm fetch a public package of that name instead, and the `@zakydev` scope is unclaimed on npmjs.org.
  - Install with `npm install <pkg> -w <workspace>` and run with `npm run <script> -w <workspace>` or `npm exec -w apps/web -- <bin>`. Always run from the repo root; there is one `package-lock.json`.
  - The root `.npmrc` (Task 1) holds the supply-chain defaults: exact versions, a three-day minimum release age, no git or remote tarball dependencies, and no unreviewed install scripts.
    - None of our tools need an install script (checked: next, sharp, vitest, biome, playwright, tailwind, typescript, turbo).
    - If npm reports one, run `npm install-scripts ls` and approve it in the root `allowScripts` only if it is truly needed.
  - Turborepo needs the root `devEngines.packageManager` field.
  - Biome's `noUndeclaredDependencies` catches imports a workspace did not declare. npm hoists, so a missing declaration would otherwise go unnoticed.
    - It does not read JSON, so `@zakydev/config` (used only by `tsconfig.json` `extends`) is declared by hand.
    - If it wrongly flags the `@/…` path alias, report it rather than turning the rule off.
- **TypeScript 7** is the native compiler.
  - It has no JS API and no editor plugins, so the `next` editor plugin is inactive. `next build` uses the `tsc` command line and supports TS 7.
  - Defaults changed: `types` is `[]`, so every package that uses Node globals sets `"types": ["node"]`. `strict` is on, and `baseUrl` is removed.
  - Before `tsc --noEmit`, the web app runs `next typegen` so route types and `next-env.d.ts` exist on a clean checkout.
- **Next.js 16.**
  - The interception file is `src/proxy.ts`, exporting `proxy`. It runs on Node.js and must sit beside `src/app`.
  - Because the root layout lives in `app/[locale]/`, an unknown URL needs `app/global-not-found.tsx` with `experimental.globalNotFound: true` (documented for exactly this case; still marked experimental).
  - `next build` no longer prints First Load JS sizes. Phase 1 measures them with a script.
  - No `output: 'standalone'`. Cloudways Velocity runs the app with `next start` behind NGINX + PM2 and gives it a `PORT`. `next start` reads `PORT`, so no port is hard-coded. Next finds the monorepo root from `package-lock.json`, with no extra config.
  - `next/image` serves only WebP unless `images.formats` lists AVIF. Use `preload`, not the deprecated `priority`.
  - Amiri and IBM Plex Sans Arabic are not variable fonts, so `weight` is required.
- **Biome 2.**
  - Use `files.includes` with `!` exclusions; `files.ignore` no longer exists. Enable VCS ignore-file support.
  - Set `css.parser.tailwindDirectives: true`, or `@theme` fails to parse.
- **Tailwind 4.3.** `start-*`/`end-*` are deprecated; use `inset-s-*`/`inset-e-*`. `ms-*`, `pe-*` and `size-*` are unchanged.
- **zod 4.** Use `z.url()` and `z.email()`. `z.string().url()` and `.email()` are deprecated.
- **Vitest 5.** `vite` is a peer dependency, so install it next to `vitest`. A config file is not looked up in parent folders.
- **GitHub Actions.** Use `actions/checkout@v7`, `actions/setup-node@v7` (`cache: npm`) and `actions/upload-artifact@v7`. Install with `npm ci`, then run `npm audit signatures`. Do not cache Playwright browsers; Playwright's docs advise against it.
- **Turborepo** strict env mode passes `CI`, `NEXT_*`, `GITHUB_*`, `PATH` and `HOME` through. `PLAYWRIGHT_*` must be declared in `passThroughEnv`. Its cache hashes git-tracked files, so `.next/` and `.turbo/` must be gitignored before the first build.

## Global Constraints

- Work on branch `rebuild/zakydev`; never commit to `main`.
- Use the current stable release of every dependency. Before installing a framework, look up its current docs (Context7) and adapt config syntax if it differs from this plan; record the installed versions in `docs/VERSIONS.md`.
- No secrets in the repository. `.env.example` lists names only.
- No third-party runtime requests from the web app (no CDN scripts, no Google Fonts links).
- No animation library and no three.js in this phase.
- Colours, fonts and mark geometry exactly as in spec section 3.
- Logical CSS properties only (`ms-`, `pe-`, `inset-s-`, `inset-e-`).
- Commit message format: `<type>: <description>` (feat, fix, refactor, docs, test, chore, perf, ci).
- Email address anywhere in code or content: `youssef@zakydev.com`.

## Review Focus

- A request to `/` with `Accept-Language: ar` must land on `/ar`; with anything else, `/en`. (Task 4)
- An unknown locale such as `/fr` must return 404, not crash. (Task 4)
- A visitor whose system theme is light must get light on first paint with no flash. (Task 4)
- Content with a missing Arabic key must fail the build, not render `undefined`. (Task 3)
- The end-to-end tests run against a production build served by `next start`, which is what Velocity runs, not `next dev`. (Task 4)
- `www.zakydev.com` must permanently redirect to `https://zakydev.com`. (Task 4)

---

### Task 1: Branch, remove the old app, monorepo root

**Files:**
- Delete: `src/`, `api/`, `public/`, `index.html`, `vite.config.ts`, `tailwind.config.ts`, `eslint.config.js`, `vercel.json`, `emailjs-template.html`, `components.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `package.json`, `package-lock.json`, `README.md`, `DEPLOYMENT.md`, `PRODUCTION_SETUP.md`, `node_modules/`
- Create: `package.json`, `.npmrc`, `turbo.json`, `.nvmrc`, `biome.json`, `.env.example`, `README.md`, `docs/VERSIONS.md`, `packages/config/tsconfig.base.json`, `packages/config/package.json`
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

`.npmrc` (supply-chain defaults; npm 11.19+ understands every key; npm 10 would silently ignore them, which is why Node 24 is required):
```
save-exact=true
engine-strict=true
fund=false
min-release-age=3
allow-git=none
allow-remote=none
strict-allow-scripts=true
```

`package.json` (the `start` script is what Velocity runs; `devEngines` is required by Turborepo):
```json
{
  "name": "zakydev",
  "private": true,
  "type": "module",
  "workspaces": ["apps/*", "packages/*"],
  "engines": { "node": ">=24" },
  "devEngines": { "packageManager": { "name": "npm", "version": ">=11.19.0" } },
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "start": "npm run start -w web",
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
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**", "!.next/cache/**"], "env": ["REQUIRE_CONFIRMED", "NEXT_PUBLIC_*", "NODE_ENV"] },
    "typecheck": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"] },
    "e2e": { "dependsOn": ["build"], "cache": false, "passThroughEnv": ["PLAYWRIGHT_*"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

`biome.json` (Biome 2 syntax; `$schema` points at the installed copy so it always matches the version):
```json
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": { "includes": ["**", "!docs/prototype", "!**/dist", "!**/.next", "!**/test-results", "!**/playwright-report"] },
  "formatter": { "indentStyle": "space", "indentWidth": 2, "lineWidth": 110 },
  "javascript": { "formatter": { "quoteStyle": "single", "semicolons": "always" } },
  "css": { "parser": { "tailwindDirectives": true } },
  "linter": { "rules": { "recommended": true, "correctness": { "noUndeclaredDependencies": "error" } } }
}
```

`.env.example`:
```
# apps/web
NEXT_PUBLIC_SITE_URL=
# set to 1 for production builds: the build fails while any text is still unconfirmed
REQUIRE_CONFIRMED=
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
next-env.d.ts
test-results/
playwright-report/
```

`README.md`:
```markdown
# ZakyDev

Personal site of Youssef Zaky. Monorepo: `apps/web` (Next.js) and `packages/shared`
(content and schemas). An API service joins `apps/` in a later phase.

    nvm use            # Node 24 from .nvmrc (bundles npm 11)
    npm ci
    npm run dev        # web on :3000
    npm run lint && npm run typecheck && npm test && npm run build

Design: `DESIGN.md`. Spec and plans: `docs/superpowers/`. Visual reference: `docs/prototype/home-v23/`.
```

- [ ] **Step 4: Install tooling and record versions**

```bash
node -v && npm -v        # 24.x and 11.19+; stop and report if not
npm install -D turbo typescript @biomejs/biome
```

If npm reports a dependency with an unreviewed install script, run `npm install-scripts ls`. Approve it in the root `allowScripts` only if the package cannot work without it, and note why in `docs/VERSIONS.md`. Do the same in every later task.

Create `docs/VERSIONS.md` with a table of package and installed version (from `npm ls --workspaces --include-workspace-root --depth 0`) and the Node and npm versions. Append to it in every later task that installs something.

- [ ] **Step 5: Verify**

Run: `npm run lint`
Expected: exits 0 ("Checked N files", no errors). If Biome reports a schema or key mismatch for its current version, run `npx biome migrate --write` and re-run.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: replace the Vite app with an npm workspaces and Turborepo monorepo"
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
{ "extends": "@zakydev/config/tsconfig.base.json", "compilerOptions": { "noEmit": true, "types": ["node"] }, "include": ["src"] }
```

(`types` is needed under TypeScript 7, whose default is `[]`; the tests use `structuredClone`, which comes from `@types/node` here.)

`packages/shared/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({ test: { include: ['src/**/*.test.ts'] } });
```

```bash
npm install zod -w packages/shared
npm install -D vitest vite typescript @types/node -w packages/shared
npm pkg set 'devDependencies.@zakydev/config=*' -w packages/shared && npm install
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

Run: `npm run test -w @zakydev/shared`
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

Run: `npm run test -w @zakydev/shared`
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

Run: `npm run test -w @zakydev/shared`
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

Run: `npm run test -w @zakydev/shared && npm run typecheck -w @zakydev/shared`
Expected: all tests pass, typecheck exits 0.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add typed bilingual home content with a confirmation gate"
```

---

### Task 4: Web app — scaffold, tokens, fonts, locales, themes, placeholder page

**Files:**
- Create: `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/next.config.ts`, `apps/web/postcss.config.mjs`, `apps/web/src/app/globals.css`, `apps/web/src/app/global-not-found.tsx`, `apps/web/src/app/[locale]/layout.tsx`, `apps/web/src/app/[locale]/page.tsx`, `apps/web/src/app/[locale]/not-found.tsx`, `apps/web/src/proxy.ts`, `apps/web/src/lib/fonts.ts`, `apps/web/src/lib/theme-script.ts`, `apps/web/src/components/Mark.tsx`, `apps/web/src/components/ThemeToggle.tsx`, `apps/web/public/projects/{nuammer,wazifi,talmeeha}.jpg`, `apps/web/public/icons/*.svg`, `apps/web/playwright.config.ts`
- Test: `apps/web/e2e/foundation.spec.ts`

**Interfaces:**
- Consumes: `LOCALES`, `isLocale`, `dirOf`, `pickLocale`, `getHome`, `plain` from `@zakydev/shared`.
- Produces: `<Mark size?: number className?: string />`; CSS variables of spec 3.2 on `:root` and `[data-theme="light"]`; font-face variables `--face-display`, `--face-body`, `--face-mono`, `--face-display-ar`, `--face-body-ar` and the per-language stacks `--stack-display`, `--stack-body`, `--lh-display`, `--lh-body`; `data-theme` attribute on `<html>` set before paint.

Before writing config, read the current Next.js docs, which ship inside the package at `node_modules/next/dist/docs/`, for:
- App Router project structure and `global-not-found`
- `next/font/google`
- `proxy.ts`
- `next start` and the `PORT` variable
- "Preventing flash before hydration"
- Tailwind 4 with PostCSS

Adjust to the installed version.

- [ ] **Step 1: Create the app and copy assets**

```bash
All from the repo root:
```bash
npm init -y -w apps/web
npm install next react react-dom -w apps/web
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss @playwright/test @axe-core/playwright -w apps/web
npm pkg set 'dependencies.@zakydev/shared=*' 'devDependencies.@zakydev/config=*' -w apps/web && npm install
npm exec -w apps/web -- playwright install chromium
mkdir -p apps/web/public/projects apps/web/public/icons apps/web/public/brand
cp docs/prototype/home-v23/img/*.jpg apps/web/public/projects/
cp docs/prototype/home-v23/icons/*.svg apps/web/public/icons/
cp docs/prototype/home-v23/brand/*.svg apps/web/public/brand/
```

In `apps/web/package.json`:
- Set `"name": "web"`, `"private": true` and `"type": "module"`.
- Remove the `main` field and the dummy `test` script that `npm init` writes.
- Add the scripts below.

`start` is what Velocity runs (through the root `start` script). Next reads `PORT` from the environment and falls back to 3000 locally. `typecheck` generates Next's route types first, so it works on a clean checkout.
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "typecheck": "next typegen && tsc --noEmit",
  "e2e": "playwright test"
}
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
  // In CI, Turborepo has already built the app (`e2e` depends on `build`); locally, build first.
  webServer: { command: process.env.CI ? 'npm start' : 'npm run build && npm start', url: 'http://localhost:3000/en', reuseExistingServer: !process.env.CI, timeout: 180_000 },
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

test('unknown locale is a 404 with our own page, not the built-in one', async ({ page }) => {
  const response = await page.goto('/fr');
  expect(response?.status()).toBe(404);
  // only our global-not-found runs the theme script; the built-in page has no data-theme
  await expect(page.locator('html')).toHaveAttribute('data-theme', /^(dark|light)$/);
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

test('www redirects permanently to the bare domain', async ({ request }) => {
  const response = await request.get('/en', { headers: { host: 'www.zakydev.com' }, maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe('https://zakydev.com/en');
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

Run: `npm run e2e -w web`
Expected: FAIL (no app to build).

- [ ] **Step 4: Config, fonts, tokens**

`apps/web/tsconfig.json`:
```json
{
  "extends": "@zakydev/config/tsconfig.base.json",
  "compilerOptions": { "lib": ["dom", "dom.iterable", "ES2023"], "jsx": "react-jsx", "types": ["node"], "noEmit": true, "incremental": true, "plugins": [{ "name": "next" }], "paths": { "@/*": ["./src/*"] } },
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
  // no `preload`: joining the browser preload list is the owner's later, deliberate choice
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const config: NextConfig = {
  transpilePackages: ['@zakydev/shared'],
  poweredByHeader: false,
  // the root layout lives in app/[locale]/, so unknown URLs need app/global-not-found.tsx
  experimental: { globalNotFound: true },
  // the default is WebP only
  images: { formats: ['image/avif', 'image/webp'] },
  async headers() {
    return [{ source: '/(.*)', headers: security }];
  },
  // one canonical host; Velocity serves both names
  async redirects() {
    return [{ source: '/:path*', has: [{ type: 'host', value: 'www.zakydev.com' }], destination: 'https://zakydev.com/:path*', permanent: true }];
  },
};

export default config;
```

Next finds the monorepo root from `package-lock.json` and uses it for both `outputFileTracingRoot` and `turbopack.root` (checked with npm workspaces and `transpilePackages`). Do not set them unless the build warns; if you do set one, set both to the same value. The `jsx`, `types` and `plugins` values in `tsconfig.json` are what Next 16 writes itself. The `next` plugin does nothing under TypeScript 7, which is expected. If Next's generated files under `.next/types` fail with `exactOptionalPropertyTypes`, stop and report it. Do not switch the option off silently.

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

`next/font` downloads the files at build time and serves them from the site, so there are no runtime requests to Google. The build therefore needs network access, and a failed fetch fails it. Amiri and IBM Plex Sans Arabic are not variable fonts, so `weight` is required. Both use `preload: false`: a font in the root layout is otherwise preloaded on every route, including `/en`. Their `@font-face` rules still ship on `/en`, but the files download only where the Arabic stack is applied (`html[lang="ar"]`).

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

This is the pattern from the Next guide "Preventing flash before hydration". In development only, React Strict Mode remounts and can clear attributes on `<html>`. If `data-theme` disappears in `next dev`, re-apply the stored theme in a `useLayoutEffect` in `ThemeToggle`, as the guide shows. The production tests are not affected.

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

That page handles `notFound()` inside a valid locale. URLs that match no route at all, such as `/fr`, never reach a layout, so they need their own complete document.

`apps/web/src/app/global-not-found.tsx`:
```tsx
import type { Metadata } from 'next';
import { Mark } from '@/components/Mark';
import { body, display, mono } from '@/lib/fonts';
import { themeScript } from '@/lib/theme-script';
import './globals.css';

export const metadata: Metadata = { title: '404 | ZakyDev' };

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr" className={[display.variable, body.variable, mono.variable].join(' ')} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static string defined in this repo, must run before paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <main className="grid min-h-svh place-items-center gap-6 p-6">
          <a href="/en" aria-label="ZakyDev">
            <Mark size={48} />
          </a>
          <h1 className="font-display text-5xl">404</h1>
        </main>
      </body>
    </html>
  );
}
```

The playful 404 is a later phase (spec section 2), and this page invents no copy.

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

Because `dynamicParams = false`, `/fr` is not generated and returns 404, rendered by `global-not-found.tsx`. `proxy.ts` sits in `src/` because `app/` does; Next silently ignores it anywhere else.

- [ ] **Step 7: Run the tests**

Run: `npm run typecheck -w web && npm run e2e -w web`
Expected: typecheck exits 0; 18 tests pass (9 per project). If axe reports a contrast violation, fix the token usage on the page, not the test.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: scaffold the web app with tokens, fonts, locales and themes"
```

---

### Task 5: Removed — API deferred

The owner decided on 2026-10-16 that Phase 0 and Phase 1 have no API service. Nothing on the home page calls one. The API (`apps/api`, NestJS on Fastify) arrives with the contact form, and spec section 6.6 keeps its requirements. Task numbers stay as they are, so Task 7 is still the deployment stop.

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
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      # registry signatures of every installed package
      - run: npm audit signatures
      # the lockfile must keep the Linux binaries Velocity needs (guards against a damaged lockfile)
      - run: grep -q '"node_modules/@next/swc-linux-x64-gnu"' package-lock.json
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
      - run: npm exec -w apps/web -- playwright install --with-deps chromium
      - run: npm run e2e
      - uses: actions/upload-artifact@v7
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: apps/web/playwright-report
```

- [ ] **Step 2: Verify locally**

Run: `npm ci && npm run lint && npm run typecheck && npm test && npm run build && npm run e2e`
Expected: every command exits 0.

- [ ] **Step 3: Commit and push**

```bash
git add -A && git commit -m "ci: lint, typecheck, test, build and end-to-end on every push"
git push -u origin rebuild/zakydev
```

Open the Actions tab and confirm the run is green. If it fails, fix the cause and push again; do not weaken a check.

---

### Task 7: Deployment proof on Cloudways Velocity (needs the owner)

This task cannot be done without the owner's Cloudways and Cloudflare accounts. Stop and ask before starting. Never invent credentials, and never ask for passwords in chat: the owner clicks through the dashboards while you give the exact values.

Owner decisions (2026-10-16):
- **Host:** Cloudways Velocity, **Starter** plan (2 GB, 2 vCPU, 5 apps; personal projects and portfolio). One app now; the API becomes a second app later.
- **Domain:** `zakydev.com` is registered at Cloudflare, and DNS stays there. Velocity does not need the nameservers moved.
- **Email:** Google Workspace runs on the domain (`youssef@zakydev.com`). Its MX, SPF, DKIM, DMARC and `google-site-verification` records must not be changed.

Sources: Cloudways support articles "How to launch an application on Cloudways Velocity", "How to manage deployments…", "How to add a domain…", "Manage Cloudflare Enterprise on Cloudways Velocity" and "How to configure Web Rules…", plus the official template github.com/CloudwaysbyDO/cloudways-next-template. Re-read them before starting; the product is new and changes.

**Files:**
- Create: `docs/DEPLOY.md`

- [ ] **Step 1: Prepare.**
  - Confirm CI is green on `rebuild/zakydev`.
  - In Cloudflare DNS, take a screenshot or export of the current records, so nothing about email can be lost.
  - Start `docs/DEPLOY.md` with what follows: the app settings, the DNS records added, and the records that must never be touched.

- [ ] **Step 2: Create the app.**
  - In Velocity, launch an application from the GitHub repository, pick the server location closest to Bahrain from the list offered, and record it.
  - Deployment settings:
    - Framework preset: Next.js
    - Branch: `rebuild/zakydev` for now, `main` after the Phase 1 merge
    - Node version: **24.x**
    - Package manager: **npm**
    - Root directory: `./`, the repo root, because the workspaces and the lockfile live there
    - Build command: `npm run build`
    - Start command: `npm start`
  - Leave auto-deploy **off** until Phase 1 is merged; deploy with Redeploy. Do not hard-code a port: Velocity gives the app its `PORT`, and `next start` reads it.

- [ ] **Step 3: Environment variables** (dashboard, Environment Variables; used at build and at run time):
  - `NEXT_PUBLIC_SITE_URL=https://zakydev.com`
  - Leave `REQUIRE_CONFIRMED` unset until Phase 1 Task 14.
  - `NEXT_PUBLIC_*` values are baked in at build time, so set them before the first deploy and redeploy after any change.

- [ ] **Step 4: First deploy on the temporary `*.cloudwaysnodeapps.com` address.**
  - Read the build log.
  - **If the build fails because TypeScript or Tailwind is missing**, Velocity installed without devDependencies. Change the build command to `npm ci --include=dev && npm run build` and record that.
  - Watch memory in the Monitoring tab during the build. Starter has 2 GB shared by the build and the running app; record the peak.
  - Check `/en`, `/ar`, `/`, and `/fr` (must be 404) on the temporary address.

- [ ] **Step 5: Connect the domain.**
  - In Velocity Domain Management, add `zakydev.com` and `www.zakydev.com`. Velocity then shows the DNS records to create; at the time of writing that is a CNAME for `@` and for `www` to `secure.cloudwaysnodeapps.com`, or A records if the apex CNAME is refused. **Copy the values from the dashboard, not from this plan.**
  - In Cloudflare DNS:
    1. Delete only the existing **A, AAAA or CNAME** records on `@` and `www`, if there are any.
    2. Add the Velocity records with **Proxy status: DNS only (grey cloud)**. Cloudways requires this: its CDN is its own Cloudflare Enterprise account, and an orange cloud in our zone would sit in front of it.
    3. Do **not** touch any MX record, any TXT record (SPF `v=spf1 … include:_spf.google.com`, DMARC `_dmarc`, DKIM `google._domainkey`, `google-site-verification`), or any other subdomain.
  - Wait until Velocity marks the domain Active (up to 24 h; it emails on success).

- [ ] **Step 6: CDN settings** (Velocity, Cloudflare Enterprise panel):
  - Caching on.
  - Image Optimization (Polish) **Off**, because Next already optimises images.
  - Leave WAF, rate limiting and Browser Integrity Check at their defaults.
  - Velocity does not cache HTML at the edge, and nothing documents a purge on deploy. After every deploy, press **Purge** so optimised images and other cached files are fresh. Write this into `docs/DEPLOY.md`.

- [ ] **Step 7: Verify from outside**

```bash
curl -sI https://zakydev.com/en | head -n 1                                         # HTTP/2 200
curl -s  https://zakydev.com/ar | grep -o '<html[^>]*>'                             # lang="ar" dir="rtl"
curl -sI -H 'Accept-Language: ar-BH' https://zakydev.com/ | grep -i '^location'     # /ar
curl -sI https://zakydev.com/fr | head -n 1                                         # 404
curl -sI https://www.zakydev.com/en | grep -i '^location'                           # https://zakydev.com/en
curl -sI https://zakydev.com/en | grep -i 'strict-transport-security'               # no "preload"
dig +short MX zakydev.com                                                           # still the Google Workspace hosts
```

Then ask the owner to send a test email to `youssef@zakydev.com` from another account and confirm that it arrives.

- [ ] **Step 8: Run Lighthouse (mobile) on `https://zakydev.com/en` and `/ar`** and record the scores and the server location in `docs/DEPLOY.md`. Gates: Performance ≥ 90, Accessibility 100, Best Practices 100, SEO 100. HTML is served from the origin, not the CDN, so if LCP or TTFB misses the gate, record the time to first byte. Discuss the server location with the owner before changing code.

- [ ] **Step 9: Commit**

```bash
git add docs/DEPLOY.md && git commit -m "docs: record the Velocity deployment and first results" && git push
```
