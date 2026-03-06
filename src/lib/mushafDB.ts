import Dexie, { type Table } from 'dexie';

export interface MushafVerse {
  id: string; // "surah:ayah" e.g. "1:1"
  surah_number: number;
  verse_number: number;
  page_number: number;
  juz_number: number;
  text_uthmani: string;
  text_tajwid: string; // HTML with <tajweed> tags
  translation_fr: string;
  words: Array<{
    position: number;
    text: string;
    translation: string;
    audio_url?: string;
  }>;
  audio_url?: string;
  downloaded: boolean;
  last_accessed?: number;
}

export interface MushafBookmarkLocal {
  id: string;
  user_id: string;
  verse_id: string; // "surah:ayah"
  note?: string;
  tags: string[];
  color: string;
  category: 'favorite' | 'memorizing' | 'study' | 'reflection';
  created_at: number;
  updated_at: number;
}

export interface MushafSettings {
  id: string;
  theme: 'cream' | 'white' | 'night' | 'blue';
  font_size: number;
  tajwid_enabled: boolean;
  translation_visible: boolean;
  reciter_id: string;
  audio_autoplay: boolean;
  downloaded_pages: number[];
  download_complete: boolean;
}

class MushafDatabase extends Dexie {
  verses!: Table<MushafVerse, string>;
  bookmarks!: Table<MushafBookmarkLocal, string>;
  settings!: Table<MushafSettings, string>;

  constructor() {
    super('TaalamMushafDB');
    this.version(1).stores({
      verses: 'id, surah_number, verse_number, page_number, juz_number, downloaded',
      bookmarks: 'id, user_id, verse_id, category, created_at',
      settings: 'id'
    });
  }
}

export const mushafDB = new MushafDatabase();

/** Get all verses for a specific page */
export async function getVersesByPage(page: number): Promise<MushafVerse[]> {
  return mushafDB.verses.where('page_number').equals(page).toArray();
}

/** Get download progress */
export async function getDownloadedPageCount(): Promise<number> {
  const settings = await mushafDB.settings.get('settings');
  return settings?.downloaded_pages?.length ?? 0;
}

/** Check if download is complete */
export async function isDownloadComplete(): Promise<boolean> {
  const settings = await mushafDB.settings.get('settings');
  return settings?.download_complete ?? false;
}

/** Toggle a bookmark in IndexedDB */
export async function toggleLocalBookmark(
  userId: string,
  verseId: string,
  options?: Partial<MushafBookmarkLocal>
): Promise<boolean> {
  const existing = await mushafDB.bookmarks
    .where({ user_id: userId, verse_id: verseId })
    .first();

  if (existing) {
    await mushafDB.bookmarks.delete(existing.id);
    return false; // removed
  } else {
    await mushafDB.bookmarks.add({
      id: `${userId}_${verseId}_${Date.now()}`,
      user_id: userId,
      verse_id: verseId,
      tags: [],
      color: '#FFD700',
      category: 'favorite',
      created_at: Date.now(),
      updated_at: Date.now(),
      ...options
    });
    return true; // added
  }
}

/** Get all bookmarks for a user */
export async function getUserBookmarks(userId: string): Promise<MushafBookmarkLocal[]> {
  return mushafDB.bookmarks.where('user_id').equals(userId).toArray();
}
