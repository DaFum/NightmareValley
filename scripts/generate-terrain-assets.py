from __future__ import annotations

import math
import random
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "src" / "assets" / "spritesheets" / "terrain"
TILE_W = 64
TILE_H = 32


PALETTES: dict[str, tuple[tuple[int, int, int], tuple[int, int, int], tuple[int, int, int]]] = {
    "scarredEarth": ((83, 51, 28), (38, 17, 10), (146, 83, 44)),
    "weepingForest": ((37, 74, 37), (13, 30, 16), (76, 125, 61)),
    "ribMountain": ((70, 73, 96), (24, 24, 37), (150, 142, 126)),
    "placentaLake": ((19, 52, 89), (3, 12, 29), (90, 164, 191)),
    "scarPath": ((74, 48, 24), (30, 18, 9), (178, 117, 65)),
    "occupiedScar": ((74, 16, 18), (20, 5, 7), (154, 40, 45)),
    "ashBog": ((45, 48, 56), (14, 15, 19), (116, 112, 102)),
    "cathedralRock": ((50, 49, 75), (13, 12, 26), (142, 136, 165)),
}


def clamp(value: int) -> int:
    return max(0, min(255, value))


def mix(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (
        clamp(round(a[0] + (b[0] - a[0]) * t)),
        clamp(round(a[1] + (b[1] - a[1]) * t)),
        clamp(round(a[2] + (b[2] - a[2]) * t)),
    )


def diamond_points(pad: int = 0) -> list[tuple[int, int]]:
    return [
        (TILE_W // 2, pad),
        (TILE_W - 1 - pad, TILE_H // 2),
        (TILE_W // 2, TILE_H - 1 - pad),
        (pad, TILE_H // 2),
    ]


def inside_diamond(x: int, y: int) -> bool:
    return abs(x - TILE_W / 2) / (TILE_W / 2) + abs(y - TILE_H / 2) / (TILE_H / 2) <= 1


def add_noise(img: Image.Image, rng: random.Random, strength: int) -> None:
    px = img.load()
    for y in range(TILE_H):
        for x in range(TILE_W):
            if not inside_diamond(x, y):
                continue
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            n = rng.randint(-strength, strength)
            px[x, y] = (clamp(r + n), clamp(g + n), clamp(b + n), a)


def draw_cracks(draw: ImageDraw.ImageDraw, rng: random.Random, color: tuple[int, int, int, int], count: int) -> None:
    for _ in range(count):
        x = rng.randint(12, 52)
        y = rng.randint(7, 25)
        points = [(x, y)]
        for _ in range(rng.randint(2, 4)):
            x += rng.randint(-10, 10)
            y += rng.randint(-4, 4)
            points.append((x, y))
        draw.line(points, fill=color, width=1)


def draw_grass_blades(draw: ImageDraw.ImageDraw, rng: random.Random, color: tuple[int, int, int, int], count: int) -> None:
    for _ in range(count):
        x = rng.randint(8, 56)
        y = rng.randint(9, 25)
        if inside_diamond(x, y):
            draw.line([(x, y), (x + rng.randint(-2, 2), y - rng.randint(2, 5))], fill=color, width=1)


def draw_runes(draw: ImageDraw.ImageDraw, rng: random.Random, color: tuple[int, int, int, int], count: int) -> None:
    for _ in range(count):
        x = rng.randint(14, 49)
        y = rng.randint(8, 23)
        if inside_diamond(x, y):
            draw.arc([x - 3, y - 2, x + 3, y + 4], 190, 340, fill=color, width=1)
            draw.line([(x, y - 2), (x + rng.choice([-2, 2]), y + 3)], fill=color, width=1)


def draw_stones(draw: ImageDraw.ImageDraw, rng: random.Random, color: tuple[int, int, int, int], count: int) -> None:
    for _ in range(count):
        x = rng.randint(9, 55)
        y = rng.randint(7, 25)
        if inside_diamond(x, y):
            r = rng.randint(1, 3)
            draw.ellipse([x - r, y - r, x + r, y + r], fill=color)


def draw_water(img: Image.Image, rng: random.Random, accent: tuple[int, int, int]) -> None:
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for i in range(5):
        y = 8 + i * 4 + rng.randint(-1, 1)
        x0 = 8 + rng.randint(0, 6)
        x1 = 56 - rng.randint(0, 6)
        draw.arc([x0, y - 5, x1, y + 6], 15, 165, fill=(*accent, 72), width=1)
    img.alpha_composite(overlay.filter(ImageFilter.GaussianBlur(0.25)))


def render_tile(terrain: str, variant: int) -> Image.Image:
    rng = random.Random(f"{terrain}-{variant}-nightmare-valley")
    light, dark, accent = PALETTES[terrain]
    img = Image.new("RGBA", (TILE_W, TILE_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    for y in range(TILE_H):
        t = y / max(1, TILE_H - 1)
        row = mix(light, dark, t)
        draw.line([(0, y), (TILE_W, y)], fill=(*row, 255))

    mask = Image.new("L", (TILE_W, TILE_H), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.polygon(diamond_points(), fill=255)
    img.putalpha(mask)
    add_noise(img, rng, 10 + variant * 2)
    draw = ImageDraw.Draw(img)

    shadow = (0, 0, 0, 80)
    highlight = (255, 235, 190, 26)
    draw.line([diamond_points()[3], diamond_points()[2], diamond_points()[1]], fill=shadow, width=1)
    draw.line([diamond_points()[3], diamond_points()[0], diamond_points()[1]], fill=highlight, width=1)

    if terrain == "scarredEarth":
        draw_cracks(draw, rng, (26, 6, 4, 115), 5 + variant)
        draw_stones(draw, rng, (*accent, 95), 7)
    elif terrain == "weepingForest":
        draw_grass_blades(draw, rng, (*accent, 135), 34 + variant * 3)
        draw_stones(draw, rng, (11, 20, 9, 90), 5)
    elif terrain == "ribMountain":
        draw_cracks(draw, rng, (7, 8, 14, 150), 8)
        draw_stones(draw, rng, (*accent, 150), 18)
    elif terrain == "placentaLake":
        draw_water(img, rng, accent)
    elif terrain == "scarPath":
        draw_cracks(draw, rng, (18, 10, 5, 120), 3)
        for offset in (-6, 0, 6):
            draw.line([(13, TILE_H // 2 + offset // 3), (51, TILE_H // 2 - offset // 3)], fill=(*accent, 55), width=1)
    elif terrain == "occupiedScar":
        draw_cracks(draw, rng, (*accent, 155), 7)
        draw_runes(draw, rng, (216, 65, 73, 88), 5)
    elif terrain == "ashBog":
        draw_stones(draw, rng, (*accent, 90), 15)
        draw_cracks(draw, rng, (4, 5, 6, 115), 5)
    elif terrain == "cathedralRock":
        draw_runes(draw, rng, (*accent, 90), 7)
        draw_cracks(draw, rng, (7, 6, 14, 145), 6)

    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for terrain in PALETTES:
        for variant in range(1, 5):
            img = render_tile(terrain, variant)
            img.save(OUT_DIR / f"{terrain}_{variant}.png", optimize=True)


if __name__ == "__main__":
    main()
