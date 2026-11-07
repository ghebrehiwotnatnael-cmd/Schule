"""What if a tsunami hit your beach?  Personal POV story, Thai resort, underwater volcano, sirens, run to the roof.
Long flowing camera moves (9 shots), blocky crowd with faces, 6 ElevenLabs voice lines, no narrator."""
TITLE = "What if a tsunami hit your beach?"
TITLE_KEY = "tsunami"
KEY_COLOR = "#36e0d4"
SUB = "IN 2022 THE HUNGA TONGA VOLCANO EXPLODED UNDER THE SEA\nTHE BLAST WAS HEARD IN ALASKA"
CTA = ""
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 82.0
END_CARD = 3.0
END_STYLE = "title"
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_models.js", "sets_people.js", "sets_resort.js"]
WORLD_DEFAULTS = {"eruptAt": 999.0, "erupt2At": 999.0, "lookAt": 999.0, "panicAt": 999.0, "fleeAt": 999.0, "stairsAt": 999.0,
                  "roofAt": 999.0, "siren": 0.0, "waveOn": 0.0, "waveZ": -1000.0, "waveH": 9.0, "floodZ": -999.0, "floodY": -5.0,
                  "ash": 0.0, "bloom": 0.9, "talk": "", "friendRot": 3.1416, "womanRot": 0.0, "staffRot": 3.1416,
                  "friendMode": "walk", "womanMode": "idle", "staffMode": "wave", "friendFace": 7.0, "womanFace": 0.0, "staffFace": 4.0,
                  "womanPos": [0, -60, 0], "staffPos": [0, -60, 0], "shock": 0.0, "shockI": 0.0}

CAPTIONS = [
    (3.4, 5.8, "Thailand. Your dream holiday."),
    (6.0, 8.6, "Sun. Sea. Zero worries."),
    (9.2, 11.8, "Then a flash on the horizon."),
    (13.0, 15.7, "“Bro... did you hear that?”"),
    (16.6, 19.4, "“What is that in the water?!”"),
    (20.3, 23.0, "The sea explodes. Again."),
    (23.8, 26.9, "“That's a volcano! Under the sea!”"),
    (27.8, 30.2, "Then the sirens start."),
    (30.4, 33.4, "“Tsunami warning! Leave the beach now!”"),
    (33.7, 36.2, "Everyone runs for their life."),
    (37.6, 39.8, "“RUN! GO, GO, GO!”"),
    (40.2, 42.6, "Thousands of people. One way."),
    (43.0, 45.6, "Don't look back."),
    (48.3, 51.2, "“Everyone up! To the roof!”"),
    (51.6, 54.0, "Five floors. No elevator."),
    (54.2, 56.4, "Your legs are burning."),
    (57.0, 59.4, "And then you see it."),
    (59.8, 62.2, "A wall of water."),
    (62.5, 64.8, "Higher than the palm trees."),
    (69.6, 71.6, "Plot twist: this really happened."),
    (71.8, 73.8, "2022. Tonga. An underwater volcano."),
    (74.0, 76.0, "The blast was heard in Alaska."),
    (76.2, 78.0, "Its pressure wave circled Earth."),
    (78.3, 81.8, "Would you know where to run?"),
]

TERR, ROOF = 1.2, 16.5
EYE = 1.65
SAND = 0.3
DAY = dict(set="resort", env="day", envI=0.5, skyTop="#2a78e4", skyHorizon="#9fd8ff", skyBottom="#3f8fbf", fogFar=4200,
           light=0.75, ambient=0.26, ambientColor="#e6f2ff", lightColor="#fff1d6", sunDir=[0.35, 0.7, 0.45],
           tonemap=1.0, exposure=1.05, contrast=1.12, saturation=1.3, warmth=0.06, vignette=0.25, grain=0.02, bloom=0.55)
CALM = dict(eruptAt=999.0, erupt2At=999.0, lookAt=999.0, panicAt=999.0, fleeAt=999.0, stairsAt=999.0, roofAt=999.0, siren=0.0,
            waveOn=0.0, floodZ=-999.0, floodY=-5.0, ash=0.0)

WAVE_ICON = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#c8fffb" stop-opacity=".9"/><stop offset="1" stop-color="#36e0d4" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><path d="M-110 60 C-80 -40 -10 -95 60 -80 C20 -60 5 -25 30 0 C55 25 95 15 110 -5 L110 60 Z" fill="#f2fffe"/>
<path d="M-110 85 C-60 70 -30 100 0 85 C30 70 60 100 110 85" stroke="#f2fffe" stroke-width="12" fill="none" stroke-linecap="round"/>'''


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
    v.title_until(3.2, WAVE_ICON)
    e = SAND + EYE
    # ------------------------------------------------ S1 0-16: walk down to the beach, a flash on the horizon, the boom
    v.key(0, 0, **mix(DAY, CALM, eruptAt=9.0, lookAt=12.6, dof=0.35, focus=6.0, fov=54, shake=0.0, bob=0.35, mblur=0.0,
                     friendMode="walk", friendFace=7.0, friendRot=3.1416, womanPos=[0, -60, 0], staffPos=[0, -60, 0]))
    v.path(0, 16.0, [[-1, TERR + EYE, 66], [0, 2.4, 60], [1, e, 52], [2, e, 42], [2.6, e, 34], [3, e, 30.5]],
           [[-4, 3, 0], [-8, 4, -100], [-14, 8, -260], [-30, 40, -500], [-60, 140, -800]])
    v.vpath("friendPos", 0, 16.0, [[-2.2, TERR, 64.5], [-1.4, 0.6, 58], [-0.4, SAND, 50], [0.9, SAND, 40], [2.4, SAND, 32.0], [3.7, SAND, 28.4]])
    v.key(9.6, 0.6, friendMode="idle", friendFace=2.0)
    v.key(12.3, 0, shake=0.7, friendMode="idle")
    v.key(12.4, 1.4, shake=0.0)
    v.key(12.8, 0.6, friendRot=-0.2, friendFace=3.0, friendMode="talk")
    v.hands(0, "hold_low", 0, item="phone", phoneUI="feed")
    v.hands(10.0, "hold", 0.5, phoneUI="rec")
    talk(v, "friend", 13.0, 2.7, "l1_friend")
    # ------------------------------------------------ S2 16-27.5: in the crowd at the water, the woman, the 2nd blast
    v.key(16.0, 0, erupt2At=20.0, panicAt=21.0, dof=0.3, focus=3.5, bob=0.2, friendRot=3.1416, friendMode="point", friendFace=3.0,
          womanPos=[3.4, SAND, 18.0], womanRot=0.4, womanMode="talk", womanFace=3.0)
    v.path(16.0, 27.5, [[4.6, e, 25], [4.2, 2.2, 19.5], [3.2, 2.9, 13], [2.2, 3.9, 8], [1.5, 4.8, 4.5]],
           [[0, 1.6, 10], [-20, 30, -200], [-50, 110, -600], [-80, 260, -900]])
    v.vpath("friendPos", 16.0, 27.5, [[2.4, SAND, 21.5], [2.0, SAND, 16], [1.0, SAND, 9.5], [0.4, SAND, 6.5]])
    v.hands(16.0, "hidden", 0, item="none")
    talk(v, "woman", 16.6, 1.9, "l2_woman")
    v.key(18.8, 0.8, womanRot=3.1416, womanMode="panic", womanFace=4.0)
    v.key(23.3, 0, shake=0.8)
    v.key(23.4, 1.5, shake=0.0)
    v.key(23.6, 0.5, friendRot=0.3, friendMode="panic", friendFace=4.0)
    talk(v, "friend", 23.8, 3.1, "l3_friend")
    # ------------------------------------------------ S3 27.5-37: the siren tower, the announcement, the crowd starts to run
    v.key(27.5, 0, siren=1.0, fleeAt=31.6, ash=0.25, dof=0.15, focus=12, bob=0.0, friendPos=[0, -60, 0], womanPos=[0, -60, 0], fov=58)
    v.path(27.5, 37.0, [[-8.5, 1.0, 51.5], [-7.5, 1.6, 50.5], [-5.0, 2.6, 49.0], [-2.0, 3.2, 47.0]],
           [[-14, 10, 46], [-14, 9, 40], [-10, 4, 20], [-8, 2.0, 6]])
    talk(v, "pa", 30.4, 3.2, "l4_pa_fx", 0.95)
    v.key(33.0, 2.0, ash=0.45)
    # ------------------------------------------------ S4 37-48: POV sprint inland, the friend shouts back at you
    v.key(37.0, 0, dof=0.2, focus=5, bob=1.5, shake=0.18, mblur=0.45, fov=60, friendMode="run", friendFace=4.0, friendRot=3.1416)
    v.path(37.0, 48.0, [[6, e, 17], [9, e, 28], [13, e, 40], [17, 2.1, 50], [21, 2.6, 58], [26, TERR + EYE, 66], [30, TERR + EYE, 75], [32.5, TERR + EYE, 81]],
           [[8, 2.0, 30], [12, 2.2, 44], [16, 2.4, 56], [22, 3.0, 66], [28, 3.2, 78], [33, 3.5, 86], [36, 4.0, 90]])
    v.vpath("friendPos", 37.0, 48.0, [[5.5, SAND, 22.5], [10.5, SAND, 35], [14.5, SAND, 47], [19, 0.6, 56], [24, TERR, 64], [29, TERR, 74], [32.5, TERR, 83], [34.5, TERR, 88]])
    v.key(39.9, 0.4, friendRot=0.1)
    talk(v, "friend", 37.6, 2.2, "l5_friend")
    v.hands(37.0, "hidden", 0)
    # ------------------------------------------------ S5 48-56.5: the stair tower, the staff member, up to the roof
    v.key(48.0, 0, stairsAt=47.0, roofAt=53.5, bob=0.6, shake=0.08, mblur=0.2, fov=58, dof=0.25, focus=4,
          staffPos=[33.6, TERR, 86.6], staffRot=3.1416, staffMode="wave", staffFace=4.0, friendPos=[0, -60, 0])
    v.path(48.0, 56.5, [[31.5, TERR + EYE, 80], [34, 4.5, 82.6], [37, 8, 82.4], [37, 12, 82.8], [36, 16.5, 85], [32, ROOF + 2.4, 90.5], [27, ROOF + EYE, 96]],
           [[34, 2.2, 88], [37, 6, 92], [37, 10, 92], [37, 14, 92], [34, 17, 94], [24, ROOF + 1, 98], [10, 12, 60]])
    talk(v, "staff", 48.3, 2.85, "l6_staff")
    # ------------------------------------------------ S6 56.5-65: the roof, crying people, the wave on the horizon
    v.key(56.5, 0, waveOn=1.0, waveZ=-1000.0, waveH=14.0, bob=0.2, shake=0.0, mblur=0.0, dof=0.3, focus=3.0, fov=56, ash=0.5,
          friendPos=[9.6, ROOF, 93.6], friendRot=3.1416, friendMode="panic", friendFace=5.0, staffPos=[0, -60, 0])
    v.key(56.51, 8.5, waveZ=-260.0, waveH=22.0, lin=True)
    v.path(56.5, 65.0, [[26, ROOF + EYE, 101], [21, ROOF + EYE, 98], [16, ROOF + EYE, 95.2], [12.5, ROOF + EYE, 93.4]],
           [[8, ROOF + 1.4, 100], [0, ROOF + 2, 90], [-10, 14, 20], [-20, 12, -300]])
    v.key(62.0, 1.5, friendMode="cry", friendFace=5.0)
    # ------------------------------------------------ S7 65-69.2: the wave hits the beach below
    v.key(65.0, 0, waveZ=-250.0, waveH=22.0, floodZ=-120.0, floodY=0.4, shake=0.35, dof=0.0, fov=62, friendPos=[0, -60, 0])
    v.key(65.01, 4.2, waveZ=110.0, waveH=9.0, lin=True)
    v.key(65.6, 3.6, floodZ=100.0, floodY=4.6)
    v.key(66.6, 0.3, shake=0.9)
    v.path(65.0, 69.2, [[10, ROOF + EYE + 0.4, 92.6], [8, ROOF + EYE + 0.2, 92.2]], [[4, 0, 20], [2, 0, 50]])
    # ------------------------------------------------ S8 69.4-78: twist, Tonga 2022 from space, the pressure wave
    v.key(69.2, 0, exposure=0.0)
    v.key(69.4, 0, set="space", earthSun=1.0, earthLights=0.6, earthIce=0.0, cables=0.0, cableCut=0.0, laser=0.0, spaceMoon=0.0,
          earthRot=1.42, earthTilt=0.3, spaceCam=[-14, -6, 28], spaceFov=42, shock=0.0, shockI=1.0, shake=0.0, mblur=0.0, dof=0.0, bloom=0.7, exposure=1.05)
    v.key(69.41, 8.6, earthRot=1.6, spaceCam=[-11, -5, 23], shock=2.4, lin=True)
    # ------------------------------------------------ S9 78-82: back on the calm beach (loops to the start)
    v.key(78.0, 0, **mix(DAY, CALM, shockI=0.0, dof=0.35, focus=6.0, fov=54, bob=0.35, friendMode="walk", friendFace=7.0, friendRot=3.1416))
    v.path(78.0, 82.0, [[4, TERR + EYE, 71], [4.5, TERR + EYE, 66.5]], [[0, 3, 0], [-2, 3.5, -60]])
    v.vpath("friendPos", 78.0, 82.0, [[2.6, TERR, 69.0], [3.0, TERR, 64.8]])
    v.hands(78.0, "hold_low", 0, item="phone", phoneUI="feed")

    # widget: the time grid
    v.widget(0, 16.0, "LOCAL TIME", "KHAO LAK · THAILAND", "text", value="11:02 AM")
    v.widget(16.0, 27.5, "LOCAL TIME", "KHAO LAK · THAILAND", "text", value="11:03 AM")
    v.widget(27.5, 37.0, "TSUNAMI ARRIVES IN", "SIRENS ON", "sec", 480, 470.5)
    v.widget(37.0, 48.0, "TSUNAMI ARRIVES IN", "RUN INLAND OR UP", "sec", 300, 289)
    v.widget(48.0, 56.5, "TSUNAMI ARRIVES IN", "GET HIGHER", "sec", 150, 141.5)
    v.widget(56.5, 65.0, "TSUNAMI ARRIVES IN", "ON THE ROOF", "sec", 20, 11.5)
    v.widget(65.0, 69.2, "TSUNAMI", "", "text", value="NOW")
    v.widget(69.4, 78.0, "BLAST HEARD", "HUNGA TONGA · 2022", "text", value="10,000 KM AWAY")
    v.widget(78.0, 82.0, "TSUNAMI ARRIVES IN", "", "text", value="??:??")

    # sound: ambience, music, effects (no narrator)
    m = "music/"
    v.ambient(m + "beach", 0, 12.4, 0.5, 0.05)
    v.ambient(m + "tropical", 0, 12.35, 0.42, 0.05)
    v.sfx(m + "boom", 12.3, 1.0); v.sfx(m + "gasp", 12.7, 0.55); v.sfx(m + "birds", 12.6, 0.3)
    v.ambient(m + "drone", 12.4, 27.6, 0.5, 0.6, offset=6)
    v.ambient(m + "beach", 16.0, 27.5, 0.22, 0.6, offset=8)
    v.sfx(m + "boom2", 23.3, 0.95)
    v.ambient(m + "siren_long", 27.5, 69.2, 0.42, 0.4)
    v.ambient(m + "screams_long", 31.8, 69.2, 0.4, 0.8)
    v.ambient(m + "action", 31.6, 65.2, 0.5, 0.6)
    v.ambient(m + "roar_long", 57.0, 69.2, 0.55, 2.0)
    v.sfx(m + "rumble", 60.5, 0.6); v.sfx(m + "crash", 65.6, 1.0); v.sfx(m + "boom", 66.5, 0.6)
    v.ambient(m + "piano", 69.4, 78.1, 0.55, 0.5)
    v.ambient("space", 69.4, 78.0, 0.22, 0.6)
    v.ambient(m + "soft", 78.0, 85.0, 0.4, 0.6)
    v.ambient(m + "beach", 78.0, 85.0, 0.35, 0.6)
    for t in (16.0, 27.5, 37.0, 48.0, 56.5, 65.0, 78.0):
        v.sfx("whoosh-short", t, 0.2)
