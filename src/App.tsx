import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ActiveChildProvider } from "@/hooks/useActiveChild";
import { GlobalAudioProvider } from "@/hooks/useGlobalAudio";
import { UserModeProvider } from "@/hooks/useUserMode";
import { useAdminSettings } from "./hooks/useAdminSettings";
import { useAppVersion } from "./hooks/useAppVersion";
import BottomNav from "./components/BottomNav";
import MiniPlayer from "./components/MiniPlayer";
import DedicationPopup from "./components/DedicationPopup";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Learn = lazy(() => import("./pages/Learn"));
const LearnDetail = lazy(() => import("./pages/LearnDetail"));
const Quran = lazy(() => import("./pages/Quran"));
const Prayers = lazy(() => import("./pages/Prayers"));
const PrayerSettings = lazy(() => import("./pages/PrayerSettings"));
const Progress = lazy(() => import("./pages/Progress"));
const Reading = lazy(() => import("./pages/Reading"));
const Juz = lazy(() => import("./pages/Juz"));
const HifzMap = lazy(() => import("./pages/HifzMap"));
const Settings = lazy(() => import("./pages/Settings"));
const ParentDashboard = lazy(() => import("./pages/ParentDashboard"));
const ChildDetail = lazy(() => import("./pages/ChildDetail"));
const ChildReport = lazy(() => import("./pages/ChildReport"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const Classrooms = lazy(() => import("./pages/Classrooms"));
const ClassroomDetail = lazy(() => import("./pages/ClassroomDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const JoinClassroom = lazy(() => import("./pages/JoinClassroom"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Announcements = lazy(() => import("./pages/Announcements"));
const FindAyahPage = lazy(() => import("./pages/FindAyahPage"));
const FamilyDashboard = lazy(() => import("./pages/FamilyDashboard"));
const PerfectLeaderboard = lazy(() => import("./pages/PerfectLeaderboard"));
const ListenTestQuiz = lazy(() => import("./pages/ListenTestQuiz"));
const Moods = lazy(() => import("./pages/Moods"));
const MoodDetail = lazy(() => import("./pages/MoodDetail"));
const MoodRead = lazy(() => import("./pages/MoodRead"));
const LiveQuran = lazy(() => import("./pages/LiveQuran"));
const Habits = lazy(() => import("./pages/Habits"));
const More = lazy(() => import("./pages/More"));
const HifzPlanPage = lazy(() => import("./pages/HifzPlanPage"));
const Study = lazy(() => import("./pages/Study"));
const Listening = lazy(() => import("./pages/Listening"));
const Noorani = lazy(() => import("./pages/Noorani"));
const NooraniLesson = lazy(() => import("./pages/NooraniLesson"));
const KidsPrayerPage = lazy(() => import("./pages/KidsPrayerPage"));
const KidsHajjUmraPage = lazy(() => import("./pages/KidsHajjUmraPage"));
const KidsMosqueMapPage = lazy(() => import("./pages/KidsMosqueMapPage"));
const KidsHomePage = lazy(() => import("./pages/KidsHomePage"));
const KidsChecklist = lazy(() => import("./pages/KidsChecklist"));
const KidsDuasPage = lazy(() => import("./pages/KidsDuasPage"));
const KidsProphetStoriesPage = lazy(() => import("./pages/KidsProphetStoriesPage"));
const KidsProphetStoryDetail = lazy(() => import("./pages/KidsProphetStoryDetail"));
const KidsQuizPage = lazy(() => import("./pages/KidsQuizPage"));
const KidsSheytanGame = lazy(() => import("./pages/KidsSheytanGame"));
const KidsMemoryCoranPage = lazy(() => import("./pages/KidsMemoryCoranPage"));
const KidsPillarQuizPage = lazy(() => import("./pages/KidsPillarQuizPage"));
const KidsPrayerMazePage = lazy(() => import("./pages/KidsPrayerMazePage"));
const KidsAsmaHuntPage = lazy(() => import("./pages/KidsAsmaHuntPage"));
const KidsProphetStoryGamePage = lazy(() => import("./pages/KidsProphetStoryGamePage"));
const KidsBalancePage = lazy(() => import("./pages/KidsBalancePage"));
const CoranCrush = lazy(() => import("./pages/CoranCrush"));
const MemoryFaithPage = lazy(() => import("./pages/MemoryFaithPage"));
const PopHassanatesPage = lazy(() => import("./pages/PopHassanatesPage"));
const TeacherDashboardPage = lazy(() => import("./pages/TeacherDashboardPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AssignmentsTutorial = lazy(() => import("./pages/AssignmentsTutorial"));
const FaqAndTermsPage = lazy(() => import("./pages/FaqAndTermsPage"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const InstallAppPage = lazy(() => import("./pages/InstallAppPage"));
const MushafPage = lazy(() => import("./pages/MushafPage"));
const QuranHub = lazy(() => import("./pages/QuranHub"));
const MaladieDetail = lazy(() => import("./pages/MaladieDetail"));
const AthkarDetail = lazy(() => import("./pages/AthkarDetail"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const CommunityDetail = lazy(() => import("./pages/CommunityDetail"));
const CommunityGroups = lazy(() => import("./pages/CommunityGroups"));
const FavoritesNotesPage = lazy(() => import("./pages/FavoritesNotesPage"));
const HifzTodayPage = lazy(() => import("./pages/HifzTodayPage"));
const JeuxKids = lazy(() => import("./pages/JeuxKids"));
const OfflineSettings = lazy(() => import("./pages/OfflineSettings"));
const CoordinatorDashboard = lazy(() => import("./pages/CoordinatorDashboard"));
const StudentStatsPage = lazy(() => import("./pages/StudentStatsPage"));
const TarteelSelector = lazy(() => import("./pages/TarteelSelector"));
const AthanSettings = lazy(() => import("./pages/AthanSettings"));
const TarteelEasyPage = lazy(() => import("./pages/tarteel-easy/TarteelEasyPage"));
const TarteelOfflinePage = lazy(() => import("./pages/tarteel-offline/TarteelOfflinePage"));
const QiblaPage = lazy(() => import("./pages/QiblaPage"));
const IslamicCalendarPage = lazy(() => import("./pages/IslamicCalendarPage"));
const MekkahLivePage = lazy(() => import("./pages/MekkahLivePage"));
const MedinaLivePage = lazy(() => import("./pages/MedinaLivePage"));
const ZakatPage = lazy(() => import("./pages/ZakatPage"));
const TasbihPage = lazy(() => import("./pages/TasbihPage"));
const LiveHaramainPage = lazy(() => import("./pages/LiveHaramainPage"));
const MyProfilePage = lazy(() => import("./pages/MyProfilePage"));
const SelectChildPage = lazy(() => import("./pages/SelectChildPage"));
const CreateChildPage = lazy(() => import("./pages/CreateChildPage"));
const ParentInvitationsPage = lazy(() => import("./pages/ParentInvitationsPage"));
const CreateChildForInvitePage = lazy(() => import("./pages/CreateChildForInvitePage"));
const KidsLeaderboardPage = lazy(() => import("./pages/KidsLeaderboardPage"));
const ChildGalleryPage = lazy(() => import("./pages/ChildGalleryPage"));
const KidsMathMenuPage = lazy(() => import("./pages/KidsMathMenuPage"));
const QuickCalcPage = lazy(() => import("./pages/QuickCalcPage"));
const CalcMergePage = lazy(() => import("./pages/CalcMergePage"));
const NumberRunnerPage = lazy(() => import("./pages/NumberRunnerPage"));
const MathShooterPage = lazy(() => import("./pages/MathShooterPage"));
const MathMemoryPage = lazy(() => import("./pages/MathMemoryPage"));
const MathBombPage = lazy(() => import("./pages/MathBombPage"));
const ArabicBubblePopPage = lazy(() => import("./pages/ArabicBubblePopPage"));
const TetrisIslamPage = lazy(() => import("./pages/TetrisIslamPage"));
const QuranWordOrderPage = lazy(() => import("./pages/QuranWordOrderPage"));
const DuaMatchPage = lazy(() => import("./pages/DuaMatchPage"));
const IslamicColorsPage = lazy(() => import("./pages/IslamicColorsPage"));
const MathRacePage = lazy(() => import("./pages/MathRacePage"));
const MathChainPage = lazy(() => import("./pages/MathChainPage"));
const MathDuelPage = lazy(() => import("./pages/MathDuelPage"));
const TVModePage = lazy(() => import("./pages/TVModePage"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}

function ConditionalDedicationPopup() {
  const { settings } = useAdminSettings();
  if (settings.hide_announcement) return null;
  return <DedicationPopup />;
}

/** Vérifie la version app et purge le cache client si nécessaire */
function AppVersionGuard() {
  useAppVersion();
  return null;
}

const MUSHAF_FULLSCREEN_ROUTES = ["/mushaf"];

function ConditionalBottomUI() {
  const location = useLocation();
  const isFullscreen = MUSHAF_FULLSCREEN_ROUTES.some((r) => location.pathname.startsWith(r));
  if (isFullscreen) return null;
  return (
    <>
      <MiniPlayer />
      <BottomNav />
    </>
  );
}


const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <ActiveChildProvider>
          <UserModeProvider>
          <AppVersionGuard />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GlobalAudioProvider>
            <ConditionalDedicationPopup />
            <div className="min-h-screen bg-background max-w-lg mx-auto relative">
              <Suspense fallback={<PageLoader />}>
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
                  <Route path="/tarteel/offline" element={<TarteelOfflinePage />} />
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
                  <Route path="/kids-math" element={<KidsMathMenuPage />} />
                  <Route path="/kids-quick-calc" element={<QuickCalcPage />} />
                  <Route path="/kids-calc-merge" element={<CalcMergePage />} />
                  <Route path="/kids-number-runner" element={<NumberRunnerPage />} />
                  <Route path="/kids-math-shooter" element={<MathShooterPage />} />
                  <Route path="/kids-math-memory" element={<MathMemoryPage />} />
                  <Route path="/kids-math-bomb" element={<MathBombPage />} />
                  <Route path="/kids-arabic-bubbles" element={<ArabicBubblePopPage />} />
                  <Route path="/kids-quran-word-order" element={<QuranWordOrderPage />} />
                  <Route path="/kids-dua-match" element={<DuaMatchPage />} />
                  <Route path="/kids-islamic-colors" element={<IslamicColorsPage />} />
                  <Route path="/kids-math-race" element={<MathRacePage />} />
                  <Route path="/kids-math-chain" element={<MathChainPage />} />
                  <Route path="/kids-math-duel" element={<MathDuelPage />} />
                  <Route path="/tetris-islam" element={<TetrisIslamPage />} />
                  <Route path="/parent-invitations" element={<ParentInvitationsPage />} />
                  <Route path="/create-child-for-invite/:inviteId" element={<CreateChildForInvitePage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <ConditionalBottomUI />
            </div>
            </GlobalAudioProvider>
          </BrowserRouter>
          </UserModeProvider>
          </ActiveChildProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
