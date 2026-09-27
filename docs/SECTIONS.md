# Sections Registry

Master list of every section to clone, in page order. This is the plan and the status board.

**Status values:** `todo` · `measuring` · `building` · `review` · `done` · `blocked`

Inventory taken from the 2026-08-02 capture of <https://rogo.ai/>
([docs/reference/target/](reference/target/)). Section order and the *Original name* column
come from the target's own `data-framer-name` attributes — not from guessing at the visual.

## Home page

| # | Slug | Section | Original name | Status | Notes |
|---|---|---|---|---|---|
| 1 | `nav` | Navigation + announcement banner | `Navigation + Banner` | **`review`** | **Built** → [features/nav/](../features/nav/). `position:fixed`, overlays the hero. **Two different breakpoints:** banner switches layout at **810px**, header switches full-nav→hamburger at **1200px** — the 810–1199.98 tier has a centred banner over a hamburger header. **Scrolled state added 2026-08-03** from live screenshots. **Two independent behaviours, not one:** the banner is direction-aware (`shift = (down && scrollY > 0) ? 45 : 0`, eased 300ms both ways — out on the way down, back on the way up at any depth), while the bar's palette **tracks the section behind it** — a three-way `hero`/`light`/`dark` state driven by a `data-nav-theme` attribute each section carries, not a boolean. Over `security` and `footer` (both `ink`) the bar goes solid `ink` with the hero's own white content palette; over the light sections it goes solid `paper` with `ink` logo/links and an inverted `Request Demo`. The **`dark` state is a user request and has NOT been observed on the live site** — possibly a deliberate divergence. Proven independent by a live frame showing a light bar *with* the banner — impossible from a single state flag. **Link labels are the target's own as of 2026-08-09** — `Clix/Product/Security/Company/Customers/News`, i.e. rogo's seven with `Felix` → the brand and **`Careers` dropped on 2026-08-13 when its route was deleted**; six slots now, and the tuple type in `dictionary.ts` enforces the count in both locales. Only `Security` and `Customers` resolve to a section here; the rest are routes or inert. Labels only: the clix lockup, the LLM ticker and the 18px type were each asked about and kept. The capture could never have supplied this — it declares the sibling variant `.framer-v-yxrzsa` but every colour in it is applied inline from JS. Unticked: not yet compared to the reference at any tier; the mobile menu panel is **invented** (never rendered in the capture); the scroll **flip point** is ours (hero bottom ↔ nav bottom, not measured); the `Indicator` element unresolved. |
| 2 | `hero` | Hero | `Hero` (`#hero`) | **`review`** | **Built** → [features/hero/](../features/hero/). All four tiers verified via CDP at exact viewports; no overflow; build clean. h1 `64/64/56/48px`. Unticked: CTA hover/active and entrance motion — **not observable in the capture**, need a look at the live site. |
| 3 | `logo-carousel` | Tool-stack marquee (was: customer logo wall) | `Logo Carousel` | **`review`** | **Built** → [features/logo-carousel/](../features/logo-carousel/). ⚠️ **Not a sibling section — it renders INSIDE `<section id="hero">`**, `absolute bottom:0 height:248px`. The "#3, after the hero" placement in this table was an inventory guess from the visual and was wrong; verified against the capture's tag offsets. Doubled track, `gap:56px`, 8-layer progressive blur, measured cycle. → `gsap`. **⚠️ CONTENT DEPARTS FROM THE TARGET (2026-08-07):** rogo's 14 items are its *customers* (Jefferies, Lazard, Rothschild…), which a clix wordmark cannot honestly claim, so the row now carries clix's **own stack** — 13 tool lockups (glyph + name), 12 of them verbatim from the live company site's stack marquee, ElevenLabs added by the user. Every *mechanism* is still the target's; only the `<ul>` contents changed. Treatment is glyph + name because simple-icons (CC0) ships these as 24×24 **glyphs** while the row was built for **wordmarks 45–226px** — the lockup lands at 40–188 × 24, back inside that band. **Vapi and monday.com have no mark in simple-icons and render as text alone** rather than as a redrawn trademark. Cycle measurement is now gated on `document.fonts.ready` (text items are font-width dependent; measuring early tears the loop). Rendered at 1600/1440/1024/390. Unticked: **marquee speed is estimated** (50 px/s) since a static capture can't encode a rate; **tool list needs the user's confirmation**; a reference diff no longer applies to this row's content. |
| 4 | `testimonials` | Testimonials | `Testimonials` (`#testimonials`) | **`review`** | ⚠️ **TWO TREATMENTS SHARE THIS SLOT AS OF 2026-08-13.** The section, its `id`, its `data-nav-theme` and its "In our clients' own words" `<h2>` are permanent; only the BODY swaps. It renders the video accordion described below **until six real client quotes exist**, at which point `QuoteCarousel` (moved here from /product) takes over. The switch is **DERIVED** from whether the quote strings are non-empty, not a flag — a flag was tried and failed, because `PageDictProvider` serialises the whole `home` namespace into the RSC payload and the placeholder quotes leaked into this page's public source (7 measured hits) while the accordion was the thing rendering. The fabricated strings are therefore `""`, and pasting real ones in *is* the act of switching over. **Built** → [features/testimonials/](../features/testimonials/). One-open accordion: 600px three-column row at ≥1200 (open `calc(66% - 24px)`, closed `17%`, gap 12), stack below. Quote type drops **28 → 20px** under 1200 — the capture hides this in the *open* mobile variant only. Built with **CSS transitions, no animation library** — neither the `gsap` nor the `framer-motion` trigger matches a two-state toggle; the "`framer-motion`" note in the original inventory row was a guess from the visual. Unticked: motion timings are **estimated**; **two inherited contrast failures** (role text 2.50:1, logo marks 1.92:1) await the user's call; hover state unobserved. ✅ **THE CAROUSEL'S PHOTO COLUMN PLAYS AS OF 2026-08-13.** The six "portraits" were always poster frames from the clients' own videos, and those videos were already in `public/testimonials/`; at ≥1200 the column is now a play target that widens **360 → 480px over 400ms** and plays with sound, collapsing on pause / end / Escape / an arrow / a committed flick / a resize under 1200. The card is `flex-1` beside it, so it absorbs the whole 120px and **nothing else on the page moves** — `h-[694px]` and the track transform are untouched. Exactly **one `<video>`** exists (mounted at `pos`, `preload="none"`) because `LOOP` renders 18 `<li>`; `play()` runs inside the click handler; `go()` stops playback **synchronously** before `setPos`, since an effect would run after React remounted the element and leave the detached one talking. ⚠️ **The portrait is no longer a drag surface at ≥1200** — the button must `stopPropagation` on `pointerdown` or the viewport's pointer capture eats the click. ✅ **AND IT PLAYS BELOW 1200 AS OF 2026-08-14, AS A BYLINE TILE.** The `≤809` static six-card stack and `PHONE_STYLE` are **deleted**: the slideshow was already a swiper gated off by one `hidden tablet:block`, so it now renders at every width — phones get drag/flick, the loop, and **dots** instead of the arrows. Media is tier-SHAPED rather than tier-gated: `≥1200` keeps the column, below it the same player sits in the **author row** beside the name at 72×96 (96×128 at 810–1199) and grows to 168×224 (216×288) on tap, so **the quote and the video are visible at once** — a flip was offered and rejected by the user for hiding one side. Phone card height **400 → 528px** while playing, driven by an inline **custom property** (an inline `height` cannot be media-queried, so `tablet:h-[694px]` could never beat it); the `flex-1` quote block absorbs the growth so **the quote text does not move**. Tablet does not grow — measured slack: 518px for quote + tile, 288px tile, ~5-line quote ≈182px, ~48px spare. **Two `<video>` elements** now, one per box, both still only at `pos` and `preload="none"`; each box's own button plays the element beside it, so no `matchMedia` tier state and no hydration surface. The resize guard is generalised to stop on **any** crossing of 1200. Dot labels reuse the pre-existing, previously unused `chrome.a11y.slideOfTotal` — **no new dictionary key**. Cost stated: a phone reader no longer sees all six by scrolling; five are behind a swipe, and scroll drops ~2100px → ~400px. **Not visually verified at any tier**; the cell to check is `adir-peretz` at exactly 1200px, where the measure drops to 528px and the quote runs ~10 of its 11 available lines. New key `chrome.a11y.pauseTestimonial`, **Hebrew authored and unread by a native speaker**. |
| 4b | `landing-video` | Client video | *(no counterpart in the capture)* | **`review`** | **Built 2026-08-18** → [features/landing-video/](../features/landing-video/). **Not a clone of anything on rogo.ai's home page — that page has no video here.** It is `/clix`'s `Video` block re-used on `/`: aspect `1.77778`, radius 6, `object-cover`. ⚠️ **The mute toggle was REMOVED the same day on the user's call** ('remove this', against a screenshot of the button), so `muted` is a **hard attribute, not state** and the clip is permanently silent — sound and the control come back together or not at all. The section therefore has **zero interactive elements**: no tab stop, no focus ring, no strings, and the `home.video.{unmute,mute}` keys added hours earlier were deleted from both locale files (`en/home.ts` and `he/home.ts` are `git diff` clean). **`/clix` is untouched** — `ClixVideo` keeps its own toggle, so the two sections have diverged. **Markup duplicated rather than shared with `ClixVideo` on purpose** — the two differ in source, padding and dictionary namespace, i.e. in everything a section owns. **Padding is the one divergence and it is the home page's**: `py-10` / `tablet:py-20` both ends, since Testimonials closes on `pb-32`/`pb-20` and WhyRogo opens on `pt-20`/`pt-24`; `/clix`'s `pt-32` would have stacked ~196px under the testimonial heading. `landing-vid.mp4` is **1920×1080, 25.5s, 3.5MB** (exactly 16:9, so `object-cover` never crops); the poster is **generated** from frame 0 with ffmpeg, as `clix-demo-poster.jpg` was. **Playback is gated on visibility (2026-08-18, user's call):** an `IntersectionObserver` at `threshold: 0.25` plays and pauses it, **`autoPlay` is deliberately absent** so the observer is the only starter, and `preload="none"` means a visitor who never scrolls this far pays 12KB of poster rather than 3.5MB of mp4. `pause()` not a reset, so it resumes in place, and mute state survives the round trip. Unticked: **never rendered at any tier, no build run**; the 0.25 threshold is a decision, not a measurement, and is **unchecked at 390px** where a quarter of a 16:9 box is only ~50px; open questions are full-bleed vs 1280-capped, whether the clip has audio at all (the mute button assumes it does), and whether "below the client words" meant below the whole section or directly under its `<h2>`. |
| 5 | `why-rogo` | Why financial institutions choose Rogo | `Series C Tenants` | **`review`** | **Built** → [features/why-rogo/](../features/why-rogo/). Two equal columns (`flex:1 0 0; width:1px`) with a **CSS-sticky headline** at `top:96px`; 5 items, each an icon tile + heading + body over a hairline rule. **The items are deliberately not uniform:** item 1 alone has `padding-top:72px` (what aligns the h2 with the first tile), items 4–5 gap 32 where 1–3 gap 28, item 5 alone has no rule, item 4's icon is 3px high in its frame. **Tablet headings are *bigger* than desktop's** — 28px vs 24px, on all five. Built with **no animation library** — the pin is native `position:sticky` and the capture emits zero `data-framer-appear-id` here, so a GSAP pin would add a pin-spacer the original doesn't have. **Framer's internal name is stale** ("Series C" vs. the Series D banner; "Tenants" is the author's spelling of *tenets*) — ignore it, slug is descriptive. Unticked: not diffed against the live site; hover states unobserved (the capture has no `:hover` anywhere in the subtree). |
| 6 | `by-the-numbers` | By the numbers | `By the Numbers` | **`review`** | **Built** → [features/by-the-numbers/](../features/by-the-numbers/). 3 rows on a `card` `#eeedec` panel — 40,000+ users, 50,000+ daily queries, 300+ institutions — each a display number beside a bottom-aligned caption, over a `hairline` `border-top`. **`844 + 436 = 1280`**: the number cell's cap and the caption cell's cap sum to `--container-max`, so both bind at once and the caption column never drifts. Number leading is an **absolute `128px`**, so 96px (1200–1599.98) and 108px (≥1600) give identical 161px rows. **The count-up guess in this row was wrong** — the capture has zero `data-framer-appear-id`, zero transitions and no `:hover` in the subtree, so it was built static and `gsap` was declined; a JS code component could still do it, and that is the section's top open question. Unticked: not diffed against the live site. ⚠️ **THE `card` PANEL IS NO LONGER FLAT AS OF 2026-08-18** — it fades to `forest-deep` `#0f2822` on entry and back on exit, `/clix`'s colour and `/clix`'s gesture, at the user's request. **A different mechanism from `ClixBackdrop`, on purpose:** that one darkens the whole viewport from a fixed layer because eight sections are transparent over it; the ask here was this section alone, so the colour lives on this element and WhyRogo above and the `ink` footer below are untouched. New `NumbersTint.tsx` owns the `<section>` so this file stays a server component. ⚠️ **The type colour is a hard swap at the midpoint with a dip to 0.08 through it, NOT an interpolation** — mixing `ink → paper` alongside the ground lands #8a8a8a on #7e8a87, a measured **1.0** contrast, i.e. a ~100ms blank every time the section is scrolled into. `data-nav-theme` is rewritten on the same frame, or the white bar sits on the green. Third divergence from the target on this section, after the count-up. Unticked: **not rendered at any tier yet.** |
| 7 | `security` | ~~Built for enterprise, secure by design~~ | `Security` (`#security`) | **`removed`** | ⚠️ **DELETED FROM THE HOME PAGE 2026-08-18** at the user's request, against a screenshot of the block — heading "Your systems, your data, your control" plus the five-badge grid. `src/components/sections/Security.tsx` is gone, `<Security />` is unmounted from `HomeRoute`, and `home.security` came out of both locale files. ⚠️ **THE `/security` ROUTE IS A DIFFERENT PAGE AND IS UNTOUCHED** (`src/components/security/*`, row block below) — as are the nav and footer links to it; the user asked explicitly to confirm the two were not being conflated. The badge SVGs stay in [public/badges/](../public/badges/) because `SecurityCompliance.tsx` on that page uses all five. The `#security` anchor went with the section and nothing linked to it (the nav was repointed to `/security` on 2026-08-12). Everything below is the record of what was built, kept because it is where the ragged-border and 3.85:1-label findings live. **Built** → [features/security/](../features/security/). The one dark section below the hero. Centred headline (**no `<br>`** — both lines come from a `400px` measure) over a 5-badge grid that drops 5 → 2 → 1 columns. 5 badge SVGs vendored to [public/badges/](../public/badges/), validated by rasterising. **Framer paints `data-border` on an `::after` overlay, not the box model** — which is how the original leaves the grid outline **ragged below 1200px** without anything reflowing: GDPR has `border-right:0` at both the 2-col and 1-col tiers, so the shape is open. Reproduced verbatim; **needs the user's call**. Also **needs a call: labels are `3.85:1` on `ink` and fail AA** (`#7f7f7f` would reach 4.56:1) — inherited, not introduced. Two delivery mechanisms and two label weights split the same way across the five badges, i.e. two authoring sessions. Unticked: only the ≥1200 tier compared to a live screenshot. |
| 8 | `footer` | Footer + closing CTA | `Footer` | **`review`** | **Built** → [features/footer/](../features/footer/). ⚠️ **The closing CTA is a compact contact form as of 2026-09-22** (user request): tagline + reply line beside a 640px form at ≥1200, stacked below — all six `/contact` fields + consent, same `/api/contact`, shared `contactRules.ts`; new token `alert-dark`. Not yet viewed. CTA "Unlock financial AI for your firm" + demo button sits **inside** the footer block, as the inventory said. A **nested Framer component with its own tier-gating hashes** (`hidden-1leoyz4`/`16n7npo`/`d23fwj`/`1roolzl`) — re-derived, not reused. ⚠️ **Two of its five variants are never rendered and their CSS is a trap** — `framer-v-1cxbn18` declares a 2-up grid on the link row that looks like the tablet rule and is not. Divider is **two colours by tier** (`ink-soft/50` below 1200, `paper/10` at and above). Link hover is the site's **second measured transition** (`.3s cubic-bezier(.44,0,.56,1)`, colour only). **Three content differences between tiers**, all flagged: "Legal" ships at ≥1200 only, "Press" points at a mailto vs x.com, and the CTA has **no `href` at ≥1200** (the one deliberate deviation — ours uses the original's own `/demo` from its sibling variants). **Needs a call: `muted` titles/copyright are `3.85:1` on `ink` and fail AA.** **Map panel added 2026-08-11** (user request, ported from clix's own live site) as a fifth item in the link row, right-aligned — the one element here with no counterpart in the target. Keyless Google embed of Tel Aviv-Yafo at `z=12`; radius, filter, width and height all re-decided against this site's tokens rather than copied. ⚠️ Third-party embed, sets Google cookies, no consent gate anywhere on the site. **Link destinations decided 2026-08-16:** the Overview column's three hrefs all 404'd, so `Services` → `/product`, `Work` → `/#testimonials` (leading slash deliberate — a bare hash is a same-page scroll and would be inert on the other five routes), and **`Industries` was deleted rather than repointed** because nothing on this site is about industries. Its key came out of `ChromeDict` and both locale dicts too. **Structure now differs from the target by one link** — Overview carries two where the capture has three; the four-column grid and the gating are untouched. **Company column repointed the same day:** `Insights` → `/news`, and `Playground` → **`Security` → `/security`**, the footer's only LABEL swap — the real `פלייגראונד` is an interactive drag-and-drop node canvas with no analogue here, and `Security` was chosen because `/clix`, `/security` and `/news` were linked from this footer nowhere at all. Hebrew `אבטחה` is SOURCED (same string as `nav.labels[2]`). ✅ **Footer dead links 8 → 0 the same day** — `/privacy`, `/terms` and `/accessibility` were all built (see the legal-pages block below). Every link in this footer now resolves. ⚠️ **The remaining three are the whole Legal column, and they were NOT repointed on purpose** — no page here is a privacy policy and pointing at one that is not is worse than a 404. **All eight originally-dead links name real, captured pages** in `docs/reference/clixsolutions/pages/`, so Legal is a PORT of clix's own Hebrew copy (3 routes × 2 locales), not authorship. All three land on the styled 404 (below) meanwhile. |

## `/clix` — clone of `rogo.com/felix`

Started 2026-08-09. Capture: `docs/reference/target/rogo-felix-2026-08-09.html`.
Spec + all measured values: [features/felix-page/](../features/felix-page/).

⚠️ **Copy is rogo's verbatim by decision ("clone now, rewrite after") — not public-ready.**
⚠️ **Tier map collapses to three**: XL and desktop share every value on this page.

| # | Framer name | Status | Notes |
|---|---|---|---|
| 1 | `Hero` | **`review`** | **Built** → `src/components/clix/ClixHero.tsx`. Headline is three boxes, not one string; the rotating word sits in a **fixed-width** box (270/306px) so the row's centre never moves. 92/72/56px, `-0.06em`, `100%`, `forest`. Enter state measured exactly; hold/swap/exit estimated. ⚠️ Word list is **2 of an unknown number** — lazily-loaded code component, bundle grep and six live fetches both came up dry. Not visually diffed at any tier. |
| 2 | `Video` | **`review`** | Boxes measured (`128px 40px 80px`, gap 80, 16:9 container, mute-toggle button). Needs a video — rogo's is rogo's. `public/video/hero-clix.mp4` is a candidate. |
| 3 | `Logo Proof` | **`review`** | Boxes measured (`40px 40px 164px`, gap 108). 24 inline SVG logos; we have 14 vendored, 10 have no source. |
| 4 | `Manifesto` | **`review`** | Boxes measured (`164px 40px 64px`, gap 80; text column max-w **550px**, title max-w 300/240px; 48/40px title, 20px body at `-0.2px`/`140%`). **Blocked on the backdrop's scroll-driven colour** — the type is white and nothing static explains it. |
| 5 | `Product Visuals` | `blocked` | Boxes measured (`256px 40px 96px`, gap 80). Tabbed: Banking / Private Markets / Public Markets over Decks / Spreadsheets / Reports, on three 4000×2667 photos we don't have. |
| 6 | `Testimonial` | **`review`** | Boxes measured (`128px 40px 96px`, gap 80). Two opposed marquee rows, 5% edge mask, 320/420px cards. Probably also affected by the backdrop. ⚠️ **CONTENT REPLACED 2026-08-13 — this block is no longer a testimonial.** Its ten quotes were **fabricated endorsements** (rogo's real quotes reattributed to invented finance firms), the only actively misleading copy on the site; on the user's call they became **ten capability cards** describing what clix builds, and the heading dropped rogo's finance framing. **A payload swap, not a re-measure** — the card was already three slots (24px line / 14px ink caption / 14px muted caption) and a capability fits them as *job / surface / systems touched*, so no CSS moved. Component `ClixTestimonial` → **`ClixCapabilities`**, dict key `testimonial` → `capabilities`, section id → `#clix-capabilities` (**load-bearing** — `ClixBackdrop` queries it for the lower fade, and that selector is optional by design, so a half-done rename fails silently). ⚠️ The **Hebrew is authored and unread by a native speaker**, its line counts unverified, and the integration names are **generic placeholders** because clix's real stack is unknown. `robots: { index: false }` **left on deliberately** — this block was its stated reason, so lifting it is now cheap, but that is a launch call. |
| 7 | `CTA` | **`review`** | Boxes measured (`96px 40px`, gap 80; inner panel `400px` tall, radius 6, gap 32; title 80/72/56px). "Staff Felix today." + `Request Access`. |
| 8 | `Felix Footer` | **`review`** | Boxes measured (`96px 40px 80px`, tablet `64px 40px`, phone `128px 16px 40px`, gap 108). Slim — "by Rogo". |

## Page: `/news` (clone of `rogo.com/news`)

One-section page. Spec + memory in [features/news-page/](../features/news-page/).

| # | Section | Status | Notes |
|---|---|---|---|
| 1 | `Articles` | **`review`** | Built 2026-08-11 from a live fetch (no frozen capture). Hero (h1 88/72/64, subtitle 16 @ 540px balance, mailto button) + 5 filter pills (h-40, radius 28) + 3/2/1-col grid, gap 32. Content is a real 12-story AI digest (`newsItems.ts`) — cards link out to sources. **Card art rebuilt 2026-08-12:** rogo's grid is **three templates, not one**, so ours runs 5 typeset lockups (simple-icons CC0 marks via `NEWS_GLYPHS`) / 3 stat tiles (deterministic square field, seeded per tile at module scope) / 4 Pexels photographs with a floating white chip — declared per story, so a filter click no longer recolours a card the way the old `TILE[i % 4]` rotation did. ⚠️ simple-icons `riot` and `axios` are the **wrong companies**; read each file's `<title>` before using a mark. Never pixel-diffed. |

## Page: `/product` (clone of `rogo.com/product`)

Started 2026-08-11, complete 2026-08-11, committed `04595ef` 2026-08-12.
Capture: `docs/reference/target/rogo-product-2026-08-11.{html,css}`.
**Content pass 2026-08-12 on branch `product-content`: all copy is now clix's own and 17
borrowed assets are deleted.** `noindex` still stands, now for a different reason — Block 6's
placeholder quotes are attributed to real named clients. See `features/product-page/FEATURE.md`.

⚠️ **The earlier clone commit is on the PUBLIC remote.** `noindex` guards the rendered route, not the
repository — the three real-person photographs, the vendor marks and the certification
badges are public as source. Flagged for a deliberate call; see
`features/product-page/CONTEXT.md`.
Spec + all measured values: [features/product-page/](../features/product-page/).

⚠️ **Copy is rogo's verbatim by decision ("clone now, rewrite after") — route is `noindex`.**
⚠️ **Blocks 3 and 6 carry named third-party vendors and named real people.** User's call,
made against the risk; they must be replaced before this route is ever indexed. The `robots`
block in `src/app/product/page.tsx` is the guard.

⚠️ **The capture's `framer-v-*` variant classes are STALE — treat them as a hypothesis.** The
hero CTA is declared `framer-v-velzew` but hydrates to `framer-v-q741vz`, which moves its
corner brackets from `-22/-48` to `-12/-28`. Confirmed by computed style on the live page, not
by eye. This also relocated the stylesheet's only two real hover rules onto the hero CTA.
Related: **headless Chrome now HAS network egress**, contradicting the 2026-08-03 note in
[CONTEXT.md](CONTEXT.md) — live probing is available for runtime variants, computed geometry
and motion.

⚠️ **`#features` is ONE band containing five of the nine rows below.** Corrected 2026-08-11 by
probing the live render: it is 4024px tall at 1440 and 8138px at 1024, and its direct children
are `[Product]` (2a + 2b + 2d), `[Data Partners]` and `[Feature]` "AI That Learns…". Only
`Security`, `Testimonials` and `Footer` are genuine siblings of it. **Byte offsets give
document order, never nesting** — that mistake was made twice here before the live tree
settled it. `Workflows Scroller` likewise is not a block: it is feature 03's animation panel.

| # | Framer name | Status | Notes |
|---|---|---|---|
| 1 | `Hero` + `Product Preview` | **`review`** | **Built** → `src/components/product/ProductHero.tsx`. Two SIBLING blocks (`#first`, `#second`) in one `<section>` so the nav's theme scan stays contiguous. h1 `64/64/56/48`, `-0.06em`, 100%; subtitle `18/18/16/16` at max-w 540, `muted` by inline override of an `ink-soft` preset. 220×40 CTA with two 14×20 corner brackets whose **hover is measured** (slide in to `-2/-18`). 1280×440 media band (phone 380), full-bleed below 1280, `muted` ground under the video with a `mix-blend-overlay` vignette + flat `ink @15%`; four white `@20%` 1px rules, the two vertical ones held against the prompt field by its **load-bearing `max-width:550px`**. Prompt field is **decorative, not an input** — flagged as an open question. **Typed phrase list recovered IN FULL** from the site bundles (4 phrases, `typeSpeed: 30`) — notable because `/clix`'s equivalent never was. ⚠️ **VIDEO REPLACED 2026-08-13 — it is now the USER'S OWN footage**, an empty modern office with a slow drift and nobody in frame, supplied after two rounds of stock candidates were rejected as too busy ("something static not many happening"). It was rogo's own hotlink to Pexels 5941931 (glass towers) until then, i.e. public stock carrying no licensing question, and the replacement carries none either. Shipped 1280×720 / **2.3MB**, half its predecessor; the 4K master lives at `features/product-page/assets/` and NOT in `public/`, where it would ship 10.6MB for nothing. **25fps, not the house 30** — deliberate, since resampling would judder a slow drift. Watch item: it is the brightest clip this band has carried and the prompt card is white, so check the card on any future grade. New token `brand-green` `#135b45`. No animation library — both triggers checked and declined. Unticked: not diffed at **1024 or 390**; hold/delete/blink timings **estimated**; contrast not yet run. |
| 2a | `Features` intro | **`review`** | **Built** → `src/components/product/ProductFeatures.tsx`, which owns the whole `Features` **section shell** (bg `paper`, gap 120, padding `96/40` → `80/40` at tablet → `80/16` at phone — the vertical and horizontal steps happen at *different* breakpoints). Intro h3 is `44/44/40/32`, `-0.05em`, `110%`, balanced, and **left**-aligned — the only left-aligned heading on the page. Two-tone split is **one `<h3>` with an inner `<span>`**; two blocks would let the halves wrap independently and break the sentence across the colour boundary. No motion in the subtree. Matches the reference at 1440 (same break after "in the", same split at "Rogo"). Unticked: not diffed at 1024 or 390. |
| 2b | `Features` stepper | **`review`** | **Built** → `src/components/product/ProductStepper.tsx`. **Two genuinely different layouts, not one responsive tree.** ≥1200: `Restart Point` — a 768×541 image beside a 472×541 text column (gap 40), text column `space-between` so the title pins top and the stepper pins bottom; one panel at a time, auto-advancing, inactive rows at **opacity .5** (the only distinguishing property — no colour change), each with an absolute `Fill` bar sweeping width 0→100%. <1200: no `Restart Point` in the DOM at all — the four features **stack**, gap 48, all expanded, each a 36px header row + gap 24 + panel. **The image aspect changes by tier too**: 768/541 desktop vs **944/595** below — wider *and* shorter, not one box reflowed. Panel is 510×280 `surface` at radius **1px** (not 0, not 6), centred. **The badge is a square with a circle SUBTRACTED, painted `ink`** — what reads as a ring is four corner slivers; a `rounded-full` outline is a different shape. ⚠️ **2026-08-13: THE NUMERALS ARE GONE, THE BADGE IS NOT.** `01–04` were replaced by 16px line icons (grid / link / flow-nodes / speech-bubble) sitting in the circular cutout; the subtracted-square path and every row measurement are untouched, so this was a zero-layout change. The 16px box is **explicit** — the numeral was centred by its own line box and a boxless square icon fills the badge and overruns the slivers. The `01–04` strings survive as `STEP_KEYS` because they were never only display text: they supply `.length` for the advance modulo AND build the `key` that remounts a row to restart the `Fill` sweep. Title 28/110%/-0.02em; labels Inter 14/130%/-0.01em. Steps are `<button>`s with `aria-current` (original ships `<div>`s). `Fill` is a CSS **animation** with the row remounted via `key`, not a transition — an animation always starts at its `from`, so no hydration flag. ⚠️ **The four panels could not be measured — only the ACTIVE step's is ever mounted**, so capture and live probe both only showed 01; the other three were invented and rebuilt 2026-08-11 from user screenshots. **Step 01: the card AND its icon tile are STATIONARY; the labels step up through them, every row on ONE shared left edge so the travel is purely vertical**, with only the glyph inside the tile swapping. Took four passes. Two misreadings caused them: the muted labels are **not centred** (three labels of different lengths share a left edge and merely look balanced), and the icon tile belongs to the **card**, not the row — in the row it mounted/unmounted and dragged the label sideways. Deviations on the user's call: **1800ms** pace (original ~1000ms) and **one green tile** (original tints per source; its “Real-time Web” glyph is blue). ⚠️ Its keyframe travel is **hardcoded `-62px` and must match `ROW_H`**: parameterising it with a custom property made the `to` invalid and the strip moved nowhere while still rendering. Advance is a `setTimeout` keyed on `active`, not an interval, so a manual pick resets the clock. Unticked: timings **estimated** (5200ms step, 7500ms strip); backdrop is a **substitute**; not diffed at 1024/390. |
| 2c | `Workflows Scroller` | **`review`** | **Built** → `src/components/product/WorkflowsScroller.tsx`. ⚠️ **NOT a top-level block** — it is feature 03's animation panel inside the stepper and only renders while that step is active; the earlier inventory row was an artefact of reading byte offsets as structure. Two opposed ticker rows carrying the ten `Shortcut Card` labels verbatim. Reuses `.clix-marquee`; **cards carry `margin-right`, not `gap`**, or the -50% loop tears. Tile shape corrected 2026-08-11 from the user's reference — **86px tiles with a glyph on its own line above the label**, not the pills-with-a-dot first built. Speeds 38s/46s are **estimated**. |
| 2d | — (`Streamline & Automate`) | **`review`** | **Built** → `src/components/product/ProductWorkflows.tsx` + `workflowMocks.tsx`. **Three shapes, and the middle one is the surprise:** ≥1200 = 3 columns with the card a **column** (art over text); 810–1199.98 = 1 column, gap 32, card a **row** (art beside text, measured 944×579); ≤809.98 = 1 column, card back to a **column** (358×625). A plain "stack below desktop" rule gets the tablet tier wrong. Section gap **64**; card gap 32; art box 411/521 at every tier; cards `place-self:start`. Title 44/44/40/32, capped at 512px from 1200 up and **uncapped below**; card title 28/110%/-0.02em `ink`; body 16/130%/-0.01em `muted`. **The three panels are DOM rebuilds of rogo's three 922×1040 product-UI JPGs**, measured off the bitmaps with `sharp` and scaled by a container query (`--u = 1cqw / 8.206` = one source pixel) so a DOM tree scales like a bitmap instead of reflowing. Mock 2 runs off the right edge on purpose — it alone is `object-position: left center`. Body type is **36 source px**. Substituted: rogo's logo chip → `brand-green` tile with `ClixMark`. ⚠️ **CARD 3 REPLACED 2026-08-13** — was "Reports On Demand" over a slide-deck-and-exports mock (with PowerPoint/Excel icons redrawn as lettered badges); that is the TARGET's product, not clix's, so on the user's call it became **"Answered Or Handed Over"**: a WhatsApp thread the assistant handles and then hands to a named person when a discount is requested. Cards 1–3 now read plumbing → querying → customer-facing. **The mock is built around the handoff, not the answer** — `handoffReason` is copy, not decoration. Geometry untouched (same artwork, crop and two-card stack), so it is a content swap, not a re-measure. **It mirrors for free**: the bubbles are `Box`es on `inset-inline-start`, so rtl puts inbound right and the assistant left, which is what a Hebrew thread looks like. Bubble text is `whitespace-nowrap` and hand-fitted at ~16 units/char — English binding, Hebrew shorter. New tokens `mock-panel`/`mock-line`/`mock-fill`. Diffed side-by-side against the source JPGs at 1440. `paper` on `forest-deep` is 15.59:1 AAA. |
| 3 | `Data Partners` | **`review`** | **Built** → `src/components/product/ProductDataPartners.tsx`, inside `ProductFeatures.tsx` as a sibling of `[Product]`. "Trusted Data" + a 640-wide intro over a 13-tile grid, gap 16. **Columns go 3 → 2 → 2, not 3 → 2 → 1** — the phone tier keeps two columns and shrinks the tile from 416×80 to 171×48 (padding `8 16 8 8`, gap 12, graphic 32, label 14/1.1em). Block padding `48px 0`, `0` on phones; block gap 32; radius 0 throughout. Tile fill `surface`@40%, rule `mark`@10%, glyph square `mark`@20%; glyph is ~52% of its square. ⚠️ **The rule is an OVERLAY, not a `border`** — the original paints it with `[data-border] ::after`, which takes no layout space; a real border moved the label 1px and made the phone tile 50px instead of 48. **Every measured value diffed against the live page at 1440/1024/390 and identical**, block height included (721/900/613). Contrast: `ink` on tile **17.65:1**, `muted` on paper **4.74:1**. Eight provider marks vendored to `public/logos/product/` (5 rasters, 2 SVGs given the `viewBox` they omit, and PitchBook decoded out of an inline data-URI); the 5 line glyphs are inlined path data. Deviations: label face Martina Plantijn → Discovery, label `rgb(23,23,23)` → `ink`, glyph stroke `#44403C` → `ink-soft`. ⚠️ **This block is why the route is noindex** — 8 vendor trademarks with logos; replace before indexing. |
| 4 | `Benefits` | **`review`** | **Built** → `src/components/product/ProductBenefits.tsx` + `benefitArt.tsx`, the last child of `#features`. "AI That Learns How Your Firm Thinks and Works" (a hard `<br>`: line 1 `ink`, line 2 `muted`, so the break IS the colour boundary) over a card grid, gap 16, 1 → 2 → 3 columns. ⚠️ **SIX benefits, not four** — a byte-slice of the capture reads as four; the render has six. **Card height is one rule, not three numbers:** every card is `aspect-ratio: 0.788044` (the same ratio 2d’s art boxes use), which is why 416→528, 464→589 and 358→454 all agree. Card `surface`, radius 0, padding `24 16 16` (`16` on phones); h6 28/110%/-0.04em/500; description 14/130%/-0.01em `muted` in a **fixed 84px well pinned to flex-end**, which keeps 1– to 4-line bodies on one baseline. **Art: one vendored, five rebuilt.** Integrations is vendored (`public/product/benefit-integrations.svg` — third-party product logos, no rogo branding); Custom-Trained Models and Single Tenant Deployment are rebuilt because they carry rogo’s mark; Prompt Library and Governance are rebuilt as rogo product UI; Guided Implementation is rebuilt **and deliberately off-palette**, replacing a photograph of an identifiable real person. Twenty measured values diffed against the live page at 1440/1024/390 — all identical except the block height at 390 (2916 vs 2915, grid row snapping). ⚠️ **2026-08-13: EACH OF THE SIX ARTWORKS NOW CARRIES ONE IDLE LOOP** (user's ask, and explicitly *not* a card-level scroll reveal). Eight `@keyframes` in `globals.css`, CSS only — no GSAP and no `"use client"`, because `ArtPrompts` and `ArtGovernance` read the dictionary server-side. Transform/opacity only. **Every keyframe's base state IS this measured static design**, so the global reduced-motion clamp is an exact no-op rather than a degradation: two frames 2s apart under `prefers-reduced-motion` are byte-identical and show the full artwork; three frames without it are all distinct. Two consequences worth knowing: card 1's glyphs are now `text-ink` at `opacity: .6` and the render did **not** move (ink over white at 60% composites to `#737373` = `muted` exactly); and card 2's marquee `-50%` is a seamless loop only because its track is explicitly `2 × 9 × 38 = 684` units, holding two copies on the source pitch. Card 5 needed a `[dir="rtl"]` `transform-origin` rule — there is no logical keyword and the bar is placed with `inset-inline-start`. ⚠️ **Needs a call: the six 14px descriptions are `muted` on full-strength `surface` = 4.35:1 and fail AA** (`#717171` reaches 4.50). Inherited from the original, and the same pair passes next door in Block 3 only because those tiles are `surface` at 40%. |
| 5 | `Security` | **`removed`** | ⚠️ **DELETED FROM THIS ROUTE 2026-08-13** on the user's call — component and `product.security` (both locales) gone; recover from git if ever wanted. Home's `sections/Security.tsx`, the `/security` route and the shared `public/badges/practice-*.svg` are untouched. Everything below is the record of what it WAS. ~~**Built** → `src/components/product/ProductSecurity.tsx`.~~ ⚠️ **NOT a reuse of home's `Security` — they are different sections.** A **white** section wrapping an `ink` **card** (max-w 1280, 618px tall and a row at ≥1200; a column with gap 32 and pad 28/24 below), left column = icon+label · two-tone 44/40/32 heading (`muted` → `paper` mid-heading) · 4-item list · "Find out more"; right column = a **2 × 2 dashed** `#ffffff26` badge grid (296×261 → 444×240 → 1 column of 310×220 at `aspect-ratio 1.40909`), label absolute 16px off the bottom-left, 104px mark centred. ⚠️ **The one structural trap: the "Find out more" link lives INSIDE the title/list container, not beside it.** As a third sibling the left column's `space-between` puts the heading **64px too high** at 1440 — and it looks fine. Numbers caught it, screenshots would not have. Two more tier traps: list `align-items` is centre at ≥1200 *and* ≤809 and flex-start **only** at 810–1199; the link is `min-content` except ≤809 where it is 100%. **36 values × 3 tiers diffed against the live page — every geometry value identical**; the only survivors are two text widths from the Discovery swap and `gap:normal` vs `0px`. Rules are an **overlay span**, not a `border` (same reason as Block 3). Icons inlined from the capture's defs; GDPR needed its own `gdpr-product.svg` (121×120) because home's is a different 102×102 asset. "Find out more" points at `/#security` — this site has no `/security` route. ⚠️ **Ships SOC2 / CCPA / ISO 27001 / GDPR verbatim on the user's "copy everything 100%" call — the exact set removed from home on 2026-08-05 because SOC 2 and ISO 27001 are audited certifications clix does not hold. Replace before indexing; `sections/Security.tsx` holds the drop-in.** Badge labels are `muted` on `ink` = **3.85:1, fails AA** (inherited). |
| 6 | `Testimonials` | **`moved`** | ⚠️ **LEFT THIS ROUTE 2026-08-13** on the user's call — it is now the landing page's testimonial treatment, `src/components/sections/QuoteCarousel.tsx`, and its copy moved to `home.testimonials`. ✅ **The six real quotes landed 2026-08-13 and it is LIVE.** The switch in `sections/Testimonials.tsx` is DERIVED from whether the strings are non-empty, because a render flag could not guard them (`PageDictProvider` ships the whole namespace in the RSC payload — measured, 7 leaked hits); it stays in place as the failure mode, not as scaffolding. Copy is the clients' own Hebrew, verbatim in `he/home.ts`; `en/home.ts` carries translations written in-repo and is the one thing still awaiting the user's read. `phoneLeadQuote` was **deleted** (the capture's slot-1-differs quirk has no counterpart in real copy) and `quoteDesktop` **re-fitted** to the real counts — 32px moved off slot 1 onto adir and achituv; phone card 1 normalised `h-[505px]` → `h-[334px]`, a documented divergence since that height existed only to hold the longer lead quote. The `<section>` wrapper did not travel; home owns the chrome and the `<h2>`. All measurements below still hold. ~~**Built** → `src/components/product/ProductTestimonials.tsx`.~~ ⚠️ **The capture is wrong about every moving part of this block.** It shows 3 slides, both arrows `disabled` at `opacity:0`, and `object-position: left center`. Sampling the LIVE track transform every 250ms for 23s: **12 slides** (3 + clones), **autoplay every 6.0s**, **it loops** (−7725.6 → −3864.0 in a single frame at t=17.68s — the clone snap), **arrows never disabled**, and the portrait crop is **`50% 50%`**, a visibly different part of the frame. The capture's values are the pre-hydration state. Step is **1288px** = 1280 container + 8px gap over **~1.1s**, 46% of the distance inside 250ms — a JS spring, so `cubic-bezier(.25,1,.5,1)` @1100ms is a **fitted** stand-in and the block's only approximation. **Method note: check for autoplay BEFORE measuring any click** — the first probe read a "Previous" as moving two slides when autoplay had simply fired during the wait. Three subtrees in the original → two here: ≥1200 and 810–1199 differ only by the 360×694 photo column, so they are one component with one `hidden` div. ≤809 could NOT be collapsed — **two** testimonials not three, **Patrice's quote is different copy** ("is going to transform" vs "transforms"), Patrice is first there and second everywhere else, own paddings (`24` / `32 24 24 24`) and gaps (`20`/`80`), no photos, no arrows. Section 914 tall (`124 40 96`), 959 at phone (`0 16 96`); card pad 48 gap 80; quote **32px Patrice / 36px the other two** at ≥1200, 28 at tablet, 20 at phone, all 1.3em at letter-spacing **0**; role 14/1.4em **uppercase** `muted`; company mark a 200×20 frame at **0.7** opacity. New token `bone` `#f5f2eb` (DESIGN-SYSTEM.md had it as never-applied — corrected). ⚠️ **Autoplay REMOVED on the user's call 2026-08-11** — built and measured first (6.0s cadence), so this is a recorded divergence, not a gap; verified off by 90 samples over 23s showing one distinct track position. Knock-on: autoplay was what re-aligned an off-grid drag, so arrows and a committed flick are now the only things that do. ⚠️ **It is also DRAGGABLE and it does NOT snap** (user-reported, then measured): the track follows the pointer **1:1**, a release after a slow drag **stays where you dropped it** (six held releases 40–340px all settled at exactly the dragged distance, none changed slide), a **flick** commits exactly one slide, and the grid is restored by **the next index change, not the release** — the following autoplay tick moved 1288−60 / 1288−340, landing back on an exact multiple. Commit is therefore velocity-driven, not distance-driven; the rule `|dx + v×0.15| > 30%` of a slide (velocity zeroed after 80ms idle) is **fitted** and reproduces all three cases. Ours matches the reference on all three, one drag per fresh page load. **Two probe traps worth remembering: velocity from a single event pair is wrong (browsers coalesce moves and can share a timestamp), and a multi-trial drag probe contaminates itself once a trial leaves the track off-grid.** **25 values × 3 tiers — ALL MATCH.** ⚠️ **Three named real people, their firms, their quotes and their photographs ship verbatim** — the strongest claim on the page; replace before indexing. Roles are `muted` on `bone`/`surface` = **4.24 / 4.35:1, fail AA** (inherited). |
| 7 | `Footer` | **`review`** | **Reused** — `src/components/sections/Footer.tsx`, unchanged. The footer subtree in the /product capture is byte-identical to the home capture's: same `.framer-8dt5bh-container`, same `.framer-qd34j7` link class, same "Unlock financial AI / for your firm", same four link columns. The one block the plan called correctly. |
| — | **page order** | **`review`** | ⚠️ **THE SUB-1200 REORDER IS GONE AS OF 2026-08-13** — it existed only to flip `security` against `testimonials`, and both blocks left the route. `<main>` is a plain block again and the `order-*` classes are deleted. The page is now **Hero → Features → Footer**. Re-verified after the change at 1600/1440/1024/390: zero horizontal overflow, `data-nav-theme` still contiguous end to end (no gaps, so the nav never falls back), every control keyboard-reachable with a visible ring. Historical record follows. ~~**The sections are not in DOM order below 1200.**~~ `#features` order 1, `#testimonials` order 2, `#security` order 3 at both sub-1200 tiers; unset (source order) above. So **security sits above testimonials on desktop and below them on tablet and phone**. `<main>` is `flex flex-col` for that reason alone and the two components carry the `order-*` classes. Verified in the rendered DOM at 1600/1440/1024/390 — the flip lands exactly at 1200. Page-wide: zero horizontal overflow at all four tiers, `data-nav-theme` contiguous end to end (no gaps, so the nav never falls back), every control keyboard-reachable with a visible ring. |
| 7 | `Footer` | `todo` | **Reuse** the site `Footer`. |

## Page: `/security` (clone of `rogo.com/security`)

Started and complete 2026-08-12, on `dev` (no feature branch), built with 4 parallel agents one
file each. Capture: `docs/reference/target/rogo-security-2026-08-12.{html,css}` — 374 KB HTML,
**five** inline `<style>` blocks.
Spec + all measured values: [features/security-page/](../features/security-page/).

✅ **NOT `noindex` — the first cloned route to ship without the guard**, and deliberately so.
All four gate items that hold `/product`, `/company` and `/careers` are clear: no third-party
trademark, no certification clix does not hold, no real person quoted, and every string is
clix's own from the first commit. `/news` is the precedent. Do not add a `robots` block as part
of unrelated work.

⚠️ **PRACTICES, NOT SEALS** (user's call). The target's compliance grid ships SOC2 / CCPA /
ISO 27001 / GDPR / EU AI Act — two of them **audited certifications clix does not hold**, and
the exact set removed from home on 2026-08-05. The five cells carry home's own practice
statements and its five `practice-*.svg` marks instead, and **the heading moved with them**
("Compliant With / Industry Standards" → "Built On / Practices We Keep"), because none of these
is a standard anyone certifies. `sections/Security.tsx`'s standing instruction applies here too.

⚠️ **THREE BANDS, NOT FOUR.** "Security At Our Core" reads as a fourth section and is the
**second direct child of `#features-1`**, separated from the badge grid by that band's own 120px
gap. Probed on the live DOM before anything was built — the same mistake `/product` made twice
by reading byte offsets as nesting. It is why `SecurityCore` is not a `<section>`. The target's
fourth Framer band, `Reiteration`, is inside `Footer` here as it is there.

⚠️ **THE WHOLE PAGE IS `ink`**, which no other route is. All four `[data-nav-theme]` regions
declare `dark`, so the nav bar is solid ink from the first pixel to the last.

| # | Framer name | id | Component | Status | Notes |
|---|---|---|---|---|---|
| 1 | `Hero` | `#first` | `SecurityHero` + `SecurityTerminal` | **`review`** | ⚠️ **The target's height is `70vh`; OURS IS NOT, as of 2026-08-13** — the target sums 198 + 302 + 80 = 580 inside a 630px band at a 900px viewport, and ours is `min-content` at every tier: **996 / 996 / 952.41 / 905.19**, measured and closing exactly. See the terminal row below for why. h1 `88/72/64`, 95%, `-0.06em` except phone `-0.05em` — the same preset `/careers` and `/news` carry. Subtitle 18/16 at 130% in the new `paper-soft`. CTA is the **Inverted** variant (white fill, ink label) and its `<a>` is **220 × 36 inside a 220 × 40 frame**, unlike `/careers`' which fills its frame. Brackets `dx −28 / dy −12` at every tier — a **third independent measurement** of `/product`'s and `/careers`' numbers. ⚠️ **The first headline failed the diff**: "Your Data Never Leaves You." sets 3 lines at 390 and cost 60.79px; seven candidates were measured live before "Your Keys. Your Data." was chosen. |
| 1b | — (**ours**) | inside `#first` | `SecurityCanvas` + `MockWindow` + `SecurityConsole` + `SecurityTerminal` | **`review`** | ⚠️ **THE ONE THING ON THIS ROUTE THAT IS NOT A CLONE.** Added 2026-08-13: the user's boss saw [kiro.dev](https://kiro.dev/) and asked for "coding effects, since it is the security section". A monochrome terminal-window mock — 720 × 320 at ≥810, 358 × 288 at phone — as the **second child of `#first`**. ⚠️ **Revised the same day into an ENDLESS ROLLING AGENT FEED** after the user compared it to kiro again ("ours after the animation it's static but in kiro it's continuously coding"): six visible rows over a pool of twelve security checks, advancing one row every ~1.3s forever, command `clix audit --watch`. **Status is derived from POSITION and carried by FILL, not hue** — hollow `muted` ring = queued, `paper-soft` disc = done, pulsing `paper` disc = running — because kiro colour-codes its feed and this site has no palette to spend. Seven rows rendered, six visible; viewport `calc(6 * 1.6em)` is exactly six rows at BOTH type tiers (measured 6.002 / 6.003). Travel is **measured off a live row, not hardcoded** — the failure `ProductStepper`'s `rows-up` keyframe documents and cannot avoid. Loop **pauses off screen**; `paint()` reuses seven nodes forever rather than appending. ⚠️ **THIRD PASS added a SECOND WINDOW and DRAGGING** ("in kiro both are dragable in the canva"): a **900 × 440 run console** behind the terminal at (280, 260), a **1000 × 580 composite**, and `#first` = **1256** at ≥1200. Chrome extracted to `MockWindow`. **1000 is sized against 1200** — content row 1120, 60px of air per side — and the band is `overflow-hidden`, so anything wider is clipped, not scrolled. ⚠️ **Only ≥1200 moved**: 1199 / 1024 / 390 are still 952.41 / 952.41 / 905.19, because the console and the drag share one breakpoint (three panes at 358px are unreadable; a drag surface fights touch scroll). GSAP `Draggable` is free in the installed 3.15.0; bounded to `#first`, eases home on release, verified by a real CDP drag. ⚠️ **`bounds` as the STRING `"#first"` took the whole client tree down** — `useGSAP({scope})` scopes selectors to the subtree and `#first` is an ancestor, so Draggable read `undefined.nodeType`; SSR still served the id, so it read as a hydration bug. Use `closest()`. ⚠️ **No shadow** — the site has none anywhere, so occlusion carries the depth, which is what finally activates that section's 96px `gap-24` (inert since the block was built, and kept then on the note that "the next thing added to this section will expect it"). ⚠️ **It costs the page's two headline findings** and both are in the deviations table: **"no motion" is now a claim about the TARGET only** (`data-framer-appear-id` is still 0 there; the other three blocks stay motionless), and **`#first`'s `70vh` is gone** — the band is `overflow:hidden`, so a 320px window inside a frozen 630px box holding 580px of content would have been 270px of clipped window, not a smaller window. `heroH` is therefore **removed from `security-diff.js`'s `BODY`**; that harness walks `Object.keys(refValues)` and has no skip list, so an excluded key has to be absent. ⚠️ **No new token and no new colour** — kiro is lavender-purple with syntax-coloured terminal text and this site is monochrome by rule, so only the FORM came over (window chrome, monospace, dot-matrix banner, live output). `muted` carries **only** the traffic dots, the dot-matrix art and the two line markers — non-text decoration at 3.53:1, clear of WCAG 1.4.11's 3:1 — and is deliberately kept off every readable string, so **this block adds no sixth AA failure** to the five already inherited. **English + `dir="ltr"` in both locales** (user's call); nothing here reads the dictionary. Whole window is `aria-hidden`, since every claim it prints is real prose in the Compliance band below. ⚠️ **One bug caught by measuring rather than looking:** the typed span was `w-max` and came out **650.06px against 242.27px of text**, stranding the caret ~400px past the command in exactly the two states with no animation to hide it (JS off, reduced motion). Width is now derived from `COMMAND.length`, the same expression the tween animates to. A screenshot could not have caught it — the span is `overflow-hidden`, so the excess is invisible empty space. ⚠️ **Log copy is not yet signed off by the user**, and FEATURE.md open questions 1 and 2 bear on it. |
| 2 | `Benefits` | `#features` | `SecurityBenefits` | **`review`** | Six items, 3 → 2 → 1 columns, gap 40 → 40 → 32, uniform rows 185 / 182.39 / 150.39. Item gap steps **64 → 32** at the phone tier, which is most of why that row is 32px shorter. ⚠️ **Every title is 1 line and every body exactly 2, at every tier** — the rows are uniform, so a 3-line body moves all six; all twelve strings were pre-fitted by rendered line count before the build. Six 36 × 36 line glyphs inlined from the capture's defs, `fill="white"` → `currentColor`. Card 6 replaces rogo's "Audited & tested", which is the same class of claim as the SOC 2 seal. |
| 3 | `Compliance` row 1 | `#features-1` | `SecurityCompliance` | **`review`** | Two-tone centred h2 (**one element; the `<br>` IS the colour boundary**, paper span over the h2's own `muted`) over a 5 → 2 → 1 grid, gap 0, cells 240 tall at ≥810 and `aspect-ratio: 1.40909` at phone. ⚠️ **The rules are a dashed `::after` overlay, not borders** — a real border takes layout space and moves the 104px mark 1px, the exact bug `/product` Block 3 shipped. ⚠️ **The matrix is ragged and not derivable**: at 390 cell 3 draws `0/1/0/1`, no top *and* no bottom, while cell 4 draws all four. Reproduced verbatim; it also **disagrees with home's grid on cell 4**, which is genuine divergence between two separately-probed pages. Both corner marks are **the same 21 × 33 SVG**, BR at `rotate(180deg)`, hung 5px outside the grid. |
| 4 | `Compliance` row 2 | — | `SecurityCore` | **`review`** | Not a section: the band's second child. Row + gap 64 at ≥810, column + gap 24 below; left column `flex:1 0 0` capped 450 → 280 → none. ⚠️ **The body is ONE `<p>` with two `<br/>`** — the blank line between the paragraphs is a real line, and two `<p>`s with a margin is a different measurement. ⚠️ **`Explore security portal` is dropped** (user's call; rogo's points at `trust.rogo.ai`), measured first at 190.06 × 32 so it is on record. |
| 5 | `Reiteration` + `Footer` | — | shared `Footer` | **`review`** | **Reused unchanged.** The target keeps its closing CTA inside the footer, exactly as ours does. |
| — | verification | | | **`review`** | **Block-diff `ALL MATCH` at 1600 / 1440 / 1024 / 390 — 60 keys per tier**, as run on 2026-08-12. ⚠️ **NOT re-run after the terminal landed on 2026-08-13** — it needs the live target, and `heroH` left `BODY` that day, so the set is 59 keys now; our side of every remaining key was re-measured directly and is unchanged. Re-measured 2026-08-13 at all four widths on **both** `/security` and `/he/security`: hero **996 / 996 / 952.41 / 905.19**, window 720 × 320 / 358 × 288, longest log row clears the body's inner edge by 357.88px at ≥1200 and **49.61px at 390**, zero horizontal overflow, four nav-theme regions still contiguous at 0.00, and the terminal reports `direction: ltr` inside a `dir=rtl` document. Reduced motion verified: caret `animation-name: none` at opacity 1, every row at opacity 1. Build clean (13 routes, `/security` prerendered), `tsc` and `eslint` clean on the new files. Four nav-theme regions contiguous with every gap 0.00; zero horizontal overflow; one focusable in `<main>` with a visible ring; outline h1 → h2 → h3. ⚠️ **The band delta is TWO terms**: −64px at every tier from the dropped link, plus −20.79 at 1024 and −20.80 at 390 from **one line of our own paragraph**. Page totals then reconcile from exactly three terms — those two plus the shared `Footer` being +43.8px / +234px taller than rogo's, the pre-existing `FooterMap` difference. ⚠️ Five 14px labels are `muted` on `ink` = **3.85:1, fail AA** — inherited, the same failure open on four other routes, needs one token change to close them all. |

## Locale: Hebrew + RTL (`/he/*`)

Started 2026-08-12, on `dev` (no feature branch, at the user's instruction).
Spec + all measured values: [features/i18n-rtl/](../features/i18n-rtl/) ·
build-wave contract: [docs/i18n-agent-contract.md](i18n-agent-contract.md).

**Not a clone of anything.** There is no Hebrew rogo.ai, so this locale is **not held to the §6
fidelity bar** and cannot be diffed against the target. Its bar is correctness: no horizontal
overflow at the four tiers, nothing clipped, uniform grid rows still uniform within 0.5px
(assertable *without* an English reference — the strongest check available here), colour-boundary
headings still breaking where the colour changes, contrast AA, keyboard reachable. **The English
side, by contrast, is held to zero regression and it is provable** — the logical-property
migration is a computed-style identity transform.

✅ **Most of the Hebrew is a RESTORATION, not a translation.** `docs/reference/clixsolutions/` is
the user's own site, `lang="he" dir="rtl"`, with **no English version** — 20,169 Hebrew characters
across 11 pages. `Hero.tsx:13-23` and `Footer.tsx:164-173` both document that their English was
rendered *out of* that Hebrew.

⚠️ **STRUCTURAL FACTS THAT WILL BREAK THE BUILD IF FORGOTTEN.** `src/app/layout.tsx` is
**deleted**; there are now TWO root layouts, `(en)/layout.tsx` and `he/layout.tsx`. **Never add
`src/app/not-found.tsx`** — without a root layout Next injects its builtin one for `/_not-found`,
and a custom file stops that injection and makes the build **exit 1**. `[[...locale]]` is not an
option: `validate-app-paths.js` throws E913 for a segment after an optional catch-all.

| # | Piece | Component / file | Status | Notes |
|---|---|---|---|---|
| 1 | Locale core | `src/lib/i18n/*` | **`review`** | `Locale`/`Direction`/`dirSign` + path helpers (**24 unit assertions**; `localeHref("/#x","he") === "/he#x"` is load-bearing — the slash collapse is what keeps `AppLink`'s same-route-hash guard matching). Two access seams: a `cache()` request store for the 34 server components (**no default — it throws**, so a read before the seed is a build failure, not a Hebrew page rendering English) and a React context for the 23 client ones. **No server component was converted to client; no `locale` prop is drilled.** |
| 2 | Route split | `src/app/{(en),he,_routes}/**` | **`review`** | Route groups, **no middleware**. Bare English URLs survive by construction. **20 routes, all statically prerendered** (13 before). A `[lang]`+rewrite was rejected on evidence: Next sets `x-nextjs-rewritten-path`, so `usePathname()` can return the internal path — and both `LocaleToggle` and `ViewTransitions.tsx`'s commit resolver depend on it. |
| 3 | Toggle | `ui/LocaleToggle.tsx` | **`review`** | A single link to the other language, in all three Nav layouts. **A dropdown is impossible, not merely undesirable** — four ancestors are `overflow-hidden`. `h-9` keeps `--nav-row-h` (74/70px, which `/clix`'s `spacer` reads) unmoved. Accessible name **is** `עברית` on a `lang="he"` element (WCAG G81) — ⚠️ do not add an English `aria-label`. A **plain `<a>`, deliberately not routed through `AppLink`**: a view transition across a root-layout boundary would leave the promise unresolved and fire the 1500ms failsafe on a *working* nav. |
| 4 | Shared chrome | `{en,he}/chrome.ts`, `Nav`, `Footer`, `FooterMap`, `ModelTicker` | **`review`** | Nav labels + CTA + footer groups/links/tagline/copyright + a11y, both locales, provenance marked. ⚠️ **Footer tagline sets 2 lines in Hebrew, 3 in English** (4 on phone) — the real phrase has one comma and does not split three ways; `tagline` is typed `readonly string[]` for exactly that. Ticker's `→` is **isolated, not mirrored** — its own comment says the glyph replaces the words "in"/"out", so mirroring inverts the meaning. |
| 5 | Direction infrastructure | `globals.css` | **`review`** | `clix-marquee-rtl` (`+50%`, the mirror) + `[dir="rtl"] .clix-marquee`; `clix-marquee` byte-identical. ⚠️ **`.clix-marquee` is now load-bearing in the cascade** — renaming it or moving it off the animated track silently reverts the Hebrew strip to LTR. Empty `[dir="rtl"]` hook for Hebrew tracking; **values deliberately unset** (see open questions). |
| 6 | Page copy ×7 + direction pass | `{en,he}/{home,product,security,company,careers,news,clix}.ts` + their components | **`review`** | 8-agent wave, one owner per file, **all landed**. **400 EN / 433 HE strings; 82 SOURCED, 141 AUTHORED.** English proven a no-op by byte-diff (home's `<main>` 75055→75056, the +1 being `text-left`→`text-start`). ⚠️ **The agents corrected the brief eight times and were right every time** — three client/server labels, GSAP's already-correct sign, the `mr-*` loop claim, `/product`'s badge set, and two of my predictions. ⚠️ **Two agents measured the same string at 131.6 and 156.9px and BOTH were right** — home's label is 12px, `/security`'s is 14px. A width is meaningless without its type spec. ⚠️ **Equal grid-row heights do not prove uniform content** (`align-self:stretch` absorbs a short body); assert heights AND per-card line count. **Not yet seen by a Hebrew reader.** |

**Two real bugs caught before shipping:** `AppLink`'s same-route-hash test would have gone
locale-blind and crossfaded the document over a mere scroll; and `ClixFelixFooter.tsx:138`'s SVG
wordmark would have **vanished** in RTL — `direction` inherits into SVG, where `text-anchor:start`
means *inline*-start, so the 2034-unit word lands outside its viewBox. Not a font problem.

✅ **Discovery already covers Hebrew** — fontTools: 51 codepoints, all 27 base+final letters, full
niqqud, maqaf/geresh/gershayim/sof-pasuq, shekel, `wght 100–800`. **No font vendored**, closing the
question parked at `fonts-discovery.css:47` since 2026-08-03. ⚠️ **Inter has ZERO Hebrew**, so a
Discovery 404 drops Hebrew to the OS sans — the existing fallback rationale does not hold here.

⚠️ **Open, and each needs the user:** the Hebrew fallback face · negative letter-spacing on Hebrew
(hook in place, empty) · `metadataBase`/`hreflang` deferred (the production origin is recorded
nowhere in this repo) · **`/he/news` is publicly indexable while carrying translated third-party
headlines**, where `/news` ships without a `robots` block *because* those headlines were verbatim ·
**`/he/clix` must keep `noindex`** (its fabricated quotes read as *more* credible in Hebrew) · the
`noam-tovi` / נווה דודי caption conflict becomes reader-visible in Hebrew.

## Page: `/contact` — **NOT A CLONE**

Built 2026-08-13. The first route in this repo with no rogo original: rogo has no contact page,
so there is no capture, no `data-framer-name` and nothing to diff against. The reference is a
different kind of thing — `docs/reference/clixsolutions/pages/contact.html`, the user's OWN live
site — and it supplied the field list, the placeholders, the `required` flags, both pill
vocabularies and both pill groups' ARIA semantics, but **no pixels**. The visual design is ours
at the user's explicit instruction. Acceptance here is a consistency test, not a fidelity one.

| # | Block | Status | Notes |
|---|---|---|---|
| 1 | `ContactHero` | **`review`** | **Built** → `src/components/contact/ContactHero.tsx`. Dark band, `data-nav-theme="dark"`. Eyebrow + a 48/44px display h1 at −0.05em with one `paper` emphasis run against `paper-soft`. `pt-[198px]` is CompanyHero's own fixed-nav clearance, reused not re-derived. Eyebrow raised `muted` → `paper-soft` on 2026-08-17, closing a documented AA failure (3.85 → 11.84). ⚠️ **It briefly carried the contact channels on 2026-08-17 and no longer does** — they went to the footer the same day, on the user's call. This band is therefore DELIBERATELY sparse; the emptiness was called out in review and traded away knowingly. Do not invent filler for it. |
| 2 | `ContactBody` | **`review`** | **Built** → `ContactBody.tsx`. ⚠️ **Redesigned 2026-08-17:** `bg-paper` → **`bg-bone`**, and it is now just the band — the two-column row moved into `ContactForm`, because the success state has to swap the form out while leaving the rail standing. Still `data-nav-theme="light"`, still a server component. ⚠️ **Must never gain `overflow-hidden`** — it would become the sticky rail's scroll container (the bug that broke /company Block 3) and clip the panel's `shadow-float`. |
| 2a | `ContactChannels` | **`review`** | **Built** → `ContactChannels.tsx`, **renamed from `ContactAside.tsx` 2026-08-17.** Four rows — email, WhatsApp, hours, location — from `src/lib/contact.ts`, the same map Footer reads. Was a 300px sidebar: weightless beside a 1400px form, ~196px of dead gutter at desktop, and four full-width rows wedged between hero and form below 1200. ⚠️ **It now renders in the FOOTER**, via `Footer`'s new `closing` prop, replacing the reiteration CTA on this route only — see `ContactRoute.tsx`. All colours are for the dark ground **including the focus ring** (`ring-forest`/`offset-paper` → `ring-paper`/`offset-ink`). |
| 2b | `ContactForm` | **`review`** | **Built** → `ContactForm.tsx`, the only client component and the only real form on the site. ⚠️ **Needs and budget pill groups REMOVED 2026-09-22** (user's call) — two steps now: About you, then the brief. ⚠️ **Gained a REQUIRED `phone` field 2026-08-18** — a departure from the reference, forced by the n8n workflow, which cannot WhatsApp a lead without a number. It sits THIRD in group 01 so the required fields lead, and carries `dir="ltr"` because `+` is bidi-neutral and RTL reordering would move it to the wrong end. ⚠️ **Redesigned 2026-08-17** — owns BOTH columns now: a sticky brief-rail (`calc(var(--nav-peak-h) + 16px)`) and one white `shadow-float` panel on `bone`. Groups read as numbered STEPS with 28px chips that complete, a 2px progress bar and a character counter. **Two new tokens** `signal`/`alert` replace the monochrome error state, where an invalid underline was the same `ink` as focus. ⚠️ **`w-px flex-[1_0_0]` is RETIRED, not re-gated** — there is no `max-w` cap left for it to serve. |
| — | `Footer` | **`review`** | **Reused** unchanged. Keeps `id="contact"` although nothing points at it any more. |
| — | `POST /api/contact` | **`review`** | **Built** → `src/app/api/contact/route.ts`, the project's SECOND route handler (`api/models`'s "only route handler" header is now stale). ⚠️ **TWO DELIVERY CHANNELS since 2026-08-18**, each gated by its own env var and run concurrently: nodemailer over Gmail SMTP to `info@clix-solution.com`, and a POST to the n8n workflow `Clix Main Website - Form Submit` (`J1UDMNjKeiaQs7AD`) that files the lead in the CRM and WhatsApps them. **A failure in any ENABLED channel fails the request** — no green tick on a lead nothing received. **No channel enabled → 500**, never a quiet `{ok:true}`. **`CONTACT_GMAIL=off`** silences mail without touching credentials or code — used for one afternoon on 2026-08-18 and removed; both channels are on. It must never be set in Vercel. Honeypot, 3-per-10-min best-effort rate limit, HTML escaping, CRLF-stripped headers, duplicated validation. **`nodemailer` is the first runtime dependency this project has ever added.** |

⚠️ **Nobody has looked at this page.** Build, lint, typecheck and every API path are verified;
no visual check at any width, no Hebrew RTL check, no browser keyboard walk-through. That is the
whole of what stands between `review` and `done` — see
[features/contact-page/FEATURE.md](../features/contact-page/FEATURE.md).

⚠️ **Nobody has looked at this page, and that is STILL true after the 2026-08-17 redesign.**
Build, lint and typecheck are clean, both routes return 200, and the rendered HTML was inspected
for the two known landmines (the 1px-wide form, and the Hebrew RTL markup) — both clean. But there
has been **no visual check at any width, in either language**, and no browser keyboard
walk-through. That is the whole of what stands between `review` and `done`.

⚠️ **The footer's closing CTA is REPLACED on this route** (2026-08-17). Every other page ends with
"Software that works, results that speak." over a `Let's start` button — which points at
`/contact`, so on `/contact` it pointed at the page you were already reading. `Footer` gained an
optional `closing` node prop and `ContactRoute` passes `<ContactChannels />`. The prop takes a
NODE, not a route name or a flag, so `Footer` never learns what `/contact` is.

⚠️ **All eleven site CTAs were repointed here** on 2026-08-13, from `#contact` (the footer
anchor), `/#contact`, `#clix-contact` and one `mailto:`. Six were raw `<a>` and are now
`AppLink`. If you are looking for why a hero button no longer scrolls, this is why.

## Other pages

Still **not scoped** — see the open question in [PROJECT.md](PROJECT.md).

`Customers` · `Log in`
(`News` and `Product` left this list 2026-08-11, `Company` and `Security` on 2026-08-12 — all
built above. `Careers` left it on 2026-08-12 too, was built, and was **removed whole on
2026-08-13** at the user's request; it is not coming back to this list unless asked for.
`Contact` was never on this list at all — it is not a rogo route; it was added on 2026-08-13
because the site needed somewhere for its CTAs to land.)

## Page: /company

Started and complete 2026-08-12, on `dev` (no feature branch, at the user's instruction).
Capture: `docs/reference/target/rogo-company-2026-08-12.{html,css}`.
Spec: [features/company-page/FEATURE.md](../features/company-page/FEATURE.md).

**Design cloned 1:1, content clix's from the first commit.** Unlike `/product` this page was
never built with the target's copy in it, so no third-party logo, founder name or staff
photograph ever entered the repo and there is nothing to strip later.

⚠️ **`noindex`**, for a thinner reason than `/product`'s: every string is already clix's own
and the four-item gate is clear. It is guarded pending two answers, both the user's — whether
the "Unit 8200 and Technion" credential is substantiable, and the placeholder photograph in
Block 5. One line lifts it.

⚠️ **Six bands, not five** — ~~six~~ **FOUR as of 2026-08-16**, see the notes under the table.
`Video` is a sibling of `Hero`, not a child.

| # | Framer name | Component | Status |
|---|---|---|---|
| 1 | `Hero` | `CompanyHero` | `review` |
| 2 | `Video` | `CompanyHero` (same file) | `review` |
| 3 | `Mission` | `CompanyMission` | `review` |
| 4 | `Team` → eight services | `CompanyServices` + `ServiceReel` | `review` ⚠️ **REBUILT THREE TIMES — measured tile grid → 8-card grid (2026-08-16) → sticky stack (2026-08-17) → REEL (2026-08-17, same day).** Now one sticky FRAME with three tracks — names · detail · the eight scenes — sliding on one `--reel-i`; layout brought by the user (*"we can use this layout but keep the current cards"*). **The scenes, their step maps and the process player crossed both rebuilds unaltered** — `serviceArt.tsx` untouched — because `Stage` already capped a scene at 560px and the old art well already hit that cap, so a 52% column renders every scene at exactly its previous size. Each scene still assembles in the order its service works, holds 3s, dissolves, repeats. **Deleted with the stack:** `ServiceStack.tsx`, `.service-stack` + four `--stack-*`, the recede, the band's only `scrub:`, and `flowTop()` (≈180 lines) — the reel's scroller is not sticky, so ScrollTrigger measures it honestly. **Came back:** `kicker` as the caption over the live scene, and a position counter in the frame's rail (the eight-tick rail stays deleted). Names are real `<button>`s and passed items sit at 0.15 opacity, both divergences from the reference, which is keyboard-unreachable. Unticked: **not yet looked at in a browser** — `--reel-step` (56/52/46svh) and `--reel-detail-h` (a fixed window that CLIPS a long Hebrew promise) are the two numbers most likely to move; seven of eight `SERVICE_STACKS` rows are still invented; scene 2's chat prose is English in both locales. |
| ~~5~~ | ~~`Investors` → twelve tools~~ | ~~`CompanyTools`~~ | **DELETED 2026-08-16** |
| ~~5~~ | ~~`Reiteration`~~ | ~~`CompanyCareers`~~ | **DELETED 2026-08-16** |
| 5 | `Footer` | shared `Footer` | `review` |

⚠️ **BAND 5 IS ALSO GONE (2026-08-16).** User: *"remove this part in company"*, pointing at
"Join The Team Building / What Comes Next". Removed **whole** — headline, paragraph and the
full-bleed photograph — because the copy was what identified the band and a headless photograph
under no heading is a different block, not a smaller one. `company.careers` went from both
dictionaries (4 keys each, all Hebrew ones AUTHORED, so Hebrew SOURCED moved 34/47 → 30/39).
**`public/company/company-bg.jpg` is still on disk and now referenced by nothing** — left there
deliberately, since deleting a user-supplied asset is its own call.

⚠️ **THIS CLEARED ONE OF THE TWO `noindex` GATE ITEMS AS A SIDE EFFECT.** The stock photograph
standing in for a team picture was gate item 2; only the unsubstantiated "Unit 8200 and
Technion" line remains. **The guard has NOT been lifted and nobody has been asked.**

**So /company is four bands now, down from six**, and both deletions were the user's call on the
same day. The page closes on the services cards.

⚠️ **BAND 5 IS GONE AND BAND 4 IS NO LONGER A CLONE (2026-08-16).** The user asked for a "huge
ui update" here, naming the `#services` band on `clix-main-page.vercel.app`
("פתרון מותאם לכל עסק.") as the reference — a sticky heading beside cards, each carrying an
animation that presents what the service means.

`CompanyTools` was **deleted outright**: it was rogo's `Investors` logo wall reused as clix's
twelve tools, sitting directly beneath the services logo wall — the same shape saying less.
Component, route wiring and the `tools` key in both dictionaries all went. `clix/toolMarks.tsx`
survives untouched; /clix's `ClixLogoProof` still renders all twelve.

`CompanyServices` went from rogo's **measured 4 → 4 → 1 grid of 164px tiles** to a **sticky
heading column beside a 2-column grid of eight cards**, each with a mark, a numbered kicker, the
service name, a 280×168 animated scene, and a one-line promise. **Its measured geometry is
therefore GONE, not mislaid** — what survives verbatim is the band's outer box (`bone` ground,
`96/64px` padding, `40/16px` gutter, `--container-max`) and the two type presets, which three
other bands on this page share. This is the only block on the route that can no longer be
diffed against the capture; it is judged on taste now, not fidelity.

⚠️ **SEVEN OF THE EIGHT SCENES AND ALL 24 NEW COPY STRINGS ARE SOURCED**, which is what made the
rebuild cheap and honest: `docs/reference/clixsolutions/content.json` (`services.bodyText`)
already describes a distinct UI mock per service — the `Agent OS` roster, the WhatsApp thread,
the `CRM · Q3` board, the `new-lead.workflow` node chain, the `98 PSI` browser, the
`dashboard.tsx` editor, the `78 ai ready` scorecard — plus a numbered benefit kicker and a
promise for all eight. **Mobile Development is the exception**: the capture describes no artwork
for it, so that one scene is designed from the service's own bullet list and is the band's only
invented picture. Hebrew SOURCED count went **18/31 → 34/47**, all sixteen new strings verbatim
— the kickers had been *deliberately* omitted before, because the label-only tiles gave them
nowhere to go without adding English copy to a route whose English render had to stay still.

⚠️ **THE SCENES CARRY NO PROSE, SO ALL EIGHT ARE LOCALE-FREE.** Everything sentence-shaped is a
grey bar; only machine tokens (`POST /lead`, `dashboard.tsx`, `98`, `1.2s`) are set as type,
each `direction: ltr` so it reads correctly on /he. **Not one new dictionary key.** It also
avoided porting the real site's chat mock, which is a stock template in someone else's business
("2 kurtas", "Rs.1200"). The reference band does the same for three of its four arts — and two
of those four do not animate at all.

⚠️ **MOTION IS THREE SHARED CSS KEYFRAMES, NOT EIGHT BESPOKE ONES** — `service-step` (31
elements), `service-pulse` (5), `service-rise` (6). The reference uses framer-motion, **which is
not installed here** (`package.json`: `gsap` + `@gsap/react` only), and this repo already had
the answer in /product Block 4's idle loops. The departure from that precedent is the sharing:
/product's six each animated a different mechanism, whereas these eight all animate a sequence
advancing through a list, so one staggered `service-step` covers roster rows, chat bubbles, flow
nodes, page blocks, app screens, code lines, pipeline stages and score rows alike — and sharing
is what makes eight very different pictures read as one band. The base-state invariant is
inherited verbatim (overlays rest at `opacity: 0`, so the unanimated scene is the finished
picture), which keeps the global reduced-motion clamp an exact no-op. Opacity and `translateY`
only — Y because it is the one axis that does not flip under RTL, so unlike `.benefit-bar` these
need no `[dir="rtl"]` companion.

Other decisions: sticky offset `top: 96px` is **`why-rogo`'s existing value**, not a new number;
`desktop:self-start` is load-bearing (a stretched flex item has no travel to stick in); the card
column lands at **~304px, four pixels off the 308px tile it replaces**; cards **grow rather than
clip** (`min-h-*` in a stretched grid — a deliberate divergence from /product's aspect-fixed
benefit cards, affordable because this grid is 2 × 8 and that one is 3 × 6); card radius stays
**0** against the reference's 8px, because this site's scale is `--radius-none` / `--radius-pill`;
`serviceGlyphs.tsx` was **kept**, its eight marks moving to 20px in the card header, as the one
constant across eight dissimilar scenes; and `EYEBROW_CLASS` is now **exported from
`CompanyMission.tsx`** rather than a second preset being authored.

Unticked: **nobody has looked at it.** Build, lint and a two-locale render parse are clean, but
there is no render at 1600 / 1440 / 1024 / 390, no sticky check against the fixed nav, no RTL
eyeball and no in-browser reduced-motion pass. Line counts for the sixteen new kickers and
promises are unmeasured in both locales — they cannot clip, but they can look wrong. **Card 08
prints the same sentence as both its kicker and its promise**, reproduced from the real site
rather than "fixed"; that is an open copy question. The eight English kickers and promises are
authored translations of the sourced Hebrew and have not been read by the user.

⚠️ **BAND 6 LOST ITS CTA ON 2026-08-13 AND NO LONGER MATCHES THE TARGET AT TWO TIERS.** The
"See Careers" button pointed at `/careers`, which the user deleted the same day; it was removed
rather than repointed, because this repo's own rule (Nav.tsx) is that an unresolved slug aimed
at some other destination is "a wrong destination dressed up as a working link". Losing the
36px button and the column's 24px gap takes **60px** out of that column:

| tier | before | after | why |
|---|---|---|---|
| ≥1200 | 316.8 | **316.8** | unchanged — the row is `items-end` and the TITLE column (124.8) already set the height; the shorter column beside it never did |
| tablet | 348.8 | **288.8** | the column WAS the height |
| phone | 372.8 | **312.8** | the column WAS the height |

**This is a deliberate divergence from the capture, not a regression** — the target has a
careers page to point at and this build does not. Everything else on the band (the empty 20px
eyebrow slot, the `items-end` rule, the full-bleed photograph) is untouched.

**Every OTHER band height matched the target to 0.00px at 1600 / 1440 / 1024 / 390** when the
page was built, and `<main>` totalled exactly 4497.16 at 1440 and 6451.88 at 390. Verified with
a before/after harness, not by eye. ⚠️ **Those two `<main>` totals are now 60px short at 1024
and 390** for the reason above; the per-band figures for bands 1–5 and 7 still hold.

⚠️ **The document is still 43.8px taller at 1440 and 234px at 390, and none of it is this
page.** The whole delta is the shared `Footer`, which is that much taller than rogo's on every
route. Pre-existing, almost certainly `FooterMap.tsx`'s map embed, which rogo's footer has no
equivalent of. Not fixed here.

## ~~Page: `/careers`~~ — **REMOVED 2026-08-13**

> ⚠️ **THIS PAGE NO LONGER EXISTS.** The user removed it whole on 2026-08-13 ("also remove the
> whole careers route and page"): both routes, all three components, both dictionaries, the
> eight carousel photographs, the nav slot, the three `@theme` tokens, and `/company` Block 5's
> "See Careers" button — the last link into it from anywhere on the site.
>
> **Everything below is kept as the MEASURED ARCHIVE, not as a status board.** Read the
> statuses as *what was true on 2026-08-12*, not as work in flight. Nothing here is `todo`,
> and nothing here should be picked up.
>
> **To rebuild it**, take the components from the commit before the removal — the whole page
> restores as one revert. The `#roles` band it had already lost is one step further back, in
> `bbf10b1`. The three retired colours are in
> [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) → "Added 2026-08-12, RETIRED 2026-08-13".
> Detail and reasoning: [features/careers-page/CONTEXT.md](../features/careers-page/CONTEXT.md).

Started and complete 2026-08-12, on `dev` (no feature branch, at the user's instruction), built
concurrently with `/company` in a separate session. Capture:
`docs/reference/target/rogo-careers-2026-08-12.{html,css}` — 577 KB HTML, **six** inline
`<style>` blocks, 581 `data-framer-name` nodes.
Spec + all measured values: [features/careers-page/](../features/careers-page/).

✅ **THE COPY IS CLIX'S OWN as of 2026-08-12**, in a second pass the same day (user: *"in the
career section, lets personalize it now, with the headers and subheaders, for the jobs i will
follow up later"*). Hero h1 **`Join us in engineering the core of next-generation software.`**
(the user's own sentence), About h3 `Automating The Work` / *`Nobody Should Be Doing`*, both
About paragraphs, roles h2 `Where You Come In`. The rest is written from `ClixManifesto.tsx` and
`docs/reference/clixsolutions/`, not invented. **This is the first page on the site to complete
the "clone now, rewrite after" cycle.**

⚠️ **TWO BLOCKS CHANGED HEIGHT, AND BOTH BLOCK-DIFFS STILL SAID "ALL MATCH".** They compare
computed style and box geometry, never text, so a copy edit is invisible to them. **After a copy
edit on a cloned page, a green diff proves nothing about height — probe line counts separately.**

| | Target | Ours | Cause |
|---|---|---|---|
| `#hero` | 529 / 529 / 479 / 585 | **613 / 613 / 479 / 707** | the user's h1 is 60 characters against rogo's 44, so it sets 3 lines at ≥1200 and 6 at 390 instead of 2 and 4. Chosen verbatim over four measured 33-to-42-character alternatives, with the ceiling and its cost stated first. **1024 did not move.** |
| `#about` | 352 / 343 / 471 | **329 / 343 / 430** | our first paragraph sets in 3 lines at ≥1200 where rogo's set in 4; 18px × 130% = 23.4px ≈ the delta. |

Neither was tuned away. Padding sentences out to hit a height the target got from *different
sentences* would make the measured spec a fiction. **The h1 ceiling is 44 characters** and that
number is measured, not assumed: eight candidates rendered through `Range.getClientRects()` at
1440 and 390, everything ≤ 44 giving 2 lines / 4 lines and 45 breaking the phone tier. The roles
h2 was capped at 17 for the same reason (40px inside 358 less 32 of padding). ⚠️ **The h1 also
breaks mid-hyphen** ("next-" / "generation") and there is no clean fix at 390 — `nowrap` on the
compound is a ~480px unbreakable run in a 358px viewport, which `overflow-hidden` would clip.
Dropping the hyphen is the only fix; flagged to the user, left as written.

⚠️ **THE `#roles` BAND AND THE HERO CTA WERE REMOVED** later the same day (user: *"remove
this section we dont need job offering for now also remove the see career button"*). The page is
**Hero → Gallery → About → Footer**. The CTA went with the band regardless of the ask: its only
job was `href="#roles"`, so keeping it would have left the page's sole call to action pointing at
a dead fragment. **The band's full measured spec is retained** in FEATURE.md, and
`careers-roles-diff.js` is kept with a warning header — both describe the *target*, and
re-deriving them means re-probing a live site. Components restore from commit `bbf10b1`.

⚠️ **The removal's real risk was the nav, not the layout.** `#roles` was the page's ONLY
`data-nav-theme="dark"` section, so the light → dark handover now happens at the Footer.
Re-probed at all four tiers: `hero > gallery > about > contact`, `light > light > light > dark`,
**every gap 0**. If the band ever returns it must go back *between* `#about` and `<Footer>`.

⚠️ **`#hero` is now 529 at ≥1200 — the target's number, and it means nothing.** The target is
529 with a 2-line headline plus a 44px gap and a 40px button; ours is 529 with a 3-line headline
and no button, and +83.6 and −84 cancel to within a pixel. **Two unrelated changes summing to
zero. Never read a matching number as fidelity without the arithmetic behind it.**

⚠️ **`noindex` IS NOW UNJUSTIFIED AND STILL IN PLACE — the one open decision on this route.**
Both original reasons are gone: the copy is clix's own, and the invented job rows left with the
band. The photographs were never part of the guard. It is kept **deliberately**, because lifting
it makes the route publicly indexable and that is the user's call, not a side effect of deleting
a section. Removing the `robots` block is a one-line change.

⚠️ **The photographs are already clix-safe.** The original's eight identifiable-staff photos were
replaced with neutral Pexels stock chosen on a "no clear frontal face" rule (user's call). That is
**licence compliance, not just liability hygiene**: Pexels bars using photos of identifiable people in
ways implying endorsement, and a careers carousel implicitly captioned *our team* does exactly that.
**The same reasoning applies to `/product` Block 6**, which still ships three photographs of real
people — a licence question there, not only a taste one.

⚠️ **This capture's structure is a hypothesis, not a fact — FOUR SSR-vs-hydrated divergences.**
(1) the CTA hydrates `framer-v-velzew` → `framer-v-q741vz`; (2) the row's dashed rule computes to
`border-bottom: 0px none` and is painted on `::after`; (3) the row `<a>` gains an extra wrapper, so its
3 children become 1; (4) the filter pills and the job rows **share `data-border="true"`** — 83 matches
inside `#roles`, pills first. Two of the four broke the block-diff before it ran green.

| # | Framer name | Status | Notes |
|---|---|---|---|
| 1 | `Hero` (`#hero`) | **`review`** | **Built** → `src/components/careers/CareersHero.tsx`. ⚠️ **Copy is the USER'S OWN sentence** (`Join us in engineering the core of next-generation software.`, 2026-08-12) at 60 chars against rogo's 44, so **height is 613/613/479/707, not the target's 529/529/479/585** — 3 lines at ≥1200 and 6 at 390. Every other value in the block is the target's and the diffs still pass; see the page note above. `198px 40px 80px` (phone `198 16 80`), gap 96; `Text & Button` gap **44 → 24** below 1200, phone `max-w 360`; title box max-w 960. h1 `88/88/72/64`, `-0.06em` (phone `-0.05em`), 95%, centred, balanced. 220×40 CTA `href="#roles"` with two 14×20 brackets at **−28/−12**, hover −18/−2 — byte-identical to `/product`'s, so `ProductHero.tsx`'s components ported unchanged. **No subhead** — proved by arithmetic, not assumed: `198 + 2×88×0.95 + 44 + 40 + 80 = 529` closes the measured height at 1440, and the same sum closes at 1024 and 390. |
| 2 | `Gallery` (`#gallery`) | **`review`** | **Built** → `CareersGallery.tsx` + `careersPhotos.ts`. **Native scroll-snap, not a JS track** — `overflow-x:auto`, `scroll-snap-type:x mandatory`, `scroll-snap-stop:always`; drag, momentum and snap are the browser's, so unlike `/product` Block 6 there is no spring to fit. **Slide widths are fixed px at EVERY tier** (385/721/389/605/389/389/688/791 × 516, `scrollWidth` 4469) — confirmed twice, by the `sizes` attribute and by a four-tier live sweep. ⚠️ **Slot 5 is a 2572×1714 LANDSCAPE in a 389×516 portrait box** — the original crops it to its centre half; a `w=` sized off the box width delivers 1×, not 2×, because cover scales by height there. **No autoplay** (30 s of samples, one distinct position), **no loop**, Prev edge-disables, **Next never does**. Arrow step = `scrollBy(±clientWidth)` + native snap, chosen by scoring **five** candidate rules against 13 measured transitions (9/13, best; my hand-derived rule scored 5/13 and was arithmetically impossible). **At 390 nothing snaps on either side** — every slide is wider than the 358px snapport. |
| 3 | `About` (`#about`) | **`review`** | **Built** → `CareersAbout.tsx`. Copy is **clix's** (2026-08-12): h3 `Automating The Work` / *`Nobody Should Be Doing`*, two paragraphs from ClixManifesto + clixsolutions. ⚠️ **The only block whose height moved: 329/343/430 vs the target's 352/343/471**, because our p1 sets in 3 lines at ≥1200 where rogo's set in 4. Every CSS-controlled value is unchanged; do not pad the copy to hit 352. Two columns at ≥1200 (row, max-w 1280, gap 64, title col `flex:1 0 0; width:1px; max-w 490`), one column gap 24 below. h3 `44/44/40/32`, `-0.05em`, 110%, balanced — **one element**, and the `<br>` IS the colour boundary: line 1 `ink`, line 2 `muted`. ⚠️ Not "…Smartest Analyst / On Wall Street", which is the natural misreading. Body `18 → 16`, `-0.02em`, 130%, `ink`; the two paragraphs are separated by **`margin-top:20px`**, not a flex gap. ⚠️ Ships `id="about"` — the original's is literally **`about™`**, and its text container's `data-framer-name` is a stale paragraph of *security* copy. Ignore layer names on this project. |
| 4 | ~~`Careers` (`#roles`)~~ **REMOVED** | **`review`** | **Built** → `CareersRoles.tsx` + `careersOpenings.ts`. Server component. `80px 40px 160px → 80 40 → 64 16`, gap 72; container max-w 1280 gap 40 (32 phone). h2 is **clix's** `Where You Come In` (2026-08-12), capped at 17 chars because that is what fits on one line at 390. Eyebrow = 8×8 `signal-green` dot + `{ROLES.length}` + `open positions`, gaps 10/8. h2 `56/56/48/40` `surface`. Group h4 `36/36/28/24`, **110% at ≥1200 and 1.2em below**. Divider is `aspect-ratio:1120` → **1.141px** at 1280. Row 72 tall, `24px 0`, rendered gaps 16/16/16, rule on `::after`. ⚠️ **Reduced to 3 roles with NO filter pills** (user's call); the 11 pills' measured values are recorded in FEATURE.md as "measured, deliberately not shipped". ⚠️ Index is `muted` on `ink` = **3.85:1, fails AA** — inherited, shipped as measured, **needs the user's call** (`mark` = 5.36:1). |
| 5 | `Footer` | **`review`** | **Reused** — `src/components/sections/Footer.tsx`, unchanged. |
| — | verification | **`review`** | **Both block-diffs ALL MATCH at 1600/1440/1024/390** — 18 carousel keys and 38 roles keys, every tier. `npm run build` clean, eslint clean, `tsc` clean. Five `data-nav-theme` sections contiguous (all gaps 0), zero horizontal overflow at every tier, focus order CTA → track → Prev → Next → 3 rows. **One deliberate functional divergence: `scroll-mt` on `#roles`.** The target has no `scroll-padding-top` anywhere, so its own `#roles` CTA lands the band at top 0 with **113px buried under its fixed nav** — probed, not assumed. Ours clears it (115/119px). `scroll-margin` never affects rendered layout, so the diffs stay valid. |

## Order of work

1. **Design system first** — [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) is seeded with the
   target's real tokens, and they are wired into the `@theme` block of
   `src/app/globals.css`. ✅ done 2026-08-02
2. **Shell** — `nav` + `footer` + page container, so every later section lands in real context.
3. **Sections top to bottom**, one at a time, each fully done before the next.
4. **Global pass** — cross-section spacing rhythm, scroll behavior, responsive sweep.

## Blocked / open

| Slug | Blocker | Needed from |
|---|---|---|
| all | Next.js app not yet initialized | Next task |

**Resolved 2026-08-02 — fidelity policy is 1:1.** Fonts and logos are no longer blockers:
the real `.woff2` files (57) and the real customer logo SVGs (14) are vendored under
[public/](../public/). Nothing on this page gets substituted or redrawn.

## Page: 404 (`not-found`) — no clone target

Added 2026-08-16. **The site's first page with no counterpart in the target OR on the real clix
site**, so every string and every value in it is this repo's own. Spec + all borrowings:
[features/not-found/](../features/not-found/). Copy in `src/lib/i18n/{en,he}/notFound.ts`.

⚠️ **No reference exists and none can be captured**, so `FEATURE.md` replaces the measure-don't-
eyeball rule with a **borrowing table** — every value traced to a section that WAS measured, and
a value that cannot name a source does not belong on the page. No new tokens.

| # | Section | Status | Notes |
|---|---|---|---|
| 1 | `not-found` | **`review`** | One `ink` band (`data-nav-theme="dark"`, `min-h-svh`) — 14px `muted` "404" label over a 44/48px `<h1>` and a back-home button reusing the footer CTA's internals verbatim. Nav and Footer are the shared ones. **Two Next.js findings, both measured against `next start` and both worth knowing before touching any route file:** (1) **a per-locale `not-found.tsx` is an error boundary, not a route** — it catches `notFound()` calls in its own segment and NEVER an unmatched URL, because only a root `app/not-found.tsx` does that and this app cannot have one (no root layout at `src/app/`; see the warning in `(en)/layout.tsx`). With both not-found files in place `/services` still fell through to Next's built-in 404. The fix is `(en)/[...notFound]/page.tsx` + `he/[...notFound]/page.tsx`, catch-alls that exist only to call `notFound()` and turn "no route matched" into a boundary hit. Static routes still win over catch-alls, and route handlers (`/api/*`) and metadata routes (`/icon.png`) resolve ahead of the page tree — all three checked. (2) **a not-found render does not get its locale root layout** — both locales serve `<html id="__next_error__">` with no `lang`/`dir`. The body and `<title>` localise correctly, which is why this was invisible in English and **laid the Hebrew out LTR**: every `[dir="rtl"]` rule and `rtl:` variant on this site is an ancestor selector. Fixed by a `display:contents` wrapper inside the body carrying `lang`/`dir` — no box generated, so fixed-position Nav and `min-h-svh` behave as under a real layout. **(3) A not-found render also never reaches Next's SCROLL RESET** (found 2026-08-16 from the user's report that the page opened in its own footer). A CDP probe over four navigations shows the failures are the two whose DESTINATION is a 404 — origin and footer both irrelevant: the stale offset simply CLAMPS to the new document's max (4130 → 596, that page's exact scroll height), and a short page's max IS its footer. Fixed by `ui/ScrollToTopOnRoute.tsx`, rendered by this route ONLY — it would fight `ScrollAndFocusHandler` and break back/forward restoration on any normal route. Keyed on `pathname` not mount, `behavior:"instant"`, and placed as a child so it precedes the view transition's `resolve()`. ⚠️ **The three Hebrew strings are AUTHORED and unread by a native speaker.** Unticked: never looked at in a browser at any tier — verified by status code, RSC payload and CDP scroll numbers only. |

## Pages: `/privacy` · `/terms` · `/accessibility` — the company's own documents, not clones

All three added 2026-08-16 at the user's request. **Not rogo routes and not measured against one** —
the copy is ported verbatim from clix's own published documents
(`docs/reference/clixsolutions/pages/{privacy,terms,accessibility}.html`, each re-checked against
its live page the same day). **Six routes, ONE shared component pair** (`components/legal/`) behind
the `LegalDoc` shape in `src/lib/i18n/legal.ts`; section slots are `lead` → `items` → `tail`,
because the accessibility statement's §06 puts paragraphs on both sides of a list. Spec, the
borrowing table and all the flags: [features/legal-pages/](../features/legal-pages/).

⚠️⚠️ **THE ACCESSIBILITY STATEMENT PROMISES FOUR THINGS THIS BUILD DOES NOT DO** — a
skip-to-content link (none exists), WCAG AA contrast (six documented failures in this repo's own
docs, one of them on that very page), screen-reader testing (never done), and live regions for a
chat (there is none). It is a declaration under Israeli regulation 35 / ת״י 5568 and **names a real
person** as responsible. Reported in plain terms before the port; ported verbatim on the user's
instruction. **Two of the four are cheaper to make true than to amend** — see the FEATURE.md.

| # | Section | Status | Notes |
|---|---|---|---|
| 1 | `privacy-hero` | **`review`** | Dark band, `data-nav-theme="dark"`, every value borrowed from `ContactHero` (`pt-[198px]`, 14px `muted` eyebrow, 44/48px `<h1>`). Last-updated line is `paper-soft` not `muted` — it carries information found nowhere else on the page, so it does not get the eyebrow's sub-AA treatment. |
| 2 | `privacy-body` | **`review`** | Light band, ten numbered sections + closing line. ⚠️ **THIS IS A LEGAL INSTRUMENT — do not reword anything.** Hebrew is the SOURCE (`he/privacy.ts`), English a machine translation. ⚠️ **It shipped under an on-page note that the Hebrew governs and the user had that note REMOVED the same day**, so the two routes now present as equally authoritative versions of one legal document with nothing on either page resolving a conflict; `he/privacy.ts` is still the source and still right by construction. Its absence is a decision — do not re-add it without asking. ⚠️ **The contact details are `{email}`/`{phone}` PLACEHOLDERS, not literals** — the published policy prints the stale `info@clixsolution.com` four times as the channel for exercising a statutory data right, so the page substitutes `CONTACT_EMAIL`/`CONTACT_PHONE` from `src/lib/contact.ts`; `interpolate()` is not used because these must be anchors. ⚠️ **`items` vs `paras` is an editorial split, not the source's** — the original is `<p>` throughout with no `<ul>`, and the enumerations were separated so a screen reader announces them as lists; it changes no word. Render order is items-then-paras and **section 06 is the only one that depends on it** (two rights, then a procedural note). ⚠️ **THREE POLICY STATEMENTS DO NOT DESCRIBE THIS BUILD** and were reported rather than patched: a phone number is listed as collected (no phone field on the form), statistical measurement is claimed (no analytics exists on this site), and Google is not named as a processor although the footer's map sets its cookies with no consent gate. Indexable, no `robots` guard — the content belongs to the company it is about. Unticked: never looked at in a browser; Hebrew unread by a native speaker; **English translation unreviewed by a lawyer**. |

## Site-wide: analytics (Umami)

Started 2026-09-27. Spec, event list and decisions: [features/analytics/](../features/analytics/).

**Not a section and not a clone of anything** — visitor numbers for the business, read at
cloud.umami.is and (planned) in a Clix-CRM tab. No fidelity bar; its bar is that the numbers are
real and readable by a non-technical reader.

| # | Slug | Piece | Status | Notes |
|---|---|---|---|---|
| 1 | `analytics` | Tracker + click events + "Form sent" | **`review`** | **Live since 2026-09-27, counting since PR #22** — the first deploy (#20) counted nothing because the bare host now 308s to `www.` and `data-domains` listed only the bare host. Umami's side proven with a replayed pageview; a real browser visit not yet seen. Counts only on the live host (`data-domains`). Own document click listener instead of `data-umami-event`, which forces a full page load on links. |
| 2 | `analytics` | CRM Analytics tab | **`todo`** | Needs the Umami share URL. Lives in the Clix-CRM repo, not here. |
