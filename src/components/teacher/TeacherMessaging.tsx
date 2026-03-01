import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, MessageCircle, Bell, FileText, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTeacherParentMessages, type Conversation } from "@/hooks/useTeacherParentMessages";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Props {
  classId: string | null;
  students: { userId: string; displayName: string; avatarEmoji: string }[];
}

export default function TeacherMessaging({ classId, students }: Props) {
  const { t } = useLanguage();
  const { conversations, messages, loading, fetchConversations, fetchMessages, sendMessage, markAsRead } = useTeacherParentMessages(classId);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [draft, setDraft] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.userId);
      markAsRead(selectedUser.userId);
    }
  }, [selectedUser, fetchMessages, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!draft.trim() || !selectedUser) return;
    await sendMessage(selectedUser.userId, draft.trim());
    setDraft("");
    await fetchMessages(selectedUser.userId);
  };

  const handleNewConversation = async (student: { userId: string; displayName: string; avatarEmoji: string }) => {
    setSelectedUser({
      userId: student.userId,
      displayName: student.displayName,
      avatarEmoji: student.avatarEmoji,
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    });
    setShowNewMessage(false);
    await fetchMessages(student.userId);
  };

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  // Chat view
  if (selectedUser) {
    return (
      <div className="flex flex-col h-[500px]">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 border-b border-border bg-card rounded-t-xl">
          <button onClick={() => { setSelectedUser(null); fetchConversations(); }} className="p-1 hover:bg-muted rounded-lg">
            <ArrowLeft size={18} />
          </button>
          <span className="text-xl">{selectedUser.avatarEmoji}</span>
          <span className="text-sm font-semibold truncate">{selectedUser.displayName}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/30">
          {messages.map((m) => {
            const isMe = m.sender_id !== selectedUser.userId;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs ${
                  isMe
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border rounded-bl-md"
                }`}>
                  {m.message_type === "auto" && (
                    <div className="flex items-center gap-1 mb-1 opacity-70">
                      <Bell size={10} />
                      <span className="text-[9px]">{t("messaging.auto" as any)}</span>
                    </div>
                  )}
                  {m.message_type === "report" && (
                    <div className="flex items-center gap-1 mb-1 opacity-70">
                      <FileText size={10} />
                      <span className="text-[9px]">{t("messaging.report" as any)}</span>
                    </div>
                  )}
                  <p>{m.message}</p>
                  <p className={`text-[9px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {format(new Date(m.created_at), "HH:mm")}
                  </p>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 p-3 border-t border-border bg-card rounded-b-xl">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t("messaging.placeholder" as any)}
            className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm outline-none border border-border focus:border-primary"
          />
          <button onClick={handleSend} disabled={!draft.trim()} className="bg-primary text-primary-foreground rounded-xl p-2 disabled:opacity-40">
            <Send size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Conversations list
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold">{t("messaging.title" as any)}</p>
          {totalUnread > 0 && (
            <Badge variant="destructive" className="text-[9px] px-1.5 py-0">{totalUnread}</Badge>
          )}
        </div>
        <button onClick={() => setShowNewMessage(!showNewMessage)} className="text-xs text-primary font-semibold">
          + {t("messaging.newMessage" as any)}
        </button>
      </div>

      {/* New message - pick student */}
      <AnimatePresence>
        {showNewMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="bg-muted/50 rounded-xl p-3 space-y-2">
              <p className="text-[10px] text-muted-foreground">{t("messaging.selectStudent" as any)}</p>
              <div className="grid grid-cols-2 gap-2">
                {students.map((s) => (
                  <button
                    key={s.userId}
                    onClick={() => handleNewConversation(s)}
                    className="flex items-center gap-2 bg-card border border-border rounded-xl p-2 hover:bg-primary/10 transition-colors text-left"
                  >
                    <span className="text-lg">{s.avatarEmoji}</span>
                    <span className="text-xs font-medium truncate">{s.displayName}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversations */}
      {conversations.length === 0 && !loading ? (
        <div className="text-center py-8">
          <MessageCircle size={32} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">{t("messaging.noMessages" as any)}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <motion.button
              key={c.userId}
              onClick={() => setSelectedUser(c)}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:shadow-sm transition-shadow text-left"
            >
              <div className="relative">
                <span className="text-2xl">{c.avatarEmoji}</span>
                {c.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {c.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{c.displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{c.lastMessage}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[9px] text-muted-foreground">
                  {format(new Date(c.lastMessageAt), "HH:mm")}
                </span>
                <ChevronRight size={14} className="text-muted-foreground" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
