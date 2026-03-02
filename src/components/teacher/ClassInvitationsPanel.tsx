import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useClassInvites, ClassInvitation } from "@/hooks/useClassInvites";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Copy, Trash2, CheckCircle, Clock, XCircle, UserPlus } from "lucide-react";

interface Props {
  classId: string | null;
}

export default function ClassInvitationsPanel({ classId }: Props) {
  const { t } = useLanguage();
  const { invites, createInvite, deleteInvite, loading } = useClassInvites(classId);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    const inv = await createInvite();
    setCreating(false);
    if (inv) {
      toast.success(t("invitations.created" as any) || "Invitation créée !");
    } else {
      toast.error(t("common.error" as any));
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t("invitations.codeCopied" as any) || "Code copié !");
  };

  const handleDelete = async (id: string) => {
    await deleteInvite(id);
    toast.success(t("invitations.deleted" as any) || "Invitation supprimée");
  };

  const statusBadge = (status: string) => {
    if (status === "child_created") return (
      <span className="flex items-center gap-1 text-[9px] font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
        <CheckCircle size={10} /> {t("invitations.statusCompleted" as any) || "Inscrit"}
      </span>
    );
    if (status === "accepted") return (
      <span className="flex items-center gap-1 text-[9px] font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
        <Clock size={10} /> {t("invitations.statusAccepted" as any) || "Acceptée"}
      </span>
    );
    return (
      <span className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
        <Clock size={10} /> {t("invitations.statusPending" as any) || "En attente"}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold flex items-center gap-1.5">
          <UserPlus size={16} className="text-primary" />
          {t("invitations.classInvitations" as any) || "Invitations parents"}
        </p>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[11px] font-bold flex items-center gap-1 disabled:opacity-40"
        >
          <Plus size={12} />
          {creating ? "..." : (t("invitations.newInvite" as any) || "Nouvelle")}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4"><span className="animate-spin">⏳</span></div>
      ) : invites.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          {t("invitations.noInvitesYet" as any) || "Aucune invitation envoyée. Créez-en une pour inviter un parent."}
        </p>
      ) : (
        <div className="space-y-2">
          {invites.map((inv, i) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card border border-border rounded-xl p-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold tracking-widest text-primary">{inv.invite_code}</span>
                  <button onClick={() => handleCopyCode(inv.invite_code)} className="text-muted-foreground hover:text-foreground">
                    <Copy size={12} />
                  </button>
                </div>
                {inv.parent_email && (
                  <p className="text-[10px] text-muted-foreground truncate">📧 {inv.parent_email}</p>
                )}
                <div className="mt-1">{statusBadge(inv.status)}</div>
              </div>
              {inv.status === "pending" && (
                <button onClick={() => handleDelete(inv.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
