#!/usr/bin/env python3
"""Voiceover + word timing for a What-if video.

usage: python3 voice.py <video_dir>

Reads <video_dir>/video.py (LINES), synthesizes every line with Kokoro through
`npx hyperframes tts`, trims and joins them into <video_dir>/assets/voice.wav,
transcribes that file with `npx hyperframes transcribe` (whisper small.en) and
aligns the transcript to the script words by position. Writes
<video_dir>/build/timing.json:
  {"lines":[{"id","scene","start","end","words":[{"w","s","e","key"}]}], "voice_end"}
Env: VOICE (default am_michael), SPEED (default 1.05), SKIP_TTS=1 reuses line wavs.
"""
import difflib, importlib.util, json, os, re, subprocess, sys
import numpy as np
import soundfile as sf

VIDEO = os.path.abspath(sys.argv[1])
spec = importlib.util.spec_from_file_location("video", os.path.join(VIDEO, "video.py"))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

VOICE = os.environ.get("VOICE", getattr(mod, "VOICE", "am_michael"))
SPEED = os.environ.get("SPEED", str(getattr(mod, "SPEED", 1.05)))
GAP_LINE, GAP_SCENE, LEAD, TAIL = 0.12, 0.34, 0.25, 0.5
BUILD = os.path.join(VIDEO, "build")
LDIR = os.path.join(BUILD, "lines")
os.makedirs(LDIR, exist_ok=True)
os.makedirs(os.path.join(VIDEO, "assets"), exist_ok=True)


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def trim(a, sr):
    env = np.convolve(np.abs(a), np.ones(int(sr * 0.01)) / int(sr * 0.01), mode="same")
    idx = np.where(env > 0.015)[0]
    if len(idx) == 0:
        return a
    return a[max(0, idx[0] - int(sr * 0.02)): min(len(a), idx[-1] + int(sr * 0.07))]


lines = mod.LINES
pieces, sr = [], None
for i, ln in enumerate(lines):
    lid, scene, disp, keys = ln[0], ln[1], ln[2], ln[3]
    say = ln[4] if len(ln) > 4 and ln[4] else disp
    path = os.path.join(LDIR, f"{lid}.wav")
    if not (os.environ.get("SKIP_TTS") and os.path.exists(path)):
        r = subprocess.run(["npx", "hyperframes", "tts", say, "-v", VOICE, "-s", SPEED, "-o", path],
                           cwd=VIDEO, capture_output=True, text=True)
        if r.returncode != 0:
            sys.exit(f"tts failed on {lid}: {r.stderr[-800:]}")
    a, sr = sf.read(path, dtype="float32")
    if a.ndim > 1:
        a = a.mean(axis=1)
    pieces.append(trim(a, sr))
    print(f"  tts {lid}: {len(pieces[-1]) / sr:.2f}s", flush=True)

timeline, t = [], LEAD
for i, ln in enumerate(lines):
    if i:
        t += GAP_SCENE if ln[1] != lines[i - 1][1] else GAP_LINE
    d = len(pieces[i]) / sr
    timeline.append({"id": ln[0], "scene": ln[1], "start": round(t, 3), "end": round(t + d, 3),
                     "disp": ln[2], "keys": ln[3]})
    t += d
total = t + TAIL
buf = np.zeros(int(total * sr) + 1, dtype=np.float32)
for ln, a in zip(timeline, pieces):
    i0 = int(ln["start"] * sr)
    buf[i0:i0 + len(a)] += a
peak = np.max(np.abs(buf)) or 1
buf = buf / peak * 0.89  # about -1 dBFS peak
voice_path = os.path.join(VIDEO, "assets", "voice.wav")
sf.write(voice_path, buf, sr, subtype="PCM_16")
print(f"voice.wav {total:.2f}s")

# ---- transcribe every line on its own (no bleed between lines), cached per line
from concurrent.futures import ThreadPoolExecutor


def transcribe_line(item):
    ln, a = item
    cache = os.path.join(LDIR, f"{ln['id']}.words.json")
    if os.environ.get("SKIP_TTS") and os.path.exists(cache):
        return json.load(open(cache))
    clip = os.path.join(LDIR, f"{ln['id']}.trim.wav")
    pad = np.zeros(int(sr * 0.3), dtype=np.float32)
    sf.write(clip, np.concatenate([pad, a, pad]), sr, subtype="PCM_16")
    tdir = os.path.join(LDIR, f"tr_{ln['id']}")
    os.makedirs(tdir, exist_ok=True)
    r = subprocess.run(["npx", "hyperframes", "transcribe", clip, "--model", "small.en", "--json", "-d", tdir],
                       cwd=VIDEO, capture_output=True, text=True)
    ws = []
    try:
        info = json.loads(r.stdout.strip().splitlines()[-1])
        tr = json.load(open(info["transcriptPath"]))
        raw = tr if isinstance(tr, list) else tr.get("words", tr.get("segments", []))
        for w in raw:
            txt = w.get("text", w.get("word", "")).strip()
            if norm(txt):
                ws.append({"t": txt, "s": float(w["start"]) - 0.3, "e": float(w["end"]) - 0.3})
    except Exception as ex:
        print(f"  transcribe failed on {ln['id']} ({ex}); proportional timing")
    json.dump(ws, open(cache, "w"))
    return ws


with ThreadPoolExecutor(3) as ex:
    per_line = list(ex.map(transcribe_line, zip(timeline, pieces)))
n_words = sum(len(x) for x in per_line)


def weight(w):
    return len(norm(w)) + 2


out = []
for ln, ws in zip(timeline, per_line):
    disp = ln["disp"].split()
    keys = set(ln["keys"])
    d = ln["end"] - ln["start"]
    ws = [dict(w) for w in ws]
    if ws:  # stretch whisper's times onto the clip's exact audio bounds, then make them global
        a0, a1 = min(max(ws[0]["s"], 0), d * 0.5), max(ws[-1]["e"], ws[0]["s"] + 0.05)
        k = d / max(0.05, a1 - a0)
        for w in ws:
            w["s"] = ln["start"] + (w["s"] - a0) * k
            w["e"] = ln["start"] + (w["e"] - a0) * k
    times = [None] * len(disp)
    if ws:
        sm = difflib.SequenceMatcher(a=[norm(x) for x in disp], b=[norm(w["t"]) for w in ws], autojunk=False)
        for blk in sm.get_matching_blocks():
            for k in range(blk.size):
                w = ws[blk.b + k]
                times[blk.a + k] = (w["s"], w["e"])
    # interpolate unmatched runs between anchors
    i = 0
    while i < len(disp):
        if times[i] is not None:
            i += 1
            continue
        j = i
        while j < len(disp) and times[j] is None:
            j += 1
        t0 = times[i - 1][1] if i > 0 else ln["start"]
        t1 = times[j][0] if j < len(disp) else ln["end"]
        if t1 <= t0:
            t1 = t0 + 0.25 * (j - i)
        tot = sum(weight(x) for x in disp[i:j])
        c = t0
        for k in range(i, j):
            d = (t1 - t0) * weight(disp[k]) / tot
            times[k] = (c, c + d)
            c += d
        i = j
    out.append({"id": ln["id"], "scene": ln["scene"], "start": ln["start"], "end": ln["end"],
                "words": [{"w": w, "s": round(max(ln["start"] - 0.05, s), 3), "e": round(e, 3), "key": w in keys}
                          for w, (s, e) in zip(disp, times)]})
json.dump({"lines": out, "voice_end": round(total, 3), "voice": VOICE}, open(os.path.join(BUILD, "timing.json"), "w"),
          indent=1)
print(f"timing.json: {len(out)} lines, {sum(len(l['words']) for l in out)} words, "
      f"{n_words} transcript words")
