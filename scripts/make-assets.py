"""Generate BACKPANEL brand PNG assets with PIL."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"

INK = (10, 10, 10)
YELLOW = (255, 212, 0)
LIME = (198, 255, 0)
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)


def font(size: int):
    return ImageFont.load_default(size=size)


def fit_font(draw, text, max_w, start):
    s = start
    while s > 6:
        f = font(s)
        bbox = draw.textbbox((0, 0), text, font=f)
        if bbox[2] - bbox[0] <= max_w:
            return f
        s -= 2
    return font(6)


def stripe_band(d, W, y0, y1, stripe_w):
    h = y1 - y0
    x = -h - stripe_w * 2
    while x < W + stripe_w * 2:
        d.line([(x, y1), (x + h, y0)], fill=YELLOW, width=stripe_w)
        x += stripe_w * 2


def draw_dot(d, cx, cy, r):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=LIME)


def make_icon(size, safe_pad=0, text="BACKPANEL"):
    img = Image.new("RGB", (size, size), INK)
    d = ImageDraw.Draw(img)
    band_h = int(size * 0.13)
    sw = max(3, size // 26)
    stripe_band(d, size, 0, band_h, sw)
    stripe_band(d, size, size - band_h, size, sw)
    mx = safe_pad + int(size * 0.12)
    py0 = safe_pad + int((size - safe_pad * 2) * 0.34)
    py1 = safe_pad + int((size - safe_pad * 2) * 0.66)
    rad = max(2, int(size * 0.07))
    d.rounded_rectangle([mx, py0, size - mx, py1], radius=rad, fill=YELLOW)
    cx = size / 2
    cy = (py0 + py1) / 2
    f = fit_font(d, text, (size - mx * 2) * 0.84, int((py1 - py0) * 0.42))
    d.text((cx, cy), text, font=f, fill=BLACK, anchor="mm")
    dot_r = max(2, int(size * 0.032))
    draw_dot(d, size - mx - dot_r * 2, py0 + dot_r * 2, dot_r)
    return img


def make_og():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(img)
    stripe_band(d, W, 0, 64, 26)
    stripe_band(d, W, H - 64, H, 26)
    px0, py0, px1, py1 = 80, 120, 1120, 430
    d.rounded_rectangle([px0, py0, px1, py1], radius=48, fill=YELLOW)
    f = fit_font(d, "BACKPANEL", (px1 - px0) * 0.84, 150)
    d.text(((px0 + px1) / 2, (py0 + py1) / 2), "BACKPANEL", font=f, fill=BLACK, anchor="mm")
    draw_dot(d, px1 - 60, py0 + 48, 18)
    tag1 = "AUTO BACK-PANEL ADS "
    tag2 = "· BENGALURU"
    ft = font(48)
    b1 = d.textbbox((0, 0), tag1, font=ft)
    b2 = d.textbbox((0, 0), tag2, font=ft)
    w1, w2 = b1[2] - b1[0], b2[2] - b2[0]
    total = w1 + w2
    x = (W - total) / 2
    y = 500
    d.text((x, y), tag1, font=ft, fill=YELLOW)
    d.text((x + w1, y), tag2, font=ft, fill=WHITE)
    return img


def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    jobs = {
        ASSETS / "icon-192.png": make_icon(192),
        ASSETS / "icon-512.png": make_icon(512),
        ASSETS / "icon-512-maskable.png": make_icon(512, safe_pad=40),
        ASSETS / "favicon-32x32.png": make_icon(32, text="B"),
        ASSETS / "apple-touch-icon.png": make_icon(180),
        ASSETS / "og-image.png": make_og(),
    }
    for p, im in jobs.items():
        im.save(p, "PNG")
        print(f"wrote {p.relative_to(ROOT)} {im.size}")
    # verify exact dimensions
    expected = {
        "icon-192.png": (192, 192),
        "icon-512.png": (512, 512),
        "icon-512-maskable.png": (512, 512),
        "favicon-32x32.png": (32, 32),
        "apple-touch-icon.png": (180, 180),
        "og-image.png": (1200, 630),
    }
    for name, size in expected.items():
        with Image.open(ASSETS / name) as im:
            im.load()
            assert im.size == size, f"{name}: got {im.size}, want {size}"
            print(f"OK {name} {im.size} {im.mode}")


if __name__ == "__main__":
    main()
