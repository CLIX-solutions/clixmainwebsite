/* Google Ads — the ONE place the account id, the conversion labels and the `gtag` calls live.
 *
 * Installed 2026-09-22 at the user's request ("set up Google Ads conversion tracking correctly
 * on our website"); second conversion added 2026-09-27. Three parts:
 *
 *   · The tag itself, on every page, in `<head>`: `components/analytics/GoogleAdsTag.tsx`,
 *     mounted by both root layouts. It reads `GADS_ID` from here.
 *   · Conversion 1, "Submit lead form": `reportContactConversion()`, called from
 *     `components/contact/contactRules.ts` inside `sendContact()`'s `if (res.ok)` → `if (!trap)`
 *     branch — so both forms (the /contact page and the footer) report it, and only after
 *     /api/contact accepted the submission. (Until the 2026-09-22 footer-form refactor the call
 *     sat in ContactForm.tsx's own `onSubmit`; this header said so until 2026-09-27.) That
 *     placement is the whole requirement, so it is worth being explicit about what it rules out.
 *     The event does NOT fire on: visiting /contact (nothing runs on mount), clicking Send
 *     (validation runs first and returns early), client validation failing (early return), the
 *     API rejecting (non-2xx never reaches the branch), or a refresh (the call sits in an event
 *     handler, not an effect; the success panel is React state and does not survive a reload).
 *     It fires ONCE per accepted submission: each form ignores clicks while
 *     `status === "sending"`, calls `sendContact` once, and unmounts on the next render.
 *   · Conversion 2, "WhatsApp click (wa.me)" (2026-09-27, the marketer's request):
 *     `reportWhatsAppConversion()`, called from `components/analytics/GoogleAdsClicks.tsx` — one
 *     capture-phase document click listener, so every WhatsApp link on the site counts, present
 *     and future, with no per-link wiring. The edge cases are listed in that file.
 *
 * THE LABELS. A Google Ads conversion is addressed as `AW-<account>/<label>`; each label is
 * minted per conversion action in the Ads UI. Both were supplied, not guessed: the lead-form one
 * on 2026-09-22 from the Google Ads Team's "Set up a Google tag" email (`value: 1.0`,
 * `currency: 'ILS'`, sent exactly as that snippet has them); the WhatsApp one on 2026-09-27 from
 * the marketer's request (same value and currency, plus `transport_type: 'beacon'`).
 * `NEXT_PUBLIC_GADS_CONTACT_LABEL` / `NEXT_PUBLIC_GADS_WHATSAPP_LABEL` can override either per
 * environment; when a label resolves empty the report function sends nothing rather than a
 * bare-account `send_to`, which would register on the account without attaching to any
 * conversion action — noise that looks like success.
 *
 * "SENT" MEANS "HANDED TO gtag". `GoogleAdsTag.tsx`'s inline bootstrap defines `gtag()` as a
 * push onto `dataLayer` before `gtag/js` has loaded, so `window.gtag` exists even when an ad
 * blocker strips the loader: the call then sits in the queue forever and nothing throws. A click
 * that lands before the loader finishes is queued and flushed when it does. So `true` from a
 * report function means "pushed", not "reached Google". (This header used to say a blocker
 * leaves `window.gtag` undefined; it does not.)
 *
 * NOT CONSENT-GATED, AND THAT IS DELIBERATE. The cookie banner is cosmetic by a recorded user
 * decision (see CookieBanner.tsx) and the published terms already list Google advertising
 * cookies (§05), so the tag loads regardless of which banner button was pressed. If that
 * changes, wire Google Consent Mode v2 in GoogleAdsTag.tsx — a `gtag('consent','default',…)`
 * before `config`, then `gtag('consent','update',…)` from `readConsent()` — rather than
 * conditionally mounting the tag, so the cookieless conversion pings survive a refusal. */

export const GADS_ID = "AW-18467124282";

/* From Google Ads → Goals → Conversions → "Submit lead form" → "Use Google tag" → the
   `send_to` value after the slash. */
const CONTACT_CONVERSION_LABEL = "wo7vCM3x-YAdELro5-VE";
/* The two extra fields Google's event snippet for this action carries, sent verbatim. */
const CONTACT_CONVERSION_VALUE = 1.0;
const CONTACT_CONVERSION_CURRENCY = "ILS";

export const CONTACT_CONVERSION_SEND_TO: string | null = (() => {
  const label = (
    process.env.NEXT_PUBLIC_GADS_CONTACT_LABEL ?? CONTACT_CONVERSION_LABEL
  ).trim();
  return label ? `${GADS_ID}/${label}` : null;
})();

/* From Google Ads → Goals → Conversions → "WhatsApp click (wa.me)" → the `send_to` value after
   the slash. Supplied 2026-09-27 by the marketer with his own reading of the ambiguous glyphs:
   ⚠️ lowercase L, zero, uppercase O, digit six — `l0O6…`. Typed from his text, not a screenshot. */
const WHATSAPP_CONVERSION_LABEL = "l0O6CIjuwIcdELro5-VE";
const WHATSAPP_CONVERSION_VALUE = 1.0;
const WHATSAPP_CONVERSION_CURRENCY = "ILS";

export const WHATSAPP_CONVERSION_SEND_TO: string | null = (() => {
  const label = (
    process.env.NEXT_PUBLIC_GADS_WHATSAPP_LABEL ?? WHATSAPP_CONVERSION_LABEL
  ).trim();
  return label ? `${GADS_ID}/${label}` : null;
})();

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/* Report one accepted contact-form submission to Google Ads. Returns whether the event was
   handed to `gtag` (see "SENT" MEANS above), so the caller can log a miss in development. Safe
   to call whatever the tag's state — the `typeof window.gtag` guard is for a page where the
   inline bootstrap itself never ran; the submission is unaffected either way and the visitor
   sees the same success panel.
   ⚠️ FROZEN by the marketer's 2026-09-27 request ("form-submit conversion is already wired — do
   not change it"). `reportWhatsAppConversion` below is a copy, not a shared helper, for that
   reason: this path cannot be exercised without creating a real lead, so a refactor of it
   would be unverifiable. */
export function reportContactConversion(): boolean {
  if (typeof window === "undefined") return false;
  if (!CONTACT_CONVERSION_SEND_TO) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[gads] contact conversion NOT sent: no conversion label configured (see src/lib/gads.ts).",
      );
    }
    return false;
  }
  if (typeof window.gtag !== "function") return false;
  window.gtag("event", "conversion", {
    send_to: CONTACT_CONVERSION_SEND_TO,
    value: CONTACT_CONVERSION_VALUE,
    currency: CONTACT_CONVERSION_CURRENCY,
  });
  return true;
}

/* Report one click on a WhatsApp link to Google Ads. A deliberate COPY of the function above
   (see its FROZEN note) with one difference in the payload: `transport_type: "beacon"`, from
   the marketer's snippet, meant to let the ping survive a same-tab navigation. Every WhatsApp
   link today opens a new tab (`AppLink external`), so it costs nothing now and is right if that
   ever changes. Measured 2026-09-27 (headless Edge over the DevTools protocol): gtag sends this
   event as a fetch to googleads.g.doubleclick.net/pagead/viewthroughconversion/<id>/?…&label=…
   plus a www.google.com/pagead/1p-conversion/ twin, and never called navigator.sendBeacon — so
   the arg is passed through as given, not relied on. Called only from
   components/analytics/GoogleAdsClicks.tsx. */
export function reportWhatsAppConversion(): boolean {
  if (typeof window === "undefined") return false;
  if (!WHATSAPP_CONVERSION_SEND_TO) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[gads] WhatsApp conversion NOT sent: no conversion label configured (see src/lib/gads.ts).",
      );
    }
    return false;
  }
  if (typeof window.gtag !== "function") return false;
  window.gtag("event", "conversion", {
    send_to: WHATSAPP_CONVERSION_SEND_TO,
    value: WHATSAPP_CONVERSION_VALUE,
    currency: WHATSAPP_CONVERSION_CURRENCY,
    transport_type: "beacon",
  });
  return true;
}
