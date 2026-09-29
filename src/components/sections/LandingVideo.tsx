"use client";

/**
 * LandingVideo — the 16:9 clip that sits under the testimonials on /.
 *
 * ⚠️ THIS IS A DELIBERATE COPY OF ClixVideo's TREATMENT, not a shared component. The user's
 * ask (2026-08-18) was "make it just like the hero video from clix section", so the frame is
 * /clix's measured one: aspect-ratio 1.77778, radius 6px, filled with `object-cover`.
 *
 * ⚠️ THE MUTE TOGGLE IS BACK, AND IT CAME BACK WITH THE AUDIO (2026-08-19). History, because
 * it reversed twice: the toggle shipped with the section, was removed on 2026-08-18 (user:
 * "remove this", against a screenshot) — at which point `muted` became a hard attribute and
 * this header said "if the clip's audio is ever wanted, the toggle comes back WITH it". Then
 * the user re-exported landing-vid.mp4 with an AAC track and asked for sound. So this is that
 * clause being exercised, not the 08-18 decision being forgotten: audio-with-no-control would
 * be sound the reader cannot stop, and the browser would block the observer's play() besides.
 *
 * ⚠️ IT STILL STARTS MUTED, AND MUST. The IntersectionObserver below calls play() with no user
 * gesture behind it — scrolling is not a gesture — and every engine's autoplay policy allows
 * that only for a muted element. Initial `muted=false` would reject the play() on every scroll
 * into view and the clip would sit on its poster. Unmuting is the click on the toggle, which
 * IS the gesture that authorises audio. The toggle is ClixVideo's verbatim — geometry, glyph,
 * logical-property RTL notes and all — and reads `home.video.{unmute,mute}`, restored to both
 * locale files (one namespace per route, so it cannot read clix's copy).
 *
 * ⚠️ SCROLLING AWAY PAUSES SOUND BUT DOES NOT RESET THE CHOICE. The observer pauses the
 * element off-screen, audio included, and playback resumes where it left off with the mute
 * state the visitor chose. Muting again on exit would override an explicit choice; not
 * pausing would be a soundtrack from a section you cannot see.
 *
 * It is a SEPARATE FILE rather than an import of ClixVideo because the two differ in the
 * things a section owns: the source, the surrounding padding (this one sits between two
 * `bg-canvas` home sections, /clix's floats over ClixBackdrop), and now the controls. Sharing
 * would have meant a prop for each — more coupling than the ~40 lines it saves.
 *
 * PADDING is the home page's rhythm, not /clix's: Testimonials closes on pb-32 / pb-20
 * (desktop) and WhyRogo opens on pt-20 / pt-24, so this section carries the SMALL half of
 * each gap — py-10 phone, py-20 from 810 — and the two neighbours supply the rest. Copying
 * /clix's pt-32 here would have stacked 196px of air under the testimonial heading.
 *
 * `clix-ad-poster.jpg` is frame 0 of the mp4 (ffmpeg `-frames:v 1`), so the poster and the
 * first painted frame are the same image and there is no visible swap when the clip starts.
 * The ad opens on a near-black frame, so the poster is dark on purpose.
 *
 * ⚠️ IT ONLY PLAYS WHILE IT IS ON SCREEN (user's call, 2026-08-18), AND THAT IS WHY THERE IS NO
 * `autoPlay` ATTRIBUTE. An IntersectionObserver owns playback end to end: `autoPlay` would have
 * started the clip during hydration — this section sits below the fold on every tier — and the
 * observer would then have had to stop something that should never have started, wasting a
 * 41MB fetch on visitors who never scroll this far. The observer's first callback fires on
 * observe(), so "visible on load" takes the same code path as every later case; there is no
 * separate initial-state branch.
 *
 * THE 25% THRESHOLD IS A DECISION, not a measurement — a sliver of a 16:9 box at the very
 * bottom of the viewport is not "on screen" in the sense the ask meant. Playing starts when a
 * quarter of the frame is in view and stops when it is not; one number, both directions, so
 * there is no hysteresis band to reason about.
 *
 * As of 2026-09-29 the clip is `clix-ad.mp4`: clix's own ad, 1920×1080, 60fps, 1:59, 41MB,
 * swapped in from /clix at the user's ask (/clix now plays the old landing-vid.mp4). The
 * delivered cut ran 2:07; 1:10–1:18, an empty stretch the voiceover used to fill, is cut out
 * (from the master, encoded once). At 41MB the visibility gate and `preload="none"` matter
 * more than they did at 1.4MB. ⚠️ THE AUDIO IS NOT THE AD'S OWN. The ad came with an AI
 * voiceover over a music bed ducked ~14 dB beneath it, and no separation of the two came out
 * both clean and steady. The track is a royalty-free song the user supplied (`bg-music.mp3`,
 * untracked), run unbroken across the cut with a 1s fade-in and a 3s fade-out (which also
 * quiets the loop seam), plus the ad's sound effects REBUILT from synthesized noise and sine
 * booms at the original timings, since the extracted ones carried old music. −18.7 LUFS:
 * the song sits 3 dB under the first −16 LUFS mix at the user's ask, with the effects unchanged.
 * Probed with ffprobe, not assumed.
 */

import { useEffect, useRef, useState } from "react";
import { usePageDict } from "@/lib/i18n/LocaleProvider";

export default function LandingVideo() {
  const t = usePageDict("home").video;
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  /* Playback is gated on visibility — see the header note for why there is no `autoPlay`.
     Empty dependency array on purpose: the observer is built exactly once, and nothing inside
     it reads React state. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Older Safari and any engine with the API disabled: fall back to playing on mount, which
       is the behaviour this section had before the gate. Degrading to "never plays" would be
       the worse failure — the reader would see a poster frame and nothing else. */
    if (typeof IntersectionObserver === "undefined") {
      void el.play().catch(() => {});
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          /* `.catch()` is not optional: play() returns a promise that REJECTS when the engine
             declines, and an unhandled rejection surfaces in the console on every scroll past. */
          void el.play().catch(() => {});
        } else {
          /* pause(), never load() or a `currentTime` reset: the clip resumes where it left off,
             which is what "only play when it's on screen" means and what a restart would not be. */
          el.pause();
        }
      },
      { threshold: 0.25 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      data-nav-theme="light"
      className="relative z-[1] flex w-full flex-col items-center justify-center
                 overflow-clip bg-canvas px-4 py-10
                 tablet:px-10 tablet:py-20"
    >
      {/* Width Container — the home page's 1280 measure, same token every other section uses. */}
      <div className="relative flex w-full max-w-[var(--container-max)] flex-col items-center justify-center">
        {/* aspect-ratio 1.77778 verbatim from /clix — the container is 16:9 and the video
            fills it. The source is 1920×1080, so `object-cover` never actually crops. */}
        <div
          className="relative w-full flex-none overflow-clip rounded-[6px]"
          style={{ aspectRatio: "1.77778" }}
        >
          <video
            ref={ref}
            className="h-full w-full object-cover"
            src="/video/clix-ad.mp4"
            poster="/video/clix-ad-poster.jpg"
            /* `none` is the pairing the visibility gate earns: this section is below the fold
               at every tier, so a visitor who never scrolls to it costs 15KB of poster instead
               of 41MB of mp4. The poster IS frame 0, so the fetch that starts when the
               observer fires is invisible — the first painted frame matches what was already
               on screen. Same call Testimonials makes for its six client clips. */
            preload="none"
            /* ⚠️ NO `autoPlay` — the IntersectionObserver above starts and stops this element,
               and the two together would race. See the header note. */
            loop
            /* State again, not a hard attribute (2026-08-19) — the audio and the toggle came
               back together. ⚠️ INITIAL `true` IS LOAD-BEARING: the observer's ungestured
               play() is only allowed on a muted element. See the header note. */
            muted={muted}
            playsInline
            /* No `controls`, as on /clix — the toggle below is the section's one affordance,
               and a native control bar would be a second. */
          />

          {/* Mute toggle — ClixVideo's verbatim: same box (`Video Muted`: row, gap 8, padding
              10/16/10/10 with the extra space on the text side of the 20px glyph), same
              logical-property RTL treatment. See ClixVideo.tsx for the `start-4`/`pe-4`
              reasoning; it applies unchanged here. */}
          <button
            type="button"
            onClick={() => {
              const v = ref.current;
              if (!v) return;
              v.muted = !v.muted;
              setMuted(v.muted);
              /* Unmuting a clip the engine started muted needs an explicit play() in some
                 engines — the click is what authorises audio. Also covers the edge where the
                 observer's play() was declined and the visitor reaches for the button. */
              if (!v.muted) void v.play().catch(() => {});
            }}
            aria-pressed={!muted}
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
