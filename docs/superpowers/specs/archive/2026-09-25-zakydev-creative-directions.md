# ZAKYDEV — Creative Directions: First Deliverable

Date: 2026-09-25 · Status: for owner decision · Inputs: repo audit, brand facts (verified copy draft), four research passes (stack, award sites, Higgsfield, cross-industry), two Codex gpt-6-astra passes (territories at xhigh effort, asset directions), owner answers (no likeness, subtle Bahrain identity, open look, keep mark and palette family, fonts may change if essential).

## 1. Repository audit (summary)
Vite + React 19 SPA, Tailwind 4 with an orphaned config, Redux for one boolean, framer-motion 12, two Vercel functions to MongoDB Atlas. All content lives in `src/data/portfolio.ts`; git history has fuller job descriptions. No tests, no i18n, no SSR, no sitemap, placeholder project images. A real Atlas credential is committed in `DEPLOYMENT.md`; `GET /api/contacts` is unauthenticated. Verdict: rebuild inside the repo as a pnpm/Turborepo monorepo (Next.js 16 web + NestJS 12 API), migrate content only. Full detail: `2026-09-25-zakydev-portfolio-design.md` §A.

## 2. Current frontend and design assessment
Competent template energy, not a brand: teal-on-slate gradient hero, particles, 800 ms fake splash, skill bars in data but unused, generic project cards. Nothing to preserve visually. What is worth keeping: the honesty of the content and the four real projects.

## 3. Brand interpretation
ZAKYDEV is the relief of meeting someone who understands a complicated working day and can make it manageable. Not a futurist, not a studio, not a dashboard: a careful engineer who builds and modernizes the systems people actually use at work, in two languages, in Bahrain. Gold is not luxury here; it is punctuation: the small light that says the system is on. The mark (twisted Z with a gold point) already encodes this: structure under tension, one point of attention.

## 4. Target visitors and what each needs in five seconds
| Visitor | Question | The site must show |
|---|---|---|
| Business owner / founder | Can he build what I need, and will it be pleasant to work with him? | A plain promise, three recognizable domains, one real screen, one clear action |
| Recruiter / tech lead | What scope has he owned? | Role, stack, decisions, status honesty |
| Senior engineer | Is there substance? | One evidenced decision per project, real constraints, code where publishable |
| Collaborator / audience | Who is this person? | Voice, Bahrain and marshal detail, notes |

Information architecture must serve all four without personas: Work (complete index), Approach (three principles with evidence), About, Notes (when there is one real article), Contact; case pages open on the business question, then interface, then decisions, then limits.

## 5. Research findings and inspiration principles
- One committed idea, budgeted properly, beats many effects (Awwwards jurors 2026; Kononenko: animation 8.2 with performance 7.8 is the target ratio).
- Numbered archive index signals longevity (Herzog & de Meuron). Three hard numbers up front, repeated at the end (Polestar). One serif at display size only is the cheapest premium (Kinfolk). Second-language headings as texture (Teenage Engineering). Name your three transitions (Miu Miu).
- Case-study anatomy shared by Pentagram, Instrument, Stripe, Figma: one-line problem, three numbers, named process sections, a before/after diagram pair, credits, next project.
- No blocking preloader; LCP is what Google measures. Fonts: serif + Amiri, grotesk + Noto Kufi Arabic, and Plex Sans Arabic are the verified bilingual pairings.
- Higgsfield: API at open.higgsfield.ai, pay-as-you-go, $5 minimum, promo pricing temporary; whole asset list for this site is under ~$10 on the API if 3D is avoided; generate at 720p until right, then one 1080p run; no alpha output; loops via A→B + B→A with swapped start/end frames.

## 6. Three genuinely different territories
See the concept boards (companion screen) for type, materials, hero, card, motion and phone per territory.

### T1 · The Working Edition (editorial monograph)
Core: an authored publication about making everyday work easier; each project is a feature connecting a need, a real screen and one engineering decision, with marginal notes for engineers. Identity: paper and ink first, thin gold rules, plates. Type: Fraunces (display, opsz 144) or IBM Plex Serif + Geist + Geist Mono; Arabic Amiri display, Plex Sans Arabic body. Layout: 2/8/2 book grid with marginalia. Motion: a rule draws (450 ms), caption nudges 4 px, figures stroke-draw; text never moves. Hero: cover composition, headline in four unequal lines, plate of a real screen, table of contents as audience entry points; identical timing on phone. Projects: opening spread, then plates. Advantages: most credible, cheapest, ages well, Arabic looks superb. Risks: needs excellent writing; can feel quiet. Complexity 2/5. Assets: A code, B SVG, D screenshots, E 0 at launch (1 optional plate).

### T2 · Objects of Use (art-directed material realism)
Core: introduce software through the things its users handle: a stone sample, a tenancy contract, a patient card, side-lit on paper, next to the actual screen, then how it was built. Identity: photoreal generated still lifes, 70/30 image to text, charcoal ground in dark, paper tabletop in light. Type: Geist with heavier display contrast; Plex Sans Arabic 600. Motion: image drifts 2 %, detail crossfades, caption rises 6 px; controls never move. Hero: headline beside an oversized materials still with three tags. Projects: object/task pairing, then real screen, then annotated interface→API→data connections. Advantages: strongest sensory recall, instantly premium, unique among engineer sites, perfect promo material. Risks: imagery over proof, "interiors studio" reading, scene consistency, payload. Complexity 3/5. Assets: E 2 stills at launch (materials; blank contract paper), up to 5; D screenshots composited; no WebGL.

### T3 · Signal (motion-led typographic instrument)
Core: type, rhythm and one gold signal line that carries information through the site: draws the mark, threads the headline, becomes the scroll rail, runs through system diagrams as the request path, ends as the terminal cursor. Identity: void and paper, visible grid, mono readouts, big tight uppercase statements. Type: Geist 700 tight + Geist Mono; Arabic Noto Kufi Arabic 700. Motion: line draws per section, words arrive per word (never per letter), counters, request travels. Hero: giant statement with the line threading through, instrument readout row, three numbers. Projects: animated system flows on the line, metrics, inset readouts. Advantages: most distinctive, fastest, bilingual by nature, highest engineer credibility. Risks: cold for business owners; one step from a dashboard; needs disciplined human copy. Complexity 3/5. Assets: A/B only, D screenshots, E 0 (optional macro gold-thread loop as texture).

## 7. Comparison and recommendation
| Criterion (1–5) | Edition | Objects | Signal |
|---|---:|---:|---:|
| Memorability | 4 | 5 | 4 |
| Brand fit | 5 | 4 | 4 |
| Professionalism | 5 | 4 | 4 |
| Uniqueness | 4 | 5 | 5 |
| Feasibility | 5 | 3 | 4 |
| Maintainability | 4 | 3 | 4 |
| Performance | 5 | 3 | 5 |
| Accessibility | 5 | 4 | 4 |
| Showcases work | 5 | 4 | 4 |
| Cost | 5 | 2 | 5 |

Codex recommends The Working Edition. My recommendation: **Edition as the spine, Signal's line as the connective motif, and one Objects still for the Nuammer feature.** The Edition gives credibility and a home for the creator voice; the line gives the distinctiveness the owner has been asking for without effects for their own sake; the single still gives the promo and the hero a sensory anchor at near-zero cost. Five-year regrets: Edition without cadence promises (no issue numbers); Objects would need re-shooting as work changes; Signal alone could feel cold to the audience that pays.

## 8. Site storytelling and information architecture (recommended blend)
Home: promise + domains → three selected features → approach (three principles with evidence) → personal introduction → invitation. Work: complete numbered index (001…). Case: need / role / status → interface → two evidenced decisions ("Why this works") → limits → next. About: work, education, Azure, marshal volunteering. Notes: appears only with a real article. Contact: brief → confirmation. The line runs through all of it as the scroll rail and section marker. Terminal, ⌘K palette and dock remain secondary shortcuts, never the way in.

## 9. Visual language
Tokens as in DESIGN.md (P1 Warm Metallic). Additions for the blend: `--rule` decorative rule (#D8D2C5 light / #49443A dark); display serif token `--font-display` (Fraunces, fallback Georgia) used only at ≥ 32 px; Arabic display Amiri. Type scale desktop 104/56/32/18/14, mobile 44/32/24/18/14, Arabic 48/34/26/18/14 with 1.75 line-height and zero tracking. Spacing 4/8/16/24/40/64/96/144; 1280 px max; corners 0–4 px for plates, 10 px for controls. Gold under 1 % of a viewport; bright gold never as text on paper.

## 10. Motion language
Entrance: content is readable at first paint; one 450 ms rule or line draw per section. Hover: 140 ms underline and caption shift; magnetic only on the primary action. Section transitions: ordinary scroll; the line advances. Images: still, or 2 % drift where an Objects still is used. Type: whole words arrive with 40 ms stagger, never letters. Scroll: the line's `pathLength` is bound to scroll progress; no scroll-jacking. Page transitions: React ViewTransition 120–200 ms cross-fade, header and rail stationary. Feedback: inline, announced. Loading: reserved geometry, poster-first media, no preloader. Reduced motion: no drawing, no shifts, opacity only, still frames.

## 11. Project showcase system
Card: task word, project name, role, status, one real screen plate, "Read the feature". Detail: the business question as a pull quote → one demonstrable workflow (screen sequence) → two evidenced decisions with the request path animated on the line → constraints and what remains → next project. Engineering layer "Why this works": decision, constraint, trade-off, supporting crop or diagram, publishable code when useful. All captures sanitized; sample data marked; development status visible.

## 12. Mobile direction
390 px: identity line, 44 px headline, 16 px intro, one 48 px primary action, plate, then features. Line runs down the inline-start edge. Bottom command bar with three items (Work · Explore · Let's talk) appears after the hero action scrolls out; theme and terminal live inside Explore. Work cards snap horizontally at 84 % width with visible next-card edge and arrows. Arabic: logical properties, recomposed line breaks, mirrored directional icons; screenshots, mark, code and digits keep orientation.

## 13. Generative asset opportunities (decided 2026-09-25)
The hero's visual slot is **drawn, not generated**: the "Working Section" plate (SVG, live bilingual labels, gold line through it). The Strata object still was rejected by the owner. Generated assets are used only where they add atmosphere or texture, never near real products:
1. **Paper-light background loops** — two 8 s seamless loops, 16:9 and 9:16: (a) morning light drifting across ivory paper for light mode, (b) cool window light across charcoal linen for dark mode. Shown at 10–16 % opacity behind the hero and as the bed under the promo. Video model on the API (Kling 3.0 class), start frame = end frame, A→B + B→A stitched for the loop.
2. **Ink-line macro** — one 6 s clip of a fine nib drawing a single continuous line across paper, raking light, shallow depth of field. Approach section header and promo shot.
3. **About still** — afternoon window light on a limestone wall, one soft shadow of a mullion, no landmarks, no people. 3:2 and 1:1 crops. The subtle Bahrain cue.
4. **Engraved texture for the hero plate** — one generation with a vector-output model (Recraft V4 or equivalent), traced and re-inked to one stroke weight in code; optional, only if the clean plate feels too flat.
Rule: composite a stand-in into the frames first; owner approves; two 720p tests and one final per asset; total ceiling $20; nothing runs until the owner provides the API key and says go. Work, case studies and OG use real screenshots or derived crops.

## 14. Built in code instead
Layout, typography, mark, gold point, the line, rules, diagrams, request-path animations, all UI, the terminal, the palette, the dock, OG images (ImageResponse), the poster fallbacks (derived from stills).

## 15. Promo video initial concept (inherits the direction)
15 s / 30 s, hard cuts, one caption baseline, readable without audio, EN and AR editions, 1920×1080 then 1080×1920 recompose. Narrative: promise → material → software proof → engineering judgment → invitation. Shots: 1 headline on paper with the line drawing (code, 3/5 s); 2 material close crop "Material search" (generated still, 1.5/3 s); 3 Nuammer search (capture, 2/5 s); 4 PPMS overview (capture, 2/5 s); 5 hospital site navigation (capture, 2/4 s); 6 one evidenced decision annotated on the line (code + capture, 2/4 s); 7 mark, zakydev.com, "Tell me your idea" (code, 2.5/4 s). Without generation, shot 2 becomes a Nuammer crop.

## 16. Performance considerations
No R3F in the shipped bundle for this direction. Server components, small Motion islands, responsive images, locale-specific font loading (Arabic `preload:false`). Targets: initial transfer ≤ 700 KB, compressed JS ≤ 180 KB, LCP ≤ 2.0 s, CLS ≤ 0.05, INP ≤ 200 ms; measured in Phase 9, not promised.

## 17. Implementation complexity
2/5 overall (3/5 with the line's scroll sync and bilingual editorial composition). Main effort is writing and composition, not engineering.

## 18. Roadmap (replaces phases 2–3 hero scope in the spec; the rest of the spec stands)
1. Collect captures and decision evidence; board eight frames (EN/AR × desktop/390 × light/dark) in the companion; preview the placeholder for asset 1.
2. Ship Home, Work, three honest features, About, Contact; verify RTL, keyboard, contrast, performance.
3. Add "Why this works" layers and the first real article; terminal and palette as shortcuts.
4. Generate asset 1 within the cap on the owner's API; produce the promo; launch.
