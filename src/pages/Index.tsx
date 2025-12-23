import { useState } from "react";
import { Helmet } from "react-helmet";
import HeroSection from "@/components/HeroSection";
import InputForm, { FormData } from "@/components/InputForm";
import RecommendationCard from "@/components/RecommendationCard";
import Footer from "@/components/Footer";
import { getRecommendation } from "@/lib/recommendations";
import { toast } from "sonner";

interface Recommendation {
  fertilizerLevel: "Low" | "Medium" | "High";
  irrigationAdvice: "Irrigate" | "No irrigation needed";
  explanation: string;
  details: {
    nitrogen: string;
    phosphorus: string;
    potassium: string;
  };
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [currentCrop, setCurrentCrop] = useState("");

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    setRecommendation(null);
    
    try {
      const result = await getRecommendation(data);
      setRecommendation(result);
      setCurrentCrop(data.cropType);
      toast.success("Recommendations generated successfully!");
    } catch (error) {
      toast.error("Failed to generate recommendations. Please try again.");
      console.error(error);
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
