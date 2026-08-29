# AluSathi

Bangla-first, mobile-friendly potato leaf screening for Bangladesh farmers. FieldWatch supports one-leaf checks, a guided five-location field check, weather context, voice guidance and a private on-device field diary.

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

The API reports the exact loaded artifact and version at `GET /health`. Override the checked-in artifact with `ALUSATHI_MODEL`, `ALUSATHI_MODEL_METADATA` and `ALUSATHI_MODEL_VERSION` when a replacement PyTorch checkpoint is available.

## Checks

```powershell
npm run lint
npm run build
node tests/fieldwatch-smoke.cjs
```
