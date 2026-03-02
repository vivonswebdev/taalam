import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, Star, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useChildrenProfiles } from "@/hooks/useChildrenProfiles";

export default function SelectChildPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { children, loading } = useChildrenProfiles();

  const selectChild = (childId: string) => {
    localStorage.setItem("taaloum_active_child_id", childId);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{t("kids.selectChild" as any) || "Quel enfant utilise l'app ?"}</h1>
      </div>

      <div className="px-4 mt-2 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><span className="animate-spin text-2xl">⏳</span></div>
        ) : children.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <span className="text-6xl">👶</span>
            <p className="text-sm text-muted-foreground text-center">{t("kids.noChildrenYet" as any) || "Aucun enfant enregistré"}</p>
            <button onClick={() => navigate("/create-child")} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm">
              <UserPlus size={16} className="inline mr-2" />
              {t("kids.createFirst" as any) || "Créer un profil enfant"}
            </button>
          </div>
        ) : (
          <>
            {children.map((child, i) => (
              <motion.button
                key={child.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => selectChild(child.id)}
                className="w-full flex items-center gap-4 bg-card border border-border rounded-2xl p-4 hover:border-primary/40 hover:shadow-md transition-all text-left"
              >
                <span className="text-4xl w-14 h-14 rounded-full bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center shrink-0">
                  {child.avatar_emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-foreground truncate">{child.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {child.age && <span className="text-xs text-muted-foreground">{child.age} {t("profile.yearsOld" as any) || "ans"}</span>}
                    {child.country_code && <span className="text-xs">{getFlagEmoji(child.country_code)}</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-amber-500">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs font-bold">{child.total_points} pts</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-muted-foreground shrink-0" />
              </motion.button>
            ))}

            {children.length < 5 && (
              <button
                onClick={() => navigate("/create-child")}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                <UserPlus size={18} />
                <span className="text-sm font-semibold">{t("kids.addAnother" as any) || "Ajouter un enfant"}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  const cc = countryCode.toUpperCase();
  return cc.replace(/./g, (c) => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65));
}
