"""What if all glass disappeared for 5 seconds?  One-take escalation in Midtown Manhattan: you and your friend (the star) on a
330 m observation deck with a frameless glass railing.  The glass vanishes, he tips over the edge, you grab him; time slows 8x;
the camera dives down the tower through a storm of office paper, past cars without windshields, to a street aquarium that
bursts; fiber cables (glass) go dark around the globe; the glass returns (with a pigeon stuck in a window).
Twist: glass is melted sand, silica is ~60% of Earth's crust.  Reference-grade facades, natural grade, dynamic sound."""
TITLE = "What if all glass disappeared for 5 seconds?"
TITLE_KEY = "glass"
KEY_COLOR = "#9fe3ff"
SUB = "GLASS IS MOSTLY SILICA (SiO₂): MELTED SAND\nSILICA MAKES UP ABOUT 60% OF EARTH'S CRUST"
CTA = ""
END_ASK = "What should disappear next?"
END_ASK2 = "COMMENT BELOW ↓"
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 74.0
END_CARD = 4.5
END_STYLE = "title"
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_models.js", "sets_people.js", "sets_nyc.js"]
WORLD_DEFAULTS = {"glass": 1.0, "paper": 0.0, "paperT": 0.0, "aquaBurst": 999.0, "tourists": 1.0, "tourMood": "calm", "carsMove": 1.0,
                  "chroma": 0.0, "crack": 0.0, "shake": 0.0, "bob": 0.0, "camNear": 0.05, "cables": 0.0, "cableDim": 0.0, "cableCut": 0.0,
                  "issOn": 0.0, "laser": 0.0, "spaceMoon": 0.0, "shockI": 0.0, "goldDot": 0.0, "crowdFilm": 0.1, "crowdCheer": 0.0}

CAPTIONS = [
    (3.4, 5.8, "New York. 250 metres up."),
    (6.0, 8.8, "He leans on the glass."),
    (9.2, 11.0, "The railing is gone."),
    (11.2, 13.4, "You grab his arm."),
    (13.8, 16.4, "Time slows down 8x."),
    (16.8, 19.6, "Every window in the city: gone."),
    (20.0, 23.0, "Wind rips through the offices."),
    (23.4, 26.4, "A blizzard of paper."),
    (27.6, 30.2, "Cars without windshields."),
    (30.4, 33.2, "Shop windows, wide open."),
    (33.6, 36.6, "The aquarium has no front."),
    (37.2, 40.2, "Fiber cables are glass too."),
    (40.6, 43.4, "The internet goes dark."),
    (44.6, 47.4, "Then: 5 seconds are over."),
    (47.8, 50.6, "Every pane comes back."),
    (51.0, 54.0, "Exactly where it was."),
    (54.4, 57.4, "Even if something was in the way."),
    (58.4, 61.4, "Plot twist: glass is melted sand."),
    (61.8, 64.8, "Silica: 60% of Earth's crust."),
    (65.2, 68.2, "If all of it vanished..."),
    (68.4, 70.6, "...so would the ground."),
    (71.0, 74.0, "Would you have caught him?"),
]

D = 250.0            # deck level
EYE = D + 1.65
STAR = [3.0, D, -27.4]       # at the north railing, looking at Central Park
DAY = dict(set="nyc", env="day", envI=0.6, skyTop="#3f7fd6", skyHorizon="#d9e0e6", skyBottom="#8a8f96", fogFar=11000, camFar=12000,
           light=1.05, ambient=0.4, ambientColor="#e6ecf2", lightColor="#ffe6c2", sunDir=[0.55, 0.42, 0.35],
           tonemap=1.0, exposure=1.02, contrast=1.08, saturation=1.12, warmth=0.04, vignette=0.22, grain=0.012, bloom=0.32, windowsLit=0.35)
ICON = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#e6f8ff" stop-opacity=".9"/><stop offset="1" stop-color="#9fe3ff" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><rect x="-70" y="-100" width="140" height="190" rx="6" fill="none" stroke="#fff" stroke-width="12" stroke-dasharray="26 16"/>
<path d="M-40 -60 L-10 -90 M-40 -20 L30 -90" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".7"/>'''


def mix(*ds, **kw):
    out = {}
    for d in ds:
        out.update(d)
    out.update(kw)
    return out


def hit(v, t, shake=0.5, chroma=0.4, snd=None, vol=0.8):
    v.key(t, 0.06, shake=shake, chroma=chroma)
    v.key(t + 0.08, 0.9, shake=0.0, chroma=0.0)
    if snd:
        v.sfx(snd, t - 0.03, vol)


def build(v):
    v.title_until(3.2, ICON)
    m = "music/"
    # ================= A (0-9): the deck, the countdown
    v.key(0, 0, **mix(DAY, glass=1.0, starPos=STAR, starRot=3.1416, starMode="idle", starFace=7.0, youPos=[0, -60, 0],
                     dof=0.12, focus=6.0, fov=58, shake=0.0))
    v.hands(0, "hidden", 0, item="none")
    v.path(0, 6.0, [[6.5, EYE + 0.3, -18.0], [4.6, EYE, -21.5]], [[2.0, D + 3.0, -70], [2.5, D - 8, -220]])
    v.key(3.0, 0.8, starMode="selfie", starFace=7.0, starRot=0.0)
    v.key(5.6, 0.6, starMode="idle", starRot=3.1416)
    v.path(6.0, 9.0, [[4.6, EYE, -21.5], [3.6, EYE, -23.6]], [[2.5, D - 8, -220], [3.0, D - 14, -200]])
    v.key(6.0, 3.0, focus=5.0, dof=0.16)
    v.bigcount(6.0, 9.0, "ALL GLASS DISAPPEARS IN", 3, 0)
    # ================= B (9-19): the glass is gone, he tips, you grab him, time slows
    v.key(9.0, 0, glass=0.0, tourMood="panic", starMode="tip", starFace=4.0)
    v.key(9.0, 0.06, exposure=1.35, bloom=0.9)
    v.key(9.1, 0.6, exposure=1.02, bloom=0.32)
    hit(v, 9.0, 0.7, 0.8, m + "vanish", 1.0)
    v.sfx("impact-bass-1", 9.02, 0.7)
    v.sfx(m + "gasp", 9.3, 0.7)
    v.key(9.0, 0, starPos=STAR)
    v.key(9.01, 1.4, starPos=[3.0, D - 0.15, -28.5])
    # POV: you lunge forward and grab him (look stays on him)
    v.key(9.0, 0, camPos=[3.6, EYE, -23.6], camLook=[3.0, D + 1.0, -30.0])
    v.key(9.01, 1.4, camPos=[3.3, EYE - 0.25, -25.6], camLook=[3.0, D + 0.7, -29.0])
    v.hands(10.2, "grab", 0.35)
    hit(v, 11.2, 0.4, 0.2, "impact-bass-2", 0.6)
    v.key(11.2, 2.2, camLook=[3.0, D + 0.6, -29.4])
    v.key(12.0, 1.5, starPos=[3.0, D, -27.6])
    v.key(13.5, 0, starMode="cry", starFace=5.0)
    # pull out of your body: wide shot of both of you at the open edge, then off the deck
    v.key(13.5, 0, youPos=[3.1, D, -25.6], youRot=3.1416, youMode="hug", youFace=3.0, camPos=[4.0, D + 2.4, -31.5], camLook=[3.0, D + 0.8, -26.4], fov=56)
    v.hands(13.5, "hidden", 0)
    v.key(13.51, 5.5, camPos=[14.0, D + 4.0, -44.0], camLook=[3.0, D + 0.4, -26.6])
    v.key(13.5, 1.2, dof=0.15, focus=8.0)
    v.key(15.0, 0, paper=1.0, paperT=0.0)
    v.key(15.01, 34.0, paperT=4.5, lin=True)
    v.sfx(m + "paper", 16.0, 0.5)
    hit(v, 16.8, 0.25, 0.25, "whoosh", 0.4)
    # ================= C (19-30.4): down the north facade, the paper storm over the city, a taxi without windshield
    v.path(19.0, 23.0, [[14.0, D + 4.0, -44.0], [15.0, 165, -57]], [[3.0, D + 0.4, -26.6], [-220, 120, -300]])
    v.key(19.0, 0, dof=0.0, fov=62)
    v.path(23.0, 27.5, [[15.0, 165, -57], [10, 60, -52], [-4, 2.4, -39.5]], [[-220, 120, -300], [-150, 30, -120], [-30, 1.5, -43]])
    hit(v, 23.4, 0.2, 0.25, "whoosh", 0.4)
    v.key(26.0, 0, carsMove=0.15)
    v.path(27.5, 30.4, [[-4, 2.4, -39.5], [-16, 1.9, -40.6], [-22, 1.75, -41.2]], [[-30, 1.5, -43], [-24, 1.3, -43.2], [-24.6, 1.15, -43.6]])
    v.key(27.5, 1.0, dof=0.22, focus=3.0)
    hit(v, 27.6, 0.3, 0.3, "impact-bass-1", 0.45)
    # ================= D (30.4-37): shop windows wide open, the aquarium bursts
    v.path(30.4, 33.6, [[-22, 1.75, -41.2], [-50, 1.8, -37.5], [-64, 1.6, -36.2]], [[-30, 1.6, -30], [-60, 1.8, -28], [-68, 1.4, -31]])
    v.key(30.4, 1.0, focus=7.0, dof=0.18)
    v.key(33.4, 0, aquaBurst=33.6)
    hit(v, 33.6, 0.45, 0.4, m + "splash", 0.9)
    v.key(33.6, 0, camPos=[-65.6, 1.5, -36.0], camLook=[-68, 1.2, -31])
    v.key(33.61, 3.4, camPos=[-64.6, 1.8, -38.6], camLook=[-68, 0.6, -32.5])
    v.key(33.6, 1.5, focus=5.5)
    # ================= E (37-44.5): the globe: every fiber cable goes dark
    v.key(37.0, 0, set="space", earthSun=1.0, earthLights=0.5, earthIce=0.0, earthTilt=0.3, earthRot=-0.9, spaceFov=40, spaceCam=[0, 8, 30],
          cables=0.0, cableDim=0.0, dof=0.0, bloom=0.6, chroma=0.0, shake=0.0)
    v.key(37.01, 2.0, cables=1.0)
    v.key(37.01, 7.4, spaceCam=[-3, 6, 24], earthRot=-0.75)
    v.key(40.6, 2.4, cableDim=1.0)
    hit(v, 40.6, 0.15, 0.3, m + "powerdown", 0.8)
    v.sfx("whoosh", 36.85, 0.35)
    # ================= F (44.5-58): back on the deck: the glass returns, a pigeon in a window
    v.key(44.5, 0, **mix(DAY, set="nyc", glass=0.0, paper=0.6, tourMood="panic", starPos=[3.0, D, -27.2], starRot=0.0, starMode="cry", starFace=5.0,
                         youPos=[3.1, D, -25.4], youRot=3.1416, youMode="hug", youFace=3.0, dof=0.25, focus=6.0, fov=56))
    v.key(44.5, 0, camPos=[-5.0, D + 2.4, -36.5], camLook=[3.0, D + 1.0, -26.4])
    v.key(44.51, 6.5, camPos=[-3.0, D + 2.0, -34.0])
    v.sfx("whoosh", 44.35, 0.35)
    v.key(47.8, 0, glass=1.0, tourMood="relief", starMode="hug", starFace=7.0, youFace=7.0, paper=0.0)
    v.key(47.8, 0.06, exposure=1.3, bloom=0.8)
    v.key(47.9, 0.8, exposure=1.02, bloom=0.32)
    hit(v, 47.8, 0.35, 0.3, m + "return", 1.0)
    v.sfx(m + "relief", 48.4, 0.55)
    # pigeon close-up on the tower facade
    v.key(51.0, 0, camPos=[5.6, 60.4, -29.9], camLook=[5.0, 60.1, -28.0], pigeonPos=[5.0, 60.0, -28.05], pigeonRot=3.1416, pigeonFlap=0.0,
          dof=0.35, focus=1.9, fov=50, tourMood="relief")
    v.key(51.01, 4.5, camPos=[5.3, 60.3, -29.4])
    v.sfx(m + "pigeon", 53.6, 0.8)
    v.key(53.6, 0.08, shake=0.25)
    v.key(53.7, 0.6, shake=0.0)
    v.sfx("whoosh", 50.85, 0.3)
    # relief on the deck
    v.key(55.5, 0, camPos=[-4.5, D + 2.0, -33.8], camLook=[3.0, D + 1.1, -26.4], dof=0.2, focus=8.0, fov=56, starMode="hug", starFace=7.0, youMode="hug", youFace=7.0)
    v.key(55.51, 2.5, camPos=[-3.6, D + 2.2, -33.0])
    v.sfx("whoosh", 55.35, 0.25)
    # ================= G (58-74): the twist: pull back and up from the deck over Manhattan
    v.key(58.0, 0, camPos=[3.0, D + 2.6, -19.0], camLook=[3.0, D + 0.6, -60.0], pigeonPos=[0, -500, 0], dof=0.0, fov=60, tourMood="calm",
          starPos=[3.6, D, -27.0], starRot=3.1416, starMode="idle", youPos=[2.4, D, -27.0], youRot=3.1416, youMode="idle")
    v.path(58.0, 74.0, [[3.0, D + 2.6, -19.0], [6, D + 40, 40], [12, D + 150, 140]], [[3.0, D + 0.6, -60.0], [0, D - 30, -200], [0, D - 120, -520]])
    v.sfx("whoosh", 57.85, 0.3)
    v.key(65.2, 0.1, crack=1.0, shake=0.6, chroma=0.5)
    v.key(65.4, 1.4, shake=0.12, chroma=0.0)
    v.sfx(m + "rumble", 65.15, 0.9)
    v.sfx("impact-bass-1", 65.2, 0.6)
    v.key(69.5, 1.2, crack=0.0, shake=0.0)

    # widget: the countdown in slow motion
    v.widget(0, 9.0, "HEIGHT", "GLASS RAILING · 1.25 M", "num:0: M", 330, 330)
    v.widget(9.0, 13.8, "GLASS RETURNS IN", "YOU'RE HOLDING HIM", "sec", 5.0, 4.4)
    v.widget(13.8, 26.8, "GLASS RETURNS IN", "TIME SLOWED 8X", "sec", 4.4, 2.8)
    v.widget(26.8, 37.0, "GLASS RETURNS IN", "EVERY WINDOW · EVERY WINDSHIELD", "sec", 2.8, 1.5)
    v.widget(37.0, 44.5, "GLASS RETURNS IN", "INTERNET: OFFLINE", "sec", 1.5, 0.35)
    v.widget(44.5, 47.8, "GLASS RETURNS IN", "HOLD ON", "sec", 0.35, 0.0)
    v.widget(47.8, 58.0, "GLASS", "", "text", value="BACK")
    v.widget(58.0, 65.2, "EARTH'S CRUST", "SILICA = SiO₂", "text", value="60%")
    v.widget(65.2, 74.0, "THE GROUND", "IF SILICA VANISHED", "text", value="GONE")

    # sound: quiet start, build, hits, near silence at the end
    v.ambient(m + "main", 0, 78.5, 0.42, 0.05)
    v.ambient(m + "city", 0, 9.2, 0.3, 0.3)
    v.ambient(m + "wind", 9.0, 30.0, 0.32, 1.5)
    v.ambient(m + "city", 30.0, 37.0, 0.25, 0.6, offset=3)
    v.ambient("space", 37.0, 44.5, 0.22, 0.4)
    v.ambient(m + "wind", 44.5, 58.0, 0.18, 1.0, offset=5)
    v.ambient(m + "wind", 58.0, 74.0, 0.12, 2.0, offset=8)
