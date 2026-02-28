import prayerQiyam from "@/assets/prayer-qiyam.jpg";
import prayerRuku from "@/assets/prayer-ruku.jpg";
import prayerSujud from "@/assets/prayer-sujud.jpg";
import prayerJuloos from "@/assets/prayer-juloos.jpg";

export type PrayerStep = {
  id: string;
  titleKey: string;
  descKey: string;
  image: string;
  emoji: string;
};

export const PRAYER_STEPS: PrayerStep[] = [
  {
    id: "intention",
    titleKey: "kidsPrayer.step.intention.title",
    descKey: "kidsPrayer.step.intention.desc",
    image: prayerQiyam,
    emoji: "🤲",
  },
  {
    id: "takbir",
    titleKey: "kidsPrayer.step.takbir.title",
    descKey: "kidsPrayer.step.takbir.desc",
    image: prayerQiyam,
    emoji: "🙌",
  },
  {
    id: "qiyam",
    titleKey: "kidsPrayer.step.qiyam.title",
    descKey: "kidsPrayer.step.qiyam.desc",
    image: prayerQiyam,
    emoji: "🧍",
  },
  {
    id: "ruku",
    titleKey: "kidsPrayer.step.ruku.title",
    descKey: "kidsPrayer.step.ruku.desc",
    image: prayerRuku,
    emoji: "🙇",
  },
  {
    id: "sujud",
    titleKey: "kidsPrayer.step.sujud.title",
    descKey: "kidsPrayer.step.sujud.desc",
    image: prayerSujud,
    emoji: "🤲",
  },
  {
    id: "juloos",
    titleKey: "kidsPrayer.step.juloos.title",
    descKey: "kidsPrayer.step.juloos.desc",
    image: prayerJuloos,
    emoji: "🪑",
  },
  {
    id: "tashahhud",
    titleKey: "kidsPrayer.step.tashahhud.title",
    descKey: "kidsPrayer.step.tashahhud.desc",
    image: prayerJuloos,
    emoji: "☝️",
  },
  {
    id: "salam",
    titleKey: "kidsPrayer.step.salam.title",
    descKey: "kidsPrayer.step.salam.desc",
    image: prayerQiyam,
    emoji: "👋",
  },
];

export type PrayerQuizQuestion = {
  id: string;
  questionKey: string;
  options: { labelKey: string; correct: boolean }[];
};

export const KIDS_PRAYER_QUIZ: PrayerQuizQuestion[] = [
  {
    id: "q1",
    questionKey: "kidsPrayer.quiz.q1",
    options: [
      { labelKey: "kidsPrayer.quiz.q1.opt1", correct: true },
      { labelKey: "kidsPrayer.quiz.q1.opt2", correct: false },
      { labelKey: "kidsPrayer.quiz.q1.opt3", correct: false },
    ],
  },
  {
    id: "q2",
    questionKey: "kidsPrayer.quiz.q2",
    options: [
      { labelKey: "kidsPrayer.quiz.q2.opt1", correct: false },
      { labelKey: "kidsPrayer.quiz.q2.opt2", correct: true },
      { labelKey: "kidsPrayer.quiz.q2.opt3", correct: false },
    ],
  },
  {
    id: "q3",
    questionKey: "kidsPrayer.quiz.q3",
    options: [
      { labelKey: "kidsPrayer.quiz.q3.opt1", correct: false },
      { labelKey: "kidsPrayer.quiz.q3.opt2", correct: false },
      { labelKey: "kidsPrayer.quiz.q3.opt3", correct: true },
    ],
  },
  {
    id: "q4",
    questionKey: "kidsPrayer.quiz.q4",
    options: [
      { labelKey: "kidsPrayer.quiz.q4.opt1", correct: true },
      { labelKey: "kidsPrayer.quiz.q4.opt2", correct: false },
      { labelKey: "kidsPrayer.quiz.q4.opt3", correct: false },
    ],
  },
];
