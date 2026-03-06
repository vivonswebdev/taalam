import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Share2, Heart } from "lucide-react";

interface AyahFavoriteSheetProps {
  ayah: { number: number; arabic: string; surahNumber: number };
  onClose: () => void;
  onSaved: () => void;
}

export default function AyahFavoriteSheet({ ayah, onClose, onSaved }: AyahFavoriteSheetProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      toast.error("Connectez-vous pour sauvegarder");
      return;
    }
    setSaving(true);
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from("ayah_favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("surah_number", ayah.surahNumber)
        .eq("ayah_number", ayah.number)
        .maybeSingle();

      if (existing) {
        // Remove
        await supabase.from("ayah_favorites").delete().eq("id", existing.id);
        toast("Favori supprimé");
      } else {
        // Add
        await supabase.from("ayah_favorites").insert({
          user_id: user.id,
          surah_number: ayah.surahNumber,
          ayah_number: ayah.number,
        });
        toast.success("Verset ajouté aux favoris ⭐");
      }
      onSaved();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setSaving(false);
  };

  const handleShare = async () => {
    const text = `${ayah.arabic}\n\n— Sourate ${ayah.surahNumber}, Verset ${ayah.number}\n\nvia Ta'alam`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copié dans le presse-papiers");
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
        <SheetHeader>
          <SheetTitle className="text-center">Verset {ayah.surahNumber}:{ayah.number}</SheetTitle>
        </SheetHeader>

        <div className="py-4 space-y-4">
          {/* Arabic text */}
          <p
            className="font-['Amiri'] text-center leading-[2.2] px-2"
            style={{ fontSize: 22, direction: "rtl" }}
          >
            {ayah.arabic}
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
            >
              <Heart size={16} />
              {saving ? "..." : "Favori"}
            </button>

            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm transition-colors"
            >
              <Share2 size={16} />
              Partager
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
