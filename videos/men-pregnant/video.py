"""What if men got pregnant instead of women?  Personal POV (you are a man), humorous, 3 voice lines, ~74 s + title end card."""
TITLE = "What if men got pregnant?"
TITLE_KEY = "pregnant"
KEY_COLOR = "#8ee3ef"
SUB = "MALE SEAHORSES CARRY THE BABIES\nAND GIVE BIRTH TO UP TO 2,000 AT ONCE"
CTA = ""
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 74.0
END_CARD = 3.0
END_STYLE = "title"
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_models.js", "sets_models2.js", "sets_rooms.js", "sets_people.js", "sets_resort.js", "sets_life.js"]
WORLD_DEFAULTS = {"crowd": 0.0, "mkPeople": 0.0, "traffic": 1.0, "cars": 1.0, "power": 1.0, "moon": 0.0,
                  "vanishMen": 999.0, "vanishWomen": 999.0, "crashAt": 999.0, "streetMood": "calm", "talk": "",
                  "eruptAt": 999.0, "erupt2At": 999.0, "lookAt": 999.0, "panicAt": 999.0, "fleeAt": 999.0, "stairsAt": 999.0, "roofAt": 999.0,
                  "friendPos": [0, -60, 0], "womanPos": [0, -60, 0], "staffPos": [0, -60, 0],
                  "wifePos": [0, -60, 0], "himPos": [0, -60, 0], "docFPos": [0, -60, 0], "meMPos": [0, -60, 0],
                  "menBelly": 0.0, "mice": 0.0, "biobag": 0.0, "ultra": 0.0, "tv": 0.0, "boardgame": 0.0, "candles": 0.0, "bloom": 0.5,
                  "family": 0.0, "patient": 0.0, "seahorseBirth": 0.0}

CAPTIONS = [
    (3.4, 5.6, "Tuesday morning."),
    (5.8, 7.4, "Two lines."),
    (7.6, 10.7, "“Wait... you're pregnant?!”"),
    (12.4, 16.2, "Week 6: morning sickness. Yours."),
    (17.0, 21.2, "In this world, men carry babies."),
    (22.2, 25.1, "“Bro, you're literally glowing.”"),
    (27.0, 30.8, "Month 5: pickles with ice cream."),
    (31.4, 35.6, "Month 6: you hear the heartbeat."),
    (36.4, 40.6, "Dad yoga is a thing now."),
    (41.4, 45.2, "Month 8: no more flying."),
    (45.9, 50.2, "Month 9: where are your feet?"),
    (50.9, 54.6, "Then, one evening: it's time."),
    (56.2, 58.6, "“Congratulations. It's a girl!”"),
    (61.8, 64.3, "Plot twist: some dads really do this."),
    (64.5, 66.9, "Male seahorses carry the babies."),
    (67.1, 69.3, "Up to 2,000 at once."),
    (70.0, 73.8, "Would you do it for 9 months?"),
]

SW = 0.18
E = SW + 1.65
GRADE = dict(tonemap=1.0, exposure=1.0, contrast=1.1, saturation=1.28, warmth=0.07, vignette=0.25, grain=0.02, bloom=0.5)
DAY = dict(env="day", envI=0.4, skyTop="#2f7fe0", skyHorizon="#a9d4ff", skyBottom="#4b6a3a", light=0.75, ambient=0.22,
           ambientColor="#eef3ff", lightColor="#fff1d6", sunDir=[0.45, 0.65, 0.35], stars=0.0, cityLights=0.0, lamps=0.0, signals=1.0, headlights=0.0)
NIGHT = dict(env="night", envI=0.4, skyTop="#0a1440", skyHorizon="#2a3a7a", skyBottom="#07080a", light=0.0, ambient=0.18,
             ambientColor="#8296d4", sunDir=[0.2, 0.5, -0.6], stars=0.4, cityLights=1.0, lamps=1.0, signals=1.0, headlights=1.0)
ROOM = dict(set="rooms", env="day", envI=0.5, power=1.0, daylight=0.35, offline=0.0, board=0.0, backup=0.0, exposure=0.88, bloom=0.3, mkPeople=0.0)
OFF = [0, -60, 0]
ICON = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#d9fbff" stop-opacity=".9"/><stop offset="1" stop-color="#8ee3ef" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><rect x="-22" y="-110" width="44" height="220" rx="18" fill="#fff"/><rect x="-12" y="-40" width="24" height="56" fill="#9fb6c9"/>
<rect x="-10" y="-30" width="20" height="7" fill="#e0245e"/><rect x="-10" y="-8" width="20" height="7" fill="#e0245e"/>'''


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
    # S1 0-7 POV kitchen: the test
    v.key(0, 0, **mix(ROOM, GRADE, exposure=0.92, bloom=0.35, daylight=0.6, menBelly=0.0, dof=0.45, focus=0.5, fov=50, bob=0.1))
    v.path(0, 7.0, [[180.8, 1.7, 1.2], [180.75, 1.66, 1.1]], [[180.7, 1.2, 0.5], [180.6, 1.15, 0.45]])
    v.hands(0, "hold", 0, item="test")
    # S2 7-12 your partner walks in
    v.key(7.0, 0, wifePos=[179.0, 0, 0.0], wifeRot=1.2, wifeMode="talk", wifeFace=2.0, dof=0.3, focus=1.8, fov=52)
    v.vpath("wifePos", 7.0, 9.0, [[178.4, 0, -0.6], [179.4, 0, 0.3], [179.9, 0, 0.6]])
    v.path(7.0, 12.0, [[180.8, 1.7, 1.2], [181.1, 1.7, 1.5]], [[179.6, 1.5, 0.1], [180.0, 1.55, 0.6]])
    talk(v, "wife", 7.6, 3.1, "l1_partner")
    v.key(10.7, 0.5, wifeMode="hug", wifeFace=7.0, wifeRot=1.0)
    v.hands(10.7, "hold_low", 0.4)
    # S3 12-16.5 the kitchen from the side: you at the sink, she rubs your back
    v.key(12.0, 0, meMPos=[180.6, 0, -1.45], meMRot=3.1416, meMMode="sick", meMFace=5.0, meMBelly=0.15, wifePos=[180.0, 0, -1.1], wifeRot=2.4, wifeMode="talk", wifeFace=0.0,
          dof=0.25, focus=2.4, fov=50, bob=0.0)
    v.hands(12.0, "hidden", 0, item="none")
    v.path(12.0, 16.5, [[182.0, 1.9, 0.8], [181.9, 1.8, 0.5]], [[180.4, 1.1, -1.5], [180.3, 1.0, -1.6]])
    # S4 16.5-21.5 POV street: pregnant men everywhere
    v.key(16.5, 0, **mix(DAY, GRADE, set="street", streetMood="calm", traffic=1.0, menBelly=1.0, meMPos=OFF, wifePos=OFF, dof=0.15, focus=6, fov=54, bob=0.4))
    v.path(16.5, 21.5, [[8.6, E, 14], [8.7, E, 6]], [[7, 2.0, -10], [6, 2.1, -30]])
    # S5 21.5-26.5 office: your colleague
    v.key(21.5, 0, **mix(ROOM, himPos=[243.4, 0, 1.6], himRot=0.85, himMode="talk", himFace=7.0, himBelly=0.8, dof=0.3, focus=1.8, fov=50, bob=0.0))
    v.path(21.5, 26.5, [[245.0, 1.72, 3.0], [244.6, 1.7, 2.6]], [[243.2, 1.6, 1.4], [242.8, 1.5, 0.8]])
    talk(v, "him", 22.2, 2.9, "l2_colleague")
    # S6 26.5-31 POV night kitchen: cravings
    v.key(26.5, 0, **mix(ROOM, himPos=OFF, daylight=0.0, exposure=0.85, fridge=1.0, dof=0.4, focus=0.6, fov=50))
    v.path(26.5, 31.0, [[181.4, 1.7, 0.4], [181.6, 1.68, -0.2]], [[182.0, 1.2, -1.8], [182.0, 1.1, -2.0]])
    v.hands(26.5, "hold", 0.3, item="cone")
    # S7 31-36 ultrasound: you on the bed, the heartbeat
    v.key(31.0, 0, **mix(ROOM, fridge=0.0, ultra=1.0, meMPos=[-1.2, 0.66, -0.55], meMRot=0.0, meMMode="lieBed", meMFace=7.0, meMBelly=0.75,
                         wifePos=[-0.15, 0, -1.4], wifeRot=-1.6, wifeMode="talk", wifeFace=7.0, docFPos=[-2.15, 0, -1.2], docFRot=1.5, docFMode="point", docFFace=0.0,
                         dof=0.25, focus=2.6, fov=50))
    v.hands(31.0, "hidden", 0, item="none")
    v.path(31.0, 36.0, [[0.9, 2.3, 0.9], [0.7, 2.2, 0.6]], [[-1.2, 0.8, -1.5], [-1.1, 0.85, -1.7]])
    for t in (31.6, 32.5, 33.4, 34.3, 35.2):
        v.sfx("music/heartbeat", t, 0.4)
    # S8 36-41 resort beach: dad yoga
    v.key(36.0, 0, set="resort", env="day", envI=0.5, skyTop="#2a78e4", skyHorizon="#9fd8ff", skyBottom="#3f8fbf", fogFar=4200, light=0.75, ambient=0.26,
          sunDir=[0.35, 0.7, 0.45], menBelly=1.0, meMPos=OFF, wifePos=OFF, docFPos=OFF, ultra=0.0, dof=0.25, focus=8, fov=56, waveOn=0.0, siren=0.0, ash=0.0, floodZ=-999.0,
          exposure=1.0, bloom=0.5)
    v.path(36.0, 41.0, [[7, 2.6, 38], [5, 2.4, 33], [3, 2.2, 28]], [[0, 0.6, 20], [-3, 0.7, 14], [-6, 1.0, 4]])
    # S9 41-45.5 airport
    v.key(41.0, 0, **mix(ROOM, board=0.0, dof=0.15, focus=10, fov=56))
    v.path(41.0, 45.5, [[60, 1.7, 9], [59, 1.8, 4]], [[60, 3.2, -20], [60, 3.6, -20]])
    # S10 45.5-50.5 living room: month 9 on the couch
    v.key(45.5, 0, meMPos=[300.6, 0.05, -2.0], meMRot=0.0, meMMode="sit", meMFace=1.0, meMBelly=1.0, wifePos=[299.4, 0, -0.9], wifeRot=1.1, wifeMode="talk", wifeFace=7.0,
          family=0.0, dof=0.3, focus=3.2, fov=50)
    v.path(45.5, 50.5, [[301.6, 1.5, 1.6], [301.2, 1.45, 1.2]], [[300.4, 0.9, -1.8], [300.5, 0.8, -1.9]])
    # S11 50.5-55 night street: running to the hospital
    v.key(50.5, 0, **mix(DAY, GRADE, env="dusk", skyTop="#3d5fa8", skyHorizon="#ffb38a", lightColor="#ffb070", sunDir=[-0.3, 0.18, -0.9], light=0.65, cityLights=0.5, lamps=0.8, set="street", traffic=0.6, menBelly=1.0, streetMood="calm", meMPos=[7.8, SW, -6], meMRot=0.0, meMMode="run", meMFace=4.0, meMBelly=1.0,
                         wifePos=[8.8, SW, -5], wifeRot=0.0, wifeMode="run", wifeFace=3.0, dof=0.2, focus=4, fov=54, bob=0.3))
    v.vpath("meMPos", 50.5, 55.0, [[7.8, SW, -8], [7.9, SW, -1]])
    v.vpath("wifePos", 50.5, 55.0, [[8.9, SW, -7.2], [8.9, SW, 0]])
    v.path(50.5, 55.0, [[8.4, 1.5, 3], [8.4, 1.5, 5]], [[8.2, 1.2, -4], [8.3, 1.3, -1]])
    # S12 55-61.5 delivery room: it's a girl
    v.key(55.0, 0, **mix(ROOM, daylight=0.3, meMPos=[-1.2, 0.66, -0.55], meMRot=0.0, meMMode="lieBed", meMFace=7.0, meMBelly=0.0,
                         docFPos=[0.25, 0, -1.3], docFRot=0.3, docFMode="cradle", docFBaby=1.0, docFFace=0.0, wifePos=[-2.15, 0, -0.9], wifeRot=2.0, wifeMode="cry", wifeFace=5.0,
                         dof=0.3, focus=2.0, fov=48, bob=0.0))
    v.path(55.0, 61.5, [[0.9, 2.2, 1.0], [0.7, 2.1, 0.7]], [[-0.6, 1.0, -1.0], [-0.7, 1.0, -1.2]])
    v.sfx("music/newborn", 55.3, 0.55)
    talk(v, "docF", 56.2, 2.4, "l3_doc_j2")
    v.key(58.8, 0.8, wifeMode="cheer", wifeFace=7.0)
    # S13 61.5-69.5 twist: seahorse dads
    v.key(61.5, 0, **mix(ROOM, daylight=0.0, exposure=1.0, bloom=0.6, meMPos=OFF, docFPos=OFF, wifePos=OFF, seahorseBirth=0.0, dof=0.4, focus=2.6, fov=50))
    v.key(64.0, 4.0, seahorseBirth=1.0)
    v.path(61.5, 69.5, [[539.6, 2.1, 1.0], [538.9, 2.0, -0.4], [538.4, 2.0, -0.9]], [[537.2, 1.9, -3.4], [537.1, 1.9, -3.4], [537.2, 2.0, -3.4]])
    v.sfx("music/bubbles", 64.0, 0.4)
    # S14 69.5-74 the three of you
    v.key(69.5, 0, **mix(ROOM, daylight=0.45, exposure=0.92, bloom=0.4, seahorseBirth=0.0, meMPos=[300.2, 0, -0.6], meMRot=0.2, meMMode="cradle", meMBaby=1.0, meMFace=7.0, meMBelly=0.0,
                         wifePos=[299.5, 0, -0.75], wifeRot=0.6, wifeMode="hug", wifeFace=7.0, family=0.0, dof=0.3, focus=2.2, fov=48))
    v.path(69.5, 74.0, [[300.8, 1.55, 1.7], [300.5, 1.5, 1.3]], [[300.0, 1.3, -0.6], [300.0, 1.35, -0.7]])

    v.widget(0, 12.0, "PREGNANT", "WEEK", "text", value="4")
    v.widget(12.0, 21.5, "PREGNANT", "WEEK", "text", value="6")
    v.widget(21.5, 26.5, "PREGNANT", "WEEK", "text", value="14")
    v.widget(26.5, 31.0, "PREGNANT", "MONTH", "text", value="5")
    v.widget(31.0, 41.0, "PREGNANT", "MONTH", "text", value="6")
    v.widget(41.0, 45.5, "PREGNANT", "MONTH", "text", value="8")
    v.widget(45.5, 55.0, "PREGNANT", "MONTH", "text", value="9")
    v.widget(55.0, 61.5, "BABY", "3:12 AM", "text", value="GIRL")
    v.widget(61.5, 69.5, "SEAHORSE DAD", "BABIES PER BIRTH", "text", value="UP TO 2,000")
    v.widget(69.5, 74.0, "DAD", "DAY 1", "text", value="♥")

    m = "music/"
    v.ambient(m + "acoustic", 0, 12.1, 0.42, 0.05)
    v.ambient(m + "kitchen", 0, 12.0, 0.3, 0.3)
    v.ambient(m + "comedy", 12.0, 31.1, 0.45, 0.6)
    v.ambient(m + "city", 16.5, 21.5, 0.3, 0.4)
    v.ambient(m + "office", 21.5, 26.5, 0.35, 0.4)
    v.ambient(m + "quirky", 36.0, 50.6, 0.42, 0.6)
    v.ambient(m + "lullaby", 31.0, 36.1, 0.35, 0.5)
    v.ambient(m + "piano", 50.5, 61.6, 0.5, 0.8, offset=10)
    v.ambient(m + "lullaby", 61.5, 77.0, 0.45, 0.8, offset=8)
    for t in (12.0, 16.5, 21.5, 26.5, 31.0, 36.0, 41.0, 45.5, 50.5, 55.0, 61.5, 69.5):
        v.sfx("whoosh-short", t, 0.18)
