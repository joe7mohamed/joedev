# Deploying

Notes a deployment has to respect. The site is fully static: `/en`, `/ar`, their sharing images, the sitemap,
robots.txt, the manifest and the icon are all prerendered by `next build`. Only the `/` language redirect
(`src/proxy.ts`) runs per request.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap, robots and structured data. Optional: without it the origin is `https://` + the confirmed domain in `packages/shared` (`site.domain`). |
| `NEXT_PUBLIC_E2E` | Test builds only. Never set it for a deployment. |
| `REQUIRE_CONFIRMED` | `1` makes the build fail while any copy still waits for the owner's confirmation. |

## Sharing image

`app/[locale]/opengraph-image.tsx` renders at build time with `satori` and `@resvg/resvg-js`, reading the fonts
committed under `apps/web/assets/og/`. The build machine needs:

- the resvg native binary for its platform, installed from the lockfile's optional dependencies
  (`@resvg/resvg-js-linux-x64-gnu` on a glibc Linux x64 host); it has no install script;
- the `apps/web/assets/og/` folder in the checkout.

Nothing is fetched from the network at build time or at run time for the image.

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
and without the background shader's chunk, which loads later) stay at or below 150 kB (spec line 32).
`node apps/web/scripts/check-bundle.mjs` checks it after `npm run build`; CI runs it on the production build. To see
what is in the scripts: `npx next analyze` in `apps/web`.

