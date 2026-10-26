# Context: Clients ("Companies we've worked with")

Memory for this section. **Newest entry on top.** Append after every task — never rewrite
past entries. Record decisions, measurements, and reasons; skip narration.

Reading this file plus `FEATURE.md` should be enough to resume work on this section cold,
with no code scanning.

---

## Current state

Built: direction 5, "Columns", is live on `/` and `/he` as `src/components/sections/Clients.tsx`
(server component, CSS-only lanes via `.clients-lane` in `globals.css`), between the hero and
the landing video, with `#clients` as its anchor. Logos: masters in `assets/logos/`, site files
in `public/clients/` (2× desktop size). Not yet looked at in a browser; no build run.

**Status:** `review`
**Next action:** the user looks at it on the dev server. Still open: the arch-mark client's
name (its `alt` is empty), better files for Lotus Clean / Vantor / Lioneyes, a native read of the
Hebrew copy, and a keyboard pause for the motion (WCAG 2.2.2, shared with the tool strip).

---

## Log

### 2026-10-26 — built (direction 5, "Columns")

**Done**
- User picked board 5 ("do the 5th one now"). Built `Clients.tsx` and mounted it in
  `HomeRoute.tsx` after `<Hero />`; `home.clients` added to `en/home.ts` and `he/home.ts`;
  `@keyframes clients-lane` + `.clients-lane` added to `globals.css` beside `.clix-marquee`.
- `public/clients/*.png` written by the new `assets/vendor_logos.py` (2× desktop size, 317 KB).
- Nav "Customers" and footer "Work" repointed `/#testimonials` → `/#clients`; comments that
  named the old anchor updated in Nav, Footer, ViewTransitions, LandingVideo and HomeRoute.

**Decisions** (what was chosen, what was rejected, why)
- **CSS keyframes, not GSAP.** `logo-carousel` needs GSAP because its cycle depends on text
  widths it has to measure; here the period is fixed by tile height + gap, so the band is a
  server component with no JS.
- **Three copies per lane, `calc(-100% / 3 - 4px)` per loop.** Two copies would need one copy
  taller than window + gap (612px); the 4-tile lane is 592px at desktop.
- **`self-start` on each lane track** — a stretched grid item would size the track to the
  window and the keyframe's percentage would resolve against the wrong height.
- **`ink/60`, not `muted`, for the grey copy:** `muted` on `canvas` measured 4.43:1 (fails AA),
  `ink/60` 4.69:1 — `contrast-check.js`. Testimonials made the same call on `card`.
- **Phone gets its own two lanes of seven** rather than the board's "hide lane 3" — all 14
  marks show. The inactive set is `display:none`, so a screen reader meets one copy.
- **Padding is the board's (112/40, phone 96/16), not the testimonials' 196px top.** The board
  is the spec; that 196 was rogo's for a centred heading.
- **`#clients`, not reusing `id="testimonials"`** — the old id would name a block that is gone.
- **The unnamed client renders with empty `alt`** rather than a guessed name; 13 of 14 named.

**Measurements worth keeping**
- Loop speeds: desktop 18.5 / 15.4 / 16.4 px/s, tablet 16.5 / 13.8 / 14.7, phone 16.1 / 14.5 —
  all under the tool strip's 30.
- Dev server, not a build: `/` and `/he` both 200, `id="clients"` once, 84 `<img>` in the HTML
  (14 × 3 copies × 2 lane sets), heading in each locale.

**Skills invoked**
- None newly. `gsap` (marquee trigger) is not installed — see the stale note in `docs/SKILLS.md`
  — and was not needed: no timeline, no measuring. `verification-before-completion` is
  satisfied by stating what was and was not checked; per the standing rule no build, typecheck
  or browser pass was run, so status is `review`, not `done`.

**Open / deferred**
- Arch client's name; better Lotus Clean / Vantor / Lioneyes files; Hebrew copy review;
  WCAG 2.2.2 pause control (shared with the tool strip). All in `FEATURE.md` → Open questions.

### 2026-10-26

**Done**
- Processed the 14 logos the user dropped in `client-logos/` (repo root, untracked) into
  transparent, trimmed, ≤640px PNGs + `manifest.json` → `assets/logos/`. Script vendored as
  `assets/prep_logos.py`.
- Built five directions as live boards on a Design canvas (private to the user), each a
  responsive section with the site's real Discovery file, the home tokens, `--ease-rogo`,
  phone/tablet breakpoints and a reduced-motion fallback.

**Decisions** (what was chosen, what was rejected, why)
- **No plain marquee among the five.** The hero's `logo-carousel` tool strip sits directly
  above this slot; a second horizontal strip would echo it.
- **All continuous motion ≤ 19 px/s.** Precedent: the tool strip was cut 50 → 30 px/s on
  2026-08-19 because the strips made people "dizzy".
- **Mono at rest for Rotation / Orbit / Torchlight**, colour on interaction — the home page is
  monochrome and the user already chose grey logos for `/clix`'s grid. Spotlight shows one
  brand in colour at a time; Columns is full colour, with a tweak to compare it in mono.
- **The Homy design system in the user's account was not applied** — it is another brand's;
  the boards use this repo's own tokens.
- **Three marks use greyscale instead of the ink stamp** (`like-home`, `lotus-clean`,
  `nellyan`): a solid stamp erases detail that lives inside the mark.
- **Equal-area sizing** (`h = √(A/aspect)`, clamped), not equal width — wide wordmarks
  (Mediora 3.2, Stonecrest 3.5) otherwise dwarf the stacked emblems.

**Measurements worth keeping** (values that were hard to get, gotchas in the original)
- Six of the files are already transparent PNGs (the image viewer shows the transparency as
  white or black — `vantor` is a blue glow on *transparency*, not on black).
- Colour-to-alpha blows up when the ground channel sits at ~255: TheraNote's ground is
  `(255,255,224)` → `(248,255,214)` (a gradient), so any R ≥ 253 read as fully opaque and the
  whole square survived. Plain RGB distance (lo 0.06, hi 0.30) fixed it; same fix cleaned the
  speckle out of Lioneyes (ground `(1,1,1)`, lo 0.14, hi 0.62).
- Nellyan's frame circle is ~`#cdcdcd` on `#edeeed` (alpha ≈ 0.13 after colour-to-alpha); a
  0.25 floor removes it without eating the emblem's edge.
- Lotus Clean is 322×319 and compressed. Two passes taken (floor 0.08 → 0.18 + median
  despeckle) and then stopped per the decorative-asset ceiling; still rough as a stamp.

**Skills invoked**
- `superpowers:brainstorming` — run as a spike: the user had already chosen the format (five
  demos to react to), so no question round; nothing goes into `src/` until a pick.
- `frontend-design` / `gsap` / `framer-motion` not invoked: no production code was written.
  The demos are CSS keyframes + a small class component per board. GSAP vs Motion for the real
  build is decided once the direction is.

**Open / deferred**
- The pick; the arch client's name; better files for Lotus Clean / Vantor / Lioneyes; the
  `#testimonials` anchor; Hebrew strings. All listed in `FEATURE.md` → Open questions.
- Nothing rendered or screenshotted by me — the boards were published unviewed, for the user to
  judge.
