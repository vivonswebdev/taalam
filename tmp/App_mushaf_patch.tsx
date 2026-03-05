// ═══════════════════════════════════════════════════════════════════════
// App.tsx — PATCH UNIQUE
// Cacher BottomNav et MiniPlayer sur les routes Mushaf
// (et toutes les autres routes "full screen" si vous en avez)
// ═══════════════════════════════════════════════════════════════════════

// Dans votre App.tsx, remplacez :
//
//   <MiniPlayer />
//   <BottomNav />
//
// par le bloc ci-dessous.
// Tout le reste de App.tsx reste IDENTIQUE.

import { useLocation } from "react-router-dom";

// Routes qui doivent cacher la BottomNav et le MiniPlayer
// (pages full-screen qui gèrent leur propre navigation)
const FULLSCREEN_ROUTES = [
  "/mushaf",
  // Ajoutez ici d'autres routes full-screen si besoin :
  // "/find-ayah",
  // "/kids-sheytan",
];

function ConditionalBottomUI() {
  const location = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.some((r) =>
    location.pathname.startsWith(r)
  );
  if (isFullscreen) return null;
  return (
    <>
      <MiniPlayer />
      <BottomNav />
    </>
  );
}

// ── Dans le JSX de App (dans <GlobalAudioProvider>) ──
// Remplacez les deux lignes :
//   <MiniPlayer />
//   <BottomNav />
// par :
//   <ConditionalBottomUI />
//
// Exemple de rendu final :
//
//   <div className="min-h-screen bg-background max-w-lg mx-auto relative">
//     <Suspense fallback={<PageLoader />}>
//       <Routes>
//         ...vos routes...
//       </Routes>
//     </Suspense>
//     <ConditionalBottomUI />    ← remplace MiniPlayer + BottomNav
//   </div>

