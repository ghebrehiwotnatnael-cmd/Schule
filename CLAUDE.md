# Notes for Claude

- The user is a TikTok creator (@manwhat.3, "WHAT IF?"). Talk to them in German; videos are always English
  (see `.claude/skills/whatif-video/SKILL.md`).
- **Every time a task the user gave you is finished (or fails / needs their decision), send a push
  notification to their phone with the `PushNotification` tool** (load it via ToolSearch if deferred):
  one line, under 200 characters, saying what is ready, e.g. "Video 'Sun gone' fertig: 64 s, im Chat".
