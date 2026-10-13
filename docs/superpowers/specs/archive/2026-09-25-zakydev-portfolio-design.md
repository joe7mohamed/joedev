# ZakyDev — Portfolio Rebuild: UI/UX and Architecture Blueprint

Date: 2026-09-25 (revision 2, after independent reviews by Codex and the architect agent)
Status: for owner approval (no implementation started)
Owner: Youssef Zaky
Repo: `/home/joe/projects/joedev` (github.com/joe7mohamed/joedev)

Decisions already taken by the owner on 2026-09-25:

| Decision | Choice |
|---|---|
| Brand / domain | **ZakyDev**, `zakydev.com` (buy `youssefzaky.com` too, redirect) |
| Hosting | Cloudways Velocity Starter ($20/mo, 5 apps) |
| Database | PostgreSQL + Drizzle |
| Hero | Real WebGL 3D (React Three Fiber) with poster fallback |
| Stack | Next.js 16 web + NestJS 12 API in one pnpm/Turborepo monorepo |
| Theme | Gold / black / white, true light and dark modes |
| Languages | English + Arabic (RTL), URL-prefixed |

Release definition:
- **v1.0** = Phases 0, 1, 2, 3, 4, 6, 8a, 8b, 9. Terminal ships as a route and full-screen sheet. Lab entry points are behind a feature flag (off). Case-study architecture sections are static figures.
- **v1.1** = Phase 5 (floating terminal window) and Phase 7 (interactive Engineering Lab), plus the `/v1/projects` showcase endpoints.

---

## A. Existing project audit

### What is there
- Vite 6 + React 19 + TypeScript SPA. Tailwind 4 with an orphaned `tailwind.config.ts` (never loaded, so the intended green brand never applied). shadcn "new-york" set, Redux Toolkit, framer-motion 12, react-router 7.
- Two Vercel serverless functions (`api/contacts.js`, `api/admin.js`) writing to MongoDB Atlas.
- All verified personal content in one untyped file, `src/data/portfolio.ts` (bio, 4 projects, skills, 2 jobs, education, volunteering, contacts). Longer job descriptions exist in git history (`6f589f6`).
- No tests, no i18n, no SSR, no sitemap, OG images referenced but missing, all project images are placeholder SVGs.

### What must be preserved
Only content. Verbatim source of truth is `src/data/portfolio.ts` plus the fuller text in `git show 6f589f6:src/data/portfolio.ts`. No component, store, style or API code is worth carrying over.

### Problems that block reuse
1. **Leaked secret.** Real MongoDB Atlas credentials committed in `DEPLOYMENT.md` (commit `888cc10`) on a public repo. Action for owner: rotate or delete the `joedb` Atlas user now. Not negotiable and independent of this rebuild.
2. **Unauthenticated PII endpoint.** `GET /api/contacts` returns all submissions (name, email, message, IP, user agent) with CORS `*`.
3. Admin login posts to a route that does not exist; dashboard would crash on an empty `SelectItem` value.
4. Redux holds one boolean; an 800 ms fake splash delays LCP on every visit.
5. Ten unused runtime dependencies (express, nodemailer, bcryptjs, yup, react-hook-form, ...).
6. Docs (README, DEPLOYMENT, PRODUCTION_SETUP) describe three different backends; none match the code.

### Content gaps (owner must supply; placeholders until then)
- Professional photo (hero/about) and a square avatar for OG/social.
- Real screenshots or recreated mock screens for Nuammer, PPMS, hospital site.
- CV PDF (EN, optionally AR).
- Canonical display name: proposal is **Youssef Zaky** everywhere (legal name only in JSON-LD `alternateName`).
- One public GitHub handle (`youssef7mohamed` vs `joe7mohamed`).
- Arabic copy review: Claude drafts all Arabic strings; the owner (native speaker) approves before launch. Launch is blocked until approved.
- WhatsApp number exists in the data file but is unpublished. Owner decides whether it appears (recommended for the Gulf/Egypt market).

### Verdict
Fresh build in a new monorepo layout inside the same repo. The old `src/`, `api/`, and Vite config are deleted in Phase 1 after the content is migrated and a checklist proves every field in `portfolio.ts` has a destination.

---

## B. Creative direction

### Positioning
Not "a developer portfolio". A **software engineer's studio**: quiet, precise, expensive-feeling, with one signature moment (the 3D core) and two depths for technical visitors (the terminal and, in v1.1, the Engineering Lab). Business owners get clarity and proof in 5 seconds; engineers get something to poke at.

### How the four directions combine
| Direction | Role in the product | Where it is NOT allowed |
|---|---|---|
| Minimal Premium | The base layer: typography, whitespace, hairline gold, warm neutrals | Nowhere; it is the default |
| 3D Futuristic | One hero object and a few depth cues (parallax on cards, glass panels) | No 3D backgrounds on inner pages, no particles everywhere |
| Portfolio OS | The interaction language: a dock, a command palette (⌘K), the terminal as a window (v1.1) or sheet (v1.0) | No full desktop metaphor, no draggable icons, no fake start menu |
| Developer Terminal | One "app" in the OS layer, also reachable at `/terminal` | Never the only path to any content |

### Brand system
- Wordmark: `zakydev_` in Geist Medium, lowercase, with the trailing underscore as a blinking gold cursor (600 ms on / 600 ms off, stops under reduced motion). The cursor is the brand mark; it also appears as the terminal prompt cursor, the section-heading marker and the favicon (gold underscore on black).
- Terminal prompt: `youssef@zakydev:~$`.
- Tagline EN: **Engineering digital experiences.** Supporting: *Building scalable systems, intuitive interfaces, and intelligent applications.*
- Tagline AR (draft, owner to approve): **أهندس التجارب الرقمية.** Supporting: *أبني أنظمة قابلة للتوسع، وواجهات بديهية، وتطبيقات ذكية.*
- Voice: short sentences, engineering verbs (build, ship, design, secure), no buzzword lists.

### Metallic gold rule
Gold is never a fill for large areas and never a background for white text. It is: hairlines, underlines, the cursor, focus rings, small filled pills with black text, the logotype gradient, and the light in the 3D scene. Budget: under 10 % of any viewport.

---

## C. Design system

Tokens live in `apps/web/src/styles/tokens.css` and are mirrored in `DESIGN.md` at repo root (Stitch DESIGN.md structure, forked from the Vercel entry in awesome-design-md with the accent role swapped to gold).

### Color tokens (oklch, with hex reference)
Gold scale (same in both themes; semantic tokens pick from it):

| Token | oklch | hex | Use |
|---|---|---|---|
| `--gold-200` | 0.87 0.11 90 | #F0D27A | gradient highlight stop |
| `--gold-300` | 0.82 0.13 90 | #E5C158 | dark-mode highlight text |
| `--gold-400` | 0.77 0.14 91 | #D4AF37 | dark-mode accent text, lines in both themes |
| `--gold-500` | 0.68 0.13 88 | #B8962E | gradient shadow stop, hover on dark |
| `--gold-600` | 0.60 0.13 85 | #A67C00 | light-mode UI graphics (3:1 on paper) |
| `--gold-700` | 0.55 0.10 87 | #8A6D1F | light-mode accent text, links (4.65:1 on paper) |
| `--gold-800` | 0.50 0.09 87 | #7A5F14 | light-mode small text on gold-tinted surfaces |

Neutrals and semantic tokens:

| Semantic | Dark | Light |
|---|---|---|
| `--background` | oklch(0.13 0.003 80) ≈ #0F0E0C warm near-black | oklch(0.98 0.004 90) ≈ #FAF9F6 paper |
| `--surface` | oklch(0.17 0.004 80) ≈ #171613 | oklch(1 0 0) #FFFFFF |
| `--surface-glass` | surface at 72 % + `backdrop-filter: blur(16px)` | same |
| `--foreground` | oklch(0.97 0.003 90) ≈ #F6F4EF | oklch(0.15 0.004 80) ≈ #14120E |
| `--muted-foreground` | oklch(0.70 0.01 85) ≈ #A8A49A | oklch(0.45 0.01 80) ≈ #625E55 |
| `--border` | oklch(0.26 0.005 80) ≈ #2A2823 | oklch(0.90 0.006 85) ≈ #E4E0D6 |
| `--accent` (text) | `--gold-400` | `--gold-700` |
| `--accent-strong` | `--gold-300` | `--gold-800` |
| `--accent-line` | `--gold-400` @ 55 % alpha | `--gold-400` @ 70 % alpha |
| `--accent-fill` | `--gold-400`, text always `#0F0E0C` | `--gold-400`, text `#0F0E0C` |
| `--ring` | `--gold-400` | `--gold-600` |
| `--destructive` | oklch(0.62 0.20 25) | oklch(0.52 0.20 25) |
| `--success` | oklch(0.72 0.14 150) | oklch(0.52 0.14 150) |

Logotype gradient: `linear-gradient(135deg, #8A6D1F 0%, #D4AF37 45%, #F0D27A 55%, #B8962E 100%)`. Used on the wordmark hover state, one H1 word per page at most, and the OG image.

Contrast checks (computed): gold-400 on dark bg 9.4:1; gold-700 on paper 4.65:1 (AA body); gold-600 on paper 3.6:1 (UI graphics); black on gold-400 9.4:1. White on any gold is banned.

### Typography
- Latin UI and display: **Geist** (variable), `next/font/google`, `--font-sans`, preloaded.
- Code, terminal, technical labels: **Geist Mono**, `--font-mono`, preloaded.
- Arabic UI and display: **IBM Plex Sans Arabic** (400, 500, 600, 700), `--font-arabic`, declared with `preload: false`. The `[locale]` layout applies the Arabic font class only when `locale === 'ar'`, so English pages never download it. The single Arabic label in the language switcher on English pages renders in the system fallback; this is accepted.
- Fluid type scale (clamp, rem): display 3.0→5.5, h1 2.4→4.0, h2 1.8→2.6, h3 1.35→1.6, body 1.0→1.0625, small 0.875, mono 0.9375.
- Arabic overrides: body line-height 1.75 (Latin 1.55), headings 1.35 (Latin 1.1), `letter-spacing: 0` always, minimum 16 px on mobile. Western digits in both languages.
- Verification: both locales' font waterfalls are inspected in Phase 2.

### Spacing, grid, radii, elevation
- Spacing: Tailwind default scale. Section rhythm `py-24 md:py-32 lg:py-40`.
- Container `max-w-[75rem]`, gutters 16 / 24 / 32 px. 12-column grid; hero and about use 7 + 5.
- Radii: `--radius-sm 6px`, `--radius 10px`, `--radius-lg 14px`, `--radius-xl 20px`, `--radius-window 16px`, pills `9999px`.
- Elevation: 1 px borders first. Shadows only for floating chrome (dock, window, palette). Glass surfaces get a 1 px top highlight in dark mode.
- Iconography: `lucide-react` only, 1.5 px stroke, 20 px default, 16 px in dense chrome. Tech logos only inside the stack component via `react-icons/si`, monochrome.

### Components (shadcn base, restyled)
- Button: `primary` = `--accent-fill` with black text; `secondary` = transparent, `--border`, hover `--accent-line`; `ghost`; `link` with gold underline offset 4 px. Height 40 px, 44 px on touch. Focus ring 2 px `--ring` offset 2 px.
- Card: `--surface`, 1 px `--border`, radius `--radius-lg`; hover on pointer devices: border → `--accent-line`, translate −2 px.
- Pill/badge: 1 px border, mono 12 px uppercase, tracking 0.08em (Latin only).
- Window (v1.1): radius `--radius-window`, glass surface, 40 px title bar, three neutral 10 px dots, mono title, close button with 44 px hit area.
- Dock: 56 px glass pill, 6 icons at 24 px with mono tooltips; active item has a 4 px gold dot.
- Terminal: mono 15 px, line-height 1.6, prompt in gold, output in foreground, errors in `--destructive`, links underlined gold; chrome LTR, each output line `dir="auto"`.
- Form fields: 44 px, `--surface`, border, gold focus ring, inline error 13 px with icon; labels always visible.

### Motion principles
- Durations: 120 ms micro, 200 ms UI, 320 ms panels, 600 ms hero/section reveals. Easing `cubic-bezier(0.22, 1, 0.36, 1)` enters, `cubic-bezier(0.4, 0, 1, 1)` exits.
- Reveal-on-scroll: opacity + 12 px translate, once, stagger 40 ms, max 6 children. No parallax on text.
- Hover: transforms and colors only. No animated box-shadow.
- Route changes: React 19.3 `ViewTransition` cross-fade 200 ms using Next's documented pattern: header and dock get their own named snapshots with animation suppressed (`::view-transition-group(header) { animation: none }`), so they appear stationary. Project card → case-study image morph is optional and only kept if the Phase 2 integration test passes.
- `prefers-reduced-motion: reduce`: transforms and the 3D scene off, opacity fades only, cursor stops blinking, dock magnification off. `MotionConfig reducedMotion="user"` plus a CSS kill-switch.
- Library split: CSS for hover, focus, dock, cursor; Motion (`m.*` under `LazyMotion domAnimation`) for staggers and `AnimatePresence`; R3F only in the hero.

---

## D. Page-by-page UI/UX

All public routes are under `/[locale]` (`en`, `ar`), `localePrefix: 'always'`, `x-default` → `/en`. Admin lives at `/admin` outside the locale segment.

### D1. Home `/`
Order: Hero → Proof strip → Selected Work → How I work → [Lab teaser, flag off in v1.0] → Contact.

**Hero.** Desktop 7/5. Left: availability pill (`● Available for projects`, mono, gold dot), H1 "Youssef Zaky", H2 "Full-Stack Software Engineer", tagline with the logotype gradient on one word, 2-line supporting paragraph, CTAs: primary **Explore Projects**, secondary **About Me**, tertiary link **Let's Talk**. Right: the 3D core (E7) in a 1:1 area with a soft radial gold glow. Four micro-labels sit at rest positions around the object: `Ideas → Products`, `Clean Architecture`, `Scalable Systems`, `Better Experiences` (mono 12 px), revealed after the scene loads; on mobile two are shown as static pills under the poster.
Mobile: text first (LCP), then the poster at 280 px height. Text is server-rendered and visible before any JS. The single capability gate in E7 decides whether the 3D chunk is ever requested.

**Proof strip.** One mono row: `Healthcare systems · Enterprise apps · B2B platforms · Automation & AI tooling`. No logos, no invented numbers.

**Selected Work.** Three featured projects in a 2 + 1 asymmetric grid (8 / 4 / 4 columns; stacked on mobile). Card: preview 16:10 via `next/image`, category pill, title, one-line problem statement, 3 tech pills, role line, "Case study →".

**How I work.** Three principles from the existing `coreValues`, editorial two-column layout, link to About.

**Lab teaser.** Rendered only when `NEXT_PUBLIC_FEATURE_LAB=true` (v1.1).

**Contact.** Same content as D6.

### D2. About `/about`
Editorial: intro (photo 4 cols, text 8 cols), "Engineering philosophy" (three short paragraphs from existing intro/philosophy/passion), Experience timeline (Al Baraka Fertility Hospital 08/2024–present with the fuller responsibilities from git history; CrediMax 2023; University of Bahrain 2018–2023; BIC marshal since 2019), Stack grouped by role: Frontend Engineering, Backend Engineering, Database Systems, Architecture & Infrastructure, AI & Automation, each with 4–6 items and one line of context, no percentages or bars. Facts list: Azure Administrator Associate, Arabic native, English fluent, based in Bahrain. CV button if a PDF is supplied. Delivered in Phase 4.

### D3. Projects `/projects` and case studies `/projects/[slug]`
Listing: filter pills (All, Healthcare, B2B, Property, Personal), 2-column grid.
Case study (MDX per locale): header (title, category, role, period, stack pills, live link if any, breadcrumb), then: Problem & context · My role · Requirements · Architecture (v1.0: a static SVG figure per project; v1.1: the interactive Lab diagram in read-only mode) · Technology choices · Key challenges · Implementation approach · Security & performance · Results (only verifiable statements) · Screens · Lessons learned. Sticky TOC rail on desktop (start side in RTL). "Next project" footer.
Slugs: `nuammer`, `ppms`, `albaraka-hospital-website`, `zakydev`. Hospital internal modernization is a **conceptual, sanitized** study labeled as such; no internal screens, names or data.

### D4. Engineering Lab `/lab` (v1.1, flag off in v1.0)
Header "How I think about systems." Tabs: **Architecture Explorer** · **Principles** · **Experiments** (one entry: this site).
Architecture Explorer: project selector (ZakyDev, PPMS, Nuammer, Hospital modernization [conceptual]). Layered diagram (Client → Edge → API → Auth · Services → Data · External → Infra) rendered as accessible SVG with HTML overlay buttons (`aria-describedby`). Selecting a node opens a detail panel (right rail desktop, bottom sheet mobile): tool used, responsibilities, communication pattern, key decisions, trade-offs, link to case-study section. Keyboard: arrows move, Enter opens, Esc closes. Data in `packages/shared/src/content/architectures/*.ts`, zod-validated, fixed layout (no graph library). In v1.0 the route returns 404 and no nav item, dock item, palette entry or terminal command references it.

### D5. Terminal `/terminal`
v1.0: full-page terminal on desktop and a full-screen sheet when opened from the dock or palette on any viewport. v1.1: floating window on `≥ 1024px` (E3). Header line: "A different way to explore. Type `help`." The route server-renders the help text so no-JS users and crawlers see content.

### D6. Contact `/contact` (and home section)
Headline "Let's build something together." / "لنبنِ شيئًا معًا." Left: email, WhatsApp (if approved), LinkedIn, GitHub, Instagram as a vertical mono-labelled list; CV button. Right: form (Name, Email, Company optional, Project type select, Message, "free 30-minute consultation" checkbox, Turnstile, submit) with a one-line privacy notice: "Stored securely, used only to reply to you, deleted after 12 months." Success state replaces the form with confirmation and "24 h" response expectation. Errors inline and announced via `aria-live`. No-JS fallback: the form is replaced by a `mailto:` button (Turnstile requires JS, so there is no no-JS submit path).

### D7. Admin `/admin`
Locale-less, `noindex`, not linked publicly. Login (single password) → Submissions table (server-rendered, 20 per page, filter by project type, search by name/email, detail drawer, delete with confirmation) and a stats row (total, this month, by type, notifications failed). Rows with failed email notifications show a badge and a "Resend" action. All reads and mutations go through Next Server Components and Server Actions; the browser never calls the API (see H).

### D8. System pages
`not-found.tsx` per locale (terminal-styled "404: path not found" with `help` suggestions), `error.tsx`, `loading.tsx` only for case studies. `opengraph-image.tsx` per locale with the logotype gradient, name and title. The Arabic OG image is generated with the IBM Plex Sans Arabic TTF and **tested in Phase 3** with a real mixed Arabic + Latin title; if Satori's bidi handling misplaces the Latin brand, the Arabic OG becomes a static PNG immediately.

---

## E. Interaction specifications

### E1. Main navigation (header)
Sticky, glass on scroll, 64 px. Start: wordmark. Center (desktop): Home · About · Projects · Contact (+ Lab when flag on), gold underline on the active route, section-aware on home via IntersectionObserver. End: language switch (`العربية` / `English`, same path), theme toggle (rendered after mount, labelled), `⌘K` button. Mobile: wordmark + menu button → full-screen sheet with links and controls, focus trapped (it is modal), Esc closes. `scroll-margin-top: 80px` on sections.

### E2. Dock
Bottom-center pill on `≥ 1024px` only. Items: Home, About, Projects, Terminal, Contact (+ Lab when flag on). All navigate except Terminal, which opens the terminal sheet (v1.0) or window (v1.1). Tooltips on hover/focus. Magnification scale 1.15 on the hovered item, CSS 150 ms, off under reduced motion. `<nav aria-label="Dock">` after main content in tab order; hidden while a form field has focus. Footer gets bottom padding equal to the dock height.

### E3. Terminal window (v1.1)
State: `open | closed`, held in `OsProvider`. Non-modal `role="dialog"` without a focus trap: Tab leaves the window normally; Esc closes when the input is empty and returns focus to the opener. Opens centered at 720 × 480 px, draggable by the title bar with pointer events and clamped to the viewport; also movable with arrow keys while the title bar is focused (16 px steps). No resize, no minimize, no dock badge, no persistence. On `< 1024px` the same component renders as the full-screen sheet from v1.0. Because `OsProvider` lives in the locale layout, the open state survives client navigations within a locale and resets on locale switch; this is intended.

### E4. Command palette (⌘K / Ctrl+K)
cmdk via shadcn `Command`, delivered in Phase 2. Groups: Navigate (routes), Projects (titles in the current locale), Actions (Toggle theme, Switch language, Open terminal, Copy email, Download CV). Fuzzy search, arrows, Enter, Esc. Modal dialog with focus trap. Code-split; loads on first `⌘K` or hover of the button.

### E5. Terminal
- Registry: `apps/web/src/features/terminal/commands.ts` exports `Record<string, Command>` where `Command = { name, aliases?, description (message key), usage?, run(args: string[], ctx: TerminalContext): TerminalLine[] }`. `run` is synchronous; there are no network calls. `TerminalContext` exposes `navigate`, `setTheme`, `setLocale`, `content` (typed, localized), `locale`. `TerminalLine` is `{ kind: 'text' | 'link' | 'list' | 'table' | 'error', ... }`; the view renders each kind with fixed React components, never raw HTML or arbitrary components.
- Commands v1.0 (12): `help`, `about`, `projects`, `project <slug>`, `open <slug|route>`, `skills` (alias `stack`), `experience`, `contact`, `whoami`, `theme [light|dark]`, `lang [en|ar]`, `clear`. Two easter eggs: `sudo` and `ls`. `lab` is added in v1.1. Unknown input → "command not found: x. Try `help`." with a did-you-mean suggestion (Levenshtein ≤ 2).
- History ↑/↓ (last 50, in memory), Tab completion for command names and slugs, `Ctrl+L` clears, `Ctrl+C` cancels the current input. Real `<input aria-label>`; output region `role="log" aria-live="polite"`. Chrome and prompt LTR; each line `dir="auto"`.
- Localized: help output and descriptions from message catalogs; command names stay English in both locales.
- Security: only registry commands run; args are matched against known slugs/routes; no `eval`, no network.

### E6. Project cards and case studies
Hover (pointer only): border → gold line, translate −2 px, preview scales 1.02 inside `overflow-hidden`. Focus-visible mirrors hover. `<article>` with a stretched link; title is the link text. Shared-element morph only if the Phase 2 ViewTransition test passes.

### E7. Hero 3D scene ("the Core")
- Concept: a black glass sphere inside a slowly rotating gold wire lattice (icosahedron subdivided once), faint inner glow, 3–4 small gold satellites on inclined orbits. Procedural geometry, no GLB.
- Tech: `@react-three/fiber` 9, `@react-three/drei` (`Float`, `Environment` procedural, `AdaptiveDpr`, `PerformanceMonitor`), `three` 0.186. Client component behind `dynamic(..., { ssr: false })` inside `Suspense` with the poster as fallback and an error boundary that swaps to the poster.
- **Single capability gate** `canRenderScene()` evaluated once on the client before any import is scheduled: `WebGL2 available && !prefers-reduced-motion && viewport ≥ 768px && !navigator.connection?.saveData && (navigator.deviceMemory ?? 8) ≥ 4`. If false, the chunk is never requested. If true, the import is scheduled on `requestIdleCallback` with a 1.5 s timeout fallback (whichever fires first), and cancelled if the hero leaves the viewport before it fires.
- Interaction: pointer parallax ±6° (lerp 0.08); rotation 0.05 rad/s; scroll progress tilts the lattice up to 10° and fades satellites as the hero leaves; hovering a satellite shows its micro-label. No click actions inside the canvas.
- Performance: `dpr={[1, 1.5]}`, `frameloop="demand"` when hidden or off-screen (IntersectionObserver), one directional light + env, physical material on the sphere only, `LineSegments` lattice, no postprocessing. Budget: complete scene dependency payload ≤ 180 kB gzip (three + fiber + drei subset + scene), measured with the bundle analyzer; first frame ≤ 800 ms after chunk load and steady 60 fps on an eligible mid-range laptop and tablet, measured in Phase 3 with Chrome performance traces (mobile Lighthouse exercises only the poster path and does not validate WebGL).
- Fallback poster: pre-rendered WebP of the same object (light and dark, 2×, ≤ 60 kB) with a CSS radial glow and a slow CSS rotation of an SVG lattice layer unless reduced motion.

### E8. Page transitions
As in C. Tested in Phase 2 for: normal navigation, next-intl locale switch, browser back/forward, reduced motion. If any case misbehaves, transitions are disabled rather than patched around.

### E9. Contact form flow
1. Client: react-hook-form + zod resolver using the shared `contactSchema`; validation on blur; submit disabled while pending; Turnstile token required; honeypot field; client-generated `submissionId` (UUID v4) kept for retries.
2. Server Action `submitContact` (Next server): re-parses with `contactSchema` (max message 4 000 chars), rejects if honeypot filled or fill-time < 3 s, applies a best-effort in-memory per-IP throttle (10/min), derives the client IP from the request headers set by Velocity's proxy (verified in Phase 0), and calls the API with `x-api-key`, `x-client-ip`, and the body. The API key is read from server env and never logged.
3. API `POST /v1/contacts`: timing-safe `x-api-key` check → trust `x-client-ip` only after that check (else fall back to socket IP) → throttles keyed on the hashed client IP (5/min in memory; 20/day computed from Postgres rows by `ip_hash`, so it survives restarts) → verifies Turnstile once with `remoteip`, expected hostname `zakydev.com` and action `contact` → upserts by `submissionId` (unique) so a retried request never duplicates → writes `notification_status = 'pending'` → returns `201 { id }` immediately after the insert. Email sending happens after the response via the mailer service; on success the row becomes `sent`, on failure `failed` with the error code stored.
4. Retry: a `@nestjs/schedule` interval (every 5 min) resends `pending`/`failed` rows up to 5 attempts; admin can trigger "Resend" manually. Acceptance to the user is defined by durable storage, not by email delivery.
5. Client responses: success; validation error (field mapping); 429 (friendly retry-later message); Turnstile token expired or consumed (widget resets automatically and the user resubmits); other errors (offer the `mailto:` fallback).
6. Privacy: `ip_hash` is SHA-256 of IP + daily salt; raw IPs are never stored; user agent is not stored. Pino redacts `body.email`, `body.message`, `headers.x-api-key`, `headers.authorization`.

---

## F. Responsive strategy

| Feature | Desktop ≥1024 | Tablet 768–1023 | Mobile <768 |
|---|---|---|---|
| Header | Full links + controls | Sheet | Sheet |
| Dock | Visible | Hidden | Hidden |
| Hero | 7/5 split, WebGL if gate passes | Stacked, WebGL if gate passes | Text first, poster only |
| Terminal | Route page (v1.0) / window (v1.1) | Full-screen sheet | Full-screen sheet |
| Palette | Dialog 640 px | Dialog full width | Full-screen |
| Project grid | 2+1 asymmetric | 2 columns | 1 column |
| Case-study TOC | Sticky rail | Collapsible top list | Collapsible top list |
| Architecture explorer (v1.1) | Diagram + rail | Diagram + bottom sheet | Vertical layers + bottom sheet |
| Reveal animations | On | On | Opacity only |
| Touch targets | 40 px | 44 px | 44 px |

No horizontal overflow at 320 px. RTL verified at every breakpoint via Playwright screenshots on `/ar` routes.

---

## G. Component and repository architecture

```
joedev/                                  (repo folder name stays; brand is ZakyDev)
  apps/
    web/                                 Next.js 16.3, TS 6, Tailwind 4, shadcn, next-intl
      messages/{en,ar}.json              next-intl catalogs (must live in the app)
      content/case-studies/{en,ar}/*.mdx content-collections source (must live in the app)
      content-collections.ts
      src/
        app/
          [locale]/
            layout.tsx                   html lang/dir, fonts, ThemeProvider, NextIntlClientProvider, OsProvider
            page.tsx  about/  projects/  projects/[slug]/  terminal/  contact/  lab/ (flagged)
            not-found.tsx  error.tsx  opengraph-image.tsx
          admin/                         locale-less; every page/action calls requireAdmin()
            page.tsx  login/page.tsx  actions.ts
          sitemap.ts  robots.ts  manifest.ts
        proxy.ts                         next-intl createMiddleware
        i18n/{routing,request,navigation}.ts
        components/ui/                   shadcn generated, restyled
        components/layout/               Header, Footer, LanguageSwitch, ThemeToggle
        features/
          hero/                          Hero, HeroCore (R3F), HeroPoster, canRenderScene.ts
          os/                            OsProvider, Dock, CommandPalette, TerminalSheet, TerminalWindow (v1.1)
          terminal/                      Terminal, TerminalView, useTerminal, commands.ts, suggest.ts
          projects/                      ProjectCard, ProjectGrid, CaseStudyLayout, mdx-components
          lab/                           (v1.1) ArchitectureExplorer, DiagramCanvas, NodeDetail
          contact/                       ContactForm, actions.ts, Turnstile
          about/                         Timeline, StackGroups, Facts
          admin/                         SubmissionsTable, requireAdmin.ts, api.ts
        lib/                             api-client.ts (server-only, x-api-key), env.ts (zod), seo.ts, motion.ts, flags.ts
        styles/                          globals.css, tokens.css
      next.config.ts                     reactCompiler, output 'standalone', outputFileTracingRoot = repo root,
                                         transpilePackages ['@zakydev/shared'], next-intl + content-collections plugins
    api/                                 NestJS 12 (ESM), Fastify, TS 6
      src/
        main.ts                          helmet, cors (WEB_ORIGIN only, no credentials), swagger at /docs
        app.module.ts
        config/                          env schema (zod) + ConfigModule
        common/                          api-key guard, jwt guard, zod pipe, exception filter, pino redaction
        modules/
          health/                        terminus: db + memory
          contacts/                      controller, service, repository (Drizzle), mailer port + Resend adapter, retry scheduler
          auth/                          POST login → returns JWT (argon2 verify); no cookies
          admin/                         contacts list/detail/delete/resend (JWT bearer)
          projects/                      (v1.1) GET /v1/projects from shared content
        db/                              drizzle schema, migrate.ts (drizzle-orm migrator, runs on prestart), client
      scripts/hash-password.ts           prints ADMIN_PASSWORD_HASH (base64-wrapped)
      test/                              vitest unit + supertest e2e
      drizzle.config.ts
  packages/
    shared/                              @zakydev/shared — zero React, built to dist/ with tsup, proper `exports`
      src/
        schemas/                         contact.ts, admin.ts, api-error.ts (zod 4)
        content/                         profile.ts, projects.ts (bilingual metadata), architectures/*.ts
        i18n/locales.ts                  ['en','ar'], rtl set
    config/                              tsconfig bases, biome base
  docker/
    compose.yml                          postgres + api + web for local parity
    api.Dockerfile  web.Dockerfile
  docs/superpowers/specs/
  DESIGN.md  CLAUDE.md  README.md
  .github/workflows/ci.yml               pnpm install, turbo lint typecheck test build (shared builds first via ^build),
                                         Postgres service container, Playwright on web
  turbo.json  pnpm-workspace.yaml  package.json  .nvmrc (24)  .env.example  biome.json
```

Boundaries:
- `packages/shared` holds only what both apps consume: zod schemas, locale constants, typed profile/project/architecture data. It has no React and no MDX. It is built to `dist/` so the ESM API can import it at runtime; `turbo build` depends on `^build`.
- next-intl catalogs and MDX stay inside `apps/web` because both tools resolve files relative to the app root.
- Next standalone output in a pnpm workspace is `apps/web/.next/standalone/apps/web/server.js`; the build script copies `public/` and `.next/static` next to it. This is verified in the Phase 0 spike.

State: no global store. `OsProvider` (React context) holds `terminalOpen` and `paletteOpen`. Theme via next-themes. Locale via URL. Flags via `flags.ts` reading `NEXT_PUBLIC_FEATURE_LAB`.

Server/client boundaries: pages and layouts are Server Components; `HeroCore`, `Dock`, `CommandPalette`, `TerminalSheet`, `Terminal`, `ContactForm`, `ThemeToggle`, `LanguageSwitch` are leaf Client Components receiving serialized content.

---

## H. Technical decisions

| Area | Choice | Why | Rejected |
|---|---|---|---|
| Framework | Next.js 16.3.x, React 19.3, TS ~6.0 | Active LTS, Turbopack, React Compiler, stable ViewTransition, `proxy.ts`; TS 7 not yet supported by `next build` | TS 7 |
| i18n | next-intl 4.14 | RSC-native, typed messages, small client | react-i18next, Paraglide |
| Styling | Tailwind 4.3 + shadcn 4, `@theme inline`, oklch tokens | Native logical props for RTL; accessible primitives | RTL plugins, CSS-in-JS |
| Theme | next-themes 0.4 | Flash-free | Custom provider |
| Motion | `motion` 13 with LazyMotion + CSS + React ViewTransition | One runtime, reduced-motion aware | GSAP, framer-motion |
| 3D | R3F 9.8 + drei 10.7 + three 0.186 | React 19 compatible, procedural geometry | Spline, R3F 10 alpha |
| Micro-animation | Inline SVG + CSS by default; `@lottiefiles/dotlottie-react` only if `.lottie` assets are authored | Avoid WASM cost unless used | lottie-web |
| Palette / terminal | cmdk 1.1 via shadcn; custom terminal | xterm is heavy and weak at RTL | @xterm/xterm |
| Content | Typed TS in shared + MDX via content-collections in web | Git-edited, zod-validated at build | CMS, API-served content |
| Forms | react-hook-form 7 + zod 4 + Server Action | Owner's stack | Client fetch to API |
| Spam | Honeypot + time-trap + Turnstile + API throttling | Layered, free | reCAPTCHA |
| Email | Resend 6 behind a `MailerPort` interface | Fakeable in tests | SMTP |
| API | NestJS 12 ESM, Fastify, native Standard Schema (zod) validation, throttler, terminus, swagger, nestjs-pino, `@nestjs/jwt`, `@node-rs/argon2`, `@nestjs/schedule` | Production practice at small scale; prebuilt argon2 binaries avoid native build on Velocity | Express adapter, class-validator, `argon2` (native build) |
| DB | PostgreSQL (Velocity) + Drizzle 0.45; migrations run by `drizzle-orm`'s migrator on API prestart (drizzle-kit is dev-only) | Typed SQL, real migrations, no CLI in prod | Prisma 7, Mongo |
| Monorepo | pnpm 12 + Turborepo 2.11 | Standard | Nest CLI monorepo, single Next app |
| Lint/format | Biome 2.5 + ESLint 10 `eslint-config-next` in CI only | Fast; keep Next rules | Prettier |
| Tests | Vitest 5 + Testing Library; Playwright 1.63 (e2e, RTL screenshots, axe); Vitest + supertest (api) | Matches Nest 12 ESM scaffold | Jest |
| Hosting | Velocity: app `web` (Next standalone), app `api` (`node dist/main.js`), managed Postgres; `zakydev.com` → web, `api.zakydev.com` → api | Owner decision | — |

Do not add: framer-motion, gsap, spline, xterm, tailwindcss-rtl, tailwindcss-animate, next-view-transitions, prettier, i18next family, @vercel/og, typescript 7, middleware.ts, Redux, zustand.

### Trust model
- **Browser → Next only.** The browser never calls `api.zakydev.com`. All API calls happen from Next Server Components and Server Actions with `x-api-key` (server env). CORS on the API allows only `WEB_ORIGIN` without credentials and is effectively unused.
- **Admin auth.** Login Server Action posts `{ password }` to `POST /v1/auth/login` (throttled 5 per 15 min per client IP). The API verifies with argon2 and returns a 12 h HS256 JWT in the response body; it never sets cookies. Next stores it in a host-only `__Host-zd_admin` cookie (`HttpOnly; Secure; SameSite=Lax; Path=/`) and forwards it server-to-server as `Authorization: Bearer` together with `x-api-key`. Every admin page and Server Action calls `requireAdmin()` (reads the cookie, verifies signature and expiry locally with the shared `JWT_SECRET`, redirects to login otherwise); the check is not delegated to `admin/layout.tsx`. Mutations are Server Actions, which Next protects with origin checks; no CSRF token is needed. Logout clears the cookie. Works on localhost and does not leak to demo subdomains.
- **Client IP.** Velocity's proxy chain is verified in Phase 0; Next reads the canonical header Velocity sets and overwrites any client-supplied forwarding headers. The API trusts `x-client-ip` only after the `x-api-key` check.

### API contract (v1.0)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/v1/health` | none | terminus: db ping, memory |
| POST | `/v1/contacts` | `x-api-key` | see E9 step 3; 201 after durable insert |
| POST | `/v1/auth/login` | `x-api-key`, throttled | `{ password }` → `{ token, expiresAt }` |
| GET | `/v1/admin/contacts` | `x-api-key` + Bearer | `page, pageSize, projectType, q` (`q` escaped, ILIKE) |
| GET | `/v1/admin/contacts/:id` | `x-api-key` + Bearer | uuid validated |
| DELETE | `/v1/admin/contacts/:id` | `x-api-key` + Bearer | |
| POST | `/v1/admin/contacts/:id/resend` | `x-api-key` + Bearer | manual notification retry |
| GET | `/docs` | none | Swagger UI, read-only showcase |

v1.1 adds `GET /v1/projects` and `/v1/projects/:slug` (`?locale=`), served from shared content.

Errors use one shape `{ statusCode, code, message, details? }` from shared `apiErrorSchema`; no stack traces or driver messages leave the API.

Env (validated at boot):
- api: `DATABASE_URL, WEB_ORIGIN, API_KEY, ADMIN_PASSWORD_HASH_B64, JWT_SECRET, RESEND_API_KEY, CONTACT_TO, TURNSTILE_SECRET, PORT, LOG_LEVEL`
- web: `API_URL, API_KEY, JWT_SECRET, NEXT_PUBLIC_TURNSTILE_SITE_KEY, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_FEATURE_LAB`

`ADMIN_PASSWORD_HASH_B64` is the argon2 hash base64-wrapped, because raw hashes contain `$` which dotenv and Compose interpolate.

### Data model
`contacts(id uuid pk = submissionId, name, email, company?, project_type enum, message text, wants_consultation bool, locale, ip_hash, created_at, notification_status enum('pending','sent','failed'), notification_attempts int, notification_error?, notified_at?)`. Index on `(created_at desc)`, `(ip_hash, created_at)`, `(notification_status)`.

Retention: a daily scheduled job deletes contacts older than 12 months. Stated in the form's privacy notice.

---

## I. Performance strategy

Budgets (Lighthouse mobile preset, Moto G Power class, 4G, against the Velocity deployment):

| Metric | Budget |
|---|---|
| LCP (home, both locales) | ≤ 2.0 s |
| CLS | ≤ 0.05 |
| INP | ≤ 200 ms |
| Home initial JS (excl. 3D chunk) | ≤ 180 kB gzip |
| 3D complete dependency payload | ≤ 180 kB gzip, requested only after the gate passes and idle fires |
| Fonts | 3 families; Latin two preloaded; Arabic `preload: false`, applied only on `/ar` |
| Images | AVIF/WebP via `next/image`; hero poster ≤ 60 kB |
| Lighthouse | targets ≥ 95 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; reported with real numbers |

Tactics: static generation for all public routes, `output: 'standalone'`, React Compiler, `LazyMotion`, palette code-split on intent, R3F gated and deferred, `frameloop="demand"` off-screen, no layout animation on text, `content-visibility: auto` below the fold, preconnect only to Turnstile.

---

## J. Operations, security and launch requirements

- **Backups and restore.** Velocity managed backups for Postgres; a restore drill into a scratch database is performed and documented in Phase 9.
- **Migrations.** Run by the API on prestart via `drizzle-orm` migrator inside a transaction. Rollback procedure: every migration ships with a down script in `db/migrations/down/`, and deploys are gated on `pnpm --filter api migrate:check` in CI against the Postgres service container.
- **Secrets.** Set in the Velocity dashboard per app; never in the repo. `.env.example` lists names only. CI uses GitHub secrets for Postgres URL (service container), Cloudflare's published always-pass Turnstile test keys, and no Resend key (the fake mailer is used).
- **Logging.** Pino JSON, `LOG_LEVEL=info` in prod; redaction paths for email, message, api key, authorization, cookies. No request bodies logged.
- **Monitoring.** External uptime check on `/v1/health` and `/en` (UptimeRobot free tier) with email alert; the admin stats row surfaces failed notifications; the retry scheduler logs at `warn` after the 5th failure.
- **Data protection.** Hashed IPs only, 12-month retention, privacy notice on the form, admin delete honours erasure requests.
- **Headers.** Helmet on the API; Next sets CSP (nonce-based for the theme script, `frame-src challenges.cloudflare.com` for Turnstile), HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimal.
- **Redirects.** `youssefzaky.com` → `zakydev.com` (301). Old `*.joedev.net` project subdomains are replaced by new subdomains or the case studies say "private demo on request".

---

## K. Risks and trade-offs

| Risk | Impact | Mitigation |
|---|---|---|
| Velocity monorepo deploy (subdirectory root, pnpm, Node 24, start command, proxy headers) | Blocks hosting | Phase 0 spike deploys hello Next + hello Nest from the monorepo layout and records the exact settings and the real client-IP header; fallback is a build step that outputs deploy roots per app |
| Arabic OG via Satori bidi | Broken social previews | Tested in Phase 3; static PNG fallback ready |
| 3D on eligible but weak devices | Jank | Gate + `PerformanceMonitor` down-scaling + error boundary to poster; measured in Phase 3 |
| Content gaps (photo, screenshots, CV, Arabic approval) | Unfinished look; wrong Arabic | Launch checklist blocks on photo and Arabic approval; recreated mock screens for Nuammer/PPMS |
| NestJS is more backend than the product needs | Maintenance | 8 endpoints in v1.0, each tested; the API is a showcase and stays |
| Email delivery failures | Lost leads | Durable insert first, retry scheduler, admin badge and manual resend |
| Single engineer + AI agents, large v1.0 | Slip | Terminal window and Lab moved to v1.1; palette and About have explicit phases; each phase ends with a review |

Deliberately out of v1.0: floating window manager, Lab, `/v1/projects`, blog, numerals toggle, CMS, analytics (Umami/Plausible decided later), persistent window layouts, dotLottie unless assets exist.

---

## L. Implementation phases

Deployment to Velocity happens from Phase 1 onward (staging URLs), not only at launch. Each phase ends with: checks run, reviews by the listed agents, a short results summary, and a commit only when the owner asks.

### Phase 0 — Accounts, domain, hosting spike
Objective: remove external unknowns. Deliverables: zakydev.com and youssefzaky.com purchased; Velocity Starter trial; a hello Next app and a hello Nest app deployed from a monorepo layout with the standalone path, Node 24, start commands, and the client-IP header documented; Postgres provisioned; Resend domain verified; Turnstile site created; Atlas user rotated or deleted; `hash-password` script and base64 env wrapping verified end to end. Acceptance: two HTTPS URLs respond from Velocity; API connects to Postgres; a test contact insert with the migrator succeeds. Agents: none beyond Claude.

### Phase 1 — Repository reset and monorepo foundation
Objective: skeleton builds, lints, tests green; content migrated. Deliverables: pnpm workspace, Turborepo (`^build`), `apps/web` (Next 16, TS 6, Tailwind 4, shadcn init, next-intl skeleton, `proxy.ts`), `apps/api` (Nest 12 ESM, Fastify, health, pino, config with zod, Drizzle client + first migration), `packages/shared` built with tsup and holding the migrated content (EN filled, AR keys with `TODO_AR` markers), `packages/config`, Biome, CI (Postgres service, turbo pipeline), Docker Compose for local, `.nvmrc`, `.env.example`, `CLAUDE.md`, `DESIGN.md`, project `.claude/` (ECC react/web rules, format+typecheck Stop hook, wildcard permissions). Old `src/`, `api/`, Vite files, stale docs removed; README rewritten as a stub. Both apps deployed to Velocity staging. Acceptance: `pnpm turbo lint typecheck test build` passes locally and in CI; migration checklist complete. Agents: `typescript-reviewer`, `code-reviewer`.

### Phase 2 — Design system, layout shell, palette, transitions
Objective: tokens, typography, header, footer, dock (navigation only), theme and language switching, RTL, command palette, ViewTransition integration test. Deliverables: `tokens.css`, restyled primitives (button, card, badge, input, textarea, select, dialog, sheet, command, tooltip), Header/Footer/LanguageSwitch/ThemeToggle, Dock, `OsProvider`, CommandPalette, dev-only `/design` route showing every component in both themes and both directions, Playwright screenshot baseline, font waterfall check for both locales. Acceptance: no theme flash; `/ar` mirrors correctly; axe zero violations on `/design`; ViewTransition passes the four cases in E8 or is disabled; Arabic font absent from `/en` network log. Agents: `react-reviewer`, `web-design-guidelines` skill.

### Phase 3 — Hero and home page
Objective: the signature moment. Deliverables: Hero (text, CTAs, gate, poster), `HeroCore` scene, proof strip, home sections wired to content, home metadata, per-locale OG image with the Arabic bidi test. Acceptance: LCP budget met; chunk never requested when the gate fails (verified in network log at 360 px and under reduced motion); 3D payload ≤ 180 kB gzip; 60 fps trace on an eligible laptop and tablet; error boundary tested; Arabic OG verified or switched to PNG. Agents: `react-reviewer`; Lighthouse via Playwright.

### Phase 4 — About, projects, case studies, SEO
Objective: proof of work and discoverability. Deliverables: About page, ProjectCard/Grid, `/projects`, content-collections MDX pipeline, four case studies (EN complete, AR drafted) with static architecture SVGs, TOC rail, breadcrumbs, per-page metadata with hreflang, `sitemap.ts`, `robots.ts`, `manifest.ts`, JSON-LD Person, 404 and error pages. Acceptance: all slugs build statically in both locales; MDX schema rejects a missing required section; sitemap lists both locales with alternates. Agents: `typescript-reviewer`, `code-reviewer`.

### Phase 5 — Terminal floating window (v1.1)
Objective: desktop window presentation. Deliverables: `TerminalWindow` per E3 (open/closed, drag with pointer and keyboard, no trap). Acceptance: keyboard-only user can open, use, leave, and close it with focus restored; window never leaves the viewport. Agents: `react-reviewer`.

### Phase 6 — Developer terminal (route + sheet)
Objective: a working terminal. Deliverables: registry, 12 commands + 2 eggs, history/completion, did-you-mean, localized help, `/terminal` route with server-rendered help, `TerminalSheet` from dock and palette, unit tests for the parser, suggester and every command. Acceptance: every command tested; Arabic lines render RTL inside the LTR frame; nothing outside the registry can run. Agents: `tdd-guide`, `security-reviewer`.

### Phase 7 — Engineering Lab (v1.1)
Objective: show system thinking. Deliverables: architecture data model, DiagramCanvas, NodeDetail, three diagrams, Principles tab, Experiments placeholder; diagrams embedded in case studies replacing the static SVGs; flag turned on; `lab` terminal command; `/v1/projects` endpoints. Acceptance: keyboard-navigable; mobile vertical layout; every node bilingual. Agents: `architect` (diagram accuracy), `react-reviewer`.

### Phase 8a — Contacts API, form, email
Objective: leads are captured reliably. Deliverables: `contacts` module (schema, migration, repository, api-key guard, throttler, Turnstile verifier, mailer port with Resend adapter and fake, retry scheduler, retention job), Server Action, ContactForm with Turnstile and privacy notice, Swagger, e2e test with the Postgres service container and fake mailer. Acceptance: e2e submits and the row exists; a forced mailer failure leaves `failed` and the scheduler retries; duplicate `submissionId` does not duplicate; 429 path returns the friendly message; redaction verified in logs. Agents: `security-reviewer`, `database-reviewer`, `nestjs-patterns` skill.

### Phase 8b — Auth and admin
Objective: a real authenticated surface. Deliverables: `auth` module (argon2 verify, JWT issue), `requireAdmin()`, login page and Server Action, `__Host-zd_admin` cookie handling, admin list/detail/delete/resend, stats row, `noindex`. Acceptance: e2e logs in, sees the submission from 8a, resends, deletes; expired token redirects; wrong password throttled after 5 attempts; no admin data reachable without both API key and valid token. Agents: `security-reviewer`.

### Phase 9 — Performance, accessibility, operations, launch
Objective: measured quality and a safe launch. Deliverables: Lighthouse and axe on every route in both locales, bundle analysis against budgets, Playwright RTL screenshot suite, reduced-motion pass, real-device check (one Android, one iPhone), CSP and headers verified, backup restore drill, uptime monitor, README, launch checklist (DNS, redirects, Search Console with hreflang, Arabic copy approved by owner, photo in place), production deploy. Acceptance: budgets met or misses documented with reasons and follow-ups; Codex independent review of the whole branch completed. Agents: `code-reviewer`, Codex.

---

## M. Open items for the owner (non-blocking for spec approval)
1. Confirm display name "Youssef Zaky" and the public GitHub handle.
2. WhatsApp link on the contact page: yes/no.
3. Social handles for "zakydev" (Instagram, TikTok, YouTube): register what you want; the site links to whatever exists.
4. Supply photo, CV, and any screenshots you are allowed to publish.
5. Confirm the Atlas credential has been rotated.
