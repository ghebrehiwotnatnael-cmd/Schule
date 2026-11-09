"""What if gravity doubled for 5 seconds?  One-take escalation (2 cuts), Thai hotel roof, Kai (channel mascot), slow motion,
live widget, red centre countdown, full-screen crack + chroma, one music track, 3 voice lines.  ~70 s + 4.5 s end card."""
TITLE = "What if gravity doubled for 5 seconds?"
TITLE_KEY = "gravity"
KEY_COLOR = "#9ad0ff"
SUB = "AT 2 G AN AIRLINER WOULD DROP ABOUT 120 M IN 5 SECONDS\nTHE MOON WOULD FALL 3.4 CM CLOSER, ITS YEARLY DRIFT IS 3.8 CM"
CTA = ""
END_ASK = "What should we try next?"
END_ASK2 = "COMMENT BELOW ↓"
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 70.5
END_CARD = 4.5
END_STYLE = "title"
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_models.js", "sets_people.js", "sets_resort.js", "sets_life.js"]
WORLD_DEFAULTS = {"eruptAt": 999.0, "erupt2At": 999.0, "lookAt": 999.0, "panicAt": 999.0, "fleeAt": 999.0, "stairsAt": 999.0,
                  "roofAt": 0.0, "roofMood": "calm", "siren": 0.0, "waveOn": 0.0, "floodZ": -999.0, "floodY": -5.0, "ash": 0.0,
                  "gravity": 1.0, "planeOn": 0.0, "planeX": -500.0, "planeDrop": 0.0, "chroma": 0.0, "crack": 0.0, "talk": "",
                  "friendPos": [0, -60, 0], "womanPos": [0, -60, 0], "staffPos": [0, -60, 0], "kaiPos": [0, -60, 0], "poolGirlPos": [0, -60, 0],
                  "issOn": 0.0, "issDrop": 0.0, "cables": 0.0, "laser": 0.0, "spaceMoon": 0.0, "shockI": 0.0, "bloom": 0.55}

CAPTIONS = [
    (3.6, 6.0, "You're on a hotel roof in Thailand."),
    (6.2, 8.4, "In 5 seconds, gravity doubles."),
    (9.4, 12.8, "“Bro... why is my drink so heavy?!”"),
    (13.2, 15.6, "You now weigh twice as much."),
    (16.0, 17.9, "“I can't get up!”"),
    (18.4, 21.6, "Your heart pumps twice as hard."),
    (22.4, 25.6, "Palm trees bow. Waves flatten."),
    (26.0, 29.4, "Everything falls twice as fast."),
    (30.4, 33.8, "A plane drops 120 meters."),
    (34.4, 37.6, "Even the clouds sink lower."),
    (38.2, 41.8, "Air pressure doubles. Ears pop."),
    (42.4, 46.4, "Higher and higher..."),
    (47.6, 51.0, "The space station drops 100 meters."),
    (51.4, 55.4, "Then, 5 seconds are over."),
    (57.0, 60.2, "“Okay... let's never do that again.”"),
    (60.8, 63.4, "Plot twist: the Moon moved too."),
    (63.6, 66.4, "3.4 cm closer. In 5 seconds."),
    (66.6, 70.2, "Could you even stand up?"),
]

TERR, ROOF = 1.2, 16.5
EYE = ROOF + 1.65
KNEE = ROOF + 1.1
DAY = dict(set="resort", env="day", envI=0.5, skyTop="#2a78e4", skyHorizon="#9fd8ff", skyBottom="#3f8fbf", fogFar=4200,
           light=0.75, ambient=0.26, ambientColor="#e6f2ff", lightColor="#fff1d6", sunDir=[0.35, 0.7, 0.45],
           tonemap=1.0, exposure=1.02, contrast=1.12, saturation=1.28, warmth=0.06, vignette=0.28, grain=0.02, bloom=0.55)
ICON = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#e3f2ff" stop-opacity=".9"/><stop offset="1" stop-color="#9ad0ff" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><path d="M0 -110 L0 70 M-46 26 L0 72 L46 26" stroke="#fff" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<text x="0" y="128" text-anchor="middle" font-family="Georgia" font-size="58" fill="#fff">×2</text>'''


def mix(*ds, **kw):
    out = {}
    for d in ds:
        out.update(d)
    out.update(kw)
    return out


def talk(v, who, t, dur, file, vol=1.0):
    v.sfx("voices/" + file, t, vol)
    v.key(t, 0, talk=who)
    v.key(t + dur, 0, talk="")


def build(v):
    v.title_until(3.2, ICON)
    # ================= SHOT A (0-47): ONE TAKE from the roof, out over the resort, up into the sky
    v.key(0, 0, **mix(DAY, roofAt=0.0, roofMood="calm", gravity=1.0, dof=0.3, focus=2.0, fov=62, bob=0.15, shake=0.0,
                     kaiPos=[5.7, ROOF, 92.65], kaiRot=0.25, kaiMode="talk", kaiFace=7.0,
                     poolGirlPos=[-1.5, TERR, 85.6], poolGirlRot=0.0, poolGirlMode="lie", poolGirlFace=0.0))
    v.path(0, 8.5, [[6.2, EYE, 95.0], [6.2, EYE, 94.6]], [[3.5, 7, 40], [4, 6, 30]])
    v.hands(0, "hidden", 0, item="none")
    # 8.5 gravity doubles: slam, colour split, you drop to your knees
    v.key(8.5, 0.12, gravity=2.0, chroma=1.2, shake=0.9)
    v.key(8.7, 1.6, chroma=0.15, shake=0.12)
    v.key(8.5, 0.3, kaiMode="kneel", kaiFace=4.0, poolGirlMode="kneel", poolGirlFace=3.0)
    v.path(8.5, 14.0, [[6.2, EYE, 94.6], [6.25, KNEE, 94.5], [6.3, KNEE, 94.4]], [[4, 6, 30], [5.7, KNEE - 0.6, 92.6], [5.6, KNEE - 0.5, 92.6]])
    talk(v, "kai", 9.4, 3.4, "l1_kai")
    # 12.6 the glass railing in front of you cracks (full screen)
    v.key(12.6, 0.25, crack=1.0)
    v.key(14.6, 1.2, crack=0.0)
    # 14-22 out of your body: down to the pool terrace
    v.key(14.0, 0, dof=0.25, focus=4.0, bob=0.0)
    v.path(14.0, 22.0, [[6.3, KNEE, 94.4], [5.0, 16.0, 91.0], [2.0, 8.5, 89.4], [-0.6, 2.6, 88.4]], [[4, 8, 60], [0, 3, 80], [-1.4, 1.5, 85.6], [-1.5, 1.4, 85.6]])
    talk(v, "poolGirl", 16.0, 1.9, "l2_pool")
    # 22-47 over the beach, up into the sky; the plane drops, the clouds sink, the sky turns dark blue
    v.key(22.0, 0, dof=0.0, fov=58, planeOn=1.0, planeX=-420.0)
    v.key(22.01, 25.0, planeX=380.0, lin=True)
    v.key(29.0, 10.0, planeDrop=1.0)
    v.path(22.0, 47.0, [[-0.6, 2.6, 88.4], [-1.5, 6.5, 68], [-3, 9, 46], [-5, 14, 24], [-8, 60, 5], [-12, 170, -40], [-15, 330, -90]],
           [[-2, 1.5, 50], [-3, 1.2, 20], [-5, 1.5, -10], [-10, 20, -260], [-8, 0, -20], [-4, 0, 50], [-2, 0, 80]])
    v.key(38.0, 9.0, skyTop="#0d1f5c", skyHorizon="#6aa8f0", fov=62)
    # ================= SHOT B (47-56): space, the ISS drops
    v.key(47.0, 0, set="space", earthSun=1.0, earthLights=0.5, earthIce=0.0, earthTilt=0.41, earthRot=-3.3, spaceFov=40,
          spaceCam=[3.5, 6.6, 17.5], issOn=1.0, issDrop=0.0, shake=0.05, dof=0.0, bloom=0.6, chroma=0.0)
    v.key(47.01, 9.0, spaceCam=[3.3, 6.3, 16.6], issDrop=1.0, lin=True)
    # ================= SHOT C (56-70.5): back on the roof, gravity is back
    v.key(56.0, 0, **mix(DAY, gravity=1.0, roofMood="relief", issOn=0.0, planeOn=1.0, planeX=420.0, planeDrop=0.0, chroma=0.8, shake=0.4,
                         dof=0.3, focus=2.0, fov=62, bob=0.1, kaiPos=[5.7, ROOF, 92.65], kaiRot=0.25, kaiMode="kneel", kaiFace=2.0, poolGirlPos=[0, -60, 0]))
    v.key(56.2, 1.0, chroma=0.0, shake=0.0)
    v.key(56.6, 0.6, kaiMode="cheer", kaiFace=7.0)
    v.path(56.0, 70.5, [[6.3, KNEE, 94.4], [6.25, EYE, 94.6], [6.2, EYE, 94.9], [6.1, EYE, 95.2]],
           [[5.7, ROOF + 1.0, 92.6], [5.7, ROOF + 1.6, 92.6], [3, 20, 0], [-20, 160, -600]])
    talk(v, "kai", 57.0, 3.2, "l3_kai")
    v.key(60.6, 0.8, kaiMode="talk")

    # widget: live physics
    v.widget(0, 8.5, "GRAVITY", "YOUR WEIGHT: 75 KG", "num:2: g", 1.0, 1.0)
    v.widget(8.5, 22.0, "GRAVITY RETURNS IN", "TIME SLOWED 10x · YOU: 150 KG", "sec", 5.0, 3.6)
    v.widget(22.0, 38.0, "GRAVITY RETURNS IN", "TIME SLOWED 10x · PLANE: −120 M", "sec", 3.6, 1.9)
    v.widget(38.0, 47.0, "GRAVITY RETURNS IN", "AIR PRESSURE: 2.0 ATM", "sec", 1.9, 0.95)
    v.widget(47.0, 56.0, "GRAVITY RETURNS IN", "ISS ALTITUDE: −100 M", "sec", 0.95, 0.0)
    v.widget(56.0, 60.6, "GRAVITY", "1.00 g · 75 KG", "text", value="BACK")
    v.widget(60.6, 66.6, "THE MOON", "IN THOSE 5 SECONDS", "text", value="−3.4 CM")
    v.widget(66.6, 70.5, "GRAVITY", "", "text", value="2.00 g?")
    v.bigcount(3.5, 8.5, "GRAVITY DOUBLES IN", 5, 0)
    v.bigcount(53.0, 56.0, "GRAVITY RETURNS IN", 3, 0)

    # sound: one music track building to the climax, quiet end card
    m = "music/"
    v.ambient(m + "score", 0, 75.0, 0.5, 0.05)
    v.ambient(m + "beach", 0, 8.6, 0.4, 0.05)
    v.sfx(m + "gravity", 8.45, 1.0)
    v.ambient(m + "strain_long", 8.6, 47.0, 0.4, 0.6)
    v.sfx(m + "crack", 12.5, 0.7)
    v.ambient("space", 47.0, 56.0, 0.3, 0.4)
    v.sfx(m + "release", 55.9, 0.9)
    v.ambient(m + "beach", 56.0, 70.5, 0.3, 0.8, offset=8)
    for t in (47.0, 56.0):
        v.sfx("whoosh", t - 0.15, 0.3)
