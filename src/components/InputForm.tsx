import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sprout, Thermometer, Droplets, CloudRain, Beaker } from "lucide-react";

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export interface FormData {
  cropType: string;
  soilPH: number;
  soilMoisture: number;
  temperature: number;
  rainfall: number;
}

const crops = [
  { value: "rice", label: "Rice (ধান)", icon: "🌾" },
  { value: "wheat", label: "Wheat (গম)", icon: "🌾" },
  { value: "maize", label: "Maize (ভুট্টা)", icon: "🌽" },
  { value: "jute", label: "Jute (পাট)", icon: "🌿" },
  { value: "potato", label: "Potato (আলু)", icon: "🥔" },
];

const InputForm = ({ onSubmit, isLoading }: InputFormProps) => {
  const [cropType, setCropType] = useState("");
  const [soilPH, setSoilPH] = useState([6.5]);
  const [soilMoisture, setSoilMoisture] = useState([50]);
  const [temperature, setTemperature] = useState([28]);
  const [rainfall, setRainfall] = useState([100]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropType) return;
    
    onSubmit({
      cropType,
      soilPH: soilPH[0],
      soilMoisture: soilMoisture[0],
      temperature: temperature[0],
      rainfall: rainfall[0],
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-primary/10">
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center gap-3">
          <Sprout className="w-7 h-7 text-leaf" />
          Enter Your Farm Data
        </CardTitle>
        <CardDescription>
          Provide soil and weather conditions for personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Crop Selection */}
          <div className="space-y-3">
            <Label htmlFor="crop" className="flex items-center gap-2 text-base font-semibold">
              <Sprout className="w-4 h-4 text-leaf" />
              Crop Type
            </Label>
            <Select value={cropType} onValueChange={setCropType}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select your crop..." />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop.value} value={crop.value} className="text-base py-3">
                    <span className="flex items-center gap-2">
                      <span>{crop.icon}</span>
                      {crop.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Soil pH */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Beaker className="w-4 h-4 text-earth" />
                Soil pH Level
              </Label>
              <span className="text-lg font-bold text-primary bg-accent px-3 py-1 rounded-lg">
                {soilPH[0].toFixed(1)}
              </span>
            </div>
            <Slider
              value={soilPH}
              onValueChange={setSoilPH}
              min={4}
              max={9}
              step={0.1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Acidic (4.0)</span>
              <span>Neutral (7.0)</span>
              <span>Alkaline (9.0)</span>
            </div>
          </div>

          {/* Soil Moisture */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Droplets className="w-4 h-4 text-water" />
                Soil Moisture
              </Label>
              <span className="text-lg font-bold text-water bg-water-light px-3 py-1 rounded-lg">
                {soilMoisture[0]}%
              </span>
            </div>
            <Slider
              value={soilMoisture}
              onValueChange={setSoilMoisture}
              min={0}
              max={100}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Dry (0%)</span>
              <span>Optimal (50%)</span>
              <span>Saturated (100%)</span>
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Thermometer className="w-4 h-4 text-destructive" />
                Temperature
              </Label>
              <span className="text-lg font-bold text-harvest bg-sun/20 px-3 py-1 rounded-lg">
                {temperature[0]}°C
              </span>
            </div>
            <Slider
              value={temperature}
              onValueChange={setTemperature}
              min={10}
              max={45}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Cool (10°C)</span>
              <span>Moderate (28°C)</span>
              <span>Hot (45°C)</span>
            </div>
          </div>

          {/* Rainfall */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <CloudRain className="w-4 h-4 text-water" />
                Recent Rainfall
              </Label>
              <span className="text-lg font-bold text-water bg-water-light px-3 py-1 rounded-lg">
                {rainfall[0]} mm
              </span>
            </div>
            <Slider
              value={rainfall}
              onValueChange={setRainfall}
              min={0}
              max={300}
              step={5}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>None (0mm)</span>
              <span>Moderate (150mm)</span>
              <span>Heavy (300mm)</span>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="hero" 
            size="xl" 
            className="w-full"
            disabled={!cropType || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              "Get AI Recommendations"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InputForm;
