---
name: whatif-video
description: Make a "What if…?" TikTok/Reels/Shorts video (1080x1920, ~60 s, ALWAYS in English) in the creator's flat 2D cartoon explainer style - escalating timeline (Day 1 → Week 2 …), a live meter bar, word-by-word captions with yellow keywords, an AI voiceover and a plot twist - rendered from code with HyperFrames. Use whenever the user gives a "what if" topic or asks for a new video for their channel, even if they write in German.
---

# What-if video (HyperFrames, 2D cartoon)

The user is a TikTok creator, handle **@manwhat.3** (TikTok name "WHAT IF?") (use it as `HANDLE` on every end card). They talk to you in German; **every video is in English** (script, captions,
voice, on-screen text). Answer them in German. Everything is code: the kit in `kit/` writes a HyperFrames
project (HTML + SVG + GSAP), HyperFrames renders it to MP4.

## The look (matches the creator's references, don't drift from it)
- Flat vector cartoon, thick dark outline `#2b263f`, soft vertical gradient background whose colour carries
  the mood (sky blue = normal, warm yellow/orange = day, lilac, sickly green = gross, navy = night/danger,
  light blue = plot twist), faint moving light stripes, white glow behind the character.
- One big-headed character centred (orange skin gradient, brown hair, teal shirt) who *acts*: eyes, lids,
  bags, sweat, blush, mouth shapes, look direction, squash "take" on every mood change, blinks, breathing.
- Top-left HUD: small yellow `WHAT IF?`, huge white title (`DAY 3`, `WEEK 1`, yellow `PLOT TWIST`), a meter
  bar (green → red) with a coloured status word (CALM / MESSY / PANIC / CHAOS / COLLAPSE …).
- Props that pop in on the word that names them: white circle bubbles with an icon (+ coloured label),
  rounded pills, a dark banner with yellow text, angled stamps (`100,000 TONS`), red X marks, sparkles,
  counters that count up.
- Captions: 2-3 words, Nunito Black, white with thick dark outline, keywords yellow, pop on each group,
  centred at y≈1250 (inside TikTok's safe band; nothing important below 1330 px or in the top 168 px).
- Hard cuts between beats with a whoosh, pops on props, a bass hit on stamps. End card: dark, title,
  share arrow, "SEND THIS TO SOMEONE…", handle.

## Story formula (60 s ≈ 150 spoken words)
1. **Hook (0-4 s)**: the question itself as the first line, picture already moving at frame 0.
2. **Escalating timeline**: 4-5 beats (`MONDAY 9 AM`, `DAY 1`, `DAY 3`, `WEEK 1`, `WEEK 2`, `MONTH 3` …),
   each one concrete consequence, the meter climbs every beat.
3. **One real fact per beat where possible** (a number, a historic event) - fact-check it, keep claims
   defensible, round honestly ("about three days").
4. **PLOT TWIST**: a real story that flips the premise (it actually happened / the opposite is true).
5. **Outro**: one question to the viewer (comments), then the end card with a share CTA.
Short sentences. "Day 3." alone is a line. Write numbers the way they should be *read* in the 5th tuple
field (`"1968"` → `"nineteen sixty-eight"`).

## Workflow
Work in `videos/<slug>/` of this repo. Kit = `.claude/skills/whatif-video/kit/`.

1. **Script**: write `videos/<slug>/video.py` with `TITLE, SUB, CTA, HANDLE="@manwhat.3", METER, VOICE, SPEED` and
   `LINES = [(id, scene, on_screen_text, [keywords], spoken_text_or_omit), …]`. Show the user the script
   (English) with a one-line German summary; if they asked to just go, go.
2. **Voice + timing**: `python3 .claude/skills/whatif-video/kit/voice.py videos/<slug>`
   (Kokoro `am_michael` through `npx hyperframes tts`, each line trimmed and joined, then every line
   transcribed with whisper for word times; ~10 min the first time, cached after; `SKIP_TTS=1` reuses
   the line audio and transcripts). Output: `assets/voice.wav`, `build/timing.json`.
3. **Scenes**: add `def build(v):` to `video.py` (see `references/kit-api.md` and the example
   `videos/nobody-works/video.py`). Scene names must equal the `scene` field of the lines.
4. **Generate**: `python3 .claude/skills/whatif-video/kit/whatif_kit.py videos/<slug>`
5. **Check**: in the video dir `npx hyperframes check --json` - fix every error; weigh warnings.
6. **Look**: `npx hyperframes snapshot --at t1,t2,… --no-end -o build/snap`, tile the frames with ffmpeg
   and look at them. Check: props appear on their word, nothing overlaps the face, captions readable,
   characters fully off-screen when they should be.
7. **Render** (~20 min for 60 s): `npx hyperframes render -o build/render_raw.mp4 -w 4 -q delivery`, then
   **always** make the delivery file with phone-safe audio (AAC 44.1 kHz stereo, -14 LUFS, faststart):
   `ffmpeg -i build/render_raw.mp4 -c:v copy -c:a aac -ar 44100 -ac 2 -b:a 192k -af "loudnorm=I=-14:TP=-1.5:LRA=11" -movflags +faststart build/<slug>.mp4`
   Verify sound (`ffmpeg -i build/<slug>.mp4 -vn -af volumedetect -f null -`, mean around -16 dB) and send
   the MP4 with `SendUserFile`. Tell the user the in-app preview may play muted: download it to hear it.

## Setup in a fresh session
```bash
npm i -g hyperframes@0.9.13 || true          # or use npx
pip install kokoro-onnx soundfile numpy       # local AI voice
npx hyperframes skills                       # official HyperFrames skills (format rules, registry)
```
Whisper and the Kokoro model download on first use. Chrome + ffmpeg must be present (`npx hyperframes doctor`).

## Pitfalls already hit (don't repeat)
- Every helper takes **global** seconds; `Scene.lt` clamps to ≥ 0. A negative GSAP position shifts the
  whole scene timeline (one scene became 94 s long and showed its end state).
- Timelines use `defaults:{lazy:false}` and `tl.set(...,0)` gets `immediateRender:true`
  (`force_initial`) - otherwise jumps while seeking read stale start values and frame 0 flashes props.
- Offsets on a scaled character (`s=0.56`) are in its scaled space: divide by the scale.
- Off-screen characters need |x| ≥ 950 (the shirt is 660 px wide).
- SFX need `data-duration` and their own lane or lint reports layered audio (the kit does this).
- Music: no music source without a HeyGen sign-in (`npx hyperframes auth login`, free) - deliver with
  voice + SFX and tell the user they can add a trending sound in TikTok, or sign in for the music catalog.
- Better voice: HeyGen (sign-in) or an ElevenLabs key - swap the TTS call in `voice.py`.
