/** Centralised child-mode feedback messages */
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

export function getChildSuccessMessage(): string {
  return CHILD_SUCCESS_MESSAGES[Math.floor(Math.random() * CHILD_SUCCESS_MESSAGES.length)];
}

export function getChildEncourageMessage(): string {
  return CHILD_ENCOURAGE_MESSAGES[Math.floor(Math.random() * CHILD_ENCOURAGE_MESSAGES.length)];
}
