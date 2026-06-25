import { useLocation, useNavigate } from "react-router";
import Button from "../../components/Button";
import { downloadStudentAccountsExcel } from "../../lib/studentAccountsExcel";
import type { GeneratedStudentAccount } from "../../lib/registerUser";
import { AuthPageSeo } from "../../lib/authPageSeo";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { useEffect } from "react";
import { captureEvent } from "../../lib/analytics";

type SuccessLocationState = {
  generatedStudents?: GeneratedStudentAccount[];
};

export default function RegisterSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { messages } = useLandingLocale();
  const regSeo = messages.auth.registration.step1;
  const success = messages.auth.registration.success;
  const state = location.state as SuccessLocationState | null;
  const students = state?.generatedStudents ?? [];
  const hasStudents = students.length > 0;
  useEffect(() => {
    captureEvent("registration_completed", {
      students_count: students.length,
      has_students: hasStudents,
    });
  }, [students.length, hasStudents]);

  return (
    <>
      <AuthPageSeo
        title={regSeo.seoTitle}
        description={regSeo.seoDescription}
        path="/register-success"
      />
      <div className="bg-background font-display flex min-h-screen flex-col gap-12 p-8 text-foreground lg:flex-row lg:items-center lg:justify-center lg:gap-16">
        <div className="mx-auto hidden w-full max-w-sm flex-col items-center text-center lg:flex">
          <img
            src="/ResultHappy.svg"
            className="w-50 h-50 animate-float mb-3"
            alt="Success"
          />
          <h2 className="font-display text-2xl font-bold">
            {success.mascotTitle}
          </h2>
          <p className="mt-3 text-muted-foreground">{success.mascotSubtitle}</p>
        </div>

        <div className="bg-card text-card-foreground mx-auto w-full max-w-lg rounded-3xl p-8 shadow-2xl">
          <div
            className="bg-primary/20 text-primary mb-4 inline-flex size-14 items-center justify-center rounded-full text-2xl font-bold"
            aria-hidden
          >
            ✓
          </div>
          <h1 className="font-display text-2xl font-bold">{success.title}</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            {hasStudents ? success.withStudents : success.solo}
          </p>

          <Button
            type="button"
            className="!mt-6 w-full"
            onClick={() =>
              void downloadStudentAccountsExcel(students, "student-accounts")
            }
          >
            {success.downloadExcel}
          </Button>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              type="button"
              className="flex w-full items-center justify-center rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              {success.goSignIn}
            </Button>
            <a
              href="/catalog"
              className="mt-2 block w-full text-center text-sm font-semibold text-primary transition-colors hover:underline hover:text-primary/90"
            >
              {success.continueToSite}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
