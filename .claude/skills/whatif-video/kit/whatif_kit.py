"""What-if video kit: builds a HyperFrames project (1080x1920) in the flat 2D cartoon style.

A video folder holds video.py (LINES + build(v)) and gets assets/, compositions/, index.html.
Times passed to every helper are GLOBAL seconds (voice clock); scenes convert to local time.
"""
import html, json, math, os, random, re, shutil

W, H = 1080, 1920
INK = "#2b263f"          # outline colour
YEL = "#ffd23f"          # keyword / logo yellow
KIT = os.path.dirname(os.path.abspath(__file__))
FONTS = ('@font-face{font-family:"WI Display";src:url("assets/fonts/fredoka-700.woff2") format("woff2");'
         'font-weight:700}\n@font-face{font-family:"WI Caption";src:url("assets/fonts/nunito-900.woff2") '
         'format("woff2");font-weight:900}')
CAP_Y = 1250             # caption centre line (inside TikTok safe band)
GREEN, LIME, AMBER, ORANGE, RED = "#4ade80", "#a3e635", "#facc15", "#fb923c", "#ef4444"


def esc(s):
    return html.escape(str(s), quote=True)


def r3(x):
    return round(float(x), 3)


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


# ============================================================== timing
class Timing:
    def __init__(self, path):
        d = json.load(open(path))
        self.lines = {l["id"]: l for l in d["lines"]}
        self.order = d["lines"]
        self.voice_end = d["voice_end"]

    def L(self, lid):
        """start of a line"""
        return self.lines[lid]["start"]

    def E(self, lid):
        """end of a line"""
        return self.lines[lid]["end"]

    def W(self, lid, k):
        """start of word k (int index, negative ok) or of the first word matching a string"""
        ws = self.lines[lid]["words"]
        if isinstance(k, int):
            return ws[k]["s"]
        for w in ws:
            if norm(w["w"]).startswith(norm(k)):
                return w["s"]
        raise KeyError(f"{k!r} not in line {lid}")

    def WE(self, lid, k):
        ws = self.lines[lid]["words"]
        if isinstance(k, int):
            return ws[k]["e"]
        for w in ws:
            if norm(w["w"]).startswith(norm(k)):
                return w["e"]
        raise KeyError(k)


# ============================================================== svg primitives
def txt(s, x, y, size, fill="#fff", font="WI Caption", stroke=INK, sw=0, anchor="middle", shadow=0.0,
        extra="", ident=None, spacing=0):
    sh = f'filter:drop-shadow(0 {size * 0.07:.0f}px 0 rgba(0,0,0,{shadow}));' if shadow else ""
    st = (f'stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" paint-order="stroke"' if sw else "")
    i = f'id="{ident}" ' if ident else ""
    ls = f'letter-spacing="{spacing}" ' if spacing else ""
    return (f'<text {i}x="{x}" y="{y}" font-family="{font}" font-weight="900" font-size="{size}" fill="{fill}" '
            f'text-anchor="{anchor}" {ls}{st} style="{sh}" {extra}>{esc(s)}</text>')


def place(ident, x, y, inner, scale=1.0, rot=0, opacity=None):
    """Static placement group + animatable inner group with id."""
    op = f' opacity="{opacity}"' if opacity is not None else ""
    tf = f"translate({x} {y})" + (f" rotate({rot})" if rot else "") + (f" scale({scale})" if scale != 1 else "")
    return f'<g transform="{tf}"><g id="{ident}"{op}>{inner}</g></g>'


def text_w(s, size, font="WI Caption"):
    k = 0.62 if font == "WI Caption" else 0.68
    return sum((0.32 if c in " .,'!i:;l|" else 0.82 if c in "MWmw%@" else 1.0) for c in s) * size * k


# ---------------------------------------------------------------- props
def bubble(r=125, icon="", label=None, label_fill=GREEN, label_size=50):
    lab = ""
    if label:
        lab = txt(label, 0, r + 66, label_size, fill=label_fill, sw=11, shadow=0.35)
    return (f'<circle r="{r * 1.3:.0f}" fill="url(#glow)"/>'
            f'<circle r="{r}" fill="#fff" stroke="#3d3a4d" stroke-opacity=".85" stroke-width="7"/>'
            f'<g transform="scale({r / 170:.4f})">{icon}</g>{lab}')


def pill(text, fill="#ffffff", color="#36324a", size=36):
    w = text_w(text, size, "WI Display") + 60
    h = size + 32
    return (f'<rect x="{-w / 2:.0f}" y="{-h / 2:.0f}" width="{w:.0f}" height="{h}" rx="{h / 2}" fill="{fill}" '
            f'stroke="#3d3a4d" stroke-width="5"/>'
            + txt(text, 0, size * 0.36, size, fill=color, font="WI Display"))


def banner(text, size=44):
    w = text_w(text, size, "WI Display") + 80
    h = size + 44
    return (f'<rect x="{-w / 2 + 5:.0f}" y="{-h / 2 + 8:.0f}" width="{w:.0f}" height="{h}" rx="16" fill="rgba(0,0,0,.25)"/>'
            f'<rect x="{-w / 2:.0f}" y="{-h / 2:.0f}" width="{w:.0f}" height="{h}" rx="16" fill="#2b2838" '
            f'stroke="#55506a" stroke-width="4"/>' + txt(text, 0, size * 0.36, size, fill=YEL, font="WI Display"))


def stamp(big, small="", color="#f0616d", size=70):
    w = max(text_w(big, size, "WI Display"), text_w(small, 30, "WI Display"), 220) + 70
    h = 170 if small else 120
    y0 = 14 if small else size * 0.36
    s = txt(small, 0, 58, 30, fill=color, font="WI Display") if small else ""
    return (f'<rect x="{-w / 2:.0f}" y="{-h / 2:.0f}" width="{w:.0f}" height="{h}" rx="20" fill="rgba(255,255,255,.88)" '
            f'stroke="{color}" stroke-width="9"/>' + txt(big, 0, y0, size, fill=color, font="WI Display") + s)


def xmark(r=120, color="#ef4444"):
    k = r * 0.62
    return (f'<path d="M{-k} {-k} L{k} {k} M{k} {-k} L{-k} {k}" stroke="#fff" stroke-width="40" stroke-linecap="round"/>'
            f'<path d="M{-k} {-k} L{k} {k} M{k} {-k} L{-k} {k}" stroke="{color}" stroke-width="24" stroke-linecap="round"/>')


def sparkle(s=26, fill="#fff"):
    return (f'<path d="M0 {-s} L{s * .28} {-s * .28} L{s} 0 L{s * .28} {s * .28} L0 {s} L{-s * .28} {s * .28} '
            f'L{-s} 0 L{-s * .28} {-s * .28} Z" fill="{fill}"/>')


# ---------------------------------------------------------------- icons (drawn in a 340x340 box at 0,0)
O = f'stroke="{INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"'

ICONS = {
    "clock": (f'<circle r="100" fill="#f1f5ff" {O}/>'
              + "".join(f'<path d="M{math.cos(a) * 78:.1f} {math.sin(a) * 78:.1f} L{math.cos(a) * 90:.1f} '
                        f'{math.sin(a) * 90:.1f}" {O}/>' for a in [i * math.pi / 6 for i in range(12)])
              + f'<g class="hand-h"><path d="M0 0 L0 -48" {O} stroke-width="11"/></g>'
                f'<g class="hand-m"><path d="M0 0 L0 -74" {O}/></g><circle r="10" fill="#ef4444"/>'),
    "alarm": (f'<path d="M-95 -70 L-120 -95 M95 -70 L120 -95" {O} stroke-width="12"/>'
              f'<circle cx="-70" cy="-92" r="32" fill="#ef4444" {O}/><circle cx="70" cy="-92" r="32" fill="#ef4444" {O}/>'
              f'<path d="M-70 100 L-95 125 M70 100 L95 125" {O} stroke-width="12"/>'
              f'<circle r="105" fill="#fde68a" {O}/><circle r="80" fill="#fff" {O}/>'
              f'<path d="M0 0 L0 -55 M0 0 L42 0" {O} stroke-width="10"/><circle r="9" fill="#ef4444"/>'),
    "train": (f'<rect x="-85" y="-110" width="170" height="190" rx="36" fill="#60a5fa" {O}/>'
              f'<rect x="-62" y="-85" width="124" height="70" rx="12" fill="#e0f2fe" {O}/>'
              f'<circle cx="-45" cy="35" r="16" fill="#fde68a" {O}/><circle cx="45" cy="35" r="16" fill="#fde68a" {O}/>'
              f'<path d="M-55 80 L-85 125 M55 80 L85 125" {O} stroke-width="10"/>'),
    "bus": (f'<rect x="-100" y="-100" width="200" height="175" rx="28" fill="#facc15" {O}/>'
            f'<rect x="-78" y="-78" width="156" height="68" rx="10" fill="#e0f2fe" {O}/>'
            f'<rect x="-100" y="15" width="200" height="16" fill="#f59e0b"/>'
            f'<circle cx="-55" cy="78" r="24" fill="#3f3a52" {O}/><circle cx="55" cy="78" r="24" fill="#3f3a52" {O}/>'),
    "plane": (f'<g transform="rotate(-35)"><path d="M-120 0 C-120 -22 -90 -26 -60 -26 L95 -26 C125 -26 135 0 95 22 '
              f'L-60 22 C-90 22 -120 18 -120 0 Z" fill="#e5e7eb" {O}/>'
              f'<path d="M0 -24 L-50 -110 L-15 -110 L45 -24 Z M0 22 L-50 108 L-15 108 L45 22 Z" fill="#93c5fd" {O}/>'
              f'<path d="M-105 -18 L-128 -62 L-102 -62 L-80 -24 Z" fill="#93c5fd" {O}/></g>'),
    "tower": (f'<path d="M-30 110 L-20 -40 L20 -40 L30 110 Z" fill="#cbd5e1" {O}/>'
              f'<path d="M-75 -40 L75 -40 L55 -105 L-55 -105 Z" fill="#38bdf8" {O}/>'
              f'<path d="M-40 -95 L40 -95" stroke="#e0f2fe" stroke-width="10"/>'),
    "cart": (f'<path d="M-120 -80 L-85 -80 L-55 50 L85 50 L110 -40 L-75 -40" fill="none" {O} stroke-width="11"/>'
             f'<circle cx="-40" cy="88" r="20" fill="#3f3a52" {O}/><circle cx="70" cy="88" r="20" fill="#3f3a52" {O}/>'),
    "trash": (f'<path d="M-70 -55 C-110 0 -100 110 0 110 C100 110 110 0 70 -55 Z" fill="#3f6b4a" {O}/>'
              f'<path d="M-30 -60 L-45 -100 L0 -80 L45 -100 L30 -60 Z" fill="#3f6b4a" {O}/>'
              f'<path d="M-40 -10 C-30 20 -35 60 -20 80" stroke="#5f8f6a" stroke-width="10" fill="none" stroke-linecap="round"/>'),
    "bolt": (f'<path d="M20 -120 L-70 15 L-5 15 L-25 120 L70 -20 L5 -20 Z" fill="#facc15" {O}/>'),
    "bulb": (f'<path d="M0 -110 C-70 -110 -95 -50 -70 0 C-55 30 -40 45 -40 70 L40 70 C40 45 55 30 70 0 C95 -50 70 -110 0 -110 Z" '
             f'fill="#fde68a" {O}/><rect x="-40" y="70" width="80" height="40" rx="8" fill="#94a3b8" {O}/>'),
    "bank": (f'<path d="M-120 -40 L0 -110 L120 -40 Z" fill="#e2e8f0" {O}/>'
             + "".join(f'<rect x="{x}" y="-30" width="30" height="110" fill="#f8fafc" {O}/>' for x in (-95, -45, 15, 65))
             + f'<rect x="-125" y="80" width="250" height="30" fill="#e2e8f0" {O}/>'),
    "school": (f'<rect x="-110" y="-30" width="220" height="140" fill="#fca5a5" {O}/>'
               f'<path d="M-130 -30 L0 -115 L130 -30 Z" fill="#ef4444" {O}/>'
               f'<rect x="-25" y="40" width="50" height="70" fill="#7c4a2a" {O}/>'
               f'<rect x="-85" y="5" width="40" height="40" fill="#e0f2fe" {O}/><rect x="45" y="5" width="40" height="40" fill="#e0f2fe" {O}/>'),
    "factory": (f'<path d="M-120 110 L-120 -10 L-60 -50 L-60 -10 L0 -50 L0 -10 L60 -50 L60 110 Z" fill="#cbd5e1" {O}/>'
                f'<rect x="65" y="-110" width="40" height="220" fill="#94a3b8" {O}/>'
                f'<rect x="-95" y="30" width="35" height="35" fill="#fde68a" {O}/><rect x="-25" y="30" width="35" height="35" fill="#fde68a" {O}/>'),
    "sausage": (f'<g transform="rotate(-25)"><rect x="-120" y="-38" width="240" height="76" rx="38" fill="#c2410c" {O}/>'
                f'<path d="M-80 -18 C-40 -26 20 -26 70 -18" stroke="#fdba74" stroke-width="9" fill="none" stroke-linecap="round"/>'
                f'<path d="M-120 0 L-142 -12 M120 0 L142 12" {O}/></g>'),
    "question": f'<text y="70" font-family="WI Display" font-weight="700" font-size="220" fill="#8b5cf6" text-anchor="middle" stroke="{INK}" stroke-width="10" paint-order="stroke">?</text>',
    "cross": (f'<path d="M-35 -110 L35 -110 L35 -35 L110 -35 L110 35 L35 35 L35 110 L-35 110 L-35 35 L-110 35 L-110 -35 L-35 -35 Z" fill="#ef4444" {O}/>'),
    "briefcase": (f'<rect x="-120" y="-60" width="240" height="160" rx="22" fill="#a16207" {O}/>'
                  f'<path d="M-45 -60 L-45 -95 L45 -95 L45 -60" fill="none" {O} stroke-width="12"/>'
                  f'<path d="M-120 0 L120 0" {O}/><rect x="-20" y="-12" width="40" height="28" rx="6" fill="#fde68a" {O}/>'),
    "crown": (f'<path d="M-110 60 L-120 -70 L-55 -10 L0 -95 L55 -10 L120 -70 L110 60 Z" fill="#facc15" {O}/>'
              f'<circle cx="0" cy="20" r="16" fill="#ef4444" {O}/>'),
    "flag_is": (f'<path d="M-80 -120 L-80 120" {O} stroke-width="12"/>'
                f'<rect x="-80" y="-110" width="190" height="130" fill="#2563eb" {O}/>'
                f'<path d="M-80 -45 L110 -45 M-25 -110 L-25 20" stroke="#fff" stroke-width="30"/>'
                f'<path d="M-80 -45 L110 -45 M-25 -110 L-25 20" stroke="#dc2626" stroke-width="14"/>'),
    "sun": ("".join(f'<path d="M{math.cos(a) * 92:.1f} {math.sin(a) * 92:.1f} L{math.cos(a) * 135:.1f} {math.sin(a) * 135:.1f}" '
                    f'stroke="#f59e0b" stroke-width="18" stroke-linecap="round"/>' for a in [i * math.pi / 6 for i in range(12)])
            + f'<circle r="80" fill="#fcd34d" {O}/><circle cx="-28" cy="-8" r="9" fill="{INK}"/><circle cx="28" cy="-8" r="9" fill="{INK}"/>'
              f'<path d="M-26 26 C-10 42 10 42 26 26" fill="none" {O}/>'),
    "moon": (f'<path d="M30 -105 A110 110 0 1 0 105 40 A90 90 0 1 1 30 -105 Z" fill="#e5e7eb" {O}/>'
             f'<circle cx="-30" cy="10" r="14" fill="#cbd5e1"/><circle cx="0" cy="60" r="10" fill="#cbd5e1"/>'),
    "plant": (f'<path d="M0 110 L0 -10" {O} stroke-width="12"/>'
              f'<path d="M0 20 C-80 20 -100 -60 -100 -80 C-40 -80 0 -40 0 20 Z" fill="#4ade80" {O}/>'
              f'<path d="M0 -10 C70 -10 100 -80 100 -100 C40 -100 0 -60 0 -10 Z" fill="#22c55e" {O}/>'
              f'<path d="M-70 110 L70 110" {O} stroke-width="12"/>'),
    "fire": (f'<path d="M0 -120 C40 -60 100 -30 90 40 C80 100 40 120 0 120 C-40 120 -85 100 -90 40 C-95 -10 -50 -40 -40 -90 '
             f'C-20 -50 0 -40 0 -120 Z" fill="#fb923c" {O}/>'
             f'<path d="M0 -20 C25 10 50 30 45 70 C40 100 20 110 0 110 C-20 110 -45 100 -45 70 C-45 40 -15 20 0 -20 Z" fill="#fde047"/>'),
    "volcano": (f'<path d="M-130 110 L-40 -40 L40 -40 L130 110 Z" fill="#a16207" {O}/>'
                f'<path d="M-40 -40 L-20 -10 L0 -30 L20 -5 L40 -40 Z" fill="#ef4444" {O} stroke-width="5"/>'
                f'<circle cx="-30" cy="-90" r="34" fill="#6b7280" {O}/><circle cx="20" cy="-110" r="42" fill="#6b7280" {O}/>'
                f'<circle cx="70" cy="-80" r="30" fill="#6b7280" {O}/>'),
    "snowflake": ("".join(f'<g transform="rotate({a})"><path d="M0 0 L0 -110 M0 -70 L-26 -92 M0 -70 L26 -92 M0 -35 L-22 -52 M0 -35 L22 -52" '
                          f'stroke="#60a5fa" stroke-width="12" stroke-linecap="round" fill="none"/></g>' for a in range(0, 360, 60))),
    "earth": (f'<circle r="105" fill="#60a5fa" {O}/>'
              f'<path d="M-70 -50 C-40 -80 0 -60 -10 -30 C-20 0 -60 10 -80 -10 Z M20 10 C60 0 80 30 60 70 C40 90 10 60 20 10 Z '
              f'M30 -90 C60 -85 70 -60 50 -50 C30 -45 20 -70 30 -90 Z" fill="#4ade80" {O} stroke-width="5"/>'),
    "vent": (f'<path d="M-60 120 L-35 -40 L35 -40 L60 120 Z" fill="#57534e" {O}/>'
             f'<circle cx="-10" cy="-75" r="26" fill="#9ca3af" opacity=".8"/><circle cx="18" cy="-110" r="20" fill="#9ca3af" opacity=".6"/>'
             f'<path d="M-35 -40 L35 -40" stroke="#f97316" stroke-width="10"/>'),
    "panel": (f'<path d="M-120 40 L-80 -80 L120 -80 L80 40 Z" fill="#1e3a8a" {O}/>'
              f'<path d="M-100 -20 L100 -20 M-13 -80 L-33 40 M53 -80 L33 40" stroke="#93c5fd" stroke-width="5"/>'
              f'<path d="M0 40 L0 110 M-50 110 L50 110" {O} stroke-width="12"/>'),
}


def icon(name):
    return ICONS[name]


# ---------------------------------------------------------------- backgrounds
def skyline(seed=1, y0=1050, night=False, lit=0.0, ident=None, color=None, win=None):
    """Flat city skyline; windows group id=<ident>-win for lights on/off."""
    rnd = random.Random(seed)
    col = color or ("#2a2f5a" if night else "#c9d6ea")
    wcol = win or ("#fde68a" if night else "#eef4ff")
    b, w = [], []
    x = -40
    while x < W + 40:
        bw, bh = rnd.randint(110, 190), rnd.randint(220, 620)
        b.append(f'<rect x="{x}" y="{y0 - bh}" width="{bw}" height="{bh + 900}" rx="6" fill="{col}" '
                 f'stroke="{INK}" stroke-opacity=".25" stroke-width="4"/>')
        for wy in range(y0 - bh + 30, y0 + 200, 60):
            for wx in range(x + 18, x + bw - 30, 42):
                if rnd.random() < 0.8:
                    w.append(f'<rect x="{wx}" y="{wy}" width="22" height="32" rx="3" fill="{wcol}"/>')
        x += bw + rnd.randint(8, 30)
    wid = f' id="{ident}-win"' if ident else ""
    op = f' opacity="{lit}"' if night else ""
    return "".join(b) + f'<g{wid}{op}>' + "".join(w) + "</g>"


def road(y=1350):
    return (f'<rect x="-50" y="{y}" width="{W + 100}" height="700" fill="#5b6275"/>'
            + "".join(f'<rect x="{x}" y="{y + 120}" width="90" height="16" rx="8" fill="#e5e7eb"/>' for x in range(-20, W, 170))
            + f'<rect x="-50" y="{y - 26}" width="{W + 100}" height="30" fill="#9aa3b5"/>')


def shelves(ident, y0=520, rows=4, seed=3):
    """Supermarket shelves; each product is <g class="item"> so it can be emptied."""
    rnd = random.Random(seed)
    cols = ["#f87171", "#fbbf24", "#60a5fa", "#34d399", "#f472b6", "#a78bfa", "#fb923c"]
    out = [f'<rect x="20" y="{y0 - 40}" width="{W - 40}" height="{rows * 230 + 60}" rx="18" fill="#e8dcc8" '
           f'stroke="{INK}" stroke-opacity=".35" stroke-width="5"/>']
    items = []
    for r in range(rows):
        sy = y0 + r * 230 + 170
        out.append(f'<rect x="20" y="{sy}" width="{W - 40}" height="22" fill="#b08968" stroke="{INK}" stroke-opacity=".35" stroke-width="4"/>')
        x = 50
        while x < W - 110:
            w, h = rnd.randint(50, 80), rnd.randint(80, 140)
            c = rnd.choice(cols)
            items.append(f'<g class="item"><rect x="{x}" y="{sy - h}" width="{w}" height="{h}" rx="8" fill="{c}" '
                         f'stroke="{INK}" stroke-width="4"/><rect x="{x + 8}" y="{sy - h + 18}" width="{w - 16}" '
                         f'height="18" rx="4" fill="#fff" opacity=".8"/></g>')
            x += w + rnd.randint(6, 16)
    return "".join(out) + f'<g id="{ident}-items">' + "".join(items) + "</g>"


def trash_pile(ident, n=26, seed=5, y=1500):
    rnd = random.Random(seed)
    cols = ["#3f6b4a", "#2f4f3a", "#4b5563", "#1f2937"]
    bags = []
    for i in range(n):
        x = rnd.randint(-40, W + 40)
        yy = y - rnd.randint(0, 260) * (0.4 + 0.6 * (abs(x - 540) / 540))
        s = rnd.uniform(0.5, 0.95)
        c = rnd.choice(cols)
        bags.append(f'<g transform="translate({x} {yy:.0f}) scale({s:.2f}) rotate({rnd.randint(-25, 25)})">'
                    f'<g class="bag"><path d="M-70 -55 C-110 0 -100 110 0 110 C100 110 110 0 70 -55 Z" fill="{c}" {O}/>'
                    f'<path d="M-30 -60 L-45 -100 L0 -80 L45 -100 L30 -60 Z" fill="{c}" {O}/></g></g>')
    return f'<g id="{ident}-bags">' + "".join(bags) + "</g>"


# ============================================================== character rig
SKIN_L, SKIN_D, LID = "#ffd27a", "#f5a043", "#f7b35a"


class Char:
    """Cartoon person. variant: guy | woman | kid. States keyed over time with .at(t, **state)."""
    MOUTHS = ("smile", "flat", "frown", "open", "o", "grin", "wavy")

    def __init__(self, scene, name, x=540, y=930, s=1.0, variant="guy", shirt="#22b8c9", hair="#5b3a24",
                 tie=None, glasses=False, idle=True, **state):
        self.sc, self.id = scene, f"{scene.id}-{name}"
        self.x, self.y, self.s = x, y, s
        self.variant, self.shirt, self.hair, self.tie, self.glasses, self.idle = variant, shirt, hair, tie, glasses, idle
        self.st = dict(mouth="smile", eyes="open", lid=0.0, bags=0.0, blush=0.0, sweat=0.0, mess=0.0, red=0.0,
                       pale=0.0, look=(0, 0))
        self.st.update(state)
        self.init = dict(self.st)
        self.keys = []
        scene.chars.append(self)

    def at(self, t, take=True, **changes):
        self.keys.append((t, changes, take))
        return self

    # ------------------------------------------------ svg
    def svg(self):
        i, st = self.id, self.init
        sh = self.shirt
        long_hair = self.variant == "woman"
        p = []
        p.append(f'<g transform="translate({self.x} {self.y}) scale({self.s})"><g id="{i}-pos"><g id="{i}">')
        # torso
        p.append(f'<g id="{i}-torso">'
                 f'<path d="M-330 1150 L-312 430 C-300 315 -230 285 -120 280 L120 280 C230 285 300 315 312 430 L330 1150 Z" '
                 f'fill="url(#{i}-shirt)" {O}/>'
                 f'<path d="M-92 281 C-60 340 60 340 92 281" fill="none" {O}/>')
        if self.tie:
            p.append(f'<path d="M-18 300 L18 300 L28 470 L0 505 L-28 470 Z" fill="{self.tie}" {O}/>')
        p.append('</g>')
        p.append(f'<rect x="-60" y="120" width="120" height="175" rx="20" fill="#f39a45"/>')
        p.append(f'<g id="{i}-hw"><g id="{i}-head">')
        if long_hair:
            p.append(f'<path d="M-200 -30 C-215 -235 215 -235 200 -30 L222 250 C150 300 -150 300 -222 250 Z" '
                     f'fill="{self.hair}" {O}/>')
        for sx in (-1, 1):
            p.append(f'<circle cx="{sx * 172}" cy="18" r="34" fill="{LID}" {O}/>')
        p.append(f'<ellipse rx="176" ry="180" fill="url(#{i}-skin)" {O}/>')
        p.append(f'<ellipse id="{i}-pale" rx="172" ry="176" fill="#d9e3b0" opacity="{st["pale"] * 0.45}"/>')
        # hair cap
        p.append(f'<clipPath id="{i}-hc"><ellipse rx="179" ry="183"/></clipPath>')
        if long_hair:
            cap = ('M-190 30 L-190 -200 L190 -200 L190 30 C180 -40 120 -90 30 -96 '
                   'C-20 -60 -110 -40 -190 30 Z')
        else:
            cap = ('M-190 -5 L-190 -200 L190 -200 L190 -5 C160 -60 70 -95 -10 -82 '
                   'C-90 -72 -150 -45 -190 -5 Z')
        p.append(f'<path d="{cap}" fill="{self.hair}" clip-path="url(#{i}-hc)"/>')
        p.append(f'<ellipse rx="176" ry="180" fill="none" {O}/>')
        p.append(f'<circle cx="40" cy="-125" r="7" fill="#fff" opacity=".55"/>')
        # messy spikes
        rnd = random.Random(3)
        spikes = []
        for k in range(7):
            a = math.pi * (1.15 + k * 0.12)
            bx, by = math.cos(a) * 176, math.sin(a) * 180
            ln = 40 + rnd.random() * 40
            spikes.append(f'<path d="M{bx - 22 * math.sin(a):.1f} {by + 22 * math.cos(a):.1f} '
                          f'L{bx + math.cos(a) * ln:.1f} {by + math.sin(a) * ln:.1f} '
                          f'L{bx + 22 * math.sin(a):.1f} {by - 22 * math.cos(a):.1f} Z" fill="{self.hair}" {O}/>')
        p.append(f'<g id="{i}-mess" opacity="{st["mess"]}">{"".join(spikes)}</g>')
        # bags / blush / veins
        p.append(f'<g id="{i}-bags" opacity="{st["bags"]}">' + "".join(
            f'<path d="M{sx * 64 - 30} 40 C{sx * 64 - 15} 62 {sx * 64 + 15} 62 {sx * 64 + 30} 40" fill="none" '
            f'stroke="#8b5a9b" stroke-width="9" stroke-linecap="round" opacity=".7"/>' for sx in (-1, 1)) + '</g>')
        p.append(f'<g id="{i}-blush" opacity="{st["blush"]}">' + "".join(
            f'<ellipse cx="{sx * 112}" cy="72" rx="34" ry="18" fill="#ff6b81" opacity=".45"/>' for sx in (-1, 1)) + '</g>')
        # eyes open
        er = 31
        p.append(f'<g id="{i}-eo" opacity="{0 if st["eyes"] == "closed" else 1}">')
        for sx in (-1, 1):
            ex = sx * 64
            p.append(f'<clipPath id="{i}-ec{sx}"><circle cx="{ex}" cy="8" r="{er + 1}"/></clipPath>')
            p.append(f'<circle cx="{ex}" cy="8" r="{er}" fill="#fff"/>')
            p.append(f'<g id="{i}-red{sx}" opacity="{st["red"]}" clip-path="url(#{i}-ec{sx})">'
                     f'<circle cx="{ex}" cy="8" r="{er}" fill="#ffc9c9"/>' + "".join(
                         f'<path d="M{ex + math.cos(a) * er:.1f} {8 + math.sin(a) * er:.1f} L{ex + math.cos(a + .3) * 14:.1f} '
                         f'{8 + math.sin(a + .3) * 14:.1f}" stroke="#e11d48" stroke-width="3"/>' for a in (0.4, 1.9, 3.3, 4.8))
                     + '</g>')
            p.append(f'<g class="{i}-pup"><circle cx="{ex}" cy="8" r="14" fill="#3a2e2a"/>'
                     f'<circle cx="{ex - 5}" cy="2" r="4.5" fill="#fff"/></g>')
            p.append(f'<g clip-path="url(#{i}-ec{sx})"><g class="{i}-lid">'
                     f'<rect x="{ex - er - 6}" y="{8 - 3 * er - 6}" width="{2 * er + 12}" height="{2 * er + 6}" fill="{LID}"/>'
                     f'<path d="M{ex - er} {8 - er} L{ex + er} {8 - er}" {O} stroke-width="6"/></g></g>')
            p.append(f'<circle cx="{ex}" cy="8" r="{er}" fill="none" {O} stroke-width="6"/>')
            if long_hair:
                p.append(f'<path d="M{ex + sx * 22} -16 L{ex + sx * 36} -30" {O} stroke-width="5"/>')
        p.append('</g>')
        p.append(f'<g id="{i}-ec" opacity="{1 if st["eyes"] == "closed" else 0}">' + "".join(
            f'<path d="M{sx * 64 - 26} 10 C{sx * 64 - 10} 24 {sx * 64 + 10} 24 {sx * 64 + 26} 10" fill="none" {O}/>'
            for sx in (-1, 1)) + '</g>')
        if self.glasses:
            p.append(f'<g fill="none" stroke="#7a4a1e" stroke-width="7"><circle cx="-64" cy="8" r="44"/>'
                     f'<circle cx="64" cy="8" r="44"/><path d="M-20 3 L20 3"/></g>')
        # mouths
        m = {
            "smile": f'<path d="M-32 86 C-12 106 12 106 32 86" fill="none" {O}/>',
            "flat": f'<path d="M-28 94 L28 94" fill="none" {O}/>',
            "frown": f'<path d="M-30 104 C-10 86 10 86 30 104" fill="none" {O}/>',
            "open": f'<ellipse cy="100" rx="26" ry="31" fill="#6b2a2a" {O}/>',
            "o": f'<ellipse cy="98" rx="16" ry="20" fill="#6b2a2a" {O}/>',
            "grin": f'<path d="M-46 80 C-22 124 22 124 46 80 Z" fill="#7a2e2e" {O}/><path d="M-36 84 L36 84 L32 96 L-32 96 Z" fill="#fff"/>',
            "wavy": f'<path d="M-36 94 ' + " ".join(f'L{-36 + k * 3} {94 + math.sin(k * 0.9) * 6:.1f}' for k in range(1, 25)) + f'" fill="none" {O}/>',
        }
        for k, v in m.items():
            p.append(f'<g id="{i}-m-{k}" opacity="{1 if st["mouth"] == k else 0}">{v}</g>')
        p.append(f'<g id="{i}-sweat" opacity="{st["sweat"]}"><path d="M150 -70 C170 -35 170 -15 150 -15 C130 -15 130 -35 150 -70 Z" '
                 f'fill="#7dd3fc" {O} stroke-width="4"/></g>')
        p.append('</g></g>')  # head, hw
        p.append('</g></g></g>')
        defs = (f'<radialGradient id="{i}-skin" cx="0.42" cy="0.38" r="0.65"><stop offset="0" stop-color="{SKIN_L}"/>'
                f'<stop offset="1" stop-color="{SKIN_D}"/></radialGradient>'
                f'<linearGradient id="{i}-shirt" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="{lighten(sh, .18)}"/>'
                f'<stop offset="1" stop-color="{lighten(sh, -.25)}"/></linearGradient>')
        self.sc.defs.append(defs)
        return "".join(p)

    # ------------------------------------------------ js
    def js(self):
        sc, i = self.sc, self.id
        out = []
        t0, t1 = sc.start, sc.end
        dur = t1 - t0
        if self.idle:
            cyc = 1.7
            n = max(0, int(dur / cyc) - 1)
            out.append(sc.raw(f'tl.fromTo("#{i}-torso",{{scaleY:1}},{{scaleY:1.014,duration:{cyc},ease:"sine.inOut",'
                              f'yoyo:true,repeat:{n},transformOrigin:"50% 100%"}},0);'))
            out.append(sc.raw(f'tl.fromTo("#{i}-hw",{{y:0}},{{y:5,duration:{cyc},ease:"sine.inOut",yoyo:true,repeat:{n}}},0);'))
        cur = dict(self.init)
        eyes_tl = [(t0, cur["eyes"])]
        for t, ch, take in sorted(self.keys, key=lambda k: k[0]):
            lt = sc.lt(t)
            if take and any(k in ch for k in ("mouth", "eyes")):
                out.append(f'tl.to("#{i}-head",{{scaleY:.93,scaleX:1.05,duration:.08,ease:"power2.in",transformOrigin:"50% 80%"}},{r3(lt - .08)});'
                           f'tl.to("#{i}-head",{{scaleY:1,scaleX:1,duration:.45,ease:"elastic.out(1,.45)"}},{r3(lt)});')
            for k, v in ch.items():
                if k == "mouth":
                    for mk in self.MOUTHS:
                        out.append(f'tl.set("#{i}-m-{mk}",{{opacity:{1 if mk == v else 0}}},{r3(lt)});')
                elif k == "eyes":
                    out.append(f'tl.set("#{i}-eo",{{opacity:{0 if v == "closed" else 1}}},{r3(lt)});'
                               f'tl.set("#{i}-ec",{{opacity:{1 if v == "closed" else 0}}},{r3(lt)});')
                    eyes_tl.append((t, v))
                elif k == "lid":
                    out.append(f'tl.to(".{i}-lid",{{y:{v * 62:.1f},duration:.35,ease:"power2.inOut"}},{r3(lt)});')
                elif k in ("bags", "blush", "sweat", "mess"):
                    out.append(f'tl.to("#{i}-{k}",{{opacity:{v},duration:.4}},{r3(lt)});')
                elif k == "red":
                    out.append(f'tl.to(["#{i}-red-1","#{i}-red1"],{{opacity:{v},duration:.4}},{r3(lt)});')
                elif k == "pale":
                    out.append(f'tl.to("#{i}-pale",{{opacity:{v * .45},duration:.5}},{r3(lt)});')
                elif k == "look":
                    out.append(f'tl.to(".{i}-pup",{{x:{v[0] * 11},y:{v[1] * 11},duration:.25,ease:"power2.out"}},{r3(lt)});')
                cur[k] = v
        if self.init["lid"]:
            out.insert(0, f'tl.set(".{i}-lid",{{y:{self.init["lid"] * 62:.1f}}},0);')
        if self.init["look"] != (0, 0):
            lk = self.init["look"]
            out.insert(0, f'tl.set(".{i}-pup",{{x:{lk[0] * 11},y:{lk[1] * 11}}},0);')
        # blinks while eyes are open
        rnd = random.Random(hash(i) & 0xffff)
        t = t0 + 0.9 + rnd.random()
        changes = [k[0] for k in self.keys]
        while t < t1 - 0.3:
            state = [v for tt, v in eyes_tl if tt <= t][-1]
            if state == "open" and all(abs(t - c) > 0.35 for c in changes):
                lt = sc.lt(t)
                out.append(f'tl.set("#{i}-eo",{{opacity:0}},{r3(lt)});tl.set("#{i}-ec",{{opacity:1}},{r3(lt)});'
                           f'tl.set("#{i}-eo",{{opacity:1}},{r3(lt + .13)});tl.set("#{i}-ec",{{opacity:0}},{r3(lt + .13)});')
            t += 2.6 + rnd.random() * 1.8
        return out


def lighten(hexs, k):
    h = hexs.lstrip("#")
    c = [int(h[j:j + 2], 16) for j in (0, 2, 4)]
    c = [min(255, max(0, round(v + (255 - v) * k if k > 0 else v * (1 + k)))) for v in c]
    return "#" + "".join(f"{v:02x}" for v in c)


# ============================================================== scene
class Scene:
    def __init__(self, video, sid, start, end, top, bottom, glow=0.35, stripes=True, zoom=0.035):
        self.v, self.id, self.start, self.end = video, sid, start, end
        self.top, self.bottom, self.glow, self.stripes, self.zoom = top, bottom, glow, stripes, zoom
        self.back, self.world, self.front, self.js, self.defs, self.chars = [], [], [], [], [], []
        self.title, self.meter = None, None

    def lt(self, t):
        """global -> scene-local seconds; never negative (a negative position shifts the whole GSAP timeline)"""
        return r3(max(0.0, t - self.start))

    def raw(self, s):
        return s

    # content
    def add(self, svg, layer="world"):
        {"back": self.back, "world": self.world, "front": self.front}[layer].append(svg)
        return self

    def char(self, name, **kw):
        return Char(self, name, **kw)

    def sel(self, s):
        return s if s.startswith((".", "#", "[")) else f"#{self.id}-{s}"

    def ident(self, name):
        return f"{self.id}-{name}"

    # tweens (global times)
    def pop(self, name, t, dur=0.45, ease="back.out(2.2)", sfx="pop", vol=0.5):
        s = self.sel(name)
        self.js.append(f'tl.set("{s}",{{opacity:0,scale:0.01,transformOrigin:"50% 50%"}},0);'
                       f'tl.to("{s}",{{opacity:1,scale:1,duration:{dur},ease:"{ease}"}},{self.lt(t)});')
        if sfx:
            self.v.sfx(sfx, t, vol)
        return self

    def hide(self, name, t, dur=0.25):
        self.js.append(f'tl.to("{self.sel(name)}",{{opacity:0,duration:{dur}}},{self.lt(t)});')
        return self

    def fade_in(self, name, t, dur=0.35):
        s = self.sel(name)
        self.js.append(f'tl.set("{s}",{{opacity:0}},0);tl.to("{s}",{{opacity:1,duration:{dur}}},{self.lt(t)});')
        return self

    def stamp_in(self, name, t, sfx="impact-bass-1", vol=0.55):
        s = self.sel(name)
        self.js.append(f'tl.set("{s}",{{opacity:0,scale:2.4,transformOrigin:"50% 50%"}},0);'
                       f'tl.to("{s}",{{opacity:1,scale:1,duration:.22,ease:"power3.in"}},{self.lt(t)});'
                       f'tl.to("{s}",{{scale:1.06,duration:.08,yoyo:true,repeat:1}},{r3(self.lt(t) + .22)});')
        if sfx:
            self.v.sfx(sfx, t + 0.2, vol)
        return self

    def to(self, name, t, **props):
        self.js.append(f'tl.to("{self.sel(name)}",{json.dumps(props)},{self.lt(t)});')
        return self

    def set(self, name, t, **props):
        self.js.append(f'tl.set("{self.sel(name)}",{json.dumps(props)},{self.lt(t)});')
        return self

    def stagger_pop(self, selector, t, each=0.05, dur=0.35, frm="random"):
        self.js.append(f'tl.set("{selector}",{{opacity:0,scale:0.01,transformOrigin:"50% 100%"}},0);'
                       f'tl.to("{selector}",{{opacity:1,scale:1,duration:{dur},ease:"back.out(2)",'
                       f'stagger:{{each:{each},from:"{frm}"}}}},{self.lt(t)});')
        return self

    def stagger_out(self, selector, t, each=0.04, dur=0.25, frm="random"):
        self.js.append(f'tl.to("{selector}",{{opacity:0,scale:0.01,transformOrigin:"50% 50%",duration:{dur},'
                       f'ease:"back.in(2)",stagger:{{each:{each},from:"{frm}"}}}},{self.lt(t)});')
        return self

    def counter(self, name, t, frm, to, dur=1.2, suffix="", prefix=""):
        s = self.sel(name)
        self.js.append(f'(function(){{const el=document.querySelector("{s}");const o={{v:{frm}}};'
                       f'tl.to(o,{{v:{to},duration:{dur},ease:"power2.out",onUpdate:()=>{{el.textContent="{prefix}"+'
                       f'Math.round(o.v).toLocaleString("en-US")+"{suffix}";}}}},{self.lt(t)});}})();')
        return self

    def spin(self, selector, t, dur, turns, origin="50% 100%"):
        self.js.append(f'tl.fromTo("{selector}",{{rotation:0}},{{rotation:{360 * turns},duration:{dur},ease:"none",'
                       f'transformOrigin:"{origin}",immediateRender:false}},{self.lt(t)});')
        return self

    def rotate(self, selector, t, deg, dur=0.0, origin="50% 100%"):
        if dur:
            self.js.append(f'tl.to("{selector}",{{rotation:{deg},duration:{dur},ease:"power2.inOut",'
                           f'transformOrigin:"{origin}"}},{self.lt(t)});')
        else:
            self.js.append(f'tl.set("{selector}",{{rotation:{deg},transformOrigin:"{origin}"}},{self.lt(t)});')
        return self

    def wiggle(self, name, t, dur, amp=9, period=0.07):
        """finite rotation wobble (ringing, shivering)"""
        s = self.sel(name)
        n = max(1, int(dur / period) - 1)
        self.js.append(f'tl.fromTo("{s}",{{rotation:-{amp}}},{{rotation:{amp},duration:{period},yoyo:true,repeat:{n},'
                       f'ease:"sine.inOut",transformOrigin:"50% 50%",immediateRender:false}},{self.lt(t)});'
                       f'tl.to("{s}",{{rotation:0,duration:.1}},{r3(self.lt(t) + period * (n + 1))});')
        return self

    def slide(self, name, t, x=0, y=0, dur=0.5, ease="power3.inOut"):
        self.js.append(f'tl.to("{self.sel(name)}",{{x:{x},y:{y},duration:{dur},ease:"{ease}"}},{self.lt(t)});')
        return self

    def float_loop(self, name, t, dur, amp=10, period=1.4):
        s = self.sel(name)
        n = max(0, int(dur / period) - 1)
        self.js.append(f'tl.fromTo("{s}",{{y:0}},{{y:-{amp},duration:{period},yoyo:true,repeat:{n},ease:"sine.inOut",'
                       f'immediateRender:false}},{self.lt(t)});')
        return self

    def shake(self, name, t, n=8, amp=10):
        s = self.sel(name)
        self.js.append(f'tl.to("{s}",{{x:{amp},duration:.04,yoyo:true,repeat:{n},ease:"none"}},{self.lt(t)});'
                       f'tl.set("{s}",{{x:0}},{r3(self.lt(t) + .04 * (n + 1))});')
        return self

    def snowfall(self, n=60, t0=None, t1=None, seed=9, layer="front", color="#ffffff", size=(5, 13)):
        """Falling snow: n flakes, each a finite tween (deterministic, seeded)."""
        rnd = random.Random(seed)
        t0 = self.start if t0 is None else t0
        t1 = self.end if t1 is None else t1
        flakes = []
        for k in range(n):
            x, r = rnd.randint(0, W), rnd.uniform(*size)
            flakes.append(f'<circle class="{self.id}-flake" id="{self.id}-fl{k}" cx="{x}" cy="-30" r="{r:.1f}" '
                          f'fill="{color}" opacity="{rnd.uniform(.55, .95):.2f}"/>')
            dur = rnd.uniform(3.5, 7.0)
            off = rnd.uniform(0, dur)
            reps = max(0, int((t1 - t0 + off) / dur))
            self.js.append(f'tl.fromTo("#{self.id}-fl{k}",{{y:0,x:0}},{{y:{H + 80},x:{rnd.randint(-120, 120)},duration:{dur:.2f},'
                           f'ease:"none",repeat:{reps},immediateRender:true}},{r3(max(0, self.lt(t0) - off))});')
        self.add(f'<g id="{self.id}-snow">' + "".join(flakes) + '</g>', layer)
        return self

    def html(self):
        sid = self.id
        js = []
        if self.zoom:
            js.append(f'tl.fromTo("#{sid}-world",{{scale:1}},{{scale:{1 + self.zoom},duration:{r3(self.end - self.start)},'
                      f'ease:"none",svgOrigin:"540 1050"}},0);')
        if self.stripes:
            js.append(f'tl.fromTo("#{sid}-stripes",{{x:0}},{{x:{r3((self.end - self.start) * 22)},duration:'
                      f'{r3(self.end - self.start)},ease:"none"}},0);')
        chars = "".join(c.svg() for c in self.chars)
        for c in self.chars:
            js.extend(c.js())
        js.extend(self.js)
        stripes = (f'<div id="{sid}-stripes" data-layout-allow-overflow data-layout-ignore></div>' if self.stripes else "")
        return f'''<template>
<style>
{FONTS}
#root{{position:absolute;inset:0;overflow:hidden;background:{self.bottom};}}
#{sid}-bg{{position:absolute;inset:0;background:linear-gradient(180deg,{self.top} 0%,{self.bottom} 100%);}}
#{sid}-stripes{{position:absolute;top:0;left:-400px;width:1880px;height:1920px;
  background:repeating-linear-gradient(90deg,rgba(255,255,255,0) 0 80px,rgba(255,255,255,.075) 80px 150px,rgba(255,255,255,0) 150px 230px);}}
#{sid}-glow{{position:absolute;inset:0;background:radial-gradient(circle at 50% 47%,rgba(255,255,255,{self.glow}) 0,rgba(255,255,255,0) 55%);}}
#{sid}-svg{{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:visible;}}
</style>
<div id="root" data-composition-id="{sid}" data-width="1080" data-height="1920">
  <div id="{sid}-bg"></div>{stripes}<div id="{sid}-glow"></div>
  <svg id="{sid}-svg" viewBox="0 0 1080 1920" data-layout-allow-overflow data-layout-allow-overlap>
    <defs><radialGradient id="glow"><stop offset=".6" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>{"".join(self.defs)}</defs>
    {"".join(self.back)}
    <g id="{sid}-world">{"".join(self.world)}{chars}</g>
    {"".join(self.front)}
  </svg>
</div>
<script>
(function(){{
const tl = gsap.timeline({{paused:true,defaults:{{lazy:false}}}});
{force_initial(chr(10).join(js))}
window.__timelines["{sid}"] = tl;
}})();
</script>
</template>
'''


# ============================================================== video
class Video:
    def __init__(self, vdir, mod):
        self.dir, self.m = vdir, mod
        self.T = Timing(os.path.join(vdir, "build", "timing.json"))
        self.scenes, self.sfx_list, self.meter_keys, self.timer_keys = [], [], [], []
        # scene windows from line scene ids
        order = []
        for l in self.T.order:
            if not order or order[-1][0] != l["scene"]:
                order.append([l["scene"], l["start"]])
        self.windows = {}
        for k, (name, st) in enumerate(order):
            s0 = 0.0 if k == 0 else r3(st - 0.18)
            self.windows[name] = [s0, None]
            if k:
                self.windows[order[k - 1][0]][1] = s0
        self.windows[order[-1][0]][1] = r3(self.T.voice_end + 0.5)
        self.story_end = self.windows[order[-1][0]][1]
        self.end_card = 3.6
        self.duration = r3(self.story_end + self.end_card)

    # helpers
    def L(self, i): return self.T.L(i)
    def E(self, i): return self.T.E(i)
    def W(self, i, k): return self.T.W(i, k)

    def scene(self, name, top, bottom, title=None, title_color="#ffffff", meter=None, **kw):
        s0, s1 = self.windows[name]
        sc = Scene(self, name, s0, s1, top, bottom, **kw)
        sc.title, sc.title_color = title, title_color
        if meter:
            self.meter_at(s0 + 0.15, *meter)
        self.scenes.append(sc)
        if len(self.scenes) > 1:
            self.sfx("whoosh" if len(self.scenes) % 2 else "whoosh-short", s0 - 0.12, 0.45)
        return sc

    def meter_at(self, t, level, status, color):
        self.meter_keys.append((t, level, status, color))

    def timer_at(self, t, value, color="#ffffff"):  # value None hides the widget
        """Top-right countdown widget (label = module TIMER, e.g. 'SUN RETURNS IN'): value shown from t."""
        self.timer_keys.append((t, value, color))

    def sfx(self, name, t, vol=0.5):
        self.sfx_list.append((name, max(0.0, t), vol))

    # ------------------------------------------------ hud / captions / end card
    def hud_html(self):
        m = self.m
        titles, js = [], []
        for k, sc in enumerate(self.scenes):
            if not sc.title:
                continue
            tid = f"hud-t{k}"
            titles.append(f'<div id="{tid}" class="hud-title" style="color:{sc.title_color}">{esc(sc.title)}</div>')
            js.append(f'tl.set("#{tid}",{{opacity:0}},0);'
                      f'tl.fromTo("#{tid}",{{opacity:0,scale:.55}},{{opacity:1,scale:1,duration:.4,ease:"back.out(2.5)",'
                      f'immediateRender:false}},{r3(sc.start + .05)});tl.set("#{tid}",{{opacity:0}},{r3(sc.end)});')
        mk = sorted(self.meter_keys)
        statuses = []
        first_meter = mk[0][0] if mk else self.story_end
        js.append(f'tl.set("#hud-meter",{{opacity:0}},0);tl.to("#hud-meter",{{opacity:1,duration:.3}},{r3(first_meter - .1)});')
        js.append('tl.set("#hud-cover",{scaleX:1,transformOrigin:"100% 50%"},0);')
        for k, (t, lv, stt, col) in enumerate(mk):
            sid = f"hud-s{k}"
            nxt = mk[k + 1][0] if k + 1 < len(mk) else self.story_end
            statuses.append(f'<div id="{sid}" class="hud-status" style="color:{col}">{esc(stt)}</div>')
            js.append(f'tl.set("#{sid}",{{opacity:0}},0);tl.set("#{sid}",{{opacity:1}},{r3(t)});'
                      f'tl.set("#{sid}",{{opacity:0}},{r3(nxt)});'
                      f'tl.to("#hud-cover",{{scaleX:{r3(1 - max(0.02, lv))},duration:.9,ease:"power2.inOut"}},{r3(t)});')
        timers = []
        tk = sorted(self.timer_keys)
        if tk:
            js.append(f'tl.set("#hud-timer",{{opacity:0}},0);tl.to("#hud-timer",{{opacity:1,duration:.3}},{r3(tk[0][0])});')
        for k, (t, val, col) in enumerate(tk):
            tid = f"hud-v{k}"
            if val is None:  # hide the whole widget from t (e.g. under a long title)
                js.append(f'tl.to("#hud-timer",{{opacity:0,duration:.2}},{r3(t)});')
                continue
            if k and tk[k - 1][1] is None:
                js.append(f'tl.to("#hud-timer",{{opacity:1,duration:.2}},{r3(t)});')
            nxt = tk[k + 1][0] if k + 1 < len(tk) else self.story_end
            timers.append(f'<div id="{tid}" class="hud-tval" style="color:{col}">{esc(val)}</div>')
            js.append(f'tl.set("#{tid}",{{opacity:0}},0);tl.fromTo("#{tid}",{{opacity:0,y:-14}},{{opacity:1,y:0,duration:.25,'
                      f'ease:"power2.out",immediateRender:false}},{r3(t)});tl.set("#{tid}",{{opacity:0}},{r3(nxt)});')
        self._timers_html = "".join(timers)
        js.append(f'tl.set("#hud-root-in",{{opacity:0}},{r3(self.story_end)});')
        return f'''<template>
<style>
{FONTS}
#root{{position:absolute;inset:0;pointer-events:none;}}
#hud-root-in{{position:absolute;inset:0;}}
#hud-logo{{position:absolute;left:60px;top:186px;font:700 36px "WI Display";color:{YEL};
  -webkit-text-stroke:7px {INK};paint-order:stroke fill;}}
.hud-title{{position:absolute;left:58px;top:228px;font:700 112px/1 "WI Display";letter-spacing:1px;
  -webkit-text-stroke:9px rgba(43,38,63,.62);paint-order:stroke fill;text-shadow:0 7px 0 rgba(0,0,0,.25);
  transform-origin:0 50%;white-space:nowrap;}}
#hud-meter{{position:absolute;left:60px;top:356px;width:960px;height:80px;}}
#hud-label{{position:absolute;left:2px;top:-2px;font:900 28px "WI Caption";color:#1d1a29;
  -webkit-text-stroke:5px #fff;paint-order:stroke fill;}}
#hud-track{{position:absolute;left:0;top:34px;width:560px;height:28px;border-radius:14px;overflow:hidden;
  background:linear-gradient(90deg,{GREEN} 0%,{AMBER} 40%,{ORANGE} 70%,{RED} 100%);box-shadow:0 0 0 4px rgba(43,38,63,.18);}}
#hud-cover{{position:absolute;left:0;top:0;width:560px;height:28px;background:#8f8b9c;}}
#hud-timer{{position:absolute;right:56px;top:176px;width:440px;height:120px;text-align:right;}}
#hud-tlabel{{font:900 28px "WI Caption";color:#fff;letter-spacing:2px;-webkit-text-stroke:6px {INK};paint-order:stroke fill;}}
.hud-tval{{position:absolute;right:0;top:36px;font:700 64px/1 "WI Display";white-space:nowrap;
  -webkit-text-stroke:10px {INK};paint-order:stroke fill;filter:drop-shadow(0 5px 0 rgba(0,0,0,.3));}}
.hud-status{{position:absolute;left:584px;top:22px;font:900 44px "WI Caption";
  -webkit-text-stroke:9px {INK};paint-order:stroke fill;white-space:nowrap;}}
</style>
<div id="root" data-composition-id="hud" data-width="1080" data-height="1920">
 <div id="hud-root-in">
  <div id="hud-logo">WHAT IF?</div>
  {"".join(titles)}
  <div id="hud-meter"><div id="hud-label">{esc(m.METER)}</div><div id="hud-track"><div id="hud-cover"></div></div>
   {"".join(statuses)}</div>
  <div id="hud-timer"><div id="hud-tlabel">{esc(getattr(m, "TIMER", ""))}</div>{getattr(self, "_timers_html", "")}</div>
 </div>
</div>
<script>
(function(){{
const tl = gsap.timeline({{paused:true,defaults:{{lazy:false}}}});
{force_initial(chr(10).join(js))}
window.__timelines["hud"] = tl;
}})();
</script>
</template>
'''

    def chunks(self, max_words=3, max_chars=16):
        out = []
        for ln in self.T.order:
            cur = []
            ws = ln["words"]
            for i, w in enumerate(ws):
                cur.append(w)
                chars = sum(len(x["w"]) + 1 for x in cur)
                nxt = ws[i + 1] if i + 1 < len(ws) else None
                brk = w["w"].endswith((",", ".", "...", "?", "!"))
                gap = nxt is not None and nxt["s"] - w["e"] > 0.15
                if nxt is None or len(cur) >= max_words or brk or gap or chars + len(nxt["w"]) > max_chars:
                    out.append({"s": cur[0]["s"], "e": cur[-1]["e"], "words": [(x["w"], x["key"]) for x in cur]})
                    cur = []
        for i, c in enumerate(out):
            nxt = out[i + 1]["s"] if i + 1 < len(out) else c["e"] + 0.5
            c["until"] = r3(min(nxt, c["e"] + 0.5))
            c["s"] = r3(max(0.1, c["s"] - 0.03))
        return out

    def captions_html(self):
        groups, js = [], []
        for k, c in enumerate(self.chunks()):
            gid = f"cap-{k}"
            words = " ".join(f'<span class="{"k" if key else "w"}">{esc(w)}</span>' for w, key in c["words"])
            groups.append(f'<div id="{gid}" class="clip cap" data-start="{c["s"]}" data-duration="{r3(c["until"] - c["s"])}" '
                          f'data-track-index="0"><div class="cap-in">{words}</div></div>')
            js.append(f'tl.fromTo("#{gid} .cap-in",{{scale:.78,opacity:0}},{{scale:1,opacity:1,duration:.17,'
                      f'ease:"back.out(2.6)"}},{c["s"]});tl.set("#{gid} .cap-in",{{opacity:0}},{r3(max(c["until"] - .01, c["s"] + .18))});')
        return f'''<template>
<style>
{FONTS}
#root{{position:absolute;inset:0;pointer-events:none;}}
.cap{{position:absolute;left:0;top:{CAP_Y - 70}px;width:1080px;height:140px;text-align:center;overflow:visible;}}
.cap-in{{display:inline-block;font:900 92px/140px "WI Caption";color:#fff;white-space:nowrap;
  -webkit-text-stroke:17px {INK};paint-order:stroke fill;filter:drop-shadow(0 7px 0 rgba(0,0,0,.45));
  transform-origin:50% 60%;}}
.cap-in .k{{color:{YEL};}}
</style>
<div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
{chr(10).join(groups)}
</div>
<script>
(function(){{
const tl = gsap.timeline({{paused:true,defaults:{{lazy:false}}}});
document.querySelectorAll("#root .cap-in").forEach((el)=>{{
  const max=940; let fs=92; el.style.fontSize=fs+"px";
  while(el.scrollWidth>max && fs>58){{fs-=2; el.style.fontSize=fs+"px";}}
}});
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
            title = title.replace(esc(key), f'<span style="color:{getattr(m, "KEY_COLOR", "#7cb7ff")}">{esc(key)}</span>', 1)
        cta = "<br>".join(esc(x) for x in m.CTA.split("\n"))
        return f'''<template>
<style>
{FONTS}
#root{{position:absolute;inset:0;background:#121212;}}
#ec-wrap{{position:absolute;left:90px;width:900px;top:640px;text-align:center;color:#fff;}}
#ec-title{{font:700 76px/1.15 "WI Display";}}
#ec-sub{{margin-top:34px;font:900 28px "WI Caption";letter-spacing:2px;color:#a7a7b3;}}
#ec-share{{margin:70px auto 0;width:110px;height:90px;}}
#ec-cta{{margin-top:22px;font:900 38px/1.45 "WI Caption";letter-spacing:3px;}}
#ec-handle{{margin-top:120px;font:900 42px "WI Caption";color:#fff;}}
#ec-handle span{{display:inline-block;width:56px;height:56px;line-height:56px;border-radius:50%;margin-right:16px;
  background:#2b2b3a;border:3px solid #6b6b80;color:{YEL};font:700 34px/52px "WI Display";vertical-align:middle;}}
</style>
<div id="root" data-composition-id="endcard" data-width="1080" data-height="1920">
 <div id="ec-wrap">
  <div id="ec-title">{title}</div>
  <div id="ec-sub">{esc(m.SUB)}</div>
  <svg id="ec-share" viewBox="-60 -50 120 100"><path d="M-42 26 C-40 -14 -8 -26 14 -26 L14 -46 L50 -9 L14 28 L14 8 C-12 8 -30 11 -42 26 Z" fill="#fff"/></svg>
  <div id="ec-cta">{cta}</div>
  <div id="ec-handle"><span>?</span>{esc(m.HANDLE)}</div>
 </div>
</div>
<script>
(function(){{
const tl = gsap.timeline({{paused:true,defaults:{{lazy:false}}}});
tl.fromTo("#ec-title",{{opacity:0,y:30}},{{opacity:1,y:0,duration:.45,ease:"power3.out"}},0.1);
tl.fromTo("#ec-sub",{{opacity:0}},{{opacity:1,duration:.4}},0.45);
tl.fromTo(["#ec-share","#ec-cta"],{{opacity:0,y:20}},{{opacity:1,y:0,duration:.4,stagger:.1}},0.75);
tl.fromTo("#ec-handle",{{opacity:0}},{{opacity:1,duration:.4}},1.1);
window.__timelines["endcard"] = tl;
}})();
</script>
</template>
'''

    # ------------------------------------------------ write project
    def write(self):
        d = self.dir
        os.makedirs(os.path.join(d, "compositions"), exist_ok=True)
        os.makedirs(os.path.join(d, "assets", "fonts"), exist_ok=True)
        os.makedirs(os.path.join(d, "assets", "sfx"), exist_ok=True)
        for f in os.listdir(os.path.join(KIT, "fonts")):
            shutil.copy(os.path.join(KIT, "fonts", f), os.path.join(d, "assets", "fonts", f))
        used = {n for n, _, _ in self.sfx_list}
        for n in used:
            shutil.copy(os.path.join(KIT, "sfx", n + ".mp3"), os.path.join(d, "assets", "sfx", n + ".mp3"))
        shutil.copy(os.path.join(KIT, "sfx", "CREDITS.md"), os.path.join(d, "assets", "sfx", "CREDITS.md"))
        hosts = []
        for k, sc in enumerate(self.scenes):
            open(os.path.join(d, "compositions", f"{sc.id}.html"), "w").write(sc.html())
            hosts.append(f'<div id="{sc.id}" data-composition-id="{sc.id}" data-composition-src="compositions/{sc.id}.html" '
                         f'data-start="{sc.start}" data-duration="{r3(sc.end - sc.start)}" data-track-index="1" '
                         f'data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:1"></div>')
        for name, html_, start, dur, z, kind in [
            ("hud", self.hud_html(), 0, self.story_end, 5, "graphics"),
            ("captions", self.captions_html(), 0, self.story_end, 6, "captions"),
            ("endcard", self.endcard_html(), self.story_end, self.end_card, 7, "graphics"),
        ]:
            open(os.path.join(d, "compositions", f"{name}.html"), "w").write(html_)
            hosts.append(f'<div id="{name}" data-composition-id="{name}" data-composition-src="compositions/{name}.html" '
                         f'data-start="{r3(start)}" data-duration="{r3(dur)}" data-track-index="{z}" '
                         f'data-track-kind="{kind}" data-width="1080" data-height="1920" style="z-index:{z}"></div>')
        audio = [f'<audio id="voice" class="clip" src="assets/voice.wav" data-start="0" '
                 f'data-duration="{self.T.voice_end}" data-track-index="10" data-volume="1"></audio>']
        lanes = []  # greedy lane assignment so no two sounds overlap on one track
        for k, (n, t, vol) in enumerate(sorted(self.sfx_list, key=lambda x: x[1])):
            dur = min(sfx_len(n), max(0.2, self.duration - t))
            lane = next((j for j, end in enumerate(lanes) if end <= t), None)
            if lane is None:
                lanes.append(0)
                lane = len(lanes) - 1
            lanes[lane] = t + dur + 0.01
            audio.append(f'<audio id="sfx-{k}" class="clip" src="assets/sfx/{n}.mp3" data-start="{r3(t)}" '
                         f'data-duration="{r3(dur)}" data-track-index="{11 + lane}" data-volume="{vol}"></audio>')
        index = f'''<!doctype html>
<html lang="en" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
*{{margin:0;padding:0;box-sizing:border-box;}}
html,body{{margin:0;width:1080px;height:1920px;overflow:hidden;background:#121212;}}
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
        print(f"wrote {d}: {len(self.scenes)} scenes, {self.duration}s, {len(self.sfx_list)} sfx")


_SFX_LEN = {}


def sfx_len(name):
    if name not in _SFX_LEN:
        import subprocess
        out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                              os.path.join(KIT, "sfx", name + ".mp3")], capture_output=True, text=True).stdout
        _SFX_LEN[name] = round(float(out.strip() or 1.0), 3)
    return _SFX_LEN[name]


_SET0 = re.compile(r'tl\.set\(("[^"]+"|\[[^\]]+\]),\{([^{}]*)\},0\);')


def force_initial(js):
    """tl.set(...,0) does not render while the playhead sits exactly at 0: make it render at creation."""
    return _SET0.sub(lambda m: f'tl.set({m.group(1)},{{{m.group(2)},immediateRender:true}},0);', js)


def build(vdir):
    import importlib.util
    spec = importlib.util.spec_from_file_location("video", os.path.join(vdir, "video.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    v = Video(vdir, mod)
    mod.build(v)
    v.write()
    return v


if __name__ == "__main__":
    import sys
    build(os.path.abspath(sys.argv[1]))
