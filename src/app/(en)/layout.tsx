/**
 * ROOT LAYOUT #1 — English. Serves the BARE paths: `/`, `/product`, `/security`, …
 *
 * `(en)` is a route GROUP: parentheses mean the folder contributes nothing to the URL. That is
 * the whole trick, and it is why the English URLs are byte-identical to what they were before
 * Hebrew existed — no middleware, no rewrite, no redirect, no `next.config.ts` change.
 *
 * THERE ARE TWO ROOT LAYOUTS IN THIS APP, this one and src/app/he/layout.tsx, and
 * src/app/layout.tsx is deliberately GONE. Consequences worth knowing before editing:
 *
 *   · `lang` and `dir` are resolved at BUILD time per locale rather than branched on a param.
 *     For the RTL work that is strictly better: nothing has to read a request to know which
 *     direction it is rendering.
 *   · Navigating between `/product` and `/he/product` crosses a root-layout boundary, so Next
 *     does a full document load. That is correct here, not a cost: `<html dir>` flips across
 *     that boundary, so a client-side transition would crossfade an LTR snapshot into an RTL
 *     live frame — a full-width horizontal jump of every line on the page — and a hard load
 *     rebuilds every GSAP timeline from zero, which is what lets `useDirSign()` be treated as
 *     stable for a mount's lifetime. (This used to cite `LocaleToggle.tsx`, which carried the
 *     reasoning; that component was deleted 2026-08-16 with the nav's locale switch, so the
 *     argument is restated here rather than lost.)
 *   · ⚠️ NEVER ADD `src/app/not-found.tsx`. With no root layout at `src/app/`, Next injects its
 *     own built-in layout for `/_not-found`; adding a custom one makes the file a non-builtin
 *     page, the injection stops, and the build EXITS 1 with "doesn't have a root layout". A
 *     per-locale `not-found.tsx` INSIDE `(en)/` or `he/` is fine and is what you want anyway.
 *   · `src/app/api/`, `favicon.ico`, `icon.png` and `apple-icon.png` stay at the app root and
 *     need no layout — they are app-route/metadata routes and short-circuit the root-layout
 *     check. `/api/models` is never localized.
 */

import type { Metadata } from "next";
import "../globals.css";
import { ViewTransitionProvider } from "@/components/ui/ViewTransitions";
import { I18nProvider } from "@/lib/i18n/LocaleProvider";
import CookieBanner from "@/components/legal/CookieBanner";
import AccessibilityGate from "@/components/a11y/AccessibilityGate";
import GoogleAdsTag from "@/components/analytics/GoogleAdsTag";
import UmamiTag from "@/components/analytics/UmamiTag";
import UmamiClicks from "@/components/analytics/UmamiClicks";
import { DICTIONARIES } from "@/lib/i18n/dictionary";
import { HTML_LANG, DIRECTION } from "@/lib/i18n/config";
import { seedLocale } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site";

/* ⚠️ REWRITTEN 2026-08-18. WHAT WAS HERE WAS THE CLONE TARGET'S POSITIONING WITH CLIX'S NAME
   IN IT: "Clix is the trusted AI partner to the world's leading financial institutions." That
   is rogo's business, not clix's — clix builds automation for Israeli SMBs — and it was live on
   every English page and served to Google as this company's description of itself.

   It surfaced while chasing a stale favicon in search results. The recrawl that fixes the icon
   republishes the description in the same pass, so shipping this FIRST is the whole point: a
   fresh crawl of the old text would have been worse than the stale-but-accurate snippet Google
   was already showing.

   The title stays lowercase "clix" as the site's own name — the previous note's reasoning holds
   and is kept below — but it is now a TEMPLATE, so a tab reads "Product · clix" rather than an
   undifferentiated "clix" on all ten routes. `default` is what the home page and any route
   without its own title get.

   ⚠️ THE DESCRIPTION IS SOURCED, NOT AUTHORED. It restates this site's own hero
   (`en/home.ts`: "You bring the business. / We bring the intelligence.") and its four service
   cards — AI agents, WhatsApp, CRM, integrations. Nothing here is a claim the site does not
   already make about itself, which is the standing rule for this repo's copy.

   PREVIOUS NOTE, still true of the title: deliberately "clix", not the target's own — this is
   the one place the build identifies as itself rather than as the clone target, and a tab
   reading "Rogo" would misrepresent whose site it is. */
export const metadata: Metadata = {
  /* Resolves every relative URL below, and every `alternates` entry, against the canonical
     origin. Without it Next emits relative canonicals, which Google resolves against whichever
     hostname it crawled — the exact www/non-www split this is meant to settle. */
  metadataBase: new URL(SITE_URL),
  title: {
    default: "clix | AI agents and automation for business",
    template: "%s · clix",
  },
  description:
    "clix builds AI agents, WhatsApp automation, CRM systems and custom software for businesses that want the work to run itself.",
  alternates: {
    canonical: "/",
    /* hreflang. Tells Google these two trees are the same site in two languages rather than
       duplicates competing with each other, and which to serve to whom. `x-default` points at
       English because `/` is the unprefixed default locale. */
    languages: {
      en: "/",
      he: "/he",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: "clix",
    locale: "en_US",
    url: "/",
    title: "clix | AI agents and automation for business",
    description:
      "clix builds AI agents, WhatsApp automation, CRM systems and custom software for businesses that want the work to run itself.",
  },
};

export default function EnRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /* Seeded before `children` is rendered — a layout body runs to completion before React
     renders the element it returned, which is what makes this store safe. Re-seeded inside
     every _routes/*Route.tsx as well, so ordering can never matter. */
  seedLocale("en");

  /* `data-scroll-behavior="smooth"` DECLARES the `html { scroll-behavior: smooth }` rule in
     globals.css to Next. Without it `disableSmoothScrollDuringRouteTransition` takes its
     "no smooth scrolling configured" branch, so every ROUTE change animates its scroll instead
     of arriving — and Next logs a warning about exactly this in dev. It does not affect
     in-page anchors: same-route hash changes short-circuit that helper, which is why the rule
     still does the job it was added for. */
  return (
    <html lang={HTML_LANG.en} dir={DIRECTION.en} data-scroll-behavior="smooth">
      {/* An explicit <head> so the Google Ads tag is the first thing in it, as asked. Next
          merges its own metadata and stylesheet tags in after it. Mounted in BOTH root
          layouts; see GoogleAdsTag.tsx. Umami's tracker follows it; see UmamiTag.tsx. */}
      <head>
        <GoogleAdsTag />
        <UmamiTag />
      </head>
      <body>
        <I18nProvider locale="en" chrome={DICTIONARIES.en.chrome}>
          <ViewTransitionProvider>{children}</ViewTransitionProvider>
          {/* Last in the DOM so a screen reader reaches the page content first. It is
              `position: fixed`, so document order costs it nothing visually. Mounted
              inside I18nProvider because it reads `chrome.cookies`. */}
          <CookieBanner />
          {/* The Sienna plugin, or the built-in widget when NEXT_PUBLIC_A11Y_WIDGET=builtin.
              Exactly one of them ever renders — see AccessibilityGate. */}
          <AccessibilityGate />
        </I18nProvider>
        {/* Renders nothing: one document click listener that reports Contact / WhatsApp /
            Email / Phone clicks to Umami. Outside I18nProvider — it reads no strings. */}
        <UmamiClicks />
      </body>
    </html>
  );
}
