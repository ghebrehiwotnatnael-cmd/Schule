#!/usr/bin/env python3
"""Fast world-only preview (no HyperFrames): renders chosen times of videos/<slug> to PNG + a contact sheet.

usage: python3 preview.py videos/<slug> 1.5,7.2,14 [--scale 0.35]
writes videos/<slug>/build/preview/t_<time>.png and sheet.jpg
"""
import importlib.util, json, os, subprocess, sys

KIT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, KIT)
import cinema_kit as ck  # noqa: E402

vdir = os.path.abspath(sys.argv[1])
times = [float(x) for x in sys.argv[2].split(",")]
scale = float(sys.argv[sys.argv.index("--scale") + 1]) if "--scale" in sys.argv else 0.35
spec = importlib.util.spec_from_file_location("video", os.path.join(vdir, "video.py"))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
v = ck.Cinema(vdir, mod)
mod.build(v)
out = os.path.join(vdir, "build", "preview")
os.makedirs(out, exist_ok=True)
sets = getattr(mod, "SET_FILES", ["sets_common.js", "sets_city.js", "sets_nature.js"])
js = "\n".join(open(os.path.join(KIT, f)).read() for f in sets) + "\n" + open(os.path.join(KIT, "world.js")).read()
js = js.replace('"assets/lib/', f'"file://{KIT}/lib/')
page = os.path.join(out, "preview.html")
open(page, "w").write(f'''<html><body style="margin:0;background:#000"><canvas id="world-canvas" width="1080" height="1920"></canvas>
<script src="file://{KIT}/lib/three.min.js"></script><script>window.WI_TRACKS={json.dumps(v.tracks())};</script>
<script>{js}</script></body></html>''')
runner = os.path.join(out, "shot.js")
open(runner, "w").write('''const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:1080,height:1920}}); p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.argv[2]); await p.waitForFunction('window.WI_DRAW'); await p.evaluate(()=>window.__hf.buildReady.world);
for (const t of process.argv.slice(3)) { await p.evaluate((t)=>window.WI_DRAW(+t), t); await p.screenshot({path: process.argv[2].replace('preview.html','t_'+t+'.png')}); }
await b.close();})();''')
r = subprocess.run(["node", runner, page] + [str(t) for t in times], capture_output=True, text=True, cwd=vdir)
print(r.stdout[-2000:], r.stderr[-2000:])
files = [os.path.join(out, f"t_{t}.png") for t in times]
cols = min(6, len(files))
inputs = sum([["-i", f] for f in files], [])
w = int(1080 * scale)
filt = "".join(f"[{i}]scale={w}:-1[s{i}];" for i in range(len(files)))
rows = (len(files) + cols - 1) // cols
pad = cols * rows - len(files)
filt += "".join(f"[s{i}]" for i in range(len(files))) + (f"xstack=inputs={len(files)}:layout=" + "|".join(
    f"{(i % cols) * w}_{(i // cols) * int(1920 * scale)}" for i in range(len(files))) + ":fill=black" if len(files) > 1 else "copy")
subprocess.run(["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", filt, os.path.join(out, "sheet.jpg")], check=True)
print("sheet:", os.path.join(out, "sheet.jpg"))
