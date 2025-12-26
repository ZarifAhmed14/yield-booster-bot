import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sprout, MapPin, Beaker, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import DistrictSelect from "@/components/DistrictSelect";
import { bangladeshDistricts } from "@/data/districts";

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export interface FormData {
  cropType: string;
  soilPH: number;
  location: string;
}

interface CropVariety {
  value: string;
  category: string;
  emoji: string;
  minPH: number;
  maxPH: number;
}

const cropVarieties: CropVariety[] = [
  // Rice varieties
  { value: "rice_miniket", category: "rice", emoji: "🌾", minPH: 6.0, maxPH: 6.8 },
  { value: "rice_nazirshail", category: "rice", emoji: "🌾", minPH: 5.5, maxPH: 7.0 },
  { value: "rice_paijam", category: "rice", emoji: "🌾", minPH: 5.5, maxPH: 6.5 },
  
  // Wheat varieties
  { value: "wheat_sonalika", category: "wheat", emoji: "🌾", minPH: 6.0, maxPH: 7.5 },
  { value: "wheat_kanchan", category: "wheat", emoji: "🌾", minPH: 6.0, maxPH: 7.5 },
  { value: "wheat_balaka", category: "wheat", emoji: "🌾", minPH: 6.0, maxPH: 7.5 },
  { value: "wheat_ananda", category: "wheat", emoji: "🌾", minPH: 6.0, maxPH: 7.5 },
  { value: "wheat_akbar", category: "wheat", emoji: "🌾", minPH: 6.0, maxPH: 7.5 },
  { value: "wheat_barkat", category: "wheat", emoji: "🌾", minPH: 6.0, maxPH: 7.5 },
  { value: "wheat_aghrani", category: "wheat", emoji: "🌾", minPH: 6.0, maxPH: 7.5 },
  
  // Jute varieties
  { value: "jute_white", category: "jute", emoji: "🌿", minPH: 6.5, maxPH: 7.5 },
  { value: "jute_tossa", category: "jute", emoji: "🌿", minPH: 6.5, maxPH: 7.5 },
  { value: "jute_mesta", category: "jute", emoji: "🌿", minPH: 6.5, maxPH: 7.5 },
  
  // Potato varieties
  { value: "potato_diamant", category: "potato", emoji: "🥔", minPH: 5.5, maxPH: 6.5 },
  { value: "potato_cardinal", category: "potato", emoji: "🥔", minPH: 5.5, maxPH: 6.5 },
  { value: "potato_granola", category: "potato", emoji: "🥔", minPH: 5.5, maxPH: 6.5 },
  
  // Banana varieties
  { value: "banana_sagor", category: "banana", emoji: "🍌", minPH: 6.5, maxPH: 7.5 },
  { value: "banana_shabri", category: "banana", emoji: "🍌", minPH: 6.5, maxPH: 7.5 },
  { value: "banana_champa", category: "banana", emoji: "🍌", minPH: 6.5, maxPH: 7.5 },
];

const categories = [
  { value: "rice", emoji: "🌾" },
  { value: "wheat", emoji: "🌾" },
  { value: "jute", emoji: "🌿" },
  { value: "potato", emoji: "🥔" },
  { value: "banana", emoji: "🍌" },
];

const InputForm = ({ onSubmit, isLoading }: InputFormProps) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedVariety, setSelectedVariety] = useState("");
  const [soilPH, setSoilPH] = useState([6.5]);
  const [selectedDistrict, setSelectedDistrict] = useState("dhaka");

  const varietiesForCategory = useMemo(() => 
    cropVarieties.filter(c => c.category === selectedCategory), 
    [selectedCategory]
  );

  const selectedCrop = useMemo(() => 
    cropVarieties.find(c => c.value === selectedVariety), 
    [selectedVariety]
  );

  const phCompatibility = useMemo(() => {
    if (!selectedCrop) return null;
    const ph = soilPH[0];
    const isCompatible = ph >= selectedCrop.minPH && ph <= selectedCrop.maxPH;
    return {
      isCompatible,
      optimalRange: `${selectedCrop.minPH} - ${selectedCrop.maxPH}`,
    };
  }, [selectedCrop, soilPH]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedVariety(""); // Reset variety when category changes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariety) return;
    
    // Get the English name of the district for the API
    const district = bangladeshDistricts.find(d => d.value === selectedDistrict);
    const locationName = district ? district.en : "Dhaka";
    
    onSubmit({
      cropType: selectedVariety,
      soilPH: soilPH[0],
      location: locationName,
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
          <div className="space-y-4 p-4 bg-leaf/5 rounded-xl border-2 border-leaf/20">
            <Label htmlFor="crop" className="flex items-center gap-2 text-xl font-bold text-leaf">
              <span className="text-3xl">1️⃣</span>
              <Sprout className="w-6 h-6" />
              {t("form.step1")}
            </Label>
            
            {/* Category Selection */}
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="h-16 text-xl font-semibold border-2 border-leaf/30">
                <SelectValue placeholder={`👉 ${t("form.selectCrop")}`} />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {categories.map((cat) => (
                  <SelectItem 
                    key={cat.value} 
                    value={cat.value} 
                    className="text-xl py-4 cursor-pointer hover:bg-leaf/10"
                  >
                    {cat.emoji} {t(`crop.${cat.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Variety Selection - Only shows after category is selected */}
            {selectedCategory && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-sm font-medium text-muted-foreground">
                  {t("form.selectVariety")}
                </Label>
                <Select value={selectedVariety} onValueChange={setSelectedVariety}>
                  <SelectTrigger className="h-14 text-lg font-semibold border-2 border-leaf/20">
                    <SelectValue placeholder={`👉 ${t("form.chooseVariety")}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {varietiesForCategory.map((variety) => (
                      <SelectItem 
                        key={variety.value} 
                        value={variety.value} 
                        className="text-lg py-3 cursor-pointer hover:bg-leaf/10"
                      >
                        {variety.emoji} {t(`variety.${variety.value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* pH Compatibility Indicator */}
            {selectedCrop && phCompatibility && (
              <div className={`flex items-center gap-2 p-3 rounded-lg animate-in fade-in duration-300 ${
                phCompatibility.isCompatible 
                  ? "bg-leaf/10 text-leaf" 
                  : "bg-destructive/10 text-destructive"
              }`}>
                {phCompatibility.isCompatible ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      {t("form.phMatch")} ({t("form.optimal")}: {phCompatibility.optimalRange})
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">
                      {t("form.phMismatch")} ({t("form.optimal")}: {phCompatibility.optimalRange})
                    </span>
                  </>
                )}
              </div>
            )}
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
            <DistrictSelect 
              value={selectedDistrict} 
              onChange={setSelectedDistrict} 
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
            disabled={!selectedVariety || isLoading}
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

          {!selectedVariety && (
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
