import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export interface ReciterOption {
  id: string;
  name: string;
  nameArabic: string;
  apiEdition: string; // alquran.cloud edition identifier
}

export const RECITERS: ReciterOption[] = [
  { id: "husary", name: "Al-Husary", nameArabic: "الحصري", apiEdition: "ar.husary" },
  { id: "alafasy", name: "Mishary Al-Afasy", nameArabic: "مشاري العفاسي", apiEdition: "ar.alafasy" },
  { id: "minshawi", name: "Al-Minshawi", nameArabic: "المنشاوي", apiEdition: "ar.minshawi" },
  { id: "abdulbasit", name: "Abdul Basit", nameArabic: "عبد الباسط", apiEdition: "ar.abdulbasitmurattal" },
  { id: "sudais", name: "As-Sudais", nameArabic: "السديس", apiEdition: "ar.abdurrahmaansudais" },
];

const STORAGE_KEY = "taaloum_selected_reciter";

export function getStoredReciter(): ReciterOption {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const found = RECITERS.find((r) => r.id === stored);
      if (found) return found;
    }
  } catch {}
  return RECITERS[0];
}

function storeReciter(id: string) {
  try { localStorage.setItem(STORAGE_KEY, id); } catch {}
}

interface ReciterPickerProps {
  selected: ReciterOption;
  onChange: (reciter: ReciterOption) => void;
  compact?: boolean;
}

export default function ReciterPicker({ selected, onChange, compact }: ReciterPickerProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full bg-card border border-border rounded-xl transition-colors ${
          compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-primary">🎙️</span>
          <span className="font-medium text-foreground">{selected.nameArabic}</span>
          <span className="text-muted-foreground">({selected.name})</span>
        </div>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {RECITERS.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                onChange(r);
                storeReciter(r.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors border-b border-border last:border-b-0 ${
                r.id === selected.id ? "bg-primary/10 text-primary" : "hover:bg-accent/50 text-foreground"
              }`}
            >
              <span className="font-arabic text-base">{r.nameArabic}</span>
              <span className="text-xs text-muted-foreground">{r.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
