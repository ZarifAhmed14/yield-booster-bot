from __future__ import annotations

from PIL import Image, ImageStat


CONFIDENCE_THRESHOLD = 0.72
MARGIN_THRESHOLD = 0.18


def image_quality(image: Image.Image) -> dict:
    grayscale = image.convert("L").resize((128, 128))
    stats = ImageStat.Stat(grayscale)
    brightness = float(stats.mean[0])
    contrast = float(stats.stddev[0])
    issues = []
    if contrast < 18:
        issues.append("low_contrast")
    if brightness < 35:
        issues.append("too_dark")
    elif brightness > 225:
        issues.append("too_bright")
    return {"brightness": round(brightness, 2), "contrast": round(contrast, 2), "issues": issues}


def should_reject(confidence: float, margin: float, quality_issues: list[str]) -> bool:
    return bool(quality_issues) or confidence < CONFIDENCE_THRESHOLD or margin < MARGIN_THRESHOLD
