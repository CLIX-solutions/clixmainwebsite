/**
 * Clients — "Companies we’ve worked with", the band directly under the hero on /.
 *
 * NOT A CLONE. rogo has no counterpart; this took the slot `<Testimonials />` vacated on
 * 2026-10-26 (user: "we will change it to company we worked with"), and the spec is direction 5,
 * "Columns", of the five boards the user was shown that day. features/clients/FEATURE.md.
 *
 * A SERVER COMPONENT, AND THE MOTION IS PURE CSS. Every lane is a vertical marquee: its track
 * holds THREE copies of its tiles and `.clients-lane` (globals.css) slides it by exactly one copy
 * per loop. Nothing is measured at runtime — the period is fixed by the tile height and the 12px
 * gap, which is what the `- 4px` in that keyframe is for.
 *
 * ⚠️ THE SPEED IS KEPT WELL UNDER THE TOOL STRIP'S 30px/s, deliberately. That strip sits right
 * above this band at the bottom of the hero, and it was slowed from 50 on 2026-08-19 because the
 * moving strips "make us dizzy". These lanes run 15–19px/s at desktop and slower below it (same
 * durations over shorter tiles). It is also why there is no horizontal marquee here: a second
 * left-scrolling strip directly under the first would only echo it.
 */

import { getDict } from "@/lib/i18n/server";

/**
 * THE FOURTEEN, as the user supplied them in client-logos/ (2026-10-26), cleaned to transparent
 * PNGs by features/clients/assets/prep_logos.py. Company names are trademarks, so — like
 * LogoCarousel's tool names — they stay here and stay Latin in every locale; only the band's own
 * copy lives in `home.clients`.
 *
 * `w`/`h` are the DESKTOP display size, printed by features/clients/assets/vendor_logos.py. Each
 * mark gets the same visual AREA (h = √(8200 / aspect), clamped to 168×74) rather than the same
 * width — at equal widths Mediora and Stonecrest, both ~3.3:1 wordmarks, dwarf every stacked
 * emblem. Smaller tiers scale them by `--logo-s`. The files in public/clients/ are 2× this size.
 */
const CLIENTS = {
  mediora: { name: "Mediora", w: 162, h: 50 },
  aurelle: { name: "Aurelle Diamonds", w: 99, h: 74 },
  talentra: { name: "Talentra", w: 88, h: 74 },
  stonecrest: { name: "Stonecrest", w: 168, h: 48 },
  theranote: { name: "TheraNote", w: 82, h: 74 },
  lioneyes: { name: "Lioneyes", w: 121, h: 68 },
  mindora: { name: "Mindora", w: 82, h: 74 },
  "like-home": { name: "Like Home", w: 78, h: 74 },
  "diamond-group": { name: "Diamond Group", w: 128, h: 64 },
  talentbridge: { name: "TalentBridge", w: 102, h: 74 },
  vantor: { name: "Vantor", w: 119, h: 69 },
  "lotus-clean": { name: "Lotus Clean", w: 128, h: 64 },
  nellyan: { name: "Nellyan", w: 73, h: 74 },
  /* ⚠️ UNNAMED. Navy pillars under a coral arch, no wordmark, supplied as
     `26b0e30c-….png`; the user has not said whose it is. Until they do, `alt` is empty — an
     honest "decorative" rather than a guessed company name read out to a screen reader. */
  arch: { name: null, w: 97, h: 74 },
} satisfies Record<string, { name: string | null; w: number; h: number }>;

type Slug = keyof typeof CLIENTS;
type LaneSpec = { slugs: readonly Slug[]; seconds: number; reverse: boolean };

/* ≥810: three lanes of 5 / 5 / 4, travelling up / down / up. A desktop tile plus its gap is
   148px, so one loop is 740 / 740 / 592px — 18.5 / 15.4 / 16.4 px/s. Tablet tiles are 120px, so
   the same durations run 16.5 / 13.8 / 14.7 px/s. Neighbours are ordered so the three diamond
   marks (Aurelle, Diamond Group, Lioneyes) and the two "talent" marks never sit together within
   a lane, its loop seam included. */
const WIDE_LANES: readonly LaneSpec[] = [
  { slugs: ["mediora", "talentra", "theranote", "like-home", "vantor"], seconds: 40, reverse: false },
  { slugs: ["aurelle", "stonecrest", "mindora", "talentbridge", "nellyan"], seconds: 48, reverse: true },
  { slugs: ["lioneyes", "lotus-clean", "diamond-group", "arch"], seconds: 36, reverse: false },
];

/* Phone: two lanes of SEVEN, so all fourteen still show. (The demo board simply hid its third
   lane on phone, and four logos with it.) A 112px tile plus its gap is 124px → 868px loops at
   16.1 / 14.5 px/s. */
const PHONE_LANES: readonly LaneSpec[] = [
  {
    slugs: ["mediora", "lioneyes", "talentra", "theranote", "diamond-group", "like-home", "vantor"],
    seconds: 54,
    reverse: false,
  },
  {
    slugs: ["aurelle", "stonecrest", "mindora", "talentbridge", "nellyan", "lotus-clean", "arch"],
    seconds: 60,
    reverse: true,
  },
];

/* Top and bottom 16% fade out, so tiles drift in and out of the band rather than being cut by a
   hard edge. Symmetric, and vertical, so there is nothing here to flip for RTL. */
const FADE =
  "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 16%, rgba(0,0,0,1) 84%, rgba(0,0,0,0) 100%)";

function Tile({ slug, decorative }: { slug: Slug; decorative: boolean }) {
  const client = CLIENTS[slug];
  return (
    /* `paper` tile on the `canvas` band, radius 6 as the testimonial cards had. The lift on hover
       is `/contact`'s submit-button treatment — 2px and `shadow-float` — so the band uses the
       site's one existing elevation rather than a new one. */
    <li
      className="flex h-[112px] flex-none items-center justify-center rounded-[6px] bg-paper
                 transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5
                 hover:shadow-float tablet:h-[120px] desktop:h-[136px]"
      style={{ transitionTimingFunction: "var(--ease-rogo)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/clients/${slug}.png`}
        alt={decorative ? "" : (client.name ?? "")}
        width={client.w}
        height={client.h}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="block select-none"
        style={{
          width: `calc(${client.w}px * var(--logo-s))`,
          height: `calc(${client.h}px * var(--logo-s))`,
        }}
      />
    </li>
  );
}

function Lane({ lane }: { lane: LaneSpec }) {
  return (
    /* ⚠️ `self-start` IS LOAD-BEARING. A grid item stretches to its row by default, and the row
       is the window's 440/600px — so the track would be sized to the WINDOW, and the keyframe's
       `-100% / 3` would resolve against that instead of the track's own content height. The
       lane would slide a fraction of a copy and the seam would show. */
    <div
      className="clients-lane flex flex-col gap-3 self-start"
      style={{
        animationDuration: `${lane.seconds}s`,
        animationDirection: lane.reverse ? "reverse" : "normal",
      }}
    >
      {/* Three copies — see the note on `.clients-lane` for why two are not enough. Only the
          first is exposed to assistive tech; the other two are the loop's scenery. */}
      {[0, 1, 2].map((copy) => (
        <ul
          key={copy}
          className="m-0 flex list-none flex-col gap-3 p-0"
          {...(copy > 0 ? { "aria-hidden": true } : null)}
        >
          {lane.slugs.map((slug) => (
            <Tile key={slug} slug={slug} decorative={copy > 0} />
          ))}
        </ul>
      ))}
    </div>
  );
}

function LaneWindow({ lanes, className }: { lanes: readonly LaneSpec[]; className: string }) {
  return (
    <div
      className={`gap-3 overflow-hidden ${className}`}
      style={{ maskImage: FADE, WebkitMaskImage: FADE }}
    >
      {lanes.map((lane) => (
        <Lane key={lane.slugs[0]} lane={lane} />
      ))}
    </div>
  );
}

export default function Clients() {
  const t = getDict().home.clients;

  return (
    <section
      data-nav-theme="light"
      /* The nav's "Customers" and the footer's "Work" both land here (repointed from
         `/#testimonials` on 2026-10-26). `scroll-mt-24` clears the fixed header, as on
         WhyRogo's `#services`. */
      id="clients"
      aria-labelledby="clients-heading"
      /* padding 96/16 phone → 112/40 from 810 — the approved board's own values. `--logo-s`
         scales every mark per tier: 0.8 phone, 0.86 tablet, 1 desktop. */
      className="relative flex w-full scroll-mt-24 flex-col items-center overflow-clip bg-canvas
                 px-4 py-24 [--logo-s:0.8]
                 tablet:px-10 tablet:py-28 tablet:[--logo-s:0.86]
                 desktop:[--logo-s:1]"
    >
      {/* Width Container — max-w 1280. Copy above the lanes on phone; side by side from 810,
          the copy centred against the 600px window. */}
      <div
        className="relative flex w-full max-w-[var(--container-max)] flex-col gap-12
                   tablet:flex-row tablet:items-center tablet:gap-10 desktop:gap-16"
      >
        <div
          className="flex w-full flex-none flex-col items-start gap-6
                     tablet:w-[300px] desktop:w-[380px]"
        >
          {/* The board's "Clients" kicker above this heading and its "14 companies" figure below
              the body both came out on 2026-10-26 (user, against screenshots of each: "remove
              this"). Wraps naturally — no authored break. Two lines in English at every tier
              ≥810, one or two on phone depending on width. */}
          <h2
            id="clients-heading"
            className="w-full text-start font-display text-[36px] leading-[105%]
                       tracking-[-0.05em] text-ink tablet:text-[44px] desktop:text-[48px]"
          >
            {t.heading}
          </h2>
          {/* ⚠️ `ink/60`, NOT `muted`. The board used `muted` #737373, which is 4.43:1 on
              `canvas` and FAILS AA at 16px; ink at 60% composites to #6f6f6f, 4.69:1, and reads
              as the same grey. Same call Testimonials made for its titles on `card`. */}
          <p
            className="max-w-[340px] font-sans text-[16px] leading-[1.5em] tracking-[-0.02em]
                       text-ink/60"
          >
            {t.body}
          </p>
        </div>

        {/* Two separate sets of lanes rather than one that reflows: phone needs all fourteen in
            two lanes, ≥810 splits them across three, and a lane's contents ARE its geometry.
            The set that is `display:none` drops out of the accessibility tree with it, so a
            screen reader only ever meets one copy of the list. */}
        <div className="relative w-full min-w-0 tablet:w-auto tablet:flex-1">
          <LaneWindow lanes={PHONE_LANES} className="grid h-[440px] grid-cols-2 tablet:hidden" />
          <LaneWindow lanes={WIDE_LANES} className="hidden h-[600px] grid-cols-3 tablet:grid" />
        </div>
      </div>
    </section>
  );
}
