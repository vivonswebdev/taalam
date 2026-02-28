import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Radio, BarChart3, Settings, User, Brain, Star, Users, ChevronRight, BookOpen, Trophy, Search } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  path: string;
}

function MenuSection({ title, items }: { title: string; items: MenuItem[] }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">{title}</p>
      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-accent/40 transition-colors active:scale-[0.99]"
          >
            <span className="text-lg shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground truncate">{item.label}</p>
              {item.desc && <p className="text-[11px] text-muted-foreground truncate">{item.desc}</p>}
            </div>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function More() {
  const { t } = useLanguage();

  const quranSection: MenuItem[] = [
    { icon: <Clock size={20} className="text-primary" />, label: "Horaires de prière", desc: "Adhan, Qibla et rappels", path: "/prayers" },
    { icon: <Radio size={20} className="text-green-500" />, label: "Live Coran", desc: "Écoute en direct 24/7", path: "/live-quran" },
    { icon: <Search size={20} className="text-indigo-500" />, label: "Trouver une Ayah", desc: "Recherche dans le Coran", path: "/find-ayah" },
    { icon: <Trophy size={20} className="text-amber-500" />, label: "Classement", desc: "Leaderboard & XP", path: "/leaderboard" },
    { icon: <BookOpen size={20} className="text-teal-500" />, label: "Juz / Hizb", desc: "Navigation par Juz", path: "/juz" },
  ];

  const accountSection: MenuItem[] = [
    { icon: <Settings size={20} className="text-muted-foreground" />, label: t("nav.settings"), desc: "Langue, thème, traduction", path: "/settings" },
    { icon: <BarChart3 size={20} className="text-primary" />, label: "Habitudes & progression", desc: "Stats, objectifs et avancement", path: "/habits" },
    { icon: <User size={20} className="text-blue-500" />, label: "Connexion / Profil", path: "/auth" },
  ];

  const modulesSection: MenuItem[] = [
    { icon: <Brain size={20} className="text-purple-500" />, label: "Plan Hifz", desc: "Planning de mémorisation & révisions", path: "/hifz-plan" },
    { icon: <Star size={20} className="text-yellow-500" />, label: "Favoris & Signets", desc: "Ayat sauvegardées", path: "/bookmarks" },
    { icon: <Users size={20} className="text-pink-500" />, label: "Classe Famille", desc: "Suivez vos enfants", path: "/family" },
    { icon: <Users size={20} className="text-indigo-500" />, label: "Classe Professeur", desc: "Gérez vos classes", path: "/classrooms" },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-14 pb-2">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground">
          Plus
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-0.5">Fonctionnalités supplémentaires</p>
      </div>

      <div className="px-5 pt-4 space-y-5">
        <MenuSection title="Qur'an & pratique" items={quranSection} />
        <MenuSection title="Compte & réglages" items={accountSection} />
        <MenuSection title="Modules" items={modulesSection} />
      </div>
    </div>
  );
}
