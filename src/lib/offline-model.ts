import * as ort from "onnxruntime-web/wasm";
import type { DiseaseLabel, DiseaseResult } from "@/lib/disease-api";

const MODEL_URL = "/models/potato_mobilenet_v3.onnx";
const CLASSES: DiseaseLabel[] = ["early_blight", "healthy", "late_blight"];
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];
let sessionPromise: Promise<ort.InferenceSession> | null = null;

const UNKNOWN_STEPS = {
  en: [
    "Retake clear daylight photographs if any image is blurred or dark.",
    "Check the same plants again within 24 to 48 hours.",
    "Do not use a chemical from this result; call 16123 or ask an agricultural officer.",
  ],
  bn: [
    "ছবি ঝাপসা বা অন্ধকার হলে দিনের আলোতে আবার তুলুন।",
    "২৪ থেকে ৪৮ ঘণ্টার মধ্যে একই গাছগুলো আবার দেখুন।",
    "এই ফল দেখে ওষুধ দেবেন না; ১৬১২৩-এ কল করুন বা কৃষি কর্মকর্তাকে জিজ্ঞেস করুন।",
  ],
};

function getSession() {
  if (!sessionPromise) {
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.wasmPaths = "/";
    sessionPromise = ort.InferenceSession.create(MODEL_URL, { executionProviders: ["wasm"] }).catch(error => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
}

function softmax(values: readonly number[]) {
  const peak = Math.max(...values);
  const exponentials = values.map((value) => Math.exp(value - peak));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

async function imageTensor(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = 256 / Math.min(bitmap.width, bitmap.height);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Image processing is unavailable.");
  context.drawImage(bitmap, (224 - width) / 2, (224 - height) / 2, width, height);
  bitmap.close();
  const pixels = context.getImageData(0, 0, 224, 224).data;
  const tensor = new Float32Array(3 * 224 * 224);
  let brightnessSum = 0;
  let brightnessSquared = 0;
  for (let pixel = 0; pixel < 224 * 224; pixel += 1) {
    const offset = pixel * 4;
    const red = pixels[offset];
    const green = pixels[offset + 1];
    const blue = pixels[offset + 2];
    const brightness = 0.299 * red + 0.587 * green + 0.114 * blue;
    brightnessSum += brightness;
    brightnessSquared += brightness * brightness;
    tensor[pixel] = (red / 255 - MEAN[0]) / STD[0];
    tensor[224 * 224 + pixel] = (green / 255 - MEAN[1]) / STD[1];
    tensor[2 * 224 * 224 + pixel] = (blue / 255 - MEAN[2]) / STD[2];
  }
  const brightness = brightnessSum / (224 * 224);
  const contrast = Math.sqrt(Math.max(0, brightnessSquared / (224 * 224) - brightness * brightness));
  return { tensor, brightness, contrast };
}

export async function scanPotatoLeafOffline(file: File): Promise<DiseaseResult> {
  const [{ tensor, brightness, contrast }, session] = await Promise.all([imageTensor(file), getSession()]);
  const output = await session.run({ image: new ort.Tensor("float32", tensor, [1, 3, 224, 224]) });
  const logits = Array.from(output.logits.data as Float32Array);
  const probabilities = softmax(logits);
  const sorted = probabilities.map((value, index) => ({ value, index })).sort((a, b) => b.value - a.value);
  const issues: string[] = [];
  if (contrast < 18) issues.push("low_contrast");
  if (brightness < 35) issues.push("too_dark");
  else if (brightness > 225) issues.push("too_bright");
  const rejectionReasons = [...issues];
  if (sorted[0].value < 0.72) rejectionReasons.push("low_confidence");
  if (sorted[0].value - sorted[1].value < 0.18) rejectionReasons.push("close_competing_predictions");
  rejectionReasons.push("field_validation_pending");

  return {
    label: "unknown",
    labels: { en: "Uncertain result", bn: "অনিশ্চিত ফলাফল" },
    confidence: sorted[0].value,
    quality_warning: issues.length > 0,
    quality: { brightness, contrast, issues },
    rejection_reasons: rejectionReasons,
    field_validated: false,
    needs_expert_review: true,
    probabilities: Object.fromEntries(CLASSES.map((label, index) => [label, probabilities[index]])),
    next_steps: UNKNOWN_STEPS,
    model_scope: "Offline PlantVillage-trained research model; not validated for Bangladesh field diagnosis.",
    treatment_status: "Screening guidance only - confirm chemical decisions with an agricultural expert.",
    inference_mode: "offline",
  };
}
