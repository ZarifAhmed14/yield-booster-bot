import { FormData } from "@/components/InputForm";

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

// Simulated ML recommendation engine
// In production, this would call a backend API with the trained model
export const getRecommendation = (data: FormData): Promise<Recommendation> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const { cropType, soilPH, soilMoisture, temperature, rainfall } = data;
      
      // Fertilizer logic based on crop and soil conditions
      let fertilizerLevel: "Low" | "Medium" | "High";
      let nitrogen: string, phosphorus: string, potassium: string;
      
      // Crop-specific base requirements
      const cropFactors: Record<string, { n: number; p: number; k: number }> = {
        rice: { n: 80, p: 40, k: 40 },
        wheat: { n: 60, p: 30, k: 30 },
        maize: { n: 100, p: 50, k: 50 },
        jute: { n: 40, p: 20, k: 30 },
        potato: { n: 70, p: 60, k: 80 },
      };
      
      const baseFactor = cropFactors[cropType] || { n: 60, p: 40, k: 40 };
      
      // pH adjustment (optimal range 6.0-7.0 for most crops)
      let phMultiplier = 1;
      if (soilPH < 5.5 || soilPH > 7.5) {
        phMultiplier = 1.3; // Need more fertilizer in extreme pH
      } else if (soilPH >= 6.0 && soilPH <= 7.0) {
        phMultiplier = 0.9; // Optimal pH, slightly less needed
      }
      
      // Temperature adjustment
      let tempMultiplier = 1;
      if (temperature > 35) {
        tempMultiplier = 0.8; // High temps reduce efficiency
      } else if (temperature < 20) {
        tempMultiplier = 0.85; // Cold slows uptake
      }
      
      // Calculate final values
      const adjustedN = Math.round(baseFactor.n * phMultiplier * tempMultiplier);
      const adjustedP = Math.round(baseFactor.p * phMultiplier);
      const adjustedK = Math.round(baseFactor.k * phMultiplier);
      
      // Determine fertilizer level
      const totalNPK = adjustedN + adjustedP + adjustedK;
      if (totalNPK < 100) {
        fertilizerLevel = "Low";
      } else if (totalNPK < 180) {
        fertilizerLevel = "Medium";
      } else {
        fertilizerLevel = "High";
      }
      
      nitrogen = `${adjustedN} kg/ha`;
      phosphorus = `${adjustedP} kg/ha`;
      potassium = `${adjustedK} kg/ha`;
      
      // Irrigation logic
      let irrigationAdvice: "Irrigate" | "No irrigation needed";
      
      // Consider soil moisture and recent rainfall
      const effectiveMoisture = soilMoisture + (rainfall * 0.3);
      
      // Crop-specific moisture thresholds
      const moistureThresholds: Record<string, number> = {
        rice: 70, // Rice needs more water
        wheat: 45,
        maize: 50,
        jute: 60,
        potato: 55,
      };
      
      const threshold = moistureThresholds[cropType] || 50;
      
      // Temperature also affects water needs
      const tempAdjustedThreshold = temperature > 32 ? threshold + 10 : threshold;
      
      irrigationAdvice = effectiveMoisture < tempAdjustedThreshold 
        ? "Irrigate" 
        : "No irrigation needed";
      
      // Generate explanation
      const explanation = generateExplanation(
        cropType,
        fertilizerLevel,
        irrigationAdvice,
        soilPH,
        soilMoisture,
        temperature,
        rainfall
      );
      
      resolve({
        fertilizerLevel,
        irrigationAdvice,
        explanation,
        details: {
          nitrogen,
          phosphorus,
          potassium,
        },
      });
    }, 1500);
  });
};

const generateExplanation = (
  crop: string,
  fertilizer: string,
  irrigation: string,
  pH: number,
  moisture: number,
  temp: number,
  rain: number
): string => {
  const cropName = crop.charAt(0).toUpperCase() + crop.slice(1);
  
  let explanation = `Based on the analysis of your ${cropName} field conditions: `;
  
  // pH explanation
  if (pH < 6.0) {
    explanation += `Your soil pH of ${pH.toFixed(1)} is slightly acidic, which may limit nutrient availability. Consider applying lime to raise pH gradually. `;
  } else if (pH > 7.5) {
    explanation += `Your soil pH of ${pH.toFixed(1)} is alkaline, which can affect micronutrient uptake. `;
  } else {
    explanation += `Your soil pH of ${pH.toFixed(1)} is within the optimal range for ${cropName}. `;
  }
  
  // Fertilizer explanation
  explanation += `A ${fertilizer.toLowerCase()} fertilizer application is recommended based on crop requirements and current soil conditions. `;
  
  // Irrigation explanation
  if (irrigation === "Irrigate") {
    explanation += `With soil moisture at ${moisture}% and recent rainfall of ${rain}mm, irrigation is needed to support optimal ${cropName} growth`;
    if (temp > 30) {
      explanation += `, especially given the high temperature of ${temp}°C which increases water demand.`;
    } else {
      explanation += `.`;
    }
  } else {
    explanation += `Current moisture levels (${moisture}%) combined with ${rain}mm rainfall provide adequate water for your crop. Monitor conditions and reassess in 2-3 days.`;
  }
  
  return explanation;
};
