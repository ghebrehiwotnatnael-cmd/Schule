"""What if you jumped into the Mariana Trench?  You jump off a boat above Challenger Deep (your friend, the star, stays on board)
and sink 10,935 m: lungs shrink, sunlight fades, the twilight zone with glowing jellyfish, a sperm whale fighting a giant squid,
total darkness and living lights, an anglerfish, the deepest fish ever filmed, the floor.  Twist: a plastic bag got there first.
No voice lines, one music build, live depth + pressure widget, POV and outside shots that follow you down."""
TITLE = "What if you jumped into the Mariana Trench?"
TITLE_KEY = "Mariana Trench"
KEY_COLOR = "#36d6ff"
SUB = "AT THE BOTTOM THE PRESSURE IS ABOUT 1,070 TIMES THE SURFACE: ~1 TONNE ON EACH FINGERNAIL\nA PLASTIC BAG WAS FOUND THERE AT 10,898 M (CHIBA ET AL., 2018)"
CTA = ""
END_ASK = "Where should we jump next?"
END_ASK2 = "COMMENT BELOW ↓"
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 66.0
END_CARD = 4.5
END_STYLE = "title"
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_models.js", "sets_people.js", "sets_ocean.js"]
WORLD_DEFAULTS = {"torch": 0.0, "camLamp": 0.0, "splashAt": -99.0, "landAt": -99.0, "bagLight": 0.0, "diverHide": 1.0, "snow": 0.75,
                  "chroma": 0.0, "crack": 0.0, "shake": 0.0, "bob": 0.0, "camNear": 0.05, "diverMode": "idle", "diverFace": 2.0}

CAPTIONS = [
    (3.4, 6.0, "The Pacific. Above the deepest place."),
    (6.2, 8.8, "Below you: 11 km of water."),
    (9.4, 11.6, "You jump."),
    (12.0, 15.0, "10 m: your lungs shrink by half."),
    (15.4, 18.2, "Fish. Sunlight. Still easy."),
    (18.6, 21.4, "200 m: the light starts to die."),
    (21.8, 24.2, "332 m: deepest human dive ever."),
    (24.6, 27.6, "Below here, no diver survives."),
    (28.0, 30.8, "1,000 m: total darkness."),
    (31.2, 34.2, "A sperm whale hunts a giant squid."),
    (34.6, 37.6, "Only living lights now."),
    (38.0, 40.8, "3,800 m: deeper than the Titanic."),
    (41.2, 44.0, "450 times the pressure."),
    (44.4, 47.2, "An anglerfish. Its lure glows."),
    (47.6, 50.4, "8,336 m: the deepest fish ever seen."),
    (50.8, 53.6, "A tonne on every fingernail."),
    (54.0, 56.6, "10,935 m. The bottom."),
    (57.0, 59.6, "Total silence. Then you see it."),
    (60.0, 62.8, "Plot twist: a plastic bag."),
    (63.2, 66.0, "Our trash got here first."),
]

DX = 6.0
FLOOR = 10935.0
# your depth over time (piecewise linear)
DEPTH = [(9.4, 0.0), (12.0, 8.0), (15.5, 14.0), (18.5, 60.0), (21.5, 200.0), (24.2, 332.0), (28.0, 1000.0), (30.8, 1985.0), (35.0, 2015.0),
         (38.0, 3200.0), (40.0, 3800.0), (42.5, 5000.0), (44.2, 5990.0), (46.4, 5998.0), (48.6, 8300.0), (50.6, 8370.0), (53.4, 10800.0), (54.0, FLOOR - 0.6)]
SURF = dict(set="ocean", env="day", envI=0.55, skyTop="#2a78e4", skyHorizon="#a6dcff", skyBottom="#1d5fa0", fogFar=4000, camFar=6000,
            light=0.9, ambient=0.32, ambientColor="#e6f2ff", lightColor="#fff1d6", sunDir=[0.4, 0.75, -0.3],
            tonemap=1.0, exposure=1.03, contrast=1.12, saturation=1.32, warmth=0.04, vignette=0.28, grain=0.02, bloom=0.6)
ICON = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#c8f4ff" stop-opacity=".9"/><stop offset="1" stop-color="#36d6ff" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><path d="M-110 -70 Q-55 -100 0 -70 Q55 -40 110 -70" stroke="#fff" stroke-width="14" fill="none"/><path d="M0 -40 L0 90 M-30 60 L0 95 L30 60" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'''


def d_at(t):
    if t <= DEPTH[0][0]:
        return DEPTH[0][1]
    for (t0, d0), (t1, d1) in zip(DEPTH, DEPTH[1:]):
        if t <= t1:
            return d0 + (d1 - d0) * (t - t0) / (t1 - t0)
    return DEPTH[-1][1]


def mix(*ds, **kw):
    out = {}
    for d in ds:
        out.update(d)
    out.update(kw)
    return out


def follow(v, t0, t1, cam_off, look_off, diver_xz=(DX, 0.0), fov=None):
    """camera (and the diver) ride down together: keys at every depth breakpoint inside [t0, t1], linear in between"""
    ts = [t0] + [t for t, _ in DEPTH if t0 < t < t1] + [t1]
    dx, dz = diver_xz
    for i, t in enumerate(ts):
        d = d_at(t); D = [dx, -d, dz]
        cp = [dx + cam_off[0], -d + cam_off[1], dz + cam_off[2]]; lk = [dx + look_off[0], -d + look_off[1], dz + look_off[2]]
        if i == 0:
            v.key(t, 0, diverPos=D, camPos=cp, camLook=lk)
        else:
            v.key(ts[i - 1] + 0.001, t - ts[i - 1] - 0.001, diverPos=D, camPos=cp, camLook=lk, lin=True)


def build(v):
    v.title_until(3.2, ICON)
    # ================= A (0-9.4): on the boat, your friend points down, you jump
    v.key(0, 0, **mix(SURF, dof=0.25, focus=3.0, fov=58, diverHide=1.0, diverPos=[DX, 0.0, 0.0], starPos=[0.6, 1.58, 1.8], starRot=1.5708, starMode="point", starFace=7.0))
    v.hands(0, "hidden", 0, item="none")
    v.path(0, 5.5, [[1.5, 3.2, -1.7], [1.5, 3.2, -1.2]], [[0.6, 3.0, 1.8], [0.7, 2.9, 1.8]])
    v.path(5.5, 9.0, [[1.5, 3.2, -1.2], [1.8, 3.1, 0.2]], [[0.7, 2.9, 1.8], [16, -5, 2]])
    v.key(6.2, 0.6, starMode="wave", starFace=7.0)
    v.key(9.0, 0.4, camPos=[4.2, 1.0, 0.7], camLook=[8, -6, 0.6])
    v.key(9.4, 0, splashAt=9.4, splashPos=[4.5, 0, 0.6], shake=0.6, chroma=0.6)
    v.sfx("music/splash", 9.25, 0.9)
    # ================= B (9.4-24.2): POV under water, then outside: you sink past the fish
    v.key(9.4, 0, camPos=[4.6, -0.6, 0.6], camLook=[5.6, 8, 0.6], shake=0.2, chroma=0.0, fov=60)
    v.key(9.6, 1.0, shake=0.0)
    v.key(9.41, 2.6, camPos=[DX, -8.0, 0.6], camLook=[DX + 3, -6, 6], lin=True)
    v.key(12.0, 3.5, camPos=[DX, -14.0, 0.6], camLook=[DX + 8, -20, 2], lin=True)
    v.key(12.0, 0, focus=6.0, dof=0.2)
    follow(v, 15.5, 24.2, [3.2, 2.2, 3.6], [0, 0.6, 0])
    v.key(15.5, 0, diverHide=0.0, diverMode="idle", diverRot=0.6, diverFace=2.0, dof=0.25, focus=4.5)
    # ================= C (24.2-40): POV into the dark, the lamp, jellyfish, the whale and the squid
    follow(v, 24.2, 30.6, [0, 1.6, 0.25], [0.6, -8, 4.5])
    v.key(24.2, 0, diverHide=1.0, dof=0.0, fov=62)
    v.key(27.6, 0.8, camLamp=1.0)
    v.sfx("click-soft", 27.6, 0.6)
    follow(v, 30.6, 36.0, [-2.5, 2.5, 8], [12, -0.5, -7])
    v.key(30.6, 0, diverHide=0.0, torch=1.0, camLamp=0.0, dof=0.15, focus=18.0, fov=58)
    follow(v, 36.0, 41.0, [1.8, 0.7, 2.4], [0, 1.5, 0])
    v.key(36.0, 0, dof=0.3, focus=2.9, diverFace=3.0, diverRot=0.7)
    v.key(38.0, 0, shake=0.25)
    v.key(38.2, 1.0, shake=0.0)
    v.sfx("music/creak", 37.9, 0.8)
    # ================= D (41-54): the anglerfish, the deepest fish, the crushing pressure, the floor
    follow(v, 41.0, 46.5, [0, 1.6, 0.25], [2.6, -2.0, 3.5])
    v.key(41.0, 0, diverHide=1.0, camLamp=0.6, dof=0.0, fov=60)
    follow(v, 46.5, 50.6, [3.0, 1.4, 3.0], [0, 0.9, 0])
    v.key(46.5, 0, diverHide=0.0, camLamp=0.0, torch=1.0, dof=0.2, focus=4.2, diverFace=2.0)
    follow(v, 50.6, 54.0, [0, 1.6, 0.25], [0.3, -10, 1.2])
    v.key(50.6, 0, diverHide=1.0, camLamp=1.0, dof=0.0)
    v.key(51.0, 0.15, crack=1.0, shake=0.6, chroma=0.5)
    v.key(51.3, 1.6, shake=0.05, chroma=0.0)
    v.key(53.4, 0.6, crack=0.0)
    v.sfx("music/creak", 50.9, 1.0)
    v.bigcount(51.0, 54.0, "THE BOTTOM IN", 3, 0)
    # ================= E (54-66): you land, your lamp finds the bag
    v.key(54.0, 0, landAt=54.0, diverHide=0.0, torch=1.0, camLamp=0.0, diverPos=[DX - 0.6, -FLOOR + 0.05, -0.8], diverMode="idle", diverRot=-0.4, diverFace=2.0,
          camPos=[DX + 2.8, -FLOOR + 1.3, -3.6], camLook=[DX - 0.6, -FLOOR + 1.0, -0.8], dof=0.2, focus=4.5, fov=56, shake=0.35)
    v.key(54.2, 1.2, shake=0.0)
    v.sfx("music/thud", 53.95, 0.9)
    v.key(54.01, 3.0, camPos=[DX + 2.4, -FLOOR + 1.5, -3.2])
    v.key(56.8, 1.6, diverRot=0.57, diverMode="point", diverFace=2.0)
    v.path(57.0, 60.0, [[DX + 2.4, -FLOOR + 1.5, -3.2], [DX + 0.2, -FLOOR + 2.6, -4.0], [DX - 3.4, -FLOOR + 3.2, -4.0]],
           [[DX - 0.6, -FLOOR + 1.0, -0.8], [DX + 0.6, -FLOOR + 0.6, 1.2], [DX + 1.2, -FLOOR + 0.2, 2.0]])
    v.key(57.0, 3.0, focus=4.4)
    v.key(59.0, 0.8, bagLight=1.0)
    v.sfx("impact-bass-1", 59.6, 0.5)
    v.path(60.0, 66.0, [[DX - 3.4, -FLOOR + 3.2, -4.0], [DX - 0.6, -FLOOR + 1.9, -2.2], [DX + 0.8, -FLOOR + 1.0, 0.6]],
           [[DX + 1.2, -FLOOR + 0.2, 2.0], [DX + 1.2, -FLOOR + 0.15, 2.0]])
    v.key(60.0, 5.0, focus=1.6, dof=0.3)
    v.key(61.0, 1.0, diverFace=3.0)

    # widget: depth + pressure, ticking every second
    seg = [(0, 9.4, "BELOW YOU: 10,935 M"), (9.4, 12.0, "PRESSURE 2 ATM · LUNGS ½"), (12.0, 18.5, "PRESSURE 7 ATM"), (18.5, 24.2, "PRESSURE 34 ATM · DIVE RECORD 332 M"),
           (24.2, 28.0, "PRESSURE 100 ATM"), (28.0, 31.0, "PRESSURE 200 ATM · NO SUNLIGHT"), (31.0, 40.0, "PRESSURE 380 ATM · TITANIC 3,800 M"),
           (40.0, 45.5, "PRESSURE 600 ATM"), (45.5, 49.0, "PRESSURE 830 ATM · DEEPEST FISH 8,336 M"), (49.0, 54.0, "PRESSURE 1,070 ATM"), (54.0, 66.0, "PRESSURE 1,071 ATM · 1 T PER FINGERNAIL")]
    for t0, t1, sub in seg:
        v.widget(t0, t1, "DEPTH", sub, "num:0: M", d_at(t0), d_at(t1))

    # sound: one dark build, the sonar, bubbles, the whale
    m = "music/"
    v.ambient(m + "main", 0, 70.5, 0.55, 0.05)
    v.ambient("wind", 0, 9.4, 0.18, 0.05)
    v.ambient(m + "bubbles", 9.4, 30.0, 0.4, 1.0)
    v.ambient(m + "sonar", 24.0, 66.0, 0.3, 2.0)
    v.sfx(m + "whale", 30.6, 0.7)
    for t in (15.5, 24.2, 30.6, 36.0, 41.0, 46.5, 50.6):
        v.sfx("whoosh", t - 0.15, 0.25)
