"""What if the internet disappeared for a week?  POV, no voice, real models, ~64 s."""
TITLE = "What if the internet disappeared for a week?"
TITLE_KEY = "internet"
KEY_COLOR = "#5ff3ff"
SUB = "ALMOST ALL DATA BETWEEN CONTINENTS RUNS THROUGH UNDERSEA CABLES\nIN 2022 A VOLCANO CUT TONGA'S ONLY ONE"
CTA = "SEND THIS TO SOMEONE\nWHO CHECKS THEIR PHONE 100x A DAY."
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 63.5
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_city.js", "sets_nature.js", "sets_models.js", "sets_models2.js", "sets_rooms.js"]
WORLD_DEFAULTS = {"beach": 0.0, "crowd": 1.0, "traffic": 1.0, "cars": 1.0, "power": 1.0, "moon": 0.0}

CAPTIONS = [
    (3.4, 5.9, "Sunday, 2 PM. Five billion people online."),
    (6.4, 8.5, "Then the internet just... stops."),
    (8.8, 11.3, "Every website. Every app. Every server."),
    (11.6, 14.1, "Minute 1. Offices freeze."),
    (14.4, 16.9, "Airports can't check anyone in."),
    (17.2, 19.7, "Card terminals go offline. Cash only."),
    (20.0, 22.5, "Hour 2. Maps go blank."),
    (22.8, 25.3, "People ask strangers for directions again."),
    (25.6, 28.1, "Ports slow down. Global shipping runs on data."),
    (28.4, 30.9, "Day 2. TV and radio still work. They don't need it."),
    (31.2, 33.7, "Families dig out old board games."),
    (34.0, 36.5, "Day 4. Hospitals switch to paper charts."),
    (36.8, 39.3, "Beaches and parks fill up."),
    (39.6, 42.1, "Day 6. Busy streets, quiet phones."),
    (42.4, 44.9, "Nobody knows what's trending. Nobody cares."),
    (45.2, 47.9, "Day 7. It comes back. All at once."),
    (48.2, 50.9, "Plot twist: the internet lives under the sea."),
    (51.2, 53.9, "Almost all data between continents runs through undersea cables."),
    (54.2, 56.9, "2022: a volcano cut Tonga's only cable."),
    (57.2, 60.3, "The country was nearly cut off for 5 weeks."),
    (60.6, 63.4, "Could you last 7 days?"),
]

GRADE = dict(tonemap=1.0, exposure=1.0, contrast=1.08, saturation=1.06, vignette=0.28, grain=0.03, warmth=0.04)
DAY = dict(env="day", envI=0.38, skyTop="#4f86d6", skyHorizon="#a9c4e6", skyBottom="#4b6a3a", light=0.7, ambient=0.18,
           ambientColor="#eef3ff", lightColor="#fff1d6", sunDir=[0.5, 0.6, -0.4], stars=0.0, exposure=1.0, contrast=1.1, saturation=1.12,
           cityLights=0.0, lamps=0.0, signals=1.0, headlights=0.0)
DUSK = dict(env="dusk", envI=0.7, skyTop="#3d4f86", skyHorizon="#f4a76b", skyBottom="#2c2a2a", light=0.8, ambient=0.35,
            ambientColor="#ffd9b8", lightColor="#ffb070", sunDir=[-0.6, 0.12, -0.8], stars=0.0, exposure=1.0)
NIGHT = dict(env="night", envI=0.45, skyTop="#050916", skyHorizon="#1a2240", skyBottom="#07080a", light=0.0, ambient=0.14,
             ambientColor="#8296d4", sunDir=[0.2, 0.5, -0.6], stars=0.4)

WIFI = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#d8fbff" stop-opacity=".9"/><stop offset="1" stop-color="#5ff3ff" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><g fill="none" stroke="#f2feff" stroke-width="20" stroke-linecap="round">
<path d="M-95 -20 A135 135 0 0 1 95 -20"/><path d="M-62 14 A88 88 0 0 1 62 14"/><path d="M-30 46 A42 42 0 0 1 30 46"/></g>
<circle cy="80" r="15" fill="#f2feff"/><path d="M-110 -110 L110 110" stroke="#ff4d5a" stroke-width="18" stroke-linecap="round"/>'''


def mix(*ds, **kw):
    out = {}
    for d in ds:
        out.update(d)
    out.update(kw)
    return out


def build(v):
    v.title_until(3.2, WIFI)
    # S1 hook: POV, sunny street, scrolling the feed
    v.key(0, 0, **mix(DAY, GRADE, set="street", crowd=1.0, traffic=1.0, panic=0.0, jam=0.0, lookUp=0.0))
    v.shot(0, [7.6, 1.65, 6], [3, 3.5, -40], to_pos=[7.6, 1.65, 3], length=3.2, bob=0.5, fov=52)
    v.hands(0, "hold_low", 0, item="phone", phoneUI="feed")
    # S2 Earth at night: the lights of a connected planet
    v.key(3.2, 0, set="space", earthSun=0.35, earthLights=1.0, earthIce=0.0, spaceMoon=0.0, cables=0.0, cableCut=0.0,
          earthRot=-0.6, spaceCam=[0, 8, 36])
    v.key(3.21, 2.8, earthRot=-0.45, spaceCam=[3, 6, 29])
    v.hands(3.2, "hidden", 0)
    # S3 6.0 the phone drops offline
    v.key(6.0, 0, **mix(DAY, set="street", crowd=0.8))
    v.shot(6.0, [7.6, 1.65, -8], [7.4, 1.0, -26], length=2.6, fov=50, dof=0.6, focus=0.42)
    v.hands(6.0, "hold", 0, item="phone", phoneUI="feed")
    v.key(6.25, 0, phoneUI="offline")
    v.sfx("music/glitch", 6.2, 0.5); v.sfx("impact-bass-2", 6.22, 0.45)
    # S4 the street stops: people look up from their phones
    v.shot(8.6, [0, 6, 18], [0, 3, -60], to_pos=[0, 5.5, 14], length=2.8, fov=52, dof=0.0, lookUp=1.0)
    v.hands(8.6, "hidden", 0.2, item="none")
    # S5 MINUTE 1 office: every screen says "No internet"
    v.key(11.4, 0, set="rooms", env="day", envI=0.5, power=1.0, offline=1.0, candles=0.0, backup=0.0, board=0.0,
          daylight=0.5, tv=0.0, boardgame=0.0, exposure=1.0, lookUp=0.0, panic=0.0)
    v.shot(11.4, [244, 1.75, 3], [238, 0.8, -5], to_pos=[243, 1.7, 2], length=2.8, fov=52)
    # S6 airport: everything cancelled
    v.key(14.2, 0, board=1.0, panic=0.6)
    v.shot(14.2, [60, 1.7, 10], [60, 4, -20], to_pos=[60, 1.7, 7], length=2.8, fov=55)
    # S7 supermarket: card declined
    v.key(17.0, 0, set="supermarket", fruit=1.0, price=0.0, queue=1.0, panic=0.3, soldout=0.0, exposure=1.0)
    v.shot(17.0, [6.3, 1.6, 3.4], [6.2, 1.0, -2], length=2.8, fov=50, dof=0.5, focus=0.45)
    v.hands(17.0, "hold", 0, item="phone", phoneUI="declined")
    # S8 HOUR 2 the map app is blank
    v.key(19.8, 0, **mix(DAY, set="street", crowd=1.0, lookUp=0.0, panic=0.0))
    v.shot(19.8, [7.6, 1.65, -20], [4, 1.6, -60], to_pos=[7.6, 1.65, -23], length=2.8, fov=50, dof=0.0, bob=0.4)
    v.hands(19.8, "hold_low", 0, item="phone", phoneUI="map")
    # S9 people ask each other for directions
    v.shot(22.6, [-4.0, 1.7, -30], [-8.5, 1.3, -50], to_pos=[-4.2, 1.7, -33], length=2.8, fov=50, dof=0.3, focus=12, bob=0.0)
    v.hands(22.6, "hidden", 0, item="none")
    # S10 the harbour: ships wait
    v.key(25.4, 0, **mix(DAY, set="coast", crowd=0.6, tide=0.5, moon=0.0, milkyway=0.0, aurora=0.0, stars=0.0, beach=0.0))
    v.shot(25.4, [36, 2.2, 2], [44, 1.2, -60], to_pos=[35, 2.3, -2], length=2.8, fov=48, dof=0.0)
    # S11 DAY 2 living room: TV news still on air
    v.key(28.2, 0, set="rooms", env="day", envI=0.5, power=1.0, daylight=0.6, tv=1.0, boardgame=1.0, candles=0.0, exposure=1.0)
    v.shot(28.2, [301.6, 1.65, -2.75], [299.8, 1.35, 2.9], to_pos=[301.2, 1.6, -2.7], length=2.8, fov=50, dof=0.2, focus=5)
    # S12 the board game
    v.shot(31.0, [300.8, 1.3, 0.4], [300, 0.77, -0.6], to_pos=[300.7, 1.25, 0.25], length=2.8, fov=46, dof=0.6, focus=1.2)
    # S13 DAY 4 hospital: paper charts
    v.key(33.8, 0, power=1.0, backup=0.0)
    v.shot(33.8, [1.7, 1.6, 1.6], [-1.3, 1.0, -1.8], to_pos=[1.4, 1.55, 1.2], length=2.8, fov=48, dof=0.3, focus=3.2)
    # S14 beach full of people
    v.key(36.6, 0, **mix(DAY, set="coast", crowd=1.0, tide=0.5, moon=0.0, milkyway=0.0, aurora=0.0, stars=0.0, beach=1.0))
    v.shot(36.6, [-14, 3.2, 30], [4, 0.5, 4], to_pos=[-9, 3.0, 31], length=2.8, fov=50, dof=0.0)
    # S15 DAY 6 the busy street from above
    v.key(39.4, 0, **mix(DAY, set="street", crowd=1.0, traffic=1.0, jam=0.0, lookUp=0.0))
    v.shot(39.4, [2, 16, 26], [-2, 2, -70], to_pos=[1, 14, 18], length=2.8, fov=55, mblur=0.4)
    # S16 sunset at the coast, people together
    v.key(42.2, 0, **mix(DUSK, set="coast", crowd=1.0, tide=0.5, lamps=1.0, cityLights=0.6, mblur=0.0, beach=1.0, light=0.55, envI=0.4, ambient=0.15))
    v.shot(42.2, [10, 1.5, 27], [-4, 2.5, -200], to_pos=[7, 1.5, 26], length=2.8, fov=52, dof=0.2, focus=14)
    # S17 DAY 7 the phone explodes with notifications
    v.key(45.0, 0, **mix(DUSK, set="street", crowd=1.0, cityLights=1.0, lamps=1.0, headlights=1.0, lookUp=0.0))
    v.shot(45.0, [7.6, 1.65, -8], [7.4, 1.0, -26], length=3.0, fov=50, dof=0.6, focus=0.42)
    v.hands(45.0, "hold", 0, item="phone", phoneUI="offline")
    v.key(45.3, 0, phoneUI="notifs")
    v.sfx("music/pings", 45.3, 0.5); v.sfx("music/ping", 46.2, 0.4); v.sfx("music/ping", 46.6, 0.35); v.sfx("music/ping", 47.1, 0.3)
    # S18 PLOT TWIST: undersea cables light up the globe (Atlantic)
    v.key(48.0, 0, set="space", earthSun=1.0, earthLights=0.6, cables=0.0, cableCut=0.0, earthRot=-0.95, spaceCam=[0, 7, 32], warmth=0.0)
    v.key(48.01, 3.0, cables=1.0, earthRot=-0.75, spaceCam=[2, 6, 27])
    v.hands(48.0, "hidden", 0, item="none")
    v.sfx("riser", 48.0, 0.35)
    # S19 Indian Ocean and Asia, cables everywhere
    v.key(51.0, 0, cables=1.0, earthRot=-3.1, spaceCam=[0, 3, 25])
    v.key(51.01, 3.0, earthRot=-2.85, spaceCam=[-2, 2, 21])
    # S20 the Pacific: Tonga's cable goes dark
    v.key(54.0, 0, earthRot=1.36, spaceCam=[0, -6, 24], earthSun=1.0)
    v.key(54.01, 3.0, earthRot=1.47, spaceCam=[0, -5, 17])
    v.key(54.7, 0.2, cableCut=1.0)
    v.sfx("impact-bass-1", 54.7, 0.5); v.sfx("music/glitch", 54.75, 0.35)
    # S21 a quiet island at night, cut off
    v.key(57.0, 0, **mix(NIGHT, set="coast", crowd=0.2, tide=0.5, moon=1.0, milkyway=0.4, aurora=0.0, stars=0.8,
                        lamps=0.6, cityLights=0.4, cables=0.0, cableCut=0.0))
    v.shot(57.0, [-6, 1.6, 22], [4, 5, 70], to_pos=[-2, 1.6, 26], length=3.5, fov=52, beach=0.0)
    # S22 back to the sunny street (loops into the start)
    v.key(60.5, 0, **mix(DAY, set="street", crowd=1.0, jam=0.0, lookUp=0.0))
    v.shot(60.5, [7.6, 1.65, 9], [3, 3.5, -40], to_pos=[7.6, 1.65, 6], length=3.0, bob=0.5, fov=52)
    v.hands(60.5, "hold_low", 0.3, item="phone", phoneUI="feed")

    # widget: the time grid
    v.widget(0, 6.0, "THE INTERNET ENDS IN", "SUNDAY · 2:00 PM", "sec", 6.0, 0)
    v.widget(6.0, 11.4, "BACK ONLINE IN", "EVERY SERVER OFFLINE", "days", 7.0, 6.998)
    v.widget(11.4, 19.8, "BACK ONLINE IN", "MINUTE 1", "days", 6.999, 6.99)
    v.widget(19.8, 28.2, "BACK ONLINE IN", "HOUR 2", "days", 6.92, 6.9)
    v.widget(28.2, 33.8, "BACK ONLINE IN", "DAY 2", "days", 5.0, 4.95)
    v.widget(33.8, 39.4, "BACK ONLINE IN", "DAY 4", "days", 3.0, 2.95)
    v.widget(39.4, 45.0, "BACK ONLINE IN", "DAY 6", "days", 1.0, 0.95)
    v.widget(45.0, 48.0, "INTERNET", "AFTER 7 DAYS", "text", value="BACK")
    v.widget(48.0, 54.0, "UNDERSEA CABLES", "LENGTH OF THE NETWORK", "text", value="1.4M KM")
    v.widget(54.0, 60.5, "TONGA 2022", "ONE CABLE CUT", "text", value="5 WEEKS")

    # sound: no voice; ambience, music, effects
    m = "music/"
    v.ambient(m + "lofi", 0, 6.15, 0.5, 0.05)
    v.ambient("crowd", 0, 6.15, 0.3, 0.05)
    v.ambient(m + "tense", 6.1, 20.0, 0.5, 0.5)
    v.ambient("crowd", 8.6, 11.4, 0.25, 0.4, offset=6)
    v.ambient(m + "acoustic", 19.8, 45.1, 0.55, 1.0)
    v.ambient("birds-evening", 25.4, 28.2, 0.3, 0.5)
    v.ambient("wind", 36.6, 39.4, 0.25, 0.5)
    v.ambient("crowd", 39.4, 45.0, 0.2, 0.6, offset=20)
    v.ambient(m + "hope", 45.0, 48.2, 0.55, 0.4, offset=34)
    v.ambient(m + "deep", 48.0, 60.6, 0.6, 1.0, offset=4)
    v.ambient("wind", 57.0, 60.6, 0.25, 0.6)
    v.ambient(m + "lofi", 60.5, 67.5, 0.4, 1.0, offset=20)
    for t in (11.3, 14.1, 16.9, 19.7, 25.3, 28.1, 33.7, 36.5, 39.3, 42.1, 48.0, 51.0, 57.0, 60.4):
        v.sfx("whoosh-short", t, 0.2)
