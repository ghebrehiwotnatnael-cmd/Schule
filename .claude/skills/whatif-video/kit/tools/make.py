import sys, json
sys.path.insert(0, "/home/user/Schule/.claude/skills/whatif-video/kit")
import cinema_kit as ck
poses = sys.argv[1].split(",")
js = open("/home/user/Schule/.claude/skills/whatif-video/kit/world.js").read()
for i, p in enumerate(poses):
    r, l = ck.POSES[p]
    tracks = {k: {"init": v, "segs": []} for k, v in ck.DEFAULTS.items()}
    tracks["handR"]["init"], tracks["handL"]["init"] = r, l
    tracks["item"]["init"] = {"hold": "phone", "torch": "phone", "hold_low": "cone"}.get(p, "none")
    html = f"""<html><body style="margin:0"><canvas id="world-canvas" width="1080" height="1920"></canvas>
<script src="../../assets/lib/three.min.js"></script><script>window.WI_TRACKS={json.dumps(tracks)};</script>
<script>{js.replace('"assets/lib/', '"../../assets/lib/')}</script></body></html>"""
    open(f"build/handtest/{p}.html", "w").write(html)
