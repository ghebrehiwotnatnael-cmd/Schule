"""Cinematic 3D What-if style (the creator's main look): a three.js low-poly world driven by time,
serif title with coloured keyword, left countdown widget (label / big serif number / mono sub-line),
italic serif sentence captions, dark end card.  Builds a HyperFrames project from video.py:

  LINES (as for voice.py) + def build(v): v.key(...), v.widget(...), v.sfx(...), v.title_until(...)

usage: python3 cinema_kit.py videos/<slug>
"""
import html, json, os, shutil, subprocess, sys, importlib.util

KIT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, KIT)
from whatif_kit import Timing, r3, sfx_len  # noqa: E402

FONTS = ('@font-face{font-family:"WI Serif";src:url("assets/fonts/spectral-400-normal.woff2") format("woff2");font-weight:400}\n'
         '@font-face{font-family:"WI Serif";src:url("assets/fonts/spectral-500-normal.woff2") format("woff2");font-weight:500}\n'
         '@font-face{font-family:"WI Serif";src:url("assets/fonts/spectral-400-italic.woff2") format("woff2");font-weight:400;font-style:italic}')

HIDDEN = [0.3, -0.9, -0.4, 0, 0, 0]
DEFAULTS = {
    "set": "park", "camPos": [0, 1.65, 6], "camLook": [0, 6, -60], "fov": 52, "roll": 0.0, "shake": 0.0, "bob": 0.0,
    "skyTop": "#7f8fb3", "skyHorizon": "#d9c9c4", "skyBottom": "#3c4a2f", "fogFar": 1400,
    "sun": 1.0, "sunDir": [0.3, 0.3, -1], "light": 1.0, "lightColor": "#ffe2b0", "ambient": 0.9,
    "ambientColor": "#dfe6ff", "cold": 0.0, "frost": 0.0, "pondIce": 0.0, "cityLights": 0.15, "city": 1.0, "village": 0.0,
    "lamps": 0.0, "people": 1.0, "walk": 1.0, "lookUp": 0.0, "point": 0.0, "flee": 0.0, "phones": 0.0,
    "traffic": 1.0, "cars": 1.0, "headlights": 0.0, "birds": 0.0, "scatter": 0.0,
    "moon": 1.0, "moonShow": 0.0, "moonPos": [120, 260, -700], "stars": 0.0, "snow": 0.0, "wind": 0.0, "hatch": 0.0,
    "volcano": 0.0, "ash": 0.0,
    "handR": HIDDEN, "handL": HIDDEN, "item": "none", "torch": 0.0, "shiver": 0.0, "breath": 0.0, "frostLens": 0.0, "flash": 0.0,
    "spaceCam": [0, 0, 34], "spaceFov": 40, "earthSun": 1.0, "earthLights": 1.0, "earthIce": 0.0,
    "dof": 0.0, "focus": 5.0, "mblur": 0.0, "shadowSize": 25.0,
    "exposure": 1.0, "contrast": 1.0, "saturation": 1.0, "warmth": 0.0, "vignette": 0.0, "grain": 0.0, "tonemap": 0.0,
}
# first-person hand poses (camera space: x right, y up, z forward is negative; then rx, ry, rz)
POSES = {
    "hidden": (HIDDEN, HIDDEN),
    "hold": ([0.055, -0.125, -0.42, 0.95, 0.0, 0.12], HIDDEN),           # phone in the right hand, looking at it
    "hold_low": ([0.085, -0.15, -0.45, 0.45, 0.0, 0.2], HIDDEN),         # ice cream / object held low right
    "shield": ([0.075, -0.035, -0.5, 1.45, 0.0, -0.3], [0.075, -0.035, -0.5, 1.45, 0.0, -0.3]),  # hands up against light
    "warm": ([0.06, -0.11, -0.4, 1.25, 0.0, 0.3], [0.06, -0.11, -0.4, 1.25, 0.0, 0.3]),        # palms forward, cold
    "reach": ([0.06, -0.1, -0.46, 0.75, 0.0, 0.05], HIDDEN),              # reaching out, palm up
    "torch": ([0.075, -0.14, -0.42, 0.7, 0.0, 0.08], HIDDEN),            # phone flashlight pointed forward
    "grab": ([0.07, -0.09, -0.52, 0.25, 0.0, 0.25], [0.07, -0.09, -0.52, 0.25, 0.0, -0.1]),   # both hands forward, grabbing someone
}


def esc(s):
    return html.escape(str(s), quote=True)


class Cinema:
    def __init__(self, vdir, mod):
        self.dir, self.m = vdir, mod
        tp = os.path.join(vdir, "build", "timing.json")
        self.voice = getattr(mod, "VOICEOVER", True) and os.path.exists(tp)
        self.T = Timing(tp) if self.voice else None
        self.keys, self.widgets, self.sfx_list, self.no_caption, self.ambient_list = [], [], [], set(), []
        self.bigcounts = []
        self.freezes, self.callouts = [], []
        self.caps = list(getattr(mod, "CAPTIONS", []))   # no-voice mode: [(t0, t1, text)]
        self.story_end = r3(self.T.voice_end + 0.6) if self.voice else r3(getattr(mod, "DURATION", 60))
        self.end_card = float(getattr(mod, "END_CARD", 4.0))
        self.duration = r3(self.story_end + self.end_card)
        self.title_end = 3.0
        self.icon = ""

    def L(self, i): return self.T.L(i)
    def E(self, i): return self.T.E(i)
    def W(self, i, k): return self.T.W(i, k)

    def beat(self, name):
        """start of the first line of a beat (scene field)"""
        return next(l["start"] for l in self.T.order if l["scene"] == name)

    def key(self, t, dur=1.2, lin=False, **props):
        """from global time t, ease every given world property to its new value over dur seconds
        (lin=True: linear instead of smoothstep, used by path() so chained segments keep their speed)"""
        if lin:
            props = dict(props, __lin__=True)
        self.keys.append((t, dur, props))
        return self

    def vpath(self, prop, t0, t1, pts, step=0.1):
        """move any vector property (e.g. a character position) along a smooth Catmull-Rom path"""
        def cr(u):
            n = len(pts) - 1
            f = min(max(u, 0.0), 1.0) * n
            i = min(int(f), n - 1)
            s = f - i
            p0, p1, p2, p3 = pts[max(i - 1, 0)], pts[i], pts[i + 1], pts[min(i + 2, n)]
            return [round(0.5 * ((2 * b) + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s * s + (-a + 3 * b - 3 * c + d) * s ** 3), 3)
                    for a, b, c, d in zip(p0, p1, p2, p3)]
        self.key(t0, 0, **{prop: cr(0)})
        n = max(1, int(round((t1 - t0) / step)))
        for k in range(1, n + 1):
            self.key(t0 + (k - 1) * (t1 - t0) / n + 0.0005, (t1 - t0) / n, lin=True, **{prop: cr(k / n)})
        return self

    def path(self, t0, t1, pos_pts, look_pts=None, step=0.1, **extra):
        """one long flowing camera move through several points (Catmull-Rom), from t0 to t1.
        pos_pts / look_pts: lists of [x,y,z]; the look path may have a different number of points."""
        def cr(pts, u):
            n = len(pts) - 1
            if n == 0:
                return list(pts[0])
            f = min(max(u, 0.0), 1.0) * n
            i = min(int(f), n - 1)
            s = f - i
            p0, p1, p2, p3 = pts[max(i - 1, 0)], pts[i], pts[i + 1], pts[min(i + 2, n)]
            return [0.5 * ((2 * b) + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s * s + (-a + 3 * b - 3 * c + d) * s ** 3)
                    for a, b, c, d in zip(p0, p1, p2, p3)]
        ease = lambda u: u * u * (3 - 2 * u) * 0.35 + u * 0.65      # gentle ease in/out over the whole move
        look_pts = look_pts or [[p[0], p[1], p[2] - 10] for p in pos_pts]
        self.key(t0, 0, camPos=[round(x, 3) for x in cr(pos_pts, 0)], camLook=[round(x, 3) for x in cr(look_pts, 0)], **extra)
        n = max(1, int(round((t1 - t0) / step)))
        for k in range(1, n + 1):
            u = ease(k / n)
            ta = t0 + (k - 1) * (t1 - t0) / n
            self.key(ta + 0.0005, (t1 - t0) / n, lin=True, camPos=[round(x, 3) for x in cr(pos_pts, u)],
                     camLook=[round(x, 3) for x in cr(look_pts, u)])
        return self

    def widget(self, t0, t1, label, sub="", mode="text", v0=0, v1=0, value=""):
        """left widget segment: mode 'sec' (m:ss.mmm counting v0->v1 seconds), 'days' (Nd hh:mm:ss, v in days), 'text'"""
        self.widgets.append(dict(t0=r3(t0), t1=r3(t1), label=label, sub=sub, mode=mode, v0=v0, v1=v1, value=value))
        return self

    def bigcount(self, t0, t1, label, n0, n1):
        """big red countdown at the top centre (e.g. 'GRAVITY DOUBLES IN' 5 -> 0), whole numbers"""
        self.bigcounts.append(dict(t0=r3(t0), t1=r3(t1), label=label, n0=n0, n1=n1))
        return self

    def freeze(self, t0, dur):
        """freeze frame: the world holds the frame at t0 for dur seconds, then jumps on (overlays keep running)"""
        self.freezes.append([r3(t0), r3(dur)])
        return self

    def callout(self, t0, t1, x, y, text, lx=None, ly=None, color="#ffe14d"):
        """arrow from a label at (lx, ly) to the point (x, y) in 1080x1920 screen pixels, e.g. on a freeze frame"""
        lx = x + 160 if lx is None else lx
        ly = y - 260 if ly is None else ly
        self.callouts.append(dict(t0=r3(t0), t1=r3(t1), x=x, y=y, lx=lx, ly=ly, text=text, color=color))
        return self

    def sfx(self, name, t, vol=0.5):
        self.sfx_list.append((name, max(0.0, t), vol))

    def ambient(self, name, t0, t1, vol=0.5, fade=0.8, offset=0.0):
        """ambience from kit/ambient/<name>.mp3, or a project file "music/<name>" (assets/music/<name>.mp3)"""
        self.ambient_list.append((name, r3(t0), r3(t1), vol, fade, offset))

    def caption(self, t0, t1, text):
        self.caps.append((r3(t0), r3(t1), text))

    def hands(self, t, pose, dur=0.45, **extra):
        r, l = POSES[pose]
        return self.key(t, dur, handR=r, handL=l, **extra)

    def shot(self, t, pos, look, to_pos=None, to_look=None, length=3.0, fov=None, **extra):
        """hard cut to a camera at t, then drift to (to_pos, to_look) over length seconds"""
        kw = dict(camPos=pos, camLook=look, **extra)
        if fov is not None:
            kw["fov"] = fov
        self.key(t, 0, **kw)
        if to_pos or to_look:
            self.key(t + 0.001, length, camPos=to_pos or pos, camLook=to_look or look)
        return self

    def title_until(self, t, icon_svg=""):
        self.title_end, self.icon = r3(t), icon_svg

    # ------------------------------------------------ compile tracks
    def tracks(self):
        out = {}
        extra = dict(getattr(self.m, "WORLD_DEFAULTS", {}))
        props = dict(DEFAULTS)
        for _, _, kp in self.keys:
            for k in kp:
                if k != "__lin__":
                    props.setdefault(k, extra.get(k, 0.0))
        props.update({k: v for k, v in extra.items()})
        for prop, init in props.items():
            if not isinstance(init, list):   # vector props (positions) with no default: start from their first value
                first = next((kp[prop] for _, _, kp in sorted(self.keys, key=lambda k: k[0]) if prop in kp), None)
                if isinstance(first, list):
                    init = first
            cur, segs = init, []
            for t, dur, props in sorted(self.keys, key=lambda k: k[0]):
                if prop in props:
                    segs.append([r3(t), r3(t + (0 if isinstance(props[prop], str) and not props[prop].startswith("#") else dur)),
                                 cur, props[prop]] + ([1] if props.get("__lin__") else []))
                    cur = props[prop]
            out[prop] = {"init": init, "segs": segs}
        out["__freeze"] = sorted(self.freezes)
        return out

    # ------------------------------------------------ compositions
    def world_html(self):
        sets = getattr(self.m, "SET_FILES", ["sets_common.js", "sets_city.js", "sets_nature.js"])
        js = "\n".join(open(os.path.join(KIT, f)).read() for f in sets) + "\n" + open(os.path.join(KIT, "world.js")).read()
        D = self.story_end
        return f'''<template>
<style>#root{{position:absolute;inset:0;background:#000;}} #world-canvas{{position:absolute;left:0;top:0;width:1080px;height:1920px;}}</style>
<div id="root" data-composition-id="world" data-width="1080" data-height="1920">
  <canvas id="world-canvas" width="1080" height="1920" data-layout-ignore></canvas>
</div>
<script>
window.WI_TRACKS = {json.dumps(self.tracks())};
{js}
(function(){{
const tl = gsap.timeline({{paused:true,defaults:{{lazy:false}}}});
const st = {{t:0}};
tl.to(st,{{t:{D},duration:{D},ease:"none",onUpdate:()=>window.WI_DRAW(st.t)}},0);
window.__timelines["world"] = tl;
}})();
</script>
</template>
'''

    def title_html(self):
        m = self.m
        title = esc(m.TITLE)
        key = getattr(m, "TITLE_KEY", None)
        if key:
            title = title.replace(esc(key), f'<span class="k">{esc(key)}</span>', 1)
        T = self.title_end
        return f'''<template>
<style>
{FONTS}
#root{{position:absolute;inset:0;pointer-events:none;}}
#ti-icon{{position:absolute;left:340px;top:150px;width:400px;height:400px;}}
#ti-text{{position:absolute;left:60px;width:960px;top:520px;text-align:center;font:400 70px/1.18 "WI Serif";color:#fff;
  text-shadow:0 2px 18px rgba(0,0,0,.55),0 1px 3px rgba(0,0,0,.6);}}
#ti-text .k{{color:{getattr(m, "KEY_COLOR", "#8fc3ff")};}}
</style>
<div id="root" data-composition-id="title" data-width="1080" data-height="1920">
  <svg id="ti-icon" viewBox="-200 -200 400 400" data-layout-allow-overflow>{self.icon}</svg>
  <div id="ti-text">{title}</div>
</div>
<script>
(function(){{
const tl = gsap.timeline({{paused:true,defaults:{{lazy:false}}}});
tl.fromTo("#ti-icon",{{opacity:0,scale:.6}},{{opacity:1,scale:1,duration:.8,ease:"power3.out"}},0.05);
tl.fromTo("#ti-text",{{opacity:0,y:18}},{{opacity:1,y:0,duration:.7,ease:"power2.out"}},0.15);
tl.to("#ti-text",{{opacity:0,y:-10,duration:.5,ease:"power2.in"}},{r3(T - .5)});
tl.to("#ti-icon",{{opacity:0,scale:.85,duration:.5}},{r3(T - .5)});
window.__timelines["title"] = tl;
}})();
</script>
</template>
'''

    def widget_html(self):
        D = self.story_end
        segs = json.dumps(self.widgets)
        bcs = json.dumps(self.bigcounts)
        cos = json.dumps(self.callouts)
        return f'''<template>
<style>
{FONTS}
#root{{position:absolute;inset:0;pointer-events:none;}}
#wg{{position:absolute;left:64px;top:888px;width:760px;color:#fff;text-shadow:0 1px 10px rgba(0,0,0,.55),0 1px 2px rgba(0,0,0,.6);}}
#wg-label{{font:600 27px "Inter";letter-spacing:2.6px;}}
#wg-value{{margin-top:2px;font:400 66px/1 "WI Serif";letter-spacing:1px;font-variant-numeric:tabular-nums;}}
#wg-sub{{margin-top:18px;font:500 18px "IBM Plex Mono";letter-spacing:3px;opacity:.82;}}
#bc{{position:absolute;left:0;right:0;top:300px;text-align:center;color:#ff3b3b;text-shadow:0 0 18px rgba(255,40,40,.45),0 2px 6px rgba(0,0,0,.5);opacity:0;}}
#bc-label{{font:700 30px "IBM Plex Mono";letter-spacing:7px;}}
#bc-num{{font:500 150px/1 "IBM Plex Mono";margin-top:4px;}}
</style>
<div id="root" data-composition-id="widget" data-width="1080" data-height="1920">
  <div id="wg"><div id="wg-label"></div><div id="wg-value"></div><div id="wg-sub"></div></div>
  <div id="bc"><div id="bc-label"></div><div id="bc-num"></div></div>
  <svg id="co" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0;opacity:0" data-layout-allow-overflow>
    <defs><marker id="co-h" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ffe14d"/></marker></defs>
    <path id="co-p" d="" fill="none" stroke="#ffe14d" stroke-width="9" stroke-linecap="round" marker-end="url(#co-h)" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,.6))"/>
    <text id="co-t" x="0" y="0" text-anchor="middle" style="font:700 64px 'Inter';fill:#ffe14d;letter-spacing:2px;paint-order:stroke;stroke:rgba(0,0,0,.55);stroke-width:8px"></text>
  </svg>
</div>
<script>
(function(){{
const S = {segs};
const el = (id)=>document.getElementById(id);
const p2 = (n)=>String(Math.floor(n)).padStart(2,"0");
function fmt(seg, t){{
  const k = seg.t1>seg.t0 ? Math.min(1,Math.max(0,(t-seg.t0)/(seg.t1-seg.t0))) : 1;
  const v = seg.v0 + (seg.v1-seg.v0)*k;
  if(seg.mode==="sec"){{ const s=Math.max(0,v); const m=Math.floor(s/60); return m+":"+p2(s%60)+"."+String(Math.floor((s%1)*1000)).padStart(3,"0"); }}
  if(seg.mode==="count"){{ return Math.round(Math.max(0,v)).toLocaleString("en-US"); }}
  if(seg.mode.indexOf("num")===0){{ const pr=seg.mode.split(":"); const dec=+(pr[1]||0); return v.toLocaleString("en-US",{{minimumFractionDigits:dec,maximumFractionDigits:dec}})+(pr.slice(2).join(":")||""); }}
  if(seg.mode==="pct"){{ const r=Math.round(v); return (r>0?"+":"")+r+"%"; }}
  if(seg.mode==="days"){{ const d=Math.max(0,v); const dd=Math.floor(d); const h=(d-dd)*24; const mi=(h%1)*60; const se=(mi%1)*60;
    return dd+"d "+p2(h)+":"+p2(mi)+":"+p2(se); }}
  return seg.value;
}}
const BCS = {bcs};
const COS = {cos};
function renderCO(t){{
  let c=null; for(const s of COS){{ if(s.t0<=t && t<s.t1) c=s; }}
  const e=el("co"); if(!c){{ e.style.opacity=0; return; }}
  const k=Math.min(1,(t-c.t0)/0.25); e.style.opacity=Math.min(1,(t-c.t0)/0.12,(c.t1-t)/0.15);
  const sx=c.lx, sy=c.ly+24, ex=sx+(c.x-sx)*k, ey=sy+(c.y-sy)*k, mx=(sx+ex)/2+(ey-sy)*0.25, my=(sy+ey)/2-(ex-sx)*0.25;
  el("co-p").setAttribute("d","M"+sx+","+sy+" Q"+mx+","+my+" "+ex+","+ey);
  const tt=el("co-t"); tt.textContent=c.text; tt.setAttribute("x",c.lx); tt.setAttribute("y",c.ly); tt.style.fontSize=(64*(0.8+0.2*k))+"px";
}}
function renderBC(t){{
  let b=null; for(const s of BCS){{ if(s.t0<=t && t<s.t1) b=s; }}
  const e=el("bc"); if(!b){{ e.style.opacity=0; return; }}
  const k=Math.min(1,Math.max(0,(t-b.t0)/(b.t1-b.t0))); const v=b.n0+(b.n1-b.n0)*k; const n=Math.ceil(v-1e-6);
  const frac=v-Math.floor(v); e.style.opacity=Math.min(1,(t-b.t0)/0.2,(b.t1-t)/0.2);
  el("bc-label").textContent=b.label; el("bc-num").textContent=String(n);
  el("bc-num").style.transform="scale("+(1+0.18*Math.max(0,frac-0.8)*5)+")";
}}
function render(t){{
  renderBC(t); renderCO(t);
  let seg=null; for(const s of S){{ if(s.t0<=t && t<s.t1) seg=s; }}
  const w=el("wg");
  if(!seg){{ w.style.opacity=0; return; }}
  const fadeIn=Math.min(1,(t-seg.t0)/0.25), fadeOut=Math.min(1,(seg.t1-t)/0.25);
  const prev=S.find(s=>Math.abs(s.t1-seg.t0)<1e-3 && s.label===seg.label);
  const next=S.find(s=>Math.abs(s.t0-seg.t1)<1e-3 && s.label===seg.label);
  w.style.opacity = Math.min(prev?1:fadeIn, next?1:fadeOut);
  el("wg-label").textContent=seg.label; el("wg-sub").textContent=seg.sub; el("wg-value").textContent=fmt(seg,t);
}}
const tl = gsap.timeline({{paused:true,defaults:{{lazy:false}}}});
const st={{t:0}};
tl.to(st,{{t:{D},duration:{D},ease:"none",onUpdate:()=>render(st.t)}},0);
render(0);
window.__timelines["widget"] = tl;
}})();
</script>
</template>
'''

    def captions_html(self):
        groups, js = [], []
        if self.voice:
            lines = [l for l in self.T.order if l["id"] not in self.no_caption]
            items = []
            for k, ln in enumerate(lines):
                nxt = lines[k + 1]["start"] - 0.06 if k + 1 < len(lines) else ln["end"] + 0.9
                items.append((max(0.1, ln["start"] - 0.06), min(nxt, ln["end"] + 0.9), " ".join(w["w"] for w in ln["words"])))
        else:
            items = sorted(self.caps)
        for k, (s0, s1, text) in enumerate(items):
            s0, s1 = r3(s0), r3(s1)
            gid = f"cap-{k}"
            groups.append(f'<div id="{gid}" class="clip cap" data-start="{s0}" data-duration="{r3(s1 - s0)}" data-track-index="0">'
                          f'<div class="cap-in">{esc(text)}</div></div>')
            js.append(f'tl.fromTo("#{gid} .cap-in",{{opacity:0,y:8}},{{opacity:1,y:0,duration:.28,ease:"power2.out"}},{s0});'
                      f'tl.to("#{gid} .cap-in",{{opacity:0,duration:.18}},{r3(max(s0 + .3, s1 - .19))});')
        return f'''<template>
<style>
{FONTS}
#root{{position:absolute;inset:0;pointer-events:none;}}
.cap{{position:absolute;left:0;top:1236px;width:1080px;height:200px;text-align:center;}}
.cap-in{{display:inline-block;max-width:930px;font:italic 400 46px/1.25 "WI Serif";color:#fff;
  text-shadow:0 2px 14px rgba(0,0,0,.7),0 1px 3px rgba(0,0,0,.8);}}
</style>
<div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
{chr(10).join(groups)}
</div>
<script>
(function(){{
const tl = gsap.timeline({{paused:true,defaults:{{lazy:false}}}});
{chr(10).join(js)}
window.__timelines["captions"] = tl;
}})();
</script>
</template>
'''

    def endcard_html(self):
        m = self.m
        title = esc(m.TITLE)
        key = getattr(m, "TITLE_KEY", None)
        if key:
            title = title.replace(esc(key), f'<span class="k">{esc(key)}</span>', 1)
        sub = "<br>".join(esc(x) for x in m.SUB.split("\n"))
        if getattr(m, "END_STYLE", "") == "title":   # plain black card with only the title
            return f'''<template>
<style>
{FONTS}
#root{{position:absolute;inset:0;background:#000;}}
#ec{{position:absolute;left:90px;width:900px;top:780px;text-align:center;color:#f2f2f2;}}
#ec-title{{font:400 70px/1.18 "WI Serif";}}
#ec-title .k{{color:{getattr(m, "KEY_COLOR", "#8fc3ff")};}}
#ec-sub{{margin-top:36px;font:500 17px/1.7 "IBM Plex Mono";letter-spacing:3px;color:#8d8d96;}}
#ec-ask{{margin-top:70px;font:italic 400 36px "WI Serif";color:{getattr(m, "KEY_COLOR", "#8fc3ff")};}}
#ec-ask2{{margin-top:16px;font:600 19px "IBM Plex Mono";letter-spacing:4px;color:#d9a74a;}}
</style>
<div id="root" data-composition-id="endcard" data-width="1080" data-height="1920">
 <div id="ec"><div id="ec-title">{title}</div><div id="ec-sub">{sub}</div><div id="ec-ask">{esc(getattr(m, "END_ASK", ""))}</div><div id="ec-ask2">{esc(getattr(m, "END_ASK2", ""))}</div></div>
</div>
<script>
(function(){{
const tl = gsap.timeline({{paused:true,defaults:{{lazy:false}}}});
tl.fromTo("#ec-title",{{opacity:0}},{{opacity:1,duration:.8}},0.2);
tl.fromTo("#ec-sub",{{opacity:0}},{{opacity:1,duration:.6}},0.7);
tl.fromTo(["#ec-ask","#ec-ask2"],{{opacity:0,y:10}},{{opacity:1,y:0,duration:.6,stagger:.2}},1.1);
window.__timelines["endcard"] = tl;
}})();
</script>
</template>
'''
        sub = "<br>".join(esc(x) for x in m.SUB.split("\n"))
        cta = "<br>".join(esc(x) for x in m.CTA.split("\n"))
        avatar = '<img id="ec-av" src="assets/avatar.png" alt="">' if os.path.exists(os.path.join(self.dir, "assets", "avatar.png")) else '<span id="ec-av"></span>'
        return f'''<template>
<style>
{FONTS}
#root{{position:absolute;inset:0;background:#121212;}}
#ec{{position:absolute;left:70px;width:940px;top:700px;text-align:center;color:#f2f2f2;}}
#ec-title{{font:400 66px/1.18 "WI Serif";}}
#ec-title .k{{color:{getattr(m, "KEY_COLOR", "#8fc3ff")};}}
#ec-sub{{margin-top:40px;font:500 19px/1.7 "IBM Plex Mono";letter-spacing:4px;color:#9a9aa3;}}
#ec-share{{display:block;margin:150px auto 0;width:84px;height:70px;}}
#ec-cta{{margin-top:26px;font:600 24px/1.7 "IBM Plex Mono";letter-spacing:4px;color:#fff;text-decoration:underline;text-underline-offset:8px;}}
#ec-handle{{margin-top:190px;font:600 34px "Inter";color:#fff;display:flex;align-items:center;justify-content:center;gap:18px;}}
#ec-av{{width:64px;height:64px;border-radius:50%;border:2px solid #4b4b55;object-fit:cover;display:inline-block;background:#2b2b3a;}}
</style>
<div id="root" data-composition-id="endcard" data-width="1080" data-height="1920">
 <div id="ec">
  <div id="ec-title">{title}</div>
  <div id="ec-sub">{sub}</div>
  <svg id="ec-share" viewBox="-60 -50 120 100"><path d="M-42 26 C-40 -14 -8 -26 14 -26 L14 -46 L50 -9 L14 28 L14 8 C-12 8 -30 11 -42 26 Z" fill="#fff"/></svg>
  <div id="ec-cta">{cta}</div>
  <div id="ec-handle">{avatar}<span>{esc(m.HANDLE)}</span></div>
 </div>
</div>
<script>
(function(){{
const tl = gsap.timeline({{paused:true,defaults:{{lazy:false}}}});
tl.fromTo("#ec-title",{{opacity:0}},{{opacity:1,duration:.6}},0.15);
tl.fromTo("#ec-sub",{{opacity:0}},{{opacity:1,duration:.5}},0.55);
tl.fromTo(["#ec-share","#ec-cta"],{{opacity:0,y:14}},{{opacity:1,y:0,duration:.5,stagger:.12}},0.9);
tl.fromTo("#ec-handle",{{opacity:0}},{{opacity:1,duration:.5}},1.3);
window.__timelines["endcard"] = tl;
}})();
</script>
</template>
'''

    # ------------------------------------------------ write
    def write(self):
        d = self.dir
        for sub in ("compositions", "assets/fonts", "assets/sfx", "assets/lib"):
            os.makedirs(os.path.join(d, sub), exist_ok=True)
        for f in os.listdir(os.path.join(KIT, "fonts")):
            if f.startswith("spectral"):
                shutil.copy(os.path.join(KIT, "fonts", f), os.path.join(d, "assets", "fonts", f))
        for f in os.listdir(os.path.join(KIT, "lib")):
            src = os.path.join(KIT, "lib", f)
            if os.path.isdir(src):
                shutil.copytree(src, os.path.join(d, "assets", "lib", f), dirs_exist_ok=True)
            else:
                shutil.copy(src, os.path.join(d, "assets", "lib", f))
        # models: copy only the files this video uses (MODELS in video.py, plus files next to glTF: .bin + textures)
        models = getattr(self.m, "MODELS", [])
        if models == "all":
            shutil.copytree(os.path.join(KIT, "models"), os.path.join(d, "assets", "models"), dirs_exist_ok=True)
            models = []
        for rel in models:
            srcf = os.path.join(KIT, "models", rel)
            if not os.path.exists(srcf):
                print("WARNING missing model", rel, "- run kit/tools/fetch_models.py"); continue
            dstf = os.path.join(d, "assets", "models", rel); os.makedirs(os.path.dirname(dstf), exist_ok=True); shutil.copy(srcf, dstf)
            tex_dir = os.path.join(os.path.dirname(os.path.dirname(srcf)), "Textures")
            if rel.lower().endswith(".fbx") and os.path.isdir(tex_dir):
                shutil.copytree(tex_dir, os.path.join(os.path.dirname(os.path.dirname(dstf)), "Textures"), dirs_exist_ok=True)
            if rel.lower().endswith(".gltf"):
                folder = os.path.dirname(srcf)
                for extra in os.listdir(folder):
                    if extra.lower().endswith((".bin", ".png", ".jpg")):
                        shutil.copy(os.path.join(folder, extra), os.path.join(os.path.dirname(dstf), extra))
        avatar = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(KIT))), "..", "branding", "avatar.png")
        avatar = os.path.normpath(avatar)
        if os.path.exists(avatar):
            shutil.copy(avatar, os.path.join(d, "assets", "avatar.png"))
        for n in {n for n, _, _ in self.sfx_list}:
            if "/" not in n:
                shutil.copy(os.path.join(KIT, "sfx", n + ".mp3"), os.path.join(d, "assets", "sfx", n + ".mp3"))
        shutil.copy(os.path.join(KIT, "sfx", "CREDITS.md"), os.path.join(d, "assets", "sfx", "CREDITS.md"))
        comps = [("world", self.world_html(), 0, self.story_end, 1, "graphics"),
                 ("title", self.title_html(), 0, self.title_end, 3, "graphics"),
                 ("widget", self.widget_html(), 0, self.story_end, 4, "graphics"),
                 ("captions", self.captions_html(), 0, self.story_end, 5, "captions"),
                 ("endcard", self.endcard_html(), self.story_end, self.end_card, 6, "graphics")]
        hosts = []
        for name, h, start, dur, z, kind in comps:
            open(os.path.join(d, "compositions", f"{name}.html"), "w").write(h)
            hosts.append(f'<div id="{name}" data-composition-id="{name}" data-composition-src="compositions/{name}.html" '
                         f'data-start="{r3(start)}" data-duration="{r3(dur)}" data-track-index="{z}" data-track-kind="{kind}" '
                         f'data-width="1080" data-height="1920" style="z-index:{z}"></div>')
        audio = []
        if self.voice:
            audio.append(f'<audio id="voice" class="clip" src="assets/voice.wav" data-start="0" data-duration="{self.T.voice_end}" '
                         f'data-track-index="10" data-volume="1"></audio>')
        os.makedirs(os.path.join(d, "assets", "ambient"), exist_ok=True)
        for k, (n, t0, t1, vol, fade, off) in enumerate(self.ambient_list):
            if "/" in n:   # project file, e.g. "music/dark" -> assets/music/dark.mp3
                src = f"assets/{n}.mp3"
            else:
                shutil.copy(os.path.join(KIT, "ambient", n + ".mp3"), os.path.join(d, "assets", "ambient", n + ".mp3"))
                src = f"assets/ambient/{n}.mp3"
            audio.append(f'<audio id="amb-{k}" class="clip" src="{src}" data-start="{t0}" data-duration="{r3(t1 - t0)}" '
                         f'data-media-start="{off}" data-track-index="{20 + k}" data-volume="{vol}" data-fade-in="{fade}" '
                         f'data-fade-out="{fade}"></audio>')
        if self.ambient_list:
            shutil.copy(os.path.join(KIT, "ambient", "CREDITS.md"), os.path.join(d, "assets", "ambient", "CREDITS.md"))
        lanes = []
        for k, (n, t, vol) in enumerate(sorted(self.sfx_list, key=lambda x: x[1])):
            dur = min(sfx_len(n, d), max(0.2, self.duration - t))
            lane = next((j for j, e in enumerate(lanes) if e <= t), None)
            if lane is None:
                lanes.append(0); lane = len(lanes) - 1
            lanes[lane] = t + dur + 0.01
            audio.append(f'<audio id="sfx-{k}" class="clip" src="assets/{n if "/" in n else "sfx/" + n}.mp3" data-start="{r3(t)}" data-duration="{r3(dur)}" '
                         f'data-track-index="{11 + lane}" data-volume="{vol}"></audio>')
        index = f'''<!doctype html>
<html lang="en" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="assets/lib/three147.min.js"></script>
<script src="assets/lib/fflate.min.js"></script>
<script src="assets/lib/FBXLoader.js"></script>
<script src="assets/lib/GLTFLoader.js"></script>
<script src="assets/lib/RGBELoader.js"></script>
<script src="assets/lib/SkeletonUtils.js"></script>
<style>
*{{margin:0;padding:0;box-sizing:border-box;}}
html,body{{margin:0;width:1080px;height:1920px;overflow:hidden;background:#000;}}
#main{{position:relative;width:1080px;height:1920px;overflow:hidden;}}
</style>
</head>
<body>
<div id="main" data-composition-id="main" data-start="0" data-duration="{self.duration}" data-width="1080" data-height="1920">
{chr(10).join(hosts)}
{chr(10).join(audio)}
</div>
<script>
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = gsap.timeline({{ paused: true }});
</script>
</body>
</html>
'''
        open(os.path.join(d, "index.html"), "w").write(index)
        if not os.path.exists(os.path.join(d, "hyperframes.json")):
            json.dump({"$schema": "https://hyperframes.heygen.com/schema/hyperframes.json",
                       "paths": {"blocks": "compositions", "components": "compositions/components", "assets": "assets"}},
                      open(os.path.join(d, "hyperframes.json"), "w"), indent=2)
        print(f"wrote {d}: {self.duration}s, {len(self.keys)} world keys, {len(self.widgets)} widget segments, "
              f"{len(self.sfx_list)} sfx, {len(self.ambient_list)} ambience tracks, voice={self.voice}")


def build(vdir):
    spec = importlib.util.spec_from_file_location("video", os.path.join(vdir, "video.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    v = Cinema(vdir, mod)
    mod.build(v)
    v.write()
    return v


if __name__ == "__main__":
    build(os.path.abspath(sys.argv[1]))
