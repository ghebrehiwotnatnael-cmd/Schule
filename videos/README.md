# What-if videos

One folder per video, built with the `whatif-video` skill (`.claude/skills/whatif-video/SKILL.md`).

```bash
python3 .claude/skills/whatif-video/kit/voice.py videos/<slug>        # AI voice + word timing
python3 .claude/skills/whatif-video/kit/whatif_kit.py videos/<slug>   # write the HyperFrames project
cd videos/<slug> && npx hyperframes check && npx hyperframes render -o build/<slug>.mp4 -w 4 -q delivery
```
