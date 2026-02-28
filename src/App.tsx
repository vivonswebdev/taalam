import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ActiveChildProvider } from "@/hooks/useActiveChild";
import { GlobalAudioProvider } from "@/hooks/useGlobalAudio";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Learn from "./pages/Learn";
import LearnDetail from "./pages/LearnDetail";
import Quran from "./pages/Quran";
import Prayers from "./pages/Prayers";
import PrayerSettings from "./pages/PrayerSettings";
import Progress from "./pages/Progress";
import Reading from "./pages/Reading";
import Juz from "./pages/Juz";
import HifzMap from "./pages/HifzMap";
import Settings from "./pages/Settings";
import ParentDashboard from "./pages/ParentDashboard";
import ChildDetail from "./pages/ChildDetail";
import ChildReport from "./pages/ChildReport";
import Bookmarks from "./pages/Bookmarks";
import Classrooms from "./pages/Classrooms";
import ClassroomDetail from "./pages/ClassroomDetail";
import NotFound from "./pages/NotFound";
import JoinClassroom from "./pages/JoinClassroom";
import Auth from "./pages/Auth";
import Leaderboard from "./pages/Leaderboard";
import Announcements from "./pages/Announcements";
import FindAyahPage from "./pages/FindAyahPage";
import FamilyDashboard from "./pages/FamilyDashboard";
import PerfectLeaderboard from "./pages/PerfectLeaderboard";
import ListenTestQuiz from "./pages/ListenTestQuiz";
import Moods from "./pages/Moods";
import MoodDetail from "./pages/MoodDetail";
import MoodRead from "./pages/MoodRead";
import LiveQuran from "./pages/LiveQuran";
import Habits from "./pages/Habits";
import More from "./pages/More";
import HifzPlanPage from "./pages/HifzPlanPage";
import Study from "./pages/Study";
import Listening from "./pages/Listening";
import Noorani from "./pages/Noorani";
import NooraniLesson from "./pages/NooraniLesson";
import KidsPrayerPage from "./pages/KidsPrayerPage";
import BottomNav from "./components/BottomNav";
import MiniPlayer from "./components/MiniPlayer";
import DedicationPopup from "./components/DedicationPopup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <ActiveChildProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GlobalAudioProvider>
          <DedicationPopup />
          <div className="min-h-screen bg-background max-w-lg mx-auto relative">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/:surahNumber" element={<LearnDetail />} />
              <Route path="/quran" element={<Quran />} />
              <Route path="/recitation" element={<Quran />} />
              <Route path="/reading" element={<Reading />} />
              <Route path="/prayers" element={<Prayers />} />
              <Route path="/prayer-settings" element={<PrayerSettings />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/juz" element={<Juz />} />
              <Route path="/hifz-map" element={<HifzMap />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/classrooms" element={<Classrooms />} />
              <Route path="/classrooms/:classId" element={<ClassroomDetail />} />
              <Route path="/parent/child/:childId" element={<ChildDetail />} />
              <Route path="/parent/child/:childId/report" element={<ChildReport />} />
              <Route path="/join/:code" element={<JoinClassroom />} />
              <Route path="/find-ayah" element={<FindAyahPage />} />
              <Route path="/family" element={<FamilyDashboard />} />
              <Route path="/perfect-leaderboard" element={<PerfectLeaderboard />} />
              <Route path="/listen-test" element={<ListenTestQuiz />} />
              <Route path="/moods" element={<Moods />} />
              <Route path="/moods/:id" element={<MoodDetail />} />
              <Route path="/moods/:id/read" element={<MoodRead />} />
              <Route path="/live-quran" element={<LiveQuran />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/more" element={<More />} />
              <Route path="/hifz-plan" element={<HifzPlanPage />} />
              <Route path="/study" element={<Study />} />
              <Route path="/listening" element={<Listening />} />
              <Route path="/noorani" element={<Noorani />} />
              <Route path="/noorani/:lessonId" element={<NooraniLesson />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MiniPlayer />
            <BottomNav />
          </div>
          </GlobalAudioProvider>
        </BrowserRouter>
        </ActiveChildProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
