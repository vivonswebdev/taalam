export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  category?: string;
}

// ─── Original general quiz ─────────────────────────────────
export const quizQuestions: QuizQuestion[] = [
  {
    question: "Combien de sourates contient le Saint Coran ?",
    options: ["100", "114", "120", "99"],
    correctIndex: 1,
    category: "general",
  },
  {
    question: "Quel est le nom de la première sourate du Coran ?",
    options: ["Al-Baqara", "Al-Ikhlas", "Al-Fatiha", "An-Nas"],
    correctIndex: 2,
    category: "general",
  },
  {
    question: "La sourate Al-Ikhlas parle principalement de...",
    options: ["La prière", "L'unicité d'Allah", "Le jeûne", "L'aumône"],
    correctIndex: 1,
    category: "general",
  },
  {
    question: "Quelle sourate est aussi appelée \"L'Ouverture\" ?",
    options: ["An-Nasr", "Al-Fatiha", "Al-Falaq", "Al-Kawthar"],
    correctIndex: 1,
    category: "general",
  },
  {
    question: "Combien de versets contient la sourate Al-Fatiha ?",
    options: ["5", "6", "7", "8"],
    correctIndex: 2,
    category: "general",
  },
];

// ─── Quran memorization quiz ────────────────────────────────
export const quranMemorizationQuiz: QuizQuestion[] = [
  {
    question: "De quelle sourate provient : \"ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ\" ?",
    options: ["Al-Baqara", "Al-Fatiha", "Al-Ikhlas", "An-Nas"],
    correctIndex: 1,
    category: "memorization",
  },
  {
    question: "Quel est le verset qui suit \"بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\" dans Al-Fatiha ?",
    options: [
      "مَٰلِكِ يَوْمِ ٱلدِّينِ",
      "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
      "إِيَّاكَ نَعْبُدُ",
      "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
    ],
    correctIndex: 1,
    category: "memorization",
  },
  {
    question: "Complétez : \"قُلْ هُوَ ٱللَّهُ ...\"",
    options: ["ٱلْعَظِيمُ", "أَحَدٌ", "ٱلْكَبِيرُ", "ٱلرَّحِيمُ"],
    correctIndex: 1,
    category: "memorization",
  },
  {
    question: "De quelle sourate : \"قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ\" ?",
    options: ["Al-Falaq", "An-Nas", "Al-Ikhlas", "Al-Kawthar"],
    correctIndex: 1,
    category: "memorization",
  },
  {
    question: "De quelle sourate : \"إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ\" ?",
    options: ["Al-Asr", "Al-Kawthar", "An-Nasr", "Al-Fil"],
    correctIndex: 1,
    category: "memorization",
  },
  {
    question: "Quel verset vient après \"ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\" dans Al-Fatiha ?",
    options: [
      "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
      "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      "مَٰلِكِ يَوْمِ ٱلدِّينِ",
      "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ",
    ],
    correctIndex: 2,
    category: "memorization",
  },
  {
    question: "Combien de fois \"كَلَّا سَيَعْلَمُونَ\" apparaît dans sourate An-Naba ?",
    options: ["1 fois", "2 fois", "3 fois", "4 fois"],
    correctIndex: 1,
    category: "memorization",
  },
  {
    question: "De quelle sourate : \"وَٱلْعَصْرِ إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ\" ?",
    options: ["Al-Asr", "At-Tin", "Al-Qadr", "Al-Alaq"],
    correctIndex: 0,
    category: "memorization",
  },
  {
    question: "Quel est le dernier verset de sourate Al-Fatiha ?",
    options: [
      "إِيَّاكَ نَعْبُدُ",
      "مَٰلِكِ يَوْمِ ٱلدِّينِ",
      "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
      "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
    ],
    correctIndex: 2,
    category: "memorization",
  },
  {
    question: "De quelle sourate : \"لَمْ يَلِدْ وَلَمْ يُولَدْ\" ?",
    options: ["Al-Falaq", "Al-Ikhlas", "An-Nas", "Al-Kawthar"],
    correctIndex: 1,
    category: "memorization",
  },
];

// ─── Tajweed & Waqf quiz ────────────────────────────────────
export const tajweedQuiz: QuizQuestion[] = [
  {
    question: "Que signifie le signe d'arrêt \"مـ\" (Waqf Lazim) ?",
    options: [
      "Arrêt permis",
      "Arrêt obligatoire",
      "Arrêt déconseillé",
      "Pas d'arrêt",
    ],
    correctIndex: 1,
    category: "tajweed",
  },
  {
    question: "Que signifie le signe \"ط\" (Waqf Taam) ?",
    options: [
      "Arrêt interdit",
      "Arrêt permis",
      "Arrêt complet recommandé",
      "Continuation obligatoire",
    ],
    correctIndex: 2,
    category: "tajweed",
  },
  {
    question: "Que signifie le signe \"ج\" (Waqf Jaiz) ?",
    options: [
      "Arrêt obligatoire",
      "Arrêt permis (au choix)",
      "Arrêt interdit",
      "Arrêt complet",
    ],
    correctIndex: 1,
    category: "tajweed",
  },
  {
    question: "Au signe \"مـ\" (Waqf Lazim), devez-vous obligatoirement vous arrêter ?",
    options: ["Oui", "Non", "C'est facultatif", "Seulement en prière"],
    correctIndex: 0,
    category: "tajweed",
  },
  {
    question: "Qu'est-ce que le Madd (المد) en tajwid ?",
    options: [
      "L'arrêt à la fin d'un verset",
      "L'allongement d'une voyelle",
      "La nasalisation d'une lettre",
      "L'assimilation de deux lettres",
    ],
    correctIndex: 1,
    category: "tajweed",
  },
  {
    question: "Qu'est-ce que l'Idgham (الإدغام) ?",
    options: [
      "Allongement d'une voyelle",
      "Prononciation claire d'une lettre",
      "Fusion/assimilation de deux lettres",
      "Arrêt sur une lettre",
    ],
    correctIndex: 2,
    category: "tajweed",
  },
  {
    question: "Qu'est-ce que l'Ikhfa (الإخفاء) ?",
    options: [
      "Prononciation nasale atténuée du Noun Sakin",
      "Suppression d'une lettre",
      "Arrêt obligatoire",
      "Allongement de 6 temps",
    ],
    correctIndex: 0,
    category: "tajweed",
  },
  {
    question: "Le signe \"ۖ\" (Waqf Kafi) indique :",
    options: [
      "Arrêt obligatoire",
      "Arrêt suffisant",
      "Continuation obligatoire",
      "Arrêt interdit",
    ],
    correctIndex: 1,
    category: "tajweed",
  },
  {
    question: "Que signifie le signe \"ۗ\" (Waqf Hasan) ?",
    options: [
      "Arrêt bon/recommandé",
      "Arrêt obligatoire",
      "Continuation sans arrêt",
      "Arrêt interdit",
    ],
    correctIndex: 0,
    category: "tajweed",
  },
  {
    question: "Combien de lettres de l'Ikhfa existe-t-il ?",
    options: ["10", "12", "15", "18"],
    correctIndex: 2,
    category: "tajweed",
  },
];

// ─── Kids / Prophet stories quiz ────────────────────────────
export const kidsQuiz: QuizQuestion[] = [
  {
    question: "Quel prophète a construit l'Arche (le grand bateau) ?",
    options: ["Ibrahim", "Moussa", "Nouh", "Youssouf"],
    correctIndex: 2,
    category: "kids",
  },
  {
    question: "Quel prophète a été avalé par un poisson (baleine) ?",
    options: ["Youssouf", "Younes", "Daoud", "Soulayman"],
    correctIndex: 1,
    category: "kids",
  },
  {
    question: "Quel prophète a traversé la mer avec son peuple ?",
    options: ["Nouh", "Ibrahim", "Moussa", "Issa"],
    correctIndex: 2,
    category: "kids",
  },
  {
    question: "Quel prophète a été jeté dans le feu mais n'a pas brûlé ?",
    options: ["Ibrahim", "Moussa", "Nouh", "Adam"],
    correctIndex: 0,
    category: "kids",
  },
  {
    question: "Qui est le premier prophète et le premier homme ?",
    options: ["Nouh", "Ibrahim", "Mohammed", "Adam"],
    correctIndex: 3,
    category: "kids",
  },
  {
    question: "Quel prophète pouvait parler aux animaux ?",
    options: ["Daoud", "Soulayman", "Moussa", "Issa"],
    correctIndex: 1,
    category: "kids",
  },
  {
    question: "Dans quel livre trouve-t-on les histoires de tous ces prophètes ?",
    options: ["La Bible", "Le Coran", "La Torah", "Les Évangiles"],
    correctIndex: 1,
    category: "kids",
  },
  {
    question: "🛥️ Associe : Un grand bateau → Quel prophète ?",
    options: ["Ibrahim", "Moussa", "Nouh", "Issa"],
    correctIndex: 2,
    category: "kids",
  },
  {
    question: "🐋 Associe : Une baleine → Quel prophète ?",
    options: ["Nouh", "Younes", "Youssouf", "Adam"],
    correctIndex: 1,
    category: "kids",
  },
  {
    question: "🔥 Associe : Le feu → Quel prophète ?",
    options: ["Moussa", "Nouh", "Ibrahim", "Soulayman"],
    correctIndex: 2,
    category: "kids",
  },
  {
    question: "🏜️ Associe : Le désert et un chameau → Quel prophète ?",
    options: ["Salih", "Daoud", "Adam", "Issa"],
    correctIndex: 0,
    category: "kids",
  },
  {
    question: "Quel prophète avait un très beau manteau donné par son père ?",
    options: ["Ibrahim", "Moussa", "Youssouf", "Nouh"],
    correctIndex: 2,
    category: "kids",
  },
];

// ─── Prophet flashcards data ────────────────────────────────
export interface ProphetFlashcard {
  prophet: string;
  prophetAr: string;
  event: string;
  emoji: string;
  surah?: string;
}

export const prophetFlashcards: ProphetFlashcard[] = [
  { prophet: "Adam", prophetAr: "آدم", event: "Le premier homme et premier prophète créé par Allah", emoji: "🌍", surah: "Al-Baqara" },
  { prophet: "Nouh (Noé)", prophetAr: "نوح", event: "A construit l'Arche et sauvé les croyants du déluge", emoji: "🛥️", surah: "Nouh" },
  { prophet: "Ibrahim (Abraham)", prophetAr: "إبراهيم", event: "Jeté dans le feu mais protégé par Allah", emoji: "🔥", surah: "Ibrahim" },
  { prophet: "Moussa (Moïse)", prophetAr: "موسى", event: "A traversé la mer avec son peuple pour fuir Pharaon", emoji: "🌊", surah: "Al-Qasas" },
  { prophet: "Younes (Jonas)", prophetAr: "يونس", event: "Avalé par un grand poisson puis sauvé par Allah", emoji: "🐋", surah: "Younus" },
  { prophet: "Youssouf (Joseph)", prophetAr: "يوسف", event: "Jeté dans un puits par ses frères, devenu gouverneur d'Égypte", emoji: "⭐", surah: "Yusuf" },
  { prophet: "Soulayman (Salomon)", prophetAr: "سليمان", event: "Pouvait parler aux animaux et commander les djinns", emoji: "🐜", surah: "An-Naml" },
  { prophet: "Daoud (David)", prophetAr: "داود", event: "A vaincu Goliath et reçu les Psaumes (Zabour)", emoji: "⚔️", surah: "Sad" },
  { prophet: "Issa (Jésus)", prophetAr: "عيسى", event: "Né miraculeusement, a guéri les malades par la permission d'Allah", emoji: "✨", surah: "Maryam" },
  { prophet: "Mohammed ﷺ", prophetAr: "محمد ﷺ", event: "Le dernier prophète, a reçu le Saint Coran", emoji: "🕌", surah: "Muhammad" },
  { prophet: "Salih", prophetAr: "صالح", event: "Envoyé au peuple Thamoud avec la chamelle miraculeuse", emoji: "🐪", surah: "Ash-Shams" },
  { prophet: "Ismail (Ismaël)", prophetAr: "إسماعيل", event: "A aidé son père Ibrahim à construire la Ka'ba", emoji: "🕋", surah: "As-Saffat" },
];

// ─── Quiz categories ────────────────────────────────────────
export type QuizCategory = "general" | "memorization" | "tajweed" | "kids";

export function getQuizByCategory(category: QuizCategory): QuizQuestion[] {
  switch (category) {
    case "general": return quizQuestions;
    case "memorization": return quranMemorizationQuiz;
    case "tajweed": return tajweedQuiz;
    case "kids": return kidsQuiz;
    default: return quizQuestions;
  }
}
