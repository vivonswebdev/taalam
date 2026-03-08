export interface FictiveUser {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  avatar: string;
  totalScore: number;
  versesCompleted: number;
  averageAccuracy: number;
  streak: number;
  joinedDays: number;
}

const ARABIC_NAMES = [
  "محمد العلي", "فاطمة السعيد", "عبدالله الحسن", "عائشة المحمود",
  "عمر الشريف", "خديجة النور", "يوسف الأمين", "مريم الكريم",
  "إبراهيم الفاضل", "زينب البركة", "أحمد الصالح", "سارة الرحمة"
];

const FRENCH_NAMES = [
  "Youssef Benali", "Amina Toure", "Karim Mansouri", "Leila Cherif",
  "Omar Diallo", "Nadia Bouguerra", "Ibrahim Aziz", "Samira Kone"
];

const INDO_MALAY_NAMES = [
  "Ahmad Fauzi", "Siti Nurhaliza", "Muhammad Rizki", "Fatimah Zahra",
  "Abdullah Rahman", "Aisyah Putri", "Yusuf Hakim", "Maryam Sari"
];

const TURKISH_NAMES = [
  "Mehmet Yılmaz", "Ayşe Demir", "Mustafa Kaya", "Fatma Çelik",
  "Ali Şahin", "Zeynep Yıldız", "Ahmet Arslan", "Elif Aydın"
];

const SOUTH_ASIAN_NAMES = [
  "Muhammad Khan", "Ayesha Malik", "Ahmed Ali", "Fatima Bibi",
  "Usman Sheikh", "Zainab Hussain", "Ibrahim Iqbal", "Maryam Noor"
];

const COUNTRIES = [
  { name: "Arabie Saoudite", code: "SA", flag: "🇸🇦", names: ARABIC_NAMES, users: 15 },
  { name: "Égypte", code: "EG", flag: "🇪🇬", names: ARABIC_NAMES, users: 20 },
  { name: "Indonésie", code: "ID", flag: "🇮🇩", names: INDO_MALAY_NAMES, users: 25 },
  { name: "Pakistan", code: "PK", flag: "🇵🇰", names: SOUTH_ASIAN_NAMES, users: 18 },
  { name: "Bangladesh", code: "BD", flag: "🇧🇩", names: SOUTH_ASIAN_NAMES, users: 12 },
  { name: "Turquie", code: "TR", flag: "🇹🇷", names: TURKISH_NAMES, users: 14 },
  { name: "Maroc", code: "MA", flag: "🇲🇦", names: ARABIC_NAMES, users: 16 },
  { name: "Algérie", code: "DZ", flag: "🇩🇿", names: FRENCH_NAMES, users: 14 },
  { name: "Tunisie", code: "TN", flag: "🇹🇳", names: FRENCH_NAMES, users: 10 },
  { name: "Malaisie", code: "MY", flag: "🇲🇾", names: INDO_MALAY_NAMES, users: 12 },
  { name: "Émirats", code: "AE", flag: "🇦🇪", names: ARABIC_NAMES, users: 8 },
  { name: "Jordanie", code: "JO", flag: "🇯🇴", names: ARABIC_NAMES, users: 7 },
  { name: "Palestine", code: "PS", flag: "🇵🇸", names: ARABIC_NAMES, users: 9 },
  { name: "Liban", code: "LB", flag: "🇱🇧", names: ARABIC_NAMES, users: 6 },
  { name: "Irak", code: "IQ", flag: "🇮🇶", names: ARABIC_NAMES, users: 11 },
  { name: "Syrie", code: "SY", flag: "🇸🇾", names: ARABIC_NAMES, users: 8 },
  { name: "Sénégal", code: "SN", flag: "🇸🇳", names: FRENCH_NAMES, users: 7 },
  { name: "Nigeria", code: "NG", flag: "🇳🇬", names: [...ARABIC_NAMES, "Abubakar Sanusi"], users: 10 },
  { name: "France", code: "FR", flag: "🇫🇷", names: FRENCH_NAMES, users: 9 },
  { name: "Belgique", code: "BE", flag: "🇧🇪", names: FRENCH_NAMES, users: 5 },
] as const;

// Seeded random for stable results across renders
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

let cachedUsers: FictiveUser[] | null = null;

export function generateFictiveUsers(): FictiveUser[] {
  if (cachedUsers) return cachedUsers;

  const rand = seededRandom(42);
  const users: FictiveUser[] = [];
  let userId = 1000;

  COUNTRIES.forEach(country => {
    for (let i = 0; i < country.users; i++) {
      const name = country.names[Math.floor(rand() * country.names.length)];
      const versesCompleted = Math.floor(50 + rand() * 6000);
      const averageAccuracy = Math.floor(75 + rand() * 23);

      users.push({
        id: `fictive_${userId++}`,
        name,
        country: country.name,
        countryCode: country.code,
        avatar: country.flag,
        totalScore: versesCompleted * averageAccuracy,
        versesCompleted,
        averageAccuracy,
        streak: Math.floor(rand() * 365),
        joinedDays: Math.floor(rand() * 730),
      });
    }
  });

  cachedUsers = users.sort((a, b) => b.totalScore - a.totalScore);
  return cachedUsers;
}

export interface CountryStats {
  country: string;
  countryCode: string;
  flag: string;
  totalUsers: number;
  averageScore: number;
  topUser: FictiveUser;
}

export function getCountryLeaderboard(users: FictiveUser[]): CountryStats[] {
  const map = new Map<string, { country: string; flag: string; total: number; sum: number; top: FictiveUser }>();

  for (const u of users) {
    const e = map.get(u.countryCode);
    if (!e) {
      map.set(u.countryCode, { country: u.country, flag: u.avatar, total: 1, sum: u.totalScore, top: u });
    } else {
      e.total++;
      e.sum += u.totalScore;
      if (u.totalScore > e.top.totalScore) e.top = u;
    }
  }

  return Array.from(map.entries())
    .map(([code, v]) => ({
      country: v.country,
      countryCode: code,
      flag: v.flag,
      totalUsers: v.total,
      averageScore: Math.round(v.sum / v.total),
      topUser: v.top,
    }))
    .sort((a, b) => b.averageScore - a.averageScore);
}
