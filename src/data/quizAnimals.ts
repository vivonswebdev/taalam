import type { QuizQuestion } from "./quizQuestions";

/** ~100 questions on animals mentioned in the Quran */
export const animalsQuiz: QuizQuestion[] = [
  // ─── L'abeille ───
  { question: "Quelle sourate du Coran porte le nom de l'abeille ?", options: ["Al-Ankabut", "An-Naml", "An-Nahl", "Al-Fil"], correctIndex: 2, category: "animals" },
  { question: "Que produit l'abeille selon le Coran ?", options: ["Du lait", "Du miel, remède pour les gens", "De la cire", "Du pollen"], correctIndex: 1, category: "animals" },
  { question: "Dans quelle sourate Allah dit que le miel est un remède ?", options: ["An-Nahl (16:69)", "Al-Baqara", "Al-Kahf", "Yasin"], correctIndex: 0, category: "animals" },

  // ─── La fourmi ───
  { question: "Quelle sourate porte le nom de la fourmi ?", options: ["An-Nahl", "An-Naml", "Al-Ankabut", "Al-Fil"], correctIndex: 1, category: "animals" },
  { question: "Quel prophète a entendu une fourmi parler ?", options: ["Moussa", "Ibrahim", "Soulayman", "Daoud"], correctIndex: 2, category: "animals" },
  { question: "Que disait la fourmi à ses compagnes ?", options: ["Fuyez !", "Rentrez dans vos demeures pour ne pas être écrasées par Soulayman", "Sortez !", "Mangez !"], correctIndex: 1, category: "animals" },

  // ─── L'araignée ───
  { question: "Quelle sourate porte le nom de l'araignée ?", options: ["An-Naml", "An-Nahl", "Al-Ankabut", "Al-Fil"], correctIndex: 2, category: "animals" },
  { question: "À quoi le Coran compare-t-il la toile d'araignée ?", options: ["À la force", "À la fragilité des faux protecteurs", "À la beauté", "À l'intelligence"], correctIndex: 1, category: "animals" },
  { question: "Quel animal a tissé sa toile à l'entrée de la grotte du Prophète ﷺ ?", options: ["Un ver à soie", "Une araignée", "Un papillon", "Une abeille"], correctIndex: 1, category: "animals" },

  // ─── Le corbeau ───
  { question: "Quel animal a montré à Caïn comment enterrer son frère Abel ?", options: ["Un chien", "Un corbeau", "Un chat", "Un aigle"], correctIndex: 1, category: "animals" },
  { question: "Dans quelle sourate cette histoire est-elle racontée ?", options: ["Al-Baqara", "Al-Ma'ida (5:31)", "Maryam", "Yasin"], correctIndex: 1, category: "animals" },

  // ─── La huppe (Hudhud) ───
  { question: "Quel oiseau a apporté des nouvelles à Soulayman ?", options: ["L'aigle", "Le corbeau", "La huppe (Hudhud)", "Le pigeon"], correctIndex: 2, category: "animals" },
  { question: "Quelles nouvelles la huppe a-t-elle apportées ?", options: ["Un trésor caché", "Le royaume de Saba et sa reine", "Une bataille", "De l'eau"], correctIndex: 1, category: "animals" },
  { question: "Dans quelle sourate l'histoire de la huppe est-elle racontée ?", options: ["Al-Baqara", "An-Naml", "Al-Fil", "Maryam"], correctIndex: 1, category: "animals" },

  // ─── L'éléphant ───
  { question: "Quelle sourate parle de l'éléphant ?", options: ["Al-Fil", "An-Naml", "Al-Baqara", "An-Nahl"], correctIndex: 0, category: "animals" },
  { question: "Qui a voulu détruire la Ka'ba avec des éléphants ?", options: ["Pharaon", "Nimrod", "Abraha", "Goliath"], correctIndex: 2, category: "animals" },
  { question: "Qu'est-ce qu'Allah a envoyé contre l'armée d'Abraha ?", options: ["Un déluge", "Des oiseaux (Ababil) lançant des pierres", "Le feu", "Un tremblement de terre"], correctIndex: 1, category: "animals" },

  // ─── La baleine / poisson ───
  { question: "Quel prophète a été avalé par un grand poisson ?", options: ["Moussa", "Nouh", "Younes", "Ibrahim"], correctIndex: 2, category: "animals" },
  { question: "Dans quelle sourate l'histoire de Younes et le poisson est racontée en détail ?", options: ["As-Saffat (37)", "Al-Baqara", "An-Naml", "Al-Fil"], correctIndex: 0, category: "animals" },
  { question: "Que faisait Younes dans le ventre du poisson ?", options: ["Il dormait", "Il invoquait Allah", "Il mangeait", "Il pleurait"], correctIndex: 1, category: "animals" },

  // ─── Le chameau ───
  { question: "Quel animal est appelé « bateau du désert » ?", options: ["Le cheval", "L'âne", "Le chameau", "Le dromadaire"], correctIndex: 2, category: "animals" },
  { question: "Quel prophète a reçu une chamelle miraculeuse ?", options: ["Moussa", "Salih", "Ibrahim", "Nouh"], correctIndex: 1, category: "animals" },
  { question: "D'où est sortie la chamelle de Salih ?", options: ["D'un rocher", "D'une rivière", "Du ciel", "D'un arbre"], correctIndex: 0, category: "animals" },
  { question: "Qu'ont fait les Thamoud avec la chamelle ?", options: ["Ils l'ont nourrie", "Ils l'ont tuée", "Ils l'ont montée", "Ils l'ont vendue"], correctIndex: 1, category: "animals" },
  { question: "Allah invite l'homme à réfléchir sur la création du chameau dans quelle sourate ?", options: ["Al-Ghashiyah (88:17)", "Al-Baqara", "Yasin", "Al-Kahf"], correctIndex: 0, category: "animals" },

  // ─── Le chien ───
  { question: "Dans quelle sourate des jeunes gens dorment avec un chien dans une grotte ?", options: ["Al-Baqara", "Al-Kahf", "Maryam", "Yasin"], correctIndex: 1, category: "animals" },
  { question: "Comment s'appelle cette histoire ?", options: ["Les gens du jardin", "Les gens de la caverne (Ahl al-Kahf)", "Les gens de l'éléphant", "Les gens de Nouh"], correctIndex: 1, category: "animals" },
  { question: "Que faisait le chien des gens de la caverne ?", options: ["Il aboyait", "Il était couché, les pattes étendues à l'entrée", "Il courait", "Il chassait"], correctIndex: 1, category: "animals" },
  { question: "Combien de temps les gens de la caverne ont-ils dormi ?", options: ["100 ans", "200 ans", "309 ans", "500 ans"], correctIndex: 2, category: "animals" },

  // ─── La vache ───
  { question: "Quelle sourate porte le nom de la vache ?", options: ["Al-Imran", "An-Nisa", "Al-Baqara", "Al-Ma'ida"], correctIndex: 2, category: "animals" },
  { question: "De quelle couleur devait être la vache demandée par Allah dans Al-Baqara ?", options: ["Noire", "Blanche", "Jaune vif", "Brune"], correctIndex: 2, category: "animals" },
  { question: "À qui Allah a-t-il demandé de sacrifier cette vache ?", options: ["Au Prophète ﷺ", "Aux Bani Israël", "À Ibrahim", "À Nouh"], correctIndex: 1, category: "animals" },

  // ─── Le veau d'or ───
  { question: "Qu'ont adoré les Bani Israël en l'absence de Moussa ?", options: ["Un arbre", "Un veau d'or", "Le soleil", "La lune"], correctIndex: 1, category: "animals" },
  { question: "Qui a fabriqué le veau d'or ?", options: ["Moussa", "Harun", "As-Samiri", "Pharaon"], correctIndex: 2, category: "animals" },

  // ─── Les oiseaux ───
  { question: "Quel prophète chantait les louanges d'Allah avec les oiseaux ?", options: ["Moussa", "Ibrahim", "Daoud", "Soulayman"], correctIndex: 2, category: "animals" },
  { question: "Quel prophète commandait les oiseaux ?", options: ["Daoud", "Moussa", "Soulayman", "Issa"], correctIndex: 2, category: "animals" },
  { question: "Quel oiseau Issa a-t-il créé en argile par permission d'Allah ?", options: ["Un aigle", "Un oiseau (sans précision)", "Un pigeon", "Un corbeau"], correctIndex: 1, category: "animals" },
  { question: "Quels oiseaux ont attaqué l'armée d'Abraha ?", options: ["Des aigles", "Des corbeaux", "Des Ababil (oiseaux en groupes)", "Des faucons"], correctIndex: 2, category: "animals" },
  { question: "Allah a montré à Ibrahim comment Il ressuscite les morts en utilisant...", options: ["Des poissons", "4 oiseaux", "Des chameaux", "Des moutons"], correctIndex: 1, category: "animals" },

  // ─── Le serpent ───
  { question: "Le bâton de quel prophète se transformait en serpent ?", options: ["Ibrahim", "Nouh", "Moussa", "Soulayman"], correctIndex: 2, category: "animals" },
  { question: "Devant qui Moussa a-t-il montré ce miracle ?", options: ["Son peuple", "Pharaon", "Ibrahim", "Nouh"], correctIndex: 1, category: "animals" },

  // ─── Le loup ───
  { question: "Les frères de Youssouf ont dit qu'un ___ l'avait mangé.", options: ["Lion", "Loup", "Ours", "Serpent"], correctIndex: 1, category: "animals" },
  { question: "Était-ce vrai ?", options: ["Oui", "Non, c'était un mensonge"], correctIndex: 1, category: "animals" },

  // ─── Les moutons / bélier ───
  { question: "Par quoi Allah a-t-il remplacé le sacrifice d'Ismail ?", options: ["Un chameau", "Un bélier", "Un bœuf", "Un agneau"], correctIndex: 1, category: "animals" },
  { question: "Quel prophète était berger avant de recevoir la révélation ?", options: ["Ibrahim", "Mohammed ﷺ", "Soulayman", "Issa"], correctIndex: 1, category: "animals" },
  { question: "Vrai ou faux : Tous les prophètes ont été bergers.", options: ["Vrai (selon un hadith)", "Faux"], correctIndex: 0, category: "animals" },

  // ─── Les sauterelles ───
  { question: "Les sauterelles font partie des plaies envoyées sur quel peuple ?", options: ["Le peuple de Nouh", "Le peuple de Pharaon", "Le peuple de 'Ad", "Le peuple de Lut"], correctIndex: 1, category: "animals" },

  // ─── Les poux ───
  { question: "Les poux faisaient partie des plaies envoyées sur...", options: ["Le peuple de Nouh", "L'Égypte de Pharaon", "Le peuple de 'Ad", "Le peuple de Salih"], correctIndex: 1, category: "animals" },

  // ─── Les grenouilles ───
  { question: "Les grenouilles sont mentionnées comme plaie dans quelle sourate ?", options: ["Al-A'raf (7:133)", "Al-Baqara", "An-Naml", "Yasin"], correctIndex: 0, category: "animals" },

  // ─── Le moustique ───
  { question: "Allah n'hésite pas à donner l'exemple de quel petit insecte dans le Coran ?", options: ["La mouche", "Le moustique", "La fourmi", "Le papillon"], correctIndex: 1, category: "animals" },
  { question: "Dans quelle sourate cet exemple est-il donné ?", options: ["Al-Baqara (2:26)", "An-Naml", "Al-Fil", "An-Nahl"], correctIndex: 0, category: "animals" },

  // ─── La mouche ───
  { question: "Dans quelle sourate Allah mentionne-t-il la mouche ?", options: ["Al-Hajj (22:73)", "Al-Baqara", "An-Naml", "Al-Fil"], correctIndex: 0, category: "animals" },
  { question: "Que dit le Coran à propos de la mouche ?", options: ["Elle est belle", "Les idoles ne peuvent même pas créer une mouche", "Elle est forte", "Elle est sacrée"], correctIndex: 1, category: "animals" },

  // ─── Le cheval ───
  { question: "Quelle sourate commence par un serment par les chevaux ?", options: ["Al-Fil", "Al-Adiyat", "An-Naml", "Al-Buruj"], correctIndex: 1, category: "animals" },
  { question: "Que signifie 'Al-Adiyat' ?", options: ["Les fourmis", "Les chevaux qui galopent", "Les oiseaux", "Les chameaux"], correctIndex: 1, category: "animals" },

  // ─── L'âne ───
  { question: "À quoi le Coran compare-t-il celui qui porte des livres sans les comprendre ?", options: ["À un chameau", "À un âne portant des livres", "À un chien", "À un poisson"], correctIndex: 1, category: "animals" },
  { question: "Dans quelle sourate cette comparaison est-elle faite ?", options: ["Al-Jumu'a (62:5)", "Al-Baqara", "An-Naml", "Al-Fil"], correctIndex: 0, category: "animals" },

  // ─── Le porc ───
  { question: "La consommation de porc est...", options: ["Permise (halal)", "Interdite (haram)", "Déconseillée (makruh)", "Selon le contexte"], correctIndex: 1, category: "animals" },
  { question: "Dans combien de sourates l'interdiction du porc est mentionnée ?", options: ["1", "2", "4", "6"], correctIndex: 2, category: "animals" },

  // ─── Le singe ───
  { question: "Certaines personnes ont été transformées en singes selon le Coran. Qui ?", options: ["Le peuple de Nouh", "Des gens qui pêchaient le samedi (Bani Israël)", "Le peuple de Lut", "Le peuple de 'Ad"], correctIndex: 1, category: "animals" },

  // ─── La colombe / pigeon ───
  { question: "Quel oiseau s'est posé à l'entrée de la grotte de Thawr ?", options: ["Un aigle", "Une colombe/pigeon", "Un corbeau", "Une huppe"], correctIndex: 1, category: "animals" },

  // ─── Les termites ───
  { question: "Quel animal a rongé le bâton de Soulayman après sa mort ?", options: ["Un ver / termite", "Un serpent", "Un poisson", "Un rat"], correctIndex: 0, category: "animals" },
  { question: "Pourquoi est-ce important dans l'histoire de Soulayman ?", options: ["Pour montrer sa force", "Pour montrer que les djinns ne connaissaient pas l'invisible", "Pour punir les djinns", "Sans importance"], correctIndex: 1, category: "animals" },

  // ─── Questions transversales ───
  { question: "Combien de sourates du Coran portent un nom d'animal ?", options: ["3", "5", "7", "6"], correctIndex: 2, category: "animals" },
  { question: "Laquelle de ces sourates ne porte PAS un nom d'animal ?", options: ["An-Naml", "An-Nahl", "Al-Fil", "Al-Fajr"], correctIndex: 3, category: "animals" },
  { question: "Quel animal a creusé la terre pour montrer à Caïn ?", options: ["Un loup", "Un corbeau", "Un chien", "Un rat"], correctIndex: 1, category: "animals" },
  { question: "Quel insecte le Coran décrit comme construisant avec organisation ?", options: ["Le papillon", "L'abeille", "La mouche", "La sauterelle"], correctIndex: 1, category: "animals" },
  { question: "Le Coran mentionne que chaque animal forme une...", options: ["Famille", "Communauté (Umma)", "Tribu", "Équipe"], correctIndex: 1, category: "animals" },
  { question: "Dans quelle sourate est-il dit que les animaux forment des communautés ?", options: ["Al-An'am (6:38)", "Al-Baqara", "Yasin", "Al-Kahf"], correctIndex: 0, category: "animals" },
  { question: "Quel animal Nouh a-t-il pris dans l'arche ?", options: ["Seulement les gros animaux", "Un couple de chaque espèce", "Les animaux domestiques seulement", "Les oiseaux seulement"], correctIndex: 1, category: "animals" },
  { question: "Vrai ou faux : Le Coran mentionne plus de 30 animaux différents.", options: ["Vrai", "Faux"], correctIndex: 0, category: "animals" },
  { question: "Quel animal est mentionné dans l'histoire de Qarun (Coré) ?", options: ["Aucun en particulier", "Un veau", "Un chameau", "Un serpent"], correctIndex: 0, category: "animals" },
  { question: "Les oiseaux Ababil lançaient des pierres de...", options: ["Terre cuite (Sijjil)", "Diamant", "Fer", "Marbre"], correctIndex: 0, category: "animals" },
  { question: "Quel animal est associé à la patience dans le Coran ?", options: ["Le chameau", "Le chien", "Le cheval", "Aucun spécifiquement"], correctIndex: 0, category: "animals" },
  { question: "Selon le Coran, qui a enseigné aux humains à enterrer les morts ?", options: ["Un ange", "Un corbeau", "Un prophète", "Un djinn"], correctIndex: 1, category: "animals" },
];
