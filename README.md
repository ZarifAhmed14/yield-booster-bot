# AluSathi

Bangla-first, mobile-friendly potato screening for Bangladesh farmers. Includes guided three-photo checks, offline leaf screening, weather messages, optional private accounts, a disease-progress timeline, farmer tools and treatment reminders.

Competition evidence, demo instructions and honest completion status are indexed in [`competition/README.md`](competition/README.md).

## Run locally

```powershell
npm install
Copy-Item .env.example .env
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

## Login and notifications

Login uses the existing Python API as a same-origin authentication gateway. Refresh credentials are held in HttpOnly, SameSite=Strict cookies (Secure on HTTPS); short-lived access tokens stay in memory. Guest photo screening does not require an account. Route `/api` to the Python API in production, set `ALUSATHI_ORIGINS` to the exact HTTPS website origin, and supply `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` through the server environment. Never supply a database password or service-role key to the browser.

Supabase project: `wztcmrrraglfzuszxgtf`. Before public signup, configure custom SMTP and allow your website's `/auth` URL in Authentication > URL Configuration. Local demo redirects include `http://127.0.0.1:4173/auth` and `http://127.0.0.1:8080/auth`. Keep email verification enabled. Enable leaked-password protection if your Supabase plan supports it.

Background push uses `push_subscriptions`, `treatment_reminders`, the `send-reminders` Edge Function, and a one-minute database Cron job. Worker secrets are in Supabase Vault, not Git. RLS limits records to their owner; clients cannot change delivery status. The worker restricts outbound push hosts and disables redirects. It retries unsuccessful delivery at five-minute intervals, up to twelve attempts; jobs older than 24 hours are not pushed. Delivery is best-effort, not an alarm guarantee. Only a generic notification appears on the lock screen. Important tasks can also be exported to the phone calendar.

Enable notifications in the app on each device. On iPhone/iPad, install the PWA to the Home Screen first. HTTPS (or localhost), browser permission, a running service worker, and internet connectivity are required. Automated Chromium cannot register with its push service in this environment; a real-phone delivery check remains required. Live account, RLS, reminder CRUD, calendar-export and scheduler tests are covered separately.

Deployment schema is in `supabase/farmer_records.sql` and `supabase/push_reminders.sql`; schedule in `supabase/reminder_schedule.sql`. Do not rotate VAPID keys without resubscribing devices.

## Tuber dataset

[Drive collection](https://drive.google.com/drive/folders/1pIdjXxZFCizntza6GSHbC4ozGY_4YUFE): 12,007 curated images in nine labelled folders, packaged as class ZIPs. Target was 13,800; the clean collection is 1,793 short. No padding was added. The folder includes source attribution, per-image manifest, package checksums, counts and a preview sheet. Photos are separate from the leaf model; no tuber model was trained or substituted by this update.

Counts: healthy 4,872; defective-unspecified 6,552; dry rot 222; blackspot bruising 109; soft rot 78; brown rot 14; pink rot 55; black scurf 49; common scab 56. Rare classes are not sufficient for dependable disease-specific training. Labels come from publishers, not an independent pathology review. Sources mix Bangladesh material with other regions, and some source augmentations may be unmarked. Keep new local farm/tuber photos as an independent test set.

Reproduction tools: `ml/download_bd_tubers.ps1`, `ml/curate_tubers.py` and `ml/verify_tuber_package.py`. See the Drive dataset card for the four source URLs and licensing.

## Checks

```powershell
npm run lint
npm run build
node tests/fieldwatch-smoke.cjs
```
