/**
 * Renders a short habit or tip string with minimal markup: **bold** and line breaks.
 */
import { Fragment, type ReactNode } from "react";

function renderBoldSegments(line: string, keyPrefix: string): ReactNode {
  const parts = line.split(/\*\*(.*?)\*\*/g);
  return parts.map((chunk, index) =>
    index % 2 === 1 ? (
      <strong
        key={`${keyPrefix}-${index}`}
        className="font-semibold text-foreground"
      >
        {chunk}
      </strong>
    ) : (
      <span key={`${keyPrefix}-${index}`}>{chunk}</span>
    ),
  );
}

/**
 * Converts lightweight markdown in learner copy to inline elements (bold, newlines).
 *
 * @param text - Raw string, possibly containing `**segments**` and `\n` breaks.
 * @returns Inline nodes suitable inside list items or paragraphs.
 */
export function renderLightMarkdown(text: string): ReactNode {
  const lines = text.split("\n");
  return (
    <span className="min-w-0 flex-1 leading-relaxed">
      {lines.map((line, lineIndex) => (
        <Fragment key={`ln-${lineIndex}`}>
          {lineIndex > 0 ? <br /> : null}
          {renderBoldSegments(line, `ln-${lineIndex}`)}
        </Fragment>
      ))}
    </span>
  );
}
