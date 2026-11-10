#!/usr/bin/env python3
"""Fast world-only preview (no HyperFrames): renders chosen times of videos/<slug> to PNG + a contact sheet.

usage: python3 preview.py videos/<slug> 1.5,7.2,14 [--scale 0.35]
writes videos/<slug>/build/preview/t_<time>.png and sheet.jpg
"""
import importlib.util, json, os, subprocess, sys

KIT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, KIT)
import cinema_kit as ck  # noqa: E402
SS_DEFAULT = 1.0

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
import socket, time
def _up():
    try: socket.create_connection(("127.0.0.1", 8765), 1).close(); return True
    except OSError: return False
if not _up():
    subprocess.Popen([sys.executable, "-m", "http.server", "8765", "--directory", KIT], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(30):
        if _up(): break
        time.sleep(0.2)
H = "http://localhost:8765"
js = js.replace('"assets/lib/', f'"{H}/lib/')
os.makedirs(os.path.join(KIT, "_preview"), exist_ok=True)
page = os.path.join(KIT, "_preview", os.path.basename(vdir) + ".html")
libs = "".join(f'<script src="{H}/lib/{f}"></script>' for f in ["three147.min.js", "fflate.min.js", "FBXLoader.js", "GLTFLoader.js", "RGBELoader.js", "SkeletonUtils.js"])
open(page, "w").write(f'''<html><body style="margin:0;background:#000"><canvas id="world-canvas" width="1080" height="1920" style="width:1080px;height:1920px"></canvas>
{libs}<script>window.WI_SS={float(os.environ.get("WI_SS") or SS_DEFAULT)};window.WI_MSAA={int(os.environ.get("WI_MSAA") or 4)};window.WI_MODEL_BASE="{H}/models/";window.WI_HDRI_BASE="{H}/lib/hdri/";window.WI_TRACKS={json.dumps(v.tracks())};</script>
<script>{js}</script></body></html>''')
page_url = f"{H}/_preview/" + os.path.basename(vdir) + ".html"
runner = os.path.join(out, "shot.js")
open(runner, "w").write('''const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:1080,height:1920}}); p.setDefaultTimeout(600000); p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(process.argv[2]); await p.waitForFunction('window.WI_DRAW'); await p.evaluate(()=>window.__hf.buildReady.world);
for (const t of process.argv.slice(3)) { try { await p.evaluate((t)=>window.WI_DRAW(+t), t); await p.screenshot({path: process.env.OUT + '/t_' + t + '.png'}); } catch (e) { console.log('FRAME FAIL', t, e.message); } }
await b.close();})();''')
r = subprocess.run(["node", runner, page_url] + [str(t) for t in times], capture_output=True, text=True, cwd=vdir, env=dict(os.environ, OUT=out))
print(r.stdout[-2000:], r.stderr[-2000:])
files = [f for f in (os.path.join(out, f"t_{t}.png") for t in times) if os.path.exists(f)]
from PIL import Image
cols = min(6, len(files)); rows = (len(files) + cols - 1) // cols
w, h = int(1080 * scale), int(1920 * scale)
sheet = Image.new("RGB", (cols * w, rows * h))
for i, f in enumerate(files):
    sheet.paste(Image.open(f).convert("RGB").resize((w, h)), ((i % cols) * w, (i // cols) * h))
sheet.save(os.path.join(out, "sheet.jpg"), quality=85)
print("sheet:", os.path.join(out, "sheet.jpg"), len(files), "of", len(times))
