# Context: Testimonials

Memory for this section. **Newest entry on top.** Append after every task — never rewrite
past entries. Record decisions, measurements, and reasons; skip narration.

Reading this file plus `FEATURE.md` should be enough to resume work on this section cold,
with no code scanning.

---

## Current state

### 2026-10-26 (later) — slot filled, links resolved

The "companies we've worked with" band was built the same day as `clients`
(`sections/Clients.tsx`, → [features/clients/](../clients/)), in this section's old slot. The
two dangling links below are **resolved**: nav `customers` and footer `work` now point at
`/#clients` — a new id rather than reusing `testimonials`, which would name a block that is gone.
Everything else in the entry below still holds: this component, `home.testimonials` and
`public/testimonials/` are unmounted, not deleted, and the quotes still ride in `/`'s RSC payload.

### 2026-10-26 — removed from the home page (unmounted, not deleted)

**The ask.** User, against a screenshot of the block (heading, arrows, Nevo Yahaloman's card):
*"remove this whole section in landing page, we will change it to company we worked with, but
for now remove it"*. The replacement is a "companies we've worked with" section; the list and
how it is presented are still to come from the user.

**What changed.** `<Testimonials />` and its import came out of `src/app/_routes/HomeRoute.tsx`,
with a ⚠️ comment holding the slot. Nothing else in `src/` was touched. Page order is now
Hero → LandingVideo → WhyRogo → ByTheNumbers → ClixFelixFooter → Footer.

**Unmounted, not deleted, on purpose.** `sections/Testimonials.tsx`, `sections/QuoteCarousel.tsx`,
`home.testimonials` in both locales (the clients' Hebrew verbatim, the English translations) and
the six clips + posters in `public/testimonials/` all stay. The ask was "for now", the new
section's shape is unknown, and this is the user's real client material, so deleting it is a
separate call. This is NOT the Security precedent (2026-08-18), where the component and its dict
keys were deleted the same day.

⚠️ **The quotes still ship in `/`'s page source.** `PageDictProvider` serialises the whole `home`
namespace into the RSC payload, so unmounting stops the render, not the data. Measured on the dev
server: 0 hits for `id="testimonials"` in the served HTML, 1 hit for Nevo's quote text. Harmless
(real client words the page rendered until this change), but the section is only fully gone once
`home.testimonials` is deleted, which means deleting both components with it.

⚠️ **Two links now dangle.** Nav `customers` (`Nav.tsx:145`) and footer `work` (`Footer.tsx:129`)
both point at `/#testimonials`. The route resolves, the anchor does not; `ViewTransitions` treats a
missing target as a no-op, so a cross-route click lands at the top of `/` and a same-page click
does nothing. Left alone because the companies section is the natural target for "Customers":
when it is built, either give it `id="testimonials"` or rename to `#customers` and repoint both.
If the gap lasts, Nav.tsx's own rule (an item with nothing to go to is `href: null`, inert) is the
fallback.

**Neighbours.** The nav theme stays contiguous: `LandingVideo` is `data-nav-theme="light"` on the
same `bg-canvas`, so the bar has no gap to fall back over. LandingVideo's padding (`py-10` /
`tablet:py-20`) was sized as the small half of a gap shared with this section's `pb-32` /
`desktop:pb-20`, so the hero → video gap is now 40 / 80px on its own. Not re-tuned, since the
companies section is expected to sit back in between.

**Verified:** dev server on :3001 serves `/` at 200 with the section absent and the video present.
No build, typecheck or lint (user's standing preference), and the page has not been looked at in a
browser; that is with the user.

### 2026-08-14 — the phone tier became the slideshow, and the player became a byline tile

**The ask.** "How can we make this part show the video when in mobile view — I can think of it
as a flip, but I prefer that it also shows the quote AND the video." A flip was explicitly
rejected by the user: it hides one side. So the two have to co-exist.

**The finding that shaped everything.** The phone tier did not need a new carousel. The
slideshow in `QuoteCarousel` was already a full swiper — 1:1 pointer tracking, velocity-projected
commit, the triple loop with an invisible clone snap, the RTL sign handling — and it was gated
off below 810px by a single `hidden … tablet:block`. Rendering it at every width bought swipe,
the loop, and "one clip at a time" for free (only the slide at `pos` mounts a `<video>`), and let
the parallel six-card static stack and `PHONE_STYLE` be deleted outright.

**Decisions taken with the user before building** (all four were offered as alternatives):
- byline tile that grows, not a flip and not a media band above the quote
- the phone tier becomes swipeable with dots, rather than keeping six stacked cards
- one clip at a time
- the tile rule applies **below 1200**, not below 810 — so the 810–1199 tier gains video for the
  first time, and there is one rule instead of a hole in the middle
- the card **grows** when a clip expands and the page reflows, rather than reserving the taller
  box up front. Reserving it would put ~190px of dead whitespace in every card at rest, which is
  the exact defect the `h-[505px]` lead card was normalised to fix on 2026-08-13.

**Measured geometry.** The phone card keeps the deleted stack's measured values (`p-6`, `gap-5`,
20px quote), so the measure at 390px is still 310px and the line counts recorded below still
hold. Card height at rest: 24 + 234 (9 lines × 26px, the longest English quote) + 20 + 96 (tile)
+ 24 = 398 → **400px**; playing swaps the 96px tile for 224px → **528px**. All six slides now
share ONE height, fitted to the longest quote, where before each card had its own fixed box.

**Tablet does not grow the card, and that is measured slack rather than luck.**
694 − 48 − 48 − 80 = 518px for quote + tile; a 288px tile leaves 230px, and the longest English
quote at 28px in an 848px measure runs ~5 lines ≈ 182px. ~48px spare. ⚠️ If quote copy grows,
re-check that cell FIRST: the quote block has `min-height:auto`, so it refuses to shrink and
pushes the author block out through `overflow-hidden` — the role line clips, then the name, and
the quote itself never clips, so the regression is invisible unless you look for it.

**The tile is 3:4 at both sizes and both tiers** (72×96 → 168×224 on phone, 96×128 → 216×288 on
tablet). One aspect ratio throughout so the growth is a pure scale; an aspect change mid-animation
reads as a glitch. Sources are 9:16, so `object-cover` crops the sides — faces are centred.

**The quote text does not move while the tile grows, and that is structural.** The quote block is
`flex-1` with its content top-aligned, so the height the card gains is absorbed there; the tile
and the byline extend downward and only the card's bottom edge travels.

**Height is driven by an inline CSS custom property, not an inline `height`.** An inline `height`
cannot be media-queried, so `tablet:h-[694px]` could never beat it. A custom property CAN be
shadowed by a class — so `≥810` keeps its measured 694px box at rest and while playing, and the
var is simply inert there. This is the one non-obvious mechanic in the change.

**TWO `<video>` elements now, and the invariant that mattered survives.** The old "exactly ONE
video" rule existed because there was exactly one media box; the tile and the column are different
DOM positions, so one element cannot serve both. The rejected alternative was `matchMedia` tier
state deciding which to mount — that adds hydration surface (no `window` on the server) for no
gain. Instead each box's own button plays the element beside it, so nothing has to know the tier,
and the hidden box's button is `display:none` and unclickable. The real constraint is untouched:
mounting is still gated on `active`, so 18 `<li>` still carry at most two elements, both
`preload="none"`, which fetch no media at all until a deliberate tap.

**The resize guard was generalised, not deleted.** It used to mean "pause if we dropped below
1200", because only the column could be hidden. Now either tier's box can be `display:none`d out
from under a running clip, so it stops on ANY change of the query, both directions. A hand-off
between the two elements was considered and rejected: it would have to call `play()` outside a
user gesture, which Safari rejects silently.

**What this deliberately gives up.** A phone reader no longer sees all six quotes by scrolling —
five are behind a swipe. The dots exist to say the other five are there. Scroll cost drops from
~2100px to ~400px. `aria-label` on each dot reuses the existing `chrome.a11y.slideOfTotal`
template, which was already in both locales and previously unused; **no new dictionary key was
needed.**

**Still open, both needing the client rather than code:**
- ⚠️ `noam-tovi.jpg` carries a burned-in caption reading a different name (נווה דוידי / Nave
  Davidi). This change makes it MORE prominent, not less — illegible at 72×96, possibly readable
  at 168×224.
- ⚠️ `achituv.mp4` is 9.4MB and is now reachable on cellular. `preload="none"` means nothing
  downloads until a deliberate tap, so it is a cost to know rather than a bug — but it is the
  first file to re-encode if it bites.

**Verified:** `npx tsc --noEmit` clean, `npm run build` clean (20 routes). Visual verification at
390 / 810 / 1024 / 1200 / 1440 and on `/he` is with the user.

---


### 2026-08-13 — carousel order: Nevo Yahaloman is now first

User asked for Nevo to lead the section. The slide order lives in **four** arrays that must agree, and
all four were reordered identically:

- `SLIDE_STYLE` in `sections/QuoteCarousel.tsx` (photo/video stem, `cream`, per-slide desktop size)
- `CLIP_IDS` in `sections/Testimonials.tsx` — also the accordion fallback's initial open card
- `slides` in `lib/i18n/en/home.ts` and `lib/i18n/he/home.ts`

Order is now: `nevo-yahaloman` / `asaf-peretz` / `adir-peretz` / `noam-tovi` / `achituv` /
`elyashiv-engineering`.

**Decision — `cream` is a property of the POSITION, not of the person.** It was left as
true/false/true/false/true/false so the stripe reads the same as before; only the ids under it moved.
`quoteDesktop` is the opposite: it is fitted to that client's character count, so it travelled with the
person (Nevo 36px, Asaf 36px, Adir keeps 32px, Achituv keeps 32px).

Two comments that encoded the old order were corrected: the character-count list in `en/home.ts`
(now 174 / 207 / 289 / 189 / 267 / 140) and the "third slot is Nevo Yahaloman" note in QuoteCarousel.tsx
(now Adir Peretz). `PHONE_STYLE` needed no change — all six entries are identical since the tall
lead card was normalised earlier the same day.

Not verified: no build, lint or browser check — the user scoped this to the reorder alone.

### ⚠️ 2026-08-13 — this slot now holds TWO treatments, and the accordion is the fallback

The section, its `id`, its `data-nav-theme` and its "In our clients' own words" `<h2>` are
permanent. Only the **body** swaps. `QuoteCarousel` — the written-quote slideshow moved here
from /product — takes over the moment six real client quotes exist; until then the accordion
below renders. The user is supplying the quotes.

**The switch is DERIVED from the copy, not hand-set** (`hasQuotes` in `Testimonials.tsx`), and
that is the second design. A `const SHOW_QUOTES = false` was written first and did not work:
`PageDictProvider` serialises the **whole `home` namespace** into the RSC payload, so with the
accordion rendering and the flag off, `curl / | grep "PLACEHOLDER QUOTE"` still returned **seven
hits** — six slides plus `phoneLeadQuote` — in the public source of the indexed landing page,
under real clients' real names and photographs. Not rendering a string does not keep it off the
page, and a `noindex` would only have hidden it from crawlers, not readers.

So the fabricated strings were deleted (`""` in both locales) and the switch reads them. No
quotes → accordion, by construction. **Pasting the real quotes in IS turning the carousel on.**

✅ **They landed the same day** (`quote.md`, repo root), so the carousel is what renders now.
The clients spoke Hebrew: `he/home.ts` is verbatim, `en/home.ts` is a translation written here
and is the one thing on this section the user still needs to read. `phoneLeadQuote` was deleted
(no client said a second, phone-only sentence) and `quoteDesktop` was re-fitted to the real
character counts — the 32px size moved off slot 1, which is now the shortest quote, onto adir
and achituv. Phone card 1's 505px box was normalised to 334 for the same reason.

The guard STAYS. It is not scaffolding to remove now that it has passed — blanking any of the
six silently reverts to the accordion, which is what makes a future half-finished copy pass safe.

⚠️ **The `.jpg` files are shared by both treatments** — poster frames for the accordion's videos,
portraits for the carousel. The six `.mp4`s become unused once the carousel is live; they were
left on disk deliberately.

⚠️ **The carousel's arrows depend on this section's `gap-20`.** They are pinned `-top-20` and
render *outside* their own box, landing in the 80px gap under the `<h2>`. Change that gap and
they collide with the heading.

### The accordion itself

Built and building clean. Three-card accordion, one open at a time: a 600px row at ≥1200px,
a stack below. Computed values verified in-browser at 1600 / 1440 / 1024 / 390 against the
capture — padding, type sizes, card widths, radius and fills all match. No horizontal
overflow at any tier.

**Status:** `review`
**Next action:** time the open/close animation on the live site, and get the user's call on
the two inherited contrast failures (role text 2.50:1, logo marks 1.92:1).

> **Superseded 2026-08-05.** This section is no longer a clone of rogo's accordion — it is
> five of clix's own client videos. The Rogo quotes, names, roles and logo marks are gone,
> which closes the warning that stood here. Everything below the 2026-08-05 log entry
> describes the accordion that used to be here and is kept as history.

---

## Log

### 2026-08-08 — the sixth clip is attributed: Elyashiv Engineering

**Trigger:** user — *"אלישיב הנדסה / this is the name for the pending one"*, closing the
placeholder that had stood since 2026-08-07.

**It is a company, not a person.** `הנדסה` is the Hebrew word for *engineering*, so the
string is a firm's name, not a personal one. Rendered **"Elyashiv Engineering"** in Latin
script to match the other five, which the header comment already establishes are
English-rendered. The speaker's own name is still unknown — the user supplied the client,
not the individual, and was not asked to.

⚠️ **Transliteration is a judgement call, not a measurement.** `אלישיב` maps to Elyashiv /
Eliashiv / Elishiv / Elyashib depending on convention; Elyashiv is the most common. This is
a real client's name on a public page, so if they spell it differently on their own material
that spelling wins over this one.

**Files renamed with it** — `testimonial-06.{mp4,jpg}` → `elyashiv-engineering.{mp4,jpg}`,
because `clip.id` IS the asset path (`/testimonials/${id}.mp4`). Used `git mv` so the rename
is tracked rather than showing as a delete plus an add. Verified both resolve 200 afterwards
(jpg 14,601 B image/jpeg; mp4 903,843 B video/mp4) — worth doing because `preload="none"`
means the page never requests the mp4 on its own, so a broken path would show up only as a
card that silently fails to play.

**An empty `role` is not free, and the first fix was wrong.** With no job title for a firm,
the obvious move was to drop the `<p>`. Measured result: the bottom block is bottom-anchored,
so removing a child pulled the plus button **~48px down** — its own line box plus the
`gap-6` — and it visibly sat lower than the other five. Rendering the `<p>` empty instead
still left the gap, i.e. ~19px low. The fix that actually holds the geometry is to render it
always with a **non-breaking space**, which occupies exactly one line box, plus `aria-hidden`
in that case so a screen reader is not handed a blank paragraph. Confirmed by screenshot:
all six plus buttons land on the same baseline.

**The three-line wrap "ELYASHIV / ENGINEE / RING" is left alone**, deliberately. It is the
same mid-word break the 2026-08-07 entry accepted for "NEVO / YAHALOM / AN": the collapsed
card is ~70px wide and fits about seven characters at 13px with 0.1em tracking, shrinking the
type does not fix it (11px still overruns at the 810 tier), and breaking a name beats
truncating one. Changing it now would make this card inconsistent with that decision.

**Verified:** `npm run build`, `tsc --noEmit`, `eslint src` all clean; no stale reference to
`testimonial-06` anywhere in `src/`; six `Play …'s testimonial` labels present, the sixth
reading "Play Elyashiv Engineering's testimonial".

**Still open:** `achituv` remains the one unsourced entry — name and role both read off the
filename `Achituv-Vtechezena.MOV`, not published anywhere.


### 2026-08-07 — sixth clip added; row re-proportioned; names no longer clip

**Trigger:** user — *"I ADDED A NEW VIDEO IN THE ROOT INCLUDE THAT AS WELL JSUT TRANSCRIBE
THE NAME AND COMPANY OR WHATSOEVER"*.

Source: `WhatsApp Video 2026-08-07 at 18.00.03.mp4` in the repo root. 464×704, 19.9s, h264 +
aac, 2.4 MB.

#### ⚠️ There was nothing to transcribe

The clip carries **no burned-in caption, no name card and no title overlay** — checked by
tiling ten frames across its full 19.9s. `cropdetect` with `negate` confirms a full-bleed
464×704 frame with no letterbox, unlike three of the five existing masters. Container
metadata holds only `major_brand` and `language=und`; no title, no artist.

The speaker presumably says his name in the audio. **There is no speech-to-text available in
this environment**, so the name cannot be recovered from the file. `name` and `role` are
therefore obvious placeholders — `"Name pending"` / `"Company pending"` — rather than a guess
dressed as a fact. Files are `testimonial-06.{mp4,jpg}` so renaming is a three-line change
once the user supplies it.

#### Encode

Kept at **native 464×704** rather than upscaled to the 720 the other five share. The card
paints the video ~186 CSS px wide, so 464 already exceeds 3× DPR; upscaling would only add
softness and bytes. crf 26 / preset slow / faststart, aac 96k mono: **2.4 MB → 904 KB**.
Poster pulled at t=1.5s.

#### Six cards in a row built for five

The row must still sum to the container plus the gaps it swallows:

```
5 closed × 14%  +  (30% − 60px)  +  5 gaps × 12px   =  70% + 30%  =  100%
```

The `−60px` cancels the five gaps, the same trick the five-card version used with `−48px`
for four. Verified — cards + gaps land within 1px of the row at every tier that uses the row
layout:

| width | row | cards | gaps | total | open card | closed cards |
|---|---|---|---|---|---|---|
| 1600 | 1280 | 1219 | 60 | 1279 | 324 | 179 |
| 1440 | 1280 | 1219 | 60 | 1279 | 324 | 179 |
| 1024 | 944 | 883 | 60 | 943 | 223 | 132 |
| 810 | 730 | 669 | 60 | 729 | 159 | 102 |

**The OPEN card gave up the 6 points (36% → 30%), not the closed ones.** It has slack they
do not: it holds a 9:16 video that is *height*-bound by the 600px row, so it paints ~186px
wide inside a 324px card either way. Taking the width off the closed cards instead would
have cost name legibility, which is the only job a closed card has.

#### The bug this surfaced: `break-words`

Narrowing closed cards from 16% to 14% broke a name. **"Yahaloman" is a nine-letter single
word** — 113px at the ≥1200 size, 87px at 13px — and a single word does not wrap, so
`overflow-hidden` was cutting it mid-name. The sweep reported `*** CLIPPED ***` on that row
at 1600, 1440 and 810.

Fixed with `break-words` on the name. Shrinking the type does **not** solve it — at the 810
tier even 11px still overruns the 70px box — and it would undo the sizing the user asked for
when they wanted the names set as logo marks. Breaking a name across lines is not pretty
under that treatment, but it beats truncating one: the reader gets the whole name, and there
is vertical room (the card is 600px tall, the name block sits at the top). "NEVO YAHALOM /
AN" now takes three lines at ≥1200. Re-measured: **no clipping at any tier.**

#### Also this day

The site sans became **Discovery**, so every name and role in this section is now set in it.
No geometry changed as a result — see the global log.

**Still open:** the sixth speaker's name and role; Achituv's name and role; all six clips
carry Hebrew burned-in captions on an English-first site.

---

### 2026-08-05 — rebuilt as a five-up video row; the rogo quotes are gone

**Trigger:** user — *"yes dont change the design at all just make the testimonials video"*,
then *"make the cards 5 i uploaded the video"*.

**This closes the question open since 2026-08-03.** The three Truist/Nomura/Baird quotes,
the three names, the three roles and the three logo marks are all removed. Nothing on the
site now implies an endorsement clix does not have.

**Why a rebuild and not a copy swap.** There was no honest copy swap available: the real
company site carries **no written quote text anywhere in its markup** — the endorsement
exists only in video. Writing quotes for real, named people would have been fabrication.
The user chose the rebuild knowing it breaks the "don't change the design" rule for this one
section.

**Shipped:** five 9:16 cards, poster + play button, click to start, one at a time.
`preload="none"` so none of the ~21 MB is fetched until a card is clicked. Audio kept and
playback never autoplays — these are people speaking.

**Section shell is untouched** — padding 128/16 → 164/40/128 → 196/40/80, the 1280 container,
the 80px gap, and the h2 type scale with its phone-only hard break all carry over from the
clone. Only the cards changed. Heading is now "In our clients' own words" (the live site's
*בקולם של הלקוחות שלנו*), replacing "Helping finance teams build smarter organizations".

### Amendment 2, same day — the card is the target's too, not just the animation

**Trigger:** user posted a screenshot of the *original* rogo card and said *"want this design
no video preview just name on top with title on bottom same design and shi"*.

The intermediate version used the poster frame as the card's own artwork, with the
attribution overlaid on it. That is gone. **The card is now the target's flat `card` panel**,
and only the contents of its three slots changed:

| target slot | ours |
|---|---|
| customer logo mark, top | **the person's name** |
| quote, collapsing middle | **the video** |
| plus button + name + role, bottom | **plus button + title** |

**The name is set to READ as a logo mark**, on a follow-up from the user (*"i want same
design as this on the name"*, with a crop of the TRUIST/NOMURA marks). It keeps the target's
40px "Logo wrapper" box, contents vertically centred and left-aligned, and the type is
uppercase, `0.12em` tracked, medium weight, 11px → 13px. That is as close as a typeface gets
to those marks optically without being their actual artwork.

**Colour is ink@60%, not the target's 30%, and that is a deliberate break.** 30% is right for
a decorative logo, and it is already logged in this file as a 1.92:1 contrast failure
inherited from the capture. This slot now holds a **person's name** — content a visitor has
to read, not decoration. 60% clears AA on the `card` panel and still reads as the muted grey
label the design is going for. Revert to 30% only if the visual match matters more than
legibility, and note it here if so.

A closed card is therefore a plain panel with a name and a title — no imagery at all, which
is what "no video preview" meant. `p-8`, `rounded-[6px]`, `bg-card`, the `ink-wash` plus
button and its 300ms fade are all the clone's own values, restored verbatim.

**The collapse is back on the target's own mechanism** — `grid-rows-[0fr] → [1fr]` with the
capture's literal 1px/3px closed sliver rather than zero, which is what the accordion used
for its quote. So both axes are the target's: `grid-template-rows` for the body,
`width` for the row.

**Video sizing is height-driven, not width-driven, and that is not a preference.** The clip
is 9:16 inside a 600px card, so height is the only axis that actually binds. 330px leaves the
name row, the 56px gap and the bottom block their space; 9:16 makes that 186px wide, which
fits the open card's 325px of inner width. Widening the card does **not** make the video
bigger — worth knowing before anyone tries. Steps to 300px at the tablet tier, where the open
card has only 183px inside.

**Padding drops to `p-4` between 810 and 1200.** Five closed cards are 117px wide there, and
the target's `p-8` leaves 53px — not enough to render a name. The target never hit this: it
only ever laid three cards in a row, and only above 1200.

**eslint caught a real bug in the first pass** (`react-hooks/set-state-in-effect`): the
close-a-card handler called `setPlayingId` inside the effect body, which cascades renders.
Fixed by **deriving** `playing` as `playingId === id && openId === id` instead of storing it
twice — the effect now only pauses video elements, which is what an effect is for. A stale
`playingId` on a closed card is harmless because the derivation requires it to be open.

### Amendment 1, same day — the accordion is back

**Trigger:** user — *"i want the testimonials to be the same animation the collapsable"*.

The plain 5-up grid below was replaced by **the target's accordion**, driving the videos.
Every timing and easing is the clone's own value read back out of git, not a fresh estimate:
width `500ms`, collapse `500ms`, plus-button opacity `300ms`, all on `var(--ease-rogo)`
(`cubic-bezier(.44,0,.56,1)`). Verified in-browser: computed `transition-duration` is `0.5s`
and the timing function resolves to that curve.

**Geometry — the target's trick, extended from three cards to five.** rogo ran
`17 / 17 / calc(66% - 24px)`, the 24px being its two 12px gaps, so the row sums to exactly
100%. Five cards need four gaps: four closed at **16%** is 64%, leaving **36%** for the open
one, and the 48px it gives back is exactly 4 × 12px.

| width | open | closed ×4 | sum + gaps |
|---|---|---|---|
| 1440 | 413 | 205 | 1232 + 48 = **1280** ✓ |
| 1024 | 292 | 151 | 896 + 48 = 944 ✓ |
| 810 | 215 | 117 | 682 + 48 = 730 ✓ |

**36%, not the target's 66%.** The target expanded to reveal a text quote, where a wide card
is right. This reveals a 9:16 video: at 66% the open card would be a wide letterbox with a
head in the middle. 36% lands it at 412×600 (0.69) — still portrait-leaning.

**Two axes, one per tier.** Below 810 the stack animates **height** (96px closed → 440px
open); from 810 up the row animates **width** at a fixed 600px. Both ends are explicit values
in both cases, which is the whole reason they interpolate — the same reason the target wrote
two explicit widths instead of `flex:1 0 0`.

**The 810 switch is ours, not the target's 1200.** The user asked for all five visible on
narrower screens *before* asking for the accordion back; the horizontal row is what satisfies
both. Below 810 a 390 phone would put closed cards at 57px, so the stack takes over there.

**Attribution type steps down below 1200** — `p-3` + 14px/12px instead of `p-5` + 16px/14px.
At 810 a closed card is 117px wide, and at the desktop values that left 77px of text, which
rendered "Asaf…". Truncating a person's *name* is worse than truncating their role, which is
what the target's own `line-clamp-1` does. The tighter values fit every name in this set.

**Scrim added**, and it is load-bearing rather than decorative: the attribution sits over
arbitrary video frames that range from a dark car interior to a blown-out white wall.
Bottom-half `from-ink/85 via-ink/40`, faded out while playing so it does not sit over the
native controls.

**Closing a card pauses it** — via an effect on `openId` rather than the click handler, so
keyboard activation is covered too. Otherwise a collapsed 117px sliver keeps talking.

---

**Superseded by the amendment above.** The layout described from here on was the plain grid
that briefly replaced the accordion.

**Layout:** the 5-up grid runs from **810px up**, with a snap-scrolling row below it. Not a
stacked column — five 9:16 portraits run past 3000px on a phone — and not a 2-up grid, which
leaves a hole in the last cell. The row also matches how the real site presents them.

The 810 cut-off was first set at 1200 and lowered on the user's instruction (*"fix its 5"* —
five across was only appearing on wide screens). **810 is where the arithmetic stops
working, not a preference:**

| width | card | media box |
|---|---|---|
| 1600 / 1440 | 246 | 246×438 |
| 1200 | 214 | 214×381 |
| 1024 | 179 | 179×319 |
| 900 | 154 | 154×274 |
| **810** | **136** | **136×242** |
| 390 | 240 | scroll row |

At 810 the section's 40px insets leave 730px; less four 12px gaps, 682px over five cards is
136 each. One tier lower a 390 phone leaves 358px — 62px per card, where a face is not
legible — so the scroll row takes over. Measured at all seven widths: five cards, **one row,
no wrap, no horizontal page overflow** at any of them.

**The play disc is 44px below 1200 and 56px above.** A fixed 56 ate 41% of the 136px card at
the tablet floor and sat over the speaker's face. 44px is the floor — the minimum comfortable
touch target.

**Encode — 312 MB of masters → 21 MB.** 720px wide, h264 crf 26, AAC 96k mono, faststart,
poster pulled at 1.5s rather than frame 0.

**The crop numbers, because they were not obvious and cost a second pass.** Three of the five
masters are story-style exports with the speaker inset inside a LIGHT GREY frame. First pass
scaled the whole 1080×1920 and the row rendered visibly letterboxed on cards 1, 2 and 4 while
3 and 5 filled. `cropdetect` reported `1080:1920:0:0` for all of them — **it only detects
dark borders**, and these are light. Running `negate,cropdetect` instead found the real
boxes:

| Clip | content box | note |
|---|---|---|
| `asaf-peretz` | `864:1216:108:518` | 0.71 aspect — squarer than the rest |
| `adir-peretz` | `864:1526:108:198` | ≈9:16 already |
| `noam-tovi` | `864:1526:108:198` | ≈9:16 already |
| `nevo-yahaloman` | full frame | no padding |
| `achituv` | full frame | 4K HEVC master, 222 MB → 9.2 MB |

Encoded at native content aspect rather than forced to 9:16, letting the card's
`object-cover` do the final crop. Masters are `.gitignore`d (`Client testimonials/`); these
crop values are what makes them reproducible.

**Open**
- **`achituv` is unverified.** Name and role come from the uploaded filename
  ("Achituv-Vtechezena.MOV"), not from any published source — the live site shows only four
  testimonials. Role currently reads "Vtechezena". **Confirm before this ships.**
- **Asaf's burned-in caption clips at the sides.** His content box is 0.71 where the others
  are 0.5625, so `object-cover` crops width to fill a 9:16 card. Fixable only by letterboxing
  his card or re-cutting with the caption in mind.
- **All five have Hebrew burned-in captions** on an English-first site. Not a defect, but a
  mismatch the user should decide about.
- 21 MB of tracked video is heavy for a git repo. Fine for now; a CDN is the eventual answer.
- `src/components/ui/TestimonialLogos.tsx` and the three mark SVGs are now **orphaned** —
  nothing imports them. Left in place rather than deleted as part of this change.

### 2026-08-04 — option (b) turns out to already exist

Captured the real company site (`docs/reference/clixsolutions/`) and it **has testimonials** —
which resolves the research half of the question left open below. It does not resolve the
decision half; that is still the user's.

**They are video, not pull-quotes.** Four 9:16 portrait clips behind play buttons
(`aria-label="הפעלת עדות של <name>"`), posters at `/testimonials/<slug>.jpg`:

| Name | Attribution |
|---|---|
| אסף פרץ — Asaf Peretz | מייסד · SalesIQ |
| אדיר פרץ — Adir Peretz | בעלים · סטודיו וידאו וצילום |
| נבו יהלומן — Nevo Yahaloman | מייסד |
| נועם תובי — Noam Tovi | בעלים · השקעות |

**There is no quote text anywhere in the markup** — the endorsement lives entirely in the
video. So there is nothing to lift as a written quote, and this section's three-card
accordion has no direct content equivalent. Using these means either pulling written quotes
from the clips (needs the people's sign-off on the wording) or rebuilding the section as a
video row.

What this changes: option (b) — *real clix testimonials with permission* — is no longer
hypothetical. Four named people have already gone on camera for Clix. The blocker was never
"do endorsements exist"; it is which of the three options the user wants.

**Unchanged:** the three Rogo quotes stay exactly as they are until the user picks. Nothing
in `src/` was touched.

### 2026-08-03 — excluded from the brand rename, and why

Every other "Rogo" on the site became "Clix" when the user asked to change the brand name.
These three quotes did not, and the exclusion is deliberate rather than an oversight.

**The distinction.** Everywhere else, "Rogo" sat in *product copy* — rogo's own claims about
their own software, which this clone reuses wholesale. Renaming that is just rebranding
borrowed marketing. These are **statements by real, named, identifiable people**: Tom
Hackett (CEO, Truist Securities), Patrice Maffre (International Head of IB, Nomura), Ross
Williams (COO, Baird Global IB). Substituting the product name inside a quote manufactures
an endorsement of clix from someone who never gave one — a different act from rebranding
copy, and not one to perform silently.

**The real problem is bigger than the word.** The section reproduces rogo's customer
material entire — quote, name, title, firm, and the three logo marks. On a clix site that
already implies three real institutions endorse clix, whichever product name the sentences
carry. So the fix is to **replace the section**, not to rename inside it; renaming makes the
implication worse because it removes the only signal that the statements were about
something else.

**Options when the user wants this closed:** (a) fictional attributions + reworded quotes,
which needs the logo marks pulled too or the firms still show; (b) real clix testimonials
with permission; (c) drop the section until (b) exists. All three need the user.

**Guard in place:** a comment above `TESTIMONIALS` in `Testimonials.tsx` states this, so the
rename is not "finished" later by find-and-replace.

### 2026-08-03 — built

**Trigger:** user — two screenshots of rogo.ai's testimonials block, *"this is the 2nd
page"*.

**Done**
- Extracted the `#testimonials` subtree (48,226 bytes, capture offset 394851–443077) and
  every CSS rule touching its 30-odd `framer-*` classes.
- Built `Testimonials.tsx` + `TestimonialLogos.tsx`; wired into `page.tsx`.
- Three new tokens → `docs/DESIGN-SYSTEM.md` + `@theme`: `canvas` `#f7f7f7`,
  `card` `#eeedec`, `ink-wash` `rgb(21 21 21 / .05)`.

**Measurements worth keeping**

- **The quote font size drops 28 → 20px below 1200 — and the capture hides this.** The
  *collapsed* mobile cards still carry `28px`; only the **open** mobile card carries `20px`.
  Since exactly one card is ever open, 20px is the real value for that tier. Reading only
  the first mobile card in document order would have got this wrong.
- **The desktop row geometry is 17 / 17 / rest.** Closed cards are `width:17%`, the open one
  is `flex:1 0 0`. On a 1280 container with two 12px gaps: **217.6 / 820.8 / 217.6**.
  Reimplemented as `17%` and `calc(66% - 24px)` — same numbers (browser reports 218/821/218)
  but two explicit widths, which is what makes the transition interpolable.
- **The collapsed quote is 1px, not 0** — `height:1px` desktop, `height:3px` mobile, under
  `overflow:clip`. Framer's minimums. Kept as the closed-state `min-height`.
- **The plus button changes parent between tiers.** ≥1200 it sits in the card's `Bottom`
  block above the attribution; ≤1199.98 it moves into the logo row and is pushed right by
  `justify-content:space-between`. CSS cannot move a node between parents, so this is the
  one thing rendered twice and hidden per tier.
- **The logo marks are a second set of assets, not the carousel's.** `#testimonials` inlines
  dark-fill copies, and **Nomura's artwork actually differs** — `120×21` here versus
  `122×22` in `public/logos/logo-nomura-white.svg`. Do not consolidate the two sets.
- Mark sizing is `aspect-ratio` + a height percentage of a fixed 40px wrapper:
  Truist 67% → 26.8 @ 4.125 · Nomura 42% → 16.8 @ 5.70833 · Baird 46% → 18.4 @ 3.60526.
  Truist's *true* aspect is 4.29, so with `preserveAspectRatio="xMinYMid meet"` it
  letterboxes ~0.5px top and bottom and stays flush left. That is the original's behaviour,
  not a rounding error.
- `.ssr-variant { display: contents }` — the wrapper divs contribute no box, so the h1
  wrapper and the card row are direct flex children of Width Container and the 80px gap
  lands between them.
- **No `min-width:1600px` rule exists for this section.** XL and Desktop are byte-identical;
  the base rule serves both.
- Provider **name and role are both `line-clamp:1` at ≥1200**; below 1200 the clamp is
  lifted from the **role only**. That asymmetry is what produces "International…" on the
  closed desktop cards and full wrapped text on mobile.
- Section padding: `196/40/80` (≥1200) · `164/40/128` (tablet) · `128/16` (phone).
  Heading→cards gap 80 at every tier. Card gap 12 (row) / 16 (stack).

**Decisions**

- **One DOM, not Framer's two subtrees.** Duplicating three quotes into the page to hide one
  copy costs the a11y tree for no visual gain. The two genuinely un-CSS-able differences —
  the plus button's parent, and the phone-only `<br>` — are rendered twice and hidden per
  tier. Everything else is a `desktop:` variant.
- **CSS transitions, no animation library.** Neither `gsap` nor `framer-motion` triggers
  fired: per `docs/SKILLS.md`, GSAP owns scroll-driven / pinned / scrubbed / timeline work
  and Motion owns mount-exit / gesture / layout animation. This is a two-state toggle on
  three siblings. Logged so the absence reads as a decision, not an oversight.
- **`grid-template-rows: 0fr → 1fr`** for the quote reveal — the only way to transition to an
  intrinsic height in CSS. The original does it in JS. Closed geometry (1px / 3px) is kept as
  `min-height` so the measured value survives.
- **`<h2>` not `<h1>`, `<blockquote>` not `<h5>`.** Both purely semantic, both zero visual
  difference, both fixing something Framer got wrong. The page already has the hero's `h1`.
- **One tab stop per card.** The original makes the card *and* the logo inside it
  `tabindex="0"` — two stops firing the same action. Ours is `role="button"` +
  `aria-expanded` + `aria-controls` on the card, with the logo inert.

**Verified**
- In-browser computed values at all four tiers (CDP): section padding, background,
  heading/quote/name sizes, card widths + heights + padding + radius + fill, `tabIndex`,
  and `scrollWidth == innerWidth` (no overflow) — all match the table in `FEATURE.md`.
- Click on the Nomura card: `aria-expanded` flips and widths become `218 / 821 / 218`.
- `npm run build` clean; `eslint` reports nothing in `src/` (the two pre-existing findings
  are in `docs/reference/contrast-check.js`).

**Open / deferred**
- **Motion timings are estimates** (500 / 500 / 300ms on `--ease-rogo`). Framer animates in
  JS; the capture holds one authored transition and it is not this one. Needs the live site.
- **Two contrast failures inherited from the target and deliberately NOT fixed:** provider
  role (ink @ 0.4 → `#979797` on `#eeedec`) is **2.50:1**, and the logo marks (ink @ 0.3 →
  `#adadad`) are **1.92:1**. `PROJECT.md` sets an AA floor; `CLAUDE.md` §1 makes colour a
  hard fidelity requirement. Unlike the other a11y divergences this one is *visible*, so it
  is the user's call. Minimum fix: role opacity `0.4 → 0.60` = exactly 4.5:1.
- Card hover state unobserved — the capture declares `cursor:pointer` and nothing else.
- Whether clicking the *open* card closes it is unverified; currently a no-op, which is what
  Framer's variant set implies.
- The mobile card gap is `96px` (`.framer-v-sgdn6k`), which leaves ~290px-tall closed cards
  at 1024. Verbatim from the capture, but worth a look at a real tablet width.

## 2026-08-13 — English quote copy: the "warm" tic removed

All six carousel quotes are translations of the Hebrew originals in `quote.md`. Five of the
six ended on בחום / בנעימות, which had been carried over literally — *"Warmly recommended!"*,
*"a warm recommendation from me"*, *"recommend them warmly!"*, *"with real warmth"*, *"I warmly
recommend it to everyone!"*. Idiomatic in Hebrew, but in English it reads as machine-translated,
and repeating it across five of six slides makes the whole set look authored by one hand.

Replacements (EN only — `src/lib/i18n/en/home.ts`):

| Slide | Was | Now |
|---|---|---|
| Asaf Peretz | Warmly recommended! | Highly recommended! |
| Nevo Yahaloman | a warm recommendation from me | a strong recommendation from me |
| Noam Tovi | I recommend them warmly! | I highly recommend them! |
| Achituv | with real warmth | with real care |
| Elyashiv Engineering | I warmly recommend it to everyone! | I recommend it to everyone! |

⚠️ **These strings are a layout input.** `SLIDE_STYLE.quoteDesktop` in `QuoteCarousel.tsx`
picks a per-slide desktop font size from character count — 32px past ~260 chars, 36px below.
Counts were re-measured (script over the concatenated string literals), not eyeballed:

    207 / 289 / 174 / 189 / 267 / 140   (was 207 / 289 / 172 / 189 / 269 / 147)

Only slide 3 grew, by 2 characters, and it sits in the 36px tier whose binding case is 207 —
so nothing crosses the ~260 boundary in either direction and no font size changes. The
`LENGTH IS LAYOUT` comment above `slides` carries the new numbers.

**Hebrew deliberately untouched.** The tic is an artefact of translation; בחום is the natural
register in the source and changing it would edit real customers' words. HE is also shorter in
every slot, so EN remains the binding case for sizing.

Copy-only change: no component, CSS, or token touched.


## 2026-08-13 — The carousel's photo column became a player

The six "portraits" in the >=1200 slideshow were never portraits: they are poster frames cut
from the clients' own testimonial videos, and those videos have sat in
`public/testimonials/<id>.mp4` (0.9–9.4MB, 19–69s) unused since the accordion was retired.
On the user's call the column is now a play target.

**Behaviour.** At rest it is *exactly* what shipped before — same file, same crop, same 360px
box — plus a 56px play badge. Click: the column widens **360 → 480px over 400ms** on
`--ease-rogo`, the clip crossfades in over 300ms and plays **with sound**. Pause, end, Escape,
either arrow, a committed flick, or a resize under 1200 all collapse it back to the poster.
No native `controls`; clicking the video pauses it (user's decision).

**Scope, decided not defaulted.** >=1200 only. The 810–1199 tier has no photo column at all
(`hidden desktop:block`, the whole difference between the original's two slideshow variants)
and the <=809 static stack is quote-only. A `display:none` `<video>` with `preload="none"` and
no autoplay does nothing, so those two tiers needed no gate beyond the class already there.

**480px is fixed for all six, and that was a choice against the alternative.** The clips are
720x1014 (asaf), 464x704 (elyashiv) and 720x1272–1280 (the other four), so their uncropped
widths at 694px tall would have been 493 / 457 / 390–393 — a different distance and a different
quote reflow on every slide. Presented to the user with those numbers; they took the uniform
480 over per-clip natural width. The cost is real and stated: at 480 the 9:16 clips lose ~79px
off the top and bottom to `object-cover`. **If a burned-in Hebrew caption gets clipped on any
of them, the one-line escape hatch is a per-clip `objectPosition` in `SLIDE_STYLE`** — not a
change to the width.

### Four load-bearing decisions

1. **Exactly one `<video>`, mounted at `pos`, `preload="none"`.** `LOOP` renders 18 `<li>`
   (6 slides x 3 copies). One video per slide is 18 elements and, above `preload="none"`, the
   six clips fetched three times over — ~68MB.
2. **`play()` is called inside the click handler**, which is *why* the element is mounted
   rather than created on click. Deferring it behind a mount + effect puts it one macrotask
   past the gesture: Chrome forgives that, Safari does not, and the failure is silent.
   Correspondingly `playing` is set by the element's own `play` **event**, not by the promise —
   `preload="none"` means the promise resolves only after the first bytes land, which would
   leave the button dead for the whole first buffer. (`Testimonials.tsx` can safely drive off
   the promise because native `controls` back it up; here nothing does.)
3. **`go()` stops the clip synchronously, before `setPos` — not in an effect keyed on `pos`.**
   That is the opposite of what `Testimonials.tsx:414` does, and the reason is the remount: by
   the time such an effect ran, React would have unmounted the video from the old `<li>` and
   mounted a fresh one in the new, so the ref would point at the new **silent** element while
   the old **detached** one carried on playing audio with nothing holding a reference to it.
   It also sets `playing` itself rather than waiting for the `pause` event, which is queued as
   a task and would land after the listeners were torn down.
4. **`stopPropagation` on the button's `pointerdown`.** The viewport calls `setPointerCapture`
   on itself; capture retargets `pointerup`, so the browser computes `click` at the common
   ancestor and fires it on the **viewport** — `onClick` would never run at all.
   ⚠️ **Stated cost: the portrait is no longer a drag surface at >=1200** (360 of 1280px, 28%).
   Accepted — those pixels must be a click target, and a surface that drags at rest but clicks
   while playing would be worse than one that never drags.

### State shape

`playing` is a **boolean, not an index**. The video only exists at `pos` and every path that
changes `pos` stops it first, so "which slide is playing" is not an independent fact. An index
would make `playingIndex !== pos` representable with no behaviour behind it; per-slide the flag
is derived (`const expanded = i === pos && playing`).

`ended` **does not fire `pause`** (per spec the ended playback algorithm leaves `paused` false),
so `onEnded` collapses on its own and resets `currentTime = 0` so the next click restarts rather
than re-ending instantly. A pause keeps its position — collapsing is not giving up. Both
handlers are idempotent, so the older WebKit builds that fire both cost one render.

Two effects added, both touching state only from inside a **listener**, never an effect body
(`react-hooks/set-state-in-effect`): Escape anywhere on the page, and a
`matchMedia("(min-width: 1200px)")` guard — `display:none` does **not** stop playback, so
without it a resize leaves audio running from an element nobody can see.

### The measured risk: quote overflow

The card is `flex-1 w-px` beside a `flex-none` column, so it absorbs the whole 120px and
**nothing else moves** — the track's transform is a percentage of a width that does not change,
and `h-[694px]` is untouched. No page reflow.

Vertical budget inside the card: `694 - 96 (p-12) - 80 (gap-20) - 47 (author block) = 471px`
for the blockquote = **10 lines at 36px, 11 at 32px**.

| viewport | container | card at rest | card playing | measure |
|---|---|---|---|---|
| >=1360 | 1280 | 904 | 784 | 688 |
| 1200 | 1120 (`tablet:px-10`, no desktop override) | 744 | **624** | **528** |

Binding cell is **`adir-peretz`, 289 English chars at 32px, at exactly 1200px**: it overflows
only below ~26 chars/line (0.63em average advance); Discovery runs ~0.50em, so expect ~10 lines
of the 11 available — **~1.3 lines of headroom**. Computed, **not yet observed**.

⚠️ Failure mode if copy ever grows: the quote block has `min-height: auto`, so it pushes the
author block down and `overflow-hidden` clips from the **bottom** — the role line goes first,
then the name. The quote itself never clips, so the regression is invisible unless looked for.
Runtime check, with a clip playing:

    const c = document.querySelector('#testimonials li[aria-hidden="false"] > div');
    c.scrollHeight - c.clientHeight;   // > 0 => the author block is being clipped

### One button, not two

The play and pause affordances are **one** `<button className="absolute inset-0">` whose label
and glyph swap. Not two: the pause target *is* the whole column, so a second control would be
the same absolute box written twice — and unmounting the button on play (which is what
`Testimonials.tsx` does) drops focus to `<body>`, leaving a keyboard user who pressed Space to
play unable to press Space to pause. That is harmless in the accordion because native
`controls` appear and take over; here nothing takes over. The badge fades out while playing and
returns on hover/focus. `bg-transparent` at rest, not the accordion's permanent `bg-ink/10`
scrim, because the resting column has to look exactly like the photograph that shipped before.

`ml-[2px]` on the play triangle stays **physical** and is not mirrored in RTL — transport
glyphs are never mirrored (only skip-forward/back are, because only those mean "the direction
reading goes"); a left-pointing play button on /he would read as rewind. The pause bars are
symmetric so they get no nudge at all.

### i18n

New `chrome.a11y.pauseTestimonial`, declared in `dictionary.ts` first so both locale files fail
loudly until filled. EN `"Pause {name}'s testimonial"`. ⚠️ **HE `"השהיית עדות של {name}"` is AUTHORED and unread
by a native speaker** — unlike `playTestimonial` directly above it, which is sourced from the
real site's own aria-label. The capture has no pause control anywhere (its players hand off to
native `controls`), so there was nothing to lift. Verbal-noun form chosen to parallel the play
label rather than the imperative.

### Status

`npm run build` clean, `tsc` clean, eslint clean on all four changed files; 18 static routes.
**Not visually verified at any tier** — per the user's standing preference, handed over for
their own check. Open: the adir/1200 cell above; whether 480px clips any burned-in caption; and
the Hebrew label.
