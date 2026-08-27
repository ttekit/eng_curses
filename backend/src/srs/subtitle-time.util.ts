export type SubtitleCueSec = {
  startSec: number;
  endSec: number;
  text: string;
};

/** Parses VTT/SRT timestamps like `HH:MM:SS.mmm` or `MM:SS.mmm`. */
export function vtt_timestamp_to_seconds(ts: string): number {
  const token = ts.trim().split(/\s+/)[0] ?? "";
  const parts = token.split(":");
  if (parts.length === 3) {
    const [hours, minutes, secondsPart] = parts;
    const seconds = Number.parseFloat(secondsPart ?? "0");
    return (
      Number(hours) * 3600 +
      Number(minutes) * 60 +
      (Number.isFinite(seconds) ? seconds : 0)
    );
  }
  if (parts.length === 2) {
    const [minutes, secondsPart] = parts;
    const seconds = Number.parseFloat(secondsPart ?? "0");
    return Number(minutes) * 60 + (Number.isFinite(seconds) ? seconds : 0);
  }
  const numeric = Number.parseFloat(token);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function parse_vtt_to_seconds(vttString: string): SubtitleCueSec[] {
  const normalized = vttString.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const cues: SubtitleCueSec[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index]?.trim() ?? "";
    if (line.includes("-->")) {
      const [startRaw, endRaw] = line.split(/\s*-->\s*/);
      const startSec = vtt_timestamp_to_seconds(startRaw ?? "");
      const endSec = vtt_timestamp_to_seconds(endRaw ?? "");
      index += 1;
      const textLines: string[] = [];
      while (index < lines.length && (lines[index]?.trim() ?? "") !== "") {
        textLines.push(strip_cue_markup(lines[index] ?? ""));
        index += 1;
      }
      const text = textLines.join(" ").replace(/\s+/g, " ").trim();
      if (text.length > 0 && endSec > startSec) {
        cues.push({ startSec, endSec, text });
      }
    } else {
      index += 1;
    }
  }
  return cues;
}

function strip_cue_markup(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\u200b/g, "")
    .trim();
}
