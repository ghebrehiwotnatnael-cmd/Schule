"""What if the Earth stopped spinning for 5 seconds?  You and your friend (the star) wait on a rooftop helipad in Manhattan for a
helicopter tour.  The Earth stops - but everything that is not bolted down keeps its speed: 1,270 km/h to the east.  In slow
motion you fly over the city together with the tourists, the pigeons (who do not even notice: the air keeps moving too) and
your helicopter; down in the street cars, people and a hot-dog cart slide east; on the globe: 1,670 km/h at the equator, 1,270 in
New York, nothing at the North Pole (a polar bear yawns).  After 5 seconds you are 1,763 m further east, over the East River:
the Earth spins again and you drop into the water - the sunglasses survive, and your helicopter is finally here.
Twist: you are moving this fast right now, you just cannot feel it.
Fun pass (a gag every 3-4 s, the star's slapstick, on-screen gags); sound: ukulele -> adventure orchestra -> calm piano."""
import math

TITLE = "What if the Earth stopped spinning for 5 seconds?"
TITLE_KEY = "stopped spinning"
KEY_COLOR = "#7fd6ff"
SUB = "NEW YORK SPINS EAST AT 1,270 KM/H · THE EQUATOR AT 1,670\nIF THE GROUND STOPPED, EVERYTHING LOOSE WOULD KEEP GOING"
CTA = ""
END_ASK = "What should stop next?"
END_ASK2 = "COMMENT BELOW ↓"
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 65.0
END_CARD = 4.5
END_STYLE = "title"
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_models.js", "sets_people.js", "sets_spin.js", "sets_nyc.js"]
WORLD_DEFAULTS = {"glass": 1.0, "paper": 0.0, "paperT": 0.0, "aquaBurst": 999.0, "tourists": 0.0, "carsMove": 1.0, "chroma": 0.0, "crack": 0.0,
                  "shake": 0.0, "bob": 0.0, "camNear": 0.05, "crowdFilm": 0.12, "crowdCheer": 0.0, "crowdSlip": 0.0, "crowdSlipD": 0.0, "crowdStop": 0.0,
                  "crowdEast": 0.0, "carEast": 0.0, "streetEast": 0.0, "railsOn": 0.0, "flyTum": 0.0, "splashT": 9999.0, "splashV": 50.0,
                  "bearBlink": 0.0, "bearLook": 0.0, "cloudRot": 0.0, "pigeonFlap": 1.0, "starTilt": 0.0, "starRoll": 0.0, "youTilt": 0.0, "youRoll": 0.0,
                  "heliRot": -1.5708, "heliTilt": 0.0, "carSpin": 0.0, "cables": 0.0, "cableDim": 0.0, "cableCut": 0.0, "goldDot": 0.0}

CAPTIONS = [
    (0.4, 3.1, "A rooftop helipad. New York."),
    (3.4, 6.3, "Your helicopter is almost here."),
    (6.7, 7.5, "The Earth stops."),
    (9.5, 11.4, "But you don't."),
    (11.6, 13.4, "You keep going. East."),
    (13.7, 15.7, "So does everything else."),
    (15.9, 17.9, "Tourists. Pigeons. Your helicopter."),
    (18.2, 20.2, "Cars. People. Hot dogs."),
    (20.4, 22.4, "He's still texting."),
    (22.7, 24.6, "No wind in your face."),
    (24.8, 26.4, "The air keeps moving too."),
    (26.8, 29.4, "At the equator: 1,670 km/h."),
    (29.6, 32.8, "In New York: 1,270 km/h."),
    (33.2, 35.2, "At the North Pole?"),
    (35.4, 37.4, "Nothing happens."),
    (37.8, 40.8, "He still wants his selfie."),
    (41.2, 43.8, "5 seconds. 1,763 metres."),
    (44.2, 46.8, "The Earth spins again."),
    (47.5, 49.4, "Welcome to the East River."),
    (49.6, 51.4, "The sunglasses survived."),
    (51.8, 54.0, "Your helicopter is here."),
    (54.2, 56.3, "Only 1.7 kilometres late."),
    (56.8, 59.6, "Plot twist: you're spinning right now."),
    (59.8, 62.4, "At up to 1,670 km/h."),
    (62.6, 65.0, "You just can't feel it."),
]
CAPTION_TOPS = [(26.5, 33.0, 1500), (56.5, 65.0, 1500)]   # globe shots: captions below the globe

D = 250.0
PAD = [21.0, D, -7.0]
VX, G = 352.6, 4.905
DAY = dict(set="nyc", env="day", envI=0.65, skyTop="#3f7fd6", skyHorizon="#d9e0e6", skyBottom="#8a8f96", fogFar=9000, camFar=10000,
           light=1.1, ambient=0.45, ambientColor="#e9eef4", lightColor="#ffe6c2", sunDir=[0.45, 0.62, 0.38],
           tonemap=1.0, exposure=1.05, contrast=1.07, saturation=1.14, warmth=0.05, vignette=0.2, grain=0.012, bloom=0.3, windowsLit=0.35)
ICON = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#d9f3ff" stop-opacity=".9"/><stop offset="1" stop-color="#7fd6ff" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><circle r="92" fill="none" stroke="#fff" stroke-width="12"/>
<path d="M-92 0 Q0 46 92 0 M-74 -52 Q0 -18 74 -52 M-74 52 Q0 86 74 52 M0 -92 L0 92" stroke="#fff" stroke-width="7" fill="none" opacity=".8"/>
<path d="M-128 -98 L128 98" stroke="#ff5a5a" stroke-width="14" stroke-linecap="round"/>'''

# ------------------------------------------------------------------ the 5 seconds, stretched (video time -> real seconds since the stop)
T_STOP, T_GO, T_SPLASH = 6.5, 44.0, 47.0
SEGS = [(6.5, 7.5, 0.06), (7.5, 9.3, 0.0), (9.3, 44.0, (5.0 - 0.06) / 34.7)]
TAU_END = (-49.05 + math.sqrt(49.05 ** 2 + 4 * G * (251.2 - G * 25))) / (2 * G)        # real seconds of free fall until the feet are 1.2 m under water
FALL_RATE = TAU_END / (T_SPLASH - T_GO)


def T(t):
    s = 0.0
    for a, b, r in SEGS:
        if t <= a:
            break
        s += (min(t, b) - a) * r
    return s


def fly(t, deep=False):
    """offset of the flying formation from the helipad"""
    if t <= T_GO:
        k = T(t)
        return [VX * k, -G * k * k, 0.0]
    tau = (t - T_GO) * FALL_RATE
    y = -(G * 25 + 49.05 * tau + G * tau * tau)
    return [VX * 5, max(y, -262.0 if deep else -251.2), 0.0]


def O(t, off=(0, 0, 0)):
    f = fly(t)
    return [round(PAD[0] + f[0] + off[0], 3), round(PAD[1] + f[1] + off[1], 3), round(PAD[2] + f[2] + off[2], 3)]


YOU = (-1.7, 0.0, -1.1)


def mix(*ds, **kw):
    out = {}
    for d in ds:
        out.update(d)
    out.update(kw)
    return out


def hit(v, t, shake=0.5, chroma=0.3, snd=None, vol=0.8):
    v.key(t, 0.06, shake=shake, chroma=chroma)
    v.key(t + 0.08, 0.8, shake=0.0, chroma=0.0)
    if snd:
        v.sfx(snd, t - 0.03, vol)


def follow(t0, t1, fn, step=0.1):
    n = max(1, int(round((t1 - t0) / step)))
    for k in range(n + 1):
        t = t0 + (t1 - t0) * k / n
        yield t, fn(t)


def cam(v, t0, t1, pos_off, look_off, pos_off2=None, look_off2=None, **extra):
    """camera that flies with the formation: offsets from the formation origin, optionally drifting to a second pair of offsets"""
    pos_off2, look_off2 = pos_off2 or pos_off, look_off2 or look_off

    def lerp(a, b, u):
        return [a[i] + (b[i] - a[i]) * u for i in range(3)]
    v.key(t0, 0, camPos=O(t0, pos_off), camLook=O(t0, look_off), **extra)
    for t, _ in follow(t0, t1, lambda t: 0):
        u = (t - t0) / (t1 - t0)
        v.key(t, 0.1, lin=True, camPos=O(t, lerp(pos_off, pos_off2, u)), camLook=O(t, lerp(look_off, look_off2, u)), shadowY=O(t)[1])


def build(v):
    v.title_until(3.2, ICON)
    m = "music/"
    v.hands(0, "hidden", 0, item="none")
    east = lambda t: round(VX * T(min(t, T_GO)), 3)
    # ---------------- clocks: everything loose keeps going east
    v.key(0, 0, **mix(DAY, fov=42, dof=0.12, focus=6.5, shadowY=D, flyMode="pad", flyOff=[0, 0, 0], pgOff=[0, 0, 0]))
    v.key(T_STOP, 0, flyMode="fly", crowdSlip=1.0)
    for a, b, r in SEGS:
        if r > 0:
            v.key(a + 0.0006, b - a, lin=True, flyTum=round(T(b), 4), crowdEast=east(b), carEast=east(b), streetEast=east(b), crowdSlipD=round(T(b), 3), carSpin=round(0.5 * T(b), 3))
    for t, f in follow(T_STOP, T_SPLASH + 0.4, lambda t: fly(t, deep=True)):
        v.key(t, 0.1, lin=True, flyOff=[round(x, 3) for x in f])
    for t, f in follow(T_STOP, T_GO, fly):
        v.key(t, 0.1, lin=True, pgOff=[round(x, 3) for x in f])
    v.key(T_GO, 0, flyMode="fall", splashT=T_SPLASH - 0.03, splashV=round(70.0 * FALL_RATE, 2))

    # ---------------- the star and you
    v.key(0, 0, starPos=O(0), starRot=-0.5, starMode="selfie", starFace=7.0, youPos=O(0, YOU), youRot=-0.2, youMode="talk", youFace=7.0)
    for t, p in follow(T_STOP, T_SPLASH + 0.1, lambda t: O(t)):
        v.key(t, 0.1, lin=True, starPos=p)
    def you_at(t):
        u = min(1.0, max(0.0, (t - T_GO) / (T_SPLASH - T_GO)))
        p = O(t, (YOU[0] + (-1.1 - YOU[0]) * u, 0.0, YOU[2] + (0.8 - YOU[2]) * u))
        return [p[0], max(p[1], D - 251.2), p[2]]
    for t, p in follow(T_STOP, T_SPLASH + 0.1, you_at):
        v.key(t, 0.1, lin=True, youPos=p)
    v.key(T_STOP, 0, starMode="slip", starFace=4.0, starRot=0.6, youMode="slip", youFace=4.0, youRot=0.5)
    v.key(9.3, 0, starMode="slip", starFace=4.0, starRot=0.9, starTilt=0.45, youMode="flail", youFace=4.0, youRot=1.5708, youTilt=0.2, youRoll=0.3)
    v.key(11.4, 0.5, starTilt=-0.5)
    v.key(11.4, 0, starMode="faceplant", starFace=7.0, starRot=1.5708)
    v.key(22.5, 0, youMode="faceplant", youFace=2.0, youTilt=-0.1, youRoll=0.0)
    v.key(37.5, 0, starMode="selfie", starTilt=0.15, starFace=7.0)
    v.key(T_GO, 0, starMode="panic", starTilt=0.0, starFace=4.0, youMode="panic", youTilt=0.0, youFace=4.0, starRot=0.9, youRot=0.9)
    v.key(T_SPLASH, 0, starMode="idle", starFace=2.0, youMode="idle", youFace=2.0, starRot=0.95, youRot=0.8)
    v.key(49.6, 0, starFace=7.0, youFace=7.0)
    v.key(51.6, 0, starMode="cheer", youMode="wave")

    # ---------------- the helicopter: arrives, flies along (it was in the air too), hovers over the river in the end
    H0 = [30.0, D + 8.0, -46.0]
    v.key(0, 0, heliPos=[150.0, D + 16, -52.0], heliRot=-1.9)
    v.key(0.001, 6.2, heliPos=H0, heliRot=-1.7)
    def heli_at(t):
        u = min(1.0, (t - T_STOP) / 7.0); u = u * u * (3 - 2 * u)      # it closes in on the formation
        return [round(H0[0] + 17.0 * u + VX * T(t), 3), round(H0[1] - 1.5 * u - 0.9 * G * T(t) ** 2, 3), round(H0[2] + 34.0 * u, 3)]
    for t, p in follow(T_STOP, T_GO, heli_at):
        v.key(t, 0.1, lin=True, heliPos=p)
    v.key(T_STOP, 1.0, heliRot=1.5708, heliTilt=0.12)
    hx = round(H0[0] + 17.0 + VX * 5, 3)
    v.key(T_GO, 0, heliPos=[hx, round(H0[1] - 1.5 - 0.9 * G * 25, 3), H0[2] + 34.0])
    v.key(T_GO + 0.001, 7.5, heliPos=[hx - 2.0, 60.0, -24.0], heliTilt=0.0)
    v.key(51.6, 0, heliPos=[O(60)[0] - 5.0, 20.0, -13.0], heliRot=0.5)
    v.key(51.601, 3.2, heliPos=[O(60)[0] - 4.5, 6.6, -11.5], heliRot=0.8)

    # ---------------- the hero taxi slides down the street
    for t, p in follow(T_STOP, T_GO, lambda t: [round(-568.0 + east(t), 3), 0.02, -41.6]):
        v.key(t, 0.1, lin=True, taxiPos=p)
    v.key(T_STOP, 0, taxiRot=-1.5708)
    v.key(T_STOP + 0.001, T_GO - T_STOP, lin=True, taxiRot=-1.5708 + 3.0)

    # ================= A (0-6.5): the helipad, the selfie, the countdown
    v.path(0, 6.5, [[17.6, D + 1.5, -1.0], [18.2, D + 1.5, -1.8]], [[20.3, D + 1.25, -7.6], [20.3, D + 1.25, -7.6]])
    v.bigcount(3.5, 6.5, "THE EARTH STOPS SPINNING IN", 3, 0)
    v.sfx(m + "shutter", 2.2, 0.5)
    # ================= B (6.5-7.5): the ground stops, you do not; freeze frame
    hit(v, T_STOP, 0.8, 0.4, m + "stop", 1.0)
    v.key(T_STOP, 0.06, exposure=1.35, bloom=0.8)
    v.key(T_STOP + 0.1, 0.6, exposure=1.05, bloom=0.3)
    v.key(T_STOP, 0, camPos=[27.2, D + 1.6, 6.5], camLook=O(T_STOP, (0, 1.0, 0)), fov=50, dof=0.0)
    for t, p in follow(T_STOP, 7.5, lambda t: O(t, (-2.0, 1.0, 0))):
        v.key(t, 0.1, lin=True, camLook=p)
    v.freeze(7.5, 1.8)
    v.key(7.5, 0.08, saturation=0.72, contrast=1.16, vignette=0.4)
    v.key(9.25, 0.05, saturation=1.14, contrast=1.07, vignette=0.2)
    # ================= D (9.3-13.5): side by side with him
    cam(v, 9.3, 13.5, (1.4, 1.3, 6.6), (-0.5, 0.95, 0.0), (1.6, 1.2, 8.6), (1.0, 0.9, 0.0), fov=44, dof=0.18, focus=7.6)
    # ================= E (13.5-18): everybody, from behind
    cam(v, 13.5, 18.0, (-17.0, 8.0, 7.0), (8.0, 0.5, -3.0), (-14.0, 6.5, 5.0), (8.0, 0.5, -3.0), fov=56, dof=0.0, camNear=0.8)
    # ================= F (18-22.5): down in the street
    v.key(18.0, 0, camPos=[-8.0, 3.3, -39.6], camLook=[-90.0, 1.0, -39.0], fov=44, dof=0.0, shadowY=0.0, camNear=0.05)
    v.key(18.001, 4.5, camPos=[-7.0, 3.1, -39.2], camLook=[-90.0, 1.0, -39.4])
    # ================= G (22.5-26.5): the pigeons do not even notice
    cam(v, 22.5, 26.5, (6.0, 2.9, 5.8), (3.0, 2.3, 2.4), (5.6, 2.8, 5.4), (2.9, 2.3, 2.3), fov=36, dof=0.25, focus=4.4)
    # ================= H (26.5-33): the globe has stopped, the clouds have not
    v.key(26.5, 0, set="space", earthSun=1.0, earthLights=0.0, earthIce=0.0, earthTilt=0.0, earthRot=-0.15, spaceFov=40, spaceCam=[0, 9, 62],
          cloudRot=0.0, dof=0.0, bloom=0.5, chroma=0.0, shake=0.0)
    v.key(26.501, 6.5, lin=True, cloudRot=0.5, spaceCam=[0, 9, 58])
    # ================= I (33-37.5): the North Pole
    v.key(33.0, 0, **mix(DAY, set="nyc", camPos=[0.4, 1.8, 6998.0], camLook=[-1.3, 2.6, 7012.0], fov=46, dof=0.1, focus=14.0, shadowY=0.4, skyTop="#5f9fe0", skyHorizon="#eef4f8"))
    v.key(33.001, 4.5, camPos=[0.2, 1.9, 6999.4])
    v.key(34.6, 0.12, bearBlink=1.0)
    v.key(34.8, 0.12, bearBlink=0.0)
    v.key(35.3, 0.6, bearLook=0.5)
    v.key(36.2, 0.5, bearLook=0.0)
    v.key(36.5, 0.12, bearBlink=1.0)
    v.key(36.7, 0.12, bearBlink=0.0)
    # ================= J (37.5-44): the selfie, then the East River ahead
    v.key(37.5, 0, **mix(DAY))
    cam(v, 37.5, 41.0, (3.7, 1.65, 1.3), (0.0, 1.45, -0.2), (3.3, 1.6, 1.1), (0.0, 1.45, -0.2), fov=44, dof=0.22, focus=3.8)
    v.sfx(m + "shutter", 39.2, 0.6)
    v.key(39.2, 0.05, exposure=1.3)
    v.key(39.3, 0.4, exposure=1.05)
    cam(v, 41.0, 44.0, (-9.0, 4.6, 5.0), (10.0, -4.0, -1.0), (-8.0, 4.2, 4.6), (10.0, -5.0, -1.0), fov=54, dof=0.0, camNear=0.8)
    # ================= K (44-51.5): the Earth spins again: the drop, the splash, the sunglasses
    hit(v, T_GO, 0.6, 0.35, "impact-bass-1", 0.9)
    lx = O(60)[0]
    cam(v, T_GO, 46.5, (5.6, 0.6, 4.4), (-0.4, 1.1, 0.2), (5.0, 1.4, 4.0), (-0.4, 1.0, 0.2), fov=50, dof=0.0, camNear=0.3)
    v.key(46.5, 0, camPos=[lx + 13.0, 1.3, 7.5], camLook=[lx - 1.0, 4.0, -7.5], fov=48, dof=0.0, shadowY=0.0, camNear=0.05)
    v.key(46.501, 0.9, camLook=[lx - 1.0, 1.2, -7.5])
    hit(v, T_SPLASH, 0.5, 0.25, m + "splash", 1.0)
    v.key(47.4, 0, camPos=[lx + 5.6, 0.95, -3.6], camLook=[lx - 0.4, 0.45, -7.4], fov=42, dof=0.2, focus=6.8)
    v.key(47.401, 4.1, camPos=[lx + 4.9, 0.9, -3.9])
    v.key(47.4, 0, pigeonPos=[lx + 6.0, 9.0, -14.0], pigeonRot=-0.6, pigeonFlap=1.0)
    v.key(48.6, 1.0, pigeonPos=[lx + 0.02, 1.24, -7.0], pigeonRot=0.9)
    v.key(49.6, 0, pigeonFlap=0.0)
    # ================= L (51.5-56.5): your helicopter is here
    v.key(51.6, 0, camPos=[lx + 7.8, 1.3, 1.6], camLook=[lx - 2.0, 5.0, -9.0], fov=50, dof=0.0)
    v.key(51.601, 4.9, camPos=[lx + 7.0, 1.2, 1.2], camLook=[lx - 2.2, 3.3, -9.2])
    # ================= M (56.5-65): the twist: you are spinning right now
    v.key(56.5, 0, set="space", earthSun=1.0, earthLights=0.0, earthIce=0.0, earthTilt=0.0, earthRot=-0.9, spaceFov=40, spaceCam=[0, 9, 60],
          cloudRot=0.0, dof=0.0, bloom=0.5, chroma=0.0, shake=0.0, pigeonPos=[0, -500, 0])
    v.key(56.501, 8.5, lin=True, earthRot=0.9, spaceCam=[0, 9, 52])

    # ---------------- callouts
    v.callout(7.55, 8.4, 519, 870, "THAT'S YOU", lx=300, ly=520)
    v.callout(8.4, 9.3, 660, 980, "STILL 1,270 KM/H", lx=560, ly=1320)
    v.callout(27.0, 29.5, 583, 1030, "1,670 KM/H", lx=780, ly=1340)
    v.callout(29.7, 32.9, 463, 719, "1,270 KM/H", lx=280, ly=430)

    # ---------------- widgets
    v.widget(0, T_STOP, "NEW YORK SPINS AT", "787 MPH · TO THE EAST", "text", value="1,270 KM/H")
    v.widget(T_STOP, 9.3, "THE GROUND", "YOU: STILL 1,270 KM/H", "text", value="0 KM/H")
    v.widget(9.3, 18.0, "DISTANCE FLOWN", "MACH 1.03 · NO SEATBELT", "num:0: M", round(VX * T(9.3)), round(VX * T(18.0)))
    v.widget(18.0, 22.5, "ALL TRAFFIC", "NOTHING IS BOLTED DOWN", "text", value="EASTBOUND")
    v.widget(22.5, 26.5, "WIND IN YOUR FACE", "THE AIR FLIES WITH YOU", "text", value="0 KM/H")
    v.widget(26.5, 33.0, "THE EARTH", "THE AIR: STILL MOVING", "text", value="STOPPED")
    v.widget(33.0, 37.5, "SPEED AT THE POLE", "LUCKY BEAR", "text", value="0 KM/H")
    v.widget(37.5, T_GO, "EARTH RESTARTS IN", "TIME SLOWED DOWN", "sec", round(5 - T(37.5), 3), 0.0)
    v.widget(T_GO, T_SPLASH, "ALTITUDE", "NO PARACHUTE", "num:0: M", 127, 0)
    v.widget(T_SPLASH, 56.5, "DISTANCE FLOWN", "IN 5 SECONDS", "text", value="1,763 M")
    v.widget(56.5, 65.0, "YOU, RIGHT NOW", "UP TO 1,670 KM/H", "text", value="SPINNING")

    # ---------------- sound: ukulele -> record scratch -> adventure orchestra -> calm piano -> silence
    v.ambient(m + "city", 0, 6.5, 0.24, 0.4)
    v.ambient(m + "uke", 0, 6.52, 0.5, 0.05)
    v.ambient(m + "heli", 1.5, 6.5, 0.22, 1.2)
    v.sfx(m + "scratch", 6.42, 0.9)
    v.sfx(m + "whoa", 6.75, 0.6)
    v.ambient(m + "flight", 9.3, 44.0, 0.5, 0.25)
    v.ambient(m + "wind", 9.3, 18.0, 0.2, 0.6)
    v.sfx("whoosh", 9.2, 0.5)
    v.sfx(m + "boing", 11.4, 0.5)
    v.sfx("whoosh", 13.4, 0.4)
    v.ambient(m + "heli", 13.5, 18.0, 0.2, 0.6, offset=1.0)
    v.sfx("whoosh", 17.9, 0.4)
    v.sfx(m + "skid", 18.05, 0.7)
    v.sfx(m + "horn", 19.6, 0.5)
    v.sfx("whoosh", 22.4, 0.35)
    v.sfx(m + "coo", 23.0, 0.8)
    v.sfx(m + "flap", 24.6, 0.4)
    v.sfx(m + "slowwhoosh", 26.35, 0.6)
    v.ambient("space", 26.5, 33.0, 0.2, 0.4)
    v.sfx("impact-bass-2", 29.7, 0.35)
    v.sfx("whoosh", 32.9, 0.35)
    v.sfx(m + "bear", 34.9, 0.9)
    v.sfx("whoosh", 37.4, 0.4)
    v.ambient(m + "wind", 37.5, 44.0, 0.18, 0.6, offset=2.0)
    v.sfx("whoosh", 40.9, 0.4)
    v.sfx(m + "fall", 44.3, 0.7)
    v.sfx(m + "whoa", 44.5, 0.45)
    v.ambient(m + "calm", 48.2, 69.5, 0.5, 2.0)
    v.sfx(m + "spit", 47.8, 0.8)
    v.sfx(m + "coo", 49.7, 0.7)
    v.sfx(m + "boing", 49.6, 0.35)
    v.ambient(m + "heli", 51.4, 56.6, 0.35, 0.8, offset=0.5)
    v.sfx(m + "cheer", 52.6, 0.6)
    v.sfx(m + "slowwhoosh", 56.35, 0.5)
    v.ambient("space", 56.5, 65.0, 0.14, 0.6)
