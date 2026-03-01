import type { QuizQuestion } from "./quizQuestions";

/** 100 questions QCM – Animaux dans le Coran (enfants / familles) */
export const animalsQuiz: QuizQuestion[] = [
  // 1 [Facile] – Baleine / Poisson
  { question: "Quel animal a avalé le prophète Yunus (Jonas) ?", options: ["Un crocodile", "Un lion", "Un grand poisson / baleine", "Un chameau"], correctIndex: 2, category: "animals" },
  // 2 [Facile] – Fourmi
  { question: "Quel petit insecte a parlé pour prévenir son peuple de l'armée de Sulayman ?", options: ["La mouche", "La fourmi", "L'abeille", "L'araignée"], correctIndex: 1, category: "animals" },
  // 3 [Facile] – Araignée
  { question: "Quel animal a tissé sa toile à l'entrée de la grotte pour protéger le Prophète ﷺ ?", options: ["Un corbeau", "Un chien", "Une araignée", "Un cheval"], correctIndex: 2, category: "animals" },
  // 4 [Facile] – Chien
  { question: "Quel animal accompagnait les gens de la caverne (Ashab al-Kahf) ?", options: ["Un chien", "Un mouton", "Un cheval", "Un chameau"], correctIndex: 0, category: "animals" },
  // 5 [Facile] – Éléphant
  { question: "Quelle sourate du Coran parle de l'éléphant ?", options: ["Al-Fil", "An-Naml", "Al-Baqara", "An-Nahl"], correctIndex: 0, category: "animals" },
  // 6 [Facile] – Corbeau
  { question: "Quel animal a montré à Caïn comment enterrer son frère Abel ?", options: ["Un aigle", "Un corbeau", "Un chien", "Un loup"], correctIndex: 1, category: "animals" },
  // 7 [Facile] – Abeille
  { question: "Quelle sourate porte le nom de l'abeille ?", options: ["An-Naml", "An-Nahl", "Al-Ankabut", "Al-Fil"], correctIndex: 1, category: "animals" },
  // 8 [Facile] – Chameau
  { question: "D'où est sortie la chamelle miraculeuse du prophète Salih ?", options: ["D'un rocher", "D'une rivière", "Du ciel", "D'un arbre"], correctIndex: 0, category: "animals" },
  // 9 [Facile] – Huppe
  { question: "Quel oiseau a apporté des nouvelles du royaume de Saba à Sulayman ?", options: ["L'aigle", "Le corbeau", "La huppe (Hudhud)", "Le pigeon"], correctIndex: 2, category: "animals" },
  // 10 [Facile] – Serpent
  { question: "Le bâton de quel prophète se transformait en serpent ?", options: ["Ibrahim", "Nouh", "Moussa", "Soulayman"], correctIndex: 2, category: "animals" },
  // 11 [Facile] – Loup
  { question: "Les frères de Youssouf ont prétendu qu'un ___ l'avait dévoré.", options: ["Lion", "Loup", "Ours", "Serpent"], correctIndex: 1, category: "animals" },
  // 12 [Facile] – Bélier
  { question: "Par quel animal Allah a-t-Il remplacé le sacrifice d'Ismaïl ?", options: ["Un chameau", "Un bélier", "Un bœuf", "Un agneau"], correctIndex: 1, category: "animals" },
  // 13 [Facile] – Vache
  { question: "Quelle sourate porte le nom de la vache ?", options: ["Al-Imran", "An-Nisa", "Al-Baqara", "Al-Ma'ida"], correctIndex: 2, category: "animals" },
  // 14 [Facile] – Oiseaux Ababil
  { question: "Quels oiseaux ont lancé des pierres sur l'armée d'Abraha ?", options: ["Des aigles", "Des corbeaux", "Des oiseaux Ababil", "Des faucons"], correctIndex: 2, category: "animals" },
  // 15 [Facile] – Colombe / Pigeon
  { question: "Quel oiseau s'est posé à l'entrée de la grotte de Thawr pendant la hijra ?", options: ["Un aigle", "Une colombe / pigeon", "Un corbeau", "Une huppe"], correctIndex: 1, category: "animals" },
  // 16 [Facile] – Miel
  { question: "Que produit l'abeille qui est décrit comme un remède dans le Coran ?", options: ["Du lait", "Du miel", "De la cire", "Du pollen"], correctIndex: 1, category: "animals" },
  // 17 [Facile] – Cheval
  { question: "Quelle sourate commence par un serment par les chevaux qui galopent ?", options: ["Al-Fil", "Al-Adiyat", "An-Naml", "Al-Buruj"], correctIndex: 1, category: "animals" },
  // 18 [Facile] – Araignée (sourate)
  { question: "Quelle sourate porte le nom de l'araignée ?", options: ["An-Naml", "An-Nahl", "Al-Ankabut", "Al-Fil"], correctIndex: 2, category: "animals" },
  // 19 [Facile] – Fourmi (sourate)
  { question: "Quelle sourate porte le nom de la fourmi ?", options: ["An-Nahl", "An-Naml", "Al-Ankabut", "Al-Baqara"], correctIndex: 1, category: "animals" },
  // 20 [Facile] – Porc
  { question: "La consommation de porc est, selon le Coran :", options: ["Permise (halal)", "Interdite (haram)", "Déconseillée (makruh)", "Autorisée en voyage"], correctIndex: 1, category: "animals" },
  // 21 [Facile] – Sulayman et les oiseaux
  { question: "Quel prophète pouvait comprendre le langage des oiseaux ?", options: ["Moussa", "Ibrahim", "Soulayman", "Issa"], correctIndex: 2, category: "animals" },
  // 22 [Facile] – Yunus invocation
  { question: "Que faisait Yunus dans le ventre du poisson ?", options: ["Il dormait", "Il invoquait Allah", "Il mangeait", "Il pleurait"], correctIndex: 1, category: "animals" },
  // 23 [Facile] – Veau d'or
  { question: "Qu'ont adoré les Bani Israël en l'absence de Moussa ?", options: ["Un arbre", "Un veau d'or", "Le soleil", "La lune"], correctIndex: 1, category: "animals" },
  // 24 [Facile] – Thamoud
  { question: "Qu'ont fait les Thamoud avec la chamelle de Salih ?", options: ["Ils l'ont nourrie", "Ils l'ont tuée", "Ils l'ont montée", "Ils l'ont vendue"], correctIndex: 1, category: "animals" },
  // 25 [Facile] – Mouton / Berger
  { question: "Quel prophète était berger avant de recevoir la révélation ?", options: ["Ibrahim", "Muhammad ﷺ", "Soulayman", "Issa"], correctIndex: 1, category: "animals" },
  // 26 [Facile] – Daoud et les oiseaux
  { question: "Quel prophète chantait les louanges d'Allah avec les oiseaux et les montagnes ?", options: ["Moussa", "Ibrahim", "Daoud", "Soulayman"], correctIndex: 2, category: "animals" },
  // 27 [Facile] – Nouh et l'arche
  { question: "Combien de chaque espèce animale Nouh a-t-il pris dans l'arche ?", options: ["Un seul", "Un couple (mâle et femelle)", "Dix", "Trois"], correctIndex: 1, category: "animals" },
  // 28 [Facile] – Serpent devant Pharaon
  { question: "Devant qui Moussa a-t-il montré le miracle du serpent ?", options: ["Son peuple", "Pharaon", "Ibrahim", "Nouh"], correctIndex: 1, category: "animals" },
  // 29 [Facile] – Oiseau en argile
  { question: "Quel prophète a créé un oiseau en argile qui a pris vie par permission d'Allah ?", options: ["Moussa", "Ibrahim", "Issa", "Soulayman"], correctIndex: 2, category: "animals" },
  // 30 [Facile] – Communauté animale
  { question: "Selon le Coran, chaque espèce animale forme une…", options: ["Famille", "Communauté (Umma)", "Tribu", "Équipe"], correctIndex: 1, category: "animals" },
  // 31 [Facile] – Éléphant et Abraha
  { question: "Qui a voulu détruire la Ka'ba avec des éléphants ?", options: ["Pharaon", "Nimrod", "Abraha", "Goliath"], correctIndex: 2, category: "animals" },
  // 32 [Facile] – Moustique
  { question: "Quel tout petit insecte Allah mentionne-t-Il comme exemple dans le Coran ?", options: ["La mouche", "Le moustique", "La fourmi", "Le papillon"], correctIndex: 1, category: "animals" },
  // 33 [Facile] – Chameau du désert
  { question: "Quel animal est surnommé « le bateau du désert » ?", options: ["Le cheval", "L'âne", "Le chameau", "Le dromadaire"], correctIndex: 2, category: "animals" },
  // 34 [Facile] – Loup mensonge
  { question: "Est-ce vrai qu'un loup a mangé Youssouf ?", options: ["Oui", "Non, c'était un mensonge de ses frères", "Le Coran ne le dit pas", "Oui, mais il a survécu"], correctIndex: 1, category: "animals" },
  // 35 [Facile] – Reine de Saba
  { question: "Quelles nouvelles la huppe a-t-elle apportées à Sulayman ?", options: ["Un trésor caché", "Le royaume de Saba et sa reine", "Une bataille", "De l'eau dans le désert"], correctIndex: 1, category: "animals" },
  // 36 [Facile] – Termites
  { question: "Quel animal a rongé le bâton de Sulayman après sa mort ?", options: ["Un ver / termite", "Un serpent", "Un rat", "Un poisson"], correctIndex: 0, category: "animals" },
  // 37 [Facile] – Sauterelles plaie
  { question: "Les sauterelles font partie des plaies envoyées sur quel peuple ?", options: ["Peuple de Nouh", "Peuple de Pharaon", "Peuple de 'Ad", "Peuple de Lut"], correctIndex: 1, category: "animals" },
  // 38 [Facile] – Grenouilles
  { question: "Les grenouilles faisaient partie des plaies envoyées contre…", options: ["Le peuple de Nouh", "L'Égypte de Pharaon", "Le peuple de 'Ad", "Le peuple de Salih"], correctIndex: 1, category: "animals" },
  // 39 [Facile] – Fourmi parole
  { question: "Que disait la fourmi à ses compagnes en voyant l'armée de Sulayman ?", options: ["Fuyez !", "Rentrez dans vos demeures !", "Sortez !", "Attaquez !"], correctIndex: 1, category: "animals" },
  // 40 [Facile] – Bergers prophètes
  { question: "Vrai ou faux : Tous les prophètes ont été bergers (selon un hadith).", options: ["Vrai", "Faux"], correctIndex: 0, category: "animals" },
  // 41 [Facile] – Vache couleur
  { question: "De quelle couleur devait être la vache demandée aux Bani Israël ?", options: ["Noire", "Blanche", "Jaune vif", "Brune"], correctIndex: 2, category: "animals" },
  // 42 [Facile] – Al-Adiyat signification
  { question: "Que signifie « Al-Adiyat » ?", options: ["Les fourmis", "Les chevaux qui galopent", "Les oiseaux", "Les chameaux"], correctIndex: 1, category: "animals" },
  // 43 [Facile] – Mouche
  { question: "Selon le Coran, les idoles ne peuvent même pas créer…", options: ["Un grain de sable", "Une mouche", "Une étoile", "Un brin d'herbe"], correctIndex: 1, category: "animals" },
  // 44 [Facile] – Araignée fragilité
  { question: "À quoi le Coran compare-t-il la toile d'araignée ?", options: ["À la force", "À la fragilité des faux protecteurs", "À la beauté", "À l'intelligence"], correctIndex: 1, category: "animals" },
  // 45 [Facile] – Poux plaie
  { question: "Les poux faisaient partie des plaies envoyées contre le peuple de…", options: ["Nouh", "Pharaon", "'Ad", "Salih"], correctIndex: 1, category: "animals" },
  // 46 [Facile] – Chien caverne posture
  { question: "Que faisait le chien des gens de la caverne ?", options: ["Il aboyait", "Il était couché, les pattes étendues à l'entrée", "Il courait", "Il chassait"], correctIndex: 1, category: "animals" },
  // 47 [Facile] – Pierres Ababil
  { question: "Les oiseaux Ababil lançaient des pierres de…", options: ["Terre cuite (Sijjil)", "Diamant", "Fer", "Marbre"], correctIndex: 0, category: "animals" },
  // 48 [Facile] – Durée caverne
  { question: "Combien de temps les gens de la caverne ont-ils dormi ?", options: ["100 ans", "200 ans", "309 ans", "500 ans"], correctIndex: 2, category: "animals" },
  // 49 [Facile] – Veau d'or fabricant
  { question: "Qui a fabriqué le veau d'or adoré par les Bani Israël ?", options: ["Moussa", "Harun", "As-Samiri", "Pharaon"], correctIndex: 2, category: "animals" },
  // 50 [Facile] – Ibrahim oiseaux
  { question: "Combien d'oiseaux Allah a-t-Il demandé à Ibrahim de prendre pour montrer la résurrection ?", options: ["2", "4", "7", "10"], correctIndex: 1, category: "animals" },
  // 51 [Moyen] – Termites leçon
  { question: "Pourquoi l'histoire du termite et du bâton de Sulayman est-elle importante ?", options: ["Pour montrer sa force", "Pour montrer que les djinns ne connaissaient pas l'invisible", "Pour punir les djinns", "Sans importance particulière"], correctIndex: 1, category: "animals" },
  // 52 [Moyen] – Sourate miel remède
  { question: "Dans quel verset le miel est-il décrit comme un remède ?", options: ["An-Nahl (16:69)", "Al-Baqara (2:26)", "Al-Kahf (18:9)", "Yasin (36:1)"], correctIndex: 0, category: "animals" },
  // 53 [Moyen] – Sourate corbeau
  { question: "Dans quelle sourate l'histoire du corbeau enterrant est-elle racontée ?", options: ["Al-Baqara", "Al-Ma'ida (5:31)", "Maryam", "Yasin"], correctIndex: 1, category: "animals" },
  // 54 [Moyen] – Sourate animaux communauté
  { question: "Dans quelle sourate dit-on que les animaux forment des communautés ?", options: ["Al-An'am (6:38)", "Al-Baqara", "Yasin", "Al-Kahf"], correctIndex: 0, category: "animals" },
  // 55 [Moyen] – Sourate grenouilles
  { question: "Les grenouilles sont mentionnées comme plaie dans quelle sourate ?", options: ["Al-A'raf (7:133)", "Al-Baqara", "An-Naml", "Yasin"], correctIndex: 0, category: "animals" },
  // 56 [Moyen] – Sourate moustique
  { question: "Le moustique est donné en exemple dans quelle sourate ?", options: ["Al-Baqara (2:26)", "An-Naml", "Al-Fil", "An-Nahl"], correctIndex: 0, category: "animals" },
  // 57 [Moyen] – Sourate mouche
  { question: "Dans quelle sourate la mouche est-elle mentionnée ?", options: ["Al-Hajj (22:73)", "Al-Baqara", "An-Naml", "Al-Fil"], correctIndex: 0, category: "animals" },
  // 58 [Moyen] – Sourate âne
  { question: "Dans quelle sourate compare-t-on celui qui porte des livres sans les comprendre à un âne ?", options: ["Al-Jumu'a (62:5)", "Al-Baqara", "An-Naml", "Al-Fil"], correctIndex: 0, category: "animals" },
  // 59 [Moyen] – Sourate huppe
  { question: "Dans quelle sourate l'histoire de la huppe est-elle racontée ?", options: ["Al-Baqara", "An-Naml (27)", "Al-Fil", "Maryam"], correctIndex: 1, category: "animals" },
  // 60 [Moyen] – Nombre de sourates animaux
  { question: "Combien de sourates du Coran portent le nom d'un animal ?", options: ["3", "5", "6", "8"], correctIndex: 2, category: "animals" },
  // 61 [Moyen] – Intrus sourate
  { question: "Laquelle de ces sourates ne porte PAS un nom d'animal ?", options: ["An-Naml", "An-Nahl", "Al-Fil", "Al-Fajr"], correctIndex: 3, category: "animals" },
  // 62 [Moyen] – Sourate Yunus poisson
  { question: "Dans quelle sourate l'histoire de Yunus et du poisson est-elle racontée en détail ?", options: ["As-Saffat (37)", "Al-Baqara", "An-Naml", "Al-Fil"], correctIndex: 0, category: "animals" },
  // 63 [Moyen] – Porc interdiction
  { question: "Dans combien de sourates l'interdiction du porc est-elle mentionnée ?", options: ["1", "2", "4", "6"], correctIndex: 2, category: "animals" },
  // 64 [Moyen] – Singes transformation
  { question: "Certaines personnes ont été transformées en singes selon le Coran. Qui étaient-elles ?", options: ["Le peuple de Nouh", "Des gens qui pêchaient le samedi (Bani Israël)", "Le peuple de Lut", "Le peuple de 'Ad"], correctIndex: 1, category: "animals" },
  // 65 [Moyen] – Chameau réflexion
  { question: "Allah invite l'homme à réfléchir sur la création du chameau dans quelle sourate ?", options: ["Al-Ghashiyah (88:17)", "Al-Baqara", "Yasin", "Al-Kahf"], correctIndex: 0, category: "animals" },
  // 66 [Moyen] – Vache destinataires
  { question: "À qui Allah a-t-Il demandé de sacrifier la vache dans sourate Al-Baqara ?", options: ["Au Prophète ﷺ", "Aux Bani Israël", "À Ibrahim", "À Nouh"], correctIndex: 1, category: "animals" },
  // 67 [Moyen] – Combien animaux Coran
  { question: "Vrai ou faux : Le Coran mentionne plus de 30 animaux différents.", options: ["Vrai", "Faux"], correctIndex: 0, category: "animals" },
  // 68 [Facile] – Soulayman commande animaux
  { question: "Quel prophète commandait les oiseaux, les djinns et le vent ?", options: ["Daoud", "Moussa", "Soulayman", "Issa"], correctIndex: 2, category: "animals" },
  // 69 [Facile] – Éléphant destruction
  { question: "Qu'est-ce qu'Allah a envoyé contre l'armée d'Abraha et ses éléphants ?", options: ["Un déluge", "Des oiseaux lançant des pierres", "Le feu", "Un tremblement de terre"], correctIndex: 1, category: "animals" },
  // 70 [Facile] – Abeille construction
  { question: "Quel insecte le Coran décrit comme construisant avec grande organisation ?", options: ["Le papillon", "L'abeille", "La mouche", "La sauterelle"], correctIndex: 1, category: "animals" },
  // 71 [Facile] – Âne comparaison
  { question: "À quel animal le Coran compare-t-il celui qui porte des livres sans comprendre ?", options: ["Un chameau", "Un âne", "Un chien", "Un poisson"], correctIndex: 1, category: "animals" },
  // 72 [Facile] – Corbeau enseignement
  { question: "Qu'est-ce que le corbeau a enseigné à l'homme ?", options: ["À chasser", "À enterrer les morts", "À nager", "À construire"], correctIndex: 1, category: "animals" },
  // 73 [Facile] – Abeille demeure
  { question: "Où Allah ordonne-t-Il à l'abeille de s'installer selon le Coran ?", options: ["Dans les arbres et les montagnes", "Seulement dans les jardins", "Dans les maisons des gens", "Au bord des rivières"], correctIndex: 0, category: "animals" },
  // 74 [Facile] – Chamelle propriété
  { question: "La chamelle de Salih appartenait à…", options: ["Salih lui-même", "Allah (c'était un miracle)", "Le peuple de Thamoud", "Un marchand"], correctIndex: 1, category: "animals" },
  // 75 [Facile] – Oiseau type Issa
  { question: "Quel matériau Issa a-t-il utilisé pour former un oiseau ?", options: ["Du bois", "De l'argile", "Du métal", "De la pierre"], correctIndex: 1, category: "animals" },
  // 76 [Moyen] – Sang plaie
  { question: "Parmi les plaies d'Égypte mentionnées dans le Coran, laquelle n'est PAS un animal ?", options: ["Les sauterelles", "Les grenouilles", "Le sang", "Les poux"], correctIndex: 2, category: "animals" },
  // 77 [Facile] – Sulayman fourmi entend
  { question: "Quel prophète a entendu la fourmi parler ?", options: ["Moussa", "Ibrahim", "Soulayman", "Daoud"], correctIndex: 2, category: "animals" },
  // 78 [Facile] – Arche contenu
  { question: "Que transportait l'arche de Nouh ?", options: ["Seulement des humains", "Des animaux et des croyants", "De l'or et des trésors", "Des livres"], correctIndex: 1, category: "animals" },
  // 79 [Moyen] – Chameau patience
  { question: "Quel animal est traditionnellement associé à la patience dans la culture coranique ?", options: ["Le chameau", "Le chien", "Le cheval", "Le lion"], correctIndex: 0, category: "animals" },
  // 80 [Moyen] – Nom Al-Baqara
  { question: "Que signifie « Al-Baqara » ?", options: ["Le chameau", "La vache", "Le taureau", "Le bélier"], correctIndex: 1, category: "animals" },
  // 81 [Moyen] – Nom An-Nahl
  { question: "Que signifie « An-Nahl » ?", options: ["La fourmi", "L'araignée", "L'abeille", "Le moustique"], correctIndex: 2, category: "animals" },
  // 82 [Moyen] – Nom An-Naml
  { question: "Que signifie « An-Naml » ?", options: ["L'abeille", "La fourmi", "L'araignée", "Le serpent"], correctIndex: 1, category: "animals" },
  // 83 [Moyen] – Nom Al-Ankabut
  { question: "Que signifie « Al-Ankabut » ?", options: ["Le serpent", "Le scorpion", "L'araignée", "Le moustique"], correctIndex: 2, category: "animals" },
  // 84 [Moyen] – Nom Al-Fil
  { question: "Que signifie « Al-Fil » ?", options: ["Le lion", "L'éléphant", "Le chameau", "Le cheval"], correctIndex: 1, category: "animals" },
  // 85 [Facile] – Quizz identification
  { question: "Lequel de ces animaux n'est PAS mentionné dans le Coran ?", options: ["Le chameau", "La fourmi", "Le chat", "Le corbeau"], correctIndex: 2, category: "animals" },
  // 86 [Facile] – Quizz identification 2
  { question: "Lequel de ces animaux EST mentionné dans le Coran ?", options: ["Le dauphin", "Le tigre", "Le chien", "Le panda"], correctIndex: 2, category: "animals" },
  // 87 [Facile] – Mouche impuissance
  { question: "Que dit le Coran à propos de la mouche et des idoles ?", options: ["La mouche est sacrée", "Les idoles ne peuvent même pas créer une mouche", "La mouche est interdite", "La mouche porte bonheur"], correctIndex: 1, category: "animals" },
  // 88 [Facile] – Miel boisson
  { question: "De quel couleur est la boisson qui sort du ventre de l'abeille selon le Coran ?", options: ["Blanche", "De couleurs variées", "Jaune seulement", "Transparente"], correctIndex: 1, category: "animals" },
  // 89 [Moyen] – Nouh fils noyé
  { question: "Quel animal n'a PAS été sauvé dans l'arche de Nouh ?", options: ["Les animaux dans l'arche", "Tous ont été sauvés", "Les animaux marins n'avaient pas besoin d'arche", "Les oiseaux du ciel"], correctIndex: 2, category: "animals" },
  // 90 [Moyen] – Sacrifice Ibrahim lieu
  { question: "La fête du sacrifice (Aïd al-Adha) commémore le sacrifice de…", options: ["Une vache par Moussa", "Un bélier à la place d'Ismaïl", "Un chameau par Nouh", "Un agneau par Daoud"], correctIndex: 1, category: "animals" },
  // 91 [Facile] – Animaux licites
  { question: "Quel type d'animal est halal (licite) à manger selon le Coran ?", options: ["Le porc", "Le chameau", "Le singe", "L'âne domestique"], correctIndex: 1, category: "animals" },
  // 92 [Moyen] – Sourate Yunus nom
  { question: "La sourate Yunus (Jonas) tire son nom du prophète associé à quel animal ?", options: ["Le chameau", "Le poisson / baleine", "Le serpent", "L'oiseau"], correctIndex: 1, category: "animals" },
  // 93 [Facile] – Cheval guerre
  { question: "Les chevaux mentionnés dans sourate Al-Adiyat galopent au…", options: ["Lever du soleil", "Combat / bataille", "Marché", "Pâturage"], correctIndex: 1, category: "animals" },
  // 94 [Moyen] – Kahf sourate numéro
  { question: "Dans quelle sourate se trouve l'histoire du chien des gens de la caverne ?", options: ["Al-Baqara", "Al-Kahf (18)", "Maryam", "Yasin"], correctIndex: 1, category: "animals" },
  // 95 [Facile] – Moussa miracle
  { question: "Quel miracle de Moussa impliquait un animal ?", options: ["Séparer la mer", "Son bâton se transformant en serpent", "Faire jaillir l'eau", "Guérir les malades"], correctIndex: 1, category: "animals" },
  // 96 [Moyen] – Nombre plaies animales
  { question: "Combien de plaies animales sont mentionnées dans le Coran contre Pharaon ?", options: ["2", "3 (sauterelles, poux, grenouilles)", "5", "7"], correctIndex: 1, category: "animals" },
  // 97 [Facile] – Chamelle eau
  { question: "La chamelle de Salih avait un jour réservé pour boire l'eau. Vrai ou faux ?", options: ["Vrai", "Faux"], correctIndex: 0, category: "animals" },
  // 98 [Moyen] – Sulayman armée
  { question: "L'armée de Sulayman comprenait des hommes, des djinns et…", options: ["Des chevaux", "Des oiseaux", "Des chameaux", "Des lions"], correctIndex: 1, category: "animals" },
  // 99 [Facile] – Leçon animaux Coran
  { question: "Pourquoi Allah mentionne-t-Il les animaux dans le Coran ?", options: ["Pour divertir", "Pour inviter à réfléchir sur Ses signes", "Sans raison particulière", "Pour faire peur"], correctIndex: 1, category: "animals" },
  // 100 [Moyen] – Sourates animaux liste
  { question: "Laquelle de ces sourates porte le nom d'un animal ?", options: ["Al-Fatiha", "Al-Ikhlas", "An-Nahl", "Al-Falaq"], correctIndex: 2, category: "animals" },
];
