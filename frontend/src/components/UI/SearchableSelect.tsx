// src/components/ui/SearchableSelect.tsx
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils"; // Проверьте правильность пути!

export interface SearchableSelectProps {
  value: string | number;
  onChange: (val: string | number) => void;
  options: { value: string | number; label: string }[];
  className?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  className,
  showSearch = false,
  searchPlaceholder = "Search...",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, showSearch]);

  const selectedLabel =
    options.find((o) => o.value === value)?.label || options[0]?.label;

  const filteredOptions = options.filter((o) =>
    String(o.label).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none",
          isOpen
            ? "border-primary ring-1 ring-primary text-foreground"
            : "border-border text-foreground hover:border-primary/50",
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform text-muted-foreground",
            isOpen && "rotate-180 text-primary",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-[99999] w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 flex flex-col">
          {showSearch && (
            <div className="border-b border-border/50 bg-muted/10 p-2">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>
          )}

          <div className="max-h-[220px] overflow-y-auto py-1 overscroll-contain">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                No options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={cn(
                      "flex w-full cursor-pointer select-none items-center px-4 py-2.5 text-sm outline-none transition-colors hover:bg-muted focus:bg-muted text-left",
                      isSelected
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-foreground font-medium",
                    )}
                  >
                    <span className="truncate block">{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
