# Feature: Site analytics (Umami)

**Status:** `review` — live on `www.clixsolutions.info` (primary) and the bare host; **counting
since PR #22, 2026-09-27 10:58 UTC** — the first deploy (PR #20) counted nothing, see CONTEXT.md
"zero visits". A real browser visit is not yet confirmed in Realtime. The CRM tab waits on the
share URL.
**Started:** 2026-09-27
**Slug:** `analytics` · registry row: [docs/SECTIONS.md](../../docs/SECTIONS.md)
**Code:** [src/lib/umami.ts](../../src/lib/umami.ts) ·
[UmamiTag.tsx](../../src/components/analytics/UmamiTag.tsx) ·
[UmamiClicks.tsx](../../src/components/analytics/UmamiClicks.tsx) · "Form sent" in
[contactRules.ts](../../src/components/contact/contactRules.ts) `sendContact` ·
Google Ads: [src/lib/gads.ts](../../src/lib/gads.ts) ·
[GoogleAdsClicks.tsx](../../src/components/analytics/GoogleAdsClicks.tsx) ·
`isWhatsAppHost()` in [src/lib/contact.ts](../../src/lib/contact.ts) (shared by both listeners)

---

## What this is

Visitor numbers for the business. The boss's brief, verbatim: *"how many people visit, where they
stop, how many leave, how many clicks they make, etc."*

**Not a section and not a clone of anything** — rogo.ai has no counterpart, so the §6 fidelity bar
does not apply. The bar here is that the numbers are REAL (live host only, one event per real
action, no test traffic) and that the boss can read them without learning an analytics product.

The user's constraints, in the order they arrived:

1. **Simple for the boss.** GA4 + Microsoft Clarity was proposed first and rejected as "too
   complicated" — two products, GA4's report menus, access management.
2. **Free.** Plausible fit everything else (one page, shared links, embeddable) but the embeddable
   plan is ~$14/month. Rejected.
3. **Shown "in our system".** Read as: a tab inside Clix-CRM, not another login.

→ **Umami Cloud, free Hobby plan.** One page of numbers, a no-login share URL, embeddable.

## Where the numbers are read

| Where | Who | Status |
|---|---|---|
| cloud.umami.is → website "Clix website" | the account owner (the user) | account created 2026-09-27 |
| Share URL (Overview + Events) | anyone with the link, no login | **not created yet** |
| Analytics tab in Clix-CRM, iframing the share URL | the boss | **not built** — handed to a session in the Clix-CRM repo; ⚠️ that repo's CSP `frame-src` must allow the share origin first |

Free Hobby plan, as listed by third parties (Umami's own pricing page renders client-side and
could not be read): **100K events/month, 3 websites, 6 months of data.** Umami's FAQ describes it
as "Great for personal projects and low traffic websites"; no commercial-use prohibition found.

## What is counted

| Event (label on Umami's Events page) | Fires when | Properties | Source |
|---|---|---|---|
| *page view* (automatic) | every full load and every client-side route change | Umami built-ins: URL, referrer, UTM, `gclid`, country, device, browser, OS | tracker |
| `Contact button` | click on a link to `/contact` or `/he/contact` | `where`: `menu` · `footer` · `page` | `UmamiClicks` |
| `WhatsApp` | click on a `wa.me` / `*.whatsapp.com` link | — | `UmamiClicks` |
| `Email` | click on a `mailto:` link | — | `UmamiClicks` |
| `Phone` | click on a `tel:` link — today only on the legal pages | — | `UmamiClicks` |
| `Form sent` | `/api/contact` answered 2xx **and** the honeypot was empty | `form`: `contact page` · `footer` | `sendContact` |

The listener classifies by href, so it needs no list. For the record, the links it covers on
2026-09-27: Contact — Nav ×2 (bar + mobile panel, both inside the one `<header>`), `Hero`,
`SecurityHero`, `ProductHero`, `CompanyHero`, `ClixHero`, `ClixCTA`, Footer `letsStart`.
WhatsApp — Footer social row, `ContactChannels`, `ContactForm` aside. Email — Footer,
`ContactChannels`, `ContactForm` aside, `LegalBody`. Phone — `LegalBody`.

### Google Ads conversions (tag `AW-18467124282`)

Marketing's numbers, on the same site, kept in this feature because the WhatsApp one uses the
same click-listener pattern. Not Umami: these go to Google Ads only.

| Ads action | Label (`send_to` after the slash) | Fires when | Source |
|---|---|---|---|
| `Submit lead form` | `wo7vCM3x-YAdELro5-VE` | `/api/contact` answered 2xx **and** the honeypot was empty — both forms | `sendContact` → `reportContactConversion` (`gads.ts`) |
| `WhatsApp click (wa.me)` | `l0O6CIjuwIcdELro5-VE` | click on a `wa.me` / `whatsapp.com` link — same `isWhatsAppHost()` test as Umami's `WhatsApp` event | `GoogleAdsClicks` → `reportWhatsAppConversion` (`gads.ts`) |

Both send `value: 1.0, currency: 'ILS'`; the WhatsApp one adds `transport_type: 'beacon'`. Two
document click listeners run per click (Umami's and Ads'), on purpose — see CONTEXT.md
2026-09-27 "Google Ads: WhatsApp click conversion" for the decision and for what gtag actually
puts on the wire (`doubleclick.net/…/viewthroughconversion/…&label=…`, not `googleadservices`).

## The boss's questions → what answers them

| Question | Answer | Status |
|---|---|---|
| How many people visit | Visitors · Visits · Views | covered |
| How many leave | Bounce rate | covered — see the bounce note below |
| How many clicks | Events page, one count per event above | covered for the named clicks, **not every click** |
| Where they stop | Umami scroll heatmaps (since v3.2.0) — **if** the free plan has them | **open** |

**Bounce note.** Umami defines a bounce as *"a visit with only 1 event"*, and tracked clicks are
events. So a visitor who lands and clicks Contact is not a bounce — which is the intended meaning,
but it is also why scroll-depth events were NOT added to fill the "where they stop" gap: firing one
on every page view would un-bounce almost every visit and hollow out the bounce rate.

## Decisions

- **Own click listener, not `data-umami-event`.** Read out of the tracker on 2026-09-27: for a
  same-tab `<a>` carrying that attribute, Umami's capture-phase listener calls `preventDefault()`,
  sends, then assigns `location.href` — a full page load. Every Contact button would lose its soft
  navigation and view transition. `umami.track()` from our listener leaves the click alone.
- **`data-domains` = the SITE_URL host AND its `www.` twin.** Exact `location.hostname` match in
  the tracker, so localhost:3001 and Vercel previews never count. Both spellings, because the
  redirect between them is a Vercel setting and it flipped on the day this shipped — with one
  host listed, the tracker went silent on the other (CONTEXT.md, "zero visits").
- **No `data-exclude-search`.** It would strip the query string, and with it the UTM / `gclid`
  attribution Umami reads — i.e. which visits came from Google Ads.
- **"Form sent" lives inside the Ads conversion's gate**, not in each form's `sent` branch: the
  route answers the honeypot with a 200, and `sendContact`'s `!trap` is what keeps bots out.
  `form` became a required argument so a third caller cannot forget it.
- **Cookieless**, so nothing is gated on the (cosmetic) cookie banner and nothing new needs listing
  under the terms' cookie clauses.

## Acceptance checklist

- [x] Tracker in `<head>` of both root layouts, after the Google Ads tag
- [x] Contact (with `where`), WhatsApp, Email, Phone clicks
- [x] Form sent — accepted submissions only, both forms
- [x] Deployed to the live host — PR #20, merge `a81441d`; the tag was read back out of the
      served HTML of `/` and `/he` ~45 s after the merge
- [x] Umami Realtime shows a live-site visit — the user through a VPN (Israel), 2026-09-27
      11:08:40 UTC: views of `/` and `/contact`, country and browser resolved
- [x] Each click lands once per click — one Contact click on `/` → one `Contact button` event
- [x] Google Ads `WhatsApp click (wa.me)` — one labelled conversion ping per click on `/` and
      `/he`, DevTools-protocol probe 2026-09-27 with Google blocked at the browser (nothing
      registered); `Submit lead form` untouched (function byte-identical to HEAD)
- [x] The same WhatsApp ping seen on the live host after deploy — probe against
      `www.clixsolutions.info` `/` and `/he`, 2026-09-27 13:56 UTC, all checks passed, Google and
      Umami blocked so nothing was registered
- [ ] Dan's own DevTools check
- [ ] Google Ads lists `WhatsApp click (wa.me)` as recording conversions
- [ ] A Contact button is still a soft navigation with its view transition (no full reload)
- [ ] "Form sent" seen once after a REAL enquiry — ⚠️ **never send a test submission**: it
      creates a real lead in the CRM and fires the WhatsApp/email workflow
- [ ] Share URL created (Overview + Events)
- [ ] Analytics tab in Clix-CRM
- [ ] "Where they stop" answered
- [x] Build — passed in Vercel's preview for PR #20, on both projects this repo deploys
      (`clixmainwebsite`, `clix-version3`); not run locally (standing rule)

## Open questions

- [ ] Is the **Heatmaps** switch (website settings → Replays & Heatmaps) on the free plan? If not,
      Microsoft Clarity (free, no limits) is the fallback for scroll depth, for the user only.
- [ ] Data region picked at signup — EU was advised; not confirmed.
- [ ] **Canonical host.** Vercel now makes `www.` primary (bare host 308s to it) while
      `lib/site.ts` still declares the bare host canonical. Make the bare host primary in Vercel,
      or move SITE_URL to `www.` — the user's call. (Umami counts both either way.)
- [ ] Privacy policy names "statistical tools" generically — does the business want Umami named?
- [ ] Own visits: `localStorage.setItem("umami.disabled", "1")` in the console on the live site
      opts one browser out. Worth doing for the team's machines before the boss reads anything.
