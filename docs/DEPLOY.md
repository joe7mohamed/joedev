# Deploying

Notes a deployment has to respect. The site is fully static: `/en`, `/ar`, their sharing images, the sitemap,
robots.txt, the manifest, the icon and the PNG app icons are all prerendered by `next build`. Only the `/` language
redirect (`src/proxy.ts`) runs per request.

## Build machine: network

`next build` downloads the web fonts (`next/font/google`, `src/lib/fonts.ts`) and self-hosts them in the build
output. The build machine needs outbound HTTPS to `fonts.googleapis.com` and `fonts.gstatic.com`; an offline build
fails. Nothing is fetched at run time: visitors only ever load fonts from the site itself. If the build host cannot
reach Google Fonts, switch the faces to `next/font/local` with the font files committed.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap, robots and structured data. Optional: without it the origin is `https://` + the confirmed domain in `packages/shared` (`site.domain`). |
| `NEXT_PUBLIC_E2E` | Test builds only. Never set it for a deployment. |
| `REQUIRE_CONFIRMED` | `1` makes the build fail while any copy still waits for the owner's confirmation. |

## Sharing image and app icons

`app/[locale]/opengraph-image.tsx` renders at build time with `satori` and `@resvg/resvg-js`, reading the fonts
committed under `apps/web/assets/og/`. The build machine needs:

- the resvg native binary for its platform, installed from the lockfile's optional dependencies
  (`@resvg/resvg-js-linux-x64-gnu` on a glibc Linux x64 host); it has no install script;
- the `apps/web/assets/og/` folder in the checkout.

The PNG app icons (`app/app-icons/[file]/route.ts`, `app/apple-icon.ts`, `src/lib/app-icon.ts`) are rendered the
same way from `public/brand/zakydev-icon-gold.svg`. Nothing is fetched from the network at build time or at run time
for the image or the icons.

## Content-Security-Policy

Sent on every response (`next.config.ts`):

```
default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline';
font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

Why `script-src` allows `'unsafe-inline'` (checked against the Next 16.4 CSP guide):

- The pages are static, carry no user-supplied content and load no third-party scripts, so an injected inline script
  has no way in.
- Nonces would force dynamic rendering of every page. The home page stays static.
- `experimental.sri` only adds `integrity` to the external `<script src>` files, not to inline scripts.
- Static App Router pages still carry inline RSC payload scripts (`self.__next_f.push(...)`) whose content changes
  with every build, so no fixed hash can cover them.
- Adding any `'sha256-…'` source would make browsers ignore `'unsafe-inline'`, and those RSC scripts would stop
  running. So the policy lists no hashes, not even for the theme script in `<head>`.

There is no `'unsafe-eval'` in any build. Only `next dev` adds it (`src/lib/csp.ts`), because React's development
tooling needs it; `src/lib/csp.test.ts` keeps the shipped policy byte for byte. zod no longer reaches the browser at
all: client components import their text helpers from `@zakydev/shared/text`, and `scripts/check-bundle.mjs` fails
the build check if zod shows up in a page script. zod is still told not to probe for eval
(`z.config({ jitless: true })` in `packages/shared/src/content/schema.ts`), in case the content module ever runs in a
browser again: its probe, `Function("")`, raises a CSP violation report.

`e2e/a11y.spec.ts` checks that the header is sent exactly as above and that `/en`, `/ar` and `/en?bg=soft` (the
WebGL background) hydrate and scroll through every scene without one violation report.

Revisit when Next can hash its own inline scripts for static output. Then `'unsafe-inline'` can give way to hashes.

## Route-JS budget

The scripts `/en` and `/ar` load (`<script src>` in the prerendered HTML, gzipped, without the `noModule` polyfills
and without the background shader's chunk, which loads later) stay at or below 170 kB (spec line 32; the owner raised it
from 150 kB on 2026-10-17).
`node apps/web/scripts/check-bundle.mjs` checks it after `npm run build`; CI runs it on the production build. To see
what is in the scripts: `npx next analyze` in `apps/web`.

Headroom: about 20 kB. Both routes load 149,898 bytes of the 170,000, so 20,102 bytes are left. The limit was
150 kB until 2026-10-17, when the final fix wave of Phase 1 had left only 0.1 kB; the owner raised it rather than split
the route. A feature that adds client JavaScript should still say how much it adds; the limit itself does not move
again without an owner decision.

## Deploy steps (owner + Claude)

You click; Claude reads the results back and checks from outside. Never paste passwords or tokens into chat.

### 0. Before you start (Claude)
- CI green on `rebuild/zakydev` at the commit being deployed.
- Next.js / React security releases newer than docs/VERSIONS.md checked; bump if one exists and has cleared min-release-age.

### 1. Cloudflare: save what is there (you)
1. Cloudflare dashboard → zakydev.com → DNS → Records → **Export** (zone file). Keep the file; send Claude only the record *names and types* (no need to share values).
2. Tell Claude every subdomain you see (e.g. `mail.`, `calendar.`) so each can be checked for HTTPS before HSTS ever widens.

Never touch: **MX**, **TXT** (SPF `v=spf1 … _spf.google.com`, `_dmarc`, `google._domainkey`, `google-site-verification`), or any other subdomain.

### 2. Velocity: create the app (you)
Cloudways → Velocity → Launch application → GitHub → repo `joe7mohamed/joedev`.

| Field | Value |
| --- | --- |
| Server location | closest to Bahrain from the list (tell Claude which) |
| Framework preset | Next.js (pick it yourself — the dashboard does not always auto-detect) |
| Branch | `rebuild/zakydev` (switch to `main` after the merge) |
| Node version | **24.x** (if only 22 is offered, stop and tell Claude) |
| Package manager | npm |
| Root directory | `./` |
| Build command | `npm run build` |
| Start command | `npm start` |
| Auto-deploy | **Off** for now |

Environment variables (before the first deploy):
- `NEXT_PUBLIC_SITE_URL` = `https://zakydev.com`
- Do **not** set `NEXT_PUBLIC_E2E`. Leave `REQUIRE_CONFIRMED` unset until sign-off.

### 3. First deploy on the temporary address (you deploy, Claude reads)
- Copy the build log to Claude (or the lines with Node/npm versions and any error).
- The build downloads the fonts: it needs outbound HTTPS to `fonts.googleapis.com` and `fonts.gstatic.com` (see "Build machine: network").
- Known possible fixes Claude will tell you to apply, one at a time:
  - npm older than 11.19 → build command `npm install -g npm@11 && npm run build` (or Claude relaxes devEngines).
  - `turbo: not found` → build command `npm ci --include=dev && npm run build`.
- Watch Monitoring during the build; tell Claude the peak memory (Starter: 2 GB shared).
- Send Claude the temporary `*.cloudwaysnodeapps.com` URL; Claude checks `/en`, `/ar`, `/`, `/fr` (404).

### 4. Connect the domain (you)
1. Velocity → Domain Management → add `zakydev.com` and `www.zakydev.com`.
2. Velocity shows the records to create. **Copy them from the dashboard** (CNAME preferred; A records if the apex CNAME is refused).
3. Cloudflare DNS: delete only existing **A / AAAA / CNAME** on `@` and `www` (if any), then add Velocity's records with **Proxy status: DNS only (grey cloud)**.
4. Wait for Velocity to mark the domain Active (up to 24 h, it emails you).

### 5. CDN panel in Velocity (you)
- Caching on; Image Optimization (Polish) **Off**; WAF / rate limiting / Browser Integrity Check at defaults.
- After every deploy: **Purge**.

### 6. Verify (Claude, from outside)
curl checks for 200 / lang+dir / Accept-Language redirect / 404 / www→apex 308 / HSTS (no includeSubDomains, no preload) / cf-cache-status not HIT for HTML / `dig MX` still Google. Then you send a test email to youssef@zakydev.com from another account.

### 7. Lighthouse on the live site (Claude)
Mobile, /en and /ar; gates 90 / 100 / 100 / 100; record scores, TTFB and server location.

### 8. Sign-off and merge (you decide)
- Confirm or change every `u()` string (Claude gives the list).
- Claude sets `REQUIRE_CONFIRMED=1` in Velocity env, redeploys, opens the PR to `main` only on your word; then switch branch to `main`, auto-deploy on.
- Owner housekeeping, still open: delete the `joedb` database user (or the whole project) in MongoDB Atlas. Its password is in the public git history (`DEPLOYMENT.md` on `main`, commit 888cc10). Deleting the local `.env`, which is already done, does not revoke it; only deleting the Atlas user does. Optionally claim the npm org `zakydev`.

## Display fonts after a copy change

The display faces (Fraunces on `/en`, Amiri on `/ar`) carry only the characters in `apps/web/src/fonts/subsets.json`.
`npm test` fails (`src/fonts/display-text.test.ts`) when any display string of the content (headline, project names,
step names, headings, the email) uses a character outside them. Then add the code points to `subsets.json` and the same
`unicode-range` to `apps/web/src/fonts/display.css`, and regenerate the files with one command from the repository root
(it downloads the upstream releases and checks their sha256; docs/VERSIONS.md):

`python3 -m pip install --target /tmp/zk-fonttools fonttools==4.60.1 brotli==1.1.0 && PYTHONPATH=/tmp/zk-fonttools npm run fonts -w web`

Then update the files' sha256 in docs/VERSIONS.md.

## LCP after launch

Lighthouse's LCP, locally and in CI, is a lab simulation on a throttled connection. After launch, real-visitor LCP (the
field data in Search Console, Core Web Vitals) is the real LCP test.

## Lighthouse

CI runs Lighthouse CI (`apps/web/lighthouserc.json`, `@lhci/cli` 0.15.1, which bundles Lighthouse 12.6.1) on the
production build of `/en` and `/ar`, mobile, three runs each, asserting the median. The GitHub runner has no GPU:
Chrome's WebGL there is software-rendered, so the page shows the CSS gradient instead of the shader
(`failIfMajorPerformanceCaveat`), and Lighthouse measures that fallback, not the shader.

Owner decision 2026-10-17: two assertions only warn, the LCP of both pages and the performance score of `/ar`. Lantern,
Lighthouse's simulation, counts every font and script requested before the first paint (on `/ar` about 87 kB of Amiri
and the Arabic body faces), so the lab LCP stays near 3 s and `/ar` performance near 0.89 although the headline paints
at once. Every other assertion fails the job at its threshold. Real-visitor LCP after launch is the real LCP test (see
"LCP after launch").

Locally, under WSL, point `CHROME_PATH` at a Linux Chrome (chrome-launcher otherwise picks the Windows one) and run
inside the port-3000 namespace, for example
`CHROME_PATH=/usr/bin/google-chrome unshare -rn bash -c 'ip link set lo up && npx --yes @lhci/cli@0.15.1 autorun --config=apps/web/lighthouserc.json --collect.settings.chromeFlags=--no-sandbox'`
(`--no-sandbox` only because the namespace maps the user to root).
