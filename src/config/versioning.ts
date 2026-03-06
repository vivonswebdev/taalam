/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  Taaloum – App Versioning & Client Reset Config     ║
 * ╠══════════════════════════════════════════════════════╣
 * ║  Incrémente APP_VERSION pour forcer un reset client ║
 * ║  des clés listées dans RESET_KEYS.                  ║
 * ╚══════════════════════════════════════════════════════╝
 */

/** Version courante de l'app – synced with vite.config.ts */
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : "2.1.0";

/** Clé localStorage qui stocke la version côté client */
export const VERSION_STORAGE_KEY = "app_version";

/**
 * Clés localStorage à supprimer lors d'une migration de version.
 * ⚠️  NE PAS ajouter de clés Supabase Auth ici (sb-*).
 */
export const RESET_KEYS: string[] = [
  // Mushaf / lecture
  "mushaf_reading_style",
  "mushaf_theme",
  "mushaf_last_page",
  "quranEasyReadingSettings",
  // Tarteel
  "quranEasyLastSurah",
  "tarteel_voice_profile",
  // Kids
  "kids_hifz_boost",
  "kids_stickers",
  // Ancien mode / settings
  "taaloum_user_mode",
  "taaloum_age_group",
  // Dédicace / popups
  "dedication_popup_seen",
  // Offline moods
  "offline_mood_presets",
];

/**
 * Cookies front à expirer lors d'une migration.
 */
export const RESET_COOKIES: string[] = [
  "taalam_prefs",
];

/**
 * Nom du cache Service Worker.
 */
export const SW_CACHE_NAME = "taalam-v3";
