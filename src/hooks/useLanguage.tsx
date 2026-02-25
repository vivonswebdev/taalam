import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";

export type Lang = "fr" | "en" | "nl" | "ar";

export const LANGUAGES: { code: Lang; label: string; flag: string; dir: "ltr" | "rtl" }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱", dir: "ltr" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" },
];

// Translation API identifiers for AlQuran Cloud
export const QURAN_TRANSLATION_IDS: Record<Lang, string> = {
  fr: "fr.hamidullah",
  en: "en.asad",
  nl: "nl.siregar",
  ar: "ar.alafasy", // Arabic uses original text
};

const LANG_KEY = "quranEasyLang";

function detectBrowserLang(): Lang {
  try {
    const nav = navigator.language?.toLowerCase() || "";
    if (nav.startsWith("fr")) return "fr";
    if (nav.startsWith("nl")) return "nl";
    if (nav.startsWith("ar")) return "ar";
    return "en";
  } catch {
    return "fr";
  }
}

function loadLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY) as Lang;
    if (stored && ["fr", "en", "nl", "ar"].includes(stored)) return stored;
  } catch {}
  return detectBrowserLang();
}

// ─── Translations ───────────────────────────────────────────
const translations = {
  // Home
  "home.subtitle": {
    fr: "Apprenez le Coran facilement, pas à pas",
    en: "Learn the Quran easily, step by step",
    nl: "Leer de Koran eenvoudig, stap voor stap",
    ar: "تعلّم القرآن بسهولة، خطوة بخطوة",
  },
  "home.progress": {
    fr: "Votre progression", en: "Your progress", nl: "Je voortgang", ar: "تقدّمك",
  },
  "home.level.none": {
    fr: "Pas encore de niveau", en: "No level yet", nl: "Nog geen niveau", ar: "لا مستوى بعد",
  },
  "home.level": {
    fr: "Niveau", en: "Level", nl: "Niveau", ar: "المستوى",
  },
  "home.level.easy": {
    fr: "Débutant", en: "Beginner", nl: "Beginner", ar: "مبتدئ",
  },
  "home.level.medium": {
    fr: "Intermédiaire", en: "Intermediate", nl: "Gevorderd", ar: "متوسط",
  },
  "home.level.hard": {
    fr: "Avancé", en: "Advanced", nl: "Expert", ar: "متقدم",
  },
  "home.mastered": {
    fr: "sourates maîtrisées", en: "surahs mastered", nl: "soera's beheerst", ar: "سور متقنة",
  },
  "home.startQuiz": {
    fr: "Commencer le Quiz Niveau", en: "Start Level Quiz", nl: "Start Niveau Quiz", ar: "ابدأ اختبار المستوى",
  },
  "home.continue": {
    fr: "Continuer l'apprentissage", en: "Continue learning", nl: "Doorgaan met leren", ar: "واصل التعلم",
  },
  "home.retakeQuiz": {
    fr: "Refaire le quiz", en: "Retake quiz", nl: "Quiz opnieuw", ar: "إعادة الاختبار",
  },
  "home.myProgress": {
    fr: "Ma progression", en: "My progress", nl: "Mijn voortgang", ar: "تقدّمي",
  },

  // Learn
  "learn.title": {
    fr: "Apprendre", en: "Learn", nl: "Leren", ar: "تعلّم",
  },
  "learn.surahs": {
    fr: "sourates", en: "surahs", nl: "soera's", ar: "سور",
  },
  "learn.determineLevel": {
    fr: "Déterminez votre niveau", en: "Determine your level", nl: "Bepaal je niveau", ar: "حدّد مستواك",
  },
  "learn.takeQuiz": {
    fr: "Passez le quiz pour débloquer les sourates adaptées",
    en: "Take the quiz to unlock suitable surahs",
    nl: "Doe de quiz om geschikte soera's te ontgrendelen",
    ar: "قم بالاختبار لفتح السور المناسبة",
  },
  "learn.startQuiz": {
    fr: "Passer le quiz", en: "Take the quiz", nl: "Doe de quiz", ar: "ابدأ الاختبار",
  },

  // Learn Detail
  "detail.back": {
    fr: "Retour", en: "Back", nl: "Terug", ar: "رجوع",
  },
  "detail.verses": {
    fr: "versets", en: "verses", nl: "verzen", ar: "آيات",
  },
  "detail.surah": {
    fr: "Sourate n°", en: "Surah no.", nl: "Soera nr.", ar: "سورة رقم",
  },
  "detail.step1": {
    fr: "Étape 1 : Écoutez la récitation", en: "Step 1: Listen to recitation", nl: "Stap 1: Luister naar recitatie", ar: "الخطوة 1: استمع للتلاوة",
  },
  "detail.step2": {
    fr: "Étape 2 : Récitez le verset", en: "Step 2: Recite the verse", nl: "Stap 2: Reciteer het vers", ar: "الخطوة 2: اتلُ الآية",
  },
  "detail.step3": {
    fr: "Étape 3 : Résultats", en: "Step 3: Results", nl: "Stap 3: Resultaten", ar: "الخطوة 3: النتائج",
  },
  "detail.skipToRecitation": {
    fr: "Passer à la récitation →", en: "Skip to recitation →", nl: "Ga naar recitatie →", ar: "→ انتقل للتلاوة",
  },
  "detail.reciteNow": {
    fr: "Récitez maintenant... Appuyez pour arrêter", en: "Recite now... Tap to stop", nl: "Reciteer nu... Tik om te stoppen", ar: "اتلُ الآن... اضغط للإيقاف",
  },
  "detail.tapToStart": {
    fr: "Appuyez pour commencer", en: "Tap to start", nl: "Tik om te starten", ar: "اضغط للبدء",
  },
  "detail.yourRecitation": {
    fr: "Votre récitation :", en: "Your recitation:", nl: "Jouw recitatie:", ar: "تلاوتك:",
  },
  "detail.validate": {
    fr: "Valider le verset", en: "Validate verse", nl: "Vers valideren", ar: "تأكيد الآية",
  },
  "detail.skipVerse": {
    fr: "Passer ce verset", en: "Skip this verse", nl: "Sla dit vers over", ar: "تخطي هذه الآية",
  },
  "detail.verse": {
    fr: "Verset", en: "Verse", nl: "Vers", ar: "آية",
  },
  "detail.repeat": {
    fr: "Répéter", en: "Repeat", nl: "Herhalen", ar: "إعادة",
  },
  "detail.nextSurah": {
    fr: "Sourate suivante", en: "Next surah", nl: "Volgende soera", ar: "السورة التالية",
  },
  "detail.excellent": {
    fr: "Excellent ! 🌟", en: "Excellent! 🌟", nl: "Uitstekend! 🌟", ar: "ممتاز! 🌟",
  },
  "detail.good": {
    fr: "Bien ! Continuez 💪", en: "Good! Keep going 💪", nl: "Goed! Ga zo door 💪", ar: "جيد! واصل 💪",
  },
  "detail.tryAgain": {
    fr: "Réessayez 📖", en: "Try again 📖", nl: "Probeer opnieuw 📖", ar: "حاول مرة أخرى 📖",
  },
  "detail.mastered": {
    fr: "Vous maîtrisez cette sourate !", en: "You've mastered this surah!", nl: "Je beheerst deze soera!", ar: "لقد أتقنت هذه السورة!",
  },
  "detail.listenAgain": {
    fr: "Réécoutez et réessayez les versets en rouge", en: "Re-listen and retry the red verses", nl: "Luister opnieuw en probeer de rode verzen opnieuw", ar: "أعد الاستماع وحاول الآيات الحمراء مرة أخرى",
  },
  "detail.voiceNotSupported": {
    fr: "La reconnaissance vocale n'est pas supportée par votre navigateur. Utilisez Chrome pour une meilleure expérience.",
    en: "Voice recognition is not supported by your browser. Use Chrome for a better experience.",
    nl: "Spraakherkenning wordt niet ondersteund door je browser. Gebruik Chrome voor een betere ervaring.",
    ar: "التعرف على الصوت غير مدعوم في متصفحك. استخدم Chrome للحصول على تجربة أفضل.",
  },
  "detail.childMode": {
    fr: "🧒 Mode Enfant activé", en: "🧒 Child Mode enabled", nl: "🧒 Kindermodus ingeschakeld", ar: "🧒 وضع الأطفال مفعّل",
  },

  // Recitation
  "recitation.title": {
    fr: "Récitation Tarteel", en: "Tarteel Recitation", nl: "Tarteel Recitatie", ar: "تلاوة ترتيل",
  },
  "recitation.subtitle": {
    fr: "Écoute, mémorise, récite", en: "Listen, memorize, recite", nl: "Luister, onthoud, reciteer", ar: "استمع، احفظ، اتلُ",
  },
  "recitation.streak": {
    fr: "de suite", en: "streak", nl: "op rij", ar: "متتالية",
  },
  "recitation.startStreak": {
    fr: "Commence ton streak !", en: "Start your streak!", nl: "Begin je reeks!", ar: "ابدأ سلسلتك!",
  },
  "recitation.daysStreak": {
    fr: "jour(s) de suite !", en: "day(s) streak!", nl: "dag(en) op rij!", ar: "يوم/أيام متتالية!",
  },
  "recitation.record": {
    fr: "Record", en: "Record", nl: "Record", ar: "رقم قياسي",
  },
  "recitation.days": {
    fr: "jours", en: "days", nl: "dagen", ar: "أيام",
  },
  "recitation.sessions": {
    fr: "sessions", en: "sessions", nl: "sessies", ar: "جلسات",
  },
  "recitation.practicedToday": {
    fr: "✅ Tu as pratiqué aujourd'hui !", en: "✅ You practiced today!", nl: "✅ Je hebt vandaag geoefend!", ar: "✅ لقد تدربت اليوم!",
  },
  "recitation.difficulty": {
    fr: "Niveau de difficulté", en: "Difficulty level", nl: "Moeilijkheidsgraad", ar: "مستوى الصعوبة",
  },
  "recitation.easy": {
    fr: "Facile", en: "Easy", nl: "Makkelijk", ar: "سهل",
  },
  "recitation.medium": {
    fr: "Moyen", en: "Medium", nl: "Gemiddeld", ar: "متوسط",
  },
  "recitation.hard": {
    fr: "Difficile", en: "Hard", nl: "Moeilijk", ar: "صعب",
  },
  "recitation.chooseSurah": {
    fr: "Choisis une sourate", en: "Choose a surah", nl: "Kies een soera", ar: "اختر سورة",
  },
  "recitation.selectSurah": {
    fr: "Sélectionner une sourate...", en: "Select a surah...", nl: "Selecteer een soera...", ar: "...اختر سورة",
  },
  "recitation.textMasked": {
    fr: "Texte masqué — mémorise bien !", en: "Text hidden — memorize well!", nl: "Tekst verborgen — onthoud goed!", ar: "النص مخفي — احفظ جيدًا!",
  },
  "recitation.skipToRecitation": {
    fr: "Passer à la récitation →", en: "Skip to recitation →", nl: "Ga naar recitatie →", ar: "→ انتقل للتلاوة",
  },
  "recitation.restart": {
    fr: "Recommencer", en: "Restart", nl: "Opnieuw", ar: "إعادة",
  },
  "recitation.changeSurah": {
    fr: "Changer de sourate", en: "Change surah", nl: "Andere soera", ar: "تغيير السورة",
  },
  "recitation.hafiz": {
    fr: "Hâfiz en herbe", en: "Budding Hafiz", nl: "Aankomend Hafiz", ar: "حافظ ناشئ",
  },
  "recitation.daysOfStreak": {
    fr: "jour(s) de streak", en: "day(s) streak", nl: "dag(en) reeks", ar: "يوم/أيام سلسلة",
  },

  // Progress
  "progress.title": {
    fr: "Progression", en: "Progress", nl: "Voortgang", ar: "التقدم",
  },
  "progress.mastered": {
    fr: "Maîtrisées", en: "Mastered", nl: "Beheerst", ar: "متقنة",
  },
  "progress.attempts": {
    fr: "Tentatives", en: "Attempts", nl: "Pogingen", ar: "محاولات",
  },
  "progress.studied": {
    fr: "Étudiées", en: "Studied", nl: "Bestudeerd", ar: "مدروسة",
  },
  "progress.scores": {
    fr: "Scores par sourate", en: "Scores by surah", nl: "Scores per soera", ar: "النتائج حسب السورة",
  },
  "progress.stickers": {
    fr: "🎁 Ma collection de stickers", en: "🎁 My sticker collection", nl: "🎁 Mijn stickerverzameling", ar: "🎁 مجموعة الملصقات",
  },
  "progress.details": {
    fr: "Détails", en: "Details", nl: "Details", ar: "التفاصيل",
  },
  "progress.noSurahs": {
    fr: "Aucune sourate étudiée pour le moment", en: "No surahs studied yet", nl: "Nog geen soera's bestudeerd", ar: "لم تتم دراسة أي سورة بعد",
  },

  // Settings
  "settings.title": {
    fr: "Réglages", en: "Settings", nl: "Instellingen", ar: "الإعدادات",
  },
  "settings.childMode": {
    fr: "Mode Enfant", en: "Child Mode", nl: "Kindermodus", ar: "وضع الأطفال",
  },
  "settings.childModeDesc": {
    fr: "Texte plus gros, stickers et confettis", en: "Bigger text, stickers and confetti", nl: "Grotere tekst, stickers en confetti", ar: "نص أكبر، ملصقات وقصاصات ورقية",
  },
  "settings.language": {
    fr: "Langue", en: "Language", nl: "Taal", ar: "اللغة",
  },
  "settings.reset": {
    fr: "Réinitialiser la progression", en: "Reset progress", nl: "Voortgang resetten", ar: "إعادة تعيين التقدم",
  },
  "settings.resetDesc": {
    fr: "Remet tout à zéro", en: "Reset everything", nl: "Alles resetten", ar: "إعادة تعيين كل شيء",
  },
  "settings.version": {
    fr: "Apprendre le Coran facilement", en: "Learn the Quran easily", nl: "Leer de Koran eenvoudig", ar: "تعلّم القرآن بسهولة",
  },
  "settings.confirmTitle": {
    fr: "Confirmer", en: "Confirm", nl: "Bevestigen", ar: "تأكيد",
  },
  "settings.confirmMessage": {
    fr: "Toute votre progression sera perdue. Voulez-vous continuer ?",
    en: "All your progress will be lost. Do you want to continue?",
    nl: "Al je voortgang gaat verloren. Wil je doorgaan?",
    ar: "سيتم فقدان كل تقدمك. هل تريد المتابعة؟",
  },
  "settings.cancel": {
    fr: "Annuler", en: "Cancel", nl: "Annuleren", ar: "إلغاء",
  },
  "settings.confirmReset": {
    fr: "Réinitialiser", en: "Reset", nl: "Resetten", ar: "إعادة تعيين",
  },

  // Quiz
  "quiz.back": {
    fr: "Retour", en: "Back", nl: "Terug", ar: "رجوع",
  },
  "quiz.question": {
    fr: "Question", en: "Question", nl: "Vraag", ar: "سؤال",
  },
  "quiz.bravo": {
    fr: "Bravo !", en: "Well done!", nl: "Goed gedaan!", ar: "أحسنت!",
  },
  "quiz.score": {
    fr: "Score", en: "Score", nl: "Score", ar: "النتيجة",
  },
  "quiz.levelLabel": {
    fr: "Niveau", en: "Level", nl: "Niveau", ar: "المستوى",
  },
  "quiz.startLearning": {
    fr: "Commencer l'apprentissage", en: "Start learning", nl: "Begin met leren", ar: "ابدأ التعلم",
  },

  // Bottom Nav
  "nav.home": {
    fr: "Accueil", en: "Home", nl: "Home", ar: "الرئيسية",
  },
  "nav.learn": {
    fr: "Apprendre", en: "Learn", nl: "Leren", ar: "تعلّم",
  },
  "nav.recitation": {
    fr: "Récitation", en: "Recitation", nl: "Recitatie", ar: "تلاوة",
  },
  "nav.progress": {
    fr: "Progrès", en: "Progress", nl: "Voortgang", ar: "التقدم",
  },
  "nav.settings": {
    fr: "Réglages", en: "Settings", nl: "Instellingen", ar: "الإعدادات",
  },

  // Audio player
  "audio.loading": {
    fr: "Chargement...", en: "Loading...", nl: "Laden...", ar: "...جاري التحميل",
  },
  "audio.listen": {
    fr: "Écouter la sourate", en: "Listen to surah", nl: "Luister naar soera", ar: "استمع للسورة",
  },
  "audio.stop": {
    fr: "Arrêter", en: "Stop", nl: "Stoppen", ar: "إيقاف",
  },

  // Aya-by-aya Tarteel flow
  "aya.playAya": {
    fr: "▶ Écouter l'aya", en: "▶ Listen to aya", nl: "▶ Luister naar aya", ar: "▶ استمع للآية",
  },
  "aya.reciteNow": {
    fr: "🎤 Récitez cette aya !", en: "🎤 Recite this aya!", nl: "🎤 Reciteer deze aya!", ar: "🎤 اتلُ هذه الآية!",
  },
  "aya.listening": {
    fr: "🎙️ J'écoute... Appuyez pour arrêter", en: "🎙️ Listening... Tap to stop", nl: "🎙️ Luisteren... Tik om te stoppen", ar: "🎙️ أستمع... اضغط للإيقاف",
  },
  "aya.tapToRecite": {
    fr: "Appuyez sur le micro pour réciter", en: "Tap the mic to recite", nl: "Tik op de microfoon om te reciteren", ar: "اضغط على الميكروفون للتلاوة",
  },
  "aya.micDenied": {
    fr: "Permission micro refusée", en: "Microphone permission denied", nl: "Microfoontoestemming geweigerd", ar: "تم رفض إذن الميكروفون",
  },
  "aya.micDeniedHint": {
    fr: "Allez dans les réglages de votre navigateur et autorisez l'accès au micro pour ce site, puis réessayez.", en: "Go to your browser settings and allow microphone access for this site, then try again.", nl: "Ga naar je browserinstellingen en sta microfoontoegang toe voor deze site.", ar: "اذهب إلى إعدادات المتصفح واسمح بالوصول إلى الميكروفون لهذا الموقع.",
  },
  "aya.retryMic": {
    fr: "Réessayer", en: "Retry", nl: "Opnieuw proberen", ar: "إعادة المحاولة",
  },
  "aya.correct": {
    fr: "Correct ! ✓", en: "Correct! ✓", nl: "Correct! ✓", ar: "صحيح! ✓",
  },
  "aya.incorrect": {
    fr: "Réessayez ✗", en: "Try again ✗", nl: "Probeer opnieuw ✗", ar: "حاول مرة أخرى ✗",
  },
  "aya.retry": {
    fr: "Réessayer cette aya", en: "Retry this aya", nl: "Deze aya opnieuw", ar: "إعادة هذه الآية",
  },
  "aya.skip": {
    fr: "Passer →", en: "Skip →", nl: "Overslaan →", ar: "→ تخطي",
  },
  "aya.pause": {
    fr: "Pause", en: "Pause", nl: "Pauze", ar: "إيقاف مؤقت",
  },
  "aya.resume": {
    fr: "Reprendre", en: "Resume", nl: "Hervatten", ar: "استئناف",
  },
  "aya.next": {
    fr: "Suivant", en: "Next", nl: "Volgende", ar: "التالي",
  },
  "aya.prev": {
    fr: "Précédent", en: "Previous", nl: "Vorige", ar: "السابق",
  },
  "aya.repeatX3": {
    fr: "Répéter ×3", en: "Repeat ×3", nl: "Herhaal ×3", ar: "إعادة ×3",
  },
  "aya.progress": {
    fr: "Aya", en: "Aya", nl: "Aya", ar: "آية",
  },
  "aya.surahComplete": {
    fr: "Sourate terminée !", en: "Surah complete!", nl: "Soera voltooid!", ar: "اكتملت السورة!",
  },
  "aya.perfectAyas": {
    fr: "ayas parfaites !", en: "perfect ayas!", nl: "perfecte aya's!", ar: "آيات مثالية!",
  },
  "aya.score": {
    fr: "Score final", en: "Final score", nl: "Eindscore", ar: "النتيجة النهائية",
  },
  "aya.errors": {
    fr: "Erreurs à revoir", en: "Errors to review", nl: "Fouten om te herzien", ar: "أخطاء للمراجعة",
  },
  "aya.badge5": {
    fr: "5 ayas parfaites ! 🌟", en: "5 perfect ayas! 🌟", nl: "5 perfecte aya's! 🌟", ar: "5 آيات مثالية! 🌟",
  },
  "aya.badge10": {
    fr: "10 ayas parfaites ! 🏆", en: "10 perfect ayas! 🏆", nl: "10 perfecte aya's! 🏆", ar: "10 آيات مثالية! 🏆",
  },
  "aya.badgeAll": {
    fr: "Sourate parfaite ! 👑", en: "Perfect surah! 👑", nl: "Perfecte soera! 👑", ar: "سورة مثالية! 👑",
  },
  "aya.translation": {
    fr: "Traduction", en: "Translation", nl: "Vertaling", ar: "الترجمة",
  },
  "aya.voiceUnsupported": {
    fr: "Reconnaissance vocale non supportée. Utilisez Chrome.", en: "Voice recognition not supported. Use Chrome.", nl: "Spraakherkenning niet ondersteund. Gebruik Chrome.", ar: "التعرف على الصوت غير مدعوم. استخدم Chrome.",
  },
  "aya.autoNext": {
    fr: "Aya suivante dans...", en: "Next aya in...", nl: "Volgende aya in...", ar: "...الآية التالية في",
  },
  "nav.quran": {
    fr: "Coran", en: "Quran", nl: "Koran", ar: "القرآن",
  },
  "nav.prayers": {
    fr: "Prières", en: "Prayers", nl: "Gebeden", ar: "الصلوات",
  },

  // Dictation mode
  "dictation.title": {
    fr: "Mode dictée", en: "Dictation mode", nl: "Dicteermodus", ar: "وضع الإملاء",
  },
  "dictation.serverMode": {
    fr: "Mode serveur (fallback)", en: "Server mode (fallback)", nl: "Servermodus (fallback)", ar: "وضع الخادم (احتياطي)",
  },
  "dictation.webSpeechMode": {
    fr: "Reconnaissance vocale", en: "Voice recognition", nl: "Spraakherkenning", ar: "التعرف على الصوت",
  },
  "dictation.showText": {
    fr: "Afficher le texte", en: "Show text", nl: "Tekst tonen", ar: "عرض النص",
  },
  "dictation.instructions": {
    fr: "Récitez la sourate entière de mémoire", en: "Recite the entire surah from memory", nl: "Reciteer de volledige soera uit het hoofd", ar: "اتلُ السورة كاملة من الذاكرة",
  },
  "dictation.instructionsHint": {
    fr: "Les mots corrects apparaîtront en vert, les erreurs en rouge", en: "Correct words will appear in green, errors in red", nl: "Correcte woorden worden groen, fouten rood", ar: "ستظهر الكلمات الصحيحة بالأخضر والأخطاء بالأحمر",
  },
  "dictation.startReciting": {
    fr: "Commencer à réciter", en: "Start reciting", nl: "Begin met reciteren", ar: "ابدأ التلاوة",
  },
  "dictation.listening": {
    fr: "J'écoute votre récitation...", en: "Listening to your recitation...", nl: "Luisteren naar je recitatie...", ar: "...أستمع لتلاوتك",
  },
  "dictation.rawTranscript": {
    fr: "Transcription brute :", en: "Raw transcript:", nl: "Ruwe transcriptie:", ar: "النص الخام:",
  },
  "dictation.stopReciting": {
    fr: "Arrêter et voir les résultats", en: "Stop and see results", nl: "Stoppen en resultaten zien", ar: "توقف وشاهد النتائج",
  },
  "dictation.excellent": {
    fr: "Excellent ! Macha Allah ! 🌟", en: "Excellent! Masha Allah! 🌟", nl: "Uitstekend! Masha Allah! 🌟", ar: "ممتاز! ماشاء الله! 🌟",
  },
  "dictation.good": {
    fr: "Bien ! Continuez 💪", en: "Good! Keep going 💪", nl: "Goed! Ga zo door 💪", ar: "جيد! واصل 💪",
  },
  "dictation.needsWork": {
    fr: "À retravailler 📖", en: "Needs more practice 📖", nl: "Meer oefening nodig 📖", ar: "يحتاج مزيدًا من التدريب 📖",
  },
  "dictation.wordsCorrect": {
    fr: "mots corrects", en: "words correct", nl: "woorden correct", ar: "كلمات صحيحة",
  },
  "dictation.legendCorrect": {
    fr: "Correct", en: "Correct", nl: "Correct", ar: "صحيح",
  },
  "dictation.legendIncorrect": {
    fr: "Incorrect", en: "Incorrect", nl: "Incorrect", ar: "خطأ",
  },
  "dictation.legendMissing": {
    fr: "Manquant", en: "Missing", nl: "Ontbreekt", ar: "مفقود",
  },
  "dictation.legendExtra": {
    fr: "En trop", en: "Extra", nl: "Overbodig", ar: "زائد",
  },
  "dictation.ayahBreakdown": {
    fr: "Détail par aya", en: "Per-aya breakdown", nl: "Detail per aya", ar: "تفصيل لكل آية",
  },
  "dictation.restart": {
    fr: "Recommencer", en: "Restart", nl: "Opnieuw", ar: "إعادة",
  },
  "dictation.retryErrors": {
    fr: "Retravailler les erreurs", en: "Retry errors", nl: "Fouten herhalen", ar: "إعادة الأخطاء",
  },
  "dictation.modeAya": {
    fr: "Verset par verset", en: "Verse by verse", nl: "Vers per vers", ar: "آية بآية",
  },
  "dictation.modeSurah": {
    fr: "Sourate complète", en: "Full surah", nl: "Volledige soera", ar: "سورة كاملة",
  },

  // Prayers
  "prayers.title": {
    fr: "Prières", en: "Prayers", nl: "Gebeden", ar: "الصلوات",
  },
  "prayers.next": {
    fr: "Prochaine prière", en: "Next prayer", nl: "Volgend gebed", ar: "الصلاة القادمة",
  },
  "prayers.qibla": {
    fr: "Direction de la Qibla", en: "Qibla Direction", nl: "Qibla-richting", ar: "اتجاه القبلة",
  },
  "prayers.enableCompass": {
    fr: "Activer la boussole", en: "Enable compass", nl: "Kompas inschakelen", ar: "تفعيل البوصلة",
  },
  "prayers.fromNorth": {
    fr: "depuis le Nord", en: "from North", nl: "vanaf het Noorden", ar: "من الشمال",
  },
  "prayers.times": {
    fr: "Horaires du jour", en: "Today's times", nl: "Tijden vandaag", ar: "مواعيد اليوم",
  },
  "prayers.error": {
    fr: "Impossible de charger les horaires", en: "Could not load times", nl: "Kon tijden niet laden", ar: "تعذّر تحميل المواعيد",
  },
  "prayers.fajr": {
    fr: "Fajr", en: "Fajr", nl: "Fajr", ar: "الفجر",
  },
  "prayers.dhuhr": {
    fr: "Dhuhr", en: "Dhuhr", nl: "Dhuhr", ar: "الظهر",
  },
  "prayers.asr": {
    fr: "Asr", en: "Asr", nl: "Asr", ar: "العصر",
  },
  "prayers.maghrib": {
    fr: "Maghrib", en: "Maghrib", nl: "Maghrib", ar: "المغرب",
  },
  "prayers.isha": {
    fr: "Isha", en: "Isha", nl: "Isha", ar: "العشاء",
  },

  // Quiz categories
  "quiz.category.general": {
    fr: "Culture générale", en: "General knowledge", nl: "Algemene kennis", ar: "ثقافة عامة",
  },
  "quiz.category.memorization": {
    fr: "Mémorisation Coran", en: "Quran memorization", nl: "Koran memorisatie", ar: "حفظ القرآن",
  },
  "quiz.category.tajweed": {
    fr: "Tajwid & Signes d'arrêt", en: "Tajweed & Stop signs", nl: "Tajweed & Stoptekens", ar: "التجويد وعلامات الوقف",
  },
  "quiz.category.kids": {
    fr: "Histoires des Prophètes", en: "Prophet stories", nl: "Profeetverhalen", ar: "قصص الأنبياء",
  },
  "quiz.chooseCategory": {
    fr: "Choisissez une catégorie", en: "Choose a category", nl: "Kies een categorie", ar: "اختر فئة",
  },
  "quiz.flashcards": {
    fr: "Flashcards Prophètes", en: "Prophet Flashcards", nl: "Profeet Flashcards", ar: "بطاقات الأنبياء",
  },

  // Flashcards
  "flashcards.tapToReveal": {
    fr: "Touchez pour révéler", en: "Tap to reveal", nl: "Tik om te onthullen", ar: "اضغط للكشف",
  },
  "flashcards.mastered": {
    fr: "Maîtrisé !", en: "Mastered!", nl: "Beheerst!", ar: "تم إتقانها!",
  },
  "flashcards.markMastered": {
    fr: "Marquer comme maîtrisé", en: "Mark as mastered", nl: "Markeer als beheerst", ar: "وضع علامة إتقان",
  },

  // Waqf signs
  "waqf.obligatory": {
    fr: "Arrêt obligatoire", en: "Obligatory stop", nl: "Verplichte stop", ar: "وقف لازم",
  },
  "waqf.complete": {
    fr: "Arrêt complet recommandé", en: "Complete stop recommended", nl: "Volledige stop aanbevolen", ar: "وقف تام",
  },
  "waqf.permissible": {
    fr: "Arrêt permis", en: "Permissible stop", nl: "Toegestane stop", ar: "وقف جائز",
  },
  "waqf.sufficient": {
    fr: "Arrêt suffisant", en: "Sufficient stop", nl: "Voldoende stop", ar: "وقف كافٍ",
  },
  "waqf.good": {
    fr: "Bon arrêt", en: "Good stop", nl: "Goede stop", ar: "وقف حسن",
  },

  // Progress quiz stats
  "progress.quizStats": {
    fr: "Statistiques quiz", en: "Quiz statistics", nl: "Quizstatistieken", ar: "إحصائيات الاختبار",
  },
  "progress.quizSuccess": {
    fr: "Réussite quiz", en: "Quiz success", nl: "Quiz succes", ar: "نجاح الاختبار",
  },
  "progress.quizCompleted": {
    fr: "Quiz complétés", en: "Quizzes completed", nl: "Quizzen voltooid", ar: "اختبارات مكتملة",
  },

  // Prayer settings
  "prayers.settings.title": {
    fr: "Paramètres des prières", en: "Prayer settings", nl: "Gebedsinstellingen", ar: "إعدادات الصلاة",
  },
  "prayers.settings.location": {
    fr: "Localisation", en: "Location", nl: "Locatie", ar: "الموقع",
  },
  "prayers.settings.city": {
    fr: "Ville", en: "City", nl: "Stad", ar: "المدينة",
  },
  "prayers.settings.cityPlaceholder": {
    fr: "Ex : Bruxelles, Paris…", en: "E.g. Brussels, Paris…", nl: "Bv. Brussel, Parijs…", ar: "مثال: بروكسل، باريس…",
  },
  "prayers.settings.countryPlaceholder": {
    fr: "Pays (optionnel)", en: "Country (optional)", nl: "Land (optioneel)", ar: "البلد (اختياري)",
  },
  "prayers.settings.method": {
    fr: "Méthode de calcul", en: "Calculation method", nl: "Berekeningsmethode", ar: "طريقة الحساب",
  },
  "prayers.settings.madhab": {
    fr: "Madhhab (Asr)", en: "Madhhab (Asr)", nl: "Madhhab (Asr)", ar: "المذهب (العصر)",
  },
  "prayers.settings.shafii": {
    fr: "Standard (Shafi'i)", en: "Standard (Shafi'i)", nl: "Standaard (Shafi'i)", ar: "شافعي (عادي)",
  },
  "prayers.settings.hanafi": {
    fr: "Hanafi", en: "Hanafi", nl: "Hanafi", ar: "حنفي",
  },
  "prayers.settings.latitudeMethod": {
    fr: "Méthode haute latitude", en: "High latitude method", nl: "Hoge breedtegraad methode", ar: "طريقة خطوط العرض العالية",
  },
  "prayers.settings.midNight": {
    fr: "Milieu de la nuit", en: "Middle of the Night", nl: "Midden van de nacht", ar: "منتصف الليل",
  },
  "prayers.settings.oneSeventh": {
    fr: "Un septième de la nuit", en: "One Seventh of the Night", nl: "Een zevende van de nacht", ar: "سُبع الليل",
  },
  "prayers.settings.angleBased": {
    fr: "Basée sur l'angle", en: "Angle based", nl: "Hoekgebaseerd", ar: "على أساس الزاوية",
  },
  "prayers.settings.save": {
    fr: "Enregistrer", en: "Save", nl: "Opslaan", ar: "حفظ",
  },
  "prayers.settings.button": {
    fr: "Paramètres", en: "Settings", nl: "Instellingen", ar: "الإعدادات",
  },
  "prayers.horairesPour": {
    fr: "Horaires pour", en: "Times for", nl: "Tijden voor", ar: "مواعيد لـ",
  },

  // Notifications
  "prayers.notif.title": {
    fr: "Notifications", en: "Notifications", nl: "Meldingen", ar: "الإشعارات",
  },
  "prayers.notif.enable": {
    fr: "Activer les notifications", en: "Enable notifications", nl: "Meldingen inschakelen", ar: "تفعيل الإشعارات",
  },
  "prayers.notif.offset": {
    fr: "min avant l'adhan", en: "min before adhan", nl: "min voor adhan", ar: "دقيقة قبل الأذان",
  },
  "prayers.notif.unsupported": {
    fr: "Notifications non supportées sur cet appareil", en: "Notifications not supported on this device", nl: "Meldingen niet ondersteund op dit apparaat", ar: "الإشعارات غير مدعومة على هذا الجهاز",
  },
  "prayers.notif.denied": {
    fr: "Permission refusée. Activez les notifications dans les réglages de votre navigateur.", en: "Permission denied. Enable notifications in your browser settings.", nl: "Toestemming geweigerd. Schakel meldingen in via je browserinstellingen.", ar: "تم رفض الإذن. فعّل الإشعارات من إعدادات المتصفح.",
  },

  // Juz
  "juz.title": {
    fr: "Mode Juz", en: "Juz Mode", nl: "Juz Modus", ar: "وضع الجزء",
  },
  "juz.subtitle": {
    fr: "Mémorisez le Coran par Juz", en: "Memorize the Quran by Juz", nl: "Memoriseer de Koran per Juz", ar: "احفظ القرآن حسب الجزء",
  },
  "juz.notAvailable": {
    fr: "Non disponible", en: "Not available", nl: "Niet beschikbaar", ar: "غير متوفر",
  },
  "juz.startRevision": {
    fr: "Réviser ce Juz", en: "Review this Juz", nl: "Herhaal deze Juz", ar: "مراجعة هذا الجزء",
  },
  "juz.viewAll": {
    fr: "Voir les 30 Juz", en: "View all 30 Juz", nl: "Bekijk alle 30 Juz", ar: "عرض الأجزاء الثلاثين",
  },
  "juz.progress": {
    fr: "Progression par Juz", en: "Juz progress", nl: "Juz voortgang", ar: "تقدم الجزء",
  },

  // Translation settings
  "settings.translationAuto": {
    fr: "Traduction automatique", en: "Auto translation", nl: "Automatische vertaling", ar: "ترجمة تلقائية",
  },
  "settings.translationAutoDesc": {
    fr: "Selon la langue du système", en: "Based on system language", nl: "Op basis van systeemtaal", ar: "حسب لغة النظام",
  },
  "settings.translationManual": {
    fr: "Édition de traduction", en: "Translation edition", nl: "Vertalingseditie", ar: "إصدار الترجمة",
  },

  // City detection
  "prayers.detectCity": {
    fr: "Détecter ma ville", en: "Detect my city", nl: "Detecteer mijn stad", ar: "اكتشف مدينتي",
  },
  "prayers.changeCity": {
    fr: "Changer", en: "Change", nl: "Wijzigen", ar: "تغيير",
  },
  "prayers.noCity": {
    fr: "Aucune ville définie", en: "No city set", nl: "Geen stad ingesteld", ar: "لم يتم تحديد مدينة",
  },

  // Read-only mode
  "quran.readOnly": {
    fr: "Lecture seule", en: "Read only", nl: "Alleen lezen", ar: "قراءة فقط",
  },
  "quran.readOnlyDesc": {
    fr: "Écoutez et lisez sans micro ni correction", en: "Listen and read without mic or correction", nl: "Luister en lees zonder microfoon of correctie", ar: "استمع واقرأ بدون ميكروفون أو تصحيح",
  },

  // Hifz Control Mode
  "hifz.title": { fr: "Contrôle Hifz", en: "Hifz Check", nl: "Hifz Controle", ar: "اختبار الحفظ" },
  "hifz.selectPassage": { fr: "Sélection du passage", en: "Select passage", nl: "Passage selecteren", ar: "اختيار المقطع" },
  "hifz.from": { fr: "De", en: "From", nl: "Van", ar: "من" },
  "hifz.to": { fr: "À", en: "To", nl: "Tot", ar: "إلى" },
  "hifz.ayah": { fr: "Verset", en: "Verse", nl: "Vers", ar: "آية" },
  "hifz.ayahsSelected": { fr: "versets sélectionnés", en: "verses selected", nl: "verzen geselecteerd", ar: "آيات مختارة" },
  "hifz.mode": { fr: "Mode de contrôle", en: "Check mode", nl: "Controlemodus", ar: "وضع الاختبار" },
  "hifz.blocking": { fr: "Bloquant", en: "Blocking", nl: "Blokkerend", ar: "حظر" },
  "hifz.blockingDesc": { fr: "Pause à chaque erreur", en: "Pauses on each error", nl: "Pauzeert bij elke fout", ar: "يتوقف عند كل خطأ" },
  "hifz.observer": { fr: "Observation", en: "Observer", nl: "Observatie", ar: "مراقبة" },
  "hifz.observerDesc": { fr: "Erreurs marquées, récap à la fin", en: "Errors marked, recap at the end", nl: "Fouten gemarkeerd, samenvatting aan het einde", ar: "تُحدَّد الأخطاء، ملخص في النهاية" },
  "hifz.tolerance": { fr: "Tolérance", en: "Tolerance", nl: "Tolerantie", ar: "التسامح" },
  "hifz.strict": { fr: "Strict", en: "Strict", nl: "Strikt", ar: "صارم" },
  "hifz.medium": { fr: "Moyen", en: "Medium", nl: "Gemiddeld", ar: "متوسط" },
  "hifz.lenient": { fr: "Tolérant", en: "Lenient", nl: "Tolerant", ar: "متساهل" },
  "hifz.accessibility": { fr: "Symboles pour daltoniens", en: "Colorblind-friendly symbols", nl: "Kleurenblind-vriendelijke symbolen", ar: "رموز صديقة لعمى الألوان" },
  "hifz.start": { fr: "Commencer le contrôle", en: "Start check", nl: "Start controle", ar: "ابدأ الاختبار" },
  "hifz.errorDetected": { fr: "Erreur détectée !", en: "Error detected!", nl: "Fout gedetecteerd!", ar: "تم اكتشاف خطأ!" },
  "hifz.correctOrIgnore": { fr: "Corrigez ou ignorez pour continuer", en: "Correct it or ignore to continue", nl: "Corrigeer of negeer om door te gaan", ar: "صحح أو تجاهل للمتابعة" },
  "hifz.ignoreError": { fr: "Ignorer", en: "Ignore", nl: "Negeren", ar: "تجاهل" },
  "hifz.retry": { fr: "Réessayer", en: "Retry", nl: "Opnieuw", ar: "إعادة المحاولة" },
  "hifz.results": { fr: "Résultats du contrôle", en: "Check results", nl: "Controleresultaten", ar: "نتائج الاختبار" },
  "hifz.wordsCorrect": { fr: "mots corrects", en: "correct words", nl: "correcte woorden", ar: "كلمات صحيحة" },
  "hifz.errorBreakdown": { fr: "Détail des erreurs", en: "Error breakdown", nl: "Foutendetails", ar: "تفاصيل الأخطاء" },
  "hifz.incorrect": { fr: "Incorrect", en: "Incorrect", nl: "Onjuist", ar: "خاطئ" },
  "hifz.missing": { fr: "Manquant", en: "Missing", nl: "Ontbrekend", ar: "مفقود" },
  "hifz.extra": { fr: "Ajouté", en: "Extra", nl: "Extra", ar: "إضافي" },
  "hifz.worstAyahs": { fr: "Versets à retravailler", en: "Verses to review", nl: "Verzen om te herzien", ar: "آيات للمراجعة" },
  "hifz.ayahScores": { fr: "Scores par verset", en: "Scores per verse", nl: "Scores per vers", ar: "النتائج لكل آية" },
  "hifz.modeLabel": { fr: "Contrôle", en: "Hifz Check", nl: "Controle", ar: "اختبار" },

  // Tahaddi Mode
  "tahaddi.title": { fr: "Mode Tahaddi", en: "Tahaddi Challenge", nl: "Tahaddi Uitdaging", ar: "وضع التحدي" },
  "tahaddi.modeLabel": { fr: "Tahaddi", en: "Tahaddi", nl: "Tahaddi", ar: "تحدي" },
  "tahaddi.desc": { fr: "Récitez de mémoire, sans voir le texte", en: "Recite from memory, without seeing the text", nl: "Reciteer uit het geheugen, zonder de tekst te zien", ar: "اتلُ من الحفظ، بدون رؤية النص" },
  "tahaddi.descDetail": { fr: "Les versets se dévoilent uniquement quand vous les récitez correctement !", en: "Verses are only revealed when you recite them correctly!", nl: "Verzen worden pas onthuld als je ze correct reciteert!", ar: "تظهر الآيات فقط عند تلاوتها بشكل صحيح!" },
  "tahaddi.threshold": { fr: "Seuil de similarité", en: "Similarity threshold", nl: "Gelijkenisdrempel", ar: "عتبة التشابه" },
  "tahaddi.thresholdEasy": { fr: "Plus tolérant — idéal pour commencer", en: "More lenient — ideal for beginners", nl: "Meer tolerant — ideaal voor beginners", ar: "أكثر تسامحًا — مثالي للمبتدئين" },
  "tahaddi.thresholdMedium": { fr: "Équilibré — recommandé", en: "Balanced — recommended", nl: "Gebalanceerd — aanbevolen", ar: "متوازن — موصى به" },
  "tahaddi.thresholdHard": { fr: "Exigeant — pour les experts", en: "Demanding — for experts", nl: "Veeleisend — voor experts", ar: "صعب — للخبراء" },
  "tahaddi.start": { fr: "Lancer le défi", en: "Start challenge", nl: "Start uitdaging", ar: "ابدأ التحدي" },
  "tahaddi.revealed": { fr: "révélés", en: "revealed", nl: "onthuld", ar: "مكشوفة" },
  "tahaddi.attempt": { fr: "Tentative", en: "Attempt", nl: "Poging", ar: "محاولة" },
  "tahaddi.similarity": { fr: "Similarité", en: "Similarity", nl: "Gelijkenis", ar: "التشابه" },
  "tahaddi.reciteFromMemory": { fr: "Récitez ce verset de mémoire…", en: "Recite this verse from memory…", nl: "Reciteer dit vers uit het geheugen…", ar: "اتلُ هذه الآية من حفظك…" },
  "tahaddi.notEnough": { fr: "Pas assez proche, réessayez", en: "Not close enough, try again", nl: "Niet dichtbij genoeg, probeer opnieuw", ar: "ليست قريبة بما فيه الكفاية، حاول مرة أخرى" },
  "tahaddi.maxAttempts": { fr: "Nombre max de tentatives atteint", en: "Maximum attempts reached", nl: "Maximaal aantal pogingen bereikt", ar: "تم الوصول إلى الحد الأقصى من المحاولات" },
  "tahaddi.results": { fr: "Résultats du défi", en: "Challenge results", nl: "Uitdagingsresultaten", ar: "نتائج التحدي" },
  "tahaddi.excellent": { fr: "Excellent !", en: "Excellent!", nl: "Uitstekend!", ar: "ممتاز!" },
  "tahaddi.good": { fr: "Bien joué !", en: "Well done!", nl: "Goed gedaan!", ar: "أحسنت!" },
  "tahaddi.keepPracticing": { fr: "Continue à pratiquer", en: "Keep practicing", nl: "Blijf oefenen", ar: "واصل التدريب" },
  "tahaddi.ayahsRevealed": { fr: "versets révélés", en: "verses revealed", nl: "verzen onthuld", ar: "آيات مكشوفة" },
  "tahaddi.perfectBadge": { fr: "Page parfaite !", en: "Perfect page!", nl: "Perfecte pagina!", ar: "صفحة مثالية!" },
  "tahaddi.perfectDesc": { fr: "Tout validé du 1er coup", en: "All validated on 1st try", nl: "Alles in 1 keer gevalideerd", ar: "تم التحقق من الكل من أول محاولة" },
  "tahaddi.stats": { fr: "Statistiques", en: "Statistics", nl: "Statistieken", ar: "إحصائيات" },
  "tahaddi.totalAttempts": { fr: "tentatives", en: "attempts", nl: "pogingen", ar: "محاولات" },
  "tahaddi.duration": { fr: "durée", en: "duration", nl: "duur", ar: "المدة" },
  "tahaddi.detail": { fr: "Détail par verset", en: "Per-verse detail", nl: "Detail per vers", ar: "تفاصيل لكل آية" },
  "tahaddi.attempts": { fr: "essais", en: "tries", nl: "pogingen", ar: "محاولات" },
  "tahaddi.hintUsed": { fr: "indice utilisé", en: "hint used", nl: "hint gebruikt", ar: "تم استخدام التلميح" },

  // Find Ayah (voice search)
  "findAyah.title": { fr: "Trouve l'ayah", en: "Find the Ayah", nl: "Vind de Ayah", ar: "اعثر على الآية" },
  "findAyah.subtitle": { fr: "Récitez et identifiez le verset", en: "Recite and identify the verse", nl: "Reciteer en identificeer het vers", ar: "اتلُ وحدد الآية" },
  "findAyah.searchIn": { fr: "Chercher dans", en: "Search in", nl: "Zoeken in", ar: "البحث في" },
  "findAyah.scopeAll": { fr: "Tout le Coran", en: "Whole Quran", nl: "Hele Koran", ar: "القرآن كاملاً" },
  "findAyah.scopeSurah": { fr: "Sourate", en: "Surah", nl: "Soera", ar: "سورة" },
  "findAyah.instruction": { fr: "Appuyez sur le micro et récitez quelques mots d'un verset. L'app trouvera la sourate et l'ayah.", en: "Press the mic and recite a few words from a verse. The app will find the surah and ayah.", nl: "Druk op de microfoon en reciteer een paar woorden van een vers.", ar: "اضغط على المايك واتلُ بضع كلمات من آية. سيجد التطبيق السورة والآية." },
  "findAyah.tapToStart": { fr: "Appuyez et récitez", en: "Press and recite", nl: "Druk en reciteer", ar: "اضغط واتلُ" },
  "findAyah.listening": { fr: "Écoute en cours…", en: "Listening…", nl: "Luisteren…", ar: "جارٍ الاستماع…" },
  "findAyah.searching": { fr: "Recherche dans le Coran…", en: "Searching the Quran…", nl: "Zoeken in de Koran…", ar: "جارٍ البحث في القرآن…" },
  "findAyah.youRecited": { fr: "Vous avez récité", en: "You recited", nl: "Je reciteerde", ar: "ما تلوته" },
  "findAyah.noResults": { fr: "Aucun verset trouvé. Réessayez en récitant plus clairement.", en: "No verse found. Try again more clearly.", nl: "Geen vers gevonden. Probeer duidelijker.", ar: "لم يتم العثور على آية. حاول مرة أخرى بوضوح أكثر." },
  "findAyah.verse": { fr: "Verset", en: "Verse", nl: "Vers", ar: "آية" },
  "findAyah.listen": { fr: "Écouter", en: "Listen", nl: "Luisteren", ar: "استمع" },
  "findAyah.openMushaf": { fr: "Ouvrir", en: "Open", nl: "Openen", ar: "فتح" },
  "findAyah.searchAgain": { fr: "Nouvelle recherche", en: "Search again", nl: "Opnieuw zoeken", ar: "بحث جديد" },
  "findAyah.micDenied": { fr: "Accès au micro refusé", en: "Microphone access denied", nl: "Microfoon geweigerd", ar: "تم رفض الوصول للميكروفون" },
  "findAyah.micError": { fr: "Erreur microphone", en: "Microphone error", nl: "Microfoonfout", ar: "خطأ في الميكروفون" },
  "findAyah.tooShort": { fr: "Enregistrement trop court", en: "Recording too short", nl: "Opname te kort", ar: "التسجيل قصير جداً" },
  "findAyah.searchError": { fr: "Erreur de recherche", en: "Search error", nl: "Zoekfout", ar: "خطأ في البحث" },
  "findAyah.dismiss": { fr: "Fermer", en: "Dismiss", nl: "Sluiten", ar: "إغلاق" },
  "findAyah.modeLabel": { fr: "Trouve l'ayah", en: "Find Ayah", nl: "Vind Ayah", ar: "اعثر على الآية" },

  // Surah selector
  "surah.lastUsed": { fr: "Dernière sourate utilisée", en: "Last used surah", nl: "Laatst gebruikte soera", ar: "آخر سورة مستخدمة" },
  "surah.recommended": { fr: "Recommandées pour débuter", en: "Recommended for beginners", nl: "Aanbevolen voor beginners", ar: "موصى بها للمبتدئين" },
  "surah.continueWith": { fr: "Reprendre", en: "Continue", nl: "Doorgaan", ar: "متابعة" },

  // Hifz Map
  "hifzMap.title": { fr: "Carte Hifz", en: "Hifz Map", nl: "Hifz Kaart", ar: "خريطة الحفظ" },
  "hifzMap.subtitle": { fr: "Vue globale de votre mémorisation", en: "Global memorization overview", nl: "Globaal overzicht van je memorisatie", ar: "نظرة شاملة على حفظك" },
  "hifzMap.globalMastery": { fr: "Maîtrise globale", en: "Global mastery", nl: "Globale beheersing", ar: "الإتقان العام" },
  "hifzMap.strong": { fr: "Fort", en: "Strong", nl: "Sterk", ar: "قوي" },
  "hifzMap.medium": { fr: "À renforcer", en: "Needs work", nl: "Versterken", ar: "يحتاج تعزيز" },
  "hifzMap.weak": { fr: "Faible", en: "Weak", nl: "Zwak", ar: "ضعيف" },
  "hifzMap.needsWork": { fr: "À renforcer", en: "Needs work", nl: "Te versterken", ar: "يحتاج تعزيز" },
  "hifzMap.surahsReviewed": { fr: "sourates révisées", en: "surahs reviewed", nl: "soera's herzien", ar: "سور تمت مراجعتها" },
  "hifzMap.byJuz": { fr: "Par Juz", en: "By Juz", nl: "Per Juz", ar: "حسب الجزء" },
  "hifzMap.reviewedSurahs": { fr: "Sourates révisées", en: "Reviewed surahs", nl: "Herziene soera's", ar: "السور التي تمت مراجعتها" },
  "hifzMap.sessions": { fr: "sessions", en: "sessions", nl: "sessies", ar: "جلسات" },
  "hifzMap.surahsTotal": { fr: "sourates", en: "surahs", nl: "soera's", ar: "سور" },
  "hifzMap.reviewed": { fr: "révisées", en: "reviewed", nl: "herzien", ar: "تمت مراجعتها" },
  "hifzMap.lastReview": { fr: "Dernière révision", en: "Last review", nl: "Laatste revisie", ar: "آخر مراجعة" },
  "hifzMap.bestScore": { fr: "Meilleur score", en: "Best score", nl: "Beste score", ar: "أفضل نتيجة" },
  "hifzMap.status": { fr: "Statut", en: "Status", nl: "Status", ar: "الحالة" },
  "hifzMap.neverReviewed": { fr: "Jamais révisée", en: "Never reviewed", nl: "Nooit herzien", ar: "لم تتم مراجعتها أبداً" },
  "hifzMap.wellMemorized": { fr: "Bien mémorisée", en: "Well memorized", nl: "Goed gememoriseerd", ar: "محفوظة جيداً" },
  "hifzMap.needsMorePractice": { fr: "Nécessite plus de pratique", en: "Needs more practice", nl: "Meer oefening nodig", ar: "يحتاج مزيداً من التدريب" },
  "hifzMap.notReviewedRecently": { fr: "Non révisée récemment", en: "Not reviewed recently", nl: "Recent niet herzien", ar: "لم تتم مراجعتها مؤخراً" },
  "hifzMap.practiceNow": { fr: "Pratiquer maintenant", en: "Practice now", nl: "Nu oefenen", ar: "تدرب الآن" },
  "hifzMap.today": { fr: "Aujourd'hui", en: "Today", nl: "Vandaag", ar: "اليوم" },
  "hifzMap.yesterday": { fr: "Hier", en: "Yesterday", nl: "Gisteren", ar: "أمس" },
  "hifzMap.daysAgo": { fr: "j", en: "d ago", nl: "d geleden", ar: "أيام" },
  "hifzMap.weeksAgo": { fr: "sem.", en: "w ago", nl: "w geleden", ar: "أسابيع" },
  "hifzMap.monthsAgo": { fr: "mois", en: "mo ago", nl: "ma geleden", ar: "أشهر" },
} as const;

type TranslationKey = keyof typeof translations;

// ─── Context ────────────────────────────────────────────────
interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.fr;
  }, [lang]);

  const langInfo = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  // Update document dir for RTL
  useEffect(() => {
    document.documentElement.dir = langInfo.dir;
    document.documentElement.lang = lang;
  }, [lang, langInfo.dir]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir: langInfo.dir, isRTL: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Fallback context for when provider is not yet mounted (HMR / race conditions)
const fallbackContext: LanguageContextType = {
  lang: "fr",
  setLang: () => {},
  t: (key: TranslationKey) => {
    const entry = translations[key];
    return entry?.fr || key;
  },
  dir: "ltr",
  isRTL: false,
};

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  return ctx || fallbackContext;
}
