# Section: `landing-video`

**Route:** `/` and `/he` · **Component:** `src/components/sections/LandingVideo.tsx`
**Position:** between `testimonials` (#4) and `why-rogo` (#5).
**Status:** `review` — built 2026-08-18, not yet looked at in a browser at any tier.

---

## What it is

A single 16:9 clip under the "In our clients' own words" section, in **the same treatment
`/clix`'s `Video` block uses** (`src/components/clix/ClixVideo.tsx`). Requested by the user
on 2026-08-18: *"below the client words, we have to add the video landing-vid.mp4 from
public/video, make it just like the hero video from clix section."*

**It has no counterpart in the rogo.ai home capture.** Nothing here was measured off the
target's home page, because the target's home page has no video in this slot. Every geometry
value is *lifted from the already-measured `/clix` Video block*, which is the only sense in
which this section is a clone.

## Values, and where each came from

| Property | Value | Source |
|---|---|---|
| aspect ratio | `1.77778` | `/clix` Video, verbatim |
| radius | `6px` | `/clix` Video, verbatim |
| object fit | `cover` | `/clix` Video, verbatim (source is 1920×1080, so it never crops) |
| ~~mute toggle~~ | **removed 2026-08-18** | see below — `/clix` keeps its own |
| width cap | `var(--container-max)` (1280) | home page token — **not** `/clix`'s |
| padding | `px-4 py-10` → `tablet:px-10 tablet:py-20` | **ours**, see below |

**The padding is the one deliberate divergence from `/clix`.** `/clix`'s block carries
`pt-20 pb-10` → `tablet:pt-32 tablet:pb-20` because it floats over `ClixBackdrop` directly
under a hero. Here it sits between two `bg-canvas` sections that already pay for the gap —
Testimonials closes on `pb-32` / `desktop:pb-20`, WhyRogo opens on `pt-20` / `tablet:pt-24` —
so this section carries the small half at both ends. Copying `/clix`'s `pt-32` would have put
~196px of air under the testimonial heading.

## Asset

**Since 2026-09-29 (user's swap with `/clix`):**

- `public/video/clix-ad.mp4` — clix's own ad, 1920×1080, 60fps, **1:59** (the delivered
  2:07 minus the empty 1:10–1:18), 40.8MB (H.264 CRF 23, one encode from the master).
  **Audio is not the ad's own:** a royalty-free song the user supplied (`bg-music.mp3`),
  unbroken across the cut with a 1s fade-in and 3s fade-out, plus the ad's sound effects
  rebuilt from synthesized noise and sine booms at the original timings. Song 3 dB under the
  first mix → −18.7 LUFS, LRA 4.4. The AI voiceover and the old ducked music bed are both
  gone. ⚠️ Source/licence of the song not yet recorded.
- **No master left in the repo root.** The 55MB voice-free master was sent to the Recycle Bin
  at the user's ask (2026-09-29). Any further re-cut starts from this served file, one
  generation down, unless it's restored from there.
- `public/video/clix-ad-poster.jpg` — 15KB, frame 0 (`-frames:v 1 -q:v 3`). Near-black,
  because the ad opens dark.
- The old pair, `landing-vid.mp4` (1920×1080, 25.5s, 1.5MB with AAC since 2026-08-19) and
  `landing-vid-poster.jpg`, now play on `/clix` in `ClixVideo`.

Playback: `loop muted playsInline preload="none"`, no `controls`, **no `autoPlay`** (see the
visibility gate below) **and no mute toggle** (see below that).

## The mute toggle was removed (user's call, 2026-08-18)

The user sent a screenshot of the `Unmute` button and said *"remove this."*

**The clip is therefore permanently silent, and that is the point.** A muted `<video>` with no
control is decoration; an *unmuted* one with no control would be audio the reader cannot stop —
which is exactly what the toggle existed to prevent. So `muted` is now a **hard attribute, not
state**. ⚠️ If this clip's audio is ever wanted, the toggle comes back *with* it; do not restore
sound by dropping `muted` on its own.

Consequences, all deliberate:

- The section now has **no interactive element at all** — nothing to tab to, no focus ring, no
  `aria-pressed`. It is decoration, and decoration is not a control.
- The component **no longer reads the dictionary**, so the `home.video.{unmute,mute}` keys
  added earlier the same day were **removed from both locale files**. Both are byte-identical
  to their pre-2026-08-18 state again.
- `"use client"` still stands — the visibility gate needs it.
- **`/clix` is unaffected.** `ClixVideo` keeps its toggle and its `clix.video` strings.

## Playback is gated on visibility (user's call, 2026-08-18)

*"it should only play when its in the screen."*

An `IntersectionObserver` at **`threshold: 0.25`** owns playback end to end: it plays when a
quarter of the frame is in view, pauses when it is not.

- **No `autoPlay` attribute.** The observer is the only thing that starts the element. With
  `autoPlay` the clip would begin during hydration — this section is below the fold at every
  tier — and the observer would then be stopping something that should never have started.
- **The threshold is a decision, not a measurement.** A sliver of a 16:9 box at the bottom of
  the viewport is not "on screen" in the sense the ask meant. One number serves both
  directions, so there is no hysteresis band.
- **`pause()`, never a `currentTime` reset.** Scrolling back resumes where it left off.
- **Mute state survives the round trip.** Re-muting on exit was considered and rejected — it
  would silently undo an explicit user action and leave the toggle's label disagreeing with a
  control the reader set themselves.
- **`preload="none"` is what the gate earns.** A visitor who never scrolls this far now costs
  12KB of poster instead of 3.5MB of mp4. The poster is frame 0, so the fetch that starts when
  the observer fires is invisible.
- **Fallback:** if `IntersectionObserver` is undefined, the clip plays on mount — the
  behaviour this section had before the gate. Degrading to "never plays" would be worse.
- Both `play()` calls carry `.catch(() => {})`. A rejected play promise (an unmuted resume
  with no fresh gesture is the case that bites) is otherwise a console error on every scroll past.

## i18n

**None. This section renders no text.** It briefly carried `home.video.{unmute,mute}` on
2026-08-18; those keys went out with the toggle the same day and both locale files are back to
their previous contents. A future control here needs new keys in both — see `clix.video` for
the pair `/clix` uses.

## Acceptance

- [x] Renders under the testimonials on both `/` and `/he`.
- [x] 16:9, radius 6, `object-cover`, poster = frame 0.
- [x] Plays only while ≥25% of the frame is in view; pauses on exit, resumes in place.
- [x] No controls, no focus surface: the section is decoration on both `/` and `/he`.
- [x] Nothing locale-dependent left in the component — no strings, so nothing to mirror.
- [ ] Looked at in a browser at 1600 / 1440 / 1024 / 390.
- [ ] The 25% threshold checked at **390px**, where a 16:9 box is only ~201px tall and a
      quarter of it is ~50px — the gate may feel late or early there in a way it does not at 1600.
- [ ] `npm run build` — not run here; the user verifies simple changes.
- [ ] The clip's own content reviewed at phone width — it is a 16:9 crop of unknown framing,
      and nothing has confirmed it reads at 358px wide.

## Open questions

1. **Should it be full-bleed instead of 1280-capped?** `/clix`'s is capped, so this one is;
   the user may want the wider treatment on a landing page.
2. ~~Does the clip have audio worth a toggle?~~ **Settled 2026-08-18: no toggle, permanently
   muted.** Whether the file has an audio track is now irrelevant to what renders.
3. **Placement relative to the heading** — it sits *below* the whole testimonials section,
   including its carousel. "Below the client words" could also have meant directly under
   the `<h2>`, above the cards.
