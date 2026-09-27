# Context: analytics

Memory for this feature. **Newest entry on top.** Append after every task — never rewrite
past entries. Record decisions, measurements, and reasons; skip narration.

Reading this file plus `FEATURE.md` should be enough to resume work on this feature cold,
with no code scanning.

---

## Current state

Umami's tracker, the click listener and the "Form sent" event are in the code for both locales —
**not deployed, not viewed, no build run.** Nothing is counted until `clixsolutions.info` serves
this build; `data-domains` keeps localhost and previews out by design. Still to do: the share URL
(the user creates it in Umami), the Analytics tab in Clix-CRM (needs that URL), and an answer for
"where they stop".

**Status:** `building`
**Next action:** the user sends the share URL and says whether the Heatmaps switch exists on the
free plan; then build the CRM tab.

---

## Log

### 2026-09-27

**Done**
- Tool chosen with the user: GA4 + Clarity → rejected (too complicated for the boss) → Plausible
  → rejected (paid) → Umami Cloud free. Constraints recorded in FEATURE.md.
- Umami Cloud account + website "Clix website" created by the user; website id
  `4bb5a2fb-bf39-4bec-bd36-0f6346697237`.
- `src/lib/umami.ts` (id, host, `trackEvent`), `components/analytics/UmamiTag.tsx` (`<head>`),
  `components/analytics/UmamiClicks.tsx` (document listener). Both mounted in `(en)/layout.tsx`
  and `he/layout.tsx`.
- `sendContact` gained a required `form: "contact page" | "footer"` and fires "Form sent" beside
  `reportContactConversion()`. Both callers updated — they are the only two (grepped).

**Decisions** (what was chosen, what was rejected, why)
- `data-umami-event` rejected — forces a full page load on links (measurement below).
- Classification by href + landmark instead of tagging each link: 15 links across 11 components
  covered by one listener, and future Contact buttons are counted with no extra step.
- Scroll-depth custom events rejected as the "where they stop" fix: they would destroy the bounce
  rate (see the bounce note in FEATURE.md). Heatmaps or Clarity instead.
- Nothing committed; the user deploys.

**Measurements worth keeping** (values that were hard to get, gotchas)
- Tracker `https://cloud.umami.is/script.js`, **4,810 bytes**, read 2026-09-27:
  posts to `https://gateway.umami.is/api/send` with `keepalive: true` inside a try/catch; wraps
  `history.pushState` and `replaceState` and sends the page view **300 ms** after a URL change;
  `data-domains` is an exact match on `location.hostname`; `localStorage["umami.disabled"]` turns
  it off per browser; exposes `window.umami = { track, identify, getSession }`; on an `<a>` with
  `data-umami-event` it calls `preventDefault()` and later sets `location.href`.
- Attributes the tracker reads (all `data-`): `website-id`, `host-url`, `before-send`,
  `distinct-id`, `tag`, `auto-track`, `do-not-track`, `exclude-search`, `exclude-hash`,
  `domains`, `fetch-credentials`, `performance`, `auto-pageview`.
- Umami Cloud share pages send `content-security-policy: … frame-ancestors *` **and**
  `x-frame-options: SAMEORIGIN`. Browsers ignore XFO when `frame-ancestors` is present, so the
  CRM iframe should work — confirm with the real share URL.
- The site has exactly **one `<header>`** (`Nav.tsx`) and **one `<footer>`** (`Footer.tsx`) — the
  basis of `where`.

**Skills invoked**
- None. Not a section, and no trigger in docs/SKILLS.md covers analytics.

**Open / deferred**
- Share URL, CRM tab, heatmaps on the free plan, data region, privacy-policy naming, opting the
  team's own browsers out. All listed in FEATURE.md → Open questions.
