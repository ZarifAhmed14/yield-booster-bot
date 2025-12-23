import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Beaker, Droplets, CheckCircle2, AlertTriangle, Info } from "lucide-react";

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

interface RecommendationCardProps {
  recommendation: Recommendation;
  cropType: string;
}

const fertilizerColors = {
  Low: "bg-leaf/20 text-leaf border-leaf/30",
  Medium: "bg-harvest/20 text-earth border-harvest/30",
  High: "bg-destructive/20 text-destructive border-destructive/30",
};

const fertilizerBars = {
  Low: 1,
  Medium: 2,
  High: 3,
};

const RecommendationCard = ({ recommendation, cropType }: RecommendationCardProps) => {
  const { fertilizerLevel, irrigationAdvice, explanation, details } = recommendation;
  const needsIrrigation = irrigationAdvice === "Irrigate";

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Main Recommendations */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Fertilizer Card */}
        <Card className="border-2 border-leaf/20 overflow-hidden">
          <CardHeader className="pb-3 bg-leaf/5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Beaker className="w-5 h-5 text-leaf" />
              Fertilizer Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <Badge className={`text-base px-4 py-1.5 ${fertilizerColors[fertilizerLevel]}`}>
                {fertilizerLevel} Application
              </Badge>
            </div>
            
            {/* Visual bar indicator */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3].map((bar) => (
                <div
                  key={bar}
                  className={`h-8 flex-1 rounded-lg transition-all duration-500 ${
                    bar <= fertilizerBars[fertilizerLevel]
                      ? fertilizerLevel === "Low"
                        ? "bg-leaf animate-grow"
                        : fertilizerLevel === "Medium"
                        ? "bg-harvest animate-grow"
                        : "bg-destructive animate-grow"
                      : "bg-muted"
                  }`}
                  style={{ animationDelay: `${bar * 0.15}s` }}
                />
              ))}
            </div>

            {/* NPK Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Nitrogen (N)</span>
                <span className="font-semibold">{details.nitrogen}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Phosphorus (P)</span>
                <span className="font-semibold">{details.phosphorus}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Potassium (K)</span>
                <span className="font-semibold">{details.potassium}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Irrigation Card */}
        <Card className="border-2 border-water/20 overflow-hidden">
          <CardHeader className="pb-3 bg-water/5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Droplets className="w-5 h-5 text-water" />
              Irrigation Advice
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 mb-4">
              {needsIrrigation ? (
                <AlertTriangle className="w-10 h-10 text-water p-2 bg-water/10 rounded-full" />
              ) : (
                <CheckCircle2 className="w-10 h-10 text-leaf p-2 bg-leaf/10 rounded-full" />
              )}
              <div>
                <p className={`text-xl font-bold ${needsIrrigation ? "text-water" : "text-leaf"}`}>
                  {irrigationAdvice}
                </p>
                <p className="text-sm text-muted-foreground">
                  {needsIrrigation 
                    ? "Water your crops soon"
                    : "Soil moisture is adequate"
                  }
                </p>
              </div>
            </div>

            {/* Water droplet visualization */}
            <div className="flex justify-center gap-3 py-4">
              {[1, 2, 3, 4, 5].map((drop) => (
                <Droplets
                  key={drop}
                  className={`w-6 h-6 transition-all duration-300 ${
                    needsIrrigation
                      ? drop <= 2
                        ? "text-water/30"
                        : "text-muted/20"
                      : "text-water animate-pulse"
                  }`}
                  style={{ animationDelay: `${drop * 0.1}s` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explanation Card */}
      <Card className="border-2 border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="w-5 h-5 text-primary" />
            AI Explanation for {cropType.charAt(0).toUpperCase() + cropType.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {explanation}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationCard;
