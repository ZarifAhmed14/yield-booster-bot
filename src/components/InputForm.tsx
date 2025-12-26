import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sprout, MapPin, User, Beaker, Loader2 } from "lucide-react";

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export interface FormData {
  cropType: string;
  soilPH: number;
  location: string;
  farmerName: string;
}

const crops = [
  { value: "rice", label: "🌾 Rice (ধান)", bengali: "ধান" },
  { value: "wheat", label: "🌾 Wheat (গম)", bengali: "গম" },
  { value: "maize", label: "🌽 Maize (ভুট্টা)", bengali: "ভুট্টা" },
  { value: "jute", label: "🌿 Jute (পাট)", bengali: "পাট" },
  { value: "potato", label: "🥔 Potato (আলু)", bengali: "আলু" },
];

const InputForm = ({ onSubmit, isLoading }: InputFormProps) => {
  const [cropType, setCropType] = useState("");
  const [soilPH, setSoilPH] = useState([6.5]);
  const [location, setLocation] = useState("Dhaka");
  const [farmerName, setFarmerName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropType) return;
    
    onSubmit({
      cropType,
      soilPH: soilPH[0],
      location: location || "Dhaka",
      farmerName,
    });
  };

  // Get pH color based on value
  const getPHColor = () => {
    const ph = soilPH[0];
    if (ph < 5.5) return "text-destructive"; // Too acidic
    if (ph > 7.5) return "text-water"; // Too alkaline
    return "text-leaf"; // Good range
  };

  const getPHLabel = () => {
    const ph = soilPH[0];
    if (ph < 5.5) return "অম্লীয় (Acidic) ⚠️";
    if (ph > 7.5) return "ক্ষারীয় (Alkaline) ⚠️";
    if (ph >= 6.0 && ph <= 7.0) return "ভালো (Good) ✓";
    return "ঠিক আছে (OK)";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-4 border-leaf/30 shadow-card">
      <CardHeader className="text-center pb-4 bg-gradient-to-b from-leaf/10 to-transparent">
        <CardTitle className="flex items-center justify-center gap-3 text-2xl md:text-3xl">
          <Sprout className="w-8 h-8 text-leaf" />
          আপনার তথ্য দিন
        </CardTitle>
        <CardDescription className="text-lg">
          Enter Your Farm Information
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Step 1: Crop Selection - BIGGEST and FIRST */}
          <div className="space-y-3 p-4 bg-leaf/5 rounded-xl border-2 border-leaf/20">
            <Label htmlFor="crop" className="flex items-center gap-2 text-xl font-bold text-leaf">
              <span className="text-3xl">1️⃣</span>
              <Sprout className="w-6 h-6" />
              কোন ফসল? (Which Crop?)
            </Label>
            <Select value={cropType} onValueChange={setCropType}>
              <SelectTrigger className="h-16 text-xl font-semibold border-2 border-leaf/30">
                <SelectValue placeholder="👆 ফসল বাছাই করুন (Select Crop)" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {crops.map((crop) => (
                  <SelectItem 
                    key={crop.value} 
                    value={crop.value} 
                    className="text-xl py-4 cursor-pointer hover:bg-leaf/10"
                  >
                    {crop.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Soil pH - Simple slider with big numbers */}
          <div className="space-y-4 p-4 bg-earth/5 rounded-xl border-2 border-earth/20">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-xl font-bold text-earth">
                <span className="text-3xl">2️⃣</span>
                <Beaker className="w-6 h-6" />
                মাটির pH
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
              <span>🟡 4.0 (অম্লীয়)</span>
              <span>🟢 6-7 (ভালো)</span>
              <span>🔵 9.0 (ক্ষারীয়)</span>
            </div>
            <p className="text-center text-sm text-muted-foreground italic">
              💡 Tip: Most crops grow best between pH 6.0 - 7.0
            </p>
          </div>

          {/* Step 3: Location - Simple text input */}
          <div className="space-y-3 p-4 bg-water/5 rounded-xl border-2 border-water/20">
            <Label className="flex items-center gap-2 text-xl font-bold text-water">
              <span className="text-3xl">3️⃣</span>
              <MapPin className="w-6 h-6" />
              আপনার এলাকা (Your Location)
            </Label>
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Dhaka, Rangpur, Khulna..."
              className="h-14 text-xl border-2 border-water/30"
            />
            <p className="text-sm text-muted-foreground">
              📍 আবহাওয়া জানতে এলাকার নাম দিন (Enter location for weather data)
            </p>
          </div>

          {/* Step 4: Farmer Name - Optional */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-xl border-2 border-muted">
            <Label className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
              <span className="text-2xl">4️⃣</span>
              <User className="w-5 h-5" />
              আপনার নাম (Your Name) - ঐচ্ছিক
            </Label>
            <Input
              type="text"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              placeholder="Optional - আপনার নাম"
              className="h-12 text-lg border-2"
            />
          </div>

          {/* Big Submit Button */}
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
                বিশ্লেষণ করা হচ্ছে... (Analyzing...)
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Sprout className="w-8 h-8" />
                পরামর্শ নিন 🌱
                <span className="text-lg font-normal opacity-80">Get Advice</span>
              </span>
            )}
          </Button>

          {!cropType && (
            <p className="text-center text-destructive font-medium animate-pulse">
              ⚠️ প্রথমে ফসল বাছাই করুন (Please select a crop first)
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default InputForm;
