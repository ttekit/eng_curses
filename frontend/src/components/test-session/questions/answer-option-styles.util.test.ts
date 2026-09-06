import { describe, expect, it } from "vitest";
import { get_answer_option_classes } from "./answer-option-styles.util";

describe("get_answer_option_classes", () => {
  it("highlights the correct option after any answer", () => {
    const classes = get_answer_option_classes({
      option: "Goodbye, see you!",
      selected: "Hello, I am Alex.",
      correctAnswer: "Goodbye, see you!",
    });
    expect(classes).toContain("border-emerald-400");
  });

  it("uses readable default card styles", () => {
    const classes = get_answer_option_classes({
      option: "This is a pen.",
      selected: null,
      correctAnswer: "This is a book.",
    });
    expect(classes).toContain("text-zinc-100");
  });
});
