import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Check, Loader2, WifiOff } from "lucide-react";
import { moodPresets } from "@/data/moodPresets";

const OFFLINE_PRESETS = ["sleep", "ruqya", "study", "success"] as const;
const CACHE_NAME = "mood-audio-v1";
const OFFLINE_KEY = "taaloum_offline_moods";

function getStoredOffline(): string[] {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
  } catch {
    return [];
  }
}

function expandVersesForAudio(verses: typeof moodPresets[0]["verses"]) {
  const items: { surah: number; ayah: number }[] = [];
  for (const v of verses) {
    if (v.start && v.end) {
      for (let i = v.start; i <= v.end; i++) items.push({ surah: v.surahNumber, ayah: i });
    } else if (v.ayahs) {
      for (const a of v.ayahs) items.push({ surah: v.surahNumber, ayah: a });
    }
  }
  return items;
}

export default function OfflineMoodDownloader() {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(getStoredOffline()));
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<Set<string>>(() => new Set(getStoredOffline()));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDownload = async () => {
    const toDownload = [...selected].filter((id) => !downloaded.has(id));
    if (!toDownload.length) return;

    for (const moodId of toDownload) {
      setDownloading(moodId);
      const mood = moodPresets.find((m) => m.id === moodId);
      if (!mood) continue;

      const items = expandVersesForAudio(mood.verses);
      const cache = await caches.open(CACHE_NAME);

      // Cache surah text JSONs
      const surahNumbers = [...new Set(items.map((i) => i.surah))];
      for (const sn of surahNumbers) {
        const textUrl = `https://api.alquran.cloud/v1/surah/${sn}`;
        try { await cache.add(textUrl); } catch {}
      }

      // Cache audio files
      for (const item of items) {
        const audioApiUrl = `https://api.alquran.cloud/v1/ayah/${item.surah}:${item.ayah}/ar.alafasy`;
        try {
          await cache.add(audioApiUrl);
          // Also fetch and cache the actual mp3
          const res = await fetch(audioApiUrl);
          const data = await res.json();
          if (data.data?.audio) {
            try { await cache.add(data.data.audio); } catch {}
          }
        } catch {}
      }

      setDownloaded((prev) => new Set([...prev, moodId]));
    }

    const allDownloaded = [...selected];
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(allDownloaded));
    setDownloading(null);
  };

  const presets = moodPresets.filter((m) => OFFLINE_PRESETS.includes(m.id as any));
  const hasNew = [...selected].some((id) => !downloaded.has(id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <div className="p-4">
        <p className="text-sm font-medium text-card-foreground mb-1 flex items-center gap-2">
          <WifiOff size={18} className="text-primary" />
          Télécharger pour hors-ligne
        </p>
        <p className="text-xs text-muted-foreground mb-3">Audio des États du cœur disponible sans connexion</p>

        <div className="space-y-2">
          {presets.map((mood) => (
            <button
              key={mood.id}
              onClick={() => toggle(mood.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-colors text-left ${
                selected.has(mood.id)
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-accent/50"
              }`}
            >
              <span className="text-lg">{mood.emoji}</span>
              <span className="flex-1 text-xs font-medium text-card-foreground">{mood.title}</span>
              {downloaded.has(mood.id) ? (
                <Check size={16} className="text-emerald-500" />
              ) : downloading === mood.id ? (
                <Loader2 size={16} className="text-primary animate-spin" />
              ) : null}
            </button>
          ))}
        </div>

        {hasNew && (
          <button
            onClick={handleDownload}
            disabled={!!downloading}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 transition-opacity"
          >
            {downloading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Téléchargement...
              </>
            ) : (
              <>
                <Download size={16} />
                Télécharger
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
