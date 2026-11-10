"""What if Earth had rings like Saturn?  One-take escalation (2 cuts): Thai beach with Kai, a giant ring arch in the sky,
the ring's shadow, a bright night, drone up into the sky -> Earth with its ring from space -> back to the beach at sunset (twist:
Earth probably had a ring 466 million years ago).  No voice lines, one music track, live widget."""
TITLE = "What if Earth had rings like Saturn?"
TITLE_KEY = "rings"
KEY_COLOR = "#ffd58a"
SUB = "21 CRATERS FROM 466 MILLION YEARS AGO ALL LIE NEAR THE EQUATOR OF THAT TIME\nA FALLING RING WOULD EXPLAIN IT (TOMKINS ET AL., 2024)"
CTA = ""
END_ASK = "What should we try next?"
END_ASK2 = "COMMENT BELOW ↓"
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 62.0
END_CARD = 4.5
END_STYLE = "title"
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_models.js", "sets_people.js", "sets_resort.js", "sets_life.js", "sets_sky.js"]
WORLD_DEFAULTS = {"eruptAt": 999.0, "erupt2At": 999.0, "lookAt": 999.0, "panicAt": 999.0, "fleeAt": 999.0, "stairsAt": 999.0,
                  "roofAt": 999.0, "siren": 0.0, "waveOn": 0.0, "floodZ": -999.0, "floodY": -5.0, "ash": 0.0,
                  "gravity": 1.0, "planeOn": 0.0, "chroma": 0.0, "crack": 0.0, "talk": "",
                  "friendPos": [0, -60, 0], "womanPos": [0, -60, 0], "staffPos": [0, -60, 0], "kaiPos": [0, -60, 0], "poolGirlPos": [0, -60, 0],
                  "issOn": 0.0, "issDrop": 0.0, "cables": 0.0, "laser": 0.0, "spaceMoon": 0.0, "shockI": 0.0, "goldDot": 0.0, "bloom": 0.55,
                  "cloudColor": "#ffffff", "ringSky": 0.0, "ringShadow": 0.0, "ringLat": 20.0, "stars": 0.0, "sunDisc": 0.0, "earthRing": 0.0, "ringRocks": 0.0}

CAPTIONS = [
    (3.4, 5.8, "Thailand. You look up."),
    (6.0, 8.8, "A giant ring across the sky."),
    (9.2, 12.0, "Earth has rings. Like Saturn."),
    (12.4, 15.0, "Ice and rock. 7,000 km wide."),
    (15.4, 18.2, "Then its shadow falls on you."),
    (18.6, 21.4, "Winters get even colder."),
    (22.0, 24.6, "Night falls..."),
    (25.0, 28.4, "...but it never gets truly dark."),
    (28.8, 31.8, "The ring glows all night long."),
    (32.2, 35.6, "Brighter than any full moon."),
    (36.4, 39.2, "From space: Earth wears a ring."),
    (39.6, 42.6, "Satellites? They'd get shredded."),
    (43.0, 47.4, "Billions of chunks of ice."),
    (48.4, 51.0, "Plot twist: it really happened."),
    (51.4, 54.6, "466 million years ago."),
    (55.0, 58.0, "21 craters near the old equator."),
    (58.4, 62.0, "Would you want them back?"),
]

SAND, EYE = 0.3, 1.65
E = SAND + EYE
DAY = dict(set="resort", env="day", envI=0.5, skyTop="#2a78e4", skyHorizon="#9fd8ff", skyBottom="#3f8fbf", fogFar=4200,
           light=0.75, ambient=0.26, ambientColor="#e6f2ff", lightColor="#fff1d6", sunDir=[0.35, 0.7, 0.45],
           tonemap=1.0, exposure=1.02, contrast=1.12, saturation=1.3, warmth=0.06, vignette=0.26, grain=0.02, bloom=0.55)
NIGHT = dict(env="night", envI=0.45, skyTop="#0a1450", skyHorizon="#3552a8", skyBottom="#0c1d48", light=0.32, ambient=0.34,
             ambientColor="#a9bcff", lightColor="#c9d8ff", sunDir=[-0.1, 0.8, -0.6], exposure=1.08, saturation=1.35, warmth=-0.02, stars=1.0, bloom=0.7, cloudColor="#6f7fc0")
DUSK = dict(set="resort", env="dusk", envI=0.55, skyTop="#3b3f9a", skyHorizon="#ff9a5e", skyBottom="#5a3a6a", fogFar=4200,
            light=0.8, ambient=0.3, ambientColor="#ffd9c7", lightColor="#ffb27a", sunDir=[-0.3, 0.12, -1.0],
            tonemap=1.0, exposure=1.03, contrast=1.12, saturation=1.32, warmth=0.1, vignette=0.28, grain=0.02, bloom=0.65, stars=0.0, cloudColor="#ffd2c0")
ICON = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#fff1d0" stop-opacity=".9"/><stop offset="1" stop-color="#ffd58a" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><circle r="62" fill="#5aa0ff"/><path d="M-62 0 a62 62 0 0 0 124 0" fill="#2f6fd6"/>
<ellipse rx="140" ry="34" fill="none" stroke="#fff" stroke-width="14" transform="rotate(-18)"/><path d="M-62 -6 a62 62 0 0 1 124 0" fill="#5aa0ff" transform="rotate(-18)"/>'''


def mix(*ds, **kw):
    out = {}
    for d in ds:
        out.update(d)
    out.update(kw)
    return out


def build(v):
    v.title_until(3.2, ICON)
    # ================= SHOT A (0-36): one take on the beach, the arch, its shadow, night, drone up into the sky
    v.key(0, 0, **mix(DAY, ringSky=1.0, ringShadow=0.0, dof=0.25, focus=4.0, fov=58, bob=0.12, shake=0.0,
                     kaiPos=[1.0, SAND, 4.5], kaiRot=3.1416, kaiMode="idle", kaiFace=0.0))
    v.hands(0, "hidden", 0, item="none")
    v.path(0, 9.0, [[0, E, 8.0], [0.2, E, 7.7], [0.3, E, 7.4]], [[300, 25, -500], [600, 200, -400], [200, 330, -600], [0, 300, -600]])
    v.key(4.0, 1.0, kaiMode="point", kaiFace=4.0)
    v.key(9.0, 0, dof=0.3, focus=3.0, bob=0.0)
    v.path(9.0, 16.0, [[0.3, E, 7.4], [2.0, 1.2, 7.6], [2.6, 0.75, 7.9]], [[0, 300, -600], [-30, 30, -60]])
    v.key(9.5, 0.8, kaiRot=3.6, kaiMode="point", kaiFace=4.0)
    v.key(13.6, 0.7, kaiRot=0.44, kaiMode="cheer", kaiFace=7.0)
    # 15-21: the ring's shadow sweeps over the beach (light and sky dim, cooler)
    v.key(15.2, 3.0, light=0.38, ambient=0.2, skyTop="#2357b0", skyHorizon="#7fb2e0", lightColor="#dfe8ff", ringShadow=0.25, warmth=0.0)
    v.key(16.2, 0.6, kaiMode="idle", kaiFace=3.0)
    v.path(16.0, 22.0, [[2.6, 0.75, 7.9], [2.2, 3.5, 10.0], [1.0, 8.0, 14.0]], [[-30, 30, -60], [500, 330, -900]])
    # 22-30 time-lapse into the night, the arch keeps shining; 22-36 drone up over the resort
    v.key(22.0, 6.0, **mix(NIGHT, ringShadow=0.6))
    v.key(22.0, 0, dof=0.0, fov=60, kaiMode="cheer", kaiFace=7.0)
    v.path(22.0, 36.0, [[1.0, 8.0, 14.0], [-2, 24, 30], [-8, 80, 52], [-16, 200, 80], [-24, 380, 110]],
           [[500, 330, -900], [700, 420, -1000], [500, 520, -1200], [-200, 560, -1300], [-600, 520, -1200]])
    # ================= SHOT B (36-48): Earth with its ring from space, then right into the ring
    v.key(36.0, 0, set="space", earthSun=1.0, earthLights=0.6, earthIce=0.0, earthTilt=0.41, earthRot=1.6, spaceFov=40,
          spaceCam=[-6, 22, 62], earthRing=1.0, ringRocks=1.0, dof=0.0, bloom=0.6, shake=0.0)
    v.key(36.01, 7.0, spaceCam=[-34, 9, 38], earthRot=1.75)
    v.key(43.0, 5.0, spaceCam=[-0.5, 1.2, 26.5], earthRot=1.9, spaceFov=55)
    # ================= SHOT C (48-62): back on the beach at sunset, Kai, the golden arch
    v.key(48.0, 0, **mix(DUSK, ringSky=1.0, ringShadow=0.15, earthRing=0.0, dof=0.3, focus=2.6, fov=56, bob=0.08,
                         kaiPos=[1.0, SAND, 4.8], kaiRot=0.5, kaiMode="talk", kaiFace=7.0))
    v.path(48.0, 53.0, [[3.2, E, 7.4], [2.9, E, 7.7]], [[1.0, 1.9, 4.8], [0.9, 2.0, 4.7]])
    v.path(53.0, 62.0, [[2.9, E, 7.7], [2.0, E, 8.6], [0.8, E, 9.8]], [[0.9, 2.0, 4.7], [400, 330, -700]])
    v.key(52.0, 0.8, kaiRot=3.1416, kaiMode="point", kaiFace=4.0)
    v.key(58.0, 0.8, kaiRot=0.4, kaiMode="cheer", kaiFace=7.0)

    # widget
    v.widget(0, 12.4, "RING WIDTH", "STARTS 1,300 KM ABOVE YOU", "text", value="7,000 KM")
    v.widget(12.4, 22.0, "RING SHADOW", "WINTER HEMISPHERE", "text", value="COLDER")
    v.widget(22.0, 36.0, "NIGHT SKY", "LIT BY THE RING", "text", value="NEVER DARK")
    v.widget(36.0, 48.0, "DANGER ZONE", "ORBITS 1,300–8,300 KM UP", "text", value="BLOCKED")
    v.widget(48.0, 54.6, "EARTH'S OWN RING", "YEARS AGO", "count", 0, 466000000)
    v.widget(54.6, 62.0, "EARTH'S OWN RING", "YEARS AGO", "count", 466000000, 466000000)

    # sound: one music track, beach ambience, shimmer on the reveal
    m = "music/"
    v.ambient(m + "main", 0, 66.5, 0.55, 0.05)
    v.ambient(m + "beach", 0, 22.5, 0.35, 0.05)
    v.sfx(m + "shimmer", 4.0, 0.6)
    v.ambient(m + "night", 22.0, 36.0, 0.35, 1.5)
    v.ambient("wind", 28.0, 36.0, 0.2, 1.5)
    v.ambient("space", 36.0, 48.0, 0.3, 0.4)
    v.ambient(m + "beach", 48.0, 62.0, 0.3, 0.8, offset=8)
    v.sfx(m + "shimmer", 51.3, 0.4)
    for t in (36.0, 48.0):
        v.sfx("whoosh", t - 0.15, 0.3)
