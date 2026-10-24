"""Render the Ruang favicon set from the cream arch artwork.

Source: assets/favicon/Minimalist Cream Arch Icon.png (drawn black on white).
Output: assets/favicon/favicon.ico, favicon-16/32/48.png, apple-touch-icon.png

Usage: python assets/favicon/build.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
SRC = HERE / "Minimalist Cream Arch Icon.png"
OUT = HERE

CREAM = (243, 232, 211)
INK = (8, 30, 45)
SUPERSAMPLE = 8
THRESHOLD = 32
RADIUS_RATIO = 0.235


def art(size):
    """Emblem as a mask at one size. Thresholding keeps the hairlines crisp."""
    grey = Image.open(SRC).convert("L").resize((size, size), Image.LANCZOS)
    return grey.point(lambda v: 255 if v > THRESHOLD else 0)


def plate(size):
    big = Image.new("L", (size * SUPERSAMPLE,) * 2, 0)
    ImageDraw.Draw(big).rounded_rectangle(
        (0, 0, size * SUPERSAMPLE - 1, size * SUPERSAMPLE - 1),
        radius=round(size * RADIUS_RATIO * SUPERSAMPLE),
        fill=255,
    )
    return big.resize((size, size), Image.LANCZOS)


def icon(size):
    tile = Image.new("RGBA", (size, size), CREAM + (255,))
    tile.paste(Image.new("RGBA", (size, size), INK + (255,)), (0, 0), art(size))
    tile.putalpha(plate(size))
    return tile


def main():
    small = {}
    for name, size in (
        ("favicon-16.png", 16),
        ("favicon-32.png", 32),
        ("favicon-48.png", 48),
        ("apple-touch-icon.png", 180),
    ):
        rendered = icon(size)
        rendered.save(OUT / name)
        if size <= 48:
            small[size] = rendered

    small[48].save(
        OUT / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[small[16], small[32]],
    )


if __name__ == "__main__":
    main()
