import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Plus, Search, CheckCircle, Clock, XCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useClassInvites } from "@/hooks/useClassInvites";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ParentInvitationsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { parentInvites, acceptInviteByCode, fetchParentInvites, loading } = useClassInvites();

  const [code, setCode] = useState("");
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (user) fetchParentInvites();
  }, [user]);

  const handleAcceptCode = async () => {
    if (code.trim().length < 4) return;
    setAccepting(true);
    const { success, invite } = await acceptInviteByCode(code.trim().toUpperCase());
    setAccepting(false);
    if (success && invite) {
      toast.success(t("invitations.accepted" as any) || "Invitation acceptée !");
      setCode("");
      fetchParentInvites();
    } else {
      toast.error(t("invitations.invalidCode" as any) || "Code invalide ou expiré");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Mail size={48} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("invitations.loginRequired" as any) || "Connectez-vous pour voir vos invitations"}</p>
        <button onClick={() => navigate("/auth")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">
          {t("more.loginProfile" as any)}
        </button>
      </div>
    );
  }

  const statusIcon = (status: string) => {
    if (status === "child_created") return <CheckCircle size={16} className="text-green-500" />;
    if (status === "accepted") return <Clock size={16} className="text-amber-500" />;
    return <Clock size={16} className="text-muted-foreground" />;
  };

  const statusLabel = (status: string) => {
    if (status === "child_created") return t("invitations.statusCompleted" as any) || "Enfant inscrit ✅";
    if (status === "accepted") return t("invitations.statusAccepted" as any) || "En attente de création enfant";
    return t("invitations.statusPending" as any) || "En attente";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">📬 {t("invitations.title" as any) || "Invitations classes"}</h1>
      </div>

      {/* Enter code */}
      <div className="px-4 mb-5">
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold mb-2">{t("invitations.enterCode" as any) || "Entrez un code d'invitation"}</p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABCD1234"
              maxLength={12}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-mono tracking-wider text-foreground focus:outline-none focus:border-primary uppercase"
            />
            <button
              onClick={handleAcceptCode}
              disabled={code.trim().length < 4 || accepting}
              className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm disabled:opacity-40"
            >
              {accepting ? "..." : (t("invitations.accept" as any) || "Accepter")}
            </button>
          </div>
        </div>
      </div>

      {/* Invitations list */}
      <div className="px-4">
        <p className="text-sm font-bold mb-3">{t("invitations.myInvitations" as any) || "Mes invitations"}</p>

        {loading ? (
          <div className="flex justify-center py-8"><span className="animate-spin text-2xl">⏳</span></div>
        ) : parentInvites.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Mail size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs">{t("invitations.noInvitations" as any) || "Aucune invitation pour le moment"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {parentInvites.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎓</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{inv.classroom_name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {t("invitations.teacher" as any) || "Prof"}: {inv.teacher_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {statusIcon(inv.status)}
                      <span className="text-[10px] font-medium">{statusLabel(inv.status)}</span>
                    </div>
                  </div>
                  {inv.status === "accepted" && !inv.child_profile_id && (
                    <button
                      onClick={() => navigate(`/create-child-for-invite/${inv.id}`)}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      <Plus size={12} />
                      {t("invitations.createChild" as any) || "Créer enfant"}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
