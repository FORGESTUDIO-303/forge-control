"""Forge Control shorts builder - zero budget promo vids. PIL cards + ffmpeg slideshow."""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(HERE, "bin", "ffmpeg.exe")
OUT = os.path.join(HERE, "out")
W, H = 1080, 1920
FPS = 30

CARDS = [
    ("FORGE", "CONTROL", "Total PC Control.", "One Interface.", "#ff0033"),
    ("FORGE", "GLOW", "5 lighting presets.", "Whole rig, one click.", "#ff0033"),
    ("FAN", "CURVES", "Silent to Turbo.", "Tuned in seconds.", "#d4af37"),
    ("GAME", "PROFILES", "Per-title setups.", "Auto-apply on launch.", "#7c5cff"),
    ("FREE", "FOREVER", "No install. No account.", "Link in bio.", "#2fbf71"),
]

def font(sz, bold=True):
    for p in (r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
              r"C:\Windows\Fonts\calibrib.ttf"):
        if os.path.exists(p):
            try: return ImageFont.truetype(p, sz)
            except Exception: pass
    return ImageFont.load_default()

def card(i, big1, big2, sub1, sub2, accent):
    img = Image.new("RGB", (W, H), (8, 8, 13))
    d = ImageDraw.Draw(img)
    for y in range(H):  # red-tinted vertical glow wash
        t = abs(y - H // 2) / (H // 2)
        d.line([(0, y), (W, y)], fill=(int(8 + 40 * (1 - t)), 8, int(13 + 30 * (1 - t))))
    d.rectangle([70, 300, 110, 420], fill=accent)
    d.text((150, 700), big1, font=font(150), fill=(244, 241, 233))
    d.text((150, 870), big2, font=font(150), fill=accent)
    d.text((150, 1100), sub1, font=font(52), fill=(160, 154, 141))
    d.text((150, 1180), sub2, font=font(52), fill=(244, 241, 233))
    d.text((150, 1650), f"FORGE CONTROL  •  {i+1}/5", font=font(36), fill=(120, 116, 108))
    p = os.path.join(OUT, f"card{i}.png")
    img.save(p)
    return p

def main():
    os.makedirs(OUT, exist_ok=True)
    if not os.path.exists(FF):
        sys.exit("ffmpeg missing at bin/ffmpeg.exe")
    pngs = [card(i, *c) for i, c in enumerate(CARDS)]
    # 3s per card, concatenated to one 15s vertical short (static cuts: fast on old CPUs)
    fc, inputs = [], []
    for i, p in enumerate(pngs):
        inputs += ["-loop", "1", "-t", "3", "-i", p]
        fc.append(f"[{i}:v]scale=1080:1920:flags=fast_bilinear,format=yuv420p[v{i}]")
    fc.append("".join(f"[v{i}]" for i in range(len(pngs))) + f"concat=n={len(pngs)}:v=1:a=0[out]")
    out = os.path.join(OUT, "forge-short-1.mp4")
    cmd = [FF, "-y", *inputs, "-filter_complex", ";".join(fc),
           "-map", "[out]", "-c:v", "libx264", "-preset", "ultrafast", "-r", str(FPS), out]
    subprocess.run(cmd, check=True, capture_output=True)
    print("built:", out, os.path.getsize(out), "bytes")

if __name__ == "__main__":
    main()
