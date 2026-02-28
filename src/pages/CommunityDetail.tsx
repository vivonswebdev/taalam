import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Pin, Trash2, Users, Settings, LogOut, UserPlus, Check, X, MoreVertical } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityDetail, useCommunityActions } from "@/hooks/useCommunity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { community, members, messages, requests, loading, refetch } = useCommunityDetail(id);
  const { sendMessage, deleteMessage, togglePin, approveRequest, rejectRequest, removeMember, leaveCommunity, deleteCommunity, updateCommunity } = useCommunityActions();

  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("chat");
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editApproval, setEditApproval] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = community?.user_role === "admin";
  const isMember = !!community?.user_role;

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (tab === "chat") chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tab]);

  // Profile name for sending
  const [authorName, setAuthorName] = useState("Anonyme");
  useEffect(() => {
    if (!user) return;
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle().then(({ data }) => {
        if (data?.display_name) setAuthorName(data.display_name);
      });
    });
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!community) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Groupe introuvable</div>;

  const handleSend = async () => {
    if (!msg.trim() || !id) return;
    await sendMessage(id, msg.trim(), authorName);
    setMsg("");
  };

  const handleLeave = async () => {
    if (!id) return;
    await leaveCommunity(id);
    navigate("/community");
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteCommunity(id);
    navigate("/community");
  };

  const handleSaveSettings = async () => {
    if (!id) return;
    await updateCommunity(id, { name: editName, description: editDesc, requires_approval: editApproval });
    setShowSettings(false);
    refetch();
  };

  const openSettings = () => {
    setEditName(community.name);
    setEditDesc(community.description);
    setEditApproval(community.requires_approval);
    setShowSettings(true);
  };

  const pinnedMessages = messages.filter(m => m.is_pinned);
  const feedMessages = messages.filter(m => m.message_type === "achievement");

  return (
    <div className="min-h-screen pb-24 flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-3 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/community")} className="flex items-center gap-1 text-muted-foreground">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 text-center">
            <h1 className="font-bold text-foreground truncate">{community.name}</h1>
            <p className="text-xs text-muted-foreground">{members.length} {t("community.members" as any)}</p>
          </div>
          <div className="flex items-center gap-1">
            {isAdmin && (
              <button onClick={openSettings} className="p-2 rounded-full hover:bg-accent">
                <Settings size={18} className="text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pinned messages */}
      {pinnedMessages.length > 0 && (
        <div className="px-5 py-2 bg-primary/5 border-b border-border">
          {pinnedMessages.map(pm => (
            <div key={pm.id} className="flex items-center gap-2 text-xs">
              <Pin size={12} className="text-primary shrink-0" />
              <span className="font-medium text-primary">{pm.author_name}:</span>
              <span className="text-foreground truncate">{pm.content}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      {isMember ? (
        <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col">
          <TabsList className="mx-5 mt-3">
            <TabsTrigger value="chat" className="flex-1 gap-1">💬 {t("community.chat" as any)}</TabsTrigger>
            <TabsTrigger value="feed" className="flex-1 gap-1">📣 {t("community.feed" as any)}</TabsTrigger>
            <TabsTrigger value="members" className="flex-1 gap-1"><Users size={14} /> {t("community.members" as any)}</TabsTrigger>
          </TabsList>

          {/* Chat */}
          <TabsContent value="chat" className="flex-1 flex flex-col px-5 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-2 py-3">
              {messages.filter(m => m.message_type !== "achievement" || true).map(m => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`group flex flex-col ${m.user_id === user?.id ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${m.user_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"} ${m.message_type === "achievement" ? "border-2 border-amber-400/60 bg-amber-50 dark:bg-amber-950/30 text-foreground" : ""}`}>
                    {m.user_id !== user?.id && <p className="text-[10px] font-semibold opacity-70 mb-0.5">{m.author_name}</p>}
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    <p className="text-[9px] opacity-50 mt-0.5 text-right">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  {/* Admin actions */}
                  {isAdmin && (
                    <div className="hidden group-hover:flex items-center gap-1 mt-0.5">
                      <button onClick={() => togglePin(m.id, m.is_pinned).then(refetch)} className="p-1 rounded hover:bg-accent"><Pin size={12} /></button>
                      <button onClick={() => deleteMessage(m.id).then(refetch)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={12} /></button>
                    </div>
                  )}
                  {m.user_id === user?.id && !isAdmin && (
                    <div className="hidden group-hover:flex items-center gap-1 mt-0.5">
                      <button onClick={() => deleteMessage(m.id).then(refetch)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={12} /></button>
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {/* Message input */}
            <div className="flex items-center gap-2 py-3 border-t border-border">
              <Input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder={t("community.writeMessage" as any)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSend} disabled={!msg.trim()}>
                <Send size={16} />
              </Button>
            </div>
          </TabsContent>

          {/* Feed */}
          <TabsContent value="feed" className="flex-1 px-5 py-3 overflow-y-auto">
            {feedMessages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">Aucun exploit partagé pour le moment</p>
            ) : (
              <div className="space-y-3">
                {feedMessages.map(m => (
                  <div key={m.id} className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-3">
                    <p className="text-sm">🏆 <strong>{m.author_name}</strong></p>
                    <p className="text-sm text-foreground">{m.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Members */}
          <TabsContent value="members" className="flex-1 px-5 py-3 overflow-y-auto">
            {/* Pending requests (admin) */}
            {isAdmin && requests.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">{t("community.pendingRequests" as any)}</p>
                <div className="space-y-2">
                  {requests.map(r => (
                    <div key={r.id} className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{r.avatar_emoji}</span>
                        <span className="text-sm font-medium">{r.display_name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="default" onClick={() => approveRequest(r.id, r.community_id, r.user_id).then(refetch)}>
                          <Check size={14} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => rejectRequest(r.id).then(refetch)}>
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between bg-card border border-border rounded-xl p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{m.avatar_emoji}</span>
                    <div>
                      <p className="text-sm font-medium">{m.display_name}</p>
                      {m.role === "admin" && <Badge variant="default" className="text-[9px] px-1.5 py-0">{t("community.admin" as any)}</Badge>}
                    </div>
                  </div>
                  {isAdmin && m.user_id !== user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded hover:bg-accent"><MoreVertical size={14} /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem className="text-destructive" onClick={() => removeMember(community.id, m.user_id).then(refetch)}>
                          <Trash2 size={14} className="mr-2" /> {t("community.remove" as any)}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>

            {/* Leave group */}
            {isMember && !isAdmin && (
              <Button variant="outline" className="w-full mt-4 text-destructive border-destructive/30" onClick={handleLeave}>
                <LogOut size={14} className="mr-2" /> {t("community.leave" as any)}
              </Button>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex-1 flex items-center justify-center px-5">
          <p className="text-muted-foreground text-sm text-center">Rejoins ce groupe pour accéder aux discussions</p>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚙️ {t("community.settings" as any)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("community.groupName" as any)}</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>{t("community.description" as any)}</Label>
              <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2} />
            </div>
            <div className="flex items-center justify-between gap-3 bg-muted/50 rounded-xl p-3">
              <div>
                <p className="text-sm font-medium">{t("community.moderation" as any)}</p>
                <p className="text-xs text-muted-foreground">{editApproval ? t("community.requireApproval" as any) : t("community.autoJoin" as any)}</p>
              </div>
              <Switch checked={editApproval} onCheckedChange={setEditApproval} />
            </div>
            <Button onClick={handleSaveSettings} className="w-full">{t("community.save" as any)}</Button>
            <Button variant="destructive" className="w-full" onClick={handleDelete}>
              <Trash2 size={14} className="mr-2" /> {t("community.deleteGroup" as any)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
