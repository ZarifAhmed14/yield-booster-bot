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

export interface ModelHealth {
  status: "ready" | "model_missing";
  device?: string;
  model?: string;
  model_version?: string;
  classes?: string[];
  demo_only: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export async function scanPotatoLeaf(file: File): Promise<DiseaseResult> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${API_BASE_URL}/disease/predict`, { method: "POST", body });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || "The scan could not be completed.");
  return payload;
}

export async function getModelHealth(): Promise<ModelHealth | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}
