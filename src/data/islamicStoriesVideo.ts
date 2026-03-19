export type SubtitleLine = {
  speaker: "adult" | "child";
  startSec: number;
  endSec: number;
  translations: {
    fr: string;
    en: string;
    ar: string;
    nl: string;
    tr: string;
    ur: string;
  };
};

export type IslamicStoryVideo = {
  id: string;
  emoji: string;
  titleKey: string;
  category: "prophets" | "pillars" | "quran" | "morals" | "history";
  ageRange: string;
  durationSec: number;
  videoUrl: string;
  videoPoster: string;
  subtitles: SubtitleLine[];
};

// Voice IDs for ElevenLabs
export const VOICE_IDS = {
  adult: "nPczCjzI2devNBz1zQrb", // Brian - calm male
  child: "EXAVITQu4vr4xnSDxMaL", // Sarah - young feminine voice
} as const;

export const VOICE_SETTINGS = {
  adult: { stability: 0.50, similarity_boost: 0.75, speed: 0.85 },
  child: { stability: 0.45, similarity_boost: 0.80, speed: 1.05 },
} as const;

export const ISLAMIC_STORIES_VIDEO: IslamicStoryVideo[] = [
  // ═══ 1. Les 5 Piliers ═══
  {
    id: "five-pillars-video",
    emoji: "🕌",
    titleKey: "videoStories.fivePillars",
    category: "pillars",
    ageRange: "6-9",
    durationSec: 120,
    videoUrl: "https://videos.pexels.com/video-files/3629519/3629519-hd_1920_1080_30fps.mp4",
    videoPoster: "https://images.pexels.com/videos/3629519/free-video-3629519.jpg?auto=compress&w=600",
    subtitles: [
      { speaker: "child", startSec: 0, endSec: 4, translations: { fr: "Baba, c'est quoi l'Islam ?", en: "Baba, what is Islam?", ar: "بابا، ما هو الإسلام؟", nl: "Baba, wat is de Islam?", tr: "Baba, İslam nedir?", ur: "بابا، اسلام کیا ہے؟" } },
      { speaker: "adult", startSec: 4, endSec: 10, translations: { fr: "L'Islam, mon enfant, repose sur cinq piliers — comme une maison solide a besoin de cinq murs.", en: "Islam, my child, is built on five pillars — like a strong house needs five walls.", ar: "الإسلام، يا بني، يقوم على خمسة أركان — مثل البيت القوي يحتاج خمسة جدران.", nl: "De Islam, mijn kind, is gebouwd op vijf zuilen — net als een sterk huis vijf muren nodig heeft.", tr: "İslam, yavrum, beş sütun üzerine kurulmuştur — güçlü bir evin beş duvara ihtiyaç duyması gibi.", ur: "اسلام، میرے بچے، پانچ ستونوں پر قائم ہے — جیسے ایک مضبوط گھر کو پانچ دیواروں کی ضرورت ہوتی ہے۔" } },
      { speaker: "child", startSec: 10, endSec: 13, translations: { fr: "Cinq piliers ? Comme une mosquée ?", en: "Five pillars? Like a masjid?", ar: "خمسة أركان؟ مثل المسجد؟", nl: "Vijf zuilen? Zoals een moskee?", tr: "Beş sütun mu? Bir cami gibi mi?", ur: "پانچ ستون؟ مسجد کی طرح؟" } },
      { speaker: "adult", startSec: 13, endSec: 20, translations: { fr: "Exactement ! Le premier est la Shahada — dire qu'Allah est Un et que Muhammad ﷺ est Son messager.", en: "Exactly! The first is Shahada — saying that Allah is One and Muhammad ﷺ is His messenger.", ar: "بالضبط! الأول هو الشهادة — أن تشهد أن الله واحد وأن محمداً ﷺ رسوله.", nl: "Precies! De eerste is de Shahada — zeggen dat Allah Eén is en Mohammed ﷺ Zijn boodschapper.", tr: "Aynen! Birincisi Şehadet — Allah'ın Bir olduğunu ve Muhammed ﷺ'in O'nun elçisi olduğunu söylemek.", ur: "بالکل! پہلا شہادہ ہے — یہ کہنا کہ اللہ ایک ہے اور محمد ﷺ اس کے رسول ہیں۔" } },
      { speaker: "child", startSec: 20, endSec: 24, translations: { fr: "Je connais ! Ash-hadu an la ilaha illallah !", en: "I know that one! Ash-hadu an la ilaha illallah!", ar: "أعرف هذا! أشهد أن لا إله إلا الله!", nl: "Die ken ik! Ash-hadu an la ilaha illallah!", tr: "Onu biliyorum! Eşhedü en la ilahe illallah!", ur: "یہ مجھے آتا ہے! اشہد ان لا الہ الا اللہ!" } },
      { speaker: "adult", startSec: 24, endSec: 32, translations: { fr: "Masha'Allah ! Le deuxième est la Salah — prier cinq fois par jour, parler à Allah.", en: "Masha'Allah! The second is Salah — praying five times a day, talking to Allah.", ar: "ما شاء الله! الثاني هو الصلاة — الصلاة خمس مرات في اليوم، والتحدث مع الله.", nl: "Masha'Allah! De tweede is Salah — vijf keer per dag bidden, praten met Allah.", tr: "Maşallah! İkincisi Namaz — günde beş vakit Allah'a ibadet etmek.", ur: "ماشاءاللہ! دوسرا نماز ہے — دن میں پانچ بار اللہ سے بات کرنا۔" } },
      { speaker: "child", startSec: 32, endSec: 36, translations: { fr: "Comme la prière du Fajr le matin ?", en: "Like Fajr prayer in the morning?", ar: "مثل صلاة الفجر في الصباح؟", nl: "Zoals het Fajr-gebed 's ochtends?", tr: "Sabah Fecir namazı gibi mi?", ur: "جیسے صبح کی فجر کی نماز؟" } },
      { speaker: "adult", startSec: 36, endSec: 48, translations: { fr: "Oui ! Fajr, Dhuhr, Asr, Maghrib et Isha. Le troisième est la Zakat — donner à ceux qui ont moins.", en: "Yes! Fajr, Dhuhr, Asr, Maghrib and Isha. The third is Zakat — giving to those who have less.", ar: "نعم! الفجر والظهر والعصر والمغرب والعشاء. الثالث هو الزكاة — إعطاء من لديه أقل.", nl: "Ja! Fajr, Dhuhr, Asr, Maghrib en Isha. De derde is Zakaat — geven aan wie minder heeft.", tr: "Evet! Fecir, Öğle, İkindi, Akşam ve Yatsı. Üçüncüsü Zekât — daha az olanlara vermek.", ur: "ہاں! فجر، ظہر، عصر، مغرب اور عشاء۔ تیسرا زکوٰۃ ہے — جن کے پاس کم ہے ان کو دینا۔" } },
      { speaker: "child", startSec: 48, endSec: 52, translations: { fr: "Comme partager notre nourriture ?", en: "Like sharing our food?", ar: "مثل مشاركة طعامنا؟", nl: "Zoals ons eten delen?", tr: "Yemeğimizi paylaşmak gibi mi?", ur: "جیسے اپنا کھانا بانٹنا؟" } },
      { speaker: "adult", startSec: 52, endSec: 62, translations: { fr: "Magnifique. Le quatrième est le Sawm — jeûner pendant le Ramadan, du lever au coucher du soleil.", en: "Beautifully said. The fourth is Sawm — fasting in Ramadan, from sunrise to sunset.", ar: "ما أجمل ما قلت. الرابع هو الصوم — صيام رمضان، من الشروق إلى الغروب.", nl: "Mooi gezegd. De vierde is Sawm — vasten in Ramadan, van zonsopgang tot zonsondergang.", tr: "Güzel söyledin. Dördüncüsü Oruç — Ramazan'da gün doğumundan gün batımına kadar oruç tutmak.", ur: "خوبصورت بات۔ چوتھا روزہ ہے — رمضان میں سورج نکلنے سے غروب تک روزہ رکھنا۔" } },
      { speaker: "child", startSec: 62, endSec: 67, translations: { fr: "C'est quand Mama fait le repas spécial le soir !", en: "That's when Mama makes special food at night!", ar: "هذا عندما تصنع ماما طعاماً خاصاً في الليل!", nl: "Dan maakt Mama 's avonds speciaal eten!", tr: "O zaman annem akşam özel yemek yapıyor!", ur: "یہ وہ وقت ہے جب ماما رات کو خاص کھانا بناتی ہیں!" } },
      { speaker: "adult", startSec: 67, endSec: 80, translations: { fr: "Oui, c'est l'Iftar ! Et le cinquième pilier est le Hajj — visiter la Kaaba à La Mecque au moins une fois dans sa vie.", en: "Yes, that's Iftar! And the fifth pillar is Hajj — visiting the Kaaba in Makkah, at least once in a lifetime.", ar: "نعم، هذا الإفطار! والركن الخامس هو الحج — زيارة الكعبة في مكة مرة واحدة على الأقل في العمر.", nl: "Ja, dat is Iftar! En de vijfde zuil is Hadj — de Kaaba bezoeken in Mekka, minstens één keer in je leven.", tr: "Evet, bu İftar! Ve beşinci sütun Hac — ömürde en az bir kez Mekke'deki Kâbe'yi ziyaret etmek.", ur: "ہاں، یہ افطار ہے! اور پانچواں ستون حج ہے — زندگی میں کم از کم ایک بار مکہ میں کعبہ کی زیارت کرنا۔" } },
      { speaker: "child", startSec: 80, endSec: 84, translations: { fr: "On peut aller à La Mecque un jour ?", en: "Can we go to Makkah one day?", ar: "هل يمكننا الذهاب إلى مكة يوماً ما؟", nl: "Kunnen we op een dag naar Mekka?", tr: "Bir gün Mekke'ye gidebilir miyiz?", ur: "کیا ہم ایک دن مکہ جا سکتے ہیں؟" } },
      { speaker: "adult", startSec: 84, endSec: 95, translations: { fr: "Insha'Allah, nous irons. Ces cinq piliers sont notre façon de montrer notre amour pour Allah.", en: "Insha'Allah, we will. These five pillars are how we show our love for Allah.", ar: "إن شاء الله سنذهب. هذه الأركان الخمسة هي طريقتنا لإظهار حبنا لله.", nl: "Insha'Allah gaan we. Deze vijf zuilen zijn hoe we onze liefde voor Allah tonen.", tr: "İnşallah gideceğiz. Bu beş sütun Allah'a olan sevgimizi gösterme şeklimizdir.", ur: "ان شاء اللہ، ہم جائیں گے۔ یہ پانچ ستون اللہ سے اپنی محبت ظاہر کرنے کا طریقہ ہیں۔" } },
      { speaker: "child", startSec: 95, endSec: 100, translations: { fr: "Je veux faire les cinq !", en: "I want to do all five!", ar: "أريد أن أفعل الخمسة جميعاً!", nl: "Ik wil ze alle vijf doen!", tr: "Beşini de yapmak istiyorum!", ur: "میں پانچوں کرنا چاہتا ہوں!" } },
      { speaker: "adult", startSec: 100, endSec: 108, translations: { fr: "Et Allah t'aidera, insha'Allah. Ameen.", en: "And Allah will help you, insha'Allah. Ameen.", ar: "وسيساعدك الله، إن شاء الله. آمين.", nl: "En Allah zal je helpen, insha'Allah. Ameen.", tr: "Ve Allah sana yardım edecek, inşallah. Amin.", ur: "اور اللہ تمہاری مدد کرے گا، ان شاء اللہ۔ آمین۔" } },
    ],
  },

  // ═══ 2. Ibrahim et les étoiles ═══
  {
    id: "ibrahim-stars-video",
    emoji: "⭐",
    titleKey: "videoStories.ibrahim",
    category: "prophets",
    ageRange: "6-9",
    durationSec: 150,
    videoUrl: "https://videos.pexels.com/video-files/855564/855564-hd_1920_1080_24fps.mp4",
    videoPoster: "https://images.pexels.com/videos/855564/free-video-855564.jpg?auto=compress&w=600",
    subtitles: [
      { speaker: "child", startSec: 0, endSec: 4, translations: { fr: "Baba, pourquoi les gens adoraient des statues ?", en: "Baba, why did people worship statues?", ar: "بابا، لماذا كان الناس يعبدون التماثيل؟", nl: "Baba, waarom aanbaden mensen beelden?", tr: "Baba, insanlar neden putlara tapıyordu?", ur: "بابا، لوگ مورتیوں کی پوجا کیوں کرتے تھے؟" } },
      { speaker: "adult", startSec: 4, endSec: 12, translations: { fr: "C'est une grande question. Il y a longtemps, la plupart des gens le faisaient. Mais un garçon courageux nommé Ibrahim questionnait tout.", en: "That's a big question. Long ago, most people did. But there was one brave boy named Ibrahim who questioned everything.", ar: "هذا سؤال كبير. قديماً، كان معظم الناس يفعلون ذلك. لكن كان هناك فتى شجاع اسمه إبراهيم كان يسأل عن كل شيء.", nl: "Dat is een grote vraag. Lang geleden deden de meeste mensen dat. Maar er was een dappere jongen genaamd Ibrahim die alles in twijfel trok.", tr: "Bu büyük bir soru. Uzun zaman önce çoğu insan öyle yapıyordu. Ama her şeyi sorgulayan İbrahim adında cesur bir çocuk vardı.", ur: "یہ ایک بڑا سوال ہے۔ بہت پہلے، اکثر لوگ ایسا کرتے تھے۔ لیکن ایک بہادر لڑکا تھا جس کا نام ابراہیم تھا جو ہر چیز پر سوال کرتا تھا۔" } },
      { speaker: "child", startSec: 12, endSec: 15, translations: { fr: "Un garçon comme moi ?", en: "A boy like me?", ar: "فتى مثلي؟", nl: "Een jongen zoals ik?", tr: "Benim gibi bir çocuk mu?", ur: "میری جیسا لڑکا؟" } },
      { speaker: "adult", startSec: 15, endSec: 25, translations: { fr: "Oui ! Ibrahim a regardé les étoiles la nuit et a pensé — est-ce qu'une étoile peut être Dieu ? Mais l'étoile a disparu au matin.", en: "Yes! Ibrahim looked at the stars at night and thought — can a star be God? But the star disappeared by morning.", ar: "نعم! نظر إبراهيم إلى النجوم ليلاً وفكر — هل يمكن أن يكون النجم إلهاً؟ لكن النجم اختفى في الصباح.", nl: "Ja! Ibrahim keek 's nachts naar de sterren en dacht — kan een ster God zijn? Maar de ster verdween tegen de ochtend.", tr: "Evet! İbrahim gece yıldızlara baktı ve düşündü — bir yıldız Tanrı olabilir mi? Ama yıldız sabaha doğru kayboldu.", ur: "ہاں! ابراہیم نے رات کو ستاروں کو دیکھا اور سوچا — کیا ایک ستارہ خدا ہو سکتا ہے؟ لیکن ستارہ صبح تک غائب ہو گیا۔" } },
      { speaker: "child", startSec: 25, endSec: 29, translations: { fr: "Les étoiles disparaissent le matin !", en: "Stars go away in the morning!", ar: "النجوم تختفي في الصباح!", nl: "Sterren verdwijnen 's ochtends!", tr: "Yıldızlar sabah kayboluyor!", ur: "ستارے صبح غائب ہو جاتے ہیں!" } },
      { speaker: "adult", startSec: 29, endSec: 40, translations: { fr: "Exactement ! Alors Ibrahim a dit : un dieu ne peut pas disparaître. Il a regardé la lune — si grande et brillante. Mais la lune aussi s'est couchée.", en: "Exactly! So Ibrahim said: a god cannot disappear. He looked at the moon — so big and bright. But the moon also set.", ar: "بالضبط! فقال إبراهيم: الإله لا يمكن أن يختفي. نظر إلى القمر — كبير ومشرق. لكن القمر أيضاً غاب.", nl: "Precies! Dus Ibrahim zei: een god kan niet verdwijnen. Hij keek naar de maan — zo groot en helder. Maar de maan ging ook onder.", tr: "Aynen! İbrahim dedi ki: bir tanrı kaybolamaz. Aya baktı — çok büyük ve parlak. Ama ay da battı.", ur: "بالکل! تو ابراہیم نے کہا: خدا غائب نہیں ہو سکتا۔ اس نے چاند کو دیکھا — کتنا بڑا اور روشن۔ لیکن چاند بھی ڈوب گیا۔" } },
      { speaker: "child", startSec: 40, endSec: 44, translations: { fr: "Donc le soleil non plus n'est pas Dieu ?", en: "So the sun isn't God either?", ar: "إذن الشمس ليست إلهاً أيضاً؟", nl: "Dus de zon is ook niet God?", tr: "Yani güneş de Tanrı değil mi?", ur: "تو سورج بھی خدا نہیں ہے؟" } },
      { speaker: "adult", startSec: 44, endSec: 56, translations: { fr: "Ibrahim a dit : je tourne mon visage vers Celui qui a créé tout cela — les étoiles, la lune, le soleil. C'est Allah.", en: "Ibrahim said: I turn my face to the One who created all of this — the stars, the moon, the sun. That is Allah.", ar: "قال إبراهيم: إني وجهت وجهي للذي فطر السماوات والأرض — النجوم والقمر والشمس. ذلك هو الله.", nl: "Ibrahim zei: ik wend mijn gezicht tot Degene die dit alles heeft geschapen — de sterren, de maan, de zon. Dat is Allah.", tr: "İbrahim dedi: yüzümü tüm bunları yaratana çeviriyorum — yıldızları, ayı, güneşi. O Allah'tır.", ur: "ابراہیم نے کہا: میں اپنا چہرہ اس کی طرف پھیرتا ہوں جس نے یہ سب بنایا — ستارے، چاند، سورج۔ وہ اللہ ہے۔" } },
      { speaker: "child", startSec: 56, endSec: 60, translations: { fr: "Il a trouvé tout seul ?", en: "He figured it out all by himself?", ar: "اكتشف ذلك بنفسه؟", nl: "Kwam hij er helemaal zelf achter?", tr: "Tek başına mı anladı?", ur: "اس نے خود سمجھ لیا؟" } },
      { speaker: "adult", startSec: 60, endSec: 72, translations: { fr: "Allah a guidé son cœur. C'est pourquoi on appelle Ibrahim Khalilullah — l'ami d'Allah.", en: "Allah guided his heart. And that's why we call Ibrahim Khalilullah — the friend of Allah.", ar: "الله هدى قلبه. ولهذا نسمي إبراهيم خليل الله — صديق الله.", nl: "Allah leidde zijn hart. Daarom noemen we Ibrahim Khalilullah — de vriend van Allah.", tr: "Allah onun kalbini yönlendirdi. Bu yüzden İbrahim'e Halilullah — Allah'ın dostu diyoruz.", ur: "اللہ نے اس کے دل کی رہنمائی کی۔ اسی لیے ہم ابراہیم کو خلیل اللہ کہتے ہیں — اللہ کا دوست۔" } },
      { speaker: "child", startSec: 72, endSec: 76, translations: { fr: "Moi aussi je veux être l'ami d'Allah.", en: "I want to be Allah's friend too.", ar: "أنا أيضاً أريد أن أكون صديق الله.", nl: "Ik wil ook een vriend van Allah zijn.", tr: "Ben de Allah'ın dostu olmak istiyorum.", ur: "میں بھی اللہ کا دوست بننا چاہتا ہوں۔" } },
      { speaker: "adult", startSec: 76, endSec: 85, translations: { fr: "Chaque fois que tu pries et te souviens d'Allah, tu l'es déjà, mon chéri.", en: "Every time you pray and remember Allah, you already are, my dear.", ar: "في كل مرة تصلي وتذكر الله، أنت بالفعل كذلك يا حبيبي.", nl: "Elke keer dat je bidt en Allah herinnert, ben je dat al, lieverd.", tr: "Her dua ettiğinde ve Allah'ı andığında, zaten öylesin, canım.", ur: "ہر بار جب تم نماز پڑھتے ہو اور اللہ کو یاد کرتے ہو، تم پہلے سے ہو، میرے پیارے۔" } },
    ],
  },

  // ═══ 3. Nuh et le bateau ═══
  {
    id: "nuh-ark-video",
    emoji: "🌊",
    titleKey: "videoStories.nuh",
    category: "prophets",
    ageRange: "5-8",
    durationSec: 120,
    videoUrl: "https://videos.pexels.com/video-files/1918465/1918465-hd_1920_1080_24fps.mp4",
    videoPoster: "https://images.pexels.com/videos/1918465/free-video-1918465.jpg?auto=compress&w=600",
    subtitles: [
      { speaker: "child", startSec: 0, endSec: 4, translations: { fr: "Raconte-moi une histoire avec des animaux !", en: "Tell me a story about animals!", ar: "أخبرني قصة عن الحيوانات!", nl: "Vertel me een verhaal over dieren!", tr: "Bana hayvanlar hakkında bir hikaye anlat!", ur: "مجھے جانوروں کی کہانی سناؤ!" } },
      { speaker: "adult", startSec: 4, endSec: 12, translations: { fr: "Oh, j'en ai une parfaite. L'histoire du prophète Nuh et du grand bateau — l'Arche.", en: "Oh, I have a perfect one. The story of Prophet Nuh and the great boat — the Ark.", ar: "لدي قصة رائعة. قصة النبي نوح والسفينة العظيمة — الفلك.", nl: "Oh, ik heb er een perfecte. Het verhaal van profeet Noeh en de grote boot — de Ark.", tr: "Mükemmel bir hikayem var. Nuh Peygamber ve büyük gemi — Nuh'un Gemisi.", ur: "میرے پاس ایک بہترین کہانی ہے۔ نبی نوح اور بڑی کشتی — کشتی نوح۔" } },
      { speaker: "child", startSec: 12, endSec: 16, translations: { fr: "Un grand bateau ? Pour les animaux ?", en: "A big boat? For animals?", ar: "سفينة كبيرة؟ للحيوانات؟", nl: "Een grote boot? Voor dieren?", tr: "Büyük bir gemi mi? Hayvanlar için mi?", ur: "ایک بڑی کشتی؟ جانوروں کے لیے؟" } },
      { speaker: "adult", startSec: 16, endSec: 26, translations: { fr: "Allah a dit au prophète Nuh de construire le plus grand bateau jamais vu — et d'y amener deux de chaque animal sur Terre.", en: "Allah told Prophet Nuh to build the biggest boat ever — and to bring two of every animal on Earth.", ar: "أمر الله النبي نوح ببناء أكبر سفينة — وأن يأخذ من كل حيوان اثنين.", nl: "Allah zei tegen profeet Noeh om de grootste boot ooit te bouwen — en twee van elk dier op aarde mee te nemen.", tr: "Allah, Nuh Peygamber'e dünyadaki her hayvandan ikişer tane alıp en büyük gemiyi inşa etmesini söyledi.", ur: "اللہ نے نبی نوح سے کہا کہ اب تک کی سب سے بڑی کشتی بنائیں — اور زمین پر ہر جانور کے دو لے آئیں۔" } },
      { speaker: "child", startSec: 26, endSec: 30, translations: { fr: "Deux éléphants ? Deux lions ?", en: "Two elephants? Two lions?", ar: "فيلان؟ أسدان؟", nl: "Twee olifanten? Twee leeuwen?", tr: "İki fil? İki aslan mı?", ur: "دو ہاتھی؟ دو شیر؟" } },
      { speaker: "adult", startSec: 30, endSec: 40, translations: { fr: "Deux de chaque ! Tu imagines ? Puis il a plu pendant quarante jours et quarante nuits.", en: "Two of everything! Can you imagine? Then it rained for forty days and forty nights.", ar: "اثنان من كل شيء! تخيل! ثم أمطرت أربعين يوماً وأربعين ليلة.", nl: "Twee van alles! Kun je je dat voorstellen? Toen regende het veertig dagen en veertig nachten.", tr: "Her şeyden ikişer tane! Hayal edebiliyor musun? Sonra kırk gün kırk gece yağmur yağdı.", ur: "ہر چیز کے دو! تصور کر سکتے ہو؟ پھر چالیس دن اور چالیس رات بارش ہوئی۔" } },
      { speaker: "child", startSec: 40, endSec: 44, translations: { fr: "C'est beaucoup de pluie !", en: "That's so much rain!", ar: "هذا كثير من المطر!", nl: "Dat is heel veel regen!", tr: "Bu çok fazla yağmur!", ur: "یہ تو بہت زیادہ بارش ہے!" } },
      { speaker: "adult", startSec: 44, endSec: 56, translations: { fr: "Toute la terre était couverte d'eau. Mais Nuh, les croyants et tous les animaux étaient en sécurité sur l'Arche.", en: "The whole earth was covered with water. But Nuh and the believers and all the animals were safe on the Ark.", ar: "غطى الماء كل الأرض. لكن نوح والمؤمنين وجميع الحيوانات كانوا في أمان على السفينة.", nl: "De hele aarde was bedekt met water. Maar Noeh, de gelovigen en alle dieren waren veilig op de Ark.", tr: "Tüm dünya suyla kaplandı. Ama Nuh, müminler ve tüm hayvanlar Gemide güvendeydi.", ur: "ساری زمین پانی سے ڈھک گئی۔ لیکن نوح، ایمان والے اور تمام جانور کشتی میں محفوظ تھے۔" } },
      { speaker: "child", startSec: 56, endSec: 60, translations: { fr: "Allah les a protégés !", en: "Allah protected them!", ar: "الله حماهم!", nl: "Allah beschermde hen!", tr: "Allah onları korudu!", ur: "اللہ نے ان کی حفاظت کی!" } },
      { speaker: "adult", startSec: 60, endSec: 72, translations: { fr: "Toujours. Et quand la pluie s'est arrêtée, le bateau s'est posé sur la montagne Al-Judi.", en: "Always. And when the rain stopped, the boat rested on a mountain called Al-Judi.", ar: "دائماً. وعندما توقف المطر، استقرت السفينة على جبل الجودي.", nl: "Altijd. En toen de regen stopte, kwam de boot tot rust op een berg genaamd Al-Judi.", tr: "Her zaman. Ve yağmur durduğunda, gemi Cudi Dağı'na oturdu.", ur: "ہمیشہ۔ اور جب بارش رکی، کشتی الجودی پہاڑ پر ٹھہر گئی۔" } },
      { speaker: "child", startSec: 72, endSec: 76, translations: { fr: "Les animaux sont sortis ?", en: "Did the animals go free?", ar: "هل خرجت الحيوانات حرة؟", nl: "Zijn de dieren vrijgelaten?", tr: "Hayvanlar serbest mi kaldı?", ur: "کیا جانور آزاد ہو گئے؟" } },
      { speaker: "adult", startSec: 76, endSec: 90, translations: { fr: "Oui ! Ils sont sortis et la terre était toute neuve. La leçon ? Quand on fait confiance à Allah, Il nous sauve toujours.", en: "Yes! They came out and the earth was new and fresh. The lesson? When we trust Allah, He always saves us.", ar: "نعم! خرجوا والأرض كانت جديدة. الدرس؟ عندما نثق بالله، ينجينا دائماً.", nl: "Ja! Ze kwamen eruit en de aarde was nieuw en fris. De les? Als we op Allah vertrouwen, redt Hij ons altijd.", tr: "Evet! Dışarı çıktılar ve dünya yepyeniydi. Ders? Allah'a güvendiğimizde, O bizi her zaman kurtarır.", ur: "ہاں! وہ باہر آئے اور زمین نئی اور تازہ تھی۔ سبق؟ جب ہم اللہ پر بھروسہ کرتے ہیں، وہ ہمیشہ ہمیں بچاتا ہے۔" } },
      { speaker: "child", startSec: 90, endSec: 94, translations: { fr: "Moi je fais confiance à Allah !", en: "I trust Allah!", ar: "أنا أثق بالله!", nl: "Ik vertrouw op Allah!", tr: "Ben Allah'a güveniyorum!", ur: "مجھے اللہ پر بھروسہ ہے!" } },
      { speaker: "adult", startSec: 94, endSec: 100, translations: { fr: "Et Il t'aime pour ça. Masha'Allah.", en: "And He loves you for it. Masha'Allah.", ar: "وهو يحبك لذلك. ما شاء الله.", nl: "En Hij houdt van je daarvoor. Masha'Allah.", tr: "Ve O seni bunun için seviyor. Maşallah.", ur: "اور وہ تم سے اس لیے محبت کرتا ہے۔ ماشاءاللہ۔" } },
    ],
  },

  // ═══ 4. Comment faire la Salah ═══
  {
    id: "salah-video",
    emoji: "🙏",
    titleKey: "videoStories.salah",
    category: "pillars",
    ageRange: "5-8",
    durationSec: 120,
    videoUrl: "https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4",
    videoPoster: "https://images.pexels.com/videos/3571264/free-video-3571264.jpg?auto=compress&w=600",
    subtitles: [
      { speaker: "child", startSec: 0, endSec: 4, translations: { fr: "Pourquoi on prie cinq fois par jour ?", en: "Why do we pray five times a day?", ar: "لماذا نصلي خمس مرات في اليوم؟", nl: "Waarom bidden we vijf keer per dag?", tr: "Neden günde beş vakit namaz kılıyoruz?", ur: "ہم دن میں پانچ بار نماز کیوں پڑھتے ہیں؟" } },
      { speaker: "adult", startSec: 4, endSec: 12, translations: { fr: "Parce qu'Allah nous aime, et la prière est notre façon de Lui parler — cinq conversations spéciales chaque jour.", en: "Because Allah loves us, and prayer is our way to talk to Him — five special conversations every day.", ar: "لأن الله يحبنا، والصلاة هي طريقتنا للتحدث معه — خمس محادثات خاصة كل يوم.", nl: "Omdat Allah van ons houdt, en gebed is onze manier om met Hem te praten — vijf speciale gesprekken elke dag.", tr: "Çünkü Allah bizi seviyor ve namaz O'nunla konuşma yolumuz — her gün beş özel sohbet.", ur: "کیونکہ اللہ ہم سے محبت کرتا ہے، اور نماز اس سے بات کرنے کا طریقہ ہے — ہر دن پانچ خاص گفتگو۔" } },
      { speaker: "child", startSec: 12, endSec: 16, translations: { fr: "On PARLE à Allah dans la prière ?", en: "We TALK to Allah in prayer?", ar: "نحن نتحدث مع الله في الصلاة؟", nl: "We PRATEN met Allah in gebed?", tr: "Namazda Allah'la KONUŞUYOR muyuz?", ur: "ہم نماز میں اللہ سے بات کرتے ہیں؟" } },
      { speaker: "adult", startSec: 16, endSec: 28, translations: { fr: "Chaque mot d'Al-Fatiha est une conversation. Quand tu dis Alhamdulillah, Allah répond : Mon serviteur M'a loué.", en: "Every word of Al-Fatiha is a conversation. When you say Alhamdulillah, Allah answers: My servant has praised Me.", ar: "كل كلمة في الفاتحة هي حوار. عندما تقول الحمد لله، يجيب الله: حمدني عبدي.", nl: "Elk woord van Al-Fatiha is een gesprek. Als je Alhamdulillah zegt, antwoordt Allah: Mijn dienaar heeft Mij geprezen.", tr: "Fatiha'nın her kelimesi bir sohbettir. Elhamdülillah dediğinde, Allah cevap verir: Kulum Beni övdü.", ur: "الفاتحہ کا ہر لفظ ایک گفتگو ہے۔ جب تم الحمدللہ کہتے ہو، اللہ جواب دیتا ہے: میرے بندے نے میری تعریف کی۔" } },
      { speaker: "child", startSec: 28, endSec: 32, translations: { fr: "Allah me répond ?!", en: "Allah answers me?!", ar: "الله يجيبني؟!", nl: "Allah antwoordt mij?!", tr: "Allah bana cevap mı veriyor?!", ur: "اللہ مجھے جواب دیتا ہے؟!" } },
      { speaker: "adult", startSec: 32, endSec: 44, translations: { fr: "À chaque fois. Quand tu t'inclines en Ruku', tu montres à Allah combien Il est grand. Et quand tu poses ton front au sol en Sujud...", en: "Every single time. When you bow in Ruku', you show Allah how great He is. When you put your forehead on the ground in Sujud...", ar: "في كل مرة. عندما تركع في الركوع، تظهر لله عظمته. وعندما تضع جبهتك على الأرض في السجود...", nl: "Elke keer. Wanneer je buigt in Rukoe', toon je Allah hoe groot Hij is. Als je je voorhoofd op de grond legt in Sudjoed...", tr: "Her seferinde. Rükûda eğildiğinde, Allah'a ne kadar yüce olduğunu gösterirsin. Secdede alnını yere koyduğunda...", ur: "ہر بار۔ جب تم رکوع میں جھکتے ہو، تم اللہ کو دکھاتے ہو وہ کتنا عظیم ہے۔ جب تم سجدے میں ماتھا زمین پر رکھتے ہو..." } },
      { speaker: "child", startSec: 44, endSec: 48, translations: { fr: "C'est ma partie préférée !", en: "That's my favourite part!", ar: "هذا الجزء المفضل لدي!", nl: "Dat is mijn favoriete deel!", tr: "Bu benim en sevdiğim kısım!", ur: "یہ میرا پسندیدہ حصہ ہے!" } },
      { speaker: "adult", startSec: 48, endSec: 60, translations: { fr: "En Sujud, tu es le plus proche d'Allah de toute ta journée. C'est la position la plus belle.", en: "In Sujud, you are closest to Allah of any moment in your day. It's the most beautiful position.", ar: "في السجود، أنت أقرب ما تكون إلى الله في يومك كله. إنها أجمل وضعية.", nl: "In Sudjoed ben je het dichtst bij Allah van elk moment in je dag. Het is de mooiste positie.", tr: "Secdede, gününüzün herhangi bir anından Allah'a en yakın olursunuz. En güzel pozisyondur.", ur: "سجدے میں، تم اپنے دن کے کسی بھی لمحے سے اللہ کے سب سے قریب ہوتے ہو۔ یہ سب سے خوبصورت حالت ہے۔" } },
      { speaker: "child", startSec: 60, endSec: 65, translations: { fr: "Je ne savais pas ! Je ferai des Sujud en plus !", en: "I didn't know that! I'll do extra Sujud!", ar: "لم أكن أعلم! سأسجد أكثر!", nl: "Dat wist ik niet! Ik ga extra Sudjoed doen!", tr: "Bunu bilmiyordum! Ekstra Secde yapacağım!", ur: "مجھے نہیں معلوم تھا! میں اضافی سجدے کروں گا!" } },
      { speaker: "adult", startSec: 65, endSec: 78, translations: { fr: "C'est la prière Nafl — de l'amour en plus pour Allah. Il t'aimera en retour, abondamment.", en: "That's called Nafl prayer — extra love for Allah. He will love you back, abundantly.", ar: "هذه صلاة النافلة — حب إضافي لله. وسيحبك بالمقابل، بوفرة.", nl: "Dat heet Nafl-gebed — extra liefde voor Allah. Hij zal overvloedig van je houden.", tr: "Buna Nafile namaz denir — Allah için ekstra sevgi. O da seni bol bol sevecek.", ur: "اسے نفل نماز کہتے ہیں — اللہ کے لیے اضافی محبت۔ وہ تم سے بے حساب محبت کرے گا۔" } },
    ],
  },

  // ═══ 5. Les 99 Noms d'Allah ═══
  {
    id: "names-allah-video",
    emoji: "✨",
    titleKey: "videoStories.namesAllah",
    category: "quran",
    ageRange: "7-10",
    durationSec: 120,
    videoUrl: "https://videos.pexels.com/video-files/4763824/4763824-hd_1920_1080_24fps.mp4",
    videoPoster: "https://images.pexels.com/videos/4763824/free-video-4763824.jpg?auto=compress&w=600",
    subtitles: [
      { speaker: "child", startSec: 0, endSec: 4, translations: { fr: "Est-ce qu'Allah a un nom ?", en: "Does Allah have a name?", ar: "هل لله اسم؟", nl: "Heeft Allah een naam?", tr: "Allah'ın bir adı var mı?", ur: "کیا اللہ کا کوئی نام ہے؟" } },
      { speaker: "adult", startSec: 4, endSec: 12, translations: { fr: "Allah a quatre-vingt-dix-neuf beaux noms. Chacun nous dit quelque chose d'incroyable sur Lui.", en: "Allah has ninety-nine beautiful names. Each one tells us something amazing about Him.", ar: "لله تسعة وتسعون اسماً حسناً. كل اسم يخبرنا شيئاً مذهلاً عنه.", nl: "Allah heeft negenennegentig prachtige namen. Elk vertelt ons iets geweldigs over Hem.", tr: "Allah'ın doksan dokuz güzel ismi var. Her biri bize O'nun hakkında harika bir şey anlatıyor.", ur: "اللہ کے ننانوے خوبصورت نام ہیں۔ ہر ایک ہمیں اس کے بارے میں حیرت انگیز بات بتاتا ہے۔" } },
      { speaker: "child", startSec: 12, endSec: 16, translations: { fr: "Quatre-vingt-dix-neuf ?! C'est beaucoup !", en: "Ninety-nine?! That's so many!", ar: "تسعة وتسعون؟! هذا كثير!", nl: "Negenennegentig?! Dat zijn er zoveel!", tr: "Doksan dokuz mu?! Bu çok fazla!", ur: "ننانوے؟! یہ تو بہت زیادہ ہیں!" } },
      { speaker: "adult", startSec: 16, endSec: 26, translations: { fr: "Le premier est Allah — l'Unique. Puis Ar-Rahman — Le Tout Miséricordieux, Celui qui aime tout le monde.", en: "The first is Allah — The One. Then Ar-Rahman — The Most Merciful, the One who loves everyone.", ar: "الأول هو الله — الواحد. ثم الرحمن — الذي يحب الجميع.", nl: "De eerste is Allah — De Enige. Dan Ar-Rahman — De Meest Barmhartige, Die van iedereen houdt.", tr: "İlki Allah — Tek Olan. Sonra Er-Rahman — En Merhametli, herkesi seven.", ur: "پہلا اللہ ہے — ایک۔ پھر الرحمٰن — سب سے مہربان، جو سب سے محبت کرتا ہے۔" } },
      { speaker: "child", startSec: 26, endSec: 30, translations: { fr: "Même les gens qui font des erreurs ?", en: "Even people who make mistakes?", ar: "حتى الناس الذين يخطئون؟", nl: "Zelfs mensen die fouten maken?", tr: "Hata yapan insanlar bile mi?", ur: "وہ لوگ بھی جو غلطیاں کرتے ہیں؟" } },
      { speaker: "adult", startSec: 30, endSec: 40, translations: { fr: "Surtout eux. Puis Ar-Raheem — Le Très Miséricordieux, spécialement pour les croyants.", en: "Especially them. Then Ar-Raheem — The Most Compassionate, specifically for believers.", ar: "خاصة هؤلاء. ثم الرحيم — الأكثر رحمة، خاصة للمؤمنين.", nl: "Vooral hen. Dan Ar-Raheem — De Meest Barmhartige, specifiek voor gelovigen.", tr: "Özellikle onlar. Sonra Er-Rahîm — En Şefkatli, özellikle müminler için.", ur: "خاص طور پر وہ۔ پھر الرحیم — سب سے مہربان، خاص طور پر ایمان والوں کے لیے۔" } },
      { speaker: "child", startSec: 40, endSec: 44, translations: { fr: "Quel sera mon préféré ?", en: "What's my favourite going to be?", ar: "ما هو المفضل لدي؟", nl: "Welke wordt mijn favoriet?", tr: "Favori ismim hangisi olacak?", ur: "میرا پسندیدہ کون سا ہوگا؟" } },
      { speaker: "adult", startSec: 44, endSec: 54, translations: { fr: "Que dis-tu d'Al-Wadud — Le Très Aimant. Allah t'aime plus que n'importe quel parent.", en: "How about Al-Wadud — The Loving. Allah loves you more than any parent ever could.", ar: "ما رأيك في الودود — المحب. الله يحبك أكثر من أي والد.", nl: "Wat vind je van Al-Wadud — De Liefdevolle. Allah houdt meer van je dan welke ouder ook.", tr: "El-Vedûd ne dersin — Seven. Allah seni herhangi bir ebeveynden daha çok seviyor.", ur: "الودود کیسا رہے گا — محبت کرنے والا۔ اللہ تم سے کسی بھی والدین سے زیادہ محبت کرتا ہے۔" } },
      { speaker: "child", startSec: 54, endSec: 58, translations: { fr: "Plus que Mama m'aime ?", en: "More than Mama loves me?", ar: "أكثر من حب ماما لي؟", nl: "Meer dan Mama van me houdt?", tr: "Annemin beni sevmesinden daha çok mu?", ur: "ماما کی محبت سے بھی زیادہ؟" } },
      { speaker: "adult", startSec: 58, endSec: 70, translations: { fr: "Le Prophète Muhammad ﷺ a dit que la miséricorde d'Allah est soixante-dix fois plus grande que l'amour d'une mère.", en: "Prophet Muhammad ﷺ said Allah's mercy is seventy times greater than a mother's love.", ar: "قال النبي محمد ﷺ إن رحمة الله أعظم سبعين مرة من حب الأم.", nl: "Profeet Mohammed ﷺ zei dat Allah's genade zeventig keer groter is dan de liefde van een moeder.", tr: "Peygamber Muhammed ﷺ, Allah'ın merhametinin bir annenin sevgisinden yetmiş kat daha büyük olduğunu söyledi.", ur: "نبی محمد ﷺ نے فرمایا کہ اللہ کی رحمت ماں کی محبت سے ستر گنا زیادہ ہے۔" } },
      { speaker: "child", startSec: 70, endSec: 76, translations: { fr: "C'est... je ne peux même pas imaginer autant d'amour.", en: "That's... I can't even imagine that much love.", ar: "هذا... لا أستطيع حتى تخيل هذا القدر من الحب.", nl: "Dat is... ik kan me niet eens zoveel liefde voorstellen.", tr: "Bu... bu kadar sevgiyi hayal bile edemiyorum.", ur: "یہ... میں اتنی محبت کا تصور بھی نہیں کر سکتا۔" } },
      { speaker: "adult", startSec: 76, endSec: 86, translations: { fr: "C'est tout le sens. L'amour d'Allah est au-delà de l'imagination. Quand tu appelles Ses noms, Il écoute.", en: "That's the point. Allah's love is beyond imagination. When you call His names, He listens.", ar: "هذا هو المقصود. حب الله يفوق الخيال. عندما تنادي بأسمائه، يسمعك.", nl: "Dat is het punt. Allah's liefde gaat voorbij de verbeelding. Als je Zijn namen roept, luistert Hij.", tr: "İşte mesele bu. Allah'ın sevgisi hayal ötesidir. İsimlerini çağırdığında, O dinler.", ur: "یہی بات ہے۔ اللہ کی محبت تصور سے بالاتر ہے۔ جب تم اس کے نام پکارتے ہو، وہ سنتا ہے۔" } },
      { speaker: "child", startSec: 86, endSec: 92, translations: { fr: "Ya Allah, Ya Rahman, Ya Raheem !", en: "Ya Allah, Ya Rahman, Ya Raheem!", ar: "يا الله، يا رحمن، يا رحيم!", nl: "Ya Allah, Ya Rahman, Ya Raheem!", tr: "Ya Allah, Ya Rahman, Ya Rahim!", ur: "یا اللہ، یا رحمٰن، یا رحیم!" } },
      { speaker: "adult", startSec: 92, endSec: 100, translations: { fr: "Ameen. Il t'a entendu.", en: "Ameen. He heard you.", ar: "آمين. لقد سمعك.", nl: "Ameen. Hij heeft je gehoord.", tr: "Amin. Seni duydu.", ur: "آمین۔ اس نے تمہیں سنا۔" } },
    ],
  },
];
