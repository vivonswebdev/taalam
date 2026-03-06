import { mushafDB, type MushafVerse } from './mushafDB';
import { getJuzForPage } from '@/data/mushafPages';

const QURAN_API_BASE = 'https://api.quran.com/api/v4';

interface QuranAPIWord {
  id: number;
  position: number;
  text_uthmani: string;
  translation: { text: string; language_name: string } | null;
  audio: { url: string } | null;
}

interface QuranAPIVerse {
  id: number;
  verse_key: string; // "1:1"
  verse_number: number;
  text_uthmani: string;
  text_uthmani_tajweed?: string;
  words?: QuranAPIWord[];
  translations?: Array<{ id: number; resource_id: number; text: string }>;
}

/**
 * Fetch a single Mushaf page from Quran.com V4 API
 * Includes tajwid markup, French translation (Hamidullah), and word data
 */
export async function fetchMushafPageFromAPI(page: number): Promise<MushafVerse[]> {
  const params = new URLSearchParams({
    words: 'true',
    translations: '136', // Hamidullah French
    word_fields: 'text_uthmani,translation',
    translation_fields: 'text,resource_id',
    fields: 'text_uthmani,text_uthmani_tajweed',
    per_page: '50',
  });

  const url = `${QURAN_API_BASE}/verses/by_page/${page}?${params}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Quran API Error: ${response.status}`);

  const data = await response.json();

  return (data.verses || []).map((v: QuranAPIVerse) => ({
    id: v.verse_key,
    surah_number: parseInt(v.verse_key.split(':')[0]),
    verse_number: v.verse_number,
    page_number: page,
    juz_number: getJuzForPage(page),
    text_uthmani: v.text_uthmani || '',
    text_tajwid: v.text_uthmani_tajweed || v.text_uthmani || '',
    translation_fr: v.translations?.[0]?.text || '',
    words: (v.words || []).map(w => ({
      position: w.position,
      text: w.text_uthmani,
      translation: w.translation?.text || '',
      audio_url: w.audio?.url || undefined,
    })),
    audio_url: undefined,
    downloaded: true,
    last_accessed: Date.now(),
  }));
}

/**
 * Load a page: try IndexedDB first, then API
 */
export async function loadMushafPage(page: number): Promise<MushafVerse[]> {
  // Try cached data first
  const cached = await mushafDB.verses.where('page_number').equals(page).toArray();
  if (cached.length > 0) {
    return cached;
  }

  // Fetch from API
  if (!navigator.onLine) {
    throw new Error('offline');
  }

  const verses = await fetchMushafPageFromAPI(page);
  // Store in IndexedDB
  await mushafDB.verses.bulkPut(verses);
  return verses;
}

/**
 * Download all 604 pages of the Quran to IndexedDB
 */
export async function downloadFullQuran(
  onProgress: (downloaded: number, total: number) => void,
  abortSignal?: { aborted: boolean }
): Promise<void> {
  const TOTAL_PAGES = 604;
  const BATCH_SIZE = 5;

  // Check what's already downloaded
  const settings = await mushafDB.settings.get('settings');
  const downloadedPages = new Set(settings?.downloaded_pages || []);

  let completed = downloadedPages.size;
  onProgress(completed, TOTAL_PAGES);

  for (let batch = 0; batch < Math.ceil(TOTAL_PAGES / BATCH_SIZE); batch++) {
    if (abortSignal?.aborted) return;

    const pageNumbers = Array.from(
      { length: BATCH_SIZE },
      (_, i) => batch * BATCH_SIZE + i + 1
    ).filter(p => p <= TOTAL_PAGES && !downloadedPages.has(p));

    if (pageNumbers.length === 0) continue;

    // Fetch pages in parallel (small batches to avoid rate limiting)
    const results = await Promise.allSettled(
      pageNumbers.map(p => fetchMushafPageFromAPI(p))
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const pageNum = pageNumbers[i];

      if (result.status === 'fulfilled') {
        await mushafDB.verses.bulkPut(result.value);
        downloadedPages.add(pageNum);
        completed++;
        onProgress(completed, TOTAL_PAGES);
      }
    }

    // Rate limit protection
    await new Promise(r => setTimeout(r, 200));
  }

  // Mark download as complete
  await mushafDB.settings.put({
    id: 'settings',
    theme: 'cream',
    font_size: 28,
    tajwid_enabled: true,
    translation_visible: true,
    reciter_id: 'ar.alafasy',
    audio_autoplay: false,
    downloaded_pages: Array.from(downloadedPages),
    download_complete: downloadedPages.size >= TOTAL_PAGES,
  });
}
