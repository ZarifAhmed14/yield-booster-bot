import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Beaker, 
  Droplets, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ThermometerSun, 
  CloudRain, 
  Wind,
  Sprout
} from "lucide-react";
import { PredictionResponse } from "@/lib/api";

interface RecommendationCardProps {
  recommendation: PredictionResponse;
  cropType: string;
}

const cropLabels: Record<string, string> = {
  rice: "🌾 Rice (ধান)",
  wheat: "🌾 Wheat (গম)",
  maize: "🌽 Maize (ভুট্টা)",
  jute: "🌿 Jute (পাট)",
  potato: "🥔 Potato (আলু)",
};

const RecommendationCard = ({ recommendation, cropType }: RecommendationCardProps) => {
  const { 
    fertilizer_level, 
    irrigation_needed, 
    recommendations, 
    npk_values, 
    weather,
    location,
    farmer_name 
  } = recommendation;

  // Fertilizer badge styles - BIG and CLEAR
  const getFertilizerStyle = () => {
    switch (fertilizer_level) {
      case "Low":
        return "bg-leaf text-primary-foreground text-2xl px-6 py-3";
      case "Medium":
        return "bg-harvest text-foreground text-2xl px-6 py-3";
      case "High":
        return "bg-destructive text-destructive-foreground text-2xl px-6 py-3";
      default:
        return "bg-muted text-2xl px-6 py-3";
    }
  };

  const getFertilizerBengali = () => {
    switch (fertilizer_level) {
      case "Low": return "কম";
      case "Medium": return "মাঝারি";
      case "High": return "বেশি";
      default: return "";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-up">
      
      {/* Greeting if farmer name provided */}
      {farmer_name && (
        <div className="text-center py-4 bg-leaf/10 rounded-xl border-2 border-leaf/30">
          <p className="text-2xl font-bold text-leaf">
            🙏 {farmer_name}, আপনার পরামর্শ তৈরি!
          </p>
          <p className="text-muted-foreground">Your personalized recommendations are ready!</p>
        </div>
      )}

      {/* Weather Card - Shows current weather */}
      <Card className="border-4 border-water/30 overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-water/20 to-water/5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CloudRain className="w-6 h-6 text-water" />
            📍 {location} এর আবহাওয়া
            <span className="text-sm font-normal text-muted-foreground">(Weather)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-harvest/10 rounded-xl">
              <ThermometerSun className="w-10 h-10 mx-auto text-harvest mb-2" />
              <p className="text-3xl font-black text-harvest">{weather?.temperature || 28}°C</p>
              <p className="text-sm text-muted-foreground">তাপমাত্রা</p>
            </div>
            <div className="p-4 bg-water/10 rounded-xl">
              <CloudRain className="w-10 h-10 mx-auto text-water mb-2" />
              <p className="text-3xl font-black text-water">{weather?.rainfall || 0} mm</p>
              <p className="text-sm text-muted-foreground">বৃষ্টিপাত</p>
            </div>
            <div className="p-4 bg-leaf/10 rounded-xl">
              <Wind className="w-10 h-10 mx-auto text-leaf mb-2" />
              <p className="text-3xl font-black text-leaf">{weather?.humidity || 70}%</p>
              <p className="text-sm text-muted-foreground">আর্দ্রতা</p>
            </div>
          </div>
          {weather?.description && (
            <p className="text-center mt-4 text-lg italic text-muted-foreground">
              ☁️ {weather.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Main Recommendations - Side by side on desktop */}
      <div className="grid md:grid-cols-2 gap-4">
        
        {/* Fertilizer Card - BIG AND CLEAR */}
        <Card className="border-4 border-leaf/30 overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-to-r from-leaf/20 to-leaf/5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Beaker className="w-6 h-6 text-leaf" />
              🧪 সার (Fertilizer)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            {/* Main Badge */}
            <Badge className={`${getFertilizerStyle()} shadow-lg`}>
              {fertilizer_level === "Low" && "🟢"}
              {fertilizer_level === "Medium" && "🟡"}
              {fertilizer_level === "High" && "🔴"}
              {" "}{getFertilizerBengali()} ({fertilizer_level})
            </Badge>
            
            {/* Visual bar indicator */}
            <div className="flex gap-2 my-6 justify-center">
              {[1, 2, 3].map((bar) => (
                <div
                  key={bar}
                  className={`h-12 w-16 rounded-lg transition-all duration-500 ${
                    bar <= (fertilizer_level === "Low" ? 1 : fertilizer_level === "Medium" ? 2 : 3)
                      ? fertilizer_level === "Low"
                        ? "bg-leaf animate-grow"
                        : fertilizer_level === "Medium"
                        ? "bg-harvest animate-grow"
                        : "bg-destructive animate-grow"
                      : "bg-muted"
                  }`}
                  style={{ animationDelay: `${bar * 0.15}s` }}
                />
              ))}
            </div>

            {/* NPK Values - Simple display */}
            {npk_values && (
              <div className="space-y-2 text-left bg-muted/30 p-4 rounded-lg">
                <p className="font-semibold text-center mb-3">NPK পরিমাণ:</p>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="p-2 bg-leaf/20 rounded">
                    <p className="font-bold">N</p>
                    <p>{npk_values.nitrogen}</p>
                  </div>
                  <div className="p-2 bg-harvest/20 rounded">
                    <p className="font-bold">P</p>
                    <p>{npk_values.phosphorus}</p>
                  </div>
                  <div className="p-2 bg-water/20 rounded">
                    <p className="font-bold">K</p>
                    <p>{npk_values.potassium}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Irrigation Card - VERY CLEAR YES/NO */}
        <Card className="border-4 border-water/30 overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-to-r from-water/20 to-water/5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Droplets className="w-6 h-6 text-water" />
              💧 সেচ (Irrigation)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            {irrigation_needed ? (
              <>
                {/* NEEDS WATER - Big alert */}
                <div className="p-6 bg-water/20 rounded-2xl border-4 border-water mb-4">
                  <AlertTriangle className="w-16 h-16 mx-auto text-water mb-3" />
                  <Badge className="bg-water text-primary-foreground text-2xl px-6 py-3">
                    🔵 সেচ দিন!
                  </Badge>
                  <p className="text-xl font-bold text-water mt-3">
                    WATER NEEDED
                  </p>
                </div>
                <p className="text-lg text-muted-foreground">
                  💧 আপনার ফসলে পানি দিন
                </p>
              </>
            ) : (
              <>
                {/* NO WATER NEEDED - All good */}
                <div className="p-6 bg-leaf/20 rounded-2xl border-4 border-leaf mb-4">
                  <CheckCircle2 className="w-16 h-16 mx-auto text-leaf mb-3" />
                  <Badge className="bg-leaf text-primary-foreground text-2xl px-6 py-3">
                    🟢 সেচ লাগবে না
                  </Badge>
                  <p className="text-xl font-bold text-leaf mt-3">
                    NO WATER NEEDED
                  </p>
                </div>
                <p className="text-lg text-muted-foreground">
                  ✓ মাটিতে যথেষ্ট আর্দ্রতা আছে
                </p>
              </>
            )}

            {/* Water droplet visualization */}
            <div className="flex justify-center gap-2 pt-4">
              {[1, 2, 3, 4, 5].map((drop) => (
                <Droplets
                  key={drop}
                  className={`w-8 h-8 transition-all duration-300 ${
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
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations - Easy to read */}
      <Card className="border-4 border-primary/20">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Info className="w-6 h-6 text-primary" />
            <Sprout className="w-5 h-5 text-leaf" />
            {cropLabels[cropType] || cropType} এর জন্য পরামর্শ
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="p-4 bg-muted/30 rounded-xl">
            <p className="text-lg leading-relaxed whitespace-pre-line">
              {recommendations || "আপনার ফসলের জন্য সার ও সেচের পরামর্শ উপরে দেখুন।"}
            </p>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>🌱 ভালো ফসল হোক! Good harvest! 🌾</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationCard;
