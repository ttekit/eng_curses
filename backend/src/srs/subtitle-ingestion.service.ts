import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { detect_subtitle_format, parse_srt_to_seconds } from "./srt-parser.util";
import { merge_subtitle_cues_for_feed } from "./merge-subtitle-cues.util";
import { parse_vtt_to_seconds } from "./subtitle-time.util";
import {
  infer_difficulty_from_phrase,
  tokenize_phrase,
} from "./tokenize-phrase.util";
import { update_segment_recommendation_fields } from "src/recommendation-engine/segment-vector.util";

export type IngestionResult = {
  contentVideoId: number;
  segmentsCreated: number;
  lemmasLinked: number;
};

@Injectable()
export class SubtitleIngestionService {
  private readonly logger = new Logger(SubtitleIngestionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async ingest_for_video(contentVideoId: number): Promise<IngestionResult> {
    const video = await this.prisma.contentVideo.findUnique({
      where: { id: contentVideoId },
      include: {
        videoCaption: true,
        content: { include: { stats: true } },
      },
    });
    if (!video) {
      throw new NotFoundException(`ContentVideo ${contentVideoId} not found`);
    }
    const captionUrl = video.videoCaption?.subtitlesFileLink?.trim();
    if (!captionUrl) {
      throw new BadRequestException(
        `ContentVideo ${contentVideoId} has no captions`,
      );
    }
    const response = await fetch(captionUrl);
    if (!response.ok) {
      throw new BadRequestException(
        `Failed to fetch captions for ContentVideo ${contentVideoId}`,
      );
    }
    const raw = await response.text();
    const format = detect_subtitle_format(raw, captionUrl);
    const cues =
      format === "srt" ? parse_srt_to_seconds(raw) : parse_vtt_to_seconds(raw);
    if (cues.length === 0) {
      throw new BadRequestException(
        `No subtitle cues parsed for ContentVideo ${contentVideoId}`,
      );
    }
    const feedCues = merge_subtitle_cues_for_feed(cues);
    if (feedCues.length === 0) {
      throw new BadRequestException(
        `No feed-eligible segments for ContentVideo ${contentVideoId}`,
      );
    }
    await this.prisma.videoSegment.deleteMany({
      where: { contentVideoId },
    });
    const defaultLevel =
      video.content.stats?.systemTags?.[0] ??
      infer_difficulty_from_phrase(feedCues[0]?.text ?? "");
    let lemmasLinked = 0;
    for (let cueIndex = 0; cueIndex < feedCues.length; cueIndex += 1) {
      const cue = feedCues[cueIndex]!;
      const difficultyLevel =
        video.content.stats?.systemTags?.[0] ??
        infer_difficulty_from_phrase(cue.text);
      const segment = await this.prisma.videoSegment.create({
        data: {
          contentVideoId,
          startTimeSec: cue.startSec,
          endTimeSec: cue.endSec,
          fullPhrase: cue.text,
          difficultyLevel: difficultyLevel || defaultLevel,
          cueIndex,
        },
      });
      const tokens = tokenize_phrase(cue.text);
      const learnableTokens = tokens.filter((token) => !token.isProperNoun);
      for (const token of learnableTokens) {
        const lemma = await this.prisma.lemma.upsert({
          where: {
            word_baseLanguage: { word: token.word, baseLanguage: "en" },
          },
          create: { word: token.word, baseLanguage: "en" },
          update: {},
        });
        await this.prisma.segmentLemma.create({
          data: {
            segmentId: segment.id,
            lemmaId: lemma.id,
            position: token.position,
          },
        });
        lemmasLinked += 1;
      }
      const words = learnableTokens.map((token) => token.word);
      await update_segment_recommendation_fields(this.prisma, segment.id, {
        fullPhrase: cue.text,
        difficultyLevel: difficultyLevel || defaultLevel,
        words,
      });
    }
    this.logger.log(
      `Ingested ${feedCues.length} feed segments (${cues.length} cues) for ContentVideo ${contentVideoId}`,
    );
    return {
      contentVideoId,
      segmentsCreated: feedCues.length,
      lemmasLinked,
    };
  }

  async ingest_all_with_captions(): Promise<{
    processed: number;
    failed: number;
    segmentsCreated: number;
  }> {
    const videos = await this.prisma.contentVideo.findMany({
      where: { videoCaption: { isNot: null } },
      select: { id: true },
    });
    let processed = 0;
    let failed = 0;
    let segmentsCreated = 0;
    for (const video of videos) {
      try {
        const result = await this.ingest_for_video(video.id);
        processed += 1;
        segmentsCreated += result.segmentsCreated;
      } catch (error) {
        failed += 1;
        this.logger.warn(
          `Ingestion failed for ContentVideo ${video.id}: ${String(error)}`,
        );
      }
    }
    return { processed, failed, segmentsCreated };
  }

  async ingest_all_missing(): Promise<{ processed: number; failed: number }> {
    const videos = await this.prisma.contentVideo.findMany({
      where: { videoCaption: { isNot: null } },
      select: { id: true, _count: { select: { videoSegments: true } } },
    });
    let processed = 0;
    let failed = 0;
    for (const video of videos) {
      if (video._count.videoSegments > 0) {
        continue;
      }
      try {
        await this.ingest_for_video(video.id);
        processed += 1;
      } catch (error) {
        failed += 1;
        this.logger.warn(
          `Ingestion failed for ContentVideo ${video.id}: ${String(error)}`,
        );
      }
    }
    return { processed, failed };
  }
}
