import { useMemo } from "react";
import { analyzeAyahTajwid, type TajwidWord } from "@/data/tajwidRules";

interface TajwidAyahTextProps {
  arabicText: string;
  /** Index of the currently highlighted word (-1 = none) */
  activeWordIndex?: number;
  /** Called when a word is tapped */
  onWordTap?: (wordIndex: number) => void;
  className?: string;
  /** Whether tajwid coloring is enabled */
  tajwidEnabled?: boolean;
}

export default function TajwidAyahText({
  arabicText,
  activeWordIndex = -1,
  onWordTap,
  className = "",
  tajwidEnabled = true,
}: TajwidAyahTextProps) {
  const words: TajwidWord[] = useMemo(
    () => (tajwidEnabled ? analyzeAyahTajwid(arabicText) : []),
    [arabicText, tajwidEnabled]
  );

  if (!tajwidEnabled) {
    return <span className={className}>{arabicText}</span>;
  }

  return (
    <span className={className}>
      {words.map((word, i) => {
        const isActive = i === activeWordIndex;
        const hasRules = word.rules.length > 0;
        const color = word.primaryColor;

        return (
          <span key={i}>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onWordTap?.(i);
              }}
              className={`inline cursor-pointer transition-all duration-200 ${
                isActive
                  ? "rounded px-0.5 py-0.5 scale-105"
                  : ""
              }`}
              style={{
                color: hasRules && color ? `hsl(${color})` : undefined,
                backgroundColor: isActive && color ? `hsl(${color} / 0.15)` : isActive ? "hsl(var(--primary) / 0.15)" : undefined,
                textDecoration: isActive ? "none" : undefined,
              }}
            >
              {word.text}
            </span>
            {i < words.length - 1 && " "}
          </span>
        );
      })}
    </span>
  );
}
