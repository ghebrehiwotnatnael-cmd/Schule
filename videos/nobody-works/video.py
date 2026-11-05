"""What if nobody went to work anymore?"""
TITLE = "What if nobody went to work?"
SUB = "EVERY JOB KEEPS SOMETHING RUNNING."
CTA = "SEND THIS TO SOMEONE\nWHO NEEDS A DAY OFF."
HANDLE = "@shortclips7256"
METER = "CHAOS LEVEL"
VOICE = "am_michael"
SPEED = 1.05

# (id, scene, on-screen text, highlighted words, spoken text if different)
LINES = [
    ("h1", "hook", "What if tomorrow... nobody went to work?", ["nobody", "work?"]),
    ("h2", "hook", "Not one single person.", ["single", "person."]),

    ("m1", "monday", "Monday, 9 AM.", ["9", "AM."], "Monday. Nine A.M."),
    ("m2", "monday", "Offices are empty.", ["empty."]),
    ("m3", "monday", "Roads are silent.", ["silent."]),
    ("m4", "monday", "It feels like a holiday.", ["holiday."]),

    ("d1a", "day1", "Day 1.", ["1."], "Day one."),
    ("d1b", "day1", "No trains. No buses. No planes.", ["trains.", "buses.", "planes."]),
    ("d1c", "day1", "Without air traffic control, every flight is grounded.", ["every", "flight", "grounded."]),

    ("d3a", "day3", "Day 3.", ["3."], "Day three."),
    ("d3b", "day3", "The shelves are empty.", ["empty."]),
    ("d3c", "day3", "Most supermarkets only hold about three days of food.", ["three", "days"]),

    ("w1a", "week1", "Week 1.", ["1."], "Week one."),
    ("w1b", "week1", "Trash is everywhere.", ["everywhere."]),
    ("w1c", "week1", "In 1968, New York's garbage workers stopped for just nine days...", ["nine", "days..."],
     "In nineteen sixty-eight, New York's garbage workers stopped for just nine days..."),
    ("w1d", "week1", "and 100,000 tons of trash piled up.", ["100,000", "tons"],
     "and a hundred thousand tons of trash piled up."),

    ("w2a", "week2", "Week 2.", ["2."], "Week two."),
    ("w2b", "week2", "The power grid needs people watching it every second.", ["every", "second."]),
    ("w2c", "week2", "Without them... the lights go out.", ["lights", "go", "out."]),

    ("t1", "twist", "Plot twist.", ["twist."]),
    ("t2", "twist", "This kind of happened.", ["happened."]),
    ("t3", "twist", "In 1975, 90% of women in Iceland took the day off.", ["90%", "Iceland"],
     "In nineteen seventy-five, ninety percent of women in Iceland took the day off."),
    ("t4", "twist", "Banks, schools and factories shut down.", ["shut", "down."]),
    ("t5", "twist", "Dads brought their kids to work...", ["kids"]),
    ("t6", "twist", "and the shops ran out of sausages.", ["sausages."]),
    ("t7", "twist", "Five years later, Iceland elected the world's first female president.",
     ["first", "female", "president."]),

    ("o1", "outro", "So... whose job would you miss first?", ["miss", "first?"]),
]


# ---------------------------------------------------------------- scenes
def build(v):
    from whatif_kit import (place, bubble, pill, banner, stamp, xmark, sparkle, icon, txt, skyline, road,
                            shelves, trash_pile, YEL, GREEN, LIME, AMBER, ORANGE, RED)
    L, E, W = v.L, v.E, v.W

    # HOOK: alarm rings, nobody goes to work -------------------------------------------
    s = v.scene("hook", "#d6ecff", "#8ec5f4")
    s.add(skyline(seed=2, y0=1150), "back")
    g = s.char("guy", eyes="closed", mouth="smile")
    s.add(place(s.ident("alarm"), 810, 600, bubble(125, icon("alarm"))), "front")
    s.pop("alarm", 0.12).wiggle("alarm", 0.5, 0.9, amp=10)
    g.at(W("h1", "tomorrow"), eyes="open", mouth="o", look=(0.7, -0.6))
    s.hide("alarm", W("h1", "nobody") - 0.05, 0.15)
    s.add(place(s.ident("brief"), 810, 600, bubble(125, icon("briefcase") + xmark(110))), "front")
    s.pop("brief", W("h1", "nobody"))
    g.at(W("h1", "work"), mouth="grin", look=(0, 0), blush=0.8)
    s.add(place(s.ident("zero"), 290, 560, pill("0 PEOPLE AT WORK", "#fde68a", size=38)), "front")
    s.pop("zero", W("h2", "single"))

    # MONDAY 9 AM: empty city ---------------------------------------------------------
    s = v.scene("monday", "#c4e4ff", "#fff0d4", title="MONDAY 9 AM", meter=(0.06, "CALM", GREEN))
    s.add(skyline(seed=7, y0=1180), "back")
    s.add(road(1330), "back")
    g = s.char("guy", mouth="smile")
    s.add(place(s.ident("clock"), 810, 600, bubble(120, icon("clock"))), "front")
    s.rotate("#monday-clock .hand-h", 0, 270)
    s.pop("clock", L("m1") + 0.05)
    s.add(place(s.ident("p1"), 270, 540, pill("OFFICES: EMPTY", "#ffffff", size=36)), "front")
    s.add(place(s.ident("p2"), 270, 640, pill("ROADS: SILENT", "#ffffff", size=36)), "front")
    s.pop("p1", W("m2", "empty")).pop("p2", W("m3", "silent"))
    g.at(W("m2", "empty"), mouth="o", look=(-0.6, -0.2))
    g.at(W("m3", "silent"), look=(0.6, -0.2))
    g.at(W("m4", "holiday"), mouth="grin", look=(0, 0), blush=0.9, eyes="closed")
    for k, (x, y) in enumerate([(300, 820), (790, 840), (250, 1050), (840, 1080)]):
        s.add(place(s.ident(f"sp{k}"), x, y, sparkle(30)), "front")
        s.pop(f"sp{k}", W("m4", "holiday") + k * 0.06, sfx="sparkle" if k == 0 else None, vol=0.4)

    # DAY 1: transport stops -----------------------------------------------------------
    s = v.scene("day1", "#fff6bf", "#ffad66", title="DAY 1", meter=(0.25, "MESSY", LIME))
    g = s.char("guy", mouth="smile", tired=0)
    for k, (name, x) in enumerate([("train", 200), ("bus", 540), ("plane", 880)]):
        s.add(place(s.ident(name), x, 585, bubble(92, icon(name))), "front")
        s.add(place(s.ident(name + "x"), x, 585, xmark(70)), "front")
        word = ["trains", "buses", "planes"][k]
        s.pop(name, W("d1b", word) - 0.25, vol=0.35)
        s.pop(name + "x", W("d1b", word) + 0.15, dur=0.25, sfx="click-soft", vol=0.6)
    g.at(W("d1b", "trains"), mouth="o")
    for name in ("train", "bus", "plane", "trainx", "busx", "planex"):
        s.hide(name, L("d1c") - 0.05, 0.2)
    s.add(place(s.ident("tower"), 810, 600, bubble(120, icon("tower") + xmark(95))), "front")
    s.pop("tower", W("d1c", "air"))
    g.at(W("d1c", "air"), look=(0.7, -0.6))
    s.hide("tower", W("d1c", "grounded") - 0.1, 0.15)
    s.add(place(s.ident("grounded"), 540, 560, stamp("GROUNDED", "EVERY FLIGHT")), "front")
    s.stamp_in("grounded", W("d1c", "grounded"))
    g.at(W("d1c", "grounded"), mouth="frown", look=(0, 0), sweat=1)

    # DAY 3: supermarkets empty --------------------------------------------------------
    s = v.scene("day3", "#ffe9d6", "#f6b48f", title="DAY 3", meter=(0.45, "PANIC", AMBER))
    s.add(shelves("day3", y0=500), "back")
    g = s.char("guy", mouth="flat", lid=0.1, bags=0.3)
    s.stagger_out("#day3-items .item", W("d3b", "shelves"), each=0.018, dur=0.22)
    s.v.sfx("whoosh-short", W("d3b", "shelves"), 0.35)
    g.at(W("d3b", "empty"), mouth="frown", look=(-0.7, -0.3), sweat=1)
    s.add(place(s.ident("food"), 540, 590, stamp("3 DAYS", "OF FOOD IN STOCK", color="#e11d48")), "front")
    s.stamp_in("food", W("d3c", "three"))
    g.at(W("d3c", "three"), mouth="open", look=(0, -0.5))

    # WEEK 1: trash piles up -----------------------------------------------------------
    s = v.scene("week1", "#dff3c8", "#8dbb78", title="WEEK 1", meter=(0.68, "CHAOS", ORANGE))
    s.add(skyline(seed=11, y0=1150, color="#b9cfa8"), "back")
    g = s.char("guy", mouth="wavy", lid=0.25, bags=0.4, pale=0.5, mess=0.3)
    s.add(trash_pile("week1", n=30, y=1560), "front")
    s.stagger_pop("#week1-bags .bag", W("w1b", "trash"), each=0.035, dur=0.3)
    s.v.sfx("pop", W("w1b", "trash"), 0.3)
    g.at(W("w1b", "everywhere"), mouth="frown", look=(0.5, 0.6))
    s.add(place(s.ident("ny"), 540, 530, banner("NEW YORK, 1968")), "front")
    s.pop("ny", W("w1c", "1968"))
    s.hide("ny", W("w1c", "nine") - 0.05, 0.12)
    s.add(place(s.ident("strike"), 540, 530, banner("GARBAGE STRIKE: 9 DAYS")), "front")
    s.pop("strike", W("w1c", "nine"))
    tons = (f'<rect x="-250" y="-75" width="500" height="150" rx="20" fill="rgba(255,255,255,.9)" stroke="#e11d48" stroke-width="9"/>'
            + txt("0", 0, 18, 76, fill="#e11d48", font="WI Display", ident="week1-tonsn")
            + txt("TONS OF TRASH", 0, 58, 28, fill="#e11d48", font="WI Display"))
    s.add(place(s.ident("tons"), 540, 660, tons, rot=-4), "front")
    s.stamp_in("tons", W("w1d", "100"))
    s.counter("tonsn", W("w1d", "100") + 0.1, 0, 100000, dur=1.6)
    g.at(W("w1d", "100"), mouth="open", look=(0, -0.6))

    # WEEK 2: power grid fails ---------------------------------------------------------
    s = v.scene("week2", "#141c3c", "#3b3f8f", title="WEEK 2", meter=(0.95, "COLLAPSE", RED), glow=0.12)
    s.add(skyline(seed=4, y0=1200, night=True, lit=1.0, ident="week2"), "back")
    g = s.char("guy", mouth="flat", lid=0.3, bags=0.6, mess=0.6)
    s.add(place(s.ident("bolt"), 810, 600, bubble(120, icon("bolt"), "24/7", YEL)), "front")
    s.pop("bolt", W("w2b", "power"))
    s.wiggle("bolt", W("w2b", "every"), 0.6, amp=4)
    g.at(W("w2b", "watching"), look=(0.7, -0.6))
    s.hide("bolt", W("w2c", "lights") - 0.1, 0.15)
    s.stagger_out("#week2-win rect", W("w2c", "lights"), each=0.002, dur=0.12, frm="random")
    s.add(f'<rect id="week2-dark" x="-100" y="-100" width="1280" height="2200" fill="#05060c" opacity="0"/>', "front")
    s.to("dark", W("w2c", "out"), opacity=0.72, duration=0.25)
    s.v.sfx("glitch-1", W("w2c", "out") - 0.05, 0.45)
    g.at(W("w2c", "lights"), eyes="open", lid=0, mouth="o", look=(0, 0))

    # PLOT TWIST: Iceland 1975 -----------------------------------------------------------
    s = v.scene("twist", "#eef9ff", "#69c0f2", title="PLOT TWIST", title_color=YEL)
    guy = s.char("guy", mouth="o", lid=0)
    her = s.char("her", variant="woman", shirt="#f472b6", hair="#7a3b1e", mouth="smile")
    s.set("her-pos", 0, x=950)
    guy.at(W("t2", "happened"), mouth="smile")
    s.slide("guy-pos", L("t3"), x=-950, dur=0.45)
    s.slide("her-pos", L("t3") + 0.1, x=0, dur=0.5, ease="back.out(1.2)")
    s.v.sfx("whoosh-short", L("t3"), 0.35)
    s.add(place(s.ident("is"), 280, 545, pill("ICELAND, 1975", "#bfdbfe", size=38)), "front")
    s.add(place(s.ident("flag"), 810, 600, bubble(115, icon("flag_is"))), "front")
    s.pop("is", W("t3", "1975")).pop("flag", W("t3", "1975") + 0.15)
    s.hide("is", W("t3", "90") - 0.05, 0.12).hide("flag", W("t3", "90") - 0.05, 0.12)
    s.add(place(s.ident("ninety"), 540, 580, stamp("90% OF WOMEN", "TOOK THE DAY OFF", color="#db2777")), "front")
    s.stamp_in("ninety", W("t3", "90"))
    her.at(W("t3", "day"), mouth="grin", eyes="closed")
    s.hide("ninety", L("t4") - 0.05, 0.15)
    for k, (name, x, word) in enumerate([("bank", 200, "banks"), ("school", 540, "schools"), ("factory", 880, "factories")]):
        s.add(place(s.ident(name), x, 585, bubble(92, icon(name))), "front")
        s.add(place(s.ident(name + "x"), x, 585, xmark(70)), "front")
        s.pop(name, W("t4", word) - 0.15, vol=0.35)
        s.pop(name + "x", W("t4", "shut") + k * 0.08, dur=0.25, sfx="click-soft" if k == 0 else None, vol=0.6)
        s.hide(name, L("t5") - 0.05, 0.15).hide(name + "x", L("t5") - 0.05, 0.15)
    her.at(L("t4"), mouth="smile", eyes="open")
    # dads bring kids
    s.slide("her-pos", L("t5"), x=950, dur=0.4)
    s.set("guy-pos", L("t5"), x=-950)
    s.slide("guy-pos", L("t5") + 0.1, x=-140, dur=0.5, ease="back.out(1.2)")
    kid = s.char("kid", x=830, y=1010, s=0.56, shirt="#facc15", hair="#3b2416", mouth="grin")
    s.set("kid-pos", 0, x=1700)  # offsets are in the kid's scaled space (s=0.56)
    s.slide("kid-pos", W("t5", "kids") - 0.2, x=0, dur=0.45, ease="back.out(1.4)")
    s.v.sfx("whoosh-short", W("t5", "kids") - 0.2, 0.3)
    guy.at(L("t5") + 0.2, mouth="frown", lid=0.2, sweat=1, look=(0.7, 0))
    s.add(place(s.ident("saus"), 560, 585, bubble(110, icon("sausage"))), "front")
    s.add(place(s.ident("sold"), 640, 690, stamp("SOLD OUT", color="#e11d48", size=56), rot=-12), "front")
    s.pop("saus", W("t6", "shops"))
    s.stamp_in("sold", W("t6", "sausages"), sfx="impact-bass-2", vol=0.45)
    guy.at(W("t6", "sausages"), mouth="open", look=(0.5, -0.7))
    # first female president
    for n in ("saus", "sold"):
        s.hide(n, L("t7") - 0.05, 0.15)
    s.slide("guy-pos", L("t7"), x=-1100, dur=0.4).slide("kid-pos", L("t7"), x=1700, dur=0.4)
    s.slide("her-pos", L("t7") + 0.15, x=0, dur=0.5, ease="back.out(1.2)")
    s.add(place(s.ident("y80"), 280, 545, pill("1980", "#fde68a", size=44)), "front")
    s.pop("y80", W("t7", "later"))
    s.add(place(s.ident("crown"), 540, 735, f'<g transform="scale(.55)">{icon("crown")}</g>'), "front")
    s.pop("crown", W("t7", "first"), sfx="sparkle", vol=0.5)
    s.hide("y80", W("t7", "first") - 0.05, 0.12)
    s.add(place(s.ident("pres"), 540, 560, banner("FIRST ELECTED FEMALE PRESIDENT", 40)), "front")
    s.pop("pres", W("t7", "first"))
    her.at(W("t7", "first"), mouth="grin", blush=0.8)
    for k, (x, y) in enumerate([(300, 840), (790, 860), (240, 1060), (850, 1090)]):
        s.add(place(s.ident(f"sp{k}"), x, y, sparkle(30)), "front")
        s.pop(f"sp{k}", W("t7", "president") + k * 0.07, sfx=None)
    v.meter_at(W("t7", "first"), 0.12, "BALANCED", GREEN)

    # OUTRO: whose job would you miss first? ------------------------------------------
    s = v.scene("outro", "#efe3ff", "#a78bfa", title="YOUR TURN")
    g = s.char("guy", mouth="o", look=(-0.5, -0.6))
    for k, (name, x, y) in enumerate([("cross", 190, 600), ("trash", 890, 600), ("bolt", 170, 900), ("cart", 910, 900)]):
        s.add(place(s.ident(name), x, y, bubble(85, icon(name))), "front")
        s.pop(name, L("o1") + 0.2 + k * 0.28, vol=0.35)
        s.float_loop(name, L("o1") + 0.7, v.story_end - L("o1"), amp=8 + k * 2, period=1.1 + k * 0.15)
    g.at(W("o1", "miss"), mouth="smile", look=(0.6, -0.6))
