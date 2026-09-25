/**
 * Features hidden until they are really implemented.
 * Both currently produce random scores (no speech analysis) — don't ship them as-is.
 */
export const FEATURES = {
  /** /tarteel/offline — no on-device model yet, results were simulated and saved to tarteel_scores */
  tarteelOffline: false,
  /** Family duels — "Participer" submitted a random 50–99 score */
  familyDuels: false,
} as const;
