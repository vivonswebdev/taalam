import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Edit3, ChevronRight, Lock, ShieldCheck } from "lucide-react";
import { useChildProfiles, type ChildProfile } from "@/hooks/useChildProfiles";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function ParentDashboard() {
  const {
    profiles, addProfile, updateProfile, deleteProfile,
    getChildMastery, getPin, setPin, verifyPin, AVATAR_EMOJIS,
  } = useChildProfiles();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [settingPin, setSettingPin] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formEmoji, setFormEmoji] = useState("👦");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const existingPin = getPin();

  // ─── PIN Gate ──────────────────────────────────────────────
  const handlePinSubmit = () => {
    if (settingPin) {
      if (pinInput.length === 4) {
        setPin(pinInput);
        setUnlocked(true);
        setSettingPin(false);
      }
      return;
    }
    if (!existingPin) {
      setSettingPin(true);
      setPinInput("");
      return;
    }
    if (verifyPin(pinInput)) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // ─── Profile CRUD ─────────────────────────────────────────
  const handleSave = () => {
    if (!formName.trim()) return;
    if (editingId) {
      updateProfile(editingId, {
        name: formName.trim(),
        avatarEmoji: formEmoji,
        age: formAge ? parseInt(formAge) : undefined,
      });
      setEditingId(null);
    } else {
      addProfile(formName.trim(), formEmoji, formAge ? parseInt(formAge) : undefined);
    }
    setFormName("");
    setFormAge("");
    setFormEmoji("👦");
    setShowAdd(false);
  };

  const startEdit = (p: ChildProfile) => {
    setEditingId(p.id);
    setFormName(p.name);
    setFormAge(p.age?.toString() || "");
    setFormEmoji(p.avatarEmoji);
    setShowAdd(true);
  };

  // ─── PIN Screen ───────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-screen pb-24 flex flex-col">
        <div className="px-6 pt-14 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">{t("parent.title")}</h1>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              {settingPin ? <ShieldCheck size={28} className="text-primary" /> : <Lock size={28} className="text-primary" />}
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">
              {settingPin ? t("parent.setPin") : existingPin ? t("parent.enterPin") : t("parent.createPin")}
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              {settingPin ? t("parent.setPinDesc") : existingPin ? t("parent.enterPinDesc") : t("parent.createPinDesc")}
            </p>

            <div className="flex justify-center mb-4">
              <InputOTP maxLength={4} value={pinInput} onChange={setPinInput}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {pinError && (
              <p className="text-xs text-destructive mb-3">{t("parent.wrongPin")}</p>
            )}

            <button
              onClick={handlePinSubmit}
              disabled={pinInput.length < 4}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              {settingPin || !existingPin ? t("parent.confirm") : t("parent.unlock")}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Main Dashboard ───────────────────────────────────────
  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t("parent.title")}</h1>
              <p className="text-xs text-muted-foreground">{t("parent.subtitle")}</p>
            </div>
          </div>
          <button
            onClick={() => { setShowAdd(true); setEditingId(null); setFormName(""); setFormAge(""); setFormEmoji("👦"); }}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus size={20} className="text-primary-foreground" />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-3">
        {profiles.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16">
            <p className="text-4xl mb-3">👨‍👧‍👦</p>
            <p className="text-sm text-muted-foreground">{t("parent.noChildren")}</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              {t("parent.addChild")}
            </button>
          </motion.div>
        )}

        {profiles.map((p, i) => {
          const mastery = getChildMastery(p.id);
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => navigate(`/parent/child/${p.id}`)}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                <span className="text-3xl">{p.avatarEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.age ? `${p.age} ${t("parent.years")}` : ""}{p.age ? " · " : ""}{t("parent.mastery")}: {mastery}%
                  </p>
                </div>
                {/* Mini progress bar */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${mastery >= 70 ? "bg-green-500" : mastery >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${mastery}%` }}
                    />
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </button>

              {/* Quick actions */}
              <div className="flex border-t border-border">
                <button
                  onClick={() => startEdit(p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit3 size={12} />
                  {t("parent.edit")}
                </button>
                <div className="w-px bg-border" />
                <button
                  onClick={() => setDeleteConfirm(p.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-destructive/70 hover:text-destructive transition-colors"
                >
                  <Trash2 size={12} />
                  {t("parent.delete")}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-card border border-border rounded-t-3xl p-6 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-foreground mb-4">
                {editingId ? t("parent.editChild") : t("parent.addChild")}
              </h3>

              {/* Avatar picker */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {AVATAR_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setFormEmoji(emoji)}
                    className={`text-2xl w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                      formEmoji === emoji ? "border-primary bg-primary/10" : "border-border"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Name */}
              <input
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder={t("parent.namePlaceholder")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />

              {/* Age */}
              <input
                value={formAge}
                onChange={e => setFormAge(e.target.value.replace(/\D/g, ""))}
                placeholder={t("parent.agePlaceholder")}
                type="text"
                inputMode="numeric"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />

              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-foreground">
                  {t("settings.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formName.trim()}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 active:scale-[0.98] transition-transform"
                >
                  {editingId ? t("parent.save") : t("parent.add")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-8"
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-foreground mb-2">{t("parent.deleteConfirmTitle")}</h3>
              <p className="text-sm text-muted-foreground mb-6">{t("parent.deleteConfirmMsg")}</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-foreground">
                  {t("settings.cancel")}
                </button>
                <button
                  onClick={() => { deleteProfile(deleteConfirm); setDeleteConfirm(null); }}
                  className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium active:scale-[0.98] transition-transform"
                >
                  {t("parent.delete")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
