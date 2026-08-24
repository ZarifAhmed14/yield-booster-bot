export type DiseaseLabel = "early_blight" | "healthy" | "late_blight" | "unknown";

export interface DiseaseResult {
  label: DiseaseLabel;
  labels: { en: string; bn: string };
  confidence: number;
  quality_warning: boolean;
  needs_expert_review: boolean;
  probabilities: Record<string, number>;
  next_steps: { en: string[]; bn: string[] };
  model_scope: string;
  treatment_status: string;
}

export async function scanPotatoLeaf(file: File): Promise<DiseaseResult> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/disease/predict", { method: "POST", body });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || "The scan could not be completed.");
  return payload;
}
