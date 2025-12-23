import { Leaf, Droplets, Sun } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden gradient-sky py-16 lg:py-24">
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
            <span className="text-sm font-medium text-foreground">AI-Powered Agricultural Intelligence</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Smart Farming for{" "}
            <span className="text-primary">Bangladesh</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Get precise fertilizer and irrigation recommendations powered by machine learning. 
            Optimize your crop yield while protecting soil health.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 bg-leaf/10 text-leaf-foreground rounded-full px-4 py-2 border border-leaf/20">
              <Leaf className="w-4 h-4 text-leaf" />
              <span className="text-sm font-medium">Fertilizer Advice</span>
            </div>
            <div className="flex items-center gap-2 bg-water/10 text-water-foreground rounded-full px-4 py-2 border border-water/20">
              <Droplets className="w-4 h-4 text-water" />
              <span className="text-sm font-medium">Irrigation Guidance</span>
            </div>
            <div className="flex items-center gap-2 bg-sun/10 text-sun-foreground rounded-full px-4 py-2 border border-sun/30">
              <Sun className="w-4 h-4 text-harvest" />
              <span className="text-sm font-medium">Weather-Aware</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
