import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useChildrenProfiles } from "@/hooks/useChildrenProfiles";
import { toast } from "sonner";

const AVATARS = ["👦", "👧", "🧒", "👶", "🧒🏽", "👦🏾", "👧🏻", "🧕", "👦🏻", "👧🏽", "🧕🏽", "👦🏿"];
const COUNTRIES = [
  { code: "MA", name: "🇲🇦 Maroc" },
  { code: "FR", name: "🇫🇷 France" },
  { code: "DZ", name: "🇩🇿 Algérie" },
  { code: "TN", name: "🇹🇳 Tunisie" },
  { code: "BE", name: "🇧🇪 Belgique" },
  { code: "NL", name: "🇳🇱 Pays-Bas" },
  { code: "GB", name: "🇬🇧 Royaume-Uni" },
  { code: "US", name: "🇺🇸 États-Unis" },
  { code: "CA", name: "🇨🇦 Canada" },
  { code: "TR", name: "🇹🇷 Turquie" },
  { code: "PK", name: "🇵🇰 Pakistan" },
  { code: "SA", name: "🇸🇦 Arabie Saoudite" },
  { code: "AE", name: "🇦🇪 Émirats" },
  { code: "EG", name: "🇪🇬 Égypte" },
  { code: "DE", name: "🇩🇪 Allemagne" },
  { code: "SN", name: "🇸🇳 Sénégal" },
  { code: "ML", name: "🇲🇱 Mali" },
  { code: "CI", name: "🇨🇮 Côte d'Ivoire" },
];

export default function CreateChildPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addChild, children } = useChildrenProfiles();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("👦");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);

  const canCreate = name.trim().length >= 2 && children.length < 5;

  const handleCreate = async () => {
    if (!canCreate) return;
    setSaving(true);
    const child = await addChild(name.trim(), avatar, age ? parseInt(age) : undefined, country || undefined);
    setSaving(false);
    if (child) {
      localStorage.setItem("taaloum_active_child_id", child.id);
      toast.success(t("kids.childCreated" as any) || `${name} a été créé !`);
      navigate("/");
    } else {
      toast.error(t("kids.createError" as any) || "Erreur lors de la création");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{t("kids.createChildTitle" as any) || "Nouveau profil enfant"}</h1>
      </div>

      <div className="px-5 space-y-5 mt-2">
        {/* Avatar */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">{t("kids.chooseAvatar" as any) || "Avatar"}</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-5xl w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border-4 border-primary/30 flex items-center justify-center">
              {avatar}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 transition-all ${
                  avatar === a ? "border-primary bg-primary/10 scale-110" : "border-border bg-card hover:border-primary/30"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-1.5">{t("kids.childName" as any) || "Prénom"}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("profile.childNamePlaceholder" as any) || "Prénom de l'enfant"}
            maxLength={50}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* Age */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-1.5">{t("kids.childAge" as any) || "Âge"}</label>
          <input
            value={age}
            onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))}
            placeholder="3 - 17"
            maxLength={2}
            inputMode="numeric"
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* Country */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-1.5">{t("kids.childCountry" as any) || "Pays"}</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">{t("kids.selectCountry" as any) || "-- Choisir un pays --"}</option>
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Max warning */}
        {children.length >= 5 && (
          <p className="text-xs text-destructive text-center">{t("kids.maxChildren" as any) || "Maximum 5 enfants par compte"}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleCreate}
          disabled={!canCreate || saving}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Check size={18} />
          {saving ? "..." : (t("profile.createChild" as any) || "Créer le profil")}
        </button>
      </div>
    </div>
  );
}
