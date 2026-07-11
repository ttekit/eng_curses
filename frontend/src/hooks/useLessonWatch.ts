import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import { useUser } from "../context/UserContext";
import { useAppMessages } from "./useAppMessages";
import { apiFetch } from "../lib/api";
import { nativeLanguageToIso639_1 } from "../lib/nativeLanguageCode";
import { resolveVideoAgeAccess } from "../lib/ageEligibility";
import { formatMessage } from "../lib/formatMessage";
import { parseSeriesPlaylistPayload } from "../lib/catalogPlaylist";
import { parseWebVttTranscriptLines } from "../lib/parseWebVtt";
import {
  defaultQuizQuestions,
  defaultVocabulary,
  type QuizQuestion,
  type TranscriptLine,
  type VocabularyItem,
} from "../components/content-watch/defaultLessonSides";
import type { VideoQuizCompleteSummary } from "../components/content-watch/VideoQuiz";

import {
  type TabId,
  type LessonSideBundle,
  normalizeLessonVocabulary,
  rawKeyVocabularyFromTestsPayload,
  mapApiTestsToQuiz,
  splitLongTranscriptLines,
  buildVocabularyFromTranscript,
  extractQuizKeyVocabTerms,
  applyVocabularyHints,
  extractQuizKeyVocabDetails,
  extractOpenWrittenAnswer,
  readOpenEndedFeedbackFromSubmit,
  readWrittenSummaryScoreFromSubmit,
} from "../lib/lesson-utils";
import { LessonSummaryState } from "../pages/content/LessonSummaryPage";

export const LESSON_XP = 150;
export const LESSON_SUMMARY_STORAGE = "lessonSummary:";
export const WATCHED_COMPLETED_RATIO = 0.75;

export function useLessonWatch(id: string | undefined) {
  const navigate = useNavigate();
  const { user, refreshProfile } = useUser();
  const L = useAppMessages().lesson;

  const [activeTab, setActiveTab] = useState<TabId>("vocabulary");
  const [isVideoComplete, setIsVideoComplete] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [playlistRibbon, setPlaylistRibbon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lessonSideBundle, setLessonSideBundle] = useState<{
    vocabulary: VocabularyItem[];
    quizQuestions: QuizQuestion[];
    gradingToken: string | null;
  } | null>(null);
  const [sideBundleLoading, setSideBundleLoading] = useState(false);
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [playbackSec, setPlaybackSec] = useState(0);
  const [vocabularyHintMap, setVocabularyHintMap] = useState<
    Record<string, any>
  >({});
  const [ageModalOpen, setAgeModalOpen] = useState(false);

  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const progressedToWatchedRef = useRef(false);
  const watchCompletePostedRef = useRef(false);
  const playbackStartedForPersonalizeRef = useRef(false);
  const vocabPersonalizeDoneRef = useRef(false);
  const displayVocabularyRef = useRef<VocabularyItem[]>([]);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const ageAccess = useMemo(
    () => resolveVideoAgeAccess(user, videoData?.ageRestriction ?? undefined),
    [user, videoData?.ageRestriction],
  );
  const isLocked = ageAccess !== "allowed";
  const needsDob = ageAccess === "needs_dob";

  const onVideoMount = useCallback((el: HTMLVideoElement | null) => {
    videoElRef.current = el;
  }, []);

  const seekToCue = useCallback((seconds: number) => {
    const el = videoElRef.current;
    if (!el || !Number.isFinite(seconds)) return;
    try {
      el.currentTime = Math.max(0, seconds);
    } catch { }
  }, []);

  const postWatchCompleteOnce = useCallback(async () => {
    if (watchCompletePostedRef.current || !id || isLocked) return;
    const vid = videoData?.id;
    if (!vid) return;

    watchCompletePostedRef.current = true;
    try {
      await apiFetch(`/content-video/${vid}/watch-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secondsWatched: 0, completed: true }),
      });
    } catch (error) {
      watchCompletePostedRef.current = false;
    }
  }, [id, isLocked, videoData?.id]);

  const ensureLessonWatched = useCallback(() => {
    if (progressedToWatchedRef.current) return;
    progressedToWatchedRef.current = true;
    setIsVideoComplete(true);
    void postWatchCompleteOnce();
  }, [postWatchCompleteOnce]);

  const handlePlaybackFraction = useCallback(
    (fraction: number) => {
      if (fraction >= WATCHED_COMPLETED_RATIO) ensureLessonWatched();
    },
    [ensureLessonWatched],
  );

  const handleVideoEnded = useCallback(() => {
    ensureLessonWatched();
  }, [ensureLessonWatched]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setVideoData(null);
        const response = await apiFetch(`/content-video/${id}`, {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          setVideoData(data);
          if (data?.friendlyLink && id !== data.friendlyLink) {
            navigate(`/content/${data.friendlyLink}`, { replace: true });
          }
        }
      } catch (error) {
        setVideoData(null);
      } finally {
        setLoading(false);
      }
    };
    void fetchVideo();
  }, [id, navigate]);

  useEffect(() => {
    if (!videoData || !id) {
      setPlaylistRibbon(null);
      return;
    }
    const fl = videoData.content.category.friendlyLink?.trim();
    if (!fl) {
      setPlaylistRibbon(null);
      return;
    }
    const vid = videoData.id;
    if (!Number.isFinite(vid) || vid <= 0) {
      setPlaylistRibbon(null);
      return;
    }
    let cancelled = false;
    void apiFetch(`/contents/series/${encodeURIComponent(fl)}`, {
      method: "GET",
    })
      .then(async (r) => {
        if (!r.ok || cancelled) return;
        const parsed = parseSeriesPlaylistPayload(await r.json());
        if (!parsed || cancelled) return;
        const idx = parsed.episodes.findIndex((e) => e.contentVideoId === vid);
        if (idx < 0) {
          if (!cancelled) setPlaylistRibbon(null);
          return;
        }
        const prevEp = idx > 0 ? parsed.episodes[idx - 1] : undefined;
        const nextEp =
          idx < parsed.episodes.length - 1
            ? parsed.episodes[idx + 1]
            : undefined;
        if (!cancelled) {
          setPlaylistRibbon({
            prevVideoId: prevEp ? ((prevEp as any).friendlyLink || prevEp.contentVideoId) : null,
            nextVideoId: nextEp ? ((nextEp as any).friendlyLink || nextEp.contentVideoId) : null,
            position: idx + 1,
            total: parsed.episodes.length,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setPlaylistRibbon(null);
      });
    return () => {
      cancelled = true;
    };
  }, [videoData, id]);

  useEffect(() => {
    if (!id || !videoData || isLocked) return;
    const vid = videoData.id;
    let cancelled = false;
    setSideBundleLoading(true);
    const qs =
      user?.id != null ? `?userId=${encodeURIComponent(String(user.id))}` : "";
    void apiFetch(`/content-video/${vid}/tests${qs}`)
      .then(async (r) => {
        if (cancelled) return;
        if (!r.ok) {
          setLessonSideBundle(null);
          return;
        }
        const body = (await r.json()) as Record<string, unknown>;
        const vocabulary = normalizeLessonVocabulary(
          rawKeyVocabularyFromTestsPayload(body),
        );
        const quizQuestions =
          Array.isArray(body.tests) && body.tests.length > 0
            ? mapApiTestsToQuiz(
              body.tests as NonNullable<LessonSideBundle["tests"]>,
            )
            : defaultQuizQuestions;
        const gradingToken =
          typeof body.gradingToken === "string" && body.gradingToken.length > 0
            ? body.gradingToken
            : null;
        setLessonSideBundle({ vocabulary, quizQuestions, gradingToken });
      })
      .catch(() => {
        if (!cancelled) setLessonSideBundle(null);
      })
      .finally(() => {
        if (!cancelled) setSideBundleLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, videoData, user?.id, isLocked]);

  useEffect(() => {
    if (!id || !videoData || isLocked) return;
    const vid = videoData.id;
    let cancelled = false;
    setTranscriptLoading(true);
    setTranscriptLines([]);
    void apiFetch(`/content-video/${vid}/captions`)
      .then(async (r) => {
        if (cancelled) return;
        if (!r.ok) {
          setTranscriptLines([]);
          return;
        }
        setTranscriptLines(
          splitLongTranscriptLines(
            parseWebVttTranscriptLines(await r.text()),
            80,
          ),
        );
      })
      .catch(() => {
        if (!cancelled) setTranscriptLines([]);
      })
      .finally(() => {
        if (!cancelled) setTranscriptLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, videoData, isLocked]);

  useEffect(() => {
    setIsVideoComplete(false);
    setActiveTab("vocabulary");
    setLessonSideBundle(null);
    setTranscriptLines([]);
    setPlaybackSec(0);
    setTranscriptLoading(false);
    setVocabularyHintMap({});
    progressedToWatchedRef.current = false;
    watchCompletePostedRef.current = false;
    playbackStartedForPersonalizeRef.current = false;
    vocabPersonalizeDoneRef.current = false;
    setPlaylistRibbon(null);
  }, [id]);

  useEffect(() => {
    if (heartbeatIntervalRef.current)
      clearInterval(heartbeatIntervalRef.current);
    if (isLocked || !videoData?.id) return;
    heartbeatIntervalRef.current = setInterval(async () => {
      if (document.hidden || !videoElRef.current || videoElRef.current.paused)
        return;
      try {
        await apiFetch(`/content-video/${videoData.id}/watch-complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secondsWatched: 20 }),
        });
      } catch (err) { }
    }, 20000);
    return () => {
      if (heartbeatIntervalRef.current)
        clearInterval(heartbeatIntervalRef.current);
    };
  }, [id, isLocked, videoData?.id]);

  const displayVocabulary = useMemo((): VocabularyItem[] => {
    if (lessonSideBundle?.vocabulary && lessonSideBundle.vocabulary.length > 0)
      return lessonSideBundle.vocabulary;
    const fromTranscript = buildVocabularyFromTranscript(transcriptLines);
    if (fromTranscript.length > 0) return fromTranscript;
    return defaultVocabulary;
  }, [lessonSideBundle?.vocabulary, transcriptLines]);

  useEffect(() => {
    displayVocabularyRef.current = displayVocabulary;
  }, [displayVocabulary]);

  const tryPersonalizeVocabulary = useCallback(async () => {
    if (
      user?.id == null ||
      !id ||
      isLocked ||
      vocabPersonalizeDoneRef.current ||
      sideBundleLoading
    )
      return;
    const vid = videoData.id;
    const words = displayVocabularyRef.current
      .map((v) => v.word.trim())
      .filter((w) => w.length >= 2);
    if (words.length === 0) return;
    vocabPersonalizeDoneRef.current = true;
    try {
      const r = await apiFetch(`/content-video/${vid}/vocabulary-personalize`, {
        method: "POST",
        body: JSON.stringify({ words }),
      });
      if (r.ok) {
        const data = await r.json();
        setVocabularyHintMap((prev) => ({ ...prev, ...(data.hints ?? {}) }));
      } else {
        vocabPersonalizeDoneRef.current = false;
      }
    } catch {
      vocabPersonalizeDoneRef.current = false;
    }
  }, [user?.id, id, sideBundleLoading, isLocked, videoData?.id]);

  const handleVideoPlay = useCallback(() => {
    playbackStartedForPersonalizeRef.current = true;
    void tryPersonalizeVocabulary();
  }, [tryPersonalizeVocabulary]);

  useEffect(() => {
    if (!playbackStartedForPersonalizeRef.current) return;
    void tryPersonalizeVocabulary();
  }, [sideBundleLoading, tryPersonalizeVocabulary]);

  useEffect(() => {
    if (user?.id == null || isLocked) return;
    if (displayVocabulary.length === 0) {
      setVocabularyHintMap({});
      return;
    }
    let cancelled = false;
    const target = nativeLanguageToIso639_1(user?.nativeLanguage);
    void apiFetch(`/content-video/vocabulary-hints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        words: displayVocabulary.map((v) => v.word),
        targetLang: target ?? null,
      }),
    })
      .then(async (r) => {
        if (cancelled || !r.ok) return;
        const data = await r.json();
        if (!cancelled) setVocabularyHintMap(data.hints ?? {});
      })
      .catch(() => {
        if (!cancelled) setVocabularyHintMap({});
      });
    return () => {
      cancelled = true;
    };
  }, [displayVocabulary, user?.id, user?.nativeLanguage, isLocked]);

  const enrichedDisplayVocabulary = useMemo(
    () => applyVocabularyHints(displayVocabulary, vocabularyHintMap),
    [displayVocabulary, vocabularyHintMap],
  );

  const lessonSideBundleRef = useRef(lessonSideBundle);
  const sideBundleLoadingRef = useRef(sideBundleLoading);
  useEffect(() => {
    lessonSideBundleRef.current = lessonSideBundle;
  }, [lessonSideBundle]);
  useEffect(() => {
    sideBundleLoadingRef.current = sideBundleLoading;
  }, [sideBundleLoading]);

  const waitForLessonSideBundleWithToken = useCallback(
    async (timeoutMs = 25000) => {
      const ready = (b: typeof lessonSideBundle) =>
        Boolean(
          b?.gradingToken &&
          Array.isArray(b.quizQuestions) &&
          b.quizQuestions.length > 0,
        );
      if (ready(lessonSideBundleRef.current))
        return lessonSideBundleRef.current;
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 50));
        const b = lessonSideBundleRef.current;
        if (ready(b)) return b;
        if (!sideBundleLoadingRef.current && !ready(b)) break;
      }
      return lessonSideBundleRef.current;
    },
    [],
  );

  const handleQuizComplete = useCallback(
    async (summary: VideoQuizCompleteSummary) => {
      if (!id || !videoData || isLocked) return;
      const vid = videoData?.id;
      let correctCount = summary.correctCount;
      let totalQuestions = summary.totalQuestions;
      const readyBundle = (b: typeof lessonSideBundle) =>
        Boolean(
          b?.gradingToken &&
          Array.isArray(b.quizQuestions) &&
          b.quizQuestions.length > 0,
        );
      let bundle = readyBundle(lessonSideBundle) ? lessonSideBundle : null;
      if (!readyBundle(bundle) && Number.isFinite(vid) && vid > 0)
        bundle = await waitForLessonSideBundleWithToken();

      const questions = readyBundle(bundle)
        ? bundle!.quizQuestions
        : defaultQuizQuestions;
      const writtenSummaryText = extractOpenWrittenAnswer(
        summary.answersById,
        questions,
      );
      let writtenSummaryFeedback: string | null | undefined = undefined;
      let writtenSummaryScore: number | null | undefined = undefined;

      if (Number.isFinite(vid) && vid > 0 && readyBundle(bundle)) {
        try {
          const keyVocabularyTerms = extractQuizKeyVocabTerms(
            bundle!.vocabulary,
          );
          const keyVocabularyDetails = extractQuizKeyVocabDetails(
            bundle!.vocabulary,
            enrichedDisplayVocabulary,
          );
          const r = await apiFetch(`/content-video/${vid}/tests/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: bundle!.gradingToken,
              answers: summary.answersById,
              keyVocabularyTerms,
              keyVocabularyDetails,
            }),
          });
          if (r.ok) {
            await refreshProfile().catch(() => { });
            const d = await r.json();
            const fb = readOpenEndedFeedbackFromSubmit(d);
            if (fb !== undefined) writtenSummaryFeedback = fb;
            else if (writtenSummaryText?.trim())
              writtenSummaryFeedback = L.coachCommentFallback;
            const sc = readWrittenSummaryScoreFromSubmit(d);
            if (sc !== undefined) writtenSummaryScore = sc;
            if (d && typeof d === "object" && !Array.isArray(d)) {
              const o = d as any;
              if (
                typeof o.correct === "number" &&
                typeof o.total === "number"
              ) {
                correctCount = o.correct;
                totalQuestions = o.total;
              }
            }
          } else if (writtenSummaryText?.trim())
            writtenSummaryFeedback = L.gradingFailed;
        } catch {
          if (writtenSummaryText?.trim())
            writtenSummaryFeedback = L.gradingUnreachable;
        }
      } else if (writtenSummaryText) writtenSummaryFeedback = L.quizNotReady;

      const stats = videoData.content.stats;
      const payload: LessonSummaryState = {
        correctCount,
        totalQuestions,
        xpEarned: writtenSummaryText?.trim() ? 150 : 100,
        videoName: videoData.videoName,
        categoryName: videoData.content.category.name,
        videoDescription: videoData.videoDescription,
        learnedWords: enrichedDisplayVocabulary
          .map((v) => ({ word: v.word, definition: v.meaning }))
          .slice(0, 12),
        lessonTopics: Array.isArray(stats?.topics)
          ? stats!.topics!.map((t: any) => ({ id: t.id, name: t.name }))
          : [],
        themeTags: Array.isArray(stats?.userTags) ? stats!.userTags! : [],
        levelTags: Array.isArray(stats?.systemTags) ? stats!.systemTags! : [],
        quizReview:
          summary.wrongReview.length > 0
            ? { wrong: summary.wrongReview }
            : undefined,
        writtenSummaryText,
        writtenSummaryFeedback,
        writtenSummaryScore,
      };
      try {
        sessionStorage.setItem(
          `${LESSON_SUMMARY_STORAGE}${id}`,
          JSON.stringify(payload),
        );
      } catch { }
      void navigate(`/content/${id}/summary`, { state: payload });
    },
    [
      id,
      videoData,
      navigate,
      lessonSideBundle,
      enrichedDisplayVocabulary,
      waitForLessonSideBundleWithToken,
      refreshProfile,
      L,
      isLocked,
    ],
  );

  const headerRight = isVideoComplete
    ? L.quizUnlocked
    : formatMessage(L.xpAvailable, { xp: String(LESSON_XP) });
  const quizWaitingForServer =
    isVideoComplete &&
    sideBundleLoading &&
    (!lessonSideBundle?.gradingToken ||
      (lessonSideBundle.quizQuestions?.length ?? 0) === 0);
  const quizServerFailed =
    isVideoComplete &&
    !sideBundleLoading &&
    (!lessonSideBundle?.gradingToken ||
      (lessonSideBundle.quizQuestions?.length ?? 0) === 0);

  return {
    L,
    user,
    navigate,
    activeTab,
    setActiveTab,
    isVideoComplete,
    videoData,
    playlistRibbon,
    loading,
    lessonSideBundle,
    sideBundleLoading,
    transcriptLines,
    transcriptLoading,
    playbackSec,
    setPlaybackSec,
    enrichedDisplayVocabulary,
    ageModalOpen,
    setAgeModalOpen,
    isLocked,
    needsDob,
    seekToCue,
    handlePlaybackFraction,
    handleVideoEnded,
    handleVideoPlay,
    handleQuizComplete,
    onVideoMount,
    headerRight,
    quizWaitingForServer,
    quizServerFailed,
  };
}