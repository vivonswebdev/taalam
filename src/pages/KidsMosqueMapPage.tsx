import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Navigation, ExternalLink, RefreshCw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { trackEvent } from "@/lib/trackEvent";

type Mosque = { id: number; name: string; lat: number; lon: number; distance?: number };

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

async function fetchMosques(lat: number, lon: number, radius: number): Promise<Mosque[]> {
  const query = `[out:json][timeout:10];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon}););out center 20;`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: `data=${encodeURIComponent(query)}`, headers: { "Content-Type": "application/x-www-form-urlencoded" }, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error("overpass");
    const data = await res.json();
    return (data.elements || []).slice(0, 20).map((el: any) => {
      const mlat = el.lat ?? el.center?.lat;
      const mlon = el.lon ?? el.center?.lon;
      return { id: el.id, name: el.tags?.name || "", lat: mlat, lon: mlon, distance: haversine(lat, lon, mlat, mlon) };
    }).sort((a: Mosque, b: Mosque) => (a.distance ?? 0) - (b.distance ?? 0));
  } catch { clearTimeout(timer); throw new Error("overpass"); }
}

export default function KidsMosqueMapPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [geoState, setGeoState] = useState<"idle" | "loading" | "granted" | "denied">("idle");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestGeo = useCallback(() => {
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setGeoState("granted"); },
      () => setGeoState("denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    trackEvent("module_open", "kids_mosque_map");
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        let results = await fetchMosques(coords.lat, coords.lon, 3000);
        if (results.length === 0) results = await fetchMosques(coords.lat, coords.lon, 10000);
        if (!cancelled) setMosques(results);
      } catch { if (!cancelled) setError("fetch"); }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [coords]);

  return (
    <div className="min-h-screen pb-28">
      <div className="px-5 pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft size={20} />
          <span className="text-sm">{t("join.back" as any)}</span>
        </button>
        <div className="text-center mb-6">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl inline-block mb-2">🕌</motion.span>
          <h1 className="text-2xl font-bold text-foreground">{t("kidsMosque.title" as any)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("kidsMosque.subtitle" as any)}</p>
        </div>
      </div>

      <div className="px-5">
        {/* Geo permission */}
        {geoState === "idle" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <span className="text-4xl inline-block mb-3">📍</span>
              <p className="text-sm text-muted-foreground mb-4">{t("kidsMosque.geoExplain" as any)}</p>
              <button onClick={requestGeo} className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2">
                <Navigation size={16} /> {t("kidsMosque.allowGeo" as any)}
              </button>
            </div>
          </motion.div>
        )}

        {geoState === "loading" && (
          <div className="text-center py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Navigation size={32} className="text-primary mx-auto" />
            </motion.div>
            <p className="text-sm text-muted-foreground mt-3">{t("kidsMosque.locating" as any)}</p>
          </div>
        )}

        {geoState === "denied" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <span className="text-4xl inline-block mb-3">😔</span>
              <p className="text-sm text-muted-foreground mb-4">{t("kidsMosque.geoDenied" as any)}</p>
              <button onClick={() => navigate("/prayers")} className="w-full py-3 rounded-2xl bg-muted text-sm font-semibold">
                {t("kidsMosque.goQibla" as any)}
              </button>
            </div>
          </motion.div>
        )}

        {/* Map + results */}
        {geoState === "granted" && coords && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Leaflet map */}
            <LazyMap center={coords} mosques={mosques} />

            {/* Loading / Error */}
            {loading && (
              <div className="text-center py-4">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="inline-block">
                  <RefreshCw size={20} className="text-primary" />
                </motion.div>
                <p className="text-xs text-muted-foreground mt-1">{t("kidsMosque.searching" as any)}</p>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 text-center">
                <p className="text-sm text-destructive">{t("kidsMosque.fetchError" as any)}</p>
                <button onClick={() => setCoords({ ...coords })} className="mt-2 text-xs text-primary font-semibold">{t("kidsMosque.retry" as any)}</button>
              </div>
            )}

            {/* Mosque list */}
            {!loading && !error && mosques.length === 0 && (
              <div className="bg-card border border-border rounded-2xl p-5 text-center">
                <span className="text-3xl inline-block mb-2">🔍</span>
                <p className="text-sm text-muted-foreground">{t("kidsMosque.noResults" as any)}</p>
              </div>
            )}

            {!loading && mosques.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                  {t("kidsMosque.found" as any).replace("{n}", String(mosques.length))}
                </p>
                {mosques.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
                  >
                    <span className="text-2xl">🕌</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{m.name || t("kidsMosque.unnamed" as any)}</p>
                      {m.distance !== undefined && (
                        <p className="text-xs text-muted-foreground">{formatDistance(m.distance)}</p>
                      )}
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-2 rounded-xl bg-primary/10 text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={16} />
                    </a>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Safety notice */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <span className="text-base">⚠️</span>
              <span>{t("kidsMosque.safety" as any)}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ═══ Lazy-loaded Leaflet map ═══ */
import { lazy, Suspense } from "react";
const LeafletMap = lazy(() => import("@/components/KidsMosqueLeafletMap"));

function LazyMap({ center, mosques }: { center: { lat: number; lon: number }; mosques: Mosque[] }) {
  return (
    <Suspense fallback={<div className="h-64 rounded-2xl bg-muted animate-pulse" />}>
      <LeafletMap center={center} mosques={mosques} />
    </Suspense>
  );
}
