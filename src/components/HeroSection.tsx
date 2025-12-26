import { Leaf, Droplets, Sun, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const { t, language, setShowLanguageModal } = useLanguage();

  return (
    <section className="relative overflow-hidden gradient-sky py-16 lg:py-24">
      {/* Language Switch Button - moved to left side */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLanguageModal(true)}
          className="bg-card/80 backdrop-blur-sm border-leaf/30 hover:border-leaf hover:bg-leaf/10"
        >
          <Globe className="w-4 h-4 mr-2" />
          {language === "bn" ? "বাংলা" : "English"}
        </Button>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-leaf/20 blur-2xl animate-pulse-glow" />
        <div className="absolute top-40 right-20 w-32 h-32 rounded-full bg-sun/30 blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 rounded-full bg-water/20 blur-2xl animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-leaf/20 rounded-full px-4 py-2 mb-6 shadow-soft animate-fade-in">
            <Leaf className="w-4 h-4 text-leaf" />
            <span className="text-sm font-medium text-foreground">{t("hero.badge")}</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {t("hero.title")}{" "}
            <span className="text-primary">{t("hero.country")}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {t("hero.subtitle")}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 bg-leaf/10 text-leaf-foreground rounded-full px-4 py-2 border border-leaf/20">
              <Leaf className="w-4 h-4 text-leaf" />
              <span className="text-sm font-medium">{t("hero.fertilizer")}</span>
            </div>
            <div className="flex items-center gap-2 bg-water/10 text-water-foreground rounded-full px-4 py-2 border border-water/20">
              <Droplets className="w-4 h-4 text-water" />
              <span className="text-sm font-medium">{t("hero.irrigation")}</span>
            </div>
            <div className="flex items-center gap-2 bg-sun/10 text-sun-foreground rounded-full px-4 py-2 border border-sun/30">
              <Sun className="w-4 h-4 text-harvest" />
              <span className="text-sm font-medium">{t("hero.weather")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
