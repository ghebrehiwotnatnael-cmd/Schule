"""What if the Sun disappeared for 3 months?  POV version: no voice, ambience + music bed, 17 shots."""
TITLE = "What if the Sun disappeared for 3 months?"
TITLE_KEY = "Sun"
KEY_COLOR = "#ffcf6e"
SUB = "SUNLIGHT TAKES 8 MIN 20 S TO REACH EARTH\nWITHOUT IT, THE SURFACE WOULD FALL BELOW -18 °C IN A WEEK"
CTA = "SEND THIS TO SOMEONE\nWHO HATES WINTER."
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 64.6

CAPTIONS = [
    (3.6, 6.7, "You're in Hyde Park, London. A warm summer evening."),
    (7.2, 9.6, "The Sun is gone."),
    (9.8, 12.9, "For 8 minutes, nothing changes."),
    (13.8, 16.4, "Then the light runs out."),
    (16.7, 19.8, "Day 1. Even the Moon goes dark."),
    (20.2, 23.3, "Everyone heads inside."),
    (23.7, 27.3, "Day 3. Below freezing, everywhere."),
    (27.7, 30.9, "Month 1. The lakes freeze solid."),
    (31.2, 34.3, "Nothing grows anymore."),
    (34.7, 37.9, "The power grid starts to fail."),
    (38.2, 42.3, "Month 2. From space, Earth goes dark."),
    (42.7, 46.8, "Month 3. Life moves underground."),
    (47.2, 50.8, "Day 90."),
    (51.4, 54.2, "Then... it's back."),
    (54.5, 57.4, "8 minutes later, light hits a frozen world."),
    (57.7, 60.9, "This happened before. In 1816, a volcano dimmed the Sun."),
    (61.2, 64.4, "It snowed in June. The Year Without a Summer."),
]

SUN_ICON = '''<defs><radialGradient id="sg"><stop offset="0" stop-color="#fff7d6"/><stop offset=".35" stop-color="#ffd27a"/>
<stop offset=".62" stop-color="#ff9f43" stop-opacity=".55"/><stop offset="1" stop-color="#ff9f43" stop-opacity="0"/></radialGradient></defs>
<circle r="190" fill="url(#sg)"/><circle r="62" fill="#fff3c9"/>''' + "".join(
    f'<line x1="0" y1="-84" x2="0" y2="-118" stroke="#ffe3a3" stroke-width="5" stroke-linecap="round" transform="rotate({a})"/>'
    for a in range(0, 360, 30))

NIGHT = dict(skyTop="#03050d", skyHorizon="#0c1330", skyBottom="#040604", light=0.0, ambient=0.16, ambientColor="#6f86c9")


def build(v):
    v.title_until(3.4, SUN_ICON)

    # S1 0-3.4 POV picnic with an ice cream, summer evening
    v.key(0, 0, skyTop="#7c8cb6", skyHorizon="#efc9a8", skyBottom="#3c4a2f", sunDir=[0.25, 0.35, -1], lightColor="#ffd59a",
          ambient=0.85, ambientColor="#e6e3ff", cityLights=0.2, birds=1.0, item="cone")
    v.hands(0, "hold_low", 0)
    v.shot(0, [0.2, 1.62, 8.5], [-1, 3, -40], to_pos=[0.2, 1.62, 7.6], to_look=[-1.5, 3.5, -40], length=3.4)
    # S2 3.4-7 look up at the Sun; people look up and point
    v.shot(3.4, [0, 1.65, 6], [10, 20, -60], to_look=[22, 33, -86], length=3.6)
    v.key(3.9, 1.2, lookUp=1.0, point=1.0)
    v.hands(3.4, "hidden", 0.5)
    # 7.0 the Sun vanishes, birds scatter
    v.key(7.0, 0.25, sun=0.0)
    v.key(7.0, 0, flash=0.55)
    v.key(7.01, 0.5, flash=0.0)
    v.key(7.0, 3.0, scatter=1.0)
    v.sfx("impact-bass-1", 6.95, 0.6)
    # S3 9.6-13 wide crowd, phones out, still bright
    v.shot(9.6, [7, 4.2, 9], [-3, 1.2, -25], to_pos=[5.5, 3.6, 7], length=3.4, phones=1.0, item="none")
    v.sfx("whoosh-short", 9.5, 0.3)
    # S4 13-16.5 POV: the light runs out
    v.shot(13.0, [0.5, 1.65, 4], [6, 12, -60], to_look=[4, 9, -60], length=3.5)
    v.hands(13.0, "shield", 0.5, shake=0.4)
    v.key(13.6, 0.9, stars=1.0, **NIGHT)
    v.key(14.4, 1.2, lamps=1.0, cityLights=1.0, headlights=1.0)
    v.key(15.5, 0.6, shake=0.0)
    v.sfx("impact-bass-2", 13.55, 0.5)
    # S5 16.5-20 Day 1: phone torch, the Moon goes dark
    v.shot(16.5, [-2, 1.65, 2], [40, 120, -300], to_look=[60, 140, -320], length=3.5, moonShow=1.0, moon=1.0,
           moonPos=[120, 300, -700], birds=0.0)
    v.hands(16.5, "torch", 0.35, item="phone", torch=1.0)
    v.key(17.8, 1.6, moon=0.0)
    v.sfx("whoosh", 16.4, 0.3)
    # S6 20-23.5 aerial: people leave, cars stream away
    v.shot(20.0, [30, 1.7, -135], [-140, 22, -250], to_pos=[24, 1.7, -135], length=3.5, flee=0.0, torch=0.0, item="none", lookUp=0.0, point=0.0)
    v.hands(20.0, "hidden", 0)
    v.key(20.1, 3.4, flee=1.0, people=0.55, traffic=2.2)
    v.sfx("whoosh-short", 19.9, 0.3)
    # S7 23.5-27.5 Day 3: freezing POV, breath, snow
    v.shot(23.5, [0.5, 1.6, 3], [-2, 4, -60], to_pos=[0.5, 1.6, 1.5], length=4.0, frost=0.5, snow=0.7, people=0.3, flee=0.0,
           breath=1.0, frostLens=0.45, shiver=1.0, cityLights=0.7, cold=0.25, ambient=0.3, ambientColor="#a8bdf0")
    v.hands(23.5, "warm", 0.4)
    v.sfx("whoosh", 23.4, 0.3)
    # S8 27.5-31 Month 1: low shot, the pond freezes
    v.shot(27.5, [-7, 0.7, -20], [-16, 0.2, -34], to_pos=[-8, 0.9, -23], length=3.5, frost=0.9, snow=0.85, people=0.1,
           breath=0.0, frostLens=0.0, shiver=0.0)
    v.hands(27.5, "hidden", 0)
    v.key(27.7, 3.0, pondIce=1.0)
    v.sfx("whoosh-short", 27.4, 0.3)
    # S9 31-34.5 POV walking onto the ice in a blizzard
    v.shot(31.0, [-12, 1.65, -24], [-20, 1.2, -60], to_pos=[-14, 1.65, -30], length=3.5, bob=0.7, wind=0.6, snow=1.0,
           frostLens=0.7, breath=0.8, shiver=0.6)
    v.hands(31.0, "warm", 0.3)
    # S10 34.5-38 the grid fails: towers go dark in steps
    v.shot(34.5, [12, 1.6, -132], [-30, 120, -420], to_look=[-20, 150, -420], length=3.5, bob=0.0, wind=0.25, frostLens=0.3,
           breath=0.0, shiver=0.0, snow=0.6)
    v.hands(34.5, "hidden", 0)
    v.key(35.0, 2.6, cityLights=0.0, lamps=0.0, headlights=0.0)
    v.sfx("glitch-1", 35.0, 0.35)
    # S11 38-42.5 Month 2: Earth from space, lights fading, ice spreading
    v.key(38.0, 0, set="space", spaceCam=[0, 3, 40], earthSun=0.0, earthLights=1.0, earthIce=0.2)
    v.key(38.01, 4.4, spaceCam=[8, 5, 27], earthLights=0.12, earthIce=0.85)
    v.sfx("whoosh", 37.9, 0.45)
    # S12 42.5-47 Month 3: bunker, warming hands at the fire
    v.key(42.5, 0, set="bunker")
    v.shot(42.5, [0.4, 1.45, -1.6], [0.5, 0.9, -5], to_pos=[0.4, 1.4, -2.1], length=4.5, frostLens=0.0, snow=0.0)
    v.hands(42.5, "warm", 0.3, breath=0.25)
    v.sfx("whoosh-short", 42.4, 0.3)
    # S13 47-51 Day 90: outside in the dark frozen park, countdown
    v.key(47.0, 0, set="park", frost=1.0, hatch=1.0, people=0.0, snow=0.15, cityLights=0.0, breath=0.7, pondIce=1.0)
    v.shot(47.0, [-1.5, 1.65, -9], [-6, 8, -80], to_pos=[-2.5, 1.65, -11], length=4.0)
    v.hands(47.0, "hidden", 0.3)
    v.sfx("riser", 41.0, 0.25)
    # S14 51 the Sun is back: flash, hands up
    v.key(51.0, 0, flash=1.0, sun=1.0, light=0.95, lightColor="#fff0d2", skyTop="#86a8e0", skyHorizon="#f6e2c8",
          skyBottom="#dfe7f2", ambient=1.0, ambientColor="#eef3ff", stars=0.0, snow=0.0, cold=0.0, sunDir=[0.1, 0.12, -1])
    v.key(51.02, 1.4, flash=0.0)
    v.hands(51.0, "shield", 0.25, shake=0.3, breath=0.0)
    v.key(52.2, 0.8, shake=0.0)
    v.sfx("impact-bass-2", 50.98, 0.55)
    v.sfx("sparkle", 51.1, 0.45)
    # S15 54.3-57.5 drone shot over the frozen white city
    v.shot(54.3, [25, 28, 12], [-15, 4, -140], to_pos=[18, 34, 0], length=3.2, hatch=0.0)
    v.hands(54.3, "hidden", 0)
    v.sfx("whoosh", 54.2, 0.3)
    # S16 57.5-61 1816: village, the volcano erupts
    v.key(57.5, 0, city=0.0, village=1.0, frost=0.05, pondIce=0.0, people=0.45, sun=0.4, light=0.45, volcano=1.0,
          skyTop="#8b939e", skyHorizon="#c7bfb3", skyBottom="#45503a", ambient=0.75, ambientColor="#e9e4dc", sunDir=[-0.3, 0.25, -1])
    v.shot(57.5, [12, 2.2, 2], [-150, 75, -420], to_pos=[10, 2.2, 0], length=3.5)
    v.key(57.7, 3.0, ash=1.0, skyTop="#6d6b6a", skyHorizon="#a8a096", light=0.25)
    v.sfx("impact-bass-1", 57.6, 0.4)
    # S17 61-64.6 POV: snow in June on green grass
    v.shot(61.0, [0.5, 1.65, 6], [-2, 5, -60], to_pos=[0.5, 1.65, 5.2], length=3.6, snow=0.8, walk=0.4)
    v.hands(61.0, "reach", 0.5)
    v.key(61.5, 3.0, frost=0.35)

    # ---- widget
    v.widget(0, 7.0, "SUN DISAPPEARS IN", "HYDE PARK · LONDON", "sec", 7.0, 0)
    v.widget(7.0, 16.5, "SUN RETURNS IN", "LAST LIGHT STILL ARRIVING", "days", 90, 89.9935)
    v.widget(16.5, 23.5, "SUN RETURNS IN", "DAY 1 OF 90", "days", 89.0, 88.7)
    v.widget(23.5, 27.5, "SUN RETURNS IN", "DAY 3 OF 90", "days", 87.0, 86.8)
    v.widget(27.5, 34.5, "SUN RETURNS IN", "MONTH 1 · DAY 30", "days", 60.0, 58.5)
    v.widget(34.5, 38.0, "SUN RETURNS IN", "MONTH 1 · DAY 45", "days", 45.0, 44.5)
    v.widget(38.0, 42.5, "SUN RETURNS IN", "MONTH 2 · DAY 60", "days", 30.0, 28.0)
    v.widget(42.5, 47.0, "SUN RETURNS IN", "MONTH 3 · DAY 85", "days", 5.0, 4.0)
    v.widget(47.0, 51.0, "SUN RETURNS IN", "DAY 90", "sec", 4.0, 0)
    v.widget(51.0, 57.5, "SUN", "AFTER 90 DAYS IN THE DARK", "text", value="BACK")
    v.widget(57.5, 64.6, "THE YEAR WITHOUT A SUMMER", "MOUNT TAMBORA ERUPTED IN 1815", "text", value="1816")

    # ---- sound: ambience + music bed, no voice
    v.ambient("birds-evening", 0, 13.8, 0.5, 0.6)
    v.ambient("crowd", 0, 16.5, 0.32, 0.8)
    v.ambient("music-dark", 9.0, 64.6 + 3.5, 0.24, 2.5)
    v.ambient("wind", 23.4, 38.0, 0.5, 0.6)
    v.ambient("space", 38.0, 42.5, 0.45, 0.4)
    v.ambient("fire", 42.5, 47.0, 0.6, 0.3)
    v.ambient("wind", 47.0, 51.0, 0.35, 0.4, offset=20)
    v.ambient("birds-evening", 54.3, 57.5, 0.25, 0.5, offset=60)
    v.ambient("wind", 57.5, 64.6, 0.3, 0.6, offset=30)
