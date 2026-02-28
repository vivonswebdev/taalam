import hajjIhram from "@/assets/hajj-ihram.jpg";
import hajjKaaba from "@/assets/hajj-kaaba.jpg";
import hajjSai from "@/assets/hajj-sai.jpg";
import hajjMina from "@/assets/hajj-mina.jpg";
import hajjArafat from "@/assets/hajj-arafat.jpg";

export type RitualStep = {
  id: string;
  type: "umra" | "hajj";
  titleKey: string;
  descKey: string;
  placeKey: string;
  order: number;
  emoji: string;
  image: string;
};

export const UMRA_STEPS: RitualStep[] = [
  { id: "umra-ihram", type: "umra", order: 1, emoji: "🕋", image: hajjIhram, titleKey: "kidsHajj.umra.ihram.title", descKey: "kidsHajj.umra.ihram.desc", placeKey: "kidsHajj.place.miqaat" },
  { id: "umra-tawaf", type: "umra", order: 2, emoji: "↺", image: hajjKaaba, titleKey: "kidsHajj.umra.tawaf.title", descKey: "kidsHajj.umra.tawaf.desc", placeKey: "kidsHajj.place.kaaba" },
  { id: "umra-sai", type: "umra", order: 3, emoji: "🏃", image: hajjSai, titleKey: "kidsHajj.umra.sai.title", descKey: "kidsHajj.umra.sai.desc", placeKey: "kidsHajj.place.safaMarwa" },
  { id: "umra-cut", type: "umra", order: 4, emoji: "💇", image: hajjIhram, titleKey: "kidsHajj.umra.cut.title", descKey: "kidsHajj.umra.cut.desc", placeKey: "kidsHajj.place.anywhere" },
];

export const HAJJ_STEPS: RitualStep[] = [
  { id: "hajj-ihram", type: "hajj", order: 1, emoji: "🕋", image: hajjIhram, titleKey: "kidsHajj.hajj.ihram.title", descKey: "kidsHajj.hajj.ihram.desc", placeKey: "kidsHajj.place.miqaat" },
  { id: "hajj-mina", type: "hajj", order: 2, emoji: "⛺", image: hajjMina, titleKey: "kidsHajj.hajj.mina.title", descKey: "kidsHajj.hajj.mina.desc", placeKey: "kidsHajj.place.mina" },
  { id: "hajj-arafat", type: "hajj", order: 3, emoji: "🌄", image: hajjArafat, titleKey: "kidsHajj.hajj.arafat.title", descKey: "kidsHajj.hajj.arafat.desc", placeKey: "kidsHajj.place.arafat" },
  { id: "hajj-muzdalifah", type: "hajj", order: 4, emoji: "⭐", image: hajjArafat, titleKey: "kidsHajj.hajj.muzdalifah.title", descKey: "kidsHajj.hajj.muzdalifah.desc", placeKey: "kidsHajj.place.muzdalifah" },
  { id: "hajj-jamarat", type: "hajj", order: 5, emoji: "🪨", image: hajjMina, titleKey: "kidsHajj.hajj.jamarat.title", descKey: "kidsHajj.hajj.jamarat.desc", placeKey: "kidsHajj.place.jamarat" },
  { id: "hajj-tawafIfada", type: "hajj", order: 6, emoji: "↺", image: hajjKaaba, titleKey: "kidsHajj.hajj.tawafIfada.title", descKey: "kidsHajj.hajj.tawafIfada.desc", placeKey: "kidsHajj.place.kaaba" },
  { id: "hajj-tawafWada", type: "hajj", order: 7, emoji: "👋", image: hajjKaaba, titleKey: "kidsHajj.hajj.tawafWada.title", descKey: "kidsHajj.hajj.tawafWada.desc", placeKey: "kidsHajj.place.kaaba" },
];

export type HajjQuizQuestion = {
  id: string;
  questionKey: string;
  options: { labelKey: string; correct: boolean }[];
};

export const KIDS_HAJJ_QUIZ: HajjQuizQuestion[] = [
  {
    id: "q1",
    questionKey: "kidsHajj.quiz.q1",
    options: [
      { labelKey: "kidsHajj.quiz.q1.opt1", correct: true },
      { labelKey: "kidsHajj.quiz.q1.opt2", correct: false },
      { labelKey: "kidsHajj.quiz.q1.opt3", correct: false },
    ],
  },
  {
    id: "q2",
    questionKey: "kidsHajj.quiz.q2",
    options: [
      { labelKey: "kidsHajj.quiz.q2.opt1", correct: false },
      { labelKey: "kidsHajj.quiz.q2.opt2", correct: true },
      { labelKey: "kidsHajj.quiz.q2.opt3", correct: false },
    ],
  },
  {
    id: "q3",
    questionKey: "kidsHajj.quiz.q3",
    options: [
      { labelKey: "kidsHajj.quiz.q3.opt1", correct: false },
      { labelKey: "kidsHajj.quiz.q3.opt2", correct: false },
      { labelKey: "kidsHajj.quiz.q3.opt3", correct: true },
    ],
  },
  {
    id: "q4",
    questionKey: "kidsHajj.quiz.q4",
    options: [
      { labelKey: "kidsHajj.quiz.q4.opt1", correct: true },
      { labelKey: "kidsHajj.quiz.q4.opt2", correct: false },
      { labelKey: "kidsHajj.quiz.q4.opt3", correct: false },
    ],
  },
];
