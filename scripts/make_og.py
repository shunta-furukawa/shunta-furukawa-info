"""Generate the 1200x630 default OG image at static/images/og-default.jpg.

Run from repo root:
    pip install Pillow
    python3 scripts/make_og.py
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (26, 22, 21)       # #1a1615
PINK = (254, 30, 117)   # #fe1e75
WHITE = (255, 255, 255)
MUTED = (203, 203, 203)

LOGO_PATH = "themes/shunta-furukawa-info/static/images/logo.jpg"
FONT_DISPLAY = "themes/shunta-furukawa-info/static/fonts/Buildingsandundertherailwaytracksfree_ver.otf"
FONT_BODY = "themes/shunta-furukawa-info/static/fonts/RocknRollOne-Regular.ttf"
OUT = "themes/shunta-furukawa-info/static/images/og-default.jpg"

canvas = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(canvas)

logo_size = 400
logo = Image.open(LOGO_PATH).convert("RGBA").resize((logo_size, logo_size), Image.LANCZOS)
mask = Image.new("L", (logo_size, logo_size), 0)
ImageDraw.Draw(mask).ellipse((0, 0, logo_size, logo_size), fill=255)

logo_x = 80
logo_y = (H - logo_size) // 2
canvas.paste(logo, (logo_x, logo_y), mask)

title_font = ImageFont.truetype(FONT_DISPLAY, 96)
body_font = ImageFont.truetype(FONT_BODY, 28)
tag_font = ImageFont.truetype(FONT_BODY, 24)

text_x = logo_x + logo_size + 60

title_lines = ["SHUNTA", "FURUKAWA"]
y = 160
for line in title_lines:
    draw.text((text_x, y), line, font=title_font, fill=WHITE)
    y += 106

draw.rectangle((text_x, y + 16, text_x + 64, y + 22), fill=PINK)

desc_lines = [
    "バックエンドからフロントエンド、",
    "デザインまで。",
]
y += 48
for line in desc_lines:
    draw.text((text_x, y), line, font=body_font, fill=MUTED)
    y += 40

draw.text((text_x, y + 10), "shunta-furukawa.info", font=tag_font, fill=PINK)

canvas.save(OUT, "JPEG", quality=88, optimize=True, progressive=True)
print("wrote", OUT)
