import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Edit3, ChevronRight, Lock, ShieldCheck, Download, Upload, Play } from "lucide-react";
import { useChildProfiles, type ChildProfile } from "@/hooks/useChildProfiles";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function ParentDashboard() {
  const {
    profiles, addProfile, updateProfile, deleteProfile,
    getChildMastery, getPin, setPin, verifyPin, AVATAR_EMOJIS,
    exportBackup, importBackup, getLastActivity,
  } = useChildProfiles();
  const { setActiveChild } = useActiveChild();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [backupMsg, setBackupMsg] = useState<string | null>(null);

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

  const handleStartSession = (childId: string) => {
    setActiveChild(childId);
    navigate("/quran");
  };

  const handleExport = () => {
    const json = exportBackup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quran-easy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const ok = importBackup(text);
      setBackupMsg(ok ? t("backup.importSuccess") : t("backup.importError"));
      setTimeout(() => setBackupMsg(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  function relativeActivity(d: string | null): string {
    if (!d) return "—";
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days}j`;
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }

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
                  <p className="text-[10px] text-muted-foreground/70">
                    {t("backup.lastActivity")}: {relativeActivity(getLastActivity(p.id))}
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
                  onClick={() => handleStartSession(p.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-primary font-semibold hover:bg-primary/5 transition-colors"
                >
                  <Play size={12} />
                  {t("activeChild.startSession")}
                </button>
                <div className="w-px bg-border" />
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

        {/* ─── Backup & Restore ─────────────────────────────── */}
        {profiles.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-4 space-y-3 mt-4"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("backup.title")}
            </p>

            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-border hover:bg-accent/30 transition-colors text-left"
            >
              <Download size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{t("backup.export")}</p>
                <p className="text-[10px] text-muted-foreground">{t("backup.exportDesc")}</p>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-border hover:bg-accent/30 transition-colors text-left"
            >
              <Upload size={18} className="text-secondary shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{t("backup.import")}</p>
                <p className="text-[10px] text-muted-foreground">{t("backup.importDesc")}</p>
              </div>
            </button>

            <p className="text-[10px] text-muted-foreground/80">{t("backup.importWarning")}</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />

            {backupMsg && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-center py-1">
                {backupMsg}
              </motion.p>
            )}
          </motion.div>
        )}
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
