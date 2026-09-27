/* Umami — the ONE place the website id, the tracked host and the `umami.track` calls live.
 *
 * Installed 2026-09-27 at the user's request. The boss asked for "how many people visit, where
 * they stop, how many leave, how many clicks they make", and it had to be FREE and simple enough
 * to read without learning an analytics product. Clarity + GA4 were proposed first and turned
 * down as too complicated for the reader; Plausible fit but is paid. Umami Cloud's free Hobby
 * plan was the pick. The numbers are read at cloud.umami.is (and, once it exists, from a share
 * link embedded in the CRM) — nothing about them is rendered by this site. See
 * features/analytics/ for what is counted and why.
 *
 * Three halves:
 *   · The tracker, on every page, in `<head>`: `components/analytics/UmamiTag.tsx`, mounted by
 *     both root layouts beside the Google Ads tag. Page views need nothing else — the tracker
 *     wraps `history.pushState`/`replaceState`, so client-side route changes are counted.
 *   · Clicks: `components/analytics/UmamiClicks.tsx` — ONE document listener that names the
 *     click from the href it lands on. No per-component tagging.
 *   · "Form sent": `sendContact` in `components/contact/contactRules.ts`, beside the Google Ads
 *     conversion, so it inherits that call's gate: accepted by the backend, never the honeypot.
 *
 * ⚠️ NOT `data-umami-event`, AND THAT WAS READ OUT OF THE TRACKER (cloud.umami.is/script.js,
 * 2026-09-27). Umami's own click attribute makes its capture-phase listener `preventDefault()` a
 * same-tab link, send the event, and THEN assign `location.href` — a full page load. Here that
 * would turn every Contact button into a hard navigation and skip the view transition. Calling
 * `umami.track()` from our own listener leaves the click alone, and the tracker posts with
 * `fetch(…, { keepalive: true })`, so the request survives the navigation that follows.
 *
 * ⚠️ `data-domains` IS WHAT KEEPS THE BOSS'S NUMBERS REAL. The tracker sends nothing when
 * `location.hostname` is not in that list (exact match), so `npm run dev` on localhost:3001 and
 * every Vercel preview stay out of the figures. The flip side: nothing is counted until the live
 * host serves this build. The host is read from SITE_URL, which is overridden per deployment
 * (lib/site.ts) — a second deployment on clix-solution.com would count under its own host.
 * `www.` needs no entry: it 307s to the bare host before any page renders.
 *
 * Cookieless: the tracker sets no cookie (it only READS `localStorage["umami.disabled"]`, the
 * per-browser opt-out), so it adds nothing the cosmetic cookie banner fails to cover. */

import { SITE_URL } from "@/lib/site";

export const UMAMI_SCRIPT_SRC = "https://cloud.umami.is/script.js";

/* From Umami Cloud → Websites → "Clix website" → Edit → Tracking code, supplied 2026-09-27.
   Not a secret: it ships in every page's HTML. */
export const UMAMI_WEBSITE_ID = "4bb5a2fb-bf39-4bec-bd36-0f6346697237";

export const UMAMI_DOMAINS = new URL(SITE_URL).hostname;

/* The event names ARE the labels on Umami's Events page — the boss reads them as-is, so they are
   plain words, not keys. Adding one here is the whole change to count something new. */
export type UmamiEvent =
  | "Contact button"
  | "WhatsApp"
  | "Email"
  | "Phone"
  | "Form sent";

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, string>) => Promise<unknown>;
    };
  }
}

/* Safe to call when the tracker is blocked (ad blockers strip it) or not loaded yet (`defer`):
   the event is dropped and nothing throws. The tracker's own send is wrapped in try/catch, so a
   network failure cannot surface as an unhandled rejection either. */
export function trackEvent(event: UmamiEvent, data?: Record<string, string>): void {
  if (typeof window === "undefined") return;
  void window.umami?.track(event, data);
}
