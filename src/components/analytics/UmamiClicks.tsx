"use client";

import { useEffect } from "react";
import { trackEvent, type UmamiEvent } from "@/lib/umami";
import { isWhatsAppHost } from "@/lib/contact";

/* Every click the boss asked to count, named from the link it lands on.
 *
 * ONE listener on the document instead of an attribute on each of the ~15 links, so a Contact
 * button added to a new page later is counted without anyone remembering to tag it:
 *
 *   tel:                     → Phone
 *   mailto:                  → Email
 *   wa.me, *.whatsapp.com    → WhatsApp   (`isWhatsAppHost()` in lib/contact.ts, shared with
 *                                          GoogleAdsClicks.tsx since 2026-09-27 so the Ads
 *                                          conversion and this event count the same clicks)
 *   /contact, /he/contact    → Contact button, with `where`: menu | footer | page
 *
 * `where` is read off the landmark the link sits in. The site has exactly one `<header>` (Nav.tsx —
 * the bar AND the mobile panel live inside it) and one `<footer>` (Footer.tsx), so anything else is
 * a CTA in a page body. The page itself needs no property: Umami stores the URL with every event.
 * ⚠️ If a second `<header>` or `<footer>` ever appears in a page body, its Contact links will be
 * mislabelled — give the nav a data attribute and key on that instead.
 *
 * CAPTURE phase, so a handler further down that stops propagation cannot hide a click from it; and
 * it never calls `preventDefault`, which is the whole reason this exists instead of Umami's
 * `data-umami-event` (see lib/umami.ts). A keyboard Enter on a link fires `click` and is counted; a
 * middle-button open-in-new-tab fires `auxclick` and is not. Mounted once per root layout; renders
 * nothing. */

const CONTACT_PATH = /^\/(?:he\/)?contact\/?$/;

function classify(
  a: HTMLAnchorElement,
): [UmamiEvent, Record<string, string>?] | null {
  const href = a.getAttribute("href") ?? "";
  if (href.startsWith("tel:")) return ["Phone"];
  if (href.startsWith("mailto:")) return ["Email"];

  let url: URL;
  try {
    url = new URL(a.href);
  } catch {
    return null;
  }
  if (isWhatsAppHost(url.hostname)) return ["WhatsApp"];
  if (url.origin === window.location.origin && CONTACT_PATH.test(url.pathname)) {
    const where = a.closest("header")
      ? "menu"
      : a.closest("footer")
        ? "footer"
        : "page";
    return ["Contact button", { where }];
  }
  return null;
}

export default function UmamiClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a =
        e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!(a instanceof HTMLAnchorElement)) return;
      const hit = classify(a);
      if (hit) trackEvent(...hit);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
