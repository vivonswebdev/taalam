import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ActiveChildProvider } from "@/hooks/useActiveChild";
import { GlobalAudioProvider } from "@/hooks/useGlobalAudio";
import { UserModeProvider } from "@/hooks/useUserMode";
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
import KidsHajjUmraPage from "./pages/KidsHajjUmraPage";
import KidsMosqueMapPage from "./pages/KidsMosqueMapPage";
import KidsHomePage from "./pages/KidsHomePage";
import KidsChecklist from "./pages/KidsChecklist";
import KidsDuasPage from "./pages/KidsDuasPage";
import KidsProphetStoriesPage from "./pages/KidsProphetStoriesPage";
import KidsProphetStoryDetail from "./pages/KidsProphetStoryDetail";
import KidsQuizPage from "./pages/KidsQuizPage";
import KidsSheytanGame from "./pages/KidsSheytanGame";
import KidsMemoryCoranPage from "./pages/KidsMemoryCoranPage";
import KidsPillarQuizPage from "./pages/KidsPillarQuizPage";
import KidsPrayerMazePage from "./pages/KidsPrayerMazePage";
import KidsAsmaHuntPage from "./pages/KidsAsmaHuntPage";
import KidsProphetStoryGamePage from "./pages/KidsProphetStoryGamePage";
import KidsBalancePage from "./pages/KidsBalancePage";
import CoranCrush from "./pages/CoranCrush";
import MemoryFaithPage from "./pages/MemoryFaithPage";
import PopHassanatesPage from "./pages/PopHassanatesPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AssignmentsTutorial from "./pages/AssignmentsTutorial";
import FaqAndTermsPage from "./pages/FaqAndTermsPage";
import NotificationSettings from "./pages/NotificationSettings";
import InstallAppPage from "./pages/InstallAppPage";
import MushafPage from "./pages/MushafPage";
import QuranHub from "./pages/QuranHub";
import MaladieDetail from "./pages/MaladieDetail";
import AthkarDetail from "./pages/AthkarDetail";
import CommunityPage from "./pages/CommunityPage";
import CommunityDetail from "./pages/CommunityDetail";
import CommunityGroups from "./pages/CommunityGroups";
import FavoritesNotesPage from "./pages/FavoritesNotesPage";
import HifzTodayPage from "./pages/HifzTodayPage";
import JeuxKids from "./pages/JeuxKids";
import OfflineSettings from "./pages/OfflineSettings";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import StudentStatsPage from "./pages/StudentStatsPage";
import TarteelSelector from "./pages/TarteelSelector";
import AthanSettings from "./pages/AthanSettings";
import TarteelEasyPage from "./pages/tarteel-easy/TarteelEasyPage";
import QiblaPage from "./pages/QiblaPage";
import IslamicCalendarPage from "./pages/IslamicCalendarPage";
import MekkahLivePage from "./pages/MekkahLivePage";
import MedinaLivePage from "./pages/MedinaLivePage";
import ZakatPage from "./pages/ZakatPage";
import TasbihPage from "./pages/TasbihPage";
import LiveHaramainPage from "./pages/LiveHaramainPage";
import MyProfilePage from "./pages/MyProfilePage";
import SelectChildPage from "./pages/SelectChildPage";
import CreateChildPage from "./pages/CreateChildPage";
import ParentInvitationsPage from "./pages/ParentInvitationsPage";
import CreateChildForInvitePage from "./pages/CreateChildForInvitePage";
import KidsLeaderboardPage from "./pages/KidsLeaderboardPage";
import ChildGalleryPage from "./pages/ChildGalleryPage";
import BottomNav from "./components/BottomNav";
import MiniPlayer from "./components/MiniPlayer";
import DedicationPopup from "./components/DedicationPopup";
import { useAdminSettings } from "./hooks/useAdminSettings";

function ConditionalDedicationPopup() {
  const { settings } = useAdminSettings();
  if (settings.hide_announcement) return null;
  return <DedicationPopup />;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <ActiveChildProvider>
        <UserModeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GlobalAudioProvider>
          <ConditionalDedicationPopup />
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
              <Route path="/tarteel" element={<TarteelSelector />} />
              <Route path="/tarteel/easy" element={<TarteelEasyPage />} />
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
              <Route path="/maladies/:id" element={<MaladieDetail />} />
              <Route path="/athkar/:id" element={<AthkarDetail />} />
              <Route path="/live-quran" element={<LiveQuran />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/more" element={<More />} />
              <Route path="/hifz-plan" element={<HifzPlanPage />} />
              <Route path="/study" element={<Study />} />
              <Route path="/listening" element={<Listening />} />
              <Route path="/noorani" element={<Noorani />} />
              <Route path="/noorani/:lessonId" element={<NooraniLesson />} />
              <Route path="/kids-prayer" element={<KidsPrayerPage />} />
              <Route path="/kids-hajj" element={<KidsHajjUmraPage />} />
              <Route path="/kids-mosque-map" element={<KidsMosqueMapPage />} />
              <Route path="/kids" element={<KidsHomePage />} />
              <Route path="/kids-checklist" element={<KidsChecklist />} />
              <Route path="/kids-duas" element={<KidsDuasPage />} />
              <Route path="/kids-stories" element={<KidsProphetStoriesPage />} />
              <Route path="/kids-stories/:storyId" element={<KidsProphetStoryDetail />} />
              <Route path="/kids-quiz" element={<KidsQuizPage />} />
              <Route path="/kids-sheytan" element={<KidsSheytanGame />} />
              <Route path="/kids-memory" element={<KidsMemoryCoranPage />} />
              <Route path="/kids-pillar-quiz" element={<KidsPillarQuizPage />} />
              <Route path="/kids-prayer-maze" element={<KidsPrayerMazePage />} />
              <Route path="/kids-asma-hunt" element={<KidsAsmaHuntPage />} />
              <Route path="/kids-prophet-game" element={<KidsProphetStoryGamePage />} />
              <Route path="/kids-balance" element={<KidsBalancePage />} />
              <Route path="/crush" element={<CoranCrush />} />
              <Route path="/kids-memory-faith" element={<MemoryFaithPage />} />
              <Route path="/kids-pop-hassanates" element={<PopHassanatesPage />} />
              <Route path="/teacher-dashboard" element={<TeacherDashboardPage />} />
              <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
              <Route path="/assignments-tutorial" element={<AssignmentsTutorial />} />
              <Route path="/faq" element={<FaqAndTermsPage />} />
              <Route path="/notification-settings" element={<NotificationSettings />} />
              <Route path="/install-app" element={<InstallAppPage />} />
              <Route path="/mushaf" element={<MushafPage />} />
              <Route path="/quran-hub" element={<QuranHub />} />
              <Route path="/groups" element={<CommunityGroups />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/community/:id" element={<CommunityDetail />} />
              <Route path="/favorites-notes" element={<FavoritesNotesPage />} />
              <Route path="/hifz-today" element={<HifzTodayPage />} />
              <Route path="/offline-settings" element={<OfflineSettings />} />
              <Route path="/jeux" element={<JeuxKids />} />
              <Route path="/coord" element={<CoordinatorDashboard />} />
              <Route path="/student-stats/:classId/:studentId" element={<StudentStatsPage />} />
              <Route path="/athan-settings" element={<AthanSettings />} />
              <Route path="/qibla" element={<QiblaPage />} />
              <Route path="/islamic-calendar" element={<IslamicCalendarPage />} />
              <Route path="/mekkah-live" element={<MekkahLivePage />} />
              <Route path="/medina-live" element={<MedinaLivePage />} />
              <Route path="/zakat" element={<ZakatPage />} />
              <Route path="/tasbih" element={<TasbihPage />} />
              <Route path="/live-haramain" element={<LiveHaramainPage />} />
              <Route path="/profile" element={<MyProfilePage />} />
              <Route path="/select-child" element={<SelectChildPage />} />
              <Route path="/create-child" element={<CreateChildPage />} />
              <Route path="/kids-leaderboard" element={<KidsLeaderboardPage />} />
              <Route path="/child-gallery" element={<ChildGalleryPage />} />
              <Route path="/parent-invitations" element={<ParentInvitationsPage />} />
              <Route path="/create-child-for-invite/:inviteId" element={<CreateChildForInvitePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MiniPlayer />
            <BottomNav />
          </div>
          </GlobalAudioProvider>
        </BrowserRouter>
        </UserModeProvider>
        </ActiveChildProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
