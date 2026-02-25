import { useState, useCallback } from "react";

export interface PrayerSettings {
  city: string;
  country: string;
  method: number; // AlAdhan method ID
  school: number; // 0 = Shafi'i (standard), 1 = Hanafi
  latitudeAdjustmentMethod: number; // 1 = Middle of Night, 2 = One Seventh, 3 = Angle based
  source: "city" | "gps"; // whether to use city or GPS
}

export const CALCULATION_METHODS = [
  { id: 0, label: "Shia Ithna-Ashari" },
  { id: 1, label: "University of Islamic Sciences, Karachi" },
  { id: 2, label: "Islamic Society of North America (ISNA)" },
  { id: 3, label: "Muslim World League (MWL)" },
  { id: 4, label: "Umm Al-Qura University, Makkah" },
  { id: 5, label: "Egyptian General Authority of Survey" },
  { id: 7, label: "Institute of Geophysics, University of Tehran" },
  { id: 8, label: "Gulf Region" },
  { id: 9, label: "Kuwait" },
  { id: 10, label: "Qatar" },
  { id: 11, label: "Majlis Ugama Islam Singapura" },
  { id: 12, label: "Union des Organisations Islamiques de France" },
  { id: 13, label: "Diyanet İşleri Başkanlığı, Turkey" },
  { id: 14, label: "Spiritual Administration of Muslims of Russia" },
  { id: 15, label: "Moonsighting Committee Worldwide" },
];

export const MADHAB_OPTIONS = [
  { id: 0, labelKey: "prayers.settings.shafii" as const },
  { id: 1, labelKey: "prayers.settings.hanafi" as const },
];

export const LATITUDE_METHODS = [
  { id: 1, labelKey: "prayers.settings.midNight" as const },
  { id: 2, labelKey: "prayers.settings.oneSeventh" as const },
  { id: 3, labelKey: "prayers.settings.angleBased" as const },
];

const STORAGE_KEY = "quranEasyPrayerSettings";

const defaultSettings: PrayerSettings = {
  city: "",
  country: "",
  method: 12, // UOIF (France) — sensible default for Brussels area
  school: 0,
  latitudeAdjustmentMethod: 3,
  source: "gps",
};

function load(): PrayerSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {}
  return { ...defaultSettings };
}

function save(s: PrayerSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function usePrayerSettings() {
  const [settings, setSettings] = useState<PrayerSettings>(load);

  const updateSettings = useCallback((partial: Partial<PrayerSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      save(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    save(defaultSettings);
    setSettings({ ...defaultSettings });
  }, []);

  return { settings, updateSettings, resetSettings };
}
