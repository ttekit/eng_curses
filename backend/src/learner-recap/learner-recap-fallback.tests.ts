import type { ComprehensionTestItem } from "src/content-video/content-video-comprehension-tests-gemini.client";
import type { PriorWeakSpot } from "src/content-video/content-video-comprehension-tests-gemini.client";

const RECAP_MCQ_COUNT = 10;

function mcq(
  id: string,
  category: "grammar" | "vocabulary" | "comprehension",
  question: string,
  options: string[],
  correctIndex: number,
  explanation: string,
): ComprehensionTestItem {
  return {
    questionType: "multiple_choice",
    id,
    category,
    question,
    options,
    correctIndex,
    explanation,
  };
}

/**
 * Offline recap quiz when Gemini is unavailable.
 */
export function fallbackRecapTests(input: {
  recapLabel: string;
  lessonTitles: string[];
  priorWeakSpots: PriorWeakSpot[];
}): ComprehensionTestItem[] {
  const title =
    input.lessonTitles[0]?.slice(0, 80) || input.recapLabel.slice(0, 80);
  const weak = input.priorWeakSpots[0];
  const weakSnippet = weak?.stemSnippet.slice(0, 120) ?? "a recent miss";
  const tests: ComprehensionTestItem[] = [
    mcq(
      "r1",
      "comprehension",
      `Which option best matches the main idea across your recent lessons (including "${title}")?`,
      [
        "A clear topic tied to the clips you watched",
        "An unrelated hobby story",
        "Only grammar rules with no content",
        "A list of random words",
      ],
      0,
      "Recap questions should reflect lessons you actually watched.",
    ),
    mcq(
      "r2",
      "grammar",
      `You previously struggled with: “${weakSnippet}…”. Which sentence fixes the tense best?`,
      [
        "I have finished the clip and noted new words.",
        "I finishing the clip yesterday.",
        "I finish the clip tomorrow yesterday.",
        "Finishing I clip the.",
      ],
      0,
      "Present perfect fits a recently completed learning action.",
    ),
    mcq(
      "r3",
      "vocabulary",
      `In context from "${title}", what does revisiting key vocabulary help with?`,
      ["Recall during listening", "Ignoring meaning", "Skipping captions", "Muting audio"],
      0,
      "Repetition strengthens recognition while listening.",
    ),
    mcq(
      "r4",
      "comprehension",
      "What should you do when two answer choices both sound plausible?",
      [
        "Pick the one best supported by what you heard or read in the lessons",
        "Always choose the longest option",
        "Pick at random",
        "Skip the question",
      ],
      0,
      "Evidence from lesson content beats guessing.",
    ),
    mcq(
      "r5",
      "grammar",
      "Which sentence uses articles correctly?",
      [
        "The speaker gives an example from the lesson.",
        "Speaker gives example from lesson the.",
        "An speaker gives the example lesson from.",
        "Example an the from lesson speaker.",
      ],
      0,
      "Definite and indefinite articles follow standard patterns.",
    ),
    mcq(
      "r6",
      "vocabulary",
      "Collocation: which pair sounds natural?",
      ["make progress", "do progress", "make a progress", "progress make"],
      0,
      "We say “make progress” in English.",
    ),
    mcq(
      "r7",
      "comprehension",
      `Why is a ${input.recapLabel.toLowerCase()} useful after several lessons?`,
      [
        "It mixes grammar, vocabulary, and listening from your recent clips",
        "It replaces watching videos entirely",
        "It only tests spelling of names",
        "It skips weaker skills",
      ],
      0,
      "Recaps reinforce mixed skills from recent viewing.",
    ),
    mcq(
      "r8",
      "grammar",
      "Choose the correct preposition: “I'm interested ___ improving my listening.”",
      ["in", "on", "at", "for"],
      0,
      "The adjective “interested” takes “in”.",
    ),
    mcq(
      "r9",
      "vocabulary",
      "What is a good habit after missing a quiz item?",
      [
        "Review the explanation and re-watch a short segment",
        "Never open the lesson again",
        "Turn off captions forever",
        "Ignore feedback",
      ],
      0,
      "Targeted review helps retention.",
    ),
    mcq(
      "r10",
      "comprehension",
      "When answers refer to several lessons, you should:",
      [
        "Connect each question to themes from those clips, not outside trivia",
        "Ignore all prior lessons",
        "Only use the newest lesson title as a lucky guess",
        "Answer in your first language",
      ],
      0,
      "Recaps stay grounded in your watch history.",
    ),
  ];
  return tests.slice(0, RECAP_MCQ_COUNT);
}

export const LEARNER_RECAP_MCQ_COUNT = RECAP_MCQ_COUNT;
