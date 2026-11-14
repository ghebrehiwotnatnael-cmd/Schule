"""What if friction disappeared for 5 seconds?  Lunch break on a busy New York street corner with your friend (the star), who is
eating a hot dog.  Friction vanishes: everybody slips and glides, the sausage shoots out of the bun, freeze frame "that's you",
his sunglasses slide off his nose, a taxi glides past spinning like a curling stone, the traffic cop pirouettes, a pigeon can't
land, the violinist goes silent (bows need friction) and the playful music dies with her, screws unscrew themselves and the PIZZA
sign slides down the wall; in slow motion you glide into the avenue towards the spinning taxi - then friction returns all at once
and everybody hits the ground (the taxi stops right in front of you).  Twist: without friction you could not even hold this phone.
Fun pass: a gag every 3-4 s, the star's slapstick, on-screen gags; sound: playful at the start, slow and cinematic to the end."""
TITLE = "What if friction disappeared for 5 seconds?"
TITLE_KEY = "friction"
KEY_COLOR = "#ffd166"
SUB = "FRICTION HOLDS YOUR FEET, SCREWS, KNOTS AND BRAKES\nWITHOUT IT, NOTHING THAT MOVES COULD EVER STOP"
CTA = ""
END_ASK = "What should disappear next?"
END_ASK2 = "COMMENT BELOW ↓"
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 68.0
END_CARD = 4.5
END_STYLE = "title"
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_models.js", "sets_people.js", "sets_slip.js", "sets_nyc.js"]
WORLD_DEFAULTS = {"glass": 1.0, "paper": 0.0, "paperT": 0.0, "aquaBurst": 999.0, "tourists": 0.0, "carsMove": 1.0, "chroma": 0.0, "crack": 0.0,
                  "shake": 0.0, "bob": 0.0, "camNear": 0.05, "crowdFilm": 0.12, "crowdCheer": 0.0, "crowdSlip": 0.0, "crowdSlipD": 0.0, "crowdStop": 0.0,
                  "slipOn": 0.0, "stopOn": 0.0, "starDog": 1.0, "dogOut": 0.0, "starGlassHide": 0.0, "umbrellaDrop": 0.0, "signDrop": 0.0,
                  "cartGlide": 0.0, "copSpin": 0.0, "violinGlide": 0.0, "carSpin": 0.0, "phoneSlip": 0.0, "pigeonFlap": 1.0}

CAPTIONS = [
    (0.4, 3.1, "Lunch break in New York."),
    (3.4, 6.3, "Friction is about to vanish."),
    (6.8, 8.8, "Friction: gone."),
    (8.9, 10.5, "Nobody can stand."),
    (12.6, 15.2, "Sunglasses need friction too."),
    (15.4, 16.7, "Bye, sunglasses."),
    (17.0, 19.4, "Cars can't brake."),
    (19.6, 21.4, "Or steer."),
    (21.8, 24.0, "Everyone keeps sliding."),
    (24.1, 25.9, "Forever."),
    (26.4, 29.8, "Pigeons can't land."),
    (30.2, 31.8, "Violins go silent."),
    (31.9, 33.4, "Bows need friction."),
    (33.8, 36.4, "Screws unscrew themselves."),
    (36.6, 39.3, "Nothing holds anything."),
    (39.8, 42.8, "You can't stop. Can't steer."),
    (43.1, 46.6, "Neither can the taxi."),
    (47.3, 49.4, "Friction is back."),
    (49.5, 51.2, "All at once."),
    (51.6, 53.8, "Everybody hits the ground."),
    (54.0, 55.9, "The pigeon finally lands."),
    (56.4, 59.4, "Plot twist: without friction..."),
    (59.6, 62.4, "...you couldn't hold this phone."),
    (62.8, 65.6, "Not even for 5 seconds."),
    (65.8, 68.0, "Would you stay on your feet?"),
]

DAY = dict(set="nyc", env="day", envI=0.65, skyTop="#3f7fd6", skyHorizon="#d9e0e6", skyBottom="#8a8f96", fogFar=9000, camFar=10000,
           light=1.1, ambient=0.45, ambientColor="#e9eef4", lightColor="#ffe6c2", sunDir=[0.45, 0.62, 0.38],
           tonemap=1.0, exposure=1.05, contrast=1.07, saturation=1.14, warmth=0.05, vignette=0.2, grain=0.012, bloom=0.3, windowsLit=0.35)
ICON = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#fff3c4" stop-opacity=".9"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><path d="M-110 70 L110 70" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
<g transform="rotate(-18)"><rect x="-55" y="-30" width="110" height="60" rx="14" fill="none" stroke="#fff" stroke-width="12"/></g>
<path d="M-120 -60 L-60 -60 M-130 -20 L-75 -20 M-118 20 L-80 20" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".75"/>'''

# ------------------------------------------------------------------ world time of the glide (slow motion = slower slipT)
T_OFF, T_ON = 6.5, 47.0
SLIP_SEGS = [(6.5, 14.0, 1.0), (14.0, 33.5, 0.6), (33.5, 39.5, 0.45), (39.5, 47.0, 0.22)]


def sT(t):
    s = 0.0
    for a, b, r in SLIP_SEGS:
        if t <= a:
            break
        s += (min(t, b) - a) * r
    return s


W0, Y0 = [-100.6, 0.15, -32.6], [-99.3, 0.15, -32.3]
GW, GY = [-0.5, -0.12], [-0.46, -0.16]           # glide velocities of the star and of you (m per glide-second)


def W(t, off=(0, 0, 0)):
    s = sT(t)
    return [round(W0[0] + GW[0] * s + off[0], 3), round(W0[1] + off[1], 3), round(W0[2] + GW[1] * s + off[2], 3)]


def Y(t, off=(0, 0, 0)):
    s = sT(t)
    return [round(Y0[0] + GY[0] * s + off[0], 3), round(Y0[1] + off[1], 3), round(Y0[2] + GY[1] * s + off[2], 3)]


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


def follow(v, t0, t1, fn, step=0.1):
    """vector track sampled from a python function (deterministic glide paths)"""
    n = max(1, int(round((t1 - t0) / step)))
    for k in range(n + 1):
        t = t0 + (t1 - t0) * k / n
        yield t, fn(t)


def build(v):
    v.title_until(3.2, ICON)
    m = "music/"
    v.hands(0, "hidden", 0, item="none")
    # ---------------- global glide clocks
    v.key(0, 0, **mix(DAY, walkT=0.0, slipT=0.0, carT=0.0, fov=40, dof=0.15, focus=5.0))
    v.key(0.0005, T_OFF, lin=True, walkT=T_OFF, carT=T_OFF)
    v.key(T_OFF, 0, slipOn=1.0, crowdSlip=1.0)
    for a, b, r in SLIP_SEGS:
        v.key(a + 0.0006, b - a, lin=True, slipT=round(sT(b), 4), carT=round(T_OFF + sT(b), 4), crowdSlipD=round(0.9 * sT(b), 4),
              copSpin=round(4.2 * sT(b), 4), carSpin=round(0.22 * sT(b), 4), cartGlide=round(0.25 * sT(b), 4), violinGlide=round(0.06 * sT(b), 4))
    v.key(T_ON, 0, stopOn=1.0, crowdStop=1.0)

    # ---------------- the star and you
    v.key(0, 0, starPos=W0, starRot=-2.35, starMode="eat", starFace=7.0, youPos=Y0, youRot=-2.85, youMode="talk", youFace=7.0)
    for t, p in follow(v, T_OFF, T_ON + 0.05, W):
        v.key(t, 0.1, lin=True, starPos=p)
    for t, p in follow(v, T_OFF, T_ON + 0.05, Y):
        v.key(t, 0.1, lin=True, youPos=p)
    v.key(T_OFF, 0, starMode="slip", starFace=4.0, youMode="slip", youFace=4.0)
    v.key(T_OFF, 1.2, starRot=-2.0, youRot=-2.4)
    v.key(8.6, 0, starMode="split", starFace=2.0)
    v.key(12.3, 0, starMode="glide", starFace=3.0, youMode="glide", youFace=4.0, starRot=-2.5)
    v.key(15.6, 0, starFace=2.0)
    v.key(16.8, 0, starMode="slip", starFace=4.0)
    v.key(21.5, 0, starMode="glide", starFace=7.0, youMode="flail", youFace=4.0)
    v.key(33.5, 0, youMode="glide", youFace=3.0)
    v.key(39.5, 0, starMode="grabYou", starFace=4.0, youMode="slip", youFace=4.0, starRot=0.25, youRot=-0.2)
    v.key(T_ON, 0, starMode="faceplant", starFace=3.0, youMode="lie", youFace=3.0)
    v.key(51.6, 0, starMode="kneel", starFace=1.0)
    v.key(52.3, 0, starMode="idle", starFace=6.0, starRot=1.2)
    v.key(53.2, 0, starMode="cheer", starFace=7.0, youMode="sit", youFace=7.0)

    # ---------------- the hot dog: the sausage shoots out of the bun and glides away
    v.key(7.0, 0, dogOut=1.0)
    w7 = W(7.0)
    start = [w7[0] - 0.2, 1.35, w7[2] - 0.25]
    land = [w7[0] - 1.9, 0.06, w7[2] - 1.5]

    def dog(t):
        if t <= 7.8:
            u = (t - 7.0) / 0.8
            return [round(start[i] + (land[i] - start[i]) * u + (1.4 * u * (1 - u) * 4 if i == 1 else 0), 3) for i in range(3)]
        s = sT(t) - sT(7.8)
        return [round(land[0] - 0.95 * s, 3), 0.06, round(land[2] - 0.4 * s, 3)]
    for t, p in follow(v, 7.0, T_ON + 0.05, dog):
        v.key(t, 0.1, lin=True, dogPos=p)
    v.key(7.0, 0.8, lin=True, dogSpin=9.0)
    v.key(7.8, 39.2, lin=True, dogSpin=30.0)

    # ---------------- the sunglasses: slide down his nose, fall, glide; he puts them back on in the end
    v.key(12.8, 2.2, starGlassOff=[0.032, 0.03])
    v.key(15.6, 0, starGlassHide=1.0)
    g0 = W(15.6, (0.05, 1.62, -0.12))

    def glasses(t):
        if t <= 16.1:
            u = (t - 15.6) / 0.5
            return [round(g0[0] - 0.3 * u, 3), round(g0[1] + (0.04 - g0[1]) * u * u + 0.25 * u * (1 - u), 3), round(g0[2] - 0.2 * u, 3)]
        s = sT(t) - sT(16.1)
        return [round(g0[0] - 0.3 + GW[0] * 1.05 * s, 3), 0.04, round(g0[2] - 0.2 + GW[1] * 1.3 * s, 3)]
    for t, p in follow(v, 15.6, T_ON + 0.05, glasses):
        v.key(t, 0.1, lin=True, glassPos=p)
    v.key(15.6, 0, glassRot=[0, 0.4, 0])
    v.key(15.61, 0.5, glassRot=[1.4, 2.0, 0.6])
    v.key(16.11, 0.2, glassRot=[0, 2.2, 0])
    v.key(16.4, 30.6, lin=True, glassRot=[0, 9.0, 0])
    v.key(52.6, 0, starGlassHide=0.0, starGlassOff=[0, 0])

    # ---------------- the hero taxi: glides past spinning (E), then slides towards you in slow motion (J) and stops (K)
    v.key(0, 0, taxiPos=[-24, 0.02, -43.2], taxiRot=-1.5708)
    v.key(16.8, 0, taxiPos=[-64.0, 0.02, -38.3], taxiRot=-1.5708)
    v.key(16.801, 4.7, lin=True, taxiPos=[-95.0, 0.02, -38.0], taxiRot=0.9)
    v.key(21.5, 0, taxiPos=[-300.0, 0.02, -38.0])
    v.key(39.5, 0, taxiPos=[-111.9, 0.02, -48.0], taxiRot=2.1)
    v.key(39.501, 7.5, lin=True, taxiPos=[-111.9, 0.02, -39.3], taxiRot=0.35)

    # ---------------- props
    v.key(33.8, 1.4, lin=True, signDrop=0.25)
    v.key(35.2, 2.2, signDrop=1.0)
    v.key(36.0, 1.6, umbrellaDrop=1.0)

    # ================= A (0-6.5): two-shot on the corner, countdown
    v.path(0, 6.5, [[-103.4, 1.5, -37.2], [-102.7, 1.48, -36.2]], [[-100.0, 1.25, -32.4], [-100.1, 1.2, -32.5]])
    v.bigcount(3.5, 6.5, "FRICTION DISAPPEARS IN", 3, 0)
    # ================= B (6.5-10.5): friction gone
    hit(v, T_OFF, 0.45, 0.35, "impact-bass-1", 0.6)
    v.key(T_OFF, 0.06, exposure=1.3, bloom=0.7)
    v.key(T_OFF + 0.1, 0.6, exposure=1.05, bloom=0.3)
    v.path(6.5, 9.0, [[-102.7, 1.48, -36.2], [-103.4, 1.4, -37.0]], [[-100.4, 1.15, -32.6], [-101.4, 0.95, -33.0]])
    v.key(9.0, 0, camPos=[-105.8, 1.8, -38.6], camLook=[-101.6, 0.9, -33.2], fov=44, dof=0.08, focus=6.8)
    v.key(9.001, 1.5, camPos=[-105.6, 1.78, -38.3])
    # ================= C: freeze frame "that's you"
    v.freeze(10.5, 1.8)
    v.key(10.5, 0.08, saturation=0.72, contrast=1.16, vignette=0.4)
    v.key(12.25, 0.05, saturation=1.14, contrast=1.07, vignette=0.2)
    # ================= D (12.3-16.8): his sunglasses (close-up, the camera glides with him)
    for t, p in follow(v, 12.3, 16.8, lambda t: W(t, (-1.55, 1.52, -2.3))):
        v.key(t, 0.1, lin=True, camPos=p)
    for t, p in follow(v, 12.3, 16.8, lambda t: W(t, (0.0, 1.5, 0.0))):
        v.key(t, 0.1, lin=True, camLook=p)
    v.key(12.3, 0, fov=36, dof=0.3, focus=2.75)
    # ================= E (16.8-21.5): the taxi glides past, spinning
    v.key(16.8, 0, camPos=[-86.0, 0.8, -45.6], camLook=[-66.0, 1.0, -39.0], fov=50, dof=0.12, focus=10.0)
    v.key(16.801, 4.7, camPos=[-86.6, 0.85, -45.7], camLook=[-102.0, 1.0, -37.0])
    # ================= F (21.5-26): drone over the intersection
    v.path(21.5, 26.0, [[-95.5, 19.0, -21.0], [-98.0, 23.0, -55.0]], [[-111.0, 0.0, -36.5], [-113.0, 0.0, -36.0]], fov=55, dof=0.0)
    # ================= G (26-30): the pigeon can't land
    v.key(26.0, 0, camPos=[-104.2, 4.75, -33.6], camLook=[-105.8, 4.8, -30.5], fov=44, dof=0.2, focus=3.4)
    v.key(26.001, 4.0, camPos=[-104.8, 4.65, -33.7], camLook=[-106.8, 4.4, -30.5])
    v.key(26.0, 0, pigeonPos=[-110.5, 7.5, -36.0], pigeonRot=-0.6, pigeonFlap=1.0)
    v.key(26.001, 1.3, pigeonPos=[-104.8, 5.02, -30.5], pigeonRot=-1.5708)
    v.key(27.3, 0, pigeonFlap=0.0)
    v.key(27.301, 1.3, lin=True, pigeonPos=[-107.15, 5.02, -30.5])
    v.key(28.6, 0.3, pigeonPos=[-107.6, 4.3, -30.6])
    v.key(28.9, 0, pigeonFlap=1.0)
    v.key(28.901, 1.1, pigeonPos=[-110.0, 6.4, -34.0], pigeonRot=-0.4)
    v.key(30.0, 0, pigeonPos=[0, -500, 0])
    # ================= H (30-33.5): the violinist goes silent
    v.key(30.0, 0, camPos=[-101.6, 1.5, -34.3], camLook=[-98.15, 1.3, -31.35], fov=40, dof=0.25, focus=4.4)
    v.key(30.001, 3.5, camPos=[-101.2, 1.45, -34.1], camLook=[-97.95, 1.3, -31.45])
    # ================= I (33.5-39.5): screws unscrew, the sign slides down, the umbrella slides down its pole
    v.key(33.5, 0, camPos=[-96.6, 1.6, -39.2], camLook=[-92.4, 3.0, -30.4], fov=48, dof=0.1, focus=9.0)
    v.key(33.501, 3.9, camPos=[-96.8, 1.55, -39.4], camLook=[-91.5, 1.6, -30.4])
    v.key(37.4, 2.1, camPos=[-97.0, 1.7, -39.8], camLook=[-90.6, 1.3, -32.6])
    # ================= J (39.5-47): slow motion - you and him slide into the avenue, the taxi spins towards you
    v.key(39.5, 0, camPos=[-110.9, 1.35, -27.6], camLook=[-111.0, 1.2, -38.0], fov=42, dof=0.12, focus=7.8)
    v.key(39.501, 7.5, lin=True, camPos=[-110.9, 1.3, -28.8], focus=6.8)
    v.key(39.5, 0.4, exposure=1.0, contrast=1.12, warmth=0.1)
    # ================= K (47-51): friction is back
    hit(v, T_ON, 0.8, 0.4, "impact-bass-1", 1.0)
    v.key(T_ON, 0.06, exposure=1.35, bloom=0.8)
    v.key(T_ON + 0.1, 0.7, exposure=1.05, bloom=0.3, contrast=1.07, warmth=0.05)
    v.key(49.4, 0, camPos=[-105.6, 1.9, -31.4], camLook=[-110.5, 0.8, -35.6], fov=50, dof=0.08, focus=7.0)
    v.key(49.401, 6.6, camPos=[-106.4, 1.8, -31.9])
    # ================= L (51-56): everybody on the ground, he puts his sunglasses back on, the pigeon lands on the taxi
    v.key(53.4, 0, pigeonPos=[-104.0, 6.0, -44.0], pigeonRot=2.6, pigeonFlap=1.0)
    v.key(53.401, 1.2, pigeonPos=[-111.9, 1.94, -39.6])
    v.key(54.6, 0, pigeonFlap=0.0)
    v.key(56.0, 0, pigeonPos=[0, -500, 0])
    # ================= M (56-68): POV, your phone - it slips out of your hand
    v.key(56.0, 0, camPos=[-100.3, 1.62, -33.0], camLook=[-108.0, 0.9, -37.5], fov=52, dof=0.12, focus=0.45, youPos=[0, -60, 0])
    v.key(56.001, 12.0, camPos=[-100.4, 1.6, -33.15])
    v.hands(56.0, "hold", 0.0, item="phone", phoneUI="tiktok")
    v.key(61.0, 1.2, phoneSlip=1.0)
    v.key(62.25, 0, item="none")
    v.hands(62.3, "reach", 0.35)
    # closing image: rise above the corner, everybody still on the ground (quiet)
    v.hands(64.6, "hidden", 0.0)
    v.path(64.6, 68.0, [[-103.5, 5.5, -29.0], [-101.0, 16.0, -22.0], [-98.0, 30.0, -14.0]], [[-109.5, 0.0, -36.5], [-110.0, 0.0, -37.0], [-110.5, 0.0, -38.0]], fov=55, dof=0.0)
    v.sfx("whoosh", 64.45, 0.25)

    # ---------------- callouts on the freeze frame
    v.callout(10.55, 11.45, 455, 860, "THAT'S YOU", lx=330, ly=520)
    v.callout(11.45, 12.3, 860, 930, "YOUR FRIEND", lx=760, ly=560)

    # ---------------- widget gags
    v.widget(0, T_OFF, "SHOE GRIP", "FRICTION  μ = 0.8", "num:0:%", 100, 100)
    v.widget(T_OFF, 12.3, "SHOE GRIP", "μ = 0 · GOOD LUCK", "text", value="0%")
    v.widget(12.3, 16.8, "SUNGLASSES", "HELD BY FRICTION", "text", value="SLIPPING")
    v.widget(16.8, 21.5, "BRAKES", "NEED FRICTION", "text", value="USELESS")
    v.widget(21.5, 26.0, "STOPPING DISTANCE", "NEWTON'S FIRST LAW", "text", value="∞")
    v.widget(26.0, 30.0, "PIGEON LANDING", "ATTEMPT 1 OF 1", "text", value="FAILED")
    v.widget(30.0, 33.5, "MUSIC", "BOWS NEED FRICTION", "text", value="SILENT")
    v.widget(33.5, 39.5, "SCREWS", "HELD BY FRICTION", "text", value="LOOSE")
    v.widget(39.5, T_ON, "FRICTION BACK IN", "TIME SLOWED DOWN", "sec", 0.95, 0.0)
    v.widget(T_ON, 56.0, "SHOE GRIP", "FRICTION IS BACK", "text", value="100%")
    v.widget(56.0, 68.0, "YOUR GRIP", "ON THIS PHONE, WITHOUT FRICTION", "text", value="0%")

    # ---------------- sound: playful start -> chase -> dead silence -> slow cinematic build -> silence at the end
    v.ambient(m + "city", 0, 68.0, 0.26, 0.6)
    v.ambient(m + "tiptoe", 0, 6.6, 0.5, 0.3)
    v.ambient(m + "chase", 6.5, 10.5, 0.5, 0.04)
    v.ambient(m + "chase", 12.3, 31.0, 0.5, 0.04, offset=4.0)
    v.ambient(m + "slowbuild", 31.8, 46.95, 0.55, 1.8)
    v.ambient(m + "slowbuild", 47.7, 70.5, 0.55, 2.5, offset=15.2)
    v.sfx(m + "slip", 6.45, 0.8)
    v.sfx(m + "whoa", 6.7, 0.55)
    v.sfx(m + "pop", 7.0, 0.8)
    v.sfx(m + "scratch", 10.45, 0.9)
    v.sfx(m + "slidewhistle", 12.8, 0.55)
    v.sfx("whoosh", 15.55, 0.4)
    v.sfx(m + "carglide", 16.9, 0.55)
    v.sfx(m + "horn", 18.0, 0.7)
    v.sfx("whoosh", 19.6, 0.6)
    v.sfx("whoosh", 21.35, 0.3)
    v.sfx(m + "whoa", 22.0, 0.35)
    v.sfx(m + "flap", 26.2, 0.7)
    v.sfx(m + "slidewhistle", 27.35, 0.6)
    v.sfx(m + "boing", 28.6, 0.8)
    v.sfx(m + "flap", 28.9, 0.6)
    v.sfx(m + "violin", 30.5, 0.7)
    v.sfx(m + "screws", 33.85, 0.8)
    v.sfx(m + "signcrash", 35.3, 0.9)
    v.sfx(m + "slowwhoosh", 39.35, 0.8)
    v.sfx("impact-bass-2", 39.5, 0.45)
    v.sfx(m + "carglide", 40.2, 0.4)
    v.sfx(m + "falls", 47.05, 0.9)
    v.sfx(m + "groan", 48.1, 0.7)
    v.sfx("whoosh", 49.3, 0.3)
    v.sfx(m + "boing", 52.6, 0.45)
    v.sfx(m + "flap", 53.5, 0.5)
    v.sfx("whoosh", 55.9, 0.3)
    v.sfx(m + "phonedrop", 61.9, 0.9)
    v.sfx("impact-bass-2", 62.1, 0.35)
