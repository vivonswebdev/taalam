import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Check, Volume2, ChevronDown } from "lucide-react";
import { RECITERS_LIST, getSelectedReciterId, setSelectedReciterId } from "@/data/reciters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export default function ReciterSelector() {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState(getSelectedReciterId);

  const currentReciter = RECITERS_LIST.find((r) => r.id === selectedId) || RECITERS_LIST[0];
  const popularReciters = RECITERS_LIST.filter((r) => r.popular && r.category !== "kids");
  const kidsReciters = RECITERS_LIST.filter((r) => r.category === "kids");
  const otherReciters = RECITERS_LIST.filter((r) => !r.popular && r.category !== "kids");

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSelectedReciterId(id);
    window.dispatchEvent(new CustomEvent("reciterChanged", { detail: { reciterId: id } }));
  };

  return (
    <div className="mx-5 mb-4">
      <div className="flex items-center justify-between rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center shrink-0">
            <Volume2 size={16} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground leading-tight">
              {t("reciter.current" as any)}
            </p>
            <p className="text-xs font-bold text-foreground truncate">
              {currentReciter.nameArabic}
              <span className="font-normal text-muted-foreground ml-1">({currentReciter.name})</span>
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 rounded-full px-3 py-1.5 hover:bg-primary/20 transition-colors shrink-0">
              {t("reciter.change" as any)}
              <ChevronDown size={12} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 max-h-80 overflow-y-auto">
            {/* Populaires */}
            <DropdownMenuLabel className="text-xs">
              ⭐ {t("reciter.popular" as any)}
            </DropdownMenuLabel>
            {popularReciters.map((r) => (
              <DropdownMenuItem
                key={r.id}
                onClick={() => handleSelect(r.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="text-sm truncate">
                  <span className="font-arabic">{r.nameArabic}</span>
                  <span className="text-muted-foreground text-xs ml-1">({r.name})</span>
                </span>
                {selectedId === r.id && <Check size={14} className="text-primary shrink-0" />}
              </DropdownMenuItem>
            ))}

            {/* Enfants */}
            {kidsReciters.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs">
                  👶 {t("reciter.kids" as any)}
                </DropdownMenuLabel>
                {kidsReciters.map((r) => (
                  <DropdownMenuItem
                    key={r.id}
                    onClick={() => handleSelect(r.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-sm truncate">
                      <span className="font-arabic">{r.nameArabic}</span>
                      <span className="text-muted-foreground text-xs ml-1">({r.name})</span>
                    </span>
                    {selectedId === r.id && <Check size={14} className="text-primary shrink-0" />}
                  </DropdownMenuItem>
                ))}
              </>
            )}

            {/* Autres */}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">
              📚 {t("reciter.others" as any)}
            </DropdownMenuLabel>
            {otherReciters.map((r) => (
              <DropdownMenuItem
                key={r.id}
                onClick={() => handleSelect(r.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="text-sm truncate">
                  <span className="font-arabic">{r.nameArabic}</span>
                  <span className="text-muted-foreground text-xs ml-1">({r.name})</span>
                </span>
                {selectedId === r.id && <Check size={14} className="text-primary shrink-0" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
