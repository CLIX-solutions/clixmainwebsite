"use client";

/**
 * ClixVideo — clone of rogo.com/felix `Video` (`.framer-2uaicm`).
 * Measured from the 2026-08-09 capture. Spec: features/felix-page/FEATURE.md.
 *
 * ⚠️ THE CLIP IS OURS, NOT THE TARGET'S. The original plays a Framer-hosted mp4 that is
 * rogo's property. This repo already removed rogo's `hero-original.mp4` once the repo went
 * public, for exactly that reason. As of 2026-09-29 this plays `public/video/landing-vid.mp4`
 * — the "Pipeline assistant" laptop clip, 1920x1080, 30fps, 25.5s, 1.5MB, H.264 + AAC. It
 * was the home page's LandingVideo clip until the user swapped the two sections' clips the
 * same day; clix's 2:07 ad (`clix-ad.mp4`, 41MB) played here briefly and went the other
 * way, where LandingVideo's `preload="none"` visibility gate keeps it off the wire until
 * someone scrolls to it. This block autoplays at the top of the page, so the light clip is
 * the right one here. Exactly 16:9, so `object-cover` crops nothing. Every BOX value is
 * still the original's: the 16:9 container, the 80px gap, the section padding, and the
 * mute toggle's geometry.
 *
 * `landing-vid-poster.jpg` is frame 0 of that mp4, so the poster and the first painted
 * frame are the same image and there is no visible swap when the clip starts.
 */

import { useRef, useState } from "react";

import { usePageDict } from "@/lib/i18n/LocaleProvider";

export default function ClixVideo() {
  /* A hook, NOT an import: a static `import` of a dictionary module from a "use client"
     file bundles BOTH locales into the client chunk. */
  const t = usePageDict("clix").video;
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  return (
    <section
      data-nav-theme="light"
      className="relative z-[1] flex h-min w-full flex-col items-center justify-center gap-20
                 overflow-clip px-4 pt-20 pb-10
                 tablet:px-10 tablet:pt-32 tablet:pb-20"
    >
      {/* Width Container — gap 80, tablet 48, phone 40 */}
      <div
        className="relative flex h-min w-full max-w-[var(--container-max)] flex-col
                      items-center justify-center gap-10 tablet:gap-12 desktop:gap-20"
      >
        {/* aspect-ratio 1.77778 verbatim — the container is 16:9 and the video fills it. */}
        <div
          className="relative w-full flex-none overflow-clip rounded-[6px]"
          style={{ aspectRatio: "1.77778" }}
        >
          <video
            ref={ref}
            className="h-full w-full object-cover"
            src="/video/landing-vid.mp4"
            poster="/video/landing-vid-poster.jpg"
            autoPlay
            loop
            muted={muted}
            playsInline
            /* No `controls`: the original exposes exactly one affordance, the mute toggle
               below, and a native control bar would be a second one the target doesn't have. */
          />

          {/* Mute toggle. Box is the original's `Video Muted` component: row, gap 8,
              padding `10px 16px 10px 10px` — asymmetric, with the extra space on the text
              side of the 20px glyph. */}
          <button
            type="button"
            onClick={() => {
              const v = ref.current;
              if (!v) return;
              v.muted = !v.muted;
              setMuted(v.muted);
              /* Unmuting a clip the browser autoplayed muted needs an explicit play() in
                 some engines — the gesture is what authorises audio. */
              if (!v.muted) void v.play();
            }}
            aria-pressed={!muted}
            /* `start-4` and `pe-4 ps-[10px]` are the LOGICAL forms of what used to be
               `left-4` and `pr-4 pl-[10px]`. Both resolve to the identical physical property
               in LTR, so English is unchanged, and both need to mirror in Hebrew:
                 · the toggle sits in the video's inline-START bottom corner, not its left one;
                 · the asymmetric padding puts the EXTRA space on the TEXT side of the 20px
                   glyph (16 vs 10), and under rtl the text is on the other side of the glyph.
               ⚠️ Never pair these with a physical utility on the same axis — `ps-*` beside
               `pl-*` on one element is the one thing that breaks the LTR identity. */
            className="absolute bottom-4 start-4 flex h-min w-min cursor-pointer flex-row
                       items-center justify-center gap-2 rounded-[6px] bg-ink/60 py-[10px]
                       pe-4 ps-[10px] text-paper backdrop-blur-sm
                       transition-opacity duration-300 hover:opacity-90
                       focus-visible:ring-2 focus-visible:ring-paper
                       focus-visible:outline-none"
            style={{ transitionTimingFunction: "var(--ease-rogo)" }}
          >
            <span className="block h-5 w-5 flex-none" aria-hidden="true">
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
                <path d="M10 3.5 5.8 7H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.8l4.2 3.5z" />
                {muted ? (
                  <path
                    d="M13.5 8 L17.5 12 M17.5 8 L13.5 12"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    fill="none"
                  />
                ) : (
                  <path
                    d="M13.5 7.5a4 4 0 0 1 0 5M15.6 5.6a7 7 0 0 1 0 8.8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    fill="none"
                  />
                )}
              </svg>
            </span>
            <span
              className="font-sans text-[14px] font-medium"
              style={{ lineHeight: "1em", letterSpacing: "-0.01em" }}
            >
              {muted ? t.unmute : t.mute}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
