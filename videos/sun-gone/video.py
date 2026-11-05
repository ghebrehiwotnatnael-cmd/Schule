"""What if the Sun disappeared for 3 months?"""
TITLE = "What if the Sun disappeared for 3 months?"
TITLE_KEY = "Sun"
KEY_COLOR = "#fbbf24"
SUB = "EVERY BIT OF LIFE ON EARTH RUNS ON SUNLIGHT."
CTA = "SEND THIS TO SOMEONE\nWHO HATES WINTER."
HANDLE = "@manwhat.3"
METER = "FREEZE LEVEL"
TIMER = "SUN RETURNS IN"
VOICE = "am_michael"
SPEED = 1.05

# (id, scene, on-screen text, highlighted words, spoken text if different)
LINES = [
    ("h1", "hook", "What if the Sun disappeared... for 3 months?", ["Sun", "3", "months?"],
     "What if the Sun disappeared... for three months?"),
    ("h2", "hook", "Its gravity stays. Only the light is gone.", ["light", "gone."]),

    ("m1", "min8", "For 8 minutes, nothing happens.", ["nothing", "happens."], "For eight minutes, nothing happens."),
    ("m2", "min8", "That's how long sunlight takes to reach us.", ["sunlight", "reach"]),

    ("d1a", "day1", "Day 1.", ["1."], "Day one."),
    ("d1b", "day1", "Half the planet wakes up... to total darkness.", ["total", "darkness."]),
    ("d1c", "day1", "Even the Moon goes dark. It only reflects sunlight.", ["Moon", "dark."]),

    ("d3a", "day3", "Day 3.", ["3."], "Day three."),
    ("d3b", "day3", "Most of the planet drops below freezing.", ["below", "freezing."]),
    ("d3c", "day3", "Without light, plants stop making food.", ["plants", "stop"]),

    ("mo1a", "month1", "Month 1.", ["1."], "Month one."),
    ("mo1b", "month1", "Lakes and rivers freeze over.", ["freeze", "over."]),
    ("mo1c", "month1", "Crops are gone. The food chain starts to collapse.", ["food", "chain", "collapse."]),

    ("mo2a", "month2", "Month 2.", ["2."], "Month two."),
    ("mo2b", "month2", "The ocean's surface turns to ice...", ["ice..."]),
    ("mo2c", "month2", "but deep down, it stays liquid for thousands of years.", ["liquid", "thousands"]),

    ("mo3a", "month3", "Month 3.", ["3."], "Month three."),
    ("mo3b", "month3", "Survivors live underground, heated by the Earth itself.", ["underground,", "Earth"]),

    ("bk1", "back", "Then... the Sun is back.", ["back."]),
    ("bk2", "back", "8 minutes later, light hits a frozen planet.", ["frozen", "planet."],
     "Eight minutes later, light hits a frozen planet."),

    ("t1", "twist", "Plot twist.", ["twist."]),
    ("t2", "twist", "This sort of happened in 1816.", ["1816."], "This sort of happened in eighteen sixteen."),
    ("t3", "twist", "A volcano had dimmed the Sun...", ["volcano"]),
    ("t4", "twist", "and it snowed in June.", ["snowed", "June."]),
    ("t5", "twist", "They called it the Year Without a Summer.", ["Without", "a", "Summer."]),

    ("o1", "outro", "Would you survive 3 months of darkness?", ["survive", "darkness?"],
     "Would you survive three months of darkness?"),
]


# ---------------------------------------------------------------- scenes
def build(v):
    import random
    from whatif_kit import (place, bubble, pill, banner, stamp, xmark, sparkle, icon, txt, skyline,
                            YEL, GREEN, LIME, AMBER, ORANGE, RED, INK)
    L, E, W = v.L, v.E, v.W
    ICE = "#7cc4ff"

    def stars(seed=1, n=45, ymax=1150):
        rnd = random.Random(seed)
        return "".join(f'<circle cx="{rnd.randint(0, 1080)}" cy="{rnd.randint(170, ymax)}" r="{rnd.uniform(2, 5):.1f}" '
                       f'fill="#fff" opacity="{rnd.uniform(.4, 1):.2f}"/>' for _ in range(n))

    def hills(c1, c2, y=1300):
        return (f'<path d="M-50 {y} C200 {y - 120} 420 {y - 60} 600 {y - 10} C780 {y + 30} 950 {y - 130} 1130 {y - 60} '
                f'L1130 2000 L-50 2000 Z" fill="{c1}" stroke="{INK}" stroke-opacity=".25" stroke-width="5"/>'
                f'<path d="M-50 {y + 120} C250 {y + 40} 500 {y + 140} 760 {y + 90} C900 {y + 60} 1000 {y + 80} 1130 {y + 60} '
                f'L1130 2000 L-50 2000 Z" fill="{c2}"/>')

    def sun(r=1.0):
        return (f'<circle r="{230 * r:.0f}" fill="url(#glow)"/>'
                f'<g transform="scale({1.05 * r:.2f})">{icon("sun")}</g>')

    # HOOK: the Sun vanishes ----------------------------------------------------------
    s = v.scene("hook", "#a9d8ff", "#e9f7ff")
    s.add(hills("#86d07a", "#5fb85a"), "back")
    s.add(place(s.ident("sun"), 800, 590, sun()), "back")
    g = s.char("guy", mouth="smile", look=(0.7, -0.7))
    s.wiggle("sun", 0.1, 1.2, amp=3, period=0.3)
    s.to("sun", W("h1", "disappeared"), scale=0.01, opacity=0, duration=0.35, ease="back.in(2)", transformOrigin="50% 50%")
    v.sfx("whoosh", W("h1", "disappeared") - 0.05, 0.5)
    g.at(W("h1", "disappeared") + 0.15, mouth="o", look=(0.7, -0.7))
    s.add(place(s.ident("ghost"), 800, 590, '<circle r="90" fill="none" stroke="#ffffff" stroke-width="7" stroke-dasharray="18 14"/>'), "back")
    s.fade_in("ghost", W("h2", "gravity"))
    s.add(place(s.ident("grav"), 290, 545, pill("GRAVITY: STILL HERE", "#ffffff", size=34)), "front")
    s.add(place(s.ident("lgone"), 290, 640, pill("LIGHT: GONE", "#fde68a", size=34)), "front")
    s.pop("grav", W("h2", "gravity")).pop("lgone", W("h2", "light"))
    g.at(W("h2", "light"), mouth="frown", look=(0, 0))
    v.timer_at(W("h2", "gravity"), "90 DAYS")

    # 8 MINUTES: nothing happens yet ---------------------------------------------------
    s = v.scene("min8", "#a9d8ff", "#e9f7ff", title="8 MINUTES", meter=(0.03, "NORMAL", GREEN))
    s.add(hills("#86d07a", "#5fb85a"), "back")
    g = s.char("guy", mouth="smile")
    s.add(place(s.ident("clock"), 810, 600, bubble(120, icon("clock"), "8 MIN 20 SEC", YEL)), "front")
    s.pop("clock", L("m1") + 0.1)
    s.spin("#min8-clock .hand-m", L("m1") + 0.3, E("m2") - L("m1"), 4)
    g.at(W("m1", "nothing"), mouth="grin", eyes="closed", blush=0.6)
    g.at(W("m2", "sunlight"), mouth="smile", eyes="open", look=(0.6, -0.6))
    s.add(place(s.ident("earth"), 270, 560, bubble(95, icon("earth"))), "front")
    s.pop("earth", W("m2", "reach"))

    # DAY 1: darkness, the Moon goes out ---------------------------------------------------
    s = v.scene("day1", "#050a1f", "#1b2650", title="DAY 1", meter=(0.15, "CHILLY", "#bfdbfe"), glow=0.08)
    s.add(stars(3), "back")
    s.add(hills("#1f3a3a", "#162b2b"), "back")
    s.add(place(s.ident("moon"), 810, 590, f'<g transform="scale(.8)">{icon("moon")}</g>'), "back")
    g = s.char("guy", mouth="o", look=(0, -0.3), eyes="open")
    s.add('<rect id="day1-dim" x="-50" y="-50" width="1180" height="2100" fill="#020617" opacity=".35"/>', "world")
    s.add(place(s.ident("nosun"), 280, 560, pill("NO SUNRISE", "#c7d2fe", size=38)), "front")
    s.pop("nosun", W("d1b", "darkness"))
    g.at(W("d1b", "darkness"), mouth="open", look=(-0.6, -0.4))
    s.to("moon", W("d1c", "dark"), opacity=0, duration=0.8)
    g.at(W("d1c", "Moon"), look=(0.7, -0.7), mouth="o")
    v.timer_at(L("d1a"), "89 DAYS")

    # DAY 3: deep frost, plants stop ----------------------------------------------------------
    s = v.scene("day3", "#dbeafe", "#8aa2c8", title="DAY 3", meter=(0.35, "FREEZING", ICE))
    s.add(hills("#eef6ff", "#d4e4f7"), "back")
    g = s.char("guy", mouth="wavy", pale=0.35, blush=0.7, lid=0.15)
    s.snowfall(55, seed=4)
    s.wiggle("guy-pos", L("d3a"), E("d3c") - L("d3a"), amp=1.2, period=0.08)
    s.add(place(s.ident("cold"), 540, 560, stamp("BELOW 0°C", "MOST OF THE PLANET", color="#2563eb")), "front")
    s.stamp_in("cold", W("d3b", "freezing"))
    s.hide("cold", L("d3c") - 0.05, 0.15)
    s.add(place(s.ident("plant"), 810, 600, bubble(115, icon("plant"))), "front")
    s.add(place(s.ident("plantx"), 810, 600, xmark(80)), "front")
    s.pop("plant", W("d3c", "plants")).pop("plantx", W("d3c", "stop"), dur=0.25, sfx="click-soft", vol=0.6)
    g.at(W("d3c", "plants"), look=(0.7, -0.6), mouth="frown")
    v.timer_at(L("d3a"), "87 DAYS")

    # MONTH 1: frozen lakes, food chain --------------------------------------------------------
    s = v.scene("month1", "#c7dcf3", "#5f80aa", title="MONTH 1", meter=(0.55, "ARCTIC", ICE))
    s.add('<ellipse cx="540" cy="1420" rx="760" ry="230" fill="#dff1ff" stroke="#2b263f" stroke-opacity=".3" stroke-width="6"/>'
          '<path d="M120 1400 L300 1450 L380 1390 M640 1480 L760 1420 L900 1470" stroke="#9cc3e6" stroke-width="7" fill="none"/>', "back")
    g = s.char("guy", mouth="frown", pale=0.5, blush=0.8, lid=0.3, bags=0.4, mess=0.2)
    s.snowfall(70, seed=6)
    s.add(place(s.ident("lakes"), 540, 570, stamp("FROZEN", "LAKES AND RIVERS", color="#2563eb")), "front")
    s.stamp_in("lakes", W("mo1b", "freeze"))
    s.hide("lakes", L("mo1c") - 0.05, 0.15)
    s.add(place(s.ident("crop"), 810, 600, bubble(110, icon("plant"))), "front")
    s.add(place(s.ident("cropx"), 810, 600, xmark(80)), "front")
    s.pop("crop", W("mo1c", "crops")).pop("cropx", W("mo1c", "gone"), dur=0.25, sfx="click-soft", vol=0.6)
    s.add(place(s.ident("chain"), 330, 560, banner("FOOD CHAIN", 40)), "front")
    s.pop("chain", W("mo1c", "food"))
    s.shake("chain", W("mo1c", "collapse"), n=10, amp=8)
    g.at(W("mo1c", "collapse"), mouth="open", sweat=1)
    v.timer_at(L("mo1a"), "60 DAYS")

    # MONTH 2: ice on top, liquid ocean below (no character) -------------------------------------
    s = v.scene("month2", "#0f3566", "#030b1a", title="MONTH 2", meter=(0.72, "DEEP FREEZE", ICE), glow=0.06,
                stripes=False)
    s.add('<rect x="-50" y="430" width="1180" height="190" fill="#e6f4ff" stroke="#2b263f" stroke-width="6"/>'
          '<path d="M80 470 L200 560 L260 500 M520 450 L600 540 L700 480 M840 470 L900 590" stroke="#9cc3e6" stroke-width="7" fill="none"/>',
          "back")
    s.add(place(s.ident("vent"), 540, 1180, f'<circle r="260" fill="url(#glow)" opacity=".35"/><g transform="scale(1.3)">{icon("vent")}</g>'),
          "world")
    rnd = random.Random(2)
    worms = "".join(f'<path d="M{x} 1340 C{x - 10} 1290 {x + 12} 1260 {x} 1220" stroke="#ef4444" stroke-width="12" '
                    f'stroke-linecap="round" fill="none"/><circle cx="{x}" cy="1218" r="11" fill="#fca5a5"/>'
                    for x in (380, 420, 660, 700, 730))
    s.add(f'<g id="month2-worms">{worms}</g><rect x="-50" y="1330" width="1180" height="700" fill="#2a2320"/>', "world")
    for k in range(6):
        s.add(place(s.ident(f"bub{k}"), 520 + rnd.randint(-40, 40), 1060, f'<circle r="{rnd.randint(8, 16)}" fill="#cbd5e1" opacity=".7"/>'))
        s.js.append(f'tl.fromTo("#month2-bub{k}",{{y:0,opacity:.8}},{{y:-420,opacity:0,duration:2.2,ease:"none",'
                    f'repeat:{int((s.end - s.start) / 2.2)},immediateRender:true}},{k * 0.37:.2f});')
    s.add(place(s.ident("ice"), 540, 690, pill("ICE ON TOP", "#e0f2fe", size=40)), "front")
    s.pop("ice", W("mo2b", "ice"))
    s.add(place(s.ident("liq"), 540, 860, stamp("LIQUID", "FOR THOUSANDS OF YEARS", color="#0ea5e9")), "front")
    s.stamp_in("liq", W("mo2c", "liquid"))
    v.timer_at(L("mo2a"), "30 DAYS")

    # MONTH 3: life underground --------------------------------------------------------------
    s = v.scene("month3", "#6b5240", "#2a1f17", title="MONTH 3", meter=(0.86, "EXTREME", ICE), glow=0.18)
    rnd = random.Random(8)
    s.add("".join(f'<circle cx="{rnd.randint(0, 1080)}" cy="{rnd.randint(450, 1900)}" r="{rnd.randint(10, 34)}" fill="#7d6250" opacity=".6"/>'
                  for _ in range(40)), "back")
    g = s.char("guy", mouth="flat", lid=0.3, bags=0.6, mess=0.5, blush=0.5)
    s.add(place(s.ident("heat"), 810, 600, bubble(115, icon("fire"), "EARTH'S HEAT", ORANGE)), "front")
    s.pop("heat", W("mo3b", "heated"))
    s.wiggle("heat", W("mo3b", "Earth"), 1.2, amp=3, period=0.12)
    s.add(place(s.ident("under"), 280, 560, pill("UNDERGROUND", "#fde68a", size=38)), "front")
    s.pop("under", W("mo3b", "underground"))
    g.at(W("mo3b", "heated"), mouth="smile", look=(0.7, -0.5))
    v.timer_at(L("mo3a"), "1 DAY")

    # BACK: the Sun returns -------------------------------------------------------------------
    s = v.scene("back", "#fff3bf", "#ffc27a", title="BACK")
    s.add(hills("#f1f7ff", "#dbe8f7"), "back")
    s.add(place(s.ident("sun"), 800, 590, sun()), "back")
    g = s.char("guy", eyes="closed", mouth="grin", pale=0.3, mess=0.4)
    s.add(f'<rect id="back-flash" x="-50" y="-50" width="1180" height="2100" fill="#ffffff" opacity="0"/>', "front")
    s.pop("sun", W("bk1", "back"), dur=0.6, sfx="sparkle", vol=0.5)
    s.set("flash", W("bk1", "back"), opacity=1)
    s.to("flash", W("bk1", "back") + 0.05, opacity=0, duration=0.7)
    v.sfx("impact-bass-2", W("bk1", "back"), 0.5)
    g.at(W("bk2", "light"), eyes="open", mouth="o", look=(0.7, -0.7))
    s.add(place(s.ident("frozen"), 290, 560, pill("STILL FROZEN", "#bfdbfe", size=38)), "front")
    s.pop("frozen", W("bk2", "frozen"))
    v.timer_at(W("bk1", "back"), "BACK!", "#4ade80")
    v.meter_at(W("bk1", "back"), 0.8, "THAWING", AMBER)

    # PLOT TWIST: 1816 -------------------------------------------------------------------------
    s = v.scene("twist", "#eef9ff", "#69c0f2", title="PLOT TWIST", title_color=YEL)
    v.timer_at(s.start, None)
    g = s.char("guy", mouth="o")
    s.add(place(s.ident("y1816"), 270, 545, pill("1816", "#fde68a", size=44)), "front")
    s.pop("y1816", W("t2", "1816"))
    s.add(place(s.ident("volc"), 810, 600, bubble(118, icon("volcano"), "TAMBORA", ORANGE)), "front")
    s.pop("volc", W("t3", "volcano"))
    g.at(W("t3", "volcano"), look=(0.7, -0.6))
    s.snowfall(60, t0=W("t4", "snowed"), seed=12)
    s.hide("volc", W("t4", "June") - 0.05, 0.12).hide("y1816", W("t4", "June") - 0.05, 0.12)
    s.add(place(s.ident("june"), 540, 580, stamp("SNOW IN JUNE", "", color="#2563eb", size=64), rot=-6), "front")
    s.stamp_in("june", W("t4", "June"))
    g.at(W("t4", "snowed"), mouth="wavy", pale=0.3, blush=0.6)
    s.hide("june", L("t5") - 0.05, 0.12)
    s.add(place(s.ident("yws"), 540, 560, banner("YEAR WITHOUT A SUMMER", 42)), "front")
    s.pop("yws", W("t5", "Year"))

    # OUTRO ------------------------------------------------------------------------------------
    s = v.scene("outro", "#0b1230", "#26306b", title="YOUR TURN", glow=0.12)
    s.add(stars(9), "back")
    g = s.char("guy", mouth="o", look=(0.6, -0.6))
    s.add(place(s.ident("q"), 810, 600, bubble(115, icon("question"))), "front")
    s.pop("q", W("o1", "survive"))
    g.at(W("o1", "darkness"), mouth="smile")
