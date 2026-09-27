# Context: analytics

Memory for this feature. **Newest entry on top.** Append after every task — never rewrite
past entries. Record decisions, measurements, and reasons; skip narration.

Reading this file plus `FEATURE.md` should be enough to resume work on this feature cold,
with no code scanning.

---

## Current state

Umami's tracker, the click listener and the "Form sent" event are live on
`www.clixsolutions.info` (now the primary host) and the bare host, both locales. **Counting only
since PR #22 (merged 10:58 UTC 2026-09-27)** — the first deploy counted nothing; see the log entry
"zero visits". Umami's receiving side is proven (a replayed pageview was accepted and shows in the
dashboard). **A real browser visit has not yet been seen in Realtime.** Still to do: the share URL,
the Analytics tab in Clix-CRM, "where they stop", and the canonical-host decision.

**Status:** `review`
**Next action:** the user hard-refreshes the live site, clicks a Contact button, and checks
Realtime (expect a new view AND 1 event); then sends the share URL and the Heatmaps answer.

---

## Log

### 2026-09-27 — zero visits after the first deploy: the www redirect

**Symptom:** Umami Realtime showed 0 views after the user browsed the live site with AdBlock
paused on it.

**Root cause:** the user had moved the repo to the `CLIX-solutions` GitHub org and deployed it on
the org's own Vercel, which made `www.clixsolutions.info` primary: the bare host went from serving
200 (10:04 UTC) to answering **308 → `www.`** (10:53 UTC). The tracker's `data-domains` check is an
exact `location.hostname` match and listed only `clixsolutions.info`, so on `www.` it disabled
itself — no request, no console error, nothing to see.

**Evidence, one boundary at a time:** tag in the served HTML ✓ → tracker downloadable ✓ → Umami
accepts a pageview replayed exactly as the tracker builds it (`POST gateway.umami.is/api/send` →
200 with `cache`/`sessionId`/`visitId`, no `disabled`) ✓ → bare host 308s to `www.`, whose HTML
carried `data-domains="clixsolutions.info"` ✗.

**Fix:** `UMAMI_DOMAINS` = `<host>,www.<host>` (`f3e499f`, PR #22, merged by the user at 10:58 UTC).
The served HTML of `www.` now carries `data-domains="clixsolutions.info,www.clixsolutions.info"`.

**Worth keeping**
- ⚠️ **One test pageview is in the data** — the replay above, sent with curl from the user's own
  machine at **10:52 UTC (6:52 PM local)**, path `/`. It is not a visitor. It made the user think
  the site was counting before the fix was live; say so up front if it ever confuses a reading.
- The repo moved: PR #20 lives on `TheSuperShyy/clixmainwebsite`, #22 on
  `CLIX-solutions/clixmainwebsite`. Local `origin` still names the old URL; GitHub redirects it.
- ⚠️ **`lib/site.ts`'s measured canonical is now stale.** It says the bare host is canonical and
  `www.` redirects to it; the reverse is now true, so canonicals and the sitemap point at a URL
  that redirects. Asked the user: make the bare host primary in Vercel, or move SITE_URL to `www.`.
  Not changed until they choose.

### 2026-09-27 — shipped

**Done**
- Committed `32e7261` on `dev`, PR #20 into `main`, merged as `a81441d` at 10:03 UTC.
- Served HTML of `https://clixsolutions.info/` and `/he` checked with curl ~45 s after the merge:
  both carry `<script defer src="https://cloud.umami.is/script.js" data-website-id="4bb5a2fb-…"
  data-domains="clixsolutions.info">`.

**Measurements worth keeping**
- **This repo deploys to TWO Vercel projects**: `clixmainwebsite` and `clix-version3`. Both
  build every PR; the preview passed on both. Which one owns `clixsolutions.info` was not checked
  — the served HTML is what was verified.
- Production picked up the merge in under a minute.

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
