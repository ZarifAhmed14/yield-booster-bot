import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sprout, Mail, Lock, User } from "lucide-react";
import { z } from "zod";
import LanguageModal from "@/components/LanguageModal";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error(t("auth.invalidCredentials"));
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success(t("auth.loginSuccess"));
        navigate("/");
      }
    } else {
      if (!farmerName.trim()) {
        toast.error(t("auth.nameRequired"));
        setLoading(false);
        return;
      }
      
      const { error } = await signUp(email, password, farmerName);
      if (error) {
        if (error.message.includes("already registered")) {
          toast.error(t("auth.alreadyRegistered"));
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success(t("auth.signupSuccess"));
        navigate("/");
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-leaf/10 via-background to-water/10 p-4">
      <LanguageModal />
      <Card className="w-full max-w-md border-4 border-leaf/30">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-leaf/20 rounded-full flex items-center justify-center">
            <Sprout className="w-10 h-10 text-leaf" />
          </div>
          <CardTitle className="text-3xl font-black text-leaf">
            🌾 KrishiMitra
          </CardTitle>
          <CardDescription className="text-lg">
            {isLogin ? t("auth.loginTitle") : t("auth.signupTitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="farmerName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t("auth.farmerName")}
                </Label>
                <Input
                  id="farmerName"
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder={t("auth.farmerNamePlaceholder")}
                  className="border-2"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t("auth.email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                className="border-2"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {t("auth.password")}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
                className="border-2"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-leaf hover:bg-leaf/90 text-xl py-6"
              disabled={loading}
            >
              {loading ? "..." : isLogin ? t("auth.login") : t("auth.signup")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-leaf hover:underline font-medium"
            >
              {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
