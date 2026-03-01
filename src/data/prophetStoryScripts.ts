export interface StoryChoice {
  label: { fr: string; en: string; ar: string; nl: string; tr: string; ur: string };
  nextSceneId: string;
}

export interface StoryScene {
  id: string;
  text: { fr: string; en: string; ar: string; nl: string; tr: string; ur: string };
  moral?: { fr: string; en: string; ar: string; nl: string; tr: string; ur: string };
  verse?: string;
  choices?: StoryChoice[];
  isEnd?: boolean;
  emoji?: string;
}

export interface ProphetStoryScript {
  id: string;
  prophet: { fr: string; en: string; ar: string; nl: string; tr: string; ur: string };
  emoji: string;
  scenes: StoryScene[];
}

export const PROPHET_STORY_SCRIPTS: ProphetStoryScript[] = [
  {
    id: "nuh",
    prophet: { fr: "Nouh (Noé)", en: "Nuh (Noah)", ar: "نوح", nl: "Noeh", tr: "Nuh", ur: "نوح" },
    emoji: "🚢",
    scenes: [
      {
        id: "s1", emoji: "🌍",
        text: { fr: "Le prophète Nouh vivait parmi un peuple qui adorait des idoles. Allah lui demanda de les guider vers le droit chemin.", en: "Prophet Nuh lived among people who worshipped idols. Allah asked him to guide them to the right path.", ar: "عاش نبي الله نوح بين قوم يعبدون الأصنام. أمره الله بهدايتهم.", nl: "Profeet Noeh leefde onder een volk dat afgoden aanbad.", tr: "Nuh peygamber putlara tapan bir kavim arasında yaşıyordu.", ur: "نبی نوح ایک ایسی قوم میں رہتے تھے جو بتوں کی پوجا کرتی تھی۔" },
        choices: [
          { label: { fr: "Appeler son peuple avec douceur", en: "Call his people gently", ar: "دعوة قومه بلطف", nl: "Zijn volk zachtjes roepen", tr: "Kavmini yumuşaklıkla çağırmak", ur: "اپنی قوم کو نرمی سے بلانا" }, nextSceneId: "s2a" },
          { label: { fr: "Se décourager", en: "Feel discouraged", ar: "الشعور بالإحباط", nl: "Ontmoedigd raken", tr: "Cesaretini kaybetmek", ur: "حوصلہ ہارنا" }, nextSceneId: "s2b" },
        ],
      },
      {
        id: "s2a", emoji: "💬",
        text: { fr: "Nouh appela son peuple jour et nuit, avec patience et douceur. Mais très peu l'écoutèrent. Il ne perdit jamais espoir.", en: "Nuh called his people day and night, with patience. But very few listened. He never lost hope.", ar: "دعا نوح قومه ليلاً ونهاراً بصبر. لكن قليلاً استجابوا. لم يفقد الأمل أبداً.", nl: "Noeh riep zijn volk dag en nacht met geduld.", tr: "Nuh kavmini gece gündüz sabırla çağırdı.", ur: "نوح نے اپنی قوم کو دن رات صبر سے بلایا۔" },
        moral: { fr: "La patience est une vertu du croyant.", en: "Patience is a virtue of the believer.", ar: "الصبر فضيلة المؤمن.", nl: "Geduld is een deugd.", tr: "Sabır müminin erdemidir.", ur: "صبر مومن کی خوبی ہے۔" },
        choices: [{ label: { fr: "Continuer l'histoire", en: "Continue the story", ar: "تابع القصة", nl: "Ga verder", tr: "Devam et", ur: "کہانی جاری رکھیں" }, nextSceneId: "s3" }],
      },
      {
        id: "s2b", emoji: "😔",
        text: { fr: "Un prophète ne se décourage jamais ! Nouh a persévéré pendant 950 ans. Allah aime ceux qui sont patients.", en: "A prophet never gives up! Nuh persevered for 950 years. Allah loves those who are patient.", ar: "النبي لا ييأس أبداً! صبر نوح 950 سنة. الله يحب الصابرين.", nl: "Een profeet geeft nooit op! Noeh volhardde 950 jaar.", tr: "Bir peygamber asla pes etmez! Nuh 950 yıl sabır etti.", ur: "نبی کبھی مایوس نہیں ہوتا! نوح نے 950 سال صبر کیا۔" },
        moral: { fr: "Ne jamais abandonner, même quand c'est difficile.", en: "Never give up, even when it's hard.", ar: "لا تستسلم أبداً.", nl: "Geef nooit op.", tr: "Asla pes etme.", ur: "کبھی ہمت نہ ہاریں۔" },
        choices: [{ label: { fr: "Reprendre l'histoire", en: "Resume story", ar: "تابع القصة", nl: "Hervat verhaal", tr: "Devam et", ur: "کہانی جاری رکھیں" }, nextSceneId: "s3" }],
      },
      {
        id: "s3", emoji: "🚢",
        text: { fr: "Allah ordonna à Nouh de construire une grande arche. Les gens se moquèrent de lui, mais il obéit à Allah.", en: "Allah ordered Nuh to build a great ark. People mocked him, but he obeyed Allah.", ar: "أمر الله نوحاً ببناء سفينة عظيمة. سخر الناس منه لكنه أطاع الله.", nl: "Allah beval Noeh een grote ark te bouwen.", tr: "Allah, Nuh'a büyük bir gemi yapmasını emretti.", ur: "اللہ نے نوح کو ایک بڑی کشتی بنانے کا حکم دیا۔" },
        choices: [
          { label: { fr: "Monter dans l'arche avec les croyants", en: "Board the ark with believers", ar: "ركوب السفينة مع المؤمنين", nl: "Aan boord gaan met gelovigen", tr: "İnananlarla gemiye binmek", ur: "مومنوں کے ساتھ کشتی میں سوار ہونا" }, nextSceneId: "s4" },
        ],
      },
      {
        id: "s4", emoji: "🌊",
        text: { fr: "Le déluge arriva ! Seuls ceux qui étaient dans l'arche furent sauvés. Allah protège toujours les croyants. Fin de l'histoire ! 🌈", en: "The flood came! Only those in the ark were saved. Allah always protects the believers. End of the story! 🌈", ar: "جاء الطوفان! نجا فقط من كانوا في السفينة. الله يحمي المؤمنين دائماً. نهاية القصة! 🌈", nl: "De vloed kwam! Alleen die in de ark waren, werden gered.", tr: "Tufan geldi! Sadece gemidekiler kurtuldu.", ur: "طوفان آیا! صرف کشتی والے بچ گئے۔" },
        moral: { fr: "Obéir à Allah nous protège toujours.", en: "Obeying Allah always protects us.", ar: "طاعة الله تحمينا دائماً.", nl: "Gehoorzaamheid aan Allah beschermt ons altijd.", tr: "Allah'a itaat bizi her zaman korur.", ur: "اللہ کی اطاعت ہمیشہ حفاظت کرتی ہے۔" },
        verse: "Coran 11:40",
        isEnd: true,
      },
    ],
  },
  {
    id: "ibrahim",
    prophet: { fr: "Ibrahim (Abraham)", en: "Ibrahim (Abraham)", ar: "إبراهيم", nl: "Ibrahim (Abraham)", tr: "İbrahim", ur: "ابراہیم" },
    emoji: "⭐",
    scenes: [
      {
        id: "s1", emoji: "🌙",
        text: { fr: "Ibrahim était un jeune garçon très intelligent. Il observa les étoiles, la lune et le soleil, et comprit qu'il devait y avoir un seul Créateur.", en: "Ibrahim was a very intelligent young boy. He observed the stars, moon and sun, and understood there must be one Creator.", ar: "كان إبراهيم فتى ذكياً جداً. نظر إلى النجوم والقمر والشمس وأدرك أن هناك خالقاً واحداً.", nl: "Ibrahim was een slimme jongen die de sterren observeerde.", tr: "İbrahim çok zeki bir gençti.", ur: "ابراہیم بہت ذہین نوجوان تھے۔" },
        choices: [
          { label: { fr: "Chercher la vérité", en: "Seek the truth", ar: "البحث عن الحقيقة", nl: "De waarheid zoeken", tr: "Gerçeği aramak", ur: "سچائی تلاش کرنا" }, nextSceneId: "s2" },
          { label: { fr: "Suivre les idoles comme les autres", en: "Follow idols like others", ar: "اتباع الأصنام كالآخرين", nl: "Afgoden volgen", tr: "Diğerleri gibi putlara uymak", ur: "دوسروں کی طرح بتوں کی پیروی" }, nextSceneId: "s2x" },
        ],
      },
      {
        id: "s2x", emoji: "❌",
        text: { fr: "Non ! Ibrahim savait que les idoles ne pouvaient rien faire. Il brisa les idoles pour montrer la vérité !", en: "No! Ibrahim knew idols could do nothing. He broke the idols to show the truth!", ar: "لا! عرف إبراهيم أن الأصنام لا تنفع. حطم الأصنام ليبين الحقيقة!", nl: "Nee! Ibrahim wist dat afgoden niets konden doen.", tr: "Hayır! İbrahim putların bir şey yapamayacağını biliyordu.", ur: "نہیں! ابراہیم جانتے تھے کہ بت کچھ نہیں کر سکتے۔" },
        moral: { fr: "Toujours réfléchir et chercher la vérité.", en: "Always think and seek the truth.", ar: "فكّر دائماً وابحث عن الحقيقة.", nl: "Denk altijd na en zoek de waarheid.", tr: "Her zaman düşün ve gerçeği ara.", ur: "ہمیشہ سوچیں اور سچائی تلاش کریں۔" },
        choices: [{ label: { fr: "Continuer", en: "Continue", ar: "تابع", nl: "Ga verder", tr: "Devam", ur: "جاری رکھیں" }, nextSceneId: "s2" }],
      },
      {
        id: "s2", emoji: "🔥",
        text: { fr: "Son peuple se mit en colère et le jeta dans un grand feu ! Mais Allah dit : 'Ô feu, sois fraîcheur et paix pour Ibrahim !' Et le feu ne lui fit aucun mal !", en: "His people got angry and threw him into a great fire! But Allah said: 'O fire, be cool and peace for Ibrahim!' And the fire did not harm him!", ar: "غضب قومه وألقوه في نار عظيمة! لكن الله قال: يا نار كوني برداً وسلاماً على إبراهيم! فلم تضره النار!", nl: "Zijn volk werd boos en gooide hem in een groot vuur! Maar Allah beschermde hem.", tr: "Kavmi onu ateşe attı! Ama Allah ateşe emretti ve İbrahim'e zarar vermedi.", ur: "اس کی قوم نے اسے آگ میں پھینک دیا! لیکن اللہ نے آگ کو ٹھنڈک بنا دیا!" },
        moral: { fr: "Allah protège ceux qui croient en Lui seul.", en: "Allah protects those who believe in Him alone.", ar: "الله يحمي من يؤمن به وحده.", nl: "Allah beschermt wie alleen in Hem gelooft.", tr: "Allah yalnızca O'na iman edenleri korur.", ur: "اللہ ان کی حفاظت کرتا ہے جو صرف اس پر ایمان لاتے ہیں۔" },
        verse: "Coran 21:69",
        isEnd: true,
      },
    ],
  },
];
