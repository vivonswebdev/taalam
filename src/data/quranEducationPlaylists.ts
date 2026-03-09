export interface QuranVideo {
  id: string;
  youtubeId: string;
  title: string;
  titleAr?: string;
  description: string;
  duration: string;
  language: "fr" | "ar" | "en" | "nl" | "tr" | "ur";
  category: "tajweed" | "tafsir" | "memorization" | "history" | "kids" | "general";
  channel: string;
  level: "beginner" | "intermediate" | "advanced";
}

export interface QuranPlaylist {
  id: string;
  youtubePlaylistId: string;
  title: string;
  description: string;
  language: "fr" | "ar" | "en" | "nl" | "tr" | "ur";
  category: "tajweed" | "tafsir" | "memorization" | "history" | "kids" | "general";
  channel: string;
  thumbnail: string;
  videoCount: number;
  level: "beginner" | "intermediate" | "advanced";
}

export const QURAN_PLAYLISTS: QuranPlaylist[] = [
  // 🇫🇷 FRANÇAIS
  {
    id: "fr-tajweed-1",
    youtubePlaylistId: "PLUOnMO11DLcgVnWNER3Kc-sAE_eOfxinb",
    title: "Apprendre le Tajweed en Français",
    description: "Cours complet de Tajweed pour francophones débutants",
    language: "fr",
    category: "tajweed",
    channel: "Islam & Coran",
    thumbnail: "https://img.youtube.com/vi/gFZQwfA0pKE/hqdefault.jpg",
    videoCount: 30,
    level: "beginner",
  },
  {
    id: "fr-tafsir-1",
    youtubePlaylistId: "PLBDYBNhCRWGSouXKhvs7e9rQ6Rg9Dmabm",
    title: "Tafsir du Coran en Français",
    description: "Explication et commentaire du Coran verset par verset",
    language: "fr",
    category: "tafsir",
    channel: "Cheikh Raslan FR",
    thumbnail: "https://img.youtube.com/vi/QHaVIBYYzfM/hqdefault.jpg",
    videoCount: 50,
    level: "intermediate",
  },
  {
    id: "fr-memorization-1",
    youtubePlaylistId: "PLnVD9Tho8RKCm3-hsTfDLc5Bm5LOdnlBd",
    title: "Mémorisation Coran Débutant",
    description: "Méthode complète pour mémoriser le Coran en français",
    language: "fr",
    category: "memorization",
    channel: "Quran Academy FR",
    thumbnail: "https://img.youtube.com/vi/PBkMqwl0y3o/hqdefault.jpg",
    videoCount: 40,
    level: "beginner",
  },
  {
    id: "fr-kids-1",
    youtubePlaylistId: "PLnVD9Tho8RKBz1gYumK1JBgXBfPVR3V3F",
    title: "Coran pour Enfants",
    description: "Apprentissage du Coran adapté aux enfants francophones",
    language: "fr",
    category: "kids",
    channel: "Muslim Kids FR",
    thumbnail: "https://img.youtube.com/vi/Kh7kEMzEzME/hqdefault.jpg",
    videoCount: 25,
    level: "beginner",
  },

  // 🇸🇦 ARABE
  {
    id: "ar-tajweed-1",
    youtubePlaylistId: "PLgomzj4QhPXi0Z0v8MMQV2VWQ6BRhRsB7",
    title: "أحكام التجويد الميسرة",
    description: "شرح مبسط لأحكام تجويد القرآن الكريم",
    language: "ar",
    category: "tajweed",
    channel: "القرآن الكريم",
    thumbnail: "https://img.youtube.com/vi/2Lq1WM4i2Ko/hqdefault.jpg",
    videoCount: 45,
    level: "beginner",
  },
  {
    id: "ar-tafsir-1",
    youtubePlaylistId: "PLmZdH2MyNLFC9f6mQCeFgI4tJF8pnqMDP",
    title: "تفسير القرآن الكريم",
    description: "تفسير شامل لكتاب الله عز وجل",
    language: "ar",
    category: "tafsir",
    channel: "الشيخ محمد راتب النابلسي",
    thumbnail: "https://img.youtube.com/vi/9L5G6KYyFoY/hqdefault.jpg",
    videoCount: 100,
    level: "advanced",
  },

  // 🇬🇧 ANGLAIS
  {
    id: "en-tajweed-1",
    youtubePlaylistId: "PLBDYBNhCRWGSfwQiAnkqmQ3ELlFR-Yd7Y",
    title: "Tajweed Rules in English",
    description: "Complete Tajweed course for English speakers",
    language: "en",
    category: "tajweed",
    channel: "Quran Revolution",
    thumbnail: "https://img.youtube.com/vi/SJsj4oHCXBE/hqdefault.jpg",
    videoCount: 35,
    level: "beginner",
  },
  {
    id: "en-tafsir-1",
    youtubePlaylistId: "PLnVD9Tho8RKCFPtT2HFgRKTRwzQaAqJqE",
    title: "Quran Tafsir in English",
    description: "Verse by verse explanation of the Holy Quran",
    language: "en",
    category: "tafsir",
    channel: "Nouman Ali Khan",
    thumbnail: "https://img.youtube.com/vi/EVJBzqTirq4/hqdefault.jpg",
    videoCount: 200,
    level: "intermediate",
  },

  // 🇳🇱 NÉERLANDAIS
  {
    id: "nl-general-1",
    youtubePlaylistId: "PLBDYBNhCRWGSNL123456789",
    title: "Koran Leren in het Nederlands",
    description: "Koranonderwijs voor Nederlandstaligen",
    language: "nl",
    category: "general",
    channel: "Islam NL",
    thumbnail: "https://img.youtube.com/vi/default/hqdefault.jpg",
    videoCount: 20,
    level: "beginner",
  },

  // 🇹🇷 TURC
  {
    id: "tr-tajweed-1",
    youtubePlaylistId: "PLBDYBNhCRWGSTR123456789",
    title: "Kuran Öğreniyorum - Tecvid",
    description: "Tecvid kuralları Türkçe anlatım",
    language: "tr",
    category: "tajweed",
    channel: "Kuran TR",
    thumbnail: "https://img.youtube.com/vi/default/hqdefault.jpg",
    videoCount: 30,
    level: "beginner",
  },

  // 🇵🇰 OURDOU
  {
    id: "ur-tafsir-1",
    youtubePlaylistId: "PLBDYBNhCRWGSUR123456789",
    title: "قرآن کی تفسیر اردو میں",
    description: "اردو زبان میں قرآن کریم کی مکمل تفسیر",
    language: "ur",
    category: "tafsir",
    channel: "Quran Urdu",
    thumbnail: "https://img.youtube.com/vi/default/hqdefault.jpg",
    videoCount: 60,
    level: "intermediate",
  },
];

export const PLAYLIST_LANGUAGE_CONFIG: Record<string, { label: string; flag: string; nativeName: string }> = {
  fr: { label: "Français", flag: "🇫🇷", nativeName: "Français" },
  ar: { label: "Arabe", flag: "🇸🇦", nativeName: "العربية" },
  en: { label: "Anglais", flag: "🇬🇧", nativeName: "English" },
  nl: { label: "Néerlandais", flag: "🇳🇱", nativeName: "Nederlands" },
  tr: { label: "Turc", flag: "🇹🇷", nativeName: "Türkçe" },
  ur: { label: "Ourdou", flag: "🇵🇰", nativeName: "اردو" },
};

export type PlaylistCategory = "tajweed" | "tafsir" | "memorization" | "history" | "kids" | "general";
