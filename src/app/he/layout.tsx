/**
 * ROOT LAYOUT #2 — Hebrew, RTL. Serves `/he`, `/he/product`, `/he/security`, …
 *
 * `he` is a REAL path segment, not a group, so no `(he)` wrapper is needed — the URL is legible
 * straight from the folder tree. See src/app/(en)/layout.tsx for why there are two root layouts
 * and what that implies.
 *
 * ⚠️ `dir="rtl"` IS SET HERE AND NOWHERE ELSE. Do not set `dir` on any other element, and do not
 * read `document.dir` or `document.documentElement.lang` to discover it — client components take
 * direction from `useDirection()`/`useDirSign()`, server components from `getDirection()`. A DOM
 * sniff has no server snapshot, so it would render the LTR branch on the server and visibly flip
 * on hydration.
 *
 * ⚠️ THE ONE EXCEPTION, and it is a genuine bug this attribute would otherwise cause:
 * `direction` inherits into SVG, where `text-anchor: start` means INLINE-start. ClixFelixFooter
 * draws its wordmark as raw `<text x="-20">` with the default anchor, so under `dir="rtl"` the
 * anchor moves to the right edge and the 2034-unit-wide word is positioned entirely outside its
 * viewBox — it vanishes. That component pins `direction="ltr"` on the `<text>` for that reason,
 * not for styling.
 *
 * TYPE. The sitewide face `Discovery` (public/fonts/discovery/discovery-var.woff2) carries
 * COMPLETE Hebrew coverage — verified with fontTools, not assumed: all 27 base and final letters,
 * the full niqqud set, maqaf, geresh, gershayim, sof pasuq, and the shekel sign, across a
 * `wght 100–800` variable axis. So no font is vendored for this locale. ⚠️ But `--font-sans` and
 * `--font-display` fall back to `"Inter", sans-serif` and the vendored Inter subsets carry NO
 * U+0590–U+05FF, so Hebrew's only fallback is the OS `sans-serif` — a different family with
 * different metrics than anything here was measured against. Chosen rather than inherited; see
 * features/i18n-rtl/FEATURE.md.
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
import GoogleAdsClicks from "@/components/analytics/GoogleAdsClicks";
import { DICTIONARIES } from "@/lib/i18n/dictionary";
import { HTML_LANG, DIRECTION } from "@/lib/i18n/config";
import { seedLocale } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site";

/* The Hebrew description is SOURCED, not translated: its closing clause is the real company
   site's own positioning line (docs/reference/clixsolutions/, services H1, recovered from
   pages/*.html rather than content.json — see he/chrome.ts for why the H1s in that file lost
   their spaces).

   ⚠️ EXTENDED 2026-08-18, NOT REPLACED. The sourced line alone names no product, so a search
   result for it told a reader nothing about what clix sells. The three services now leading the
   sentence are also sourced — they are clix's own service names from the live site
   (מערכות CRM, סוכני AI לוואטסאפ, אוטומציות לייעול עסקי) and match the four service cards in he/home.ts.

   The English side had no such excuse and was rewritten outright: it carried rogo's claim about
   "the world's leading financial institutions". See (en)/layout.tsx.

   ⚠️ NO DASHES, per the standing 2026-08-10 instruction on clix prose. The title separator is a
   pipe, which is also what the live clix site uses ("CLIX | אוטומציות חכמות לעסקים"). */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "clix | אוטומציות ובינה מלאכותית לעסקים",
    template: "%s · clix",
  },
  description:
    "clix בונה סוכני AI, אוטומציות WhatsApp, מערכות CRM ותוכנה ייעודית. אנחנו בונים את המנגנונים השקטים שמניעים עסקים מודרניים.",
  alternates: {
    canonical: "/he",
    languages: {
      en: "/",
      he: "/he",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: "clix",
    locale: "he_IL",
    url: "/he",
    title: "clix | אוטומציות ובינה מלאכותית לעסקים",
    description:
      "clix בונה סוכני AI, אוטומציות WhatsApp, מערכות CRM ותוכנה ייעודית.",
  },
};

export default function HeRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  seedLocale("he");

  /* `data-scroll-behavior="smooth"` DECLARES the `html { scroll-behavior: smooth }` rule in
     globals.css to Next. Without it `disableSmoothScrollDuringRouteTransition` takes its
     "no smooth scrolling configured" branch, so every ROUTE change animates its scroll instead
     of arriving — and Next logs a warning about exactly this in dev. It does not affect
     in-page anchors: same-route hash changes short-circuit that helper, which is why the rule
     still does the job it was added for. */
  return (
    <html lang={HTML_LANG.he} dir={DIRECTION.he} data-scroll-behavior="smooth">
      {/* An explicit <head> so the Google Ads tag is the first thing in it, as asked. Next
          merges its own metadata and stylesheet tags in after it. Mounted in BOTH root
          layouts; see GoogleAdsTag.tsx. Umami's tracker follows it; see UmamiTag.tsx. */}
      <head>
        <GoogleAdsTag />
        <UmamiTag />
      </head>
      <body>
        <I18nProvider locale="he" chrome={DICTIONARIES.he.chrome}>
          <ViewTransitionProvider>{children}</ViewTransitionProvider>
          {/* Last in the DOM so a screen reader reaches the page content first. It is
              `position: fixed`, so document order costs it nothing visually. Mounted
              inside I18nProvider because it reads `chrome.cookies`. */}
          <CookieBanner />
          {/* The Sienna plugin, or the built-in widget when NEXT_PUBLIC_A11Y_WIDGET=builtin.
              Exactly one of them ever renders — see AccessibilityGate. */}
          <AccessibilityGate />
        </I18nProvider>
        {/* Render nothing: two document click listeners — one reports Contact / WhatsApp /
            Email / Phone clicks to Umami, one reports WhatsApp clicks to Google Ads as a
            conversion (GoogleAdsClicks.tsx). Outside I18nProvider — they read no strings. */}
        <UmamiClicks />
        <GoogleAdsClicks />
      </body>
    </html>
  );
}
