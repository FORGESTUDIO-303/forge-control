"""Forge Control artwork - logo, banner, thumbnail. Original, code-drawn."""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "img")
os.makedirs(IMG, exist_ok=True)

RED, GOLD, BG, TXT = (255, 0, 51), (212, 175, 55), (8, 8, 13), (244, 241, 233)

def font(sz, bold=True):
    p = r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf"
    try: return ImageFont.truetype(p, sz)
    except Exception: return ImageFont.load_default()

def glow_bg(w, h, accent=RED):
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)
    cx, cy = w // 2, h // 2
    for y in range(h):
        t = abs(y - cy) / (h / 2)
        c = (int(8 + 46 * (1 - t)), 8, int(13 + 34 * (1 - t)))
        d.line([(0, y), (w, y)], fill=c)
    return img, d

def logo():
    s = 1024
    img, d = glow_bg(s, s)
    m = 300
    d.rounded_rectangle([m, m, s - m, s - m], radius=90, fill=(20, 20, 30), outline=RED, width=14)
    f = font(420)
    bb = d.textbbox((0, 0), "F", font=f)
    d.text(((s - (bb[2] - bb[0])) / 2 - bb[0], (s - (bb[3] - bb[1])) / 2 - bb[1] - 30), "F", font=f, fill=TXT)
    p = os.path.join(IMG, "forge-logo.png"); img.save(p); print("saved", p)

def banner():
    w, h = 1920, 640
    img, d = glow_bg(w, h)
    d.rectangle([90, 180, 110, 460], fill=RED)
    d.text((175, 250), "Total PC Control. One Interface.", font=font(72), fill=TXT)
    d.text((175, 470), "Free  •  v1.0  •  github.com/FORGESTUDIO-303", font=font(44, False), fill=GOLD)
    p = os.path.join(IMG, "forge-banner.png"); img.save(p); print("saved", p)

def thumb():
    w, h = 1280, 720
    img, d = glow_bg(w, h)
    d.rectangle([70, 130, 90, 590], fill=RED)
    d.text((145, 300), "FREE PC CONTROL APP", font=font(72), fill=TXT)
    p = os.path.join(IMG, "forge-thumb.png"); img.save(p); print("saved", p)

logo(); banner(); thumb()
