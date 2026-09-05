import * as ort from "onnxruntime-web/wasm";

const MODEL_URL = "/models/alusathi_tuber_binary.onnx";
const DECISION_THRESHOLD = 0.41;
const UNCERTAINTY_BAND = 0.1;
let sessionPromise: Promise<ort.InferenceSession> | null = null;

export type TuberModelResult = {
  label: "healthy" | "defective" | "uncertain";
  defectScore: number;
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

async function imageTensor(file: File) {
  const bitmap = await createImageBitmap(file);
  if (Math.min(bitmap.width, bitmap.height) < 128 || Math.max(bitmap.width, bitmap.height) > 8000) {
    bitmap.close();
    throw new Error("Use an image between 128 and 8,000 pixels.");
  }
  const canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    bitmap.close();
    throw new Error("Image processing is unavailable.");
  }
  context.drawImage(bitmap, 0, 0, 224, 224);
  bitmap.close();
  const pixels = context.getImageData(0, 0, 224, 224).data;
  const rgb = new Float32Array(224 * 224 * 3);
  for (let pixel = 0; pixel < 224 * 224; pixel += 1) {
    const source = pixel * 4;
    const target = pixel * 3;
    rgb[target] = pixels[source];
    rgb[target + 1] = pixels[source + 1];
    rgb[target + 2] = pixels[source + 2];
  }
  return new ort.Tensor("float32", rgb, [1, 224, 224, 3]);
}

export async function scanPotatoTuberOffline(file: File): Promise<TuberModelResult> {
  const [session, tensor] = await Promise.all([getSession(), imageTensor(file)]);
  const output = await session.run({ [session.inputNames[0]]: tensor });
  const defectScore = Number(output[session.outputNames[0]].data[0]);
  if (!Number.isFinite(defectScore) || defectScore < 0 || defectScore > 1) {
    throw new Error("The model returned an invalid score.");
  }
  const label = Math.abs(defectScore - DECISION_THRESHOLD) < UNCERTAINTY_BAND
    ? "uncertain"
    : defectScore >= DECISION_THRESHOLD ? "defective" : "healthy";
  return { label, defectScore };
}
