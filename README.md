# AluSathi

Mobile-first, bilingual potato intelligence demo for Bangladesh. The current MVP connects crop-image screening, yield scenarios, climate readiness and buyer matching in one field view.

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

## Demo model

The checked-in model artifact uses MobileNetV3-Small transfer learning on the public PlantVillage potato classes: healthy, early blight and late blight. See `ml/README.md` for reproducible data preparation and training commands.

```powershell
npm run ml:train
```

This is an online-image demo, not a field-validated diagnostic system. Predictions show uncertainty, and chemical decisions require field-officer review. Farmer photos must not be reused for training without consent.

## Checks

```powershell
npm run lint
npm run build
```
