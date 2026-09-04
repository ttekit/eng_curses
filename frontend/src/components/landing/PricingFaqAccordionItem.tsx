import { ChevronDown, CircleHelp } from "lucide-react";
import { cn } from "../../lib/utils";
import type { MarketingFaqItem } from "../../lib/marketingSeoContent";

type PricingFaqAccordionItemProps = {
  item: MarketingFaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  panelId: string;
  buttonId: string;
};

/**
 * Single expandable pricing FAQ row with cosmic glass styling.
 */
export function PricingFaqAccordionItem({
  item,
  index,
  isOpen,
  onToggle,
  panelId,
  buttonId,
}: PricingFaqAccordionItemProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card/50 backdrop-blur-sm transition-all duration-300",
        isOpen
          ? "border-primary/40 shadow-[0_16px_48px_-28px_var(--glow)]"
          : "border-border/70 hover:border-primary/25",
      )}
    >
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-start gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
        >
          <span
            className={cn(
              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition-colors",
              isOpen
                ? "border-primary/40 bg-primary/15 text-glow"
                : "border-border bg-muted/50 text-muted-foreground",
            )}
            aria-hidden
          >
            {isOpen ? (
              <CircleHelp className="size-4" />
            ) : (
              String(index + 1).padStart(2, "0")
            )}
          </span>
          <span className="min-w-0 flex-1 pt-1 font-display text-base font-semibold text-foreground sm:text-lg">
            {item.question}
          </span>
          <ChevronDown
            className={cn(
              "mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-300",
              isOpen && "rotate-180 text-primary",
            )}
            aria-hidden
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="border-t border-border/60 px-5 pt-3 pb-5 font-sans text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6 sm:text-[0.9375rem]">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}
