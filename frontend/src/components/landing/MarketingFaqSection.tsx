import { useId } from "react";
import { cn } from "../../lib/utils";
import type { MarketingFaqItem } from "../../lib/marketingSeoContent";
import { useLandingLocale } from "../../context/LandingLocaleContext";

type MarketingFaqSectionProps = {
  id?: string;
  title: string;
  subtitle?: string;
  items: MarketingFaqItem[];
  className?: string;
};

/**
 * Visible FAQ block — content must match FAQPage JSON-LD on the same route.
 */
export function MarketingFaqSection({
  id = "faq",
  title,
  subtitle,
  items: _items,
  className,
}: MarketingFaqSectionProps) {
  const { messages } = useLandingLocale();
  const headingId = useId();

  const faqItems = messages.marketingQuestions
    ? Object.values(messages.marketingQuestions)
    : [];

  return (
    <section
      id={id}
      className={cn(
        "border-border border-t bg-background py-16 sm:py-20",
        className,
      )}
      aria-labelledby={headingId}
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2
          id={headingId}
          className="font-display text-center text-3xl font-bold tracking-tight sm:text-4xl"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 text-center text-muted-foreground">{subtitle}</p>
        ) : null}
        <dl className="mt-10 space-y-4">
          {faqItems.map((item) => (
            <div
              key={item.question}
              className="rounded-xl border border-border bg-card/50 p-5"
            >
              <dt className="font-semibold text-foreground">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
