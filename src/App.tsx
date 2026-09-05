import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { DemoProvider, DemoEntry } from "@/contexts/DemoContext";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider><DemoProvider><BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<DemoEntry />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter></DemoProvider></AuthProvider>
    </LanguageProvider>
  );
}
