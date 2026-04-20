"""Generate a favicon set from static/images/logo.jpg.

Outputs into themes/shunta-furukawa-info/static/:
    favicon-16.png, favicon-32.png, favicon.ico (16+32+48),
    apple-touch-icon.png (180x180),
    android-chrome-192.png, android-chrome-512.png

Run from repo root:
    pip install Pillow
    python3 scripts/make_favicons.py
"""
from PIL import Image

SRC = "themes/shunta-furukawa-info/static/images/logo.jpg"
OUT_DIR = "themes/shunta-furukawa-info/static"

base = Image.open(SRC).convert("RGB")

# Individual PNG sizes
for size in (16, 32, 180, 192, 512):
    img = base.resize((size, size), Image.LANCZOS)
    if size == 180:
        name = "apple-touch-icon.png"
    elif size in (192, 512):
        name = f"android-chrome-{size}.png"
    else:
        name = f"favicon-{size}.png"
    img.save(f"{OUT_DIR}/{name}", optimize=True)
    print("wrote", name)

# Multi-size ICO
ico_sizes = [(16, 16), (32, 32), (48, 48)]
base.save(f"{OUT_DIR}/favicon.ico", sizes=ico_sizes)
print("wrote favicon.ico")
