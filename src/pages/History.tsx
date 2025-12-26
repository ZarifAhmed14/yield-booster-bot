import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Droplets, 
  Beaker,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface HistoryItem {
  id: string;
  crop_type: string;
  location: string;
  soil_ph: number;
  fertilizer_level: string;
  irrigation_needed: boolean;
  recommendations_text: string | null;
  weather_temperature: number | null;
  weather_humidity: number | null;
  soil_moisture: number | null;
  created_at: string;
}

const History = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("recommendations_history")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load history");
      console.error(error);
    } else {
      setHistory(data || []);
    }
    setLoading(false);
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from("recommendations_history")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success(t("history.deleted"));
      setHistory(history.filter(item => item.id !== id));
    }
  };

  const getFertilizerStyle = (level: string) => {
    switch (level) {
      case "Low": return "bg-leaf text-primary-foreground";
      case "Medium": return "bg-harvest text-foreground";
      case "High": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-leaf border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-leaf/5 via-background to-water/5">
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate("/")}
            className="border-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-black text-leaf">
            📜 {t("history.title")}
          </h1>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-2">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : history.length === 0 ? (
          <Card className="border-2 border-dashed text-center py-12">
            <CardContent>
              <p className="text-xl text-muted-foreground">
                {t("history.empty")}
              </p>
              <Button 
                onClick={() => navigate("/")} 
                className="mt-4 bg-leaf hover:bg-leaf/90"
              >
                {t("history.getFirst")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {history.map((item) => (
              <Card key={item.id} className="border-2 border-leaf/20 hover:border-leaf/40 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        🌱 {t(`crop.${item.crop_type}`) || item.crop_type}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        {item.location}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getFertilizerStyle(item.fertilizer_level)}>
                      <Beaker className="w-3 h-3 mr-1" />
                      {item.fertilizer_level}
                    </Badge>
                    <Badge variant={item.irrigation_needed ? "default" : "secondary"}>
                      <Droplets className="w-3 h-3 mr-1" />
                      {item.irrigation_needed ? t("result.waterNeeded") : t("result.noWater")}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                    <span>pH: {item.soil_ph}</span>
                    {item.weather_temperature && (
                      <span>🌡️ {item.weather_temperature}°C</span>
                    )}
                    {item.soil_moisture && (
                      <span>💧 {t("result.soilMoisture")}: {item.soil_moisture}%</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(item.created_at), "PPp")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
