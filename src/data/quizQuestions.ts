export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export const quizQuestions: QuizQuestion[] = [
  {
    question: "Combien de sourates contient le Saint Coran ?",
    options: ["100", "114", "120", "99"],
    correctIndex: 1,
  },
  {
    question: "Quel est le nom de la première sourate du Coran ?",
    options: ["Al-Baqara", "Al-Ikhlas", "Al-Fatiha", "An-Nas"],
    correctIndex: 2,
  },
  {
    question: "La sourate Al-Ikhlas parle principalement de...",
    options: ["La prière", "L'unicité d'Allah", "Le jeûne", "L'aumône"],
    correctIndex: 1,
  },
  {
    question: "Quelle sourate est aussi appelée \"L'Ouverture\" ?",
    options: ["An-Nasr", "Al-Fatiha", "Al-Falaq", "Al-Kawthar"],
    correctIndex: 1,
  },
  {
    question: "Combien de versets contient la sourate Al-Fatiha ?",
    options: ["5", "6", "7", "8"],
    correctIndex: 2,
  },
];
