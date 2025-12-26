import { useState } from "react";
import { Helmet } from "react-helmet";
import HeroSection from "@/components/HeroSection";
import InputForm, { FormData } from "@/components/InputForm";
import RecommendationCard from "@/components/RecommendationCard";
import Footer from "@/components/Footer";
import { getPrediction, PredictionResponse } from "@/lib/api";
import { toast } from "sonner";

const Index = () => {
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
        farmer_name: data.farmerName || undefined,
      });
      
      setRecommendation(result);
      setCurrentCrop(data.cropType);
      toast.success("পরামর্শ তৈরি হয়েছে! ✓", {
        description: "Recommendations generated successfully!",
      });
    } catch (error) {
      console.error("API Error:", error);
      toast.error("সমস্যা হয়েছে!", {
        description: "Could not connect to server. Please try again.",
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
