# Phase 1 sign-off pack (2026-10-17)

Branch `rebuild/zakydev`, head after the final-review fix wave: `153a0e6`. Phase 1 Tasks 1–13 are done, reviewed task by task, and passed a final whole-branch review plus one fix wave and a clean re-review. CI runs lint, typecheck, unit tests, the build, the full e2e suite (386 tests), the route-JS budget, and visual snapshots in the Playwright image. The owner's decisions of 2026-10-17 (section 1) were then built on the same branch.

What is left needs the owner: the decisions below, the copy confirmation, then deployment (Phase 0 Task 7, steps in `docs/DEPLOY.md`) and the merge to `main` (Phase 1 Task 14).

## 1. Decisions for the owner

The owner decided these on 2026-10-17.

1. **Load speed: the hero slides in without the fade.** The headline, the sentence and the rows around them are painted at full opacity from the first paint. They still build in: the headline rises and tips into place with the prototype's timing, the rows slide up, and the title types in. Lighthouse now sees the largest text at the first paint, and accessibility reads 1 on both pages. Lighthouse's simulated LCP is still about 3.3–3.5 s, because it also waits for the fonts and scripts the page asks for before that paint. So the Lighthouse CI step stays parked on `hold/lhci-ci` until every gate passes.
2. **Arabic font preload: left off.** One side effect is now visible. The Arabic headline is shown while its font loads, so on `/ar` desktop the font swap moves it, and the layout-shift check reads 0.05–0.10 there (the limit is 0.05). Preloading the Arabic display font brings it back under 0.03. This needs a new look; see the owner-round report.
3. **Route-JS budget: 170 kB gzip.** Both pages load 149,898 bytes, so about 20 kB is left (spec line 32, `check-bundle.mjs`, `docs/DEPLOY.md`).
4. **Large phones: fixed.** Phones about 414–430 × 832–836, a window about 860 × 700 and the 768 × 1024 tablet now pin every scene, in both languages. The tested sizes that pinned before measure the same as before.
5. **Secrets.** MongoDB is no longer used, and the old root `.env` has been deleted. It was never tracked in git, and nothing in the repository reads it.
6. **Two small differences from the prototype, accepted:**
   - the loader's `%` is a literal sign;
   - in Arabic, the loader bar fills from the right, like the header progress bar.

## 2. Copy to confirm (spec 12)

These strings are wrapped in `u()`. A build with `REQUIRE_CONFIRMED=1` fails until every one is confirmed or changed (`packages/shared/src/content/home.en.ts` / `home.ar.ts`).

| Key | English | Arabic |
| --- | --- | --- |
| nav.sections (menu label) | Sections | الأقسام |
| hero.titles[1] | Full-stack developer | مطوّر Full-Stack |
| hero.availability | Available for new projects | متاح لمشاريع جديدة |
| Wazifi and Talmeeha meta | My own product | مشروعي الخاص |
| process.live (badge) | LIVE | LIVE |
| step 1 "You get" | A clear plan | خطة واضحة |
| step 2 "You get" | Screens you can click through | شاشات يمكنك تجربتها |
| step 3 "You get" | A working version, early | نسخة تعمل، مبكرًا |
| step 4 "You get" | Fewer surprises | مفاجآت أقل |
| step 5 "You get" | A live product, looked after | منتج يعمل، مع متابعة |
| monitoring tools | Logs · health checks | Logs · health checks |
| about: day job | I build software for a hospital. | أبني برمجيات لمستشفى. |
| about: after work | League of Legends, Valorant and TFT. Read the map, make the call, adapt. | League of Legends و Valorant و TFT. أقرأ الخريطة، أقرّر، وأتكيّف. |
| about drawing label | HEALTHCARE → CODE | HEALTHCARE → CODE |
| about drawing games | LOL · VALORANT · TFT | LOL · VALORANT · TFT |
| contact meta | Reply within two working days | أردّ خلال يومي عمل |

Also from spec 12:
- one line per project (the hardest problem and what you did), for later case studies;
- a native read-through of all the Arabic copy;
- the leaked MongoDB Atlas credentials and the untracked root `.env`: done, MongoDB is no longer used and the `.env` is deleted (item 1.5);
- optional: claim the npm org `zakydev`.

## 3. Known small items left on purpose

None of these is a blocker. They are listed so nothing is hidden.

**Engine and scroll**
- If hydration takes longer than 6 s, the layout goes pinned → stacked → pinned.
- During the ≈ 0.4 s before hydration, scrolling lets later scenes slide over the hero.
- While a scene flows, the scroll restore after measuring can cut a smooth scroll short.
- `engine.ts` is at 300 lines; split it before the next engine change.

**Accessibility**
- On the enhanced page, a screen reader reaches the names of the projects and steps that are out of view, but not their bodies (`hidden="until-found"`).
- A focus can be restored to an item later than expected.
- Real Ctrl+F on `until-found` content was only tested with a synthetic event; check it by hand in Chrome.

**Look**
- The no-JS light theme misses three component-level rules.
- Typing steps can cut mid-glyph.
- On the stacked `/en` page at 390 px, LinkedIn wraps to a second row.
- Card drawings are letterboxed at 768×1024.

**Tests and repo**
- Several e2e tests use fixed waits, which is a flake risk on slow CI. The e2e job now takes about 10.6 minutes on GitHub's 2-core runner, against the job's 20-minute timeout.
- Each visual-baseline regeneration adds about 13 MB to the history; Git LFS was not added.
- The `og:image` URL has no content hash, so social caches may keep an old card after a headline change.

## 4. Rulings I made

Every decision taken on the owner's behalf during Phase 1, in order, with what it costs if it was wrong.

**Process**
1. Deployment (Phase 0 Task 7) and sign-off (Task 14) run together at the very end. This was the owner's instruction. Cost if wrong: none.
2. Every visual task is checked with screenshots at 1440×900 and 390×844, in en/ar and dark/light, against the prototype. Cost if wrong: none.
3. After a red CI run that slipped through, the root typecheck became required and CI is checked after every push. Cost if wrong: none.

**Copy and language**
4. New labels needed for accessibility go into `packages/shared` in both languages, wrapped in `u()` so you confirm them. This includes the About drawing text, with the game names and "HEALTHCARE → CODE" marked unconfirmed. Cost if wrong: a few more strings to confirm.
5. Latin runs on `/ar` carry `lang="en"`: names, chips, labels, "Switch to English", and Latin inside Arabic sentences. The Arabic no-letter-spacing rule skips them. Cost if wrong: none.
6. The `h1` keeps real spaces, so the Phase 0 headline test passes unchanged. The full text of the rotating and typed words is exposed as visually hidden text, not as `aria-label` on generic elements. Cost if wrong: none.

**Engine (Tasks 1–2)**
7. Fixed the scene-progress maths for clamped tails. Cost if wrong: none.
8. Rebuilt the engine so that:
   - scenes that flow are active while on screen;
   - faded scenes are marked rather than `visibility:hidden`;
   - geometry is cached, with no layout reads in the frame loop;
   - unchanged values are not written.

   Cost if wrong: about 60 lines of engine work.
9. Pointer events are off on scene boxes and on only for live content. A pinned scene before a flowing one stays visible through its tail. Cost if wrong: one small round.
10. Collection files (icons, diagrams, fact scenes) may hold several small components, each file under 300 lines. Cost if wrong: a later split.

**Gold element, header, hero (Tasks 4–6)**
11. Added a stronger gold-position test that offsets the layers, so a scrollbar shift is caught. Cost if wrong: none.
12. "Current section" means the scene covering the middle of the screen. Cost if wrong: none.
13. Every content string is non-empty in the schema (`.min(1)`), and `viewport-fit: cover` is set so the phone safe area works. Cost if wrong: none.
14. English headline letters keep their layout at weight 560 and draw the visible glyph separately, so weight changes never shift layout. Cost if wrong: the look could be revisited.
15. A pre-paint `intro` class runs the hero's one-shot build from first paint, using only backward-filling animations, so content still ends visible without JS. The first title types in through a CSS clip. Cost if wrong: none.
16. The rotating word reserves the width of its longest word, so there is no layout shift. Cost if wrong: none.

**Work, process, about, contact (Tasks 7–10)**
17. The hero and the Work frame share one optimised screenshot URL, so it downloads only once. Cost if wrong: one extra 90 KB download.
18. All project articles share one grid cell, so the column height never jumps. Shorter projects sit about 18 px higher than in the prototype. Cost if wrong: re-centre later.
19. The axe tests settle animations before checking. The checks themselves are unchanged. Cost if wrong: none.
20. The marshal flag waves with a transform, not CSS `d`, so it works in Safari 16.4+. Cost if wrong: none.
21. The About ring keeps the prototype's height-based size. Cost if wrong: a small ring on very short desktop windows.
22. The footer sits after `<main>` as the page's footer landmark. It is fixed and shown on the gold screen, in flow when stacked, and respects the phone safe area. Cost if wrong: a small component move.
23. One test's setup changed to force the same pinned-before-flowing scenario with real About content. Every assertion was kept. Cost if wrong: none.

**Background (Task 11)**
24. The no-blank-screen test waits for the engine first. That fixes a missing precondition; the assertions are unchanged. Cost if wrong: none.
25. Spec 5.8 "never below AA" overrides the prototype's look. So:
   - the light theme's vignette no longer darkens;
   - the text side is calmer;
   - small text gets a soft page-colour ring.

   Cost if wrong: the light theme looks slightly flatter than the prototype.
26. Software-rendered WebGL (no GPU, blocklisted GPUs, CI) gets the still gradient. The shader's own tests turn it back on with a test-only switch. Cost if wrong: users without a GPU see the gradient.
27. The bundle budget was settled in Task 13. Cost if wrong: none.

**Loader (Task 12)**
28. The overlay is fully `aria-hidden`, with no "Loading" announcement. Cost if wrong: no announcement, though the content is readable underneath.
29. The hero build waits for the loader, as in the prototype. Cost if wrong: none.
30. "Seen" is stored as soon as the loader shows, so a safety-timer win never repeats it. Cost if wrong: none.

**SEO, CSP, budgets, tests (Task 13)**
31. All OG, JSON-LD and metadata text comes from shared content. The OG image is built with satori and resvg from local fonts. Cost if wrong: none.
32. The CSP is exactly the spec string. `'unsafe-eval'` is allowed only in development. zod runs jitless, so production needs no eval. Cost if wrong: none.
33. The Lighthouse CI step is parked on `hold/lhci-ci`, so CI stays green while LCP is your decision. No threshold was lowered. Cost if wrong: none; the commit is kept.
34. The pinned layout is applied before first paint, with a safety timer, which removed the hydration layout shift. Cost if wrong: a shift only when the bundle fails.
35. The engine writes nothing while the loader shows. The text halo is limited to text over the background. Cost if wrong: none.
36. The rotating-word flip uses a clip, not a fade, so its text is never half-transparent. Cost if wrong: the flip reads slightly differently from the prototype.
37. The AA guard is strict: the darkest pixel around each glyph. It measures through translucent cards and SVG text. The gold lift shadow was limited to the Work frame, which removed a grey box under the About ring. Cost if wrong: none.
38. Visual snapshots are taken on the still gradient, which keeps them small (13 MB). The shader look stays covered by the AA guard. Cost if wrong: shader regressions are caught only by the guard and manual checks.
39. The nomodule polyfill is excluded from the budget, because module-capable browsers never load it. Cost if wrong: none for target browsers.
40. Arabic font preload was not shipped (see decision 2). Cost if wrong: none for now.

**Final review**
41. One fix wave handled:
   - short real screens: compact layouts, the gold element hidden only where a scene flows, and new tests at five real sizes;
   - hidden projects and steps kept reachable;
   - honest loader-failure tests;
   - eleven smaller items.

   Cost if wrong: rework you can see in this review.
42. No Git LFS for snapshots. Cost if wrong: about 13 MB more history per regeneration.
43. The small residual items in section 3 are parked, not fixed now. Cost if wrong: small fixes later.
