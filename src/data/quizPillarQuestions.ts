export interface PillarQuestion {
  id: string;
  category: "shahada" | "salah" | "zakat" | "sawm" | "hajj";
  question: { fr: string; ar: string; en: string; nl: string; tr: string; ur: string };
  options: { fr: string; ar: string; en: string; nl: string; tr: string; ur: string }[];
  correctIndex: number;
  explanation: { fr: string; ar: string; en: string; nl: string; tr: string; ur: string };
}

export const PILLAR_QUESTIONS: PillarQuestion[] = [
  {
    id: "p1", category: "shahada",
    question: { fr: "Quel est le premier pilier de l'Islam ?", en: "What is the first pillar of Islam?", ar: "ما هو الركن الأول في الإسلام؟", nl: "Wat is de eerste zuil van de Islam?", tr: "İslam'ın ilk şartı nedir?", ur: "اسلام کا پہلا رکن کیا ہے؟" },
    options: [
      { fr: "La Shahada", en: "The Shahada", ar: "الشهادة", nl: "De Shahada", tr: "Şehadet", ur: "شہادت" },
      { fr: "La prière", en: "Prayer", ar: "الصلاة", nl: "Het gebed", tr: "Namaz", ur: "نماز" },
      { fr: "Le jeûne", en: "Fasting", ar: "الصيام", nl: "Het vasten", tr: "Oruç", ur: "روزہ" },
      { fr: "Le Hajj", en: "Hajj", ar: "الحج", nl: "De Hadj", tr: "Hac", ur: "حج" },
    ],
    correctIndex: 0,
    explanation: { fr: "La Shahada est le témoignage de foi : il n'y a de dieu qu'Allah et Muhammad est son messager.", en: "The Shahada is the declaration of faith: there is no god but Allah and Muhammad is His messenger.", ar: "الشهادة هي شهادة أن لا إله إلا الله وأن محمداً رسول الله.", nl: "De Shahada is de geloofsgetuigenis.", tr: "Şehadet, iman tanıklığıdır.", ur: "شہادت ایمان کی گواہی ہے۔" },
  },
  {
    id: "p2", category: "salah",
    question: { fr: "Combien de prières obligatoires par jour ?", en: "How many obligatory prayers per day?", ar: "كم عدد الصلوات المفروضة يومياً؟", nl: "Hoeveel verplichte gebeden per dag?", tr: "Günde kaç vakit farz namaz var?", ur: "روزانہ کتنی فرض نمازیں ہیں؟" },
    options: [
      { fr: "3", en: "3", ar: "٣", nl: "3", tr: "3", ur: "3" },
      { fr: "5", en: "5", ar: "٥", nl: "5", tr: "5", ur: "5" },
      { fr: "7", en: "7", ar: "٧", nl: "7", tr: "7", ur: "7" },
      { fr: "4", en: "4", ar: "٤", nl: "4", tr: "4", ur: "4" },
    ],
    correctIndex: 1,
    explanation: { fr: "Il y a 5 prières obligatoires : Fajr, Dhuhr, Asr, Maghrib, Isha.", en: "There are 5 obligatory prayers: Fajr, Dhuhr, Asr, Maghrib, Isha.", ar: "خمس صلوات: الفجر، الظهر، العصر، المغرب، العشاء.", nl: "Er zijn 5 verplichte gebeden.", tr: "5 vakit farz namaz vardır.", ur: "5 فرض نمازیں ہیں۔" },
  },
  {
    id: "p3", category: "salah",
    question: { fr: "Quelle est la première prière de la journée ?", en: "What is the first prayer of the day?", ar: "ما هي أول صلاة في اليوم؟", nl: "Wat is het eerste gebed van de dag?", tr: "Günün ilk namazı hangisidir?", ur: "دن کی پہلی نماز کون سی ہے؟" },
    options: [
      { fr: "Dhuhr", en: "Dhuhr", ar: "الظهر", nl: "Dhuhr", tr: "Öğle", ur: "ظہر" },
      { fr: "Fajr", en: "Fajr", ar: "الفجر", nl: "Fajr", tr: "Sabah", ur: "فجر" },
      { fr: "Maghrib", en: "Maghrib", ar: "المغرب", nl: "Maghrib", tr: "Akşam", ur: "مغرب" },
      { fr: "Isha", en: "Isha", ar: "العشاء", nl: "Isha", tr: "Yatsı", ur: "عشاء" },
    ],
    correctIndex: 1,
    explanation: { fr: "Fajr est la prière de l'aube, la première de la journée.", en: "Fajr is the dawn prayer, the first of the day.", ar: "الفجر هي صلاة الفجر، أول صلاة في اليوم.", nl: "Fajr is het ochtendgebed.", tr: "Sabah namazı günün ilk namazıdır.", ur: "فجر صبح کی نماز ہے۔" },
  },
  {
    id: "p4", category: "zakat",
    question: { fr: "Que signifie Zakat ?", en: "What does Zakat mean?", ar: "ماذا تعني الزكاة؟", nl: "Wat betekent Zakat?", tr: "Zekat ne demek?", ur: "زکاۃ کا کیا مطلب ہے؟" },
    options: [
      { fr: "Purification", en: "Purification", ar: "تطهير", nl: "Zuivering", tr: "Arınma", ur: "تزکیہ" },
      { fr: "Voyage", en: "Travel", ar: "سفر", nl: "Reis", tr: "Seyahat", ur: "سفر" },
      { fr: "Repos", en: "Rest", ar: "راحة", nl: "Rust", tr: "Dinlenme", ur: "آرام" },
      { fr: "Combat", en: "Fight", ar: "قتال", nl: "Strijd", tr: "Savaş", ur: "جنگ" },
    ],
    correctIndex: 0,
    explanation: { fr: "Zakat vient du mot arabe signifiant purification et croissance.", en: "Zakat comes from the Arabic word meaning purification and growth.", ar: "الزكاة من كلمة عربية تعني التطهير والنماء.", nl: "Zakat komt van het Arabische woord voor zuivering.", tr: "Zekat, arınma ve büyüme anlamındadır.", ur: "زکاۃ عربی لفظ سے ہے جس کا مطلب پاکیزگی ہے۔" },
  },
  {
    id: "p5", category: "sawm",
    question: { fr: "En quel mois jeûne-t-on ?", en: "In which month do we fast?", ar: "في أي شهر نصوم؟", nl: "In welke maand vasten we?", tr: "Hangi ayda oruç tutulur?", ur: "کس مہینے میں روزے رکھتے ہیں؟" },
    options: [
      { fr: "Shawwal", en: "Shawwal", ar: "شوال", nl: "Shawwal", tr: "Şevval", ur: "شوال" },
      { fr: "Ramadan", en: "Ramadan", ar: "رمضان", nl: "Ramadan", tr: "Ramazan", ur: "رمضان" },
      { fr: "Muharram", en: "Muharram", ar: "محرم", nl: "Muharram", tr: "Muharrem", ur: "محرم" },
      { fr: "Rajab", en: "Rajab", ar: "رجب", nl: "Rajab", tr: "Recep", ur: "رجب" },
    ],
    correctIndex: 1,
    explanation: { fr: "Le jeûne obligatoire a lieu pendant le mois de Ramadan.", en: "Obligatory fasting takes place during Ramadan.", ar: "الصيام المفروض يكون في شهر رمضان.", nl: "Het verplichte vasten is in Ramadan.", tr: "Farz oruç Ramazan ayındadır.", ur: "فرض روزے رمضان میں ہوتے ہیں۔" },
  },
  {
    id: "p6", category: "hajj",
    question: { fr: "Où se déroule le Hajj ?", en: "Where does Hajj take place?", ar: "أين يُؤدى الحج؟", nl: "Waar vindt de Hadj plaats?", tr: "Hac nerede yapılır?", ur: "حج کہاں ہوتا ہے؟" },
    options: [
      { fr: "Médine", en: "Medina", ar: "المدينة", nl: "Medina", tr: "Medine", ur: "مدینہ" },
      { fr: "Jérusalem", en: "Jerusalem", ar: "القدس", nl: "Jeruzalem", tr: "Kudüs", ur: "یروشلم" },
      { fr: "La Mecque", en: "Mecca", ar: "مكة", nl: "Mekka", tr: "Mekke", ur: "مکہ" },
      { fr: "Le Caire", en: "Cairo", ar: "القاهرة", nl: "Caïro", tr: "Kahire", ur: "قاہرہ" },
    ],
    correctIndex: 2,
    explanation: { fr: "Le Hajj se déroule à La Mecque, en Arabie Saoudite.", en: "Hajj takes place in Mecca, Saudi Arabia.", ar: "الحج يُؤدى في مكة المكرمة.", nl: "De Hadj vindt plaats in Mekka.", tr: "Hac, Mekke'de yapılır.", ur: "حج مکہ مکرمہ میں ہوتا ہے۔" },
  },
  {
    id: "p7", category: "shahada",
    question: { fr: "Qui est le dernier prophète en Islam ?", en: "Who is the last prophet in Islam?", ar: "من هو آخر الأنبياء في الإسلام؟", nl: "Wie is de laatste profeet in de Islam?", tr: "İslam'da son peygamber kimdir?", ur: "اسلام میں آخری نبی کون ہیں؟" },
    options: [
      { fr: "Issa (Jésus)", en: "Isa (Jesus)", ar: "عيسى", nl: "Isa (Jezus)", tr: "İsa", ur: "عیسیٰ" },
      { fr: "Moussa (Moïse)", en: "Musa (Moses)", ar: "موسى", nl: "Musa (Mozes)", tr: "Musa", ur: "موسیٰ" },
      { fr: "Muhammad ﷺ", en: "Muhammad ﷺ", ar: "محمد ﷺ", nl: "Mohammed ﷺ", tr: "Muhammed ﷺ", ur: "محمد ﷺ" },
      { fr: "Ibrahim", en: "Ibrahim", ar: "إبراهيم", nl: "Ibrahim", tr: "İbrahim", ur: "ابراہیم" },
    ],
    correctIndex: 2,
    explanation: { fr: "Muhammad ﷺ est le sceau des prophètes, le dernier envoyé d'Allah.", en: "Muhammad ﷺ is the seal of the prophets.", ar: "محمد ﷺ هو خاتم الأنبياء والمرسلين.", nl: "Mohammed ﷺ is het zegel der profeten.", tr: "Muhammed ﷺ peygamberlerin sonuncusudur.", ur: "محمد ﷺ خاتم النبیین ہیں۔" },
  },
  {
    id: "p8", category: "salah",
    question: { fr: "Que fait-on avant la prière ?", en: "What do we do before prayer?", ar: "ماذا نفعل قبل الصلاة؟", nl: "Wat doen we voor het gebed?", tr: "Namazdan önce ne yapılır?", ur: "نماز سے پہلے کیا کرتے ہیں؟" },
    options: [
      { fr: "Le Wudu (ablutions)", en: "Wudu (ablution)", ar: "الوضوء", nl: "Woedoe (rituele wassing)", tr: "Abdest", ur: "وضو" },
      { fr: "Manger", en: "Eat", ar: "الأكل", nl: "Eten", tr: "Yemek", ur: "کھانا" },
      { fr: "Dormir", en: "Sleep", ar: "النوم", nl: "Slapen", tr: "Uyumak", ur: "سونا" },
      { fr: "Jouer", en: "Play", ar: "اللعب", nl: "Spelen", tr: "Oynamak", ur: "کھیلنا" },
    ],
    correctIndex: 0,
    explanation: { fr: "Le Wudu (ablutions) est obligatoire avant chaque prière.", en: "Wudu (ablution) is required before each prayer.", ar: "الوضوء واجب قبل كل صلاة.", nl: "Woedoe is verplicht voor elk gebed.", tr: "Abdest her namazdan önce farzdır.", ur: "ہر نماز سے پہلے وضو فرض ہے۔" },
  },
  {
    id: "p9", category: "sawm",
    question: { fr: "Quand commence le jeûne chaque jour ?", en: "When does fasting start each day?", ar: "متى يبدأ الصيام كل يوم؟", nl: "Wanneer begint het vasten elke dag?", tr: "Oruç her gün ne zaman başlar?", ur: "ہر دن روزہ کب شروع ہوتا ہے؟" },
    options: [
      { fr: "Au coucher du soleil", en: "At sunset", ar: "عند الغروب", nl: "Bij zonsondergang", tr: "Gün batımında", ur: "غروب آفتاب پر" },
      { fr: "À l'aube (Fajr)", en: "At dawn (Fajr)", ar: "عند الفجر", nl: "Bij het ochtendgloren (Fajr)", tr: "Şafakta (İmsak)", ur: "فجر کے وقت" },
      { fr: "À midi", en: "At noon", ar: "عند الظهر", nl: "Om 12 uur", tr: "Öğlen", ur: "دوپہر کو" },
      { fr: "Le soir", en: "In the evening", ar: "في المساء", nl: "'s Avonds", tr: "Akşam", ur: "شام کو" },
    ],
    correctIndex: 1,
    explanation: { fr: "Le jeûne commence à l'aube (Fajr) et se termine au coucher du soleil.", en: "Fasting starts at dawn and ends at sunset.", ar: "الصيام يبدأ من الفجر وينتهي عند الغروب.", nl: "Het vasten begint bij Fajr.", tr: "Oruç imsakte başlar.", ur: "روزہ فجر سے شروع ہوتا ہے۔" },
  },
  {
    id: "p10", category: "hajj",
    question: { fr: "Combien de fois le Hajj est-il obligatoire ?", en: "How many times is Hajj obligatory?", ar: "كم مرة يجب أداء الحج؟", nl: "Hoe vaak is de Hadj verplicht?", tr: "Hac kaç kez farzdır?", ur: "حج کتنی بار فرض ہے؟" },
    options: [
      { fr: "Chaque année", en: "Every year", ar: "كل سنة", nl: "Elk jaar", tr: "Her yıl", ur: "ہر سال" },
      { fr: "1 fois dans la vie", en: "Once in a lifetime", ar: "مرة واحدة في العمر", nl: "Eén keer in het leven", tr: "Ömürde bir kez", ur: "زندگی میں ایک بار" },
      { fr: "5 fois", en: "5 times", ar: "٥ مرات", nl: "5 keer", tr: "5 kez", ur: "5 بار" },
      { fr: "Jamais", en: "Never", ar: "أبداً", nl: "Nooit", tr: "Hiç", ur: "کبھی نہیں" },
    ],
    correctIndex: 1,
    explanation: { fr: "Le Hajj est obligatoire une seule fois dans la vie pour ceux qui en ont la capacité.", en: "Hajj is obligatory once in a lifetime for those who are able.", ar: "الحج فرض مرة واحدة في العمر لمن استطاع.", nl: "De Hadj is eenmaal verplicht.", tr: "Hac, ömürde bir kez farzdır.", ur: "حج زندگی میں ایک بار فرض ہے۔" },
  },
];
