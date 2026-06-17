// src/types/teacher-students.ts

export type TeacherClass = {
  id: number;
  name: string;
  _count?: { students: number };
};

export type TeacherStudentResult = {
  id: number;
  name: string;
  email: string;
  role: string;
  classId: number | null;
  className: string | null;
  englishLevel: string | null;
  videosCompleted: number;
  quizAttempts: number;
  avgQuizScorePct: number | null;
  lastPlacement: {
    scorePct: number;
    englishLevel: string;
    scoreCorrect: number;
    scoreTotal: number;
    createdAt: string;
  } | null;
};
