"""What if electricity stopped working for 7 days?  POV, no voice, real models, ~64 s."""
TITLE = "What if electricity stopped for 7 days?"
TITLE_KEY = "electricity"
KEY_COLOR = "#ffd166"
SUB = "CELL TOWERS RUN ON BATTERIES FOR ONLY HOURS\nIN 1859 A SOLAR STORM SET TELEGRAPH WIRES SPARKING"
CTA = "SEND THIS TO SOMEONE\nWHO CAN'T LIVE WITHOUT WIFI."
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 63.5
MODELS = "all"
SET_FILES = ["sets_common.js", "sets_city.js", "sets_nature.js", "sets_models.js", "sets_models2.js", "sets_rooms.js"]
WORLD_DEFAULTS = {"crowd": 1.0, "traffic": 1.0, "cars": 1.0, "power": 1.0, "moon": 0.0}

CAPTIONS = [
    (3.4, 5.9, "Manhattan. 9 PM. Everything is on."),
    (6.4, 8.5, "Then everything goes dark."),
    (8.8, 11.3, "Every power plant on Earth. Offline."),
    (11.6, 14.1, "Hour 1. Traffic lights are dead."),
    (14.4, 16.9, "Hospitals switch to backup generators."),
    (17.2, 19.7, "Cell towers run on batteries. Most last only hours."),
    (20.0, 22.5, "Day 1. Candles come out."),
    (22.8, 25.3, "Card readers are dead. Cash only."),
    (25.6, 28.1, "A full freezer keeps food frozen for about 48 hours."),
    (28.4, 30.9, "Day 3. In tall buildings, the taps run dry."),
    (31.2, 33.7, "Gas pumps need electricity too."),
    (34.0, 36.5, "Neighbours start sharing what they have."),
    (36.8, 39.3, "Day 5. The city is darker than in a century."),
    (39.6, 42.1, "Above it: the Milky Way."),
    (42.4, 44.9, "Offices, schools, trains. All stopped."),
    (45.2, 47.9, "Day 7. The grid flickers back."),
    (48.2, 50.9, "Plot twist: it happened before."),
    (51.2, 53.9, "1859. A solar storm lit up the sky, even in the Caribbean."),
    (54.2, 56.9, "Telegraph wires sparked. Some kept working without batteries."),
    (57.2, 60.3, "A storm like that today could cut power for weeks."),
    (60.6, 63.4, "Would you be ready?"),
]

GRADE = dict(tonemap=1.0, exposure=1.05, contrast=1.08, saturation=1.05, vignette=0.3, grain=0.03, warmth=0.05)
NIGHT = dict(env="night", envI=0.45, skyTop="#050916", skyHorizon="#1a2240", skyBottom="#07080a", light=0.0, ambient=0.14,
             ambientColor="#8296d4", sunDir=[0.2, 0.5, -0.6], stars=0.15)
DAY = dict(env="day", envI=0.75, skyTop="#6f9fe0", skyHorizon="#e6eef7", skyBottom="#4b6a3a", light=1.1, ambient=0.45,
           ambientColor="#eef3ff", lightColor="#fff4e0", sunDir=[0.5, 0.6, -0.4], stars=0.0, exposure=0.92)
LIT = dict(cityLights=1.0, lamps=1.0, signals=1.0, headlights=1.0)
DARK = dict(cityLights=0.0, lamps=0.0, signals=0.0)

BOLT = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#fff3c9" stop-opacity=".95"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/><path d="M18 -110 L-58 12 L-6 12 L-22 110 L60 -18 L6 -18 Z" fill="#fff8e0"/>'''


def mix(*ds, **kw):
    out = {}
    for d in ds:
        out.update(d)
    out.update(kw)
    return out


def build(v):
    v.title_until(3.2, BOLT)
    # S1 hook: POV on a busy Manhattan street at night, phone in hand
    v.key(0, 0, **mix(NIGHT, LIT, GRADE, set="street", crowd=1.0, traffic=1.0, panic=0.0, jam=0.0))
    v.shot(0, [7.6, 1.65, 6], [3, 3.5, -40], to_pos=[7.6, 1.65, 3], length=3.2, bob=0.5, fov=52)
    v.hands(0, "hold_low", 0, item="phone", phoneUI="feed")
    # S2 looking up at the lit towers
    v.shot(3.2, [-3, 1.7, 4], [8, 40, -400], to_look=[-8, 55, -400], length=2.8, bob=0.0, fov=50)
    v.hands(3.2, "hidden", 0.3)
    # S3 6.0 blackout rolls down the street in waves
    v.shot(6.0, [0, 6, 18], [0, 4, -60], to_pos=[0, 5.5, 14], length=2.6, fov=52, shake=0.25)
    v.key(6.0, 1.2, **mix(DARK, ))
    v.key(6.4, 1.0, shake=0.0, lookUp=1.0)
    v.sfx("impact-bass-2", 5.98, 0.6); v.sfx("glitch-1", 6.0, 0.35)
    # S4 POV phone torch; people stop, headlights only
    v.shot(8.6, [8, 1.65, -2], [4, 1.6, -30], to_pos=[8, 1.65, -5], length=2.8, bob=0.4, fov=52)
    v.hands(8.6, "torch", 0.3, item="phone", torch=1.0, phoneUI="feed")
    # S5 HOUR 1 traffic jam at dead traffic lights
    v.shot(11.4, [-1.5, 1.5, -20], [1.5, 1.2, -60], to_pos=[-1.5, 1.5, -23], length=2.8, bob=0.0, torch=0.0, item="none", jam=1.0, lookUp=0.0)
    v.hands(11.4, "hidden", 0)
    v.sfx("music/horn", 11.8, 0.35); v.sfx("music/horn", 13.0, 0.25)
    # S6 hospital on backup power
    v.key(14.2, 0, set="rooms", env="dusk", envI=0.5, power=0.0, backup=1.0, candles=0.0, fridge=0.0, offline=0.0)
    v.shot(14.2, [1.7, 1.6, 1.6], [-1.3, 1.0, -1.8], to_pos=[1.4, 1.55, 1.2], length=2.8, fov=48, dof=0.3, focus=3.2)
    # S7 phone: no signal -> 2 % battery
    v.key(17.0, 0, **mix(NIGHT, DARK, set="street", jam=1.0, crowd=0.6))
    v.shot(17.0, [7.6, 1.65, -8], [7.4, 1.0, -26], length=2.8, fov=50, dof=0.6, focus=0.42)
    v.hands(17.0, "hold", 0, item="phone", phoneUI="nosignal")
    v.key(18.4, 0, phoneUI="battery")
    # S8 DAY 1 living room by candlelight
    v.key(19.8, 0, set="rooms", env="night", envI=0.3, power=0.0, backup=0.0, candles=1.0)
    v.shot(19.8, [301.7, 1.35, 1.6], [300, 0.7, -1.4], to_pos=[301.3, 1.3, 1.2], length=2.8, fov=48, dof=0.35, focus=2.6)
    v.hands(19.8, "hidden", 0, item="none")
    # S9 supermarket in the dark, card declined
    v.key(22.6, 0, set="supermarket", fruit=0.5, price=0.3, queue=1.0, panic=0.6, soldout=0.0, exposure=0.45, warmth=0.1)
    v.shot(22.6, [6.3, 1.6, 3.4], [6.2, 1.0, -2], length=2.8, fov=50, dof=0.5, focus=0.45)
    v.hands(22.6, "hold", 0, item="phone", phoneUI="declined")
    # S10 kitchen: fridge dark, food thawing
    v.key(25.4, 0, set="rooms", env="day", envI=0.4, power=0.0, candles=0.0, fridge=0.0, tapDrip=1.0, exposure=0.95, daylight=0.9)
    v.shot(25.4, [180.6, 1.6, 1.3], [181.6, 1.0, -2.0], to_pos=[180.8, 1.55, 0.9], length=2.8, fov=48)
    v.hands(25.4, "reach", 0.3, item="none")
    # S11 DAY 3 the tap runs dry
    v.shot(28.2, [180.5, 1.45, -1.4], [180.6, 0.95, -2.1], length=2.8, fov=44, dof=0.6, focus=0.75, tapDrip=0.0)
    v.hands(28.2, "reach", 0.3)
    # S12 cars stuck: no fuel (day)
    v.key(31.0, 0, **mix(DAY, DARK, set="street", jam=1.0, headlights=0.0, crowd=0.8, lookUp=0.0))
    v.shot(31.0, [4.5, 1.6, -15], [-3, 1.2, -60], to_pos=[4.5, 1.6, -19], length=2.8, fov=50)
    v.hands(31.0, "hidden", 0, item="none")
    # S13 neighbours together on the sidewalk
    v.shot(33.8, [-4.0, 1.7, -30], [-8.5, 1.3, -50], to_pos=[-4.2, 1.7, -33], length=2.8, fov=50, dof=0.3, focus=12)
    # S14 DAY 5 the dark city from above, stars
    v.key(36.6, 0, **mix(NIGHT, DARK, set="street", stars=1.0, jam=1.0, headlights=0.0, crowd=0.3, exposure=1.1))
    v.shot(36.6, [0, 70, 40], [0, 0, -140], to_pos=[10, 80, 20], length=2.8, fov=55, mblur=0.5)
    # S15 the Milky Way over the bay
    v.key(39.4, 0, **mix(NIGHT, set="coast", stars=1.0, milkyway=0.9, moon=0.0, cityLights=0.0, lamps=0.0, crowd=0.4, tide=0.6, mblur=0.0))
    v.shot(39.4, [0, 1.7, 22], [-20, 120, -400], to_look=[-10, 150, -400], length=2.8, fov=55)
    # S16 dark office
    v.key(42.2, 0, set="rooms", env="day", envI=0.35, power=0.0, offline=0.0, candles=0.0, exposure=1.15, daylight=0.6)
    v.shot(42.2, [244, 1.75, 3], [238, 0.8, -5], to_pos=[243, 1.7, 2], length=2.8, fov=52)
    # S17 DAY 7 the grid returns block by block, people cheer
    v.key(45.0, 0, **mix(NIGHT, DARK, set="street", jam=0.0, headlights=1.0, crowd=1.0, panic=0.0, stars=0.6))
    v.shot(45.0, [0, 6, 18], [0, 5, -60], to_pos=[0, 5.5, 13], length=3.0, fov=52)
    v.key(45.4, 2.2, **mix(LIT, stars=0.1))
    v.sfx("music/cheer", 46.0, 0.45); v.sfx("sparkle", 45.4, 0.4)
    # S18 PLOT TWIST: telegraph office 1859, sparks
    v.key(48.0, 0, set="rooms", env="night", envI=0.3, power=0.0, sparks=1.0, aurora=1.0, warmth=0.35, saturation=0.9)
    v.shot(48.0, [121.4, 1.5, 0.9], [120.1, 0.9, -1.7], to_pos=[121.1, 1.45, 0.5], length=3.0, fov=48, dof=0.4, focus=2.2)
    v.sfx("music/spark", 48.4, 0.5); v.sfx("music/spark2", 49.6, 0.4)
    # S19 aurora over palm trees (Caribbean)
    v.key(51.0, 0, **mix(NIGHT, set="coast", stars=1.0, milkyway=0.0, aurora=0.85, moon=0.0, cityLights=0.0, lamps=0.0, crowd=0.0, warmth=0.1, saturation=1.1))
    v.shot(51.0, [-30, 1.7, 30], [-10, 90, -300], to_look=[10, 100, -300], length=3.0, fov=55)
    # S20 close on the telegraph key, sparks
    v.key(54.0, 0, set="rooms", env="night", envI=0.3, power=0.0, sparks=1.0, aurora=1.0, warmth=0.35)
    v.shot(54.0, [120.6, 1.15, -1.0], [120.15, 0.85, -1.72], length=3.0, fov=40, dof=0.7, focus=0.8)
    v.sfx("music/spark", 54.3, 0.5); v.sfx("music/spark2", 55.8, 0.45)
    # S21 Earth from space, day side, a storm could hit again
    v.key(57.0, 0, set="space", earthSun=1.0, earthLights=1.0, earthIce=0.0, spaceMoon=0.0, spaceCam=[0, 3, 40], warmth=0.0, saturation=1.0)
    v.key(57.01, 3.4, spaceCam=[9, 5, 28])
    # S22 back to the lit street (loops into the start)
    v.key(60.5, 0, **mix(NIGHT, LIT, set="street", jam=0.0, crowd=1.0, stars=0.15))
    v.shot(60.5, [7.6, 1.65, 9], [3, 3.5, -40], to_pos=[7.6, 1.65, 6], length=3.0, bob=0.5, fov=52)
    v.hands(60.5, "hold_low", 0.3, item="phone", phoneUI="feed")

    # widget: the time grid
    v.widget(0, 6.0, "THE GRID FAILS IN", "MANHATTAN · 9:00 PM", "sec", 6.0, 0)
    v.widget(6.0, 11.4, "POWER RETURNS IN", "EVERY POWER PLANT OFFLINE", "days", 7.0, 6.998)
    v.widget(11.4, 19.8, "POWER RETURNS IN", "HOUR 1", "days", 6.958, 6.93)
    v.widget(19.8, 28.2, "POWER RETURNS IN", "DAY 1", "days", 6.0, 5.95)
    v.widget(28.2, 36.6, "POWER RETURNS IN", "DAY 3", "days", 4.0, 3.95)
    v.widget(36.6, 45.0, "POWER RETURNS IN", "DAY 5", "days", 2.0, 1.95)
    v.widget(45.0, 48.0, "POWER", "AFTER 7 DAYS", "text", value="BACK")
    v.widget(48.0, 57.0, "SOLAR STORM", "THE CARRINGTON EVENT", "text", value="1859")

    # sound: no voice; ambience, music, effects
    m = "music/"
    v.ambient(m + "citynight", 0, 6.05, 0.5, 0.05)
    v.ambient("crowd", 0, 6.05, 0.35, 0.05)
    v.ambient(m + "tense", 6.0, 28.4, 0.5, 0.6, offset=4)
    v.ambient(m + "siren", 8.6, 14.2, 0.18, 0.8)
    v.ambient("crowd", 11.4, 14.2, 0.2, 0.4, offset=10)
    v.ambient(m + "melancholy", 28.2, 45.2, 0.55, 1.2)
    v.ambient("wind", 36.6, 42.2, 0.2, 0.6)
    v.ambient(m + "hope", 45.0, 48.2, 0.6, 0.4, offset=20)
    v.ambient(m + "history", 48.0, 63.6, 0.55, 1.0, offset=20)
    v.ambient(m + "citynight", 60.5, 67.5, 0.35, 1.0)
    for t in (14.1, 19.7, 22.5, 25.3, 31.0, 36.5, 39.3, 42.1, 48.0, 51.0, 57.0, 60.4):
        v.sfx("whoosh-short", t, 0.2)
