import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { useLanguage } from "@/hooks/useLanguage";

const AVATAR_EMOJIS = ["👦", "👧", "🧒", "👶", "🧒🏽", "👦🏾", "👧🏻", "🧕"];

export default function JoinClassroom() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { classrooms, addMember, getMembersForClass } = useClassrooms();
  const { profiles, addProfile } = useChildProfiles();

  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_EMOJIS[0]);
  const [selectedExistingChild, setSelectedExistingChild] = useState<string | null>(null);
  const [mode, setMode] = useState<"choose" | "new" | "existing">("choose");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  const classroom = classrooms.find(
    (c) => c.joinCode.toUpperCase() === (code || "").toUpperCase()
  );

  // Check if already joined
  const alreadyJoinedChildIds = classroom
    ? getMembersForClass(classroom.id)
    : [];

  const availableProfiles = profiles.filter(
    (p) => !alreadyJoinedChildIds.includes(p.id)
  );

  const handleJoinWithNew = () => {
    const trimmed = childName.trim();
    if (!trimmed) {
      setError(t("join.errorName"));
      return;
    }
    if (trimmed.length > 50) {
      setError(t("join.errorNameLong"));
      return;
    }
    if (!classroom) return;

    const age = childAge ? parseInt(childAge, 10) : undefined;
    if (childAge && (isNaN(age!) || age! < 1 || age! > 99)) {
      setError(t("join.errorAge"));
      return;
    }

    const profile = addProfile(trimmed, selectedAvatar, age);
    addMember(classroom.id, profile.id);
    setJoined(true);
  };

  const handleJoinWithExisting = () => {
    if (!selectedExistingChild || !classroom) return;
    addMember(classroom.id, selectedExistingChild);
    setJoined(true);
  };

  // ─── Class not found ─────────────────────────────────
  if (!classroom) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm w-full"
        >
          <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">{t("join.notFound")}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {t("join.notFoundDesc")} <span className="font-mono font-bold text-foreground">{code}</span>
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
          >
            {t("join.backHome")}
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Success ──────────────────────────────────────────
  if (joined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm w-full"
        >
          <CheckCircle2 size={48} className="text-primary mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">{t("join.success")}</h2>
          <p className="text-sm text-muted-foreground mb-1">
            {t("join.successDesc")}
          </p>
          <p className="font-semibold text-primary mb-6">"{classroom.name}"</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
          >
            {t("join.backHome")}
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Join form ────────────────────────────────────────
  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-14 pb-4">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mb-4"
        >
          <ArrowLeft size={18} />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Users size={32} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">{t("join.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{classroom.name}</p>
          {classroom.teacherName && (
            <p className="text-xs text-muted-foreground">
              {t("join.teacher")}: {classroom.teacherName}
            </p>
          )}
        </motion.div>

        {/* Choose mode */}
        {mode === "choose" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <button
              onClick={() => setMode("new")}
              className="w-full flex items-center gap-4 bg-card border border-border rounded-2xl p-4 text-left hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <UserPlus size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{t("join.createChild")}</p>
                <p className="text-xs text-muted-foreground">{t("join.createChildDesc")}</p>
              </div>
            </button>

            {availableProfiles.length > 0 && (
              <button
                onClick={() => setMode("existing")}
                className="w-full flex items-center gap-4 bg-card border border-border rounded-2xl p-4 text-left hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <Users size={24} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{t("join.useExisting")}</p>
                  <p className="text-xs text-muted-foreground">
                    {availableProfiles.length} {t("join.profilesAvailable")}
                  </p>
                </div>
              </button>
            )}
          </motion.div>
        )}

        {/* New child form */}
        {mode === "new" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <button
              onClick={() => { setMode("choose"); setError(""); }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← {t("join.back")}
            </button>

            {/* Avatar picker */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("join.avatar")}
              </label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      selectedAvatar === emoji
                        ? "bg-primary/20 border-2 border-primary scale-110"
                        : "bg-muted border-2 border-transparent"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("join.childName")} *
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => { setChildName(e.target.value); setError(""); }}
                maxLength={50}
                placeholder={t("join.childNamePlaceholder")}
                className="w-full mt-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Age */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("join.childAge")}
              </label>
              <input
                type="number"
                value={childAge}
                onChange={(e) => { setChildAge(e.target.value); setError(""); }}
                min={1}
                max={99}
                placeholder="8"
                className="w-full mt-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <p className="text-xs text-destructive font-medium">{error}</p>
            )}

            <button
              onClick={handleJoinWithNew}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold active:scale-[0.98] transition-transform"
            >
              {t("join.joinButton")}
            </button>
          </motion.div>
        )}

        {/* Existing child picker */}
        {mode === "existing" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <button
              onClick={() => { setMode("choose"); setError(""); }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← {t("join.back")}
            </button>

            <div className="space-y-2">
              {availableProfiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedExistingChild(p.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    selectedExistingChild === p.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <span className="text-2xl">{p.avatarEmoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    {p.age && (
                      <p className="text-xs text-muted-foreground">{p.age} {t("join.years")}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleJoinWithExisting}
              disabled={!selectedExistingChild}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {t("join.joinButton")}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
