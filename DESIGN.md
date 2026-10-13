# ZakyDev design system

Short reference for anyone building UI in this repository. The full behaviour of the home
page is in `docs/superpowers/specs/2026-10-13-zakydev-home-design.md`; the visual reference
is `docs/prototype/home-v23/`.

## Idea

The words are the hero. One gold element stays on screen from the first second to the last
and changes job: underline, project frame, progress line, ring, full gold screen. Everything
else is quiet so that one piece can move.

## Mark

A Z made of two code brackets. Ink upper half, gold lower half, split on the diagonal.

- 64 × 64 grid, stroke 7, round caps and joins, halves point-symmetric about the centre.
- Upper `M12 15H50L36.2 28`, lower `M27.8 36L14 49H52`.
- Under 32 px use the small cut: stroke 9, `M12 15H50L38 26.5` and `M26 37.5L14 49H52`.
- Lower half: `#D4AF37` on dark, `#8A6D1F` on light, `#FAF9F6` on gold.
- Files in `docs/prototype/home-v23/brand/`. Clear space: one stroke width.

## Colour

| Token | Dark | Light |
|---|---|---|
| `--bg` | `#0F0E0C` | `#FAF9F6` |
| `--panel` | `#181613` | `#F1EEE6` |
| `--ink` | `#F3EFE6` | `#1A1814` |
| `--muted` | `#A8A192` | `#6A6457` |
| `--hair` | ink 14% | ink 14% |
| `--gold` (fills, lines) | `#D4AF37` | `#D4AF37` |
| `--accent` (gold text, icons) | `#D4AF37` | `#8A6D1F` |
| `--on-gold` | `#14120E` | `#14120E` |

Gold text on light uses `--accent`. The only other colour allowed is the Bahrain flag
(`#CE1126` and white). Every text pair meets WCAG AA.

## Type

- Display: Fraunces (variable) / Amiri for Arabic.
- Body and UI: Geist / IBM Plex Sans Arabic.
- Labels and tool names: Geist Mono, uppercase, letter-spacing 0.12–0.16em. In Arabic use
  the body face with no letter-spacing.
- Never letter-space Arabic. Never animate Arabic by letter.

## Shape and surface

- Prefer no box. Use a hairline, spacing or weight before reaching for a border or a pill.
- Radius: 14 px for frames and cards, 99 px for buttons and chips, 2 px for lines.
- One primary button style (gold fill, dark text). Secondary is an ink outline.
- Icons: 1.6 px stroke, round caps, 20 × 20 grid. Tool logos are single-colour masks.

## Motion

- Personality: precise and calm. One easing for most things: `cubic-bezier(.2,.8,.2,1)`.
- Durations: 180 ms (feedback), 450 ms (state change), 900 ms (reveal).
- Scroll drives position and progress; time drives small loops inside a scene.
- Staggers finish within 500 ms. Never move more than a third of the screen at once.
- Every animated thing has a finished still state, shown when motion is reduced.
- Never hijack scrolling.

## Layout

- Breakpoint 860 px. Below it: one centred column, menu in a bottom bar.
- Use logical properties (`start`/`end`), never left/right, except inside drawings, which
  are never mirrored.
- Units: `svh` for full-height scenes. Touch targets at least 44 px.

## Writing

First person, short, plain. Say what it does for the user, then how. No invented numbers.
