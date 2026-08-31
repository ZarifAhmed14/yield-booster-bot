# Phase 1 model evaluation

## Decision

**Not approved for field diagnosis.** The API now fails closed and returns an uncertain result unless `ALUSATHI_FIELD_VALIDATED=true` is deliberately set after a future validation review.

## External benchmark

The MobileNetV3 checkpoint was trained on PlantVillage and evaluated, without retraining, on 13,800 deduplicated regional images from Bangladesh, Uttar Pradesh and West Bengal.

| Measure | Result |
| --- | ---: |
| PlantVillage test accuracy | 95.98% |
| Regional raw accuracy | 51.19% |
| Regional macro F1 | 50.34% |
| West Bengal field accuracy | 36.33% |
| Expected calibration error | 28.90% |

Per-class regional recall was 59.85% for early blight, 33.18% for healthy leaves and 57.28% for late blight. Raising the confidence threshold to 99% still produced only 73.42% accuracy while accepting 12.81% of images. Confidence alone therefore cannot make this model safe.

## Safety changes

- Image type, decoded content, dimensions and 8 MB size are validated server-side.
- Dark, bright and low-contrast images are rejected.
- Low-confidence and close competing predictions are rejected.
- The external benchmark and field-validation status are exposed by `/health`.
- Disease labels and confidence are hidden while field validation is pending.
- Treatment remains outside the model; every response directs farmers to an agricultural expert.

## Reproduce

```powershell
.venv\Scripts\python.exe ml\evaluate.py --data C:\path\to\AluSathi_dataset_upload
.venv\Scripts\python.exe -m unittest tests.test_inference_policy tests.test_api_safety
```

The complete machine-readable report, confusion matrices, source breakdown and 50 highest-confidence failures are in `ml/artifacts/regional_evaluation.json`.

## Known limits

- Source labels still require a plant-pathologist audit.
- Only 24 non-augmented BARI images remained after curation, so Bangladesh-specific accuracy is not estimable.
- Farm identifiers are unavailable, preventing farm-held-out analysis.
- A three-class classifier cannot verify that an upload actually contains a potato leaf; a future field model needs an explicit unsupported-image detector.
