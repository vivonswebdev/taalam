import { useState, useCallback, useEffect } from "react";
import { useUserMode } from "@/hooks/useUserMode";

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

const STICKERS_KEY = "quranEasyStickers";

export function useChildMode() {
  const { mode, setMode } = useUserMode();
  const isChildMode = mode === "child";

  const [stickers, setStickers] = useState<EarnedSticker[]>(() => {
    try {
      const stored = localStorage.getItem(STICKERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STICKERS_KEY, JSON.stringify(stickers));
  }, [stickers]);

  const toggleChildMode = useCallback(() => {
    setMode(isChildMode ? "solo" : "child");
  }, [isChildMode, setMode]);

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
