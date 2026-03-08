/**
 * Seed data: fictional kids for the Kids Leaderboard.
 * Deterministic via mulberry32 PRNG. Never stored in DB.
 */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const KIDS_NAMES: Record<string, string[]> = {
  arabic: [
    "محمد", "فاطمة", "علي", "مريم", "أحمد", "عائشة", "يوسف", "خديجة",
    "عمر", "زينب", "حسن", "رقية", "إبراهيم", "سارة", "عبدالله", "آمنة",
  ],
  french: [
    "Youssef", "Amina", "Adam", "Leila", "Rayan", "Nour", "Malik", "Sara",
    "Ilyes", "Maryam", "Ayoub", "Kenza", "Bilal", "Lina", "Ismail", "Salma",
  ],
  indonesian: [
    "Ahmad", "Siti", "Muhammad", "Fatimah", "Ali", "Aisyah", "Umar", "Maryam",
    "Yusuf", "Khadijah", "Hassan", "Zahra", "Ibrahim", "Aminah",
  ],
  turkish: [
    "Mehmet", "Ayşe", "Ali", "Fatma", "Ahmet", "Zeynep", "Mustafa", "Elif",
    "Yusuf", "Meryem", "Ömer", "Esra", "İbrahim", "Hatice",
  ],
  south_asian: [
    "Muhammad", "Ayesha", "Ahmed", "Fatima", "Ali", "Zainab", "Usman", "Maryam",
    "Hassan", "Hafsa", "Omar", "Ruqayyah", "Ibrahim", "Aisha",
  ],
  european: [
    "Adam", "Mira", "Noah", "Amira", "Lucas", "Yasmine", "Leo", "Leila",
    "Oscar", "Nora", "Max", "Sofia", "Felix", "Emma",
  ],
  african: [
    "Abubakar", "Amina", "Ibrahim", "Khadija", "Yusuf", "Zainab", "Umar", "Aisha",
  ],
};

const AVATARS = [
  "🦁", "🐯", "🐻", "🐼", "🐨", "🐸", "🐵", "🦊", "🦝", "🐰",
  "🐱", "🐶", "🐹", "🐭", "🦄", "🐮", "🐷", "🐔", "🦉", "🦅",
  "🐘", "🦒", "🦓", "🐪", "🦘", "🦩", "🐬", "🐳", "🦈", "🐙",
];

const COUNTRIES = [
  { code: "SA", region: "arabic", n: 15 },
  { code: "EG", region: "arabic", n: 20 },
  { code: "ID", region: "indonesian", n: 25 },
  { code: "PK", region: "south_asian", n: 18 },
  { code: "BD", region: "south_asian", n: 10 },
  { code: "TR", region: "turkish", n: 15 },
  { code: "MA", region: "arabic", n: 14 },
  { code: "DZ", region: "french", n: 12 },
  { code: "TN", region: "french", n: 10 },
  { code: "MY", region: "indonesian", n: 12 },
  { code: "AE", region: "arabic", n: 9 },
  { code: "FR", region: "french", n: 11 },
  { code: "BE", region: "french", n: 8 },
  { code: "GB", region: "european", n: 10 },
  { code: "DE", region: "european", n: 8 },
  { code: "NL", region: "european", n: 7 },
  { code: "NG", region: "african", n: 10 },
  { code: "SN", region: "french", n: 6 },
] as const;

export interface KidsSeedEntry {
  id: string;
  name: string;
  avatar_emoji: string;
  country_code: string;
  age: number;
  total_points: number;
  parent_id: string; // fake parent id
  badges: { icon: string; rarity: string }[];
}

let _cache: KidsSeedEntry[] | null = null;

export function getKidsSeedLeaderboard(): KidsSeedEntry[] {
  if (_cache) return _cache;

  const rng = mulberry32(7777);
  const kids: KidsSeedEntry[] = [];
  let idx = 0;

  const BADGE_DEFS: { icon: string; rarity: string; minPts: number }[] = [
    { icon: "🌟", rarity: "common", minPts: 50 },
    { icon: "📖", rarity: "common", minPts: 100 },
    { icon: "🎯", rarity: "rare", minPts: 300 },
    { icon: "🏆", rarity: "rare", minPts: 500 },
    { icon: "🔥", rarity: "epic", minPts: 800 },
    { icon: "💎", rarity: "legendary", minPts: 1200 },
    { icon: "👑", rarity: "legendary", minPts: 1500 },
  ];

  for (const country of COUNTRIES) {
    const pool = KIDS_NAMES[country.region] || KIDS_NAMES.arabic;
    for (let i = 0; i < country.n; i++) {
      const name = pool[Math.floor(rng() * pool.length)];
      const avatar = AVATARS[Math.floor(rng() * AVATARS.length)];
      const age = Math.floor(rng() * 13) + 4; // 4-16
      const total_points = Math.floor(rng() * 2000 + 20);
      const badges = BADGE_DEFS.filter((b) => total_points >= b.minPts).map((b) => ({
        icon: b.icon,
        rarity: b.rarity,
      }));

      kids.push({
        id: `kseed_${idx}`,
        name,
        avatar_emoji: avatar,
        country_code: country.code,
        age,
        total_points,
        parent_id: `kseed_parent_${idx}`,
        badges,
      });
      idx++;
    }
  }

  kids.sort((a, b) => b.total_points - a.total_points);
  _cache = kids;
  return kids;
}
