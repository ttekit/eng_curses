import type { FeedMode } from "./recommendation.types";

export type LearningMemorySnapshot = {
  memoryStrength: number;
  lastSeenAt: Date;
};

export function resolve_new_target_word(
  segmentWords: string[],
  knownWords: Set<string>,
  learningWords: Set<string>,
): string | null {
  const union = new Set<string>([...knownWords, ...learningWords]);
  const unknownWords = segmentWords.filter((word) => !union.has(word));
  if (unknownWords.length === 0) {
    return null;
  }
  return unknownWords[0] ?? null;
}

export function resolve_review_target_word(
  segmentWords: string[],
  learningWords: Map<string, LearningMemorySnapshot>,
): string | null {
  const learningInSegment = segmentWords.filter((word) =>
    learningWords.has(word),
  );
  return pick_weakest_learning_word(learningInSegment, learningWords);
}

export function resolve_feed_target_word(
  segmentWords: string[],
  feedKind: FeedMode,
  input: {
    knownWords: Set<string>;
    learningWords: Map<string, LearningMemorySnapshot>;
  },
): string | null {
  if (feedKind === "new") {
    return resolve_new_target_word(
      segmentWords,
      input.knownWords,
      new Set(input.learningWords.keys()),
    );
  }
  const reviewTarget = resolve_review_target_word(
    segmentWords,
    input.learningWords,
  );
  if (reviewTarget) {
    return reviewTarget;
  }
  return resolve_exploration_target_word(
    segmentWords,
    input.knownWords,
    input.learningWords,
  );
}

function resolve_exploration_target_word(
  segmentWords: string[],
  knownWords: Set<string>,
  learningWords: Map<string, LearningMemorySnapshot>,
): string | null {
  const union = new Set<string>([
    ...knownWords,
    ...learningWords.keys(),
  ]);
  const unknownWords = segmentWords.filter((word) => !union.has(word));
  if (unknownWords.length > 0) {
    return unknownWords[0] ?? null;
  }
  const learningInSegment = segmentWords.filter((word) =>
    learningWords.has(word),
  );
  return pick_weakest_learning_word(learningInSegment, learningWords);
}

function pick_weakest_learning_word(
  candidates: string[],
  learningWords: Map<string, LearningMemorySnapshot>,
): string | null {
  if (candidates.length === 0) {
    return null;
  }
  const sorted = [...candidates].sort((left, right) => {
    const leftMemory = learningWords.get(left);
    const rightMemory = learningWords.get(right);
    if (!leftMemory || !rightMemory) {
      return 0;
    }
    if (leftMemory.memoryStrength !== rightMemory.memoryStrength) {
      return leftMemory.memoryStrength - rightMemory.memoryStrength;
    }
    return leftMemory.lastSeenAt.getTime() - rightMemory.lastSeenAt.getTime();
  });
  return sorted[0] ?? null;
}
