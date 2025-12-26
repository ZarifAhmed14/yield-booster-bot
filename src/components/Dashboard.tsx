import { useEffect, useState } from "react";
import { Leaf, Droplets, Sun, Globe, TrendingUp, Calendar, Sprout } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStats {
  totalRecommendations: number;
  mostUsedCrop: string | null;
  lastActivity: string | null;
  avgSoilPh: number | null;
}

interface RecentRecommendation {
  id: string;
  crop_type: string;
  created_at: string;
  fertilizer_level: string;
  irrigation_needed: boolean;
}

const Dashboard = () => {
  const { t, language, setShowLanguageModal } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRecommendations: 0,
    mostUsedCrop: null,
    lastActivity: null,
    avgSoilPh: null,
  });
  const [recentRecs, setRecentRecs] = useState<RecentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch all recommendations for stats
      const { data: allRecs, error } = await supabase
        .from("recommendations_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (allRecs && allRecs.length > 0) {
        // Calculate stats
        const cropCounts: Record<string, number> = {};
        let totalPh = 0;

        allRecs.forEach((rec) => {
          cropCounts[rec.crop_type] = (cropCounts[rec.crop_type] || 0) + 1;
          totalPh += rec.soil_ph;
        });

        const mostUsedCrop = Object.entries(cropCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        setStats({
          totalRecommendations: allRecs.length,
          mostUsedCrop,
          lastActivity: allRecs[0]?.created_at || null,
          avgSoilPh: totalPh / allRecs.length,
        });

        // Recent 3 recommendations
        setRecentRecs(allRecs.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return language === "bn" ? "আজ" : "Today";
    if (diffDays === 1) return language === "bn" ? "গতকাল" : "Yesterday";
    if (diffDays < 7) return language === "bn" ? `${diffDays} দিন আগে` : `${diffDays} days ago`;
    return formatDate(dateStr);
  };

  return (
    <section className="relative overflow-hidden gradient-sky py-8 lg:py-12">
      {/* Language Switch Button */}
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
        <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-leaf/20 blur-2xl animate-pulse-glow" />
        <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-sun/30 blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-10 left-1/4 w-20 h-20 rounded-full bg-water/20 blur-2xl animate-pulse-glow" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="container relative z-10">
        {/* Welcome Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-leaf/20 rounded-full px-4 py-2 mb-3 shadow-soft">
            <Sprout className="w-4 h-4 text-leaf" />
            <span className="text-sm font-medium text-foreground">
              {language === "bn" ? "স্বাগতম ফিরে!" : "Welcome back!"}
            </span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {language === "bn" ? "আপনার কৃষি ড্যাশবোর্ড" : "Your Farming Dashboard"}
          </h2>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {/* Total Recommendations */}
          <Card className="bg-card/80 backdrop-blur-sm border-leaf/20 shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-leaf/20 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-leaf" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {loading ? "—" : stats.totalRecommendations}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === "bn" ? "মোট পরামর্শ" : "Total Advice"}
              </p>
            </CardContent>
          </Card>

          {/* Most Used Crop */}
          <Card className="bg-card/80 backdrop-blur-sm border-sun/20 shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-sun/20 flex items-center justify-center mx-auto mb-2">
                <Leaf className="w-5 h-5 text-harvest" />
              </div>
              <p className="text-lg font-bold text-foreground truncate">
                {loading ? "—" : stats.mostUsedCrop || (language === "bn" ? "নেই" : "None")}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === "bn" ? "শীর্ষ ফসল" : "Top Crop"}
              </p>
            </CardContent>
          </Card>

          {/* Avg Soil pH */}
          <Card className="bg-card/80 backdrop-blur-sm border-earth/20 shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-earth/20 flex items-center justify-center mx-auto mb-2">
                <Droplets className="w-5 h-5 text-earth" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {loading ? "—" : stats.avgSoilPh?.toFixed(1) || "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === "bn" ? "গড় pH" : "Avg pH"}
              </p>
            </CardContent>
          </Card>

          {/* Last Activity */}
          <Card className="bg-card/80 backdrop-blur-sm border-water/20 shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-water/20 flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-water" />
              </div>
              <p className="text-sm font-bold text-foreground">
                {loading ? "—" : stats.lastActivity ? getTimeAgo(stats.lastActivity) : (language === "bn" ? "নতুন" : "New")}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === "bn" ? "শেষ কার্যকলাপ" : "Last Activity"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Recommendations */}
        {recentRecs.length > 0 && (
          <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sun className="w-4 h-4 text-harvest" />
              {language === "bn" ? "সাম্প্রতিক পরামর্শ" : "Recent Recommendations"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentRecs.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center gap-2 bg-background/80 rounded-full px-3 py-1.5 border border-border/50"
                >
                  <Sprout className="w-3 h-3 text-leaf" />
                  <span className="text-sm font-medium text-foreground">{rec.crop_type}</span>
                  <span className="text-xs text-muted-foreground">• {formatDate(rec.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
