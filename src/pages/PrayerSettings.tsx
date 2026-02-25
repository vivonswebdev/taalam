import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calculator, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { usePrayerSettings, CALCULATION_METHODS, MADHAB_OPTIONS, LATITUDE_METHODS } from "@/hooks/usePrayerSettings";

export default function PrayerSettings() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { settings, updateSettings } = usePrayerSettings();
  const [city, setCity] = useState(settings.city);
  const [country, setCountry] = useState(settings.country);

  const handleSave = () => {
    updateSettings({ city, country, source: city.trim() ? "city" : "gps" });
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
        {/* Source toggle */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">{t("prayers.settings.location")}</h3>
          </div>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => updateSettings({ source: "gps" })}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${settings.source === "gps" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              📍 GPS
            </button>
            <button
              onClick={() => updateSettings({ source: "city" })}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${settings.source === "city" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              🏙️ {t("prayers.settings.city")}
            </button>
          </div>

          {settings.source === "city" && (
            <div className="space-y-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t("prayers.settings.cityPlaceholder")}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={t("prayers.settings.countryPlaceholder")}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
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
