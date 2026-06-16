/**
 * Registration form types mirrored from frontend RegistrationContext.
 */
type RegisterStudentNameRow = {
  name: string;
  surname: string;
};

export type RegistrationFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  token: string | null;
  role: string;
  teacherGrades: string;
  teacherTopics: string[];
  studentNames: RegisterStudentNameRow[] | string;
  studentGrade: string;
  studentProblemTopics: string[];
  englishLevel: string;
  hobbies: string[];
  education: string;
  workField: string;
  favoriteGenres: number[];
  hatedGenres: number[];
  learningGoal: string;
  timeToAchieve: string;
};

export const defaultRegistrationFormData: RegistrationFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  dateOfBirth: "",
  token: null,
  role: "choose",
  teacherGrades: "choose",
  teacherTopics: [],
  studentNames: "",
  studentGrade: "choose",
  studentProblemTopics: [],
  englishLevel: "choose",
  hobbies: [],
  education: "",
  workField: "",
  favoriteGenres: [],
  hatedGenres: [],
  learningGoal: "",
  timeToAchieve: "",
};
