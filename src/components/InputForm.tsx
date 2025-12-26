import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sprout, MapPin, Beaker, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export interface FormData {
  cropType: string;
  soilPH: number;
  location: string;
}

const InputForm = ({ onSubmit, isLoading }: InputFormProps) => {
  const { t } = useLanguage();
  const [cropType, setCropType] = useState("");
  const [soilPH, setSoilPH] = useState([6.5]);
  const [location, setLocation] = useState("Dhaka");

  const crops = [
    { value: "rice", emoji: "🌾" },
    { value: "wheat", emoji: "🌾" },
    { value: "maize", emoji: "🌽" },
    { value: "jute", emoji: "🌿" },
    { value: "potato", emoji: "🥔" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropType) return;
    
    onSubmit({
      cropType,
      soilPH: soilPH[0],
      location: location || "Dhaka",
    });
  };

  const getPHColor = () => {
    const ph = soilPH[0];
    if (ph < 5.5) return "text-destructive";
    if (ph > 7.5) return "text-water";
    return "text-leaf";
  };

  const getPHLabel = () => {
    const ph = soilPH[0];
    if (ph < 5.5) return `${t("form.phAcidic")} ⚠️`;
    if (ph > 7.5) return `${t("form.phAlkaline")} ⚠️`;
    if (ph >= 6.0 && ph <= 7.0) return `${t("form.phGood")} ✓`;
    return "OK";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-4 border-leaf/30 shadow-card">
      <CardHeader className="text-center pb-4 bg-gradient-to-b from-leaf/10 to-transparent">
        <CardTitle className="flex items-center justify-center gap-3 text-2xl md:text-3xl">
          <Sprout className="w-8 h-8 text-leaf" />
          {t("form.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Step 1: Crop Selection */}
          <div className="space-y-3 p-4 bg-leaf/5 rounded-xl border-2 border-leaf/20">
            <Label htmlFor="crop" className="flex items-center gap-2 text-xl font-bold text-leaf">
              <span className="text-3xl">1️⃣</span>
              <Sprout className="w-6 h-6" />
              {t("form.step1")}
            </Label>
            <Select value={cropType} onValueChange={setCropType}>
              <SelectTrigger className="h-16 text-xl font-semibold border-2 border-leaf/30">
                <SelectValue placeholder={`👆 ${t("form.selectCrop")}`} />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {crops.map((crop) => (
                  <SelectItem 
                    key={crop.value} 
                    value={crop.value} 
                    className="text-xl py-4 cursor-pointer hover:bg-leaf/10"
                  >
                    {crop.emoji} {t(`crop.${crop.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Soil pH */}
          <div className="space-y-4 p-4 bg-earth/5 rounded-xl border-2 border-earth/20">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-xl font-bold text-earth">
                <span className="text-3xl">2️⃣</span>
                <Beaker className="w-6 h-6" />
                {t("form.step2")}
              </Label>
              <div className="text-center">
                <span className={`text-4xl font-black ${getPHColor()}`}>
                  {soilPH[0].toFixed(1)}
                </span>
                <p className={`text-sm font-medium ${getPHColor()}`}>
                  {getPHLabel()}
                </p>
              </div>
            </div>
            <Slider
              value={soilPH}
              onValueChange={setSoilPH}
              min={4}
              max={9}
              step={0.1}
              className="py-4"
            />
            <div className="flex justify-between text-sm font-medium text-muted-foreground">
              <span>🟡 4.0 ({t("form.phAcidic")})</span>
              <span>🟢 6-7 ({t("form.phGood")})</span>
              <span>🔵 9.0 ({t("form.phAlkaline")})</span>
            </div>
            <p className="text-center text-sm text-muted-foreground italic">
              💡 {t("form.phTip")}
            </p>
          </div>

          {/* Step 3: Location */}
          <div className="space-y-3 p-4 bg-water/5 rounded-xl border-2 border-water/20">
            <Label className="flex items-center gap-2 text-xl font-bold text-water">
              <span className="text-3xl">3️⃣</span>
              <MapPin className="w-6 h-6" />
              {t("form.step3")}
            </Label>
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Dhaka, Rangpur, Khulna..."
              className="h-14 text-xl border-2 border-water/30"
            />
            <p className="text-sm text-muted-foreground">
              📍 {t("form.locationHint")}
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            variant="hero" 
            size="xl" 
            className="w-full h-20 text-2xl font-bold shadow-lg hover:shadow-xl transition-all"
            disabled={!cropType || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin" />
                {t("form.analyzing")}
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Sprout className="w-8 h-8" />
                {t("form.submit")} 🌱
              </span>
            )}
          </Button>

          {!cropType && (
            <p className="text-center text-destructive font-medium animate-pulse">
              ⚠️ {t("form.selectFirst")}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default InputForm;
