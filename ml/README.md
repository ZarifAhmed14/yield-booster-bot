# AluSathi vision model

The demo fine-tunes MobileNetV3-Small on the three potato classes from the open PlantVillage dataset: early blight, healthy, and late blight.

## Colab retraining

Make a copy of the working notebook before retraining. In the copy, select a T4 GPU, mount Drive, clone this repository, and run:

```python
!pip install -q -r ml/requirements.txt
!python ml/train.py --data /content/dataset --epochs 25 --batch-size 64
```

For honest evaluation, `/content/dataset` should contain `train`, `val`, and `test` folders, each containing `early_blight`, `healthy`, and `late_blight`. Keep images from the same farm, collection session, or video in only one split; otherwise near-duplicate images can make the score misleading. A flat three-class directory is still accepted for the older random-split workflow. The trainer now uses stronger field-style augmentation, fine-tunes six MobileNet blocks, applies label smoothing, and selects the checkpoint with the best validation macro-F1.

After training, download `ml/artifacts/potato_mobilenet_v3.pt`, replace the repository artifact, then regenerate the offline model with `python ml/export_onnx.py`.

```powershell
git clone --depth 1 --filter=blob:none --sparse https://github.com/spMohanty/PlantVillage-Dataset.git .ml-data/plantvillage
cd .ml-data/plantvillage
git sparse-checkout set raw/color/Potato___Early_blight raw/color/Potato___Late_blight raw/color/Potato___healthy
cd ../..
.venv/Scripts/python.exe ml/train.py
.venv/Scripts/python.exe -m uvicorn ml.server:app --host 127.0.0.1 --port 8765
```

PlantVillage contains controlled-background images. The resulting model is suitable for screening-pipeline validation, not pesticide selection or field deployment. Replace it with locally collected, expert-labelled Bangladesh field data and evaluate using field-held-out splits before production use.

## External regional evaluation

Run the model against a manifest-based dataset that was not used for training:

```powershell
.venv\Scripts\python.exe ml\evaluate.py --data C:\path\to\AluSathi_dataset_upload
```

The checked-in Phase 1 report covers 13,800 regional images. Raw accuracy fell to 51.19%, so the backend now returns an uncertain result by default. `ALUSATHI_FIELD_VALIDATED=true` must only be set after a future field-validation review approves the replacement model. See `PHASE1_EVALUATION.md`.

The backend loads the checkpoint named by `ALUSATHI_MODEL` and exposes the loaded filename, version, classes and recorded test accuracy from `/health`. A replacement checkpoint must keep the same `class_names` and `state_dict` structure or the loader must be adapted and parity-tested before release.

Dataset citation: Mohanty, Hughes & Salathe, *Using Deep Learning for Image-Based Plant Disease Detection*, Frontiers in Plant Science (2016), DOI: 10.3389/fpls.2016.01419.
