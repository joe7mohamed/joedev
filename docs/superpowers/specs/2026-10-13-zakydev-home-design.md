# ZakyDev — Home page and platform: design spec

Date: 2026-10-13 · Owner: Youssef Zaky · Status: awaiting owner review
Supersedes everything in `docs/superpowers/specs/archive/` (kept for history only).
Reference build: `docs/prototype/home-v23/` (static HTML/CSS/JS). Serve it with
`python3 -m http.server 8765 --directory docs/prototype/home-v23` and open
`http://localhost:8765/index.html` (`?lang=ar`, `?theme=light`, `?intro=1`, `?still=1`).

The prototype is the source of truth for **look, copy, timing and choreography**.
It is **not** the source of truth for code structure: it is one fixed stage driven by
one script, with 23 rounds of CSS overrides. Section 6 defines how the real build must
be structured instead. Do not port its CSS or script verbatim.

---

## 1. Purpose and success criteria

A personal site for Youssef Zaky (brand: ZakyDev, `zakydev.com`), a software engineer in
Bahrain. It must win freelance and product work and serve as the base of a later content
brand. Audiences: business owners and product people (primary), recruiters and engineers
(secondary). Languages: English and Arabic, with true right-to-left layout.

The page succeeds when a first-time visitor on a mid-range phone can, without help:

1. Read who he is and what he does within the first screen.
2. See three real projects, each with a real screenshot and a working link.
3. Understand how he works in five plain steps.
4. Reach his email in one tap from anywhere.

Measurable gates (Lighthouse mobile preset against the deployed site, both locales):
LCP ≤ 2.0 s · CLS ≤ 0.05 · INP ≤ 200 ms · Accessibility 100 · SEO 100 · Best Practices 100 ·
Performance ≥ 90 · route JavaScript ≤ 150 kB gzip before the background shader chunk.

## 2. Scope

**Phase 0 — foundation.** Monorepo, tooling, CI, tokens, fonts, i18n routing, content
model, API skeleton with a health check, deploy pipeline proven end to end.

**Phase 1 — home page.** Everything in sections 4 to 9, in both locales and both themes,
with the full reduced-motion and no-script experience.

**Later phases (not planned here):** contact form with API and database, case-study pages
for the three projects, About page, playful 404, admin, gaming data from the Riot API,
content/blog.

Out of scope for good: three.js or any 3D library, generated images or video, a CMS.

## 3. Brand

### 3.1 Mark ("Tag")

A Z made of two code brackets: an ink upper half (`>`) and a gold lower half (`<`), split
on the diagonal. Files: `docs/prototype/home-v23/brand/`.

- Grid 64 × 64. Stroke 7, round caps and joins. The halves are point-symmetric about (32, 32).
- Upper: `M12 15H50L36.2 28` · Lower: `M27.8 36L14 49H52`.
- Small cut (rendered below 32 px): stroke 9, upper `M12 15H50L38 26.5`, lower `M26 37.5L14 49H52`.
- Colour: upper = ink of the current surface. Lower = gold `#D4AF37` on dark, bronze `#8A6D1F`
  on light, ivory `#FAF9F6` on a gold surface.
- Clear space: one stroke width on every side. Wordmark: `zakydev`, Geist 500, lowercase.
- Never: rotate it, add effects, recolour the halves the same colour except in the mono file.

### 3.2 Colour tokens

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0F0E0C` | `#FAF9F6` | page ground |
| `--panel` | `#181613` | `#F1EEE6` | raised surfaces |
| `--ink` | `#F3EFE6` | `#1A1814` | text |
| `--muted` | `#A8A192` | `#6A6457` | secondary text |
| `--hair` | ink at 14% | ink at 14% | hairlines, borders |
| `--gold` | `#D4AF37` | `#D4AF37` | fills, lines, the gold element |
| `--accent` | `#D4AF37` | `#8A6D1F` | gold-coloured **text and icons** |
| `--on-gold` | `#14120E` | `#14120E` | text on a gold fill |

Rules: gold text on a light ground always uses `--accent`, never `--gold` (contrast). The
only non-palette colour on the site is the Bahrain flag red `#CE1126` with white. Default
theme is dark; the theme follows the system on first visit and the visitor's choice after.
All text pairs must meet WCAG AA; verify with axe in CI.

### 3.3 Type

| Role | Latin | Arabic |
|---|---|---|
| Display | Fraunces (variable: `opsz`, `wght`, `SOFT`) 560–600 | Amiri 700 |
| Body / UI | Geist 400–600 | IBM Plex Sans Arabic 400–600 |
| Mono (labels, tools) | Geist Mono 400–500 | Body face, no letter-spacing |

Arabic rules: never letter-space Arabic; never split Arabic into letters for animation
(animate by word or line); line-height 1.3 for display, 1.6+ for body; digits stay Western;
product and tool names stay in Latin script. Load Arabic faces only on `/ar`.

### 3.4 Voice

First person, short sentences, plain words a business owner uses. Describe what a thing does
for the user before how it is built. No invented numbers. Anything the owner has not
confirmed is listed in section 12 and must not ship until confirmed or removed.

## 4. Content

All copy lives in one typed, bilingual content module (section 6.3). The complete current
copy is in `docs/prototype/home-v23/app.js` in the `T.en` / `T.ar` objects **after all
`Object.assign` overrides are applied** (later assignments win). Summary of the final text:

| Slot | English | Arabic |
|---|---|---|
| Titles (typed, alternating) | Software engineer · Full-stack developer | مهندس برمجيات · مطوّر Full-Stack |
| Place | Bahrain | البحرين |
| Availability | Available for new projects | متاح لمشاريع جديدة |
| Headline | I build software that holds up under pressure. | أبني برمجيات تصمد تحت الضغط. |
| Sentence | I design, build and launch + rotating word | أصمّم وأبني وأطلق + كلمة متغيّرة |
| Rotating words | marketplaces · AI assistants · multiplayer games · hospital systems | منصات تجارية · مساعدين بالذكاء الاصطناعي · ألعابًا جماعية · أنظمة مستشفيات |
| Steps strip | Design → Build → Launch | تصميم ← بناء ← إطلاق |
| Buttons | See my work · Start a project | شاهد أعمالي · ابدأ مشروعك |
| Work label | My work | أعمالي |
| Process label | How I work | كيف أعمل |
| Process steps | Understand, Design, Build, Test, Launch | أفهم، أصمّم، أبني، أختبر، أطلق |
| About heading | One engineer, from A to Z. | مهندس واحد، من الألف إلى الياء. |
| Loop stages | Idea, Design, Code, Data, Test, Deploy, Monitor | الفكرة، التصميم، الكود، البيانات، الاختبار، النشر، المراقبة |
| Contact heading | What needs building? | ما الذي تريد بناءه؟ |
| Email | youssef@zakydev.com | same |

Projects (order fixed): **Nuammer** (`nuammer.com`, Oct 2025 – now, freelance),
**Wazifi** (`wazifi.vercel.app`, Apr – Aug 2026), **Talmeeha** (`talmeeha.vercel.app`,
May – Aug 2026). Each has: one-line description, three metadata items, a "how it works"
diagram with caption, tool list, link. Employer work is never named.

Gold key words in the headline: "holds up" / «تصمد», coloured with `--accent` (bronze on
light; bright gold on a light ground fails contrast). Underlined zoom word: "software" /
«برمجيات».

## 5. Experience, section by section

Units: `S` = scroll position in viewport heights from the top of the page in the prototype
(total 6.2). Easing `e(x)` = smoothstep clamped to 0..1. These numbers describe the
prototype and are the starting values; the real build expresses the same sequence per
scene (section 6.4) and may tune them by eye, but the order of events may not change.

### 5.0 The gold element

One gold element is on screen from first paint to the last frame and changes job:

| From S | To S | Shape and position |
|---|---|---|
| 0 | 0.5 | underline of the zoom word (4–7 px high, radius 2) |
| 0.5 | 1.0 | grows into the project frame (radius 14, 2 px gold border, screenshot inside) |
| 1.0 | 2.8 | project frame |
| 2.8 | 3.2 | collapses into the process rail line (3 px), anchored at the first station |
| 3.2 | 4.5 | rail line; its length = progress through the five steps |
| 4.5 | 4.95 | becomes the About ring (circle, 2 px border) |
| 4.95 | 5.7 | ring |
| 5.7 | 6.15 | grows to cover the whole viewport, filling solid gold |

Position and size are always interpolated between **measured** rectangles of invisible
"slot" elements in each section. Measure relative to the layout container, never the
window, so a visible scrollbar (left side in RTL on Windows) cannot shift it. Re-measure on
resize, on font load, and every frame for any slot whose position depends on text height.

### 5.1 Loading screen

Dark screen, mark centred. While assets load its two halves drift 9 px apart and back
(1.1 s loop). A two-digit counter and a 180 px gold line show **real** progress (fonts and
the three screenshots), with a 0.9 s floor and a 5 s ceiling. At 100 the halves snap shut
with a gold spark, the counter fades, and the mark moves to its place in the menu
(0.75 s). Shown once per session. Never shown with reduced motion. A tap skips it. If the
script fails, nothing may stay hidden (section 6.5).

### 5.2 Menu

Desktop: mark and wordmark at the start; a glass capsule with four items (icon + label):
Work, Process, About, Contact; then language and theme buttons. Phone: mark and the two
buttons on top; the four items in a bar fixed to the bottom, icons only, the current item
widened to show its label.

- A gold marker pill sits on the current section, moves with a slight spring (0.6 s), and
  on desktop previews the hovered item, returning on leave.
- A 2 px gold line inside the marker shows progress through the current section.
- Each icon plays a 0.5–0.8 s animation when it becomes current or is hovered: Work, four
  squares pop in sequence; Process, the path draws; About, head pops and shoulders draw;
  Contact, the envelope flap opens and closes.
- Section ranges for "current": Work 0.9–2.85, Process 2.85–4.6, About 4.6–5.8, Contact 5.8+.
- On the gold contact screen the menu switches to dark ink and the mark's lower half to ivory.
- Language switch changes the route (`/en` ⇄ `/ar`) and keeps the scroll position. Theme
  switch uses a circular view transition from the button when supported.

### 5.3 Hero (S 0 → 1)

Layout, desktop: start-aligned. Row of three items without boxes (title between gold
brackets `< … />`, pin + place, pulsing dot + availability, separated by hairlines), then
the three-line headline at about 11.4 vw, then the sentence with the rotating word and the
three-step strip on the start side and the two buttons on the end side, then a centred
scroll cue. Phone: everything centred in one column; availability on its own line.

Motion:
- Headline builds on load: English by letter (rise 115%, rotateX −85° → 0, 0.95 s, 28 ms
  stagger) while weight runs 220 → 560 and `SOFT` 100 → 0 over 1.7 s; Arabic by word
  (0.1 s stagger, no rotation). Then the gold line draws under the zoom word (0.9 s).
- Title: brackets slide in from ±18 px, the title types (48–88 ms per character), holds
  3 s, deletes (26 ms per character), types the other title, loops. Reserve the width of the
  longer title so neighbours never move.
- Rotating word flips on X every 2.4 s. Step strip: 5 s loop, a gold line runs
  Design → Build → Launch and the rocket lifts 6 px on arrival.
- Desktop pointer: letters within 220 px gain weight (to 900) and softness.
- Scroll: the headline scales around the zoom word, `scale = 1 + z² · 15` with
  `z = e((S − 0.1)/0.8)`, while every other word fades by `z ≈ 0.38`. From `z ≈ 0.28` the
  zoom word's letters cross-fade to being filled with the first project's screenshot
  (`background-clip: text`). The headline is gone by `z = 1`.

### 5.4 Work (S 1.0 → 2.8; one project per 0.6)

Desktop: two columns. Text column in a grid: label and `01 / 03` on one row; three
full-width progress bars; name (display, 48–118 px); category; one-line description;
metadata row (calendar + period, tag + type, box + "Designed, built, launched"); the
diagram in a bordered panel with its caption; then tool chips and the visit button on one
row. The other column is the gold frame, vertically centred.
Phone order: frame, bars, label, name, description, metadata, diagram panel, visit row.

- Frame: browser bar (three dots, first gold, address centred), screenshot below. Tilts
  with the pointer (±9° / ±7°) on desktop, sways ±2.5° on phone, floats ±6 px. Screenshot
  `object-position` drifts 0% → 100% through its segment. A new project wipes in from the
  bottom over the old one (0.9 s).
- Bars: bar *n* is full once passed, fills with progress while current. Tapping a bar
  scrolls to that project. They are real buttons with labels.
- Name flips on X when the project changes; the rest settles in (12 px, 35 ms stagger).
  Text swaps must always end fully visible even if interrupted.
- Diagrams (loop): Nuammer — a request dot travels Next.js → NestJS → MySQL and back;
  Wazifi — a request tries provider A, fails, provider B answers; Talmeeha — the server
  pulses and four players light together.
- Visit control: desktop, a solid gold button with a light sweep every 3.2 s, a pulsing
  dark arrow circle whose arrow flies out and back, and a 3 px lift on hover. Phone, a
  centred row under a hairline: label, address with a gold underline that draws on a loop,
  gold arrow circle. Opens in a new tab with `rel="noopener"`.

### 5.5 How I work (S 3.2 → 4.5; five steps of 0.26)

One drawing of an app being built, scrubbed by scroll (each step's progress `p0..p4` runs
0 → 1 over the first 62% of its range):

1. **Understand** — two speech bubbles draw; a dashed ghost window appears.
2. **Design** — the window, header, main block, button and three cards draw as wireframe.
3. **Build** — blocks fill, the button turns gold; a logic node and a database draw
   beneath and connect, a gold packet travels between them.
4. **Test** — a gold tick lands on each block; a pointer clicks the button.
5. **Launch** — a gold LIVE badge appears, the window lifts 14 px, two rings pulse, a
   heartbeat line draws.

Beside it: label, `0n / 05`, the step name (flips), one sentence, a "You get" line with a
tick icon, and tool chips on steps 3–5 only. Below: a rail of five numbered stations joined
by the gold line (the gold element). Passed stations fill gold with a tick; the current one
grows 1.18× with a pulsing halo. Desktop shows all five names, phone shows only the current
name. Stations are buttons that scroll to their step. The line must pass through the centre
of every station (regression-tested).

Copy per step is in the prototype (`T.*.stages` final override): sentence, "You get", tools.

### 5.6 About (S 4.8 → 5.7)

Desktop: ring on the start side, text on the end side. Phone: ring on top, then heading,
then the cards.

- **A-to-Z loop.** Seven stations with icons sit on the ring, clockwise from the top: Idea,
  Design, Code, Data, Test, Deploy, Monitor. A glowing gold dot moves station to station
  (2.3 s per station: travel in the first half, rest in the second). A thicker gold arc
  trails from the top to the dot and resets after Monitor. The current station fills gold;
  passed ones keep a gold outline. In the centre: the mark, then the stage name (flips) and
  its tools in mono. Phone hides the station labels. Draw the arc as a conic-gradient sweep
  masked to a ring and keep it under the station nodes; do not use SVG dashes with
  `vector-effect: non-scaling-stroke`.
- **Four scene cards**, two by two, each a 200 × 90 looping scene above a label and one line:
  - *Based in* — the Bahrain flag (white hoist band with five points, red field) rises up a
    pole and waves; a pin drops with ripples; `26.07°N 50.56°E` in the corner.
  - *Day job* — a heartbeat trace that resolves into code brackets; label "Healthcare → code".
  - *Track marshal* — five start lights come on one by one and go out, a car launches with
    speed lines over moving kerbs, a gold marshal flag waves; label "BIC · SINCE 2019".
  - *After work* — three mini scenes labelled LOL (minimap, moving dot, ping), VALORANT
    (crosshair snapping between two targets), TFT (hex board filling).
- Under the cards: "ZakyDev isn't endorsed by Riot Games." Game names are text only; no Riot
  logos, art or fonts.

### 5.7 Contact (S 5.95 → 6.2)

The ring grows until the screen is solid gold. On gold, in dark ink, centred: label, the
question in display type (up to 156 px) rising word by word, one sentence, the email typing
itself in with a 3 px underline, a dark "Copy email" button, GitHub and LinkedIn links,
then a row of three facts with icons (place and time zone, languages, reply promise), and a
one-line footer. The email is a `mailto:` link and is always present as real text. Copy
shows "Copied" and falls back to selecting the text if the clipboard is refused.

### 5.8 Background

A full-viewport fragment shader ("liquid gold"): domain-warped noise mixed from `--bg`
toward dark gold with fine bright ridges, plus film grain and a vignette. It drifts with
time, advances with scroll, and speeds up with scroll velocity. It is automatically calmer
on the side where text sits (`side` uniform, eased when the layout flips) and at half
strength on phones. Render at 0.6 × device pixel ratio (max 1.5). Pause when the tab is
hidden. If WebGL is unavailable, show a static CSS gradient. Light theme uses the light
palette from the prototype (`PAL.light`). Never let it reduce text contrast below AA.

### 5.9 Small global details

- A 2 px gold bar at the very top shows how far down the page the visitor is.
- Desktop with a fine pointer only: a 34 px gold ring follows the pointer with a short lag
  and grows to 64 px over links and buttons. Not on touch devices, not with reduced motion.
- The theme switch reveals the new theme in a circle growing from the button where the
  View Transitions API exists; otherwise it switches instantly.

### 5.10 Reduced motion and no script

With `prefers-reduced-motion: reduce`: no loader, no zoom, no parallax, no typing, no
loops; sections are ordinary stacked blocks; the background is a still frame; every
diagram and scene shows its finished state; the title shows the first title.
Without JavaScript: the same stacked document, fully readable, all links working, with
all three projects and all five process steps shown in full.

## 6. Architecture

### 6.1 Repository

pnpm + Turborepo monorepo in this repository. The old Vite app (`src/`, `api/`,
`index.html`, `vite.config.ts`, `tailwind.config.ts`, `eslint.config.js`, `vercel.json`,
`emailjs-template.html`, `components.json`, `tsconfig*.json`, `package-lock.json`,
`public/`, `README.md`, `DEPLOYMENT.md`, `PRODUCTION_SETUP.md`) is removed in Phase 0.

```
apps/web        Next.js (App Router, React Server Components), TypeScript, Tailwind 4
apps/api        NestJS on Fastify (Phase 0: health only)
packages/shared zod schemas, locale constants, typed content
packages/config tsconfig and Biome bases
docs/           specs, plans, prototype
```

Versions: use the current stable releases at install time and record them in the plan's
first task (the archived spec targeted Next.js 16.3, React 19.3, NestJS 12, Tailwind 4,
next-intl 4, Drizzle, Biome 2, Vitest, Playwright; confirm each against its docs before
installing). Node version pinned in `.nvmrc`.

### 6.2 Web application

- Routes: `/[locale]` with `en` and `ar`; `/` redirects by `Accept-Language`, default `en`.
  `<html lang dir>` set on the server. Both routes statically generated.
- Every section is a **Server Component that renders the complete, readable content**.
  Motion is added by small Client Components ("islands") that receive serialised content.
- **No animation library.** One scroll engine (a single `requestAnimationFrame` loop with
  a passive scroll listener) plus CSS animations and the Web Animations API cover every
  effect in section 5. GSAP was used in the prototype only for convenience; it may be
  added later behind a dynamic import if a specific effect needs it, but it is not in the
  Phase 1 budget. No three.js. The shader is ~60 lines of raw WebGL.
- Styling: Tailwind 4 with the tokens of 3.2 as CSS variables via `@theme`; logical
  properties everywhere (`ms-*`, `pe-*`, `start`, `end`); no physical left/right except
  inside drawings that are deliberately not mirrored (all SVG scenes are forced LTR).
- Fonts through `next/font` (self-hosted, `display: swap`, subsets; Arabic faces only in
  the `ar` layout). No third-party font or script requests at runtime.
- Icons: tool logos are Simple Icons SVGs (CC0) plus the devicon Playwright mark, stored in
  the repo and rendered as CSS masks so they take the theme colour. Interface icons are
  inline SVG components.
- Images: the three screenshots via `next/image` (AVIF/WebP, explicit sizes, the first one
  `priority` because it is revealed by the hero zoom).

### 6.3 Content model (`packages/shared`)

One module exports `home: Record<Locale, HomeContent>` validated by a zod schema at build
time: hero (titles[], place, availability, headline as lines of words with `key`/`gold`
flags, sentence, rotating words[], steps[3], buttons), projects[3] (id, url, image,
category, description, meta[3], caption, tools[], diagram id), process steps[5] (name,
sentence, youGet, tools[]), about (heading, loop stages[7] with tools, facts[4]), contact
(heading, sentence, meta[3], labels). A build fails if a locale is missing a key or if any
entry is still marked `unconfirmed: true` when `REQUIRE_CONFIRMED=1` (set for production;
the variable must be declared to Turborepo so cached builds cannot bypass it).

### 6.4 Scroll engine and scene structure

The prototype puts all sections in fixed, overlapping layers and uses an empty spacer for
scroll length. **The real build must not.** Required structure:

- The document is a normal sequence of `<section id="work">`, `#process`, `#about`,
  `#contact` after the hero, each with real headings (`h1` once, `h2` per section) in
  reading order. Anchors, find-in-page, focus order and screen readers work natively.
- In enhanced mode each section is a tall block (its share of the scroll map) containing a
  `position: sticky; top: 0; height: 100svh` scene. The engine computes each section's
  progress from its own bounding box, so adding or removing a section never requires
  renumbering global constants.
- Each scene's travel is split into a **body** (its own timeline) and a **tail** (the
  handoff, during which its content fades and the gold element travels to the next
  scene's slot). Consecutive scenes overlap by one viewport so the next body starts
  exactly when the previous tail ends: there is never a blank screen, and exactly one
  scene is active at any scroll position.
- In-page jumps (menu, buttons, bars, stations, URL hash, keyboard focus) always land a
  little inside the target scene's body, where its content is fully visible.
- A scene whose content does not fit one viewport (large text, short landscape screens)
  is not pinned: it flows at natural height with everything visible, and the gold element
  hides. All script geometry uses the pinned scene's own measured height, never
  `window.innerHeight`.
- Layers, lowest first: background, gold element, scene content, header, loader. Text is
  always above the gold element. What appears inside the gold element (the screenshots)
  is controlled by the Work scene only.
- The gold element is one fixed, `aria-hidden` element in a top layer. It reads slot
  rectangles from the active and next scenes and interpolates (section 5.0).
- The engine exposes per-frame values through CSS custom properties on each scene
  (`--p`, `--p0…--p4`, `--seg`) and a tiny subscribe API for the few things that need
  JavaScript (text swaps, the gold element, the shader uniforms). It writes styles only;
  it never reads layout inside the frame loop except the documented live slots.
- It runs only while the tab is visible and stops calling into scenes that are far
  off-screen. Scroll is never hijacked: no wheel interception, no snap, native touch scroll.
- Enhanced mode is enabled by adding one class on `<html>` after hydration. Until then, and
  whenever motion is reduced, the stacked layout of 5.10 applies. Content is never hidden
  by a class that only JavaScript can remove.

### 6.5 Failure rules

- Text and links are visible and usable if any script, the shader, or a font fails.
- The loader must be removed by a timer set inline in the document head as well as by the
  app, so a script error cannot leave the page locked.
- Interrupted transitions must end in the visible state (the prototype bug where text
  stayed transparent after fast scrolling must not be possible: use explicit end states).

### 6.6 API (`apps/api`, Phase 0)

NestJS on Fastify with `GET /v1/health` (process and, once added, database), env validated
by zod at boot, structured logging with redaction, Helmet. No public write endpoints yet.
Postgres and Drizzle are introduced with the contact form in a later phase.

### 6.7 SEO and sharing

Per-locale `title` and `description`, canonical, `hreflang` for `en`, `ar`, `x-default`;
Open Graph and Twitter images generated at build (mark + headline, per locale);
`Person` JSON-LD (name, alternateName ZakyDev, jobTitle, address Bahrain, sameAs GitHub and
LinkedIn, email); `sitemap.xml`, `robots.txt`, web manifest, favicon and app icons from
`brand/`.

### 6.8 Security and operations

- No secrets in the repository. `.env.example` lists names only. `DEPLOYMENT.md` in the old
  tree contains a real MongoDB Atlas password that is also in the public git history: the
  owner must rotate or delete that database user; removing the file does not undo the leak.
- Response headers from Next: a Content-Security-Policy that restricts everything to the
  site's own origin. Pages are statically generated, so per-request script nonces are not
  available: use a hash-based `script-src` if the installed Next.js supports it for static
  pages, otherwise allow inline scripts and document why (no user content, no third-party
  scripts). Also HSTS,
  `Referrer-Policy: strict-origin-when-cross-origin`, minimal `Permissions-Policy`,
  `X-Content-Type-Options: nosniff`.
- External links use `rel="noopener"`. No third-party scripts, analytics or fonts in Phase 1.
- Hosting target from earlier decisions: Cloudways Velocity (Next standalone for web, Node
  for API). The deploy pipeline is proven in Phase 0 with a placeholder page.

## 7. Accessibility

- One `h1`; `h2` per section; landmarks (`header`, `nav`, `main`, `footer`).
- Every control is a real `button` or `a` with a visible focus ring (2 px `--accent`,
  3 px offset) and an accessible name: project bars, process stations, menu items, theme,
  language, copy, visit.
- Decorative drawings, the gold element, the background and looping scenes are
  `aria-hidden`. Screenshots have alt text naming the product and page.
- Text that types or rotates exposes its full value to assistive technology
  (`aria-label` with the complete text; the animated node is hidden from it).
- Touch targets ≥ 44 × 44 px. Bottom bar respects `env(safe-area-inset-bottom)`.
- Colour is never the only signal (current menu item also has the marker shape and label).
- Skip link to main content. Keyboard order equals reading order in both directions.

## 8. Responsive rules

Breakpoint: 860 px. Below it every scene is one centred column; the menu becomes the bottom
bar; labels on the About ring and process rail collapse as described. Layout uses `svh`
units so mobile browser chrome cannot cause jumps. Test widths: 360, 390, 430, 768, 1024,
1440, 1920. No horizontal scroll at any width in either direction.

## 9. Testing

- **Unit (Vitest):** scroll-map math (section progress, step index, gold-element
  interpolation with given rectangles), content schema (both locales complete, no
  unconfirmed entries in production mode), typed-title and rotating-word state machines.
- **End to end (Playwright), both locales, desktop and phone projects:**
  renders with JavaScript disabled; reduced-motion layout; keyboard walk through every
  control; menu marker follows scroll; project bars and process stations navigate; visit
  links have the right `href`; copy-email fallback; language switch keeps position.
- **Regressions from the prototype, each with its own test:** gold frame aligned to its
  slot with a forced 16 px start offset in RTL; rail line through station centres (≤ 1 px);
  station icons centred (≤ 0.5 px); no stray arc at the first loop stage; content fully
  opaque after rapid back-and-forth scrolling; loader always clears; LIVE badge reads
  left-to-right in Arabic.
- **Accessibility:** axe on each locale and theme, zero violations.
- **Visual snapshots** at fixed scroll positions (S = 0, 1.3, 1.9, 3.5, 4.4, 5.2, 6.2) with
  animations frozen, per locale and theme.
- **Budgets:** Lighthouse CI with the gates of section 1; bundle-size check in CI.

## 10. Do not port from the prototype

- The single fixed stage and spacer (6.4).
- CSS override layers and `!important` chains; write each rule once.
- Tag-level selectors that leak (`.orbit i` broke the station icons).
- Runtime text built with `innerHTML` from content; render with React.
- CDN scripts and Google Fonts links.
- The debug query parameters (`?shot`, `?bg`, `?logo`); keep only what tests need behind a
  non-production flag.
- The always-running frame loop; idle when nothing changes.

## 11. Phases and exit criteria

- **Phase 0 exit:** `pnpm lint typecheck test build` green in CI; `/en` and `/ar`
  placeholder pages deployed with correct `lang`/`dir`, fonts, tokens and both themes;
  API health reachable; Lighthouse gates met on the placeholder.
- **Phase 1 exit:** every item of sections 5 to 9 implemented and tested; owner sign-off on
  desktop and on a real phone in both languages; all section 12 items resolved.

## 12. Open items for the owner (blocking production, not blocking the build)

1. Confirm or correct: "Available for new projects"; "I build software for a hospital";
   Wazifi and Talmeeha as "My own product"; "Reply within two working days";
   "Full-stack developer" as the second title; "Logs · health checks" for monitoring;
   the gaming line; the five "You get" promises.
2. One line per project: the hardest problem and what he did (for later case studies).
3. A read-through of all Arabic copy by a native reader (the owner).
4. Rotate the leaked MongoDB Atlas credentials.
5. Confirm the domain and hosting account are ready for Phase 0 deployment.
