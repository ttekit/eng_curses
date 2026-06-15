import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultRegistrationFormData,
  type RegistrationFormData,
} from "../types/registration";
import {
  read_registration_draft,
  write_registration_draft,
} from "../lib/registration_storage";

type RegistrationContextValue = {
  formData: RegistrationFormData;
  update_form_data: (patch: Partial<RegistrationFormData>) => void;
  reset_form_data: () => void;
};

const RegistrationContext = createContext<RegistrationContextValue | undefined>(
  undefined,
);

function is_record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function merge_registration_draft(draft: unknown): RegistrationFormData {
  if (!is_record(draft)) {
    return { ...defaultRegistrationFormData };
  }
  return {
    ...defaultRegistrationFormData,
    name: typeof draft.name === "string" ? draft.name : "",
    email: typeof draft.email === "string" ? draft.email : "",
    password: typeof draft.password === "string" ? draft.password : "",
    confirmPassword:
      typeof draft.confirmPassword === "string" ? draft.confirmPassword : "",
    dateOfBirth: typeof draft.dateOfBirth === "string" ? draft.dateOfBirth : "",
    role: typeof draft.role === "string" ? draft.role : "choose",
    teacherGrades:
      typeof draft.teacherGrades === "string" ? draft.teacherGrades : "choose",
    teacherTopics: Array.isArray(draft.teacherTopics)
      ? draft.teacherTopics.filter((item): item is string => typeof item === "string")
      : [],
    studentNames: Array.isArray(draft.studentNames) ? draft.studentNames : "",
    studentGrade:
      typeof draft.studentGrade === "string" ? draft.studentGrade : "choose",
    englishLevel:
      typeof draft.englishLevel === "string" ? draft.englishLevel : "choose",
    hobbies: Array.isArray(draft.hobbies)
      ? draft.hobbies.filter((item): item is string => typeof item === "string")
      : [],
    favoriteGenres: Array.isArray(draft.favoriteGenres)
      ? draft.favoriteGenres.filter((item): item is number => typeof item === "number")
      : [],
    hatedGenres: Array.isArray(draft.hatedGenres)
      ? draft.hatedGenres.filter((item): item is number => typeof item === "number")
      : [],
    learningGoal: typeof draft.learningGoal === "string" ? draft.learningGoal : "",
    timeToAchieve:
      typeof draft.timeToAchieve === "string" ? draft.timeToAchieve : "",
  };
}

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    ...defaultRegistrationFormData,
  });

  useEffect(() => {
    const load = async () => {
      const draft = await read_registration_draft();
      if (draft) {
        setFormData(merge_registration_draft(draft));
      }
    };
    void load();
  }, []);

  const update_form_data = useCallback((patch: Partial<RegistrationFormData>) => {
    setFormData((current) => {
      const next = { ...current, ...patch };
      void write_registration_draft(next);
      return next;
    });
  }, []);

  const reset_form_data = useCallback(() => {
    const next = { ...defaultRegistrationFormData };
    setFormData(next);
    void write_registration_draft(next);
  }, []);

  const value = useMemo(
    () => ({ formData, update_form_data, reset_form_data }),
    [formData, update_form_data, reset_form_data],
  );

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration(): RegistrationContextValue {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error("useRegistration must be used within RegistrationProvider");
  }
  return context;
}
