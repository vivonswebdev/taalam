/**
 * Normalisation texte arabe pour comparaisons
 * Enlève harakats (voyelles) mais GARDE pour affichage
 */
export const normalizeArabic = (text: string): string => {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // Enlever Tashkeel
    .replace(/\u0640/g, '')                 // Enlever Tatweel
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Comparaison mots arabes sans tenir compte des voyelles
 */
export const compareArabicWords = (word1: string, word2: string): boolean => {
  return normalizeArabic(word1) === normalizeArabic(word2);
};

/**
 * Split texte arabe en mots (garde ordre naturel, pas de reverse)
 */
export const splitArabicText = (text: string): string[] => {
  return text.split(/\s+/).filter(word => word.length > 0);
};

/**
 * Obtenir texte complet d'une sourate (mock)
 * TODO: Remplacer par vraie API Quran
 */
export const getSurahText = (surahNumber: number): string => {
  const surahTexts: Record<number, string> = {
    114: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ مَلِكِ ٱلنَّاسِ إِلَٰهِ ٱلنَّاسِ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
    113: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ مِن شَرِّ مَا خَلَقَ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    112: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ ٱللَّهُ ٱلصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ",
    111: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ تَبَّتْ يَدَآ أَبِى لَهَبٍ وَتَبَّ مَآ أَغْنَىٰ عَنْهُ مَالُهُۥ وَمَا كَسَبَ سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ وَٱمْرَأَتُهُۥ حَمَّالَةَ ٱلْحَطَبِ فِى جِيدِهَا حَبْلٌ مِّن مَّسَدٍۭ",
    110: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ إِذَا جَآءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ وَرَأَيْتَ ٱلنَّاسَ يَدْخُلُونَ فِى دِينِ ٱللَّهِ أَفْوَاجًا فَسَبِّحْ بِحَمْدِ رَبِّكَ وَٱسْتَغْفِرْهُ إِنَّهُۥ كَانَ تَوَّابًۢا",
  };
  return surahTexts[surahNumber] || surahTexts[114];
};
