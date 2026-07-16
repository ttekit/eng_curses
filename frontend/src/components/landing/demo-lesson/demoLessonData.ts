import type {
  VocabularyItem,
  QuizQuestion,
} from "../../content-watch/defaultLessonSides";

export interface DemoLessonData {
  videoLink: string;
  videoName: string;
  videoDescription: string;
  subtitlesFileLink: string;
  vocabulary: VocabularyItem[];
  quizQuestions: QuizQuestion[];
  maxPlaybackSec?: number;
}

const HARRY_POTTER_VIDEO =
  "https://kpi-eng-course.s3.amazonaws.com/m3u8_videos/HarryPotter_f4c24494-8416-41ce-ad6b-e2961576f5fe/index.m3u8";
const HARRY_POTTER_VTT =
  "https://kpi-eng-course.s3.amazonaws.com/uploads/captions/c8e3111e-020c-4f86-8f63-655751d5f10f.vtt";

const sharedVocabulary: VocabularyItem[] = [
  {
    word: "Compartment",
    meaning: "A separate section inside a train carriage where passengers sit.",
  },
  {
    word: "Overwhelmed",
    meaning:
      "Feeling like there's too much happening at once to handle it calmly.",
  },
  {
    word: "Journey",
    meaning:
      "A trip from one place to another, often a long or meaningful one.",
  },
];

const sharedQuizQuestions: QuizQuestion[] = [
  {
    id: "demo_q1",
    timestamp: "0:30",
    question: "Which sentence uses the present perfect correctly?",
    options: [
      "We finish the report yesterday.",
      "We have finished the report.",
      "We finishing the report.",
      "We will finished the report.",
    ],
    correct: 1,
    category: "grammar",
    explanation:
      "“Have finished” is present perfect — a past action with present relevance.",
  },
  {
    id: "demo_q2",
    timestamp: "1:00",
    question: "What does “overwhelmed” mean in this lesson's context?",
    options: [
      "Feeling calm and in control",
      "Feeling like there's too much to handle at once",
      "Feeling bored",
      "Feeling hungry",
    ],
    correct: 1,
    category: "vocabulary",
    explanation: "Overwhelmed describes being flooded by too much at once.",
  },
];

export const demoLessons: Record<"quickTry" | "wholeLesson", DemoLessonData> = {
  quickTry: {
    videoLink: HARRY_POTTER_VIDEO,
    videoName: "The Philosopher's Stone (Ep.1) — Quick Try",
    videoDescription:
      "A short taste of the lesson. Watch the first couple of minutes and try a mini quiz.",
    subtitlesFileLink: HARRY_POTTER_VTT,
    vocabulary: sharedVocabulary,
    quizQuestions: sharedQuizQuestions,
    maxPlaybackSec: 120,
  },
  wholeLesson: {
    videoLink: HARRY_POTTER_VIDEO,
    videoName: "The Philosopher's Stone (Ep.1)",
    videoDescription:
      "Start your language journey with a magical classic. Through clear dialogues and a heartwarming story, you will learn how to describe people and places, express basic emotions, and easily catch natural British accents without feeling overwhelmed.",
    subtitlesFileLink: HARRY_POTTER_VTT,
    vocabulary: sharedVocabulary,
    quizQuestions: sharedQuizQuestions,
    maxPlaybackSec: undefined,
  },
};
