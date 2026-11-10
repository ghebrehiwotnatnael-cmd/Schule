#!/usr/bin/env python3
"""Fast final render, step 1: render the 3D world of videos/<slug> straight from a Playwright page to build/world.mp4
(HyperFrames itself evaluates every frame more than once, which is ~2.3x slower for heavy WebGL scenes), then point
index.html at that video instead of the live world composition.  Step 2 is the normal `npx hyperframes render`,
which then only composites captions, widget, title, end card and audio over the video.

usage: python3 worldpass.py videos/<slug>        (run cinema_kit.py first; it rewrites index.html)
"""
import importlib.util, json, os, re, subprocess, sys, socket, time

KIT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, KIT)
import cinema_kit as ck  # noqa: E402
SS_DEFAULT = 1.5

vdir = os.path.abspath(sys.argv[1])
slug = os.path.basename(vdir)
spec = importlib.util.spec_from_file_location("video", os.path.join(vdir, "video.py"))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
v = ck.Cinema(vdir, mod)
mod.build(v)
FPS = 30
dur = v.story_end
frames = int(os.environ.get("WP_FRAMES") or round(dur * FPS))

def _up():
    try:
        socket.create_connection(("127.0.0.1", 8765), 1).close(); return True
    except OSError:
        return False
if not _up():
    subprocess.Popen([sys.executable, "-m", "http.server", "8765", "--directory", KIT], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(50):
        if _up(): break
        time.sleep(0.2)
H = "http://localhost:8765"
sets = getattr(mod, "SET_FILES", ["sets_common.js", "sets_city.js", "sets_nature.js"])
js = "\n".join(open(os.path.join(KIT, f)).read() for f in sets) + "\n" + open(os.path.join(KIT, "world.js")).read()
js = js.replace('"assets/lib/', f'"{H}/lib/')
os.makedirs(os.path.join(KIT, "_preview"), exist_ok=True)
page = os.path.join(KIT, "_preview", slug + "_final.html")
libs = "".join(f'<script src="{H}/lib/{f}"></script>' for f in ["three147.min.js", "fflate.min.js", "FBXLoader.js", "GLTFLoader.js", "RGBELoader.js", "SkeletonUtils.js"])
open(page, "w").write(f'''<html><body style="margin:0;background:#000"><canvas id="world-canvas" width="1080" height="1920" style="width:1080px;height:1920px"></canvas>
{libs}<script>window.WI_SS={float(os.environ.get("WI_SS") or SS_DEFAULT)};window.WI_MSAA={int(os.environ.get("WI_MSAA") or 4)};window.WI_MODEL_BASE="{H}/models/";window.WI_HDRI_BASE="{H}/lib/hdri/";window.WI_TRACKS={json.dumps(v.tracks())};</script>
<script>{js}</script></body></html>''')
out = os.path.join(vdir, "build", "world.mp4")
os.makedirs(os.path.dirname(out), exist_ok=True)
runner = os.path.join(vdir, "build", "worldpass.js")
open(runner, "w").write(r'''const { chromium } = require('playwright'); const { spawn } = require('child_process');
(async () => {
  const [url, out, frames, fps, start] = [process.argv[2], process.argv[3], +process.argv[4], +process.argv[5], +(process.argv[6] || 0)];
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.setDefaultTimeout(1800000);
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(url); await p.waitForFunction('window.WI_DRAW'); await p.evaluate(() => window.__hf.buildReady.world);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium',
    '-crf', '14', '-vf', 'scale=1080:1920:flags=lanczos', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    const b64 = await p.evaluate((t) => { window.WI_DRAW(t); return document.getElementById('world-canvas').toDataURL('image/jpeg', 0.94).split(',')[1]; }, (start + i) / fps);
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 30 === 0) console.log(`frame ${i}/${frames}  ${((Date.now() - t0) / 1000 / (i + 1)).toFixed(2)} s/frame`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await b.close(); console.log('WORLD DONE', out);
})();
''')
def _dur(f):
    try: return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout.strip())
    except Exception: return 0.0
RANGE = os.environ.get("WP_RANGE")   # "t0,t1": re-render only that part and splice it into the existing world.mp4
if RANGE and os.path.exists(out):
    t0, t1 = [float(x) for x in RANGE.split(",")]
    f0, f1 = int(t0 * FPS), int(round(t1 * FPS))
    seg = os.path.join(vdir, "build", "world_seg.mp4")
    open(runner, "a").write("")
    rr = subprocess.run(["node", runner, f"{H}/_preview/{slug}_final.html", seg, str(f1 - f0), str(FPS), str(f0)], cwd=vdir)
    if rr.returncode != 0: sys.exit("segment pass failed")
    tmp = os.path.join(vdir, "build", "world_new.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out, "-itsoffset", str(f0 / FPS), "-i", seg, "-filter_complex",
                    f"[0:v][1:v]overlay=0:0:enable='between(t,{f0 / FPS:.4f},{(f1 - 0.5) / FPS:.4f})'[v]", "-map", "[v]",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p", "-r", str(FPS), tmp], check=True)
    os.replace(tmp, out); print("spliced", RANGE)
elif os.environ.get("WP_REUSE") and os.path.exists(out) and abs(_dur(out) - frames / FPS) < 0.1:
    print("reusing existing", out)
else:
    # resumable: render in chunks (build/world_parts/part_<start>.mp4), skip finished chunks, then join them losslessly
    CH = int(os.environ.get("WP_CHUNK") or 240)
    pdir = os.path.join(vdir, "build", "world_parts"); os.makedirs(pdir, exist_ok=True)
    parts = []
    for f0 in range(0, frames, CH):
        n = min(CH, frames - f0); part = os.path.join(pdir, f"part_{f0:05d}.mp4"); parts.append(part)
        if os.path.exists(part) and abs(_dur(part) - n / FPS) < 0.05:
            continue
        tmp = part + ".tmp.mp4"
        r = subprocess.run(["node", runner, f"{H}/_preview/{slug}_final.html", tmp, str(n), str(FPS), str(f0)], cwd=vdir)
        if r.returncode != 0 or not os.path.exists(tmp):
            sys.exit("world pass failed at frame %d" % f0)
        os.replace(tmp, part)
    lst = os.path.join(pdir, "list.txt")
    open(lst, "w").write("".join(f"file '{os.path.basename(x)}'\n" for x in parts))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", out], check=True)
    if not os.path.exists(out):
        sys.exit("world pass failed")
# point index.html at the rendered world video
idx = os.path.join(vdir, "index.html")
html = open(idx).read()
new = (f'<video id="world" src="build/world.mp4" data-start="0" data-duration="{dur}" data-track-index="1" muted playsinline '
       f'style="z-index:1;position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover"></video>')
html2, n = re.subn(r'<div id="world"[^>]*></div>', new, html)
if n == 0 and 'id="world" src="build/world.mp4"' in html:
    html2, n = re.subn(r'<video id="world"[^>]*></video>', new, html)
if n != 1:
    sys.exit("could not find the world composition in index.html")
open(idx, "w").write(html2)
print("index.html now uses build/world.mp4")
