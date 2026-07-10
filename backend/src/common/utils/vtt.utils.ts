export interface VttBlock {
  start: string;
  end: string;
  text: string;
}

export function parseVtt(vttString: string): VttBlock[] {
  const blocks: VttBlock[] = [];
  const lines = vttString.replace(/\r\n/g, "\n").split("\n");

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.includes("-->")) {
      const [start, end] = line.split(/\s*-->\s*/);
      i++;
      const textLines = [];
      while (i < lines.length && lines[i].trim() !== "") {
        textLines.push(lines[i].trim());
        i++;
      }
      blocks.push({ start, end, text: textLines.join(" ") });
    } else {
      i++;
    }
  }
  return blocks;
}

export function buildVtt(
  blocks: VttBlock[],
  translatedTexts: string[],
): string {
  let vtt = "WEBVTT\n\n";
  blocks.forEach((block, index) => {
    vtt += `${block.start} --> ${block.end}\n`;
    vtt += `${translatedTexts[index]}\n\n`;
  });
  return vtt;
}

export function buildVttChunk(blocks: VttBlock[], translatedTexts: string[]): string {
  let vtt = "";
  blocks.forEach((block, index) => {
    vtt += `${block.start} --> ${block.end}\n`;
    vtt += `${translatedTexts[index]}\n\n`;
  });
  return vtt;
}