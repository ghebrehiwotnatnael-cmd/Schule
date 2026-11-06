"""What if the Moon disappeared?  POV, no voice, real models, ~64 s."""
TITLE = "What if the Moon disappeared?"
TITLE_KEY = "Moon"
KEY_COLOR = "#cfe0ff"
SUB = "THE MOON DRIFTS 3.8 CM FARTHER AWAY EVERY YEAR\nMEASURED BY LASER OFF MIRRORS LEFT BY APOLLO 11"
CTA = "SEND THIS TO SOMEONE\nWHO LOVES A FULL MOON."
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 63.5
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_city.js", "sets_nature.js", "sets_models.js", "sets_models2.js", "sets_rooms.js"]
WORLD_DEFAULTS = {"beach": 0.0, "crowd": 1.0, "traffic": 1.0, "cars": 1.0, "power": 1.0, "moon": 1.0}

CAPTIONS = [
    (3.4, 5.9, "Tonight. A full moon over the bay."),
    (6.4, 8.5, "Then it's just... gone."),
    (8.8, 11.3, "No crash. No debris. It simply vanishes."),
    (11.6, 14.1, "Night 1. Nights get much darker."),
    (14.4, 16.9, "In the forest, you can't see your own hands."),
    (17.2, 19.7, "Animals that use moonlight to hunt or hide get confused."),
    (20.0, 22.5, "Day 1. The tide comes in... barely."),
    (22.8, 25.3, "Without the Moon, tides shrink to about a third."),
    (25.6, 28.1, "Only the Sun is still pulling on the oceans."),
    (28.4, 30.9, "Fun fact: wolves never howled at the Moon anyway."),
    (31.2, 33.7, "But the stars have never looked brighter."),
    (34.0, 36.5, "The Milky Way. Every single night."),
    (36.8, 39.3, "Year 1. No more solar eclipses. Ever."),
    (39.6, 42.1, "Over millions of years, Earth's tilt starts to wobble."),
    (42.4, 44.9, "Seasons could swing to extremes."),
    (45.2, 47.9, "Life would go on. On a very different planet."),
    (48.2, 50.9, "Plot twist: the Moon is already leaving."),
    (51.2, 53.9, "It drifts 3.8 cm farther away every year."),
    (54.2, 56.9, "We measure it by laser, off mirrors Apollo astronauts left."),
    (57.2, 60.3, "In ~600 million years: no more total solar eclipses."),
    (60.6, 63.4, "Look up tonight. While it's still close."),
]

GRADE = dict(tonemap=1.0, exposure=1.08, contrast=1.08, saturation=1.05, vignette=0.32, grain=0.035, warmth=0.0)
NIGHT = dict(env="night", envI=0.38, skyTop="#050a1c", skyHorizon="#16244a", skyBottom="#06080a", light=0.0, ambient=0.12,
             ambientColor="#8fa6e0", stars=0.6, moonLight=0.9, milkyway=0.0, aurora=0.0, cityLights=1.0, lamps=1.0)
DARKNIGHT = dict(env="night", envI=0.12, skyTop="#010207", skyHorizon="#060a16", skyBottom="#020203", ambient=0.04,
                 moon=0.0, moonLight=0.0, stars=1.0)
DAY = dict(env="day", envI=0.38, skyTop="#4f86d6", skyHorizon="#a9c4e6", skyBottom="#4b6a3a", light=0.7, ambient=0.18,
           ambientColor="#eef3ff", lightColor="#fff1d6", sunDir=[0.5, 0.6, -0.4], stars=0.0, moon=0.0, exposure=1.0,
           contrast=1.1, saturation=1.12, cityLights=0.0, lamps=0.0, milkyway=0.0)
DUSK = dict(env="dusk", envI=0.4, skyTop="#3d4f86", skyHorizon="#f4a76b", skyBottom="#2c2a2a", light=0.55, ambient=0.15,
            ambientColor="#ffd9b8", lightColor="#ffb070", sunDir=[-0.6, 0.12, -0.8], stars=0.0, exposure=1.0)
MOONPOS = [-40, 120, -900]

MOON = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#eef4ff" stop-opacity=".9"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></radialGradient>
<radialGradient id="mf" cx=".4" cy=".4"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c9d2e3"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><circle r="92" fill="url(#mf)" stroke="#ffffff" stroke-width="10" stroke-dasharray="20 14"/>
<circle cx="-28" cy="-20" r="16" fill="#aeb8cc"/><circle cx="30" cy="22" r="22" fill="#b6c0d2"/><circle cx="-10" cy="44" r="10" fill="#aeb8cc"/>'''


def mix(*ds, **kw):
    out = {}
    for d in ds:
        out.update(d)
    out.update(kw)
    return out


def build(v):
    v.title_until(3.2, MOON)
    # S1 hook: POV on the beach at night, full moon and its silver path on the sea
    v.key(0, 0, **mix(NIGHT, GRADE, set="coast", moon=1.0, moonPos=MOONPOS, tide=0.7, crowd=0.5, moonPath=1.0))
    v.shot(0, [0, 1.7, 22], [-10, 20, -200], to_pos=[0, 1.7, 19], length=3.2, bob=0.4, fov=50)
    v.hands(0, "hidden", 0, item="none")
    # S2 zoom on the Moon
    v.shot(3.2, [0, 1.7, 19], [-40, 120, -900], to_look=[-39, 121, -900], length=2.8, bob=0.0, fov=9)
    # S3 6.0 it vanishes; the silver path on the water goes out
    v.shot(6.0, [6, 1.6, 24], [-30, 40, -400], to_pos=[6, 1.6, 22], length=2.6, fov=50, shake=0.15)
    v.key(6.3, 0.5, moon=0.0, moonLight=0.0)
    v.key(6.9, 0.6, shake=0.0)
    v.sfx("music/boom", 6.25, 0.6); v.sfx("whoosh", 6.15, 0.35)
    # S4 seen from space: Earth alone
    v.key(8.6, 0, set="space", earthSun=1.0, earthLights=0.8, earthIce=0.0, cables=0.0, cableCut=0.0, laser=0.0, earthTilt=0.41,
          spaceMoon=1.0, spaceMoonPos=[-24, 5, -22], earthRot=0.4, spaceCam=[14, 6, 40])
    v.key(8.61, 2.8, earthRot=0.55, spaceCam=[10, 5, 34])
    v.key(9.3, 0.7, spaceMoon=0.0)
    v.sfx("whoosh-short", 9.3, 0.3)
    # S5 NIGHT 1 the coast without moonlight
    v.key(11.4, 0, **mix(NIGHT, DARKNIGHT, set="coast", tide=0.7, crowd=0.3, cityLights=0.7, lamps=0.8, earthTilt=0.0))
    v.shot(11.4, [-6, 1.6, 22], [4, 5, 70], to_pos=[-2, 1.6, 26], length=2.8, fov=52)
    # S6 the forest, pitch dark, POV hands barely visible
    v.key(14.2, 0, **mix(NIGHT, DARKNIGHT, set="forest", animals="graze", exposure=1.25))
    v.shot(14.2, [0, 1.6, 6], [0, 1.2, -25], to_pos=[0, 1.6, 3], length=2.8, fov=50, bob=0.5)
    v.hands(14.2, "reach", 0.3, item="none")
    # S7 the deer freeze, the wolf moves
    v.shot(17.0, [-4.5, 1.2, -25], [-9, 0.9, -34], to_pos=[-5, 1.15, -27], length=2.8, fov=46, bob=0.0, dof=0.4, focus=9, animals="alert",
           exposure=1.4)
    v.hands(17.0, "hidden", 0)
    # S8 DAY 1 the harbour: the tide barely rises
    v.key(19.8, 0, **mix(DAY, set="coast", tide=0.25, crowd=0.6, dof=0.0))
    v.shot(19.8, [36, 2.2, 2], [44, 0.0, -50], to_pos=[35, 2.3, -2], length=2.8, fov=48)
    v.key(19.81, 2.8, tide=0.4)
    # S9 the waterline on the beach, almost not moving
    v.shot(22.6, [-8, 1.0, -8], [10, -0.6, -40], to_pos=[-6, 1.0, -10], length=2.8, fov=50, tide=0.4, beach=0.0)
    v.key(22.61, 2.8, tide=0.33)
    # S10 fishermen on the pier
    v.shot(25.4, [39.5, 2.4, -56], [43, 1.2, -72], to_pos=[40, 2.3, -58], length=2.8, fov=46, dof=0.3, focus=14)
    # S11 the wolf in the dark forest
    v.key(28.2, 0, **mix(NIGHT, DARKNIGHT, set="forest", animals="graze", exposure=1.4))
    v.shot(28.2, [2.6, 0.9, -19.5], [6, 0.8, -26], to_pos=[2.9, 0.85, -20.5], length=2.8, fov=44, dof=0.5, focus=7)
    # S12 the stars over the bay
    v.key(31.0, 0, **mix(NIGHT, set="coast", moon=0.0, moonLight=0.0, stars=1.0, milkyway=1.0, cityLights=0.2, lamps=0.0, crowd=0.3,
                        tide=0.35, exposure=1.1, dof=0.0))
    v.shot(31.0, [0, 1.7, 22], [-20, 120, -400], to_look=[-10, 150, -400], length=2.8, fov=55)
    # S13 the forest clearing under the Milky Way
    v.key(33.8, 0, **mix(NIGHT, DARKNIGHT, set="forest", milkyway=1.0, stars=1.0, animals="graze", exposure=1.3))
    v.shot(33.8, [0, 1.2, 8], [0, 40, -120], to_pos=[0, 1.2, 5], to_look=[0, 60, -120], length=2.8, fov=58)
    # S14 YEAR 1 Earth in full sunlight, no Moon to cast a shadow
    v.key(36.6, 0, set="space", earthSun=1.0, earthLights=0.6, spaceMoon=0.0, laser=0.0, earthTilt=0.41, earthRot=1.8, spaceCam=[0, 4, 36],
          exposure=1.0)
    v.key(36.61, 2.8, earthRot=2.0, spaceCam=[6, 3, 31])
    # S15 the tilt starts to wobble
    v.key(39.4, 0, earthRot=2.0, earthTilt=0.41, spaceCam=[0, 0, 30])
    v.key(39.41, 1.0, earthTilt=0.85)
    v.key(40.5, 1.0, earthTilt=0.1)
    v.key(41.5, 0.7, earthTilt=0.6)
    # S16 seasons swing: snow on a summer street
    v.key(42.2, 0, **mix(DAY, set="street", crowd=0.6, traffic=0.6, snow=0.9, frost=0.25, saturation=0.85, warmth=-0.2, earthTilt=0.0))
    v.shot(42.2, [4.5, 1.6, -15], [-3, 1.2, -60], to_pos=[4.5, 1.6, -19], length=2.8, fov=50, bob=0.4)
    # S17 people at sunset, looking up
    v.key(45.0, 0, **mix(DUSK, set="coast", crowd=1.0, beach=1.0, tide=0.5, lamps=1.0, cityLights=0.6, snow=0.0, frost=0.0, warmth=0.05,
                        saturation=1.05, lookUp=1.0))
    v.shot(45.0, [10, 1.5, 27], [-4, 2.5, -200], to_pos=[7, 1.5, 26], length=3.0, fov=52, dof=0.2, focus=14, bob=0.0)
    # S18 PLOT TWIST: the Moon is back... and slowly drifting away
    v.key(48.0, 0, set="space", earthSun=1.0, earthLights=0.8, spaceMoon=1.0, spaceMoonPos=[-22, 5, -20], laser=0.0, earthTilt=0.41,
          earthRot=0.4, spaceCam=[16, 8, 42], lookUp=0.0, beach=0.0)
    v.key(48.01, 3.0, spaceMoonPos=[-27, 6, -25], spaceCam=[18, 9, 46])
    v.sfx("riser", 48.0, 0.35)
    # S19 a laser from Earth to the Apollo mirrors
    v.key(51.0, 0, spaceMoonPos=[-24, 5, -22], spaceCam=[6, 14, 44], laser=0.0)
    v.key(51.4, 0.3, laser=1.0)
    v.key(51.01, 3.0, spaceCam=[0, 12, 40])
    v.sfx("sparkle", 51.4, 0.35)
    # S20 behind the Moon, looking back at Earth along the beam
    v.key(54.0, 0, spaceMoonPos=[-24, 5, -22], spaceCam=[-31, 12, -34], laser=1.0)
    v.key(54.01, 3.0, spaceCam=[-29, 11, -31])
    # S21 back on the beach: the full Moon, people watching
    v.key(57.0, 0, **mix(NIGHT, set="coast", moon=1.0, moonPos=MOONPOS, moonPath=1.0, tide=0.7, crowd=1.0, lookUp=1.0, laser=0.0))
    v.shot(57.0, [12, 1.5, 24], [-40, 60, -900], to_pos=[9, 1.5, 22], length=3.5, fov=52)
    # S22 POV, the Moon over the bay (loops into the start)
    v.key(60.5, 0, lookUp=0.0)
    v.shot(60.5, [0, 1.7, 25], [-10, 20, -200], to_pos=[0, 1.7, 22], length=3.0, bob=0.4, fov=50)

    # widget: the time grid
    v.widget(0, 6.0, "THE MOON VANISHES IN", "FULL MOON · 10:00 PM", "sec", 6.0, 0)
    v.widget(6.0, 11.4, "TIME WITHOUT THE MOON", "", "text", value="0 SEC")
    v.widget(11.4, 19.8, "TIME WITHOUT THE MOON", "", "text", value="NIGHT 1")
    v.widget(19.8, 31.0, "TIME WITHOUT THE MOON", "TIDES", "text", value="DAY 1")
    v.widget(31.0, 36.6, "TIME WITHOUT THE MOON", "", "text", value="WEEK 1")
    v.widget(36.6, 39.4, "TIME WITHOUT THE MOON", "", "text", value="YEAR 1")
    v.widget(39.4, 48.0, "TIME WITHOUT THE MOON", "EARTH'S TILT", "text", value="1M YEARS")
    v.widget(48.0, 57.0, "THE MOON DRIFTS AWAY", "EVERY YEAR", "text", value="3.8 CM")
    v.widget(57.0, 60.5, "LAST TOTAL ECLIPSE", "IN ABOUT", "text", value="600M YRS")

    # sound: no voice; ambience, music, effects
    m = "music/"
    v.ambient(m + "moonpiano", 0, 6.4, 0.55, 0.05)
    v.ambient("wind", 0, 11.4, 0.18, 0.4)
    v.ambient(m + "drone", 6.2, 19.9, 0.5, 0.5, offset=6)
    v.ambient(m + "crickets_long", 14.2, 19.8, 0.3, 0.4)
    v.ambient(m + "night", 19.8, 31.1, 0.5, 0.8)
    v.ambient("birds-evening", 19.8, 28.2, 0.2, 0.6)
    v.ambient(m + "crickets_long", 28.2, 36.6, 0.3, 0.5, offset=10)
    v.ambient(m + "strings", 31.0, 48.1, 0.55, 1.0)
    v.ambient("space", 36.6, 42.2, 0.25, 0.6)
    v.ambient("wind", 42.2, 45.0, 0.25, 0.4)
    v.ambient(m + "cosmic", 48.0, 60.6, 0.6, 0.8, offset=14)
    v.ambient("space", 48.0, 57.0, 0.2, 0.8)
    v.ambient(m + "moonpiano", 57.0, 67.5, 0.5, 1.0, offset=8)
    for t in (11.3, 14.1, 19.7, 28.1, 31.0, 36.5, 39.3, 42.1, 45.0, 54.0, 57.0, 60.4):
        v.sfx("whoosh-short", t, 0.2)
