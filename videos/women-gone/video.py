"""What if all women disappeared?  Personal POV (you are a man), no narrator, 4 voice lines, ~72 s + title end card."""
TITLE = "What if all women disappeared?"
TITLE_KEY = "women"
KEY_COLOR = "#ffcf70"
SUB = "ABOUT 9 IN 10 NURSES ARE WOMEN\nIN 2017 LAMBS GREW FOR 4 WEEKS INSIDE AN ARTIFICIAL WOMB"
CTA = ""
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 72.0
END_CARD = 3.0
END_STYLE = "title"
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_models.js", "sets_models2.js", "sets_rooms.js", "sets_people.js", "sets_resort.js", "sets_life.js"]
WORLD_DEFAULTS = {"crowd": 0.0, "mkPeople": 0.0, "traffic": 1.0, "cars": 1.0, "power": 1.0, "moon": 0.0,
                  "vanishMen": 999.0, "vanishWomen": 999.0, "crashAt": 999.0, "streetMood": "normal", "talk": "",
                  "eruptAt": 999.0, "erupt2At": 999.0, "lookAt": 999.0, "panicAt": 999.0, "fleeAt": 999.0, "stairsAt": 999.0, "roofAt": 999.0,
                  "friendPos": [0, -60, 0], "womanPos": [0, -60, 0], "staffPos": [0, -60, 0],
                  "wifePos": [0, -60, 0], "himPos": [0, -60, 0], "docPos": [0, -60, 0], "boyPos": [0, -60, 0], "meMPos": [0, -60, 0],
                  "wifeVanish": 999.0, "mice": 0.0, "biobag": 1.0, "ultra": 0.0, "tv": 0.0, "boardgame": 0.0, "candles": 0.0, "bloom": 0.5,
                  "dadBabies": 0.0, "family": 1.0, "patient": 1.0}

CAPTIONS = [
    (3.4, 5.6, "Saturday. 9 AM."),
    (5.8, 7.4, "Pancakes. Coffee. Her."),
    (7.6, 9.2, "“Honey, have you seen my—”"),
    (9.6, 11.2, "...and she's gone."),
    (11.6, 15.3, "Every woman on Earth. Gone."),
    (15.9, 20.2, "4 billion people. In one second."),
    (21.2, 23.9, "“Bro... my wife is gone too.”"),
    (25.8, 29.8, "Every city. Every beach. Every home."),
    (31.0, 33.7, "“We've lost almost every nurse.”"),
    (34.0, 35.0, "9 in 10 nurses were women."),
    (35.6, 39.2, "Most teachers: gone."),
    (40.2, 42.4, "“Where's my mom?”"),
    (45.0, 49.2, "Millions of dads. Alone with babies."),
    (50.0, 53.8, "No more babies. Ever."),
    (54.5, 58.6, "Humanity: one generation left."),
    (59.6, 62.0, "Plot twist: there's a backup plan."),
    (62.2, 64.8, "2017: lambs grew in an artificial womb."),
    (65.0, 67.3, "Four weeks. Inside a plastic bag."),
    (68.0, 71.8, "Call your mom today."),
]

SW = 0.18
E = SW + 1.65
GRADE = dict(tonemap=1.0, exposure=1.0, contrast=1.1, saturation=1.25, warmth=0.05, vignette=0.25, grain=0.02, bloom=0.5)
DAY = dict(env="day", envI=0.4, skyTop="#2f7fe0", skyHorizon="#a9d4ff", skyBottom="#4b6a3a", light=0.75, ambient=0.22,
           ambientColor="#eef3ff", lightColor="#fff1d6", sunDir=[0.45, 0.65, 0.35], stars=0.0, cityLights=0.0, lamps=0.0, signals=1.0, headlights=0.0)
DUSK = dict(env="dusk", envI=0.45, skyTop="#3d5fa8", skyHorizon="#ffb38a", skyBottom="#2c2a2a", light=0.65, ambient=0.2,
            ambientColor="#ffd9c0", lightColor="#ffb070", sunDir=[-0.3, 0.18, -0.9], stars=0.0, cityLights=0.4, lamps=0.6)
ROOM = dict(set="rooms", env="day", envI=0.5, power=1.0, daylight=0.35, offline=0.0, board=0.0, backup=0.0, exposure=0.88, bloom=0.3, mkPeople=0.0)
OFF = [0, -60, 0]
ICON = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#fff0c8" stop-opacity=".9"/><stop offset="1" stop-color="#ffcf70" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><circle cy="-30" r="58" fill="none" stroke="#fff" stroke-width="16"/><path d="M0 28 L0 110 M-36 72 L36 72" stroke="#fff" stroke-width="16" stroke-linecap="round" stroke-dasharray="14 12"/>'''


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
    # S1 0-7.4 POV kitchen, your wife at the counter
    v.key(0, 0, **mix(ROOM, GRADE, exposure=0.92, bloom=0.35, daylight=0.6, wifePos=[179.7, 0, -1.35], wifeRot=3.1416, wifeMode="talk", wifeFace=7.0,
                     vanishWomen=9.15, wifeVanish=9.15, crashAt=17.0, dof=0.3, focus=2.6, fov=52, bob=0.2))
    v.path(0, 7.4, [[181.6, 1.72, 2.0], [181.1, 1.7, 1.3]], [[179.6, 1.3, -1.6], [179.7, 1.35, -1.5]])
    v.hands(0, "hidden", 0, item="none")
    v.key(5.2, 0.6, wifeRot=0.6, wifeFace=0.0)
    # S2 7.4-11 she turns, starts a sentence, and vanishes
    v.path(7.4, 11.0, [[181.1, 1.7, 1.3], [180.9, 1.68, 1.0]], [[179.7, 1.45, -1.3], [179.6, 1.3, -1.6]])
    talk(v, "wife", 7.6, 1.5, "l1_wife")
    v.sfx("music/vanish", 9.05, 0.6)
    # S3 11-15.5 the kitchen from the corner: you, alone
    v.key(11.0, 0, meMPos=[179.7, 0, -0.5], meMRot=0.5, meMMode="panic", meMFace=3.0, dof=0.25, focus=2.5, fov=50, bob=0.0)
    v.path(11.0, 15.5, [[182.1, 2.2, 2.2], [182.0, 2.0, 1.8]], [[179.8, 0.9, -1.0], [179.9, 1.0, -1.2]])
    # S4 15.5-20.5 street, low angle: frozen men, a car without a driver crashes
    v.key(15.5, 0, **mix(DAY, GRADE, set="street", traffic=0.0, streetMood="shock", meMPos=OFF, dof=0.0, fov=58, bob=0.0))
    v.path(15.5, 20.5, [[1.6, 0.9, -1], [1.2, 1.0, -3], [0.4, 1.2, -5]], [[9, 1.4, -12], [5, 1.3, -16], [-2.5, 1.0, -14]])
    v.sfx("music/crash", 16.95, 0.9)
    # S5 20.5-25.5 POV street: your friend runs up
    v.key(20.5, 0, himPos=[7.6, SW, 0.4], himRot=0.4, himMode="panic", himFace=5.0, dof=0.35, focus=1.6, fov=52, bob=0.15)
    v.path(20.5, 25.5, [[8.6, E, 2.2], [8.8, E, 1.8]], [[7.4, 1.7, 0.2], [6.8, 1.6, -2]])
    talk(v, "him", 21.2, 2.6, "l2_him")
    # S6 25.5-30 a Thai beach at the same second
    v.key(25.5, 0, set="resort", env="day", envI=0.5, skyTop="#2a78e4", skyHorizon="#9fd8ff", skyBottom="#3f8fbf", fogFar=4200, light=0.75, ambient=0.26,
          sunDir=[0.35, 0.7, 0.45], vanishWomen=25.8, lookAt=27.0, himPos=OFF, dof=0.25, focus=8, fov=56, waveOn=0.0, siren=0.0, ash=0.0, floodZ=-999.0)
    v.path(25.5, 30.0, [[7, 2.6, 38], [5, 2.5, 33], [3, 2.6, 28]], [[0, 0.6, 20], [-3, 0.8, 12], [-6, 1.5, -20]])
    v.sfx("music/vanish", 25.7, 0.6)
    # S7 30-35 hospital: the doctor, an empty bed
    v.key(30.0, 0, **mix(ROOM, docPos=[-0.3, 0, -1.3], docRot=0.55, docMode="talk", docFace=5.0, dof=0.3, focus=2.2, fov=48))
    v.path(30.0, 35.0, [[1.8, 1.65, 1.6], [1.5, 1.6, 1.25]], [[-0.3, 1.5, -1.3], [-0.6, 1.3, -1.6]])
    talk(v, "doc", 31.0, 2.6, "l3_doc")
    v.sfx("music/beep", 30.2, 0.25)
    # S8 35-39.5 classroom: no teacher
    v.key(35.0, 0, docPos=OFF, teacher=1.0, dof=0.25, focus=4, fov=52)
    v.path(35.0, 39.5, [[423.5, 1.6, 3.6], [422, 1.5, 2.8]], [[418, 0.8, -3], [418.5, 0.9, -3.5]])
    # S9 39.5-44.5 street: a little boy looks up at you
    v.key(39.5, 0, **mix(DAY, GRADE, set="street", streetMood="shock", boyPos=[8.0, SW, 0.2], boyRot=0.2, boyMode="cry", boyFace=5.0, dof=0.4, focus=1.5, fov=50))
    v.path(39.5, 44.5, [[8.4, E, 1.6], [8.35, E - 0.1, 1.35]], [[8.0, 0.9, 0.1], [8.0, 0.95, 0.15]])
    talk(v, "boy", 40.2, 2.1, "l4_boy")
    v.key(42.4, 0.6, boyMode="idle", boyFace=5.0)
    # S10 44.5-49.5 living room: dads with crying babies
    v.key(44.5, 0, **mix(ROOM, boyPos=OFF, dadBabies=1.0, meMPos=[301.6, 0, -0.6], meMRot=-2.4, meMMode="cradle", meMBaby=1.0, meMFace=5.0,
                         himPos=[298.6, 0, 0.4], himRot=2.3, himMode="walk", himBaby=1.0, himFace=3.0, dof=0.2, focus=3, fov=52))
    v.path(44.5, 49.5, [[302.4, 1.7, 2.4], [301.8, 1.65, 2.0]], [[300, 1.0, -1.5], [299.8, 1.1, -1.8]])
    v.ambient("music/babies", 44.5, 49.6, 0.35, 0.4)
    # S11 49.5-54 the maternity ward: empty cribs
    v.key(49.5, 0, meMPos=OFF, himPos=OFF, dadBabies=0.0, nurseryBabies=0.0, dof=0.35, focus=3.0, fov=50, exposure=0.9, bloom=0.2, daylight=0.0)
    v.path(49.5, 54.0, [[483.8, 1.6, 2.6], [482.4, 1.45, 1.6]], [[476.4, 0.75, -2], [476.8, 0.8, -2.2]])
    # S12 54-59 drone over the quiet street at dusk
    v.key(54.0, 0, **mix(DUSK, GRADE, set="street", streetMood="calm", traffic=0.0, crashAt=17.0, dof=0.0, fov=55, mblur=0.3))
    v.path(54.0, 59.0, [[0, 16, 10], [2, 24, -2], [3, 30, -14]], [[0, 0, -30], [0, 0, -50], [0, 0, -70]])
    # S13 59-67.5 twist: the artificial womb
    v.key(59.0, 0, **mix(ROOM, biobag=1.0, mice=0.0, dof=0.45, focus=2.6, fov=50, mblur=0.0, daylight=0.0, exposure=0.95, bloom=0.25))
    v.path(59.0, 67.5, [[365.4, 1.9, 1.3], [364.4, 1.7, 0.4], [362.6, 1.7, 0.6]], [[362.8, 1.1, -2.6], [362.7, 1.2, -2.6], [362.6, 1.15, -2.6]])
    v.sfx("music/heartbeat", 60.0, 0.35); v.sfx("music/heartbeat", 63.0, 0.3)
    # S14 67.5-72 POV, the empty kitchen
    v.key(67.5, 0, **mix(ROOM, GRADE, exposure=0.85, bloom=0.3, daylight=0.45, wifePos=OFF, dof=0.3, focus=2.6, fov=52, bob=0.15))
    v.path(67.5, 72.0, [[181.6, 1.72, 2.0], [181.0, 1.7, 1.2]], [[179.6, 1.2, -1.6], [179.6, 1.1, -1.8]])

    v.widget(0, 9.15, "WOMEN ON EARTH", "SATURDAY · 9:00 AM", "text", value="4 BILLION")
    v.widget(9.15, 30.0, "WOMEN ON EARTH", "9:01 AM", "text", value="0")
    v.widget(30.0, 49.5, "WOMEN ON EARTH", "DAY 1", "text", value="0")
    v.widget(49.5, 59.0, "BABIES BORN", "SINCE THAT MORNING", "text", value="0")
    v.widget(59.0, 67.5, "ARTIFICIAL WOMB", "PHILADELPHIA · 2017", "text", value="4 WEEKS")
    v.widget(67.5, 72.0, "WOMEN ON EARTH", "", "text", value="?")

    m = "music/"
    v.ambient(m + "morning", 0, 9.1, 0.42, 0.05)
    v.ambient(m + "kitchen", 0, 9.1, 0.35, 0.05)
    v.ambient(m + "drone", 9.1, 25.6, 0.5, 0.3)
    v.ambient(m + "quietcity", 15.5, 25.5, 0.35, 0.5)
    v.ambient(m + "tense", 25.5, 44.6, 0.45, 0.8)
    v.ambient(m + "sad", 44.5, 59.1, 0.5, 0.8)
    v.ambient(m + "hope", 59.0, 67.6, 0.5, 0.6)
    v.ambient(m + "sad", 67.5, 75.0, 0.4, 0.8, offset=20)
    for t in (11.0, 15.5, 20.5, 25.5, 30.0, 35.0, 39.5, 44.5, 49.5, 54.0, 59.0, 67.5):
        v.sfx("whoosh-short", t, 0.18)
