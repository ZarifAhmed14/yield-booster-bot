"""Curate licensed tuber images without inventing finer labels or padding counts."""
import argparse
import csv
import hashlib
import io
import json
import random
import zipfile
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageOps

SOURCES = {
    "potatocare": {"url": "https://data.mendeley.com/datasets/7vm7xskfg4/2", "author": "Samiul Islam", "license": "CC BY 4.0"},
    "bd_healthy": {"url": "https://data.mendeley.com/datasets/5m38z6jthb/1", "author": "Mehedi Hasan Mridha and Nazmus Sakib Mridha", "license": "CC BY 4.0"},
    "original": {"url": "https://data.mendeley.com/datasets/pmbc875pr7/1", "author": "Mafi, Dipu, Moazzam and Uddin", "license": "CC BY 4.0"},
    "hybrid": {"url": "https://zenodo.org/records/20616991", "author": "Cristian Armijos-Sarango", "license": "CC BY 4.0"},
}
LABELS = {"Healthy Potato": "healthy", "Blackspot Bruising Disease": "blackspot_bruising", "Potato Dry Rot Disease": "dry_rot", "Potato Soft Rot Disease": "soft_rot", "Potato Brown Rot Disease": "brown_rot", "Buen estado": "healthy", "Defectuoso": "defective_unspecified"}
LABELS.update({"Healthy Potatoes": "healthy", "Dry Rot": "dry_rot", "Blackspot Bruising": "blackspot_bruising", "Soft Rot": "soft_rot", "Brown Rot": "brown_rot", "Common Scab": "common_scab", "Black Scurf": "black_scurf", "Pink Rot": "pink_rot"})


class HashTree:
    def __init__(self):
        self.root = None

    def near(self, value, radius=4):
        stack = [self.root] if self.root else []
        while stack:
            node = stack.pop()
            distance = (value ^ node[0]).bit_count()
            if distance <= radius:
                return True
            stack.extend(child for edge, child in node[1].items() if distance-radius <= edge <= distance+radius)
        return False

    def add(self, value):
        if self.root is None:
            self.root = (value, {})
            return
        node = self.root
        while True:
            distance = (value ^ node[0]).bit_count()
            if distance not in node[1]:
                node[1][distance] = (value, {})
                return
            node = node[1][distance]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--resume", action="store_true")
    args = parser.parse_args()
    output = args.root / "curated"
    output.mkdir(parents=True, exist_ok=True)
    if (output / "manifest.csv").exists() and not args.resume:
        raise SystemExit("A curated manifest already exists; use a fresh output directory.")
    rng = random.Random(42)
    rows, rejected = [], Counter()
    counts = Counter()
    exact, tree = set(), HashTree()
    if args.resume:
        with (output / "manifest.csv").open(encoding="utf-8", newline="") as handle:
            rows = list(csv.DictReader(handle))
        for row in rows:
            exact.add(row["sha256_pixels"]); tree.add(int(row["dhash"], 16)); counts[row["broad_label"]] += 1
    seen_source_files = {(r["source"], r["source_file"]) for r in rows}
    archives = [("bd_healthy", "bd_healthy.zip")] if (args.root / "downloads" / "bd_healthy.zip").exists() else []
    if (args.root / "downloads" / "potatocare.zip").exists(): archives += [("potatocare", "potatocare.zip")]
    archives += [("original", "potato_disease_original.zip"), ("hybrid", "hybrid.zip")]
    for source, filename in archives:
        with zipfile.ZipFile(args.root / "downloads" / filename) as archive:
            names = [n for n in archive.namelist() if n.lower().endswith((".jpg", ".jpeg", ".png"))]
            rng.shuffle(names)
            for index, name in enumerate(names):
                if len(rows) >= 13800: break
                if (source, name) in seen_source_files: continue
                if "aug" in Path(name).stem.lower():
                    rejected["explicit_augmentation"] += 1
                    continue
                category = "healthy" if source == "bd_healthy" else next((LABELS[part] for part in Path(name).parts if part in LABELS), None)
                if not category:
                    rejected["unmapped_label"] += 1
                    continue
                broad = "healthy" if category == "healthy" else "defective"
                if broad == "healthy" and counts[broad] >= 6900:
                    continue
                if archive.getinfo(name).file_size > 20 * 1024 * 1024:
                    rejected["oversized"] += 1
                    continue
                try:
                    with Image.open(io.BytesIO(archive.read(name))) as raw:
                        if min(raw.size) < 96 or max(raw.size) / min(raw.size) > 3:
                            rejected["dimensions"] += 1
                            continue
                        image = ImageOps.exif_transpose(raw).convert("RGB")
                        image.thumbnail((1024, 1024))
                        digest = hashlib.sha256(image.tobytes()).hexdigest()
                        small = np.asarray(image.convert("L").resize((9, 8)))
                        visual_hash = int.from_bytes(np.packbits(small[:, 1:] > small[:, :-1]).tobytes(), "big")
                        if digest in exact or tree.near(visual_hash):
                            rejected["duplicate_or_near_duplicate"] += 1
                            continue
                        exact.add(digest); tree.add(visual_hash)
                        target = output / category / f"{source}_{digest[:20]}.jpg"
                        target.parent.mkdir(exist_ok=True)
                        image.save(target, "JPEG", quality=92)
                        rows.append({"file": target.relative_to(output).as_posix(), "label": category, "broad_label": broad, "source": source, "source_file": name, "source_split": name.split("/")[0] if source == "hybrid" else "unsplit", "sha256_pixels": digest, "dhash": f"{visual_hash:016x}", **SOURCES[source]})
                        counts[broad] += 1
                except (OSError, ValueError, Image.DecompressionBombError):
                    rejected["unreadable"] += 1
                if index % 2000 == 0:
                    print(source, index, dict(counts), flush=True)
    with (output / "manifest.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader(); writer.writerows(rows)
    summary = {"target": 13800, "accepted": len(rows), "categories": dict(Counter(r["label"] for r in rows)), "rejected_this_pass": dict(rejected), "sources": SOURCES}
    (output / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    card = f"# AluSathi potato tuber collection\n\nAccepted: {len(rows)} / target 13,800.\n\n" + "\n".join(f"- {key}: {value}" for key, value in summary["categories"].items()) + "\n\nSource labels are preserved, not independently diagnosed. Hybrid data mixes Ecuadorian varieties and incorporated public datasets; it is not exclusively Bangladeshi. Defective-unspecified images lack reliable subtype labels. Original disease data comes from Mendeley pmbc875pr7. Author and CC BY 4.0 attribution are recorded for every image in manifest.csv.\n\nImages were decoded, EXIF-normalized, resized only when larger than 1024px, and JPEG encoded. Pixel duplicates and 64-bit difference-hash neighbours within distance 4 were excluded. No new augmentations or synthetic images were generated. Source-level augmentation history and tuber identity are not fully known; accepted images do not mean independent tubers. The publisher's split is recorded for traceability, not endorsed as leakage-free. Group by original tuber/session where available and use newly collected Bangladesh field/tuber photographs for an independent test. Do not mix this collection with the leaf classifier.\n\nThe flat category folders are for curation. Build a separate tuber model, and audit labels with an expert before training. These images do not supply instance masks, counting labels, or calibrated commercial-size grades.\n"
    card += "\nAdditional source notes: the Bangladesh healthy-originals dataset (5m38z6jthb) contains 150 published images; most overlap the hybrid collection. PotatoCare v2 is a merged-source dataset with unclear original-versus-augmented identity. Its downloaded archive contains 3,905 image files, not the 10,117 stated in its description. Blackleg and Miscellaneous folders were excluded because they do not reliably identify a tuber health class. Files explicitly named as augmented were excluded; unmarked source transformations may remain. Do not treat this collection as an independent evaluation set.\n\nRare disease classes are for exploratory use, not enough to substantiate reliable per-disease performance. Begin with a reviewed healthy/defective task or gather more expert-labelled originals before using these subtypes. Healthy means the publisher labelled the pictured sample healthy; it is not proof of food safety.\n"
    if len(rows) < 13800: card += f"\nTarget shortfall: {13800-len(rows):,} images. No duplicates or new artificial augmentations were added to fill this gap.\n"
    (output / "DATASET_CARD.md").write_text(card, encoding="utf-8")
    packages = args.root / "packages"; packages.mkdir(exist_ok=True)
    for category in summary["categories"]:
        files = sorted((output / category).glob("*.jpg"))
        part, size, package = 0, 0, None
        try:
            for file in files:
                if package is None or size + file.stat().st_size > 75 * 1024 * 1024:
                    if package: package.close()
                    part += 1; size = 0
                    package = zipfile.ZipFile(packages / f"{category}_{part:02d}.zip", "w", compression=zipfile.ZIP_STORED)
                package.write(file, file.relative_to(output)); size += file.stat().st_size
        finally:
            if package: package.close()
    sample = []
    for category in summary["categories"]:
        sample.extend([r for r in rows if r["label"] == category][:6])
    sheet = Image.new("RGB", (6*180, ((len(sample)+5)//6)*200), "white")
    draw = ImageDraw.Draw(sheet)
    for i, row in enumerate(sample):
        with Image.open(output / row["file"]) as photo:
            photo.thumbnail((172, 172)); x, y = (i%6)*180, (i//6)*200
            sheet.paste(photo, (x, y)); draw.text((x+2, y+175), row["label"], fill="black")
    sheet.save(args.root / "contact_sheet.jpg")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
