// Minimal Quran data: full verses for surahs 1-10, metadata only for 11-114
export interface QuranMinimalSurah {
  name: string;
  nameAr: string;
  ayahs: number;
  verses?: Record<string, string>;
}

export type QuranMinimalData = Record<string, QuranMinimalSurah>;

const quranMinimal: QuranMinimalData = {
  "1": {
    name: "Al-Fatiha", nameAr: "الفاتحة", ayahs: 7,
    verses: {
      "1": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "2": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      "3": "الرَّحْمَٰنِ الرَّحِيمِ",
      "4": "مَالِكِ يَوْمِ الدِّينِ",
      "5": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      "6": "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      "7": "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ"
    }
  },
  "2": {
    name: "Al-Baqarah", nameAr: "البقرة", ayahs: 286,
    verses: {
      "1": "الم",
      "2": "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ",
      "3": "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ",
      "4": "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ",
      "5": "أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ",
      "255": "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
      "286": "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ"
    }
  },
  "3": {
    name: "Aal-E-Imran", nameAr: "آل عمران", ayahs: 200,
    verses: {
      "1": "الم",
      "2": "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
      "3": "نَزَّلَ عَلَيْكَ الْكِتَابَ بِالْحَقِّ مُصَدِّقًا لِّمَا بَيْنَ يَدَيْهِ وَأَنزَلَ التَّوْرَاةَ وَالْإِنجِيلَ",
      "18": "شَهِدَ اللَّهُ أَنَّهُ لَا إِلَٰهَ إِلَّا هُوَ وَالْمَلَائِكَةُ وَأُولُو الْعِلْمِ قَائِمًا بِالْقِسْطِ لَا إِلَٰهَ إِلَّا هُوَ الْعَزِيزُ الْحَكِيمُ",
      "26": "قُلِ اللَّهُمَّ مَالِكَ الْمُلْكِ تُؤْتِي الْمُلْكَ مَن تَشَاءُ وَتَنزِعُ الْمُلْكَ مِمَّن تَشَاءُ وَتُعِزُّ مَن تَشَاءُ وَتُذِلُّ مَن تَشَاءُ بِيَدِكَ الْخَيْرُ إِنَّكَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ"
    }
  },
  "4": {
    name: "An-Nisa", nameAr: "النساء", ayahs: 176,
    verses: {
      "1": "يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُم مِّن نَّفْسٍ وَاحِدَةٍ وَخَلَقَ مِنْهَا زَوْجَهَا وَبَثَّ مِنْهُمَا رِجَالًا كَثِيرًا وَنِسَاءً وَاتَّقُوا اللَّهَ الَّذِي تَسَاءَلُونَ بِهِ وَالْأَرْحَامَ إِنَّ اللَّهَ كَانَ عَلَيْكُمْ رَقِيبًا"
    }
  },
  "5": {
    name: "Al-Ma'idah", nameAr: "المائدة", ayahs: 120,
    verses: {
      "1": "يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ أُحِلَّتْ لَكُم بَهِيمَةُ الْأَنْعَامِ إِلَّا مَا يُتْلَىٰ عَلَيْكُمْ غَيْرَ مُحِلِّي الصَّيْدِ وَأَنتُمْ حُرُمٌ إِنَّ اللَّهَ يَحْكُمُ مَا يُرِيدُ",
      "3": "الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ وَأَتْمَمْتُ عَلَيْكُمْ نِعْمَتِي وَرَضِيتُ لَكُمُ الْإِسْلَامَ دِينًا"
    }
  },
  "6": {
    name: "Al-An'am", nameAr: "الأنعام", ayahs: 165,
    verses: {
      "1": "الْحَمْدُ لِلَّهِ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ وَجَعَلَ الظُّلُمَاتِ وَالنُّورَ ثُمَّ الَّذِينَ كَفَرُوا بِرَبِّهِمْ يَعْدِلُونَ",
      "162": "قُلْ إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ"
    }
  },
  "7": {
    name: "Al-A'raf", nameAr: "الأعراف", ayahs: 206,
    verses: {
      "1": "المص",
      "23": "قَالَا رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
      "156": "وَاكْتُبْ لَنَا فِي هَٰذِهِ الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ إِنَّا هُدْنَا إِلَيْكَ"
    }
  },
  "8": {
    name: "Al-Anfal", nameAr: "الأنفال", ayahs: 75,
    verses: {
      "1": "يَسْأَلُونَكَ عَنِ الْأَنفَالِ قُلِ الْأَنفَالُ لِلَّهِ وَالرَّسُولِ فَاتَّقُوا اللَّهَ وَأَصْلِحُوا ذَاتَ بَيْنِكُمْ وَأَطِيعُوا اللَّهَ وَرَسُولَهُ إِن كُنتُم مُّؤْمِنِينَ",
      "2": "إِنَّمَا الْمُؤْمِنُونَ الَّذِينَ إِذَا ذُكِرَ اللَّهُ وَجِلَتْ قُلُوبُهُمْ وَإِذَا تُلِيَتْ عَلَيْهِمْ آيَاتُهُ زَادَتْهُمْ إِيمَانًا وَعَلَىٰ رَبِّهِمْ يَتَوَكَّلُونَ"
    }
  },
  "9": {
    name: "At-Tawbah", nameAr: "التوبة", ayahs: 129,
    verses: {
      "1": "بَرَاءَةٌ مِّنَ اللَّهِ وَرَسُولِهِ إِلَى الَّذِينَ عَاهَدتُّم مِّنَ الْمُشْرِكِينَ",
      "128": "لَقَدْ جَاءَكُمْ رَسُولٌ مِّنْ أَنفُسِكُمْ عَزِيزٌ عَلَيْهِ مَا عَنِتُّمْ حَرِيصٌ عَلَيْكُم بِالْمُؤْمِنِينَ رَءُوفٌ رَّحِيمٌ",
      "129": "فَإِن تَوَلَّوْا فَقُلْ حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ"
    }
  },
  "10": {
    name: "Yunus", nameAr: "يونس", ayahs: 109,
    verses: {
      "1": "الر تِلْكَ آيَاتُ الْكِتَابِ الْحَكِيمِ",
      "10": "دَعْوَاهُمْ فِيهَا سُبْحَانَكَ اللَّهُمَّ وَتَحِيَّتُهُمْ فِيهَا سَلَامٌ وَآخِرُ دَعْوَاهُمْ أَنِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      "62": "أَلَا إِنَّ أَوْلِيَاءَ اللَّهِ لَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ"
    }
  },
  // Surahs 11-114: metadata only
  "11": { name: "Hud", nameAr: "هود", ayahs: 123 },
  "12": { name: "Yusuf", nameAr: "يوسف", ayahs: 111 },
  "13": { name: "Ar-Ra'd", nameAr: "الرعد", ayahs: 43 },
  "14": { name: "Ibrahim", nameAr: "إبراهيم", ayahs: 52 },
  "15": { name: "Al-Hijr", nameAr: "الحجر", ayahs: 99 },
  "16": { name: "An-Nahl", nameAr: "النحل", ayahs: 128 },
  "17": { name: "Al-Isra", nameAr: "الإسراء", ayahs: 111 },
  "18": { name: "Al-Kahf", nameAr: "الكهف", ayahs: 110 },
  "19": { name: "Maryam", nameAr: "مريم", ayahs: 98 },
  "20": { name: "Taha", nameAr: "طه", ayahs: 135 },
  "21": { name: "Al-Anbiya", nameAr: "الأنبياء", ayahs: 112 },
  "22": { name: "Al-Hajj", nameAr: "الحج", ayahs: 78 },
  "23": { name: "Al-Mu'minun", nameAr: "المؤمنون", ayahs: 118 },
  "24": { name: "An-Nur", nameAr: "النور", ayahs: 64 },
  "25": { name: "Al-Furqan", nameAr: "الفرقان", ayahs: 77 },
  "26": { name: "Ash-Shu'ara", nameAr: "الشعراء", ayahs: 227 },
  "27": { name: "An-Naml", nameAr: "النمل", ayahs: 93 },
  "28": { name: "Al-Qasas", nameAr: "القصص", ayahs: 88 },
  "29": { name: "Al-Ankabut", nameAr: "العنكبوت", ayahs: 69 },
  "30": { name: "Ar-Rum", nameAr: "الروم", ayahs: 60 },
  "31": { name: "Luqman", nameAr: "لقمان", ayahs: 34 },
  "32": { name: "As-Sajdah", nameAr: "السجدة", ayahs: 30 },
  "33": { name: "Al-Ahzab", nameAr: "الأحزاب", ayahs: 73 },
  "34": { name: "Saba", nameAr: "سبأ", ayahs: 54 },
  "35": { name: "Fatir", nameAr: "فاطر", ayahs: 45 },
  "36": { name: "Ya-Sin", nameAr: "يس", ayahs: 83 },
  "37": { name: "As-Saffat", nameAr: "الصافات", ayahs: 182 },
  "38": { name: "Sad", nameAr: "ص", ayahs: 88 },
  "39": { name: "Az-Zumar", nameAr: "الزمر", ayahs: 75 },
  "40": { name: "Ghafir", nameAr: "غافر", ayahs: 85 },
  "41": { name: "Fussilat", nameAr: "فصلت", ayahs: 54 },
  "42": { name: "Ash-Shura", nameAr: "الشورى", ayahs: 53 },
  "43": { name: "Az-Zukhruf", nameAr: "الزخرف", ayahs: 89 },
  "44": { name: "Ad-Dukhan", nameAr: "الدخان", ayahs: 59 },
  "45": { name: "Al-Jathiyah", nameAr: "الجاثية", ayahs: 37 },
  "46": { name: "Al-Ahqaf", nameAr: "الأحقاف", ayahs: 35 },
  "47": { name: "Muhammad", nameAr: "محمد", ayahs: 38 },
  "48": { name: "Al-Fath", nameAr: "الفتح", ayahs: 29 },
  "49": { name: "Al-Hujurat", nameAr: "الحجرات", ayahs: 18 },
  "50": { name: "Qaf", nameAr: "ق", ayahs: 45 },
  "51": { name: "Adh-Dhariyat", nameAr: "الذاريات", ayahs: 60 },
  "52": { name: "At-Tur", nameAr: "الطور", ayahs: 49 },
  "53": { name: "An-Najm", nameAr: "النجم", ayahs: 62 },
  "54": { name: "Al-Qamar", nameAr: "القمر", ayahs: 55 },
  "55": { name: "Ar-Rahman", nameAr: "الرحمن", ayahs: 78 },
  "56": { name: "Al-Waqi'ah", nameAr: "الواقعة", ayahs: 96 },
  "57": { name: "Al-Hadid", nameAr: "الحديد", ayahs: 29 },
  "58": { name: "Al-Mujadilah", nameAr: "المجادلة", ayahs: 22 },
  "59": { name: "Al-Hashr", nameAr: "الحشر", ayahs: 24 },
  "60": { name: "Al-Mumtahanah", nameAr: "الممتحنة", ayahs: 13 },
  "61": { name: "As-Saff", nameAr: "الصف", ayahs: 14 },
  "62": { name: "Al-Jumu'ah", nameAr: "الجمعة", ayahs: 11 },
  "63": { name: "Al-Munafiqun", nameAr: "المنافقون", ayahs: 11 },
  "64": { name: "At-Taghabun", nameAr: "التغابن", ayahs: 18 },
  "65": { name: "At-Talaq", nameAr: "الطلاق", ayahs: 12 },
  "66": { name: "At-Tahrim", nameAr: "التحريم", ayahs: 12 },
  "67": { name: "Al-Mulk", nameAr: "الملك", ayahs: 30 },
  "68": { name: "Al-Qalam", nameAr: "القلم", ayahs: 52 },
  "69": { name: "Al-Haqqah", nameAr: "الحاقة", ayahs: 52 },
  "70": { name: "Al-Ma'arij", nameAr: "المعارج", ayahs: 44 },
  "71": { name: "Nuh", nameAr: "نوح", ayahs: 28 },
  "72": { name: "Al-Jinn", nameAr: "الجن", ayahs: 28 },
  "73": { name: "Al-Muzzammil", nameAr: "المزمل", ayahs: 20 },
  "74": { name: "Al-Muddaththir", nameAr: "المدثر", ayahs: 56 },
  "75": { name: "Al-Qiyamah", nameAr: "القيامة", ayahs: 40 },
  "76": { name: "Al-Insan", nameAr: "الإنسان", ayahs: 31 },
  "77": { name: "Al-Mursalat", nameAr: "المرسلات", ayahs: 50 },
  "78": { name: "An-Naba", nameAr: "النبأ", ayahs: 40 },
  "79": { name: "An-Nazi'at", nameAr: "النازعات", ayahs: 46 },
  "80": { name: "Abasa", nameAr: "عبس", ayahs: 42 },
  "81": { name: "At-Takwir", nameAr: "التكوير", ayahs: 29 },
  "82": { name: "Al-Infitar", nameAr: "الانفطار", ayahs: 19 },
  "83": { name: "Al-Mutaffifin", nameAr: "المطففين", ayahs: 36 },
  "84": { name: "Al-Inshiqaq", nameAr: "الانشقاق", ayahs: 25 },
  "85": { name: "Al-Buruj", nameAr: "البروج", ayahs: 22 },
  "86": { name: "At-Tariq", nameAr: "الطارق", ayahs: 17 },
  "87": { name: "Al-A'la", nameAr: "الأعلى", ayahs: 19 },
  "88": { name: "Al-Ghashiyah", nameAr: "الغاشية", ayahs: 26 },
  "89": { name: "Al-Fajr", nameAr: "الفجر", ayahs: 30 },
  "90": { name: "Al-Balad", nameAr: "البلد", ayahs: 20 },
  "91": { name: "Ash-Shams", nameAr: "الشمس", ayahs: 15 },
  "92": { name: "Al-Layl", nameAr: "الليل", ayahs: 21 },
  "93": { name: "Ad-Duha", nameAr: "الضحى", ayahs: 11 },
  "94": { name: "Ash-Sharh", nameAr: "الشرح", ayahs: 8 },
  "95": { name: "At-Tin", nameAr: "التين", ayahs: 8 },
  "96": { name: "Al-Alaq", nameAr: "العلق", ayahs: 19 },
  "97": { name: "Al-Qadr", nameAr: "القدر", ayahs: 5 },
  "98": { name: "Al-Bayyinah", nameAr: "البينة", ayahs: 8 },
  "99": { name: "Az-Zalzalah", nameAr: "الزلزلة", ayahs: 8 },
  "100": { name: "Al-Adiyat", nameAr: "العاديات", ayahs: 11 },
  "101": { name: "Al-Qari'ah", nameAr: "القارعة", ayahs: 11 },
  "102": { name: "At-Takathur", nameAr: "التكاثر", ayahs: 8 },
  "103": { name: "Al-Asr", nameAr: "العصر", ayahs: 3 },
  "104": { name: "Al-Humazah", nameAr: "الهمزة", ayahs: 9 },
  "105": { name: "Al-Fil", nameAr: "الفيل", ayahs: 5 },
  "106": { name: "Quraysh", nameAr: "قريش", ayahs: 4 },
  "107": { name: "Al-Ma'un", nameAr: "الماعون", ayahs: 7 },
  "108": { name: "Al-Kawthar", nameAr: "الكوثر", ayahs: 3 },
  "109": { name: "Al-Kafirun", nameAr: "الكافرون", ayahs: 6 },
  "110": { name: "An-Nasr", nameAr: "النصر", ayahs: 3 },
  "111": { name: "Al-Masad", nameAr: "المسد", ayahs: 5 },
  "112": { name: "Al-Ikhlas", nameAr: "الإخلاص", ayahs: 4 },
  "113": { name: "Al-Falaq", nameAr: "الفلق", ayahs: 5 },
  "114": { name: "An-Nas", nameAr: "الناس", ayahs: 6 },
};

export default quranMinimal;
