import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { webvtt } from "@deepgram/captions";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { execFile } from "node:child_process";
import type { ExecException } from "node:child_process";
import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
  appendFile,
  stat,
  open,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { randomUUID } from "crypto";
import { PrismaService } from "src/prisma.service";
import { publicS3ObjectUrl } from "src/common/s3-key.util";
import { VideoTranscriptTagsService } from "./video-transcript-tags.service";
import { DeepSeekService } from "./deepseek.service";
import { buildVttChunk } from "src/common/utils/vtt.utils";
import { createReadStream, createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import * as readline from "node:readline";
import { SubtitleIngestionService } from "src/srs/subtitle-ingestion.service";

const DEEPGRAM_LISTEN = "https://api.deepgram.com/v1/listen";
const execFileAsync = promisify(execFile);

const MIN_WAV_BYTES = 2000;

type FfmpegAttemptTrace = {
  name: string;
  ok: boolean;
  err?: string;
};

function deepgramCaptionMaxVideoBytes(): number {
  const n = Number(process.env.CONTENT_VIDEO_MAX_FILE_BYTES);
  if (Number.isFinite(n) && n > 0) return Math.floor(n);
  return 512 * 1024 * 1024;
}

function deepgramTranscribeModel(config: ConfigService): string {
  const m = config.get<string>("DEEPGRAM_TRANSCRIBE_MODEL")?.trim();
  return m || "nova-3";
}

function ffmpegBinaryPath(): string {
  const p = process.env.FFMPEG_PATH?.trim();
  if (p) return p;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (require("@ffmpeg-installer/ffmpeg") as { path: string }).path;
}

function execErrText(ex: unknown): string {
  const xe = ex as ExecException & { stderr?: string };
  return `${xe.stderr ?? ""}${xe.stderr ? "\n" : ""}${xe.message ?? String(ex)}`.slice(
    0,
    1500,
  );
}

async function ffmpegRun(bin: string, args: string[]): Promise<void> {
  await execFileAsync(bin, args, {
    maxBuffer: 12 * 1024 * 1024,
    encoding: "utf8",
  });
}

async function downloadHlsToLocalTemp(
  m3u8Url: string,
  tmpDir: string,
): Promise<string> {
  let playlistUrl = m3u8Url;
  let res = await fetch(playlistUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  let text = await res.text();

  if (text.includes("#EXT-X-STREAM-INF")) {
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && !nextLine.startsWith("#")) {
          playlistUrl = new URL(nextLine, playlistUrl).toString();
          res = await fetch(playlistUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          text = await res.text();
          break;
        }
      }
    }
  }

  const segmentUrls: string[] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t && !t.startsWith("#")) {
      segmentUrls.push(new URL(t, playlistUrl).toString());
    }
  }

  if (segmentUrls.length === 0) {
    throw new Error("No segments");
  }

  const combinedTsPath = join(tmpDir, `combined-${randomUUID()}.ts`);

  for (const segUrl of segmentUrls) {
    const segRes = await fetch(segUrl);
    if (!segRes.ok) throw new Error(`HTTP ${segRes.status}`);
    const arrBuf = await segRes.arrayBuffer();
    await appendFile(combinedTsPath, Buffer.from(arrBuf));
  }

  return combinedTsPath;
}

/**
 * MP4 AAC in the wild sometimes trips FFmpeg's demuxer/dec (HE-AAC, sparse tracks).
 * Try default audio selection / alternate `-map 0:a:n` / ADTS copy then decode — with tolerant input flags.
 */
async function extractMp4AudioToPcmWav(args: {
  ffmpegBin: string;
  mp4Path: string;
  tmpDir: string;
}): Promise<{ wavBuf: Buffer; trace: FfmpegAttemptTrace[] }> {
  const { ffmpegBin, mp4Path, tmpDir } = args;
  const trace: FfmpegAttemptTrace[] = [];

  const robustPrefix = (): string[] => [
    "-hide_banner",
    "-loglevel",
    "error",
    "-nostdin",
    "-y",
    "-fflags",
    "+discardcorrupt",
    "-err_detect",
    "ignore_err",
    "-i",
    mp4Path,
  ];

  const wavSuffix = (wavPath: string, mapMiddle: string[]): string[] => [
    ...robustPrefix(),
    ...mapMiddle,
    "-vn",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-acodec",
    "pcm_s16le",
    "-f",
    "wav",
    wavPath,
  ];

  const pushFail = (a: FfmpegAttemptTrace, ex: unknown) => {
    a.err = execErrText(ex).slice(0, 450);
    trace.push(a);
  };

  const finishIfValidWav = async (
    wavPath: string,
    meta: Omit<FfmpegAttemptTrace, "ok" | "err">,
  ): Promise<Buffer | null> => {
    let buf: Buffer;
    try {
      buf = await readFile(wavPath);
    } finally {
      await rm(wavPath, { force: true }).catch(() => {});
    }
    if (buf.length < MIN_WAV_BYTES) {
      trace.push({
        ...meta,
        ok: false,
        err: `WAV too small (${buf.length} B)`,
      });
      return null;
    }
    trace.push({ ...meta, ok: true });
    return buf;
  };

  // Default stream selection (may differ from `-map 0:a:0`).
  {
    const wavPath = join(tmpDir, `pcm-${randomUUID()}.wav`);
    const meta = { name: "direct-default-audio" } as const;
    try {
      await ffmpegRun(ffmpegBin, wavSuffix(wavPath, []));
      const buf = await finishIfValidWav(wavPath, meta);
      if (buf) return { wavBuf: buf, trace };
    } catch (ex) {
      pushFail({ ...meta, ok: false }, ex);
    }
  }

  // Explicit `0:a:n` with tolerant demux/decode.
  for (let idx = 0; idx < 4; idx++) {
    const wavPath = join(tmpDir, `pcm-${randomUUID()}.wav`);
    const meta = { name: `direct-map-0:a:${idx}` } as const;
    try {
      await ffmpegRun(ffmpegBin, wavSuffix(wavPath, ["-map", `0:a:${idx}`]));
      const buf = await finishIfValidWav(wavPath, meta);
      if (buf) return { wavBuf: buf, trace };
    } catch (ex) {
      pushFail({ ...meta, ok: false }, ex);
    }
  }

  // ADTS copy then decode — avoids some broken MP4 AAC framing.
  for (let idx = 0; idx < 4; idx++) {
    const aacPath = join(tmpDir, `raw-${randomUUID()}.aac`);
    const wavPath = join(tmpDir, `pcm-${randomUUID()}.wav`);
    const meta = { name: `adts-then-pcm-0:a:${idx}` } as const;
    try {
      await ffmpegRun(ffmpegBin, [
        ...robustPrefix(),
        "-map",
        `0:a:${idx}`,
        "-vn",
        "-c:a",
        "copy",
        "-f",
        "adts",
        aacPath,
      ]);
      await ffmpegRun(ffmpegBin, [
        "-hide_banner",
        "-loglevel",
        "error",
        "-nostdin",
        "-y",
        "-fflags",
        "+discardcorrupt",
        "-err_detect",
        "ignore_err",
        "-i",
        aacPath,
        "-ac",
        "1",
        "-ar",
        "16000",
        "-acodec",
        "pcm_s16le",
        "-f",
        "wav",
        wavPath,
      ]);
      await rm(aacPath, { force: true }).catch(() => {});
      const buf = await finishIfValidWav(wavPath, meta);
      if (buf) return { wavBuf: buf, trace };
    } catch (ex) {
      await rm(aacPath, { force: true }).catch(() => {});
      await rm(wavPath, { force: true }).catch(() => {});
      pushFail({ ...meta, ok: false }, ex);
    }
  }

  return { wavBuf: Buffer.alloc(0), trace };
}

@Injectable()
export class VideoCaptionsService {
  private readonly logger = new Logger(VideoCaptionsService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly videoTranscriptTags: VideoTranscriptTagsService,
    private readonly deepSeekService: DeepSeekService,
    @Optional()
    private readonly subtitleIngestionService?: SubtitleIngestionService,
  ) {
    this.bucket = this.configService.getOrThrow<string>("AWS_S3_BUCKET_NAME");
    this.region =
      this.configService.get<string>("AWS_S3_REGION") ??
      this.configService.getOrThrow<string>("AWS_REGION");
    this.s3Client = new S3Client({ region: this.region });
  }

  /**
   * Download MP4 from `videoLink`, FFmpeg → 16 kHz mono PCM WAV, Deepgram Listen → WebVTT → S3.
   */
  async generateCaptions(contentVideoId: number) {
    const apiKey = this.configService.get<string>("DEEPGRAM_API_KEY");
    if (!apiKey?.trim()) {
      this.logger.warn(
        "DEEPGRAM_API_KEY is not set; skipping WebVTT caption generation",
      );
      return null;
    }

    const video = await this.prisma.contentVideo.findUnique({
      where: { id: contentVideoId },
    });
    if (!video) {
      throw new NotFoundException(
        `ContentVideo with ID ${contentVideoId} not found`,
      );
    }

    return this.transcribeUploadAndSave(
      contentVideoId,
      video.videoLink,
      apiKey.trim(),
    );
  }

  private async transcribeUploadAndSave(
    contentVideoId: number,
    videoUrl: string,
    apiKey: string,
  ) {
    const dgModel = deepgramTranscribeModel(this.configService);

    const params = new URLSearchParams({
      model: dgModel,
      smart_format: "true",
      utterances: "true",
      punctuate: "true",
    });

    const isM3u8 = videoUrl.toLowerCase().includes(".m3u8");
    const ffmpegBin = ffmpegBinaryPath();
    const tmpDir = await mkdtemp(join(tmpdir(), "exply-caption-"));
    let wavBuf: Buffer;

    try {
      if (isM3u8) {
        const localTsPath = await downloadHlsToLocalTemp(videoUrl, tmpDir);
        const { wavBuf: extracted, trace } = await extractMp4AudioToPcmWav({
          ffmpegBin,
          mp4Path: localTsPath,
          tmpDir,
        });
        wavBuf = extracted;

        if (wavBuf.length < MIN_WAV_BYTES) {
          const hint = process.env.FFMPEG_PATH?.trim()
            ? ""
            : " Try setting FFMPEG_PATH to a newer ffmpeg build.";
          const tail = trace
            .slice(-4)
            .map((t) => `${t.name}${t.err ? `: ${t.err.slice(0, 120)}` : ""}`)
            .join(" | ");
          throw new Error(`FFmpeg HLS audio extract failed.${hint} ${tail}`);
        }
      } else {
        const maxBytes = deepgramCaptionMaxVideoBytes();
        const videoUp = await fetch(videoUrl, {
          signal: AbortSignal.timeout(600_000),
        });
        if (!videoUp.ok) {
          throw new Error(
            `Failed to download video for Deepgram: HTTP ${videoUp.status}`,
          );
        }
        const reportedCl = videoUp.headers.get("content-length");
        if (reportedCl != null && Number(reportedCl) > maxBytes) {
          throw new Error(
            `Video Content-Length ${reportedCl} exceeds max ${maxBytes} bytes`,
          );
        }
        const videoBuf = Buffer.from(await videoUp.arrayBuffer());
        if (videoBuf.length > maxBytes) {
          throw new Error(
            `Video size ${videoBuf.length} exceeds max ${maxBytes} bytes`,
          );
        }

        const mp4Path = join(tmpDir, `source-${randomUUID()}.mp4`);
        await writeFile(mp4Path, videoBuf);

        const { wavBuf: extracted, trace } = await extractMp4AudioToPcmWav({
          ffmpegBin,
          mp4Path,
          tmpDir,
        });
        wavBuf = extracted;

        if (wavBuf.length < MIN_WAV_BYTES) {
          const hint = process.env.FFMPEG_PATH?.trim()
            ? ""
            : " Try setting FFMPEG_PATH to a newer ffmpeg build.";
          const tail = trace
            .slice(-4)
            .map((t) => `${t.name}${t.err ? `: ${t.err.slice(0, 120)}` : ""}`)
            .join(" | ");
          throw new Error(
            `FFmpeg audio extract failed after ${trace.length} attempts.${hint} ${tail}`,
          );
        }
      }
    } finally {
      await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }

    const dgRes = await fetch(`${DEEPGRAM_LISTEN}?${params.toString()}`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "audio/wav",
      },
      body: new Uint8Array(wavBuf),
    });

    const dgText = await dgRes.text();
    if (!dgRes.ok) {
      throw new Error(
        `Deepgram error ${dgRes.status}: ${dgText.slice(0, 500)}`,
      );
    }

    let dgJson: unknown;
    try {
      dgJson = JSON.parse(dgText) as unknown;
    } catch {
      throw new Error("Deepgram returned non-JSON body");
    }

    const vtt = webvtt(dgJson);
    if (!vtt?.trim()) {
      throw new Error("WebVTT generation produced empty output");
    }

    const existing = await this.prisma.videoCaptions.findUnique({
      where: { contentVideoId },
    });
    if (existing?.subtitlesFileLink) {
      await this.deleteS3ObjectByPublicUrl(existing.subtitlesFileLink);
    }

    const key = `uploads/captions/${randomUUID()}.vtt`;
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: Buffer.from(vtt, "utf8"),
        ContentType: "text/vtt; charset=utf-8",
      }),
    );

    const subtitlesFileLink = publicS3ObjectUrl(this.bucket, this.region, key);

    const row = await this.prisma.videoCaptions.upsert({
      where: { contentVideoId },
      create: {
        contentVideoId,
        subtitlesFileLink,
      },
      update: {
        subtitlesFileLink,
      },
    });

    try {
      await this.videoTranscriptTags.generateAndAppendTagsForContentVideo(
        contentVideoId,
      );
    } catch (e) {
      this.logger.warn(
        `Tag generation from captions failed for ContentVideo ${contentVideoId}: ${String(
          e,
        )}`,
      );
    }

    void this.trigger_segment_ingestion(contentVideoId);

    return row;
  }

  private trigger_segment_ingestion(contentVideoId: number): void {
    if (!this.subtitleIngestionService) {
      return;
    }
    void this.subtitleIngestionService
      .ingest_for_video(contentVideoId)
      .catch((error) => {
        this.logger.warn(
          `Segment ingestion failed for ContentVideo ${contentVideoId}: ${String(error)}`,
        );
      });
  }

  async syncUkrainianSubtitles(contentVideoId: number): Promise<void> {
    const video = await this.prisma.contentVideo.findUnique({
      where: { id: contentVideoId },
      include: {
        content: { include: { stats: true, category: true } },
        videoCaption: true,
      },
    });

    if (!video || !video.videoCaption) return;

    const isGlobal = video.content.category.ownerUserId === null;
    if (!isGlobal) return;

    const systemTags = video.content.stats?.systemTags || [];
    const needsUk = systemTags.some((tag) =>
      ["A1", "A2", "B1"].includes(tag.toUpperCase()),
    );

    if (needsUk) {
      if (video.videoCaption.subtitlesUkLink) return;

      await this.generateUkrainianSubtitlesManual(contentVideoId);
    } else {
      if (video.videoCaption.subtitlesUkLink) {
        await this.deleteS3ObjectByPublicUrl(
          video.videoCaption.subtitlesUkLink,
        );
        await this.prisma.videoCaptions.update({
          where: { id: video.videoCaption.id },
          data: { subtitlesUkLink: null },
        });
      }
    }
  }

  async generateUkrainianSubtitlesManual(
    contentVideoId: number,
  ): Promise<void> {
    const video = await this.prisma.contentVideo.findUnique({
      where: { id: contentVideoId },
      include: { videoCaption: true },
    });

    if (!video || !video.videoCaption?.subtitlesFileLink) {
      throw new BadRequestException("English captions must exist first");
    }

    const enVttRes = await fetch(video.videoCaption.subtitlesFileLink);
    if (!enVttRes.ok || !enVttRes.body)
      throw new Error("Failed to fetch EN VTT from S3");

    const rl = readline.createInterface({
      input: Readable.fromWeb(enVttRes.body as any),
      crlfDelay: Infinity,
    });

    const tmpVttPath = join(tmpdir(), `uk-captions-${randomUUID()}.vtt`);
    const writeStream = createWriteStream(tmpVttPath, {
      flags: "w",
      encoding: "utf8",
    });
    writeStream.write("WEBVTT\n\n");

    const BATCH_SIZE = 30;
    const chunks: import("src/common/utils/vtt.utils").VttBlock[][] = [];

    let currentBlocks: import("src/common/utils/vtt.utils").VttBlock[] = [];
    let currentStart = "",
      currentEnd = "";
    let currentTextLines: string[] = [];
    let inBlock = false;

    for await (const line of rl) {
      const trimmed = line.trim();
      if (trimmed.includes("-->")) {
        if (inBlock) {
          currentBlocks.push({
            start: currentStart,
            end: currentEnd,
            text: currentTextLines.join(" "),
          });
        }
        const [s, e] = trimmed.split(/\s*-->\s*/);
        currentStart = s;
        currentEnd = e;
        currentTextLines = [];
        inBlock = true;
      } else if (trimmed === "") {
        if (inBlock) {
          currentBlocks.push({
            start: currentStart,
            end: currentEnd,
            text: currentTextLines.join(" "),
          });
          inBlock = false;
          if (currentBlocks.length === BATCH_SIZE) {
            chunks.push(currentBlocks);
            currentBlocks = [];
          }
        }
      } else if (inBlock) {
        currentTextLines.push(trimmed);
      }
    }
    if (inBlock) {
      currentBlocks.push({
        start: currentStart,
        end: currentEnd,
        text: currentTextLines.join(" "),
      });
    }
    if (currentBlocks.length > 0) chunks.push(currentBlocks);

    let nextToWrite = 0;
    const pendingWrites = new Map<number, string>();
    const executing = new Set<Promise<void>>();

    const processChunk = async (
      chunk: import("src/common/utils/vtt.utils").VttBlock[],
      index: number,
    ) => {
      const texts = chunk.map((c) => c.text);
      const translated =
        await this.deepSeekService.translateBatchWithRetry(texts);
      const chunkVtt = buildVttChunk(chunk, translated);

      pendingWrites.set(index, chunkVtt);
      while (pendingWrites.has(nextToWrite)) {
        writeStream.write(pendingWrites.get(nextToWrite)!);
        pendingWrites.delete(nextToWrite);
        nextToWrite++;
      }
    };

    for (let i = 0; i < chunks.length; i++) {
      const p = processChunk(chunks[i], i);
      executing.add(p);
      p.finally(() => executing.delete(p));
      if (executing.size >= 5) {
        await Promise.race(executing);
      }
    }
    await Promise.all(executing);

    writeStream.end();
    await new Promise((resolve) => writeStream.on("finish", resolve));

    try {
      const fileStats = await stat(tmpVttPath);
      if (fileStats.size < 20)
        throw new Error("Generated file is abnormally small");

      const fd = await open(tmpVttPath, "r");
      try {
        const headerBuffer = Buffer.alloc(6);
        await fd.read(headerBuffer, 0, 6, 0);
        if (headerBuffer.toString("utf8") !== "WEBVTT") {
          throw new Error("Integrity check failed: VTT header missing");
        }
      } finally {
        await fd.close();
      }

      const ukKey = `uploads/captions/${randomUUID()}-uk.vtt`;
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: ukKey,
          Body: createReadStream(tmpVttPath),
          ContentType: "text/vtt; charset=utf-8",
        }),
      );

      const subtitlesUkLink = publicS3ObjectUrl(
        this.bucket,
        this.region,
        ukKey,
      );

      if (video.videoCaption.subtitlesUkLink) {
        await this.deleteS3ObjectByPublicUrl(
          video.videoCaption.subtitlesUkLink,
        );
      }

      await this.prisma.videoCaptions.update({
        where: { contentVideoId },
        data: { subtitlesUkLink },
      });
    } finally {
      await rm(tmpVttPath, { force: true });
    }
  }

  /** Load WebVTT text from S3 URL stored on `VideoCaptions` (same-origin admin proxy). */
  async fetchStoredSubtitlesVtt(
    contentVideoId: number,
    lang?: string,
  ): Promise<string> {
    const row = await this.prisma.videoCaptions.findUnique({
      where: { contentVideoId },
      select: { subtitlesFileLink: true, subtitlesUkLink: true },
    });

    const url =
      lang === "uk"
        ? row?.subtitlesUkLink?.trim()
        : row?.subtitlesFileLink?.trim();

    if (!url) {
      throw new NotFoundException(
        `No ${lang === "uk" ? "Ukrainian" : "English"} captions for ContentVideo ${contentVideoId}`,
      );
    }

    const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
    if (!res.ok) {
      throw new BadGatewayException(
        `Subtitles URL returned HTTP ${res.status}`,
      );
    }
    return res.text();
  }

  private async deleteS3ObjectByPublicUrl(url: string): Promise<void> {
    try {
      const u = new URL(url);
      const key = u.pathname.replace(/^\//, "");
      if (!key) return;
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: decodeURIComponent(key),
        }),
      );
    } catch (e) {
      this.logger.warn(
        `Failed to delete old caption object from S3: ${String(e)}`,
      );
    }
  }
}
