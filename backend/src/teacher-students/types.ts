export type TeacherStudentQuizRow = {
  id: number;
  contentVideoId: number;
  videoName: string;
  correct: number;
  total: number;
  scorePct: number;
  passed: boolean;
  createdAt: string;
  answers?: any;
  summaryText?: string | null;
};

export type TeacherStudentResultRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  englishLevel: string | null;
  videosCompleted: number;
  quizAttempts: number;
  avgQuizScorePct: number | null;
  classId: number | null;
  className: string | null;
  lastPlacement: {
    scorePct: number;
    englishLevel: string;
    scoreCorrect: number;
    scoreTotal: number;
    createdAt: string;
  } | null;
  recentQuizzes: TeacherStudentQuizRow[];
};