import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import HeroSection from "@/components/HeroSection";
import InputForm, { FormData } from "@/components/InputForm";
import RecommendationCard from "@/components/RecommendationCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import Footer from "@/components/Footer";
import LanguageModal from "@/components/LanguageModal";
import { getPrediction, PredictionResponse } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, History } from "lucide-react";

const Index = () => {
  const { t } = useLanguage();
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<PredictionResponse | null>(null);
  const [currentCrop, setCurrentCrop] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [currentSoilPh, setCurrentSoilPh] = useState(0);

  const saveToHistory = async (data: FormData, result: PredictionResponse) => {
    if (!user) return;
    
    const { error } = await supabase.from("recommendations_history").insert({
      user_id: user.id,
      crop_type: data.cropType,
      location: data.location,
      soil_ph: data.soilPH,
      fertilizer_level: result.fertilizer_level,
      irrigation_needed: result.irrigation_needed,
      recommendations_text: result.recommendations_text,
      weather_temperature: result.weather_data?.temperature,
      weather_humidity: result.weather_data?.humidity,
      weather_rainfall: result.weather_data?.rainfall,
      soil_moisture: result.weather_data?.soil_moisture,
      confidence: result.confidence,
    });

    if (error) {
      console.error("Failed to save history:", error);
    } else {
      toast.success(t("history.saved"));
    }
  };

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    setRecommendation(null);
    
    try {
      const result = await getPrediction({
        crop_type: data.cropType,
        soil_ph: data.soilPH,
        location: data.location,
      });
      
      setRecommendation(result);
      setCurrentCrop(data.cropType);
      setCurrentLocation(data.location);
      setCurrentSoilPh(data.soilPH);
      toast.success(t("toast.success"));
      
      // Save to history if logged in
      if (user) {
        await saveToHistory(data, result);
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error(t("toast.error"), {
        description: t("toast.errorDesc"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
  };

  return (
    <>
      <Helmet>
        <title>KrishiMitra - AI Fertilizer & Irrigation Recommendations</title>
        <meta 
          name="description" 
          content="Smart farming recommendations for Bangladesh. Get AI-powered fertilizer and irrigation advice based on soil and weather conditions." 
        />
      </Helmet>
      
      <LanguageModal />
      
      <div className="min-h-screen flex flex-col">
        {/* Auth Header */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          {!authLoading && (
            <>
              {user ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/history")}
                    className="border-2 border-leaf/30 hover:bg-leaf/10"
                  >
                    <History className="w-4 h-4 mr-2" />
                    {t("history.viewHistory")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("auth.logout")}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="border-2 border-leaf/30 hover:bg-leaf/10"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {t("auth.login")}
                </Button>
              )}
            </>
          )}
        </div>

        <HeroSection />
        
        <main className="flex-1 container py-12 space-y-12">
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
          
          {isLoading && <LoadingSkeleton />}
          
          {recommendation && !isLoading && (
            <RecommendationCard 
              recommendation={recommendation} 
              cropType={currentCrop}
              location={currentLocation}
              soilPh={currentSoilPh}
            />
          )}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Index;
