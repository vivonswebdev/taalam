import { useState, useCallback, useEffect } from "react";

const CHILD_MODE_KEY = "quranEasyChildMode";
const STICKERS_KEY = "quranEasyStickers";

export type StickerType = "star" | "moon" | "book" | "trophy" | "heart" | "mosque";

export interface EarnedSticker {
  type: StickerType;
  surahNumber: number;
  earnedAt: string;
}

const STICKER_EMOJIS: Record<StickerType, string> = {
  star: "⭐",
  moon: "🌙",
  book: "📖",
  trophy: "🏆",
  heart: "💚",
  mosque: "🕌",
};

const STICKER_LABELS: Record<StickerType, string> = {
  star: "Étoile",
  moon: "Lune",
  book: "Livre",
  trophy: "Trophée",
  heart: "Cœur",
  mosque: "Mosquée",
};

function getRandomSticker(): StickerType {
  const types: StickerType[] = ["star", "moon", "book", "trophy", "heart", "mosque"];
  return types[Math.floor(Math.random() * types.length)];
}

export function useChildMode() {
  const [isChildMode, setIsChildMode] = useState(() => {
    try {
      return localStorage.getItem(CHILD_MODE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [stickers, setStickers] = useState<EarnedSticker[]>(() => {
    try {
      const stored = localStorage.getItem(STICKERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CHILD_MODE_KEY, String(isChildMode));
  }, [isChildMode]);

  useEffect(() => {
    localStorage.setItem(STICKERS_KEY, JSON.stringify(stickers));
  }, [stickers]);

  const toggleChildMode = useCallback(() => {
    setIsChildMode((prev) => !prev);
  }, []);

  const earnSticker = useCallback((surahNumber: number): EarnedSticker => {
    const sticker: EarnedSticker = {
      type: getRandomSticker(),
      surahNumber,
      earnedAt: new Date().toISOString(),
    };
    setStickers((prev) => [...prev, sticker]);
    return sticker;
  }, []);

  const resetStickers = useCallback(() => {
    setStickers([]);
  }, []);

  return {
    isChildMode,
    toggleChildMode,
    stickers,
    earnSticker,
    resetStickers,
    STICKER_EMOJIS,
    STICKER_LABELS,
  };
}
