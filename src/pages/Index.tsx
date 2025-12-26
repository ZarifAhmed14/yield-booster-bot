import { useState } from "react";
import { Helmet } from "react-helmet";
import HeroSection from "@/components/HeroSection";
import InputForm, { FormData } from "@/components/InputForm";
import RecommendationCard from "@/components/RecommendationCard";
import Footer from "@/components/Footer";
import LanguageModal from "@/components/LanguageModal";
import { getPrediction, PredictionResponse } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<PredictionResponse | null>(null);
  const [currentCrop, setCurrentCrop] = useState("");

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
      toast.success(t("toast.success"));
    } catch (error) {
      console.error("API Error:", error);
      toast.error(t("toast.error"), {
        description: t("toast.errorDesc"),
      });
    } finally {
      setIsLoading(false);
    }
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
        <HeroSection />
        
        <main className="flex-1 container py-12 space-y-12">
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
          
          {recommendation && (
            <RecommendationCard 
              recommendation={recommendation} 
              cropType={currentCrop}
            />
          )}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Index;
