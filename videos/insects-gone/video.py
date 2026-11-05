"""What if all insects disappeared?  POV, no voice, 25 shots, Champ de Mars (Paris)."""
TITLE = "What if all insects disappeared?"
TITLE_KEY = "insects"
KEY_COLOR = "#ffcf6e"
SUB = "ABOUT 75% OF LEADING FOOD CROPS BENEFIT FROM POLLINATORS\nGERMAN RESERVES LOST OVER 75% OF FLYING INSECTS IN 27 YEARS"
CTA = "SEND THIS TO SOMEONE\nWHO HATES BUGS."
HANDLE = "@manwhat.3"
VOICEOVER = False
DURATION = 76.5
WORLD_DEFAULTS = {"heroBee": 1.0, "insects": 1.0, "bloom": 1.0, "blossom": 0.0, "chicks": 1.0, "farmer": 1.0,
                  "fruit": 1.0, "fruitBowl": 1.0, "trapBugs": 1.0}

CAPTIONS = [
    (3.4, 6.2, "The Champ de Mars, Paris. A warm summer evening."),
    (8.8, 11.4, "Every insect. Gone."),
    (11.7, 14.4, "At first, it feels nice. No more bites."),
    (14.7, 17.4, "Most songbirds feed their chicks insects."),
    (17.7, 20.4, "The news can't explain it."),
    (20.7, 23.4, "Week 1. Flowers bloom... for no one."),
    (26.7, 29.4, "Freshwater fish lose their food."),
    (29.7, 32.4, "Month 1. Fruit gets expensive."),
    (32.7, 35.4, "Almonds need bees. Chocolate needs tiny flies."),
    (38.7, 41.4, "Wheat, rice and corn survive. The wind pollinates them."),
    (41.7, 44.4, "Month 6. Nothing breaks down anymore."),
    (47.7, 50.4, "Fewer flowers. Fewer birds."),
    (50.7, 53.4, "Dinner gets boring."),
    (53.7, 56.4, "Year 1. A quieter, greyer planet."),
    (56.7, 59.4, "Some kids have never seen a butterfly."),
    (59.7, 62.4, "Plot twist: this is already happening."),
    (62.7, 68.4, "In parts of China, farmers pollinate pear trees by hand."),
    (68.7, 72.4, "In German nature reserves, flying insects dropped by over 75% in 27 years."),
    (72.7, 76.3, "Every bite of fruit starts with one of them."),
]

EVENING = dict(skyTop="#7c8cb6", skyHorizon="#f2c9a2", skyBottom="#3c4a2f", sunDir=[-0.35, 0.16, -1], lightColor="#ffd39a",
               light=1.05, ambient=0.8, ambientColor="#e6e3ff")
DAY = dict(skyTop="#6f9fe0", skyHorizon="#e6eef7", skyBottom="#4b6a3a", sunDir=[0.4, 0.55, -0.6], lightColor="#fff4e0",
           light=1.0, ambient=0.85, ambientColor="#eef3ff")
GREY = dict(skyTop="#8f99a6", skyHorizon="#c9c6bd", skyBottom="#6b6a5a", light=0.7, ambient=0.75, ambientColor="#e2e2dc")


def build(v):
    v.title_until(3.2, BEE_ICON)
    # 1 HOOK: macro, bee on a flower, Eiffel Tower blurred behind
    v.key(0, 0, set="paris", **EVENING, insects=1.0, bloom=1.0, people=1.0, dof=1.0, focus=0.27, fov=34)
    v.shot(0, [0.06, 0.47, -0.74], [0.0, 0.44, -1.0], to_pos=[0.05, 0.46, -0.79], length=3.2)
    # 2 POV through the meadow, hand brushing the flowers
    v.shot(3.2, [1.5, 1.2, 3.0], [0, 0.4, -6], to_pos=[1.2, 1.15, 1.2], length=3.0, dof=0.25, focus=2.5, fov=52, bob=0.5)
    v.hands(3.2, "reach", 0.3)
    # 3 look up: mosquito swarm, bees, butterflies... then they vanish (counter hits 0 at 7.0)
    v.shot(6.2, [1.2, 1.6, -4], [3, 2.4, -11], to_look=[2.5, 2.8, -11], length=2.4, bob=0.0, dof=0.0)
    v.hands(6.2, "hidden", 0.3)
    v.key(7.0, 0.7, insects=0.0)
    v.sfx("impact-bass-1", 6.95, 0.35)
    # 4 the same macro, empty flower, total silence
    v.shot(8.6, [0.06, 0.47, -0.74], [0.0, 0.44, -1.0], to_pos=[0.07, 0.48, -0.7], length=2.9, dof=1.0, focus=0.27, fov=34)
    # 5 DAY 1 wide: people relax on the lawn
    v.shot(11.5, [9, 3.2, 12], [-4, 1, -30], to_pos=[7, 3.0, 9], length=3.0, dof=0.0, fov=50)
    # 6 bird nest: hungry chicks, mother comes back with nothing
    v.key(14.5, 0, set="nest", **DAY, mother=0.0)
    v.shot(14.5, [0.4, 1.32, -0.3], [0.05, 1.13, -1.2], to_pos=[0.35, 1.3, -0.4], length=3.0, dof=0.8, focus=0.95, fov=40)
    v.key(14.6, 2.8, mother=1.0)
    # 7 Paris flat: family watches the news
    v.key(17.5, 0, set="home", news=1.0, dinner=0.0)
    v.shot(17.5, [-0.7, 1.8, 1.4], [1.4, 1.25, -3.4], to_pos=[-0.4, 1.75, 1.0], length=3.0, dof=0.3, focus=4.2, fov=48)
    # 8 WEEK 1: drone over a blooming orchard, no bees
    v.key(20.5, 0, set="farm", **DAY, insects=0.0, blossom=1.0, china=0.0, dry=0.0)
    v.shot(20.5, [-12, 26, 12], [-26, 2, -22], to_pos=[-22, 18, 2], length=3.0, dof=0.0, fov=50, mblur=0.6)
    # 9 farmer's POV: a blossom, nobody comes
    v.shot(23.5, [-17.6, 2.0, -4.6], [-19.2, 2.5, -7.2], to_look=[-19.0, 2.6, -7.2], length=3.0, mblur=0.0, dof=0.7, focus=2.6, fov=46, farmer=0.0)
    v.hands(23.5, "reach", 0.4)
    # 10 the pond: fish snapping at the surface
    v.shot(26.5, [23, 1.0, -15], [30, 0.1, -20], to_pos=[24, 1.0, -16], length=3.0, dof=0.3, focus=8, fov=46, fish=1.0, farmer=1.0)
    v.hands(26.5, "hidden", 0.2)
    # 11 MONTH 1 supermarket: half-empty fruit, prices up
    v.key(29.5, 0, set="supermarket", fruit=0.35, price=0.0, soldout=1.0, queue=1.0, panic=0.5)
    v.shot(29.5, [-1.6, 1.6, 2.8], [-1.6, 0.7, -2], to_pos=[-1.6, 1.6, 1.4], length=3.0, dof=0.2, focus=2.5, fov=50, bob=0.4)
    v.key(30.2, 1.6, price=1.0)
    v.hands(29.5, "hold_low", 0.3)
    # 12 close-up: almonds & chocolate, SOLD OUT
    v.shot(32.5, [-1.8, 1.7, -5.0], [-3.88, 1.8, -7.2], to_pos=[-2.0, 1.7, -5.6], length=3.0, dof=0.5, focus=3.0, fov=44, bob=0.0)
    v.hands(32.5, "hidden", 0.2)
    # 13 checkout: long queue, overflowing carts
    v.shot(35.5, [10.5, 2.6, 4.5], [7.5, 1.2, -6], to_pos=[10, 2.8, 3.5], length=3.0, dof=0.0, fov=50, mblur=0.5)
    # 14 wheat in the wind (fine)
    v.key(38.5, 0, set="farm", **DAY, insects=0.0, blossom=0.0, fish=0.0)
    v.shot(38.5, [40, 2.3, -40], [40, 0.6, -72], to_pos=[40, 2.2, -43], length=3.0, mblur=0.0, dof=0.3, focus=6, fov=50)
    # 15 MONTH 6 forest floor: leaves and fruit pile up
    v.shot(41.5, [-20, 0.45, -107], [-20, 0.0, -118], to_pos=[-20, 0.4, -109], length=3.0, litter=1.0, dry=0.5, dof=0.6, focus=5, fov=46, **GREY)
    # 16 pasture: dung piles everywhere
    v.shot(44.5, [-74, 0.5, -18], [-76, 0.1, -40], to_pos=[-74, 0.6, -21], length=3.0, dung=1.0, dof=0.4, focus=4, fov=46)
    # 17 back to the Champ de Mars: brown, almost no flowers
    v.key(47.5, 0, set="paris", **GREY, insects=0.0, heroBee=0.0, bloom=0.12, dry=0.85, people=0.45)
    v.shot(47.5, [0, 1.65, 8], [0, 45, -420], to_pos=[0, 1.65, 5], length=3.0, dof=0.0, fov=52, bob=0.5)
    # 18 dinner: bread, rice, potatoes
    v.key(50.5, 0, set="home", news=0.0, dinner=1.0, fruitBowl=0.0)
    v.shot(50.5, [-1.6, 2.1, 1.1], [-1.6, 0.8, -0.5], to_pos=[-1.5, 2.0, 0.8], length=3.0, dof=0.4, focus=2.0, fov=46, bob=0.0)
    # 19 YEAR 1: drone over a grey countryside
    v.key(53.5, 0, set="farm", **GREY, dry=1.0, bare=1.0, blossom=0.0, litter=1.0, dung=1.0, farmer=0.0)
    v.shot(53.5, [10, 60, 40], [-15, 0, -60], to_pos=[-15, 70, 15], length=3.0, dof=0.0, fov=52, mblur=0.6)
    # 20 kid's room: a butterfly only in a picture book
    v.key(56.5, 0, set="home")
    v.shot(56.5, [40.6, 1.4, 0.2], [40, 0.45, -0.62], to_pos=[40.5, 1.3, 0.05], length=3.0, mblur=0.0, dof=0.6, focus=1.15, fov=44)
    # 21 PLOT TWIST: Sichuan pear orchard
    v.key(59.5, 0, set="farm", skyTop="#9fb6c9", skyHorizon="#e5e2d6", skyBottom="#5d7a48", sunDir=[0.3, 0.5, -0.8], lightColor="#fff7e8",
          light=0.95, ambient=0.85, ambientColor="#eef2f0", dry=0.0, bare=0.0, blossom=1.0, china=1.0, litter=0.0, dung=0.0)
    v.shot(59.5, [-14, 4.5, 8], [-30, 2, -15], to_pos=[-18, 4.0, 4], length=3.0, dof=0.0, fov=50)
    # 22 POV on a ladder, brush on a blossom
    v.shot(62.5, [-43.2, 3.1, -5.2], [-46.0, 2.8, -8.0], to_look=[-45.7, 2.9, -8.0], length=3.0, dof=0.8, focus=2.4, fov=44)
    v.hands(62.5, "reach", 0.3)
    # 23 wide: dozens of workers with brushes
    v.shot(65.5, [-28, 3.2, 3], [-38, 2.4, -14], to_pos=[-30, 3.4, 1], length=3.0, dof=0.0, fov=50)
    v.hands(65.5, "hidden", 0.2)
    # 24 German nature reserve: the insect trap, numbers falling
    v.key(68.5, 0, china=0.0, blossom=0.0, trap=1.0, insects=1.0, trapBugs=1.0, **DAY)
    v.shot(68.5, [56, 1.6, -5.5], [60, 1.2, -12], to_pos=[57, 1.6, -7], length=4.0, dof=0.4, focus=6.5, fov=48)
    v.key(68.8, 3.4, trapBugs=0.24)
    # 25 back to the hook flower: one bee lands, the meadow hums again (loops into the start)
    v.key(72.5, 0, set="paris", **EVENING, insects=0.0, heroBee=0.0, bloom=1.0, dry=0.0, people=1.0)
    v.shot(72.5, [0.07, 0.48, -0.7], [0.0, 0.44, -1.0], to_pos=[0.06, 0.47, -0.74], length=4.0, dof=1.0, focus=0.27, fov=34)
    v.key(73.6, 1.0, heroBee=1.0)

    # ---- widget (time grid)
    v.widget(0, 6.6, "INSECTS ON EARTH", "CHAMP DE MARS · PARIS", "count", 1e19, 1e19)
    v.widget(6.6, 7.1, "INSECTS ON EARTH", "CHAMP DE MARS · PARIS", "count", 1e19, 0)
    v.widget(7.1, 11.5, "INSECTS ON EARTH", "EVERY SPECIES", "count", 0, 0)
    v.widget(11.5, 20.5, "TIME WITHOUT INSECTS", "DAY 1", "days", 1.0, 1.35)
    v.widget(20.5, 29.5, "TIME WITHOUT INSECTS", "WEEK 1", "days", 7.0, 8.0)
    v.widget(29.5, 41.5, "TIME WITHOUT INSECTS", "MONTH 1", "days", 30.0, 33.0)
    v.widget(41.5, 53.5, "TIME WITHOUT INSECTS", "MONTH 6", "days", 182.0, 186.0)
    v.widget(53.5, 59.5, "TIME WITHOUT INSECTS", "YEAR 1", "days", 365.0, 367.0)
    v.widget(59.5, 68.5, "HAND POLLINATION", "PEAR ORCHARDS · SICHUAN, CHINA", "text", value="Today")
    v.widget(68.5, 72.5, "FLYING INSECTS · GERMAN RESERVES", "1989 → 2016 · HALLMANN ET AL. 2017", "pct", 0, -76)
    v.widget(72.5, 76.5, "INSECTS ON EARTH", "STILL HERE. FOR NOW.", "count", 1e19, 1e19)
    sound(v)


BEE_ICON = '''<defs><radialGradient id="bg"><stop offset="0" stop-color="#fff3c9" stop-opacity=".9"/><stop offset="1" stop-color="#ffcf6e" stop-opacity="0"/></radialGradient></defs>
<circle r="170" fill="url(#bg)"/>
<ellipse cx="-38" cy="-52" rx="46" ry="30" fill="#ffffff" fill-opacity=".75" transform="rotate(-25 -38 -52)"/>
<ellipse cx="34" cy="-56" rx="46" ry="30" fill="#ffffff" fill-opacity=".75" transform="rotate(25 34 -56)"/>
<ellipse cx="0" cy="0" rx="58" ry="40" fill="#f4b81c"/>
<rect x="-22" y="-40" width="14" height="80" fill="#1d1a14"/><rect x="8" y="-40" width="14" height="80" fill="#1d1a14"/>
<circle cx="62" cy="-4" r="22" fill="#1d1a14"/>'''


def sound(v):
    m = "music/"
    # music: warm -> (silence) -> tense -> somber -> hope
    v.ambient(m + "warm", 0, 7.05, 0.5, 0.05)
    v.ambient(m + "tense", 11.3, 41.7, 0.55, 1.5, offset=10)
    v.ambient(m + "somber", 41.3, 59.7, 0.5, 1.2, offset=15)
    v.ambient(m + "hope", 59.3, 80.5, 0.55, 1.5, offset=35)
    # the meadow hums... and stops dead at 7.0
    v.ambient(m + "bees2", 0, 7.05, 0.7, 0.05, offset=2)
    v.ambient(m + "birds", 0, 7.05, 0.35, 0.05)
    v.ambient(m + "crickets", 0, 7.05, 0.3, 0.05)
    v.ambient(m + "coldwind", 7.1, 11.5, 0.12, 1.0)
    v.ambient(m + "birds2", 11.5, 14.5, 0.25, 0.4)
    v.ambient(m + "birds", 14.5, 17.5, 0.35, 0.3)          # chicks begging
    v.ambient(m + "birds2", 20.5, 29.5, 0.15, 0.6, offset=3)
    v.ambient("crowd", 29.5, 38.5, 0.32, 0.3)
    v.ambient("wind", 38.5, 41.5, 0.35, 0.4)
    v.ambient(m + "coldwind", 41.5, 47.5, 0.22, 0.6)
    v.ambient("wind", 47.5, 50.5, 0.3, 0.4, offset=12)
    v.ambient(m + "coldwind", 53.5, 56.5, 0.3, 0.5, offset=6)
    v.ambient(m + "birds2", 59.5, 68.5, 0.22, 0.6)
    v.ambient(m + "bees", 68.5, 72.5, 0.35, 0.8)            # the trap: still some insects
    v.ambient(m + "birds", 72.5, 80.5, 0.3, 0.8)
    v.ambient(m + "crickets", 72.5, 80.5, 0.22, 0.8)
    v.ambient(m + "bees2", 73.6, 80.5, 0.55, 0.6, offset=8)  # one bee returns, the hum comes back (loop)
    for t in (11.4, 14.4, 20.4, 29.4, 41.4, 47.4, 53.4, 59.4, 72.4):
        v.sfx("whoosh-short", t, 0.22)
    v.sfx("impact-bass-1", 59.45, 0.3)
