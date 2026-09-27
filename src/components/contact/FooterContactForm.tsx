"use client";

/**
 * FooterContactForm — the compact contact form in the site footer's closing band.
 *
 * Spec: features/footer/FEATURE.md · memory: features/footer/CONTEXT.md
 *
 * Added 2026-09-22 at the user's request — "in this part, we can add the form, the about you
 * part and also the tell us, but compressed. make it look good". It replaces the band's
 * `Let's start` link to /contact on every route that renders the default footer. /contact
 * itself passes `closing` to the footer and so never renders this; its own full form is
 * already on the page.
 *
 * SAME FIELDS, SAME RULES, SAME ENDPOINT AS /contact. All six fields, the consent tick and the
 * honeypot post to /api/contact exactly as ContactForm.tsx does, so the Gmail notification and
 * the n8n → CRM → WhatsApp workflow see no difference between the two forms. Validation and
 * the send path are ./contactRules.ts, shared with that file. Copy is the `contact.form`
 * namespace, handed down as a prop by the server Footer — zero new dictionary keys.
 *
 * WHAT "COMPRESSED" DROPPED: the numbered step chips, the progress bar, the white panel, the
 * character counter and the sessionStorage draft. What it KEPT, because none of it is chrome:
 * visible labels (a placeholder is not a label), per-field errors, the always-mounted alert
 * region, the two kinds of disabled on the button, and focus management on both failure and
 * success.
 *
 * LAYOUT is a 6-column grid from 810 up, so one grid carries both rows: the three REQUIRED
 * fields share the first row at two columns each, the two optional ones share the second at
 * three each, and the brief spans all six. Nothing is ever orphaned on a row of its own. One
 * column on phone. The footer decides how wide this is — see Footer.tsx.
 *
 * ⚠️ ON INK, NOT ON PAPER, AND /contact's STATE COLOURS DO NOT SURVIVE THE MOVE. `signal` is
 * 2.68:1 on `ink` and `alert` 2.78:1, both fails. So focus paints `paper` (18.26:1) and invalid
 * paints `alert-dark` #f97066 (6.55:1), the one dark-ground variant, added for this form. Labels
 * are `paper/60` (composites to #a1a1a1, 7.07:1) and placeholders `paper/50` (#8a8a8a, 5.29:1);
 * both are opacity modifiers on an existing token. Ratios from docs/reference/contrast-check.js.
 * The field rules are `paper/25` at rest, which is a boundary and not text, and every field
 * is also identified by its visible label — the same posture /contact's `hairline` takes.
 *
 * ⚠️ NO RING THAT CAN BE CLIPPED. The footer's container is `overflow-hidden`, and below 1200
 * this form's edges ARE that container's edges, so an outset focus ring on the button or the
 * checkbox would lose the side that touches it. The button draws its ring INSIDE itself
 * (a negative outline offset); the checkbox keeps an outset outline because at <=1199 only its
 * inline-start side can clip, and its sentence brightens on focus as a second signal.
 */

import { useId, useRef, useState } from "react";
import AppLink from "@/components/ui/AppLink";

import { AlertGlyph, CheckGlyph } from "./contactGlyphs";
import {
  CONSENT_SPLIT,
  EMPTY_VALUES,
  FIELD_ORDER,
  LIMITS,
  sendContact,
  validateContact,
  type ContactFormDict,
  type Errors,
  type FieldKey,
  type Values,
} from "./contactRules";

/* The underline is `border-b-2` in every state and only its colour changes — a rule that
   thickened on focus would move the text inside a fixed-height box. Same reasoning as
   ContactForm.tsx's FIELD_BASE; this is its dark-ground twin. `h-11` is the 44px touch target. */
const FIELD_BASE =
  "h-11 w-full rounded-none border-0 border-b-2 bg-transparent px-0 font-sans text-[16px] " +
  "text-paper placeholder:text-paper/50 transition-[border-color] duration-300 " +
  "[transition-timing-function:var(--ease-rogo)] focus:outline-none";

/* Validity owns the rule outright — an invalid field stays `alert-dark` while focused. Focus is
   still visible three other ways: the caret, the label brightening to `paper`, and the rule
   itself having been `paper/25` a moment earlier. */
const fieldTone = (invalid: boolean) =>
  invalid
    ? "border-alert-dark"
    : "border-paper/25 hover:border-paper/40 focus:border-paper";

/* Inline legal links in a 12px `paper/60` sentence, so they are UNDERLINED as well as brighter —
   colour alone is too weak a signal at this size. */
const CONSENT_LINK = `text-paper underline underline-offset-2 transition-colors duration-300
                      [transition-timing-function:var(--ease-rogo)] hover:text-paper/60
                      focus-visible:rounded-[2px] focus-visible:ring-2 focus-visible:ring-paper
                      focus-visible:ring-offset-2 focus-visible:ring-offset-ink
                      focus-visible:outline-none`;

const LABEL =
  "font-sans text-[12px] font-medium text-paper/60 transition-colors duration-300 " +
  "[transition-timing-function:var(--ease-rogo)] group-focus-within/field:text-paper";

const LABEL_STYLE = { lineHeight: "1.3em", letterSpacing: "-0.02em" } as const;

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p
      id={id}
      className="contact-rise-fast flex flex-row items-start gap-1.5 font-sans text-[12px] text-alert-dark"
      style={{ lineHeight: "1.4em", letterSpacing: "-0.02em" }}
    >
      <AlertGlyph className="mt-px h-3 w-3 shrink-0" />
      {children}
    </p>
  );
}

export default function FooterContactForm({ t }: { t: ContactFormDict }) {
  const uid = useId();
  const id = (suffix: string) => `${uid}-${suffix}`;

  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [consentError, setConsentError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  /* One value rather than three booleans, so an impossible pair cannot be represented. */
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  /* The honeypot — see ContactForm.tsx. Never persisted, never visible. */
  const [trap, setTrap] = useState("");

  const consentRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const setField = (key: FieldKey, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    /* Clear that field's error the moment it is touched; re-validating on every keystroke would
       shout at someone halfway through typing an address. The summary line is only true while
       at least one error stands, so clearing the last one clears it too. */
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      if (Object.keys(next).length === 0 && !consentError) setFormError(null);
      return next;
    });
  };

  const validate = (): Errors => validateContact(values, t.errors);

  /* The button's own test, and it must agree with the submit path exactly — so it IS the submit
     path's rules, re-run. A handful of length checks and two regexes per render. */
  const canSubmit = Object.keys(validate()).length === 0 && consent;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    setFormError(null);
    setConsentError(null);
    const found = validate();
    if (Object.keys(found).length > 0 || !consent) {
      setErrors(found);
      if (!consent) setConsentError(t.errors.consentRequired);
      setFormError(t.errors.summary);
      /* Focus the first bad thing, in reading order: the fields, then the checkbox below them. */
      const first = FIELD_ORDER.find((k) => found[k]);
      const target = first ? document.getElementById(id(first)) : consentRef.current;
      target?.focus();
      /* A JS `behavior` option is not reached by the global reduced-motion CSS, so read it here. */
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      return;
    }

    setStatus("sending");
    const result = await sendContact({ values, trap, consent, form: "footer" }, t.errors);

    if (result.kind === "sent") {
      setStatus("sent");
      /* The form leaves the DOM on the next render; without this, focus falls to <body> and the
         confirmation is never announced. Not motion, so no reduced-motion variant. */
      requestAnimationFrame(() => successRef.current?.focus());
      return;
    }

    setStatus("idle");
    if (result.kind === "rate-limited") setFormError(t.errors.rateLimited);
    else if (result.kind === "invalid") {
      setErrors(result.errors);
      setFormError(t.errors.summary);
    } else setFormError(t.errors.failed);
  }

  /* ── sent ─────────────────────────────────────────────────────────────────────────────────
     Replaces the form in place. Shorter than the form it replaces, so the band shrinks — the
     visitor has just pressed the button at its bottom and is looking at this spot. */
  if (status === "sent") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="flex w-full flex-col items-start gap-4 focus:outline-none"
      >
        <span className="contact-rise flex h-10 w-10 items-center justify-center rounded-[6px] bg-paper">
          <CheckGlyph className="contact-draw h-5 w-5 text-ink" />
        </span>
        <p
          className="contact-rise font-display text-[32px] text-paper"
          style={{ lineHeight: "1.1em", letterSpacing: "-0.05em", animationDelay: "70ms" }}
        >
          {t.successTitle}
        </p>
        <p
          className="contact-rise max-w-[var(--measure)] font-sans text-[16px] text-paper/60"
          style={{ lineHeight: "1.5em", letterSpacing: "-0.02em", animationDelay: "140ms" }}
        >
          {t.successBody}
        </p>
      </div>
    );
  }

  const input = ({
    name,
    label,
    placeholder,
    required,
    type = "text",
    autoComplete,
    inputMode,
    dir,
    span,
  }: {
    name: Exclude<FieldKey, "message">;
    label: string;
    placeholder: string;
    required?: boolean;
    type?: "text" | "email" | "tel";
    autoComplete?: string;
    inputMode?: "tel";
    /* `phone` only — a number is LTR content and `+` is bidi-neutral, so inside the Hebrew
       page's RTL flow it would otherwise land on the wrong end. See ContactForm.tsx. */
    dir?: "ltr";
    /* Literal class names, so Tailwind's scanner sees them. */
    span: "tablet:col-span-2" | "tablet:col-span-3";
  }) => {
    const invalid = Boolean(errors[name]);
    return (
      <div className={`group/field flex min-w-0 flex-col items-start gap-1.5 ${span}`}>
        <label htmlFor={id(name)} className={LABEL} style={LABEL_STYLE}>
          {label}
          {required ? (
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
          className={`${FIELD_BASE} ${fieldTone(invalid)}`}
          style={{ letterSpacing: "-0.02em" }}
        />
        {invalid ? <FieldError id={id(`${name}-error`)}>{errors[name]}</FieldError> : null}
      </div>
    );
  };

  const messageInvalid = Boolean(errors.message);

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full flex-col items-start gap-8">
      <div className="grid w-full grid-cols-1 gap-x-6 gap-y-5 tablet:grid-cols-6">
        {/* Row 1 — the three required fields. */}
        {input({
          name: "name",
          label: t.nameLabel,
          placeholder: t.namePlaceholder,
          required: true,
          autoComplete: "name",
          span: "tablet:col-span-2",
        })}
        {input({
          name: "email",
          label: t.emailLabel,
          placeholder: t.emailPlaceholder,
          required: true,
          type: "email",
          autoComplete: "email",
          span: "tablet:col-span-2",
        })}
        {input({
          name: "phone",
          label: t.phoneLabel,
          placeholder: t.phonePlaceholder,
          required: true,
          type: "tel",
          autoComplete: "tel",
          inputMode: "tel",
          dir: "ltr",
          span: "tablet:col-span-2",
        })}

        {/* Row 2 — the two optional ones. Unmarked: the asterisk convention already says so. */}
        {input({
          name: "company",
          label: t.companyLabel,
          placeholder: t.companyPlaceholder,
          autoComplete: "organization",
          span: "tablet:col-span-3",
        })}
        {input({
          name: "role",
          label: t.roleLabel,
          placeholder: t.rolePlaceholder,
          autoComplete: "organization-title",
          span: "tablet:col-span-3",
        })}

        {/* Row 3 — the brief. Boxed, because an underline cannot contain rows of text; the 1px
            border and 6px radius are /contact's textarea's. Three rows, down from its four:
            this is the compressed form, and the placeholder asks for two sentences. */}
        <div className="group/field flex min-w-0 flex-col items-start gap-1.5 tablet:col-span-6">
          <label htmlFor={id("message")} className={LABEL} style={LABEL_STYLE}>
            {t.groups.brief}
          </label>
          <textarea
            id={id("message")}
            name="message"
            rows={3}
            value={values.message}
            onChange={(e) => setField("message", e.target.value)}
            placeholder={t.messagePlaceholder}
            maxLength={LIMITS.messageMax}
            aria-invalid={messageInvalid || undefined}
            aria-describedby={messageInvalid ? id("message-error") : undefined}
            className={`min-h-24 w-full resize-none rounded-[6px] border bg-transparent px-3 py-2.5
                        font-sans text-[16px] text-paper placeholder:text-paper/50
                        transition-[border-color] duration-300
                        [transition-timing-function:var(--ease-rogo)] focus:outline-none
                        ${fieldTone(messageInvalid)}`}
            style={{ lineHeight: "1.5em", letterSpacing: "-0.02em" }}
          />
          {messageInvalid ? (
            <FieldError id={id("message-error")}>{errors.message}</FieldError>
          ) : null}
        </div>
      </div>

      {/* The honeypot. `sr-only` (absolutely positioned, so it takes no slot in the gap above)
          rather than `display:none` — a bot that skips hidden inputs is the bot worth catching. */}
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

      {/* Consent and Send on one row from 810 up, stacked on phone; the alert line under both.
          No `gap` on this wrapper, on purpose: the alert region is always mounted and usually
          empty, and a gap would reserve space for it. Its message brings its own `pt-4`. */}
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col items-start gap-5 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-8">
          <div className="flex min-w-0 flex-col items-start gap-2">
            {/* ⚠️ THE SENTENCE IS NOT A <label>: it holds two links, and a label containing a
                link ticks the box when the link is clicked. `aria-labelledby` names the input
                instead — ContactForm.tsx carries the long version of this note. */}
            <div className="group/consent flex flex-row items-start gap-3">
              <input
                ref={consentRef}
                id={id("consent")}
                name="consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  const next = e.target.checked;
                  setConsent(next);
                  if (!next) return;
                  setConsentError(null);
                  if (Object.keys(errors).length === 0) setFormError(null);
                }}
                aria-labelledby={id("consent-text")}
                aria-describedby={consentError ? id("consent-error") : undefined}
                aria-invalid={consentError ? true : undefined}
                /* Native box, `accent-color: paper`: the checked state is a white box with a
                   dark tick, which is this band's own inversion of /contact's ink box. */
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-paper
                           focus-visible:outline-2 focus-visible:outline-offset-2
                           focus-visible:outline-paper"
              />
              <p
                id={id("consent-text")}
                className="max-w-[var(--measure)] font-sans text-[12px] text-paper/60 transition-colors
                           duration-300 [transition-timing-function:var(--ease-rogo)]
                           group-focus-within/consent:text-paper"
                style={{ lineHeight: "1.5em", letterSpacing: "-0.02em" }}
              >
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
            {/* Indented to the sentence: 16px box + 12px gap. */}
            {consentError ? (
              <p
                id={id("consent-error")}
                className="contact-rise-fast flex flex-row items-start gap-1.5 ps-7 font-sans text-[12px] text-alert-dark"
                style={{ lineHeight: "1.4em", letterSpacing: "-0.02em" }}
              >
                <AlertGlyph className="mt-px h-3 w-3 shrink-0" />
                {consentError}
              </p>
            ) : null}
          </div>

          {/* The band's white button, as `Let's start` was: 44px, radius 6, `ink` label.
              TWO KINDS OF DISABLED, exactly as on /contact — `disabled` only while a request is
              in flight; `aria-disabled` while the form is incomplete, which looks and announces
              disabled but still takes focus and still fires, so a click on it explains what is
              missing instead of doing nothing. Do not collapse the two. */}
          <button
            type="submit"
            disabled={status === "sending"}
            aria-disabled={!canSubmit || undefined}
            aria-busy={status === "sending"}
            className={`flex h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-2
                        rounded-[6px] border border-transparent bg-paper px-6
                        transition-[transform,opacity] duration-300
                        [transition-timing-function:var(--ease-rogo)]
                        hover:-translate-y-0.5 active:translate-y-0
                        disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0
                        motion-reduce:transition-none motion-reduce:hover:translate-y-0
                        focus-visible:outline-2 focus-visible:-outline-offset-4
                        focus-visible:outline-ink
                        tablet:w-auto tablet:min-w-[160px]
                        ${canSubmit ? "" : "cursor-not-allowed opacity-50 hover:translate-y-0"}`}
          >
            <span className="flex h-5 items-center justify-center gap-[10px] pt-px">
              <span
                className="font-sans text-[16px] font-medium whitespace-pre text-ink"
                style={{ lineHeight: "1em", letterSpacing: "-0.01em" }}
              >
                {status === "sending" ? t.submitting : t.submit}
              </span>
              {status === "sending" ? (
                <span aria-hidden="true" className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="contact-dot h-1 w-1 rounded-full bg-ink opacity-[0.55]"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </span>
              ) : null}
            </span>
          </button>
        </div>

        {/* `role="alert"`: the failure path should interrupt. ALWAYS MOUNTED so the live region
            exists before it has anything to say — one inserted with its text is not reliably
            announced. */}
        <div role="alert" aria-live="assertive" className="w-full">
          {formError ? (
            <p
              className="contact-rise-fast flex flex-row items-start gap-2 pt-4 font-sans text-[14px] text-alert-dark"
              style={{ lineHeight: "1.5em", letterSpacing: "-0.02em" }}
            >
              <AlertGlyph className="mt-0.5 h-4 w-4 shrink-0" />
              {formError}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
