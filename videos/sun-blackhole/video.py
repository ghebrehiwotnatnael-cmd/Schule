"""What if the Sun turned into a black hole for 5 seconds?  Noon on a Thai beach with Kai, countdown, nothing happens;
cut to space: the Sun collapses; ride the edge of the last sunlight past Mercury and Venus to Earth (8 min 20 s, compressed);
back on the beach: 5 seconds of night at noon, then the Sun is back.  Twist: you always see the Sun as it was 8 minutes ago.
No voice lines, one music build, live widget, red centre countdowns."""
TITLE = "What if the Sun turned into a black hole for 5 seconds?"
TITLE_KEY = "black hole"
KEY_COLOR = "#ff9a3c"
SUB = "A BLACK HOLE WITH THE SUN'S MASS WOULD BE ONLY ABOUT 6 KM WIDE\nSAME MASS, SAME GRAVITY: EARTH WOULD STAY IN ITS ORBIT"
CTA = ""
END_ASK = "What should we try next?"
END_ASK2 = "COMMENT BELOW ↓"
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 64.0
END_CARD = 4.5
END_STYLE = "title"
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_models.js", "sets_people.js", "sets_resort.js", "sets_life.js", "sets_sky.js"]
WORLD_DEFAULTS = {"eruptAt": 999.0, "erupt2At": 999.0, "lookAt": 999.0, "panicAt": 999.0, "fleeAt": 999.0, "stairsAt": 999.0,
                  "roofAt": 999.0, "roofMood": "", "siren": 0.0, "waveOn": 0.0, "floodZ": -999.0, "floodY": -5.0, "ash": 0.0,
                  "gravity": 1.0, "planeOn": 0.0, "chroma": 0.0, "crack": 0.0, "talk": "",
                  "friendPos": [0, -60, 0], "womanPos": [0, -60, 0], "staffPos": [0, -60, 0], "kaiPos": [0, -60, 0], "poolGirlPos": [0, -60, 0],
                  "issOn": 0.0, "issDrop": 0.0, "cables": 0.0, "laser": 0.0, "spaceMoon": 0.0, "shockI": 0.0, "goldDot": 0.0, "bloom": 0.55,
                  "cloudColor": "#ffffff", "ringSky": 0.0, "ringShadow": 0.0, "stars": 0.0, "sunDisc": 0.0, "earthRing": 0.0, "ringRocks": 0.0,
                  "sunOn": 1.0, "bh": 0.0, "front": 0.0, "shell": 0.0, "dust": 0.0}

CAPTIONS = [
    (3.4, 5.8, "Noon. Thailand. Perfect day."),
    (6.0, 8.6, "The Sun is about to collapse..."),
    (8.8, 10.9, "...into a black hole."),
    (11.2, 13.2, "And... nothing happens?"),
    (13.4, 15.0, "The sky is still bright."),
    (15.4, 18.0, "Up there, the Sun is gone."),
    (18.4, 21.6, "Same mass. Only 6 km wide."),
    (22.4, 25.4, "But its last light still flies."),
    (25.8, 29.0, "Darkness chases it at light speed."),
    (29.4, 32.6, "3 minutes: Mercury goes dark."),
    (33.2, 36.4, "6 minutes: Venus goes dark."),
    (36.8, 39.4, "8 min 20 s: Earth."),
    (40.3, 42.6, "Noon. Pitch black. Stars."),
    (42.8, 44.8, "Everyone screams."),
    (45.4, 47.8, "And the Sun is back."),
    (48.2, 51.2, "Earth never left its orbit."),
    (51.6, 54.6, "Same mass. Same gravity."),
    (55.2, 58.0, "Plot twist: you always see the past."),
    (58.4, 61.0, "This Sun is 8 minutes old."),
    (61.4, 64.0, "Is it even still there?"),
]

SAND, EYE = 0.3, 1.65
E = SAND + EYE
SUN = [0.25, 0.6, -0.75]
SUNP = [250, 600, -750]
KAI = [1.0, SAND, 4.5]
DAY = dict(set="resort", env="day", envI=0.5, skyTop="#2a78e4", skyHorizon="#9fd8ff", skyBottom="#3f8fbf", fogFar=4200,
           light=0.8, ambient=0.26, ambientColor="#e6f2ff", lightColor="#fff1d6", sunDir=SUN, sunDisc=1.0, stars=0.0, cloudColor="#ffffff",
           tonemap=1.0, exposure=1.02, contrast=1.12, saturation=1.3, warmth=0.06, vignette=0.26, grain=0.02, bloom=0.6)
DARK = dict(env="night", envI=0.35, skyTop="#03040f", skyHorizon="#141c44", skyBottom="#060a1c", light=0.0, ambient=0.38,
            ambientColor="#8fa2ff", lightColor="#8fa2ff", sunDisc=0.0, stars=1.0, cloudColor="#141a36", exposure=1.1, saturation=1.25, warmth=-0.04, bloom=0.75)
ICON = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#ffe0b0" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><ellipse rx="128" ry="30" fill="none" stroke="#ffd08a" stroke-width="16" transform="rotate(-12)"/><circle r="58" fill="#000"/>
<circle r="62" fill="none" stroke="#fff3d6" stroke-width="6"/>'''


def mix(*ds, **kw):
    out = {}
    for d in ds:
        out.update(d)
    out.update(kw)
    return out


def build(v):
    v.title_until(3.2, ICON)
    # ================= SHOT A (0-15): noon on the beach, countdown, nothing happens
    v.key(0, 0, **mix(DAY, dof=0.2, focus=4.0, fov=58, bob=0.1, shake=0.0, kaiPos=KAI, kaiRot=2.82, kaiMode="idle", kaiFace=0.0))
    v.hands(0, "hidden", 0, item="none")
    v.path(0, 6.0, [[0, E, 8.2], [0.3, E, 7.4]], [[0, 12, -200], [SUNP[0] * 0.4, SUNP[1] * 0.4, SUNP[2] * 0.4]])
    v.key(6.0, 5.0, fov=48)
    v.key(11.0, 0, shake=0.35, chroma=0.5)
    v.key(11.1, 1.0, shake=0.0, chroma=0.0)
    v.key(11.4, 0.6, kaiRot=0.3, kaiMode="talk", kaiFace=0.0)
    v.path(11.0, 13.6, [[0.3, E, 7.4], [0.6, E, 7.9]], [[SUNP[0] * 0.4, SUNP[1] * 0.4, SUNP[2] * 0.4], [1.0, 1.9, 4.5]])
    v.key(11.0, 2.0, fov=56, dof=0.3, focus=3.2)
    v.bigcount(6.0, 11.0, "SUN BECOMES A BLACK HOLE IN", 5, 0)
    # ================= SHOT B (15-22): the Sun collapses into a black hole
    v.key(15.0, 0, set="solar", sunOn=1.0, bh=0.0, front=0.0, shell=0.0, dust=0.0, dof=0.0, fov=50, bob=0.0, shake=0.0, bloom=0.8,
          exposure=1.0, contrast=1.1, saturation=1.25, warmth=0.04, vignette=0.3, chroma=0.0)
    v.key(15.6, 1.8, sunOn=0.0)
    v.key(16.4, 0.2, shake=0.5, chroma=0.6)
    v.key(16.7, 1.4, shake=0.0, chroma=0.0)
    v.key(16.8, 2.0, bh=1.0)
    v.path(15.0, 22.0, [[-140, 40, 260], [-90, 22, 150], [-40, 14, 90], [30, 14, 26]], [[0, 0, 0], [0, 0, 0], [60, 0, 0], [380, -4, 40]])
    # ================= SHOT C (22-38): ride the edge of the last sunlight to Mercury, Venus, Earth
    v.key(22.0, 0, front=70.0, shell=1.0, dust=1.0)
    v.key(22.01, 7.49, front=389.0, lin=True)
    v.key(29.5, 4.0, front=726.0, lin=True)
    v.key(33.5, 3.5, front=1000.0, lin=True)
    v.key(37.0, 1.0, front=1050.0, lin=True)
    v.key(22.0, 0, camPos=[30, 14, 26], camLook=[380, -4, 40])
    v.key(22.01, 7.49, camPos=[345, 10, 14], lin=True)
    v.key(22.01, 7.49, camLook=[395, -4, 40])
    v.key(29.5, 4.0, camPos=[680, 16, -30], lin=True)
    v.key(30.0, 2.0, camLook=[730, 10, -62])
    v.key(33.5, 3.5, camPos=[946, 9, 26], lin=True)
    v.key(34.0, 2.0, camLook=[1000, 0, 0])
    v.key(37.0, 1.0, camPos=[950, 8, 24])
    # ================= SHOT D (38-55): back on the beach; the darkness arrives, 5 s of night at noon, the Sun returns
    v.key(38.0, 0, **mix(DAY, set="resort", dof=0.25, focus=2.4, fov=60, bob=0.0, shake=0.0, kaiPos=KAI, kaiRot=2.82, kaiMode="point", kaiFace=0.0))
    v.path(38.0, 45.0, [[0.4, 0.55, 6.6], [0.5, 0.6, 6.9]], [[25, 60.5, -68.6], [20, 50, -70]])
    v.key(40.0, 0.12, **DARK)
    v.key(40.0, 0, panicAt=40.2, shake=0.4)
    v.key(40.2, 1.5, shake=0.08)
    v.key(40.3, 0.5, kaiRot=0.4, kaiMode="panic", kaiFace=4.0)
    v.bigcount(40.0, 45.0, "SUNLIGHT RETURNS IN", 5, 0)
    v.key(45.0, 0.15, **mix(DAY, bloom=1.4, exposure=1.25, chroma=0.7, shake=0.3, roofMood="relief"))
    v.key(45.3, 1.4, bloom=0.6, exposure=1.02, chroma=0.0, shake=0.0)
    v.key(45.4, 0.6, kaiMode="cheer", kaiFace=7.0)
    v.path(45.0, 55.0, [[0.5, 0.6, 6.9], [1.4, 2.6, 11], [3.0, 8.0, 20]], [[20, 50, -70], [0, 3, -60]])
    v.key(46.0, 3.0, dof=0.0, fov=58)
    # ================= twist (55-64): back up to the Sun
    v.path(55.0, 64.0, [[3.0, 8.0, 20], [3.4, 10, 23]], [[0, 3, -60], SUNP])
    v.key(57.0, 7.0, fov=44)

    # widget: the light delay
    v.widget(0, 11.0, "SUNLIGHT TRAVEL TIME", "150 MILLION KM", "sec", 500, 500)
    v.widget(11.0, 22.0, "DARKNESS REACHES EARTH IN", "THE SUN IS ALREADY GONE", "sec", 500, 465)
    v.widget(22.0, 29.5, "DARKNESS REACHES EARTH IN", "MERCURY: 3 MIN 13 S", "sec", 465, 306)
    v.widget(29.5, 33.5, "DARKNESS REACHES EARTH IN", "VENUS: 6 MIN 1 S", "sec", 306, 138)
    v.widget(33.5, 38.0, "DARKNESS REACHES EARTH IN", "EARTH: 8 MIN 20 S", "sec", 138, 0)
    v.widget(38.0, 40.0, "DARKNESS REACHES EARTH IN", "EARTH: 8 MIN 20 S", "sec", 0, 0)
    v.widget(40.0, 45.0, "NIGHT AT NOON", "THE SUN IS BACK ALREADY", "sec", 5, 0)
    v.widget(45.0, 55.0, "EARTH'S ORBIT", "SAME MASS · SAME GRAVITY", "text", value="UNCHANGED")
    v.widget(55.0, 64.0, "THE SUN YOU SEE IS", "MINUTES OLD", "sec", 500, 500)

    # sound
    m = "music/"
    v.ambient(m + "tense", 0, 40.0, 0.55, 0.05)
    v.ambient(m + "beach", 0, 15.0, 0.35, 0.05)
    v.sfx(m + "collapse", 15.5, 0.9)
    v.ambient(m + "rush", 22.0, 38.0, 0.35, 1.0)
    v.ambient(m + "beach", 38.0, 40.0, 0.35, 0.3, offset=6)
    v.sfx(m + "gasp", 40.05, 0.9)
    v.sfx(m + "sunback", 44.95, 0.8)
    v.ambient(m + "epic", 45.0, 68.5, 0.55, 0.05)
    v.ambient(m + "beach", 45.0, 64.0, 0.3, 0.6, offset=12)
    for t in (15.0, 22.0, 38.0):
        v.sfx("whoosh", t - 0.15, 0.3)
