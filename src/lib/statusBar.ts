import { Capacitor } from "@capacitor/core";

/**
 * Configure la StatusBar pour les apps natives (iOS/Android).
 * - Style sombre (texte foncé sur fond clair)
 * - Non-overlay : le contenu ne passe pas derrière la barre d'état
 */
export async function configureStatusBar() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");

    // Texte foncé sur fond clair
    await StatusBar.setStyle({ style: Style.Light });

    // Ne pas superposer le contenu derrière la barre d'état
    await StatusBar.setOverlaysWebView({ overlay: false });

    // Couleur de fond cohérente avec le thème
    await StatusBar.setBackgroundColor({ color: "#f5f0e8" });
  } catch (e) {
    console.warn("[StatusBar] Configuration failed:", e);
  }
}
