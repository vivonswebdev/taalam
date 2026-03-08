/**
 * Seed data: fictional leaderboard users across 30 countries.
 * Generated client-side, never stored in DB.
 * Uses a deterministic seeded random so the list is stable across renders.
 */

import type { LeaderboardEntry } from "@/hooks/useLeaderboard";
import { getLigue, getHifzLevel } from "@/components/LigueBadge";

// ── Seeded PRNG (mulberry32) ────────────────────────────────────
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Name pools by region ────────────────────────────────────────
const NAMES: Record<string, string[]> = {
  arabic: [
    "محمد العلي", "فاطمة السعيد", "عبدالله الحسن", "عائشة المحمود",
    "عمر الشريف", "خديجة النور", "يوسف الأمين", "مريم الكريم",
    "إبراهيم الفاضل", "زينب البركة", "أحمد الصالح", "سارة الرحمة",
    "حسن الطيب", "رقية الخير", "علي المبارك", "آمنة السلام",
  ],
  french: [
    "Youssef Benali", "Amina Toure", "Karim Mansouri", "Leila Cherif",
    "Omar Diallo", "Nadia Bouguerra", "Ibrahim Aziz", "Samira Kone",
    "Moussa Traore", "Khadija Diop", "Bilal Cisse", "Fatou Sow",
  ],
  indonesian: [
    "Ahmad Fauzi", "Siti Nurhaliza", "Muhammad Rizki", "Fatimah Zahra",
    "Abdullah Rahman", "Aisyah Putri", "Yusuf Hakim", "Maryam Sari",
    "Umar Hasan", "Khadijah Dewi", "Ibrahim Wijaya", "Aminah Lestari",
  ],
  turkish: [
    "Mehmet Yılmaz", "Ayşe Demir", "Mustafa Kaya", "Fatma Çelik",
    "Ali Şahin", "Zeynep Yıldız", "Ahmet Arslan", "Elif Aydın",
  ],
  south_asian: [
    "Muhammad Khan", "Ayesha Malik", "Ahmed Ali", "Fatima Bibi",
    "Usman Sheikh", "Zainab Hussain", "Ibrahim Iqbal", "Maryam Noor",
    "Hassan Raza", "Hafsa Ahmed", "Omar Siddiqui", "Ruqayyah Khan",
  ],
  african: [
    "Abubakar Sanusi", "Amina Musa", "Ibrahim Adamu", "Khadija Bello",
    "Yusuf Abdullahi", "Zainab Ibrahim", "Umar Suleiman", "Aisha Garba",
  ],
  european: [
    "Adam Kowalski", "Mariam Schmidt", "Yusuf Müller", "Amina Rossi",
    "Ibrahim Popov", "Fatima Novak", "Omar Jensen", "Leila Kovač",
  ],
};

const AVATARS = ["🧕", "👳", "🧔", "👩", "👨", "🧑", "👦", "👧", "🕌", "📖", "🌙", "⭐"];

// ── Country distribution ────────────────────────────────────────
const COUNTRIES = [
  { code: "SA", region: "arabic", n: 20 },
  { code: "EG", region: "arabic", n: 25 },
  { code: "ID", region: "indonesian", n: 30 },
  { code: "PK", region: "south_asian", n: 22 },
  { code: "BD", region: "south_asian", n: 15 },
  { code: "TR", region: "turkish", n: 18 },
  { code: "MA", region: "arabic", n: 16 },
  { code: "DZ", region: "french", n: 14 },
  { code: "TN", region: "french", n: 10 },
  { code: "MY", region: "indonesian", n: 14 },
  { code: "AE", region: "arabic", n: 10 },
  { code: "JO", region: "arabic", n: 8 },
  { code: "PS", region: "arabic", n: 9 },
  { code: "LB", region: "arabic", n: 7 },
  { code: "IQ", region: "arabic", n: 12 },
  { code: "SY", region: "arabic", n: 8 },
  { code: "YE", region: "arabic", n: 6 },
  { code: "KW", region: "arabic", n: 5 },
  { code: "QA", region: "arabic", n: 4 },
  { code: "BH", region: "arabic", n: 3 },
  { code: "OM", region: "arabic", n: 4 },
  { code: "SN", region: "french", n: 8 },
  { code: "NG", region: "african", n: 12 },
  { code: "SO", region: "african", n: 5 },
  { code: "FR", region: "french", n: 11 },
  { code: "BE", region: "french", n: 6 },
  { code: "DE", region: "european", n: 7 },
  { code: "GB", region: "european", n: 8 },
  { code: "NL", region: "european", n: 5 },
  { code: "SE", region: "european", n: 4 },
] as const;

// ── Generator (memoised) ────────────────────────────────────────
let _cache: LeaderboardEntry[] | null = null;

export function getSeedLeaderboardUsers(): LeaderboardEntry[] {
  if (_cache) return _cache;

  const rng = mulberry32(42); // deterministic seed
  const users: LeaderboardEntry[] = [];
  let idx = 0;

  for (const country of COUNTRIES) {
    const pool = NAMES[country.region] || NAMES.arabic;
    for (let i = 0; i < country.n; i++) {
      const xp = Math.floor(rng() * 8000 + 200); // 200 – 8200
      const mastery = Math.floor(rng() * 80 + 20); // 20 – 100
      const streak = Math.floor(rng() * 120);
      const sessions = Math.floor(rng() * 200 + 5);
      const name = pool[Math.floor(rng() * pool.length)];
      const avatar = AVATARS[Math.floor(rng() * AVATARS.length)];

      users.push({
        id: `seed_${idx}`,
        user_id: `seed_uid_${idx}`,
        display_name: name,
        avatar_emoji: avatar,
        country_code: country.code,
        xp_total: xp,
        mastery_score: mastery,
        sessions_count: sessions,
        streak_days: streak,
        ligue: getLigue(xp),
        level: getHifzLevel(mastery),
      });
      idx++;
    }
  }

  // Sort descending by XP
  users.sort((a, b) => b.xp_total - a.xp_total);
  _cache = users;
  return users;
}
