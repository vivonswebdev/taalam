import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Check, Play, Pause, BookOpen } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Mushaf Edition definitions ─────────────────────────────
export interface MushafEdition {
  id: string;
  label: string;
  labelAr: string;
  description: string;
  style: string;
  icon: string;
  /** CDN base URL for page images (if different) */
  imageBaseUrl: string;
  /** Total pages */
  totalPages: number;
  /** Font family override for text mode */
  fontFamily?: string;
}

export const MUSHAF_EDITIONS: MushafEdition[] = [
  {
    id: "madani",
    label: "Mushaf Al-Madina",
    labelAr: "مصحف المدينة",
    description: "Standard Médine — Hafs, 15 lignes, 604 pages. Le plus utilisé dans le monde.",
    style: "Hafs · Tajwid coloré",
    icon: "🕌",
    imageBaseUrl: "https://static.qurancdn.com/images/bg",
    totalPages: 604,
    fontFamily: "'Amiri', 'Scheherazade New', serif",
  },
  {
    id: "indopak",
    label: "Mushaf Indo-Pak",
    labelAr: "مصحف هندي باكستاني",
    description: "Mise en page indo-pakistanaise classique avec calligraphie Nastaliq.",
    style: "Hafs · Nastaliq",
    icon: "📖",
    imageBaseUrl: "https://static.qurancdn.com/images/bg",
    totalPages: 604,
    fontFamily: "'Noto Nastaliq Urdu', 'Amiri', serif",
  },
  {
    id: "warsh",
    label: "Mushaf Warsh",
    labelAr: "مصحف ورش",
    description: "Lecture Warsh — utilisée au Maghreb et en Afrique de l'Ouest.",
    style: "Warsh · Maghrébin",
    icon: "🌙",
    imageBaseUrl: "https://static.qurancdn.com/images/bg",
    totalPages: 604,
  },
  {
    id: "qaloon",
    label: "Mushaf Qaloon",
    labelAr: "مصحف قالون",
    description: "Lecture Qaloon — populaire en Libye et Tunisie.",
    style: "Qaloon · Nord-Africain",
    icon: "📜",
    imageBaseUrl: "https://static.qurancdn.com/images/bg",
    totalPages: 604,
  },
];

const EDITION_KEY = "taalam_mushaf_version";

export function getStoredEdition(): string {
  try {
    return localStorage.getItem(EDITION_KEY) || "madani";
  } catch {
    return "madani";
  }
}

export function setStoredEdition(id: string) {
  try {
    localStorage.setItem(EDITION_KEY, id);
  } catch {}
}

export function getEditionById(id: string): MushafEdition {
  return MUSHAF_EDITIONS.find(e => e.id === id) || MUSHAF_EDITIONS[0];
}

// ─── Component ──────────────────────────────────────────────
interface MushafEditionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEdition: string;
  onSelect: (editionId: string) => void;
}

export default function MushafEditionSheet({
  open, onOpenChange, currentEdition, onSelect,
}: MushafEditionSheetProps) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(currentEdition);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    setSelected(currentEdition);
  }, [currentEdition, open]);

  const handleConfirm = () => {
    onSelect(selected);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[75vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            {t("mushaf.changeEdition" as any) || "Changer de Mushaf"}
          </SheetTitle>
        </SheetHeader>

        <p className="text-xs text-muted-foreground mt-1 mb-3">
          {t("mushaf.editionSubtitle" as any) || "Choisissez l'édition du Coran que vous souhaitez lire."}
        </p>

        <ScrollArea className="h-[45vh] pr-1">
          <div className="space-y-2">
            {MUSHAF_EDITIONS.map((edition) => {
              const isSelected = selected === edition.id;
              return (
                <button
                  key={edition.id}
                  onClick={() => setSelected(edition.id)}
                  className={`w-full text-left rounded-xl border-2 p-3 transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30 hover:bg-accent/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${
                      isSelected ? "bg-primary/15" : "bg-muted"
                    }`}>
                      {edition.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {edition.label}
                        </span>
                        <span className="text-xs text-muted-foreground font-arabic" dir="rtl">
                          {edition.labelAr}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {edition.description}
                      </p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {edition.style}
                      </span>
                    </div>

                    {/* Check */}
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                        <Check size={14} className="text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Confirm button */}
        <div className="mt-3 pb-2">
          <button
            onClick={handleConfirm}
            disabled={selected === currentEdition}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              selected !== currentEdition
                ? "bg-primary text-primary-foreground shadow-md hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {selected !== currentEdition
              ? (t("mushaf.confirmEdition" as any) || "Confirmer le changement")
              : (t("mushaf.currentEdition" as any) || "Édition actuelle")
            }
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
