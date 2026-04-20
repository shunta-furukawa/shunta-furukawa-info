"""Generate the 1200x630 default OG image at static/images/og-default.jpg.

Run from repo root:
    pip install Pillow
    python3 scripts/make_og.py

Fonts (Zen Maru Gothic) are downloaded into scripts/fonts/ on first run.
That directory is gitignored to keep the repo light.
"""
import os
import urllib.request

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (26, 22, 21)       # #1a1615
PINK = (254, 30, 117)   # #fe1e75
WHITE = (255, 255, 255)
MUTED = (203, 203, 203)

LOGO_PATH = "themes/shunta-furukawa-info/static/images/logo.jpg"
OUT = "themes/shunta-furukawa-info/static/images/og-default.jpg"

FONT_DIR = "scripts/fonts"
FONT_BASE_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/zenmarugothic"
FONT_FILES = {
    "black": "ZenMaruGothic-Black.ttf",
    "bold": "ZenMaruGothic-Bold.ttf",
    "medium": "ZenMaruGothic-Medium.ttf",
}


def ensure_font(name: str) -> str:
    path = os.path.join(FONT_DIR, name)
    if not os.path.exists(path):
        os.makedirs(FONT_DIR, exist_ok=True)
        url = f"{FONT_BASE_URL}/{name}"
        print(f"downloading {url}")
        urllib.request.urlretrieve(url, path)
    return path


FONT_TITLE = ensure_font(FONT_FILES["black"])
FONT_BODY = ensure_font(FONT_FILES["medium"])
FONT_TAG = ensure_font(FONT_FILES["bold"])

canvas = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(canvas)

logo_size = 400
logo = Image.open(LOGO_PATH).convert("RGBA").resize((logo_size, logo_size), Image.LANCZOS)
mask = Image.new("L", (logo_size, logo_size), 0)
ImageDraw.Draw(mask).ellipse((0, 0, logo_size, logo_size), fill=255)

logo_x = 80
logo_y = (H - logo_size) // 2
canvas.paste(logo, (logo_x, logo_y), mask)

title_font = ImageFont.truetype(FONT_TITLE, 92)
body_font = ImageFont.truetype(FONT_BODY, 30)
tag_font = ImageFont.truetype(FONT_TAG, 26)

text_x = logo_x + logo_size + 60

title_lines = ["SHUNTA", "FURUKAWA"]
y = 150
for line in title_lines:
    draw.text((text_x, y), line, font=title_font, fill=WHITE)
    y += 104

draw.rectangle((text_x, y + 16, text_x + 64, y + 22), fill=PINK)

desc_lines = [
    "バックエンドからフロントエンド、",
    "デザインまで。",
]
y += 44
for line in desc_lines:
    draw.text((text_x, y), line, font=body_font, fill=MUTED)
    y += 42

draw.text((text_x, y + 10), "shunta-furukawa.info", font=tag_font, fill=PINK)

canvas.save(OUT, "JPEG", quality=88, optimize=True, progressive=True)
print("wrote", OUT)
