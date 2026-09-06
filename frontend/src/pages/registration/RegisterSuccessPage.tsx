import { useLocation, useNavigate } from "react-router";
import Button from "../../components/Button";
import { downloadStudentAccountsExcel } from "../../lib/studentAccountsExcel";
import type { GeneratedStudentAccount } from "../../lib/registerUser";
import { AuthPageSeo } from "../../lib/authPageSeo";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { useEffect } from "react";
import { captureEvent } from "../../lib/analytics";
import { AuthSplitLayout } from "../../components/AuthSplitLayout";
import { useUser } from "../../context/UserContext";

type SuccessLocationState = {
  generatedStudents?: GeneratedStudentAccount[];
};

export default function RegisterSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { messages } = useLandingLocale();
  const { user } = useUser();
  const regSeo = messages.auth.registration.step1;
  const success = messages.auth.registration.success;
  const state = location.state as SuccessLocationState | null;
  const students = state?.generatedStudents ?? [];
  const hasStudents = students.length > 0;

  const isTeacher = user?.role?.toLowerCase() === "teacher";
  const currentStep = isTeacher ? 2 : 3;

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

      <AuthSplitLayout
        progressStep={currentStep}
        progressTotal={currentStep}
        rightTitle={success.mascotTitle}
        rightSubtitle={success.mascotSubtitleTeacher}
        rightImage="/ResultHappy.svg"
      >
        <div className="flex h-full w-full flex-col justify-center">
          <div className="bg-card text-card-foreground mx-auto w-full max-w-md rounded-3xl p-8 sm:p-10 shadow-2xl border border-border/10">
            <div
              className="bg-primary/20 text-primary mb-6 inline-flex size-14 items-center justify-center rounded-full text-2xl font-bold"
              aria-hidden
            >
              ✓
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              {success.title}
            </h1>

            <p className="text-muted-foreground mt-3 text-sm sm:text-base leading-relaxed">
              {hasStudents ? success.withStudents : success.solo}
            </p>

            <div className="mt-8 flex flex-col gap-4">
              {hasStudents && (
                <Button
                  type="button"
                  className="w-full bg-secondary text-foreground shadow-none hover:bg-secondary/80 py-4 text-sm font-semibold"
                  onClick={() =>
                    void downloadStudentAccountsExcel(
                      students,
                      "student-accounts",
                    )
                  }
                >
                  {success.downloadExcel}
                </Button>
              )}

              <Button
                type="button"
                className="w-full py-4 text-sm font-semibold"
                onClick={() => navigate("/catalog")}
              >
                {success.continueToSite}
              </Button>
            </div>
          </div>
        </div>
      </AuthSplitLayout>
    </>
  );
}
