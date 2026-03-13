import { IslamicPersonality, ISLAMIC_PERSONALITIES } from '@/data/islamic-personalities';

export type Answer = 'yes' | 'no' | 'maybe' | 'dontknow';

export interface Question {
  id: string;
  text: string;
  attribute: keyof IslamicPersonality['attributes'];
  weight: number;
}

export const ALL_QUESTIONS: Question[] = [
  { id: 'q_prophet',    weight:10, attribute:'isProphet',
    text:"Est-ce un prophète ou un messager d'Allah ?" },
  { id: 'q_woman',      weight:10, attribute:'isWoman',
    text:"Est-ce une femme ?" },
  { id: 'q_scholar',    weight:9,  attribute:'isScholar',
    text:"Est-ce un grand savant islamique (faqih, muhaddith...) ?" },
  { id: 'q_sahabi',     weight:9,  attribute:'isSahabi',
    text:"Est-ce un compagnon direct du Prophète ﷺ ?" },
  { id: 'q_after800',   weight:9,  attribute:'livedAfter800AD',
    text:"A-t-il vécu après l'an 800 après J.-C. ?" },
  { id: 'q_caliph',     weight:8,  attribute:'isCaliph',
    text:"Est-ce un calife (chef de l'état islamique) ?" },
  { id: 'q_arabic',     weight:8,  attribute:'isArabic',
    text:"Est-il d'origine arabe ?" },
  { id: 'q_martyr',     weight:8,  attribute:'isMartyr',
    text:"Est-il mort en martyr (shahid) ?" },
  { id: 'q_withprophet',weight:8,  attribute:'livedWithProphet',
    text:"A-t-il rencontré et vécu avec le Prophète Muhammad ﷺ ?" },
  { id: 'q_mecca',      weight:7,  attribute:'isFromMecca',
    text:"Est-il originaire de La Mecque ?" },
  { id: 'q_imam',       weight:7,  attribute:'isImam',
    text:"Est-il considéré comme un grand Imam (chef spirituel) ?" },
  { id: 'q_bravery',    weight:7,  attribute:'knownForBravery',
    text:"Est-il connu principalement pour sa bravoure au combat ?" },
  { id: 'q_family',     weight:7,  attribute:'relatedToProphet',
    text:"Fait-il partie de la famille du Prophète ﷺ (Ahl al-Bayt ou proches) ?" },
  { id: 'q_generosity', weight:6,  attribute:'knownForGenerosity',
    text:"Est-il particulièrement connu pour sa générosité ?" },
  { id: 'q_wisdom',     weight:6,  attribute:'knownForWisdom',
    text:"Est-il connu pour sa grande sagesse et philosophie ?" },
  { id: 'q_hafiz',      weight:6,  attribute:'knownForHafiz',
    text:"A-t-il mémorisé le Coran en entier (Hafiz) ?" },
  { id: 'q_book',       weight:6,  attribute:'writtenBook',
    text:"A-t-il écrit un ou plusieurs livres célèbres ?" },
  { id: 'q_science',    weight:6,  attribute:'knownForScience',
    text:"Est-il connu pour ses apports scientifiques (médecine, maths...) ?" },
  { id: 'q_medina',     weight:5,  attribute:'isFromMedina',
    text:"Est-il originaire de Médine ?" },
  { id: 'q_first',      weight:6,  attribute:'firstMuslim',
    text:"Fait-il partie des tout premiers musulmans ?" },
  { id: 'q_badr',       weight:5,  attribute:'participatedInBadr',
    text:"A-t-il participé à la bataille de Badr ?" },
  { id: 'q_uhud',       weight:5,  attribute:'participatedInUhud',
    text:"A-t-il participé à la bataille d'Uhud ?" },
  { id: 'q_hijra',      weight:5,  attribute:'migratedToMedina',
    text:"A-t-il fait l'Hégire (migration vers Médine) ?" },
  { id: 'q_married',    weight:5,  attribute:'marriedToProphet',
    text:"A-t-il épousé le Prophète ﷺ ?" },
  { id: 'q_mosque',     weight:4,  attribute:'builtMosque',
    text:"A-t-il construit ou fondé une mosquée célèbre ?" },
  { id: 'q_jihad',      weight:5,  attribute:'knownForJihad',
    text:"Est-il surtout connu pour son rôle dans le jihad / guerres islamiques ?" },
  { id: 'q_before',     weight:4,  attribute:'livedBeforeIslam',
    text:"A-t-il vécu une grande partie de sa vie avant l'Islam ?" },
  { id: 'q_poetry',     weight:3,  attribute:'knownForPoetry',
    text:"Est-il connu pour sa poésie ou son éloquence ?" },
];

export class IslamicGuesser {
  private scores: Map<string, number>;
  private askedIds: Set<string> = new Set();
  private allPersonalities: IslamicPersonality[];

  constructor() {
    this.allPersonalities = [...ISLAMIC_PERSONALITIES];
    this.scores = new Map(
      this.allPersonalities.map(p => [p.id, 1 / this.allPersonalities.length])
    );
  }

  private computeEntropy(question: Question): number {
    let pYes = 0, pNo = 0;
    for (const p of this.allPersonalities) {
      const score = this.scores.get(p.id) ?? 0;
      if (score === 0) continue;
      if (p.attributes[question.attribute] === true) pYes += score;
      else pNo += score;
    }
    const entropy = (p: number) => p > 0 ? -p * Math.log2(p) : 0;
    return entropy(pYes) + entropy(pNo);
  }

  private getTotalWeight(): number {
    return this.allPersonalities.reduce(
      (sum, p) => sum + (this.scores.get(p.id) ?? 0), 0
    );
  }

  getNextQuestion(): Question | null {
    const available = ALL_QUESTIONS.filter(q => !this.askedIds.has(q.id));
    if (available.length === 0) return null;

    const ranked = available
      .map(q => ({ question: q, score: this.computeEntropy(q) * (q.weight / 10) }))
      .sort((a, b) => b.score - a.score);

    const best = ranked[0].question;
    this.askedIds.add(best.id);
    return best;
  }

  applyAnswer(question: Question, answer: Answer): void {
    const CONFIDENCE = {
      yes:      { match: 3.0,  noMatch: 0.1  },
      no:       { match: 0.1,  noMatch: 3.0  },
      maybe:    { match: 1.8,  noMatch: 0.7  },
      dontknow: { match: 1.0,  noMatch: 1.0  },
    };
    const factors = CONFIDENCE[answer];

    for (const p of this.allPersonalities) {
      const current = this.scores.get(p.id) ?? 0;
      const hasAttr = p.attributes[question.attribute] === true;
      const multiplier = answer === 'dontknow' ? 1.0
        : hasAttr ? factors.match : factors.noMatch;
      this.scores.set(p.id, current * multiplier);
    }
    this.normalize();
  }

  private normalize(): void {
    const total = this.getTotalWeight();
    if (total === 0) return;
    for (const [id, score] of this.scores) {
      this.scores.set(id, score / total);
    }
  }

  canGuess(): boolean {
    const top = this.getTopCandidates(1);
    if (top.length === 0) return false;
    const topScore = top[0].score;
    return topScore >= 0.70 ||
      (this.askedIds.size >= 12 && topScore >= 0.50) ||
      this.askedIds.size >= 18;
  }

  getTopCandidates(n: number): { personality: IslamicPersonality; score: number }[] {
    return this.allPersonalities
      .map(p => ({ personality: p, score: this.scores.get(p.id) ?? 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, n);
  }

  getBestGuess(): IslamicPersonality | null {
    const top = this.getTopCandidates(1);
    return top.length > 0 ? top[0].personality : null;
  }

  getConfidence(): number {
    const top = this.getTopCandidates(1);
    if (top.length === 0) return 0;
    return Math.round(top[0].score * 100);
  }

  getRemainingCount(): number {
    return this.allPersonalities.filter(
      p => (this.scores.get(p.id) ?? 0) > 0.02
    ).length;
  }

  getEliminatedCount(): number {
    return this.allPersonalities.filter(
      p => (this.scores.get(p.id) ?? 0) < 0.005
    ).length;
  }

  getAskedCount(): number {
    return this.askedIds.size;
  }
}
