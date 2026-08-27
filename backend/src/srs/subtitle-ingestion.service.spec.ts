import { parse_srt_to_seconds } from "./srt-parser.util";
import { parse_vtt_to_seconds } from "./subtitle-time.util";
import { tokenize_phrase } from "./tokenize-phrase.util";

describe("subtitle parsers", () => {
  it("parses VTT cues with seconds timestamps", () => {
    const vtt = `WEBVTT

00:00:01.000 --> 00:00:03.500
Hello world

00:00:04.000 --> 00:00:06.000
Second line`;
    const cues = parse_vtt_to_seconds(vtt);
    expect(cues).toHaveLength(2);
    expect(cues[0]).toMatchObject({
      startSec: 1,
      endSec: 3.5,
      text: "Hello world",
    });
  });

  it("parses SRT cues", () => {
    const srt = `1
00:00:01,000 --> 00:00:03,500
Hello world

2
00:00:04,000 --> 00:00:06,000
Second line`;
    const cues = parse_srt_to_seconds(srt);
    expect(cues).toHaveLength(2);
    expect(cues[1]?.text).toBe("Second line");
  });
});

describe("tokenize_phrase", () => {
  it("returns normalized lemma tokens", () => {
    const tokens = tokenize_phrase("Hello, world!");
    expect(tokens.map((token) => token.word)).toEqual(["hello", "world"]);
  });
});
