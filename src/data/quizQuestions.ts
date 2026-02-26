export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  category?: string;
}

// ─── Utility: shuffle + session builder ─────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildQuizSession(pool: QuizQuestion[], count = 10): QuizQuestion[] {
  return shuffle(pool).slice(0, count);
}

// ─── General quiz (40+ questions) ───────────────────────────
export const quizQuestions: QuizQuestion[] = [
  { question: "Combien de sourates contient le Saint Coran ?", options: ["100", "114", "120", "99"], correctIndex: 1, category: "general" },
  { question: "Quel est le nom de la première sourate du Coran ?", options: ["Al-Baqara", "Al-Ikhlas", "Al-Fatiha", "An-Nas"], correctIndex: 2, category: "general" },
  { question: "La sourate Al-Ikhlas parle principalement de...", options: ["La prière", "L'unicité d'Allah", "Le jeûne", "L'aumône"], correctIndex: 1, category: "general" },
  { question: "Quelle sourate est aussi appelée \"L'Ouverture\" ?", options: ["An-Nasr", "Al-Fatiha", "Al-Falaq", "Al-Kawthar"], correctIndex: 1, category: "general" },
  { question: "Combien de versets contient la sourate Al-Fatiha ?", options: ["5", "6", "7", "8"], correctIndex: 2, category: "general" },
  { question: "Quelle est la plus longue sourate du Coran ?", options: ["Al-Imran", "An-Nisa", "Al-Baqara", "Al-Maidah"], correctIndex: 2, category: "general" },
  { question: "Quelle est la plus courte sourate du Coran ?", options: ["Al-Ikhlas", "Al-Kawthar", "An-Nasr", "Al-Asr"], correctIndex: 1, category: "general" },
  { question: "Combien de juz' (parties) contient le Coran ?", options: ["20", "25", "30", "40"], correctIndex: 2, category: "general" },
  { question: "Dans quelle ville le Coran a-t-il commencé à être révélé ?", options: ["Médine", "Jérusalem", "La Mecque", "Taïf"], correctIndex: 2, category: "general" },
  { question: "Quel mois le Coran a-t-il commencé à être révélé ?", options: ["Sha'ban", "Ramadan", "Muharram", "Rajab"], correctIndex: 1, category: "general" },
  { question: "Quel ange a transmis le Coran au Prophète ﷺ ?", options: ["Mikael", "Israfil", "Jibril", "Azrail"], correctIndex: 2, category: "general" },
  { question: "Quelle sourate est appelée \"Le Cœur du Coran\" ?", options: ["Al-Baqara", "Yasin", "Ar-Rahman", "Al-Mulk"], correctIndex: 1, category: "general" },
  { question: "Combien de piliers a l'Islam ?", options: ["3", "4", "5", "6"], correctIndex: 2, category: "general" },
  { question: "Combien de piliers a la foi (Iman) ?", options: ["4", "5", "6", "7"], correctIndex: 2, category: "general" },
  { question: "Quelle est la direction de la prière (Qibla) ?", options: ["Jérusalem", "Médine", "La Ka'ba", "Le Mont Arafat"], correctIndex: 2, category: "general" },
  { question: "Combien de prières obligatoires par jour ?", options: ["3", "4", "5", "7"], correctIndex: 2, category: "general" },
  { question: "Quel prophète est mentionné le plus dans le Coran ?", options: ["Ibrahim", "Mohammed", "Moussa", "Issa"], correctIndex: 2, category: "general" },
  { question: "Que signifie \"Islam\" ?", options: ["Paix", "Soumission à Dieu", "Amour", "Sagesse"], correctIndex: 1, category: "general" },
  { question: "Quel est le dernier mois du calendrier islamique ?", options: ["Ramadan", "Shawwal", "Dhul Hijja", "Muharram"], correctIndex: 2, category: "general" },
  { question: "La sourate Al-Kahf parle de...", options: ["Les gens de la caverne", "Les anges", "Le paradis", "Noé"], correctIndex: 0, category: "general" },
  { question: "Quel est le livre sacré donné à Moussa ?", options: ["L'Injil", "La Torah", "Le Zabour", "Le Coran"], correctIndex: 1, category: "general" },
  { question: "Quel est le livre sacré donné à Daoud ?", options: ["La Torah", "L'Injil", "Le Zabour", "Le Coran"], correctIndex: 2, category: "general" },
  { question: "Quel est le livre sacré donné à Issa ?", options: ["La Torah", "L'Injil", "Le Zabour", "Le Coran"], correctIndex: 1, category: "general" },
  { question: "Où se trouve la Ka'ba ?", options: ["Médine", "Jérusalem", "La Mecque", "Le Caire"], correctIndex: 2, category: "general" },
  { question: "Quelle sourate commence par \"Tabāraka\" ?", options: ["Al-Mulk", "Yasin", "Ar-Rahman", "Al-Waqi'a"], correctIndex: 0, category: "general" },
  { question: "Quelle sourate se récite chaque vendredi recommandée ?", options: ["Al-Baqara", "Al-Kahf", "Yasin", "Al-Mulk"], correctIndex: 1, category: "general" },
  { question: "Vrai ou faux : Le Coran a été révélé en une seule fois.", options: ["Vrai", "Faux"], correctIndex: 1, category: "general" },
  { question: "Combien d'années a duré la révélation du Coran ?", options: ["10 ans", "15 ans", "23 ans", "30 ans"], correctIndex: 2, category: "general" },
  { question: "Quelle est la nuit la plus importante mentionnée dans le Coran ?", options: ["Laylat al-Mi'raj", "Laylat al-Qadr", "Laylat al-Bara'a", "Laylat al-Isra"], correctIndex: 1, category: "general" },
  { question: "Laylat al-Qadr vaut mieux que combien de mois ?", options: ["100 mois", "500 mois", "1000 mois", "10 000 mois"], correctIndex: 2, category: "general" },
  { question: "Quelle sourate mentionne l'histoire de l'éléphant ?", options: ["Al-Fil", "Quraysh", "Al-Masad", "Al-Kawthar"], correctIndex: 0, category: "general" },
  { question: "Combien de prophètes sont mentionnés par nom dans le Coran ?", options: ["20", "25", "30", "40"], correctIndex: 1, category: "general" },
  { question: "Quelle est la sourate qui ne commence pas par Bismillah ?", options: ["Al-Fatiha", "At-Tawba", "An-Nas", "Al-Baqara"], correctIndex: 1, category: "general" },
  { question: "Dans quelle sourate Bismillah apparaît-il deux fois ?", options: ["Al-Fatiha", "An-Naml", "Al-Baqara", "Yasin"], correctIndex: 1, category: "general" },
  { question: "Quel est le premier mot révélé du Coran ?", options: ["Alhamdulillah", "Bismillah", "Iqra", "Qul"], correctIndex: 2, category: "general" },
  { question: "Quelle sourate est une protection contre le Dajjal ?", options: ["Al-Kahf (10 premiers versets)", "Yasin", "Al-Mulk", "Ar-Rahman"], correctIndex: 0, category: "general" },
  { question: "La sourate Ar-Rahman répète souvent quel verset ?", options: ["Alhamdulillah", "Fabi-ayyi ala'i Rabbikuma tukadhdhibaan", "Subhanallah", "La ilaha illallah"], correctIndex: 1, category: "general" },
  { question: "Quelle sourate protège dans la tombe selon le hadith ?", options: ["Al-Baqara", "Al-Mulk", "Yasin", "Al-Waqi'a"], correctIndex: 1, category: "general" },
  { question: "Combien de sajdas (prosternations) de récitation y a-t-il dans le Coran ?", options: ["10", "14", "15", "20"], correctIndex: 2, category: "general" },
  { question: "Quelle sourate mentionne l'histoire de Youssouf en détail ?", options: ["Al-Anbiya", "Yusuf", "Al-Qasas", "Maryam"], correctIndex: 1, category: "general" },
  { question: "Quel est le verset le plus long du Coran ?", options: ["Ayat al-Kursi", "Al-Baqara 282", "Al-Baqara 255", "Al-Imran 18"], correctIndex: 1, category: "general" },
  { question: "Que signifie 'Juz Amma' ?", options: ["La partie de la lumière", "La partie 'Il a questionné'", "La partie de la bénédiction", "La dernière partie"], correctIndex: 1, category: "general" },
];

// ─── Quran memorization quiz (40+ questions) ────────────────
export const quranMemorizationQuiz: QuizQuestion[] = [
  { question: "De quelle sourate provient : \"ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ\" ?", options: ["Al-Baqara", "Al-Fatiha", "Al-Ikhlas", "An-Nas"], correctIndex: 1, category: "memorization" },
  { question: "Quel verset suit \"بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\" dans Al-Fatiha ?", options: ["مَٰلِكِ يَوْمِ ٱلدِّينِ", "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ", "إِيَّاكَ نَعْبُدُ", "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ"], correctIndex: 1, category: "memorization" },
  { question: "Complétez : \"قُلْ هُوَ ٱللَّهُ ...\"", options: ["ٱلْعَظِيمُ", "أَحَدٌ", "ٱلْكَبِيرُ", "ٱلرَّحِيمُ"], correctIndex: 1, category: "memorization" },
  { question: "De quelle sourate : \"قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ\" ?", options: ["Al-Falaq", "An-Nas", "Al-Ikhlas", "Al-Kawthar"], correctIndex: 1, category: "memorization" },
  { question: "De quelle sourate : \"إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ\" ?", options: ["Al-Asr", "Al-Kawthar", "An-Nasr", "Al-Fil"], correctIndex: 1, category: "memorization" },
  { question: "Quel verset vient après \"ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\" dans Al-Fatiha ?", options: ["ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", "مَٰلِكِ يَوْمِ ٱلدِّينِ", "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ"], correctIndex: 2, category: "memorization" },
  { question: "Combien de fois \"كَلَّا سَيَعْلَمُونَ\" apparaît dans sourate An-Naba ?", options: ["1 fois", "2 fois", "3 fois", "4 fois"], correctIndex: 1, category: "memorization" },
  { question: "De quelle sourate : \"وَٱلْعَصْرِ إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ\" ?", options: ["Al-Asr", "At-Tin", "Al-Qadr", "Al-Alaq"], correctIndex: 0, category: "memorization" },
  { question: "Quel est le dernier verset de sourate Al-Fatiha ?", options: ["إِيَّاكَ نَعْبُدُ", "مَٰلِكِ يَوْمِ ٱلدِّينِ", "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ"], correctIndex: 2, category: "memorization" },
  { question: "De quelle sourate : \"لَمْ يَلِدْ وَلَمْ يُولَدْ\" ?", options: ["Al-Falaq", "Al-Ikhlas", "An-Nas", "Al-Kawthar"], correctIndex: 1, category: "memorization" },
  // New 30+ questions
  { question: "Complétez : \"ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ...\"", options: ["ٱلْقَيُّومُ", "ٱلْعَلِيمُ", "ٱلْحَكِيمُ", "ٱلْعَظِيمُ"], correctIndex: 0, category: "memorization" },
  { question: "De quelle sourate : \"إِذَا جَآءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ\" ?", options: ["Al-Fil", "An-Nasr", "Al-Masad", "Al-Kawthar"], correctIndex: 1, category: "memorization" },
  { question: "Complétez : \"قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ · مِن شَرِّ مَا ...\"", options: ["خَلَقَ", "وَسْوَسَ", "حَسَدَ", "كَسَبَ"], correctIndex: 0, category: "memorization" },
  { question: "Quel verset suit \"ٱللَّهُ ٱلصَّمَدُ\" dans Al-Ikhlas ?", options: ["قُلْ هُوَ ٱللَّهُ أَحَدٌ", "لَمْ يَلِدْ وَلَمْ يُولَدْ", "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ", "ٱلْحَمْدُ لِلَّهِ"], correctIndex: 1, category: "memorization" },
  { question: "De quelle sourate : \"تَبَّتْ يَدَآ أَبِى لَهَبٍ وَتَبَّ\" ?", options: ["Al-Masad", "Al-Kawthar", "An-Nasr", "Quraysh"], correctIndex: 0, category: "memorization" },
  { question: "De quelle sourate : \"لِإِيلَٰفِ قُرَيْشٍ\" ?", options: ["Al-Fil", "Al-Masad", "Quraysh", "Al-Humazah"], correctIndex: 2, category: "memorization" },
  { question: "Complétez : \"إِنَّآ أَنزَلْنَٰهُ فِى لَيْلَةِ ...\"", options: ["ٱلْقَدْرِ", "ٱلْبَرَاءَةِ", "ٱلنِّصْفِ", "ٱلْجُمُعَةِ"], correctIndex: 0, category: "memorization" },
  { question: "Quel verset suit \"فَصَلِّ لِرَبِّكَ وَٱنْحَرْ\" ?", options: ["إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ", "إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ", "وَٱلْعَصْرِ", "ٱلْحَمْدُ لِلَّهِ"], correctIndex: 0, category: "memorization" },
  { question: "De quelle sourate : \"أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ\" ?", options: ["Ad-Duha", "Ash-Sharh", "At-Tin", "Al-Alaq"], correctIndex: 1, category: "memorization" },
  { question: "De quelle sourate : \"وَٱلضُّحَىٰ · وَٱلَّيْلِ إِذَا سَجَىٰ\" ?", options: ["Ash-Sharh", "Ad-Duha", "Al-Layl", "Al-Fajr"], correctIndex: 1, category: "memorization" },
  { question: "Complétez : \"وَٱلتِّينِ وَٱلزَّيْتُونِ · وَطُورِ ...\"", options: ["سِينِينَ", "ثَبِيرٍ", "عَرَفَاتٍ", "حِرَاءٍ"], correctIndex: 0, category: "memorization" },
  { question: "De quelle sourate : \"أَلْهَىٰكُمُ ٱلتَّكَاثُرُ\" ?", options: ["Al-Humazah", "At-Takathur", "Al-Asr", "Al-Qari'ah"], correctIndex: 1, category: "memorization" },
  { question: "De quelle sourate : \"ٱلْقَارِعَةُ · مَا ٱلْقَارِعَةُ\" ?", options: ["Al-Qari'ah", "Az-Zalzalah", "Al-Adiyat", "Al-Humazah"], correctIndex: 0, category: "memorization" },
  { question: "Complétez : \"إِذَا زُلْزِلَتِ ٱلْأَرْضُ ...\"", options: ["زِلْزَالَهَا", "رَجْفَتَهَا", "صَيْحَتَهَا", "دَكَّتَهَا"], correctIndex: 0, category: "memorization" },
  { question: "De quelle sourate : \"وَيْلٌ لِّكُلِّ هُمَزَةٍ لُّمَزَةٍ\" ?", options: ["Al-Masad", "Al-Humazah", "Al-Fil", "Quraysh"], correctIndex: 1, category: "memorization" },
  { question: "Quel verset suit \"إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ\" ?", options: ["مَٰلِكِ يَوْمِ ٱلدِّينِ", "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "ٱلْحَمْدُ لِلَّهِ"], correctIndex: 1, category: "memorization" },
  { question: "De quelle sourate : \"أَرَءَيْتَ ٱلَّذِى يُكَذِّبُ بِٱلدِّينِ\" ?", options: ["Al-Ma'un", "Al-Kawthar", "Al-Fil", "Al-Asr"], correctIndex: 0, category: "memorization" },
  { question: "De quelle sourate : \"قُلْ يَٰٓأَيُّهَا ٱلْكَٰفِرُونَ\" ?", options: ["Al-Ikhlas", "Al-Kafirun", "Al-Falaq", "An-Nas"], correctIndex: 1, category: "memorization" },
  { question: "Complétez : \"فَإِنَّ مَعَ ٱلْعُسْرِ ...\"", options: ["يُسْرًا", "صَبْرًا", "أَجْرًا", "نَصْرًا"], correctIndex: 0, category: "memorization" },
  { question: "Quel verset suit \"وَٱلْعَٰدِيَٰتِ ضَبْحًا\" ?", options: ["فَٱلْمُورِيَٰتِ قَدْحًا", "فَٱلْمُغِيرَٰتِ صُبْحًا", "إِنَّ ٱلْإِنسَٰنَ لِرَبِّهِۦ لَكَنُودٌ", "وَإِنَّهُۥ لِحُبِّ ٱلْخَيْرِ لَشَدِيدٌ"], correctIndex: 0, category: "memorization" },
  { question: "Vrai ou faux : \"ٱلْحَمْدُ لِلَّهِ\" est le 1er verset d'Al-Fatiha.", options: ["Vrai (c'est le 1er)", "Faux (c'est le 2e, après Bismillah)"], correctIndex: 1, category: "memorization" },
  { question: "De quelle sourate : \"ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ\" ?", options: ["Al-Alaq", "Al-Qalam", "Al-Muzzammil", "Al-Muddaththir"], correctIndex: 0, category: "memorization" },
  { question: "De quelle sourate : \"نٓ ۚ وَٱلْقَلَمِ وَمَا يَسْطُرُونَ\" ?", options: ["Al-Alaq", "Al-Qalam", "Al-Muzzammil", "Yasin"], correctIndex: 1, category: "memorization" },
  { question: "De quelle sourate : \"عَمَّ يَتَسَآءَلُونَ\" ?", options: ["An-Naba", "An-Nazi'at", "Abasa", "At-Takwir"], correctIndex: 0, category: "memorization" },
  { question: "Complétez : \"وَٱلْفَجْرِ · وَلَيَالٍ ...\"", options: ["عَشْرٍ", "سَبْعٍ", "ثَلَاثٍ", "خَمْسٍ"], correctIndex: 0, category: "memorization" },
  { question: "De quelle sourate : \"وَٱلشَّمْسِ وَضُحَىٰهَا\" ?", options: ["Ad-Duha", "Ash-Shams", "Al-Layl", "At-Tin"], correctIndex: 1, category: "memorization" },
  { question: "Quel verset suit \"مَٰلِكِ يَوْمِ ٱلدِّينِ\" ?", options: ["ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", "ٱلْحَمْدُ لِلَّهِ"], correctIndex: 1, category: "memorization" },
  { question: "De quelle sourate : \"لَمْ يَكُنِ ٱلَّذِينَ كَفَرُوا۟\" ?", options: ["Al-Bayyinah", "Al-Qadr", "Al-Alaq", "At-Tin"], correctIndex: 0, category: "memorization" },
  { question: "Complétez : \"وَمَآ أَدْرَىٰكَ مَا لَيْلَةُ ...\"", options: ["ٱلْقَدْرِ", "ٱلْبَرَاءَةِ", "ٱلنِّصْفِ", "ٱلْإِسْرَاءِ"], correctIndex: 0, category: "memorization" },
  { question: "De quelle sourate : \"أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَٰبِ ٱلْفِيلِ\" ?", options: ["Quraysh", "Al-Fil", "Al-Masad", "Al-Humazah"], correctIndex: 1, category: "memorization" },
  { question: "Quel verset suit \"قُلْ يَٰٓأَيُّهَا ٱلْكَٰفِرُونَ\" ?", options: ["لَآ أَعْبُدُ مَا تَعْبُدُونَ", "لَكُمْ دِينُكُمْ وَلِىَ دِينِ", "وَلَآ أَنَا۟ عَابِدٌ مَّا عَبَدتُّمْ", "وَلَآ أَنتُمْ عَٰبِدُونَ مَآ أَعْبُدُ"], correctIndex: 0, category: "memorization" },
];

// ─── Tajweed & Waqf quiz (40+ questions) ────────────────────
export const tajweedQuiz: QuizQuestion[] = [
  { question: "Que signifie le signe d'arrêt \"مـ\" (Waqf Lazim) ?", options: ["Arrêt permis", "Arrêt obligatoire", "Arrêt déconseillé", "Pas d'arrêt"], correctIndex: 1, category: "tajweed" },
  { question: "Que signifie le signe \"ط\" (Waqf Taam) ?", options: ["Arrêt interdit", "Arrêt permis", "Arrêt complet recommandé", "Continuation obligatoire"], correctIndex: 2, category: "tajweed" },
  { question: "Que signifie le signe \"ج\" (Waqf Jaiz) ?", options: ["Arrêt obligatoire", "Arrêt permis (au choix)", "Arrêt interdit", "Arrêt complet"], correctIndex: 1, category: "tajweed" },
  { question: "Au signe \"مـ\" (Waqf Lazim), devez-vous obligatoirement vous arrêter ?", options: ["Oui", "Non", "C'est facultatif", "Seulement en prière"], correctIndex: 0, category: "tajweed" },
  { question: "Qu'est-ce que le Madd (المد) en tajwid ?", options: ["L'arrêt à la fin d'un verset", "L'allongement d'une voyelle", "La nasalisation d'une lettre", "L'assimilation de deux lettres"], correctIndex: 1, category: "tajweed" },
  { question: "Qu'est-ce que l'Idgham (الإدغام) ?", options: ["Allongement d'une voyelle", "Prononciation claire d'une lettre", "Fusion/assimilation de deux lettres", "Arrêt sur une lettre"], correctIndex: 2, category: "tajweed" },
  { question: "Qu'est-ce que l'Ikhfa (الإخفاء) ?", options: ["Prononciation nasale atténuée du Noun Sakin", "Suppression d'une lettre", "Arrêt obligatoire", "Allongement de 6 temps"], correctIndex: 0, category: "tajweed" },
  { question: "Le signe \"ۖ\" (Waqf Kafi) indique :", options: ["Arrêt obligatoire", "Arrêt suffisant", "Continuation obligatoire", "Arrêt interdit"], correctIndex: 1, category: "tajweed" },
  { question: "Que signifie le signe \"ۗ\" (Waqf Hasan) ?", options: ["Arrêt bon/recommandé", "Arrêt obligatoire", "Continuation sans arrêt", "Arrêt interdit"], correctIndex: 0, category: "tajweed" },
  { question: "Combien de lettres de l'Ikhfa existe-t-il ?", options: ["10", "12", "15", "18"], correctIndex: 2, category: "tajweed" },
  // New 30+ tajweed questions
  { question: "Qu'est-ce que l'Izhar (الإظهار) ?", options: ["Prononciation claire sans nasalisation", "Fusion de deux lettres", "Allongement de 4 temps", "Arrêt obligatoire"], correctIndex: 0, category: "tajweed" },
  { question: "Combien de lettres de l'Izhar Halqi y a-t-il ?", options: ["4", "5", "6", "7"], correctIndex: 2, category: "tajweed" },
  { question: "Quelles sont les lettres de l'Idgham avec Ghunnah ?", options: ["ي ن م و", "ل ر", "ب", "ط د ت"], correctIndex: 0, category: "tajweed" },
  { question: "Combien de lettres de l'Idgham sans Ghunnah ?", options: ["2 (ل ر)", "4", "6", "3"], correctIndex: 0, category: "tajweed" },
  { question: "Qu'est-ce que l'Iqlab (الإقلاب) ?", options: ["Transformer le Noun Sakin en Mim devant Ba", "Allonger une voyelle", "Arrêter la lecture", "Fusionner deux lettres identiques"], correctIndex: 0, category: "tajweed" },
  { question: "Devant quelle lettre se fait l'Iqlab ?", options: ["ب (Ba)", "ت (Ta)", "ن (Noun)", "م (Mim)"], correctIndex: 0, category: "tajweed" },
  { question: "Qu'est-ce que le Madd Tabii (المد الطبيعي) ?", options: ["Allongement naturel de 2 temps", "Allongement de 4-5 temps", "Allongement de 6 temps", "Pas d'allongement"], correctIndex: 0, category: "tajweed" },
  { question: "Combien de temps dure le Madd Tabii ?", options: ["1 temps", "2 temps", "4 temps", "6 temps"], correctIndex: 1, category: "tajweed" },
  { question: "Qu'est-ce que le Madd Muttasil (المد المتصل) ?", options: ["Madd quand hamza est dans le même mot", "Madd quand hamza est dans le mot suivant", "Madd naturel", "Madd à la fin d'un verset"], correctIndex: 0, category: "tajweed" },
  { question: "Qu'est-ce que le Madd Munfasil (المد المنفصل) ?", options: ["Madd dans le même mot", "Madd quand hamza est au début du mot suivant", "Madd de 6 temps", "Madd obligatoire"], correctIndex: 1, category: "tajweed" },
  { question: "Combien de temps dure le Madd Lazim ?", options: ["2 temps", "4 temps", "5 temps", "6 temps"], correctIndex: 3, category: "tajweed" },
  { question: "Qu'est-ce que la Ghunnah (الغنة) ?", options: ["Son nasal du Noun et Mim", "Allongement d'une voyelle", "Arrêt de la voix", "Vibration de la gorge"], correctIndex: 0, category: "tajweed" },
  { question: "Combien de temps dure la Ghunnah ?", options: ["1 temps", "2 temps", "3 temps", "4 temps"], correctIndex: 1, category: "tajweed" },
  { question: "Qu'est-ce que le Qalqalah (القلقلة) ?", options: ["Écho/vibration sur certaines lettres avec sukun", "Nasalisation d'une lettre", "Allongement d'une voyelle", "Fusion de deux lettres"], correctIndex: 0, category: "tajweed" },
  { question: "Quelles sont les lettres du Qalqalah ?", options: ["ق ط ب ج د", "ب ت ث ج ح", "ص ض ط ظ", "ف ق ك ل م"], correctIndex: 0, category: "tajweed" },
  { question: "Vrai ou faux : Le Qalqalah est plus fort en fin de mot.", options: ["Vrai", "Faux"], correctIndex: 0, category: "tajweed" },
  { question: "Qu'est-ce que le Tafkhim (التفخيم) ?", options: ["Prononciation emphatique/épaisse", "Prononciation fine/légère", "Nasalisation", "Allongement"], correctIndex: 0, category: "tajweed" },
  { question: "Qu'est-ce que le Tarqiq (الترقيق) ?", options: ["Prononciation emphatique", "Prononciation fine/légère", "Vibration", "Fusion"], correctIndex: 1, category: "tajweed" },
  { question: "Les lettres d'Isti'la (lettres emphatiques) incluent :", options: ["خ ص ض غ ط ق ظ", "ب ت ث ج", "ل ر ن م", "ف ق ك ع"], correctIndex: 0, category: "tajweed" },
  { question: "Quand le Ra (ر) est-il prononcé avec Tafkhim ?", options: ["Quand il a une fatha ou damma", "Toujours", "Jamais", "Seulement en début de mot"], correctIndex: 0, category: "tajweed" },
  { question: "Que signifie le signe \"لا\" entre deux mots ?", options: ["Ne pas s'arrêter ici", "S'arrêter obligatoirement", "Arrêt permis", "Fin de la sourate"], correctIndex: 0, category: "tajweed" },
  { question: "Que signifie le signe \"∴\" (trois points) dans le Mushaf ?", options: ["S'arrêter à l'un des deux endroits marqués", "Arrêt obligatoire", "Continuation", "Fin de juz"], correctIndex: 0, category: "tajweed" },
  { question: "Qu'est-ce que le Sakt (السكت) ?", options: ["Pause brève sans respirer", "Arrêt complet", "Allongement", "Nasalisation"], correctIndex: 0, category: "tajweed" },
  { question: "Combien de Sakt y a-t-il dans la lecture de Hafs ?", options: ["2", "4", "6", "8"], correctIndex: 1, category: "tajweed" },
  { question: "Qu'est-ce que le Madd Arid Lissukun ?", options: ["Allongement dû à un arrêt temporaire en fin de mot", "Allongement naturel", "Allongement de 6 temps", "Pas d'allongement"], correctIndex: 0, category: "tajweed" },
  { question: "Le Madd Arid Lissukun peut durer :", options: ["2, 4 ou 6 temps", "Seulement 2 temps", "Seulement 6 temps", "1 temps"], correctIndex: 0, category: "tajweed" },
  { question: "Qu'est-ce que le Noon Sakinah (نون ساكنة) ?", options: ["Un Noun sans voyelle", "Un Noun avec fatha", "Un Mim sans voyelle", "Un Alif"], correctIndex: 0, category: "tajweed" },
  { question: "Le Tanwin est équivalent à :", options: ["Un Noun Sakin à la fin du mot", "Un Mim Sakin", "Un allongement", "Un arrêt"], correctIndex: 0, category: "tajweed" },
  { question: "Qu'est-ce que l'Idgham Mutajanisayn ?", options: ["Fusion de deux lettres de même point d'articulation", "Fusion de lettres identiques", "Nasalisation", "Allongement"], correctIndex: 0, category: "tajweed" },
  { question: "Qu'est-ce que l'Idgham Mutaqaribayn ?", options: ["Fusion de deux lettres proches en articulation", "Fusion de lettres identiques", "Arrêt", "Vibration"], correctIndex: 0, category: "tajweed" },
];

// ─── Kids / Prophet stories quiz (40+ questions) ────────────
export const kidsQuiz: QuizQuestion[] = [
  { question: "Quel prophète a construit l'Arche (le grand bateau) ?", options: ["Ibrahim", "Moussa", "Nouh", "Youssouf"], correctIndex: 2, category: "kids" },
  { question: "Quel prophète a été avalé par un poisson (baleine) ?", options: ["Youssouf", "Younes", "Daoud", "Soulayman"], correctIndex: 1, category: "kids" },
  { question: "Quel prophète a traversé la mer avec son peuple ?", options: ["Nouh", "Ibrahim", "Moussa", "Issa"], correctIndex: 2, category: "kids" },
  { question: "Quel prophète a été jeté dans le feu mais n'a pas brûlé ?", options: ["Ibrahim", "Moussa", "Nouh", "Adam"], correctIndex: 0, category: "kids" },
  { question: "Qui est le premier prophète et le premier homme ?", options: ["Nouh", "Ibrahim", "Mohammed", "Adam"], correctIndex: 3, category: "kids" },
  { question: "Quel prophète pouvait parler aux animaux ?", options: ["Daoud", "Soulayman", "Moussa", "Issa"], correctIndex: 1, category: "kids" },
  { question: "Dans quel livre trouve-t-on les histoires de tous ces prophètes ?", options: ["La Bible", "Le Coran", "La Torah", "Les Évangiles"], correctIndex: 1, category: "kids" },
  { question: "🛥️ Associe : Un grand bateau → Quel prophète ?", options: ["Ibrahim", "Moussa", "Nouh", "Issa"], correctIndex: 2, category: "kids" },
  { question: "🐋 Associe : Une baleine → Quel prophète ?", options: ["Nouh", "Younes", "Youssouf", "Adam"], correctIndex: 1, category: "kids" },
  { question: "🔥 Associe : Le feu → Quel prophète ?", options: ["Moussa", "Nouh", "Ibrahim", "Soulayman"], correctIndex: 2, category: "kids" },
  { question: "🏜️ Associe : Le désert et un chameau → Quel prophète ?", options: ["Salih", "Daoud", "Adam", "Issa"], correctIndex: 0, category: "kids" },
  { question: "Quel prophète avait un très beau manteau donné par son père ?", options: ["Ibrahim", "Moussa", "Youssouf", "Nouh"], correctIndex: 2, category: "kids" },
  // New 30+ kids questions
  { question: "Quel prophète a vaincu le géant Goliath (Jalut) ?", options: ["Moussa", "Soulayman", "Daoud", "Ibrahim"], correctIndex: 2, category: "kids" },
  { question: "Quel prophète est né sans père ?", options: ["Adam", "Issa", "Moussa", "Ibrahim"], correctIndex: 1, category: "kids" },
  { question: "Qui est la mère du prophète Issa ?", options: ["Hajar", "Sarah", "Maryam", "Asiya"], correctIndex: 2, category: "kids" },
  { question: "Quel prophète a reçu les Psaumes (Zabour) ?", options: ["Moussa", "Issa", "Daoud", "Ibrahim"], correctIndex: 2, category: "kids" },
  { question: "Quel prophète a construit la Ka'ba avec son fils ?", options: ["Nouh", "Ibrahim", "Moussa", "Adam"], correctIndex: 1, category: "kids" },
  { question: "Avec quel fils Ibrahim a-t-il construit la Ka'ba ?", options: ["Ishaq", "Yaqub", "Ismail", "Youssouf"], correctIndex: 2, category: "kids" },
  { question: "Quel prophète a eu un bâton qui se transformait en serpent ?", options: ["Ibrahim", "Moussa", "Nouh", "Soulayman"], correctIndex: 1, category: "kids" },
  { question: "Quel pharaon a poursuivi Moussa et son peuple ?", options: ["Ramsès", "Pharaon (Fir'awn)", "César", "Nimrod"], correctIndex: 1, category: "kids" },
  { question: "Qui a élevé Moussa dans le palais de Pharaon ?", options: ["Sa mère", "Asiya (femme de Pharaon)", "Maryam", "Sarah"], correctIndex: 1, category: "kids" },
  { question: "Quel prophète a été jeté dans un puits par ses frères ?", options: ["Moussa", "Ibrahim", "Youssouf", "Ismail"], correctIndex: 2, category: "kids" },
  { question: "Combien de frères avait Youssouf ?", options: ["5", "8", "11", "14"], correctIndex: 2, category: "kids" },
  { question: "Quel prophète avait le don d'interpréter les rêves ?", options: ["Daoud", "Youssouf", "Moussa", "Ibrahim"], correctIndex: 1, category: "kids" },
  { question: "Quel prophète commandait les djinns et le vent ?", options: ["Moussa", "Ibrahim", "Daoud", "Soulayman"], correctIndex: 3, category: "kids" },
  { question: "Quel prophète a été envoyé au peuple de 'Ad ?", options: ["Salih", "Houd", "Shu'ayb", "Lut"], correctIndex: 1, category: "kids" },
  { question: "Quel prophète a été envoyé au peuple de Thamoud ?", options: ["Houd", "Salih", "Shu'ayb", "Lut"], correctIndex: 1, category: "kids" },
  { question: "Quel animal miraculeux est lié au prophète Salih ?", options: ["Un oiseau", "Un cheval", "Une chamelle", "Un lion"], correctIndex: 2, category: "kids" },
  { question: "Quel prophète a été envoyé au peuple de Sodome ?", options: ["Salih", "Houd", "Lut", "Shu'ayb"], correctIndex: 2, category: "kids" },
  { question: "Quel prophète est connu pour sa patience extrême ?", options: ["Moussa", "Ayyub", "Nouh", "Ibrahim"], correctIndex: 1, category: "kids" },
  { question: "Quel prophète a été envoyé au peuple de Madian ?", options: ["Lut", "Houd", "Shu'ayb", "Salih"], correctIndex: 2, category: "kids" },
  { question: "Quel est le dernier prophète de l'Islam ?", options: ["Issa", "Ibrahim", "Moussa", "Mohammed ﷺ"], correctIndex: 3, category: "kids" },
  { question: "Dans quelle ville est né le Prophète Mohammed ﷺ ?", options: ["Médine", "Jérusalem", "La Mecque", "Taïf"], correctIndex: 2, category: "kids" },
  { question: "Quel prophète a vécu plus de 950 ans ?", options: ["Adam", "Nouh", "Ibrahim", "Moussa"], correctIndex: 1, category: "kids" },
  { question: "🌙 Quel prophète a vu la lune se fendre en deux ?", options: ["Moussa", "Issa", "Mohammed ﷺ", "Ibrahim"], correctIndex: 2, category: "kids" },
  { question: "Quel prophète a fait jaillir 12 sources d'eau d'un rocher ?", options: ["Ibrahim", "Moussa", "Nouh", "Soulayman"], correctIndex: 1, category: "kids" },
  { question: "Quel prophète guérissait les aveugles et les lépreux ?", options: ["Moussa", "Daoud", "Issa", "Ibrahim"], correctIndex: 2, category: "kids" },
  { question: "Vrai ou faux : Ibrahim est appelé \"l'ami d'Allah\" (Khalilullah).", options: ["Vrai", "Faux"], correctIndex: 0, category: "kids" },
  { question: "Vrai ou faux : Moussa est appelé \"Kalimullah\" (celui à qui Allah a parlé).", options: ["Vrai", "Faux"], correctIndex: 0, category: "kids" },
  { question: "Quel prophète a fait le voyage nocturne (Isra et Mi'raj) ?", options: ["Ibrahim", "Moussa", "Issa", "Mohammed ﷺ"], correctIndex: 3, category: "kids" },
  { question: "Quel prophète est mentionné dans la sourate qui porte son nom et raconte son histoire en détail ?", options: ["Moussa", "Ibrahim", "Youssouf", "Nouh"], correctIndex: 2, category: "kids" },
  { question: "Quel prophète a été élevé au ciel vivant selon le Coran ?", options: ["Ibrahim", "Moussa", "Issa", "Mohammed ﷺ"], correctIndex: 2, category: "kids" },
];

// ─── Prophet flashcards data (25 prophets, multi-card) ──────
export interface ProphetFlashcard {
  prophet: string;
  prophetAr: string;
  event: string;
  emoji: string;
  surah?: string;
  cardType?: "main" | "people" | "lesson" | "trial";
}

export const prophetFlashcards: ProphetFlashcard[] = [
  // Adam
  { prophet: "Adam", prophetAr: "آدم", event: "Le premier homme et premier prophète créé par Allah", emoji: "🌍", surah: "Al-Baqara", cardType: "main" },
  { prophet: "Adam", prophetAr: "آدم", event: "Allah lui a enseigné les noms de toutes les choses", emoji: "📖", surah: "Al-Baqara", cardType: "lesson" },
  // Idris
  { prophet: "Idris (Énoch)", prophetAr: "إدريس", event: "Élevé à un haut rang par Allah, connu pour sa sagesse", emoji: "⬆️", surah: "Maryam", cardType: "main" },
  // Nouh
  { prophet: "Nouh (Noé)", prophetAr: "نوح", event: "A construit l'Arche et sauvé les croyants du déluge", emoji: "🛥️", surah: "Nouh", cardType: "main" },
  { prophet: "Nouh (Noé)", prophetAr: "نوح", event: "A prêché à son peuple pendant 950 ans", emoji: "⏳", surah: "Al-Ankabut", cardType: "trial" },
  // Houd
  { prophet: "Houd", prophetAr: "هود", event: "Envoyé au peuple de 'Ad, détruit par un vent violent", emoji: "🌪️", surah: "Hud", cardType: "main" },
  // Salih
  { prophet: "Salih", prophetAr: "صالح", event: "Envoyé au peuple Thamoud avec la chamelle miraculeuse", emoji: "🐪", surah: "Ash-Shams", cardType: "main" },
  { prophet: "Salih", prophetAr: "صالح", event: "Son peuple a tué la chamelle et a été puni par un tremblement", emoji: "💥", surah: "Al-A'raf", cardType: "trial" },
  // Ibrahim
  { prophet: "Ibrahim (Abraham)", prophetAr: "إبراهيم", event: "Jeté dans le feu mais protégé par Allah", emoji: "🔥", surah: "Ibrahim", cardType: "main" },
  { prophet: "Ibrahim (Abraham)", prophetAr: "إبراهيم", event: "A construit la Ka'ba avec son fils Ismail", emoji: "🕋", surah: "Al-Baqara", cardType: "lesson" },
  // Lut
  { prophet: "Lut (Lot)", prophetAr: "لوط", event: "Envoyé au peuple de Sodome pour les appeler à la vertu", emoji: "🏙️", surah: "Hud", cardType: "main" },
  // Ismail
  { prophet: "Ismail (Ismaël)", prophetAr: "إسماعيل", event: "A aidé son père Ibrahim à construire la Ka'ba", emoji: "🕋", surah: "As-Saffat", cardType: "main" },
  { prophet: "Ismail (Ismaël)", prophetAr: "إسماعيل", event: "Accepta d'être sacrifié par obéissance à Allah", emoji: "🐑", surah: "As-Saffat", cardType: "trial" },
  // Ishaq
  { prophet: "Ishaq (Isaac)", prophetAr: "إسحاق", event: "Fils d'Ibrahim et Sarah, père de Yaqub", emoji: "👨‍👦", surah: "As-Saffat", cardType: "main" },
  // Yaqub
  { prophet: "Yaqub (Jacob)", prophetAr: "يعقوب", event: "Père de Youssouf et des 12 tribus, surnommé Israël", emoji: "👨‍👦‍👦", surah: "Yusuf", cardType: "main" },
  // Youssouf
  { prophet: "Youssouf (Joseph)", prophetAr: "يوسف", event: "Jeté dans un puits par ses frères, devenu gouverneur d'Égypte", emoji: "⭐", surah: "Yusuf", cardType: "main" },
  { prophet: "Youssouf (Joseph)", prophetAr: "يوسف", event: "Connu pour sa beauté et son don d'interpréter les rêves", emoji: "🌙", surah: "Yusuf", cardType: "lesson" },
  // Ayyub
  { prophet: "Ayyub (Job)", prophetAr: "أيوب", event: "Éprouvé par la maladie et la perte, resté patient", emoji: "🤲", surah: "Al-Anbiya", cardType: "main" },
  // Shu'ayb
  { prophet: "Shu'ayb", prophetAr: "شعيب", event: "Envoyé au peuple de Madian, appelait à l'honnêteté dans le commerce", emoji: "⚖️", surah: "Hud", cardType: "main" },
  // Moussa
  { prophet: "Moussa (Moïse)", prophetAr: "موسى", event: "A traversé la mer avec son peuple pour fuir Pharaon", emoji: "🌊", surah: "Al-Qasas", cardType: "main" },
  { prophet: "Moussa (Moïse)", prophetAr: "موسى", event: "Son bâton se transformait en serpent par la permission d'Allah", emoji: "🐍", surah: "Ta-Ha", cardType: "trial" },
  // Harun
  { prophet: "Harun (Aaron)", prophetAr: "هارون", event: "Frère de Moussa, l'aidait à transmettre le message", emoji: "🤝", surah: "Ta-Ha", cardType: "main" },
  // Dhul-Kifl
  { prophet: "Dhul-Kifl", prophetAr: "ذو الكفل", event: "Mentionné pour sa patience et sa droiture", emoji: "📿", surah: "Al-Anbiya", cardType: "main" },
  // Younes
  { prophet: "Younes (Jonas)", prophetAr: "يونس", event: "Avalé par un grand poisson puis sauvé par Allah", emoji: "🐋", surah: "Younus", cardType: "main" },
  { prophet: "Younes (Jonas)", prophetAr: "يونس", event: "A invoqué Allah dans les ténèbres du ventre du poisson", emoji: "🤲", surah: "Al-Anbiya", cardType: "trial" },
  // Ilyas
  { prophet: "Ilyas (Élie)", prophetAr: "إلياس", event: "A combattu l'idolâtrie de l'adoration de Ba'l", emoji: "⚡", surah: "As-Saffat", cardType: "main" },
  // Al-Yasa
  { prophet: "Al-Yasa (Élisée)", prophetAr: "اليسع", event: "Successeur d'Ilyas, compté parmi les meilleurs", emoji: "🌟", surah: "Al-An'am", cardType: "main" },
  // Daoud
  { prophet: "Daoud (David)", prophetAr: "داود", event: "A vaincu Goliath et reçu les Psaumes (Zabour)", emoji: "⚔️", surah: "Sad", cardType: "main" },
  { prophet: "Daoud (David)", prophetAr: "داود", event: "Les montagnes et les oiseaux glorifiaient Allah avec lui", emoji: "🏔️", surah: "Sad", cardType: "lesson" },
  // Soulayman
  { prophet: "Soulayman (Salomon)", prophetAr: "سليمان", event: "Pouvait parler aux animaux et commander les djinns", emoji: "🐜", surah: "An-Naml", cardType: "main" },
  { prophet: "Soulayman (Salomon)", prophetAr: "سليمان", event: "Le vent était soumis à son commandement", emoji: "💨", surah: "Sad", cardType: "lesson" },
  // Zakariya
  { prophet: "Zakariya (Zacharie)", prophetAr: "زكريا", event: "A invoqué Allah pour avoir un enfant malgré sa vieillesse", emoji: "👴", surah: "Maryam", cardType: "main" },
  // Yahya
  { prophet: "Yahya (Jean-Baptiste)", prophetAr: "يحيى", event: "Fils de Zakariya, pieux dès l'enfance", emoji: "🕊️", surah: "Maryam", cardType: "main" },
  // Issa
  { prophet: "Issa (Jésus)", prophetAr: "عيسى", event: "Né miraculeusement, a guéri les malades par la permission d'Allah", emoji: "✨", surah: "Maryam", cardType: "main" },
  { prophet: "Issa (Jésus)", prophetAr: "عيسى", event: "A parlé dès le berceau pour défendre sa mère Maryam", emoji: "👶", surah: "Maryam", cardType: "trial" },
  // Mohammed
  { prophet: "Mohammed ﷺ", prophetAr: "محمد ﷺ", event: "Le dernier prophète, a reçu le Saint Coran", emoji: "🕌", surah: "Muhammad", cardType: "main" },
  { prophet: "Mohammed ﷺ", prophetAr: "محمد ﷺ", event: "A accompli le voyage nocturne (Isra et Mi'raj)", emoji: "🌙", surah: "Al-Isra", cardType: "lesson" },
];

// ─── Quiz categories ────────────────────────────────────────
export type QuizCategory = "general" | "memorization" | "tajweed" | "kids" | "perfect";

import { getPerfectQuizSession } from "./perfectQuizQuestions";

export function getQuizByCategory(category: QuizCategory): QuizQuestion[] {
  switch (category) {
    case "general": return quizQuestions;
    case "memorization": return quranMemorizationQuiz;
    case "tajweed": return tajweedQuiz;
    case "kids": return kidsQuiz;
    case "perfect": return getPerfectQuizSession();
    default: return quizQuestions;
  }
}
