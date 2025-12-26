import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "bn";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  showLanguageModal: boolean;
  setShowLanguageModal: (show: boolean) => void;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Hero
    "hero.badge": "AI-Powered Agricultural Intelligence",
    "hero.title": "Smart Farming for",
    "hero.country": "Bangladesh",
    "hero.subtitle": "Get precise fertilizer and irrigation recommendations powered by machine learning. Optimize your crop yield while protecting soil health.",
    "hero.fertilizer": "Fertilizer Advice",
    "hero.irrigation": "Irrigation Guidance",
    "hero.weather": "Weather-Aware",
    
    // Form
    "form.title": "Enter Your Farm Information",
    "form.step1": "Which Crop?",
    "form.selectCrop": "Select Crop",
    "form.step2": "Soil pH",
    "form.phAcidic": "Acidic",
    "form.phGood": "Good",
    "form.phAlkaline": "Alkaline",
    "form.phTip": "Tip: Most crops grow best between pH 6.0 - 7.0",
    "form.step3": "Your Location",
    "form.locationHint": "Enter location for weather data",
    "form.submit": "Get Advice",
    "form.analyzing": "Analyzing...",
    "form.selectFirst": "Please select a crop first",
    
    // Crops
    "crop.rice": "Rice",
    "crop.wheat": "Wheat",
    "crop.maize": "Maize",
    "crop.jute": "Jute",
    "crop.potato": "Potato",
    
    // Results
    "result.weather": "Weather",
    "result.temperature": "Temperature",
    "result.rainfall": "Rainfall",
    "result.humidity": "Humidity",
    "result.fertilizer": "Fertilizer",
    "result.low": "Low",
    "result.medium": "Medium",
    "result.high": "High",
    "result.irrigation": "Irrigation",
    "result.waterNeeded": "WATER NEEDED",
    "result.waterYour": "Water your crops",
    "result.noWater": "NO WATER NEEDED",
    "result.enoughMoisture": "Soil has enough moisture",
    "result.npk": "NPK Amount:",
    "result.advice": "Advice for",
    "result.defaultAdvice": "See fertilizer and irrigation advice above.",
    "result.goodHarvest": "Good harvest!",
    "result.ready": "Your recommendations are ready!",
    
    // Language modal
    "lang.choose": "Choose Your Language",
    "lang.english": "English",
    "lang.bangla": "বাংলা (Bangla)",
    "lang.continue": "Continue",
    
    // Footer
    "footer.powered": "Powered by AI for Bangladesh farmers",
    
    // Toast
    "toast.success": "Recommendations generated!",
    "toast.error": "Something went wrong!",
    "toast.errorDesc": "Could not connect to server. Please try again.",
  },
  bn: {
    // Hero
    "hero.badge": "AI চালিত কৃষি বুদ্ধিমত্তা",
    "hero.title": "স্মার্ট কৃষি",
    "hero.country": "বাংলাদেশ",
    "hero.subtitle": "মেশিন লার্নিং দ্বারা সঠিক সার ও সেচের পরামর্শ পান। মাটির স্বাস্থ্য রক্ষা করে ফসলের ফলন বাড়ান।",
    "hero.fertilizer": "সারের পরামর্শ",
    "hero.irrigation": "সেচের দিকনির্দেশনা",
    "hero.weather": "আবহাওয়া সচেতন",
    
    // Form
    "form.title": "আপনার তথ্য দিন",
    "form.step1": "কোন ফসল?",
    "form.selectCrop": "ফসল বাছাই করুন",
    "form.step2": "মাটির pH",
    "form.phAcidic": "অম্লীয়",
    "form.phGood": "ভালো",
    "form.phAlkaline": "ক্ষারীয়",
    "form.phTip": "টিপস: বেশিরভাগ ফসল pH ৬.০ - ৭.০ এর মধ্যে ভালো জন্মায়",
    "form.step3": "আপনার এলাকা",
    "form.locationHint": "আবহাওয়া জানতে এলাকার নাম দিন",
    "form.submit": "পরামর্শ নিন",
    "form.analyzing": "বিশ্লেষণ করা হচ্ছে...",
    "form.selectFirst": "প্রথমে ফসল বাছাই করুন",
    
    // Crops
    "crop.rice": "ধান",
    "crop.wheat": "গম",
    "crop.maize": "ভুট্টা",
    "crop.jute": "পাট",
    "crop.potato": "আলু",
    
    // Results
    "result.weather": "আবহাওয়া",
    "result.temperature": "তাপমাত্রা",
    "result.rainfall": "বৃষ্টিপাত",
    "result.humidity": "আর্দ্রতা",
    "result.fertilizer": "সার",
    "result.low": "কম",
    "result.medium": "মাঝারি",
    "result.high": "বেশি",
    "result.irrigation": "সেচ",
    "result.waterNeeded": "সেচ দিন!",
    "result.waterYour": "আপনার ফসলে পানি দিন",
    "result.noWater": "সেচ লাগবে না",
    "result.enoughMoisture": "মাটিতে যথেষ্ট আর্দ্রতা আছে",
    "result.npk": "NPK পরিমাণ:",
    "result.advice": "পরামর্শ",
    "result.defaultAdvice": "আপনার ফসলের জন্য সার ও সেচের পরামর্শ উপরে দেখুন।",
    "result.goodHarvest": "ভালো ফসল হোক!",
    "result.ready": "আপনার পরামর্শ তৈরি!",
    
    // Language modal
    "lang.choose": "ভাষা বাছাই করুন",
    "lang.english": "English",
    "lang.bangla": "বাংলা",
    "lang.continue": "এগিয়ে যান",
    
    // Footer
    "footer.powered": "বাংলাদেশের কৃষকদের জন্য AI চালিত",
    
    // Toast
    "toast.success": "পরামর্শ তৈরি হয়েছে!",
    "toast.error": "সমস্যা হয়েছে!",
    "toast.errorDesc": "সার্ভারে সংযোগ করা যায়নি। আবার চেষ্টা করুন।",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("krishimitra-lang");
    if (savedLang === "en" || savedLang === "bn") {
      setLanguageState(savedLang);
    } else {
      setShowLanguageModal(true);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("krishimitra-lang", lang);
    setShowLanguageModal(false);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, showLanguageModal, setShowLanguageModal }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
