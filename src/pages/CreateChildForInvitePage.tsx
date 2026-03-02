import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, GraduationCap } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useChildrenProfiles } from "@/hooks/useChildrenProfiles";
import { useClassInvites } from "@/hooks/useClassInvites";
import { supabase } from "@/integrations/supabase/client";
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

export default function CreateChildForInvitePage() {
  const { inviteId } = useParams<{ inviteId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addChild, children } = useChildrenProfiles();
  const { linkChildToInvite } = useClassInvites();

  const [inviteInfo, setInviteInfo] = useState<{ classroomName: string; teacherName: string } | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("👦");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [existingChildId, setExistingChildId] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteId) return;
    (async () => {
      const { data: inv } = await supabase
        .from("class_invitations")
        .select("classroom_id")
        .eq("id", inviteId)
        .single();
      if (!inv) return;
      const { data: cls } = await supabase
        .from("classrooms")
        .select("name, teacher_id")
        .eq("id", (inv as any).classroom_id)
        .single();
      if (!cls) return;
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", cls.teacher_id)
        .single();
      setInviteInfo({
        classroomName: cls.name,
        teacherName: prof?.display_name || "",
      });
    })();
  }, [inviteId]);

  const canCreate = name.trim().length >= 2 && children.length < 5;

  const handleCreateAndJoin = async () => {
    if (!canCreate || !inviteId) return;
    setSaving(true);

    const child = await addChild(name.trim(), avatar, age ? parseInt(age) : undefined, country || undefined);
    if (!child) {
      toast.error(t("kids.createError" as any) || "Erreur lors de la création");
      setSaving(false);
      return;
    }

    const linked = await linkChildToInvite(inviteId, child.id);
    setSaving(false);

    if (linked) {
      localStorage.setItem("taaloum_active_child_id", child.id);
      toast.success(t("invitations.childCreatedAndJoined" as any) || `${name} a rejoint la classe !`);
      navigate("/parent-invitations");
    } else {
      toast.error(t("invitations.joinError" as any) || "Erreur lors de l'inscription");
    }
  };

  const handleLinkExisting = async () => {
    if (!existingChildId || !inviteId) return;
    setSaving(true);
    const linked = await linkChildToInvite(inviteId, existingChildId);
    setSaving(false);
    if (linked) {
      toast.success(t("invitations.childLinked" as any) || "Enfant inscrit dans la classe !");
      navigate("/parent-invitations");
    } else {
      toast.error(t("invitations.joinError" as any) || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">🎓 {t("invitations.createChildForClass" as any) || "Inscrire un enfant"}</h1>
      </div>

      {/* Class info */}
      {inviteInfo && (
        <div className="mx-4 mb-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap size={18} className="text-primary" />
            <span className="text-sm font-bold">{inviteInfo.classroomName}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {t("invitations.teacher" as any) || "Prof"}: {inviteInfo.teacherName}
          </p>
        </div>
      )}

      {/* Use existing child */}
      {children.length > 0 && (
        <div className="px-4 mb-5">
          <p className="text-sm font-semibold mb-2">{t("invitations.useExistingChild" as any) || "Utiliser un enfant existant"}</p>
          <div className="grid grid-cols-2 gap-2">
            {children.map((c) => (
              <button
                key={c.id}
                onClick={() => setExistingChildId(existingChildId === c.id ? null : c.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  existingChildId === c.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <span className="text-2xl">{c.avatar_emoji}</span>
                <p className="text-xs font-bold mt-1">{c.name}</p>
                {c.age && <p className="text-[10px] text-muted-foreground">{c.age} {t("invitations.years" as any) || "ans"}</p>}
              </button>
            ))}
          </div>
          {existingChildId && (
            <button
              onClick={handleLinkExisting}
              disabled={saving}
              className="w-full mt-3 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Check size={18} />
              {saving ? "..." : (t("invitations.linkAndJoin" as any) || "Inscrire et rejoindre la classe")}
            </button>
          )}
        </div>
      )}

      {/* Separator */}
      {children.length > 0 && (
        <div className="flex items-center gap-3 px-4 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted-foreground font-medium">{t("invitations.orCreateNew" as any) || "OU CRÉER UN NOUVEAU PROFIL"}</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      <div className="px-5 space-y-5">
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

        {/* Submit */}
        <button
          onClick={handleCreateAndJoin}
          disabled={!canCreate || saving}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Check size={18} />
          {saving ? "..." : (t("invitations.createAndJoin" as any) || "Créer le profil et rejoindre la classe")}
        </button>
      </div>
    </div>
  );
}
