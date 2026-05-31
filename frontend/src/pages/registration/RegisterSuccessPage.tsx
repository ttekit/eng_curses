import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../components/Button";
import { downloadStudentAccountsExcel } from "../../lib/studentAccountsExcel";
import type { GeneratedStudentAccount } from "../../lib/registerUser";
import { AuthPageSeo } from "../../lib/authPageSeo";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { formatMessage } from "../../lib/formatMessage";

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

  const [showStudents, setShowStudents] = useState(false);

  return (
    <>
      <AuthPageSeo
        title={regSeo.seoTitle}
        description={regSeo.seoDescription}
        path="/registrationSuccess"
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

          {hasStudents && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowStudents(!showStudents)}
                className="flex w-full hover:cursor-pointer items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted/80 mb-3"
              >
                <div className="flex items-center gap-2">
                  {showStudents ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>
                    {formatMessage(success.studentAccounts, {
                      COUNT: String(students.length),
                    })}
                  </span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {showStudents ? success.hide : success.show}
                </span>
              </button>

              {showStudents && (
                <div className="border-border bg-muted/60 max-h-48 overflow-auto rounded-xl border text-sm animate-in fade-in slide-in-from-top-2">
                  <table className="w-full text-left">
                    <thead className="bg-muted sticky top-0 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium">
                          {success.colName}
                        </th>
                        <th className="px-3 py-2 font-medium">
                          {success.colEmail}
                        </th>
                        <th className="px-3 py-2 font-medium">
                          {success.colPassword}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr
                          key={s.email}
                          className="border-border border-t text-foreground"
                        >
                          <td className="px-3 py-2">{s.name}</td>
                          <td className="px-3 py-2 break-all">{s.email}</td>
                          <td className="px-3 py-2 font-mono text-xs">
                            {s.password}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <Button
                type="button"
                className="!mt-6 w-full"
                onClick={() =>
                  void downloadStudentAccountsExcel(
                    students,
                    "student-accounts",
                  )
                }
              >
                {success.downloadExcel}
              </Button>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-2">
            <Button
              type="button"
              className=" flex rounded-[15px] bg-primary px-6 py-4 text-sm font-semibold items-center justify-center text-foreground/70 hover:bg-purple-hover hover:text-white transition-all hover:cursor-pointer shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
              onClick={() => navigate("/loginForm")}
            >
              {success.goSignIn}
            </Button>
            <Link
              to="/catalog"
              className="hover:text-primary/90 mt-2 w-full text-center text-sm font-semibold text-primary hover:underline"
            >
              {success.continueToSite}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
