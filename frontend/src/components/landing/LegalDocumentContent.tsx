type LegalSubsection = {
  readonly heading?: string;
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly string[];
  readonly orderedItems?: readonly string[];
};

type LegalSection = {
  readonly heading: string;
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly string[];
  readonly subsections?: readonly LegalSubsection[];
};

export type LegalPageContent = {
  readonly title: string;
  readonly lead: string;
  readonly lastUpdated: string;
  readonly sections: readonly LegalSection[];
};

type LegalDocumentContentProps = {
  readonly page: LegalPageContent;
};

function renderParagraph(text: string, key: string) {
  return (
    <p key={key} className="text-base leading-relaxed text-muted-foreground">
      {text}
    </p>
  );
}

function renderBullets(items: readonly string[], keyPrefix: string) {
  return (
    <ul
      key={keyPrefix}
      className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground"
    >
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function renderOrderedItems(items: readonly string[], keyPrefix: string) {
  return (
    <ol
      key={keyPrefix}
      className="list-decimal space-y-2 pl-5 text-base leading-relaxed text-muted-foreground"
    >
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}

function renderSubsection(subsection: LegalSubsection, key: string) {
  return (
    <div key={key} className="space-y-3">
      {subsection.heading ? (
        <h3 className="font-display text-lg font-semibold text-foreground">
          {subsection.heading}
        </h3>
      ) : null}
      {subsection.paragraphs?.map((paragraph) =>
        renderParagraph(paragraph, `${key}-${paragraph}`),
      )}
      {subsection.bullets ? renderBullets(subsection.bullets, `${key}-ul`) : null}
      {subsection.orderedItems
        ? renderOrderedItems(subsection.orderedItems, `${key}-ol`)
        : null}
    </div>
  );
}

/**
 * Renders a legal or informational page from structured content.
 */
export function LegalDocumentContent({ page }: LegalDocumentContentProps) {
  return (
    <article className="space-y-10">
      <header className="space-y-4 border-b border-border/60 pb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          {page.title}
        </h1>
        {page.lead ? (
          <p className="text-lg leading-relaxed text-muted-foreground">
            {page.lead}
          </p>
        ) : null}
        {page.lastUpdated ? (
          <p className="text-sm text-muted-foreground">{page.lastUpdated}</p>
        ) : null}
      </header>

      <div className="space-y-8">
        {page.sections.map((section) => (
          <section key={section.heading} className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground">
              {section.heading}
            </h2>
            {section.paragraphs?.map((paragraph) =>
              renderParagraph(paragraph, `${section.heading}-${paragraph}`),
            )}
            {section.bullets
              ? renderBullets(section.bullets, `${section.heading}-bullets`)
              : null}
            {section.subsections?.map((subsection) =>
              renderSubsection(
                subsection,
                `${section.heading}-${subsection.heading ?? "block"}`,
              ),
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
