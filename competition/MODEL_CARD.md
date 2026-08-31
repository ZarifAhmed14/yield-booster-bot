# Model Card — AluSathi MobileNetV3-Small

## Summary

| Field | Value |
| --- | --- |
| Task | Potato-leaf image classification |
| Framework | PyTorch / torchvision |
| Architecture | MobileNetV3-Small transfer learning |
| Classes | `early_blight`, `healthy`, `late_blight` |
| Input | RGB image, resized then center-cropped to 224 × 224 |
| Artifact | `ml/artifacts/potato_mobilenet_v3.pt` |
| Artifact size | 6,209,487 bytes |
| Status | Research only; field lock enabled |

## Training

The model was initialized from torchvision ImageNet weights. Most feature layers were frozen; the final three feature blocks and classifier were fine-tuned. Training used random crop, horizontal flip, rotation and color jitter, with class-weighted cross entropy and AdamW.

PlantVillage split:

| Split | Images |
| --- | ---: |
| Train | 1,506 |
| Validation | 323 |
| Test | 323 |

The split was deterministic with seed 42. It is an image-level split from a controlled-background dataset and may overstate real-world performance.

## Results

| Evaluation | Accuracy | Macro F1 |
| --- | ---: | ---: |
| PlantVillage held-out test | 95.98% | 91.84% |
| Unseen regional collection | 51.19% | 50.34% |
| West Bengal field subset | 36.33% | 32.08% |

At a 99% confidence threshold, regional accepted-result accuracy was still only 73.42%, with 12.81% coverage. Confidence cannot repair the domain gap.

## Intended use

- Demonstrate a reproducible mobile vision and safety pipeline.
- Support supervised research and usability testing.
- Provide architecture scaffolding for a future regionally trained model.

## Prohibited use

- Confirmed diagnosis.
- Pesticide selection or dosage.
- Automatic treatment decisions.
- Farmer eligibility, insurance or financial decisions.

## Safety behavior

The API rejects poor-quality images, low-confidence predictions and close class margins. More importantly, `ALUSATHI_FIELD_VALIDATED` defaults to false, so the current model cannot expose a disease label through the normal interface.

## Known limitations

- Controlled training background.
- No unsupported-image or potato-leaf detector.
- No validated performance estimate for Bangladesh farms.
- Regional source labels require plant-pathologist audit.
- Farm identifiers are unavailable for farm-held-out evaluation.

## Replacement criteria

Do not enable field labels until an agricultural-domain reviewer approves the dataset and test protocol, field-held-out metrics meet a written threshold, calibration is reviewed, dangerous false negatives are analyzed and usability participants understand that the output is advisory.
