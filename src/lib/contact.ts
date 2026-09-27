/**
 * The company's real contact details, in ONE place.
 *
 * WHY THIS FILE EXISTS (2026-08-13). These four values lived as a `CONTACT` const inside
 * Footer.tsx. That was fine while the footer was the only thing that knew them; it stopped
 * being fine when /contact grew an aside that lists the same four. Two copies of a phone
 * number drift, and the drift is silent — nothing type-checks a string against another
 * string in a different file.
 *
 * ⚠️ THE EMAIL CHANGED WHEN IT MOVED. Footer.tsx carried `info@clixsolution.com`, without
 * the hyphen, which is what docs/reference/clixsolutions/ prints on the real site. The user
 * confirmed on 2026-08-13 that the hyphenated `info@clix-solution.com` is the live inbox and
 * that the reference capture is stale. So the footer's mailto changes as a side effect of
 * this extraction, deliberately and with permission — it is not a typo introduced here.
 * The form's recipient is the same address; see src/app/api/contact/route.ts.
 *
 * These are LINK TARGETS and identifiers, not copy. They are not translated and no key for
 * them exists in the dictionaries — an email address is the same string in every locale.
 * The LABELS beside them ("Email", "אימייל") are copy and do live in the dictionary.
 */

/** The inbox every enquiry lands in — the footer's mailto and the form's recipient. */
export const CONTACT_EMAIL = "info@clix-solution.com";

/** +972 55-948-3457, the number as a human reads it. */
export const CONTACT_PHONE = "+972 55-948-3457";

export const CONTACT = {
  email: `mailto:${CONTACT_EMAIL}`,
  instagram: "https://www.instagram.com/clix_solution/",
  /* ⚠️ A PERSONAL PROFILE, NOT A COMPANY PAGE (added 2026-08-16, user-supplied). Every other
     entry here is an org-level account; this one is `/in/…`, an individual's. It is the
     account the user gave, so it is the account that ships — but if clix ever opens a
     `/company/…` page, this is the line to change, and the footer label stays "LinkedIn"
     either way. */
  linkedin: "https://www.linkedin.com/in/ido-elmaliach-748413334/",
  /* The same number in wa.me's digits-only form. Kept next to CONTACT_PHONE rather than
     derived from it: stripping punctuation with a regex would be three lines of cleverness
     protecting one literal that changes when the company changes phone provider. */
  whatsapp: "https://wa.me/972559483457",
} as const;

/* Hosts a WhatsApp chat link lives on. Shared by the Umami click listener (UmamiClicks.tsx) and
   the Google Ads click conversion (GoogleAdsClicks.tsx) so the two counts agree by construction.
   Hostname of the RESOLVED url, not a substring of the href: a link that merely mentions wa.me
   in its query string is not a WhatsApp link, and `api.whatsapp.com` needs no second pattern.
   A superset of the marketer's "wa.me / api.whatsapp.com" (2026-09-27): `web.` / `chat.` count
   too; the site's own links are all `CONTACT.whatsapp` above. */
export function isWhatsAppHost(hostname: string): boolean {
  return (
    hostname === "wa.me" ||
    hostname === "whatsapp.com" ||
    hostname.endsWith(".whatsapp.com")
  );
}
