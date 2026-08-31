from __future__ import annotations

import asyncio
import io
import json
import os
import time
from collections import defaultdict, deque
from pathlib import Path

import torch
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image, UnidentifiedImageError
from torchvision import models, transforms

from ml.inference_policy import CONFIDENCE_THRESHOLD, MARGIN_THRESHOLD, image_quality, should_reject


MODEL_PATH = Path(os.getenv("ALUSATHI_MODEL", "ml/artifacts/potato_mobilenet_v3.pt"))
MODEL_METADATA_PATH = Path(os.getenv("ALUSATHI_MODEL_METADATA", "ml/artifacts/potato_mobilenet_v3.metrics.json"))
REGIONAL_EVALUATION_PATH = Path(os.getenv("ALUSATHI_REGIONAL_EVALUATION", "ml/artifacts/regional_evaluation.json"))
MODEL_VERSION = os.getenv("ALUSATHI_MODEL_VERSION", "plantvillage-mobilenet-v3-2026.1")
FIELD_VALIDATED = os.getenv("ALUSATHI_FIELD_VALIDATED", "false").lower() == "true"
MAX_UPLOAD_BYTES = 8 * 1024 * 1024
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}
inference_slots = asyncio.Semaphore(2)
request_times: dict[str, deque[float]] = defaultdict(deque)
LABELS = {
    "early_blight": {"en": "Early blight", "bn": "আগাম ধসা রোগ"},
    "healthy": {"en": "No supported blight pattern", "bn": "সমর্থিত ধসার লক্ষণ পাওয়া যায়নি"},
    "late_blight": {"en": "Late blight", "bn": "নাবি ধসা রোগ"},
    "unknown": {"en": "Uncertain result", "bn": "অনিশ্চিত ফলাফল"},
}
NEXT_STEPS = {
    "early_blight": {
        "en": ["Mark heavily affected foliage.", "Avoid overhead watering and record spread for 48 hours.", "Ask an agricultural expert before any chemical treatment."],
        "bn": ["অতিরিক্ত আক্রান্ত পাতা চিহ্নিত করুন।", "পাতার উপর দিয়ে সেচ এড়িয়ে ৪৮ ঘণ্টা রোগের বিস্তার লক্ষ্য করুন।", "কোনো রাসায়নিক ব্যবহারের আগে কৃষি বিশেষজ্ঞের পরামর্শ নিন।"],
    },
    "late_blight": {
        "en": ["Treat this as urgent and avoid moving wet foliage between fields.", "Improve drainage and photograph nearby plants.", "Ask an agricultural expert before selecting any fungicide."],
        "bn": ["এটিকে জরুরি হিসেবে বিবেচনা করুন এবং ভেজা গাছ এক জমি থেকে অন্য জমিতে নেবেন না।", "পানি নিষ্কাশন ঠিক করুন এবং আশপাশের গাছের ছবি তুলুন।", "ছত্রাকনাশক বাছাইয়ের আগে কৃষি বিশেষজ্ঞের পরামর্শ নিন।"],
    },
    "healthy": {
        "en": ["No supported blight pattern was detected.", "Continue weekly scans from the same field points.", "Escalate if symptoms spread or the plant declines."],
        "bn": ["সমর্থিত ধসা রোগের লক্ষণ পাওয়া যায়নি।", "একই স্থান থেকে প্রতি সপ্তাহে স্ক্যান চালিয়ে যান।", "লক্ষণ ছড়ালে বা গাছ দুর্বল হলে বিশেষজ্ঞকে জানান।"],
    },
    "unknown": {
        "en": ["Retake two close, sharp leaf photos in daylight.", "Include both sides of the affected leaf.", "Ask an agricultural expert; do not treat from this result."],
        "bn": ["দিনের আলোতে পাতার দুটি পরিষ্কার কাছের ছবি আবার তুলুন।", "আক্রান্ত পাতার দুই পাশের ছবি দিন।", "কৃষি বিশেষজ্ঞের পরামর্শ নিন; এই ফলাফলের ভিত্তিতে চিকিৎসা করবেন না।"],
    },
}

app = FastAPI(title="AluSathi demo disease API", version="0.1.0", docs_url=None, redoc_url=None)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None
class_names: list[str] = []
model_metadata: dict = {}
regional_evaluation: dict = {}
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def load_model() -> None:
    global model, class_names, model_metadata, regional_evaluation
    if not MODEL_PATH.exists():
        return
    checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=True)
    class_names = checkpoint["class_names"]
    loaded = models.mobilenet_v3_small(weights=None)
    loaded.classifier[3] = torch.nn.Linear(loaded.classifier[3].in_features, len(class_names))
    loaded.load_state_dict(checkpoint["state_dict"])
    loaded.eval().to(device)
    model = loaded
    if MODEL_METADATA_PATH.exists():
        with MODEL_METADATA_PATH.open("r", encoding="utf-8") as metadata_file:
            model_metadata = json.load(metadata_file)
    if REGIONAL_EVALUATION_PATH.exists():
        with REGIONAL_EVALUATION_PATH.open("r", encoding="utf-8") as evaluation_file:
            regional_evaluation = json.load(evaluation_file)


@app.on_event("startup")
def startup() -> None:
    load_model()


@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers.update({
        "Cache-Control": "no-store",
        "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Permissions-Policy": "camera=(self), microphone=(), geolocation=()",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    })
    return response


@app.exception_handler(Exception)
async def safe_error(_, __):
    return JSONResponse(status_code=500, content={"detail": "Analysis failed safely. Please try another image."})


@app.get("/health")
def health() -> dict:
    return {
        "status": "ready" if model is not None else "model_missing",
        "device": str(device),
        "model": MODEL_PATH.name,
        "model_version": MODEL_VERSION,
        "classes": class_names,
        "test_accuracy": model_metadata.get("test", {}).get("accuracy"),
        "controlled_test_accuracy": model_metadata.get("test", {}).get("accuracy"),
        "regional_test_accuracy": regional_evaluation.get("raw", {}).get("accuracy"),
        "regional_test_images": regional_evaluation.get("images"),
        "field_validated": FIELD_VALIDATED,
        "demo_only": True,
    }


@app.post("/disease/predict")
async def predict(request: Request, file: UploadFile = File(...)) -> dict:
    if model is None:
        raise HTTPException(503, "The disease-screening model is unavailable.")
    client = request.client.host if request.client else "unknown"
    now = time.monotonic()
    recent = request_times[client]
    while recent and recent[0] < now - 60:
        recent.popleft()
    if len(recent) >= 20:
        raise HTTPException(429, "Too many scans. Please wait one minute.")
    recent.append(now)
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(415, "Upload a JPEG, PNG, or WebP image.")
    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Image must be 8 MB or smaller.")
    try:
        with Image.open(io.BytesIO(content)) as source:
            if source.format not in ALLOWED_FORMATS:
                raise HTTPException(400, "The file content does not match an allowed image type.")
            if min(source.size) < 128 or max(source.size) > 8000:
                raise HTTPException(400, "Image dimensions must be between 128 and 8,000 pixels.")
            source.verify()
        with Image.open(io.BytesIO(content)) as source:
            image = source.convert("RGB")
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise HTTPException(400, "The uploaded file is not a safe, readable image.")
    quality = image_quality(image)
    quality_warning = bool(quality["issues"])

    async with inference_slots:
        with torch.inference_mode():
            probabilities = torch.softmax(model(preprocess(image).unsqueeze(0).to(device)), dim=1)[0].cpu()
    sorted_values, sorted_indexes = torch.sort(probabilities, descending=True)
    confidence = float(sorted_values[0])
    margin = float(sorted_values[0] - sorted_values[1])
    predicted = class_names[int(sorted_indexes[0])]
    rejection_reasons = list(quality["issues"])
    if confidence < CONFIDENCE_THRESHOLD:
        rejection_reasons.append("low_confidence")
    if margin < MARGIN_THRESHOLD:
        rejection_reasons.append("close_competing_predictions")
    if not FIELD_VALIDATED:
        rejection_reasons.append("field_validation_pending")
    uncertain = should_reject(confidence, margin, quality["issues"]) or not FIELD_VALIDATED
    label = "unknown" if uncertain else predicted

    return {
        "label": label,
        "labels": LABELS[label],
        "confidence": round(confidence, 4),
        "quality_warning": quality_warning,
        "quality": quality,
        "rejection_reasons": rejection_reasons,
        "field_validated": FIELD_VALIDATED,
        # Demo data has field-domain and false-negative risk, so every result stays advisory.
        "needs_expert_review": True,
        "probabilities": {class_names[index]: round(float(probabilities[index]), 4) for index in range(len(class_names))},
        "next_steps": NEXT_STEPS[label],
        "model_scope": "PlantVillage-trained research model; regional testing did not meet the field-use threshold.",
        "treatment_status": "Screening guidance only—confirm chemical decisions with an agricultural expert.",
    }


load_model()
