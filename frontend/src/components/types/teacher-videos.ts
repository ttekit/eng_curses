// Тип для отдельного класса, которому назначено видео
export type TeacherVideoClassResult = {
  id: number;
  name: string;
};

export type TeacherVideoQuizAttempt = {
  passed: boolean;
  scorePct: number;
  correct?: number;
  total?: number;
  answers?: unknown;
};

// Тип для конкретного студента и его результатов по видео
export type TeacherVideoStudentResult = {
  id: number;
  name: string;
  email: string;
  classId: number | null;
  className: string | null;
  attempt?: TeacherVideoQuizAttempt | null;
};

// Тип общих результатов по конкретному видео
export type TeacherVideoResults = {
  contentName: string;
  classes: TeacherVideoClassResult[];
  students: TeacherVideoStudentResult[];
};

// Вспомогательный тип для строки ответа в квизе
export type QuizAnswerRow = Record<string, unknown>;

// Главный тип для видео (серии), загруженного учителем
export type TeacherSeriesItem = {
  contentId: number;
  name: string;
  friendlyLink: string;
  visibility: string;
  contentVideoId: number | null;
  captionsReady: boolean;
  systemTags: string[];
  userTags: string[];
  processingComplexity: string | null;
  availableFrom?: string | null;
  deadline?: string | null;
  classesAssigned?: string;
  classIds?: number[];
  classAccesses?: {
    classId: number;
    className: string;
    availableFrom: string | null;
    deadline: string | null;
  }[];
};
