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
 * Split texte arabe en mots
 */
export const splitArabicText = (text: string): string[] => {
  return text.split(/\s+/).filter(word => word.length > 0);
};
