"use client";

/**
 * ContactForm — the form on /contact, and the only real form on this site. Owns BOTH columns:
 * the sticky brief-rail and the form panel beside it.
 *
 * Spec: features/contact-page/FEATURE.md · memory: features/contact-page/CONTEXT.md
 * Reference (structure and copy only): docs/reference/clixsolutions/pages/contact.html
 *
 * WHAT IS TAKEN FROM THE REFERENCE AND WHAT IS NOT.
 * Taken: the field list and its order, the five placeholders, and which three fields are
 * `required`. Those are facts read off the saved HTML, not choices.
 * ⚠️ THE REFERENCE'S TWO PILL GROUPS ARE GONE (2026-09-22, user's call). "What's relevant for
 * you?" (six multi-select pills) and "Budget range" (four single-select pills) were removed
 * from the form, the dictionaries and the API together; the form is two steps now — About you,
 * then the brief. features/contact-page/CONTEXT.md has the entry.
 * Not taken: every pixel. The reference is a rounded card with grey filled inputs and a violet
 * gradient pill button; this is the site's own vocabulary. Requested explicitly by the user on
 * 2026-08-13 ("our own design, also our own layout").
 *
 * ─── REDESIGNED 2026-08-17 ───────────────────────────────────────────────────────────────────
 *
 * The page shipped on 2026-08-13 and, as features/contact-page/CONTEXT.md records, NOBODY EVER
 * LOOKED AT IT. What a look found: five identical `border-t hairline pt-8` blocks stacked
 * ~1400px tall, numerals at 12px `mark` (3.41:1, effectively invisible), no progress or
 * completion signal of any kind, and the site's terminal CTA rendered `w-min` — the smallest
 * element in its own column.
 *
 * The user lifted all four constraints FEATURE.md recorded as deliberate for this page —
 * motion, an accent colour, elevation, and a red for errors — and asked for the visual language
 * of /company Block 3. So: a `bone` band, one white elevated panel, groups that read as
 * numbered STEPS which visibly complete, `signal` teal for on-track and `alert` red for wrong.
 *
 * ⚠️ THE ACCENT IS A STATE CHANNEL, NOT DECORATION, and the restraint clause is in globals.css
 * beside the two tokens. Short version: `signal` paints only step chips, focus underlines, the
 * progress bar, the counters and the success mark; `alert` paints only invalid state. Headings,
 * body, labels, placeholders, consent and THE SUBMIT BUTTON stay `ink`/`muted`. The button
 * stays `bg-ink` because that is this site's primary button on a light ground (/product,
 * /company) — an accent-filled submit would be the accent doing decoration.
 *
 * ⚠️ NO GSAP, AND NO ANIMATION LIBRARY AT ALL. Every motion here is a one-shot mount reveal or
 * a state transition; nothing is scroll-driven, scrubbed or pinned. The keyframes live in
 * globals.css under a `(prefers-reduced-motion: no-preference)` block — read the long note
 * there, because the global reduced-motion clamp does NOT zero `animation-delay` and a
 * staggered entrance authored outside that block gives reduced-motion visitors a timed flash of
 * blank content.
 *
 * ⚠️ MONO IS ON THE NUMERALS AND THE COUNTERS ONLY. `--font-mono` (Fragment Mono) has no Hebrew
 * coverage — its @font-face unicode-ranges in src/app/fonts.css are Latin, Greek and Cyrillic,
 * not U+0590–05FF — so anything Hebrew set in it falls back to the OS monospace mid-line. `01`,
 * `02` and `120 / 4000` are Latin digits and punctuation in both locales, so
 * they are safe and they are the whole of mono's use here. Legends, labels and errors are
 * `font-sans`. The check and alert marks are SVG paths for the same reason — see
 * contactGlyphs.tsx. Same note in ContactChannels.tsx.
 *
 * ⚠️ ERRORS NOW HAVE A COLOUR, AND COLOUR IS STILL NOT THE ONLY SIGNAL. Until today this design
 * system had no red, so an invalid field stated itself by thickening its underline to `ink` —
 * which is the SAME value `focus` used, making the two states visually identical. That is the
 * defect `--color-alert` fixes. WCAG 1.4.1 was satisfied before the red and still is: an
 * invalid field carries the alert glyph, the message text, `aria-invalid`, `aria-describedby`
 * AND its step chip. The colour is added on top of those, never instead of one.
 *
 * ⚠️ VALIDATION IS DUPLICATED, AND MUST BE. The client rules live in ./contactRules.ts (moved
 * there 2026-09-22, when the footer's compact form arrived and needed the same ones) and again in
 * src/app/api/contact/route.ts. The client copy exists so a typo does not cost a round trip;
 * the server copy exists because the client copy is unenforceable. If a bound changes, change
 * both — the API is the one that counts. The step-completion rules below DERIVE from those
 * same constants and are not a third copy.
 */

import {
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { usePageDict } from "@/lib/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/format";
import AppLink from "@/components/ui/AppLink";
import { CONTACT, CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";

import { AlertGlyph, CheckGlyph } from "./contactGlyphs";
import {
  CONSENT_SPLIT,
  EMAIL_RE,
  FIELD_ORDER,
  LIMITS,
  PHONE_ALLOWED_RE,
  phoneDigits,
  sendContact,
  validateContact,
  type Errors,
  type FieldKey,
} from "./contactRules";

/* The character counter turns `alert` here. 90% of the maximum — far enough in that it is a
   genuine warning rather than ambient noise, early enough that 400 characters remain to finish
   a sentence in. */
const MESSAGE_WARN_AT = Math.floor(LIMITS.messageMax * 0.9);

/* Below this many characters remaining, and only then, the textarea's live region starts
   speaking. Announcing from character one would make a screen reader recite the whole tail. */
const CHARS_ANNOUNCE_UNDER = 200;

/* ── the consent sentence's two links ─────────────────────────────────────────────────────
   Rebuilt from `t.consent` with CONSENT_SPLIT — ./contactRules.ts explains the template.

   Inline legal links inside a 12px muted sentence, so they are UNDERLINED rather than merely
   recoloured — `muted` to `ink` alone is not a strong enough signal at this size, and there is
   no other affordance in a run of body text. Focus ring is the page's own. */
const CONSENT_LINK = `text-ink underline underline-offset-2 transition-colors duration-300
                      [transition-timing-function:var(--ease-rogo)] hover:text-muted
                      focus-visible:rounded-[2px] focus-visible:ring-2 focus-visible:ring-signal
                      focus-visible:ring-offset-2 focus-visible:ring-offset-paper
                      focus-visible:outline-none`;

/* ══ the draft ═══════════════════════════════════════════════════════════════════════════
   Added 2026-08-18, immediately after the consent checkbox, and BECAUSE of it. The user asked
   the right question: the consent label now carries two links, `AppLink` routes them
   client-side, and a client-side navigation UNMOUNTS this form. Before those links there was
   no reason to leave the page half-filled; now there are two, sitting next to the one control
   a visitor is required to touch. Coming back gave them an empty form.

   `sessionStorage`, NOT `localStorage`, and the difference is the whole privacy argument: this
   holds a name, an email address and a phone number, on the page whose subject is a privacy
   policy. Session storage is per-tab and dies with the tab, so the data cannot outlive the
   visit that created it, cannot be read by another tab, and is gone the moment the browser
   closes. It is also cleared explicitly the instant a submission succeeds — see `onSubmit`.

   NOT GATED ON THE COOKIE BANNER. A draft of a form the visitor is actively typing into is
   functional storage they initiated themselves — the shopping-cart case — not analytics or
   tracking, so "essential only" does not exclude it. Stated here rather than left to be
   re-litigated. If that call is ever reversed, the gate belongs in `writeDraft` alone.

   ⚠️ THE HONEYPOT IS DELIBERATELY NOT PERSISTED. It is always empty for a human, and a
   restored value would either do nothing or resurrect a false positive.

   ⚠️ THE CONSENT TICK *IS* PERSISTED, which is a judgement call worth naming. The argument for
   clearing it is that consent should be a fresh act; the argument for keeping it — which wins —
   is that the single likeliest reason to leave this page mid-form is to go and READ the two
   documents the tick is about, and making someone re-tick on their way back punishes exactly
   the behaviour the links exist to encourage. It is the same tab, the same session, and their
   own action minutes earlier. The server still requires `consent === true` on every submission.
   ══════════════════════════════════════════════════════════════════════════════════════════ */

type Draft = {
  values: Record<FieldKey, string>;
  consent: boolean;
};

const EMPTY_DRAFT: Draft = {
  values: { name: "", email: "", phone: "", company: "", role: "", message: "" },
  consent: false,
};

/** Namespaced and versioned. A shape change bumps the suffix rather than trying to migrate.
    NOT bumped when `needs` and `budget` left the shape (2026-09-22): a v1 draft that still
    carries them parses cleanly, because `parseDraft` reads only the keys it knows. */
const DRAFT_KEY = "clix-contact-draft.v1";

/* ⚠️ STORAGE THROWS, it does not return null, when the browser refuses it — Safari private
   mode, partitioned storage, a hardened profile. `CookieBanner.tsx` documents the same trap.
   Both accessors swallow: failing to remember a draft must never take the form down. */
function readDraftRaw(): string | null {
  try {
    return window.sessionStorage.getItem(DRAFT_KEY);
  } catch {
    return null;
  }
}

/* ── the store ────────────────────────────────────────────────────────────────────────────
   `useSyncExternalStore` rather than `useState` + a read-on-mount `useEffect`, for the two
   reasons CookieBanner.tsx sets out at greater length:

     1. This project's lint runs the React Compiler rules, and `react-hooks/set-state-in-effect`
        rejects the read-storage-into-state-on-mount idiom outright.
     2. Its third argument hands us the SSR/hydration split for free. `/contact` is statically
        prerendered with EMPTY inputs; `getServerSnapshot` returns null, so the hydration render
        also sees an empty form and the markup matches on both sides. React then re-renders with
        the real snapshot immediately afterwards, and the draft appears. A lazy `useState`
        initialiser reading storage would have filled the inputs during hydration and mismatched
        every one of them.

   The snapshot is the RAW STRING, never a parsed object: `getSnapshot` is called on every
   render and must return something React can compare by identity. A fresh object each call is
   the classic infinite loop. */
let draftListeners: Array<() => void> = [];

function subscribeDraft(onChange: () => void) {
  draftListeners = [...draftListeners, onChange];
  return () => {
    draftListeners = draftListeners.filter((l) => l !== onChange);
  };
}

const getDraftSnapshot = (): string | null => readDraftRaw();
const getDraftServerSnapshot = (): string | null => null;

function writeDraft(draft: Draft | null) {
  try {
    if (draft === null) window.sessionStorage.removeItem(DRAFT_KEY);
    else window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* Storage blocked or full. The form keeps working from React state for this page view;
       only the crash protection is lost, and silently, which is the correct failure here. */
  }
  draftListeners.forEach((l) => l());
}

/* ⚠️ EVERY FIELD IS RE-VALIDATED ON THE WAY OUT OF STORAGE. `sessionStorage` is writable by
   anything running on this origin — including the visitor with devtools open — so a stored
   draft is untrusted input, exactly like a request body. A `values` that is not an object or a
   `message` of 40MB would otherwise reach React state and break rendering rather than be
   rejected at the boundary. Lengths are clamped to the same `LIMITS` the form validates
   against. */
function parseDraft(raw: string | null): Draft | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const d = parsed as Record<string, unknown>;

  const rawValues =
    typeof d.values === "object" && d.values !== null
      ? (d.values as Record<string, unknown>)
      : {};
  const take = (key: FieldKey, max: number) => {
    const v = rawValues[key];
    return typeof v === "string" ? v.slice(0, max) : "";
  };

  return {
    values: {
      name: take("name", LIMITS.nameMax),
      email: take("email", LIMITS.emailMax),
      phone: take("phone", LIMITS.phoneMax),
      company: take("company", LIMITS.shortMax),
      role: take("role", LIMITS.shortMax),
      message: take("message", LIMITS.messageMax),
    },
    consent: d.consent === true,
  };
}

/* `FieldKey`, `Errors` and `FIELD_ORDER` are ./contactRules.ts's, shared with the footer form.

   Which group each field belongs to, so a field error can colour its step chip. Index into
   `steps`: 0 is group 01 (about you), 1 is group 02 (the brief). */
const FIELD_GROUP: Record<FieldKey, number> = {
  name: 0,
  email: 0,
  phone: 0,
  company: 0,
  role: 0,
  message: 1,
};

/* Four states, one attribute. `active` is derived in JS rather than from a `focus-within`
   variant SO THAT PRECEDENCE IS EXPLICIT: invalid > complete > active > pending. Written as CSS
   variants those four would be four independent rules whose winner depends on the order
   Tailwind happens to emit them in, and the failure mode — a group that is BOTH focused and
   invalid showing the wrong one — is exactly the case that matters most. */
type StepState = "pending" | "active" | "complete" | "invalid";

/* ── shared control classes ───────────────────────────────────────────────────────────────
   The underline is `border-b-2` in BOTH states and only its colour changes. A 1px rule that
   thickens to 2px on focus moves the text inside a fixed-height box, which is visible as a
   jitter on every focus; holding the width and swapping colours costs nothing and reads
   stronger.

   ⚠️ VALIDITY OWNS THE UNDERLINE OUTRIGHT — an invalid field stays `alert` even while focused,
   rather than reverting to the focus colour. That is safe only because focus is signalled three
   OTHER ways at the same time: the caret, the label darkening to `ink`, and the step chip. It
   is also the point of the redesign: `focus` and `invalid` were the same `ink` underline
   before, and telling them apart is the whole reason `alert` exists. */
/* ⚠️ `placeholder:text-muted`, NOT `text-mark`, AND THAT WAS MEASURED. `mark` #8b8b8b is the
   logotype grey and is 3.41:1 on `paper` — it fails AA for normal text, and its own token
   comment says "NEVER for prose". A placeholder is text a sighted user reads to know what the
   field wants, so it is prose. `muted` #737373 is 4.74:1 and passes — ON WHITE. It would be
   4.24:1 and FAIL on the `bone` band outside this panel, which is why the panel is white; see
   ContactBody.tsx. Checked with `node docs/reference/contrast-check.js`. */
const FIELD_BASE =
  "h-11 w-full rounded-none border-0 border-b-2 bg-transparent px-0 font-sans text-[16px] " +
  "text-ink placeholder:text-muted transition-[border-color] duration-300 " +
  "[transition-timing-function:var(--ease-rogo)] focus:outline-none";

function fieldClass(invalid: boolean) {
  return `${FIELD_BASE} ${invalid ? "border-alert" : "border-hairline focus:border-signal"}`;
}

/* ── the step chip ────────────────────────────────────────────────────────────────────────
   28x28, `rounded-[6px]` — the button and textarea radius, already this page's control radius.
   Replaces a 12px `text-mark` numeral that was 3.41:1 and did no visual work whatsoever.

   ⚠️ THE NUMERAL AND THE CHECK ARE BOTH ABSOLUTELY POSITIONED AND CROSSFADE. Swapping one for
   the other in the flow would resize the chip by a hair as a group completes, and the whole
   group head would shift with it — a layout jump triggered by typing, which is the worst
   possible moment for one. Stacking them makes completion a pure opacity change. */
const CHIP_STATE: Record<StepState, string> = {
  pending: "border-hairline text-muted",
  active:
    "border-signal text-signal bg-[color-mix(in_srgb,var(--color-signal)_8%,white)]",
  complete: "border-signal bg-signal text-paper",
  invalid:
    "border-alert text-alert bg-[color-mix(in_srgb,var(--color-alert)_8%,white)]",
};

function StepChip({ index, state }: { index: string; state: StepState }) {
  const complete = state === "complete";
  return (
    <span
      aria-hidden="true"
      className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border
                  transition-[background-color,border-color,color] duration-300
                  [transition-timing-function:var(--ease-rogo)] ${CHIP_STATE[state]}`}
    >
      <span
        className={`absolute font-mono text-[12px] tabular-nums transition-opacity duration-200
                    [transition-timing-function:var(--ease-rogo)]
                    ${complete ? "opacity-0" : "opacity-100"}`}
      >
        {index}
      </span>
      <CheckGlyph
        className={`absolute h-3.5 w-3.5 transition-opacity duration-200
                    [transition-timing-function:var(--ease-rogo)]
                    ${complete ? "opacity-100" : "opacity-0"}`}
      />
    </span>
  );
}

/* ── one group: rule, chip, legend, state slot, controls ──────────────────────────────────
   `legendId` is the legend's id, so a control inside can name itself from the visible text
   instead of repeating it in an aria-label.

   ⚠️ THE FIRST GROUP DROPS ITS RULE. `first:border-t-0 first:pt-0` — the panel already has a
   2px progress bar across its top edge, and a hairline 40px below it read as a double line. */
function Group({
  index,
  legend,
  legendId,
  state,
  slot,
  onFocus,
  onBlur,
  children,
}: {
  index: string;
  legend: string;
  legendId?: string;
  state: StepState;
  slot?: React.ReactNode;
  onFocus?: () => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      /* React's onFocus/onBlur map to focusin/focusout, which bubble — so these fire for any
         control inside the group and drive the `active` chip state. */
      onFocus={onFocus}
      onBlur={onBlur}
      data-state={state}
      className="flex w-full flex-col items-start gap-6 border-t border-hairline pt-8 first:border-t-0 first:pt-0"
    >
      <div className="flex w-full flex-row items-center gap-3">
        <StepChip index={index} state={state} />
        {/* 16px, not the 14 it was. The reason five identical blocks READ as five identical
            blocks is that a group head weighed exactly what a field label weighs. 16/medium/ink
            against 14/medium/muted is a real step in the hierarchy, and it costs nothing. */}
        <p
          id={legendId}
          className="font-sans text-[16px] font-medium text-ink"
          style={{ lineHeight: "1.3em", letterSpacing: "-0.02em" }}
        >
          {legend}
        </p>
        {slot ? (
          /* `ms-auto`, not `ml-auto`: this sits at the inline END of the row, which is the right
             edge in English and the left edge in Hebrew. */
          <span className="ms-auto flex shrink-0 items-center">{slot}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/* The small grey word in a state slot — "Optional" on group 02, the brief. `muted` #737373 is 4.74:1 on
   the white panel and passes; it would fail on the `bone` band outside it. */
function SlotHint({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-sans text-[12px] text-muted"
      style={{ lineHeight: "1.3em", letterSpacing: "-0.02em" }}
    >
      {children}
    </span>
  );
}

export default function ContactForm() {
  const dict = usePageDict("contact");
  const t = dict.form;

  /* `useId` rather than hand-written ids: this component is mounted once today, but a
     duplicated id silently breaks every label and aria-describedby association, and that is
     not a failure mode worth leaving open to a future second mount. */
  const uid = useId();
  const id = (suffix: string) => `${uid}-${suffix}`;

  /* ── the form's own data, restored from the draft ───────────────────────────────────────
     ⚠️ FOUR `useState`s BECAME ONE SHADOWED VALUE (2026-08-18). It reads oddly and the reason
     is hydration, not taste. `restored` comes from the store above, which returns null on the
     server and during the hydration render, so the prerendered empty form matches its markup
     exactly; the real draft arrives on the re-render immediately after. `edited` is null until
     the visitor touches something, and shadows the draft from that moment on — so a stored
     value can never overwrite something being typed, and there is no effect anywhere in the
     restore path.

     Everything below reads `values` / `consent` exactly as before. Only
     the WRITES changed: they all go through `commit`, which stores as it sets. */
  const storedRaw = useSyncExternalStore(
    subscribeDraft,
    getDraftSnapshot,
    getDraftServerSnapshot,
  );
  const restored = useMemo(
    () => parseDraft(storedRaw) ?? EMPTY_DRAFT,
    [storedRaw],
  );
  const [edited, setEdited] = useState<Draft | null>(null);
  const draft = edited ?? restored;
  const { values, consent } = draft;

  /* One writer, so a field can never be set without being saved. Called only from event
     handlers — never from render, never from an effect. */
  const commit = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setEdited(next);
    writeDraft(next);
  };

  const [errors, setErrors] = useState<Errors>({});
  /* One value rather than three booleans, so an impossible pair (sending AND sent) cannot be
     represented at all. */
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  /* Which group currently holds focus, or null. Drives the `active` chip state. */
  const [focusedStep, setFocusedStep] = useState<number | null>(null);

  /* The honeypot. A real browser never types into a field it cannot see; a bot that fills every
     input by name does. Not a captcha and not claimed to be one. */
  const [trap, setTrap] = useState("");

  /* ⚠️ `consent` LIVES IN THE DRAFT ABOVE BUT IS DELIBERATELY NOT ONE OF `values`, AND IS NOT
     A `FieldKey`. That union describes the six text fields the API stores, echoes back in its
     400 body and walks in `FIELD_ORDER`; consent is a gate whose only value is `true`. Folding
     it in would have put it in the step chips, in the focus-the-first-bad-field walk and in the
     server's field map, and it belongs in none of the three. Its error is its own state for the
     same reason — and is NOT persisted, because a restored draft has not been submitted yet. */
  const [consentError, setConsentError] = useState<string | null>(null);

  const successRef = useRef<HTMLDivElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const setField = (key: FieldKey, value: string) => {
    commit({ values: { ...values, [key]: value } });
    /* Clear that field's error the moment it is touched. Re-validating on every keystroke would
       shout at someone halfway through typing an address. */
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      /* The summary banner is only true while at least one field error stands. Clearing the
         last one has to clear the banner too, or it contradicts the form beneath it. */
      if (Object.keys(next).length === 0) setFormError(null);
      return next;
    });
  };

  /* The rules themselves are ./contactRules.ts's `validateContact`, shared with the footer form
     since 2026-09-22. Kept as a local name because the submit path, `canSubmit` and the notes
     below all call it `validate()`. */
  const validate = (): Errors => validateContact(values, t.errors);

  /* ── step completion ────────────────────────────────────────────────────────────────────
     ⚠️ DERIVED FROM `LIMITS` AND `EMAIL_RE`, NOT A SECOND SET OF RULES. `validate()` above is
     untouched and remains the only thing that decides whether the form may be submitted; this
     is a read of the same constants for display. If the two ever disagree, this is the one that
     is wrong. Company and Role are optional and are deliberately not part of step 01's test. */
  const steps: readonly boolean[] = [
    /* Phone joined this test on 2026-08-18, when it became required. A step chip that reads
       `complete` on a group that will fail submit is the one bug this derived-from-LIMITS
       arrangement exists to prevent. */
    values.name.trim().length > 0 &&
      EMAIL_RE.test(values.email.trim()) &&
      PHONE_ALLOWED_RE.test(values.phone.trim()) &&
      phoneDigits(values.phone) >= LIMITS.phoneDigitsMin,
    /* Optional since 2026-08-19, so the step completes the moment something is there, not at
       a minimum length that no longer gates submission. */
    values.message.trim().length > 0,
  ];
  const doneCount = steps.filter(Boolean).length;

  /* ── may the form be sent? ───────────────────────────────────────────────────────────────
     ⚠️ THIS IS `validate()` RE-RUN, NOT `steps` ABOVE. The chips are display state and say so;
     this is the button's own test and it has to agree with the submit path exactly, or the
     button enables on a form the server will reject. Re-running the real rules is what
     guarantees that — it is a handful of length checks and two regexes, per render, which is
     nothing beside the alternative of a second copy of the rules drifting from the first.

     Note what it does NOT include, which is not an oversight: `message` has been optional
     since 2026-08-19. Only the three required fields plus the consent box gate the button. */
  const canSubmit = Object.keys(validate()).length === 0 && consent;

  /* Precedence, stated once: invalid > complete > active > pending. */
  const stepState = (i: number): StepState => {
    const hasError = FIELD_ORDER.some((k) => errors[k] && FIELD_GROUP[k] === i);
    if (hasError) return "invalid";
    if (steps[i]) return "complete";
    if (focusedStep === i) return "active";
    return "pending";
  };

  /* `relatedTarget` is where focus is GOING. Without this check, tabbing between two fields in
     the same group fires blur-then-focus and the chip flickers out of `active` for a frame. */
  const groupBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setFocusedStep(null);
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    setFormError(null);
    setConsentError(null);
    const found = validate();
    /* ⚠️ THIS PATH IS STILL REACHABLE WITH THE BUTTON SHOWING AS DISABLED, AND THAT IS THE
       WHOLE POINT — see the `aria-disabled` note on the button. A visitor who clicks a button
       that looks dead gets told what is wrong instead of nothing at all. */
    const missingConsent = !consent;
    if (Object.keys(found).length > 0 || missingConsent) {
      setErrors(found);
      if (missingConsent) setConsentError(t.errors.consentRequired);
      /* ⚠️ THE ALWAYS-MOUNTED ALERT REGION NOW SPEAKS ON THIS PATH TOO. It used to stay silent
         on client-side failure — the most common failure there is — so a screen reader user got
         a form that simply refused to submit with no spoken reason, and only the per-field
         messages, which are below and behind them. */
      setFormError(t.errors.summary);
      /* Move focus to the first bad field. Without this a keyboard user is left standing on the
         submit button with the errors above and behind them. The checkbox is the fallback
         rather than a case of its own: it sits below all six fields, so it is the first bad
         thing only when every field passed. */
      const first = FIELD_ORDER.find((k) => found[k]);
      const target = first
        ? document.getElementById(id(first))
        : consentRef.current;
      target?.focus();
      /* ⚠️ THE GLOBAL `scroll-behavior: auto !important` DOES NOT REACH THIS. That rule
         governs CSS-driven scrolling; a JS `behavior` option is a separate channel and wins.
         So reduced motion has to be read here explicitly, or this smooth-scrolls a visitor
         who asked the whole site not to. */
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      target?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "center",
      });
      return;
    }

    setStatus("sending");
    /* The request and the reading of its response are ./contactRules.ts's `sendContact`, shared
       with the footer form. It never throws; a network failure comes back as `failed`. */
    const result = await sendContact(
      { values, trap, consent, form: "contact page" },
      t.errors,
    );

    if (result.kind === "sent") {
      setStatus("sent");
      /* ⚠️ THE ONE PLACE THE DRAFT IS DELETED, and it is deliberately here rather than in a
         cleanup: the enquiry is now the business's problem, so holding a copy of the
         visitor's name, email and phone in their browser buys nothing and costs privacy. Any
         other exit — a navigation, a reload, a crash — is exactly the case the draft exists
         for and must NOT clear it. `writeDraft(null)` removes the key outright. */
      writeDraft(null);
      /* The form leaves the DOM on the next render, so focus has to be placed deliberately or
         it falls to <body> and the confirmation is never announced. The panel is also
         `role="status"`, which covers the case where focus lands elsewhere.
         ⚠️ UNCONDITIONAL — focus management is not motion and has no reduced-motion variant. */
      requestAnimationFrame(() => successRef.current?.focus());
      return;
    }

    setStatus("idle");
    if (result.kind === "rate-limited") {
      setFormError(t.errors.rateLimited);
    } else if (result.kind === "invalid") {
      /* The server disagreed with the client's own pass — a bound drifted, or the request was
         tampered with. Its verdict wins, already mapped to this locale's messages. */
      setErrors(result.errors);
      setFormError(t.errors.summary);
    } else {
      setFormError(t.errors.failed);
    }
  }

  const messageInvalid = Boolean(errors.message);
  const messageLen = values.message.length;
  const messageRemaining = LIMITS.messageMax - messageLen;

  /* ── the brief-rail ─────────────────────────────────────────────────────────────────────
     /company Block 3's sticky heading column, in behaviour and in structure.

     ⚠️ TWO BOXES, NOT ONE, AND THE OUTER ONE IS WHY THE PIN WORKS: it is the flex item and it
     STRETCHES to the row height, which is the travel the sticky child moves within. An
     `items-start` or `self-start` anywhere on the row container collapses it to content height
     and the heading never pins at all. Both are absent from ROOT below and must stay absent.

     ⚠️ THE STICKY OFFSET CLEARS THE HEADER AT ITS TALLEST, NOT ITS SHORTEST. The nav's banner
     eases out on the way down and back IN on the way up, so the fixed header is 70px scrolling
     down and 115px the instant you scroll up. This page previously used `top-[198px]`, which was
     the HERO's padding borrowed — it clears the banner, but parks the rail 67px lower than it
     needs to. `--nav-peak-h` is derived in globals.css; +16 is the gutter step. Set inline and
     ungated on purpose: below 1200 the element is `static`, so `top` is inert there. */
  const rail = (
    <div className="w-full desktop:w-[380px] desktop:shrink-0">
      <div
        className="contact-rise flex w-full flex-col items-start gap-4 desktop:sticky"
        style={{ top: "calc(var(--nav-peak-h) + 16px)" }}
      >
        <h2
          className="w-full font-display text-[32px] font-normal text-ink tablet:text-[40px] desktop:text-[44px]"
          style={{ lineHeight: "110%", letterSpacing: "-0.05em" }}
        >
          {dict.panel.title}
        </h2>
        {/* ⚠️ `ink-soft`, NOT `muted`, AND THIS IS THE MEASURED ONE. This paragraph sits on the
            `bone` band, where `muted` #737373 is 4.24:1 and FAILS AA. `ink-soft` #383838 is
            10.49:1. Every `muted` on this page is inside the white panel for this reason; see
            ContactBody.tsx's header. Do not "unify" this back. */}
        <p
          className="w-full font-sans text-[16px] font-normal text-ink-soft desktop:text-[18px]"
          style={{ lineHeight: "130%", letterSpacing: "-0.02em" }}
        >
          {dict.panel.intro}
        </p>

        {/* The live step list. `hidden desktop:flex` — below 1200 the rail's heading stacks
            above the panel and a horizontal step strip under it would be clutter, while the
            panel's own chips and progress bar already carry completion at every width.
            `aria-hidden`: it duplicates the two legends inside the form, which are real
            headings with real controls under them; announcing them twice helps nobody. */}
        <ol
          aria-hidden="true"
          className="mt-4 hidden w-full list-none flex-col p-0 desktop:flex"
        >
          {[t.groups.about, t.groups.brief].map(
            (legend, i) => {
              const state = stepState(i);
              return (
                <li
                  key={legend}
                  /* `border-s-2`, not `border-l-2`: the marker sits at the inline START, which
                     is the left edge in English and the right edge in Hebrew. */
                  className={`contact-rise flex flex-row items-center gap-3 border-s-2 py-2 ps-4
                              transition-[border-color,color] duration-300
                              [transition-timing-function:var(--ease-rogo)]
                              ${
                                state === "invalid"
                                  ? "border-alert text-alert"
                                  : state === "complete" || state === "active"
                                    ? "border-signal text-ink"
                                    : "border-hairline text-ink-soft"
                              }`}
                  style={{ animationDelay: `${250 + i * 60}ms` }}
                >
                  <StepChip index={String(i + 1).padStart(2, "0")} state={state} />
                  <span
                    className="font-sans text-[14px] font-medium"
                    style={{ lineHeight: "1.3em", letterSpacing: "-0.02em" }}
                  >
                    {legend}
                  </span>
                </li>
              );
            },
          )}
        </ol>

        {/* ⚠️ THE REPLY PROMISE MOVED FORWARD. This is the same sentence `successBody` makes,
            and until today it was ONLY visible after a successful send — i.e. the single most
            reassuring line on the page was shown exclusively to people who had already been
            reassured enough to submit. It appears here and again beside the button. */}
        <p
          className="mt-2 font-sans text-[14px] text-ink-soft"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.02em" }}
        >
          {dict.panel.reply}
        </p>
      </div>
    </div>
  );

  /* The panel shell, shared by the form and by the success state so the two cannot drift.

     ⚠️ `w-full` IS UNGATED; `flex-1` AND `min-w-0` ARE `desktop:`-GATED. This replaces the
     `w-px flex-[1_0_0]` idiom that shipped a bug on 2026-08-13: a 1px flex basis is only
     meaningful in a ROW container, and below 1200 this is a COLUMN child — so the 1px was the
     cross-axis size, nothing stretched it, and the form rendered ONE PIXEL WIDE on every phone
     and tablet. The idiom is now RETIRED rather than re-gated, because its only purpose was to
     let a `max-w-[720px]` cap decide the column, and there is no cap any more: the panel is
     simply the space left over, which is ~820px at 1280 and closes the ~196px dead gutter the
     old fixed pair left. `min-w-0` because a flex item's default `min-width: auto` would let a
     long unbroken string inside set the column's floor. */
  const PANEL =
    "relative w-full border border-hairline bg-paper shadow-float " +
    "p-4 tablet:p-8 desktop:min-w-0 desktop:flex-1 desktop:p-10";

  /* No `items-start` and no `self-start` — see the rail's note. */
  const ROOT = "flex w-full flex-col gap-12 desktop:flex-row desktop:gap-20";

  /* ── the success panel ──────────────────────────────────────────────────────────────────
     Replaces the FORM rather than the whole component: leaving a filled-in form on screen after
     a successful send invites a second identical submission, but the rail is a sibling and
     stays, with all four steps showing complete. The hero's channel grid is a different
     component entirely and never unmounts, so the direct email and WhatsApp are still one
     glance away — and they are repeated here as well, because this is the moment someone
     decides whether to also reach out another way. */
  if (status === "sent") {
    return (
      <div className={ROOT}>
        {rail}
        <div className={PANEL}>
          <span
            aria-hidden="true"
            className="contact-progress absolute inset-x-0 top-0 h-0.5 bg-signal"
          />
          <div
            ref={successRef}
            tabIndex={-1}
            role="status"
            aria-live="polite"
            className="flex w-full flex-col items-start gap-4 focus:outline-none"
          >
            <span className="contact-rise flex h-12 w-12 items-center justify-center rounded-[6px] bg-signal">
              <CheckGlyph className="contact-draw h-6 w-6 text-paper" />
            </span>
            <p
              className="contact-rise font-sans text-[14px] font-medium text-muted"
              style={{
                lineHeight: "1.3em",
                letterSpacing: "-0.02em",
                animationDelay: "70ms",
              }}
            >
              {t.successEyebrow}
            </p>
            <h2
              className="contact-rise font-display text-[32px] text-ink"
              style={{
                lineHeight: "1.1em",
                letterSpacing: "-0.05em",
                animationDelay: "140ms",
              }}
            >
              {t.successTitle}
            </h2>
            <p
              className="contact-rise max-w-[var(--measure)] font-sans text-[16px] text-muted"
              style={{
                lineHeight: "1.5em",
                letterSpacing: "-0.02em",
                animationDelay: "210ms",
              }}
            >
              {t.successBody}
            </p>

            {/* Zero new dictionary keys: the two labels are the channel grid's own, and the
                values come from src/lib/contact.ts as they do everywhere else. That file exports
                plain string constants with no `server-only` guard, so it is safe here. */}
            <div
              className="contact-rise mt-2 flex w-full flex-col gap-3 border-t border-hairline pt-6 tablet:flex-row tablet:gap-8"
              style={{ animationDelay: "280ms" }}
            >
              {[
                {
                  label: dict.aside.emailLabel,
                  value: CONTACT_EMAIL,
                  href: CONTACT.email,
                  external: false,
                },
                {
                  label: dict.aside.whatsappLabel,
                  value: CONTACT_PHONE,
                  href: CONTACT.whatsapp,
                  external: true,
                },
              ].map((row) => (
                <div key={row.label} className="flex flex-col items-start gap-1">
                  <p
                    className="font-sans text-[12px] font-medium text-muted"
                    style={{ lineHeight: "1.3em", letterSpacing: "-0.02em" }}
                  >
                    {row.label}
                  </p>
                  <AppLink
                    href={row.href}
                    external={row.external}
                    className="font-mono text-[15px] text-ink no-underline transition-[color] duration-300
                               hover:text-muted focus-visible:rounded-[2px] focus-visible:ring-2
                               focus-visible:ring-signal focus-visible:ring-offset-2
                               focus-visible:ring-offset-paper focus-visible:outline-none"
                    style={{
                      lineHeight: "1.5em",
                      letterSpacing: "-0.02em",
                      transitionTimingFunction: "var(--ease-rogo)",
                    }}
                  >
                    {row.value}
                  </AppLink>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* One text field: label, control, error. `type` is only ever "text" or "email" — `email` gets
     the right mobile keyboard, which is the whole reason to distinguish them.

     ⚠️ NOT A NESTED COMPONENT. It is a render helper called as a function, `textField(...)`,
     not `<Field ... />`. A component declared inside another component gets a fresh identity on
     every parent render, so React unmounts and remounts its subtree — which would blur the
     input on the first keystroke of every field on this form. That is the whole bug, and it is
     why this reads slightly awkwardly. Do not "clean it up" into JSX. This file grew by ~40% in
     the 2026-08-17 redesign, which is exactly the kind of pass during which someone tidies an
     awkward-looking helper; the fast test is to type two characters into Full name. */
  const textField = ({
    name,
    label,
    placeholder,
    required,
    type = "text",
    autoComplete,
    inputMode,
    dir,
  }: {
    name: FieldKey;
    label: string;
    placeholder: string;
    required?: boolean;
    type?: "text" | "email" | "tel";
    autoComplete?: string;
    inputMode?: "tel";
    /* ⚠️ EXISTS FOR ONE FIELD AND ONE REASON: `phone` PASSES "ltr". A phone number is LTR
       content, and `+` is a bidi-neutral character — inside the Hebrew page's RTL flow the
       browser reorders "+972 50 000 0000" to put the plus on the wrong end, which is a number
       that reads as a different number. Forcing the input's own direction fixes the reordering.
       It also left-aligns the text where its RTL neighbours are right-aligned; that is the
       lesser of the two, and it is flagged in features/contact-page/FEATURE.md for the Hebrew
       visual pass rather than guessed at here. */
    dir?: "ltr";
  }) => {
    const invalid = Boolean(errors[name]);
    return (
      <div className="group/field flex w-full flex-col items-start gap-2">
        <label
          htmlFor={id(name)}
          /* Darkens to `ink` while the field has focus. One of the three non-underline signals
             that let validity own the underline colour outright — see the note on FIELD_BASE. */
          className="font-sans text-[14px] font-medium text-muted transition-colors duration-300
                     [transition-timing-function:var(--ease-rogo)] group-focus-within/field:text-ink"
          style={{ lineHeight: "1.3em", letterSpacing: "-0.02em" }}
        >
          {label}
          {required ? (
            /* The asterisk is decorative — `required` on the input is what assistive tech
               reads, and the visually-hidden word covers readers that announce neither. */
            <>
              <span aria-hidden="true"> *</span>
              <span className="sr-only"> ({t.a11y.required})</span>
            </>
          ) : null}
        </label>
        <input
          id={id(name)}
          name={name}
          type={type}
          value={values[name]}
          onChange={(e) => setField(name, e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          dir={dir}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? id(`${name}-error`) : undefined}
          className={fieldClass(invalid)}
          style={{ letterSpacing: "-0.02em" }}
        />
        {invalid ? (
          <p
            id={id(`${name}-error`)}
            className="contact-rise-fast flex flex-row items-start gap-1.5 font-sans text-[12px] text-alert"
            style={{ lineHeight: "1.4em", letterSpacing: "-0.02em" }}
          >
            <AlertGlyph className="mt-px h-3 w-3 shrink-0" />
            {errors[name]}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <div className={ROOT}>
      {rail}

      <form
        onSubmit={onSubmit}
        noValidate
        className={`${PANEL} contact-rise flex flex-col items-start gap-8`}
        style={{ animationDelay: "100ms" }}
      >
        {/* The completion bar — the one progress signal that survives at 390px, where the rail's
            step list is hidden. `aria-hidden`: the two groups already announce themselves, and
            a percentage read aloud on every keystroke would be noise. `.contact-progress` sets
            the transform-origin and flips it under RTL; `transform-origin` has no logical
            keyword, so the class is the only way to get this right in both directions. */}
        <span
          aria-hidden="true"
          className="contact-progress absolute inset-x-0 top-0 h-0.5 bg-signal transition-transform duration-300
                     [transition-timing-function:var(--ease-rogo)]"
          style={{ transform: `scaleX(${doneCount / steps.length})` }}
        />

        {/* ── 01 · about you ── */}
        <Group
          index="01"
          legend={t.groups.about}
          legendId={id("about")}
          state={stepState(0)}
          onFocus={() => setFocusedStep(0)}
          onBlur={groupBlur}
        >
          <div className="grid w-full grid-cols-1 gap-x-8 gap-y-6 tablet:grid-cols-2">
            {textField({
              name: "name",
              label: t.nameLabel,
              placeholder: t.namePlaceholder,
              required: true,
              autoComplete: "name",
            })}
            {textField({
              name: "email",
              label: t.emailLabel,
              placeholder: t.emailPlaceholder,
              required: true,
              type: "email",
              autoComplete: "email",
            })}
            {/* ⚠️ THIRD, NOT LAST. The two-column grid fills across, so placing `phone` here
                keeps the three required fields in the first three cells and the two optional
                ones after them — the group reads "what we need, then what helps". Appending it
                would have put a required field below two optional ones. */}
            {textField({
              name: "phone",
              label: t.phoneLabel,
              placeholder: t.phonePlaceholder,
              required: true,
              type: "tel",
              autoComplete: "tel",
              inputMode: "tel",
              dir: "ltr",
            })}
            {textField({
              name: "company",
              label: t.companyLabel,
              placeholder: t.companyPlaceholder,
              autoComplete: "organization",
            })}
            {textField({
              name: "role",
              label: t.roleLabel,
              placeholder: t.rolePlaceholder,
              autoComplete: "organization-title",
            })}
          </div>
        </Group>

        {/* ── 02 · the brief ── */}
        <Group
          index="02"
          legend={t.groups.brief}
          legendId={id("brief")}
          state={stepState(1)}
          onFocus={() => setFocusedStep(1)}
          onBlur={groupBlur}
          /* The word "Optional" while empty, nothing once there is text — the chip's completed
             state already says "you gave us something". */
          slot={
            values.message.trim().length > 0 ? undefined : (
              <SlotHint>{t.optional}</SlotHint>
            )
          }
        >
          {/* The one BOXED control on the page. A bare underline cannot contain rows of text —
              the rule would float unattached below the paragraph — so this borrows the shape of
              /product's hero prompt field: a 1px hairline and a 6px radius, which is the button
              radius and therefore already in the system. `resize-none` matches the reference,
              which also fixes its textarea. The visible legend is the group's, so the label here
              is `sr-only` rather than a second heading.

              ⚠️ 120px AND `rows={4}`, DOWN FROM 160 AND 6. The box was the tallest control on the
              page and it asks for the LEAST text: `messagePlaceholder` says "two honest sentences
              is plenty" and `messageMin` is ten characters. A tall box contradicts its own copy
              and inflates the form's perceived cost for no gain. It still scrolls. */}
          <div className="flex w-full flex-col items-start gap-2">
            <label htmlFor={id("message")} className="sr-only">
              {t.groups.brief}
            </label>
            <textarea
              id={id("message")}
              name="message"
              rows={4}
              value={values.message}
              onChange={(e) => setField("message", e.target.value)}
              placeholder={t.messagePlaceholder}
              maxLength={LIMITS.messageMax}
              aria-invalid={messageInvalid || undefined}
              aria-describedby={`${messageInvalid ? `${id("message-error")} ` : ""}${id("message-chars")}`}
              className={`min-h-[120px] w-full resize-none rounded-[6px] border bg-transparent p-4
                          font-sans text-[16px] text-ink placeholder:text-muted
                          transition-[border-color] duration-300
                          [transition-timing-function:var(--ease-rogo)] focus:outline-none
                          ${messageInvalid ? "border-alert" : "border-hairline focus:border-signal"}`}
              style={{ lineHeight: "1.5em", letterSpacing: "-0.02em" }}
            />

            {/* Error at the inline start, counter at the inline end. `justify-between` on a flex
                row is direction-agnostic, so this needs no RTL companion. */}
            <div className="flex w-full flex-row items-start justify-between gap-4">
              {messageInvalid ? (
                <p
                  id={id("message-error")}
                  className="contact-rise-fast flex flex-row items-start gap-1.5 font-sans text-[12px] text-alert"
                  style={{ lineHeight: "1.4em", letterSpacing: "-0.02em" }}
                >
                  <AlertGlyph className="mt-px h-3 w-3 shrink-0" />
                  {errors.message}
                </p>
              ) : (
                <span />
              )}
              {/* ⚠️ `aria-hidden` — the live region below carries this in a sentence, and a
                  screen reader reciting "120 / 4000" on every keystroke is unusable. The colour
                  doubles as the "this is now long enough" affordance: `muted` under the minimum,
                  `signal` once the field would pass validation, `alert` near the ceiling. */}
              <span
                aria-hidden="true"
                className={`shrink-0 font-mono text-[12px] tabular-nums transition-colors duration-300
                            [transition-timing-function:var(--ease-rogo)]
                            ${
                              messageLen >= MESSAGE_WARN_AT
                                ? "text-alert"
                                : messageLen >= LIMITS.messageMin
                                  ? "text-signal"
                                  : "text-muted"
                            }`}
                style={{ lineHeight: "1.4em" }}
              >
                {messageLen} / {LIMITS.messageMax}
              </span>
            </div>

            {/* ⚠️ SILENT UNTIL THE TAIL, AND BUCKETED WHEN IT SPEAKS. Empty above 200 characters
                remaining; below that it reports the remainder rounded UP to the nearest 50, so
                the whole tail costs at most four announcements instead of one per keystroke. */}
            <p
              id={id("message-chars")}
              role="status"
              aria-live="polite"
              className="sr-only"
            >
              {messageRemaining <= CHARS_ANNOUNCE_UNDER
                ? interpolate(t.a11y.charsLeft, {
                    n: Math.ceil(messageRemaining / 50) * 50,
                  })
                : ""}
            </p>
          </div>
        </Group>

        {/* The honeypot. `sr-only` rather than `display:none`: a bot that skips hidden inputs is
            exactly the bot worth catching, and `aria-hidden` plus `tabIndex={-1}` keep it away
            from both screen readers and the tab order. `autoComplete="off"` stops a browser
            helpfully filling it in and locking a real visitor out of their own form. */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor={id("website")}>{t.a11y.honeypot}</label>
          <input
            id={id("website")}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
          />
        </div>

        {/* Consent, then the whole-form status, then the button — the order a submitting reader
            meets them in.

            ⚠️ NO STEP CHIP AND NO NUMERAL HERE. This block used to be styled exactly like the
            groups above it, so it read as one more step that could never be completed. It is
            the panel's footer. */}
        <div className="flex w-full flex-col items-start gap-6 border-t border-hairline pt-8">
          {/* ── consent ──────────────────────────────────────────────────────────────────
              ⚠️ THE SENTENCE IS NOT WRAPPED IN A `<label>`, AND MUST NOT BE. It contains two
              anchors, and a label containing an anchor toggles the checkbox when the anchor is
              clicked — so a visitor who wanted to read the privacy policy would tick the box on
              their way there. `aria-labelledby` gives the input the same accessible name with
              none of that, at the cost of the click-the-text-to-tick affordance. The input's own
              hit area is padded to make up for it.

              The gap is 12px and the box is nudged down 2px: the sentence's first line box is
              18px tall against a 16px control, so aligning the two on their tops leaves the tick
              sitting visibly high against the text. */}
          <div className="flex w-full flex-col items-start gap-2">
            <div className="flex w-full max-w-[var(--measure)] flex-row items-start gap-3">
              <input
                ref={consentRef}
                id={id("consent")}
                name="consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  const next = e.target.checked;
                  commit({ consent: next });
                  if (!next) return;
                  setConsentError(null);
                  /* Same rule as `setField`: the summary banner is only true while something
                     is still wrong, so clearing the last problem clears the banner too. */
                  if (Object.keys(errors).length === 0) setFormError(null);
                }}
                aria-labelledby={id("consent-text")}
                aria-describedby={
                  consentError ? id("consent-error") : undefined
                }
                aria-invalid={consentError ? true : undefined}
                /* `accent-color` rather than a hand-built box: a native checkbox is the one
                   control here that already has a correct focus ring, a correct hit target and
                   a correct announcement in every assistive tech, and repainting it would cost
                   all three to gain a tick mark of our own drawing. `ink` is the page's
                   selected state — the same call the /news filter pills make. */
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-ink
                           focus-visible:ring-2 focus-visible:ring-signal
                           focus-visible:ring-offset-2 focus-visible:ring-offset-paper
                           focus-visible:outline-none"
              />
              <p
                id={id("consent-text")}
                className="font-sans text-[12px] text-muted"
                style={{ lineHeight: "1.5em", letterSpacing: "-0.02em" }}
              >
                {/* Rebuilt from the locale's own template — see CONSENT_SPLIT. The plain runs
                    come back as strings, which React renders without needing keys. */}
                {t.consent.split(CONSENT_SPLIT).map((part, i) =>
                  part === "{privacy}" ? (
                    <AppLink key={i} href="/privacy" className={CONSENT_LINK}>
                      {t.consentPrivacy}
                    </AppLink>
                  ) : part === "{terms}" ? (
                    <AppLink key={i} href="/terms" className={CONSENT_LINK}>
                      {t.consentTerms}
                    </AppLink>
                  ) : (
                    part
                  ),
                )}
              </p>
            </div>

            {/* Indented to the sentence, not to the checkbox — 16px control + 12px gap. */}
            {consentError ? (
              <p
                id={id("consent-error")}
                className="contact-rise-fast flex flex-row items-start gap-1.5 ps-7 font-sans
                           text-[12px] text-alert"
                style={{ lineHeight: "1.4em", letterSpacing: "-0.02em" }}
              >
                <AlertGlyph className="mt-px h-3 w-3 shrink-0" />
                {consentError}
              </p>
            ) : null}
          </div>

          {/* `role="alert"`, not `role="status"`: this is the failure path and it should interrupt.
              ⚠️ THE NODE IS ALWAYS RENDERED so the live region exists in the DOM before it has
              anything to say — a region inserted at the same moment as its text is not reliably
              announced. The styled banner renders INSIDE it; do not collapse the two into one
              conditional element. */}
          <div role="alert" aria-live="assertive" className="w-full">
            {formError ? (
              <div
                className="contact-rise-fast flex w-full flex-row items-start gap-3 rounded-[6px]
                           border border-[color-mix(in_srgb,var(--color-alert)_30%,transparent)]
                           bg-[color-mix(in_srgb,var(--color-alert)_8%,white)] p-4"
              >
                <AlertGlyph className="mt-0.5 h-4 w-4 shrink-0 text-alert" />
                <p
                  className="font-sans text-[14px] text-alert"
                  style={{ lineHeight: "1.5em", letterSpacing: "-0.02em" }}
                >
                  {formError}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex w-full flex-col items-start gap-4 tablet:flex-row tablet:items-center tablet:gap-6">
            {/* ⚠️ `w-auto min-w-[220px]` FROM 810 UP, REPLACING `tablet:w-min`. The old value
                shrank the site's terminal CTA to its label — the smallest element in a ~1400px
                column, and the one thing on the page every other route exists to deliver someone
                to. `bg-ink` is unchanged and is deliberate: `ink` is this site's primary button
                on a light ground, and an accent-filled submit would be the accent doing
                decoration rather than state.

                Hover is a LIFT rather than `opacity-90` — dimming a black button is the weakest
                hover on the site. NO TRAILING ARROW: it would need `rtl:-scale-x-100` mirroring
                and buys nothing here, so leaving it out removes a whole class of RTL bug. */}
            {/* ⚠️ TWO DIFFERENT KINDS OF DISABLED, AND THE DISTINCTION IS DELIBERATE
                (2026-08-18, when the consent box was added and the user asked for the button to
                be disabled until the form is complete).

                  `disabled`       ONLY while a request is in flight. Genuinely inert: there is
                                   nothing to say and nothing to do until it comes back.
                  `aria-disabled`  while the form is incomplete. It LOOKS disabled — same
                                   opacity-50, same not-allowed cursor, same dead hover — and it
                                   announces as disabled, but it still takes focus and still
                                   fires. A real `disabled` attribute removes the button from the
                                   tab order entirely, so a visitor who mistyped their email
                                   would meet a dead control, no message, and no way to ask what
                                   was wrong. Clicking this one runs `onSubmit`, which highlights
                                   every bad field, speaks the summary and moves focus to the
                                   first of them — the path that already existed for exactly
                                   this case. Do not "simplify" this into one `disabled`. */}
            <button
              type="submit"
              disabled={status === "sending"}
              aria-disabled={!canSubmit || undefined}
              aria-busy={status === "sending"}
              className={`flex h-12 w-full cursor-pointer items-center justify-center gap-2
                         overflow-hidden rounded-[6px] border border-transparent bg-ink px-8 py-2
                         transition-[transform,box-shadow,opacity] duration-300
                         [transition-timing-function:var(--ease-rogo)]
                         hover:-translate-y-0.5 hover:shadow-float active:translate-y-0
                         disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0
                         disabled:hover:shadow-none
                         motion-reduce:transition-none motion-reduce:hover:translate-y-0
                         focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2
                         focus-visible:ring-offset-paper focus-visible:outline-none
                         tablet:w-auto tablet:min-w-[220px]
                         ${
                           canSubmit
                             ? ""
                             : "cursor-not-allowed opacity-50 hover:translate-y-0 hover:shadow-none active:translate-y-0"
                         }`}
            >
              <span className="flex h-5 items-center justify-center gap-[10px] pt-px">
                <span
                  className="font-sans text-[16px] font-medium whitespace-pre text-paper"
                  style={{ lineHeight: "1em", letterSpacing: "-0.01em" }}
                >
                  {status === "sending" ? t.submitting : t.submit}
                </span>
                {/* Three dots, staggered. The base keyframe is 0.55 opacity on all three, so
                    under the reduced-motion clamp — which forces one iteration at ~0ms — the
                    frozen state is an evenly-lit indicator rather than one lit dot and two
                    blanks. See globals.css. */}
                {status === "sending" ? (
                  <span aria-hidden="true" className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="contact-dot h-1 w-1 rounded-full bg-paper opacity-[0.55]"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </span>
                ) : null}
              </span>
            </button>

            {/* The reply promise again, where the decision is actually made. */}
            <p
              className="font-sans text-[14px] text-muted"
              style={{ lineHeight: "1.5em", letterSpacing: "-0.02em" }}
            >
              {dict.panel.reply}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
