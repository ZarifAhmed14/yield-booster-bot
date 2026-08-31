from __future__ import annotations

import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path

import torch
from PIL import Image
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms

try:
    from ml.inference_policy import CONFIDENCE_THRESHOLD, MARGIN_THRESHOLD, image_quality, should_reject
except ModuleNotFoundError:
    from inference_policy import CONFIDENCE_THRESHOLD, MARGIN_THRESHOLD, image_quality, should_reject


class ManifestDataset(Dataset):
    def __init__(self, root: Path, manifest: Path, class_names: list[str], transform):
        self.root = root
        self.transform = transform
        self.class_to_index = {name: index for index, name in enumerate(class_names)}
        with manifest.open(newline="", encoding="utf-8-sig") as source:
            self.rows = [row for row in csv.DictReader(source) if row["label"] in self.class_to_index]

    def __len__(self) -> int:
        return len(self.rows)

    def __getitem__(self, index: int):
        row = self.rows[index]
        path = self.root / row["filename"]
        with Image.open(path) as source:
            image = source.convert("RGB")
        quality = image_quality(image)
        return (
            self.transform(image),
            self.class_to_index[row["label"]],
            row["source"],
            row["filename"],
            quality["brightness"],
            quality["contrast"],
            ",".join(quality["issues"]),
        )


def classification_metrics(records: list[dict], class_names: list[str]) -> dict:
    matrix = [[0 for _ in class_names] for _ in class_names]
    for row in records:
        matrix[row["actual_index"]][row["predicted_index"]] += 1
    per_class = {}
    for index, name in enumerate(class_names):
        true_positive = matrix[index][index]
        predicted_total = sum(row[index] for row in matrix)
        actual_total = sum(matrix[index])
        precision = true_positive / predicted_total if predicted_total else 0.0
        recall = true_positive / actual_total if actual_total else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        per_class[name] = {"precision": precision, "recall": recall, "f1": f1, "support": actual_total}
    return {
        "accuracy": sum(matrix[i][i] for i in range(len(class_names))) / len(records),
        "macro_f1": sum(item["f1"] for item in per_class.values()) / len(class_names),
        "per_class": per_class,
        "confusion_matrix": matrix,
    }


def calibration_error(records: list[dict], bins: int = 10) -> float:
    error = 0.0
    for lower_index in range(bins):
        lower, upper = lower_index / bins, (lower_index + 1) / bins
        bucket = [row for row in records if lower <= row["confidence"] <= upper and (lower_index == bins - 1 or row["confidence"] < upper)]
        if bucket:
            accuracy = sum(row["correct"] for row in bucket) / len(bucket)
            confidence = sum(row["confidence"] for row in bucket) / len(bucket)
            error += len(bucket) / len(records) * abs(accuracy - confidence)
    return error


def policy_metrics(
    records: list[dict],
    confidence_threshold: float = CONFIDENCE_THRESHOLD,
    margin_threshold: float = MARGIN_THRESHOLD,
) -> dict:
    def rejected_by_policy(row: dict) -> bool:
        return bool(row["quality_issues"]) or row["confidence"] < confidence_threshold or row["margin"] < margin_threshold

    accepted = [row for row in records if not rejected_by_policy(row)]
    rejected = [row for row in records if rejected_by_policy(row)]
    mistakes = [row for row in records if not row["correct"]]
    rejected_mistakes = [row for row in rejected if not row["correct"]]
    return {
        "coverage": len(accepted) / len(records),
        "accepted": len(accepted),
        "rejected": len(rejected),
        "selective_accuracy": sum(row["correct"] for row in accepted) / len(accepted) if accepted else 0.0,
        "accepted_error_rate": sum(not row["correct"] for row in accepted) / len(accepted) if accepted else 0.0,
        "error_capture_rate": len(rejected_mistakes) / len(mistakes) if mistakes else 1.0,
        "quality_rejections": sum(bool(row["quality_issues"]) for row in records),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate AluSathi on a never-trained regional manifest.")
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--manifest", type=Path)
    parser.add_argument("--model", type=Path, default=Path("ml/artifacts/potato_mobilenet_v3.pt"))
    parser.add_argument("--output", type=Path, default=Path("ml/artifacts/regional_evaluation.json"))
    parser.add_argument("--batch-size", type=int, default=64)
    args = parser.parse_args()
    manifest = args.manifest or args.data / "online_import_manifest.csv"

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    checkpoint = torch.load(args.model, map_location=device, weights_only=True)
    class_names = checkpoint["class_names"]
    model = models.mobilenet_v3_small(weights=None)
    model.classifier[3] = torch.nn.Linear(model.classifier[3].in_features, len(class_names))
    model.load_state_dict(checkpoint["state_dict"])
    model.eval().to(device)
    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    dataset = ManifestDataset(args.data, manifest, class_names, preprocess)
    loader = DataLoader(dataset, batch_size=args.batch_size, num_workers=0)
    records = []
    with torch.inference_mode():
        for batch_number, (inputs, labels, sources, filenames, brightness, contrast, quality_issues) in enumerate(loader, 1):
            probabilities = torch.softmax(model(inputs.to(device)), dim=1).cpu()
            values, indexes = probabilities.sort(dim=1, descending=True)
            for index in range(len(labels)):
                confidence = float(values[index, 0])
                margin = float(values[index, 0] - values[index, 1])
                actual_index = int(labels[index])
                predicted_index = int(indexes[index, 0])
                issues = [item for item in quality_issues[index].split(",") if item]
                records.append({
                    "filename": filenames[index],
                    "source": sources[index],
                    "actual": class_names[actual_index],
                    "predicted": class_names[predicted_index],
                    "actual_index": actual_index,
                    "predicted_index": predicted_index,
                    "correct": actual_index == predicted_index,
                    "confidence": confidence,
                    "margin": margin,
                    "brightness": float(brightness[index]),
                    "contrast": float(contrast[index]),
                    "quality_issues": issues,
                    "rejected": should_reject(confidence, margin, issues),
                })
            print(f"Evaluated {min(batch_number * args.batch_size, len(dataset))}/{len(dataset)}", end="\r")

    groups = defaultdict(list)
    for row in records:
        groups[row["source"]].append(row)
    raw = classification_metrics(records, class_names)
    report = {
        "evaluation_scope": "External regional images excluded from model training",
        "model": args.model.name,
        "device": str(device),
        "images": len(records),
        "class_names": class_names,
        "policy": {"confidence_threshold": CONFIDENCE_THRESHOLD, "margin_threshold": MARGIN_THRESHOLD},
        "raw": raw,
        "policy_results": policy_metrics(records),
        "confidence_policy_curve": {
            f"{threshold:.2f}": policy_metrics(records, threshold, MARGIN_THRESHOLD)
            for threshold in (0.50, 0.60, 0.70, 0.80, 0.90, 0.95, 0.98, 0.99)
        },
        "expected_calibration_error": calibration_error(records),
        "by_source": {
            name: {**classification_metrics(rows, class_names), "policy_results": policy_metrics(rows)}
            for name, rows in sorted(groups.items())
        },
        "confident_failures": sorted(
            ({key: row[key] for key in ("filename", "source", "actual", "predicted", "confidence", "margin", "quality_issues")} for row in records if not row["correct"] and not row["rejected"]),
            key=lambda row: row["confidence"],
            reverse=True,
        )[:50],
        "limitations": [
            "Source labels have not yet been fully audited by a plant pathologist.",
            "The manifest does not identify farms, so farm-held-out evaluation is not possible.",
            "This three-class classifier cannot prove that an uploaded image contains a potato leaf.",
        ],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"\nSaved {args.output}")
    print(json.dumps({"raw": raw, "policy_results": report["policy_results"], "by_source": report["by_source"]}, indent=2))


if __name__ == "__main__":
    main()
