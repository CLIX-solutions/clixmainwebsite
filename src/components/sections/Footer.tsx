/**
 * Footer + closing CTA — clone of rogo.ai's `Footer` component
 * (`.framer-8dt5bh-container` → `<footer class="framer-fo8jf5">`).
 *
 * Spec, provenance and open questions: features/footer/FEATURE.md.
 * Do not "tidy" a number here without changing that file first.
 *
 * The closing CTA is INSIDE the footer in the original, not a separate section — hence one
 * component, not two.
 *
 * This is a nested Framer component, so it ships its own three variants with their own
 * gating hashes: `hidden-d23fwj` = >=1600 · `hidden-1roolzl` = 1200-1599.98 ·
 * `hidden-1leoyz4` = 810-1199.98 · `hidden-16n7npo` = <=809.98. Same four tiers as the page,
 * different names. The rendered variants are `Dark/Desktop` (>=1200), `Dark/Tablet`
 * (810-1199.98) and `Dark/Mobile` (<=809.98).
 *
 * WATCH OUT: the stylesheet also carries rules for `framer-v-1cxbn18` and
 * `framer-v-18cp4bv`, which are UNRENDERED variants of the same component — including a
 * tempting `grid-template-columns: repeat(2, …)` on the link row. None of it applies. Only
 * the three variants above are authoritative; see the standing rule in README.md.
 *
 * ⚠️ THE CLOSING CTA IS REPLACEABLE PER ROUTE AS OF 2026-08-17, via the optional `closing`
 * prop — and exactly one route uses it. On /contact the Reiteration block read "Software that
 * works, results that speak." over a `Let's start` button pointing at `/contact` itself, i.e. the page
 * you were already on. That was logged as an open question in features/contact-page/FEATURE.md
 * and left alone on the grounds that special-casing a component every route renders was worse
 * than the redundancy. The user disagreed ("remove the cta, since you are already in the cta
 * page") and it is now a one-line prop rather than a variant system.
 *
 * ⚠️ THE PROP TAKES A NODE, NOT A FLAG OR A ROUTE NAME. `Footer` must not learn what /contact is:
 * a `variant="contact"` would put a page's concern inside a component shared by seven routes, and
 * the next such request would add a second. A node keeps the knowledge at the call site
 * (`ContactRoute.tsx` passes `<ContactChannels />`) and this file only knows "something replaces
 * the reiteration block, or nothing does".
 *
 * ⚠️ THE CLOSING CTA IS A FORM AS OF 2026-09-22 — A DELIBERATE DEPARTURE FROM THE TARGET. The
 * clone's Reiteration block was the tagline over a `Let's start` link to /contact. At the user's
 * request ("add the form, the about you part and also the tell us, but compressed") the link is
 * gone and FooterContactForm sits beside the tagline instead: all six /contact fields, the
 * consent tick, same endpoint, same rules (src/components/contact/contactRules.ts). The tagline
 * is untouched and gains the reply promise under it. Copy is the `contact` namespace, read here
 * on the server and handed to the client form as a prop, so no dictionary keys were added.
 * `chrome.footer.cta` ("Let's start") is now unread and was left in both locales rather than
 * churned — the same call /contact made for its retired error keys.
 *
 * ⚠️ THE `pt-14` AND THE CONTAINER'S `gap-14` BELONG TO THE SLOT, NOT TO THE CTA. Whatever goes in
 * has to sit at the same inset or the divider beneath it lands at a different distance than on
 * every other route. That is why the replacement wrapper below repeats `pt-14` rather than
 * expecting the caller to bring its own padding.
 *
 * No animation beyond the link hover, which IS measured: the capture's link preset carries
 * `transition: color .3s cubic-bezier(.44,0,.56,1)` and a hover colour. That makes this the
 * second place on the site with a real authored transition rather than an estimate.
 */

import { Fragment, type ComponentType, type ReactNode } from "react";
import AppLink from "@/components/ui/AppLink";
import {
  InstagramMark,
  LinkedInMark,
  WhatsAppMark,
} from "./socialMarks";
import { getChrome, getDict } from "@/lib/i18n/server";
import type { ChromeDict } from "@/lib/i18n/dictionary";
import { CONTACT } from "@/lib/contact";
import FooterContactForm from "@/components/contact/FooterContactForm";
import FooterMap from "./FooterMap";

type FooterLink = {
  /* Was `label`. The visible text now comes from `chrome.footer.links[key]`, so this is a
     stable identifier that does not change with the locale — which also keeps it usable as a
     React key. */
  key: keyof ChromeDict["footer"]["links"];
  href: string;
  external?: boolean;
  /* Per-tier visibility, for the two links the original does not ship at every tier.
     See the open questions in FEATURE.md — reproduced, not corrected. */
  only?: "desktop" | "below-desktop";
  /* Brand mark, on the three social entries only (2026-08-16). Optional, and the links that
     omit it render exactly the markup they rendered before — see FooterLinkItem. */
  icon?: ComponentType<{ className?: string }>;
};

/* `titleIndex` indexes `chrome.footer.groupTitles`, a fixed-length 4-tuple — four columns is
   layout, so the count is pinned by the type rather than by a comment. */
type LinkGroup = { titleIndex: 0 | 1 | 2 | 3; links: FooterLink[] };

/* Remapped 2026-08-05 onto clix's real IA and real accounts. Structure was the target's and
   was unchanged until 2026-08-16 — four columns, three links each plus a four-link Contact
   column, with the same per-tier gating. Overview now carries TWO links, not three: the
   target's shape lost to a working link, because the third had no honest destination. Every
   other column still matches, and the four-column grid is untouched. */

/* ✅ EVERY LINK IN THIS FOOTER RESOLVES, as of 2026-08-16. It began that day with EIGHT of its
   twelve internal links 404ing.

   How the eight closed, because the split matters more than the count:
     · repointed at pages that already existed — Services → /product, Work → /#testimonials,
       Insights → /news
     · deleted or relabelled where no honest target existed — `industries` removed outright,
       `playground` became `security`
     · BUILT — /privacy, /terms and /accessibility, ported from the company's own published
       documents in docs/reference/clixsolutions/pages/

   All eight named real pages on the real clix site, which is why the last three were a port
   rather than authorship. See features/legal-pages/ for what they say and, more importantly,
   for the four promises the accessibility statement makes that this build does not yet keep. */
const GROUPS: LinkGroup[] = [
  {
    titleIndex: 0,
    links: [
      /* Repointed 2026-08-16, the same move made for `about` below on 2026-08-12 and for the
         same reason: all three of this column's hrefs 404'd, and a footer link that lands on
         Next's bare not-found is worse than no link.

         `/product` is the page "Services" means — it is the route describing what clix
         builds. `/#clients` is the home page's client band, which the nav already calls
         "Customers"; it is the only client work on the site, so "Work" resolves there. (It was
         `/#testimonials`, the quote block, until that came off the page on 2026-10-26.)
         Note the LEADING SLASH: `#clients` alone would be a same-page scroll, correct
         only in this footer's copy on `/`. `/#clients` is a real cross-route navigation
         from the other five routes and AppLink's own same-route guard collapses it back to a
         scroll on the home page — see the `/#contact` note in AppLink.tsx.

         `industries` is GONE rather than repointed. Nothing on this site — no page, no
         section, not a paragraph — is about industries, so every candidate target answered a
         different question than the one clicked. Its EN and HE strings came out of the
         dictionaries with it; git has them if the page is ever built. */
      { key: "services", href: "/product" },
      { key: "work", href: "/#clients" },
    ],
  },
  {
    titleIndex: 1,
    links: [
      /* Repointed 2026-08-12: was `/about`, which never existed and 404'd. `/company` is the
         clone of rogo.com/company and is the page this label means. The nav calls the same
         route "Company"; the labels differ because each list keeps its own capture's wording.
         The first of the three repointings; Overview's followed on 2026-08-16. */
      { key: "about", href: "/company" },
      /* Repointed 2026-08-16. `/insights` 404'd. The real clix site's own `תובנות` is its
         article hub ("what we learned from the workbench" — strategy and development pieces),
         and `/news` is this repo's article page, so the KIND of page matches even though the
         contents do not: ours aggregates external AI stories, theirs is clix's own writing.
         The label stays "Insights" while the nav calls the same route "News" — the identical
         divergence `about`/`Company` already carries two lines up, and for the same reason. */
      { key: "insights", href: "/news" },
      /* WAS `playground`, 2026-08-16 — a LABEL swap, not just a repoint, and the only one in
         this footer. The real site's `פלייגראונד` is an interactive drag-and-drop node canvas
         ("v0.1", desktop-only) where you wire up a system in the browser. Nothing here
         resembles it and no existing page could answer that click, so the slot carries
         `Security` instead: a real route, a trust page a business footer wants, and one of
         three real pages (`/clix`, `/security`, `/news`) this footer linked to nowhere at all.
         User's call, offered against deleting the slot the way `industries` was deleted. */
      { key: "security", href: "/security" },
    ],
  },
  {
    titleIndex: 2,
    links: [
      /* ⚠️ NO TIER GATE HERE, AND THAT IS THE POINT — DO NOT "RESTORE" ONE.
         Until 2026-08-17 Terms carried `only: "desktop"`, so this column rendered 3 links at
         >=1200 and 2 below. That came from the capture in docs/reference/target/, which gates
         one link in this column; the gate had merely been moved off the accessibility
         statement and onto Terms so assistive-tech users would not lose their page on a phone.

         The user found Terms missing on mobile and rejected the premise: this site's footer
         answers to clix-solution.com, which renders all three legal links at every width. So
         the gate is gone rather than relocated again. The column is 3 links at every tier now,
         which makes it one row taller than the capture's on phone — the columns are a flex
         stack with a 12px gap, so it extends downward and nothing reflows sideways. */
      { key: "terms", href: "/terms" },
      { key: "privacy", href: "/privacy" },
      { key: "accessibility", href: "/accessibility" },
    ],
  },
  {
    titleIndex: 3,
    links: [
      /* Was `#contact`, a same-page scroll to THIS footer — i.e. a "Let's start" link whose
         destination was the block containing it. /contact exists as of 2026-08-13, so this
         and the closing CTA below both point at it. AppLink prefixes the locale, so the
         Hebrew footer sends you to /he/contact. */
      { key: "letsStart", href: "/contact" },
      { key: "email", href: CONTACT.email },
      { key: "instagram", href: CONTACT.instagram, external: true, icon: InstagramMark },
      /* Added 2026-08-16 at the user's request, and it BREAKS the target's column length:
         Contact now renders FIVE links per tier where the original renders four. That is a
         deliberate content addition, not a layout drift — the column is a flex stack with a
         12px gap, so a fifth row extends it downward and nothing reflows sideways. The three
         sibling columns stay 2/3/3 as before, and the tallest column has always set this
         row's height. Sits beside Instagram because both are social profiles; WhatsApp and
         Email are direct channels and stay together below.
         ⚠️ The href is a PERSONAL profile — see the note in src/lib/contact.ts. */
      { key: "linkedin", href: CONTACT.linkedin, external: true, icon: LinkedInMark },
      /* The original splits "Press" by tier — a mailto at >=1200, an x.com profile below —
         which is why this column rendered four links at every tier from five entries. clix
         has one WhatsApp number and no tier-specific alternative, so this is a single
         ungated entry. */
      { key: "whatsapp", href: CONTACT.whatsapp, external: true, icon: WhatsAppMark },
    ],
  },
];

const tierClass = (only?: FooterLink["only"]) =>
  only === "desktop"
    ? "hidden desktop:block"
    : only === "below-desktop"
      ? "block desktop:hidden"
      : "";

function FooterLinkItem({ item, label }: { item: FooterLink; label: string }) {
  const Icon = item.icon;

  return (
    <div
      className={`relative h-auto w-auto max-w-[1024px] ${tierClass(item.only)}`}
    >
      <p className="text-[14px] leading-[1.5em] tracking-[-0.02em]">
        <AppLink
          href={item.href}
          external={item.external}
          /* paper -> surface on hover. The `.3s cubic-bezier(.44,0,.56,1)` is the
             capture's own, not an estimate — it is declared on the link style preset.
             The mark inherits all of it through `currentColor`, so icon and label cross-fade
             on the same curve instead of the text moving under a fixed icon.

             `inline-flex` ONLY when there is a mark. The nine link items without one keep the
             plain inline anchor they have always rendered — an unconditional flex would change
             the box of every link in this footer to buy alignment for three of them. */
          className={`text-paper no-underline transition-[color] duration-300
                      hover:text-surface
                      focus-visible:rounded-[2px] focus-visible:ring-2
                      focus-visible:ring-paper focus-visible:outline-none
                      ${Icon ? "inline-flex items-center gap-2" : ""}`}
          style={{ transitionTimingFunction: "var(--ease-rogo)" }}
        >
          {/* NO `rtl:` VARIANT, AND BOTH HALVES OF THAT ARE DELIBERATE.
              · The mark's SIDE flips on /he for free: a flex row's main axis follows the
                inline direction, so `dir="rtl"` on the Hebrew <html> moves the icon to the
                right — the reading-start side — with no variant to maintain.
              · The mark's ARTWORK never flips. It is a trademark, not a direction glyph;
                see the RTL note in socialMarks.tsx.
              `flex-none` stops the 16px square being squeezed by the label beside it. */}
          {Icon && <Icon className="h-4 w-4 flex-none" />}
          {label}
        </AppLink>
      </p>
    </div>
  );
}

export default function Footer({
  /* Replaces the closing CTA (the "Reiteration" block) on the route that passes it. Undefined
     everywhere else, which is six of the seven routes — see the header note. */
  closing,
}: {
  closing?: ReactNode;
} = {}) {
  /* Server component, so the dictionary comes from the request store rather than a context.
     No prop had to be threaded here — which matters because this component is rendered by all
     6 routes (7 until /careers came out on 2026-08-13) and prop-drilling `locale` would have
     meant the same edit in every one of them. */
  const t = getChrome().footer;
  /* The compact form's copy, and the reply promise under the tagline. Same request-store read as
     `getChrome()`, so the Hebrew footer gets the Hebrew form with no prop threaded in. */
  const contact = getDict().contact;

  return (
    /* padding `0 16px` phone -> `0 40px` from 810 up. No vertical padding at all: the
       Reiteration block's own `padding-top:56px` is the footer's entire top inset, and the
       Copyright's `16px` is the bottom. */
    <footer
      data-nav-theme="dark"
      /* Was the destination of every "Let's start" button on the site (2026-08-05 to
         2026-08-13). It no longer is: /contact is a real page with a real form, and all
         eleven CTAs now point there instead — including the one inside this footer.
         The id STAYS. It costs nothing, `scroll-mt-24` still holds, and it is the kind of
         thing that gets linked from outside the codebase (a mail signature, an old post).
         Removing it would 404-in-place every one of those. */
      id="contact"
      className="relative flex w-full scroll-mt-24 items-center justify-center gap-[10px] overflow-hidden bg-ink px-4 tablet:px-10"
    >
      {/* Container — max-w 1280, gap 56. */}
      <div className="relative flex w-px max-w-[var(--container-max)] flex-[1_0_0] flex-col items-center gap-14 overflow-hidden">
        {/* Reiteration — headline and CTA on one baseline at >=810 (`align-items:flex-end`
            is what sits the button on the headline's last line), stacked below. */}
        {closing ? (
          /* The replacement slot. `pt-14` is the reiteration block's own top inset and is what
             the container's `gap-14` measures from, so it is repeated here rather than left to
             the caller — see the header note. No `items-end` and no `tablet:flex-row`: those
             exist to sit a button on a headline's last baseline, and whatever replaces the CTA
             owns its own layout. */
          <div className="relative w-full pt-14">{closing}</div>
        ) : (
        /* Tagline beside the form from 1200 up, stacked below it. The form column is 640px: at
           the 1200 floor the container is 1120, so 640 + the 64px gap leaves the tagline 416px,
           and its longest line ("Software that works," at 48px) is ~370. Below 1200 the form
           runs the container's full width, where its 6-column grid has room for three fields
           a row. `items-start` sits the tagline's cap height level with the form's first
           labels — there is no longer a button whose baseline it has to meet. */
        <div
          className="relative flex w-full flex-col items-start gap-10 pt-14
                     desktop:flex-row desktop:justify-between desktop:gap-16"
        >
          <div className="relative flex w-full flex-col items-start gap-5 desktop:w-auto desktop:min-w-0 desktop:flex-1">
            <div className="relative h-auto w-full">
              <h2 className="font-display text-[44px] leading-[1.1em] tracking-[-0.05em] text-paper tablet:text-[48px]">
                {/* THE TAGLINE, AND THE ONE PLACE ON THIS SITE WHERE THE TWO LOCALES GENUINELY
                    DISAGREE ABOUT STRUCTURE.

                    English is a rendering of the live site's Hebrew close, "תוכנה שעובדת,
                    תוצאות שמדברות." — and it happens to split three ways, so it dropped
                    straight into the target's {A}<br phone>{B}<br>{C} shape. The Hebrew
                    original does not: one comma, one sentence boundary, two runs. So the
                    count cannot be hard-coded here.

                    Outer array = hard lines, broken at every tier.
                    Inner array = runs broken only on phone (`tablet:hidden`).

                    English: [["Software", "that works,"], ["results that speak."]]
                             -> 2 lines wide, 3 on phone. Byte-identical to what this
                                component rendered before the dictionary existed.
                    Hebrew:  [["תוכנה שעובדת,"], ["תוצאות שמדברות."]]
                             -> 2 lines at every tier; nothing to gate on phone.

                    The trailing space that used to be written into "Software " is added here
                    instead, and only between phone-split runs — it survives `display:none` on
                    the break, which is what welds the wider tiers cleanly. A locale whose
                    inner array has one entry never gets one. */}
                {/* `Fragment`, not `span`: a keyed fragment renders NO element, so the h2's
                    children stay exactly what they were — text nodes and `<br>`s, nothing
                    nested. An inline span would be transparent to layout, but it would still
                    add nodes the original does not have, and this block is diffed
                    element-for-element against the target. */}
                {t.tagline.map((line, li) => (
                  <Fragment key={li}>
                    {li > 0 && <br />}
                    {line.map((run, ri) => (
                      <Fragment key={ri}>
                        {ri > 0 && <br className="tablet:hidden" />}
                        {ri > 0 ? run : run + (line.length > 1 ? " " : "")}
                      </Fragment>
                    ))}
                  </Fragment>
                ))}
              </h2>
            </div>
            {/* The reply promise — /contact's own `panel.reply`, the same sentence its rail and
                its submit row carry. `paper/60` composites to #a1a1a1, 7.07:1 on `ink`. */}
            <p
              className="font-sans text-[16px] text-paper/60"
              style={{ lineHeight: "1.5em", letterSpacing: "-0.02em" }}
            >
              {contact.panel.reply}
            </p>
          </div>

          {/* The form, where `Let's start` was. A client component inside this server one; its
              copy crosses as a plain prop. */}
          <div className="relative w-full desktop:w-[640px] desktop:flex-none">
            <FooterContactForm t={contact.form} />
          </div>
        </div>
        )}

        {/* Divider. TWO different colours: `ink-soft` @50% below 1200, white @10% at and
            above it. Both are opacity modifiers on existing tokens, so neither is a new
            design-system value. */}
        <div className="relative h-px w-full flex-none bg-ink-soft/50 desktop:bg-paper/10" />

        {/* Bottom — link row over the copyright, gap 72. */}
        <div className="relative flex w-full flex-none flex-col items-center gap-[72px] overflow-hidden">
          {/* Link row. The four columns are the target's; the map is ours, added
              2026-08-11 as a fifth item pinned to the right edge. It is why the columns no
              longer divide the full width — they now share it with a fixed 280/430px
              panel, which is the intended shift-left. */}
          <div
            className="relative flex w-full flex-none flex-col items-start gap-8
                       overflow-hidden tablet:flex-row tablet:gap-4"
          >
            {GROUPS.map((group) => (
              <div
                key={group.titleIndex}
                className="relative flex w-full flex-none flex-col items-start gap-5
                           overflow-hidden tablet:w-px tablet:flex-[1_0_0]"
              >
                <div className="relative h-auto w-full max-w-[1024px]">
                  <p className="text-[14px] leading-[1.3em] font-medium tracking-[-0.02em] text-muted">
                    {t.groupTitles[group.titleIndex]}
                  </p>
                </div>
                <div className="relative flex w-full flex-none flex-col items-start gap-3 overflow-visible">
                  {/* Keyed on label + tier, not label + href. "Press" appears twice — once
                      per tier — and the two used to differ by href, which no longer holds
                      now both are the `#` placeholder. Tier is what actually distinguishes
                      them, so the key stays unique whatever the destinations become. */}
                  {group.links.map((item) => (
                    <FooterLinkItem
                      key={`${item.key}-${item.only ?? "all"}`}
                      item={item}
                      label={t.links[item.key]}
                    />
                  ))}
                </div>
              </div>
            ))}

            <FooterMap />
          </div>

          {/* Copyright — "© 2026" and the holder as two separate uppercase runs, 8px apart.
              The caps come from `text-transform`, so the accessible name stays lowercase.
              The target says "Rogo AI" here; changed with the nav logo (2026-08-03), since
              a clix mark over a "© ROGO AI" line names the wrong copyright holder. */}
          <div className="relative flex w-full flex-none flex-row items-start justify-center gap-4 overflow-hidden px-12 py-4">
            <div className="relative flex w-px flex-[1_0_0] flex-row items-center justify-center gap-2 overflow-visible">
              <p className="text-center text-[14px] leading-[1.3em] tracking-[-0.02em] whitespace-pre text-muted uppercase tablet:font-medium desktop:text-[12px]">
                {t.copyrightYear}
              </p>
              <p className="text-center text-[14px] leading-[1.3em] tracking-[-0.02em] whitespace-pre text-muted uppercase tablet:font-medium desktop:text-[12px]">
                {t.copyrightHolder}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
