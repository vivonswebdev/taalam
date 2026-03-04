import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft, Plus, Search, Users, Globe, MessageSquare } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityList, useCommunityActions } from "@/hooks/useCommunity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const CATEGORIES = [
  { value: "all", label: "🎯 Tous" },
  { value: "hifz", label: "📖 Hifz" },
  { value: "quiz", label: "🧠 Quiz" },
  { value: "tarteel", label: "🎤 Tarteel" },
  { value: "studies", label: "📚 Études" },
  { value: "general", label: "💬 Général" },
];

const LANGUAGES_OPTIONS = [
  { value: "all", label: "Toutes" },
  { value: "ar", label: "🇸🇦 العربية" },
  { value: "fr", label: "🇫🇷 Français" },
  { value: "en", label: "🇬🇧 English" },
  { value: "tr", label: "🇹🇷 Türkçe" },
  { value: "nl", label: "🇳🇱 Nederlands" },
  { value: "ur", label: "🇵🇰 اردو" },
];

export default function CommunityPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [language, setLanguage] = useState("all");
  const [showCreate, setShowCreate] = useState(false);

  const { communities, loading, refetch } = useCommunityList({ search, category, language });
  const { createCommunity, joinCommunity } = useCommunityActions();

  // Create form state
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLang, setFormLang] = useState("fr");
  const [formRegion, setFormRegion] = useState("");
  const [formCategory, setFormCategory] = useState("general");
  const [formApproval, setFormApproval] = useState(false);
  const [creating, setCreating] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center px-6 gap-4">
        <Globe size={48} className="text-primary" />
        <p className="text-muted-foreground text-center">{t("community.loginRequired" as any)}</p>
        <Button onClick={() => navigate("/auth")}>{t("more.loginProfile" as any)}</Button>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!formName.trim()) return;
    setCreating(true);
    const result = await createCommunity({ name: formName, description: formDesc, language: formLang, region: formRegion, category: formCategory, requires_approval: formApproval });
    setCreating(false);
    if (result) {
      setShowCreate(false);
      setFormName(""); setFormDesc(""); setFormRegion("");
      refetch();
      navigate(`/community/${result.id}`);
    }
  };

  const handleJoin = async (communityId: string, requiresApproval: boolean) => {
    const c = communities.find(x => x.id === communityId);
    await joinCommunity(communityId, requiresApproval, c?.name);
    refetch();
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-14 pb-3">
        <button onClick={() => navigate("/more")} className="flex items-center gap-1 text-muted-foreground mb-3">
          <ArrowLeft size={18} /> {t("community.back" as any)}
        </button>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground">
          🌍 {t("community.title" as any)}
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-1">{t("community.subtitle" as any)}</p>
      </div>

      {/* Search */}
      <div className="px-5 mb-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("community.search" as any)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category filter chips */}
      <div className="px-5 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === c.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Language filter */}
      <div className="px-5 flex gap-2 overflow-x-auto pb-3 scrollbar-none">
        {LANGUAGES_OPTIONS.map(l => (
          <button
            key={l.value}
            onClick={() => setLanguage(l.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${language === l.value ? "bg-secondary text-secondary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-accent"}`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Create button */}
      <div className="px-5 mb-4">
        <Button onClick={() => setShowCreate(true)} className="w-full gap-2">
          <Plus size={18} /> {t("community.createGroup" as any)}
        </Button>
      </div>

      {/* Groups list */}
      <div className="px-5 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : communities.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">{t("community.noGroups" as any)}</div>
        ) : (
          communities.map(c => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-card-foreground truncate">{c.name}</h3>
                  {c.description && <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {CATEGORIES.find(cat => cat.value === c.category)?.label || c.category}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users size={12} /> {c.member_count} {t("community.members" as any)}</span>
                {c.region && <span className="flex items-center gap-1"><Globe size={12} /> {c.region}</span>}
                {c.language && <span>{LANGUAGES_OPTIONS.find(l => l.value === c.language)?.label || c.language}</span>}
              </div>
              <div className="flex justify-end">
                {c.user_role ? (
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/community/${c.id}`)}>
                    <MessageSquare size={14} className="mr-1" /> {t("community.chat" as any)}
                  </Button>
                ) : c.request_status === "pending" ? (
                  <Badge variant="outline">{t("community.pending" as any)}</Badge>
                ) : (
                  <Button size="sm" onClick={() => handleJoin(c.id, c.requires_approval)}>
                    {t("community.join" as any)}
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>➕ {t("community.createGroup" as any)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("community.groupName" as any)}</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Hifz Paris, Quiz Anglais…" />
            </div>
            <div>
              <Label>{t("community.description" as any)}</Label>
              <Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("community.mainLanguage" as any)}</Label>
                <Select value={formLang} onValueChange={setFormLang}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES_OPTIONS.filter(l => l.value !== "all").map(l => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("community.category" as any)}</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c.value !== "all").map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t("community.regionCity" as any)}</Label>
              <Input value={formRegion} onChange={e => setFormRegion(e.target.value)} placeholder="Paris, Casablanca, London…" />
            </div>
            <div className="flex items-center justify-between gap-3 bg-muted/50 rounded-xl p-3">
              <div>
                <p className="text-sm font-medium">{t("community.moderation" as any)}</p>
                <p className="text-xs text-muted-foreground">{formApproval ? t("community.requireApproval" as any) : t("community.autoJoin" as any)}</p>
              </div>
              <Switch checked={formApproval} onCheckedChange={setFormApproval} />
            </div>
            <Button onClick={handleCreate} disabled={!formName.trim() || creating} className="w-full">
              {creating ? "…" : t("community.create" as any)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
