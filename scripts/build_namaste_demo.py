from pathlib import Path
from textwrap import wrap

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DEMO = ROOT / "outputs" / "namaste-demo"
SIZE = (1920, 1080)
PAPER = "#f3f0e8"
INK = "#11130f"
SIGNAL = "#c7ff42"
MUTED = "#65675f"
LINE = "#c9c4b9"


def font(size: int, bold: bool = False, mono: bool = False) -> ImageFont.FreeTypeFont:
    if mono:
        name = "consolab.ttf" if bold else "consola.ttf"
    else:
        name = "segoeuib.ttf" if bold else "segoeui.ttf"
    return ImageFont.truetype(str(Path("C:/Windows/Fonts") / name), size)


def screenshot_frame(source: str, y: int, output: str) -> None:
    image = Image.open(DEMO / source).convert("RGB")
    y = max(0, min(y, image.height - 544))
    image.crop((0, y, 968, y + 544)).resize(SIZE, Image.Resampling.LANCZOS).save(DEMO / output)


def label(draw: ImageDraw.ImageDraw, text: str, xy: tuple[int, int], color: str = MUTED) -> None:
    draw.text(xy, text.upper(), font=font(25, mono=True), fill=color)


def lines(draw: ImageDraw.ImageDraw, text: str, xy: tuple[int, int], width: int, size: int, color: str) -> int:
    y = xy[1]
    for line in wrap(text, width=width):
        draw.text((xy[0], y), line, font=font(size), fill=color)
        y += int(size * 1.25)
    return y


def architecture_frame() -> None:
    image = Image.new("RGB", SIZE, PAPER)
    draw = ImageDraw.Draw(image)
    label(draw, "One honest boundary", (90, 70), INK)
    draw.text((90, 120), "The model never receives", font=font(74, bold=True), fill=INK)
    draw.text((90, 205), "your whole memory store.", font=font(74, bold=True), fill=INK)

    cards = [
        ("1", "IndexedDB", "All project memories stay in this browser profile."),
        ("2", "Transparent ranker", "Relevance, importance, recency, TTL, and deletion."),
        ("3", "Capped proof", "At most five records and sixteen hundred characters."),
        ("4", "Provider gate", "The server adapter receives only the visible proof frame."),
    ]
    x, y, w, h, gap = 90, 390, 405, 390, 35
    for number, title, body in cards:
        draw.rounded_rectangle((x, y, x + w, y + h), radius=18, fill=INK)
        draw.text((x + 30, y + 24), number, font=font(30, bold=True, mono=True), fill=SIGNAL)
        draw.text((x + 30, y + 92), title, font=font(38, bold=True), fill=PAPER)
        lines(draw, body, (x + 30, y + 165), 25, 27, "#d8d5cc")
        x += w + gap
    draw.line((90, 910, 1830, 910), fill=LINE, width=2)
    draw.text((90, 945), "Explicit forgetting runs before recall. No hidden vector store.", font=font(31), fill=INK)
    image.save(DEMO / "07-architecture.png")


def validation_frame() -> None:
    image = Image.new("RGB", SIZE, INK)
    draw = ImageDraw.Draw(image)
    label(draw, "Built with Codex + GPT-5.6", (90, 70), SIGNAL)
    draw.text((90, 125), "Proof you can inspect.", font=font(78, bold=True), fill=PAPER)
    draw.text((90, 270), "7 / 7", font=font(142, bold=True, mono=True), fill=SIGNAL)
    draw.text((610, 310), "automated tests passing", font=font(46, bold=True), fill=PAPER)
    draw.text((610, 375), "ranking · expiry · forgetting · proof caps", font=font(30), fill="#c9c4b9")

    cards = [
        ("RANKING", "Only records sharing a meaningful term are eligible."),
        ("FORGETTING", "Delete now or expire through a user-selected TTL."),
        ("PROOF CAP", "Five records and sixteen hundred characters maximum."),
    ]
    x = 90
    for title, body in cards:
        draw.rounded_rectangle((x, 560, x + 550, 855), radius=16, outline="#4c5149", width=2)
        draw.text((x + 28, 595), title, font=font(26, bold=True, mono=True), fill=SIGNAL)
        lines(draw, body, (x + 28, 665), 31, 29, PAPER)
        x += 595
    draw.text((90, 955), "AGPL public edition · private Qorx compiler, routing, datasets, and research excluded", font=font(28), fill="#c9c4b9")
    image.save(DEMO / "08-validation.png")


def closing_frame() -> None:
    image = Image.new("RGB", SIZE, INK)
    draw = ImageDraw.Draw(image)
    draw.ellipse((100, 105, 235, 240), fill=SIGNAL)
    draw.text((135, 148), "Q0", font=font(34, bold=True, mono=True), fill=INK)
    draw.text((100, 350), "Qorx Zero.", font=font(110, bold=True), fill=PAPER)
    draw.text((100, 510), "Keep the memory. Send the proof.", font=font(55), fill=SIGNAL)
    draw.text((100, 930), "NAMASTEDEV HACKATHON · 2026", font=font(26, mono=True), fill="#c9c4b9")
    image.save(DEMO / "09-close.png")


def main() -> None:
    screenshot_frame("01-reset-full.png", 0, "01-hero.png")
    screenshot_frame("01-reset-full.png", 650, "02-overview.png")
    screenshot_frame("02-remember-full.png", 950, "03-remember.png")
    screenshot_frame("03-recall-full.png", 1180, "04-recall.png")
    screenshot_frame("04-unsupported-full.png", 1180, "05-unsupported.png")
    screenshot_frame("05-forget-full.png", 1180, "06-forget.png")
    architecture_frame()
    validation_frame()
    closing_frame()

    durations = [19, 14, 16, 28, 15, 17, 24, 24, 3]
    frame_names = [
        "01-hero.png", "02-overview.png", "03-remember.png", "04-recall.png",
        "05-unsupported.png", "06-forget.png", "07-architecture.png",
        "08-validation.png", "09-close.png",
    ]
    entries = []
    for name, duration in zip(frame_names, durations):
        entries.extend((f"file '{name}'", f"duration {duration}"))
    entries.append("file '09-close.png'")
    (DEMO / "frames.txt").write_text("\n".join(entries) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
