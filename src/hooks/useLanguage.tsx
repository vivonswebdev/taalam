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
