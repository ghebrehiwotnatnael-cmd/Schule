#!/usr/bin/env python3
"""Download CC0 low-poly model packs by Quaternius (quaternius.com) into kit/models/<pack>/.

Only model files are fetched (glTF + bin + textures where a pack has glTF, else FBX). The packs are public
Google Drive folders linked from each pack page on quaternius.com. License: CC0 (see each pack's License.txt).
usage: python3 fetch_models.py [pack ...]      (no args = all packs below)
The models folder is gitignored; run this once per fresh session before building a 3D video.
"""
import os, sys
from concurrent.futures import ThreadPoolExecutor
import gdown

PACKS = {
    "animatedmen": "17LibivOaUidsQhSkcxP3YYvDr0n7wIwu",
    "animatedwomen": "1c13R--fMqdR6r2MRlcKKsbPky0__T-yJ",
    "ultimateanimatedanimals": "1uJ3N5HfB7jKTseJUNQr3N4YaN0UuEtHk",
    "cars": "1fKlbDry77iY8KlEoxzUxIAZQL_XhzWlA",
    "publictransport": "1GUIE138uPVNraiQEf33dIx9wENhttZ15",
    "ships": "1Qf31QTnGfxRzYxx8dHmlVGDT4KmIa0Vy",
    "ultimatehomeinterior": "1SNK9PwPi8xqqxmpU5xEZeiQjB26C1oX6",
    "ultimatefurniture": "1n85oUi0RN5ZUXEIMKA-AnBsPErVXWcma",
    "simplebuildings": "1r-FcNFxC6ziN0oI3GqZJdEkdzglFQHQH",
    "ultimatenature": "1-Kl0L_Jg8awbh0S5T-z3zxh4mVlnxTpa",
    "ultimatestylizednature": "1IV3bXHzkNvuNWFHPi4KPx-G4ghuxIuT-",
    "modularstreets": "1-YvMpLDYBIy-0Ms7ZlFmUpChTbHku8IJ",
    "ultimatetexturedbuildings": "1RE3qXhbE5yGS3t-xGFJ8GmOtTgCUF3LQ",
    "farmbuildings": "1gdZ39vcLML_ULU5sHirkKQ-gEkk458Ak",
}
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")


def wanted(files):
    has_gltf = any(f.path.lower().endswith(".gltf") for f in files)
    out = []
    for f in files:
        p = f.path.lower()
        if p.endswith("license.txt"):
            out.append(f)
        elif has_gltf and (p.startswith("gltf/") or "/gltf/" in p or p.startswith("textures/")) and p.rsplit(".", 1)[-1] in ("gltf", "bin", "png", "jpg"):
            out.append(f)
        elif not has_gltf and p.endswith(".fbx") and "blend" not in p:
            out.append(f)
        elif not has_gltf and (p.startswith("textured models/") or p.startswith("textures/")) and p.endswith((".png", ".jpg")):
            out.append(f)
    return out


def fetch(pack):
    url = f"https://drive.google.com/drive/folders/{PACKS[pack]}"
    files = gdown.download_folder(url, skip_download=True, quiet=True)
    sel = wanted(files)
    dest = os.path.join(ROOT, pack)

    def one(f):
        out = os.path.join(dest, f.path)
        if os.path.exists(out) and os.path.getsize(out) > 0:
            return
        os.makedirs(os.path.dirname(out), exist_ok=True)
        gdown.download(id=f.id, output=out, quiet=True)

    with ThreadPoolExecutor(6) as ex:
        list(ex.map(one, sel))
    size = sum(os.path.getsize(os.path.join(dp, n)) for dp, _, fs in os.walk(dest) for n in fs)
    print(f"{pack}: {len(sel)} files, {size / 1e6:.1f} MB")


if __name__ == "__main__":
    for p in (sys.argv[1:] or PACKS):
        try:
            fetch(p)
        except Exception as e:
            print("FAILED", p, e)
