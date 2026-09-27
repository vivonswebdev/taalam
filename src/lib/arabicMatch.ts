// ─── Arabic text normalization & fuzzy word matching ─────────
// Shared by the recitation hooks so every mode grades the same way.

export function normalizeArabic(text: string): string {
  return text
    // Invisible direction marks: iOS prefixes transcripts with U+200F
    .replace(/[\u200B-\u200F\u061C\u202A-\u202E\u2066-\u2069\uFEFF]/g, "")
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۜ۟-ۤۧ-۪ۨ-ۭ࢐-࢑࣓-ࣿ]/g, "")
    .replace(/[آأإٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "")
    .replace(/[ې-ەۥ-ۦ]/g, "")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

/** 1 = identical, 0 = nothing in common (edit-distance ratio). */
export function similarityScore(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;
  return 1 - levenshtein(a, b) / maxLen;
}

const BASMALA = ["بسم", "الله", "الرحمن", "الرحيم"];

/** Most reciters start with the basmala, which is not an ayah (except in Al-Fatiha). */
export function stripLeadingBasmala(transcript: string): string {
  const words = normalizeArabic(transcript).split(/\s+/).filter(Boolean);
  const head = words.slice(0, 4);
  return BASMALA.every((w, i) => head[i] === w) ? words.slice(4).join(" ") : transcript;
}
