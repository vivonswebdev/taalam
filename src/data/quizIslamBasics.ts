import type { QuizQuestion } from "./quizQuestions";

/** ~100 questions on Islam basics: pillars, faith, akhlaq, du'a, adhkar */
export const islamBasicsQuiz: QuizQuestion[] = [
  // ─── 5 piliers de l'Islam ───
  { question: "Combien y a-t-il de piliers de l'Islam ?", options: ["3", "4", "5", "6"], correctIndex: 2, category: "islam_basics" },
  { question: "Quel est le premier pilier de l'Islam ?", options: ["La prière", "Le jeûne", "La Shahada", "Le Hajj"], correctIndex: 2, category: "islam_basics" },
  { question: "Que signifie la Shahada ?", options: ["Dieu est grand", "Il n'y a de dieu qu'Allah et Mohammed est son messager", "Gloire à Allah", "Allah est miséricordieux"], correctIndex: 1, category: "islam_basics" },
  { question: "Combien de prières obligatoires un musulman doit-il faire par jour ?", options: ["3", "4", "5", "7"], correctIndex: 2, category: "islam_basics" },
  { question: "Comment s'appelle la prière de l'aube ?", options: ["Dhuhr", "Fajr", "Maghrib", "Isha"], correctIndex: 1, category: "islam_basics" },
  { question: "Comment s'appelle la prière de midi ?", options: ["Fajr", "Asr", "Dhuhr", "Maghrib"], correctIndex: 2, category: "islam_basics" },
  { question: "Comment s'appelle la prière de l'après-midi ?", options: ["Dhuhr", "Asr", "Maghrib", "Isha"], correctIndex: 1, category: "islam_basics" },
  { question: "Comment s'appelle la prière du coucher du soleil ?", options: ["Asr", "Isha", "Fajr", "Maghrib"], correctIndex: 3, category: "islam_basics" },
  { question: "Comment s'appelle la prière du soir ?", options: ["Maghrib", "Isha", "Fajr", "Dhuhr"], correctIndex: 1, category: "islam_basics" },
  { question: "Pendant quel mois les musulmans jeûnent-ils ?", options: ["Shawwal", "Muharram", "Ramadan", "Rajab"], correctIndex: 2, category: "islam_basics" },
  { question: "Comment s'appelle l'aumône obligatoire ?", options: ["Sadaqa", "Zakat", "Hadiya", "Waqf"], correctIndex: 1, category: "islam_basics" },
  { question: "Que signifie Hajj ?", options: ["La prière", "Le pèlerinage à La Mecque", "Le jeûne", "L'aumône"], correctIndex: 1, category: "islam_basics" },
  { question: "Le Hajj est obligatoire pour qui ?", options: ["Tous les musulmans chaque année", "Ceux qui en ont les moyens physiques et financiers", "Les hommes seulement", "Les riches seulement"], correctIndex: 1, category: "islam_basics" },

  // ─── 6 piliers de la foi (Iman) ───
  { question: "Combien y a-t-il de piliers de la foi (Iman) ?", options: ["4", "5", "6", "7"], correctIndex: 2, category: "islam_basics" },
  { question: "Quel est le premier pilier de la foi ?", options: ["Croire aux anges", "Croire en Allah", "Croire aux livres", "Croire au destin"], correctIndex: 1, category: "islam_basics" },
  { question: "Croire aux anges est le ___ pilier de la foi.", options: ["1er", "2e", "3e", "4e"], correctIndex: 1, category: "islam_basics" },
  { question: "Croire aux livres révélés est un pilier de la foi. Quels livres ?", options: ["Seulement le Coran", "Torah, Zabour, Injil, Coran et les feuillets", "Seulement la Torah et le Coran", "Seulement le Coran et l'Injil"], correctIndex: 1, category: "islam_basics" },
  { question: "Croire aux prophètes fait partie de quel pilier ?", options: ["Les piliers de l'Islam", "Les piliers de la foi", "Les piliers de la prière", "Aucun"], correctIndex: 1, category: "islam_basics" },
  { question: "Croire au Jour dernier signifie croire...", options: ["Que tout s'arrête", "Au jugement, au paradis et à l'enfer", "Seulement au paradis", "À la fin du monde seulement"], correctIndex: 1, category: "islam_basics" },
  { question: "Le dernier pilier de la foi est la croyance au...", options: ["Destin (Qadr), bon ou mauvais", "Paradis", "Prophète ﷺ", "Coran"], correctIndex: 0, category: "islam_basics" },

  // ─── Wudu & prière ───
  { question: "Que faut-il faire avant la prière ?", options: ["Manger", "Les ablutions (wudu)", "Dormir", "Courir"], correctIndex: 1, category: "islam_basics" },
  { question: "Quelle est la première étape du wudu ?", options: ["Laver les pieds", "L'intention et dire Bismillah", "Laver le visage", "Laver les mains"], correctIndex: 1, category: "islam_basics" },
  { question: "Combien de fois lave-t-on chaque membre dans le wudu ?", options: ["1 fois", "2 fois", "3 fois (recommandé)", "4 fois"], correctIndex: 2, category: "islam_basics" },
  { question: "Qu'est-ce qui annule le wudu ?", options: ["Boire de l'eau", "Aller aux toilettes", "Parler", "Marcher"], correctIndex: 1, category: "islam_basics" },
  { question: "Dans quelle direction prie-t-on ?", options: ["Le nord", "Vers la Ka'ba (Qibla)", "Vers Médine", "Vers Jérusalem"], correctIndex: 1, category: "islam_basics" },
  { question: "Comment s'appelle l'appel à la prière ?", options: ["Iqama", "Adhan", "Khutba", "Takbir"], correctIndex: 1, category: "islam_basics" },
  { question: "Que dit-on au début de la prière ?", options: ["Bismillah", "Alhamdulillah", "Allahu Akbar (Takbiratul Ihram)", "Astaghfirullah"], correctIndex: 2, category: "islam_basics" },
  { question: "Quelle sourate récite-t-on dans chaque unité de prière ?", options: ["Al-Ikhlas", "Al-Fatiha", "An-Nas", "Al-Falaq"], correctIndex: 1, category: "islam_basics" },
  { question: "Que dit-on dans le ruku (inclinaison) ?", options: ["Allahu Akbar", "Subhana Rabbiyal Adhim", "Sami'Allahu liman hamidah", "SubhanAllah"], correctIndex: 1, category: "islam_basics" },
  { question: "Que dit-on dans le sujud (prosternation) ?", options: ["Allahu Akbar", "Subhana Rabbiyal A'la", "Alhamdulillah", "Astaghfirullah"], correctIndex: 1, category: "islam_basics" },

  // ─── Coran ───
  { question: "Combien de sourates contient le Coran ?", options: ["100", "110", "114", "120"], correctIndex: 2, category: "islam_basics" },
  { question: "Combien de juz' (parties) contient le Coran ?", options: ["20", "25", "30", "40"], correctIndex: 2, category: "islam_basics" },
  { question: "En quelle langue le Coran a-t-il été révélé ?", options: ["L'hébreu", "Le persan", "L'arabe", "Le latin"], correctIndex: 2, category: "islam_basics" },
  { question: "Quel ange a apporté le Coran au Prophète ﷺ ?", options: ["Mikael", "Jibril", "Israfil", "Azrael"], correctIndex: 1, category: "islam_basics" },

  // ─── Ramadan & Jeûne ───
  { question: "À partir de quel âge le jeûne devient-il obligatoire ?", options: ["7 ans", "10 ans", "À la puberté", "18 ans"], correctIndex: 2, category: "islam_basics" },
  { question: "Que mange-t-on pour rompre le jeûne (iftar) traditionnellement ?", options: ["Du pain", "Des dattes et de l'eau", "Du riz", "Des fruits"], correctIndex: 1, category: "islam_basics" },
  { question: "Comment s'appelle le repas avant l'aube pendant Ramadan ?", options: ["Iftar", "Suhur", "Walima", "Aqiqa"], correctIndex: 1, category: "islam_basics" },
  { question: "La nuit du Destin (Laylat al-Qadr) vaut mieux que...", options: ["100 nuits", "500 nuits", "1000 mois", "100 ans"], correctIndex: 2, category: "islam_basics" },
  { question: "Que fête-t-on à la fin du Ramadan ?", options: ["Aïd al-Adha", "Aïd al-Fitr", "Mawlid", "Isra Mi'raj"], correctIndex: 1, category: "islam_basics" },

  // ─── Zakat & Sadaqa ───
  { question: "Quelle est la différence entre Zakat et Sadaqa ?", options: ["Aucune", "La Zakat est obligatoire, la Sadaqa est volontaire", "La Sadaqa est obligatoire", "Ce sont des synonymes"], correctIndex: 1, category: "islam_basics" },
  { question: "À qui peut-on donner la Zakat ?", options: ["Aux riches", "Aux pauvres et nécessiteux", "À la famille riche", "Aux animaux"], correctIndex: 1, category: "islam_basics" },

  // ─── Akhlaq (comportement) ───
  { question: "Que signifie 'Akhlaq' en Islam ?", options: ["La prière", "Le bon comportement et la morale", "Le jeûne", "L'aumône"], correctIndex: 1, category: "islam_basics" },
  { question: "Quel est le meilleur comportement envers ses parents ?", options: ["Les ignorer", "Leur obéir et être bon avec eux (birr al-walidayn)", "Leur donner de l'argent seulement", "Les laisser seuls"], correctIndex: 1, category: "islam_basics" },
  { question: "Que dit-on quand on commence à manger ?", options: ["Alhamdulillah", "Bismillah", "SubhanAllah", "Allahu Akbar"], correctIndex: 1, category: "islam_basics" },
  { question: "Que dit-on après avoir fini de manger ?", options: ["Bismillah", "Alhamdulillah", "Astaghfirullah", "InchAllah"], correctIndex: 1, category: "islam_basics" },
  { question: "Que dit-on quand on éternue ?", options: ["SubhanAllah", "Astaghfirullah", "Alhamdulillah", "MachAllah"], correctIndex: 2, category: "islam_basics" },
  { question: "Que répond-on à celui qui éternue ?", options: ["Alhamdulillah", "YarhamukAllah", "BarakAllahu fik", "Assalamu alaykum"], correctIndex: 1, category: "islam_basics" },
  { question: "Quel est le salut islamique ?", options: ["Bonjour", "Assalamu alaykum", "Marhaba", "Ahlan"], correctIndex: 1, category: "islam_basics" },
  { question: "Que signifie 'Assalamu alaykum' ?", options: ["Bonjour", "Que la paix soit sur vous", "Comment vas-tu ?", "Bienvenue"], correctIndex: 1, category: "islam_basics" },
  { question: "Avec quelle main mange-t-on en Islam ?", options: ["La gauche", "La droite", "Les deux", "Peu importe"], correctIndex: 1, category: "islam_basics" },

  // ─── Du'a et Adhkar ───
  { question: "Que signifie 'SubhanAllah' ?", options: ["Allah est grand", "Gloire à Allah", "Grâce à Allah", "Si Allah le veut"], correctIndex: 1, category: "islam_basics" },
  { question: "Que signifie 'Alhamdulillah' ?", options: ["Allah est grand", "Gloire à Allah", "Louange à Allah", "Pardonne-moi Allah"], correctIndex: 2, category: "islam_basics" },
  { question: "Que signifie 'Allahu Akbar' ?", options: ["Gloire à Allah", "Louange à Allah", "Allah est le plus grand", "Au nom d'Allah"], correctIndex: 2, category: "islam_basics" },
  { question: "Que signifie 'Astaghfirullah' ?", options: ["Gloire à Allah", "Je demande pardon à Allah", "Allah est grand", "Merci Allah"], correctIndex: 1, category: "islam_basics" },
  { question: "Que signifie 'InchAllah' ?", options: ["Grâce à Allah", "Si Allah le veut", "Allah est grand", "Merci Allah"], correctIndex: 1, category: "islam_basics" },
  { question: "Que signifie 'MachAllah' ?", options: ["Si Allah le veut", "C'est ce qu'Allah a voulu (admiration)", "Pardon Allah", "Gloire à Allah"], correctIndex: 1, category: "islam_basics" },
  { question: "Que signifie 'BarakAllahu fik' ?", options: ["Pardonne-moi", "Qu'Allah te bénisse", "Gloire à Allah", "Merci"], correctIndex: 1, category: "islam_basics" },
  { question: "Que dit-on avant de dormir ?", options: ["Alhamdulillah", "Bismika Allahumma amutu wa ahya", "SubhanAllah", "Allahu Akbar"], correctIndex: 1, category: "islam_basics" },
  { question: "Que dit-on au réveil ?", options: ["Bismillah", "Alhamdulillah-illadhi ahyana ba'da ma amatana", "Astaghfirullah", "SubhanAllah"], correctIndex: 1, category: "islam_basics" },
  { question: "Que dit-on en entrant à la mosquée ?", options: ["Astaghfirullah", "Allahumma-ftah li abwaba rahmatik", "SubhanAllah", "Bismillah"], correctIndex: 1, category: "islam_basics" },

  // ─── Calendrier & fêtes ───
  { question: "Quel est le premier mois du calendrier islamique ?", options: ["Ramadan", "Muharram", "Rajab", "Shawwal"], correctIndex: 1, category: "islam_basics" },
  { question: "Quel jour de la semaine est spécial en Islam ?", options: ["Samedi", "Dimanche", "Vendredi", "Lundi"], correctIndex: 2, category: "islam_basics" },
  { question: "Qu'est-ce que la Khutba du vendredi ?", options: ["Un repas", "Un sermon/prêche", "Une prière supplémentaire", "Un chant"], correctIndex: 1, category: "islam_basics" },
  { question: "Quelle fête célèbre le sacrifice d'Ibrahim ?", options: ["Aïd al-Fitr", "Aïd al-Adha", "Mawlid", "Isra Mi'raj"], correctIndex: 1, category: "islam_basics" },

  // ─── Connaissances générales Islam ───
  { question: "Quelle est la ville la plus sacrée de l'Islam ?", options: ["Médine", "Jérusalem", "La Mecque", "Le Caire"], correctIndex: 2, category: "islam_basics" },
  { question: "Combien y a-t-il de mosquées sacrées en Islam ?", options: ["2", "3", "4", "5"], correctIndex: 1, category: "islam_basics" },
  { question: "Quelles sont les 3 mosquées sacrées ?", options: ["La Mecque, Médine, Le Caire", "La Mecque, Médine, Al-Aqsa", "La Mecque, Istanbul, Médine", "Médine, Jérusalem, Damas"], correctIndex: 1, category: "islam_basics" },
  { question: "Que contient la Ka'ba ?", options: ["Des statues", "La Pierre Noire (Hajar al-Aswad)", "De l'or", "Des livres"], correctIndex: 1, category: "islam_basics" },
  { question: "Qu'est-ce que le Tawaf ?", options: ["La prière", "Les 7 tours autour de la Ka'ba", "Le jeûne", "La récitation du Coran"], correctIndex: 1, category: "islam_basics" },
  { question: "Qu'est-ce que le Sa'i ?", options: ["Le jeûne", "La marche entre Safa et Marwa", "La prière de nuit", "L'aumône"], correctIndex: 1, category: "islam_basics" },
  { question: "Qui a été le premier muezzin de l'Islam ?", options: ["Omar", "Abu Bakr", "Bilal", "Ali"], correctIndex: 2, category: "islam_basics" },
  { question: "Que signifie le mot 'Islam' ?", options: ["Paix", "Soumission à Allah", "Amour", "Sagesse"], correctIndex: 1, category: "islam_basics" },
  { question: "Que signifie le mot 'Muslim' ?", options: ["Croyant", "Celui qui se soumet à Allah", "Priant", "Pèlerin"], correctIndex: 1, category: "islam_basics" },
  { question: "Combien y a-t-il de rak'at dans la prière du Fajr ?", options: ["2", "3", "4", "1"], correctIndex: 0, category: "islam_basics" },
  { question: "Combien y a-t-il de rak'at dans la prière du Dhuhr ?", options: ["2", "3", "4", "5"], correctIndex: 2, category: "islam_basics" },
  { question: "Combien y a-t-il de rak'at dans la prière du Maghrib ?", options: ["2", "3", "4", "5"], correctIndex: 1, category: "islam_basics" },
  { question: "Qu'est-ce que le Tayammum ?", options: ["Les ablutions avec de la terre propre quand il n'y a pas d'eau", "Une prière spéciale", "Un type de jeûne", "Un pèlerinage"], correctIndex: 0, category: "islam_basics" },
  { question: "Qu'est-ce que la Sunna ?", options: ["Le Coran", "Les pratiques et paroles du Prophète ﷺ", "Le Hadith seulement", "Les lois"], correctIndex: 1, category: "islam_basics" },
  { question: "Qu'est-ce qu'un Hadith ?", options: ["Un verset du Coran", "Une parole ou action rapportée du Prophète ﷺ", "Un pilier de l'Islam", "Une prière"], correctIndex: 1, category: "islam_basics" },
  { question: "Vrai ou faux : La propreté fait partie de la foi en Islam.", options: ["Vrai", "Faux"], correctIndex: 0, category: "islam_basics" },
  { question: "Que dit-on en entrant aux toilettes ?", options: ["Bismillah", "Allahumma inni a'udhu bika minal khubthi wal khaba'ith", "SubhanAllah", "Alhamdulillah"], correctIndex: 1, category: "islam_basics" },
  { question: "Que dit-on en sortant des toilettes ?", options: ["Bismillah", "Ghufranaka", "SubhanAllah", "Allahu Akbar"], correctIndex: 1, category: "islam_basics" },
];
