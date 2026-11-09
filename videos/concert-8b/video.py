"""What if 8 billion people came to The Weeknd's concert?  One-take zoom-out (2 cuts): stage -> stadium -> city -> region,
then Earth from space, then back to the stage for the drop.  Live audience counter, synthwave music, no voice lines."""
TITLE = "What if 8 billion people came to The Weeknd's concert?"
TITLE_KEY = "8 billion"
KEY_COLOR = "#ff4d5e"
SUB = "AT 4 PEOPLE PER M² ALL OF HUMANITY FITS IN A CIRCLE 51 KM WIDE\nSOUND NEEDS 75 S TO REACH THE LAST ROW · 100 W OF BODY HEAT PER PERSON"
CTA = ""
END_ASK = "Which artist should we try next?"
END_ASK2 = "COMMENT BELOW ↓"
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 66.0
END_CARD = 4.5
END_STYLE = "title"
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_models.js", "sets_people.js", "sets_concert.js"]
WORLD_DEFAULTS = {"audience": 0.0, "heat": 0.0, "jump": 0.0, "beams": 1.0, "artistMode": "sing", "artistFace": 6.0, "camFar": 4000.0, "camNear": 0.05,
                  "fogFar": 3000.0, "goldDot": 0.0, "goldLat": 43.65, "goldLon": -79.38, "chroma": 0.0, "crack": 0.0, "bloom": 0.6,
                  "cables": 0.0, "laser": 0.0, "spaceMoon": 0.0, "issOn": 0.0, "shockI": 0.0}

CAPTIONS = [
    (3.6, 6.0, "Toronto. One show. Doors open."),
    (6.2, 9.4, "The stadium fills: 80,000 fans."),
    (10.4, 13.4, "Full. But they keep coming."),
    (14.0, 17.4, "3.5 million people in the streets."),
    (18.0, 21.4, "Every street. Every park."),
    (22.0, 25.4, "100 million. Biggest crowd ever."),
    (26.0, 29.4, "Their body heat builds a cloud."),
    (30.0, 33.4, "1.5 billion. Past the horizon."),
    (34.0, 37.2, "8.3 billion. Every human on Earth."),
    (37.4, 39.8, "51 km wide. Smaller than Luxembourg."),
    (40.6, 43.6, "From space: one golden dot."),
    (44.0, 46.6, "All of humanity. In one place."),
    (47.6, 51.0, "The last row hears him 75 s late."),
    (51.4, 54.6, "830 gigawatts of body heat."),
    (56.2, 58.6, "Then the drop. Everyone jumps."),
    (59.0, 62.4, "Like a magnitude-5 earthquake."),
    (63.0, 66.0, "8 billion people. One concert. Would you go?"),
]

SR = 75.0
AY = 2.4 + 1.1 * 1.65          # artist eye height on the stage
STAGEZ = -SR + 14
DUSK = dict(set="concert", env="dusk", envI=0.55, skyTop="#2b2d6e", skyHorizon="#ff8a5c", skyBottom="#3a2a3a", light=0.8, ambient=0.3,
            ambientColor="#ffd9c7", lightColor="#ffb27a", sunDir=[-0.5, 0.25, -0.8],
            tonemap=1.0, exposure=1.02, contrast=1.12, saturation=1.3, warmth=0.08, vignette=0.3, grain=0.02, bloom=0.6)
ICON = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#ffd0d6" stop-opacity=".9"/><stop offset="1" stop-color="#ff4d5e" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><rect x="-26" y="-110" width="52" height="96" rx="26" fill="#fff"/><path d="M-50 -30 Q-50 40 0 40 Q50 40 50 -30" stroke="#fff" stroke-width="14" fill="none"/>
<path d="M0 40 L0 100 M-36 100 L36 100" stroke="#fff" stroke-width="14" stroke-linecap="round"/>'''


def mix(*ds, **kw):
    out = {}
    for d in ds:
        out.update(d)
    out.update(kw)
    return out


def build(v):
    v.title_until(3.2, ICON)
    # ===== SHOT A (0-40): one take, from the stage out to 60 km altitude
    v.key(0, 0, **mix(DUSK, audience=0.0, heat=0.0, jump=0.0, beams=1.0, artistMode="micstand", artistFace=6.0, camFar=4000.0, fogFar=3000.0,
                     dof=0.35, focus=3.4, fov=50, shake=0.0, bob=0.0))
    v.hands(0, "hidden", 0, item="none")
    v.key(3.0, 9.0, audience=80000.0)
    v.key(12.0, 6.0, audience=3500000.0)
    v.key(18.0, 6.0, audience=100000000.0)
    v.key(24.0, 8.0, audience=1500000000.0)
    v.key(32.0, 6.0, audience=8300000000.0)
    v.key(26.0, 4.0, heat=1.0)
    v.key(9.0, 0.5, dof=0.0)
    v.key(11.0, 4.0, camNear=0.6)
    v.key(15.0, 6.0, camNear=4.0)
    v.key(14.0, 8.0, camFar=40000.0, fogFar=40000.0)
    v.key(24.0, 14.0, camFar=500000.0, fogFar=600000.0, camNear=60.0)
    v.path(0, 10.0, [[0.7, AY + 0.1, STAGEZ + 2.8], [1.2, 5, STAGEZ + 18], [0, 14, -10], [0, 34, 40]],
           [[0, AY, STAGEZ], [0, AY, STAGEZ], [0, 2, STAGEZ + 10], [0, 0, -20]])
    v.path(10.0, 24.0, [[0, 34, 40], [0, 160, 220], [0, 700, 1300], [0, 1600, 3000]], [[0, 0, -20], [0, 0, 0], [0, 0, 0], [0, 0, 0]])
    v.path(24.0, 40.0, [[0, 1600, 3000], [0, 7000, 14000], [0, 22000, 40000], [0, 42000, 70000]], [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]])
    # ===== SHOT B (40-47): Earth from space, a golden dot on Toronto
    v.key(40.0, 0, set="space", earthSun=1.0, earthLights=0.5, earthIce=0.0, earthTilt=0.3, earthRot=-0.185, spaceFov=40, spaceCam=[0, 9, 30],
          goldDot=1.0, heat=0.0, camFar=4000.0, camNear=0.05, bloom=0.7)
    v.key(40.01, 7.0, spaceCam=[0, 8, 24], earthRot=-0.15, lin=True)
    # ===== SHOT C (47-66): back at the stage; the countdown to the drop, everyone jumps
    v.key(47.0, 0, **mix(DUSK, audience=8300000000.0, goldDot=0.0, heat=0.6, camFar=4000.0, fogFar=3000.0, camNear=0.05, artistMode="belt", artistFace=6.0,
                         dof=0.3, focus=4.5, fov=52, bloom=0.65))
    v.path(47.0, 56.0, [[-2.2, 3.4, STAGEZ + 9], [-1.0, 3.8, STAGEZ + 5.5], [0.5, 4.0, STAGEZ + 3.6]], [[0, AY + 0.3, STAGEZ], [0, AY + 0.1, STAGEZ], [0, AY, STAGEZ]])
    v.key(51.0, 0, artistMode="micstand")
    v.bigcount(53.0, 56.0, "THE DROP IN", 3, 0)
    v.key(56.0, 0.1, jump=1.0, shake=0.8, chroma=0.9, artistMode="jump", artistFace=7.0)
    v.key(56.3, 1.2, shake=0.25, chroma=0.0)
    v.path(56.0, 66.0, [[0.5, 4.0, STAGEZ + 3.6], [3, 9, STAGEZ + 26], [6, 22, STAGEZ + 60]], [[0, AY, STAGEZ], [0, 2, STAGEZ + 20], [0, 1, STAGEZ + 50]])
    v.key(62.0, 1.5, shake=0.0)

    # widget: live audience counter
    v.widget(0, 3.0, "AUDIENCE", "TORONTO · LIVE", "count", 0, 0)
    v.widget(3.0, 12.0, "AUDIENCE", "STADIUM: 80,000 SEATS", "count", 0, 80000)
    v.widget(12.0, 18.0, "AUDIENCE", "LAST ROW HEARS IT 1.6 S LATE", "count", 80000, 3500000)
    v.widget(18.0, 24.0, "AUDIENCE", "LAST ROW HEARS IT 8 S LATE", "count", 3500000, 100000000)
    v.widget(24.0, 32.0, "AUDIENCE", "LAST ROW HEARS IT 32 S LATE", "count", 100000000, 1500000000)
    v.widget(32.0, 40.0, "AUDIENCE", "CROWD: 51 KM WIDE", "count", 1500000000, 8300000000)
    v.widget(40.0, 47.0, "AUDIENCE", "EVERY HUMAN ON EARTH", "count", 8300000000, 8300000000)
    v.widget(47.0, 56.0, "AUDIENCE", "LAST ROW HEARS IT 75 S LATE", "count", 8300000000, 8300000000)
    v.widget(56.0, 66.0, "SEISMOGRAPH", "8.3 BILLION PEOPLE JUMP", "text", value="M 4.9")

    m = "music/"
    v.ambient(m + "synth", 0, 47.2, 0.5, 0.05)
    v.ambient(m + "roar", 3.0, 18.0, 0.45, 1.0)
    v.ambient(m + "wind", 24.0, 40.0, 0.3, 1.0)
    v.ambient("space", 40.0, 47.0, 0.25, 0.4)
    v.ambient(m + "synth2", 47.0, 70.5, 0.55, 0.4)
    v.ambient(m + "chant", 47.0, 56.0, 0.4, 0.6)
    v.sfx(m + "quake", 55.95, 1.0)
    v.ambient(m + "roar", 56.0, 66.0, 0.5, 0.4)
    for t in (40.0, 47.0):
        v.sfx("whoosh", t - 0.15, 0.3)
