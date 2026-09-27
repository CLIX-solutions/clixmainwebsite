import {
  UMAMI_DOMAINS,
  UMAMI_SCRIPT_SRC,
  UMAMI_WEBSITE_ID,
} from "@/lib/umami";

/* The Umami tracker, on every page, in `<head>`.
 *
 * Installed 2026-09-27 and mounted exactly like GoogleAdsTag: once in EACH root layout —
 * `(en)/layout.tsx` and `he/layout.tsx` — because the two trees share no ancestor; forgetting one
 * would leave that locale uncounted. It sits AFTER the Ads tag, which stays first as asked.
 *
 * The element is Umami's own snippet with one attribute added, `data-domains` (lib/umami.ts says
 * why). A raw `<script>` rather than `next/script` for the reason GoogleAdsTag.tsx records: plain
 * elements inside the layout's `<head>` are what the App Router emits verbatim. `defer`, as Umami
 * ships it — the tracker only needs to be up before the first click, not before first paint. */
export default function UmamiTag() {
  return (
    <script
      defer
      src={UMAMI_SCRIPT_SRC}
      data-website-id={UMAMI_WEBSITE_ID}
      data-domains={UMAMI_DOMAINS}
    />
  );
}
