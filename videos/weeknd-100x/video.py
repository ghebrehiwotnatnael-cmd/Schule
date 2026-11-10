"""What if The Weeknd grew 100 times bigger?  One-take escalation in downtown Toronto at golden hour: you are in the front row
of a street show, the star grows 2x, 5x, 10x (crowd runs), 25x, 50x, 100x next to the CN Tower; his voice turns into infrasound,
his heart can't pump blood up to his brain, he kneels and blacks out.  Twist: the square-cube law, giants can't exist.
No voice lines, one synthwave build, live widget, beat every 3 s."""
TITLE = "What if The Weeknd grew 100 times bigger?"
TITLE_KEY = "100 times"
KEY_COLOR = "#ff4d5e"
SUB = "100X TALLER MEANS 1,000,000X HEAVIER BUT ONLY 10,000X STRONGER BONES\nHIS VOICE WOULD DROP FROM ~300 HZ TO ~3 HZ, BELOW HUMAN HEARING"
CTA = ""
END_ASK = "Who should we make giant next?"
END_ASK2 = "COMMENT BELOW ↓"
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 64.0
END_CARD = 4.5
END_STYLE = "title"
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_models.js", "sets_people.js", "sets_giant.js"]
WORLD_DEFAULTS = {"starScale": 1.0, "starMode": "sing", "starFace": 7.0, "starTalk": "on", "starFill": 1.0, "crowdRun": 0.0, "crowdCheer": 0.6,
                  "crowdJump": 0.2, "crowdFilm": 0.3, "stepAt": -99.0, "nearMood": "cheer", "windowsLit": 0.35, "screens": 1.0,
                  "chroma": 0.0, "crack": 0.0, "shake": 0.0, "bob": 0.0, "camNear": 0.05, "boards": 1.0}

CAPTIONS = [
    (3.4, 5.6, "Toronto. You're in the front row."),
    (5.8, 8.2, "Then he starts to grow."),
    (8.6, 11.0, "2x. 5x. The crowd steps back."),
    (11.4, 14.2, "10x: six floors tall."),
    (14.6, 17.6, "He weighs 70 tonnes now."),
    (18.0, 20.8, "As much as the biggest dinosaur."),
    (21.2, 23.4, "And he doesn't stop."),
    (23.6, 26.6, "50x: every step a small quake."),
    (26.8, 29.8, "100x: 185 metres tall."),
    (30.2, 33.0, "Heavier than the Titanic."),
    (33.4, 35.8, "A third of the CN Tower."),
    (36.4, 39.4, "He sings. You hear nothing."),
    (39.8, 42.8, "His voice is now infrasound."),
    (43.2, 46.6, "You feel it in your chest."),
    (48.2, 51.0, "His heart can't reach his brain."),
    (51.4, 54.2, "Blood must climb 40 metres."),
    (54.6, 57.2, "He blacks out."),
    (57.8, 60.8, "Plot twist: giants can't exist."),
    (61.0, 64.0, "Would you still go to his show?"),
]

FACE = 175.0          # his eye height at 100x
DUSK = dict(set="toronto", env="dusk", envI=0.6, skyTop="#3b3f9a", skyHorizon="#ff9a5e", skyBottom="#5a3a6a", fogFar=5200, camFar=8000,
            light=0.95, ambient=0.34, ambientColor="#ffd9c7", lightColor="#ffb27a", sunDir=[-0.8, 0.25, 0.35],
            tonemap=1.0, exposure=1.04, contrast=1.12, saturation=1.32, warmth=0.08, vignette=0.28, grain=0.02, bloom=0.62)
ICON = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#ffd0d6" stop-opacity=".9"/><stop offset="1" stop-color="#ff4d5e" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><rect x="-14" y="10" width="28" height="70" fill="#fff"/><rect x="-46" y="-120" width="92" height="130" rx="10" fill="#fff"/>
<text x="0" y="-38" text-anchor="middle" font-family="Georgia" font-size="58" fill="#ff4d5e">×100</text>'''


def mix(*ds, **kw):
    out = {}
    for d in ds:
        out.update(d)
    out.update(kw)
    return out


def beat(v, t, size=0.5, chroma=0.35):
    """a growth beat: camera kick + colour split + sound"""
    v.key(t, 0.08, shake=size, chroma=chroma)
    v.key(t + 0.1, 0.9, shake=0.0, chroma=0.0)
    v.sfx("music/grow", t - 0.05, 0.8)
    v.sfx("impact-bass-1", t, 0.5)


def build(v):
    v.title_until(3.2, ICON)
    v.key(0, 0, **mix(DUSK, starScale=1.0, starMode="sing", starFace=7.0, nearMood="cheer", dof=0.32, focus=7.5, fov=56))
    v.hands(0, "hidden", 0, item="none")
    # ================= A (0-8.5): front row, he starts to grow
    v.path(0, 8.5, [[0.8, 1.65, -1.2], [0.6, 1.65, -1.8], [0.4, 1.7, -3.0]], [[0, 2.3, 6], [0, 3.4, 6], [0, 6.5, 6]])
    v.key(5.8, 2.4, starScale=2.5)
    beat(v, 5.8)
    v.key(6.2, 0, starTalk="off", starMode="idle", starFace=2.0, nearMood="awe", crowdCheer=0.15, crowdFilm=0.8, crowdJump=0.0)
    v.key(5.8, 2.6, focus=10.0)
    # ================= B (8.5-21): 5x, 10x, the crowd runs, a stomp
    v.key(8.6, 1.4, starScale=5.0)
    beat(v, 8.6)
    v.key(9.4, 0, nearMood="panic")
    v.key(11.0, 1.6, starScale=10.0)
    beat(v, 11.0, 0.7, 0.5)
    v.key(11.8, 0, nearMood="run", crowdRun=0.0)
    v.key(11.81, 6.0, crowdRun=30.0)
    v.key(8.5, 0, dof=0.15, focus=40.0)
    v.path(8.5, 14.5, [[0.4, 1.7, -3.0], [2.5, 4.0, -16], [5, 7, -34]], [[0, 6.5, 6], [0, 12, 6], [0, 18, 6]])
    v.path(14.5, 21.0, [[5, 7, -34], [12, 2.5, -14], [13, 1.3, -4]], [[0, 18, 6], [0, 10, 6], [0, 16, 6]])
    v.key(12.0, 0, starMode="idle", starFace=0.0)
    v.key(15.0, 0, starMode="jump")
    v.key(15.7, 0, starMode="idle", stepAt=15.7)
    v.key(15.7, 0.08, shake=1.0, chroma=0.6)
    v.key(15.85, 1.6, shake=0.0, chroma=0.0)
    v.sfx("music/stomp", 15.65, 1.0)
    v.bigcount(18.2, 21.0, "HE KEEPS GROWING IN", 3, 0)
    # ================= C (21-36): 25x, 50x, 100x, up beside him to the CN Tower
    v.key(21.0, 0, dof=0.0, fov=58)
    v.key(21.0, 2.0, starScale=25.0)
    beat(v, 21.0, 0.6, 0.45)
    v.key(21.0, 9.0, crowdRun=70.0)
    v.key(23.6, 2.2, starScale=50.0)
    beat(v, 23.6, 0.7, 0.5)
    v.key(24.6, 0, starMode="jump")
    v.key(25.2, 0, starMode="idle", stepAt=25.2)
    v.key(25.2, 0.08, shake=1.1, chroma=0.7)
    v.key(25.35, 1.8, shake=0.0, chroma=0.0)
    v.sfx("music/stomp", 25.15, 1.0)
    v.key(26.8, 2.6, starScale=100.0)
    beat(v, 26.8, 0.9, 0.7)
    v.key(27.5, 0, starFace=2.0)
    v.key(14.0, 16.0, windowsLit=0.65)
    v.path(21.0, 36.0, [[13, 1.3, -4], [40, 25, -70], [110, 110, -220], [180, 190, -340], [200, 205, -360]],
           [[0, 16, 6], [0, 50, 6], [0, 130, 6], [-40, 170, 150], [-80, 180, 250]])
    # ================= D (36-48): he sings, you hear nothing; then you, down in the street
    v.key(36.0, 0, starMode="idle", starTalk="on", starFace=7.0)
    v.path(36.0, 43.0, [[200, 205, -360], [110, 190, -170], [30, FACE, -112]], [[-80, 180, 250], [0, FACE + 10, 6], [0, FACE, 6]])
    v.key(36.5, 6.0, shake=0.12)
    v.key(42.95, 0, boards=0.0)
    v.key(43.0, 0, camPos=[4, 1.7, -112], camLook=[0, FACE, 6], fov=64, dof=0.25, focus=8.0, shake=0.3, camNear=0.05)
    v.key(43.01, 5.0, camPos=[3.5, 1.7, -110], camLook=[0, FACE - 4, 6])
    v.key(46.5, 1.5, shake=0.0)
    # ================= E (48-57.5): his heart can't push blood up, he sways, kneels, blacks out
    v.key(48.0, 0, camPos=[-175, 40, -70], camLook=[0, 115, 6], fov=58, dof=0.0, starTalk="off", starMode="heavy", starFace=3.0)
    v.key(48.01, 9.5, camPos=[-160, 45, -55], camLook=[0, 80, 6])
    v.key(54.4, 0.8, starMode="kneel", starFace=1.0)
    v.key(55.0, 0, stepAt=55.0)
    v.key(55.0, 0.08, shake=1.2, chroma=0.8)
    v.key(55.15, 2.0, shake=0.0, chroma=0.0)
    v.sfx("music/stomp", 54.95, 1.0)
    v.key(49.0, 8.0, windowsLit=0.9, exposure=0.98)
    # ================= F (57.5-64): twist, wide over Toronto
    v.path(57.5, 64.0, [[-160, 45, -55], [-40, 160, -260], [150, 260, -420]], [[0, 80, 6], [-40, 90, 120], [-100, 100, 300]])
    v.key(57.5, 6.0, fov=62)

    # widget: his height, then voice, then blood pressure
    v.widget(0, 5.8, "HIS HEIGHT", "WEIGHT ~70 KG", "num:2: M", 1.85, 1.85)
    v.widget(5.8, 8.6, "HIS HEIGHT", "WEIGHT 1.1 T", "num:2: M", 1.85, 4.63)
    v.widget(8.6, 11.0, "HIS HEIGHT", "WEIGHT 8.8 T", "num:1: M", 4.63, 9.25)
    v.widget(11.0, 14.5, "HIS HEIGHT", "WEIGHT 70 T", "num:1: M", 9.25, 18.5)
    v.widget(14.5, 21.0, "HIS HEIGHT", "70 T = ARGENTINOSAURUS", "num:1: M", 18.5, 18.5)
    v.widget(21.0, 23.6, "HIS HEIGHT", "WEIGHT 1,100 T", "num:0: M", 18.5, 46)
    v.widget(23.6, 26.8, "HIS HEIGHT", "WEIGHT 8,750 T", "num:0: M", 46, 92.5)
    v.widget(26.8, 30.0, "HIS HEIGHT", "WEIGHT 70,000 T", "num:0: M", 92.5, 185)
    v.widget(30.0, 36.0, "HIS HEIGHT", "TITANIC 52,000 T · CN TOWER 553 M", "num:0: M", 185, 185)
    v.widget(36.0, 40.0, "HIS VOICE", "HUMANS HEAR FROM 20 HZ", "num:0: HZ", 300, 3)
    v.widget(40.0, 48.0, "HIS VOICE", "INFRASOUND · YOU ONLY FEEL IT", "num:0: HZ", 3, 3)
    v.widget(48.0, 54.6, "BLOOD PRESSURE NEEDED", "TO REACH HIS BRAIN · NORMAL 0.16", "num:1: ATM", 0.16, 4.1)
    v.widget(54.6, 57.5, "HIS BRAIN", "NO BLOOD", "text", value="BLACKOUT")
    v.widget(57.5, 64.0, "HIS HEIGHT", "SQUARE-CUBE LAW", "text", value="TOO BIG")

    # sound: one synthwave build, crowd, stomps, infrasound rumble, heartbeat
    m = "music/"
    v.ambient(m + "main", 0, 68.5, 0.5, 0.05)
    v.ambient(m + "crowd", 0, 9.0, 0.45, 0.8)
    v.ambient(m + "panic", 9.0, 30.0, 0.4, 1.0)
    v.ambient("wind", 28.0, 36.0, 0.2, 1.0)
    v.ambient(m + "infra", 36.5, 48.0, 0.55, 0.8)
    v.ambient(m + "heart", 48.0, 57.0, 0.6, 0.6)
    v.sfx("whoosh", 42.85, 0.3)
    v.sfx("whoosh", 47.85, 0.3)
