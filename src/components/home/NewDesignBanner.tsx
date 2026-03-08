import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewDesignBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("new-design-banner-seen");
    const mode = localStorage.getItem("design-mode");
    if (!seen && mode === "futuristic") setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem("new-design-banner-seen", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-fade-in">
      <div className="rounded-2xl p-4 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-md border border-white/20 shadow-2xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-white shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">
              🎉 Nouveau design disponible !
            </p>
            <p className="text-[11px] text-white/80 mt-0.5">
              Découvre notre interface futuriste. Tu peux revenir à l'ancien design avec le bouton en bas à droite.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/10 h-7 w-7 shrink-0"
            onClick={dismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
