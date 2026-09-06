import { useId, useState } from "react";
import { CreditCard } from "lucide-react";
import { cn } from "../../lib/utils";
import type { MarketingFaqItem } from "../../lib/marketingSeoContent";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { PricingFaqAccordionItem } from "./PricingFaqAccordionItem";

type PricingFaqSectionProps = {
  id?: string;
  title: string;
  subtitle?: string;
  items?: MarketingFaqItem[];
  className?: string;
};

function resolveFaqItems(
  items: MarketingFaqItem[] | undefined,
  fallback: MarketingFaqItem[],
): MarketingFaqItem[] {
  if (items && items.length > 0) {
    return items;
  }
  return fallback;
}

/**
 * Redesigned pricing FAQ with accordion layout and cosmic glass styling.
 * Visible content must match FAQPage JSON-LD on the same route.
 */
export function PricingFaqSection({
  id = "pricing-faq",
  title,
  subtitle,
  items,
  className,
}: PricingFaqSectionProps) {
  const { messages } = useLandingLocale();
  const headingId = useId();
  const baseId = useId();
  const fallbackItems = Object.values(messages.pricingQuestions);
  const faqItems = resolveFaqItems(items, fallbackItems);
  const [openIndex, setOpenIndex] = useState(0);

  function toggleItem(index: number) {
    setOpenIndex((current) => (current === index ? -1 : index));
  }

  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden border-t border-border/60 py-12 sm:py-20",
        className,
      )}
      aria-labelledby={headingId}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.65_0.25_295/0.08)_0%,transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]"
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_0_28px_-8px_var(--glow)]">
            <CreditCard className="size-6 text-glow" aria-hidden />
          </div>
          <h2
            id={headingId}
            className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-3 font-sans text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        <div className="mt-10 space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            const itemKey = `${baseId}-item-${index}`;
            return (
              <PricingFaqAccordionItem
                key={item.question}
                item={item}
                index={index}
                isOpen={isOpen}
                onToggle={() => toggleItem(index)}
                buttonId={`${itemKey}-button`}
                panelId={`${itemKey}-panel`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
