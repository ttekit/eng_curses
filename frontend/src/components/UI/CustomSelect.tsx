// src/components/ui/CustomSelect.tsx
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils"; // Проверьте правильность пути до вашей функции cn!

// Описываем, какие пропсы (параметры) принимает наш компонент
export interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  disabled = false,
  className,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Закрываем меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div
      className={cn("relative w-full text-sm font-medium", className)}
      ref={ref}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border bg-background px-3 py-2.5 text-left text-foreground focus:outline-none transition-colors shadow-sm",
          // Стили для заблокированного и активного состояния
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-primary/50",
          // Подсветка при открытом меню
          isOpen
            ? "border-primary ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
            : "border-input",
        )}
      >
        <span className="truncate">{selectedOption?.label || value}</span>
        <ChevronDown
          className={cn(
            "ml-2 size-4 shrink-0 transition-transform opacity-70",
            isOpen && "rotate-180 text-primary",
          )}
        />
      </button>

      {/* Выпадающий список (рендерится только если открыт и не заблокирован) */}
      {isOpen && !disabled && (
        <div className="absolute z-[9999] mt-2 w-full overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl animate-in fade-in zoom-in-95">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center px-3 py-2.5 text-left transition-colors hover:bg-muted/50 cursor-pointer",
                value === opt.value
                  ? "text-primary font-bold bg-primary/10"
                  : "text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
