# Feature: Clients ("Companies we've worked with")

| | |
|---|---|
| Slug | `clients` |
| Page(s) | `/` and `/he` |
| Order on page | after `hero`, before `landing-video` — the slot `testimonials` vacated on 2026-10-26 |
| Status | `review` — built 2026-10-26; not yet looked at in a browser |
| Reference | **None. This is not a clone**; rogo has no counterpart. The spec is board 5, "Columns", on the design canvas below, which the user picked ("do the 5th one now"). |
| Original Framer name | n/a |
| Component | [src/components/sections/Clients.tsx](../../src/components/sections/Clients.tsx) — a server component; motion in `globals.css` (`.clients-lane`) |
| Anchor | `#clients` — the nav's "Customers" and the footer's "Work" point here (repointed from `/#testimonials`) |
| Design canvas | <https://claude.ai/artifact/1hXz2hWQiAzyskLRneWAfZ> (private to the user) |

## Purpose

Shows the logos of the companies clix has worked with, in place of the removed testimonials
block. A heading and one line of copy on one side; on the other, columns of logo tiles drifting
slowly in opposite directions. (The board's "Clients" kicker and "14 companies" figure were
removed on 2026-10-26 at the user's request.)

---

## Constraints that shaped it

- **The hero already ends in a horizontal marquee** (`logo-carousel`, the tool stack), directly
  above this band, so a second left-scrolling strip was ruled out; the lanes move vertically.
- **Motion speed ceiling is ~30 px/s.** `logo-carousel` was slowed from 50 to 30 on 2026-08-19
  because the moving strips "make us dizzy". These lanes run 15–19 px/s at desktop.
- **The home page is monochrome** (DESIGN-SYSTEM.md, Color). The marks are third-party artwork,
  in the same category as the vendor logos, so they show in their own colours; nothing in the
  band's own chrome is coloured.

## Spec

### Layout
| Property | ≥1200 | 810–1199.98 | ≤809.98 |
|---|---|---|---|
| Section padding | 112 / 40 | 112 / 40 | 96 / 16 |
| Container | max-w 1280 | max-w 1280 | full width |
| Arrangement | copy column + lanes, side by side, copy centred on the window | same | copy above lanes |
| Copy column | 380px | 300px | full width |
| Copy ↔ lanes gap | 64 | 40 | 48 (stacked) |
| Lane window | 600px tall, 3 lanes | 600px tall, 3 lanes | 440px tall, 2 lanes |
| Lane / tile gap | 12 | 12 | 12 |
| Tile height | 136 | 120 | 112 |
| Logo scale (`--logo-s`) | 1 | 0.86 | 0.8 |

Window edges fade over the top and bottom 16% (`mask-image`, vertical, so nothing to flip in RTL).

### Typography
| Element | Family | Size | Weight | Line-height | Letter-spacing | Color |
|---|---|---|---|---|---|---|
| h2 | Discovery (`font-display`) | 48 / 44 / 36 | 400 | 105% | -0.05em | `ink` |
| Body (24px below the h2) | Discovery | 16 | 400 | 1.5em | -0.02em | `ink/60`, max-w 340 |

### Color & surface
| Element | Property | Value |
|---|---|---|
| Section | background | `canvas` `#f7f7f7` |
| Tile | background / radius | `paper` / 6px |
| Tile, hover | lift / shadow | −2px / `shadow-float` (as `/contact`'s submit button) |
| Count row | border-top | 1px `hairline-dark` |

### Interactive states
| Element | Hover | Focus-visible | Transition |
|---|---|---|---|
| Lane | pauses (`animation-play-state`) | n/a — nothing focusable | — |
| Tile | lifts 2px + `shadow-float` | n/a | 300ms `--ease-rogo` on `translate`, `box-shadow` |

### Motion
| Lane set | Lane | Tiles | Direction | Loop | Speed |
|---|---|---|---|---|---|
| ≥810 | 1 | Mediora, Talentra, TheraNote, Like Home, Vantor | up | 40s | 18.5 px/s (16.5 tablet) |
| ≥810 | 2 | Aurelle, Stonecrest, Mindora, TalentBridge, Nellyan | down | 48s | 15.4 px/s (13.8 tablet) |
| ≥810 | 3 | Lioneyes, Lotus Clean, Diamond Group, [unnamed] | up | 36s | 16.4 px/s (14.7 tablet) |
| phone | 1 | Mediora, Lioneyes, Talentra, TheraNote, Diamond Group, Like Home, Vantor | up | 54s | 16.1 px/s |
| phone | 2 | Aurelle, Stonecrest, Mindora, TalentBridge, Nellyan, Lotus Clean, [unnamed] | down | 60s | 14.5 px/s |

Linear, infinite. Each track holds three copies and moves `calc(-100% / 3 - 4px)` per loop
(the `- 4px` is a third of the 12px gap — derivation in `globals.css`). Library: **CSS**, not
GSAP — nothing needs measuring at runtime, so the band ships no JS at all.
Reduced motion: the global clamp at the end of `globals.css` brings the lanes to rest.

### Responsive behavior
- **≥1200:** as the table.
- **810–1199.98:** same arrangement, narrower copy column, smaller tiles and marks.
- **≤809.98:** stacked; a separate two-lane set (seven each) so all fourteen marks still show.
  The other set is `display:none`, which also takes it out of the accessibility tree.

---

## Assets — the 14 logos

Source: `client-logos/` (repo root, untracked, as the user supplied them). Two scripts in
`assets/`:

1. `prep_logos.py` → `assets/logos/<slug>.png` + `manifest.json`: transparent, trimmed to the
   mark plus a 2% margin, longest side ≤ 640px. The masters.
2. `vendor_logos.py` → `public/clients/<slug>.png` at **2× the desktop display size** (317 KB
   for all 14), and prints the `w`/`h` rows `CLIENTS` carries. Re-run both when a logo is added.

| Slug | Shown as | Source file | Prep mode | Desktop size |
|---|---|---|---|---|
| `mediora` | Mediora | `29d17517-….png` | already transparent | 162×50 |
| `aurelle` | Aurelle Diamonds | `88cf1a10-….png` | already transparent | 99×74 |
| `talentra` | Talentra | `898427d6-….png` | already transparent | 88×74 |
| `stonecrest` | Stonecrest | `47c47be9-….png` | already transparent | 168×48 |
| `theranote` | TheraNote | `theranote.png` | single colour: RGB distance from its graded pale-yellow ground, brand green kept | 82×74 |
| `lioneyes` | Lioneyes | `lioneyes.png` | single colour: white-on-black source repainted `ink` | 121×68 |
| `mindora` | Mindora | `f0898275-….png` | already transparent | 82×74 |
| `like-home` | Like Home | `like-home.png` | colour-to-alpha vs white | 78×74 |
| `diamond-group` | Diamond Group | `diamond.png` | colour-to-alpha vs white, 3px inset drops a screenshot border | 128×64 |
| `talentbridge` | TalentBridge | `1e955cef-….png` | already transparent | 102×74 |
| `vantor` | Vantor | `e35292e5-….png` | glow render on transparency: alpha ×1.9 (γ 0.85), painted one deep blue sampled from it | 119×69 |
| `lotus-clean` | Lotus Clean | `lotusclean.png` | colour-to-alpha vs white, floor 0.18, 3×3 median despeckle | 128×64 |
| `nellyan` | Nellyan | `nellyan.jpg` | colour-to-alpha vs `#edeeed`, floor 0.25 removes the grey frame circle | 73×74 |
| `arch` | **unnamed** — empty `alt` | `26b0e30c-….png` | colour-to-alpha vs white | 97×74 |

**Sizing is by equal visual area, not equal width:** `h = √(8200 / aspect)`, clamped to 168×74,
so a ~3.3:1 wordmark and a stacked emblem read as the same size.

Rendered as plain `<img>` (the repo's convention for static assets), `loading="lazy"` — the band
starts below a full-height hero. Only the first copy of each lane carries `alt`; copies 2 and 3
are `aria-hidden`.

---

## Tokens used

From `docs/DESIGN-SYSTEM.md`: `canvas`, `paper`, `ink`, `hairline-dark`, `shadow-float`,
`--ease-rogo` (300ms hover), `--container-max`, Discovery via `font-sans` / `font-display`. No
new tokens.

## Documented deviations

| Property | Board / token would give | Shipped | Why |
|---|---|---|---|
| Eyebrow, body, count label colour | `muted` `#737373` (the board) | `ink/60` → `#6f6f6f` | `muted` on `canvas` is **4.43:1 and fails AA** at 14/16px; `ink/60` is **4.69:1** (`contrast-check.js`) and reads as the same grey |
| Phone lanes | the board hid lane 3 — 10 of 14 marks | two lanes of seven — all 14 | dropping four clients on phone was a demo shortcut, not a design |

---

## Acceptance checklist

- [ ] Matches the approved board at 1600 / 1440 / 1024 / 390 — **not viewed by me**; the user checks
- [x] Spacing/type/color from tokens, or deviation documented above
- [x] All interactive states implemented (tile hover lift, lane hover pause; nothing is focusable)
- [x] Motion as on the board — 40 / 48 / 36s, up / down / up, linear
- [x] `prefers-reduced-motion` respected (global clamp — by construction, not observed)
- [x] Keyboard: nothing actionable inside; the band is reachable via the nav's `#clients`
- [x] Images have meaningful `alt` (13 of 14 — see Open questions); contrast ≥ AA
- [ ] No horizontal overflow at any width — not checked in a browser
- [ ] `npm run build` clean — **not run** (standing rule); the dev server compiled `/` and `/he`
      and both serve 200 with the band in the HTML
- [x] `CONTEXT.md` (feature + global) updated, `SECTIONS.md` status set

## Open questions

- [ ] **Name of the arch-mark client** (`26b0e30c-….png`, navy pillars under a coral arch, no
      wordmark). Until then its `alt` is empty — one line in `CLIENTS` to fix.
- [ ] **Better source files would help three marks:** `lotus-clean` (322px and heavily
      compressed), `vantor` (a glow render; a flat/vector file would be cleaner), `lioneyes`
      (263px wide once trimmed).
- [ ] **WCAG 2.2.2 (Pause, Stop, Hide):** the lanes move for more than 5s with no keyboard
      way to stop them — hover pauses, reduced motion stops. Same position as the hero's tool
      strip; a pause control would close it for both.
- [ ] **Hebrew copy is AUTHORED** (heading, body, count label) and wants a native read;
      company names stay Latin on `/he`, as the tool names do.
