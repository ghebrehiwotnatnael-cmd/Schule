"""Profile picture for @manwhat.3 (WHAT IF?) - 1080x1080, safe inside the circular crop."""
import sys, os
sys.path.insert(0, "/home/user/Schule/.claude/skills/whatif-video/kit")
from whatif_kit import Char, bubble, icon, place, YEL, INK, FONTS

class Stub:  # minimal scene stand-in for the character rig
    id = "av"; defs = []; chars = []

c = Char(Stub, "guy", x=540, y=520, s=1.25, mouth="o", look=(0.55, -0.7), blink=False)
guy = c.svg()
q = place("q", 830, 250, bubble(118, icon("question")), rot=8)
html = f"""<!doctype html><html><head><style>{FONTS.replace('assets/fonts/', '../.claude/skills/whatif-video/kit/fonts/')}
html,body{{margin:0;width:1080px;height:1080px;overflow:hidden}}
#bg{{position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,#fff7cf 0,#ffd166 38%,#ff9a3c 100%)}}
#rays{{position:absolute;inset:0;background:repeating-conic-gradient(from 0deg at 50% 45%,rgba(255,255,255,.16) 0 9deg,rgba(255,255,255,0) 9deg 22deg)}}
svg{{position:absolute;left:0;top:0}}
#t{{position:absolute;left:0;width:1080px;top:790px;text-align:center;font:700 158px/1 "WI Display";color:{YEL};
   -webkit-text-stroke:22px {INK};paint-order:stroke fill;filter:drop-shadow(0 12px 0 rgba(0,0,0,.35));letter-spacing:4px}}
</style></head><body><div id="bg"></div><div id="rays"></div>
<svg width="1080" height="1080" viewBox="0 0 1080 1080"><defs><radialGradient id="glow"><stop offset=".6" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>{''.join(Stub.defs)}</defs>{guy}{q}</svg>
<div id="t">WHAT IF?</div></body></html>"""
open("avatar.html", "w").write(html)
