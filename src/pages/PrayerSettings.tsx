import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Calculator, Moon, Search, Loader2, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { usePrayerSettings, CALCULATION_METHODS, MADHAB_OPTIONS, LATITUDE_METHODS } from "@/hooks/usePrayerSettings";
import { useCityAutocomplete, reverseGeocode, type CityResult } from "@/hooks/useCityAutocomplete";

export default function PrayerSettings() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { settings, updateSettings } = usePrayerSettings();
  const [cityQuery, setCityQuery] = useState(
    settings.city && settings.country ? `${settings.city}, ${settings.country}` : settings.city
  );
  const [showResults, setShowResults] = useState(false);
  const { results, loading: acLoading, search, clear } = useCityAutocomplete();
  const [detecting, setDetecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCityInput = (value: string) => {
    setCityQuery(value);
    search(value);
    setShowResults(true);
  };

  const handleSelectCity = (city: CityResult) => {
    setCityQuery(city.displayName);
    updateSettings({
      city: city.city,
      country: city.country,
      lat: city.lat,
      lng: city.lng,
      source: "city",
      locationDetected: true,
    });
    clear();
    setShowResults(false);
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (geo) {
          setCityQuery(geo.displayName);
          updateSettings({
            city: geo.city,
            country: geo.country,
            lat: geo.lat,
            lng: geo.lng,
            source: "city",
            locationDetected: true,
          });
        }
        setDetecting(false);
      },
      () => setDetecting(false),
      { timeout: 8000 }
    );
  };

  // Focus input if navigated with ?focus=city
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("focus") === "city") {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, []);

  const handleSave = () => {
    navigate("/prayers");
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/prayers")} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-foreground">
            {t("prayers.settings.title")}
          </motion.h1>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {/* City with autocomplete */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">{t("prayers.settings.city")}</h3>
          </div>

          {/* Auto-detect button */}
          <button
            onClick={handleDetectLocation}
            disabled={detecting}
            className="w-full flex items-center justify-center gap-2 py-2.5 mb-3 rounded-xl bg-primary/10 text-primary text-xs font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {detecting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Navigation size={14} />
            )}
            {detecting ? t("audio.loading") : "📍 " + t("prayers.detectCity")}
          </button>

          {/* City input with autocomplete */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={cityQuery}
              onChange={(e) => handleCityInput(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              placeholder={t("prayers.settings.cityPlaceholder")}
              className="w-full bg-muted rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Autocomplete dropdown */}
            <AnimatePresence>
              {showResults && (results.length > 0 || acLoading) && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto"
                >
                  {acLoading && (
                    <div className="flex items-center justify-center py-3 gap-2 text-muted-foreground">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-xs">{t("audio.loading")}</span>
                    </div>
                  )}
                  {results.map((r, i) => (
                    <button
                      key={`${r.lat}-${r.lng}-${i}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectCity(r)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-accent/50 transition-colors text-left border-b border-border last:border-b-0"
                    >
                      <MapPin size={12} className="text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground">{r.displayName}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Current location info */}
          {settings.city && (
            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
              <MapPin size={10} />
              {settings.city}, {settings.country}
              {settings.lat && ` (${settings.lat.toFixed(2)}, ${settings.lng?.toFixed(2)})`}
            </p>
          )}
        </motion.div>

        {/* Calculation Method */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calculator size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">{t("prayers.settings.method")}</h3>
          </div>
          <select
            value={settings.method}
            onChange={(e) => updateSettings({ method: Number(e.target.value) })}
            className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          >
            {CALCULATION_METHODS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </motion.div>

        {/* Madhhab */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Moon size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">{t("prayers.settings.madhab")}</h3>
          </div>
          <div className="flex gap-2">
            {MADHAB_OPTIONS.map((m) => (
              <button
                key={m.id}
                onClick={() => updateSettings({ school: m.id })}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors ${settings.school === m.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {t(m.labelKey)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Latitude Adjustment */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">{t("prayers.settings.latitudeMethod")}</h3>
          <div className="space-y-1">
            {LATITUDE_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => updateSettings({ latitudeAdjustmentMethod: m.id })}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${settings.latitudeAdjustmentMethod === m.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {t(m.labelKey)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Save button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleSave}
          className="w-full bg-primary text-primary-foreground rounded-2xl py-3.5 font-semibold text-sm active:scale-[0.98] transition-transform"
        >
          {t("prayers.settings.save")}
        </motion.button>
      </div>
    </div>
  );
}
