# AluSathi

Bangla-first, mobile-friendly potato leaf screening for Bangladesh farmers. FieldWatch supports guided three-photo checks, a five-location field check, offline browser inference, extreme-weather messages, voice guidance and a private disease-progress timeline.

Competition evidence, demo instructions and honest completion status are indexed in [`competition/README.md`](competition/README.md).

## Run locally

```powershell
npm install
npm run api
```

In a second terminal:

```powershell
npm run dev
```

Open `http://127.0.0.1:8080`.

## Screening model

The checked-in model artifact uses MobileNetV3-Small transfer learning on the public PlantVillage potato classes: healthy, early blight and late blight. See `ml/README.md` for reproducible data preparation and training commands.

```powershell
npm run ml:train
```

This is an online-image screening model, not a field-validated diagnostic system. Predictions show uncertainty, and chemical decisions require confirmation from an agricultural expert. Farmer photos must not be reused for training without consent.

The current checkpoint is connected but intentionally locked to uncertain results: external evaluation on 13,800 regional images reached only 51.19% accuracy. See [PHASE1_EVALUATION.md](PHASE1_EVALUATION.md) for the go/no-go decision, confusion-matrix summary and reproduction command.

The API reports the exact loaded artifact and version at `GET /health`. Override the checked-in artifact with `ALUSATHI_MODEL`, `ALUSATHI_MODEL_METADATA` and `ALUSATHI_MODEL_VERSION` when a replacement PyTorch checkpoint is available.

The PWA precaches a browser-ready ONNX copy of the same checkpoint. Regenerate it after replacing the PyTorch model:

```powershell
.venv\Scripts\python.exe ml\export_onnx.py
npm run build
```

Serve `dist` with `npm run preview` to verify installation and offline mode; service workers are disabled during normal Vite development.

## Checks

```powershell
npm run lint
npm run build
node tests/fieldwatch-smoke.cjs
```
