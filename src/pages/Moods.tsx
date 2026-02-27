import { useNavigate } from "react-router-dom";
import { moodPresets } from "@/data/moodPresets";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Moods() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-black/30 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold">❤️ États du cœur</h1>
          <p className="text-xs text-muted-foreground">Trouve le verset qui parle à ton état</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {moodPresets.map((mood, i) => (
          <motion.button
            key={mood.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/moods/${mood.id}`)}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${mood.color} p-4 text-left min-h-[120px] flex flex-col justify-between border border-white/10 shadow-lg active:scale-95 transition-transform`}
          >
            <span className="text-3xl mb-1">{mood.emoji}</span>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{mood.title}</p>
              <p className="text-white/60 text-[10px] mt-0.5 leading-tight">{mood.subtitle}</p>
            </div>
            {mood.loop && (
              <span className="absolute top-2 right-2 text-[9px] bg-white/15 text-white/80 px-1.5 py-0.5 rounded-full">
                🔁 Boucle
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
