/**
 * Numeric amount + day/month/year selector; emits canonical English `timeToAchieve` strings.
 */
import { useEffect, useState, useRef } from "react";
import { cn } from "../lib/utils";
import { ChevronDown } from "lucide-react";
import {
  parseTimeToAchieveString,
  serializeTimeToAchieve,
  type TimeToAchieveUnit,
} from "../lib/timeToAchieve";

const fieldClass =
  "rounded-xl border border-input bg-background px-4 py-3.5 text-sm text-foreground shadow-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/40";

export type TimeToAchieveUnitLabels = {
  day: string;
  month: string;
  year: string;
  /** Accessible name for the unit dropdown */
  unitSelectAria: string;
};

type Props = {
  id?: string;
  value: string;
  onChange: (serialized: string) => void;
  unitLabels: TimeToAchieveUnitLabels;
  /** When true, an empty amount clears the value (optional registration field). */
  allowEmpty?: boolean;
  className?: string;
};

export function TimeToAchieveField({
  id,
  value,
  onChange,
  unitLabels,
  allowEmpty = false,
  className,
}: Props) {
  const [amountStr, setAmountStr] = useState("");
  const [unit, setUnit] = useState<TimeToAchieveUnit>("month");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне элемента
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      setAmountStr("");
      setUnit("month");
      return;
    }
    const next = parseTimeToAchieveString(trimmed);
    setAmountStr(String(next.amount));
    setUnit(next.unit);
  }, [value]);

  function emit(amount: number, nextUnit: TimeToAchieveUnit): void {
    onChange(serializeTimeToAchieve(amount, nextUnit));
  }

  function normalizeAmountDigits(raw: string): string {
    return raw.replace(/\D/g, "").slice(0, 3);
  }

  const handleUnitChange = (nextUnit: TimeToAchieveUnit) => {
    setUnit(nextUnit);
    setIsOpen(false);

    if (allowEmpty && amountStr === "") {
      onChange("");
      return;
    }
    let n = parseInt(amountStr, 10);
    if (Number.isNaN(n) || n < 1) {
      if (allowEmpty) {
        onChange("");
        return;
      }
      n = 1;
      setAmountStr("1");
    }
    emit(Math.min(999, n), nextUnit);
  };

  const units: TimeToAchieveUnit[] = ["day", "month", "year"];

  return (
    <div className={cn("flex flex-wrap gap-2 sm:flex-nowrap", className)}>
      {/* Поле ввода цифр */}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        maxLength={3}
        value={amountStr}
        onChange={(e) => {
          const digits = normalizeAmountDigits(e.target.value);
          setAmountStr(digits);
          if (digits === "") {
            if (allowEmpty) onChange("");
            return;
          }
          const n = parseInt(digits, 10);
          if (!Number.isNaN(n) && n >= 1) emit(Math.min(999, n), unit);
        }}
        onBlur={() => {
          if (amountStr === "") {
            if (allowEmpty) {
              onChange("");
              return;
            }
            setAmountStr("1");
            emit(1, unit);
            return;
          }
          let n = parseInt(amountStr, 10);
          if (Number.isNaN(n) || n < 1) n = 1;
          n = Math.min(999, n);
          setAmountStr(String(n));
          emit(n, unit);
        }}
        className={cn(fieldClass, "min-w-[5rem] flex-1 font-tabular-nums")}
      />

      {/* Кастомный выпадающий список вместо нативного select */}
      <div className="relative min-w-[7.5rem] shrink-0" ref={dropdownRef}>
        <button
          type="button"
          aria-label={unitLabels.unitSelectAria}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            fieldClass,
            "flex w-full items-center justify-between cursor-pointer",
            isOpen && "border-primary ring-2 ring-primary/40",
          )}
        >
          <span className="truncate">{unitLabels[unit]}</span>
          <ChevronDown
            className={cn(
              "ml-2 size-4 shrink-0 transition-transform text-muted-foreground",
              isOpen && "rotate-180 text-primary",
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl animate-in fade-in zoom-in-95">
            {units.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => handleUnitChange(u)}
                className={cn(
                  "flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/50 cursor-pointer font-medium",
                  unit === u ? "text-primary bg-primary/10" : "text-foreground",
                )}
              >
                {unitLabels[u]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
