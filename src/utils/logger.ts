/**
 * Logger conditionnel — remplace les 104 console.log en production
 * Usage : import { logger } from '@/utils/logger';
 *         logger.log('message');  // silencieux en prod
 *         logger.error('err');   // toujours visible
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /** Debug/info : silencieux en production */
  log: (...args: unknown[]): void => {
    if (isDev) console.log('[Taalam]', ...args);
  },

  /** Warnings : visibles en dev, silencieux en prod */
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn('[Taalam]', ...args);
  },

  /** Erreurs : toujours loggées (prod + dev) */
  error: (...args: unknown[]): void => {
    console.error('[Taalam]', ...args);
    // TODO Sprint 3 : envoyer à Sentry pour crash reporting
  },

  /** Performance/timing : dev uniquement */
  time: (label: string): void => {
    if (isDev) console.time(label);
  },
  timeEnd: (label: string): void => {
    if (isDev) console.timeEnd(label);
  },
};
