# Dataset Card — AluSathi Potato-Leaf Data

## Training dataset

The checked-in model was trained on the potato subset of PlantVillage: early blight, healthy and late blight. These are predominantly controlled-background leaf photographs. The source is referenced in `ml/README.md`; the image files are not committed to GitHub.

## External regional evaluation collection

| Class | Images |
| --- | ---: |
| Early blight | 4,800 |
| Healthy | 4,000 |
| Late blight | 5,000 |
| Total | 13,800 |

Sources:

| Source | Region | DOI | License |
| --- | --- | --- | --- |
| PLDD-UP | Uttar Pradesh, India | `10.17632/3j4nfkvp2n.1` | CC BY 4.0 |
| Potato Leaf Disease Dataset | West Bengal, India | `10.17632/mwbwbdzz7z.1` | CC BY 4.0 |
| BARI potato leaf dataset | Bangladesh | `10.17632/d5b3fzpw3g.1` | CC BY 4.0 |

## Curation

- Rejected unreadable and implausibly small files.
- Removed exact duplicates across the collection.
- Removed near duplicates within each class using 64-bit difference hashes.
- Excluded BARI filenames prefixed `aug_`.
- Normalized EXIF orientation.
- Converted images to RGB JPEG with a maximum side of 1,024 px.
- Preserved a manifest containing label, source, DOI, license, source hash and original dimensions.

## Separation from training

The 13,800-image collection was used to evaluate the PlantVillage-trained checkpoint without retraining. It revealed the domain gap reported in `PHASE1_EVALUATION.md`.

## Limitations and governance

- Source labels have not been fully audited by a plant pathologist.
- Only 24 non-augmented BARI images remained after curation; Bangladesh-specific accuracy is not estimable.
- Farm identifiers are missing, so farm-held-out evaluation is unavailable.
- Future farmer-contributed photographs require explicit consent, a stated retention period and an opt-out path before training use.
- Synthetic augmentation must never be reported as new independent field evidence.
