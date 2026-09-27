/**
 * contactRules — the client-side validation and send path shared by the site's two contact
 * forms: the full one on /contact (ContactForm.tsx) and the compact one in the footer's closing
 * band (FooterContactForm.tsx).
 *
 * Extracted from ContactForm.tsx on 2026-09-22, when the second form arrived. Before that the
 * rules lived in exactly two places — that file and the API route — and a footer form with its
 * own copy would have made it three, the one arrangement the duplication note below exists to
 * prevent. Moving them changed no behaviour on /contact.
 *
 * ⚠️ VALIDATION IS STILL DUPLICATED ACROSS THE NETWORK, AND MUST BE. The same bounds and patterns
 * live in src/app/api/contact/route.ts. The client copy exists so a typo does not cost a round
 * trip; the server copy exists because the client copy is unenforceable. If a bound changes,
 * change both — the API is the one that counts.
 *
 * Plain module, no JSX and no hooks, so both forms can call it from event handlers.
 */

import type { Dict } from "@/lib/i18n/dictionary";
import { reportContactConversion } from "@/lib/gads";
import { trackEvent } from "@/lib/umami";

/** The `contact.form` namespace, in either locale. The footer receives it from the server. */
export type ContactFormDict = Dict["contact"]["form"];

export type FieldKey = "name" | "email" | "phone" | "company" | "role" | "message";
export type Values = Record<FieldKey, string>;
export type Errors = Partial<Record<FieldKey, string>>;

/* The order a visitor meets the fields in, top to bottom, in BOTH forms. Failed validation
   focuses the first bad field in this order. */
export const FIELD_ORDER: readonly FieldKey[] = [
  "name",
  "email",
  "phone",
  "company",
  "role",
  "message",
];

export const EMPTY_VALUES: Values = {
  name: "",
  email: "",
  phone: "",
  company: "",
  role: "",
  message: "",
};

/* Kept in step with src/app/api/contact/route.ts by hand. See the note above. */
export const LIMITS = {
  nameMax: 120,
  emailMax: 200,
  phoneMax: 40,
  /* Counted in DIGITS, not characters — the max is 40 so that "+972 (50) 000-0000" fits, but
     what makes a number a number is how many digits survive the formatting. 7 clears the
     shortest national numbers still in service; 20 is two past E.164's 15, which leaves room
     for someone who types an extension without being rejected for it. */
  phoneDigitsMin: 7,
  phoneDigitsMax: 20,
  shortMax: 120,
  /* No longer a validation rule — `message` has been optional since 2026-08-19. Kept because
     /contact's character counter still turns `signal` at this length. */
  messageMin: 10,
  messageMax: 4000,
} as const;

/* Deliberately permissive: one @, something either side, a dot in the domain, no whitespace.
   A stricter regex rejects real addresses, and the only test that actually settles whether an
   address exists is sending to it — which is what the form does. Same pattern server-side. */
export const EMAIL_RE = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;

/* ⚠️ DELIBERATELY NOT A PHONE-NUMBER PARSER, AND NOT libphonenumber. Two rules only: the string
   may contain nothing but digits and the punctuation people actually type into a phone field,
   and it must hold a plausible number of digits. Anything stricter rejects real numbers — every
   country writes them differently, and the only thing that settles whether a number reaches
   someone is messaging it, which is n8n's job downstream. Same pair server-side. */
export const PHONE_ALLOWED_RE = /^[+()\-.\s\d]+$/;
export const phoneDigits = (value: string) => value.replace(/\D/g, "").length;

/* `t.consent` is one template per locale carrying `{privacy}` and `{terms}`, because the two
   locales order them differently — English names the privacy policy first, Hebrew names תנאי
   השימוש first. A capturing group in the split pattern is what keeps the tokens in the output
   array, so the sentence rebuilds as [text, token, text, token, text] whatever the order.

   ⚠️ NOT `interpolate()`. That helper (src/lib/i18n/format.ts) fills the same `{…}` tokens but
   returns a STRING, and these two runs have to be anchors. Same convention, different renderer. */
export const CONSENT_SPLIT = /(\{privacy\}|\{terms\})/;

/** Every rule a submission must pass, as locale messages keyed by field. Empty means valid. */
export function validateContact(
  values: Values,
  e: ContactFormDict["errors"],
): Errors {
  const next: Errors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const message = values.message.trim();

  if (!name) next.name = e.nameRequired;
  else if (name.length > LIMITS.nameMax) next.name = e.nameTooLong;

  if (!email) next.email = e.emailRequired;
  else if (email.length > LIMITS.emailMax || !EMAIL_RE.test(email))
    next.email = e.emailInvalid;

  /* Required as of 2026-08-18 — the workflow behind this form opens a WhatsApp thread and
     cannot without it. Empty gets its own message; everything else is one "that is not a
     number", because a visitor cannot act on the difference between "too few digits" and
     "contains a letter" any better than on the general form. */
  if (!phone) next.phone = e.phoneRequired;
  else if (
    phone.length > LIMITS.phoneMax ||
    !PHONE_ALLOWED_RE.test(phone) ||
    phoneDigits(phone) < LIMITS.phoneDigitsMin ||
    phoneDigits(phone) > LIMITS.phoneDigitsMax
  )
    next.phone = e.phoneInvalid;

  if (values.company.trim().length > LIMITS.shortMax) next.company = e.tooLong;
  if (values.role.trim().length > LIMITS.shortMax) next.role = e.tooLong;

  /* Optional as of 2026-08-19 (user's call). Only the ceiling blocks — an empty brief is a
     valid submission. Same change server-side. */
  if (message.length > LIMITS.messageMax) next.message = e.messageTooLong;

  return next;
}

/* What a send came back as, already translated into what the form should do about it. */
export type SendResult =
  | { kind: "sent" }
  | { kind: "rate-limited" }
  /* The server rejected fields the client passed — a bound drifted, or the request was
     tampered with. `errors` may be EMPTY: a 400 whose only complaint is `consent` maps to no
     field, and the form shows its summary alone. */
  | { kind: "invalid"; errors: Errors }
  | { kind: "failed" };

/* Which form a submission came from — reported to Umami with "Form sent" and nowhere else. The
   values are what the Events page shows, so they are words, not keys. */
export type ContactFormSource = "contact page" | "footer";

/** POSTs one submission to /api/contact. Never throws — a network failure is `failed`. */
export async function sendContact(
  {
    values,
    trap,
    consent,
    form,
  }: { values: Values; trap: string; consent: boolean; form: ContactFormSource },
  e: ContactFormDict["errors"],
): Promise<SendResult> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        /* The honeypot travels under an innocuous name. */
        website: trap,
        /* Always `true` by the time this runs — the route rejects anything else. Sent so the
           consent is recorded at the boundary rather than only in the browser that gave it. */
        consent,
        /* Which language the visitor filled the form in, for the notification email. Read off
           the document rather than `useLocale()` so it is the served page's own `lang`. */
        locale: document.documentElement.lang,
      }),
    });

    if (res.ok) {
      /* ⚠️ THE GOOGLE ADS CONVERSION FIRES HERE AND NOWHERE ELSE (2026-09-22, user: "the
         conversion must fire only after the form has been successfully submitted and accepted
         by the backend"). Both forms — /contact and the footer — reach this line only on a 2xx
         from /api/contact, after their own `validateContact` pass, so a page visit, a click, a
         validation failure, an API failure or a refresh can none of them get here; and each
         accepted submit calls `sendContact` exactly once, so it fires once. `!trap`: the route
         deliberately answers the honeypot with a 200 so a bot cannot learn it was caught (see
         route.ts) — that "success" is not a conversion. See src/lib/gads.ts for the rest. */
      if (!trap) {
        reportContactConversion();
        /* Umami's "Form sent" rides the same gate (2026-09-27): once per accepted submission,
           never for the honeypot. `form` tells the two forms apart. See src/lib/umami.ts. */
        trackEvent("Form sent", { form });
      }
      return { kind: "sent" };
    }
    if (res.status === 429) return { kind: "rate-limited" };

    const body = (await res.json().catch(() => null)) as {
      fields?: Record<string, string>;
    } | null;

    if (res.status === 400 && body?.fields) {
      /* The server's verdict wins, but its messages are English-only strings meant for a log,
         so the visitor sees this locale's message for the same rule. Keys the client does not
         know — `consent` is one — are dropped here and surface as the form's summary. */
      const errors: Errors = {};
      for (const key of Object.keys(body.fields)) {
        if (!(FIELD_ORDER as readonly string[]).includes(key)) continue;
        errors[key as FieldKey] =
          key === "email"
            ? e.emailInvalid
            : key === "phone"
              ? e.phoneInvalid
              : e.tooLong;
      }
      return { kind: "invalid", errors };
    }

    return { kind: "failed" };
  } catch {
    /* Offline, DNS, an aborted navigation. Indistinguishable from a 500 to the visitor, and
       the advice is the same either way: mail us directly. */
    return { kind: "failed" };
  }
}
