"""Normalise the client logos: transparent ground, trimmed, max side 640px.

Usage: python prep_logos.py <src_dir> <out_dir>      (src_dir = the repo-root client-logos/)
Writes <out_dir>/<slug>.png, <out_dir>/manifest.json and <out_dir>/_sheet.png (QA only —
delete it before vendoring). Needs Pillow + numpy. Per-logo modes are explained in
features/clients/FEATURE.md.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

INK = (21 / 255, 21 / 255, 21 / 255)

# mode: "alpha"  — already transparent, trim only
#       "c2a"    — colour-to-alpha against a flat ground (GIMP's algorithm)
#       "mono"   — single-colour mark: alpha from distance to ground, painted one colour
LOGOS = [
    dict(slug="mediora", name="Mediora", file="29d17517-2c2f-4205-8f4e-04dece61ff14.png", mode="alpha"),
    dict(slug="aurelle", name="Aurelle Diamonds", file="88cf1a10-6be6-4a41-b4b2-e38e64f4efe8.png", mode="alpha"),
    dict(slug="talentra", name="Talentra", file="898427d6-d1fb-4539-a82b-2a54835aed78.png", mode="alpha"),
    dict(slug="stonecrest", name="Stonecrest", file="47c47be9-1a9a-40f7-b585-7e6f3e9acec2.png", mode="alpha"),
    dict(slug="theranote", name="TheraNote", file="theranote.png", mode="dist", ground=(252, 255, 219), lo=0.06, hi=0.30, colour=None),
    dict(slug="lioneyes", name="Lioneyes", file="lioneyes.png", mode="dist", ground=(1, 1, 1), lo=0.14, hi=0.62, colour=INK),
    dict(slug="mindora", name="Mindora", file="f0898275-af18-4a0e-b739-5ee97c20c320.png", mode="alpha"),
    dict(slug="like-home", name="Like Home", file="like-home.png", mode="c2a", ground=(255, 255, 255), floor=0.08),
    dict(slug="diamond-group", name="Diamond Group", file="diamond.png", mode="c2a", ground=(255, 255, 255), floor=0.12, inset=3),
    dict(slug="talentbridge", name="TalentBridge", file="1e955cef-0130-45e1-b262-7022dc468e49.png", mode="alpha"),
    dict(slug="vantor", name="Vantor", file="e35292e5-260a-4b0c-a61d-45c6987a2b65.png", mode="glow"),
    dict(slug="lotus-clean", name="Lotus Clean", file="lotusclean.png", mode="c2a", ground=(254, 255, 255), floor=0.18, despeckle=True),
    dict(slug="nellyan", name="Nellyan", file="nellyan.jpg", mode="c2a", ground=(237, 238, 237), floor=0.25),
    dict(slug="arch", name="[Client name]", file="26b0e30c-e1a2-459c-a08e-698ca2d8ce95.png", mode="c2a", ground=(255, 255, 255), floor=0.08),
]


def color_to_alpha(rgb, ground):
    g = np.array(ground, dtype=np.float64) / 255.0
    a = np.zeros(rgb.shape[:2])
    for c in range(3):
        x, b = rgb[..., c], g[c]
        up = np.where(x > b, (x - b) / max(1.0 - b, 1e-6), 0.0)
        down = np.where(x < b, (b - x) / max(b, 1e-6), 0.0)
        a = np.maximum(a, np.maximum(up, down))
    a = np.clip(a, 0.0, 1.0)
    safe = np.where(a > 1e-4, a, 1.0)[..., None]
    out = np.clip((rgb - g) / safe + g, 0.0, 1.0)
    return out, a


def floor_alpha(a, floor):
    return np.clip((a - floor) / (1.0 - floor), 0.0, 1.0)


def process(spec):
    im = Image.open(os.path.join(SRC, spec["file"])).convert("RGBA")
    inset = spec.get("inset", 0)
    if inset:
        im = im.crop((inset, inset, im.width - inset, im.height - inset))
    arr = np.asarray(im).astype(np.float64) / 255.0
    rgb, a0 = arr[..., :3], arr[..., 3]
    mode = spec["mode"]

    if mode == "alpha":
        out_rgb, a = rgb, a0
    elif mode == "c2a":
        out_rgb, a = color_to_alpha(rgb, spec["ground"])
        a = floor_alpha(a, spec["floor"]) * a0
        if spec.get("despeckle"):
            a8 = Image.fromarray((a * 255).round().astype(np.uint8), "L").filter(ImageFilter.MedianFilter(3))
            a = np.asarray(a8).astype(np.float64) / 255.0
    elif mode == "dist":
        # Single-colour mark on a noisy or graded ground: alpha from plain RGB distance,
        # which is far less twitchy than colour-to-alpha when the ground sits near 0 or 255.
        g = np.array(spec["ground"], dtype=np.float64) / 255.0
        d = np.sqrt(((rgb - g) ** 2).sum(axis=2)) / np.sqrt(3)
        a = np.clip((d - spec["lo"]) / (spec["hi"] - spec["lo"]), 0.0, 1.0)
        col = np.median(rgb[a > 0.95], axis=0) if spec["colour"] is None else np.array(spec["colour"])
        out_rgb = np.broadcast_to(col, rgb.shape)
    elif mode == "mono":
        _, a = color_to_alpha(rgb, spec["ground"])
        strong = a > 0.25
        # Normalise so the mark's own stroke is fully opaque on any ground.
        hi = np.percentile(a[strong], 90) if strong.any() else 1.0
        a = floor_alpha(np.clip(a / hi, 0, 1), 0.06)
        if spec["colour"] is None:  # keep the brand colour: median of the strongest pixels
            col = np.median(rgb[a > 0.9], axis=0)
        else:
            col = np.array(spec["colour"])
        out_rgb = np.broadcast_to(col, rgb.shape)
    elif mode == "glow":
        # A glow render on transparency: boost its alpha so the wordmark survives on light
        # grounds, and paint it one deep blue taken from the render itself.
        a = np.clip(a0 * 1.9, 0, 1) ** 0.85
        col = np.median(rgb[a0 > 0.5], axis=0) * 0.62
        out_rgb = np.broadcast_to(col, rgb.shape)
    else:
        raise ValueError(mode)

    # Trim to the mark, then a 2% margin so nothing touches the box.
    trim_at = 0.24 if mode == "glow" else 0.06
    ys, xs = np.where(a > trim_at)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    pad = int(round(max(y1 - y0, x1 - x0) * 0.02))
    y0, x0 = max(0, y0 - pad), max(0, x0 - pad)
    y1, x1 = min(a.shape[0], y1 + pad), min(a.shape[1], x1 + pad)
    if mode == "glow":
        a = np.where(a > 0.05, a, 0.0)

    px = np.dstack([out_rgb, a])[y0:y1, x0:x1]
    img = Image.fromarray((px * 255).round().astype(np.uint8), "RGBA")
    scale = 640 / max(img.size)
    if scale < 1:
        size = (max(1, round(img.width * scale)), max(1, round(img.height * scale)))
        img = img.convert("RGBa").resize(size, Image.LANCZOS).convert("RGBA")
    img.save(os.path.join(OUT, spec["slug"] + ".png"), optimize=True)
    return img


manifest, tiles = [], []
for spec in LOGOS:
    img = process(spec)
    manifest.append(
        dict(slug=spec["slug"], name=spec["name"], w=img.width, h=img.height,
             ar=round(img.width / img.height, 4))
    )
    tiles.append(img)
    print(f'{spec["slug"]:14s} {img.width}x{img.height}  ar={img.width / img.height:.3f}  '
          f'{os.path.getsize(os.path.join(OUT, spec["slug"] + ".png")) // 1024}KB')

with open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=1, ensure_ascii=False)

# QA sheet: each logo on paper (colour), on canvas as an ink stamp, and on ink as a white stamp.
cell, cols = 220, 7
rows = (len(tiles) + cols - 1) // cols
sheet = Image.new("RGB", (cols * cell, rows * cell * 3), (255, 255, 255))
grounds = [(255, 255, 255), (247, 247, 247), (21, 21, 21)]
for i, img in enumerate(tiles):
    cx, cy = (i % cols) * cell, (i // cols) * cell * 3
    t = img.copy()
    t.thumbnail((cell - 40, cell - 60))
    alpha = t.getchannel("A")
    ink = Image.new("RGBA", t.size, (21, 21, 21, 255)); ink.putalpha(alpha)
    white = Image.new("RGBA", t.size, (255, 255, 255, 255)); white.putalpha(alpha)
    for k, (ground, layer) in enumerate(zip(grounds, [t, ink, white])):
        box = Image.new("RGB", (cell, cell), ground)
        box.paste(layer, ((cell - t.width) // 2, (cell - t.height) // 2), layer)
        sheet.paste(box, (cx, cy + k * cell))
    ImageDraw.Draw(sheet).text((cx + 6, cy + 4), manifest[i]["slug"], fill=(150, 150, 150))
sheet.save(os.path.join(OUT, "_sheet.png"))
