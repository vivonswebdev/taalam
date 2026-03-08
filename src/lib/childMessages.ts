/** Centralised child-mode feedback messages — now i18n-aware */

const SUCCESS_KEYS = [
  "childMsg.success1",
  "childMsg.success2",
  "childMsg.success3",
  "childMsg.success4",
  "childMsg.success5",
] as const;

const ENCOURAGE_KEYS = [
  "childMsg.encourage1",
  "childMsg.encourage2",
  "childMsg.encourage3",
  "childMsg.encourage4",
] as const;

// Fallback French messages for contexts without i18n access
export const CHILD_SUCCESS_MESSAGES = [
  "Super champion ! 🌟",
  "Mâ shâ'a Llâh ! 🏆",
  "Bravo, tu progresses ! ⭐",
  "Excellent travail ! 🌙",
  "Continue comme ça ! 💚",
];

export const CHILD_ENCOURAGE_MESSAGES = [
  "Tu peux y arriver ! 💪",
  "Réessaie, tu vas réussir ! 🌟",
  "Ne lâche pas ! ⭐",
  "Allah est avec les patients 🤲",
];

const EMOJIS_SUCCESS = ["🌟", "🏆", "⭐", "🌙", "💚"];
const EMOJIS_ENCOURAGE = ["💪", "🌟", "⭐", "🤲"];

export function getChildSuccessMessage(t?: (key: any) => string): string {
  const idx = Math.floor(Math.random() * SUCCESS_KEYS.length);
  if (t) {
    const translated = t(SUCCESS_KEYS[idx]);
    if (translated && translated !== SUCCESS_KEYS[idx]) return `${translated} ${EMOJIS_SUCCESS[idx]}`;
  }
  return CHILD_SUCCESS_MESSAGES[idx];
}

export function getChildEncourageMessage(t?: (key: any) => string): string {
  const idx = Math.floor(Math.random() * ENCOURAGE_KEYS.length);
  if (t) {
    const translated = t(ENCOURAGE_KEYS[idx]);
    if (translated && translated !== ENCOURAGE_KEYS[idx]) return `${translated} ${EMOJIS_ENCOURAGE[idx]}`;
  }
  return CHILD_ENCOURAGE_MESSAGES[idx];
}
