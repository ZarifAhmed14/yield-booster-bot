# AluSathi vision model

The demo fine-tunes MobileNetV3-Small on the three potato classes from the open PlantVillage dataset: early blight, healthy, and late blight.

```powershell
git clone --depth 1 --filter=blob:none --sparse https://github.com/spMohanty/PlantVillage-Dataset.git .ml-data/plantvillage
cd .ml-data/plantvillage
git sparse-checkout set raw/color/Potato___Early_blight raw/color/Potato___Late_blight raw/color/Potato___healthy
cd ../..
.venv/Scripts/python.exe ml/train.py
.venv/Scripts/python.exe -m uvicorn ml.server:app --host 127.0.0.1 --port 8765
```

PlantVillage contains controlled-background images. The resulting model is suitable for screening-pipeline validation, not pesticide selection or field deployment. Replace it with locally collected, expert-labelled Bangladesh field data and evaluate using field-held-out splits before production use.

The backend loads the checkpoint named by `ALUSATHI_MODEL` and exposes the loaded filename, version, classes and recorded test accuracy from `/health`. A replacement checkpoint must keep the same `class_names` and `state_dict` structure or the loader must be adapted and parity-tested before release.

Dataset citation: Mohanty, Hughes & Salathe, *Using Deep Learning for Image-Based Plant Disease Detection*, Frontiers in Plant Science (2016), DOI: 10.3389/fpls.2016.01419.
