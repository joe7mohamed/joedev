# Installed versions

Recorded from `npm ls --workspaces --include-workspace-root --depth 0`. Append a section in every task that installs something.
`.npmrc` sets `min-release-age=3`, so a version published in the last three days resolves to the previous release.

| Tool | Version |
| --- | --- |
| Node | 24.20.0 |
| npm | 11.19.0 |

## Task 1: monorepo root

| Package | Installed | Where |
| --- | --- | --- |
| @biomejs/biome | 2.5.15 | root devDependency |
| turbo | 2.11.7 | root devDependency (2.11.8 was too new for min-release-age) |
| typescript | 7.0.2 | root devDependency |
| @zakydev/config | 0.0.0 | workspace `packages/config` |

No dependency reported an unreviewed install script (`npm install-scripts ls`), so no `allowScripts` entry was added.

## Task 2: shared package locales

| Package | Installed | Where |
| --- | --- | --- |
| zod | 4.6.7 | dependency of `packages/shared` |
| vitest | 5.0.4 | devDependency of `packages/shared` (5.0.5 was too new for min-release-age) |
| vite | 8.3.4 | devDependency of `packages/shared`, peer of vitest |
| @types/node | 26.6.5 | devDependency of `packages/shared` |
| typescript | 7.0.2 | devDependency of `packages/shared` (also at root) |
| @zakydev/config | 0.0.0 | devDependency `*` of `packages/shared` |

## Task 4: web app

| Package | Installed | Where |
| --- | --- | --- |
| next | 16.4.0 | dependency of `apps/web` (16.4.2 was too new for min-release-age) |
| react / react-dom | 19.3.0 | dependencies of `apps/web` (19.3.1 was too new for min-release-age) |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | devDependencies of `apps/web` |
| @playwright/test | 1.64.0 | devDependency of `apps/web` (1.64.1 was too new for min-release-age) |
| @axe-core/playwright | 4.13.0 | devDependency of `apps/web` |
| @types/react / @types/react-dom | 19.3.0 | devDependencies of `apps/web` |
| @types/node | 26.6.5 | devDependency of `apps/web` |
| typescript | 7.0.2 | devDependency of `apps/web` |
| @zakydev/shared, @zakydev/config | `*` | workspace packages |

No dependency reported an unreviewed install script.

## Fix wave: @types/node on the Node 24 line

| Package | Installed | Where |
| --- | --- | --- |
| @types/node | 24.19.2 | devDependency of `apps/web` and `packages/shared`, replacing 26.6.5 to match the Node 24 runtime (npm resolved 24.19.2 under min-release-age) |

## Phase 1 Task 1: motion math

| Package | Installed | Where |
| --- | --- | --- |
| vitest | 5.0.4 | devDependency of `apps/web` (same version as `packages/shared`) |
| vite | 8.3.4 | devDependency of `apps/web`, peer of vitest (same version as `packages/shared`) |

## Phase 1 Task 13a: sharing image

| Package | Installed | Where |
| --- | --- | --- |
| satori | 0.56.1 | dependency of `apps/web` (0.56.2 to 0.62.0 were too new for min-release-age; 0.56.1 shapes Arabic with HarfBuzz and lays out `direction: rtl`, which the satori 0.29 inside Next 16.4 cannot do) |
| @resvg/resvg-js | 2.6.2 | dependency of `apps/web` (latest stable; the 2.7.0 line is alpha only). Its platform binaries (`@resvg/resvg-js-<platform>`) are optional dependencies with no install script, so `strict-allow-scripts` stays satisfied and `@resvg/resvg-wasm` is not needed |
| @axe-core/playwright | 4.13.0 | already installed in Task 4; not changed |

Both satori and resvg are listed in `serverExternalPackages` (next.config.ts): they load their wasm and native binary
from disk, so Node resolves them unbundled at build time.

`npm install-scripts ls` reports no unreviewed install script. `npm audit` reports one moderate advisory:
GHSA-px8p-9vwx-vf98, an infinite loop in fflate's `unzipSync` on malformed ZIP64 archives, through satori's pinned
`fflate` 0.7.3. Satori only receives the committed fonts below, never untrusted input, at build time only; the only
"fix" npm offers is a downgrade to satori 0.32, which cannot shape Arabic.

### Sharing image fonts (`apps/web/assets/og/`)

Committed TTFs, each with its SIL Open Font License 1.1 file. Read from disk at build time; no runtime requests.

| File | Version | Source | sha256 |
| --- | --- | --- | --- |
| Fraunces72pt-SemiBold.ttf | 1.000 | `UnderCaseType_Fraunces_1.000.zip` from the GitHub release `1.000` of undercasetype/Fraunces, path `Fonts - Desktop/static/ttf/` (archive sha256 `8d8b81dfaeb89433f5c908e1d8d0a4b202bd627bd80d4cd5ff56f311fdcad19f`) | `fe3df7600242e191bcf478175fe51332e82c82f67f33395ccd36781e873640a7` |
| Fraunces-OFL.txt | 1.000 | `OFL.txt` at tag `1.000` of undercasetype/Fraunces (the release archive carries none) | `bdf4c22802eaf804f998195871c6b8938aac2ac14b2d78a8bd66a6f1eced833b` |
| Amiri-Bold.ttf | 1.003 | `Amiri-1.003.zip` from the GitHub release `1.003` of aliftype/amiri (archive sha256 `81af0aff7d2086d8af24cea7202f7546130997982534691373485cd96744d05e`) | `8cfed49b66de57e360ac61631d882dddfa23095d3ddb39fc2133eaf93892e79a` |
| Amiri-OFL.txt | 1.003 | `OFL.txt` in the same archive | `72de68e5954f4fdd24702292ef5a32f003ca960ec9330dc86e5eefb5dffb9b22` |
| GeistMono-Regular.ttf | 1.7.2 | `geist-font-v1.7.2.zip` from the GitHub release `v1.7.2` of vercel/geist-font, path `GeistMono/ttf/` (archive sha256 `7fc800d2ac6b92844895196e5041aca55d814c15db70c44f79b3b83ab82b04e2`; v1.8.1 was one day old) | `42d8ad2e610238e64e8abfcde3037c63f7850a73928742b7ab7229d897bcb155` |
| GeistMono-OFL.txt | 1.7.2 | `OFL.txt` in the same archive | `c683bfbcc7e087f5d37a54ef628f10387c451a83ddc459b151403a164ac46c90` |

Fraunces is the 72 pt optical-size static instance with SOFT 0 (as the hero sets it), semibold, the nearest static
weight to the hero's 560.

## Owner round 2026-10-17: self-hosted display faces (`apps/web/src/fonts/`)

The two display faces moved from `next/font/google` to files in the repository, declared in `fonts/display.css`. Each
page preloads only its own headline's face (Fraunces on `/en`, Amiri on `/ar`, `fonts/display.ts`); `next/font`
preloads a face on every route or on none, and its file names are not known to the code, so it cannot do that. The
body and mono faces (Geist, Geist Mono, IBM Plex Sans Arabic) stay on `next/font/google`, not preloaded, over the
metric-matched fallbacks in `fonts/fallbacks.css` (`adjustFontFallback` is off for them). All three Plex Arabic
weights stay: 400 and 500 set Arabic text, 600 sets the language switch.

Owner decision 2026-10-17 (dialog 4): each face keeps only what its page sets in it, and nothing may look different.

| File | Version | Source | sha256 |
| --- | --- | --- | --- |
| fraunces-latin.woff2 | 1.000 | `Fonts - Web/Fraunces[SOFT,WONK,opsz,wght].woff2` in `UnderCaseType_Fraunces_1.000.zip` (the release above, archive sha256 `8d8b81dfaeb89433f5c908e1d8d0a4b202bd627bd80d4cd5ff56f311fdcad19f`), WONK fixed at 0 as Google Fonts serves it, the axes opsz, wght and SOFT kept (all used); Basic Latin and the typographic punctuation (`U+0020-007E, U+00A0, U+00B7, U+2013-2014, U+2018-201D, U+2026`, also its `unicode-range`), with the default features (rvrn, liga, kern). 80 kB. Visually equivalent to the face Google Fonts served, with a set width about 1–2 % narrower (a different upstream build) | `7b7900aa1454d44da63af9c7cc2c63aaad39d65eb6fc55715e101454344ad9de` |
| Fraunces-OFL.txt | 1.000 | the same file as `assets/og/Fraunces-OFL.txt` | `bdf4c22802eaf804f998195871c6b8938aac2ac14b2d78a8bd66a6f1eced833b` |
| amiri-bold.woff2 | 1.003 | `Amiri-1.003/Amiri-Bold.ttf` in `Amiri-1.003.zip` (the release above, archive sha256 `81af0aff7d2086d8af24cea7202f7546130997982534691373485cd96744d05e`): the Arabic block and Basic Latin plus the joiners and direction marks (`U+0020-007E, U+0600-06FF, U+200C-200F`, also its `unicode-range`), with every feature the browser applies by default (ccmp, locl, init, medi, fina, rlig, liga, rtlm, curs, kern, mark, mkmk); the stylistic sets, fractions and proportional digits, all off by default, are dropped. Only the bold is used (the page sets Amiri at 600 and 700). 87 kB | `246039b527b6baae988f726ccd054e50906599fa4a675b0f8a71c8eeea996923` |
| Amiri-OFL.txt | 1.003 | the same file as `assets/og/Amiri-OFL.txt` | `72de68e5954f4fdd24702292ef5a32f003ca960ec9330dc86e5eefb5dffb9b22` |

Rebuild with `apps/web/scripts/display-fonts.py`, which uses fontTools' subsetter (pyftsubset) and instancer at
fontTools 4.60.1, with brotli 1.1.0, installed outside the repository (the script's header has the command). The build
is byte-reproducible. A text the page adds later that falls outside these ranges is set in the next face of its stack:
extend the range in the script and in `display.css` together.

## Phase 1 Task 13b: visual snapshots, Lighthouse, bundle budget

No package was installed. Two tools run at fixed versions outside the lockfile:

| Tool | Version | Where |
| --- | --- | --- |
| Playwright Docker image | `mcr.microsoft.com/playwright:v1.64.0-noble` | `npm run e2e:visual -w web` and the CI `visual` job. Its tag must equal the installed `@playwright/test` (1.64.0); it ships Node 24.21 |
| @lhci/cli | 0.15.1 | CI step `npx --yes @lhci/cli@0.15.1 autorun`. Lighthouse CI has had no release since June 2025; 0.15.1 bundles Lighthouse 12.6.1 and still runs the assertions. `npx` resolves it under the repository's `.npmrc` without an install-script prompt |

When `@playwright/test` is upgraded, change the image tag in `apps/web/package.json` (`e2e:visual`) and in
`.github/workflows/ci.yml` (`visual`) to the same version, and remake the baselines in the new image.
