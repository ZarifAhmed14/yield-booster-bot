"""Conservative, untrained surface screening for user-identified, separated tubers."""
from collections import deque
import numpy as np
from PIL import Image


def inspect_tubers(image: Image.Image) -> dict:
    image = image.copy().convert("RGB")
    image.thumbnail((256, 256))
    pixels = np.asarray(image).astype(float)
    h, w, _ = pixels.shape
    edges = np.concatenate((pixels[:3].reshape(-1, 3), pixels[-3:].reshape(-1, 3), pixels[:, :3].reshape(-1, 3), pixels[:, -3:].reshape(-1, 3)))
    background = np.median(edges, axis=0)
    base = {"method": "uniform_background_surface_heuristic", "validated": False, "count": None, "mixed_sizes": None, "surface_flags": [], "reason": "background_or_overlap"}
    if np.percentile(np.linalg.norm(edges - background, axis=1), 90) > 35:
        return base
    foreground = np.linalg.norm(pixels - background, axis=2) > 55
    visited = np.zeros((h, w), dtype=bool)
    components = []
    for y, x in zip(*np.where(foreground)):
        if visited[y, x]:
            continue
        queue = deque([(y, x)])
        visited[y, x] = True
        points = []
        while queue:
            cy, cx = queue.popleft()
            points.append((cy, cx))
            for ny, nx in ((cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1)):
                if 0 <= ny < h and 0 <= nx < w and foreground[ny, nx] and not visited[ny, nx]:
                    visited[ny, nx] = True
                    queue.append((ny, nx))
        if len(points) >= h * w * .008:
            points = np.array(points)
            if points[:, 0].min() < 3 or points[:, 0].max() >= h-3 or points[:, 1].min() < 3 or points[:, 1].max() >= w-3:
                return base
            ph, pw = np.ptp(points, axis=0) + 1
            if max(ph, pw) / min(ph, pw) > 3 or len(points) / (ph * pw) < .45:
                return base
            components.append(points)
    if not components or len(components) > 30:
        return base
    flags = set()
    for points in components:
        values = pixels[points[:, 0], points[:, 1]]
        red, green, blue = values.T
        if np.mean((green > red * 1.12) & (green > blue * 1.15) & (green > 55)) > .04:
            flags.add("green_patch")
        if np.mean(values.mean(axis=1) < 45) > .08:
            flags.add("dark_patch")
    areas = [len(p) for p in components]
    return {**base, "count": len(components), "mixed_sizes": max(areas) / min(areas) > 1.8, "surface_flags": sorted(flags), "reason": None}
