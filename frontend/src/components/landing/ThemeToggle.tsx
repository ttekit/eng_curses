import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "../../lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // При загрузке проверяем текущую тему
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const setTheme = (dark: boolean) => {
    setIsDarkMode(dark);
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-full border border-border bg-muted/30 p-1",
        className,
      )}
      role="group"
      aria-label="Theme toggle"
    >
      <button
        type="button"
        onClick={() => setTheme(false)}
        className={cn(
          "flex items-center justify-center rounded-full px-3 py-1.5 transition-colors cursor-pointer",
          !isDarkMode
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        )}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
      </button>
      <button
        type="button"
        onClick={() => setTheme(true)}
        className={cn(
          "flex items-center justify-center rounded-full px-3 py-1.5 transition-colors cursor-pointer",
          isDarkMode
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        )}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
      </button>
    </div>
  );
}
