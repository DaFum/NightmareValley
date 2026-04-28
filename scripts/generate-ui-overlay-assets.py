from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "assets" / "spritesheets" / "ui"


def save_shadow() -> None:
    img = Image.new("RGBA", (128, 64), (0, 0, 0, 0))
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.ellipse((18, 18, 110, 50), fill=(0, 0, 0, 118))
    layer = layer.filter(ImageFilter.GaussianBlur(8))
    img.alpha_composite(layer)
    img.save(OUT / "generic_building_shadow.png")


def save_ring(name: str, color: tuple[int, int, int, int]) -> None:
    img = Image.new("RGBA", (128, 64), (0, 0, 0, 0))
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    for inset, alpha in ((16, 36), (20, 68), (24, 150)):
        draw.ellipse((inset, inset // 2, 128 - inset, 64 - inset // 2), outline=color[:3] + (alpha,), width=3)
    glow = glow.filter(ImageFilter.GaussianBlur(1.2))
    img.alpha_composite(glow)
    draw = ImageDraw.Draw(img)
    draw.ellipse((25, 13, 103, 51), outline=color, width=2)
    img.save(OUT / name)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    save_shadow()
    save_ring("selection_ellipse_building.png", (126, 231, 135, 220))
    save_ring("hover_ellipse_building.png", (240, 165, 0, 190))


if __name__ == "__main__":
    main()
