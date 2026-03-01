import type { QuizQuestion } from "./quizQuestions";

/** ~100 questions on Prophet stories from the Quran */
export const prophetQuiz: QuizQuestion[] = [
  // ─── Adam ───
  { question: "Qui est le premier prophète de l'Islam ?", options: ["Nouh", "Ibrahim", "Adam", "Moussa"], correctIndex: 2, category: "prophets" },
  { question: "Qu'a enseigné Allah à Adam ?", options: ["La prière", "Les noms de toutes choses", "La médecine", "L'écriture"], correctIndex: 1, category: "prophets" },
  { question: "Qui a refusé de se prosterner devant Adam ?", options: ["Jibril", "Mikael", "Iblis", "Israfil"], correctIndex: 2, category: "prophets" },
  { question: "Où vivaient Adam et Hawa avant de descendre sur terre ?", options: ["La Mecque", "Le Paradis", "Médine", "Jérusalem"], correctIndex: 1, category: "prophets" },
  { question: "De quoi Adam a-t-il été créé ?", options: ["De lumière", "D'eau", "D'argile", "De feu"], correctIndex: 2, category: "prophets" },

  // ─── Idris ───
  { question: "Pour quoi le prophète Idris est-il connu ?", options: ["Sa patience", "Sa sagesse et son rang élevé", "Sa force", "Son commerce"], correctIndex: 1, category: "prophets" },
  { question: "Dans quelle sourate Idris est-il mentionné ?", options: ["Al-Baqara", "Maryam", "Yasin", "Al-Kahf"], correctIndex: 1, category: "prophets" },

  // ─── Nouh ───
  { question: "Combien d'années Nouh a-t-il prêché à son peuple ?", options: ["500 ans", "700 ans", "950 ans", "1000 ans"], correctIndex: 2, category: "prophets" },
  { question: "Qu'a construit Nouh sur ordre d'Allah ?", options: ["Un temple", "Une arche", "Un château", "Une mosquée"], correctIndex: 1, category: "prophets" },
  { question: "Que s'est-il passé avec le fils de Nouh ?", options: ["Il est monté sur l'arche", "Il a refusé de monter et s'est noyé", "Il a prié avec son père", "Il a fui dans le désert"], correctIndex: 1, category: "prophets" },
  { question: "Quel animal Nouh a-t-il envoyé pour chercher la terre ?", options: ["Un aigle", "Une colombe", "Un corbeau", "Un pigeon"], correctIndex: 2, category: "prophets" },
  { question: "Quelle sourate porte le nom de Nouh ?", options: ["Sourate 71", "Sourate 12", "Sourate 19", "Sourate 36"], correctIndex: 0, category: "prophets" },

  // ─── Houd ───
  { question: "À quel peuple le prophète Houd a-t-il été envoyé ?", options: ["Thamoud", "'Ad", "Madian", "Pharaon"], correctIndex: 1, category: "prophets" },
  { question: "Comment le peuple de 'Ad a-t-il été détruit ?", options: ["Par un déluge", "Par un vent violent", "Par un tremblement de terre", "Par la foudre"], correctIndex: 1, category: "prophets" },
  { question: "Le peuple de 'Ad était connu pour...", options: ["Leur petite taille", "Leurs constructions imposantes", "Leur commerce maritime", "Leur agriculture"], correctIndex: 1, category: "prophets" },

  // ─── Salih ───
  { question: "Quel miracle Allah a-t-il donné au prophète Salih ?", options: ["Un bâton magique", "Une chamelle sortie d'un rocher", "De l'eau du ciel", "Le pouvoir de guérir"], correctIndex: 1, category: "prophets" },
  { question: "Qu'a fait le peuple de Thamoud avec la chamelle de Salih ?", options: ["Ils l'ont nourrie", "Ils l'ont tuée", "Ils l'ont montée", "Ils l'ont offerte"], correctIndex: 1, category: "prophets" },
  { question: "Comment le peuple de Thamoud a-t-il été puni ?", options: ["Par un déluge", "Par un cri terrible", "Par des sauterelles", "Par un incendie"], correctIndex: 1, category: "prophets" },

  // ─── Ibrahim ───
  { question: "Quel surnom Allah a-t-il donné à Ibrahim ?", options: ["Rouhallah", "Khalilullah (l'ami d'Allah)", "Kalimullah", "Habibullah"], correctIndex: 1, category: "prophets" },
  { question: "Que s'est-il passé quand Ibrahim a été jeté dans le feu ?", options: ["Il a brûlé", "Le feu est devenu froid et paisible", "Il s'est enfui", "L'eau a éteint le feu"], correctIndex: 1, category: "prophets" },
  { question: "Qui Ibrahim a-t-il accepté de sacrifier par obéissance à Allah ?", options: ["Ishaq", "Ismail", "Yaqub", "Lut"], correctIndex: 1, category: "prophets" },
  { question: "Qu'a construit Ibrahim avec Ismail ?", options: ["Le Masjid al-Aqsa", "La Ka'ba", "Le Masjid Nabawi", "Le Dôme du Rocher"], correctIndex: 1, category: "prophets" },
  { question: "Qui est la mère d'Ismail ?", options: ["Sarah", "Hajar", "Maryam", "Asiya"], correctIndex: 1, category: "prophets" },
  { question: "Quelle eau miraculeuse a jailli pour Hajar et Ismail ?", options: ["L'eau du Nil", "L'eau de Zamzam", "L'eau de pluie", "L'eau d'une rivière"], correctIndex: 1, category: "prophets" },
  { question: "Ibrahim a brisé les idoles de son peuple sauf...", options: ["La plus petite", "La plus grande", "La plus colorée", "Aucune"], correctIndex: 1, category: "prophets" },
  { question: "Quel roi arrogant a débattu avec Ibrahim ?", options: ["Pharaon", "Nimrod", "Goliath", "Haman"], correctIndex: 1, category: "prophets" },

  // ─── Lut ───
  { question: "À quel peuple le prophète Lut a-t-il été envoyé ?", options: ["Les gens de Madian", "Les gens de Sodome", "Les gens de 'Ad", "Les Quraysh"], correctIndex: 1, category: "prophets" },
  { question: "Comment le peuple de Lut a-t-il été puni ?", options: ["Par un vent", "Par des pierres d'argile et un renversement", "Par un déluge", "Par le feu"], correctIndex: 1, category: "prophets" },

  // ─── Ismail ───
  { question: "Ismail est l'ancêtre de quel peuple ?", options: ["Les Perses", "Les Arabes", "Les Romains", "Les Hébreux"], correctIndex: 1, category: "prophets" },
  { question: "Quelle épreuve Ismail a-t-il acceptée avec soumission ?", options: ["L'exil", "Le sacrifice", "La prison", "La maladie"], correctIndex: 1, category: "prophets" },

  // ─── Ishaq & Yaqub ───
  { question: "Qui est la mère d'Ishaq ?", options: ["Hajar", "Sarah", "Maryam", "Khadija"], correctIndex: 1, category: "prophets" },
  { question: "Quel autre nom porte Yaqub ?", options: ["Israël", "Ismail", "Idris", "Ilyas"], correctIndex: 0, category: "prophets" },
  { question: "Combien de fils avait Yaqub ?", options: ["10", "11", "12", "13"], correctIndex: 2, category: "prophets" },

  // ─── Youssouf ───
  { question: "Qu'ont fait les frères de Youssouf ?", options: ["Ils l'ont aidé", "Ils l'ont jeté dans un puits", "Ils l'ont protégé", "Ils sont partis avec lui"], correctIndex: 1, category: "prophets" },
  { question: "Quel don Allah a-t-il donné à Youssouf ?", options: ["La force", "L'interprétation des rêves", "Parler aux animaux", "Commander le vent"], correctIndex: 1, category: "prophets" },
  { question: "Que signifie le rêve de Youssouf (11 étoiles, soleil et lune) ?", options: ["11 prophètes", "Ses frères et parents se prosterneront devant lui", "11 tribus", "Le ciel"], correctIndex: 1, category: "prophets" },
  { question: "Où Youssouf est-il devenu gouverneur ?", options: ["La Mecque", "Babylone", "L'Égypte", "La Syrie"], correctIndex: 2, category: "prophets" },
  { question: "Qui a tenté de séduire Youssouf ?", options: ["La reine", "La femme du roi d'Égypte (Zulaykha)", "Une servante", "Sa cousine"], correctIndex: 1, category: "prophets" },
  { question: "Pourquoi Youssouf est-il allé en prison ?", options: ["Il a volé", "Il a été accusé injustement", "Il a désobéi au roi", "Il s'est enfui"], correctIndex: 1, category: "prophets" },
  { question: "Quelle sourate raconte l'histoire complète de Youssouf ?", options: ["Sourate Al-Anbiya", "Sourate Yusuf", "Sourate Maryam", "Sourate Taha"], correctIndex: 1, category: "prophets" },

  // ─── Ayyub ───
  { question: "Pour quelle qualité Ayyub est-il le plus connu ?", options: ["La force", "La patience (sabr)", "La richesse", "Le courage"], correctIndex: 1, category: "prophets" },
  { question: "Quelles épreuves Ayyub a-t-il subies ?", options: ["Maladie, perte de biens et d'enfants", "L'exil seulement", "La prison", "La guerre"], correctIndex: 0, category: "prophets" },
  { question: "Comment Allah a-t-il guéri Ayyub ?", options: ["Par un médicament", "En frappant le sol du pied et une source a jailli", "Par un ange", "Par la prière seule"], correctIndex: 1, category: "prophets" },

  // ─── Shu'ayb ───
  { question: "À quel peuple Shu'ayb a-t-il été envoyé ?", options: ["'Ad", "Thamoud", "Madian", "Sodome"], correctIndex: 2, category: "prophets" },
  { question: "Contre quel péché Shu'ayb mettait-il en garde ?", options: ["L'idolâtrie uniquement", "La tricherie dans le commerce", "La guerre", "Le vol de nourriture"], correctIndex: 1, category: "prophets" },

  // ─── Moussa ───
  { question: "Qui a recueilli Moussa bébé du Nil ?", options: ["Sa mère", "Sa sœur", "La femme de Pharaon (Asiya)", "Hajar"], correctIndex: 2, category: "prophets" },
  { question: "Quel miracle Allah a-t-il donné au bâton de Moussa ?", options: ["Il brillait", "Il se transformait en serpent", "Il coupait le fer", "Il volait"], correctIndex: 1, category: "prophets" },
  { question: "Combien de plaies Allah a-t-il envoyées sur l'Égypte ?", options: ["5", "7", "9", "12"], correctIndex: 2, category: "prophets" },
  { question: "Que s'est-il passé à la mer Rouge ?", options: ["Elle s'est asséchée", "Elle s'est fendue pour Moussa", "Moussa a nagé", "Un pont est apparu"], correctIndex: 1, category: "prophets" },
  { question: "Qu'ont adoré les Bani Israël en l'absence de Moussa ?", options: ["Une statue", "Un veau d'or", "Le soleil", "La lune"], correctIndex: 1, category: "prophets" },
  { question: "Sur quel mont Moussa a-t-il parlé à Allah ?", options: ["Mont Hira", "Mont Sinaï (Tûr)", "Mont Arafat", "Mont Uhud"], correctIndex: 1, category: "prophets" },
  { question: "Quel livre a été révélé à Moussa ?", options: ["L'Injil", "Le Zabour", "La Torah", "Le Coran"], correctIndex: 2, category: "prophets" },
  { question: "Quel surnom porte Moussa ?", options: ["Khalilullah", "Kalimullah (celui à qui Allah a parlé)", "Rouhullah", "Habibullah"], correctIndex: 1, category: "prophets" },
  { question: "Combien de sources Moussa a-t-il fait jaillir d'un rocher ?", options: ["7", "10", "12", "15"], correctIndex: 2, category: "prophets" },
  { question: "Qui aidait Moussa dans sa mission ?", options: ["Ismail", "Harun (son frère)", "Youssouf", "Daoud"], correctIndex: 1, category: "prophets" },

  // ─── Harun ───
  { question: "Quel était le lien entre Harun et Moussa ?", options: ["Cousins", "Frères", "Amis", "Voisins"], correctIndex: 1, category: "prophets" },

  // ─── Daoud ───
  { question: "Quel géant Daoud a-t-il vaincu ?", options: ["Nimrod", "Goliath (Jalut)", "Pharaon", "Haman"], correctIndex: 1, category: "prophets" },
  { question: "Quel livre a été révélé à Daoud ?", options: ["La Torah", "L'Injil", "Le Zabour (Psaumes)", "Le Coran"], correctIndex: 2, category: "prophets" },
  { question: "Qu'est-ce qui glorifiait Allah avec Daoud ?", options: ["Les étoiles", "Les montagnes et les oiseaux", "Les rivières", "Les arbres seuls"], correctIndex: 1, category: "prophets" },
  { question: "Quel métier Daoud exerçait-il ?", options: ["Berger", "Forgeron (il façonnait le fer)", "Charpentier", "Pêcheur"], correctIndex: 1, category: "prophets" },

  // ─── Soulayman ───
  { question: "Quel pouvoir unique Soulayman avait-il ?", options: ["Voler", "Parler aux animaux et commander les djinns", "L'invisibilité", "Lire dans les pensées"], correctIndex: 1, category: "prophets" },
  { question: "Quel oiseau a apporté des nouvelles à Soulayman ?", options: ["L'aigle", "Le corbeau", "La huppe (Hudhud)", "Le pigeon"], correctIndex: 2, category: "prophets" },
  { question: "Quelle reine a rendu visite à Soulayman ?", options: ["Cléopâtre", "La reine de Saba (Bilqis)", "Asiya", "Zulaykha"], correctIndex: 1, category: "prophets" },
  { question: "Qu'est-ce qui était soumis à Soulayman ?", options: ["Le feu", "Le vent et les djinns", "La pluie", "Les étoiles"], correctIndex: 1, category: "prophets" },

  // ─── Younes ───
  { question: "Qu'est-il arrivé à Younes quand il a quitté son peuple ?", options: ["Il s'est perdu", "Il a été avalé par un gros poisson", "Il a été emprisonné", "Il est tombé malade"], correctIndex: 1, category: "prophets" },
  { question: "Quelle invocation Younes a-t-il faite dans le ventre du poisson ?", options: ["Alhamdulillah", "La ilaha illa anta subhanaka inni kuntu mina adh-dhalimin", "Astaghfirullah", "SubhanAllah"], correctIndex: 1, category: "prophets" },
  { question: "Que s'est-il passé après la du'a de Younes ?", options: ["Rien", "Le poisson l'a recraché sur le rivage", "Il est resté", "Il s'est endormi"], correctIndex: 1, category: "prophets" },
  { question: "Quel autre nom porte Younes ?", options: ["Dhun-Nun (l'homme au poisson)", "Khalilullah", "Kalimullah", "Rouhullah"], correctIndex: 0, category: "prophets" },

  // ─── Zakariya & Yahya ───
  { question: "Que demandait Zakariya à Allah ?", options: ["La richesse", "Un enfant malgré sa vieillesse", "La victoire", "La santé"], correctIndex: 1, category: "prophets" },
  { question: "Comment s'appelle le fils de Zakariya ?", options: ["Issa", "Yahya", "Moussa", "Daoud"], correctIndex: 1, category: "prophets" },
  { question: "Qui prenait soin de Maryam dans le temple ?", options: ["Ibrahim", "Zakariya", "Moussa", "Daoud"], correctIndex: 1, category: "prophets" },
  { question: "Que trouvait Zakariya auprès de Maryam ?", options: ["Des livres", "De la nourriture miraculeuse", "De l'or", "Des fleurs"], correctIndex: 1, category: "prophets" },

  // ─── Issa ───
  { question: "Comment Issa est-il né ?", options: ["Normalement", "Sans père, par miracle d'Allah", "D'une famille royale", "Dans le désert"], correctIndex: 1, category: "prophets" },
  { question: "Quel surnom le Coran donne-t-il à Issa ?", options: ["Khalilullah", "Kalimullah", "Rouhullah (l'esprit d'Allah)", "Habibullah"], correctIndex: 2, category: "prophets" },
  { question: "Quel miracle Issa a-t-il accompli bébé ?", options: ["Il a marché", "Il a parlé dans le berceau", "Il a volé", "Il a chanté"], correctIndex: 1, category: "prophets" },
  { question: "Quel livre a été révélé à Issa ?", options: ["La Torah", "Le Zabour", "L'Injil (Évangile)", "Le Coran"], correctIndex: 2, category: "prophets" },
  { question: "Quels miracles Issa accomplissait-il ?", options: ["Transformer l'eau en or", "Guérir les aveugles et les lépreux", "Arrêter le temps", "Voler"], correctIndex: 1, category: "prophets" },
  { question: "Qu'a fait Issa avec de l'argile selon le Coran ?", options: ["Une maison", "Un oiseau qui s'est envolé par permission d'Allah", "Un vase", "Un bateau"], correctIndex: 1, category: "prophets" },
  { question: "Que dit le Coran sur la fin d'Issa ?", options: ["Il est mort", "Allah l'a élevé au ciel", "Il s'est caché", "Il a voyagé"], correctIndex: 1, category: "prophets" },

  // ─── Mohammed ﷺ ───
  { question: "Quel est le premier mot révélé au Prophète Mohammed ﷺ ?", options: ["Bismillah", "Alhamdulillah", "Iqra (Lis !)", "Qul"], correctIndex: 2, category: "prophets" },
  { question: "Dans quelle grotte le Prophète ﷺ a-t-il reçu la première révélation ?", options: ["Grotte de Thawr", "Grotte de Hira", "Grotte d'Uhud", "Grotte de Badr"], correctIndex: 1, category: "prophets" },
  { question: "Qui était la première épouse du Prophète ﷺ ?", options: ["Aïcha", "Hafsa", "Khadija", "Zaynab"], correctIndex: 2, category: "prophets" },
  { question: "Qui est le premier homme à avoir embrassé l'Islam ?", options: ["Omar", "Ali", "Abu Bakr", "Uthman"], correctIndex: 2, category: "prophets" },
  { question: "Qui est le premier enfant à avoir embrassé l'Islam ?", options: ["Abu Bakr", "Omar", "Ali", "Uthman"], correctIndex: 2, category: "prophets" },
  { question: "Quelle est la Hijra (émigration) du Prophète ﷺ ?", options: ["De Médine à La Mecque", "De La Mecque à Médine", "De La Mecque à Taïf", "De Médine à Jérusalem"], correctIndex: 1, category: "prophets" },
  { question: "Quel événement miraculeux le Prophète ﷺ a-t-il vécu de nuit ?", options: ["Le déluge", "L'Isra et Mi'raj", "La bataille de Badr", "La conquête de La Mecque"], correctIndex: 1, category: "prophets" },
  { question: "Quel surnom avait le Prophète ﷺ avant la révélation ?", options: ["Le roi", "Al-Amin (le digne de confiance)", "Le sage", "Le guerrier"], correctIndex: 1, category: "prophets" },
  { question: "Combien d'années a duré la révélation du Coran ?", options: ["10 ans", "15 ans", "23 ans", "30 ans"], correctIndex: 2, category: "prophets" },
  { question: "Quel compagnon accompagnait le Prophète ﷺ dans la grotte de Thawr ?", options: ["Omar", "Ali", "Abu Bakr", "Uthman"], correctIndex: 2, category: "prophets" },
  { question: "Combien de prophètes sont nommés dans le Coran ?", options: ["20", "25", "30", "40"], correctIndex: 1, category: "prophets" },

  // ─── Divers prophètes ───
  { question: "Quel prophète est connu pour avoir vécu une très longue maladie ?", options: ["Nouh", "Ayyub", "Ibrahim", "Moussa"], correctIndex: 1, category: "prophets" },
  { question: "Quel prophète a été envoyé au peuple d'Al-Ayka ?", options: ["Salih", "Houd", "Shu'ayb", "Lut"], correctIndex: 2, category: "prophets" },
  { question: "Quel prophète est lié à la ville de Ninive ?", options: ["Moussa", "Younes", "Ibrahim", "Issa"], correctIndex: 1, category: "prophets" },
  { question: "Lequel est fils de Daoud ?", options: ["Moussa", "Younes", "Soulayman", "Yahya"], correctIndex: 2, category: "prophets" },
  { question: "Qui est Dhul-Kifl selon le Coran ?", options: ["Un roi", "Un prophète mentionné pour sa patience", "Un ange", "Un compagnon"], correctIndex: 1, category: "prophets" },
  { question: "Quel prophète a combattu l'adoration de Ba'l ?", options: ["Daoud", "Ilyas", "Shu'ayb", "Houd"], correctIndex: 1, category: "prophets" },
  { question: "Qui est Al-Yasa' ?", options: ["Le fils de Moussa", "Le successeur d'Ilyas", "Le frère de Daoud", "Le fils de Nouh"], correctIndex: 1, category: "prophets" },
  { question: "Dans quelle sourate trouve-t-on une liste de 18 prophètes ?", options: ["Al-An'am", "Al-Baqara", "Yasin", "Maryam"], correctIndex: 0, category: "prophets" },
  { question: "Quel prophète est appelé « père des prophètes arabes » ?", options: ["Adam", "Nouh", "Ismail", "Ibrahim"], correctIndex: 2, category: "prophets" },
  { question: "Vrai ou faux : Tous les prophètes ont transmis le même message d'unicité d'Allah.", options: ["Vrai", "Faux"], correctIndex: 0, category: "prophets" },
];
