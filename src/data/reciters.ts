export interface ReciterData {
  id: string;
  name: string;
  nameArabic: string;
  apiEdition: string;
  popular: boolean;
  category?: "kids";
}

export const RECITERS_LIST: ReciterData[] = [
  // Populaires
  { id: "ar.alafasy", name: "Mishary Al-Afasy", nameArabic: "مشاري العفاسي", apiEdition: "ar.alafasy", popular: true },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary", nameArabic: "محمود خليل الحصري", apiEdition: "ar.husary", popular: true },
  { id: "ar.minshawi", name: "Mohamed Al-Minshawi", nameArabic: "محمد صديق المنشاوي", apiEdition: "ar.minshawi", popular: true },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit (Murattal)", nameArabic: "عبد الباسط عبد الصمد", apiEdition: "ar.abdulbasitmurattal", popular: true },
  { id: "ar.abdurrahmaansudais", name: "Abdurrahman As-Sudais", nameArabic: "عبد الرحمن السديس", apiEdition: "ar.abdurrahmaansudais", popular: true },
  { id: "ar.ghamadi", name: "Saad Al-Ghamadi", nameArabic: "سعد الغامدي", apiEdition: "ar.ghamadi", popular: true },
  { id: "ar.shuraim", name: "Saud Ash-Shuraim", nameArabic: "سعود الشريم", apiEdition: "ar.shuraim", popular: true },
  { id: "ar.ajmi", name: "Ahmad Al-Ajmi", nameArabic: "أحمد العجمي", apiEdition: "ar.ahmedajamy", popular: true },
  { id: "ar.rifai", name: "Hani Ar-Rifai", nameArabic: "هاني الرفاعي", apiEdition: "ar.hanirifai", popular: true },
  { id: "ar.shatri", name: "Abu Bakr Ash-Shatri", nameArabic: "أبو بكر الشاطري", apiEdition: "ar.aaborakrshatri", popular: true },

  // Autres
  { id: "ar.tablawi", name: "Mohammad At-Tablawi", nameArabic: "محمد الطبلاوي", apiEdition: "ar.muhammadayyoub", popular: false },
  { id: "ar.basfar", name: "Abdullah Basfar", nameArabic: "عبد الله بصفر", apiEdition: "ar.abdullahbasfar", popular: false },
  { id: "ar.budair", name: "Abdullah Al-Budair", nameArabic: "عبد الله البعيجان", apiEdition: "ar.abdullahbasfar", popular: false },
  { id: "ar.jibreen", name: "Abdullah Jibreen", nameArabic: "عبد الله الجبرين", apiEdition: "ar.abdullahbasfar", popular: false },
  { id: "ar.mujawwad", name: "Abdul Basit (Mujawwad)", nameArabic: "عبد الباسط (مجوّد)", apiEdition: "ar.abdulsamad", popular: false },

  // Enfants
  { id: "ar.taha", name: "Muhammad Taha Al-Junayd", nameArabic: "محمد طه الجنيد", apiEdition: "ar.muhammadjibreel", popular: true, category: "kids" },
];

const STORAGE_KEY = "taaloum_selected_reciter";

export function getSelectedReciterId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && RECITERS_LIST.find((r) => r.id === stored)) return stored;
  } catch {}
  return "ar.alafasy";
}

export function setSelectedReciterId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {}
}

export function getSelectedReciter(): ReciterData {
  const id = getSelectedReciterId();
  return RECITERS_LIST.find((r) => r.id === id) || RECITERS_LIST[0];
}
