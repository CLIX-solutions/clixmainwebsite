"use client";

import { useEffect } from "react";
import { reportWhatsAppConversion } from "@/lib/gads";
import { isWhatsAppHost } from "@/lib/contact";

/* Google Ads conversion 2, "WhatsApp click (wa.me)" — 2026-09-27, the marketer's request: a
 * conversion event on clicks to wa.me / api.whatsapp.com, the lead-form conversion left alone.
 *
 * ONE capture-phase listener on the document, the shape of UmamiClicks.tsx beside it, instead of
 * an onClick on each of the three WhatsApp links (Footer, ContactChannels, the ContactForm
 * success panel): two of those are server components rendering a plain <a>, and a WhatsApp link
 * added to a new page later is counted without anyone remembering to wire it. The marketer's own
 * suggested implementation was exactly this — a document click listener in the root layout.
 *
 * A SIBLING OF UmamiClicks, NOT A BRANCH INSIDE IT, on purpose. Umami is the boss's product
 * analytics; this is marketing's Ads conversion. Separate files mean either can be removed or
 * changed without touching the other's numbers, and a file named Umami never reports to Google.
 * Both classify the same way — `isWhatsAppHost()` in lib/contact.ts — so the Umami "WhatsApp"
 * count and this conversion agree by construction. Cost of the second listener: one
 * `closest("a[href]")` per click.
 *
 * WHAT COUNTS, AND WHAT DOES NOT:
 *   · a mouse click, a tap, an Enter on the focused link, a ctrl/shift/cmd-click — all fire
 *     `click` and count. A middle-button open-in-new-tab fires `auxclick` and does not (same as
 *     Umami, same as the marketer's snippet).
 *   · once per click: the document sees each click exactly once in the capture phase, and a
 *     handler further down that stops propagation cannot hide it. `closest()` covers a click on
 *     the <svg> mark inside the footer link.
 *   · every WhatsApp link today is `AppLink external` — `target="_blank"` — so the page never
 *     unloads on the click. That is why there is no `preventDefault` + `event_callback`
 *     navigation like Google's stock click snippet: nothing to wait for, and copying it would
 *     turn the new-tab link into a same-tab one. The `transport_type: "beacon"` in lib/gads.ts
 *     is what would keep the ping alive if a link ever did navigate in-tab.
 *   · the success-panel link mounts only after a send; delegation covers it, no re-render needed.
 *   · a synthetic `.click()` fires it too — the DevTools-protocol probe recorded in
 *     features/analytics/CONTEXT.md relies on that.
 *   · under an ad blocker `window.gtag` still exists (the inline bootstrap defines it) and the
 *     event just queues; see lib/gads.ts. Not consent-gated: same recorded decision, same file.
 *
 * Mounted once per root layout, directly after <UmamiClicks />, outside I18nProvider (reads no
 * strings, no `dir` dependence). Renders nothing. No state and no refs, so the React Compiler
 * lint rules this repo runs as errors have nothing here to object to. */
export default function GoogleAdsClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a =
        e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!(a instanceof HTMLAnchorElement)) return;
      let url: URL;
      try {
        url = new URL(a.href);
      } catch {
        return;
      }
      if (isWhatsAppHost(url.hostname)) reportWhatsAppConversion();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
