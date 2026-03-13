import { IslamicPersonality, ISLAMIC_PERSONALITIES } from '@/data/islamic-personalities';

export type Answer = 'yes' | 'no' | 'maybe' | 'dontknow';

export interface Question {
  id: string;
  text: string;
  attribute: keyof IslamicPersonality['attributes'];
}

export const QUESTIONS: Question[] = [
  { id: 'q1', text: 'Est-ce un prophète ?', attribute: 'isProphet' },
  { id: 'q2', text: 'Est-ce une femme ?', attribute: 'isWoman' },
  { id: 'q3', text: 'Est-ce un calife ?', attribute: 'isCaliph' },
  { id: 'q4', text: 'A-t-il vécu avec le Prophète Muhammad ﷺ ?', attribute: 'livedWithProphet' },
  { id: 'q5', text: 'Est-ce un grand savant (imam) ?', attribute: 'isImam' },
  { id: 'q6', text: 'Est-il mort en martyr ?', attribute: 'isMartyr' },
  { id: 'q7', text: "Est-ce qu'il vient de La Mecque ?", attribute: 'isFromMecca' },
  { id: 'q8', text: 'Est-il connu pour sa bravoure au combat ?', attribute: 'knownForBravery' },
  { id: 'q9', text: 'A-t-il participé à la bataille de Badr ?', attribute: 'participatedInBadr' },
  { id: 'q10', text: 'Est-il de la famille du Prophète ﷺ ?', attribute: 'relatedToProphet' },
  { id: 'q11', text: 'A-t-il écrit un livre célèbre ?', attribute: 'writtenBook' },
  { id: 'q12', text: 'Est-il connu pour sa générosité ?', attribute: 'knownForGenerosity' },
  { id: 'q13', text: 'Est-il arabe ?', attribute: 'isArabic' },
  { id: 'q14', text: "A-t-il vécu après l'an 800 après J.C. ?", attribute: 'livedAfter800AD' },
  { id: 'q15', text: 'Est-il connu pour ses connaissances scientifiques ?', attribute: 'knownForScience' },
  { id: 'q16', text: 'Est-il parmi les premiers musulmans ?', attribute: 'firstMuslim' },
  { id: 'q17', text: 'A-t-il mémorisé le Coran (Hafiz) ?', attribute: 'knownForHafiz' },
  { id: 'q18', text: 'A-t-il épousé le Prophète ﷺ ?', attribute: 'marriedToProphet' },
  { id: 'q19', text: "A-t-il participé à la bataille d'Uhud ?", attribute: 'participatedInUhud' },
  { id: 'q20', text: 'A-t-il construit une mosquée ?', attribute: 'builtMosque' },
  { id: 'q21', text: 'Est-il connu pour sa sagesse et philosophie ?', attribute: 'knownForWisdom' },
  { id: 'q22', text: 'A-t-il migré à Médine (Hégire) ?', attribute: 'migratedToMedina' },
  { id: 'q23', text: "A-t-il vécu avant l'Islam ?", attribute: 'livedBeforeIslam' },
  { id: 'q24', text: 'Est-ce un compagnon (Sahabi) ?', attribute: 'isSahabi' },
  { id: 'q25', text: 'Est-ce un savant ou érudit ?', attribute: 'isScholar' },
  { id: 'q26', text: 'Est-il connu pour le jihad ?', attribute: 'knownForJihad' },
  { id: 'q27', text: 'Est-il connu pour la poésie ?', attribute: 'knownForPoetry' },
  { id: 'q28', text: 'Vient-il de Médine ?', attribute: 'isFromMedina' },
  { id: 'q29', text: "A-t-il vécu après l'an 600 après J.C. ?", attribute: 'livedAfter600AD' },
];

/**
 * Bayesian Kashif Engine — picks the question that maximises expected
 * information gain (entropy reduction) over the current probability
 * distribution, then updates probabilities with soft likelihoods so
 * "maybe" / "don't know" answers degrade gracefully.
 */
export class IslamicGuesser {
  /** Log-probabilities for each personality (unnormalised). */
  private logProbs: Float64Array;
  private askedQuestions: Set<string> = new Set();

  // Likelihood parameters (log-space)
  private static readonly L_YES_MATCH  = Math.log(0.95);
  private static readonly L_YES_MISS   = Math.log(0.05);
  private static readonly L_NO_MATCH   = Math.log(0.05);
  private static readonly L_NO_MISS    = Math.log(0.95);
  private static readonly L_MAYBE_MATCH = Math.log(0.65);
  private static readonly L_MAYBE_MISS  = Math.log(0.35);
  // "don't know" → uniform, no update

  constructor() {
    this.logProbs = new Float64Array(ISLAMIC_PERSONALITIES.length);
    // uniform prior
  }

  /* ── helpers ─────────────────────────────────────────────── */

  private normalise(): number[] {
    const max = this.logProbs.reduce((a, b) => Math.max(a, b), -Infinity);
    const exps = Array.from(this.logProbs, v => Math.exp(v - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  }

  /* ── question selection (max info gain) ──────────────────── */

  getNextQuestion(): Question | null {
    const available = QUESTIONS.filter(q => !this.askedQuestions.has(q.id));
    if (available.length === 0) return null;

    const probs = this.normalise();

    let bestQuestion: Question = available[0];
    let bestGain = -Infinity;

    const currentEntropy = this.entropy(probs);

    for (const question of available) {
      // Compute P(yes) = Σ p_i · attr_i  ;  P(no) = 1 - P(yes)
      let pYes = 0;
      for (let i = 0; i < probs.length; i++) {
        if (ISLAMIC_PERSONALITIES[i].attributes[question.attribute]) {
          pYes += probs[i];
        }
      }
      const pNo = 1 - pYes;

      // Expected posterior entropy for "yes"
      const posteriorYes = probs.map((p, i) => {
        const has = ISLAMIC_PERSONALITIES[i].attributes[question.attribute];
        return p * (has ? 0.95 : 0.05);
      });
      const sumYes = posteriorYes.reduce((a, b) => a + b, 0);
      const normYes = sumYes > 0 ? posteriorYes.map(p => p / sumYes) : posteriorYes;
      const hYes = this.entropy(normYes);

      // Expected posterior entropy for "no"
      const posteriorNo = probs.map((p, i) => {
        const has = ISLAMIC_PERSONALITIES[i].attributes[question.attribute];
        return p * (has ? 0.05 : 0.95);
      });
      const sumNo = posteriorNo.reduce((a, b) => a + b, 0);
      const normNo = sumNo > 0 ? posteriorNo.map(p => p / sumNo) : posteriorNo;
      const hNo = this.entropy(normNo);

      const expectedGain = currentEntropy - (pYes * hYes + pNo * hNo);

      if (expectedGain > bestGain) {
        bestGain = expectedGain;
        bestQuestion = question;
      }
    }

    this.askedQuestions.add(bestQuestion.id);
    return bestQuestion;
  }

  private entropy(probs: number[]): number {
    let h = 0;
    for (const p of probs) {
      if (p > 1e-12) h -= p * Math.log2(p);
    }
    return h;
  }

  /* ── update ──────────────────────────────────────────────── */

  applyAnswer(question: Question, answer: Answer): void {
    if (answer === 'dontknow') return; // no update

    for (let i = 0; i < ISLAMIC_PERSONALITIES.length; i++) {
      const has = ISLAMIC_PERSONALITIES[i].attributes[question.attribute];
      switch (answer) {
        case 'yes':
          this.logProbs[i] += has ? IslamicGuesser.L_YES_MATCH : IslamicGuesser.L_YES_MISS;
          break;
        case 'no':
          this.logProbs[i] += has ? IslamicGuesser.L_NO_MATCH : IslamicGuesser.L_NO_MISS;
          break;
        case 'maybe':
          this.logProbs[i] += has ? IslamicGuesser.L_MAYBE_MATCH : IslamicGuesser.L_MAYBE_MISS;
          break;
      }
    }
  }

  /* ── guess logic ─────────────────────────────────────────── */

  canGuess(): boolean {
    const probs = this.normalise();
    const sorted = [...probs].sort((a, b) => b - a);
    // Guess if top candidate has ≥ 60% probability or big lead
    if (sorted[0] >= 0.6) return true;
    if (sorted.length >= 2 && sorted[0] > sorted[1] * 3 && this.askedQuestions.size >= 4) return true;
    return false;
  }

  getBestGuess(): IslamicPersonality | null {
    const probs = this.normalise();
    let bestIdx = 0;
    for (let i = 1; i < probs.length; i++) {
      if (probs[i] > probs[bestIdx]) bestIdx = i;
    }
    return ISLAMIC_PERSONALITIES[bestIdx];
  }

  getTopGuesses(n = 3): { personality: IslamicPersonality; probability: number }[] {
    const probs = this.normalise();
    return probs
      .map((p, i) => ({ personality: ISLAMIC_PERSONALITIES[i], probability: p }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, n);
  }

  getConfidence(): number {
    const probs = this.normalise();
    return Math.max(...probs) * 100;
  }

  getRemainingCount(): number {
    const probs = this.normalise();
    // Count candidates with > 1% probability
    return probs.filter(p => p > 0.01).length;
  }

  getProgress(): number {
    return Math.min((this.askedQuestions.size / QUESTIONS.length) * 100, 100);
  }

  getAskedCount(): number {
    return this.askedQuestions.size;
  }
}
