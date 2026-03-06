import { useEffect } from "react";
import {
  APP_VERSION,
  VERSION_STORAGE_KEY,
  RESET_KEYS,
  RESET_COOKIES,
} from "@/config/versioning";

/**
 * Hook de migration de version côté client.
 *
 * À chaque montage de l'app :
 * 1. Compare la version stockée à APP_VERSION.
 * 2. Si différente → purge les clés obsolètes, expire les cookies,
 *    vide les caches PWA, enregistre la nouvelle version, et reload.
 * 3. Ne touche JAMAIS aux clés Supabase Auth (sb-*).
 */
export function useAppVersion() {
  useEffect(() => {
    const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);

    // Même version → rien à faire
    if (storedVersion === APP_VERSION) return;

    const oldVersion = storedVersion ?? "(aucune)";

    console.info(
      `[Taalam] Migrating app version ${oldVersion} -> ${APP_VERSION}`
    );

    // 1. Supprimer les clés localStorage obsolètes
    for (const key of RESET_KEYS) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Silently ignore
      }
    }

    // 2. Expirer les cookies front
    for (const cookie of RESET_COOKIES) {
      try {
        document.cookie = `${cookie}=; Max-Age=0; path=/`;
      } catch {
        // Silently ignore
      }
    }

    // 3. Purger les caches PWA obsolètes
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      }).catch(() => {});
    }

    // 4. Enregistrer la nouvelle version AVANT le reload
    localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);

    // 5. Reload propre (une seule fois grâce à l'écriture ci-dessus)
    window.location.reload();
  }, []);
}
