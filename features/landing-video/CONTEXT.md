# Context: `landing-video`

Newest first. Decisions and measurements, not narration.

---

## 2026-09-29 — plays clix's ad now (swapped with `/clix`), with the user's music

**Ask:** *"switch the video from the main landing page video and the video from clix
section"*, sent with a screenshot of this section, right after approving the ad's new music.

- **`LandingVideo` now plays `clix-ad.mp4` + `clix-ad-poster.jpg`; `ClixVideo` plays
  `landing-vid.mp4` + `landing-vid-poster.jpg`.** Only `src`/`poster` and the header notes
  changed; the gate, `preload="none"`, loop, mute state and toggle are untouched.
- **The swap suits both files.** 41MB behind this section's visibility gate costs a visitor
  who never scrolls here only the 15KB poster; `/clix` autoplays at the top, and the clip
  there is now 1.5MB instead of 41MB.
- **The ad's audio history** is in `features/felix-page/CONTEXT.md` (2026-09-29). In short:
  AI voice removed → the leftover music swung ~14 dB (the original mix ducked it under the
  voice) → leveling and un-ducking either left swings or brought voice traces back → the user
  chose a new royalty-free track, `bg-music.mp3`. The picture in `clix-ad.mp4` is
  byte-identical to the first commit (video streamhash MD5 `de5426b2…`).
- ⚠️ **The song's source and licence aren't recorded yet**; asked of the user.
- Not rendered in a browser.

## 2026-08-19 — audio added, toggle back with it

**Ask:** *"add sound to the landing-vidmp4 i changed it that mp4 has sounds now"* — the user
replaced `public/video/landing-vid.mp4` themselves.

### Decisions

- **The 08-18 removal is reversed by its own escape clause**, not forgotten: that entry's rule
  was "sound and the control return together or not at all", and this is them returning
  together. Audio-with-no-control is sound a reader cannot stop, and autoplay policy would
  block the observer's ungestured `play()` on an unmuted element anyway.
- **Starts muted, always** — `muted` is state again with initial `true`. The visibility gate's
  `play()` has no user gesture behind it and is only allowed muted; the toggle click is the
  gesture that authorises audio.
- **The toggle is ClixVideo's verbatim** (geometry, glyph, logical-property RTL treatment),
  reading `home.video.{unmute,mute}` — the keys deleted on 08-18, restored to both locale
  files with clix's exact wording. Not read from the clix namespace: `usePageDict` enforces
  one namespace per route.
- **Scrolling away pauses sound but keeps the visitor's mute choice** — the observer's
  `pause()` already covers audio, and re-muting on exit would override an explicit choice.

### Measured

- New file (ffprobe): 1920×1080 h264 + **AAC audio**, 25.514s, **1,506,940 bytes** (~1.4MB,
  down from 3.5MB silent — smaller video bitrate in the re-export). Stale 3.5MB mentions in
  the component's comments updated.
- Poster is unchanged and still matches frame 0 — same footage, new encode.

## 2026-08-18 — mute toggle removed

**Ask:** a screenshot of the `Unmute` button, and *"remove this."*

### Decisions

- **`muted` became a hard attribute, not state.** The clip is permanently silent. Removing the
  control without pinning `muted` would have left audio the reader cannot stop — the exact
  thing the toggle was there to prevent. ⚠️ Sound and the control come back together or not
  at all.
- **The `home.video.{unmute,mute}` keys were deleted from both locale files**, not left
  orphaned. They were added hours earlier for this button and nothing else read them; both
  `en/home.ts` and `he/home.ts` now `git diff` clean against their pre-2026-08-18 state.
- **`usePageDict` dropped** — the component renders no text at all now. `"use client"` stays,
  because the visibility gate needs it.
- **The section now has zero interactive elements.** No tab stop, no focus ring, no
  `aria-pressed`. That is correct for decoration and is why nothing accessibility-shaped was
  put back in the toggle's place.
- **`/clix` untouched.** `ClixVideo` keeps its toggle and its `clix.video` strings; this was a
  divergence between the two sections, not a change to the shared treatment. The header note in
  `LandingVideo.tsx` now records where the two differ, since "copy of ClixVideo" is no longer
  the whole truth.

---

## 2026-08-18 — playback gated on visibility

**Ask:** *"it should only play when its in the screen."*

`IntersectionObserver` at `threshold: 0.25` in `LandingVideo.tsx`; **`autoPlay` removed** and
`preload="none"` added.

### Decisions

- **The observer is the ONLY thing that starts the element.** Keeping `autoPlay` alongside it
  would have started the clip at hydration — this section is below the fold at every tier —
  leaving the observer to stop something that should never have started. The observer's first
  callback fires on `observe()`, so "already visible on load" needs no separate branch.
- **0.25, one number for both directions.** A decision, not a measurement: a sliver of the box
  at the bottom of the viewport is not "on screen" in the sense meant. Symmetric, so there is
  no hysteresis band to reason about. ⚠️ Unverified at 390px, where a quarter of a 16:9 box is
  only ~50px.
- **`pause()`, not a `currentTime` reset** — scrolling back resumes in place.
- **Mute state survives the round trip.** Re-muting on exit was rejected: it silently undoes an
  explicit user action, and the toggle's label would then disagree with a control the reader set.
- **`preload="none"` is what the gate earns** — a visitor who never scrolls this far pays 12KB
  of poster instead of 3.5MB of mp4. Invisible because the poster is frame 0. Same call
  Testimonials makes for its six clips.
- **Empty dependency array on purpose, and it does NOT depend on `muted`** — re-running would
  tear down and rebuild the observer mid-gesture, and the `<video>` element owns mute state anyway.
- **`.catch(() => {})` on both `play()` calls.** A rejected play promise — an unmuted resume
  with no fresh gesture — is otherwise a console error on every scroll past.
- **Fallback if `IntersectionObserver` is undefined: play on mount**, i.e. the pre-gate
  behaviour. "Never plays" would be the worse failure mode — a poster and nothing else.

### Not done

- Not observed in a browser. The threshold's feel at the phone tier is the one thing worth a look.

---

## 2026-08-18 — section created

**Ask:** *"in the landing page, below the client words, we have to add the video
landing-vid.mp4 from public/video, make it just like the hero video from clix section."*

**Built:** `src/components/sections/LandingVideo.tsx`, mounted in
`src/app/_routes/HomeRoute.tsx` between `<Testimonials />` and `<WhyRogo />`.

### Decisions

- **Copied `ClixVideo`'s markup rather than importing it.** The two sections differ in exactly
  the three things a section owns — source file, surrounding padding, and dictionary namespace
  — so sharing would have meant three props plus a namespace switch, i.e. more coupling than
  the ~40 lines it saves. Recorded here so the duplication reads as a choice, not an oversight:
  if a third page ever needs this box, extract then.
- **Padding is the home page's, not `/clix`'s.** `py-10` / `tablet:py-20` both ends, because
  Testimonials already closes on `pb-32`/`desktop:pb-20` and WhyRogo opens on
  `pt-20`/`tablet:pt-24`. `/clix`'s own `pt-32` would have stacked ~196px under the
  testimonial heading. This is the only value that is not `/clix`'s verbatim.
- **New dictionary key `home.video`, duplicating `clix.video`'s two strings** rather than
  sharing them. Separate namespaces; a shared key would couple a home-page copy edit to
  `/clix`. Hebrew reuses the pair `/clix` already ships.
- **Poster generated, not shipped.** `landing-vid-poster.jpg` is frame 0 of the mp4 via
  `ffmpeg -vf "select=eq(n\,0)" -frames:v 1 -q:v 3` (12KB), matching how
  `clix-demo-poster.jpg` was made. Poster and first painted frame are identical, so no swap.

### Measured

- `public/video/landing-vid.mp4` — **1920×1080, 25.500s, 3,564,396 bytes** (ffprobe). Exactly
  16:9, so the `aspectRatio: 1.77778` container's `object-cover` never crops.

### Not done

- Never rendered in a browser. No tier was checked; `npm run build` was not run here (standing
  preference: the user verifies simple changes themselves).
- Three open questions in FEATURE.md: full-bleed vs 1280-capped, whether the clip has audio at
  all (the mute toggle assumes it does), and whether "below the client words" meant below the
  whole section or directly under its `<h2>`.
