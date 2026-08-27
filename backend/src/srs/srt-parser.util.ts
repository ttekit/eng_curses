import type { SubtitleCueSec } from "./subtitle-time.util";
import { vtt_timestamp_to_seconds } from "./subtitle-time.util";

/** Parses SRT subtitle files into normalized cue objects. */
export function parse_srt_to_seconds(srtString: string): SubtitleCueSec[] {
  const normalized = srtString.replace(/\r\n/g, "\n").trim();
  const blocks = normalized.split(/\n\s*\n/);
  const cues: SubtitleCueSec[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim());
    const timingLine = lines.find((line) => line.includes("-->"));
    if (!timingLine) {
      continue;
    }
    const [startRaw, endRaw] = timingLine.split(/\s*-->\s*/);
    const startSec = vtt_timestamp_to_seconds(startRaw ?? "");
    const endSec = vtt_timestamp_to_seconds(endRaw ?? "");
    const timingIndex = lines.indexOf(timingLine);
    const text = lines
      .slice(timingIndex + 1)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length > 0 && endSec > startSec) {
      cues.push({ startSec, endSec, text });
    }
  }
  return cues;
}

export function detect_subtitle_format(
  content: string,
  fileUrl?: string,
): "vtt" | "srt" {
  const trimmed = content.trimStart();
  if (trimmed.startsWith("WEBVTT")) {
    return "vtt";
  }
  if (fileUrl?.toLowerCase().endsWith(".srt")) {
    return "srt";
  }
  if (/^\d+\s*\n[\d:,]+ --> [\d:,]+/m.test(content)) {
    return "srt";
  }
  return "vtt";
}
