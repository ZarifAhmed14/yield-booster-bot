// API service to connect to the backend at Render

const API_BASE_URL = "https://hackathon-project-ysen.onrender.com";

export interface PredictionRequest {
  crop_type: string;
  soil_ph: number;
  location: string;
}

export interface WeatherData {
  temperature: number;
  rainfall: number;
  humidity: number;
  weather: string;
  soil_moisture?: number;
}

export interface PredictionResponse {
  id?: number;
  crop_type?: string;
  soil_ph?: number;
  location?: string;
  farmer_name?: string;
  weather_data: WeatherData;
  fertilizer_level: "Low" | "Medium" | "High";
  irrigation_needed: boolean;
  recommendations_text: string;
  confidence?: number;
  npk_values?: {
    nitrogen: string;
    phosphorus: string;
    potassium: string;
  };
  farmer_input_id?: number;
  message?: string;
  timestamp?: string;
}

export async function getPrediction(data: PredictionRequest): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict-with-weather`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export async function getWeather(location: string): Promise<WeatherData> {
  const response = await fetch(`${API_BASE_URL}/weather?location=${encodeURIComponent(location)}`);
  
  if (!response.ok) {
    throw new Error(`Weather API Error: ${response.status}`);
  }

  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
