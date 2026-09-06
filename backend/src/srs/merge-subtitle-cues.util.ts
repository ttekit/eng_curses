import type { SubtitleCueSec } from "./subtitle-time.util";
import {
  MAX_FEED_SEGMENT_DURATION_SEC,
  MIN_FEED_SEGMENT_DURATION_SEC,
} from "src/recommendation-engine/segment-duration.util";

type FeedCueBatch = SubtitleCueSec & {
  sourceCueCount: number;
};

export function merge_subtitle_cues_for_feed(
  cues: SubtitleCueSec[],
  minDurationSec = MIN_FEED_SEGMENT_DURATION_SEC,
  maxDurationSec = MAX_FEED_SEGMENT_DURATION_SEC,
): SubtitleCueSec[] {
  if (cues.length === 0) {
    return [];
  }
  const batches: FeedCueBatch[] = [];
  let index = 0;
  while (index < cues.length) {
    const batch = build_next_batch(cues, index, minDurationSec, maxDurationSec);
    batches.push(batch.segment);
    index = batch.nextIndex;
  }
  return finalize_feed_batches(batches, minDurationSec, maxDurationSec);
}

function build_next_batch(
  cues: SubtitleCueSec[],
  startIndex: number,
  minDurationSec: number,
  maxDurationSec: number,
): { segment: FeedCueBatch; nextIndex: number } {
  let endIndex = startIndex;
  let startSec = cues[startIndex]!.startSec;
  let endSec = cues[startIndex]!.endSec;
  const texts = [cues[startIndex]!.text];
  endIndex += 1;
  while (endIndex < cues.length) {
    const currentDuration = endSec - startSec;
    const nextCue = cues[endIndex]!;
    const nextCueDuration = nextCue.endSec - nextCue.startSec;
    const extendedDuration = nextCue.endSec - startSec;
    if (extendedDuration > maxDurationSec) {
      if (currentDuration < minDurationSec) {
        endSec = nextCue.endSec;
        texts.push(nextCue.text);
        endIndex += 1;
      }
      break;
    }
    if (currentDuration >= minDurationSec && nextCueDuration < minDurationSec) {
      break;
    }
    endSec = nextCue.endSec;
    texts.push(nextCue.text);
    endIndex += 1;
  }
  return {
    segment: {
      startSec,
      endSec,
      text: texts.join(" ").replace(/\s+/g, " ").trim(),
      sourceCueCount: endIndex - startIndex,
    },
    nextIndex: endIndex,
  };
}

function finalize_feed_batches(
  batches: FeedCueBatch[],
  minDurationSec: number,
  maxDurationSec: number,
): SubtitleCueSec[] {
  if (batches.length === 0) {
    return [];
  }
  const merged = [...batches];
  const lastIndex = merged.length - 1;
  const lastBatch = merged[lastIndex];
  if (
    lastBatch &&
    lastIndex > 0 &&
    lastBatch.endSec - lastBatch.startSec < minDurationSec
  ) {
    const previous = merged[lastIndex - 1]!;
    const previousDuration = previous.endSec - previous.startSec;
    const combined: FeedCueBatch = {
      startSec: previous.startSec,
      endSec: lastBatch.endSec,
      text: `${previous.text} ${lastBatch.text}`.replace(/\s+/g, " ").trim(),
      sourceCueCount: previous.sourceCueCount + lastBatch.sourceCueCount,
    };
    const should_drop_tail =
      lastBatch.sourceCueCount === 1 && previousDuration >= minDurationSec;
    if (should_drop_tail) {
      merged.pop();
    } else if (combined.endSec - combined.startSec <= maxDurationSec) {
      merged.splice(lastIndex - 1, 2, combined);
    } else {
      merged.pop();
    }
  }
  return merged
    .filter(
      (batch) =>
        batch.endSec - batch.startSec >= minDurationSec && batch.text.length > 0,
    )
    .map(({ startSec, endSec, text }) => ({ startSec, endSec, text }));
}
