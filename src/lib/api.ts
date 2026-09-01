const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

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
  alerts?: WeatherAlert[];
  observed_at?: string;
  cached?: boolean;
}

export type WeatherAlertType = "heavy_rain" | "strong_wind" | "extreme_heat" | "cold" | "thunderstorm";

export interface WeatherAlert {
  type: WeatherAlertType;
  date: string;
  value: number;
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
  const weather = await getWeather(data.location);
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      crop_type: data.crop_type.split("_")[0],
      soil_ph: data.soil_ph,
      soil_moisture: weather.soil_moisture,
      temperature: weather.temperature,
      rainfall: weather.rainfall,
    }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return { ...(await response.json()), location: data.location, weather_data: weather };
}

export async function getWeather(location: string): Promise<WeatherData> {
  const cacheKey = `alusathi-weather-${location.toLowerCase()}`;
  const cached = localStorage.getItem(cacheKey);
  try {
    const signal = AbortSignal.timeout(8_000);
    const geocoding = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json&countryCode=BD`, { signal });
    const place = (await geocoding.json()).results?.[0];
    if (!geocoding.ok || !place) throw new Error("Location not found");

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_gusts_10m_max,weather_code&forecast_days=3&timezone=Asia%2FDhaka`, { signal });
    if (!response.ok) throw new Error(`Weather API Error: ${response.status}`);

    const { current, daily } = await response.json();
    if (!current || !daily || !Array.isArray(daily.time) || !Number.isFinite(current.temperature_2m) || !Number.isFinite(current.relative_humidity_2m)) {
      throw new Error("Weather data is incomplete");
    }
    const rainfall = current.precipitation ?? 0;
    const alerts: WeatherAlert[] = [];
    daily.time.forEach((date: string, index: number) => {
      const maximum = daily.temperature_2m_max[index] ?? 0;
      const minimum = daily.temperature_2m_min[index] ?? 0;
      const rain = daily.precipitation_sum[index] ?? 0;
      const gust = daily.wind_gusts_10m_max[index] ?? 0;
      const code = daily.weather_code[index] ?? 0;
      if (code >= 95) alerts.push({ type: "thunderstorm", date, value: code });
      if (rain >= 50) alerts.push({ type: "heavy_rain", date, value: rain });
      if (gust >= 50) alerts.push({ type: "strong_wind", date, value: gust });
      if (maximum >= 35) alerts.push({ type: "extreme_heat", date, value: maximum });
      if (minimum <= 8) alerts.push({ type: "cold", date, value: minimum });
    });
    const weather: WeatherData = {
      temperature: current.temperature_2m,
      rainfall,
      humidity: current.relative_humidity_2m,
      weather: current.weather_code < 3 ? "Clear" : current.weather_code < 50 ? "Cloudy" : current.weather_code < 70 ? "Rain" : "Storms",
      soil_moisture: Math.min(95, Math.max(10, current.relative_humidity_2m * 0.6 + rainfall * 5)),
      alerts,
      observed_at: new Date().toISOString(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(weather));
    return weather;
  } catch (error) {
    if (cached) {
      try {
        const saved = JSON.parse(cached) as WeatherData;
        if (Number.isFinite(saved.temperature) && Number.isFinite(saved.humidity) && Array.isArray(saved.alerts)) return { ...saved, cached: true };
      } catch { /* Ignore damaged local cache. */ }
    }
    throw error;
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
