"""Size the processed client logos for the site, and print the geometry table Clients.tsx keeps.

Usage: python vendor_logos.py <logos_dir> <public_out_dir>
       (logos_dir = features/clients/assets/logos, public_out_dir = public/clients)

Reads <logos_dir>/manifest.json and <slug>.png (both from prep_logos.py). Each mark gets an
EQUAL VISUAL AREA rather than an equal width — h = sqrt(AREA / aspect), clamped to the tile —
then is written at 2x that desktop size (never upscaled). Re-run this and paste the printed
rows into CLIENTS whenever a logo is added or replaced.
"""
import json
import math
import os
import sys

from PIL import Image

AREA, MAX_W, MAX_H = 8200, 168, 74  # px, desktop tile (136px tall) — see Clients.tsx

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)

with open(os.path.join(src, "manifest.json"), encoding="utf-8") as f:
    manifest = json.load(f)

total = 0
for m in manifest:
    ar = m["w"] / m["h"]
    h = math.sqrt(AREA / ar)
    w = h * ar
    k = min(1.0, MAX_W / w, MAX_H / h)
    w, h = w * k, h * k
    im = Image.open(os.path.join(src, m["slug"] + ".png")).convert("RGBA")
    size = (min(im.width, round(2 * w)), min(im.height, round(2 * h)))
    im = im.convert("RGBa").resize(size, Image.LANCZOS).convert("RGBA")
    path = os.path.join(out, m["slug"] + ".png")
    im.save(path, optimize=True)
    kb = os.path.getsize(path) / 1024
    total += kb
    print(f'  {{ slug: "{m["slug"]}", w: {round(w)}, h: {round(h)} }},'
          f'  // file {size[0]}x{size[1]}, {kb:.1f}KB')
print(f"total {total:.0f}KB")
