import prayerQiyam from "@/assets/prayer-qiyam.jpg";
import prayerRuku from "@/assets/prayer-ruku.jpg";
import prayerSujud from "@/assets/prayer-sujud.jpg";
import prayerJuloos from "@/assets/prayer-juloos.jpg";
import wuduHands from "@/assets/wudu-hands.jpg";
import wuduFace from "@/assets/wudu-face.jpg";
import wuduArms from "@/assets/wudu-arms.jpg";
import wuduHead from "@/assets/wudu-head.jpg";
import wuduFeet from "@/assets/wudu-feet.jpg";

export type PrayerStep = {
  id: string;
  titleKey: string;
  descKey: string;
  image: string;
  emoji: string;
};

export const PRAYER_STEPS: PrayerStep[] = [
  { id: "intention", titleKey: "kidsPrayer.step.intention.title", descKey: "kidsPrayer.step.intention.desc", image: prayerQiyam, emoji: "🤲" },
  { id: "takbir", titleKey: "kidsPrayer.step.takbir.title", descKey: "kidsPrayer.step.takbir.desc", image: prayerQiyam, emoji: "🙌" },
  { id: "qiyam", titleKey: "kidsPrayer.step.qiyam.title", descKey: "kidsPrayer.step.qiyam.desc", image: prayerQiyam, emoji: "🧍" },
  { id: "ruku", titleKey: "kidsPrayer.step.ruku.title", descKey: "kidsPrayer.step.ruku.desc", image: prayerRuku, emoji: "🙇" },
  { id: "sujud", titleKey: "kidsPrayer.step.sujud.title", descKey: "kidsPrayer.step.sujud.desc", image: prayerSujud, emoji: "🤲" },
  { id: "juloos", titleKey: "kidsPrayer.step.juloos.title", descKey: "kidsPrayer.step.juloos.desc", image: prayerJuloos, emoji: "🪑" },
  { id: "tashahhud", titleKey: "kidsPrayer.step.tashahhud.title", descKey: "kidsPrayer.step.tashahhud.desc", image: prayerJuloos, emoji: "☝️" },
  { id: "salam", titleKey: "kidsPrayer.step.salam.title", descKey: "kidsPrayer.step.salam.desc", image: prayerQiyam, emoji: "👋" },
];

export type WuduStep = {
  id: string;
  titleKey: string;
  descKey: string;
  image: string;
  emoji: string;
};

export const WUDU_STEPS: WuduStep[] = [
  { id: "niyyah", titleKey: "wudu.step.niyyah.title", descKey: "wudu.step.niyyah.desc", image: wuduHands, emoji: "💚" },
  { id: "bismillah", titleKey: "wudu.step.bismillah.title", descKey: "wudu.step.bismillah.desc", image: wuduHands, emoji: "🤲" },
  { id: "hands", titleKey: "wudu.step.hands.title", descKey: "wudu.step.hands.desc", image: wuduHands, emoji: "🖐️" },
  { id: "mouth", titleKey: "wudu.step.mouth.title", descKey: "wudu.step.mouth.desc", image: wuduFace, emoji: "👄" },
  { id: "nose", titleKey: "wudu.step.nose.title", descKey: "wudu.step.nose.desc", image: wuduFace, emoji: "👃" },
  { id: "face", titleKey: "wudu.step.face.title", descKey: "wudu.step.face.desc", image: wuduFace, emoji: "😊" },
  { id: "arms", titleKey: "wudu.step.arms.title", descKey: "wudu.step.arms.desc", image: wuduArms, emoji: "💪" },
  { id: "head", titleKey: "wudu.step.head.title", descKey: "wudu.step.head.desc", image: wuduHead, emoji: "🧕" },
  { id: "ears", titleKey: "wudu.step.ears.title", descKey: "wudu.step.ears.desc", image: wuduHead, emoji: "👂" },
  { id: "feet", titleKey: "wudu.step.feet.title", descKey: "wudu.step.feet.desc", image: wuduFeet, emoji: "🦶" },
];

export type PrayerQuizQuestion = {
  id: string;
  questionKey: string;
  options: { labelKey: string; correct: boolean }[];
};

// ─── Question Banks (12 each, pick 5 random per session) ───

export const KIDS_PRAYER_QUESTION_BANK: PrayerQuizQuestion[] = [
  { id: "pq1", questionKey: "kidsPrayer.quiz.q1", options: [
    { labelKey: "kidsPrayer.quiz.q1.opt1", correct: true },
    { labelKey: "kidsPrayer.quiz.q1.opt2", correct: false },
    { labelKey: "kidsPrayer.quiz.q1.opt3", correct: false },
  ]},
  { id: "pq2", questionKey: "kidsPrayer.quiz.q2", options: [
    { labelKey: "kidsPrayer.quiz.q2.opt1", correct: false },
    { labelKey: "kidsPrayer.quiz.q2.opt2", correct: true },
    { labelKey: "kidsPrayer.quiz.q2.opt3", correct: false },
  ]},
  { id: "pq3", questionKey: "kidsPrayer.quiz.q3", options: [
    { labelKey: "kidsPrayer.quiz.q3.opt1", correct: false },
    { labelKey: "kidsPrayer.quiz.q3.opt2", correct: false },
    { labelKey: "kidsPrayer.quiz.q3.opt3", correct: true },
  ]},
  { id: "pq4", questionKey: "kidsPrayer.quiz.q4", options: [
    { labelKey: "kidsPrayer.quiz.q4.opt1", correct: true },
    { labelKey: "kidsPrayer.quiz.q4.opt2", correct: false },
    { labelKey: "kidsPrayer.quiz.q4.opt3", correct: false },
  ]},
  { id: "pq5", questionKey: "kidsPrayer.quiz.q5", options: [
    { labelKey: "kidsPrayer.quiz.q5.opt1", correct: true },
    { labelKey: "kidsPrayer.quiz.q5.opt2", correct: false },
    { labelKey: "kidsPrayer.quiz.q5.opt3", correct: false },
  ]},
  { id: "pq6", questionKey: "kidsPrayer.quiz.q6", options: [
    { labelKey: "kidsPrayer.quiz.q6.opt1", correct: false },
    { labelKey: "kidsPrayer.quiz.q6.opt2", correct: true },
    { labelKey: "kidsPrayer.quiz.q6.opt3", correct: false },
  ]},
  { id: "pq7", questionKey: "kidsPrayer.quiz.q7", options: [
    { labelKey: "kidsPrayer.quiz.q7.opt1", correct: false },
    { labelKey: "kidsPrayer.quiz.q7.opt2", correct: false },
    { labelKey: "kidsPrayer.quiz.q7.opt3", correct: true },
  ]},
  { id: "pq8", questionKey: "kidsPrayer.quiz.q8", options: [
    { labelKey: "kidsPrayer.quiz.q8.opt1", correct: true },
    { labelKey: "kidsPrayer.quiz.q8.opt2", correct: false },
    { labelKey: "kidsPrayer.quiz.q8.opt3", correct: false },
  ]},
  { id: "pq9", questionKey: "kidsPrayer.quiz.q9", options: [
    { labelKey: "kidsPrayer.quiz.q9.opt1", correct: false },
    { labelKey: "kidsPrayer.quiz.q9.opt2", correct: true },
    { labelKey: "kidsPrayer.quiz.q9.opt3", correct: false },
  ]},
  { id: "pq10", questionKey: "kidsPrayer.quiz.q10", options: [
    { labelKey: "kidsPrayer.quiz.q10.opt1", correct: false },
    { labelKey: "kidsPrayer.quiz.q10.opt2", correct: false },
    { labelKey: "kidsPrayer.quiz.q10.opt3", correct: true },
  ]},
  { id: "pq11", questionKey: "kidsPrayer.quiz.q11", options: [
    { labelKey: "kidsPrayer.quiz.q11.opt1", correct: true },
    { labelKey: "kidsPrayer.quiz.q11.opt2", correct: false },
    { labelKey: "kidsPrayer.quiz.q11.opt3", correct: false },
  ]},
  { id: "pq12", questionKey: "kidsPrayer.quiz.q12", options: [
    { labelKey: "kidsPrayer.quiz.q12.opt1", correct: false },
    { labelKey: "kidsPrayer.quiz.q12.opt2", correct: true },
    { labelKey: "kidsPrayer.quiz.q12.opt3", correct: false },
  ]},
];

export const KIDS_WUDU_QUESTION_BANK: PrayerQuizQuestion[] = [
  { id: "wq1", questionKey: "wudu.quiz.q1", options: [
    { labelKey: "wudu.quiz.q1.opt1", correct: true },
    { labelKey: "wudu.quiz.q1.opt2", correct: false },
    { labelKey: "wudu.quiz.q1.opt3", correct: false },
  ]},
  { id: "wq2", questionKey: "wudu.quiz.q2", options: [
    { labelKey: "wudu.quiz.q2.opt1", correct: false },
    { labelKey: "wudu.quiz.q2.opt2", correct: true },
    { labelKey: "wudu.quiz.q2.opt3", correct: false },
  ]},
  { id: "wq3", questionKey: "wudu.quiz.q3", options: [
    { labelKey: "wudu.quiz.q3.opt1", correct: false },
    { labelKey: "wudu.quiz.q3.opt2", correct: false },
    { labelKey: "wudu.quiz.q3.opt3", correct: true },
  ]},
  { id: "wq4", questionKey: "wudu.quiz.q4", options: [
    { labelKey: "wudu.quiz.q4.opt1", correct: true },
    { labelKey: "wudu.quiz.q4.opt2", correct: false },
    { labelKey: "wudu.quiz.q4.opt3", correct: false },
  ]},
  { id: "wq5", questionKey: "wudu.quiz.q5", options: [
    { labelKey: "wudu.quiz.q5.opt1", correct: true },
    { labelKey: "wudu.quiz.q5.opt2", correct: false },
    { labelKey: "wudu.quiz.q5.opt3", correct: false },
  ]},
  { id: "wq6", questionKey: "wudu.quiz.q6", options: [
    { labelKey: "wudu.quiz.q6.opt1", correct: false },
    { labelKey: "wudu.quiz.q6.opt2", correct: true },
    { labelKey: "wudu.quiz.q6.opt3", correct: false },
  ]},
  { id: "wq7", questionKey: "wudu.quiz.q7", options: [
    { labelKey: "wudu.quiz.q7.opt1", correct: false },
    { labelKey: "wudu.quiz.q7.opt2", correct: false },
    { labelKey: "wudu.quiz.q7.opt3", correct: true },
  ]},
  { id: "wq8", questionKey: "wudu.quiz.q8", options: [
    { labelKey: "wudu.quiz.q8.opt1", correct: true },
    { labelKey: "wudu.quiz.q8.opt2", correct: false },
    { labelKey: "wudu.quiz.q8.opt3", correct: false },
  ]},
  { id: "wq9", questionKey: "wudu.quiz.q9", options: [
    { labelKey: "wudu.quiz.q9.opt1", correct: false },
    { labelKey: "wudu.quiz.q9.opt2", correct: true },
    { labelKey: "wudu.quiz.q9.opt3", correct: false },
  ]},
  { id: "wq10", questionKey: "wudu.quiz.q10", options: [
    { labelKey: "wudu.quiz.q10.opt1", correct: false },
    { labelKey: "wudu.quiz.q10.opt2", correct: false },
    { labelKey: "wudu.quiz.q10.opt3", correct: true },
  ]},
  { id: "wq11", questionKey: "wudu.quiz.q11", options: [
    { labelKey: "wudu.quiz.q11.opt1", correct: true },
    { labelKey: "wudu.quiz.q11.opt2", correct: false },
    { labelKey: "wudu.quiz.q11.opt3", correct: false },
  ]},
  { id: "wq12", questionKey: "wudu.quiz.q12", options: [
    { labelKey: "wudu.quiz.q12.opt1", correct: false },
    { labelKey: "wudu.quiz.q12.opt2", correct: true },
    { labelKey: "wudu.quiz.q12.opt3", correct: false },
  ]},
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getRandomPrayerQuiz(count = 5): PrayerQuizQuestion[] {
  return shuffleArray(KIDS_PRAYER_QUESTION_BANK).slice(0, count);
}

export function getRandomWuduQuiz(count = 5): PrayerQuizQuestion[] {
  return shuffleArray(KIDS_WUDU_QUESTION_BANK).slice(0, count);
}
