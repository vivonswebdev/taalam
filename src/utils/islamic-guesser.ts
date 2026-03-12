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
];

export class IslamicGuesser {
  private remaining: IslamicPersonality[];
  private askedQuestions: Set<string> = new Set();

  constructor() {
    this.remaining = [...ISLAMIC_PERSONALITIES];
  }

  getNextQuestion(): Question | null {
    const available = QUESTIONS.filter(q => !this.askedQuestions.has(q.id));
    if (available.length === 0 || this.remaining.length <= 1) return null;

    let bestQuestion: Question = available[0];
    let bestScore = -1;

    for (const question of available) {
      const yesCount = this.remaining.filter(p => p.attributes[question.attribute]).length;
      const noCount = this.remaining.length - yesCount;
      const total = this.remaining.length;
      const balance = Math.min(yesCount, noCount) / Math.max(total, 1);
      if (balance > bestScore) {
        bestScore = balance;
        bestQuestion = question;
      }
    }

    this.askedQuestions.add(bestQuestion.id);
    return bestQuestion;
  }

  applyAnswer(question: Question, answer: Answer): void {
    if (answer === 'yes') {
      this.remaining = this.remaining.filter(p => p.attributes[question.attribute]);
    } else if (answer === 'no') {
      this.remaining = this.remaining.filter(p => !p.attributes[question.attribute]);
    }
  }

  canGuess(): boolean {
    return this.remaining.length === 1 ||
      (this.remaining.length <= 3 && this.askedQuestions.size >= 5);
  }

  getBestGuess(): IslamicPersonality | null {
    return this.remaining.length > 0 ? this.remaining[0] : null;
  }

  getRemainingCount(): number {
    return this.remaining.length;
  }

  getProgress(): number {
    return Math.min((this.askedQuestions.size / QUESTIONS.length) * 100, 100);
  }
}
