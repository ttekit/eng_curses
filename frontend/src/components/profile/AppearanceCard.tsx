import { useState } from "react";
import { Monitor } from "lucide-react";
import { ProfileCard } from "./ProfileCard";
import { useAppMessages } from "../../hooks/useAppMessages";
import { useLandingLocale } from "../../context/LandingLocaleContext";

export function AppearanceCard() {
  const { locale, setLocale } = useLandingLocale();
  const s = useAppMessages().profileSettings;

  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  const applyTheme = (dark: boolean) => {
    setIsDarkMode(dark);
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  return (
    <ProfileCard
      title={
        <span className="flex items-center gap-2">
          <Monitor className="size-5 text-primary" />
          {s.displayLang}
        </span>
      }
    >
      <p className="mb-4 text-sm text-muted-foreground">{s.customizeDisplay}</p>

      <div className="grid gap-4 sm:grid-cols-2 py-2">
        {/* Выбор темы (Слева) */}
        <div className="flex flex-col gap-4 rounded-lg border border-border/50 p-4 hover:bg-muted/20 transition-colors">
          <div>
            <p className="font-medium text-foreground">{s.theme}</p>
            <p className="text-sm text-muted-foreground">{s.lightOrDark}</p>
          </div>
          <div className="mt-auto flex w-fit bg-secondary/50 rounded-lg p-1 border border-border/50">
            <button
              type="button"
              onClick={() => applyTheme(false)}
              className={`px-5 py-1.5 text-sm font-medium rounded-md transition-colors hover:cursor-pointer ${
                !isDarkMode
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.light}
            </button>
            <button
              type="button"
              onClick={() => applyTheme(true)}
              className={`px-5 py-1.5 text-sm font-medium rounded-md transition-colors hover:cursor-pointer ${
                isDarkMode
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.dark}
            </button>
          </div>
        </div>

        {/* Выбор языка (Справа) */}
        <div className="flex flex-col gap-4 rounded-lg border border-border/50 p-4 hover:bg-muted/20 transition-colors">
          <div>
            <p className="font-medium text-foreground">{s.language}</p>
            <p className="text-sm text-muted-foreground">{s.interfaceLang}</p>
          </div>
          <div className="mt-auto flex w-fit bg-secondary/50 rounded-lg p-1 border border-border/50">
            <button
              type="button"
              onClick={() => setLocale?.("en")}
              className={`px-5 py-1.5 text-sm font-medium rounded-md uppercase transition-colors hover:cursor-pointer ${
                locale === "en"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.en}
            </button>
            <button
              type="button"
              onClick={() => setLocale?.("uk")}
              className={`px-5 py-1.5 text-sm font-medium rounded-md uppercase transition-colors hover:cursor-pointer ${
                locale === "uk"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.uk}
            </button>
          </div>
        </div>
      </div>
    </ProfileCard>
  );
}
