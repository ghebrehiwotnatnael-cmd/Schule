# Kit API (`kit/whatif_kit.py`)

All times are **global seconds** on the voice clock. Get them from the timing:

| Call | Returns |
| --- | --- |
| `v.L("d1b")` | start of line `d1b` |
| `v.E("d1b")` | end of line |
| `v.W("d1b", "planes")` / `v.W("d1b", 3)` | start of the first word starting with "planes" / word index 3 |
| `v.story_end` | when the end card starts |

## Scenes
```python
s = v.scene("day3", "#ffe9d6", "#f6b48f", title="DAY 3", meter=(0.45, "PANIC", AMBER),
            title_color=YEL, glow=0.35, stripes=True, zoom=0.035)
```
- The window comes from the lines whose `scene` is `"day3"` (starts 0.18 s before the first line).
- `meter=(level 0-1, status, colour)` animates the bar at the scene start; extra changes: `v.meter_at(t, level, status, colour)`.
- Layers: `s.add(svg, "back")` (behind character), default `"world"` (zooms with the camera), `"front"` (props, not zoomed).
- `s.ident("x")` → `"day3-x"`; helpers accept the short name `"x"` or a full selector `"#…"`/`".…"`.

## Props (SVG strings, centred on 0,0) - place them with `place(s.ident(name), x, y, svg, scale=1, rot=0)`
`bubble(r, icon(name), label=None, label_fill)`, `pill(text, fill, color, size)`, `banner(text, size)`,
`stamp(big, small, color, size)`, `xmark(r)`, `sparkle(s)`, `txt(text, x, y, size, fill, font, ident=…)`.
Icons: clock (`.hand-h`, `.hand-m`), alarm, train, bus, plane, tower, cart, trash, bolt, bulb, bank, school,
factory, sausage, question, cross, briefcase, crown, flag_is. Add new ones to `ICONS` (340-px box, use `O` outline).
Backgrounds: `skyline(seed, y0, night, lit, ident, color)` (windows `#<ident>-win rect`), `road(y)`,
`shelves(ident)` (`#<ident>-items .item`), `trash_pile(ident, n, y)` (`#<ident>-bags .bag`).

Layout zones (1080×1920): HUD 168-440; bubbles at (810, 600) r≈120 or a row at y≈585 (x 200/540/880, r≈92);
pills on the left (x≈270, y 540/640); stamps and banners centred at y 530-600; head centre (540, 930),
head top ≈ 750; captions at 1250; the TikTok buttons cover x > 960 from y≈900 down.

## Animation (Scene methods, chainable)
`pop(name, t, dur, ease, sfx="pop", vol)`, `hide(name, t, dur)`, `fade_in`, `stamp_in(name, t, sfx="impact-bass-1")`,
`to(name, t, **gsap)`, `set(name, t, **gsap)`, `slide(name, t, x, y, dur, ease)`, `stagger_pop(selector, t, each)`,
`stagger_out(selector, t, each)`, `counter(name, t, from, to, dur, suffix)` (on a `txt(..., ident=…)`),
`rotate(selector, t, deg, dur)`, `spin`, `wiggle(name, t, dur, amp)`, `shake`, `float_loop(name, t, dur, amp)`.
Sound: `v.sfx(name, t, vol)` with `pop, whoosh, whoosh-short, impact-bass-1/2, sparkle, glitch-1, click-soft, riser`.

## Character
```python
g = s.char("guy", x=540, y=930, s=1.0, variant="guy|woman|kid", shirt="#22b8c9", hair="#5b3a24",
           tie=None, glasses=False, mouth="smile", eyes="open", lid=0, bags=0, sweat=0, blush=0, mess=0,
           red=0, pale=0, look=(0, 0))
g.at(t, mouth="frown", lid=0.3, sweat=1, look=(0.7, -0.6))   # eases into the new state with a squash take
```
Mouths: smile, flat, frown, open, o, grin, wavy. Eyes: open, closed. `look` is pupil offset (-1..1).
Move the whole person with `s.slide("guy-pos", t, x=…)`; `s.set("guy-pos", t, x=950)` puts them off-screen.
Blinks and breathing are automatic.
