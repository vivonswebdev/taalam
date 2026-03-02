import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Check, Volume2 } from "lucide-react";
import { RECITERS_LIST, getSelectedReciterId, setSelectedReciterId } from "@/data/reciters";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReciterPickerSheet({ open, onOpenChange }: Props) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState(getSelectedReciterId);

  const popularReciters = RECITERS_LIST.filter((r) => r.popular && r.category !== "kids");
  const kidsReciters = RECITERS_LIST.filter((r) => r.category === "kids");
  const otherReciters = RECITERS_LIST.filter((r) => !r.popular && r.category !== "kids");

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSelectedReciterId(id);
    window.dispatchEvent(new CustomEvent("reciterChanged", { detail: { reciterId: id } }));
  };

  const sections = [
    { label: `⭐ ${t("reciter.popular" as any)}`, items: popularReciters },
    { label: `👶 ${t("reciter.kids" as any)}`, items: kidsReciters },
    { label: `📚 ${t("reciter.others" as any)}`, items: otherReciters },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh]">
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Volume2 size={18} className="text-primary" />
            {t("reciter.current" as any)}
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto max-h-[60vh] space-y-4 pb-6">
          {sections.map((section) =>
            section.items.length > 0 ? (
              <div key={section.label}>
                <p className="text-xs font-bold text-muted-foreground mb-2">{section.label}</p>
                <div className="space-y-1">
                  {section.items.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(r.id)}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                        selectedId === r.id
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-accent/50 border border-transparent"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="font-arabic text-sm">{r.nameArabic}</span>
                        <span className="text-xs text-muted-foreground ml-2">{r.name}</span>
                      </div>
                      {selectedId === r.id && <Check size={16} className="text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
