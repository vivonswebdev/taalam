/**
 * Hizb, Nisf, Tumun positions in the Quran.
 * Each Hizb has 4 quarters (rub'/tumun). 60 Hizb total = 240 quarters.
 * Positions defined as { surah, ayah }.
 * Sources: quran-metadata / mushaf standard positions.
 */

export interface HizbMarker {
  hizb: number;
  position: "hizb" | "nisf" | "rub"; // hizb start, half, quarter
  surah: number;
  ayah: number;
  label: string; // Display label
}

// Approximate Hizb start positions (surah:ayah) for the 60 Hizb
// Based on the standard Uthmani mushaf division
const HIZB_STARTS: [number, number][] = [
  // Hizb 1-10
  [1, 1], [2, 26], [2, 44], [2, 60], [2, 75], [2, 92], [2, 106], [2, 124], [2, 142], [2, 158],
  // Hizb 11-20
  [2, 177], [2, 189], [2, 203], [2, 219], [2, 233], [2, 243], [2, 253], [2, 263], [2, 272], [2, 283],
  // Hizb 21-30
  [3, 15], [3, 33], [3, 52], [3, 75], [3, 93], [3, 113], [3, 133], [3, 153], [3, 171], [3, 186],
  // Hizb 31-40
  [4, 1], [4, 12], [4, 24], [4, 36], [4, 52], [4, 60], [4, 75], [4, 88], [4, 100], [4, 114],
  // Hizb 41-50
  [4, 135], [4, 148], [4, 163], [5, 1], [5, 12], [5, 27], [5, 41], [5, 51], [5, 67], [5, 82],
  // Hizb 51-60
  [5, 97], [5, 109], [6, 1], [6, 13], [6, 36], [6, 59], [6, 74], [6, 95], [6, 111], [6, 127],
];

/**
 * Build all hizb markers with their positions.
 * We only track hizb starts (not nisf/rub for now to keep it manageable).
 */
export const HIZB_MARKERS: HizbMarker[] = HIZB_STARTS.map((pos, i) => ({
  hizb: i + 1,
  position: "hizb",
  surah: pos[0],
  ayah: pos[1],
  label: `حزب ${toArabicNum(i + 1)}`,
}));

/**
 * Sajda (prostration) positions in the Quran.
 * 15 positions recognized by majority of scholars.
 */
export interface SajdaMarker {
  surah: number;
  ayah: number;
  obligatory: boolean; // wajib vs recommended
}

export const SAJDA_POSITIONS: SajdaMarker[] = [
  { surah: 7, ayah: 206, obligatory: false },
  { surah: 13, ayah: 15, obligatory: false },
  { surah: 16, ayah: 50, obligatory: false },
  { surah: 17, ayah: 109, obligatory: false },
  { surah: 19, ayah: 58, obligatory: false },
  { surah: 22, ayah: 18, obligatory: false },
  { surah: 22, ayah: 77, obligatory: false },
  { surah: 25, ayah: 60, obligatory: false },
  { surah: 27, ayah: 26, obligatory: false },
  { surah: 32, ayah: 15, obligatory: false },
  { surah: 38, ayah: 24, obligatory: false },
  { surah: 41, ayah: 38, obligatory: false },
  { surah: 53, ayah: 62, obligatory: false },
  { surah: 84, ayah: 21, obligatory: false },
  { surah: 96, ayah: 19, obligatory: false },
];

/** Convert number to Eastern Arabic numerals */
export function toArabicNum(n: number): string {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

/**
 * Check if a given surah:ayah is a hizb marker position.
 */
export function getHizbMarkerAt(surah: number, ayah: number): HizbMarker | undefined {
  return HIZB_MARKERS.find((m) => m.surah === surah && m.ayah === ayah);
}

/**
 * Check if a given surah:ayah is a sajda position.
 */
export function getSajdaAt(surah: number, ayah: number): SajdaMarker | undefined {
  return SAJDA_POSITIONS.find((s) => s.surah === surah && s.ayah === ayah);
}

/**
 * Get the hizb number for a given page (approximate).
 */
export function getHizbForPage(page: number): number {
  // 604 pages / 60 hizb ≈ 10 pages per hizb
  return Math.min(60, Math.max(1, Math.ceil(page / 10.07)));
}
