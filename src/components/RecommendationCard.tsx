import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Beaker, 
  Droplets, 
  CheckCircle2, 
  AlertTriangle, 
  ThermometerSun, 
  CloudRain, 
  Wind,
  Sprout,
  Sparkles,
  Loader2
} from "lucide-react";
import { PredictionResponse } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface RecommendationCardProps {
  recommendation: PredictionResponse;
  cropType: string;
  location?: string;
  soilPh?: number;
}

const RecommendationCard = ({ recommendation, cropType, location: propLocation, soilPh }: RecommendationCardProps) => {
  const { t, language } = useLanguage();
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  
  const { 
    fertilizer_level, 
    irrigation_needed, 
    npk_values, 
    weather_data,
    location: apiLocation
  } = recommendation;

  const displayLocation = propLocation || apiLocation || "Unknown";

  // Fetch AI advice when recommendation changes
  useEffect(() => {
    const fetchAiAdvice = async () => {
      if (!weather_data) return;
      
      setIsLoadingAdvice(true);
      setAiAdvice(null);
      
      try {
        const varietyParts = cropType.split("_");
        const crop = varietyParts[0];
        const variety = varietyParts.slice(1).join(" ");
        
        const { data, error } = await supabase.functions.invoke("generate-advice", {
          body: {
            cropType: crop,
            variety: variety,
            soilPh: soilPh || 6.5,
            location: displayLocation,
            weather: weather_data,
            fertilizerLevel: fertilizer_level,
            irrigationNeeded: irrigation_needed,
            language: language
          }
        });

        if (error) {
          console.error("Error fetching AI advice:", error);
          setAiAdvice(null);
        } else if (data?.advice) {
          setAiAdvice(data.advice);
        }
      } catch (error) {
        console.error("Failed to get AI advice:", error);
      } finally {
        setIsLoadingAdvice(false);
      }
    };

    fetchAiAdvice();
  }, [cropType, displayLocation, soilPh, weather_data, fertilizer_level, irrigation_needed, language]);

  const getFertilizerStyle = () => {
    switch (fertilizer_level) {
      case "Low":
        return "bg-leaf text-primary-foreground";
      case "Medium":
        return "bg-harvest text-foreground";
      case "High":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted";
    }
  };

  const getFertilizerLabel = () => {
    switch (fertilizer_level) {
      case "Low": return t("result.low");
      case "Medium": return t("result.medium");
      case "High": return t("result.high");
      default: return "";
    }
  };

  const cropEmojis: Record<string, string> = {
    rice: "🌾",
    wheat: "🌾",
    maize: "🌽",
    jute: "🌿",
    potato: "🥔",
    banana: "🍌",
  };

  const cropCategory = cropType.split("_")[0];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-up">
      
      {/* Success Message */}
      <div className="text-center py-4 bg-leaf/10 rounded-xl border-2 border-leaf/30">
        <p className="text-2xl font-bold text-leaf">
          ✓ {t("result.ready")}
        </p>
      </div>

      {/* Weather Card */}
      <Card className="border-4 border-water/30 overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-water/20 to-water/5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CloudRain className="w-6 h-6 text-water" />
            📍 {displayLocation} - {t("result.weather")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-harvest/10 rounded-xl">
              <ThermometerSun className="w-10 h-10 mx-auto text-harvest mb-2" />
              <p className="text-3xl font-black text-harvest">{weather_data?.temperature ?? 0}°C</p>
              <p className="text-sm text-muted-foreground">{t("result.temperature")}</p>
            </div>
            <div className="p-4 bg-water/10 rounded-xl">
              <CloudRain className="w-10 h-10 mx-auto text-water mb-2" />
              <p className="text-3xl font-black text-water">{weather_data?.rainfall ?? 0} mm</p>
              <p className="text-sm text-muted-foreground">{t("result.rainfall")}</p>
            </div>
            <div className="p-4 bg-leaf/10 rounded-xl">
              <Wind className="w-10 h-10 mx-auto text-leaf mb-2" />
              <p className="text-3xl font-black text-leaf">{weather_data?.humidity ?? 0}%</p>
              <p className="text-sm text-muted-foreground">{t("result.humidity")}</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-xl">
              <Droplets className="w-10 h-10 mx-auto text-primary mb-2" />
              <p className="text-3xl font-black text-primary">{weather_data?.soil_moisture ?? 0}%</p>
              <p className="text-sm text-muted-foreground">{t("result.soilMoisture")}</p>
            </div>
          </div>
          {weather_data?.weather && (
            <p className="text-center mt-4 text-lg italic text-muted-foreground">
              ☁️ {weather_data.weather}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Main Recommendations */}
      <div className="grid md:grid-cols-2 gap-4">
        
        {/* Fertilizer Card */}
        <Card className="border-2 border-leaf/30 overflow-hidden">
          <CardHeader className="py-3 bg-gradient-to-r from-leaf/20 to-leaf/5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Beaker className="w-5 h-5 text-leaf" />
              🧪 {t("result.fertilizer")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            {/* Compact status indicator */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${
                fertilizer_level === "Low" ? "bg-leaf/20 border-2 border-leaf" :
                fertilizer_level === "Medium" ? "bg-harvest/20 border-2 border-harvest" :
                "bg-destructive/20 border-2 border-destructive"
              }`}>
                <Beaker className={`w-8 h-8 ${
                  fertilizer_level === "Low" ? "text-leaf" :
                  fertilizer_level === "Medium" ? "text-harvest" :
                  "text-destructive"
                }`} />
              </div>
              <div>
                <Badge className={`${getFertilizerStyle()} shadow-lg text-base px-4 py-1.5`}>
                  {fertilizer_level === "Low" ? "🟢" : fertilizer_level === "Medium" ? "🟡" : "🔴"} {getFertilizerLabel()}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {fertilizer_level === "Low" && t("result.fertilizerMinimal")}
                  {fertilizer_level === "Medium" && t("result.fertilizerModerate")}
                  {fertilizer_level === "High" && t("result.fertilizerNeeded")}
                </p>
              </div>
            </div>

            {/* NPK with recommended amounts */}
            {npk_values && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="font-semibold text-sm text-center mb-2">{t("result.npk")} - {language === "bn" ? "প্রতি একরে প্রয়োগ করুন" : "Apply per acre"}</p>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="p-2 bg-leaf/20 rounded">
                    <p className="font-bold text-leaf">N</p>
                    <p className="text-xs text-muted-foreground">Nitrogen</p>
                    <p className="font-semibold text-lg">{npk_values.nitrogen}</p>
                    <p className="text-xs text-leaf font-medium">
                      {fertilizer_level === "High" ? "25-30" : fertilizer_level === "Medium" ? "15-20" : "5-10"} kg
                    </p>
                  </div>
                  <div className="p-2 bg-harvest/20 rounded">
                    <p className="font-bold text-harvest">P</p>
                    <p className="text-xs text-muted-foreground">Phosphorus</p>
                    <p className="font-semibold text-lg">{npk_values.phosphorus}</p>
                    <p className="text-xs text-harvest font-medium">
                      {fertilizer_level === "High" ? "15-20" : fertilizer_level === "Medium" ? "10-15" : "5-8"} kg
                    </p>
                  </div>
                  <div className="p-2 bg-water/20 rounded">
                    <p className="font-bold text-water">K</p>
                    <p className="text-xs text-muted-foreground">Potassium</p>
                    <p className="font-semibold text-lg">{npk_values.potassium}</p>
                    <p className="text-xs text-water font-medium">
                      {fertilizer_level === "High" ? "20-25" : fertilizer_level === "Medium" ? "12-18" : "6-10"} kg
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Irrigation Card */}
        <Card className="border-2 border-water/30 overflow-hidden">
          <CardHeader className="py-3 bg-gradient-to-r from-water/20 to-water/5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Droplets className="w-5 h-5 text-water" />
              💧 {t("result.irrigation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            {/* Compact status indicator */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${
                irrigation_needed ? "bg-water/20 border-2 border-water" : "bg-leaf/20 border-2 border-leaf"
              }`}>
                {irrigation_needed ? (
                  <AlertTriangle className="w-8 h-8 text-water" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-leaf" />
                )}
              </div>
              <div>
                <Badge className={`${
                  irrigation_needed 
                    ? "bg-water text-primary-foreground" 
                    : "bg-leaf text-primary-foreground"
                } shadow-lg text-base px-4 py-1.5`}>
                  {irrigation_needed ? "🔵 " + t("result.waterNeeded") : "🟢 " + t("result.noWater")}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {irrigation_needed ? t("result.waterYour") : t("result.enoughMoisture")}
                </p>
              </div>
            </div>

            {/* Water info section */}
            <div className="bg-muted/30 p-3 rounded-lg">
              <p className="font-semibold text-sm text-center mb-2">
                {language === "bn" ? "পানির অবস্থা" : "Water Status"}
              </p>
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((drop) => (
                  <Droplets
                    key={drop}
                    className={`w-6 h-6 transition-all duration-300 ${
                      irrigation_needed
                        ? drop <= 2
                          ? "text-water/40"
                          : "text-muted/20"
                        : "text-water animate-pulse"
                    }`}
                    style={{ animationDelay: `${drop * 0.1}s` }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {irrigation_needed 
                  ? (language === "bn" ? "আজ সেচ দিন" : "Irrigate today")
                  : (language === "bn" ? "২-৩ দিন পর চেক করুন" : "Check again in 2-3 days")
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="border-4 border-primary/20 overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-primary" />
            <Sprout className="w-5 h-5 text-leaf" />
            {t("result.advice")} {cropEmojis[cropCategory] || ""} {t(`crop.${cropCategory}`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="p-4 bg-muted/30 rounded-xl min-h-[100px]">
            {isLoadingAdvice ? (
              <div className="flex items-center justify-center gap-3 py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-muted-foreground">{t("result.generatingAdvice")}</p>
              </div>
            ) : aiAdvice ? (
              <p className="text-lg leading-relaxed whitespace-pre-line">
                {aiAdvice}
              </p>
            ) : (
              <p className="text-lg leading-relaxed text-muted-foreground italic">
                {t("result.defaultAdvice")}
              </p>
            )}
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>🌱 {t("result.goodHarvest")} 🌾</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationCard;
