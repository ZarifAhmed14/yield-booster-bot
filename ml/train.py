from __future__ import annotations

import argparse
import json
import random
from collections import defaultdict
from pathlib import Path

import torch
from PIL import Image
from torch import nn
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms


SEED = 42
CLASS_DIRS = {
    "early_blight": "Potato___Early_blight",
    "healthy": "Potato___healthy",
    "late_blight": "Potato___Late_blight",
}


class PotatoDataset(Dataset):
    def __init__(self, samples: list[tuple[Path, int]], transform: transforms.Compose):
        self.samples = samples
        self.transform = transform

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, index: int) -> tuple[torch.Tensor, int]:
        path, label = self.samples[index]
        with Image.open(path) as image:
            return self.transform(image.convert("RGB")), label


def split_samples(data_dir: Path) -> tuple[list, list, list, list[str]]:
    rng = random.Random(SEED)
    class_names = list(CLASS_DIRS)
    splits: dict[str, list[tuple[Path, int]]] = defaultdict(list)

    for label, class_name in enumerate(class_names):
        class_dir = data_dir / CLASS_DIRS[class_name]
        files = sorted(path for path in class_dir.iterdir() if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"})
        if not files:
            raise FileNotFoundError(f"No images found for {class_name} in {data_dir}")
        rng.shuffle(files)
        train_end = int(len(files) * 0.70)
        val_end = int(len(files) * 0.85)
        for name, subset in (
            ("train", files[:train_end]),
            ("val", files[train_end:val_end]),
            ("test", files[val_end:]),
        ):
            splits[name].extend((path, label) for path in subset)

    for values in splits.values():
        rng.shuffle(values)
    return splits["train"], splits["val"], splits["test"], class_names


def make_model(class_count: int) -> nn.Module:
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
    for parameter in model.features.parameters():
        parameter.requires_grad = False
    for block in model.features[-3:]:
        for parameter in block.parameters():
            parameter.requires_grad = True
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, class_count)
    return model


def evaluate(model: nn.Module, loader: DataLoader, device: torch.device, class_count: int) -> dict:
    model.eval()
    matrix = torch.zeros((class_count, class_count), dtype=torch.int64)
    loss_sum = 0.0
    criterion = nn.CrossEntropyLoss()
    with torch.inference_mode():
        for inputs, labels in loader:
            inputs, labels = inputs.to(device), labels.to(device)
            logits = model(inputs)
            loss_sum += criterion(logits, labels).item() * labels.size(0)
            predictions = logits.argmax(dim=1)
            for actual, predicted in zip(labels.cpu(), predictions.cpu()):
                matrix[actual, predicted] += 1

    total = int(matrix.sum())
    per_class = []
    for index in range(class_count):
        true_positive = int(matrix[index, index])
        predicted_total = int(matrix[:, index].sum())
        actual_total = int(matrix[index, :].sum())
        precision = true_positive / predicted_total if predicted_total else 0.0
        recall = true_positive / actual_total if actual_total else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        per_class.append({"precision": precision, "recall": recall, "f1": f1, "support": actual_total})
    return {
        "loss": loss_sum / total,
        "accuracy": int(matrix.diag().sum()) / total,
        "macro_f1": sum(item["f1"] for item in per_class) / class_count,
        "per_class": per_class,
        "confusion_matrix": matrix.tolist(),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Fine-tune MobileNetV3 on PlantVillage potato leaves.")
    parser.add_argument("--data", type=Path, default=Path(".ml-data/plantvillage/raw/color"))
    parser.add_argument("--output", type=Path, default=Path("ml/artifacts/potato_mobilenet_v3.pt"))
    parser.add_argument("--epochs", type=int, default=8)
    parser.add_argument("--batch-size", type=int, default=32)
    args = parser.parse_args()

    random.seed(SEED)
    torch.manual_seed(SEED)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(SEED)
        torch.backends.cudnn.benchmark = True

    train_samples, val_samples, test_samples, class_names = split_samples(args.data)
    normalize = transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.72, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(12),
        transforms.ColorJitter(0.18, 0.18, 0.15, 0.04),
        transforms.ToTensor(),
        normalize,
    ])
    eval_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        normalize,
    ])

    workers = 0  # Windows-safe and fast enough for this 2,152-image demo dataset.
    train_loader = DataLoader(PotatoDataset(train_samples, train_transform), batch_size=args.batch_size, shuffle=True, num_workers=workers)
    val_loader = DataLoader(PotatoDataset(val_samples, eval_transform), batch_size=args.batch_size, num_workers=workers)
    test_loader = DataLoader(PotatoDataset(test_samples, eval_transform), batch_size=args.batch_size, num_workers=workers)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = make_model(len(class_names)).to(device)
    counts = torch.bincount(torch.tensor([label for _, label in train_samples]), minlength=len(class_names)).float()
    class_weights = (counts.sum() / (len(class_names) * counts)).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = torch.optim.AdamW([
        {"params": model.features[-3:].parameters(), "lr": 1e-4},
        {"params": model.classifier.parameters(), "lr": 8e-4},
    ], weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)

    best_accuracy = -1.0
    best_state = None
    history = []
    print(f"Training {len(train_samples)} / validating {len(val_samples)} / testing {len(test_samples)} images on {device}.")
    for epoch in range(1, args.epochs + 1):
        model.train()
        running_loss = 0.0
        correct = 0
        seen = 0
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad(set_to_none=True)
            logits = model(inputs)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * labels.size(0)
            correct += int((logits.argmax(1) == labels).sum())
            seen += labels.size(0)
        scheduler.step()
        validation = evaluate(model, val_loader, device, len(class_names))
        row = {
            "epoch": epoch,
            "train_loss": running_loss / seen,
            "train_accuracy": correct / seen,
            "val_accuracy": validation["accuracy"],
            "val_macro_f1": validation["macro_f1"],
        }
        history.append(row)
        print(json.dumps(row))
        if validation["accuracy"] > best_accuracy:
            best_accuracy = validation["accuracy"]
            best_state = {key: value.detach().cpu() for key, value in model.state_dict().items()}

    if best_state is None:
        raise RuntimeError("Training produced no model state")
    model.load_state_dict(best_state)
    model.to(device)
    test_metrics = evaluate(model, test_loader, device, len(class_names))
    metrics = {
        "dataset": "PlantVillage potato subset (online demo data)",
        "seed": SEED,
        "class_names": class_names,
        "split_sizes": {"train": len(train_samples), "validation": len(val_samples), "test": len(test_samples)},
        "history": history,
        "test": test_metrics,
        "limitations": "Controlled-background online images; not validated for Bangladesh field use or treatment decisions.",
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    torch.save({"state_dict": best_state, "class_names": class_names, "metrics": metrics}, args.output)
    args.output.with_suffix(".metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps({"saved": str(args.output), "test": test_metrics}, indent=2))


if __name__ == "__main__":
    main()
