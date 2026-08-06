"""Render the social/OG card (media/og-image.png) in the site's own language:
near-black ground, dot grid, teal + ember washes, a dot-lattice globe, and the
name/tagline pulled from content.yaml so the card never drifts from the site.

Run with `make og`. Kept out of `make build` on purpose: it needs Pillow and a
mono TTF, and the output only changes when the tagline does.
"""
import math
import os
import random
import yaml
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
BG = (8, 9, 11)
INK0, INK1, INK2 = (232, 234, 237), (169, 177, 184), (108, 117, 125)
TEAL = (114, 222, 194)
EMBER = (224, 190, 170)
COORDINATES = "46.01°N 8.96°E"          # matches build_script.py

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "/usr/share/fonts/truetype/noto/NotoSansMono-Regular.ttf",
]


def font(size):
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    raise SystemExit("no monospace TTF found; install fonts-dejavu-core")


def washes():
    """Two blurred radial washes, drawn small and scaled up — same trick as the
    CSS blur(120px), without needing a real blur over 1200x630."""
    small = Image.new("RGB", (W // 12, H // 12), BG)
    d = ImageDraw.Draw(small)
    for cx, cy, rad, rgb, peak in (
        (0.20 * small.width, 0.16 * small.height, 0.55 * small.width, TEAL, 0.13),
        (0.84 * small.width, 0.88 * small.height, 0.50 * small.width, EMBER, 0.07),
    ):
        steps = 26
        for i in range(steps, 0, -1):
            f = i / steps
            a = peak * (1 - f) ** 2
            d.ellipse([cx - rad * f, cy - rad * f, cx + rad * f, cy + rad * f],
                      fill=tuple(round(BG[c] + (rgb[c] - BG[c]) * a) for c in range(3)))
    return small.resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(28))


def dot_grid(img):
    d = ImageDraw.Draw(img, "RGBA")
    for y in range(14, H, 28):
        for x in range(14, W, 28):
            d.ellipse([x - 1, y - 1, x + 1, y + 1], fill=INK0 + (13,))


def globe(img, cx, cy, radius):
    """Lat/long dot lattice, lit from the upper left, dissolving to ember on the
    dark limb — the same rendering rule as the hero canvas."""
    d = ImageDraw.Draw(img, "RGBA")
    rnd = random.Random(11)          # seeded: the card is reproducible
    lx, ly, lz = -0.45, -0.45, 0.79
    tip = 0.42
    k = radius / 60
    for lat in range(-78, 79, 6):
        phi = math.radians(lat)
        for lon in range(0, 360, 6):
            lam = math.radians(lon)
            x, y, z = math.cos(phi) * math.sin(lam), -math.sin(phi), math.cos(phi) * math.cos(lam)
            y, z = y * math.cos(tip) - z * math.sin(tip), y * math.sin(tip) + z * math.cos(tip)
            roll = rnd.random()
            if z <= 0:
                continue
            lit = max(0.0, x * lx + y * ly + z * lz)
            limb = (1 - z) ** 2.2
            ember = (1 - lit) * limb
            # density test — dots thin out into the dark, which is what makes it
            # read as pointillist rather than as a solid sphere
            margin = (0.37 + 0.63 * lit ** 0.65 + ember * 0.4) - roll
            if margin <= 0:
                continue
            pole = math.cos(phi) ** 0.75
            emph = 1.3 if (lat % 30 == 0 or lon % 30 == 0) else 1.0
            alpha = min(0.95, (0.14 + 0.74 * lit ** 1.3 + ember * 0.32) * pole * emph)
            alpha *= min(1.0, margin / 0.12)
            if alpha < 0.04:
                continue
            rgb = tuple(round(INK0[c] + (EMBER[c] - INK0[c]) * min(1, ember * 2)) for c in range(3))
            r = (0.64 + 0.92 * lit + ember * 0.3) * (1.22 if emph > 1 else 1.0)
            r *= (0.62 + 0.38 * pole) / 0.9 * k
            px, py = cx + x * radius, cy + y * radius
            d.ellipse([px - r, py - r, px + r, py + r], fill=rgb + (round(alpha * 255),))
    # home ping
    phi, lam = math.radians(46.01), math.radians(8.96)
    x, y, z = math.cos(phi) * math.sin(lam), -math.sin(phi), math.cos(phi) * math.cos(lam)
    y, z = y * math.cos(tip) - z * math.sin(tip), y * math.sin(tip) + z * math.cos(tip)
    if z > 0:
        px, py, r = cx + x * radius, cy + y * radius, radius / 22
        d.ellipse([px - r * 3, py - r * 3, px + r * 3, py + r * 3], fill=TEAL + (40,))
        d.ellipse([px - r, py - r, px + r, py + r], fill=TEAL + (235,))


def wrap(text, width):
    lines, line = [], ""
    for word in text.split():
        probe = (line + " " + word).strip()
        if len(probe) > width and line:
            lines.append(line)
            line = word
        else:
            line = probe
    if line:
        lines.append(line)
    return lines


def main():
    with open("content.yaml") as fh:
        content = yaml.safe_load(fh)

    img = washes()
    dot_grid(img)
    globe(img, 960, 300, 168)

    d = ImageDraw.Draw(img)
    d.text((80, 168), "00 / ", font=font(20), fill=TEAL)
    d.text((80 + 5 * 12, 168), "PERSONAL SITE", font=font(20), fill=INK2)

    y = 214
    for line in wrap(content["name"], 22):
        d.text((80, y), line, font=font(62), fill=INK0)
        y += 76
    y += 12
    for line in wrap(content["tagline"], 40):
        d.text((80, y), line, font=font(24), fill=INK1)
        y += 36
    y += 16
    d.text((80, y), COORDINATES, font=font(20), fill=TEAL)
    d.text((80 + len(COORDINATES) * 12 + 12, y), "— " + content["location"], font=font(20), fill=INK2)

    d.line([80, H - 78, W - 80, H - 78], fill=(58, 64, 70))
    d.text((80, H - 62), "escri11.github.io", font=font(20), fill=INK2)

    img.save("media/og-image.png")
    print("media/og-image.png written")


if __name__ == "__main__":
    main()
