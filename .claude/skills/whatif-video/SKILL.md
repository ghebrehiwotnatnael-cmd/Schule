---
name: whatif-video
description: Make a "What if…?" TikTok/Reels/Shorts video (1080x1920, ~60 s, ALWAYS in English) in the creator's flat 2D cartoon explainer style - escalating timeline (Day 1 → Week 2 …), a live meter bar, word-by-word captions with yellow keywords, an AI voiceover and a plot twist - rendered from code with HyperFrames. Use whenever the user gives a "what if" topic or asks for a new video for their channel, even if they write in German.
---

# What-if video (HyperFrames, 2D cartoon)

The user is a TikTok creator, handle **@manwhat.3** (TikTok name "WHAT IF?") (use it as `HANDLE` on every end card). They talk to you in German; **every video is in English** (script, captions,
voice, on-screen text). Answer them in German. Everything is code: the kit in `kit/` writes a HyperFrames
project (HTML + SVG + GSAP), HyperFrames renders it to MP4.

## DEFAULT LOOK: cinematic 3D, first-person, NO voice (`kit/cinema_kit.py` + `kit/world.js`)
The creator's references are all by the same channel (e.g. https://vm.tiktok.com/ZGdXre8Sx/,
https://vm.tiktok.com/ZGdXrpdgq/, https://vm.tiktok.com/ZGdXrqSS9/, https://vm.tiktok.com/ZGdXrpHD1/).
They asked explicitly: **no narrating voice**, only ambience / quiet music, **first-person view**, **many shots
and camera angles**, and **lots happening on screen** so it never feels monotonous. Rules:
- **POV**: camera at eye height (1.65 m) with the viewer's own blocky hands in frame (`v.hands(t, pose)`:
  hold, hold_low, shield, warm, reach, torch, hidden) holding things (phone, ice cream, phone torch).
- **A new shot every 2-4 s** (`v.shot(t, pos, look, to_pos, to_look, length)` = hard cut + slow drift).
  Mix: POV, looking up, low ground shot, street-level, wide/drone, Earth from space (real NASA texture),
  an interior (bunker) and a period set (1816 village + volcano). Add shake on impacts, bob when walking.
- **Something happens in every shot**: people walking / looking up / pointing / fleeing, phones lighting up,
  birds scattering, cars with headlights, lamps switching on, windows going dark in steps, snow + wind,
  breath vapour, frost on the lens, a white flash, ash clouds.
- Text only: title (serif, coloured keyword, glowing icon) for ~3 s, then one short italic sentence every
  3-4 s (`CAPTIONS` / `v.caption`), and the left **widget** carrying the time grid (live ticking number).
- **Sound**: `v.ambient(name, t0, t1, vol, fade)` from `kit/ambient/` (birds-evening, crowd, wind, space,
  fire, music-dark) + SFX on cuts and impacts. CC BY files need a credit line in the TikTok description
  (see `kit/ambient/CREDITS.md`). Freesound blocks automated downloads: use Wikimedia Commons via Openverse.
- **Music (HeyGen catalog, the creator is signed in)**: one cue per mood (calm start → tension build → release →
  mystery/outro). `node .claude/skills/whatif-video/kit/tools/music.mjs search "dark tense cinematic slow build"`,
  then `... music.mjs get videos/<slug>/assets/music dark=<idPrefix>@"<same mood text>"`. Measure loudness per
  5 s (ffmpeg → numpy RMS) and set `offset` so the build lands on the story's turn; place with
  `v.ambient("music/dark", t0, t1, vol, fade, offset=...)`. Music ~0.4-0.6, ambience ~0.3-0.5 (no voice).
  If `auth status` says signed out or expired: `npx hyperframes auth login --device` in the background, send
  the user the URL + code (push notification), wait. Installing the separate heygen CLI was blocked: not needed.
- Set `VOICEOVER = False`, `DURATION`, `CAPTIONS` in `video.py`; no voice.py run needed.
- Build: `python3 .claude/skills/whatif-video/kit/cinema_kit.py videos/<slug>`; example:
  `videos/sun-pov/video.py`. World properties: `DEFAULTS` in `cinema_kit.py`. Render ≈ 10-15 min.
- Test hand poses fast without HyperFrames: copy `kit/tools/make.py` + `shot.js` into `<video>/build/handtest/`,
  run `python3 build/handtest/make.py hold,shield` then `node build/handtest/shot.js hold shield` from the video dir.

### Model sets (real CC0 models, HDRI light) - `MODELS = "all"` + `SET_FILES` in video.py
Models live in `kit/models/` (gitignored, fetch with `python3 kit/tools/fetch_models.py`; Drive rate limits → rerun).
- `street` (sets_models.js): Manhattan-like block. Tracks env (day|dusk|night), cityLights, lamps, signals,
  headlights, traffic, cars, jam, crowd, panic, lookUp, stars. Sidewalk POV cam e.g. [7.6,1.65,6] → [3,3.5,-40].
- `coast` (sets_models2.js): beach, harbour/pier (x≈42), boats, cruise ship, palms, houses (z=70), people.
  Tracks tide, moon/moonPos/moonPath/moonLight, milkyway, aurora, beach (umbrellas + sunbathers), crowd.
- `forest`: night forest, clearing |x|<9; animals Fox/Wolf/Deer/Stag, track animals = graze|alert|run; moon, stars, milkyway.
- `rooms` (sets_rooms.js): hospital x=0, airport x=60 (board), telegraph 1859 x=120 (sparks), kitchen x=180
  (fridge, tapDrip), office x=240 (offline screens, black when power=0), living room x=300 (candles, tv news, boardgame).
  power, backup, daylight (sun through windows - interiors go black without it in a daytime blackout).
- `space` (world.js): earthSun, earthLights, earthIce, earthRot (fix the globe: face lon L with R = pi/2 - (L+180)deg),
  earthTilt, spaceCam, spaceMoon/spaceMoonPos, laser, cables (undersea cable network draws in), cableCut (Tonga cable red).
- Phone screen modes (`phoneUI`): feed, nosignal, offline, battery, declined, notifs, map.
- Day light: keep `light` ≈ 0.7, `envI` ≈ 0.4, `ambient` ≈ 0.2. Over-lit scenes clip before the grade, so
  lowering `exposure` only greys them.
- Fast stills: `python3 kit/tools/preview.py videos/<slug> 1.5,13,43 --scale 0.3` → `build/preview/sheet.jpg`.
- **Final render = 2 steps** (HyperFrames evaluates heavy WebGL frames ~2.3x too often): `python3 kit/cinema_kit.py videos/<slug>`,
  then `python3 kit/tools/worldpass.py videos/<slug>` (renders the 3D world to build/world.mp4 at ~2.5 s/frame and points index.html
  at it), then `npx hyperframes render ...` (only overlays + audio, ~0.3 s/frame). Launch long renders with `setsid nohup` and
  `HYPERFRAMES_RENDER_DETACHED=1`; background tool jobs are killed after 2 h. Point/spot lights that are off or far away are culled.
- HeyGen token expired → `npx hyperframes auth refresh`.

## Working rules (from the creator)
- Do NOT make a new video until the creator explicitly asks for one.
- Any NEW idea or improvement: propose it first, wait for confirmation, only then use it.

## Approved upgrades - apply from the next video on (approved by the creator)
- Look: real shadows (shadow maps) instead of blob shadows, motion blur on fast camera moves, depth of field on
  close-ups, more sets (supermarket, apartment with window, power plant, subway, hospital, beach), more character
  animation (running, hugging, looking at phones, shivering).
- Channel: frame 0 is the thumbnail, so show something spectacular from the first frame; offer 2-3 hook variants
  ... (superseded: pick ONE hook yourself, no variants); make the end loop back into the start; deliver a ready TikTok description (hashtags,
  CC-BY/music credits, a comment question) with every video; think in series ("What if ... disappeared",
  "... for 5 seconds").
- Workflow: send the shot list (table) before building. **No drafts and no variants**: the creator wants ONE
  final video every time (render at 30 fps, `-q delivery`); pick the best hook yourself.

- (approved 2026-11-06) Quality upgrade: real CC0 3D models (animated people, animals, cars, plants), HDRI lighting
  + PBR materials, denser grass/crops, filmic colour grade, detailed hero props. The creator also said: build the
  final videos directly (no shot-list approval needed when they say "direkt fertig bauen").
- (approved 2026-11-07, after studying @weirdsecret_ references: hell / coma / Islam videos) NEW STORY STYLE:
  - **Personal, second person**: "you" are the main character with a personal, emotional arc ("You jump. Not
    far enough." / "Your mom is crying next to you."), not a documentary about the world.
  - **Long, flowing camera moves**: few cuts (about 6-10 per video), transitions inside the motion (falling,
    diving, passing through), mostly one main location built in great detail.
  - **Huge crowds** where the story allows it (hundreds-thousands of people: instanced figures).
  - **Characters with faces** (eyes, mouth, brows) that show emotions through facial expression and gestures
    (crying, screaming, hands on head, kneeling, hugging, looking straight at the viewer).
  - **Character voice lines in scenes** (friends, doctor, mother ...; still NO narrator). ALWAYS list the planned
    lines + speaker per scene and get the creator's OK before generating them. Voices: HeyGen voices through the
    existing HyperFrames sign-in (`media-use generate --type voice`), one distinct voice per character.
    ElevenLabs is connected too (key injected by the proxy for api.elevenlabs.io, free tier 10,000 characters/month):
    `curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/<voice_id>?output_format=mp3_44100_128" -H "Content-Type: application/json" -d '{"text":"...","model_id":"eleven_multilingual_v2"}' -o line.mp3`
    (no header needed). The key has no voices_read permission: use premade voice ids (e.g. George JBFqnCBsd6RMkjVDRZzb).
  - **Look**: lots of particles (embers, sparks, dust, snow), strong depth of field, strong glow/bloom, one
    consistent colour mood per video. **Rich, saturated colours, well lit: never dark, never neutral or pale**
    (creator, 2026-11-07).
  - (creator, 2026-11-08) **Mix camera angles**: besides the flowing POV takes, cut in other perspectives
    (wide, drone, low angle, over-the-shoulder, close-ups of faces) and show **more examples / cutaways** of what
    happens in the world (other places, other people), roughly 12-16 shots per video.
  - (approved 2026-11-09, after analysing @man_ia_c) **One-take escalation**: ONE location, ONE chain reaction that keeps
    growing, 2-5 cuts only, the camera stays with "you" and flies out (up to space) and back; the world changes around
    you instead of cutting. **Live widget** with a physical value that ticks every second + a comparison line
    ("WAVE HEIGHT 1,086 ft · 0.4 MILES AWAY"), ending in a word (HERE / BACK / forever); a big red centre countdown
    for tension moments. **Full-screen effects** (cracking glass, shockwaves, wireframe/x-ray, colour distortion).
    **One music track** that builds to the climax and drops to near silence for the end card. A **recurring main
    character** for the channel. More **"... for 5 seconds"** physics/chemistry topics. End card: title + 2 small fact
    lines + "What should we try next? Comment below." First caption sets the scene in second person.
  - (creator, 2026-11-10) **The recurring main character is now "The Weeknd" (forever, replaces Kai)**: the blocky
    star built for the concert video: afro, mustache, big black sunglasses, glitter red blazer (#b5121b, sequins +
    dark red lapels), black shirt + black tie, dark trousers, skin #5a3826. He is "your" close friend in the story
    (next to you, reacting, cheering, pointing; no voice unless the creator approves lines). In the resort/rooms/street
    sets he is the cast member `weeknd` (tracks `weekndPos`, `weekndRot`, `weekndMode`, `weekndFace`, `starFill` face
    light); in the concert set he is the `artist`. Keep "fan-made, not affiliated with The Weeknd" in the description.
  - (approved 2026-11-10, after the concert video: "people were not rendered perfectly") **Quality pass for every video**:
    - **Real 3D crowds to the horizon**: full blocky people near, simplified people in the middle, lit person impostors
      far away; hide the LOD steps with haze + DOF. Never flat pattern textures for crowds, never bare boxes as houses.
    - **Lively crowds**: every person moves differently (own phase, speed, mix of jump/wave/phone light/run), no
      synchronised motion; more facial expression on the main character.
    - **Sharper image**: MSAA 4x on the scene target + 1.5x supersampling in the world pass (lanczos down to 1080x1920);
      check previews at full size before the final render.
    - **Attention span**: spectacular first frame, a new escalation beat every 3-4 s (number jumps, effect, camera
      punch-in/whip, speed ramp), a sound hit on every beat, the widget never stands still, the end loops into the start.
  - (approved 2026-11-11, after a frame-by-frame analysis of all 14 reference videos) **Reference-grade look and sound**:
    - **Facades with real detail**: brick/stone/glass facades with window frames, sashes, cornices, storefronts with awnings,
      fire escapes, water towers, offices visible behind the windows (interior mapping); aerial haze so far buildings fade.
    - **Natural colours**: reference saturation is ~0.2-0.43 (ours was 0.43-0.76): soft sun, real shadows, filmic grade
      (saturation ~1.0-1.1, no plastic over-saturation), still rich and never pale or dark.
    - **Dynamic sound**: integrated loudness ~-16 LUFS with a wide range (LRA 9-17): quiet start, build, a hard sound hit at
      every turning point (5-10 per minute), near silence at the very end.  Motion and cuts front-loaded (fastest in the first half).
    - **Delivery**: ~8 Mbit/s H.264 (crf 18) so more detail survives TikTok's re-encode.
  - **Text and ending**: captions of at most ~6 words, a hard closing line that hits the viewer personally, a plain
    black end card with just the title, TikTok caption phrased as a direct question to the viewer.

## Creator feedback - apply to EVERY video (latest first)
- After "insects-gone" draft: **raise the visual quality next time.** Plan: real CC0 3D models instead of box
  primitives (Poly Haven models/HDRIs/PBR textures via api.polyhaven.com; Quaternius rigged, animated characters,
  animals, plants, vehicles; Khronos glTF samples), GLTFLoader + HDRI image-based lighting + PBR materials,
  better grass/crops (instanced cards), softer shadows, colour grading, higher-detail hero props for close-ups.
  Propose the concrete upgrade list to the creator first (rule: ideas need confirmation).
- After "sun-pov" (liked it overall): **don't rush through the timeline.** Each stage needs room to breathe:
  2-4 shots per stage instead of one, so the viewer feels the time passing.
- **Always add more and different perspectives**: same moment from several angles (POV, close-up on a detail,
  wide/drone, from inside a building, through a window, from a car, a screen/news/phone view, from space).
- **Show the side stories, not only the headline**, for every stage ask "what else is happening right now?":
  - the **power grid / infrastructure** (power plant, substations, flickering lights, blackout spreading street by
    street, traffic lights out, phone network down, water/heating);
  - **what people do** (panic buying, queues, crowds watching the sky, people at home with candles, families
    huddling, news on TV/phones, empty streets, emergency services, people helping each other);
  - **nature and animals** (birds, pets, plants, sea), **city details** (shops, signs, cars, trains).
- Plan the shot list first as a table: stage → 3-5 sub-moments (headline, power, people, nature, detail) →
  camera for each. A 60-90 s video should have ~25-35 shots; keep each stage on screen long enough to read.

## Alternative look: flat 2D cartoon (`kit/whatif_kit.py`, only if asked)
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
8. **Notify**: send a `PushNotification` to the user's phone when the video is delivered (they asked for this).

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
