export interface Ayah {
  number: number;
  arabic: string;
  transliteration: string;
  translation: string;
}

export interface Surah {
  number: number;
  name: string;
  nameArabic: string;
  frenchName: string;
  versesCount: number;
  difficulty: "easy" | "medium" | "hard";
  ayahs: Ayah[];
}

export const surahs: Surah[] = [
  {
    number: 1,
    name: "Al-Fatiha",
    nameArabic: "الفاتحة",
    frenchName: "L'Ouverture",
    versesCount: 7,
    difficulty: "easy",
    ayahs: [
      { number: 1, arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", transliteration: "Bismi llāhi r-raḥmāni r-raḥīm", translation: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux" },
      { number: 2, arabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ", transliteration: "Al-ḥamdu lillāhi rabbi l-ʿālamīn", translation: "Louange à Allah, Seigneur de l'univers" },
      { number: 3, arabic: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", transliteration: "Ar-raḥmāni r-raḥīm", translation: "Le Tout Miséricordieux, le Très Miséricordieux" },
      { number: 4, arabic: "مَٰلِكِ يَوْمِ ٱلدِّينِ", transliteration: "Māliki yawmi d-dīn", translation: "Maître du Jour de la rétribution" },
      { number: 5, arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", transliteration: "Iyyāka naʿbudu wa iyyāka nastaʿīn", translation: "C'est Toi que nous adorons, et c'est Toi dont nous implorons secours" },
      { number: 6, arabic: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", transliteration: "Ihdinā ṣ-ṣirāṭa l-mustaqīm", translation: "Guide-nous dans le droit chemin" },
      { number: 7, arabic: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", transliteration: "Ṣirāṭa lladhīna anʿamta ʿalayhim ghayri l-maghḍūbi ʿalayhim wa lā ḍ-ḍāllīn", translation: "Le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés" },
    ],
  },
  {
    number: 103,
    name: "Al-Asr",
    nameArabic: "العصر",
    frenchName: "Le Temps",
    versesCount: 3,
    difficulty: "easy",
    ayahs: [
      { number: 1, arabic: "وَٱلْعَصْرِ", transliteration: "Wal-ʿaṣr", translation: "Par le Temps !" },
      { number: 2, arabic: "إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ", transliteration: "Inna l-insāna lafī khusr", translation: "L'homme est certes en perdition" },
      { number: 3, arabic: "إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ", transliteration: "Illā lladhīna āmanū wa ʿamilū ṣ-ṣāliḥāti wa tawāṣaw bil-ḥaqqi wa tawāṣaw biṣ-ṣabr", translation: "Sauf ceux qui croient, font le bien, s'enjoignent la vérité et s'enjoignent la patience" },
    ],
  },
  {
    number: 108,
    name: "Al-Kawthar",
    nameArabic: "الكوثر",
    frenchName: "L'Abondance",
    versesCount: 3,
    difficulty: "easy",
    ayahs: [
      { number: 1, arabic: "إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ", transliteration: "Innā aʿṭaynāka l-kawthar", translation: "Nous t'avons certes accordé l'Abondance" },
      { number: 2, arabic: "فَصَلِّ لِرَبِّكَ وَٱنْحَرْ", transliteration: "Faṣalli li rabbika wanḥar", translation: "Accomplis la Ṣalāt pour ton Seigneur et sacrifie" },
      { number: 3, arabic: "إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ", transliteration: "Inna shāniʾaka huwa l-abtar", translation: "Celui qui te hait sera lui-même sans postérité" },
    ],
  },
  {
    number: 110,
    name: "An-Nasr",
    nameArabic: "النصر",
    frenchName: "Le Secours",
    versesCount: 3,
    difficulty: "easy",
    ayahs: [
      { number: 1, arabic: "إِذَا جَآءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ", transliteration: "Idhā jāʾa naṣru llāhi wal-fatḥ", translation: "Lorsque vient le secours d'Allah ainsi que la victoire" },
      { number: 2, arabic: "وَرَأَيْتَ ٱلنَّاسَ يَدْخُلُونَ فِى دِينِ ٱللَّهِ أَفْوَاجًا", transliteration: "Wa raʾayta n-nāsa yadkhulūna fī dīni llāhi afwājā", translation: "Et que tu vois les gens entrer en foule dans la religion d'Allah" },
      { number: 3, arabic: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَٱسْتَغْفِرْهُ إِنَّهُۥ كَانَ تَوَّابًا", transliteration: "Fasabbiḥ biḥamdi rabbika wastaghfirhu innahu kāna tawwābā", translation: "Alors glorifie ton Seigneur et implore Son pardon. Car c'est Lui le grand Accueillant au repentir" },
    ],
  },
  {
    number: 112,
    name: "Al-Ikhlas",
    nameArabic: "الإخلاص",
    frenchName: "Le Monothéisme Pur",
    versesCount: 4,
    difficulty: "easy",
    ayahs: [
      { number: 1, arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", transliteration: "Qul huwa llāhu aḥad", translation: "Dis : Il est Allah, Unique" },
      { number: 2, arabic: "ٱللَّهُ ٱلصَّمَدُ", transliteration: "Allāhu ṣ-ṣamad", translation: "Allah, Le Seul à être imploré" },
      { number: 3, arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", transliteration: "Lam yalid wa lam yūlad", translation: "Il n'a jamais engendré, n'a pas été engendré" },
      { number: 4, arabic: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ", transliteration: "Wa lam yakun lahu kufuwan aḥad", translation: "Et nul n'est égal à Lui" },
    ],
  },
  {
    number: 113,
    name: "Al-Falaq",
    nameArabic: "الفلق",
    frenchName: "L'Aube Naissante",
    versesCount: 5,
    difficulty: "easy",
    ayahs: [
      { number: 1, arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ", transliteration: "Qul aʿūdhu bi rabbi l-falaq", translation: "Dis : Je cherche protection auprès du Seigneur de l'aube naissante" },
      { number: 2, arabic: "مِن شَرِّ مَا خَلَقَ", transliteration: "Min sharri mā khalaq", translation: "Contre le mal des êtres qu'Il a créés" },
      { number: 3, arabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", transliteration: "Wa min sharri ghāsiqin idhā waqab", translation: "Contre le mal de l'obscurité quand elle s'approfondit" },
      { number: 4, arabic: "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ", transliteration: "Wa min sharri n-naffāthāti fī l-ʿuqad", translation: "Contre le mal de celles qui soufflent sur les nœuds" },
      { number: 5, arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", transliteration: "Wa min sharri ḥāsidin idhā ḥasad", translation: "Et contre le mal de l'envieux quand il envie" },
    ],
  },
  {
    number: 114,
    name: "An-Nas",
    nameArabic: "الناس",
    frenchName: "Les Hommes",
    versesCount: 6,
    difficulty: "easy",
    ayahs: [
      { number: 1, arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", transliteration: "Qul aʿūdhu bi rabbi n-nās", translation: "Dis : Je cherche protection auprès du Seigneur des hommes" },
      { number: 2, arabic: "مَلِكِ ٱلنَّاسِ", transliteration: "Maliki n-nās", translation: "Le Souverain des hommes" },
      { number: 3, arabic: "إِلَٰهِ ٱلنَّاسِ", transliteration: "Ilāhi n-nās", translation: "Le Dieu des hommes" },
      { number: 4, arabic: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ", transliteration: "Min sharri l-waswāsi l-khannās", translation: "Contre le mal du mauvais conseiller, furtif" },
      { number: 5, arabic: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ", transliteration: "Alladhī yuwaswisu fī ṣudūri n-nās", translation: "Qui souffle le mal dans les poitrines des hommes" },
      { number: 6, arabic: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ", transliteration: "Mina l-jinnati wa n-nās", translation: "Qu'il soit parmi les djinns ou parmi les hommes" },
    ],
  },
  {
    number: 105,
    name: "Al-Fil",
    nameArabic: "الفيل",
    frenchName: "L'Éléphant",
    versesCount: 5,
    difficulty: "easy",
    ayahs: [
      { number: 1, arabic: "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَٰبِ ٱلْفِيلِ", transliteration: "Alam tara kayfa faʿala rabbuka bi aṣḥābi l-fīl", translation: "N'as-tu pas vu comment ton Seigneur a agi envers les gens de l'Éléphant ?" },
      { number: 2, arabic: "أَلَمْ يَجْعَلْ كَيْدَهُمْ فِى تَضْلِيلٍ", transliteration: "Alam yajʿal kaydahum fī taḍlīl", translation: "N'a-t-Il pas rendu leur ruse complètement vaine ?" },
      { number: 3, arabic: "وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ", transliteration: "Wa arsala ʿalayhim ṭayran abābīl", translation: "Et envoyé sur eux des oiseaux par volées" },
      { number: 4, arabic: "تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ", transliteration: "Tarmīhim biḥijāratin min sijjīl", translation: "Qui leur lançaient des pierres d'argile" },
      { number: 5, arabic: "فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍۭ", transliteration: "Fajaʿalahum kaʿaṣfin maʾkūl", translation: "Et Il les a rendus semblables à une paille mâchée" },
    ],
  },
  {
    number: 106,
    name: "Quraysh",
    nameArabic: "قريش",
    frenchName: "Quraysh",
    versesCount: 4,
    difficulty: "easy",
    ayahs: [
      { number: 1, arabic: "لِإِيلَٰفِ قُرَيْشٍ", transliteration: "Li īlāfi quraysh", translation: "À cause du pacte des Quraysh" },
      { number: 2, arabic: "إِۦلَٰفِهِمْ رِحْلَةَ ٱلشِّتَآءِ وَٱلصَّيْفِ", transliteration: "Īlāfihim riḥlata sh-shitāʾi waṣ-ṣayf", translation: "De leur pacte pour les voyages d'hiver et d'été" },
      { number: 3, arabic: "فَلْيَعْبُدُوا۟ رَبَّ هَٰذَا ٱلْبَيْتِ", transliteration: "Falyaʿbudū rabba hādhā l-bayt", translation: "Qu'ils adorent donc le Seigneur de cette Maison" },
      { number: 4, arabic: "ٱلَّذِىٓ أَطْعَمَهُم مِّن جُوعٍ وَءَامَنَهُم مِّنْ خَوْفٍۭ", transliteration: "Alladhī aṭʿamahum min jūʿin wa āmanahum min khawf", translation: "Qui les a nourris contre la faim et rassurés de la crainte" },
    ],
  },
  {
    number: 111,
    name: "Al-Masad",
    nameArabic: "المسد",
    frenchName: "Les Fibres",
    versesCount: 5,
    difficulty: "easy",
    ayahs: [
      { number: 1, arabic: "تَبَّتْ يَدَآ أَبِى لَهَبٍ وَتَبَّ", transliteration: "Tabbat yadā abī lahabin wa tabb", translation: "Que périssent les deux mains d'Abū Lahab et que lui-même périsse" },
      { number: 2, arabic: "مَآ أَغْنَىٰ عَنْهُ مَالُهُۥ وَمَا كَسَبَ", transliteration: "Mā aghnā ʿanhu māluhu wa mā kasab", translation: "Sa fortune ne lui sert à rien, ni ce qu'il a acquis" },
      { number: 3, arabic: "سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ", transliteration: "Sayaṣlā nāran dhāta lahab", translation: "Il sera brûlé dans un Feu plein de flammes" },
      { number: 4, arabic: "وَٱمْرَأَتُهُۥ حَمَّالَةَ ٱلْحَطَبِ", transliteration: "Wamraʾatuhu ḥammālata l-ḥaṭab", translation: "De même sa femme, la porteuse de bois" },
      { number: 5, arabic: "فِى جِيدِهَا حَبْلٌ مِّن مَّسَدٍۭ", transliteration: "Fī jīdihā ḥablun min masad", translation: "À son cou, une corde de fibres" },
    ],
  },
];

export const getSurahsByDifficulty = (difficulty: "easy" | "medium" | "hard") =>
  surahs.filter((s) => s.difficulty === difficulty);

export const getSurahByNumber = (num: number) =>
  surahs.find((s) => s.number === num);
