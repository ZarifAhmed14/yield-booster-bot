import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider><BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter></AuthProvider>
    </LanguageProvider>
  );
}
