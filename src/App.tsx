import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Learn from "./pages/Learn";
import LearnDetail from "./pages/LearnDetail";
import Quran from "./pages/Quran";
import Prayers from "./pages/Prayers";
import PrayerSettings from "./pages/PrayerSettings";
import Progress from "./pages/Progress";
import Juz from "./pages/Juz";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import DedicationPopup from "./components/DedicationPopup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DedicationPopup />
          <div className="min-h-screen bg-background max-w-lg mx-auto relative">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/:surahNumber" element={<LearnDetail />} />
              <Route path="/quran" element={<Quran />} />
              <Route path="/recitation" element={<Quran />} />
              <Route path="/prayers" element={<Prayers />} />
              <Route path="/prayer-settings" element={<PrayerSettings />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/juz" element={<Juz />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
