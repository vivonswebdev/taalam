export interface IslamicPersonality {
  id: string;
  name: string;
  nameAr: string;
  emoji: string;
  category: 'sahabi' | 'prophet' | 'scholar' | 'caliph' | 'companion_female' | 'imam';
  era: 'prophetic' | 'rashidun' | 'umayyad' | 'abbasid' | 'modern';
  attributes: {
    isProphet: boolean;
    isSahabi: boolean;
    isWoman: boolean;
    isArabic: boolean;
    isCaliph: boolean;
    isImam: boolean;
    isScholar: boolean;
    isMartyr: boolean;
    isFromMecca: boolean;
    isFromMedina: boolean;
    livedBeforeIslam: boolean;
    livedWithProphet: boolean;
    livedAfter600AD: boolean;
    livedAfter800AD: boolean;
    knownForBravery: boolean;
    knownForScience: boolean;
    knownForGenerosity: boolean;
    knownForHafiz: boolean;
    knownForJihad: boolean;
    knownForWisdom: boolean;
    knownForPoetry: boolean;
    relatedToProphet: boolean;
    marriedToProphet: boolean;
    fatherOfProphet: boolean;
    firstMuslim: boolean;
    migratedToMedina: boolean;
    participatedInBadr: boolean;
    participatedInUhud: boolean;
    builtMosque: boolean;
    writtenBook: boolean;
  };
  hint: string;
  funFact: string;
}

export const ISLAMIC_PERSONALITIES: IslamicPersonality[] = [
  // ═══════ PROPHÈTES ═══════
  {
    id: 'muhammad',
    name: 'Le Prophète Muhammad ﷺ',
    nameAr: 'محمد ﷺ',
    emoji: '🌙',
    category: 'prophet',
    era: 'prophetic',
    attributes: {
      isProphet: true, isSahabi: false, isWoman: false, isArabic: true,
      isCaliph: false, isImam: true, isScholar: true, isMartyr: false,
      isFromMecca: true, isFromMedina: false, livedBeforeIslam: true,
      livedWithProphet: true, livedAfter600AD: true, livedAfter800AD: false,
      knownForBravery: true, knownForScience: false, knownForGenerosity: true,
      knownForHafiz: true, knownForJihad: true, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: true, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: true, migratedToMedina: true,
      participatedInBadr: true, participatedInUhud: true,
      builtMosque: true, writtenBook: false,
    },
    hint: "Je suis le sceau des prophètes, né à La Mecque",
    funFact: "Il était orphelin de père avant sa naissance et de mère à 6 ans"
  },
  {
    id: 'ibrahim',
    name: 'Ibrahim (Abraham) ﷺ',
    nameAr: 'إبراهيم ﷺ',
    emoji: '🔥',
    category: 'prophet',
    era: 'prophetic',
    attributes: {
      isProphet: true, isSahabi: false, isWoman: false, isArabic: false,
      isCaliph: false, isImam: true, isScholar: false, isMartyr: false,
      isFromMecca: false, isFromMedina: false, livedBeforeIslam: true,
      livedWithProphet: false, livedAfter600AD: false, livedAfter800AD: false,
      knownForBravery: true, knownForScience: false, knownForGenerosity: true,
      knownForHafiz: false, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: true, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: true, writtenBook: false,
    },
    hint: "J'ai construit la Kaaba avec mon fils Ismail",
    funFact: "Il a été jeté dans le feu par Nemrod mais Allah l'a rendu froid"
  },
  {
    id: 'musa',
    name: 'Musa (Moïse) ﷺ',
    nameAr: 'موسى ﷺ',
    emoji: '🪄',
    category: 'prophet',
    era: 'prophetic',
    attributes: {
      isProphet: true, isSahabi: false, isWoman: false, isArabic: false,
      isCaliph: false, isImam: true, isScholar: false, isMartyr: false,
      isFromMecca: false, isFromMedina: false, livedBeforeIslam: true,
      livedWithProphet: false, livedAfter600AD: false, livedAfter800AD: false,
      knownForBravery: true, knownForScience: false, knownForGenerosity: false,
      knownForHafiz: false, knownForJihad: true, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: false,
    },
    hint: "J'ai séparé la mer avec mon bâton",
    funFact: "Il est le prophète le plus mentionné dans le Coran (136 fois)"
  },
  {
    id: 'isa',
    name: 'Issa (Jésus) ﷺ',
    nameAr: 'عيسى ﷺ',
    emoji: '✨',
    category: 'prophet',
    era: 'prophetic',
    attributes: {
      isProphet: true, isSahabi: false, isWoman: false, isArabic: false,
      isCaliph: false, isImam: true, isScholar: false, isMartyr: false,
      isFromMecca: false, isFromMedina: false, livedBeforeIslam: true,
      livedWithProphet: false, livedAfter600AD: false, livedAfter800AD: false,
      knownForBravery: false, knownForScience: false, knownForGenerosity: true,
      knownForHafiz: false, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: false,
    },
    hint: "Je suis né d'une vierge et je guérissais les malades",
    funFact: "Il parlait encore bébé dans son berceau pour défendre sa mère"
  },
  {
    id: 'yusuf',
    name: 'Yusuf (Joseph) ﷺ',
    nameAr: 'يوسف ﷺ',
    emoji: '👑',
    category: 'prophet',
    era: 'prophetic',
    attributes: {
      isProphet: true, isSahabi: false, isWoman: false, isArabic: false,
      isCaliph: false, isImam: false, isScholar: false, isMartyr: false,
      isFromMecca: false, isFromMedina: false, livedBeforeIslam: true,
      livedWithProphet: false, livedAfter600AD: false, livedAfter800AD: false,
      knownForBravery: false, knownForScience: false, knownForGenerosity: true,
      knownForHafiz: false, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: false,
    },
    hint: "Mes frères m'ont jeté dans un puits mais je suis devenu ministre d'Égypte",
    funFact: "Il est décrit comme ayant la moitié de la beauté de toute l'humanité"
  },
  // ═══════ CALIFES RASHIDUN ═══════
  {
    id: 'abu-bakr',
    name: 'Abou Bakr As-Siddiq رضي الله عنه',
    nameAr: 'أبو بكر الصديق',
    emoji: '🌟',
    category: 'caliph',
    era: 'rashidun',
    attributes: {
      isProphet: false, isSahabi: true, isWoman: false, isArabic: true,
      isCaliph: true, isImam: false, isScholar: false, isMartyr: false,
      isFromMecca: true, isFromMedina: false, livedBeforeIslam: true,
      livedWithProphet: true, livedAfter600AD: true, livedAfter800AD: false,
      knownForBravery: true, knownForScience: false, knownForGenerosity: true,
      knownForHafiz: false, knownForJihad: true, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: true, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: true, migratedToMedina: true,
      participatedInBadr: true, participatedInUhud: true,
      builtMosque: false, writtenBook: false,
    },
    hint: "Je suis le premier calife et le meilleur ami du Prophète ﷺ",
    funFact: "Il a dépensé toute sa fortune pour l'Islam dès le début"
  },
  {
    id: 'umar',
    name: 'Omar ibn al-Khattab رضي الله عنه',
    nameAr: 'عمر بن الخطاب',
    emoji: '⚔️',
    category: 'caliph',
    era: 'rashidun',
    attributes: {
      isProphet: false, isSahabi: true, isWoman: false, isArabic: true,
      isCaliph: true, isImam: false, isScholar: true, isMartyr: true,
      isFromMecca: true, isFromMedina: false, livedBeforeIslam: true,
      livedWithProphet: true, livedAfter600AD: true, livedAfter800AD: false,
      knownForBravery: true, knownForScience: false, knownForGenerosity: true,
      knownForHafiz: false, knownForJihad: true, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: true,
      participatedInBadr: true, participatedInUhud: true,
      builtMosque: false, writtenBook: false,
    },
    hint: "Je suis le 2ème calife, connu pour ma force et ma justice",
    funFact: "Quand il a embrassé l'Islam, le Prophète ﷺ a dit : 'Allah est Grand !'"
  },
  {
    id: 'uthman',
    name: 'Uthman ibn Affan رضي الله عنه',
    nameAr: 'عثمان بن عفان',
    emoji: '📖',
    category: 'caliph',
    era: 'rashidun',
    attributes: {
      isProphet: false, isSahabi: true, isWoman: false, isArabic: true,
      isCaliph: true, isImam: false, isScholar: false, isMartyr: true,
      isFromMecca: true, isFromMedina: false, livedBeforeIslam: true,
      livedWithProphet: true, livedAfter600AD: true, livedAfter800AD: false,
      knownForBravery: false, knownForScience: false, knownForGenerosity: true,
      knownForHafiz: true, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: true, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: true,
      participatedInBadr: false, participatedInUhud: true,
      builtMosque: true, writtenBook: false,
    },
    hint: "J'ai compilé le Coran et épousé deux filles du Prophète ﷺ",
    funFact: "Il était si pudique que même les anges avaient honte devant lui"
  },
  {
    id: 'ali',
    name: 'Ali ibn Abi Talib رضي الله عنه',
    nameAr: 'علي بن أبي طالب',
    emoji: '🗡️',
    category: 'caliph',
    era: 'rashidun',
    attributes: {
      isProphet: false, isSahabi: true, isWoman: false, isArabic: true,
      isCaliph: true, isImam: true, isScholar: true, isMartyr: true,
      isFromMecca: true, isFromMedina: false, livedBeforeIslam: false,
      livedWithProphet: true, livedAfter600AD: true, livedAfter800AD: false,
      knownForBravery: true, knownForScience: false, knownForGenerosity: true,
      knownForHafiz: true, knownForJihad: true, knownForWisdom: true,
      knownForPoetry: true, relatedToProphet: true, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: true, migratedToMedina: true,
      participatedInBadr: true, participatedInUhud: true,
      builtMosque: false, writtenBook: false,
    },
    hint: "Je suis le cousin et gendre du Prophète ﷺ, 4ème calife",
    funFact: "Il a dormi dans le lit du Prophète ﷺ la nuit de l'hégire pour le protéger"
  },
  // ═══════ SAHABA CÉLÈBRES ═══════
  {
    id: 'khalid',
    name: 'Khalid ibn al-Walid رضي الله عنه',
    nameAr: 'خالد بن الوليد',
    emoji: '🏇',
    category: 'sahabi',
    era: 'prophetic',
    attributes: {
      isProphet: false, isSahabi: true, isWoman: false, isArabic: true,
      isCaliph: false, isImam: false, isScholar: false, isMartyr: false,
      isFromMecca: true, isFromMedina: false, livedBeforeIslam: true,
      livedWithProphet: true, livedAfter600AD: true, livedAfter800AD: false,
      knownForBravery: true, knownForScience: false, knownForGenerosity: false,
      knownForHafiz: false, knownForJihad: true, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: false,
    },
    hint: "Je suis 'l'Épée d'Allah', invaincu en 100+ batailles",
    funFact: "Il n'a jamais perdu une seule bataille de toute sa vie"
  },
  {
    id: 'bilal',
    name: 'Bilal ibn Rabah رضي الله عنه',
    nameAr: 'بلال بن رباح',
    emoji: '📯',
    category: 'sahabi',
    era: 'prophetic',
    attributes: {
      isProphet: false, isSahabi: true, isWoman: false, isArabic: false,
      isCaliph: false, isImam: false, isScholar: false, isMartyr: false,
      isFromMecca: true, isFromMedina: false, livedBeforeIslam: true,
      livedWithProphet: true, livedAfter600AD: true, livedAfter800AD: false,
      knownForBravery: true, knownForScience: false, knownForGenerosity: false,
      knownForHafiz: false, knownForJihad: false, knownForWisdom: false,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: true, migratedToMedina: true,
      participatedInBadr: true, participatedInUhud: true,
      builtMosque: false, writtenBook: false,
    },
    hint: "Je suis le premier muezzin de l'Islam, ancien esclave abyssinien",
    funFact: "Il répétait 'Ahad, Ahad' (Un seul Dieu) pendant qu'on le torturait"
  },
  {
    id: 'salman-farisi',
    name: 'Salman Al-Farisi رضي الله عنه',
    nameAr: 'سلمان الفارسي',
    emoji: '🏰',
    category: 'sahabi',
    era: 'prophetic',
    attributes: {
      isProphet: false, isSahabi: true, isWoman: false, isArabic: false,
      isCaliph: false, isImam: false, isScholar: true, isMartyr: false,
      isFromMecca: false, isFromMedina: false, livedBeforeIslam: true,
      livedWithProphet: true, livedAfter600AD: true, livedAfter800AD: false,
      knownForBravery: true, knownForScience: true, knownForGenerosity: false,
      knownForHafiz: false, knownForJihad: true, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: false,
    },
    hint: "Je suis Persan, j'ai suggéré de creuser le fossé à Médine",
    funFact: "Le Prophète ﷺ a dit : 'Salman fait partie de nous, Ahl al-Bayt'"
  },
  {
    id: 'hamza',
    name: 'Hamza ibn Abd al-Muttalib رضي الله عنه',
    nameAr: 'حمزة بن عبد المطلب',
    emoji: '🦁',
    category: 'sahabi',
    era: 'prophetic',
    attributes: {
      isProphet: false, isSahabi: true, isWoman: false, isArabic: true,
      isCaliph: false, isImam: false, isScholar: false, isMartyr: true,
      isFromMecca: true, isFromMedina: false, livedBeforeIslam: true,
      livedWithProphet: true, livedAfter600AD: true, livedAfter800AD: false,
      knownForBravery: true, knownForScience: false, knownForGenerosity: false,
      knownForHafiz: false, knownForJihad: true, knownForWisdom: false,
      knownForPoetry: false, relatedToProphet: true, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: true,
      participatedInBadr: true, participatedInUhud: true,
      builtMosque: false, writtenBook: false,
    },
    hint: "Je suis 'le Lion d'Allah', oncle du Prophète ﷺ, martyr d'Uhud",
    funFact: "Le Prophète ﷺ pleurait tellement à sa mort qu'il n'avait plus de larmes"
  },
  {
    id: 'abu-dharr',
    name: 'Abu Dharr Al-Ghifari رضي الله عنه',
    nameAr: 'أبو ذر الغفاري',
    emoji: '💎',
    category: 'sahabi',
    era: 'prophetic',
    attributes: {
      isProphet: false, isSahabi: true, isWoman: false, isArabic: true,
      isCaliph: false, isImam: false, isScholar: true, isMartyr: false,
      isFromMecca: false, isFromMedina: false, livedBeforeIslam: true,
      livedWithProphet: true, livedAfter600AD: true, livedAfter800AD: false,
      knownForBravery: true, knownForScience: false, knownForGenerosity: true,
      knownForHafiz: false, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: true, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: false,
    },
    hint: "Je suis l'un des 5 premiers musulmans, connu pour mon ascétisme",
    funFact: "Il disait la vérité même si elle déplaisait aux puissants"
  },
  // ═══════ FEMMES SAHABA ═══════
  {
    id: 'khadija',
    name: 'Khadija bint Khuwaylid رضي الله عنها',
    nameAr: 'خديجة بنت خويلد',
    emoji: '💐',
    category: 'companion_female',
    era: 'prophetic',
    attributes: {
      isProphet: false, isSahabi: true, isWoman: true, isArabic: true,
      isCaliph: false, isImam: false, isScholar: false, isMartyr: false,
      isFromMecca: true, isFromMedina: false, livedBeforeIslam: true,
      livedWithProphet: true, livedAfter600AD: true, livedAfter800AD: false,
      knownForBravery: false, knownForScience: false, knownForGenerosity: true,
      knownForHafiz: false, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: true, marriedToProphet: true,
      fatherOfProphet: false, firstMuslim: true, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: false,
    },
    hint: "Je suis la première épouse et première musulmane, mère des croyants",
    funFact: "Allah lui a envoyé ses salutations via Jibrail ﷺ directement"
  },
  {
    id: 'aisha',
    name: 'Aïcha bint Abi Bakr رضي الله عنها',
    nameAr: 'عائشة بنت أبي بكر',
    emoji: '📚',
    category: 'companion_female',
    era: 'prophetic',
    attributes: {
      isProphet: false, isSahabi: true, isWoman: true, isArabic: true,
      isCaliph: false, isImam: false, isScholar: true, isMartyr: false,
      isFromMecca: true, isFromMedina: false, livedBeforeIslam: false,
      livedWithProphet: true, livedAfter600AD: true, livedAfter800AD: false,
      knownForBravery: false, knownForScience: false, knownForGenerosity: true,
      knownForHafiz: true, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: true, relatedToProphet: false, marriedToProphet: true,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: true,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: false,
    },
    hint: "Je suis épouse du Prophète ﷺ et grande savante de l'Islam",
    funFact: "Elle a transmis 2210 hadiths, plus que la plupart des Sahaba hommes"
  },
  {
    id: 'fatima',
    name: 'Fatima Az-Zahra رضي الله عنها',
    nameAr: 'فاطمة الزهراء',
    emoji: '🌹',
    category: 'companion_female',
    era: 'prophetic',
    attributes: {
      isProphet: false, isSahabi: true, isWoman: true, isArabic: true,
      isCaliph: false, isImam: false, isScholar: true, isMartyr: false,
      isFromMecca: true, isFromMedina: false, livedBeforeIslam: false,
      livedWithProphet: true, livedAfter600AD: true, livedAfter800AD: false,
      knownForBravery: false, knownForScience: false, knownForGenerosity: true,
      knownForHafiz: true, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: true, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: true,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: false,
    },
    hint: "Je suis la fille bien-aimée du Prophète ﷺ, épouse de Ali",
    funFact: "Le Prophète ﷺ se levait et la faisait asseoir à sa place dès qu'elle arrivait"
  },
  {
    id: 'sumayya',
    name: 'Sumayya bint Khabbat رضي الله عنها',
    nameAr: 'سمية بنت خياط',
    emoji: '💪',
    category: 'companion_female',
    era: 'prophetic',
    attributes: {
      isProphet: false, isSahabi: true, isWoman: true, isArabic: true,
      isCaliph: false, isImam: false, isScholar: false, isMartyr: true,
      isFromMecca: true, isFromMedina: false, livedBeforeIslam: true,
      livedWithProphet: true, livedAfter600AD: true, livedAfter800AD: false,
      knownForBravery: true, knownForScience: false, knownForGenerosity: false,
      knownForHafiz: false, knownForJihad: false, knownForWisdom: false,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: true, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: false,
    },
    hint: "Je suis la première martyre de l'Islam",
    funFact: "Elle est morte en criant 'Ahad !' refusant de renier sa foi"
  },
  // ═══════ GRANDS IMAMS & SAVANTS ═══════
  {
    id: 'imam-malik',
    name: 'Imam Malik ibn Anas رحمه الله',
    nameAr: 'مالك بن أنس',
    emoji: '📜',
    category: 'imam',
    era: 'abbasid',
    attributes: {
      isProphet: false, isSahabi: false, isWoman: false, isArabic: true,
      isCaliph: false, isImam: true, isScholar: true, isMartyr: false,
      isFromMecca: false, isFromMedina: true, livedBeforeIslam: false,
      livedWithProphet: false, livedAfter600AD: true, livedAfter800AD: true,
      knownForBravery: false, knownForScience: false, knownForGenerosity: false,
      knownForHafiz: true, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: true,
    },
    hint: "Je suis l'Imam de Médine, fondateur du madhab malikite",
    funFact: "Il mémorisait des milliers de hadiths mais quittait Médine très rarement par respect"
  },
  {
    id: 'imam-shafii',
    name: "Imam Ash-Shafi'i رحمه الله",
    nameAr: 'الإمام الشافعي',
    emoji: '⚖️',
    category: 'imam',
    era: 'abbasid',
    attributes: {
      isProphet: false, isSahabi: false, isWoman: false, isArabic: true,
      isCaliph: false, isImam: true, isScholar: true, isMartyr: false,
      isFromMecca: true, isFromMedina: false, livedBeforeIslam: false,
      livedWithProphet: false, livedAfter600AD: true, livedAfter800AD: true,
      knownForBravery: false, knownForScience: false, knownForGenerosity: false,
      knownForHafiz: true, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: true, relatedToProphet: true, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: true,
    },
    hint: "Je suis de la famille du Prophète ﷺ et fondateur du madhab shaféite",
    funFact: "Il avait mémorisé le Coran à 7 ans et le Muwatta d'Imam Malik à 10 ans"
  },
  {
    id: 'imam-ahmad',
    name: 'Imam Ahmad ibn Hanbal رحمه الله',
    nameAr: 'أحمد بن حنبل',
    emoji: '🏋️',
    category: 'imam',
    era: 'abbasid',
    attributes: {
      isProphet: false, isSahabi: false, isWoman: false, isArabic: true,
      isCaliph: false, isImam: true, isScholar: true, isMartyr: false,
      isFromMecca: false, isFromMedina: false, livedBeforeIslam: false,
      livedWithProphet: false, livedAfter600AD: true, livedAfter800AD: true,
      knownForBravery: true, knownForScience: false, knownForGenerosity: false,
      knownForHafiz: true, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: true,
    },
    hint: "J'ai résisté à la torture plutôt que de céder sur ma foi",
    funFact: "Il a mémorisé plus d'un million de hadiths avec les chaînes de transmission"
  },
  {
    id: 'imam-abu-hanifa',
    name: 'Imam Abu Hanifa رحمه الله',
    nameAr: 'أبو حنيفة النعمان',
    emoji: '🧠',
    category: 'imam',
    era: 'abbasid',
    attributes: {
      isProphet: false, isSahabi: false, isWoman: false, isArabic: false,
      isCaliph: false, isImam: true, isScholar: true, isMartyr: true,
      isFromMecca: false, isFromMedina: false, livedBeforeIslam: false,
      livedWithProphet: false, livedAfter600AD: true, livedAfter800AD: false,
      knownForBravery: false, knownForScience: true, knownForGenerosity: true,
      knownForHafiz: true, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: true,
    },
    hint: "Je suis Persan, le plus grand imam hanafite, mort en prison",
    funFact: "Il refusait de devenir juge pour ne pas compromettre son intégrité"
  },
  {
    id: 'ibn-taymiyya',
    name: 'Sheikh ul-Islam Ibn Taymiyya رحمه الله',
    nameAr: 'ابن تيمية',
    emoji: '📝',
    category: 'scholar',
    era: 'abbasid',
    attributes: {
      isProphet: false, isSahabi: false, isWoman: false, isArabic: true,
      isCaliph: false, isImam: true, isScholar: true, isMartyr: false,
      isFromMecca: false, isFromMedina: false, livedBeforeIslam: false,
      livedWithProphet: false, livedAfter600AD: true, livedAfter800AD: true,
      knownForBravery: true, knownForScience: false, knownForGenerosity: false,
      knownForHafiz: true, knownForJihad: true, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: true,
    },
    hint: "J'ai été emprisonné plusieurs fois pour mes écrits religieux",
    funFact: "Il écrivait encore des fatwas avec son charbon quand on lui a confisqué sa plume en prison"
  },
  {
    id: 'ibn-kathir',
    name: 'Ibn Kathir رحمه الله',
    nameAr: 'ابن كثير',
    emoji: '📗',
    category: 'scholar',
    era: 'abbasid',
    attributes: {
      isProphet: false, isSahabi: false, isWoman: false, isArabic: true,
      isCaliph: false, isImam: false, isScholar: true, isMartyr: false,
      isFromMecca: false, isFromMedina: false, livedBeforeIslam: false,
      livedWithProphet: false, livedAfter600AD: true, livedAfter800AD: true,
      knownForBravery: false, knownForScience: false, knownForGenerosity: false,
      knownForHafiz: true, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: true,
    },
    hint: "Mon Tafsir du Coran est le plus utilisé dans le monde musulman",
    funFact: "Il est devenu aveugle à la fin de sa vie mais continuait à dicter ses livres"
  },
  {
    id: 'ibn-battuta',
    name: 'Ibn Battuta رحمه الله',
    nameAr: 'ابن بطوطة',
    emoji: '🗺️',
    category: 'scholar',
    era: 'abbasid',
    attributes: {
      isProphet: false, isSahabi: false, isWoman: false, isArabic: true,
      isCaliph: false, isImam: false, isScholar: true, isMartyr: false,
      isFromMecca: false, isFromMedina: false, livedBeforeIslam: false,
      livedWithProphet: false, livedAfter600AD: true, livedAfter800AD: true,
      knownForBravery: true, knownForScience: true, knownForGenerosity: false,
      knownForHafiz: false, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: true,
    },
    hint: "J'ai voyagé 120 000 km à travers le monde islamique au 14ème siècle",
    funFact: "Il a visité 44 pays modernes, soit 3x plus que Marco Polo"
  },
  {
    id: 'ibn-sina',
    name: 'Ibn Sina (Avicenne) رحمه الله',
    nameAr: 'ابن سينا',
    emoji: '🏥',
    category: 'scholar',
    era: 'abbasid',
    attributes: {
      isProphet: false, isSahabi: false, isWoman: false, isArabic: false,
      isCaliph: false, isImam: false, isScholar: true, isMartyr: false,
      isFromMecca: false, isFromMedina: false, livedBeforeIslam: false,
      livedWithProphet: false, livedAfter600AD: true, livedAfter800AD: true,
      knownForBravery: false, knownForScience: true, knownForGenerosity: false,
      knownForHafiz: true, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: true, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: true,
    },
    hint: "Je suis 'le Prince des médecins', mon Canon de la médecine a été utilisé 700 ans",
    funFact: "Il avait mémorisé le Coran à 10 ans et maîtrisé la médecine à 16 ans"
  },
  {
    id: 'al-ghazali',
    name: 'Imam Al-Ghazali رحمه الله',
    nameAr: 'الإمام الغزالي',
    emoji: '🌿',
    category: 'imam',
    era: 'abbasid',
    attributes: {
      isProphet: false, isSahabi: false, isWoman: false, isArabic: false,
      isCaliph: false, isImam: true, isScholar: true, isMartyr: false,
      isFromMecca: false, isFromMedina: false, livedBeforeIslam: false,
      livedWithProphet: false, livedAfter600AD: true, livedAfter800AD: true,
      knownForBravery: false, knownForScience: true, knownForGenerosity: false,
      knownForHafiz: true, knownForJihad: false, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: false, writtenBook: true,
    },
    hint: "Je suis 'La Preuve de l'Islam', philosophe et mystique",
    funFact: "Il a abandonné sa chaire d'enseignement à Baghdad pour partir en retraite spirituelle"
  },
  {
    id: 'salahuddin',
    name: 'Saladin (Salah ad-Din) رحمه الله',
    nameAr: 'صلاح الدين الأيوبي',
    emoji: '🏰',
    category: 'scholar',
    era: 'abbasid',
    attributes: {
      isProphet: false, isSahabi: false, isWoman: false, isArabic: false,
      isCaliph: false, isImam: false, isScholar: false, isMartyr: false,
      isFromMecca: false, isFromMedina: false, livedBeforeIslam: false,
      livedWithProphet: false, livedAfter600AD: true, livedAfter800AD: true,
      knownForBravery: true, knownForScience: false, knownForGenerosity: true,
      knownForHafiz: false, knownForJihad: true, knownForWisdom: true,
      knownForPoetry: false, relatedToProphet: false, marriedToProphet: false,
      fatherOfProphet: false, firstMuslim: false, migratedToMedina: false,
      participatedInBadr: false, participatedInUhud: false,
      builtMosque: true, writtenBook: false,
    },
    hint: "Je suis Kurde et j'ai libéré Jérusalem des Croisés en 1187",
    funFact: "Après avoir repris Jérusalem, il n'a tué personne et a libéré des prisonniers"
  },
];
