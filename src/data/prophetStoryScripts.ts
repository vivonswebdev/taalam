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
  illustration?: string; // import key for image
}

export interface ProphetStoryScript {
  id: string;
  prophet: { fr: string; en: string; ar: string; nl: string; tr: string; ur: string };
  emoji: string;
  scenes: StoryScene[];
}

export const PROPHET_STORY_SCRIPTS: ProphetStoryScript[] = [
  // ─── NUH ─────────────────────────────────────────────
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
        choices: [{ label: { fr: "Monter dans l'arche avec les croyants", en: "Board the ark with believers", ar: "ركوب السفينة مع المؤمنين", nl: "Aan boord gaan met gelovigen", tr: "İnananlarla gemiye binmek", ur: "مومنوں کے ساتھ کشتی میں سوار ہونا" }, nextSceneId: "s4" }],
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

  // ─── IBRAHIM ─────────────────────────────────────────
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

  // ─── MUSA ────────────────────────────────────────────
  {
    id: "musa",
    prophet: { fr: "Moussa (Moïse)", en: "Musa (Moses)", ar: "موسى", nl: "Moesa (Mozes)", tr: "Musa", ur: "موسیٰ" },
    emoji: "🌊",
    scenes: [
      {
        id: "s1", emoji: "👶", illustration: "story-musa-river",
        text: {
          fr: "Quand Moussa était bébé, le roi Pharaon voulait faire du mal aux enfants. Sa maman, guidée par Allah, le plaça dans un petit panier sur le Nil. Le panier flotta doucement jusqu'au palais de Pharaon, où la femme du roi le trouva et décida de l'élever avec amour.",
          en: "When Musa was a baby, King Pharaoh wanted to harm the children. His mother, guided by Allah, placed him in a small basket on the Nile. The basket floated gently to Pharaoh's palace, where the king's wife found him and decided to raise him with love.",
          ar: "عندما كان موسى رضيعاً، أراد فرعون إيذاء الأطفال. أمه، بتوجيه من الله، وضعته في سلة صغيرة على نهر النيل. طفت السلة حتى قصر فرعون، حيث وجدته زوجة الملك وقررت تربيته بحب.",
          nl: "Toen Moesa een baby was, wilde Farao de kinderen kwaad doen. Zijn moeder legde hem in een mandje op de Nijl. Het mandje dreef naar het paleis.",
          tr: "Musa bebekken Firavun çocuklara zarar vermek istiyordu. Annesi onu Nil nehrine bir sepete koydu. Sepet saraya kadar yüzdü.",
          ur: "جب موسیٰ بچے تھے، فرعون بچوں کو نقصان پہنچانا چاہتا تھا۔ ان کی والدہ نے انہیں ٹوکری میں رکھ کر دریائے نیل میں بہا دیا۔"
        },
        moral: { fr: "Allah veille toujours sur ceux qui Lui font confiance.", en: "Allah always watches over those who trust Him.", ar: "الله يرعى دائماً من يتوكل عليه.", nl: "Allah waakt over wie op Hem vertrouwt.", tr: "Allah, kendisine güvenenleri her zaman korur.", ur: "اللہ ہمیشہ ان کی نگرانی کرتا ہے جو اس پر بھروسہ کرتے ہیں۔" },
        verse: "Coran 28:7",
        choices: [
          { label: { fr: "Découvrir la suite : Moussa grandit", en: "Discover what's next: Musa grows up", ar: "اكتشف ما حدث بعد ذلك", nl: "Ontdek het vervolg", tr: "Devamını öğren", ur: "آگے کی کہانی جانیں" }, nextSceneId: "s2" },
        ],
      },
      {
        id: "s2", emoji: "🔥", illustration: "story-musa-bush",
        text: {
          fr: "Moussa grandit et devint un homme fort et juste. Un jour, alors qu'il voyageait dans le désert avec sa famille, il aperçut un feu étrange sur une montagne. C'était un buisson qui brillait d'une lumière divine ! Allah lui parla directement : 'Ô Moussa, Je suis ton Seigneur ! Enlève tes sandales, tu es dans la vallée sacrée.'",
          en: "Musa grew up to become a strong and just man. One day, while traveling in the desert with his family, he saw a strange fire on a mountain. It was a bush shining with divine light! Allah spoke to him directly: 'O Musa, I am your Lord! Remove your sandals, you are in the sacred valley.'",
          ar: "كبر موسى وأصبح رجلاً قوياً وعادلاً. ذات يوم أثناء سفره في الصحراء، رأى ناراً غريبة على جبل. كانت شجرة تتوهج بنور إلهي! كلّمه الله مباشرة: يا موسى، إني أنا ربك فاخلع نعليك إنك بالوادي المقدس.",
          nl: "Moesa groeide op tot een sterke en rechtvaardige man. Op een dag zag hij een vreemd vuur op een berg. Allah sprak rechtstreeks tot hem.",
          tr: "Musa güçlü ve adaletli bir adam oldu. Bir gün dağda garip bir ateş gördü. Allah ona doğrudan seslendi.",
          ur: "موسیٰ ایک مضبوط اور منصف آدمی بنے۔ ایک دن انہوں نے پہاڑ پر عجیب آگ دیکھی۔ اللہ نے ان سے براہ راست بات کی۔"
        },
        choices: [
          { label: { fr: "Obéir à Allah et accepter la mission", en: "Obey Allah and accept the mission", ar: "طاعة الله وقبول المهمة", nl: "Allah gehoorzamen", tr: "Allah'a itaat et ve görevi kabul et", ur: "اللہ کی اطاعت کریں اور مشن قبول کریں" }, nextSceneId: "s3" },
          { label: { fr: "Avoir peur et hésiter", en: "Be afraid and hesitate", ar: "الخوف والتردد", nl: "Bang zijn en aarzelen", tr: "Korkmak ve tereddüt etmek", ur: "ڈرنا اور ہچکچانا" }, nextSceneId: "s3fear" },
        ],
      },
      {
        id: "s3fear", emoji: "😰",
        text: {
          fr: "C'est normal d'avoir peur ! Moussa aussi avait un peu peur. Mais Allah le rassura : 'N'aie pas peur, Je suis avec toi. J'entends et Je vois tout.' Allah donna à Moussa des miracles pour l'aider : son bâton se transformait en serpent, et sa main brillait d'une lumière blanche !",
          en: "It's normal to be afraid! Musa was a little scared too. But Allah reassured him: 'Do not fear, I am with you. I hear and see everything.' Allah gave Musa miracles: his staff turned into a snake, and his hand glowed with white light!",
          ar: "من الطبيعي أن تخاف! حتى موسى كان خائفاً قليلاً. لكن الله طمأنه: لا تخف إنني معكما أسمع وأرى. أعطى الله موسى معجزات: عصاه تتحول إلى ثعبان، ويده تضيء بنور أبيض!",
          nl: "Het is normaal om bang te zijn! Allah stelde Moesa gerust en gaf hem wonderen.", tr: "Korkmak normaldir! Allah Musa'yı rahatlattı ve mucizeler verdi.", ur: "ڈرنا معمول ہے! اللہ نے موسیٰ کو تسلی دی اور معجزات عطا کیے۔"
        },
        moral: { fr: "Même quand on a peur, Allah est toujours avec nous.", en: "Even when we're afraid, Allah is always with us.", ar: "حتى عندما نخاف، الله دائماً معنا.", nl: "Zelfs als we bang zijn, is Allah bij ons.", tr: "Korktuğumuzda bile Allah bizimledir.", ur: "جب ہم ڈرتے ہیں تب بھی اللہ ہمارے ساتھ ہے۔" },
        verse: "Coran 20:46",
        choices: [{ label: { fr: "Continuer vers Pharaon", en: "Continue to Pharaoh", ar: "تابع نحو فرعون", nl: "Ga naar Farao", tr: "Firavun'a git", ur: "فرعون کی طرف جائیں" }, nextSceneId: "s3" }],
      },
      {
        id: "s3", emoji: "👑",
        text: {
          fr: "Moussa alla voir Pharaon et lui dit : 'Laisse partir mon peuple ! Adore Allah, le seul Dieu !' Pharaon refusa et se moqua. Alors Allah envoya des signes : des sauterelles, des grenouilles, une obscurité totale... Mais Pharaon refusait toujours !",
          en: "Musa went to Pharaoh and said: 'Let my people go! Worship Allah, the only God!' Pharaoh refused and mocked him. So Allah sent signs: locusts, frogs, total darkness... But Pharaoh still refused!",
          ar: "ذهب موسى إلى فرعون وقال: أرسل معي بني إسرائيل! اعبد الله الإله الواحد! رفض فرعون واستهزأ. فأرسل الله آيات: الجراد، الضفادع، الظلام... لكن فرعون لا يزال يرفض!",
          nl: "Moesa ging naar Farao: 'Laat mijn volk gaan!' Farao weigerde. Allah stuurde tekenen.", tr: "Musa Firavun'a gitti: 'Kavmimi bırak!' Firavun reddetti. Allah mucizeler gönderdi.", ur: "موسیٰ فرعون کے پاس گئے: 'میری قوم کو جانے دو!' فرعون نے انکار کیا۔ اللہ نے نشانیاں بھیجیں۔"
        },
        choices: [{ label: { fr: "Voir le miracle de la mer", en: "See the miracle of the sea", ar: "شاهد معجزة البحر", nl: "Zie het wonder van de zee", tr: "Deniz mucizesini gör", ur: "سمندر کا معجزہ دیکھیں" }, nextSceneId: "s4" }],
      },
      {
        id: "s4", emoji: "🌊", illustration: "story-musa-sea",
        text: {
          fr: "Moussa et son peuple arrivèrent devant la mer Rouge, avec l'armée de Pharaon derrière eux ! 'N'aie pas peur !' dit Moussa. Il frappa la mer avec son bâton, et elle se fendit en deux ! Un chemin sec apparut. Ils traversèrent sains et saufs. Quand Pharaon essaya de les suivre, la mer se referma sur lui. SubhanAllah ! ✨",
          en: "Musa and his people reached the Red Sea, with Pharaoh's army behind them! 'Do not fear!' said Musa. He struck the sea with his staff, and it split in two! A dry path appeared. They crossed safely. When Pharaoh tried to follow, the sea closed over him. SubhanAllah! ✨",
          ar: "وصل موسى وقومه إلى البحر الأحمر وجيش فرعون خلفهم! قال موسى: لا تخافوا! ضرب البحر بعصاه فانشق نصفين! ظهر طريق جاف. عبروا بسلام. عندما حاول فرعون اللحاق بهم، أُغلق البحر عليه. سبحان الله! ✨",
          nl: "Moesa bereikte de Rode Zee. Hij sloeg met zijn staf en de zee splitste in tweeën! Ze staken veilig over. SubhanAllah!",
          tr: "Musa Kızıldeniz'e ulaştı. Asasıyla vurdu ve deniz ikiye ayrıldı! Güvenle geçtiler. SubhanAllah!",
          ur: "موسیٰ بحیرہ احمر تک پہنچے۔ انہوں نے عصا ماری اور سمندر دو حصوں میں بٹ گیا! وہ محفوظ طریقے سے گزر گئے۔ سبحان اللہ!"
        },
        moral: { fr: "Quand tu fais confiance à Allah, Il ouvre des chemins même là où il n'y en a pas.", en: "When you trust Allah, He opens paths even where there are none.", ar: "عندما تتوكل على الله، يفتح لك طريقاً حتى حيث لا يوجد.", nl: "Als je op Allah vertrouwt, opent Hij wegen waar er geen zijn.", tr: "Allah'a güvendiğinde, yol olmayan yerde bile yol açar.", ur: "جب آپ اللہ پر بھروسہ کریں تو وہ وہاں بھی راستے کھول دیتا ہے جہاں نہیں ہوتے۔" },
        verse: "Coran 26:63",
        isEnd: true,
      },
    ],
  },

  // ─── YUSUF ───────────────────────────────────────────
  {
    id: "yusuf",
    prophet: { fr: "Youssouf (Joseph)", en: "Yusuf (Joseph)", ar: "يوسف", nl: "Yoesoef (Jozef)", tr: "Yusuf", ur: "یوسف" },
    emoji: "🌟",
    scenes: [
      {
        id: "s1", emoji: "🌙",
        text: {
          fr: "Le jeune Youssouf fit un rêve merveilleux : il vit onze étoiles, le soleil et la lune se prosterner devant lui ! Il courut raconter ce rêve à son papa Yacoub (Jacob), qui était aussi un prophète.",
          en: "Young Yusuf had a wonderful dream: he saw eleven stars, the sun and the moon bowing down to him! He ran to tell his father Yaqub (Jacob), who was also a prophet.",
          ar: "رأى يوسف الشاب رؤيا عجيبة: أحد عشر كوكباً والشمس والقمر يسجدون له! ركض ليخبر أباه يعقوب وكان نبياً أيضاً.",
          nl: "De jonge Yoesoef had een bijzondere droom: elf sterren, de zon en de maan bogen voor hem!", tr: "Genç Yusuf harika bir rüya gördü: on bir yıldız, güneş ve ay ona secde ediyordu!", ur: "نوجوان یوسف نے ایک حیرت انگیز خواب دیکھا: گیارہ ستارے، سورج اور چاند ان کے سامنے جھک رہے تھے!"
        },
        choices: [
          { label: { fr: "Écouter le conseil de son père", en: "Listen to his father's advice", ar: "الاستماع لنصيحة أبيه", nl: "Luister naar zijn vader", tr: "Babasının tavsiyesini dinle", ur: "والد کی نصیحت سنیں" }, nextSceneId: "s2" },
          { label: { fr: "Raconter le rêve à ses frères", en: "Tell the dream to his brothers", ar: "إخبار إخوته بالرؤيا", nl: "De droom aan zijn broers vertellen", tr: "Rüyayı kardeşlerine anlat", ur: "بھائیوں کو خواب سنائیں" }, nextSceneId: "s2warn" },
        ],
      },
      {
        id: "s2warn", emoji: "⚠️",
        text: {
          fr: "Son père Yacoub lui dit : 'Mon fils, ne raconte pas ton rêve à tes frères ! Ils pourraient devenir jaloux.' C'était un sage conseil. La jalousie peut mener à de mauvaises actions.",
          en: "His father Yaqub told him: 'My son, do not tell your dream to your brothers! They might become jealous.' It was wise advice. Jealousy can lead to bad actions.",
          ar: "قال يعقوب: يا بني لا تقصص رؤياك على إخوتك! قد يحسدونك. كانت نصيحة حكيمة. الحسد يؤدي إلى أعمال سيئة.",
          nl: "Yaqub zei: 'Vertel je droom niet aan je broers! Ze kunnen jaloers worden.'", tr: "Babası: 'Rüyanı kardeşlerine anlatma!' dedi.", ur: "یعقوب نے کہا: 'بیٹا، اپنا خواب بھائیوں کو نہ سناؤ!'"
        },
        moral: { fr: "Il faut écouter les conseils de nos parents.", en: "We should listen to our parents' advice.", ar: "يجب أن نسمع نصائح آبائنا.", nl: "We moeten luisteren naar onze ouders.", tr: "Anne babamızın öğütlerini dinlemeliyiz.", ur: "ہمیں والدین کی نصیحت سننی چاہیے۔" },
        choices: [{ label: { fr: "Continuer l'histoire", en: "Continue", ar: "تابع", nl: "Ga verder", tr: "Devam et", ur: "جاری رکھیں" }, nextSceneId: "s2" }],
      },
      {
        id: "s2", emoji: "😢", illustration: "story-yusuf-coat",
        text: {
          fr: "Hélas, ses frères étaient très jaloux de Youssouf car leur père l'aimait beaucoup. Un jour, ils l'emmenèrent loin de la maison et le jetèrent dans un puits profond ! Ils rapportèrent sa belle tunique tachée de faux sang à leur père.",
          en: "Sadly, his brothers were very jealous because their father loved Yusuf so much. One day, they took him far from home and threw him into a deep well! They brought his beautiful coat stained with fake blood to their father.",
          ar: "للأسف، كان إخوته يحسدون يوسف لأن أباهم يحبه كثيراً. ذات يوم أخذوه بعيداً وألقوه في بئر عميقة! أعادوا قميصه ملطخاً بدم كاذب إلى أبيهم.",
          nl: "Zijn broers waren jaloers en gooiden hem in een diepe put!", tr: "Kardeşleri kıskançlıktan onu derin bir kuyuya attılar!", ur: "اس کے بھائیوں نے حسد سے اسے ایک گہرے کنویں میں پھینک دیا!"
        },
        illustration: "story-yusuf-well",
        choices: [
          { label: { fr: "Comment Youssouf s'en est sorti ?", en: "How did Yusuf get out?", ar: "كيف نجا يوسف؟", nl: "Hoe ontsnapte Yoesoef?", tr: "Yusuf nasıl kurtuldu?", ur: "یوسف کیسے نکلے؟" }, nextSceneId: "s3" },
        ],
      },
      {
        id: "s3", emoji: "🏛️",
        text: {
          fr: "Des voyageurs trouvèrent Youssouf dans le puits et l'emmenèrent en Égypte. Là-bas, il connut des épreuves difficiles, mais il resta toujours patient et honnête. Allah ne l'abandonna jamais.",
          en: "Travelers found Yusuf in the well and took him to Egypt. There, he faced difficult trials, but he always remained patient and honest. Allah never abandoned him.",
          ar: "وجدته قافلة في البئر وأخذوه إلى مصر. واجه اختبارات صعبة لكنه ظل صابراً وأميناً. لم يتركه الله أبداً.",
          nl: "Reizigers vonden hem en namen hem mee naar Egypte. Hij bleef geduldig.", tr: "Yolcular onu bulup Mısır'a götürdüler. Sabırlı ve dürüst kaldı.", ur: "مسافروں نے انہیں پایا اور مصر لے گئے۔ وہ صابر اور ایماندار رہے۔"
        },
        choices: [
          { label: { fr: "Rester patient comme Youssouf", en: "Stay patient like Yusuf", ar: "الصبر مثل يوسف", nl: "Geduldig blijven zoals Yoesoef", tr: "Yusuf gibi sabırlı ol", ur: "یوسف کی طرح صبر کریں" }, nextSceneId: "s4" },
          { label: { fr: "Se plaindre et perdre espoir", en: "Complain and lose hope", ar: "الشكوى وفقدان الأمل", nl: "Klagen en hoop verliezen", tr: "Şikayet et ve ümidini kaybet", ur: "شکایت کریں اور امید کھو دیں" }, nextSceneId: "s4hope" },
        ],
      },
      {
        id: "s4hope", emoji: "💪",
        text: {
          fr: "Youssouf ne s'est JAMAIS plaint ! Il a toujours fait confiance à Allah. Et Allah récompense toujours ceux qui sont patients...",
          en: "Yusuf NEVER complained! He always trusted Allah. And Allah always rewards those who are patient...",
          ar: "لم يشتكِ يوسف أبداً! دائماً توكل على الله. والله يجزي الصابرين دائماً...",
          nl: "Yoesoef klaagde NOOIT! Hij vertrouwde altijd op Allah.", tr: "Yusuf HİÇ şikayet etmedi! Her zaman Allah'a güvendi.", ur: "یوسف نے کبھی شکایت نہیں کی! ہمیشہ اللہ پر بھروسہ رکھا۔"
        },
        moral: { fr: "La patience mène toujours à la récompense.", en: "Patience always leads to reward.", ar: "الصبر يؤدي دائماً إلى الجزاء.", nl: "Geduld leidt altijd tot beloning.", tr: "Sabır her zaman mükafata ulaştırır.", ur: "صبر ہمیشہ اجر کی طرف لے جاتا ہے۔" },
        choices: [{ label: { fr: "Voir la récompense", en: "See the reward", ar: "شاهد المكافأة", nl: "Zie de beloning", tr: "Ödülü gör", ur: "اجر دیکھیں" }, nextSceneId: "s4" }],
      },
      {
        id: "s4", emoji: "👑", illustration: "story-yusuf-egypt",
        text: {
          fr: "Grâce à sa sagesse et sa confiance en Allah, Youssouf devint le ministre d'Égypte ! Il géra les réserves de nourriture et sauva tout le pays de la famine. Ses frères vinrent lui demander de l'aide, et il les reconnut. Il leur pardonna avec amour : 'Pas de reproche sur vous aujourd'hui !' Toute la famille fut réunie. La rêve se réalisa ! 🌟",
          en: "Thanks to his wisdom and trust in Allah, Yusuf became the minister of Egypt! He managed the food reserves and saved the country from famine. His brothers came for help, and he recognized them. He forgave them with love: 'No blame on you today!' The family was reunited. The dream came true! 🌟",
          ar: "بفضل حكمته وتوكله على الله، أصبح يوسف وزير مصر! أدار مخازن الطعام وأنقذ البلاد من المجاعة. جاء إخوته يطلبون المساعدة فعرفهم. سامحهم بحب: لا تثريب عليكم اليوم! اجتمعت العائلة. تحققت الرؤيا! 🌟",
          nl: "Yoesoef werd minister van Egypte! Hij vergaf zijn broers. De droom kwam uit! 🌟", tr: "Yusuf Mısır'ın veziri oldu! Kardeşlerini affetti. Rüya gerçek oldu! 🌟", ur: "یوسف مصر کے وزیر بن گئے! انہوں نے بھائیوں کو معاف کر دیا۔ خواب سچ ہو گیا! 🌟"
        },
        moral: { fr: "Le pardon est une force, pas une faiblesse. Allah récompense les patients.", en: "Forgiveness is strength, not weakness. Allah rewards the patient.", ar: "المغفرة قوة وليست ضعف. الله يجزي الصابرين.", nl: "Vergeving is kracht. Allah beloont de geduldigen.", tr: "Affetmek güçtür. Allah sabredenleri ödüllendirir.", ur: "معافی طاقت ہے۔ اللہ صبر کرنے والوں کو اجر دیتا ہے۔" },
        verse: "Coran 12:92",
        isEnd: true,
      },
    ],
  },

  // ─── SULAYMAN ────────────────────────────────────────
  {
    id: "sulayman",
    prophet: { fr: "Soulayman (Salomon)", en: "Sulayman (Solomon)", ar: "سليمان", nl: "Soelayman (Salomo)", tr: "Süleyman", ur: "سلیمان" },
    emoji: "👑",
    scenes: [
      {
        id: "s1", emoji: "👑", illustration: "story-sulayman-throne",
        text: {
          fr: "Le prophète Soulayman était un roi très spécial ! Allah lui donna des pouvoirs extraordinaires : il pouvait parler aux animaux, aux oiseaux, et même commander le vent ! Il avait un immense royaume avec un trône magnifique, et il était très reconnaissant envers Allah.",
          en: "Prophet Sulayman was a very special king! Allah gave him extraordinary powers: he could talk to animals, birds, and even command the wind! He had a vast kingdom with a magnificent throne, and he was very grateful to Allah.",
          ar: "كان النبي سليمان ملكاً مميزاً جداً! أعطاه الله قدرات خارقة: كان يتكلم مع الحيوانات والطيور ويأمر الريح! كان له مملكة عظيمة وعرش رائع، وكان شاكراً لله دائماً.",
          nl: "Profeet Soelayman was een bijzondere koning! Allah gaf hem buitengewone krachten: hij kon met dieren en vogels praten!", tr: "Süleyman peygamber çok özel bir kraldı! Allah ona hayvanlarla konuşma ve rüzgâra hükmetme gücü verdi!", ur: "نبی سلیمان ایک بہت خاص بادشاہ تھے! اللہ نے انہیں جانوروں اور پرندوں سے بات کرنے کی طاقت دی!"
        },
        choices: [
          { label: { fr: "Découvrir l'histoire de la huppe", en: "Discover the hoopoe's story", ar: "اكتشف قصة الهدهد", nl: "Ontdek het verhaal van de hop", tr: "Hüdhüd'ün hikayesini öğren", ur: "ہدہد کی کہانی جانیں" }, nextSceneId: "s2" },
          { label: { fr: "Voir Soulayman et les fourmis", en: "See Sulayman and the ants", ar: "شاهد سليمان والنمل", nl: "Soelayman en de mieren", tr: "Süleyman ve karıncalar", ur: "سلیمان اور چیونٹیاں" }, nextSceneId: "s3" },
        ],
      },
      {
        id: "s2", emoji: "🐦", illustration: "story-sulayman-hoopoe",
        text: {
          fr: "Un jour, Soulayman remarqua l'absence de la huppe (un oiseau messager). Quand elle revint, elle apporta une nouvelle incroyable : dans le royaume de Saba, une reine adorait le soleil au lieu d'Allah ! Soulayman décida d'envoyer une lettre à la reine pour l'inviter à adorer Allah seul.",
          en: "One day, Sulayman noticed the hoopoe bird was missing. When it returned, it brought incredible news: in the kingdom of Sheba, a queen worshipped the sun instead of Allah! Sulayman decided to send a letter to the queen inviting her to worship Allah alone.",
          ar: "ذات يوم لاحظ سليمان غياب الهدهد. عندما عاد أخبره بخبر عجيب: في مملكة سبأ، ملكة تعبد الشمس بدل الله! قرر سليمان إرسال رسالة لها يدعوها لعبادة الله وحده.",
          nl: "Op een dag merkte Soelayman dat de hop ontbrak. De vogel bracht nieuws over de koningin van Sheba.", tr: "Bir gün Süleyman hüdhüdün olmadığını fark etti. Kuş Sebe kraliçesi hakkında haberler getirdi.", ur: "ایک دن سلیمان نے ہدہد کی غیر حاضری محسوس کی۔ پرندے نے ملکہ سبا کی خبر لائی۔"
        },
        choices: [
          { label: { fr: "Que fit la reine de Saba ?", en: "What did the Queen of Sheba do?", ar: "ماذا فعلت ملكة سبأ؟", nl: "Wat deed de koningin?", tr: "Kraliçe ne yaptı?", ur: "ملکہ سبا نے کیا کیا؟" }, nextSceneId: "s2end" },
        ],
      },
      {
        id: "s2end", emoji: "🕌",
        text: {
          fr: "La reine de Saba vint rendre visite à Soulayman. En voyant la sagesse, la puissance et la grandeur du royaume – tout cela venant d'Allah – elle reconnut la vérité et embrassa l'Islam : 'Mon Seigneur, je me suis fait du tort à moi-même, et je me soumets avec Soulayman à Allah, Seigneur des mondes !' SubhanAllah ! 🌟",
          en: "The Queen of Sheba came to visit Sulayman. Seeing the wisdom, power and greatness of the kingdom – all from Allah – she recognized the truth and embraced Islam: 'My Lord, I have wronged myself, and I submit with Sulayman to Allah, Lord of the worlds!' SubhanAllah! 🌟",
          ar: "جاءت ملكة سبأ لزيارة سليمان. عندما رأت الحكمة والقوة والعظمة – كلها من الله – اعترفت بالحق وأسلمت: رب إني ظلمت نفسي وأسلمت مع سليمان لله رب العالمين! سبحان الله! 🌟",
          nl: "De koningin erkende de waarheid en aanvaardde de Islam. SubhanAllah!", tr: "Kraliçe gerçeği kabul etti ve İslam'a girdi. SubhanAllah!", ur: "ملکہ نے سچائی کو پہچانا اور اسلام قبول کر لیا۔ سبحان اللہ!"
        },
        moral: { fr: "La vérité finit toujours par briller. Avec sagesse et douceur, on peut guider les cœurs.", en: "The truth always shines through. With wisdom and kindness, we can guide hearts.", ar: "الحق يسطع دائماً. بالحكمة واللطف نهدي القلوب.", nl: "De waarheid schijnt altijd door.", tr: "Gerçek her zaman parlar.", ur: "سچائی ہمیشہ چمکتی ہے۔" },
        verse: "Coran 27:44",
        choices: [{ label: { fr: "Voir l'histoire des fourmis", en: "See the ants story", ar: "شاهد قصة النمل", nl: "Zie het mierenverhaal", tr: "Karınca hikayesini gör", ur: "چیونٹیوں کی کہانی دیکھیں" }, nextSceneId: "s3" }],
      },
      {
        id: "s3", emoji: "🐜", illustration: "story-sulayman-ants",
        text: {
          fr: "Un jour, Soulayman marchait avec son immense armée. Ils arrivèrent dans une vallée de fourmis. Une petite fourmi cria aux autres : 'Ô fourmis ! Rentrez dans vos habitations, de peur que Soulayman et ses armées ne vous écrasent sans s'en rendre compte !' Soulayman entendit la fourmi et sourit.",
          en: "One day, Sulayman was marching with his vast army. They reached a valley of ants. A small ant called out: 'O ants! Enter your homes so that Sulayman and his armies don't crush you without realizing it!' Sulayman heard the ant and smiled.",
          ar: "ذات يوم كان سليمان يسير بجيشه العظيم. وصلوا وادي النمل. نادت نملة صغيرة: يا أيها النمل ادخلوا مساكنكم لا يحطمنكم سليمان وجنوده وهم لا يشعرون! سمعها سليمان وابتسم.",
          nl: "Op een dag hoorde Soelayman een mier die tegen de andere mieren riep om zich te verstoppen.", tr: "Bir gün Süleyman bir karıncanın diğerlerini uyardığını duydu.", ur: "ایک دن سلیمان نے ایک چیونٹی کو دوسری چیونٹیوں کو خبردار کرتے سنا۔"
        },
        choices: [
          { label: { fr: "Que fit Soulayman ?", en: "What did Sulayman do?", ar: "ماذا فعل سليمان؟", nl: "Wat deed Soelayman?", tr: "Süleyman ne yaptı?", ur: "سلیمان نے کیا کیا؟" }, nextSceneId: "s4" },
        ],
      },
      {
        id: "s4", emoji: "😊",
        text: {
          fr: "Soulayman sourit de la parole de la fourmi et il fit un dua : 'Mon Seigneur, inspire-moi pour que je Te sois reconnaissant pour les bienfaits que Tu m'as accordés, et que je fasse le bien qui Te plaît.' Il ordonna à son armée de faire un détour pour ne pas écraser les fourmis ! Quelle miséricorde ! 🐜✨",
          en: "Sulayman smiled at the ant's words and made a dua: 'My Lord, inspire me to be grateful for Your blessings, and to do good deeds that please You.' He ordered his army to take a detour so as not to crush the ants! What mercy! 🐜✨",
          ar: "ابتسم سليمان وقال: رب أوزعني أن أشكر نعمتك التي أنعمت عليّ وأن أعمل صالحاً ترضاه. أمر جيشه بتغيير المسار حتى لا يؤذي النمل! يا لها من رحمة! 🐜✨",
          nl: "Soelayman glimlachte en beval zijn leger om te gaan zodat de mieren niet platgetrapt werden!", tr: "Süleyman gülümsedi ve ordusuna yön değiştirmesini emretti!", ur: "سلیمان مسکرائے اور فوج کو راستہ بدلنے کا حکم دیا!"
        },
        moral: { fr: "Même les plus petites créatures méritent respect et gentillesse. La vraie force est dans la miséricorde.", en: "Even the smallest creatures deserve respect and kindness. True strength is in mercy.", ar: "حتى أصغر المخلوقات تستحق الاحترام واللطف. القوة الحقيقية في الرحمة.", nl: "Zelfs de kleinste wezens verdienen respect.", tr: "En küçük canlılar bile saygıyı hak eder.", ur: "چھوٹی سے چھوٹی مخلوق بھی عزت کی مستحق ہے۔" },
        verse: "Coran 27:19",
        isEnd: true,
      },
    ],
  },
];
