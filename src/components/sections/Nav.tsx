"use client";

/**
 * Nav — clone of rogo.ai `Navigation + Banner` (`.framer-1lcee9e`).
 *
 * Every value here is measured from the 2026-08-02 capture; the spec and its provenance
 * live in features/nav/FEATURE.md. Do not "tidy" a number without changing that file first.
 *
 * TWO INDEPENDENT BREAKPOINTS — this is the thing to know before editing:
 *
 *   · the BANNER switches layout at 810px  (centred row  ->  left-aligned, truncating)
 *   · the HEADER switches at 1200px        (full nav     ->  logo + hamburger)
 *
 * They are genuinely different numbers in the original, not a mistake. Framer ships the
 * whole block twice as `ssr-variant`s gated on `hidden-*` classes: the >=810 variant
 * contains BOTH header layouts (gated again at 1200), and a separate <=809.98 variant
 * carries the stacked banner. Verified by mapping every `hidden-*` class back to the
 * media query that hides it.
 *
 * Structure mirrors the original's container nesting so the gaps land in the right places.
 *
 * SCROLL STATE — added 2026-08-03 from a live-site screenshot, not from the capture.
 * The capture only ever froze the at-rest state (`data-framer-name="Transparent Dark"`,
 * logo variant `Light`). Its CSS proves a *second* nav variant exists (`.framer-v-yxrzsa`
 * alongside the rendered `.framer-v-174l6nt`) but carries none of its colors — Framer
 * applies those inline from JS. So the palette below is read off the screenshot, and the
 * trigger is our own. See features/nav/FEATURE.md.
 *
 * THE BAR TRACKS THE SECTION BEHIND IT (2026-08-03, user request). It is a three-way
 * state, not a boolean:
 *
 *   hero  -> transparent + blur, paper content   (the at-rest state from the capture)
 *   light -> solid `paper` bar, ink content      (testimonials / why-rogo / by-the-numbers)
 *   dark  -> solid `ink` bar, paper content      (security / footer)
 *
 * The page is not uniformly light below the hero: `security` and `footer` are both `ink`,
 * and a white bar sat on top of them. Each section declares its own `data-nav-theme`, and
 * the nav reads whichever one spans its bottom edge — so adding a section can never leave
 * the nav out of sync with it. Content colours for `dark` are identical to `hero`; only the
 * background differs, which is why one `light` flag still drives every text colour.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AppLink from "@/components/ui/AppLink";
import { useChrome, useLocale } from "@/lib/i18n/LocaleProvider";
import { localeHref } from "@/lib/i18n/config";
import ClixWordmark from "@/components/ui/ClixWordmark";
import ClixMark from "@/components/ui/ClixMark";
import ModelTicker from "@/components/ui/ModelTicker";
import type { ModelPrice } from "@/lib/models";

/* Logo lockup geometry (2026-08-07). Scaled up 1.18x later the same day at the user's
   request ("make clix a bit bigger and the logo") — wordmark 22 -> 26px, mark 20 -> 24px.
   BOTH moved together on purpose: the mark sits at ~1.3x the wordmark's cap height, and
   growing one without the other is exactly what makes a lockup look off.

   Mark width follows the asset's 96:88 aspect, so 28px tall renders 30.5px wide. The 8px
   gap is `gap-2`, the same step the nav's own button row uses.

   The Link boxes grew with it (h-6 -> h-7 -> h-8 compact, h-7 -> h-8 -> h-9 full). Neither
   changes the nav's own height: both rows are sized by their CTA button (40px compact,
   ~38px full), which is still taller than the 36px the lockup now occupies. That headroom
   is the budget for any further growth — past ~38px the bar itself starts moving. */
const MARK_SIZE = 28;

/* SIX slots as of 2026-08-13, seven before it — the row's spacing and its 1200px collapse
   were measured against SEVEN items, so the count is layout, not content, and dropping one is
   a layout change even though it looks like a content one.

   ⚠️ WHAT CAME OUT AND WHY IT IS SAFE. `Careers` was slot 7; the user removed the route
   ("also remove the whole careers route and page"), so the label had nowhere to go and a
   label pointing at a 404 is worse than no label. The row is `absolute left-1/2
   -translate-x-1/2` — centred on the bar, not packed against the logo — so removing an item
   SHRINKS it symmetrically and can only increase the clearance the 1200-tier measurement was
   protecting. That is why this needed no re-measure: the constraint is a maximum, and the row
   moved away from it (~65px narrower in English, ~54px in Hebrew).
   Re-measure the moment a slot is ADDED, which is the direction that can break.

   THE LABELS ARE THE TARGET'S OWN (2026-08-09, user: "follow the version of Rogo, which has
   the Felix product security company, customers, news, and careers. But instead of Felix,
   put clix"). This replaces the clix IA taken from docs/reference/clixsolutions/ (Services /
   Industries / Work / Insights / Playground / About / Contact) and restores rogo.ai's set,
   verbatim from the capture and in its order — with slot 1 swapped: `Felix` is rogo's named
   AI-analyst product, which a clix build cannot claim, so it carries the brand instead.

   SCOPE OF THAT REQUEST WAS THE LABELS ONLY. The logo lockup stays clix, the banner keeps
   the live model ticker, and the 18px type and grown lockup below both stand — all three
   were confirmed to stay when the swap was agreed. Do not "finish the job" by reverting them
   to the capture's 14px/60x24/Series-D; that would be undoing a decision, not completing one.

   `href: null` means INERT, and that is the point (2026-08-05, user: "make the navbar do
   nothing for now or just scroll to each sections"). Only two of these have anything
   on this page to go to, so those two scroll and the rest render as plain text — not as
   links to routes that would 404, and not as `#` which would jump to the top and look
   broken. An inert item is also not focusable, which is correct: there is nothing to
   activate. Give a slug an `href` the moment its page or section exists.

   Which two, and why these: the hrefs were re-derived from the new labels rather than kept
   by slot position. `Security` and `Customers` are the only labels this page actually has a
   section for — `#security`, and `#testimonials` which IS the customer-quote block. Carrying
   the old mapping across would have pointed `Clix` at `#services` and `Careers` at
   `#contact`, which is a wrong destination dressed up as a working link. `#services` and
   `#contact` are now unreferenced from the link row.

   The CTA's own target changed on 2026-08-13, from `/#contact` to `/contact`: that anchor was
   a scroll to the footer, and /contact is now a real page with a real form. AppLink applies
   `localeHref`, so the Hebrew nav sends you to /he/contact. */
/* LABELS MOVED TO THE DICTIONARY (2026-08-12, Hebrew locale). This array is now the
   DESTINATIONS and their order; the visible text comes from `chrome.nav.labels[i]`, which is a
   fixed-length TUPLE for exactly that reason — the slot count is a type, not just a comment,
   so a locale that supplies the wrong number of labels fails the build. ⚠️ THE TUPLE IS THE
   REASON A SLOT CANNOT BE DROPPED HERE ALONE: removing an entry from this array without
   shortening `NavLabels` and BOTH locales' `labels` is a type error, which is exactly the
   intent — the arity is checked, not trusted.

   `key` replaces `label` as the React key on purpose: a key that changed with the locale would
   remount every item on a language switch. */
const LINKS: { key: string; href: string | null }[] = [
  /* Live as of 2026-08-09: `/clix` exists (clone of rogo.com/felix), so per the rule above
     the slot got its href the moment its page did. The only ROUTE in this list — every other
     live item is a same-page hash. */
  { key: "clix", href: "/clix" },
  /* Live as of 2026-08-11: `/product` exists (clone of rogo.com/product). Same rule — the
     slot gets its href the moment its page does. Second ROUTE in this list.
     ⚠️ /product is `noindex`. That was because its copy was rogo's verbatim; the content pass
     on 2026-08-12 cleared that, and the guard now stands on the placeholder testimonial quotes
     attributed to real named clients. Either way it is a crawler directive, not a reason to
     hide it from the nav — the page is reachable and real. */
  { key: "product", href: "/product" },
  /* Live as of 2026-08-12: `/security` exists (clone of rogo.com/security). Was `/#security`,
     the home page's own dark band, for as long as there was no page to point at. Home's
     `#security` section is untouched and still carries that anchor — it just no longer has to
     stand in for a route. Fourth ROUTE in this list, and the first one that is NOT `noindex`:
     every string on `/security` is clix's own and it ships no certification seal, so nothing
     guards it. */
  { key: "security", href: "/security" },
  /* Live as of 2026-08-12: `/company` exists (clone of rogo.com/company). Same rule — the slot
     gets its href the moment its page does. Third ROUTE in this list.
     ⚠️ /company is `noindex`, but for a thinner reason than /product's: every string on it is
     already clix's own. It is guarded pending two answers, the Unit 8200 credential and the
     placeholder photograph. See src/app/company/page.tsx. A crawler directive is not a reason
     to hide a real, reachable page from the nav. */
  { key: "company", href: "/company" },
  /* Repointed 2026-10-26 from `/#testimonials`: the quote block came off the home page that
     day, and the clients band that took its slot carries `#clients`. Same job as before — the
     page's answer to "who does clix work for". */
  { key: "customers", href: "/#clients" },
  /* Live since 2026-08-11 — /news is the rogo.com/news clone carrying the AI digest. */
  { key: "news", href: "/news" },
];

/* Each page section declares which of these it is, via `data-nav-theme`. Anything the nav
   cannot classify falls back to `light`, which is the majority of the page. */
type NavTheme = "hero" | "light" | "dark";

/* THE BANNER IS A LIVE FRONTIER-MODEL PRICE TICKER (2026-08-08, user: "make it LLM models
   not company stocks").

   Its history, because the slot has turned over four times and each change had a reason:
     · target's original — "Announcing our $160M Series D led by Kleiner Perkins", removed
       2026-08-05 because under a clix wordmark it read as a first-person claim clix cannot
       make;
     · "Clix AI — launching soon", then split 2026-08-07 into "Clix AI News" + an underlined
       "Coming soon" to restore the target's headline + trailing-CTA shape;
     · 2026-08-08 morning — eight AI-adjacent stock quotes with sparklines;
     · now nine LLMs and their live per-million-token list prices. Same idea, correct subject:
       an automation studio's banner should show what it builds on, not what its suppliers'
       shares did today.

   The strings are gone rather than kept as a fallback ON PURPOSE. A ticker that silently
   degrades to marketing copy would hide an outage; with no data the strip renders nothing
   and collapses to zero height, which is visible and honest. See src/lib/models.ts. */

/* Button — padding 8/16, inner row 20px tall with a 1px top nudge, radius 6.
   The border is 1px and transparent in both variants; it exists so the box does not
   resize if a later state colors it in, exactly as the original does via its `:after`. */
function NavButton({
  variant,
  light,
  children,
  href,
  external,
}: {
  variant: "ghost" | "inverse";
  /* `true` only over a light section. Over the hero AND over a dark section the content
     palette is the same — see the header comment. */
  light: boolean;
  children: string;
  /* Required as of 2026-08-12. It was optional, but both call sites always passed one and
     a button with no destination is not a link at all — tightening it lets AppLink take
     the routing decision without an undefined branch to defend against. */
  href: string;
  external?: boolean;
}) {
  return (
    <AppLink
      href={href}
      external={external}
      className={[
        "flex w-min items-center justify-center gap-2 rounded-[6px] border px-4 py-2",
        "cursor-pointer whitespace-nowrap no-underline",
        "transition-[opacity,background-color] duration-300 hover:opacity-90",
        "border-transparent focus-visible:ring-2 focus-visible:ring-offset-2",
        "focus-visible:outline-none",
        light
          ? "focus-visible:ring-ink focus-visible:ring-offset-paper"
          : "focus-visible:ring-paper focus-visible:ring-offset-ink",
        variant === "inverse"
          ? light
            ? "bg-ink"
            : "bg-paper"
          : "bg-transparent",
      ].join(" ")}
      style={{ transitionTimingFunction: "var(--ease-rogo)" }}
    >
      <span className="flex h-5 items-center justify-center gap-[10px] pt-px">
        <span
          className={[
            "font-sans text-[18px] font-medium transition-colors duration-300",
            variant === "inverse"
              ? light
                ? "text-paper"
                : "text-ink"
              : light
                ? "text-ink"
                : "text-paper",
          ].join(" ")}
          style={{ lineHeight: "1em", letterSpacing: "-0.01em" }}
        >
          {children}
        </span>
      </span>
    </AppLink>
  );
}

/* Menu glyph — path verbatim from the capture's inline background-image SVG.
   Note it is a *split* two-bar mark (four subpaths, a gap in each bar), not the usual
   three even lines; drawing it as three rules would be a redraw. */
function MenuGlyph({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
        <path
          d="M4 4 L16 16 M16 4 L4 16"
          stroke="currentColor"
          strokeWidth="1.667"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M 0 5.833 C 0 5.373 0.373 5 0.833 5 L 5.833 5 L 5.833 6.667 L 0 6.667 Z M 20 5.833 C 20 5.373 19.627 5 19.167 5 L 7.5 5 L 7.5 6.667 L 20 6.667 Z M 0 14.167 C 0 13.706 0.373 13.333 0.833 13.333 L 13.333 13.333 L 13.333 15 L 0 15 Z M 20 14.167 C 20 13.706 19.627 13.333 19.167 13.333 L 15 13.333 L 15 15 L 20 15 Z"
      />
    </svg>
  );
}

/* `models` is fetched in page.tsx (a server component) and passed down rather than fetched
   here, so the first paint already has real numbers — a ticker that appeared after hydration
   would shove the whole fixed header down 45px in front of the visitor. Defaults to `[]` so a
   caller that has no data still type-checks and simply gets no banner. */
export default function Nav({
  models = [],
  banner = true,
  spacer = false,
}: {
  models?: ModelPrice[];
  /* `false` drops the ticker strip entirely — no strip, no `bannerShift`, so the header
     never travels. Off on `/clix`: the target's own Felix page has no band above its nav,
     and the user asked for it removed there and only there (2026-08-09). Different from
     passing no `models`, which is the OUTAGE path — same rendering, opposite meaning, and
     worth keeping distinct so an empty ticker on the home page still reads as a fault. */
  banner?: boolean;
  /* `true` reserves the row's height in the document flow, so the page below starts under
     the header instead of behind it. The header itself stays `position: fixed` either way.

     This is what makes `/clix` line up: rogo.com/felix puts its nav in a `position: sticky`
     container (`.framer-1jwqerv-container { position:sticky; top:0 }`), i.e. IN FLOW, so its
     hero's 128px top padding is measured from the nav's bottom edge. rogo.ai's home nav
     overlays a video and is not. Sticky was the obvious way to reproduce that, but it would
     put the open mobile panel in flow too and shove the page down ~400px on every menu tap —
     a regression the fixed header does not have. A spacer buys the same layout with none of
     that. Assumes `banner={false}`: it reserves `--nav-row-h` only. */
  spacer?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /* Scroll state. Trigger: whichever section spans the BOTTOM EDGE OF THE NAV ROW — i.e.
     the last thing the header is actually sitting on top of. That boundary is the same one
     an earlier pass used as `rootMargin: -navH` on an IntersectionObserver watching `#hero`;
     this generalises it from "is the hero still there" to "what is there", which is what the
     page needs now that `security` and `footer` are dark too.

     It is also the *functional* reason the original flips at all — white-on-dark becomes
     unreadable — so the flip point is unchanged from the observed behaviour. Still
     unverified against the live site; open question in FEATURE.md. */
  const bannerRef = useRef<HTMLDivElement>(null);
  const compactRowRef = useRef<HTMLDivElement>(null);
  const fullRowRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<NavTheme>("hero");
  const [bannerH, setBannerH] = useState(0);
  const [bannerShift, setBannerShift] = useState(0);

  /* One flag drives every text, ring and border colour: `dark` and `hero` share a palette
     and differ only in the bar's fill. */
  const light = theme === "light";

  /* Shared chrome, from whichever root layout mounted the provider. Nav is already a client
     component, so this is a context read rather than a prop — nothing about the nav's own
     wiring changed to gain a second language. */
  const t = useChrome();
  /* THE TWO LOGO LINKS ARE RAW `next/link`, NOT `AppLink`, and stay that way — the logo has
     deliberately been an instant swap rather than a crossfade since 2026-08-12, and routing it
     through the view transition would be an unrelated behaviour change. But raw means nothing
     prefixes their href, so on a Hebrew page `href="/"` would have walked the visitor out of
     the locale. `localeHref` is the identity function in English, so this is a no-op there. */
  const locale = useLocale();

  /* The banner leaves on its own, NOT with the colour flip. Live-site evidence: rogo.ai can
     be caught with the header already light AND the banner still on screen, so the two are
     not one state. It is direction-aware — confirmed on the live site: scroll up anywhere
     in the page and the black bar comes back.

     The whole rule is one line: shift = (down && scrolled at all) ? bannerH : 0.
       · scrolling DOWN — it eases out of view;
       · scrolling UP   — it eases back in, wherever you are in the page.
       · at the very top — always in place, so a fresh load never starts collapsed.

     It is a two-position animation, NOT scroll-tracking: both directions run the same
     300ms `--ease-rogo` on the header's transform. An earlier pass had the hide follow the
     scrollbar 1:1, which is more literal but reads as a jerk at the top of the page.
     4px deadzone so inertial jitter can't flip the direction mid-scroll.

     The section-theme probe rides the same rAF: both answers come from one scroll pass and
     one layout read, and both need the live nav height, so splitting them would mean
     measuring the same boxes twice a frame. */
  useEffect(() => {
    let frame = 0;
    let lastY = Math.max(0, window.scrollY);
    let down = true;
    /* Cached because it only changes when sections mount/unmount, not on scroll. */
    let sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-theme]"),
    );

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = Math.max(0, window.scrollY);
        const h = bannerRef.current?.offsetHeight ?? 0;
        /* Rows are measured separately rather than off the <header> box: the open mobile
           panel lives inside that box and would inflate it. Exactly one row is ever
           displayed per tier, so the other measures 0. Re-read every frame so a resize
           (the banner wraps to two lines below 810) needs no separate handler. */
        const navH =
          (compactRowRef.current?.offsetHeight ?? 0) +
          (fullRowRef.current?.offsetHeight ?? 0);

        if (Math.abs(y - lastY) > 4) {
          down = y > lastY;
          lastY = y;
        }
        setBannerH(h);
        setBannerShift(down && y > 0 ? h : 0);

        /* Which section is under the bar's bottom edge? Sections are contiguous, so
           exactly one matches; `light` is the fallback if the page ever has a gap. */
        let next: NavTheme = "light";
        for (const el of sections) {
          const r = el.getBoundingClientRect();
          if (r.top <= navH && r.bottom > navH) {
            next = (el.dataset.navTheme as NavTheme) ?? "light";
            break;
          }
        }
        setTheme(next);
      });
    };

    const onResize = () => {
      sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-nav-theme]"),
      );
      onScroll();
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const bannerGone = bannerH > 0 && bannerShift >= bannerH;

  /* Close on Escape and lock body scroll while the panel is up. Neither behavior is
     observable in the capture (the menu is never rendered open) — both are our own
     baseline, flagged as an open question in FEATURE.md. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* The header switches at 1200px but the panel is only reachable below it; if the
     viewport crosses that line while open, the toggle disappears and the panel would
     be orphaned. Close it. */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1200px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[3] flex flex-col items-center overflow-hidden
                 transition-transform duration-300"
        style={{
          transform: bannerShift ? `translateY(-${bannerShift}px)` : "none",
          transitionTimingFunction: "var(--ease-rogo)",
        }}
      >
        {/* ---------------------------------------------------------------- Banner
          The strip keeps the target's own box — `padding: 12px 16px` on phone, `12px 40px`
          from 810 up — so its height is unchanged at 45px and the `bannerShift` transform
          below still travels the same distance. Only the CONTENTS changed: the centred text
          pair became a full-width scrolling ticker, so the inner wrappers that existed to
          centre a short headline are gone with it.

          Eases out on the way down and back in on the way up, even though it sits in the
          fixed block — see the `bannerShift` effect above. `aria-hidden` + `inert` whenever
          it is on its way out, so it never sits in the tab order invisibly.

          Renders NOTHING when `models` is empty, collapsing the strip to zero height. That
          is the outage story: no band rather than a band of stale or invented numbers. */}
        <div
          ref={bannerRef}
          className={banner && models.length ? "w-full bg-banner" : "hidden"}
          aria-hidden={bannerGone}
          {...(bannerGone ? { inert: true } : null)}
        >
          <div className="flex w-full items-center px-4 py-3 tablet:px-10">
            <ModelTicker initial={models} />
          </div>
        </div>

        {/* ------------------------------------------------- Header, <1200: logo + burger
          Two coincident bottom borders in the original — white@15% on the outer block and
          hairline on the inner row. Both reproduced; they overlay rather than stack
          because the padding lives on the inner element. */}
        <div
          className={`hero-nav-blur relative flex w-full flex-col items-center overflow-hidden
                    border-b transition-[background-color,border-color] duration-300
                    desktop:hidden
                    ${light ? "border-b-hairline" : "border-b-hairline-light"}`}
          style={{
            /* `rgba(21,21,21,0.01)` is the capture's at-rest fill below 1200 — effectively
             transparent; the `blur(5px)` is what separates the bar from the video. Over a
             dark section it goes fully opaque `ink` instead. */
            backgroundColor:
              theme === "light"
                ? "var(--color-paper)"
                : theme === "dark"
                  ? "var(--color-ink)"
                  : "rgba(21, 21, 21, 0.01)",
            transitionTimingFunction: "var(--ease-rogo)",
          }}
        >
          <div
            ref={compactRowRef}
            className="flex w-full items-center justify-between border-b border-b-hairline p-4"
          >
            <div className="flex w-min items-center gap-10">
              <Link
                href={localeHref("/", locale)}
                /* Width was a fixed 60px while this box held the target's SVG logotype. The
                 clix mark is set in type, so it sizes itself and the box follows it.

                 Colour and its transition live HERE rather than on each child, so the mark
                 and the wordmark can never drift out of step mid-flip. Both read
                 `currentColor` — the wordmark as text, the mark as a mask fill. */
                className={`flex h-8 flex-none items-center gap-2 no-underline
                          transition-colors duration-300
                          focus-visible:ring-2 focus-visible:outline-none
                          ${light ? "text-ink focus-visible:ring-ink" : "text-paper focus-visible:ring-paper"}`}
                aria-label={t.a11y.home}
              >
                <ClixMark size={MARK_SIZE} />
                <ClixWordmark />
              </Link>
            </div>
            {/* `gap-2` and the wrapper are kept even though this now holds a single child —
                the locale switch that sat here was removed 2026-08-16 (user's call), and
                re-adding any second control should not mean re-deriving the row. */}
            <div className="flex w-min items-center gap-2">
              <button
                ref={toggleRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="nav-mobile-panel"
                aria-label={open ? t.a11y.closeMenu : t.a11y.openMenu}
                className={`flex h-10 w-10 flex-none cursor-pointer items-center justify-center
                          gap-[10px] transition-colors duration-300
                          focus-visible:ring-2 focus-visible:outline-none
                          ${
                            light
                              ? "text-ink focus-visible:ring-ink"
                              : "text-paper focus-visible:ring-paper"
                          }`}
              >
                <MenuGlyph open={open} />
              </button>
            </div>
          </div>

          {/* Panel. NOT in the capture — the original renders it only on interaction, so
            nothing about its real appearance is observable. This is our own baseline,
            built from the link set the header already declares. See FEATURE.md. */}
          {open && (
            <nav
              id="nav-mobile-panel"
              className="flex w-full flex-col gap-1 bg-ink px-4 pt-2 pb-6"
              aria-label={t.a11y.mainLandmark}
            >
              {/* Keyed on label, not href — inert items share a null href. */}
              {LINKS.map((l, i) => {
                const style = {
                  lineHeight: "1.5em",
                  letterSpacing: "-0.01em",
                  transitionTimingFunction: "var(--ease-rogo)",
                };
                const base =
                  "flex h-9 items-center font-sans text-[18px] font-medium text-paper";
                return l.href ? (
                  <AppLink
                    key={l.key}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`${base} no-underline transition-opacity duration-300
                              hover:opacity-70 focus-visible:ring-2 focus-visible:ring-paper
                              focus-visible:outline-none`}
                    style={style}
                  >
                    {t.nav.labels[i]}
                  </AppLink>
                ) : (
                  /* Dimmed to 50% rather than rendered at full strength: an item that cannot
                   be activated should not look identical to one that can. */
                  <span
                    key={l.key}
                    aria-disabled="true"
                    className={`${base} cursor-default opacity-50`}
                    style={style}
                  >
                    {t.nav.labels[i]}
                  </span>
                );
              })}
              {/* The panel is `bg-ink` in every state, so its buttons keep the dark-surface
                palette even when the header above them has gone light. */}
              {/* "Log in" removed 2026-08-05: clix sells engagements, not a product with
                accounts, so there was nothing to log into. The ghost variant is now unused
                here but kept in NavButton — the >=1200 header still has no second button
                either, and re-adding one should not mean re-deriving the variant. */}
              <div className="mt-4 flex items-center gap-2">
                <NavButton variant="inverse" light={false} href="/contact">
                  {t.nav.cta}
                </NavButton>
              </div>
            </nav>
          )}
        </div>

        {/* ------------------------------------------------- Header, >=1200: full nav
          The link row is absolutely centred on the header box (left:50% + translateX(-50%)),
          NOT laid out between logo and buttons. That is deliberate in the original: it keeps
          the links optically centred on the page regardless of how wide the button group
          gets, which a plain space-between would not do. */}
        <div
          ref={fullRowRef}
          className="hero-nav-blur hidden w-full flex-col items-center overflow-visible
                   px-10 py-4 transition-[background-color] duration-300 desktop:flex"
          style={{
            backgroundColor:
              theme === "light"
                ? "var(--color-paper)"
                : theme === "dark"
                  ? "var(--color-ink)"
                  : "rgba(21, 21, 21, 0)",
            transitionTimingFunction: "var(--ease-rogo)",
          }}
        >
          <div className="relative flex w-full max-w-[var(--container-max)] items-center justify-between">
            <Link
              href={localeHref("/", locale)}
              /* Colour + transition on the anchor, not per child — see the compact row. */
              className={`flex h-9 flex-none cursor-pointer items-center gap-2 no-underline
                        transition-colors duration-300
                        focus-visible:ring-2 focus-visible:outline-none
                        ${light ? "text-ink focus-visible:ring-ink" : "text-paper focus-visible:ring-paper"}`}
              aria-label={t.a11y.home}
            >
              <ClixMark size={MARK_SIZE} />
              <ClixWordmark />
            </Link>

            <nav
              className="absolute top-0 bottom-0 left-1/2 z-[1] flex w-min -translate-x-1/2
                       items-center justify-center gap-3 overflow-hidden"
              aria-label={t.a11y.mainLandmark}
            >
              {/* Keyed on label, not href — inert items share a null href.
                The inert ones render the SAME box (`h-9 px-3 py-2`) as the links, because
                the row's spacing was measured against equal items; swapping one for a
                narrower element would shift the whole centred row. */}
              {LINKS.map((l, i) => {
                const box =
                  "flex h-9 w-min flex-col items-center justify-center overflow-hidden px-3 py-2 whitespace-pre";
                const text = `font-sans text-[18px] font-medium transition-colors duration-300 ${
                  light ? "text-ink" : "text-paper"
                }`;
                return l.href ? (
                  <AppLink
                    key={l.key}
                    href={l.href}
                    className={`${box} cursor-pointer no-underline transition-opacity
                              duration-300 hover:opacity-70 focus-visible:ring-2
                              focus-visible:outline-none
                              ${light ? "focus-visible:ring-ink" : "focus-visible:ring-paper"}`}
                    style={{ transitionTimingFunction: "var(--ease-rogo)" }}
                  >
                    <span
                      className={text}
                      style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
                    >
                      {t.nav.labels[i]}
                    </span>
                  </AppLink>
                ) : (
                  /* Dimmed to 50% rather than rendered at full strength: an item that cannot
                   be activated should not look identical to one that can. */
                  <span
                    key={l.key}
                    aria-disabled="true"
                    className={`${box} cursor-default opacity-50`}
                  >
                    <span
                      className={text}
                      style={{ lineHeight: "1.5em", letterSpacing: "-0.01em" }}
                    >
                      {t.nav.labels[i]}
                    </span>
                  </span>
                );
              })}
            </nav>

            {/* One button, not two — see the note on the mobile panel. The wrapper keeps its
              `gap-2` so re-adding a second button needs no layout work. */}
            <div className="flex w-min items-center gap-2 overflow-hidden">
              {/* Safe to widen this group: the link row beside it is ABSOLUTELY centred
                  (`left-1/2 -translate-x-1/2` below), which its own comment says is deliberate
                  so the links stay optically centred however wide the button group gets. That
                  property is why a locale switch could be added here without re-measuring the
                  nav, and why removing it on 2026-08-16 moved nothing either. */}
              <NavButton variant="inverse" light={light} href="/contact">
                {t.nav.cta}
              </NavButton>
            </div>
          </div>
        </div>
      </header>

      {/* See the `spacer` prop. Height is `--nav-row-h` from globals.css, which is the row's
        own box restated in one place rather than a number pasted into the page. */}
      {spacer && (
        <div
          className="h-[var(--nav-row-h)] w-full flex-none"
          aria-hidden="true"
        />
      )}
    </>
  );
}
