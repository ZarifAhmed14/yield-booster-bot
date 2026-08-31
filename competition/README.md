# AluSathi Competition Package

## One-line pitch

AluSathi helps Bangladesh potato farmers photograph a leaf, understand uncertainty in simple Bangla, check five field locations and reach a human expert before taking a risky treatment decision.

## Why it matters

Leaf-disease AI often performs well on clean online images and poorly in real fields. AluSathi makes that gap visible: it combines a reproducible vision pipeline with quality checks, uncertainty rejection, offline recovery, voice guidance and human escalation.

## Evidence status

| Evidence | Status | Location |
| --- | --- | --- |
| Working local end-to-end demo | Complete | repository run commands |
| Controlled model evaluation | Complete | `ml/artifacts/potato_mobilenet_v3.metrics.json` |
| External regional evaluation | Complete | `PHASE1_EVALUATION.md` |
| Model card | Complete | `competition/MODEL_CARD.md` |
| Dataset card | Complete | `competition/DATASET_CARD.md` |
| Architecture and technical documentation | Complete | `PROJECT_DOCUMENTATION.md` |
| Responsible-AI statement | Complete | `competition/RESPONSIBLE_AI.md` |
| Before/after farmer journey | Complete | below |
| Five-to-ten-person usability study | Pending real participants | `competition/USABILITY_TEST.md` |
| Two-minute backup recording | Pending recording | `competition/DEMO_RUNBOOK.md` |
| Public deployment | Skipped for now | deployment phase |

## Before and after

| Without AluSathi | With AluSathi |
| --- | --- |
| Farmer notices a mark but may not know what evidence to collect | App guides one clear close photo at a time |
| One leaf may be treated as proof of the whole field | Five-location mode encourages broader observation |
| A confident AI answer may be mistaken for a diagnosis | Unsafe or unvalidated results fail closed |
| Poor internet can end the attempt | Photo stays on the phone and retries after reconnection |
| Written advice may be hard to read | Guidance can be heard aloud in Bangla |
| Farmer may act before speaking to an expert | 16123 escalation is placed beside the result |

## Honest judging statement

The current model is not field-ready. Its 51.19% external regional accuracy is itself a project finding, not a hidden weakness. The competition demo should emphasize the validated system architecture and safety behavior while the next model is trained and reviewed on properly separated regional field data.
