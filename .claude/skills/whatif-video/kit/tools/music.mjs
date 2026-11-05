// HeyGen music catalog via the HyperFrames login (no heygen CLI needed).
//   node music.mjs search [--sfx] "<mood>" ["<mood>" ...]  -> ranked list with ids (--sfx = sound effects)
//   node music.mjs get <outdir> <name>=<idPrefix>@"<mood>" ... -> downloads <outdir>/<name>.mp3
// Needs: npx hyperframes auth login (device code: npx hyperframes auth login --device) and the
// official HyperFrames skills (~/.claude/skills/media-use, installed by `npx hyperframes skills`).
import os from "node:os";
const lib = `${os.homedir()}/.claude/skills/media-use/audio/scripts/lib/heygen.mjs`;
const { searchSounds, heygenAuthHeaders, downloadTo } = await import(lib);
const headers = heygenAuthHeaders();
let [cmd, ...args] = process.argv.slice(2);
const type = args[0] === "--sfx" ? (args.shift(), "sound_effects") : "music";
const minScore = type === "sound_effects" ? 0.4 : undefined;
if (cmd === "search") {
  for (const q of args) {
    const r = await searchSounds(q, type, headers, { limit: 8, minScore });
    console.log("== " + q);
    for (const x of r) console.log(`  ${(x.score ?? 0).toFixed(2)} | ${Math.round(x.duration ?? 0)}s | ${x.id} | ${(x.description || "").slice(0, 100)}`);
  }
} else if (cmd === "get") {
  const out = args.shift();
  for (const spec of args) {
    const [name, rest] = spec.split("=");
    const [prefix, mood] = rest.split("@");
    const r = await searchSounds(mood, type, headers, { limit: 20, minScore });
    const x = r.find((s) => (s.id || "").startsWith(prefix));
    if (!x) { console.log("not found", name); continue; }
    await downloadTo(x.audio_url, `${out}/${name}.mp3`);
    console.log("saved", `${out}/${name}.mp3`, x.id, Math.round(x.duration) + "s", x.description);
  }
}
