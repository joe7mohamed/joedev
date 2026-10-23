# Deploying

Notes a deployment has to respect. The site is fully static: the two home pages, their sharing images, the sitemap,
robots.txt, the manifest, the icon, the PNG app icons and the screenshots are all built ahead by `next build`.

Hosting (owner decision 2026-10-18, Pages first): **Cloudflare Pages** serves the site for now, free, from a static
export; Cloudways Velocity (`next start`) may come later. Both modes are built from the same routes and render the
same HTML, and both are tested:

| Mode | Build | Serves | Headers and redirects |
| --- | --- | --- | --- |
| static (Pages, current) | `npm run build:static` | the files in `apps/web/out/` | `out/_headers`, `out/_redirects` |
| server (Velocity, later) | `npm run build` | `npm start` (`next start`) | `next.config.ts` `headers()`, `redirects()` |

Both take their headers and redirects from one module, `apps/web/src/lib/http-headers.ts`; the static build writes the
two Pages files from it (`apps/web/scripts/pages-files.mjs`), and a unit test checks both carry the same values. A
static build also builds in `apps/web/.next`, so build again with `npm run build` before `npm start`.

Routes (owner decisions 2026-10-17 and 2026-10-18), the same for every visitor and in both modes:

| Path | Answer |
| --- | --- |
| `/` | 200, the English page (the root route of `app/[[...locale]]`; static: `out/index.html`) |
| `/ar` | 200, the Arabic page (static: `out/ar.html`, which Pages serves at `/ar`) |
| `/en`, `/en/` | 308 → `/`, query string kept |
| `/ar/` | a redirect to `/ar` (308 in both, under wrangler) |
| `/opengraph-image`, `/ar/opengraph-image` | 200, `image/png`, the sharing images (no redirect) |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/icon.svg`, `/apple-icon`, `/app-icons/*` | 200 |
| `/shots/*` | 200, the screenshots (AVIF and WebP) |
| any other path, e.g. `/fr`, `/en/x`, `/ar/x` | 404, our own page (`app/global-not-found.tsx`; static: `out/404.html`) |
| `https://www.zakydev.com/*` | 308 → `https://zakydev.com/*` (Pages: a Cloudflare Redirect Rule; server: `next.config.ts`) |

A few odd forms of these paths answer differently in the two modes. None is a regression, and none is indexable: every
page's canonical is `/` or `/ar`, and the 404 page carries `noindex`.

| Path | server (`next start`) | static (Pages) |
| --- | --- | --- |
| `/index` | 200, the English page | 308 → `/` |
| `/EN` | 308 → `/` (Next matches redirects without case) | 404 |
| `/en.rsc` | 308 → `/` | 404 |
| `/en/` | two hops: 308 → `/en`, then 308 → `/` | one hop: 308 → `/` |
| `/404`, `/_not-found` | 404 | 200, our 404 page (`noindex`) |

Nothing runs per request: there is no proxy and no middleware. Both home pages are prerendered routes of one optional
catch-all root segment (`app/[[...locale]]`, English without a segment), so a client-side navigation to either finds
a real payload in both modes (static: `out/index.txt`, `out/ar.txt`). The answer never depends on the visitor's
language: no `Vary: Accept-Language`, no `no-store`.

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
| `STATIC_EXPORT` | Set by `npm run build:static` itself (`1`: the static export). Never set it by hand. |

## Sharing image and app icons

The sharing cards (`app/opengraph-image/route.ts` for `/`, `app/ar/opengraph-image/route.ts` for `/ar`, both drawn
by `src/lib/og-card.tsx`) render at build time with `satori` and `@resvg/resvg-js`, reading the fonts committed under
`apps/web/assets/og/`. The static export writes them, and `/apple-icon`, as files without an extension, so
`out/_headers` gives them `Content-Type: image/png`. The build machine needs:

- the resvg native binary for its platform, installed from the lockfile's optional dependencies
  (`@resvg/resvg-js-linux-x64-gnu` on a glibc Linux x64 host); it has no install script;
- the `apps/web/assets/og/` folder in the checkout.

The PNG app icons (`app/app-icons/[file]/route.ts`, `app/apple-icon.ts`, `src/lib/app-icon.ts`) are rendered the
same way from `public/brand/zakydev-icon-gold.svg`. Nothing is fetched from the network at build time or at run time
for the image or the icons.

## Screenshots

Neither mode runs Next's image server. Before every build, `apps/web/scripts/screenshots.mjs` encodes each
`public/projects/<name>.jpg` into `public/shots/<name>-1280.avif` and `.webp` with `sharp` (a devDependency, the
version Next installs), using the image server's own settings (AVIF quality 47, effort 3; WebP quality 75), so the
files are byte for byte the ones it served. `public/shots/` is built, not committed. A custom `images.loader`
(`src/lib/image-loader.ts`) maps next/image's `(src, width)` to the WebP; each screenshot is a `<picture>` with the
AVIF first, and the hero zoom takes the AVIF through `image-set()` where it can choose by type, so a current browser
downloads one file per screenshot. A browser that decodes AVIF but cannot choose by type in `image-set()` (Chrome
85–112, Safari 16) downloads the first screenshot twice: the AVIF for the frame and the WebP for the zoom. That is
kept on purpose: making the zoom AVIF-only would break it in browsers without AVIF.

The build machine needs sharp's platform binary from the lockfile's optional dependencies (`@img/sharp-linux-x64` on
glibc Linux x64); it has no install script.

| Screenshot | AVIF (bytes) | WebP (bytes) |
| --- | --- | --- |
| nuammer | 29,015 | 43,692 |
| wazifi | 22,455 | 30,956 |
| talmeeha | 5,646 | 9,390 |

## Headers

Every response, in both modes, except the redirects of `next start` (below): the Content-Security-Policy below,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy: camera=(), microphone=(), geolocation=()`, `X-Frame-Options: DENY` and
`Strict-Transport-Security: max-age=31536000` (no `includeSubDomains` until the subdomains are audited for HTTPS, no
`preload`). On Pages, `out/_headers` also:

- sets `Cache-Control: public, max-age=0, must-revalidate` on everything (HTML revalidates with its ETag);
- gives `/_next/static/*`, which holds every script, stylesheet and font, `public, max-age=31536000, immutable`
  (its names change with their content);
- drops the `Access-Control-Allow-Origin: *` Pages adds by default, which `next start` never sends;
- sends `X-Robots-Tag: noindex` on every `pages.dev` address of the project: `zakydev.pages.dev` and each
  deployment's `<hash>.zakydev.pages.dev`, production deployments included (Pages marks only preview deployments
  `noindex` itself). The rules match those hosts only, so search engines keep to zakydev.com.

On Pages the redirects (`/en`, `/en/`, `/ar/`) carry the security headers too. Under `next start` they do not: Next
does not apply `headers()` to `redirects()` answers, so its 308s send only `location`. A redirect has no body and the
next answer brings HSTS, so the cost is small; `e2e/foundation.spec.ts` pins this, and at the Velocity move NGINX or
the CDN can add the headers.

`next start` sets its own caching (`/_next/static` immutable, prerendered HTML `s-maxage=31536000`).

## Content-Security-Policy

Sent on every response (`src/lib/http-headers.ts`, in both modes):

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

`e2e/a11y.spec.ts` checks that the header is sent exactly as above and that `/`, `/ar` and `/?bg=soft` (the
WebGL background) hydrate and scroll through every scene without one violation report.

Revisit when Next can hash its own inline scripts for static output. Then `'unsafe-inline'` can give way to hashes.

## Route-JS budget

The scripts `/` and `/ar` load (`<script src>` in the prerendered HTML, gzipped, without the `noModule` polyfills
and without the background shader's chunk, which loads later) stay at or below 170 kB (spec line 32; the owner raised it
from 150 kB on 2026-10-17).
`node apps/web/scripts/check-bundle.mjs` checks the server build (`.next/server/app/index.html` and `ar.html`) after
`npm run build`, and `node apps/web/scripts/check-bundle.mjs --static` the export (`out/index.html` and `out/ar.html`)
after `npm run build:static`; CI runs both on production builds. To see what is in the scripts: `npx next analyze` in
`apps/web`.

Headroom: about 19 kB. The server build loads 150,974 bytes of the 170,000 on each page, the static export
151,211 (its router chunk is built for an export). Next.js 16.4.2 (2026-10-23, a security release) added about
100 bytes to each; before it, 150,872 and 151,114. The Pages round added 155 bytes to the server build: the
loading screen now loads each screenshot through a `<picture>`. Before it, 150,717 (the URL round added 819 bytes: the
language switch navigates with `useRouter().push`; `next/link` would have cost 3,616). The limit was 150 kB until
2026-10-17, when the final fix wave of Phase 1 had left only 0.1 kB; the owner raised it rather than split the route. A
feature that adds client JavaScript should still say how much it adds; the limit itself does not move again without an
owner decision.

## Deploy steps (owner + Claude)

You click; Claude reads the results back and checks from outside. Never paste passwords or tokens into chat.

### Cloudflare Pages (current host)

Owner decision 2026-10-18, Pages first. Pages builds the repository on every push to the production branch and serves
`apps/web/out`. The domain's DNS zone is already on Cloudflare.

#### 0. Before you start (Claude)
- CI green on `rebuild/zakydev` at the commit being deployed, the `static` job included.
- Next.js / React security releases newer than docs/VERSIONS.md checked; bump if one exists and has cleared min-release-age.

#### 1. Save what is there (you)
1. Cloudflare dashboard → zakydev.com → DNS → Records → **Export** (zone file). Keep the file; send Claude only the
   record *names and types*.
2. Tell Claude every subdomain you see (e.g. `mail.`, `calendar.`) so each can be checked for HTTPS before HSTS ever
   widens.

**Never touch the MX, TXT (SPF `v=spf1 … _spf.google.com`), DKIM (`google._domainkey`), DMARC (`_dmarc`) or
`google-site-verification` records**, nor any other subdomain. Google Workspace mail depends on them.

#### 2. Create the Pages project (you)
1. Cloudflare dashboard (account home) → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**
   (shown as "Import an existing Git repository").
2. GitHub → authorise Cloudflare for `joe7mohamed/joedev` only → select **joe7mohamed/joedev** → **Begin setup**.
3. Set up builds and deployments:

| Field | Value |
| --- | --- |
| Project name | `zakydev` (the preview address becomes `zakydev.pages.dev`) |
| Production branch | `rebuild/zakydev` (switch to `main` after the merge: Settings → Builds & deployments) |
| Framework preset | **None** |
| Build command | `npm run build:static` |
| Build output directory | `apps/web/out` |
| Root directory (advanced) | empty: the repository root |

4. Environment variables (advanced) → **Add variable**, for Production (and Preview):
   - `NEXT_PUBLIC_SITE_URL` = `https://zakydev.com`
   - `NODE_VERSION` = `24.20.0`. `.nvmrc` says only `24`; the full version makes the build repeatable, and Node
     24.20.0 bundles npm 11.19.0, which the repository's `devEngines` asks for.
   - Do **not** set `NEXT_PUBLIC_E2E`. Leave `REQUIRE_CONFIRMED` unset until sign-off.
5. **Save and Deploy**.

#### 3. First deploy on `zakydev.pages.dev` (you deploy, Claude reads)
- Copy the build log to Claude (or the lines with the Node/npm versions and any error). Pages installs the packages
  itself from `package-lock.json` (with the repository's `.npmrc`), then runs the build command.
- The build downloads the body fonts: it needs outbound HTTPS to `fonts.googleapis.com` and `fonts.gstatic.com`
  ("Build machine: network").
- Known possible fix Claude will tell you to apply: npm older than 11.19 (the `devEngines` check fails) → add
  `SKIP_DEPENDENCY_INSTALL` = `1` and set the build command to
  `npm install -g npm@11.19.0 && npm ci && npm run build:static`.
- Send Claude the `https://<hash>.zakydev.pages.dev` address of the deployment; Claude runs the checks of step 6
  against it. Every `pages.dev` address carries `X-Robots-Tag: noindex` from `out/_headers`, so none is indexed.
  If the project's address is not exactly `zakydev.pages.dev` (Pages adds a suffix when the name is taken), use the
  address it shows wherever this file says `zakydev.pages.dev`; the `noindex` rules cover it either way.

#### 4. Connect the domain (you)
1. Pages → the `zakydev` project → **Custom domains** → **Set up a custom domain** → `zakydev.com` → **Continue** →
   **Activate domain**.
2. Again for `www.zakydev.com`.
3. Pages creates the DNS records itself (a CNAME to `zakydev.pages.dev` on `@` and on `www`). They are **proxied
   (orange cloud)**, which is correct for Pages. **This is the opposite of the Velocity instruction (DNS only, grey
   cloud): do not change them to grey.** If Pages reports an existing record on `@` or `www`, delete only that A,
   AAAA or CNAME record and retry; never touch MX or TXT.
4. Wait until both domains show **Active** (usually minutes; up to 24 h).

#### 5. www → bare domain, and zone settings (you)
1. zakydev.com → **Rules** → **Redirect Rules** → **Create rule**:

| Field | Value |
| --- | --- |
| Rule name | `www to apex` |
| If incoming requests match | **Custom filter expression** |
| Field / Operator / Value | `Hostname` / `equals` / `www.zakydev.com` |
| Then: URL redirect, Type | **Dynamic** |
| Expression | `concat("https://zakydev.com", http.request.uri.path)` (the path of the request on the bare host) |
| Status code | **308** |
| Preserve query string | **On** |

   Then **Deploy**. (The expression reads, as text, `https://zakydev.com${http.request.uri.path}`.)
2. zakydev.com → **Scrape Shield** → **Email Address Obfuscation**: **Off**. It rewrites the email links in the HTML
   and adds a script, which changes the page React hydrates.
3. zakydev.com → **Speed** → **Optimization** → **Rocket Loader**: **Off** (it rewrites the page's scripts).
4. Leave **SSL/TLS** → **Edge Certificates** → **HTTP Strict Transport Security** off: the site sends its own HSTS
   header, and Cloudflare's would add `includeSubDomains` for Google Workspace's subdomains if switched on with it.
   **Always Use HTTPS**: On.
5. No Cloudflare scripts in the pages. Each of these adds scripts the site did not ask for. The Web Analytics beacon
   is a third-party request, which breaks the rule of no third-party requests, and the CSP blocks it with a violation
   on every page. The bot scripts load from the site's own `/cdn-cgi/` path, so the CSP allows them and no test sees
   them; only the step-6 grep catches them all.
   - Account home → **Analytics & Logs** → **Web Analytics**: Cloudflare turns it on by default for a proxied zone on
     the free plan, so zakydev.com is probably listed. If it is: zakydev.com → **Manage site** → **Disable**.
   - **Workers & Pages** → the `zakydev` project → **Metrics** → **Web Analytics**: **Off** (it is off unless someone
     turned it on).
   - zakydev.com → **Security** → **Settings** → filter **Bot traffic**: **Bot fight mode** Off. While it is on,
     JavaScript detections are on too and cannot be turned off. If a **JS detections** switch is shown, Off.

#### 6. Verify (Claude, from outside)
curl checks, adapted for Pages (`HTTP/2`, `cf-ray` present):

```
curl -sI https://zakydev.com/ | head -n 1                                      # HTTP/2 200 (English, lang="en" dir="ltr")
curl -sI https://zakydev.com/en | grep -iE '^(HTTP|location)'                  # HTTP/2 308, location: /
curl -sI 'https://zakydev.com/en?utm=1' | grep -i '^location'                  # /?utm=1
curl -sI https://zakydev.com/en/ | grep -iE '^(HTTP|location)'                 # HTTP/2 308, location: /
curl -sI https://zakydev.com/ar | head -n 1                                    # HTTP/2 200 (Arabic, lang="ar" dir="rtl")
curl -sI https://zakydev.com/fr | head -n 1                                    # HTTP/2 404 (our page, not the home page)
curl -sI https://www.zakydev.com/ar | grep -iE '^(HTTP|location)'              # HTTP/2 308, location: https://zakydev.com/ar
curl -sI 'https://www.zakydev.com/?utm=1' | grep -i '^location'                # https://zakydev.com/?utm=1
curl -sI https://zakydev.com/ | grep -i 'strict-transport-security'            # max-age=31536000, no includeSubDomains, no preload
curl -sI https://zakydev.com/ | grep -iE '^(content-security-policy|x-frame-options|permissions-policy|referrer-policy|x-content-type-options)'
curl -sI https://zakydev.com/ | grep -iE '^(cache-control|vary|access-control)' # public, max-age=0, must-revalidate; no Accept-Language; no CORS
curl -sI https://zakydev.com/opengraph-image | grep -iE '^(HTTP|content-type)'  # HTTP/2 200, image/png, no redirect
curl -sI https://zakydev.com/ar/opengraph-image | grep -iE '^(HTTP|content-type)'
curl -sI https://zakydev.com/shots/nuammer-1280.avif | grep -iE '^(HTTP|content-type)'  # 200, image/avif
curl -s https://zakydev.com/ | grep -o '/_next/static/[^"]*\.woff2' | head -n 1 | xargs -I{} curl -sI https://zakydev.com{} | grep -i '^cache-control'  # public, max-age=31536000, immutable
curl -sI https://zakydev.com/ | grep -ciE '^(x-content-type-options|referrer-policy|content-security-policy):'  # 3: each sent once, not doubled with Pages' own
curl -s https://zakydev.com/ | grep -cE 'cloudflareinsights|cdn-cgi|email-decode|rocket-loader'   # 0: nothing injected (step 5)
curl -s https://zakydev.com/ar | grep -cE 'cloudflareinsights|cdn-cgi|email-decode|rocket-loader' # 0
curl -sI https://zakydev.pages.dev/ | grep -i '^x-robots-tag'                    # noindex
curl -sI https://<hash>.zakydev.pages.dev/ | grep -i '^x-robots-tag'             # noindex (a production deployment too)
curl -sI https://zakydev.com/ | grep -ci '^x-robots-tag'                        # 0: the domain itself is indexable
```

Then the static suite, against Pages itself instead of a local wrangler. It covers what only Pages can show: the query
on the 308s, the extensionless `Content-Type`, the `/ar/` slash, the soft language switch fetching its segment files,
and one value per header:

```
cd apps/web && STATIC_BASE_URL=https://<hash>.zakydev.pages.dev npm run e2e:static
```

Also: `dig MX zakydev.com` still Google, and the MX/TXT records unchanged against the export of step 1. Then you send a
test email to youssef@zakydev.com from another account.

#### 7. Lighthouse on the live site (Claude)
Mobile, `/` and `/ar`; gates 90 / 100 / 100 / 100; record scores, TTFB and the Cloudflare colo (`cf-ray` suffix).

#### 8. Sign-off and merge (you decide)
- Claude sets `REQUIRE_CONFIRMED` = `1` in the Pages project's environment variables, retries the deployment, and opens
  the PR to `main` only on your word; then switch the production branch to `main`.
- Owner housekeeping: the `joedb` database user in MongoDB Atlas was deleted by the owner on 2026-10-18, so the password still visible in the public git history (`DEPLOYMENT.md` on `main`, commit 888cc10) no longer works. Optionally claim the npm org `zakydev`.

### Later: Cloudways Velocity

Kept for when the site moves to `next start` (owner decision 2026-10-16; Pages first since 2026-10-18). The server mode
is tested in CI on every push (job `check`), so these steps stay valid.

#### 0. Before you start (Claude)
- CI green on `rebuild/zakydev` at the commit being deployed.
- Next.js / React security releases newer than docs/VERSIONS.md checked; bump if one exists and has cleared min-release-age.

#### 1. Cloudflare: save what is there (you)
1. Cloudflare dashboard → zakydev.com → DNS → Records → **Export** (zone file). Keep the file; send Claude only the record *names and types* (no need to share values).
2. Tell Claude every subdomain you see (e.g. `mail.`, `calendar.`) so each can be checked for HTTPS before HSTS ever widens.

Never touch: **MX**, **TXT** (SPF `v=spf1 … _spf.google.com`, `_dmarc`, `google._domainkey`, `google-site-verification`), or any other subdomain.

#### 2. Velocity: create the app (you)
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

#### 3. First deploy on the temporary address (you deploy, Claude reads)
- Copy the build log to Claude (or the lines with Node/npm versions and any error).
- The build downloads the fonts: it needs outbound HTTPS to `fonts.googleapis.com` and `fonts.gstatic.com` (see "Build machine: network").
- Known possible fixes Claude will tell you to apply, one at a time:
  - npm older than 11.19 → build command `npm install -g npm@11 && npm run build` (or Claude relaxes devEngines).
  - `turbo: not found` → build command `npm ci --include=dev && npm run build`.
- Watch Monitoring during the build; tell Claude the peak memory (Starter: 2 GB shared).
- Send Claude the temporary `*.cloudwaysnodeapps.com` URL; Claude checks `/` (200), `/en` (308 → `/`), `/ar` (200), `/fr` (404).
- Pages may be running on the domain by then: move the domain only after the Velocity app passes these checks, and
  turn the Pages custom domains off (Pages → the project → Custom domains → remove) when the records change.

#### 4. Connect the domain (you)
1. Velocity → Domain Management → add `zakydev.com` and `www.zakydev.com`.
2. Velocity shows the records to create. **Copy them from the dashboard** (CNAME preferred; A records if the apex CNAME is refused).
3. Cloudflare DNS: delete only existing **A / AAAA / CNAME** on `@` and `www` (if any; the Pages records among them), then add Velocity's records with **Proxy status: DNS only (grey cloud)**. This is the opposite of Pages, whose records are proxied (orange).
4. Rules → Redirect Rules: turn off the `www to apex` rule from the Pages steps (`next.config.ts` redirects www itself).
5. Wait for Velocity to mark the domain Active (up to 24 h, it emails you).

#### 5. CDN panel in Velocity (you)
- Caching on; Image Optimization (Polish) **Off**; WAF / rate limiting / Browser Integrity Check at defaults.
- After every deploy: **Purge**.

#### 6. Verify (Claude, from outside)
curl checks (owner decision 2026-10-17 on the routes):

```
curl -sI https://zakydev.com/ | head -n 1                                  # HTTP/2 200 (English, lang="en" dir="ltr")
curl -sI https://zakydev.com/en | grep -iE '^(HTTP|location)'              # 308, location: /
curl -sI 'https://zakydev.com/en?utm=1' | grep -i '^location'              # /?utm=1
curl -sI https://zakydev.com/ar | head -n 1                                # HTTP/2 200 (Arabic, lang="ar" dir="rtl")
curl -sI https://zakydev.com/fr | head -n 1                                # HTTP/2 404
curl -sI https://www.zakydev.com/ar | grep -iE '^(HTTP|location)'          # 308, location: https://zakydev.com/ar
curl -sI https://zakydev.com/ | grep -i 'strict-transport-security'        # max-age=31536000, no includeSubDomains, no preload
curl -sI https://zakydev.com/ | grep -iE '^vary'                           # no Accept-Language
curl -sI https://zakydev.com/opengraph-image | head -n 1                   # HTTP/2 200, no redirect
```

Also: cf-cache-status not HIT for the HTML, and `dig MX` still Google. Then you send a test email to youssef@zakydev.com from another account.

#### 7. Lighthouse on the live site (Claude)
Mobile, `/` and `/ar`; gates 90 / 100 / 100 / 100; record scores, TTFB and server location.

#### 8. Sign-off and merge (you decide)
- Confirm or change every `u()` string (Claude gives the list).
- Claude sets `REQUIRE_CONFIRMED=1` in Velocity env, redeploys, opens the PR to `main` only on your word; then switch branch to `main`, auto-deploy on.
- Owner housekeeping: the `joedb` database user in MongoDB Atlas was deleted by the owner on 2026-10-18, so the password still visible in the public git history (`DEPLOYMENT.md` on `main`, commit 888cc10) no longer works. Optionally claim the npm org `zakydev`.

## Display fonts after a copy change

The display faces (Fraunces on `/`, Amiri on `/ar`) carry only the characters in `apps/web/src/fonts/subsets.json`.
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
production build of `/` and `/ar`, mobile, three runs each, asserting the median. The GitHub runner has no GPU:
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
