"""What if all men disappeared?  Personal POV (you are a woman), no narrator, 3 voice lines, ~78 s + title end card."""
TITLE = "What if all men disappeared?"
TITLE_KEY = "men"
KEY_COLOR = "#ffb3c7"
SUB = "ABOUT 95% OF AIRLINE PILOTS ARE MEN\nIN 2018 SCIENTISTS BRED HEALTHY MICE WITH TWO MOTHERS"
CTA = ""
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 78.0
END_CARD = 3.0
END_STYLE = "title"
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_models.js", "sets_models2.js", "sets_rooms.js", "sets_people.js", "sets_resort.js", "sets_life.js"]
WORLD_DEFAULTS = {"crowd": 0.0, "mkPeople": 0.0, "traffic": 1.0, "cars": 1.0, "power": 1.0, "moon": 0.0,
                  "vanishMen": 999.0, "vanishWomen": 999.0, "crashAt": 999.0, "streetMood": "normal", "talk": "",
                  "eruptAt": 999.0, "erupt2At": 999.0, "lookAt": 999.0, "panicAt": 999.0, "fleeAt": 999.0, "stairsAt": 999.0, "roofAt": 999.0,
                  "friendPos": [0, -60, 0], "womanPos": [0, -60, 0], "staffPos": [0, -60, 0],
                  "herPos": [0, -60, 0], "meFPos": [0, -60, 0], "docFPos": [0, -60, 0],
                  "mice": 1.0, "biobag": 0.0, "ultra": 0.0, "tv": 0.0, "boardgame": 0.0, "candles": 0.0, "bloom": 0.5}

CAPTIONS = [
    (3.4, 5.6, "Monday. 7:59 AM."),
    (5.8, 8.0, "Just another morning."),
    (8.6, 11.8, "8:00. Every man vanishes."),
    (13.2, 14.8, "“Where did everyone go?!”"),
    (15.2, 17.6, "Cars keep rolling. Nobody driving."),
    (18.2, 22.0, "Crash after crash. Worldwide."),
    (22.8, 26.6, "Same second. Every beach. Every city."),
    (27.2, 31.2, "About 95% of pilots were men."),
    (31.8, 35.6, "Half the desks: suddenly empty."),
    (36.4, 40.4, "“Nearly every pilot and truck driver has vanished.”"),
    (41.2, 45.2, "But 9 in 10 nurses are women."),
    (45.8, 50.2, "Day 3. Everyone learns new jobs."),
    (50.8, 54.8, "Half the class is gone."),
    (55.4, 59.2, "In 9 months: the last babies."),
    (59.8, 61.2, "Weeks later. Life goes on."),
    (61.6, 64.6, "“We'll figure it out. We always do.”"),
    (65.8, 68.2, "Plot twist: science is already there."),
    (68.4, 71.0, "2018: healthy mice with two mothers."),
    (71.2, 73.8, "No father needed."),
    (74.3, 77.8, "Who would you miss first?"),
]

SW = 0.18                     # street sidewalk height
E = SW + 1.65
GRADE = dict(tonemap=1.0, exposure=1.0, contrast=1.1, saturation=1.25, warmth=0.05, vignette=0.25, grain=0.02, bloom=0.5)
DAY = dict(env="day", envI=0.4, skyTop="#2f7fe0", skyHorizon="#a9d4ff", skyBottom="#4b6a3a", light=0.75, ambient=0.22,
           ambientColor="#eef3ff", lightColor="#fff1d6", sunDir=[0.45, 0.65, 0.35], stars=0.0, cityLights=0.0, lamps=0.0, signals=1.0, headlights=0.0)
DUSK = dict(env="dusk", envI=0.45, skyTop="#3d5fa8", skyHorizon="#ffb38a", skyBottom="#2c2a2a", light=0.65, ambient=0.2,
            ambientColor="#ffd9c0", lightColor="#ffb070", sunDir=[-0.3, 0.18, -0.9], stars=0.0, cityLights=0.4, lamps=0.6)
ROOM = dict(set="rooms", env="day", envI=0.5, power=1.0, daylight=0.35, offline=0.0, board=0.0, backup=0.0, exposure=0.88, bloom=0.3, mkPeople=0.0)
OFF = [0, -60, 0]
ICON = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#ffe0ea" stop-opacity=".9"/><stop offset="1" stop-color="#ffb3c7" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><circle cy="-20" r="62" fill="none" stroke="#fff" stroke-width="16"/><path d="M28 -66 L80 -118 M52 -118 L80 -118 L80 -90" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round" stroke-dasharray="14 12"/>'''


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
    # S1 0-8 POV morning walk on a busy sidewalk with your friend
    v.key(0, 0, **mix(DAY, GRADE, set="street", traffic=1.0, jam=0.0, panic=0.0, lookUp=0.0, streetMood="normal", vanishMen=8.3, crashAt=11.2,
                     dof=0.3, focus=4.0, fov=54, bob=0.4, herMode="walk", herFace=7.0, herRot=3.1416))
    v.path(0, 8.0, [[8.6, E, 14], [8.7, E, 8], [8.8, E, 3]], [[7, 2.2, -10], [6, 2.4, -30], [5, 2.5, -45]])
    v.vpath("herPos", 0, 8.0, [[7.6, SW, 12.6], [7.6, SW, 6.6], [7.7, SW, 1.6]])
    v.hands(0, "hold_low", 0, item="phone", phoneUI="feed")
    v.key(8.0, 0, herMode="idle")
    # S2 8-13 low wide angle from the road: men vanish in bursts of light, a driverless car rolls into a wreck
    v.key(8.0, 0, traffic=0.0, dof=0.0, fov=58, bob=0.0, herPos=OFF)
    v.path(8.0, 13.0, [[1.6, 0.9, -1], [1.2, 1.0, -3], [0.4, 1.2, -5]], [[9, 1.4, -12], [6, 1.3, -16], [-2.5, 1.0, -14]])
    v.hands(8.0, "hidden", 0, item="none")
    v.sfx("music/vanish", 8.2, 0.8)
    v.sfx("music/crash", 11.15, 0.9)
    # S3 13-18 POV: your friend turns to you
    v.key(13.0, 0, streetMood="shock", herPos=[7.5, SW, 0.6], herRot=0.5, herMode="panic", herFace=3.0, dof=0.35, focus=1.6, fov=52, bob=0.15)
    v.path(13.0, 18.0, [[8.6, E, 2.2], [8.7, E, 1.9], [9.0, E, 1.4]], [[7.3, 1.65, 0.4], [6.5, 1.7, -3], [2, 1.4, -14]])
    talk(v, "her", 13.3, 1.3, "l1_her")
    v.key(15.5, 1.0, herMode="phone", herFace=2.0, herRot=3.1416)
    # S4 18-22.5 drone over the street: wrecks and smoke
    v.key(18.0, 0, dof=0.0, fov=55, bob=0.0, mblur=0.0, herPos=OFF)
    v.path(18.0, 22.5, [[0, 18, 8], [2, 26, -4], [3, 32, -16]], [[0, 0, -30], [0, 0, -50], [0, 0, -70]])
    # S5 22.5-27 a Thai beach at the same second
    v.key(22.5, 0, set="resort", env="day", envI=0.5, skyTop="#2a78e4", skyHorizon="#9fd8ff", skyBottom="#3f8fbf", fogFar=4200, light=0.75, ambient=0.26,
          sunDir=[0.35, 0.7, 0.45], vanishMen=22.9, lookAt=24.3, mblur=0.0, dof=0.25, focus=8, fov=56, waveOn=0.0, siren=0.0, ash=0.0, floodZ=-999.0)
    v.path(22.5, 27.0, [[7, 2.6, 38], [5, 2.5, 33], [3, 2.6, 28]], [[0, 0.6, 20], [-3, 0.8, 12], [-6, 1.5, -20]])
    v.sfx("music/vanish", 22.8, 0.7)
    # S6 27-31.5 airport: every flight cancelled
    v.key(27.0, 0, **mix(ROOM, board=1.0, dof=0.15, focus=10, fov=56))
    v.path(27.0, 31.5, [[60, 1.7, 9], [60, 1.9, 4]], [[60, 4.2, -20], [60, 5.2, -20]])
    # S7 31.5-36 office: half the chairs empty
    v.path(31.5, 36.0, [[247, 1.7, 3.2], [244.5, 1.6, 1.6]], [[236, 0.9, -6], [236, 0.9, -7]])
    v.key(31.5, 0, dof=0.2, focus=6, fov=52)
    # S8 36-41 living room: you on the couch, the news
    v.key(36.0, 0, tv=1.0, tvAnchor="f", tvHeadline="EVERY MAN HAS VANISHED", tvTicker="PILOTS · TRUCK DRIVERS · FIREFIGHTERS · BUILDERS · MINERS · ",
          meFPos=[300.8, 0.05, -2.0], meFRot=0.0, meFMode="sit", meFFace=2.0, dof=0.35, focus=4.8, fov=50, daylight=0.45)
    v.path(36.0, 41.0, [[301.5, 1.45, -2.75], [301.2, 1.4, -2.6]], [[300, 1.4, 2.9], [299.9, 1.45, 2.9]])
    talk(v, "anchor", 36.5, 3.5, "l2_anchor_tv", 0.95)
    # S9 41-45.5 hospital: the nurses keep everyone alive
    v.key(41.0, 0, tv=0.0, meFPos=OFF, docFPos=[-2.3, 0, -1.3], docFRot=1.3, docFMode="talk", docFFace=1.0, dof=0.3, focus=3, fov=48, daylight=0.55)
    v.path(41.0, 45.5, [[1.8, 1.6, 1.7], [1.4, 1.5, 1.2]], [[-1.2, 0.9, -1.6], [-1.2, 0.9, -1.8]])
    v.sfx("music/beep", 41.2, 0.25)
    # S10 45.5-50.5 street, day 3: everyone pitches in
    v.key(45.5, 0, **mix(DAY, GRADE, set="street", streetMood="organize", traffic=0.0, docFPos=OFF, dof=0.15, focus=10, fov=54, bob=0.25))
    v.path(45.5, 50.5, [[-8.6, 1.83, -18], [-8.5, 1.83, -24], [-8.2, 1.9, -30]], [[2, 1.2, -36], [3, 1.3, -44], [2, 1.5, -56]])
    # S11 50.5-55 classroom: half the class is gone
    v.key(50.5, 0, **mix(ROOM, teacher=1.0, dof=0.25, focus=4, fov=52, bob=0.0))
    v.path(50.5, 55.0, [[423.5, 1.6, 3.6], [422, 1.5, 2.8]], [[418, 0.8, -3], [418.5, 0.9, -3.5]])
    # S12 55-59.5 maternity: the last babies
    v.key(55.0, 0, nurseryBabies=1.0, dof=0.4, focus=3.0, fov=50, exposure=0.9, bloom=0.2, daylight=0.0)
    v.path(55.0, 59.5, [[479.6, 1.5, 1.2], [478.6, 1.3, 0.3]], [[476.4, 0.75, -2], [476.6, 0.75, -2]])
    v.ambient("music/babies", 55.0, 59.5, 0.2, 0.6)
    # S13 59.5-65.5 street at sunset, weeks later: your friend
    v.key(59.5, 0, **mix(DUSK, GRADE, set="street", streetMood="calm", crashAt=999.0, traffic=0.25, herPos=[7.6, SW, -1.2], herRot=0.3, herMode="talk", herFace=0.0,
                         dof=0.35, focus=2.0, fov=52, bob=0.2))
    v.path(59.5, 65.5, [[9.2, E, 2.5], [8.9, E, 1.4]], [[7.5, 1.6, -1.4], [6.5, 1.7, -4]])
    talk(v, "her", 61.6, 2.4, "l3_her")
    v.key(64.0, 0.6, herFace=7.0)
    # S14 65.5-74 twist: the mouse lab
    v.key(65.5, 0, **mix(ROOM, mice=1.0, herPos=OFF, dof=0.45, focus=2.8, fov=50, bob=0.0, daylight=0.0, exposure=0.95, bloom=0.2))
    v.path(65.5, 74.0, [[357.2, 1.8, 0.4], [357.8, 1.6, -0.3], [359.4, 1.7, 0.2]], [[358.6, 1.0, -2.6], [358.6, 1.0, -2.6], [361.5, 1.3, -2.6]])
    # S15 74-78 back to the busy morning sidewalk (loops to the start)
    v.key(74.0, 0, **mix(DAY, GRADE, set="street", vanishMen=999.0, crashAt=999.0, streetMood="normal", traffic=1.0, dof=0.3, focus=4.0, fov=54, bob=0.4,
                         herPos=[7.6, SW, 13.6], herMode="walk", herFace=7.0, herRot=3.1416))
    v.path(74.0, 78.0, [[8.6, E, 17], [8.6, E, 14]], [[7, 2.2, -8], [7, 2.2, -10]])
    v.vpath("herPos", 74.0, 78.0, [[7.6, SW, 15.6], [7.6, SW, 12.6]])
    v.hands(74.0, "hold_low", 0, item="phone", phoneUI="feed")

    # widget
    v.widget(0, 8.3, "MEN ON EARTH", "MONDAY · 7:59 AM", "text", value="4.1 BILLION")
    v.widget(8.3, 22.5, "MEN ON EARTH", "8:00 AM", "text", value="0")
    v.widget(22.5, 45.5, "MEN ON EARTH", "DAY 1", "text", value="0")
    v.widget(45.5, 59.5, "MEN ON EARTH", "DAY 3", "text", value="0")
    v.widget(59.5, 65.5, "MEN ON EARTH", "WEEK 6", "text", value="0")
    v.widget(65.5, 74.0, "MICE WITH 2 MOMS", "CHINA · 2018", "text", value="NO DAD")
    v.widget(74.0, 78.0, "MEN ON EARTH", "", "text", value="4.1 BILLION")

    m = "music/"
    v.ambient(m + "morning", 0, 8.35, 0.45, 0.05)
    v.ambient(m + "city", 0, 8.35, 0.4, 0.05)
    v.ambient(m + "drone", 8.3, 22.6, 0.5, 0.3)
    v.ambient(m + "quietcity", 8.3, 22.5, 0.35, 0.5)
    v.ambient(m + "tense", 22.5, 45.6, 0.45, 0.8)
    v.ambient(m + "hope", 45.5, 65.6, 0.5, 1.0, offset=4)
    v.ambient(m + "quietcity", 45.5, 50.5, 0.25, 0.5, offset=5)
    v.ambient(m + "science", 65.5, 74.1, 0.45, 0.6)
    v.ambient(m + "morning", 74.0, 81.0, 0.4, 0.6, offset=10)
    v.ambient(m + "city", 74.0, 81.0, 0.3, 0.6)
    for t in (13.0, 18.0, 22.5, 27.0, 31.5, 36.0, 41.0, 45.5, 50.5, 55.0, 59.5, 65.5, 74.0):
        v.sfx("whoosh-short", t, 0.18)
