"""What if the Sun disappeared for 3 months?  (cinematic 3D style, cinema_kit)"""
TITLE = "What if the Sun disappeared for 3 months?"
TITLE_KEY = "Sun"
KEY_COLOR = "#ffcf6e"
SUB = "EVERY BIT OF LIFE ON EARTH\nRUNS ON SUNLIGHT"
CTA = "SEND THIS TO SOMEONE\nWHO HATES WINTER."
HANDLE = "@manwhat.3"
VOICE = "am_michael"
SPEED = 1.05

# (id, beat, on-screen text, highlighted words, spoken text if different)
LINES = [
    ("h1", "hook", "What if the Sun disappeared... for 3 months?", [], "What if the Sun disappeared... for three months?"),
    ("p1", "hook", "You're in Hyde Park, London. A warm summer evening.", []),
    ("g1", "gone", "Then... the Sun is gone.", []),
    ("h2", "gone", "Its gravity stays. Only the light is gone.", []),

    ("m1", "min8", "For 8 minutes, nothing happens.", [], "For eight minutes, nothing happens."),
    ("m2", "min8", "That's how long sunlight takes to reach us.", []),

    ("d1a", "day1", "Day 1.", [], "Day one."),
    ("d1b", "day1", "Half the planet wakes up... to total darkness.", []),
    ("d1c", "day1", "Even the Moon goes dark. It only reflects sunlight.", []),

    ("d3a", "day3", "Day 3.", [], "Day three."),
    ("d3b", "day3", "Most of the planet drops below freezing.", []),
    ("d3c", "day3", "Without light, plants stop making food.", []),

    ("mo1a", "month1", "Month 1.", [], "Month one."),
    ("mo1b", "month1", "Lakes and rivers freeze over.", []),
    ("mo1c", "month1", "Crops are gone. The food chain starts to collapse.", []),

    ("mo2a", "month2", "Month 2.", [], "Month two."),
    ("mo2s", "month2", "From space, Earth is now a dark, frozen marble.", []),
    ("mo2d", "month2", "But deep down, the oceans stay liquid for thousands of years.", []),

    ("mo3a", "month3", "Month 3.", [], "Month three."),
    ("mo3b", "month3", "Survivors live underground, heated by the Earth itself.", []),

    ("bk1", "back", "Then... the Sun is back.", []),
    ("bk2", "back", "8 minutes later, light hits a frozen planet.", [], "Eight minutes later, light hits a frozen planet."),

    ("t1", "twist", "Plot twist.", []),
    ("t2", "twist", "This sort of happened in 1816.", [], "This sort of happened in eighteen sixteen."),
    ("t3", "twist", "A volcano had dimmed the Sun...", []),
    ("t4", "twist", "and it snowed in June.", []),
    ("t5", "twist", "They called it the Year Without a Summer.", []),

    ("o1", "outro", "Would you survive 3 months of darkness?", [], "Would you survive three months of darkness?"),
]


SUN_ICON = '''<defs><radialGradient id="sg"><stop offset="0" stop-color="#fff7d6"/><stop offset=".35" stop-color="#ffd27a"/>
<stop offset=".62" stop-color="#ff9f43" stop-opacity=".55"/><stop offset="1" stop-color="#ff9f43" stop-opacity="0"/></radialGradient></defs>
<circle r="190" fill="url(#sg)"/><circle r="62" fill="#fff3c9"/>''' + "".join(
    f'<line x1="0" y1="-84" x2="0" y2="-118" stroke="#ffe3a3" stroke-width="5" stroke-linecap="round" transform="rotate({a})"/>'
    for a in range(0, 360, 30))


def build(v):
    L, E, W, B = v.L, v.E, v.W, v.beat
    gone = W("g1", "gone")
    day1, day3, mo1, mo2, mo3, back, twist, outro = (B(n) for n in
                                                     ("day1", "day3", "month1", "month2", "month3", "back", "twist", "outro"))
    sun_back = W("bk1", "back")
    v.no_caption.add("h1")
    v.title_until(L("p1") + 0.5, SUN_ICON)

    # ---- world: warm summer evening in a city park
    v.key(0, 0, camPos=[0.5, 1.75, 9], camLook=[-2, 7, -60], skyTop="#7c8cb6", skyHorizon="#efc9a8", skyBottom="#3c4a2f",
          sunDir=[0.3, 0.3, -1], lightColor="#ffd59a", ambient=0.85, ambientColor="#e6e3ff", cityLights=0.25)
    v.key(0.1, gone - 0.2, camPos=[0.3, 1.75, 6.5])                    # slow dolly in
    v.key(gone, 0.7, sun=0.0)                                         # the Sun vanishes (light still on its way)
    v.sfx("impact-bass-1", gone - 0.05, 0.55)
    v.key(B("min8"), E("m2") - B("min8"), camPos=[-2.5, 1.75, 3], camLook=[-6, 8, -60])
    # Day 1: night falls everywhere, the Moon goes dark
    v.key(day1 - 0.45, 1.0, skyTop="#03050d", skyHorizon="#0c1330", skyBottom="#040604", light=0.0, ambient=0.2,
          ambientColor="#7088d0", cityLights=1.0, stars=1.0, moonShow=1.0, camPos=[0, 1.7, 5], camLook=[8, 24, -60])
    v.sfx("whoosh", day1 - 0.25, 0.4)
    v.key(W("d1c", "dark"), 1.6, moon=0.0)
    # Day 3: frost and first snow
    v.key(day3 - 0.2, 1.6, frost=0.5, snow=0.65, people=0.45, cityLights=0.7, ambient=0.32, ambientColor="#a8bdf0",
          cold=0.25, skyHorizon="#1a2442", camPos=[1.5, 1.7, 4], camLook=[0, 6, -60], moonShow=0.0)
    v.sfx("whoosh-short", day3 - 0.2, 0.35)
    # Month 1: frozen pond, empty park
    v.key(mo1 - 0.2, 1.4, frost=0.92, pondIce=1.0, snow=0.9, people=0.12, cityLights=0.25, ambient=0.36,
          camPos=[-6, 4.2, -12], camLook=[-16, 0, -34])
    v.sfx("whoosh", mo1 - 0.2, 0.35)
    # Month 2: from space
    v.key(mo2 - 0.1, 0, set="space", spaceCam=[0, 1, 36])
    v.key(mo2, E("mo2d") - mo2, spaceCam=[7, 4, 25], earthIce=0.9, earthAmb=0.45)
    v.sfx("whoosh", mo2 - 0.15, 0.45)
    # Month 3: survivors underground
    v.key(mo3 - 0.1, 0, set="park", frost=1.0, snow=0.45, people=0.0, cityLights=0.0, bunker=1.0, ambient=0.26,
          camPos=[-2, 3.0, 4], camLook=[5, 1.5, -15])
    v.sfx("whoosh-short", mo3 - 0.15, 0.35)
    # Back: the Sun returns over a frozen world
    v.key(back - 0.2, 0.8, camPos=[0, 1.75, 7], camLook=[-4, 12, -60], bunker=0.3)
    v.key(sun_back, 1.4, sun=1.0, light=0.95, lightColor="#fff0d2", skyTop="#86a8e0", skyHorizon="#f6e2c8", skyBottom="#dfe7f2",
          ambient=1.0, ambientColor="#eef3ff", stars=0.0, snow=0.0, cold=0.0, sunDir=[0.25, 0.22, -1])
    v.sfx("sparkle", sun_back, 0.5)
    v.sfx("riser", sun_back - 6.0, 0.22)
    # Plot twist: 1816, a volcano dims the Sun, snow in June
    v.key(twist - 0.1, 0, frost=0.05, pondIce=0.0, people=0.7, bunker=0.0, cityLights=0.1, sun=0.35, light=0.45,
          skyTop="#8b939e", skyHorizon="#c7bfb3", skyBottom="#45503a", ambient=0.75, ambientColor="#e9e4dc",
          volcano=1.0, city=0.0, camPos=[12, 2.2, 2], camLook=[-150, 75, -420], sunDir=[-0.3, 0.25, -1])
    v.sfx("whoosh", twist - 0.15, 0.45)
    v.key(W("t3", "volcano"), 3.0, ash=1.0, skyTop="#6d6b6a", skyHorizon="#a8a096", light=0.25)
    v.key(W("t4", "snowed") - 0.3, 1.2, camPos=[0.5, 1.75, 6], camLook=[-2, 7, -60], snow=0.85)
    v.key(W("t4", "snowed"), 3.0, frost=0.4)
    # Outro: dark again, city lights
    v.key(outro - 0.1, 1.5, skyTop="#03050d", skyHorizon="#0c1330", skyBottom="#040604", light=0.0, sun=0.0, ambient=0.22,
          ambientColor="#7088d0", stars=1.0, snow=0.0, frost=0.0, volcano=0.0, ash=0.0, city=1.0, cityLights=1.0, people=0.6,
          camPos=[0, 1.7, 7], camLook=[0, 14, -60])

    # ---- left widget (countdown)
    v.widget(0, gone, "SUN DISAPPEARS IN", "93 MILLION MILES AWAY", "sec", gone, 0)
    v.widget(gone, day1, "SUN RETURNS IN", "LAST SUNLIGHT STILL ARRIVING", "days", 90, 89.9944)
    v.widget(day1, day3, "SUN RETURNS IN", "DAY 1 OF 90", "days", 89.0, 87.6)
    v.widget(day3, mo1, "SUN RETURNS IN", "DAY 3 OF 90", "days", 87.0, 80.0)
    v.widget(mo1, mo2, "SUN RETURNS IN", "MONTH 1 · FROZEN LAKES", "days", 60.0, 45.0)
    v.widget(mo2, mo3, "SUN RETURNS IN", "MONTH 2 · VIEW FROM SPACE", "days", 30.0, 12.0)
    v.widget(mo3, sun_back, "SUN RETURNS IN", "MONTH 3 · UNDERGROUND", "days", 1.0, 0.0)
    v.widget(sun_back, twist, "SUN", "AFTER 90 DAYS OF DARKNESS", "text", value="BACK")
    v.widget(W("t2", "1816"), outro, "THE YEAR WITHOUT A SUMMER", "MOUNT TAMBORA ERUPTED IN 1815", "text", value="1816")
