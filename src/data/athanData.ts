export interface AthanReciter {
  id: string;
  name: string;
  nameArabic: string;
  country: string;
  descriptionKey: string;
  audioUrl: string;
  duration: number;
  popular: boolean;
}

export const athanReciters: AthanReciter[] = [
  {
    id: "alafasy",
    name: "Mishary Rashid Alafasy",
    nameArabic: "مشاري راشد العفاسي",
    country: "🇰🇼",
    descriptionKey: "athan.descAlafasy",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
    duration: 180,
    popular: true,
  },
  {
    id: "abdulbasit",
    name: "Abdul Basit Abdul Samad",
    nameArabic: "عبد الباسط عبد الصمد",
    country: "🇪🇬",
    descriptionKey: "athan.descAbdulbasit",
    audioUrl: "https://cdn.islamic.network/quran/audio/64/ar.abdulbasitmurattal/1.mp3",
    duration: 200,
    popular: true,
  },
  {
    id: "ali-mullah",
    name: "Sheikh Ali Ahmed Mullah",
    nameArabic: "الشيخ علي أحمد ملا",
    country: "🇸🇦",
    descriptionKey: "athan.descAliMullah",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/112.mp3",
    duration: 210,
    popular: true,
  },
  {
    id: "hudhaify",
    name: "Ali Al-Hudhaify",
    nameArabic: "علي الحذيفي",
    country: "🇸🇦",
    descriptionKey: "athan.descHudhaify",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.hudhaify/1.mp3",
    duration: 190,
    popular: false,
  },
  {
    id: "minshawi",
    name: "Mohamed Siddiq El-Minshawi",
    nameArabic: "محمد صديق المنشاوي",
    country: "🇪🇬",
    descriptionKey: "athan.descMinshawi",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.minshawi/1.mp3",
    duration: 195,
    popular: false,
  },
  {
    id: "default",
    name: "Simple Notification",
    nameArabic: "إشعار بسيط",
    country: "📱",
    descriptionKey: "athan.descDefault",
    audioUrl: "",
    duration: 5,
    popular: false,
  },
];

export const getAthanReciterById = (id: string): AthanReciter | undefined =>
  athanReciters.find((r) => r.id === id);

export const getDefaultAthanReciter = (): AthanReciter => athanReciters[0];
