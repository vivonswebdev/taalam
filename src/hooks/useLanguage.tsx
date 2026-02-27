import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";

export type Lang = "fr" | "en" | "nl" | "ar" | "tr" | "ur";

export const LANGUAGES: { code: Lang; label: string; flag: string; dir: "ltr" | "rtl" }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱", dir: "ltr" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷", dir: "ltr" },
  { code: "ur", label: "اردو", flag: "🇵🇰", dir: "rtl" },
];

// Translation API identifiers for AlQuran Cloud
export const QURAN_TRANSLATION_IDS: Record<Lang, string> = {
  fr: "fr.hamidullah",
  en: "en.asad",
  nl: "nl.siregar",
  ar: "ar.alafasy",
  tr: "tr.diyanet",
  ur: "ur.jalandhry",
};

const LANG_KEY = "quranEasyLang";

function detectBrowserLang(): Lang {
  try {
    const nav = navigator.language?.toLowerCase() || "";
    if (nav.startsWith("fr")) return "fr";
    if (nav.startsWith("nl")) return "nl";
    if (nav.startsWith("ar")) return "ar";
    if (nav.startsWith("tr")) return "tr";
    if (nav.startsWith("ur")) return "ur";
    return "en";
  } catch {
    return "fr";
  }
}

function loadLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY) as Lang;
    if (stored && ["fr", "en", "nl", "ar", "tr", "ur"].includes(stored)) return stored;
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
    tr: "Kur'an'ı kolayca, adım adım öğrenin",
    ur: "قرآن آسانی سے سیکھیں، قدم بہ قدم",
  },
  "home.progress": { fr: "Votre progression", en: "Your progress", nl: "Je voortgang", ar: "تقدّمك", tr: "İlerlemeniz", ur: "آپ کی پیشرفت" },
  "home.level.none": { fr: "Pas encore de niveau", en: "No level yet", nl: "Nog geen niveau", ar: "لا مستوى بعد", tr: "Henüz seviye yok", ur: "ابھی کوئی سطح نہیں" },
  "home.level": { fr: "Niveau", en: "Level", nl: "Niveau", ar: "المستوى", tr: "Seviye", ur: "سطح" },
  "home.level.easy": { fr: "Débutant", en: "Beginner", nl: "Beginner", ar: "مبتدئ", tr: "Başlangıç", ur: "ابتدائی" },
  "home.level.medium": { fr: "Intermédiaire", en: "Intermediate", nl: "Gevorderd", ar: "متوسط", tr: "Orta", ur: "درمیانہ" },
  "home.level.hard": { fr: "Avancé", en: "Advanced", nl: "Expert", ar: "متقدم", tr: "İleri", ur: "ایڈوانس" },
  "home.mastered": { fr: "sourates maîtrisées", en: "surahs mastered", nl: "soera's beheerst", ar: "سور متقنة", tr: "sure ezberlendi", ur: "سورتیں مکمل" },
  "home.startQuiz": { fr: "Commencer le Quiz Niveau", en: "Start Level Quiz", nl: "Start Niveau Quiz", ar: "ابدأ اختبار المستوى", tr: "Seviye Testini Başlat", ur: "سطح کا امتحان شروع کریں" },
  "home.continue": { fr: "Continuer l'apprentissage", en: "Continue learning", nl: "Doorgaan met leren", ar: "واصل التعلم", tr: "Öğrenmeye devam et", ur: "سیکھنا جاری رکھیں" },
  "home.retakeQuiz": { fr: "Refaire le quiz", en: "Retake quiz", nl: "Quiz opnieuw", ar: "إعادة الاختبار", tr: "Testi tekrarla", ur: "دوبارہ امتحان دیں" },
  "home.myProgress": { fr: "Ma progression", en: "My progress", nl: "Mijn voortgang", ar: "تقدّمي", tr: "İlerlemem", ur: "میری پیشرفت" },

  // Learn
  "learn.title": { fr: "Apprendre", en: "Learn", nl: "Leren", ar: "تعلّم", tr: "Öğren", ur: "سیکھیں" },
  "learn.surahs": { fr: "sourates", en: "surahs", nl: "soera's", ar: "سور", tr: "sure", ur: "سورتیں" },
  "learn.determineLevel": { fr: "Déterminez votre niveau", en: "Determine your level", nl: "Bepaal je niveau", ar: "حدّد مستواك", tr: "Seviyenizi belirleyin", ur: "اپنی سطح معلوم کریں" },
  "learn.takeQuiz": {
    fr: "Passez le quiz pour débloquer les sourates adaptées",
    en: "Take the quiz to unlock suitable surahs",
    nl: "Doe de quiz om geschikte soera's te ontgrendelen",
    ar: "قم بالاختبار لفتح السور المناسبة",
    tr: "Uygun sureleri açmak için testi yapın",
    ur: "مناسب سورتیں کھولنے کے لیے امتحان دیں",
  },
  "learn.startQuiz": { fr: "Passer le quiz", en: "Take the quiz", nl: "Doe de quiz", ar: "ابدأ الاختبار", tr: "Testi yap", ur: "امتحان دیں" },

  // Learn Detail
  "detail.back": { fr: "Retour", en: "Back", nl: "Terug", ar: "رجوع", tr: "Geri", ur: "واپس" },
  "detail.verses": { fr: "versets", en: "verses", nl: "verzen", ar: "آيات", tr: "ayet", ur: "آیات" },
  "detail.surah": { fr: "Sourate n°", en: "Surah no.", nl: "Soera nr.", ar: "سورة رقم", tr: "Sure no.", ur: "سورۃ نمبر" },
  "detail.step1": { fr: "Étape 1 : Écoutez la récitation", en: "Step 1: Listen to recitation", nl: "Stap 1: Luister naar recitatie", ar: "الخطوة 1: استمع للتلاوة", tr: "Adım 1: Tilaveti dinle", ur: "مرحلہ 1: تلاوت سنیں" },
  "detail.step2": { fr: "Étape 2 : Récitez le verset", en: "Step 2: Recite the verse", nl: "Stap 2: Reciteer het vers", ar: "الخطوة 2: اتلُ الآية", tr: "Adım 2: Ayeti oku", ur: "مرحلہ 2: آیت پڑھیں" },
  "detail.step3": { fr: "Étape 3 : Résultats", en: "Step 3: Results", nl: "Stap 3: Resultaten", ar: "الخطوة 3: النتائج", tr: "Adım 3: Sonuçlar", ur: "مرحلہ 3: نتائج" },
  "detail.skipToRecitation": { fr: "Passer à la récitation →", en: "Skip to recitation →", nl: "Ga naar recitatie →", ar: "→ انتقل للتلاوة", tr: "Tilavete geç →", ur: "→ تلاوت پر جائیں" },
  "detail.reciteNow": { fr: "Récitez maintenant... Appuyez pour arrêter", en: "Recite now... Tap to stop", nl: "Reciteer nu... Tik om te stoppen", ar: "اتلُ الآن... اضغط للإيقاف", tr: "Şimdi oku... Durdurmak için dokun", ur: "ابھی پڑھیں... روکنے کے لیے دبائیں" },
  "detail.tapToStart": { fr: "Appuyez pour commencer", en: "Tap to start", nl: "Tik om te starten", ar: "اضغط للبدء", tr: "Başlamak için dokun", ur: "شروع کرنے کے لیے دبائیں" },
  "detail.yourRecitation": { fr: "Votre récitation :", en: "Your recitation:", nl: "Jouw recitatie:", ar: "تلاوتك:", tr: "Tilavetiniz:", ur: "آپ کی تلاوت:" },
  "detail.validate": { fr: "Valider le verset", en: "Validate verse", nl: "Vers valideren", ar: "تأكيد الآية", tr: "Ayeti onayla", ur: "آیت کی تصدیق" },
  "detail.skipVerse": { fr: "Passer ce verset", en: "Skip this verse", nl: "Sla dit vers over", ar: "تخطي هذه الآية", tr: "Bu ayeti atla", ur: "یہ آیت چھوڑیں" },
  "detail.verse": { fr: "Verset", en: "Verse", nl: "Vers", ar: "آية", tr: "Ayet", ur: "آیت" },
  "detail.repeat": { fr: "Répéter", en: "Repeat", nl: "Herhalen", ar: "إعادة", tr: "Tekrarla", ur: "دہرائیں" },
  "detail.nextSurah": { fr: "Sourate suivante", en: "Next surah", nl: "Volgende soera", ar: "السورة التالية", tr: "Sonraki sure", ur: "اگلی سورۃ" },
  "detail.excellent": { fr: "Excellent ! 🌟", en: "Excellent! 🌟", nl: "Uitstekend! 🌟", ar: "ممتاز! 🌟", tr: "Mükemmel! 🌟", ur: "بہترین! 🌟" },
  "detail.good": { fr: "Bien ! Continuez 💪", en: "Good! Keep going 💪", nl: "Goed! Ga zo door 💪", ar: "جيد! واصل 💪", tr: "İyi! Devam et 💪", ur: "اچھا! جاری رکھیں 💪" },
  "detail.tryAgain": { fr: "Réessayez 📖", en: "Try again 📖", nl: "Probeer opnieuw 📖", ar: "حاول مرة أخرى 📖", tr: "Tekrar dene 📖", ur: "دوبارہ کوشش کریں 📖" },
  "detail.mastered": { fr: "Vous maîtrisez cette sourate !", en: "You've mastered this surah!", nl: "Je beheerst deze soera!", ar: "لقد أتقنت هذه السورة!", tr: "Bu sureyi ezberlediniz!", ur: "آپ نے یہ سورۃ مکمل کر لی!" },
  "detail.listenAgain": { fr: "Réécoutez et réessayez les versets en rouge", en: "Re-listen and retry the red verses", nl: "Luister opnieuw en probeer de rode verzen opnieuw", ar: "أعد الاستماع وحاول الآيات الحمراء مرة أخرى", tr: "Kırmızı ayetleri tekrar dinle ve dene", ur: "سرخ آیات دوبارہ سنیں اور کوشش کریں" },
  "detail.voiceNotSupported": {
    fr: "La reconnaissance vocale n'est pas supportée par votre navigateur. Utilisez Chrome pour une meilleure expérience.",
    en: "Voice recognition is not supported by your browser. Use Chrome for a better experience.",
    nl: "Spraakherkenning wordt niet ondersteund door je browser. Gebruik Chrome voor een betere ervaring.",
    ar: "التعرف على الصوت غير مدعوم في متصفحك. استخدم Chrome للحصول على تجربة أفضل.",
    tr: "Ses tanıma tarayıcınız tarafından desteklenmiyor. Daha iyi bir deneyim için Chrome kullanın.",
    ur: "آواز کی شناخت آپ کے براؤزر میں دستیاب نہیں۔ بہتر تجربے کے لیے Chrome استعمال کریں۔",
  },
  "detail.childMode": { fr: "🧒 Mode Enfant activé", en: "🧒 Child Mode enabled", nl: "🧒 Kindermodus ingeschakeld", ar: "🧒 وضع الأطفال مفعّل", tr: "🧒 Çocuk Modu açık", ur: "🧒 بچوں کا موڈ فعال" },

  // Recitation
  "recitation.title": { fr: "Récitation Tarteel", en: "Tarteel Recitation", nl: "Tarteel Recitatie", ar: "تلاوة ترتيل", tr: "Tartil Tilavet", ur: "ترتیل تلاوت" },
  "recitation.subtitle": { fr: "Écoute, mémorise, récite", en: "Listen, memorize, recite", nl: "Luister, onthoud, reciteer", ar: "استمع، احفظ، اتلُ", tr: "Dinle, ezberle, oku", ur: "سنیں، یاد کریں، پڑھیں" },
  "recitation.streak": { fr: "de suite", en: "streak", nl: "op rij", ar: "متتالية", tr: "seri", ur: "سلسلہ" },
  "recitation.startStreak": { fr: "Commence ton streak !", en: "Start your streak!", nl: "Begin je reeks!", ar: "ابدأ سلسلتك!", tr: "Serini başlat!", ur: "اپنا سلسلہ شروع کریں!" },
  "recitation.daysStreak": { fr: "jour(s) de suite !", en: "day(s) streak!", nl: "dag(en) op rij!", ar: "يوم/أيام متتالية!", tr: "gün seri!", ur: "دن کا سلسلہ!" },
  "recitation.record": { fr: "Record", en: "Record", nl: "Record", ar: "رقم قياسي", tr: "Rekor", ur: "ریکارڈ" },
  "recitation.days": { fr: "jours", en: "days", nl: "dagen", ar: "أيام", tr: "gün", ur: "دن" },
  "recitation.sessions": { fr: "sessions", en: "sessions", nl: "sessies", ar: "جلسات", tr: "oturum", ur: "سیشن" },
  "recitation.practicedToday": { fr: "✅ Tu as pratiqué aujourd'hui !", en: "✅ You practiced today!", nl: "✅ Je hebt vandaag geoefend!", ar: "✅ لقد تدربت اليوم!", tr: "✅ Bugün pratik yaptın!", ur: "✅ آج آپ نے مشق کی!" },
  "recitation.difficulty": { fr: "Niveau de difficulté", en: "Difficulty level", nl: "Moeilijkheidsgraad", ar: "مستوى الصعوبة", tr: "Zorluk seviyesi", ur: "مشکل کی سطح" },
  "recitation.easy": { fr: "Facile", en: "Easy", nl: "Makkelijk", ar: "سهل", tr: "Kolay", ur: "آسان" },
  "recitation.medium": { fr: "Moyen", en: "Medium", nl: "Gemiddeld", ar: "متوسط", tr: "Orta", ur: "درمیانہ" },
  "recitation.hard": { fr: "Difficile", en: "Hard", nl: "Moeilijk", ar: "صعب", tr: "Zor", ur: "مشکل" },
  "recitation.chooseSurah": { fr: "Choisis une sourate", en: "Choose a surah", nl: "Kies een soera", ar: "اختر سورة", tr: "Bir sure seç", ur: "سورۃ منتخب کریں" },
  "recitation.selectSurah": { fr: "Sélectionner une sourate...", en: "Select a surah...", nl: "Selecteer een soera...", ar: "...اختر سورة", tr: "Bir sure seç...", ur: "...سورۃ منتخب کریں" },
  "recitation.textMasked": { fr: "Texte masqué — mémorise bien !", en: "Text hidden — memorize well!", nl: "Tekst verborgen — onthoud goed!", ar: "النص مخفي — احفظ جيدًا!", tr: "Metin gizli — iyi ezberle!", ur: "متن چھپا ہوا ہے — اچھی طرح یاد کریں!" },
  "recitation.skipToRecitation": { fr: "Passer à la récitation →", en: "Skip to recitation →", nl: "Ga naar recitatie →", ar: "→ انتقل للتلاوة", tr: "Tilavete geç →", ur: "→ تلاوت پر جائیں" },
  "recitation.restart": { fr: "Recommencer", en: "Restart", nl: "Opnieuw", ar: "إعادة", tr: "Yeniden başla", ur: "دوبارہ شروع" },
  "recitation.changeSurah": { fr: "Changer de sourate", en: "Change surah", nl: "Andere soera", ar: "تغيير السورة", tr: "Sure değiştir", ur: "سورۃ تبدیل کریں" },
  "recitation.hafiz": { fr: "Hâfiz en herbe", en: "Budding Hafiz", nl: "Aankomend Hafiz", ar: "حافظ ناشئ", tr: "Gelecek Hafız", ur: "نئے حافظ" },
  "recitation.daysOfStreak": { fr: "jour(s) de streak", en: "day(s) streak", nl: "dag(en) reeks", ar: "يوم/أيام سلسلة", tr: "gün seri", ur: "دن سلسلہ" },

  // Progress
  "progress.title": { fr: "Progression", en: "Progress", nl: "Voortgang", ar: "التقدم", tr: "İlerleme", ur: "پیشرفت" },
  "progress.mastered": { fr: "Maîtrisées", en: "Mastered", nl: "Beheerst", ar: "متقنة", tr: "Ezberlenen", ur: "مکمل" },
  "progress.attempts": { fr: "Tentatives", en: "Attempts", nl: "Pogingen", ar: "محاولات", tr: "Denemeler", ur: "کوششیں" },
  "progress.studied": { fr: "Étudiées", en: "Studied", nl: "Bestudeerd", ar: "مدروسة", tr: "Çalışılan", ur: "پڑھی گئیں" },
  "progress.scores": { fr: "Scores par sourate", en: "Scores by surah", nl: "Scores per soera", ar: "النتائج حسب السورة", tr: "Sure bazında puanlar", ur: "سورۃ کے لحاظ سے نمبرات" },
  "progress.stickers": { fr: "🎁 Ma collection de stickers", en: "🎁 My sticker collection", nl: "🎁 Mijn stickerverzameling", ar: "🎁 مجموعة الملصقات", tr: "🎁 Çıkartma koleksiyonum", ur: "🎁 میرے اسٹیکرز" },
  "progress.details": { fr: "Détails", en: "Details", nl: "Details", ar: "التفاصيل", tr: "Detaylar", ur: "تفصیلات" },
  "progress.noSurahs": { fr: "Aucune sourate étudiée pour le moment", en: "No surahs studied yet", nl: "Nog geen soera's bestudeerd", ar: "لم تتم دراسة أي سورة بعد", tr: "Henüz sure çalışılmadı", ur: "ابھی تک کوئی سورۃ نہیں پڑھی گئی" },

  // Settings
  "settings.title": { fr: "Réglages", en: "Settings", nl: "Instellingen", ar: "الإعدادات", tr: "Ayarlar", ur: "ترتیبات" },
  "settings.childMode": { fr: "Mode Enfant", en: "Child Mode", nl: "Kindermodus", ar: "وضع الأطفال", tr: "Çocuk Modu", ur: "بچوں کا موڈ" },
  "settings.childModeDesc": { fr: "Texte plus gros, stickers et confettis", en: "Bigger text, stickers and confetti", nl: "Grotere tekst, stickers en confetti", ar: "نص أكبر، ملصقات وقصاصات ورقية", tr: "Büyük yazı, çıkartma ve konfeti", ur: "بڑا متن، اسٹیکرز اور کنفیٹی" },
  "settings.language": { fr: "Langue", en: "Language", nl: "Taal", ar: "اللغة", tr: "Dil", ur: "زبان" },
  "settings.reset": { fr: "Réinitialiser la progression", en: "Reset progress", nl: "Voortgang resetten", ar: "إعادة تعيين التقدم", tr: "İlerlemeyi sıfırla", ur: "پیشرفت ری سیٹ کریں" },
  "settings.resetDesc": { fr: "Remet tout à zéro", en: "Reset everything", nl: "Alles resetten", ar: "إعادة تعيين كل شيء", tr: "Her şeyi sıfırla", ur: "سب کچھ ری سیٹ کریں" },
  "settings.version": { fr: "Apprendre le Coran facilement", en: "Learn the Quran easily", nl: "Leer de Koran eenvoudig", ar: "تعلّم القرآن بسهولة", tr: "Kur'an'ı kolayca öğren", ur: "قرآن آسانی سے سیکھیں" },
  "settings.confirmTitle": { fr: "Confirmer", en: "Confirm", nl: "Bevestigen", ar: "تأكيد", tr: "Onayla", ur: "تصدیق" },
  "settings.confirmMessage": {
    fr: "Toute votre progression sera perdue. Voulez-vous continuer ?",
    en: "All your progress will be lost. Do you want to continue?",
    nl: "Al je voortgang gaat verloren. Wil je doorgaan?",
    ar: "سيتم فقدان كل تقدمك. هل تريد المتابعة؟",
    tr: "Tüm ilerlemeniz kaybolacak. Devam etmek istiyor musunuz?",
    ur: "آپ کی ساری پیشرفت ختم ہو جائے گی۔ کیا جاری رکھنا چاہتے ہیں؟",
  },
  "settings.cancel": { fr: "Annuler", en: "Cancel", nl: "Annuleren", ar: "إلغاء", tr: "İptal", ur: "منسوخ" },
  "settings.confirmReset": { fr: "Réinitialiser", en: "Reset", nl: "Resetten", ar: "إعادة تعيين", tr: "Sıfırla", ur: "ری سیٹ" },

  // Quiz
  "quiz.back": { fr: "Retour", en: "Back", nl: "Terug", ar: "رجوع", tr: "Geri", ur: "واپس" },
  "quiz.question": { fr: "Question", en: "Question", nl: "Vraag", ar: "سؤال", tr: "Soru", ur: "سوال" },
  "quiz.bravo": { fr: "Bravo !", en: "Well done!", nl: "Goed gedaan!", ar: "أحسنت!", tr: "Tebrikler!", ur: "شاباش!" },
  "quiz.score": { fr: "Score", en: "Score", nl: "Score", ar: "النتيجة", tr: "Puan", ur: "نمبر" },
  "quiz.levelLabel": { fr: "Niveau", en: "Level", nl: "Niveau", ar: "المستوى", tr: "Seviye", ur: "سطح" },
  "quiz.startLearning": { fr: "Commencer l'apprentissage", en: "Start learning", nl: "Begin met leren", ar: "ابدأ التعلم", tr: "Öğrenmeye başla", ur: "سیکھنا شروع کریں" },

  // Bottom Nav
  "nav.home": { fr: "Accueil", en: "Home", nl: "Home", ar: "الرئيسية", tr: "Ana Sayfa", ur: "ہوم" },
  "nav.learn": { fr: "Apprendre", en: "Learn", nl: "Leren", ar: "تعلّم", tr: "Öğren", ur: "سیکھیں" },
  "nav.recitation": { fr: "Récitation", en: "Recitation", nl: "Recitatie", ar: "تلاوة", tr: "Tilavet", ur: "تلاوت" },
  "nav.progress": { fr: "Progrès", en: "Progress", nl: "Voortgang", ar: "التقدم", tr: "İlerleme", ur: "پیشرفت" },
  "nav.settings": { fr: "Réglages", en: "Settings", nl: "Instellingen", ar: "الإعدادات", tr: "Ayarlar", ur: "ترتیبات" },

  // Audio player
  "audio.loading": { fr: "Chargement...", en: "Loading...", nl: "Laden...", ar: "...جاري التحميل", tr: "Yükleniyor...", ur: "...لوڈ ہو رہا ہے" },
  "audio.listen": { fr: "Écouter la sourate", en: "Listen to surah", nl: "Luister naar soera", ar: "استمع للسورة", tr: "Sureyi dinle", ur: "سورۃ سنیں" },
  "audio.stop": { fr: "Arrêter", en: "Stop", nl: "Stoppen", ar: "إيقاف", tr: "Durdur", ur: "روکیں" },

  // Aya-by-aya Tarteel flow
  "aya.playAya": { fr: "▶ Écouter l'aya", en: "▶ Listen to aya", nl: "▶ Luister naar aya", ar: "▶ استمع للآية", tr: "▶ Ayeti dinle", ur: "▶ آیت سنیں" },
  "aya.reciteNow": { fr: "🎤 Récitez cette aya !", en: "🎤 Recite this aya!", nl: "🎤 Reciteer deze aya!", ar: "🎤 اتلُ هذه الآية!", tr: "🎤 Bu ayeti oku!", ur: "🎤 یہ آیت پڑھیں!" },
  "aya.listening": { fr: "🎙️ J'écoute... Appuyez pour arrêter", en: "🎙️ Listening... Tap to stop", nl: "🎙️ Luisteren... Tik om te stoppen", ar: "🎙️ أستمع... اضغط للإيقاف", tr: "🎙️ Dinleniyor... Durdurmak için dokun", ur: "🎙️ سن رہا ہوں... روکنے کے لیے دبائیں" },
  "aya.tapToRecite": { fr: "Appuyez sur le micro pour réciter", en: "Tap the mic to recite", nl: "Tik op de microfoon om te reciteren", ar: "اضغط على الميكروفون للتلاوة", tr: "Okumak için mikrofona dokun", ur: "تلاوت کے لیے مائیک دبائیں" },
  "aya.micDenied": { fr: "Permission micro refusée", en: "Microphone permission denied", nl: "Microfoontoestemming geweigerd", ar: "تم رفض إذن الميكروفون", tr: "Mikrofon izni reddedildi", ur: "مائیکروفون کی اجازت سے انکار" },
  "aya.micDeniedHint": {
    fr: "Allez dans les réglages de votre navigateur et autorisez l'accès au micro pour ce site, puis réessayez.",
    en: "Go to your browser settings and allow microphone access for this site, then try again.",
    nl: "Ga naar je browserinstellingen en sta microfoontoegang toe voor deze site.",
    ar: "اذهب إلى إعدادات المتصفح واسمح بالوصول إلى الميكروفون لهذا الموقع.",
    tr: "Tarayıcı ayarlarına gidin ve bu site için mikrofon erişimine izin verin.",
    ur: "براؤزر کی ترتیبات میں جائیں اور اس سائٹ کے لیے مائیکروفون کی اجازت دیں۔",
  },
  "aya.retryMic": { fr: "Réessayer", en: "Retry", nl: "Opnieuw proberen", ar: "إعادة المحاولة", tr: "Tekrar dene", ur: "دوبارہ کوشش" },
  "aya.correct": { fr: "Correct ! ✓", en: "Correct! ✓", nl: "Correct! ✓", ar: "صحيح! ✓", tr: "Doğru! ✓", ur: "درست! ✓" },
  "aya.incorrect": { fr: "Réessayez ✗", en: "Try again ✗", nl: "Probeer opnieuw ✗", ar: "حاول مرة أخرى ✗", tr: "Tekrar dene ✗", ur: "دوبارہ کوشش ✗" },
  "aya.retry": { fr: "Réessayer cette aya", en: "Retry this aya", nl: "Deze aya opnieuw", ar: "إعادة هذه الآية", tr: "Bu ayeti tekrarla", ur: "یہ آیت دوبارہ" },
  "aya.skip": { fr: "Passer →", en: "Skip →", nl: "Overslaan →", ar: "→ تخطي", tr: "Atla →", ur: "→ چھوڑیں" },
  "aya.pause": { fr: "Pause", en: "Pause", nl: "Pauze", ar: "إيقاف مؤقت", tr: "Duraklat", ur: "وقفہ" },
  "aya.resume": { fr: "Reprendre", en: "Resume", nl: "Hervatten", ar: "استئناف", tr: "Devam et", ur: "جاری رکھیں" },
  "aya.next": { fr: "Suivant", en: "Next", nl: "Volgende", ar: "التالي", tr: "Sonraki", ur: "اگلا" },
  "aya.prev": { fr: "Précédent", en: "Previous", nl: "Vorige", ar: "السابق", tr: "Önceki", ur: "پچھلا" },
  "aya.repeatX3": { fr: "Répéter ×3", en: "Repeat ×3", nl: "Herhaal ×3", ar: "إعادة ×3", tr: "3× Tekrarla", ur: "3× دہرائیں" },
  "aya.progress": { fr: "Aya", en: "Aya", nl: "Aya", ar: "آية", tr: "Ayet", ur: "آیت" },
  "aya.surahComplete": { fr: "Sourate terminée !", en: "Surah complete!", nl: "Soera voltooid!", ar: "اكتملت السورة!", tr: "Sure tamamlandı!", ur: "سورۃ مکمل!" },
  "aya.perfectAyas": { fr: "ayas parfaites !", en: "perfect ayas!", nl: "perfecte aya's!", ar: "آيات مثالية!", tr: "mükemmel ayet!", ur: "کامل آیات!" },
  "aya.score": { fr: "Score final", en: "Final score", nl: "Eindscore", ar: "النتيجة النهائية", tr: "Son puan", ur: "حتمی نمبر" },
  "aya.errors": { fr: "Erreurs à revoir", en: "Errors to review", nl: "Fouten om te herzien", ar: "أخطاء للمراجعة", tr: "Gözden geçirilecek hatalar", ur: "نظرثانی کی غلطیاں" },
  "aya.badge5": { fr: "5 ayas parfaites ! 🌟", en: "5 perfect ayas! 🌟", nl: "5 perfecte aya's! 🌟", ar: "5 آيات مثالية! 🌟", tr: "5 mükemmel ayet! 🌟", ur: "5 کامل آیات! 🌟" },
  "aya.badge10": { fr: "10 ayas parfaites ! 🏆", en: "10 perfect ayas! 🏆", nl: "10 perfecte aya's! 🏆", ar: "10 آيات مثالية! 🏆", tr: "10 mükemmel ayet! 🏆", ur: "10 کامل آیات! 🏆" },
  "aya.badgeAll": { fr: "Sourate parfaite ! 👑", en: "Perfect surah! 👑", nl: "Perfecte soera! 👑", ar: "سورة مثالية! 👑", tr: "Mükemmel sure! 👑", ur: "کامل سورۃ! 👑" },
  "aya.translation": { fr: "Traduction", en: "Translation", nl: "Vertaling", ar: "الترجمة", tr: "Çeviri", ur: "ترجمہ" },
  "aya.voiceUnsupported": { fr: "Reconnaissance vocale non supportée. Utilisez Chrome.", en: "Voice recognition not supported. Use Chrome.", nl: "Spraakherkenning niet ondersteund. Gebruik Chrome.", ar: "التعرف على الصوت غير مدعوم. استخدم Chrome.", tr: "Ses tanıma desteklenmiyor. Chrome kullanın.", ur: "آواز کی شناخت دستیاب نہیں۔ Chrome استعمال کریں۔" },
  "aya.autoNext": { fr: "Aya suivante dans...", en: "Next aya in...", nl: "Volgende aya in...", ar: "...الآية التالية في", tr: "Sonraki ayet...", ur: "...اگلی آیت" },
  "nav.quran": { fr: "Tarteel", en: "Tarteel", nl: "Tarteel", ar: "ترتيل", tr: "Tertil", ur: "ترتیل" },
  "nav.prayers": { fr: "Prières", en: "Prayers", nl: "Gebeden", ar: "الصلوات", tr: "Namazlar", ur: "نمازیں" },

  // Dictation mode
  "dictation.title": { fr: "Mode dictée", en: "Dictation mode", nl: "Dicteermodus", ar: "وضع الإملاء", tr: "Dikte modu", ur: "ڈکٹیشن موڈ" },
  "dictation.serverMode": { fr: "Mode serveur (fallback)", en: "Server mode (fallback)", nl: "Servermodus (fallback)", ar: "وضع الخادم (احتياطي)", tr: "Sunucu modu (yedek)", ur: "سرور موڈ (متبادل)" },
  "dictation.webSpeechMode": { fr: "Reconnaissance vocale", en: "Voice recognition", nl: "Spraakherkenning", ar: "التعرف على الصوت", tr: "Ses tanıma", ur: "آواز کی شناخت" },
  "dictation.showText": { fr: "Afficher le texte", en: "Show text", nl: "Tekst tonen", ar: "عرض النص", tr: "Metni göster", ur: "متن دکھائیں" },
  "dictation.instructions": { fr: "Récitez la sourate entière de mémoire", en: "Recite the entire surah from memory", nl: "Reciteer de volledige soera uit het hoofd", ar: "اتلُ السورة كاملة من الذاكرة", tr: "Tüm sureyi ezbere oku", ur: "پوری سورۃ حفظ سے پڑھیں" },
  "dictation.instructionsHint": { fr: "Les mots corrects apparaîtront en vert, les erreurs en rouge", en: "Correct words will appear in green, errors in red", nl: "Correcte woorden worden groen, fouten rood", ar: "ستظهر الكلمات الصحيحة بالأخضر والأخطاء بالأحمر", tr: "Doğru kelimeler yeşil, hatalar kırmızı görünür", ur: "درست الفاظ سبز اور غلطیاں سرخ دکھائی دیں گی" },
  "dictation.startReciting": { fr: "Commencer à réciter", en: "Start reciting", nl: "Begin met reciteren", ar: "ابدأ التلاوة", tr: "Okumaya başla", ur: "تلاوت شروع کریں" },
  "dictation.listening": { fr: "J'écoute votre récitation...", en: "Listening to your recitation...", nl: "Luisteren naar je recitatie...", ar: "...أستمع لتلاوتك", tr: "Tilavetinizi dinliyorum...", ur: "...آپ کی تلاوت سن رہا ہوں" },
  "dictation.rawTranscript": { fr: "Transcription brute :", en: "Raw transcript:", nl: "Ruwe transcriptie:", ar: "النص الخام:", tr: "Ham metin:", ur: "خام متن:" },
  "dictation.stopReciting": { fr: "Arrêter et voir les résultats", en: "Stop and see results", nl: "Stoppen en resultaten zien", ar: "توقف وشاهد النتائج", tr: "Dur ve sonuçları gör", ur: "رکیں اور نتائج دیکھیں" },
  "dictation.excellent": { fr: "Excellent ! Macha Allah ! 🌟", en: "Excellent! Masha Allah! 🌟", nl: "Uitstekend! Masha Allah! 🌟", ar: "ممتاز! ماشاء الله! 🌟", tr: "Mükemmel! Maşallah! 🌟", ur: "بہترین! ماشاءاللہ! 🌟" },
  "dictation.good": { fr: "Bien ! Continuez 💪", en: "Good! Keep going 💪", nl: "Goed! Ga zo door 💪", ar: "جيد! واصل 💪", tr: "İyi! Devam et 💪", ur: "اچھا! جاری رکھیں 💪" },
  "dictation.needsWork": { fr: "À retravailler 📖", en: "Needs more practice 📖", nl: "Meer oefening nodig 📖", ar: "يحتاج مزيدًا من التدريب 📖", tr: "Daha fazla çalışma gerekli 📖", ur: "مزید مشق درکار 📖" },
  "dictation.wordsCorrect": { fr: "mots corrects", en: "words correct", nl: "woorden correct", ar: "كلمات صحيحة", tr: "doğru kelime", ur: "درست الفاظ" },
  "dictation.legendCorrect": { fr: "Correct", en: "Correct", nl: "Correct", ar: "صحيح", tr: "Doğru", ur: "درست" },
  "dictation.legendIncorrect": { fr: "Incorrect", en: "Incorrect", nl: "Incorrect", ar: "خطأ", tr: "Yanlış", ur: "غلط" },
  "dictation.legendMissing": { fr: "Manquant", en: "Missing", nl: "Ontbreekt", ar: "مفقود", tr: "Eksik", ur: "غائب" },
  "dictation.legendExtra": { fr: "En trop", en: "Extra", nl: "Overbodig", ar: "زائد", tr: "Fazla", ur: "زائد" },
  "dictation.ayahBreakdown": { fr: "Détail par aya", en: "Per-aya breakdown", nl: "Detail per aya", ar: "تفصيل لكل آية", tr: "Ayet bazında detay", ur: "آیت کے لحاظ سے تفصیل" },
  "dictation.restart": { fr: "Recommencer", en: "Restart", nl: "Opnieuw", ar: "إعادة", tr: "Yeniden başla", ur: "دوبارہ شروع" },
  "dictation.retryErrors": { fr: "Retravailler les erreurs", en: "Retry errors", nl: "Fouten herhalen", ar: "إعادة الأخطاء", tr: "Hataları tekrarla", ur: "غلطیاں دوبارہ" },
  "dictation.modeAya": { fr: "Verset par verset", en: "Verse by verse", nl: "Vers per vers", ar: "آية بآية", tr: "Ayet ayet", ur: "آیت بہ آیت" },
  "dictation.modeSurah": { fr: "Sourate complète", en: "Full surah", nl: "Volledige soera", ar: "سورة كاملة", tr: "Tam sure", ur: "مکمل سورۃ" },

  // Prayers
  "prayers.title": { fr: "Prières", en: "Prayers", nl: "Gebeden", ar: "الصلوات", tr: "Namazlar", ur: "نمازیں" },
  "prayers.next": { fr: "Prochaine prière", en: "Next prayer", nl: "Volgend gebed", ar: "الصلاة القادمة", tr: "Sonraki namaz", ur: "اگلی نماز" },
  "prayers.qibla": { fr: "Direction de la Qibla", en: "Qibla Direction", nl: "Qibla-richting", ar: "اتجاه القبلة", tr: "Kıble Yönü", ur: "قبلہ کی سمت" },
  "prayers.enableCompass": { fr: "Activer la boussole", en: "Enable compass", nl: "Kompas inschakelen", ar: "تفعيل البوصلة", tr: "Pusula aç", ur: "کمپاس فعال کریں" },
  "prayers.fromNorth": { fr: "depuis le Nord", en: "from North", nl: "vanaf het Noorden", ar: "من الشمال", tr: "Kuzeyden", ur: "شمال سے" },
  "prayers.fromQibla": { fr: "de la Qibla", en: "from Qibla", nl: "van Qibla", ar: "عن القبلة", tr: "Kıbleden", ur: "قبلہ سے" },
  "prayers.qiblaFound": { fr: "Qibla trouvée ! ✅", en: "Qibla found! ✅", nl: "Qibla gevonden! ✅", ar: "تم العثور على القبلة! ✅", tr: "Kıble bulundu! ✅", ur: "قبلہ مل گیا! ✅" },
  "prayers.times": { fr: "Horaires du jour", en: "Today's times", nl: "Tijden vandaag", ar: "مواعيد اليوم", tr: "Bugünün vakitleri", ur: "آج کے اوقات" },
  "prayers.error": { fr: "Impossible de charger les horaires", en: "Could not load times", nl: "Kon tijden niet laden", ar: "تعذّر تحميل المواعيد", tr: "Vakitler yüklenemedi", ur: "اوقات لوڈ نہیں ہو سکے" },
  "prayers.fajr": { fr: "Fajr", en: "Fajr", nl: "Fajr", ar: "الفجر", tr: "Fecir", ur: "فجر" },
  "prayers.dhuhr": { fr: "Dhuhr", en: "Dhuhr", nl: "Dhuhr", ar: "الظهر", tr: "Öğle", ur: "ظہر" },
  "prayers.asr": { fr: "Asr", en: "Asr", nl: "Asr", ar: "العصر", tr: "İkindi", ur: "عصر" },
  "prayers.maghrib": { fr: "Maghrib", en: "Maghrib", nl: "Maghrib", ar: "المغرب", tr: "Akşam", ur: "مغرب" },
  "prayers.isha": { fr: "Isha", en: "Isha", nl: "Isha", ar: "العشاء", tr: "Yatsı", ur: "عشاء" },

  // Quiz categories
  "quiz.category.general": { fr: "Culture générale", en: "General knowledge", nl: "Algemene kennis", ar: "ثقافة عامة", tr: "Genel kültür", ur: "عمومی معلومات" },
  "quiz.category.memorization": { fr: "Mémorisation Coran", en: "Quran memorization", nl: "Koran memorisatie", ar: "حفظ القرآن", tr: "Kur'an ezberleme", ur: "قرآن حفظ" },
  "quiz.category.tajweed": { fr: "Tajwid & Signes d'arrêt", en: "Tajweed & Stop signs", nl: "Tajweed & Stoptekens", ar: "التجويد وعلامات الوقف", tr: "Tecvid & Durma işaretleri", ur: "تجوید اور وقف کی علامات" },
  "quiz.category.kids": { fr: "Histoires des Prophètes", en: "Prophet stories", nl: "Profeetverhalen", ar: "قصص الأنبياء", tr: "Peygamber hikayeleri", ur: "انبیاء کے قصے" },
  "quiz.category.perfect": { fr: "🌟 Mode Parfait", en: "🌟 Perfect Mode", nl: "🌟 Perfect Modus", ar: "🌟 الوضع المثالي", tr: "🌟 Mükemmel Mod", ur: "🌟 کامل موڈ" },
  "quiz.category.adaptive": { fr: "🔄 Révision adaptative", en: "🔄 Adaptive Review", nl: "🔄 Adaptieve revisie", ar: "🔄 مراجعة تكيفية", tr: "🔄 Uyarlanabilir Tekrar", ur: "🔄 موافق مراجعہ" },
  "quiz.perfectDesc": { fr: "Teste ta mémorisation sans aucune erreur", en: "Test your memorization with zero errors", nl: "Test je geheugen zonder fouten", ar: "اختبر حفظك بدون أي خطأ", tr: "Ezberini sıfır hatayla test et", ur: "بغیر کسی غلطی حفظ ٹیسٹ کریں" },
  "quiz.new": { fr: "Nouveau", en: "New", nl: "Nieuw", ar: "جديد", tr: "Yeni", ur: "نیا" },
  "quiz.otherQuiz": { fr: "Autres quiz", en: "Other quizzes", nl: "Andere quizzen", ar: "اختبارات أخرى", tr: "Diğer quizler", ur: "دیگر کوئزز" },
  "quiz.retry": { fr: "Recommencer", en: "Retry", nl: "Opnieuw", ar: "إعادة", tr: "Tekrar dene", ur: "دوبارہ کوشش" },
  "quiz.flashcardsDesc": { fr: "12 prophètes à découvrir", en: "12 prophets to discover", nl: "12 profeten om te ontdekken", ar: "12 نبياً لاكتشافهم", tr: "Keşfedilecek 12 peygamber", ur: "دریافت کرنے کے لیے 12 انبیاء" },
  "quiz.chooseCategory": { fr: "Choisissez une catégorie", en: "Choose a category", nl: "Kies een categorie", ar: "اختر فئة", tr: "Bir kategori seç", ur: "ایک قسم منتخب کریں" },
  "quiz.flashcards": { fr: "Flashcards Prophètes", en: "Prophet Flashcards", nl: "Profeet Flashcards", ar: "بطاقات الأنبياء", tr: "Peygamber Kartları", ur: "انبیاء کارڈز" },

  // Flashcards
  "flashcards.tapToReveal": { fr: "Touchez pour révéler", en: "Tap to reveal", nl: "Tik om te onthullen", ar: "اضغط للكشف", tr: "Görmek için dokun", ur: "ظاہر کرنے کے لیے دبائیں" },
  "flashcards.mastered": { fr: "Maîtrisé !", en: "Mastered!", nl: "Beheerst!", ar: "تم إتقانها!", tr: "Ezberlendi!", ur: "مکمل!" },
  "flashcards.markMastered": { fr: "Marquer comme maîtrisé", en: "Mark as mastered", nl: "Markeer als beheerst", ar: "وضع علامة إتقان", tr: "Ezberlendi olarak işaretle", ur: "مکمل نشان لگائیں" },

  // Waqf signs
  "waqf.obligatory": { fr: "Arrêt obligatoire", en: "Obligatory stop", nl: "Verplichte stop", ar: "وقف لازم", tr: "Zorunlu duruş", ur: "لازمی وقف" },
  "waqf.complete": { fr: "Arrêt complet recommandé", en: "Complete stop recommended", nl: "Volledige stop aanbevolen", ar: "وقف تام", tr: "Tam duruş tavsiye edilir", ur: "مکمل وقف تجویز" },
  "waqf.permissible": { fr: "Arrêt permis", en: "Permissible stop", nl: "Toegestane stop", ar: "وقف جائز", tr: "Caiz duruş", ur: "جائز وقف" },
  "waqf.sufficient": { fr: "Arrêt suffisant", en: "Sufficient stop", nl: "Voldoende stop", ar: "وقف كافٍ", tr: "Yeterli duruş", ur: "کافی وقف" },
  "waqf.good": { fr: "Bon arrêt", en: "Good stop", nl: "Goede stop", ar: "وقف حسن", tr: "İyi duruş", ur: "اچھا وقف" },

  // Progress quiz stats
  "progress.quizStats": { fr: "Statistiques quiz", en: "Quiz statistics", nl: "Quizstatistieken", ar: "إحصائيات الاختبار", tr: "Test istatistikleri", ur: "امتحان کے اعدادوشمار" },
  "progress.quizSuccess": { fr: "Réussite quiz", en: "Quiz success", nl: "Quiz succes", ar: "نجاح الاختبار", tr: "Test başarısı", ur: "امتحان کامیابی" },
  "progress.quizCompleted": { fr: "Quiz complétés", en: "Quizzes completed", nl: "Quizzen voltooid", ar: "اختبارات مكتملة", tr: "Tamamlanan testler", ur: "مکمل امتحانات" },

  // Prayer settings
  "prayers.settings.title": { fr: "Paramètres des prières", en: "Prayer settings", nl: "Gebedsinstellingen", ar: "إعدادات الصلاة", tr: "Namaz ayarları", ur: "نماز کی ترتیبات" },
  "prayers.settings.location": { fr: "Localisation", en: "Location", nl: "Locatie", ar: "الموقع", tr: "Konum", ur: "مقام" },
  "prayers.settings.city": { fr: "Ville", en: "City", nl: "Stad", ar: "المدينة", tr: "Şehir", ur: "شہر" },
  "prayers.settings.cityPlaceholder": { fr: "Ex : Bruxelles, Paris…", en: "E.g. Brussels, Paris…", nl: "Bv. Brussel, Parijs…", ar: "مثال: بروكسل، باريس…", tr: "Ör. İstanbul, Ankara…", ur: "مثلاً: لاہور، کراچی…" },
  "prayers.settings.countryPlaceholder": { fr: "Pays (optionnel)", en: "Country (optional)", nl: "Land (optioneel)", ar: "البلد (اختياري)", tr: "Ülke (isteğe bağlı)", ur: "ملک (اختیاری)" },
  "prayers.settings.method": { fr: "Méthode de calcul", en: "Calculation method", nl: "Berekeningsmethode", ar: "طريقة الحساب", tr: "Hesaplama yöntemi", ur: "حساب کا طریقہ" },
  "prayers.settings.madhab": { fr: "Madhhab (Asr)", en: "Madhhab (Asr)", nl: "Madhhab (Asr)", ar: "المذهب (العصر)", tr: "Mezhep (İkindi)", ur: "مذہب (عصر)" },
  "prayers.settings.shafii": { fr: "Standard (Shafi'i)", en: "Standard (Shafi'i)", nl: "Standaard (Shafi'i)", ar: "شافعي (عادي)", tr: "Standart (Şafii)", ur: "معیاری (شافعی)" },
  "prayers.settings.hanafi": { fr: "Hanafi", en: "Hanafi", nl: "Hanafi", ar: "حنفي", tr: "Hanefi", ur: "حنفی" },
  "prayers.settings.latitudeMethod": { fr: "Méthode haute latitude", en: "High latitude method", nl: "Hoge breedtegraad methode", ar: "طريقة خطوط العرض العالية", tr: "Yüksek enlem yöntemi", ur: "بلند عرض البلد کا طریقہ" },
  "prayers.settings.midNight": { fr: "Milieu de la nuit", en: "Middle of the Night", nl: "Midden van de nacht", ar: "منتصف الليل", tr: "Gece yarısı", ur: "آدھی رات" },
  "prayers.settings.oneSeventh": { fr: "Un septième de la nuit", en: "One Seventh of the Night", nl: "Een zevende van de nacht", ar: "سُبع الليل", tr: "Gecenin yedide biri", ur: "رات کا ساتواں حصہ" },
  "prayers.settings.angleBased": { fr: "Basée sur l'angle", en: "Angle based", nl: "Hoekgebaseerd", ar: "على أساس الزاوية", tr: "Açı tabanlı", ur: "زاویہ پر مبنی" },
  "prayers.settings.save": { fr: "Enregistrer", en: "Save", nl: "Opslaan", ar: "حفظ", tr: "Kaydet", ur: "محفوظ کریں" },
  "prayers.settings.button": { fr: "Paramètres", en: "Settings", nl: "Instellingen", ar: "الإعدادات", tr: "Ayarlar", ur: "ترتیبات" },
  "prayers.horairesPour": { fr: "Horaires pour", en: "Times for", nl: "Tijden voor", ar: "مواعيد لـ", tr: "Vakitler:", ur: "اوقات برائے" },

  // Notifications
  "prayers.notif.title": { fr: "Notifications", en: "Notifications", nl: "Meldingen", ar: "الإشعارات", tr: "Bildirimler", ur: "اطلاعات" },
  "prayers.notif.enable": { fr: "Activer les notifications", en: "Enable notifications", nl: "Meldingen inschakelen", ar: "تفعيل الإشعارات", tr: "Bildirimleri aç", ur: "اطلاعات فعال کریں" },
  "prayers.notif.offset": { fr: "min avant l'adhan", en: "min before adhan", nl: "min voor adhan", ar: "دقيقة قبل الأذان", tr: "dk ezan öncesi", ur: "منٹ اذان سے پہلے" },
  "prayers.notif.unsupported": { fr: "Notifications non supportées sur cet appareil", en: "Notifications not supported on this device", nl: "Meldingen niet ondersteund op dit apparaat", ar: "الإشعارات غير مدعومة على هذا الجهاز", tr: "Bu cihazda bildirimler desteklenmiyor", ur: "اس آلے پر اطلاعات دستیاب نہیں" },
   "prayers.notif.denied": { fr: "Permission refusée. Activez les notifications dans les réglages de votre navigateur.", en: "Permission denied. Enable notifications in your browser settings.", nl: "Toestemming geweigerd. Schakel meldingen in via je browserinstellingen.", ar: "تم رفض الإذن. فعّل الإشعارات من إعدادات المتصفح.", tr: "İzin reddedildi. Tarayıcı ayarlarından bildirimleri açın.", ur: "اجازت سے انکار۔ براؤزر کی ترتیبات سے اطلاعات فعال کریں۔" },

  // Hijri Calendar
  "calendar.title": { fr: "Calendrier Hijri", en: "Hijri Calendar", nl: "Hijri Kalender", ar: "التقويم الهجري", tr: "Hicri Takvim", ur: "ہجری کیلنڈر" },
  "calendar.events": { fr: "Événements", en: "Events", nl: "Evenementen", ar: "الأحداث", tr: "Etkinlikler", ur: "تقریبات" },
  "calendar.sun": { fr: "Dim", en: "Sun", nl: "Zo", ar: "أحد", tr: "Paz", ur: "اتوار" },
  "calendar.mon": { fr: "Lun", en: "Mon", nl: "Ma", ar: "إثن", tr: "Pzt", ur: "پیر" },
  "calendar.tue": { fr: "Mar", en: "Tue", nl: "Di", ar: "ثلا", tr: "Sal", ur: "منگل" },
  "calendar.wed": { fr: "Mer", en: "Wed", nl: "Wo", ar: "أرب", tr: "Çar", ur: "بدھ" },
  "calendar.thu": { fr: "Jeu", en: "Thu", nl: "Do", ar: "خمي", tr: "Per", ur: "جمعرات" },
  "calendar.fri": { fr: "Ven", en: "Fri", nl: "Vr", ar: "جمع", tr: "Cum", ur: "جمعہ" },
  "calendar.sat": { fr: "Sam", en: "Sat", nl: "Za", ar: "سبت", tr: "Cmt", ur: "ہفتہ" },
  "calendar.month.1": { fr: "Janvier", en: "January", nl: "Januari", ar: "يناير", tr: "Ocak", ur: "جنوری" },
  "calendar.month.2": { fr: "Février", en: "February", nl: "Februari", ar: "فبراير", tr: "Şubat", ur: "فروری" },
  "calendar.month.3": { fr: "Mars", en: "March", nl: "Maart", ar: "مارس", tr: "Mart", ur: "مارچ" },
  "calendar.month.4": { fr: "Avril", en: "April", nl: "April", ar: "أبريل", tr: "Nisan", ur: "اپریل" },
  "calendar.month.5": { fr: "Mai", en: "May", nl: "Mei", ar: "مايو", tr: "Mayıs", ur: "مئی" },
  "calendar.month.6": { fr: "Juin", en: "June", nl: "Juni", ar: "يونيو", tr: "Haziran", ur: "جون" },
  "calendar.month.7": { fr: "Juillet", en: "July", nl: "Juli", ar: "يوليو", tr: "Temmuz", ur: "جولائی" },
  "calendar.month.8": { fr: "Août", en: "August", nl: "Augustus", ar: "أغسطس", tr: "Ağustos", ur: "اگست" },
  "calendar.month.9": { fr: "Septembre", en: "September", nl: "September", ar: "سبتمبر", tr: "Eylül", ur: "ستمبر" },
  "calendar.month.10": { fr: "Octobre", en: "October", nl: "Oktober", ar: "أكتوبر", tr: "Ekim", ur: "اکتوبر" },
  "calendar.month.11": { fr: "Novembre", en: "November", nl: "November", ar: "نوفمبر", tr: "Kasım", ur: "نومبر" },
  "calendar.month.12": { fr: "Décembre", en: "December", nl: "December", ar: "ديسمبر", tr: "Aralık", ur: "دسمبر" },
  "calendar.hijriMonth.1": { fr: "Mouharram", en: "Muharram", nl: "Moeharram", ar: "محرّم", tr: "Muharrem", ur: "محرم" },
  "calendar.hijriMonth.2": { fr: "Safar", en: "Safar", nl: "Safar", ar: "صفر", tr: "Safer", ur: "صفر" },
  "calendar.hijriMonth.3": { fr: "Rabi al-Awwal", en: "Rabi al-Awwal", nl: "Rabi al-Awwal", ar: "ربيع الأوّل", tr: "Rebiülevvel", ur: "ربیع الاول" },
  "calendar.hijriMonth.4": { fr: "Rabi al-Thani", en: "Rabi al-Thani", nl: "Rabi al-Thani", ar: "ربيع الثاني", tr: "Rebiülahir", ur: "ربیع الثانی" },
  "calendar.hijriMonth.5": { fr: "Joumada al-Oula", en: "Jumada al-Ula", nl: "Jumada al-Ula", ar: "جمادى الأولى", tr: "Cemaziyelevvel", ur: "جمادی الاول" },
  "calendar.hijriMonth.6": { fr: "Joumada al-Thania", en: "Jumada al-Thani", nl: "Jumada al-Thani", ar: "جمادى الثانية", tr: "Cemaziyelahir", ur: "جمادی الثانی" },
  "calendar.hijriMonth.7": { fr: "Rajab", en: "Rajab", nl: "Rajab", ar: "رجب", tr: "Recep", ur: "رجب" },
  "calendar.hijriMonth.8": { fr: "Chaabane", en: "Sha'ban", nl: "Sha'ban", ar: "شعبان", tr: "Şaban", ur: "شعبان" },
  "calendar.hijriMonth.9": { fr: "Ramadan", en: "Ramadan", nl: "Ramadan", ar: "رمضان", tr: "Ramazan", ur: "رمضان" },
  "calendar.hijriMonth.10": { fr: "Chawwal", en: "Shawwal", nl: "Shawwal", ar: "شوّال", tr: "Şevval", ur: "شوال" },
  "calendar.hijriMonth.11": { fr: "Dhoul Qi'da", en: "Dhul Qi'dah", nl: "Dhul Qi'dah", ar: "ذو القعدة", tr: "Zilkade", ur: "ذوالقعدہ" },
  "calendar.hijriMonth.12": { fr: "Dhoul Hijja", en: "Dhul Hijjah", nl: "Dhul Hijjah", ar: "ذو الحجة", tr: "Zilhicce", ur: "ذوالحجہ" },

  // Juz
  "juz.title": { fr: "Mode Juz", en: "Juz Mode", nl: "Juz Modus", ar: "وضع الجزء", tr: "Cüz Modu", ur: "جز موڈ" },
  "juz.subtitle": { fr: "Mémorisez le Coran par Juz", en: "Memorize the Quran by Juz", nl: "Memoriseer de Koran per Juz", ar: "احفظ القرآن حسب الجزء", tr: "Kur'an'ı cüz cüz ezberle", ur: "قرآن جز کے لحاظ سے حفظ کریں" },
  "juz.notAvailable": { fr: "Non disponible", en: "Not available", nl: "Niet beschikbaar", ar: "غير متوفر", tr: "Mevcut değil", ur: "دستیاب نہیں" },
  "juz.startRevision": { fr: "Réviser ce Juz", en: "Review this Juz", nl: "Herhaal deze Juz", ar: "مراجعة هذا الجزء", tr: "Bu cüzü tekrarla", ur: "یہ جز دہرائیں" },
  "juz.viewAll": { fr: "Voir les 30 Juz", en: "View all 30 Juz", nl: "Bekijk alle 30 Juz", ar: "عرض الأجزاء الثلاثين", tr: "30 cüzü görüntüle", ur: "تمام 30 جز دیکھیں" },
  "juz.progress": { fr: "Progression par Juz", en: "Juz progress", nl: "Juz voortgang", ar: "تقدم الجزء", tr: "Cüz ilerlemesi", ur: "جز کی پیشرفت" },

  // Translation settings
  "settings.translationAuto": { fr: "Traduction automatique", en: "Auto translation", nl: "Automatische vertaling", ar: "ترجمة تلقائية", tr: "Otomatik çeviri", ur: "خودکار ترجمہ" },
  "settings.translationAutoDesc": { fr: "Selon la langue du système", en: "Based on system language", nl: "Op basis van systeemtaal", ar: "حسب لغة النظام", tr: "Sistem diline göre", ur: "نظام کی زبان کے مطابق" },
  "settings.translationManual": { fr: "Édition de traduction", en: "Translation edition", nl: "Vertalingseditie", ar: "إصدار الترجمة", tr: "Çeviri sürümü", ur: "ترجمے کا ایڈیشن" },

  // City detection
  "prayers.detectCity": { fr: "Détecter ma ville", en: "Detect my city", nl: "Detecteer mijn stad", ar: "اكتشف مدينتي", tr: "Şehrimi algıla", ur: "میرا شہر تلاش کریں" },
  "prayers.changeCity": { fr: "Changer", en: "Change", nl: "Wijzigen", ar: "تغيير", tr: "Değiştir", ur: "تبدیل کریں" },
  "prayers.noCity": { fr: "Aucune ville définie", en: "No city set", nl: "Geen stad ingesteld", ar: "لم يتم تحديد مدينة", tr: "Şehir belirlenmedi", ur: "کوئی شہر مقرر نہیں" },

  // Read-only mode
  "quran.readOnly": { fr: "Lecture seule", en: "Read only", nl: "Alleen lezen", ar: "قراءة فقط", tr: "Sadece oku", ur: "صرف پڑھنا" },
  "quran.readOnlyDesc": { fr: "Écoutez et lisez sans micro ni correction", en: "Listen and read without mic or correction", nl: "Luister en lees zonder microfoon of correctie", ar: "استمع واقرأ بدون ميكروفون أو تصحيح", tr: "Mikrofon veya düzeltme olmadan dinle ve oku", ur: "مائیک یا تصحیح کے بغیر سنیں اور پڑھیں" },

  // Hifz Control Mode
  "hifz.title": { fr: "Contrôle Hifz", en: "Hifz Check", nl: "Hifz Controle", ar: "اختبار الحفظ", tr: "Hıfz Kontrolü", ur: "حفظ ٹیسٹ" },
  "hifz.selectPassage": { fr: "Sélection du passage", en: "Select passage", nl: "Passage selecteren", ar: "اختيار المقطع", tr: "Pasaj seç", ur: "حصہ منتخب کریں" },
  "hifz.from": { fr: "De", en: "From", nl: "Van", ar: "من", tr: "Dan", ur: "سے" },
  "hifz.to": { fr: "À", en: "To", nl: "Tot", ar: "إلى", tr: "Kadar", ur: "تک" },
  "hifz.ayah": { fr: "Verset", en: "Verse", nl: "Vers", ar: "آية", tr: "Ayet", ur: "آیت" },
  "hifz.ayahsSelected": { fr: "versets sélectionnés", en: "verses selected", nl: "verzen geselecteerd", ar: "آيات مختارة", tr: "ayet seçildi", ur: "آیات منتخب" },
  "hifz.mode": { fr: "Mode de contrôle", en: "Check mode", nl: "Controlemodus", ar: "وضع الاختبار", tr: "Kontrol modu", ur: "جانچ کا موڈ" },
  "hifz.blocking": { fr: "Bloquant", en: "Blocking", nl: "Blokkerend", ar: "حظر", tr: "Engelleyici", ur: "بلاکنگ" },
  "hifz.blockingDesc": { fr: "Pause à chaque erreur", en: "Pauses on each error", nl: "Pauzeert bij elke fout", ar: "يتوقف عند كل خطأ", tr: "Her hatada durur", ur: "ہر غلطی پر رکتا ہے" },
  "hifz.observer": { fr: "Observation", en: "Observer", nl: "Observatie", ar: "مراقبة", tr: "Gözlemci", ur: "مشاہدہ" },
  "hifz.observerDesc": { fr: "Erreurs marquées, récap à la fin", en: "Errors marked, recap at the end", nl: "Fouten gemarkeerd, samenvatting aan het einde", ar: "تُحدَّد الأخطاء، ملخص في النهاية", tr: "Hatalar işaretlenir, sonda özet", ur: "غلطیاں نشان زد، آخر میں خلاصہ" },
  "hifz.tolerance": { fr: "Tolérance", en: "Tolerance", nl: "Tolerantie", ar: "التسامح", tr: "Tolerans", ur: "رواداری" },
  "hifz.strict": { fr: "Strict", en: "Strict", nl: "Strikt", ar: "صارم", tr: "Sıkı", ur: "سخت" },
  "hifz.medium": { fr: "Moyen", en: "Medium", nl: "Gemiddeld", ar: "متوسط", tr: "Orta", ur: "درمیانہ" },
  "hifz.lenient": { fr: "Tolérant", en: "Lenient", nl: "Tolerant", ar: "متساهل", tr: "Hoşgörülü", ur: "نرم" },
  "hifz.accessibility": { fr: "Symboles pour daltoniens", en: "Colorblind-friendly symbols", nl: "Kleurenblind-vriendelijke symbolen", ar: "رموز صديقة لعمى الألوان", tr: "Renk körlüğüne uygun semboller", ur: "رنگ اندھے پن کے لیے علامات" },
  "hifz.start": { fr: "Commencer le contrôle", en: "Start check", nl: "Start controle", ar: "ابدأ الاختبار", tr: "Kontrolü başlat", ur: "جانچ شروع کریں" },
  "hifz.errorDetected": { fr: "Erreur détectée !", en: "Error detected!", nl: "Fout gedetecteerd!", ar: "تم اكتشاف خطأ!", tr: "Hata tespit edildi!", ur: "غلطی پکڑی گئی!" },
  "hifz.correctOrIgnore": { fr: "Corrigez ou ignorez pour continuer", en: "Correct it or ignore to continue", nl: "Corrigeer of negeer om door te gaan", ar: "صحح أو تجاهل للمتابعة", tr: "Düzelt veya geç", ur: "درست کریں یا نظرانداز کریں" },
  "hifz.ignoreError": { fr: "Ignorer", en: "Ignore", nl: "Negeren", ar: "تجاهل", tr: "Geç", ur: "نظرانداز" },
  "hifz.retry": { fr: "Réessayer", en: "Retry", nl: "Opnieuw", ar: "إعادة المحاولة", tr: "Tekrar dene", ur: "دوبارہ کوشش" },
  "hifz.results": { fr: "Résultats du contrôle", en: "Check results", nl: "Controleresultaten", ar: "نتائج الاختبار", tr: "Kontrol sonuçları", ur: "جانچ کے نتائج" },
  "hifz.wordsCorrect": { fr: "mots corrects", en: "correct words", nl: "correcte woorden", ar: "كلمات صحيحة", tr: "doğru kelime", ur: "درست الفاظ" },
  "hifz.errorBreakdown": { fr: "Détail des erreurs", en: "Error breakdown", nl: "Foutendetails", ar: "تفاصيل الأخطاء", tr: "Hata detayları", ur: "غلطیوں کی تفصیل" },
  "hifz.incorrect": { fr: "Incorrect", en: "Incorrect", nl: "Onjuist", ar: "خاطئ", tr: "Yanlış", ur: "غلط" },
  "hifz.missing": { fr: "Manquant", en: "Missing", nl: "Ontbrekend", ar: "مفقود", tr: "Eksik", ur: "غائب" },
  "hifz.extra": { fr: "Ajouté", en: "Extra", nl: "Extra", ar: "إضافي", tr: "Fazla", ur: "اضافی" },
  "hifz.worstAyahs": { fr: "Versets à retravailler", en: "Verses to review", nl: "Verzen om te herzien", ar: "آيات للمراجعة", tr: "Tekrarlanacak ayetler", ur: "دہرانے والی آیات" },
  "hifz.ayahScores": { fr: "Scores par verset", en: "Scores per verse", nl: "Scores per vers", ar: "النتائج لكل آية", tr: "Ayet başına puanlar", ur: "آیت کے لحاظ سے نمبرات" },
  "hifz.modeLabel": { fr: "Contrôle", en: "Hifz Check", nl: "Controle", ar: "اختبار", tr: "Kontrol", ur: "جانچ" },

  // Tahaddi Mode
  "tahaddi.title": { fr: "Mode Tahaddi", en: "Tahaddi Challenge", nl: "Tahaddi Uitdaging", ar: "وضع التحدي", tr: "Tahaddi Meydan Okuması", ur: "تحدی موڈ" },
  "tahaddi.modeLabel": { fr: "Tahaddi", en: "Tahaddi", nl: "Tahaddi", ar: "تحدي", tr: "Tahaddi", ur: "تحدی" },
  "tahaddi.desc": { fr: "Récitez de mémoire, sans voir le texte", en: "Recite from memory, without seeing the text", nl: "Reciteer uit het geheugen, zonder de tekst te zien", ar: "اتلُ من الحفظ، بدون رؤية النص", tr: "Metni görmeden ezbere oku", ur: "متن دیکھے بغیر حفظ سے پڑھیں" },
  "tahaddi.descDetail": { fr: "Les versets se dévoilent uniquement quand vous les récitez correctement !", en: "Verses are only revealed when you recite them correctly!", nl: "Verzen worden pas onthuld als je ze correct reciteert!", ar: "تظهر الآيات فقط عند تلاوتها بشكل صحيح!", tr: "Ayetler yalnızca doğru okuduğunuzda ortaya çıkar!", ur: "آیات صرف اس وقت ظاہر ہوتی ہیں جب آپ درست پڑھیں!" },
  "tahaddi.threshold": { fr: "Seuil de similarité", en: "Similarity threshold", nl: "Gelijkenisdrempel", ar: "عتبة التشابه", tr: "Benzerlik eşiği", ur: "مماثلت کی حد" },
  "tahaddi.thresholdEasy": { fr: "Plus tolérant — idéal pour commencer", en: "More lenient — ideal for beginners", nl: "Meer tolerant — ideaal voor beginners", ar: "أكثر تسامحًا — مثالي للمبتدئين", tr: "Daha hoşgörülü — yeni başlayanlar için", ur: "زیادہ نرم — ابتدائی کے لیے" },
  "tahaddi.thresholdMedium": { fr: "Équilibré — recommandé", en: "Balanced — recommended", nl: "Gebalanceerd — aanbevolen", ar: "متوازن — موصى به", tr: "Dengeli — tavsiye edilen", ur: "متوازن — تجویز کردہ" },
  "tahaddi.thresholdHard": { fr: "Exigeant — pour les experts", en: "Demanding — for experts", nl: "Veeleisend — voor experts", ar: "صعب — للخبراء", tr: "Zorlu — uzmanlar için", ur: "مشکل — ماہرین کے لیے" },
  "tahaddi.start": { fr: "Lancer le défi", en: "Start challenge", nl: "Start uitdaging", ar: "ابدأ التحدي", tr: "Meydan okumayı başlat", ur: "چیلنج شروع کریں" },
  "tahaddi.revealed": { fr: "révélés", en: "revealed", nl: "onthuld", ar: "مكشوفة", tr: "açıldı", ur: "ظاہر" },
  "tahaddi.attempt": { fr: "Tentative", en: "Attempt", nl: "Poging", ar: "محاولة", tr: "Deneme", ur: "کوشش" },
  "tahaddi.similarity": { fr: "Similarité", en: "Similarity", nl: "Gelijkenis", ar: "التشابه", tr: "Benzerlik", ur: "مماثلت" },
  "tahaddi.reciteFromMemory": { fr: "Récitez ce verset de mémoire…", en: "Recite this verse from memory…", nl: "Reciteer dit vers uit het geheugen…", ar: "اتلُ هذه الآية من حفظك…", tr: "Bu ayeti ezbere oku…", ur: "یہ آیت حفظ سے پڑھیں…" },
  "tahaddi.notEnough": { fr: "Pas assez proche, réessayez", en: "Not close enough, try again", nl: "Niet dichtbij genoeg, probeer opnieuw", ar: "ليست قريبة بما فيه الكفاية، حاول مرة أخرى", tr: "Yeterince yakın değil, tekrar dene", ur: "کافی قریب نہیں، دوبارہ کوشش کریں" },
  "tahaddi.maxAttempts": { fr: "Nombre max de tentatives atteint", en: "Maximum attempts reached", nl: "Maximaal aantal pogingen bereikt", ar: "تم الوصول إلى الحد الأقصى من المحاولات", tr: "Maksimum deneme sayısına ulaşıldı", ur: "زیادہ سے زیادہ کوششیں ختم" },
  "tahaddi.results": { fr: "Résultats du défi", en: "Challenge results", nl: "Uitdagingsresultaten", ar: "نتائج التحدي", tr: "Meydan okuma sonuçları", ur: "چیلنج کے نتائج" },
  "tahaddi.excellent": { fr: "Excellent !", en: "Excellent!", nl: "Uitstekend!", ar: "ممتاز!", tr: "Mükemmel!", ur: "بہترین!" },
  "tahaddi.good": { fr: "Bien joué !", en: "Well done!", nl: "Goed gedaan!", ar: "أحسنت!", tr: "İyi oynadın!", ur: "شاباش!" },
  "tahaddi.keepPracticing": { fr: "Continue à pratiquer", en: "Keep practicing", nl: "Blijf oefenen", ar: "واصل التدريب", tr: "Pratik yapmaya devam et", ur: "مشق جاری رکھیں" },
  "tahaddi.ayahsRevealed": { fr: "versets révélés", en: "verses revealed", nl: "verzen onthuld", ar: "آيات مكشوفة", tr: "ayet açıldı", ur: "آیات ظاہر" },
  "tahaddi.perfectBadge": { fr: "Page parfaite !", en: "Perfect page!", nl: "Perfecte pagina!", ar: "صفحة مثالية!", tr: "Mükemmel sayfa!", ur: "کامل صفحہ!" },
  "tahaddi.perfectDesc": { fr: "Tout validé du 1er coup", en: "All validated on 1st try", nl: "Alles in 1 keer gevalideerd", ar: "تم التحقق من الكل من أول محاولة", tr: "İlk denemede hepsi doğrulandı", ur: "پہلی کوشش میں سب درست" },
  "tahaddi.stats": { fr: "Statistiques", en: "Statistics", nl: "Statistieken", ar: "إحصائيات", tr: "İstatistikler", ur: "اعدادوشمار" },
  "tahaddi.totalAttempts": { fr: "tentatives", en: "attempts", nl: "pogingen", ar: "محاولات", tr: "denemeler", ur: "کوششیں" },
  "tahaddi.duration": { fr: "durée", en: "duration", nl: "duur", ar: "المدة", tr: "süre", ur: "مدت" },
  "tahaddi.detail": { fr: "Détail par verset", en: "Per-verse detail", nl: "Detail per vers", ar: "تفاصيل لكل آية", tr: "Ayet detayı", ur: "آیت کی تفصیل" },
  "tahaddi.attempts": { fr: "essais", en: "tries", nl: "pogingen", ar: "محاولات", tr: "deneme", ur: "کوششیں" },
  "tahaddi.hintUsed": { fr: "indice utilisé", en: "hint used", nl: "hint gebruikt", ar: "تم استخدام التلميح", tr: "ipucu kullanıldı", ur: "اشارہ استعمال ہوا" },

  // Find Ayah (voice search)
  "findAyah.title": { fr: "Trouve l'ayah", en: "Find the Ayah", nl: "Vind de Ayah", ar: "اعثر على الآية", tr: "Ayeti Bul", ur: "آیت تلاش کریں" },
  "findAyah.subtitle": { fr: "Récitez et identifiez le verset", en: "Recite and identify the verse", nl: "Reciteer en identificeer het vers", ar: "اتلُ وحدد الآية", tr: "Oku ve ayeti tanımla", ur: "پڑھیں اور آیت شناخت کریں" },
  "findAyah.searchIn": { fr: "Chercher dans", en: "Search in", nl: "Zoeken in", ar: "البحث في", tr: "Ara:", ur: "تلاش کریں:" },
  "findAyah.scopeAll": { fr: "Tout le Coran", en: "Whole Quran", nl: "Hele Koran", ar: "القرآن كاملاً", tr: "Tüm Kur'an", ur: "پورا قرآن" },
  "findAyah.scopeSurah": { fr: "Sourate", en: "Surah", nl: "Soera", ar: "سورة", tr: "Sure", ur: "سورۃ" },
  "findAyah.instruction": { fr: "Appuyez sur le micro et récitez quelques mots d'un verset. L'app trouvera la sourate et l'ayah.", en: "Press the mic and recite a few words from a verse. The app will find the surah and ayah.", nl: "Druk op de microfoon en reciteer een paar woorden van een vers.", ar: "اضغط على المايك واتلُ بضع كلمات من آية. سيجد التطبيق السورة والآية.", tr: "Mikrofona bas ve bir ayetten birkaç kelime oku. Uygulama sureyi ve ayeti bulacak.", ur: "مائیک دبائیں اور آیت کے چند الفاظ پڑھیں۔ ایپ سورۃ اور آیت تلاش کرے گی۔" },
  "findAyah.tapToStart": { fr: "Appuyez et récitez", en: "Press and recite", nl: "Druk en reciteer", ar: "اضغط واتلُ", tr: "Bas ve oku", ur: "دبائیں اور پڑھیں" },
  "findAyah.listening": { fr: "Écoute en cours…", en: "Listening…", nl: "Luisteren…", ar: "جارٍ الاستماع…", tr: "Dinleniyor…", ur: "سن رہا ہے…" },
  "findAyah.searching": { fr: "Recherche dans le Coran…", en: "Searching the Quran…", nl: "Zoeken in de Koran…", ar: "جارٍ البحث في القرآن…", tr: "Kur'an'da aranıyor…", ur: "قرآن میں تلاش ہو رہی ہے…" },
  "findAyah.youRecited": { fr: "Vous avez récité", en: "You recited", nl: "Je reciteerde", ar: "ما تلوته", tr: "Okuduğunuz", ur: "آپ نے پڑھا" },
  "findAyah.noResults": { fr: "Aucun verset trouvé. Réessayez en récitant plus clairement.", en: "No verse found. Try again more clearly.", nl: "Geen vers gevonden. Probeer duidelijker.", ar: "لم يتم العثور على آية. حاول مرة أخرى بوضوح أكثر.", tr: "Ayet bulunamadı. Daha net okumayı deneyin.", ur: "کوئی آیت نہیں ملی۔ واضح طور پر دوبارہ پڑھیں۔" },
  "findAyah.verse": { fr: "Verset", en: "Verse", nl: "Vers", ar: "آية", tr: "Ayet", ur: "آیت" },
  "findAyah.listen": { fr: "Écouter", en: "Listen", nl: "Luisteren", ar: "استمع", tr: "Dinle", ur: "سنیں" },
  "findAyah.openMushaf": { fr: "Ouvrir", en: "Open", nl: "Openen", ar: "فتح", tr: "Aç", ur: "کھولیں" },
  "findAyah.searchAgain": { fr: "Nouvelle recherche", en: "Search again", nl: "Opnieuw zoeken", ar: "بحث جديد", tr: "Tekrar ara", ur: "دوبارہ تلاش" },
  "findAyah.micDenied": { fr: "Accès au micro refusé", en: "Microphone access denied", nl: "Microfoon geweigerd", ar: "تم رفض الوصول للميكروفون", tr: "Mikrofon erişimi reddedildi", ur: "مائیکروفون کی اجازت سے انکار" },
  "findAyah.micError": { fr: "Erreur microphone", en: "Microphone error", nl: "Microfoonfout", ar: "خطأ في الميكروفون", tr: "Mikrofon hatası", ur: "مائیکروفون کی خرابی" },
  "findAyah.tooShort": { fr: "Enregistrement trop court", en: "Recording too short", nl: "Opname te kort", ar: "التسجيل قصير جداً", tr: "Kayıt çok kısa", ur: "ریکارڈنگ بہت مختصر" },
  "findAyah.searchError": { fr: "Erreur de recherche", en: "Search error", nl: "Zoekfout", ar: "خطأ في البحث", tr: "Arama hatası", ur: "تلاش میں خرابی" },
  "findAyah.dismiss": { fr: "Fermer", en: "Dismiss", nl: "Sluiten", ar: "إغلاق", tr: "Kapat", ur: "بند کریں" },
  "findAyah.modeLabel": { fr: "Trouve l'ayah", en: "Find Ayah", nl: "Vind Ayah", ar: "اعثر على الآية", tr: "Ayeti Bul", ur: "آیت تلاش" },

  // Surah selector
  "surah.lastUsed": { fr: "Dernière sourate utilisée", en: "Last used surah", nl: "Laatst gebruikte soera", ar: "آخر سورة مستخدمة", tr: "Son kullanılan sure", ur: "آخری استعمال شدہ سورۃ" },
  "surah.recommended": { fr: "Recommandées pour débuter", en: "Recommended for beginners", nl: "Aanbevolen voor beginners", ar: "موصى بها للمبتدئين", tr: "Yeni başlayanlar için tavsiye", ur: "ابتدائی کے لیے تجویز کردہ" },
  "surah.continueWith": { fr: "Reprendre", en: "Continue", nl: "Doorgaan", ar: "متابعة", tr: "Devam et", ur: "جاری رکھیں" },

  // Hifz Map
  "hifzMap.title": { fr: "Carte Hifz", en: "Hifz Map", nl: "Hifz Kaart", ar: "خريطة الحفظ", tr: "Hıfz Haritası", ur: "حفظ نقشہ" },
  "hifzMap.subtitle": { fr: "Vue globale de votre mémorisation", en: "Global memorization overview", nl: "Globaal overzicht van je memorisatie", ar: "نظرة شاملة على حفظك", tr: "Genel ezberleme görünümü", ur: "حفظ کا مجموعی جائزہ" },
  "hifzMap.globalMastery": { fr: "Maîtrise globale", en: "Global mastery", nl: "Globale beheersing", ar: "الإتقان العام", tr: "Genel ustalık", ur: "مجموعی مہارت" },
  "hifzMap.strong": { fr: "Fort", en: "Strong", nl: "Sterk", ar: "قوي", tr: "Güçlü", ur: "مضبوط" },
  "hifzMap.medium": { fr: "À renforcer", en: "Needs work", nl: "Versterken", ar: "يحتاج تعزيز", tr: "Güçlendirmeli", ur: "مضبوط کرنا ضروری" },
  "hifzMap.weak": { fr: "Faible", en: "Weak", nl: "Zwak", ar: "ضعيف", tr: "Zayıf", ur: "کمزور" },
  "hifzMap.needsWork": { fr: "À renforcer", en: "Needs work", nl: "Te versterken", ar: "يحتاج تعزيز", tr: "Çalışma gerekli", ur: "کام کی ضرورت" },
  "hifzMap.surahsReviewed": { fr: "sourates révisées", en: "surahs reviewed", nl: "soera's herzien", ar: "سور تمت مراجعتها", tr: "tekrarlanan sure", ur: "دہرائی گئی سورتیں" },
  "hifzMap.byJuz": { fr: "Par Juz", en: "By Juz", nl: "Per Juz", ar: "حسب الجزء", tr: "Cüz bazında", ur: "جز کے لحاظ سے" },
  "hifzMap.reviewedSurahs": { fr: "Sourates révisées", en: "Reviewed surahs", nl: "Herziene soera's", ar: "السور التي تمت مراجعتها", tr: "Tekrarlanan sureler", ur: "دہرائی گئی سورتیں" },
  "hifzMap.sessions": { fr: "sessions", en: "sessions", nl: "sessies", ar: "جلسات", tr: "oturum", ur: "سیشن" },
  "hifzMap.surahsTotal": { fr: "sourates", en: "surahs", nl: "soera's", ar: "سور", tr: "sure", ur: "سورتیں" },
  "hifzMap.reviewed": { fr: "révisées", en: "reviewed", nl: "herzien", ar: "تمت مراجعتها", tr: "tekrarlandı", ur: "دہرائی گئیں" },
  "hifzMap.lastReview": { fr: "Dernière révision", en: "Last review", nl: "Laatste revisie", ar: "آخر مراجعة", tr: "Son tekrar", ur: "آخری دہرائی" },
  "hifzMap.bestScore": { fr: "Meilleur score", en: "Best score", nl: "Beste score", ar: "أفضل نتيجة", tr: "En iyi puan", ur: "بہترین نمبر" },
  "hifzMap.status": { fr: "Statut", en: "Status", nl: "Status", ar: "الحالة", tr: "Durum", ur: "حالت" },
  "hifzMap.neverReviewed": { fr: "Jamais révisée", en: "Never reviewed", nl: "Nooit herzien", ar: "لم تتم مراجعتها أبداً", tr: "Hiç tekrarlanmadı", ur: "کبھی نہیں دہرائی" },
  "hifzMap.wellMemorized": { fr: "Bien mémorisée", en: "Well memorized", nl: "Goed gememoriseerd", ar: "محفوظة جيداً", tr: "İyi ezberlenmiş", ur: "اچھی طرح یاد" },
  "hifzMap.needsMorePractice": { fr: "Nécessite plus de pratique", en: "Needs more practice", nl: "Meer oefening nodig", ar: "يحتاج مزيداً من التدريب", tr: "Daha fazla pratik gerekli", ur: "مزید مشق ضروری" },
  "hifzMap.notReviewedRecently": { fr: "Non révisée récemment", en: "Not reviewed recently", nl: "Recent niet herzien", ar: "لم تتم مراجعتها مؤخراً", tr: "Son zamanlarda tekrarlanmadı", ur: "حال ہی میں نہیں دہرائی" },
  "hifzMap.practiceNow": { fr: "Pratiquer maintenant", en: "Practice now", nl: "Nu oefenen", ar: "تدرب الآن", tr: "Şimdi çalış", ur: "ابھی مشق کریں" },
  "hifzMap.today": { fr: "Aujourd'hui", en: "Today", nl: "Vandaag", ar: "اليوم", tr: "Bugün", ur: "آج" },
  "hifzMap.yesterday": { fr: "Hier", en: "Yesterday", nl: "Gisteren", ar: "أمس", tr: "Dün", ur: "کل" },
  "hifzMap.daysAgo": { fr: "j", en: "d ago", nl: "d geleden", ar: "أيام", tr: "gün önce", ur: "دن پہلے" },
  "hifzMap.weeksAgo": { fr: "sem.", en: "w ago", nl: "w geleden", ar: "أسابيع", tr: "hafta önce", ur: "ہفتے پہلے" },
  "hifzMap.monthsAgo": { fr: "mois", en: "mo ago", nl: "ma geleden", ar: "أشهر", tr: "ay önce", ur: "مہینے پہلے" },

  // Parent / Teacher
  "parent.title": { fr: "Espace parent", en: "Parent area", nl: "Ouder sectie", ar: "مساحة الوالدين", tr: "Ebeveyn alanı", ur: "والدین کا حصہ" },
  "parent.subtitle": { fr: "Gérez et suivez les progrès", en: "Manage & track progress", nl: "Beheer & volg voortgang", ar: "إدارة ومتابعة التقدم", tr: "Yönet ve takip et", ur: "انتظام اور پیشرفت دیکھیں" },
  "parent.setPin": { fr: "Créer un code PIN", en: "Set a PIN", nl: "PIN instellen", ar: "إنشاء رمز PIN", tr: "PIN oluştur", ur: "PIN بنائیں" },
  "parent.setPinDesc": { fr: "Choisissez un code à 4 chiffres", en: "Choose a 4-digit code", nl: "Kies een 4-cijferige code", ar: "اختر رمزاً من 4 أرقام", tr: "4 haneli bir kod seçin", ur: "4 ہندسوں کا کوڈ چنیں" },
  "parent.enterPin": { fr: "Entrez votre PIN", en: "Enter your PIN", nl: "Voer je PIN in", ar: "أدخل رمز PIN", tr: "PIN'inizi girin", ur: "اپنا PIN درج کریں" },
  "parent.enterPinDesc": { fr: "Code à 4 chiffres", en: "4-digit code", nl: "4-cijferige code", ar: "رمز من 4 أرقام", tr: "4 haneli kod", ur: "4 ہندسوں کا کوڈ" },
  "parent.createPin": { fr: "Accès protégé", en: "Protected access", nl: "Beveiligde toegang", ar: "وصول محمي", tr: "Korumalı erişim", ur: "محفوظ رسائی" },
  "parent.createPinDesc": { fr: "Créez un PIN pour sécuriser cet espace", en: "Create a PIN to secure this area", nl: "Maak een PIN om deze sectie te beveiligen", ar: "أنشئ رمز PIN لتأمين هذه المنطقة", tr: "Bu alanı güvence altına almak için PIN oluşturun", ur: "اس حصے کو محفوظ بنانے کے لیے PIN بنائیں" },
  "parent.wrongPin": { fr: "Code incorrect", en: "Wrong PIN", nl: "Verkeerde PIN", ar: "رمز خاطئ", tr: "Yanlış PIN", ur: "غلط PIN" },
  "parent.confirm": { fr: "Confirmer", en: "Confirm", nl: "Bevestigen", ar: "تأكيد", tr: "Onayla", ur: "تصدیق" },
  "parent.unlock": { fr: "Déverrouiller", en: "Unlock", nl: "Ontgrendelen", ar: "فتح", tr: "Kilidi aç", ur: "کھولیں" },
  "parent.noChildren": { fr: "Aucun profil enfant", en: "No child profiles", nl: "Geen kinderprofielen", ar: "لا توجد ملفات أطفال", tr: "Çocuk profili yok", ur: "کوئی بچے کا پروفائل نہیں" },
  "parent.addChild": { fr: "Ajouter un enfant", en: "Add a child", nl: "Kind toevoegen", ar: "إضافة طفل", tr: "Çocuk ekle", ur: "بچہ شامل کریں" },
  "parent.editChild": { fr: "Modifier le profil", en: "Edit profile", nl: "Profiel bewerken", ar: "تعديل الملف", tr: "Profili düzenle", ur: "پروفائل تبدیل کریں" },
  "parent.years": { fr: "ans", en: "years", nl: "jaar", ar: "سنة", tr: "yaş", ur: "سال" },
  "parent.mastery": { fr: "Maîtrise", en: "Mastery", nl: "Beheersing", ar: "إتقان", tr: "Ustalık", ur: "مہارت" },
  "parent.edit": { fr: "Modifier", en: "Edit", nl: "Bewerken", ar: "تعديل", tr: "Düzenle", ur: "تبدیل" },
  "parent.delete": { fr: "Supprimer", en: "Delete", nl: "Verwijderen", ar: "حذف", tr: "Sil", ur: "حذف" },
  "parent.save": { fr: "Enregistrer", en: "Save", nl: "Opslaan", ar: "حفظ", tr: "Kaydet", ur: "محفوظ" },
  "parent.add": { fr: "Ajouter", en: "Add", nl: "Toevoegen", ar: "إضافة", tr: "Ekle", ur: "شامل کریں" },
  "parent.namePlaceholder": { fr: "Prénom de l'enfant", en: "Child's name", nl: "Naam van het kind", ar: "اسم الطفل", tr: "Çocuğun adı", ur: "بچے کا نام" },
  "parent.agePlaceholder": { fr: "Âge (optionnel)", en: "Age (optional)", nl: "Leeftijd (optioneel)", ar: "العمر (اختياري)", tr: "Yaş (isteğe bağlı)", ur: "عمر (اختیاری)" },
  "parent.deleteConfirmTitle": { fr: "Supprimer ce profil ?", en: "Delete this profile?", nl: "Dit profiel verwijderen?", ar: "حذف هذا الملف؟", tr: "Bu profili sil?", ur: "یہ پروفائل حذف کریں؟" },
  "parent.deleteConfirmMsg": { fr: "Toutes les données de cet enfant seront supprimées.", en: "All data for this child will be deleted.", nl: "Alle gegevens van dit kind worden verwijderd.", ar: "سيتم حذف جميع بيانات هذا الطفل.", tr: "Bu çocuğun tüm verileri silinecek.", ur: "اس بچے کا تمام ڈیٹا حذف ہو جائے گا۔" },
  "parent.childNotFound": { fr: "Profil introuvable", en: "Profile not found", nl: "Profiel niet gevonden", ar: "الملف غير موجود", tr: "Profil bulunamadı", ur: "پروفائل نہیں ملا" },
  "parent.tabHifz": { fr: "Carte Hifz", en: "Hifz Map", nl: "Hifz Kaart", ar: "خريطة الحفظ", tr: "Hıfz Haritası", ur: "حفظ نقشہ" },
  "parent.tabHistory": { fr: "Historique", en: "History", nl: "Geschiedenis", ar: "السجل", tr: "Geçmiş", ur: "تاریخ" },
  "parent.noSessions": { fr: "Aucune session enregistrée", en: "No sessions recorded", nl: "Geen sessies opgenomen", ar: "لا توجد جلسات مسجلة", tr: "Kayıtlı oturum yok", ur: "کوئی سیشن ریکارڈ نہیں" },
  "parent.weeklyReport": { fr: "Rapport hebdomadaire", en: "Weekly report", nl: "Weekrapport", ar: "التقرير الأسبوعي", tr: "Haftalık rapor", ur: "ہفتہ وار رپورٹ" },
  "parent.thisWeek": { fr: "Cette semaine", en: "This week", nl: "Deze week", ar: "هذا الأسبوع", tr: "Bu hafta", ur: "اس ہفتے" },
  "parent.avgScore": { fr: "Score moyen", en: "Avg score", nl: "Gem. score", ar: "متوسط النتيجة", tr: "Ort. puan", ur: "اوسط نمبر" },
  "parent.totalTime": { fr: "Temps total", en: "Total time", nl: "Totale tijd", ar: "الوقت الإجمالي", tr: "Toplam süre", ur: "کل وقت" },
  "parent.progressVsAvg": { fr: "vs moyenne globale", en: "vs overall average", nl: "vs totaal gemiddelde", ar: "مقارنة بالمعدل العام", tr: "genel ortalamaya karşı", ur: "مجموعی اوسط کے مقابلے" },
  "parent.strongSurahs": { fr: "Sourates fortes", en: "Strong surahs", nl: "Sterke soera's", ar: "السور القوية", tr: "Güçlü sureler", ur: "مضبوط سورتیں" },
  "parent.weakSurahs": { fr: "Sourates à revoir", en: "Surahs to review", nl: "Te herzien soera's", ar: "سور تحتاج مراجعة", tr: "Tekrarlanacak sureler", ur: "دہرانے والی سورتیں" },
  "parent.passagesWorked": { fr: "Passages travaillés", en: "Passages worked", nl: "Bewerkte passages", ar: "المقاطع التي تم العمل عليها", tr: "Çalışılan pasajlar", ur: "کام کیے گئے حصے" },
  "parent.noSessionsThisWeek": { fr: "Aucune session cette semaine", en: "No sessions this week", nl: "Geen sessies deze week", ar: "لا توجد جلسات هذا الأسبوع", tr: "Bu hafta oturum yok", ur: "اس ہفتے کوئی سیشن نہیں" },
  "parent.access": { fr: "Espace parent", en: "Parent area", nl: "Ouder sectie", ar: "مساحة الوالدين", tr: "Ebeveyn alanı", ur: "والدین کا حصہ" },
  "parent.accessDesc": { fr: "Suivi des enfants / élèves", en: "Track children / students", nl: "Kinderen / studenten volgen", ar: "متابعة الأطفال / الطلاب", tr: "Çocukları / öğrencileri takip et", ur: "بچوں / طلباء کی نگرانی" },

  // Mushaf Reader
  "mushaf.title": { fr: "Mode Mushaf", en: "Mushaf Mode", nl: "Mushaf Modus", ar: "وضع المصحف", tr: "Mushaf Modu", ur: "مصحف موڈ" },
  "mushaf.autoScroll": { fr: "Défilement auto", en: "Auto-scroll", nl: "Auto-scroll", ar: "تمرير تلقائي", tr: "Otomatik kaydırma", ur: "خودکار سکرول" },
  "mushaf.scrollSpeed": { fr: "Vitesse", en: "Speed", nl: "Snelheid", ar: "السرعة", tr: "Hız", ur: "رفتار" },
  "mushaf.darkMode": { fr: "Mode sombre", en: "Dark mode", nl: "Donkere modus", ar: "الوضع الداكن", tr: "Karanlık mod", ur: "ڈارک موڈ" },
  "mushaf.addBookmark": { fr: "Ajouter aux favoris", en: "Add to bookmarks", nl: "Toevoegen aan bladwijzers", ar: "إضافة للمفضلة", tr: "Yer imlerine ekle", ur: "بُک مارک میں شامل" },
  "mushaf.removeBookmark": { fr: "Retirer des favoris", en: "Remove bookmark", nl: "Bladwijzer verwijderen", ar: "إزالة من المفضلة", tr: "Yer imini kaldır", ur: "بُک مارک ہٹائیں" },
  "tafsir.title": { fr: "Tafsir", en: "Tafsir", nl: "Tafsir", ar: "تفسير", tr: "Tefsir", ur: "تفسیر" },
  "tafsir.ayah": { fr: "Verset", en: "Ayah", nl: "Vers", ar: "آية", tr: "Ayet", ur: "آیت" },
  "tafsir.source": { fr: "Source", en: "Source", nl: "Bron", ar: "المصدر", tr: "Kaynak", ur: "ماخذ" },
  "tafsir.surahTafsir": { fr: "Tafsir de la sourate", en: "Surah Tafsir", nl: "Soera Tafsir", ar: "تفسير السورة", tr: "Sure Tefsiri", ur: "سورۃ کی تفسیر" },
  "tafsir.goToAyah": { fr: "Aller au verset", en: "Go to ayah", nl: "Ga naar vers", ar: "اذهب للآية", tr: "Ayete git", ur: "آیت پر جائیں" },
  "mushaf.modeLabel": { fr: "Mushaf", en: "Mushaf", nl: "Mushaf", ar: "المصحف", tr: "Mushaf", ur: "مصحف" },

  // Bookmarks
  "bookmarks.title": { fr: "Favoris", en: "Bookmarks", nl: "Bladwijzers", ar: "المفضلة", tr: "Yer İmleri", ur: "بُک مارکس" },
  "bookmarks.subtitle": { fr: "Vos versets et plages favorites", en: "Your favorite verses & ranges", nl: "Je favoriete verzen & bereiken", ar: "آياتك ونطاقاتك المفضلة", tr: "Favori ayetleriniz ve aralıklarınız", ur: "آپ کی پسندیدہ آیات" },
  "bookmarks.ayahs": { fr: "Versets", en: "Verses", nl: "Verzen", ar: "آيات", tr: "Ayetler", ur: "آیات" },
  "bookmarks.ranges": { fr: "Plages", en: "Ranges", nl: "Bereiken", ar: "نطاقات", tr: "Aralıklar", ur: "حدود" },
  "bookmarks.noAyahs": { fr: "Aucun verset en favori", en: "No bookmarked verses", nl: "Geen bladwijzers", ar: "لا توجد آيات مفضلة", tr: "İşaretli ayet yok", ur: "کوئی نشان زد آیت نہیں" },
  "bookmarks.noAyahsHint": { fr: "Appui long sur un verset pour l'ajouter", en: "Long press a verse to bookmark it", nl: "Lang indrukken om toe te voegen", ar: "اضغط مطولاً على آية لإضافتها", tr: "İşaretlemek için ayete uzun bas", ur: "نشان لگانے کے لیے آیت پر دیر تک دبائیں" },
  "bookmarks.noRanges": { fr: "Aucune plage favorite", en: "No favorite ranges", nl: "Geen favoriete bereiken", ar: "لا توجد نطاقات مفضلة", tr: "Favori aralık yok", ur: "کوئی پسندیدہ حدود نہیں" },
  "bookmarks.addRange": { fr: "Ajouter une plage", en: "Add a range", nl: "Bereik toevoegen", ar: "إضافة نطاق", tr: "Aralık ekle", ur: "حدود شامل کریں" },
  "bookmarks.labelPlaceholder": { fr: "Label (ex: Chapitre patience)", en: "Label (e.g. Patience chapter)", nl: "Label (bv. Geduld hoofdstuk)", ar: "التسمية (مثال: باب الصبر)", tr: "Etiket (ör. Sabır bölümü)", ur: "لیبل (مثلاً: صبر کا باب)" },
  "bookmarks.fromSurah": { fr: "Sourate début", en: "From surah", nl: "Van soera", ar: "من سورة", tr: "Başlangıç suresi", ur: "سورۃ سے" },
  "bookmarks.fromAyah": { fr: "Verset début", en: "From verse", nl: "Van vers", ar: "من آية", tr: "Başlangıç ayeti", ur: "آیت سے" },
  "bookmarks.toSurah": { fr: "Sourate fin", en: "To surah", nl: "Tot soera", ar: "إلى سورة", tr: "Bitiş suresi", ur: "سورۃ تک" },
  "bookmarks.toAyah": { fr: "Verset fin", en: "To verse", nl: "Tot vers", ar: "إلى آية", tr: "Bitiş ayeti", ur: "آیت تک" },
  "bookmarks.from": { fr: "De", en: "From", nl: "Van", ar: "من", tr: "Dan", ur: "سے" },
  "bookmarks.navLabel": { fr: "Favoris", en: "Bookmarks", nl: "Bladwijzers", ar: "المفضلة", tr: "Yer İmleri", ur: "بُک مارکس" },

  // Reading Mode
  "reading.title": { fr: "Lecture Coran", en: "Quran Reading", nl: "Koran Lezen", ar: "قراءة القرآن", tr: "Kur'an Okuma", ur: "قرآن پڑھنا" },
  "reading.subtitle": { fr: "Lisez le Coran complet", en: "Read the complete Quran", nl: "Lees de volledige Koran", ar: "اقرأ القرآن الكريم كاملاً", tr: "Kur'an'ın tamamını oku", ur: "مکمل قرآن پڑھیں" },
  "reading.settings": { fr: "Réglages lecture", en: "Reading settings", nl: "Leesinstellingen", ar: "إعدادات القراءة", tr: "Okuma ayarları", ur: "پڑھنے کی ترتیبات" },
  "reading.darkMode": { fr: "Mode sombre (lecture)", en: "Dark mode (reading)", nl: "Donkere modus (lezen)", ar: "الوضع الداكن (قراءة)", tr: "Karanlık mod (okuma)", ur: "ڈارک موڈ (پڑھنا)" },
  "reading.arabicFont": { fr: "Police arabe", en: "Arabic font", nl: "Arabisch lettertype", ar: "الخط العربي", tr: "Arapça yazı tipi", ur: "عربی فونٹ" },
  "reading.defaultReciter": { fr: "Réciteur par défaut", en: "Default reciter", nl: "Standaard reciteerder", ar: "القارئ الافتراضي", tr: "Varsayılan okuyucu", ur: "ڈیفالٹ قاری" },
  "reading.resume": { fr: "Reprendre la lecture", en: "Resume reading", nl: "Verder lezen", ar: "استئناف القراءة", tr: "Okumaya devam", ur: "پڑھنا جاری رکھیں" },
  "reading.resumeSurah": { fr: "Sourate", en: "Surah", nl: "Soera", ar: "سورة", tr: "Sure", ur: "سورۃ" },
  "reading.searchPlaceholder": { fr: "Rechercher une sourate...", en: "Search a surah...", nl: "Zoek een soera...", ar: "ابحث عن سورة...", tr: "Sure ara...", ur: "سورۃ تلاش کریں..." },
  "reading.loading": { fr: "Chargement...", en: "Loading...", nl: "Laden...", ar: "جاري التحميل...", tr: "Yükleniyor...", ur: "لوڈ ہو رہا ہے..." },
  "reading.noResults": { fr: "Aucun résultat", en: "No results", nl: "Geen resultaten", ar: "لا توجد نتائج", tr: "Sonuç yok", ur: "کوئی نتیجہ نہیں" },
  "nav.reading": { fr: "Coran", en: "Quran", nl: "Koran", ar: "القرآن", tr: "Kur'an", ur: "قرآن" },

  // Active Child
  "activeChild.workingWith": { fr: "Tu travailles avec :", en: "Working with:", nl: "Je werkt met:", ar: "تعمل مع:", tr: "Çalıştığın:", ur: "آپ کام کر رہے ہیں:" },
  "activeChild.chooseChild": { fr: "Choisir un enfant", en: "Choose a child", nl: "Kies een kind", ar: "اختر طفلاً", tr: "Bir çocuk seç", ur: "بچہ منتخب کریں" },
  "activeChild.noChild": { fr: "Aucun enfant sélectionné", en: "No child selected", nl: "Geen kind geselecteerd", ar: "لم يتم اختيار طفل", tr: "Çocuk seçilmedi", ur: "کوئی بچہ منتخب نہیں" },
  "activeChild.startSession": { fr: "Travailler avec", en: "Work with", nl: "Werken met", ar: "العمل مع", tr: "Birlikte çalış", ur: "ساتھ کام کریں" },

  // Backup & Restore
  "backup.title": { fr: "Sauvegarde & Restauration", en: "Backup & Restore", nl: "Back-up & Herstel", ar: "النسخ الاحتياطي والاستعادة", tr: "Yedekleme & Geri Yükleme", ur: "بیک اپ اور بحالی" },
  "backup.export": { fr: "Exporter la sauvegarde", en: "Export backup", nl: "Back-up exporteren", ar: "تصدير النسخة الاحتياطية", tr: "Yedeği dışa aktar", ur: "بیک اپ ایکسپورٹ" },
  "backup.exportDesc": { fr: "Téléchargez un fichier JSON avec tous vos profils et sessions", en: "Download a JSON file with all profiles and sessions", nl: "Download een JSON-bestand met alle profielen en sessies", ar: "تحميل ملف JSON بجميع الملفات والجلسات", tr: "Tüm profiller ve oturumlarla JSON dosyası indir", ur: "تمام پروفائلز اور سیشنز کے ساتھ JSON فائل ڈاؤن لوڈ" },
  "backup.import": { fr: "Importer une sauvegarde", en: "Import backup", nl: "Back-up importeren", ar: "استيراد نسخة احتياطية", tr: "Yedeği içe aktar", ur: "بیک اپ امپورٹ" },
  "backup.importDesc": { fr: "Charger un fichier JSON pour restaurer les données", en: "Load a JSON file to restore data", nl: "Laad een JSON-bestand om gegevens te herstellen", ar: "تحميل ملف JSON لاستعادة البيانات", tr: "Verileri geri yüklemek için JSON dosyası yükle", ur: "ڈیٹا بحال کرنے کے لیے JSON فائل لوڈ" },
  "backup.importWarning": { fr: "⚠️ Cela remplacera toutes les données actuelles (profils, sessions, PIN).", en: "⚠️ This will replace all current data (profiles, sessions, PIN).", nl: "⚠️ Dit vervangt alle huidige gegevens (profielen, sessies, PIN).", ar: "⚠️ سيؤدي هذا إلى استبدال جميع البيانات الحالية (الملفات، الجلسات، الرمز السري).", tr: "⚠️ Bu, mevcut tüm verileri (profiller, oturumlar, PIN) değiştirecek.", ur: "⚠️ یہ تمام موجودہ ڈیٹا (پروفائلز، سیشنز، PIN) بدل دے گا۔" },
  "backup.importSuccess": { fr: "✅ Données restaurées avec succès !", en: "✅ Data restored successfully!", nl: "✅ Gegevens succesvol hersteld!", ar: "✅ تمت استعادة البيانات بنجاح!", tr: "✅ Veriler başarıyla geri yüklendi!", ur: "✅ ڈیٹا کامیابی سے بحال!" },
  "backup.importError": { fr: "❌ Fichier invalide", en: "❌ Invalid file", nl: "❌ Ongeldig bestand", ar: "❌ ملف غير صالح", tr: "❌ Geçersiz dosya", ur: "❌ غلط فائل" },
  "backup.lastActivity": { fr: "Dernière activité", en: "Last activity", nl: "Laatste activiteit", ar: "آخر نشاط", tr: "Son aktivite", ur: "آخری سرگرمی" },

  // Classrooms
  "classrooms.title": { fr: "Mes classes", en: "My Classes", nl: "Mijn klassen", ar: "فصولي", tr: "Sınıflarım", ur: "میری کلاسیں" },
  "classrooms.subtitle": { fr: "Gérez vos groupes d'élèves", en: "Manage your student groups", nl: "Beheer je leerlinggroepen", ar: "إدارة مجموعات الطلاب", tr: "Öğrenci gruplarını yönet", ur: "طالب علم گروپس کا انتظام" },
  "classrooms.create": { fr: "Créer une classe", en: "Create a class", nl: "Klas aanmaken", ar: "إنشاء فصل", tr: "Sınıf oluştur", ur: "کلاس بنائیں" },
  "classrooms.namePlaceholder": { fr: "Nom de la classe (ex: Samedi 10h)", en: "Class name (e.g. Saturday 10am)", nl: "Klasnaam (bv. Zaterdag 10u)", ar: "اسم الفصل (مثال: السبت 10 صباحاً)", tr: "Sınıf adı (ör. Cumartesi 10)", ur: "کلاس کا نام (مثلاً: ہفتہ 10 بجے)" },
  "classrooms.teacherPlaceholder": { fr: "Nom du professeur (optionnel)", en: "Teacher name (optional)", nl: "Naam leraar (optioneel)", ar: "اسم المعلم (اختياري)", tr: "Öğretmen adı (isteğe bağlı)", ur: "استاد کا نام (اختیاری)" },
  "classrooms.cancel": { fr: "Annuler", en: "Cancel", nl: "Annuleren", ar: "إلغاء", tr: "İptal", ur: "منسوخ" },
  "classrooms.createBtn": { fr: "Créer", en: "Create", nl: "Aanmaken", ar: "إنشاء", tr: "Oluştur", ur: "بنائیں" },
  "classrooms.empty": { fr: "Aucune classe créée", en: "No classes yet", nl: "Nog geen klassen", ar: "لا توجد فصول بعد", tr: "Henüz sınıf yok", ur: "ابھی کوئی کلاس نہیں" },
  "classrooms.code": { fr: "Code", en: "Code", nl: "Code", ar: "الرمز", tr: "Kod", ur: "کوڈ" },
  "classrooms.students": { fr: "Élèves", en: "Students", nl: "Leerlingen", ar: "الطلاب", tr: "Öğrenciler", ur: "طلباء" },
  "classrooms.viewDetail": { fr: "Voir la classe", en: "View class", nl: "Bekijk klas", ar: "عرض الفصل", tr: "Sınıfı gör", ur: "کلاس دیکھیں" },
  "classrooms.addStudent": { fr: "Ajouter un élève", en: "Add student", nl: "Leerling toevoegen", ar: "إضافة طالب", tr: "Öğrenci ekle", ur: "طالب شامل کریں" },
  "classrooms.noStudents": { fr: "Aucun élève dans cette classe", en: "No students in this class", nl: "Geen leerlingen in deze klas", ar: "لا يوجد طلاب في هذا الفصل", tr: "Bu sınıfta öğrenci yok", ur: "اس کلاس میں طلباء نہیں" },
  "classrooms.mastery": { fr: "Maîtrise", en: "Mastery", nl: "Beheersing", ar: "الإتقان", tr: "Ustalık", ur: "مہارت" },
  "classrooms.viewChild": { fr: "Voir le profil", en: "View profile", nl: "Profiel bekijken", ar: "عرض الملف", tr: "Profili gör", ur: "پروفائل دیکھیں" },
  "classrooms.notFound": { fr: "Classe introuvable", en: "Class not found", nl: "Klas niet gevonden", ar: "الفصل غير موجود", tr: "Sınıf bulunamadı", ur: "کلاس نہیں ملی" },
  "classrooms.homeTitle": { fr: "Mode Classe (Professeur)", en: "Classroom Mode (Teacher)", nl: "Klassenmodus (Leraar)", ar: "وضع الفصل (المعلم)", tr: "Sınıf Modu (Öğretmen)", ur: "کلاس موڈ (استاد)" },
  "classrooms.homeDesc": { fr: "Gérez vos classes et suivez les progrès", en: "Manage classes & track progress", nl: "Beheer klassen & volg voortgang", ar: "إدارة الفصول ومتابعة التقدم", tr: "Sınıfları yönet ve ilerlemeyi takip et", ur: "کلاسوں کا انتظام اور پیشرفت" },
  "classrooms.newStudentsPlural": { fr: "nouveaux élèves", en: "new students", nl: "nieuwe leerlingen", ar: "طلاب جدد", tr: "yeni öğrenciler", ur: "نئے طلباء" },
  "classrooms.newStudentSingular": { fr: "nouvel élève", en: "new student", nl: "nieuwe leerling", ar: "طالب جديد", tr: "yeni öğrenci", ur: "نیا طالب" },
  "classrooms.newStudentToast": { fr: "De nouveaux élèves ont rejoint vos classes !", en: "New students have joined your classes!", nl: "Nieuwe leerlingen zijn toegetreden!", ar: "انضم طلاب جدد إلى فصولك!", tr: "Sınıflarınıza yeni öğrenciler katıldı!", ur: "نئے طلباء آپ کی کلاسوں میں شامل ہوئے!" },
  "classrooms.new": { fr: "nouveau(x)", en: "new", nl: "nieuw", ar: "جديد", tr: "yeni", ur: "نیا" },
  "classrooms.joinClass": { fr: "Rejoindre une classe", en: "Join a class", nl: "Klas bijtreden", ar: "الانضمام لفصل", tr: "Sınıfa katıl", ur: "کلاس میں شامل ہوں" },
  "classrooms.joinCodePlaceholder": { fr: "Code de la classe (ex: E9XUAR)", en: "Class code (e.g. E9XUAR)", nl: "Klascode (bv. E9XUAR)", ar: "رمز الفصل (مثال: E9XUAR)", tr: "Sınıf kodu (ör. E9XUAR)", ur: "کلاس کوڈ (مثلاً: E9XUAR)" },
  "classrooms.joinBtn": { fr: "Rejoindre", en: "Join", nl: "Bijtreden", ar: "انضمام", tr: "Katıl", ur: "شامل ہوں" },
  "classrooms.joinSuccess": { fr: "Vous avez rejoint la classe", en: "You joined the class", nl: "Je bent toegetreden tot de klas", ar: "لقد انضممت إلى الفصل", tr: "Sınıfa katıldınız", ur: "آپ کلاس میں شامل ہو گئے" },
  "classrooms.joinInvalidCode": { fr: "Code invalide", en: "Invalid code", nl: "Ongeldige code", ar: "رمز غير صالح", tr: "Geçersiz kod", ur: "غلط کوڈ" },
  "classrooms.joinAlreadyMember": { fr: "Vous êtes déjà membre", en: "You are already a member", nl: "Je bent al lid", ar: "أنت عضو بالفعل", tr: "Zaten üyesiniz", ur: "آپ پہلے سے ممبر ہیں" },
  "classrooms.messages": { fr: "Messages du groupe", en: "Group Messages", nl: "Groepsberichten", ar: "رسائل المجموعة", tr: "Grup Mesajları", ur: "گروپ پیغامات" },
  "classrooms.typeMessage": { fr: "Écrire un message...", en: "Type a message...", nl: "Schrijf een bericht...", ar: "اكتب رسالة...", tr: "Mesaj yaz...", ur: "پیغام لکھیں..." },
  "classrooms.send": { fr: "Envoyer", en: "Send", nl: "Verzenden", ar: "إرسال", tr: "Gönder", ur: "بھیجیں" },
  "classrooms.noMessages": { fr: "Aucun message", en: "No messages yet", nl: "Nog geen berichten", ar: "لا توجد رسائل بعد", tr: "Henüz mesaj yok", ur: "ابھی کوئی پیغام نہیں" },

  // Join Classroom
  "join.title": { fr: "Rejoindre une classe", en: "Join a classroom", nl: "Klas bijtreden", ar: "الانضمام إلى فصل", tr: "Sınıfa katıl", ur: "کلاس میں شامل ہوں" },
  "join.notFound": { fr: "Classe introuvable", en: "Classroom not found", nl: "Klas niet gevonden", ar: "الفصل غير موجود", tr: "Sınıf bulunamadı", ur: "کلاس نہیں ملی" },
  "join.notFoundDesc": { fr: "Aucune classe ne correspond au code", en: "No classroom matches the code", nl: "Geen klas gevonden met code", ar: "لا يوجد فصل يطابق الرمز", tr: "Bu kodla eşleşen sınıf yok", ur: "اس کوڈ سے ملتی کلاس نہیں" },
  "join.backHome": { fr: "Retour à l'accueil", en: "Back to home", nl: "Terug naar home", ar: "العودة للرئيسية", tr: "Ana sayfaya dön", ur: "ہوم واپس" },
  "join.success": { fr: "Inscription réussie !", en: "Successfully joined!", nl: "Succesvol ingeschreven!", ar: "تم الانضمام بنجاح!", tr: "Başarıyla katıldınız!", ur: "کامیابی سے شامل ہو گئے!" },
  "join.successDesc": { fr: "Vous avez rejoint la classe", en: "You joined the classroom", nl: "Je bent lid van de klas", ar: "لقد انضممت إلى الفصل", tr: "Sınıfa katıldınız", ur: "آپ کلاس میں شامل ہو گئے" },
  "join.teacher": { fr: "Enseignant", en: "Teacher", nl: "Leraar", ar: "المعلم", tr: "Öğretmen", ur: "استاد" },
  "join.createChild": { fr: "Créer un profil enfant", en: "Create a child profile", nl: "Kindprofiel aanmaken", ar: "إنشاء ملف طفل", tr: "Çocuk profili oluştur", ur: "بچے کا پروفائل بنائیں" },
  "join.createChildDesc": { fr: "Nouveau profil pour cet élève", en: "New profile for this student", nl: "Nieuw profiel voor deze leerling", ar: "ملف جديد لهذا الطالب", tr: "Bu öğrenci için yeni profil", ur: "اس طالب کے لیے نیا پروفائل" },
  "join.useExisting": { fr: "Utiliser un profil existant", en: "Use an existing profile", nl: "Bestaand profiel gebruiken", ar: "استخدام ملف موجود", tr: "Mevcut profili kullan", ur: "موجود پروفائل استعمال کریں" },
  "join.profilesAvailable": { fr: "profil(s) disponible(s)", en: "profile(s) available", nl: "profiel(en) beschikbaar", ar: "ملف(ات) متاحة", tr: "profil mevcut", ur: "پروفائل دستیاب" },
  "join.back": { fr: "Retour", en: "Back", nl: "Terug", ar: "رجوع", tr: "Geri", ur: "واپس" },
  "join.avatar": { fr: "Avatar", en: "Avatar", nl: "Avatar", ar: "الصورة الرمزية", tr: "Avatar", ur: "اوتار" },
  "join.childName": { fr: "Prénom de l'enfant", en: "Child's name", nl: "Naam van het kind", ar: "اسم الطفل", tr: "Çocuğun adı", ur: "بچے کا نام" },
  "join.childNamePlaceholder": { fr: "Ex: Adam", en: "E.g. Adam", nl: "Bijv. Adam", ar: "مثال: آدم", tr: "Ör. Adem", ur: "مثلاً: آدم" },
  "join.childAge": { fr: "Âge (optionnel)", en: "Age (optional)", nl: "Leeftijd (optioneel)", ar: "العمر (اختياري)", tr: "Yaş (isteğe bağlı)", ur: "عمر (اختیاری)" },
  "join.joinButton": { fr: "Rejoindre la classe", en: "Join classroom", nl: "Klas bijtreden", ar: "انضم للفصل", tr: "Sınıfa katıl", ur: "کلاس میں شامل ہوں" },
  "join.errorName": { fr: "Le prénom est requis", en: "Name is required", nl: "Naam is verplicht", ar: "الاسم مطلوب", tr: "Ad gerekli", ur: "نام ضروری ہے" },
  "join.errorNameLong": { fr: "50 caractères max", en: "50 characters max", nl: "Max 50 tekens", ar: "50 حرفًا كحد أقصى", tr: "En fazla 50 karakter", ur: "زیادہ سے زیادہ 50 حروف" },
  "join.errorAge": { fr: "Âge invalide (1-99)", en: "Invalid age (1-99)", nl: "Ongeldige leeftijd (1-99)", ar: "عمر غير صالح (1-99)", tr: "Geçersiz yaş (1-99)", ur: "غلط عمر (1-99)" },
  "join.years": { fr: "ans", en: "years", nl: "jaar", ar: "سنة", tr: "yaş", ur: "سال" },

  // Auth
  "auth.signupTitle": { fr: "Créer un compte", en: "Create account", nl: "Account aanmaken", ar: "إنشاء حساب", tr: "Hesap oluştur", ur: "اکاؤنٹ بنائیں" },
  "auth.loginTitle": { fr: "Se connecter", en: "Sign in", nl: "Inloggen", ar: "تسجيل الدخول", tr: "Giriş yap", ur: "لاگ ان" },
  "auth.signupDesc": { fr: "Rejoignez la communauté Iqraa", en: "Join the Iqraa community", nl: "Word lid van Iqraa", ar: "انضم إلى مجتمع إقرأ", tr: "Ikra topluluğuna katıl", ur: "اقرأ برادری میں شامل ہوں" },
  "auth.loginDesc": { fr: "Recevez un lien magique par email", en: "Get a magic link by email", nl: "Ontvang een magische link", ar: "احصل على رابط سحري", tr: "E-posta ile sihirli link al", ur: "ای میل سے جادوئی لنک حاصل کریں" },
  "auth.signup": { fr: "Inscription", en: "Sign up", nl: "Registreren", ar: "تسجيل", tr: "Kayıt ol", ur: "رجسٹریشن" },
  "auth.login": { fr: "Connexion", en: "Sign in", nl: "Inloggen", ar: "دخول", tr: "Giriş", ur: "لاگ ان" },
  "auth.chooseAvatar": { fr: "Choisis ton avatar", en: "Choose your avatar", nl: "Kies je avatar", ar: "اختر صورتك الرمزية", tr: "Avatarını seç", ur: "اپنا اوتار چنیں" },
  "auth.displayName": { fr: "Ton nom / pseudo", en: "Your name", nl: "Je naam", ar: "اسمك", tr: "Adın", ur: "آپ کا نام" },
  "auth.email": { fr: "Email", en: "Email", nl: "E-mail", ar: "البريد الإلكتروني", tr: "E-posta", ur: "ای میل" },
  "auth.publicProfile": { fr: "Profil public", en: "Public profile", nl: "Openbaar profiel", ar: "ملف عام", tr: "Herkese açık profil", ur: "عوامی پروفائل" },
  "auth.publicProfileDesc": { fr: "Visible dans le classement", en: "Visible in leaderboard", nl: "Zichtbaar in ranglijst", ar: "مرئي في لوحة المتصدرين", tr: "Sıralamada görünür", ur: "لیڈر بورڈ میں نظر آئے" },
  "auth.createAccount": { fr: "Créer mon compte", en: "Create my account", nl: "Account aanmaken", ar: "إنشاء حسابي", tr: "Hesabımı oluştur", ur: "میرا اکاؤنٹ بنائیں" },
  "auth.sendMagicLink": { fr: "Envoyer le lien magique", en: "Send magic link", nl: "Magische link sturen", ar: "إرسال الرابط السحري", tr: "Sihirli linki gönder", ur: "جادوئی لنک بھیجیں" },
  "auth.magicLinkInfo": { fr: "Un lien de connexion sera envoyé à votre email", en: "A login link will be sent to your email", nl: "Een inloglink wordt naar je e-mail gestuurd", ar: "سيتم إرسال رابط تسجيل الدخول إلى بريدك", tr: "Giriş linki e-postanıza gönderilecek", ur: "لاگ ان لنک آپ کے ای میل پر بھیجا جائے گا" },
  "auth.errorFields": { fr: "Remplis tous les champs", en: "Fill all fields", nl: "Vul alle velden in", ar: "املأ جميع الحقول", tr: "Tüm alanları doldurun", ur: "تمام خانے بھریں" },
  "auth.errorEmail": { fr: "Email requis", en: "Email required", nl: "E-mail vereist", ar: "البريد مطلوب", tr: "E-posta gerekli", ur: "ای میل ضروری" },
  "auth.signupSuccess": { fr: "Compte créé ! 🎉", en: "Account created! 🎉", nl: "Account aangemaakt! 🎉", ar: "تم إنشاء الحساب! 🎉", tr: "Hesap oluşturuldu! 🎉", ur: "اکاؤنٹ بن گیا! 🎉" },
  "auth.magicLinkSent": { fr: "Lien envoyé ! Vérifiez votre boîte mail", en: "Link sent! Check your inbox", nl: "Link verstuurd! Check je inbox", ar: "تم إرسال الرابط! تحقق من بريدك", tr: "Link gönderildi! Gelen kutunuzu kontrol edin", ur: "لنک بھیج دیا! اپنا ان باکس چیک کریں" },
  "auth.checkEmail": { fr: "Vérifiez votre email", en: "Check your email", nl: "Check je e-mail", ar: "تحقق من بريدك", tr: "E-postanızı kontrol edin", ur: "اپنا ای میل چیک کریں" },
  "auth.checkEmailDesc": { fr: "Nous vous avons envoyé un lien magique", en: "We sent you a magic link", nl: "We hebben je een magische link gestuurd", ar: "أرسلنا لك رابطًا سحريًا", tr: "Size sihirli bir link gönderdik", ur: "ہم نے آپ کو جادوئی لنک بھیجا" },
  "auth.logout": { fr: "Déconnexion", en: "Sign out", nl: "Uitloggen", ar: "تسجيل الخروج", tr: "Çıkış yap", ur: "لاگ آؤٹ" },
  "auth.myAccount": { fr: "Mon compte", en: "My account", nl: "Mijn account", ar: "حسابي", tr: "Hesabım", ur: "میرا اکاؤنٹ" },

  // Leaderboard
  "leaderboard.title": { fr: "Classement", en: "Leaderboard", nl: "Ranglijst", ar: "لوحة المتصدرين", tr: "Sıralama", ur: "لیڈر بورڈ" },
  "leaderboard.global": { fr: "Mondial", en: "Global", nl: "Wereldwijd", ar: "عالمي", tr: "Dünya", ur: "عالمی" },
  "leaderboard.country": { fr: "Par pays", en: "By country", nl: "Per land", ar: "حسب البلد", tr: "Ülkeye göre", ur: "ملک کے لحاظ سے" },
  "leaderboard.empty": { fr: "Aucun joueur encore — sois le premier !", en: "No players yet — be the first!", nl: "Nog geen spelers — wees de eerste!", ar: "لا يوجد لاعبون بعد — كن الأول!", tr: "Henüz oyuncu yok — ilk sen ol!", ur: "ابھی کوئی نہیں — پہلے آپ بنیں!" },
  "lb.yourRank": { fr: "Ton rang", en: "Your rank", nl: "Je rang", ar: "ترتيبك", tr: "Sıralaman", ur: "آپ کی درجہ بندی" },
  "lb.toOvertake": { fr: "pour dépasser", en: "to overtake", nl: "om in te halen", ar: "لتجاوز", tr: "geçmek için", ur: "آگے نکلنے کے لیے" },
  "lb.nextLeague": { fr: "Prochaine ligue :", en: "Next league:", nl: "Volgende competitie:", ar: "الدوري التالي:", tr: "Sonraki lig:", ur: "اگلی لیگ:" },
  "lb.weekly": { fr: "Hebdo", en: "Weekly", nl: "Week", ar: "أسبوعي", tr: "Haftalık", ur: "ہفتہ وار" },
  "lb.country": { fr: "Pays", en: "Country", nl: "Land", ar: "البلد", tr: "Ülke", ur: "ملک" },
  "lb.level": { fr: "Niveau", en: "Level", nl: "Niveau", ar: "المستوى", tr: "Seviye", ur: "سطح" },
  "lb.class": { fr: "Classe", en: "Class", nl: "Klas", ar: "الفصل", tr: "Sınıf", ur: "کلاس" },
  "lb.beginner": { fr: "Débutant", en: "Beginner", nl: "Beginner", ar: "مبتدئ", tr: "Başlangıç", ur: "ابتدائی" },
  "lb.intermediate": { fr: "Intermédiaire", en: "Intermediate", nl: "Gevorderd", ar: "متوسط", tr: "Orta", ur: "درمیانہ" },
  "lb.advanced": { fr: "Avancé", en: "Advanced", nl: "Expert", ar: "متقدم", tr: "İleri", ur: "ایڈوانس" },
  "lb.createClass": { fr: "Créer une classe", en: "Create a class", nl: "Klas aanmaken", ar: "إنشاء فصل", tr: "Sınıf oluştur", ur: "کلاس بنائیں" },
  "lb.joinClass": { fr: "Rejoindre", en: "Join", nl: "Deelnemen", ar: "انضمام", tr: "Katıl", ur: "شامل ہوں" },
  "lb.classNamePlaceholder": { fr: "Nom de la classe", en: "Class name", nl: "Klasnaam", ar: "اسم الفصل", tr: "Sınıf adı", ur: "کلاس کا نام" },
  "lb.joinCodePlaceholder": { fr: "Code (6 lettres)", en: "Code (6 letters)", nl: "Code (6 letters)", ar: "الرمز (6 أحرف)", tr: "Kod (6 harf)", ur: "کوڈ (6 حروف)" },
  "lb.create": { fr: "Créer", en: "Create", nl: "Aanmaken", ar: "إنشاء", tr: "Oluştur", ur: "بنائیں" },
  "lb.join": { fr: "Rejoindre", en: "Join", nl: "Deelnemen", ar: "انضمام", tr: "Katıl", ur: "شامل ہوں" },
  "lb.classNotFound": { fr: "Classe introuvable", en: "Class not found", nl: "Klas niet gevonden", ar: "الفصل غير موجود", tr: "Sınıf bulunamadı", ur: "کلاس نہیں ملی" },
  "lb.alreadyMember": { fr: "Déjà membre", en: "Already a member", nl: "Al lid", ar: "عضو بالفعل", tr: "Zaten üye", ur: "پہلے سے ممبر" },
  "lb.code": { fr: "Code", en: "Code", nl: "Code", ar: "الرمز", tr: "Kod", ur: "کوڈ" },
  "lb.members": { fr: "membres", en: "members", nl: "leden", ar: "أعضاء", tr: "üyeler", ur: "ممبران" },
  "lb.noClasses": { fr: "Crée ou rejoins une classe", en: "Create or join a class", nl: "Maak of neem deel aan een klas", ar: "أنشئ أو انضم إلى فصل", tr: "Sınıf oluştur veya katıl", ur: "کلاس بنائیں یا شامل ہوں" },
  "lb.emptyClass": { fr: "Aucun membre dans cette classe", en: "No members in this class", nl: "Geen leden in deze klas", ar: "لا يوجد أعضاء في هذا الفصل", tr: "Bu sınıfta üye yok", ur: "اس کلاس میں ممبر نہیں" },
  "lb.shareCode": { fr: "Partager le code", en: "Share code", nl: "Code delen", ar: "مشاركة الرمز", tr: "Kodu paylaş", ur: "کوڈ شیئر کریں" },
  "lb.statAvgHifz": { fr: "% moyen Hifz", en: "Avg Hifz %", nl: "Gem. Hifz %", ar: "متوسط الحفظ %", tr: "Ort. Hıfz %", ur: "اوسط حفظ %" },
  "lb.statAvgStreak": { fr: "Streak moyen", en: "Avg streak", nl: "Gem. reeks", ar: "متوسط السلسلة", tr: "Ort. seri", ur: "اوسط سلسلہ" },
  "lb.statTotalSessions": { fr: "Sessions totales", en: "Total sessions", nl: "Totale sessies", ar: "إجمالي الجلسات", tr: "Toplam oturum", ur: "کل سیشن" },
  "lb.statMembers": { fr: "Élèves", en: "Students", nl: "Studenten", ar: "طلاب", tr: "Öğrenciler", ur: "طلباء" },
  "lb.fullscreen": { fr: "Mode plein écran", en: "Fullscreen mode", nl: "Volledig scherm", ar: "وضع ملء الشاشة", tr: "Tam ekran", ur: "فل سکرین" },

  // Announcements
  "announcements.title": { fr: "Annonces", en: "Announcements", nl: "Aankondigingen", ar: "إعلانات", tr: "Duyurular", ur: "اعلانات" },
  "announcements.loginRequired": { fr: "Connectez-vous pour voir les annonces", en: "Sign in to view announcements", nl: "Log in om aankondigingen te zien", ar: "سجّل الدخول لعرض الإعلانات", tr: "Duyuruları görmek için giriş yapın", ur: "اعلانات دیکھنے کے لیے لاگ ان کریں" },
  "announcements.titlePlaceholder": { fr: "Titre de l'annonce", en: "Announcement title", nl: "Titel", ar: "عنوان الإعلان", tr: "Duyuru başlığı", ur: "اعلان کا عنوان" },
  "announcements.messagePlaceholder": { fr: "Votre message...", en: "Your message...", nl: "Je bericht...", ar: "رسالتك...", tr: "Mesajınız...", ur: "آپ کا پیغام..." },
  "announcements.send": { fr: "Envoyer", en: "Send", nl: "Versturen", ar: "إرسال", tr: "Gönder", ur: "بھیجیں" },
  "announcements.sent": { fr: "Annonce envoyée !", en: "Announcement sent!", nl: "Aankondiging verstuurd!", ar: "تم إرسال الإعلان!", tr: "Duyuru gönderildi!", ur: "اعلان بھیج دیا گیا!" },
  "announcements.empty": { fr: "Aucune annonce", en: "No announcements", nl: "Geen aankondigingen", ar: "لا توجد إعلانات", tr: "Duyuru yok", ur: "کوئی اعلان نہیں" },
  "announcements.read": { fr: "Lu", en: "Read", nl: "Gelezen", ar: "مقروء", tr: "Okundu", ur: "پڑھا گیا" },

  // Home extras
  "home.leaderboard": { fr: "Classement", en: "Leaderboard", nl: "Ranglijst", ar: "المتصدرين", tr: "Sıralama", ur: "لیڈر بورڈ" },
  "home.announcements": { fr: "Annonces", en: "Announcements", nl: "Aankondigingen", ar: "الإعلانات", tr: "Duyurular", ur: "اعلانات" },
  "home.joinCommunity": { fr: "Rejoindre la communauté", en: "Join community", nl: "Word lid", ar: "انضم للمجتمع", tr: "Topluluğa katıl", ur: "برادری میں شامل ہوں" },
  "home.joinCommunityDesc": { fr: "Crée ton compte et apparais dans le classement", en: "Create your account & appear in leaderboard", nl: "Maak een account & verschijn in de ranglijst", ar: "أنشئ حسابك وظهر في لوحة المتصدرين", tr: "Hesap oluştur ve sıralamada görün", ur: "اکاؤنٹ بنائیں اور لیڈر بورڈ میں نظر آئیں" },
  "home.hifzTitle": { fr: "Votre Hifz", en: "Your Hifz", nl: "Uw Hifz", ar: "حفظك", tr: "Hıfzınız", ur: "آپ کا حفظ" },
  "home.moodsNew": { fr: "Nouveau", en: "New", nl: "Nieuw", ar: "جديد", tr: "Yeni", ur: "نیا" },
  "home.moodsTitle": { fr: "États du cœur", en: "States of the Heart", nl: "Staten van het hart", ar: "أحوال القلب", tr: "Kalp Halleri", ur: "دل کے احوال" },
  "home.moodsSubtitle": { fr: "Prends soin de toi avec le Coran", en: "Take care of yourself with the Quran", nl: "Zorg voor jezelf met de Koran", ar: "اعتنِ بنفسك مع القرآن", tr: "Kur'an ile kendine iyi bak", ur: "قرآن کے ساتھ اپنا خیال رکھیں" },
  "home.moodsDesc": { fr: "Choisis ton état, écoute les versets qui te parlent", en: "Choose your state, listen to verses that speak to you", nl: "Kies je gevoel, luister naar verzen die je raken", ar: "اختر حالتك، واستمع للآيات التي تخاطبك", tr: "Halini seç, sana hitap eden ayetleri dinle", ur: "اپنی حالت چنیں، آپ سے بات کرنے والی آیات سنیں" },
  "home.moodsButton": { fr: "Découvrir les États du cœur", en: "Discover States of the Heart", nl: "Ontdek Staten van het hart", ar: "اكتشف أحوال القلب", tr: "Kalp Hallerini Keşfet", ur: "دل کے احوال دریافت کریں" },
  "home.days": { fr: "jours", en: "days", nl: "dagen", ar: "أيام", tr: "gün", ur: "دن" },
  "home.today": { fr: "aujourd'hui", en: "today", nl: "vandaag", ar: "اليوم", tr: "bugün", ur: "آج" },
  "home.quizButton": { fr: "Commencer le Quiz Niveau", en: "Start Level Quiz", nl: "Start Niveau Quiz", ar: "ابدأ اختبار المستوى", tr: "Seviye Testini Başlat", ur: "سطح کا امتحان شروع کریں" },
  "home.quizButtonDesc": { fr: "Testez votre niveau Hifz", en: "Test your Hifz level", nl: "Test je Hifz-niveau", ar: "اختبر مستوى حفظك", tr: "Hıfz seviyenizi test edin", ur: "اپنا حفظ لیول ٹیسٹ کریں" },
  "home.tarteelButton": { fr: "Commencer votre Tarteel", en: "Start your Tarteel", nl: "Start je Tarteel", ar: "ابدأ ترتيلك", tr: "Tertilinizi başlatın", ur: "اپنا ترتیل شروع کریں" },
  "home.tarteelButtonDesc": { fr: "Récitation + Correction IA", en: "Recitation + AI Correction", nl: "Recitatie + AI-correctie", ar: "تلاوة + تصحيح ذكي", tr: "Tilavet + Yapay Zeka Düzeltmesi", ur: "تلاوت + AI تصحیح" },
  "home.leaderboardButton": { fr: "Voir votre classement", en: "View your ranking", nl: "Bekijk je ranglijst", ar: "شاهد ترتيبك", tr: "Sıralamamızı görün", ur: "اپنی درجہ بندی دیکھیں" },
  "home.leaderboardButtonDesc": { fr: "Top mondial / pays", en: "Global / country top", nl: "Wereld / land top", ar: "عالمي / حسب البلد", tr: "Dünya / ülke sıralaması", ur: "عالمی / ملکی ٹاپ" },
  "home.progressButton": { fr: "Voir ma progression", en: "View my progress", nl: "Bekijk mijn voortgang", ar: "عرض تقدمي", tr: "İlerlememimi gör", ur: "میری پیشرفت دیکھیں" },
  "home.progressButtonDesc": { fr: "Maîtrise & Hifz Map", en: "Mastery & Hifz Map", nl: "Beheersing & Hifz kaart", ar: "إتقان وخريطة الحفظ", tr: "Ustalık & Hıfız Haritası", ur: "مہارت اور حفظ نقشہ" },
  "home.classMode": { fr: "Classe Professeur", en: "Teacher Class", nl: "Lerarenklas", ar: "فصل المعلم", tr: "Öğretmen Sınıfı", ur: "استاد کلاس" },

  // Daily Tarteel Challenge
  "daily.title": { fr: "🎯 Défi Tarteel du jour", en: "🎯 Daily Tarteel Challenge", nl: "🎯 Dagelijkse Tarteel Uitdaging", ar: "🎯 تحدي الترتيل اليومي", tr: "🎯 Günlük Tertil Meydan Okuması", ur: "🎯 روزانہ ترتیل چیلنج" },
  "daily.subtitle": { fr: "Récite cette sourate et teste l'IA en direct !", en: "Recite this surah and test the AI live!", nl: "Reciteer deze soera en test de AI live!", ar: "اقرأ هذه السورة واختبر الذكاء الاصطناعي مباشرة!", tr: "Bu sureyi oku ve yapay zekayı canlı test et!", ur: "یہ سورۃ پڑھیں اور AI کو براہ راست ٹیسٹ کریں!" },
  "daily.startButton": { fr: "Écouter & réciter", en: "Listen & recite", nl: "Luister & reciteer", ar: "استمع وارتل", tr: "Dinle & oku", ur: "سنیں اور پڑھیں" },
  "daily.stopButton": { fr: "Terminer la récitation", en: "Finish recitation", nl: "Recitatie beëindigen", ar: "إنهاء التلاوة", tr: "Tilaveti bitir", ur: "تلاوت ختم کریں" },
  "daily.almost": { fr: "Presque", en: "Almost", nl: "Bijna", ar: "تقريباً", tr: "Neredeyse", ur: "تقریباً" },
  "daily.excellent": { fr: "Excellent ! Mâ shâ' Allâh !", en: "Excellent! Masha'Allah!", nl: "Uitstekend! Masha'Allah!", ar: "ممتاز! ما شاء الله!", tr: "Mükemmel! Maşallah!", ur: "بہترین! ماشاءاللہ!" },
  "daily.good": { fr: "Bien joué ! Continue !", en: "Well done! Keep going!", nl: "Goed gedaan! Ga zo door!", ar: "أحسنت! واصل!", tr: "İyi oynadın! Devam et!", ur: "شاباش! جاری رکھیں!" },
  "daily.notBad": { fr: "Pas mal ! Tu progresses !", en: "Not bad! You're improving!", nl: "Niet slecht! Je verbetert!", ar: "ليس سيئاً! أنت تتحسن!", tr: "Fena değil! Gelişiyorsun!", ur: "بُرا نہیں! آپ ترقی کر رہے ہیں!" },
  "daily.tryAgain": { fr: "Continue à t'entraîner !", en: "Keep practicing!", nl: "Blijf oefenen!", ar: "واصل التدريب!", tr: "Pratik yapmaya devam et!", ur: "مشق جاری رکھیں!" },
  "daily.perfectBadge": { fr: "Récitation parfaite !", en: "Perfect recitation!", nl: "Perfecte recitatie!", ar: "تلاوة مثالية!", tr: "Mükemmel tilavet!", ur: "کامل تلاوت!" },
  "daily.continue": { fr: "Continuer", en: "Continue", nl: "Doorgaan", ar: "متابعة", tr: "Devam", ur: "جاری رکھیں" },
  "daily.bonus": { fr: "bonus !", en: "bonus!", nl: "bonus!", ar: "مكافأة!", tr: "bonus!", ur: "بونس!" },
  "daily.challengeBadge": { fr: "Défi du jour !", en: "Daily challenge!", nl: "Dagelijkse uitdaging!", ar: "تحدي اليوم!", tr: "Günün meydan okuması!", ur: "روزانہ چیلنج!" },
  "daily.hideHint": { fr: "Le texte disparaît quand tu récites !", en: "Text disappears when you recite!", nl: "Tekst verdwijnt als je reciteert!", ar: "النص يختفي عند التلاوة!", tr: "Okurken metin kaybolur!", ur: "تلاوت کرتے وقت متن غائب ہو جاتا ہے!" },

  // Quran page mode labels & descriptions
  "mode.dictVerse": { fr: "Dicté verset", en: "Verse dictation", nl: "Vers dictee", ar: "إملاء آية", tr: "Ayet diktesi", ur: "آیت ڈکٹیشن" },
  "mode.dictVerseDesc": { fr: "Écoute un verset puis récite-le au micro", en: "Listen to a verse then recite it to the mic", nl: "Luister naar een vers en reciteer het", ar: "استمع لآية ثم اتلها في المايك", tr: "Bir ayet dinle sonra mikrofona oku", ur: "آیت سنیں پھر مائیک میں پڑھیں" },
  "mode.dictSurah": { fr: "Dicté sourate", en: "Surah dictation", nl: "Soera dictee", ar: "إملاء سورة", tr: "Sure diktesi", ur: "سورۃ ڈکٹیشن" },
  "mode.dictSurahDesc": { fr: "Récite la sourate entière verset par verset", en: "Recite the entire surah verse by verse", nl: "Reciteer de volledige soera vers per vers", ar: "اتلُ السورة كاملة آية بآية", tr: "Tüm sureyi ayet ayet oku", ur: "پوری سورۃ آیت بہ آیت پڑھیں" },
  "mode.tahaddi": { fr: "Tahaddi", en: "Tahaddi", nl: "Tahaddi", ar: "تحدي", tr: "Tahaddi", ur: "تحدی" },
  "mode.tahaddiDesc": { fr: "Défi : récite de mémoire sans écouter d'abord", en: "Challenge: recite from memory without listening first", nl: "Uitdaging: reciteer uit het hoofd zonder te luisteren", ar: "تحدي: اتلُ من الحفظ بدون استماع أولاً", tr: "Meydan okuma: önce dinlemeden ezbere oku", ur: "چیلنج: پہلے سنے بغیر حفظ سے پڑھیں" },
  "mode.control": { fr: "Contrôle", en: "Hifz Check", nl: "Controle", ar: "اختبار", tr: "Kontrol", ur: "جانچ" },
  "mode.controlDesc": { fr: "Teste ta mémorisation avec un score final", en: "Test your memorization with a final score", nl: "Test je memorisatie met een eindscore", ar: "اختبر حفظك بنتيجة نهائية", tr: "Son puanla ezberini test et", ur: "حتمی نمبر کے ساتھ حفظ ٹیسٹ کریں" },
  "mode.findAyah": { fr: "Trouver l'Ayah", en: "Find the Ayah", nl: "Vind de Ayah", ar: "اعثر على الآية", tr: "Ayeti Bul", ur: "آیت تلاش کریں" },
  "mode.findAyahDesc": { fr: "Récite un passage et retrouve sa position", en: "Recite a passage and find its position", nl: "Reciteer een passage en vind de positie", ar: "اتلُ مقطعاً وابحث عن موقعه", tr: "Bir pasaj oku ve konumunu bul", ur: "ایک حصہ پڑھیں اور مقام تلاش کریں" },
  "mode.readOnly": { fr: "Lecture seule", en: "Listen only", nl: "Alleen luisteren", ar: "استماع فقط", tr: "Sadece dinle", ur: "صرف سننا" },
  "mode.readOnlyDesc": { fr: "Écoute la récitation sans micro, idéal pour suivre", en: "Listen to recitation without mic, ideal for following", nl: "Luister zonder microfoon, ideaal om te volgen", ar: "استمع للتلاوة بدون مايك، مثالي للمتابعة", tr: "Mikrofonsuz tilaveti dinle, takip için ideal", ur: "مائیک کے بغیر تلاوت سنیں، پیروی کے لیے بہترین" },
  "mode.surah": { fr: "Sourate", en: "Surah", nl: "Soera", ar: "سورة", tr: "Sure", ur: "سورۃ" },
  "mode.all": { fr: "Tout", en: "All", nl: "Alles", ar: "الكل", tr: "Tümü", ur: "سب" },
  "mode.resume": { fr: "Reprendre", en: "Resume", nl: "Hervatten", ar: "متابعة", tr: "Devam et", ur: "جاری رکھیں" },
  "mode.search": { fr: "Rechercher...", en: "Search...", nl: "Zoeken...", ar: "بحث...", tr: "Ara...", ur: "تلاش..." },
  "mode.loading": { fr: "Chargement...", en: "Loading...", nl: "Laden...", ar: "جارٍ التحميل...", tr: "Yükleniyor...", ur: "لوڈ ہو رہا ہے..." },
  "mode.noResult": { fr: "Aucun résultat", en: "No results", nl: "Geen resultaten", ar: "لا نتائج", tr: "Sonuç yok", ur: "کوئی نتیجہ نہیں" },

  // Settings - Appearance
  "settings.appearance": { fr: "Apparence", en: "Appearance", nl: "Weergave", ar: "المظهر", tr: "Görünüm", ur: "ظاہری شکل" },
  "settings.light": { fr: "☀️ Clair", en: "☀️ Light", nl: "☀️ Licht", ar: "☀️ فاتح", tr: "☀️ Açık", ur: "☀️ ہلکا" },
  "settings.dark": { fr: "🌙 Sombre", en: "🌙 Dark", nl: "🌙 Donker", ar: "🌙 داكن", tr: "🌙 Koyu", ur: "🌙 گہرا" },
  "settings.auto": { fr: "⚙️ Auto", en: "⚙️ Auto", nl: "⚙️ Auto", ar: "⚙️ تلقائي", tr: "⚙️ Otomatik", ur: "⚙️ خودکار" },
  "settings.dedication": { fr: "إعادة عرض الإهداء", en: "Show dedication", nl: "Opdracht tonen", ar: "إعادة عرض الإهداء", tr: "İthafı göster", ur: "اہداء دکھائیں" },
  "settings.dedicationDesc": { fr: "Dedication / Dédicace", en: "Dedication / Dédicace", nl: "Opdracht / Dédicace", ar: "إهداء / Dédicace", tr: "İthaf / Dédicace", ur: "اہداء / Dédicace" },

  // Home - Classroom
  "home.classActive": { fr: "classe active", en: "active class", nl: "actieve klas", ar: "فصل نشط", tr: "aktif sınıf", ur: "فعال کلاس" },
  "home.classesActive": { fr: "classes actives", en: "active classes", nl: "actieve klassen", ar: "فصول نشطة", tr: "aktif sınıflar", ur: "فعال کلاسیں" },
  "home.createOrJoin": { fr: "Créer ou rejoindre une classe", en: "Create or join a class", nl: "Maak of neem deel aan een klas", ar: "إنشاء أو الانضمام لفصل", tr: "Sınıf oluştur veya katıl", ur: "کلاس بنائیں یا شامل ہوں" },
  "home.share": { fr: "Partager", en: "Share", nl: "Delen", ar: "مشاركة", tr: "Paylaş", ur: "شیئر کریں" },
  "home.member": { fr: "membre", en: "member", nl: "lid", ar: "عضو", tr: "üye", ur: "ممبر" },
  "home.members": { fr: "membres", en: "members", nl: "leden", ar: "أعضاء", tr: "üyeler", ur: "ممبران" },
  "home.viewAllClasses": { fr: "Voir les classes", en: "View all classes", nl: "Alle klassen bekijken", ar: "عرض كل الفصول", tr: "Tüm sınıfları gör", ur: "تمام کلاسیں دیکھیں" },
  "home.createClass": { fr: "Créer une classe", en: "Create a class", nl: "Klas aanmaken", ar: "إنشاء فصل", tr: "Sınıf oluştur", ur: "کلاس بنائیں" },
  "home.joinClass": { fr: "Rejoindre", en: "Join", nl: "Deelnemen", ar: "انضمام", tr: "Katıl", ur: "شامل ہوں" },
  "home.hifzChallenge": { fr: "Défi Hifz", en: "Hifz Challenge", nl: "Hifz Uitdaging", ar: "تحدي الحفظ", tr: "Hıfz Meydan Okuması", ur: "حفظ چیلنج" },
  "home.surah": { fr: "Sourate", en: "Surah", nl: "Soera", ar: "سورة", tr: "Sure", ur: "سورۃ" },
  "home.level.label": { fr: "Niv.", en: "Lv.", nl: "Niv.", ar: "مست.", tr: "Sv.", ur: "سطح" },

  // Leaderboard
  "lb.you": { fr: "← toi", en: "← you", nl: "← jij", ar: "← أنت", tr: "← sen", ur: "← آپ" },

  // Moods (États du cœur)
  "nav.moods": { fr: "Cœur", en: "Heart", nl: "Hart", ar: "القلب", tr: "Kalp", ur: "دل" },
  "moods.title": { fr: "États du cœur", en: "States of the Heart", nl: "Staten van het hart", ar: "أحوال القلب", tr: "Kalp Halleri", ur: "دل کے احوال" },
  "moods.subtitle": { fr: "Trouve le verset qui parle à ton état", en: "Find the verse that speaks to your state", nl: "Vind het vers dat past bij je gevoel", ar: "اعثر على الآية التي تخاطب حالتك", tr: "Haline uygun ayeti bul", ur: "اپنی حالت سے بات کرنے والی آیت تلاش کریں" },
  "moods.loop": { fr: "Boucle", en: "Loop", nl: "Herhalen", ar: "تكرار", tr: "Döngü", ur: "لوپ" },
  "moods.passages": { fr: "passages", en: "passages", nl: "passages", ar: "مقاطع", tr: "pasaj", ur: "حصے" },
  "moods.verses": { fr: "versets", en: "verses", nl: "verzen", ar: "آيات", tr: "ayet", ur: "آیات" },
  "moods.listen": { fr: "Écouter", en: "Listen", nl: "Luisteren", ar: "استمع", tr: "Dinle", ur: "سنیں" },
  "moods.listenLoop": { fr: "Écouter en boucle", en: "Listen on loop", nl: "Op herhaling luisteren", ar: "استمع بالتكرار", tr: "Döngüde dinle", ur: "لوپ میں سنیں" },
  "moods.viewVerses": { fr: "Voir les versets", en: "View verses", nl: "Verzen bekijken", ar: "عرض الآيات", tr: "Ayetleri gör", ur: "آیات دیکھیں" },
  "moods.loading": { fr: "Chargement des versets...", en: "Loading verses...", nl: "Verzen laden...", ar: "جاري تحميل الآيات...", tr: "Ayetler yükleniyor...", ur: "آیات لوڈ ہو رہی ہیں..." },
  "moods.endOfVerses": { fr: "Fin des versets", en: "End of verses", nl: "Einde van verzen", ar: "نهاية الآيات", tr: "Ayetlerin sonu", ur: "آیات کا اختتام" },
  "moods.verse": { fr: "Verset", en: "Verse", nl: "Vers", ar: "آية", tr: "Ayet", ur: "آیت" },
  "moods.notFound": { fr: "Introuvable", en: "Not found", nl: "Niet gevonden", ar: "غير موجود", tr: "Bulunamadı", ur: "نہیں ملا" },
  "moods.surah": { fr: "Sourate", en: "Surah", nl: "Soera", ar: "سورة", tr: "Sure", ur: "سورۃ" },
  "moods.ayah": { fr: "Ayah", en: "Ayah", nl: "Ayah", ar: "آية", tr: "Ayet", ur: "آیت" },

  // Mood presets titles
  "mood.sleep": { fr: "Pour dormir", en: "For sleeping", nl: "Om te slapen", ar: "للنوم", tr: "Uyumak için", ur: "سونے کے لیے" },
  "mood.sleep.sub": { fr: "Calme et protection avant le sommeil", en: "Calm and protection before sleep", nl: "Rust en bescherming voor het slapen", ar: "هدوء وحماية قبل النوم", tr: "Uyku öncesi huzur ve koruma", ur: "سونے سے پہلے سکون اور تحفظ" },
  "mood.sadness": { fr: "Tristesse", en: "Sadness", nl: "Verdriet", ar: "الحزن", tr: "Üzüntü", ur: "غم" },
  "mood.sadness.sub": { fr: "Réconfort dans la peine", en: "Comfort in grief", nl: "Troost in verdriet", ar: "عزاء في الحزن", tr: "Kederde teselli", ur: "غم میں تسلی" },
  "mood.anxiety": { fr: "Stress / Anxiété", en: "Stress / Anxiety", nl: "Stress / Angst", ar: "القلق", tr: "Stres / Kaygı", ur: "تناؤ / پریشانی" },
  "mood.anxiety.sub": { fr: "Apaisement et confiance en Allah", en: "Peace and trust in Allah", nl: "Rust en vertrouwen in Allah", ar: "سكينة وثقة بالله", tr: "Allah'a güven ve huzur", ur: "اللہ پر بھروسا اور سکون" },
  "mood.anger": { fr: "Colère", en: "Anger", nl: "Woede", ar: "الغضب", tr: "Öfke", ur: "غصہ" },
  "mood.anger.sub": { fr: "Maîtriser sa colère par le Coran", en: "Control anger through Quran", nl: "Woede beheersen met de Koran", ar: "السيطرة على الغضب بالقرآن", tr: "Kur'an ile öfkeyi kontrol et", ur: "قرآن سے غصہ قابو کریں" },
  "mood.loneliness": { fr: "Solitude", en: "Loneliness", nl: "Eenzaamheid", ar: "الوحدة", tr: "Yalnızlık", ur: "تنہائی" },
  "mood.loneliness.sub": { fr: "Allah est toujours avec toi", en: "Allah is always with you", nl: "Allah is altijd bij je", ar: "الله دائمًا معك", tr: "Allah her zaman seninle", ur: "اللہ ہمیشہ آپ کے ساتھ ہے" },
  "mood.forgiveness": { fr: "Besoin de pardon", en: "Need for forgiveness", nl: "Behoefte aan vergeving", ar: "طلب المغفرة", tr: "Bağışlanma ihtiyacı", ur: "معافی کی ضرورت" },
  "mood.forgiveness.sub": { fr: "Implorer le pardon d'Allah", en: "Seek Allah's forgiveness", nl: "Smeek om Allah's vergeving", ar: "التماس مغفرة الله", tr: "Allah'ın bağışlamasını dile", ur: "اللہ سے معافی مانگیں" },
  "mood.gratitude": { fr: "Gratitude", en: "Gratitude", nl: "Dankbaarheid", ar: "الشكر", tr: "Şükür", ur: "شکرگزاری" },
  "mood.gratitude.sub": { fr: "Reconnaissance envers Allah", en: "Thankfulness to Allah", nl: "Dankbaarheid jegens Allah", ar: "شكر الله", tr: "Allah'a şükran", ur: "اللہ کا شکر" },
  "mood.hope": { fr: "Espoir / Motivation", en: "Hope / Motivation", nl: "Hoop / Motivatie", ar: "الأمل", tr: "Umut / Motivasyon", ur: "امید / حوصلہ" },
  "mood.hope.sub": { fr: "Retrouver force et espérance", en: "Find strength and hope", nl: "Vind kracht en hoop", ar: "استعادة القوة والأمل", tr: "Güç ve umut bul", ur: "طاقت اور امید پائیں" },
  "mood.doubts": { fr: "Doutes / Waswas", en: "Doubts / Waswas", nl: "Twijfels / Waswas", ar: "الوسوسة", tr: "Şüpheler / Vesvese", ur: "وسوسے / شکوک" },
  "mood.doubts.sub": { fr: "Chasser les doutes avec le Coran", en: "Drive away doubts with Quran", nl: "Verdrijf twijfels met de Koran", ar: "طرد الوساوس بالقرآن", tr: "Kur'an ile şüpheleri kov", ur: "قرآن سے شکوک دور کریں" },
  "mood.love": { fr: "Amour d'Allah", en: "Love of Allah", nl: "Liefde voor Allah", ar: "حب الله", tr: "Allah sevgisi", ur: "اللہ سے محبت" },
  "mood.love.sub": { fr: "Proximité et amour divin", en: "Divine closeness and love", nl: "Goddelijke nabijheid en liefde", ar: "القرب والحب الإلهي", tr: "İlahi yakınlık ve sevgi", ur: "الٰہی قربت اور محبت" },
  "mood.hardship": { fr: "Épreuves", en: "Hardship", nl: "Beproevingen", ar: "الابتلاء", tr: "Sınavlar", ur: "آزمائشیں" },
  "mood.hardship.sub": { fr: "Patience face aux difficultés", en: "Patience in difficulty", nl: "Geduld bij moeilijkheden", ar: "الصبر عند الشدائد", tr: "Zorluklarda sabır", ur: "مشکلات میں صبر" },
  "mood.ruqya": { fr: "Rouqya / Protection", en: "Ruqya / Protection", nl: "Ruqya / Bescherming", ar: "الرقية الشرعية", tr: "Rukye / Koruma", ur: "رقیہ / تحفظ" },
  "mood.ruqya.sub": { fr: "Protection et sérénité spirituelle", en: "Spiritual protection and serenity", nl: "Spirituele bescherming en rust", ar: "حماية وسكينة روحية", tr: "Ruhani koruma ve huzur", ur: "روحانی تحفظ اور سکون" },
  "mood.success": { fr: "Succès / Rizq", en: "Success / Rizq", nl: "Succes / Rizq", ar: "الرزق والنجاح", tr: "Başarı / Rızık", ur: "کامیابی / رزق" },
  "mood.success.sub": { fr: "Rizq, baraka et succès licite", en: "Rizq, baraka and lawful success", nl: "Rizq, baraka en wettig succes", ar: "الرزق والبركة والنجاح الحلال", tr: "Rızık, bereket ve helal başarı", ur: "رزق، برکت اور حلال کامیابی" },
  "mood.study": { fr: "Étude / Concentration", en: "Study / Focus", nl: "Studie / Concentratie", ar: "الدراسة والتركيز", tr: "Çalışma / Odaklanma", ur: "مطالعہ / توجہ" },
  "mood.study.sub": { fr: "Versets pour se concentrer et mémoriser", en: "Verses for focus and memorization", nl: "Verzen voor concentratie en memorisatie", ar: "آيات للتركيز والحفظ", tr: "Odaklanma ve ezberleme için ayetler", ur: "توجہ اور حفظ کے لیے آیات" },

  // Offline downloader
  "offline.title": { fr: "Télécharger pour hors-ligne", en: "Download for offline", nl: "Download voor offline", ar: "تحميل للاستخدام بدون اتصال", tr: "Çevrimdışı için indir", ur: "آف لائن کے لیے ڈاؤن لوڈ" },
  "offline.subtitle": { fr: "Audio des États du cœur disponible sans connexion", en: "Heart states audio available offline", nl: "Hart-audio beschikbaar offline", ar: "صوتيات أحوال القلب متاحة بدون اتصال", tr: "Kalp halleri sesi çevrimdışı kullanılabilir", ur: "دل کے احوال کی آڈیو آف لائن دستیاب" },
  "offline.download": { fr: "Télécharger", en: "Download", nl: "Downloaden", ar: "تحميل", tr: "İndir", ur: "ڈاؤن لوڈ" },
  "offline.downloading": { fr: "Téléchargement...", en: "Downloading...", nl: "Downloaden...", ar: "جاري التحميل...", tr: "İndiriliyor...", ur: "ڈاؤن لوڈ ہو رہا ہے..." },
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
    return (entry as any)[lang] || entry.fr;
  }, [lang]);

  const langInfo = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  // Update document dir for RTL
  useEffect(() => {
    document.documentElement.dir = langInfo.dir;
    document.documentElement.lang = lang;
  }, [lang, langInfo.dir]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir: langInfo.dir, isRTL: lang === "ar" || lang === "ur" }}>
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
