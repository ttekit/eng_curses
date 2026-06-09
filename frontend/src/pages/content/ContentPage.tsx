import { Link, useNavigate, useParams } from "react-router";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Lock,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { cn } from "../../lib/utils";
import VideoPlayer from "../../components/VideoPlayer";
import { VideoVocabulary } from "../../components/content-watch/VideoVocabulary";
import { VideoTranscript } from "../../components/content-watch/VideoTranscript";
import { useUser } from "../../context/UserContext";
import { VideoQuiz } from "../../components/content-watch/VideoQuiz";
import type { VideoQuizCompleteSummary } from "../../components/content-watch/VideoQuiz";
import type { LessonSummaryState } from "./LessonSummaryPage";
import {
  defaultQuizQuestions,
  defaultVocabulary,
  type QuizQuestion,
  type TranscriptLine,
  type VocabularyItem,
} from "../../components/content-watch/defaultLessonSides";
import { parseSeriesPlaylistPayload } from "../../lib/catalogPlaylist";
import { parseWebVttTranscriptLines } from "../../lib/parseWebVtt";
import { SEO } from "../../components/SEO/SEO";
import { resolveCanonicalUrl } from "../../lib/siteUrl";
import { useAppMessages } from "../../hooks/useAppMessages";
import { appEn } from "../../locales/app/en";
import { formatMessage } from "../../lib/formatMessage";
import { useIsLgUp } from "../../hooks/useMediaQuery";
import { nativeLanguageToIso639_1 } from "../../lib/nativeLanguageCode";
import { AssignHomeworkButton } from "../../components/AssignHomeworkButton";

const LESSON_XP = 150;
const LESSON_SUMMARY_STORAGE = "lessonSummary:";
const WATCHED_COMPLETED_RATIO = 0.75;

type LessonSideBundle = {
  gradingToken?: string;
  keyVocabulary?: { word?: string; definition?: string; example?: string }[];
  tests?: {
    id?: string;
    question?: string;
    questionType?: string;
    options?: string[];
    correctIndex?: number;
    category?: string;
    explanation?: string;
  }[];
};

function mapApiTestsToQuiz(
  tests: NonNullable<LessonSideBundle["tests"]>,
): QuizQuestion[] {
  return tests.map((t, idx) => {
    const id =
      typeof t.id === "string" && t.id.trim().length > 0
        ? t.id.trim()
        : `t${idx + 1}`;

    const isOpen = t.questionType === "open" || t.category === "open";

    if (isOpen) {
      return {
        id,
        timestamp: "—",
        question: t.question ?? "",
        questionType: "open",
        options: [],
        correct: 0,
        category: "open",
        explanation:
          typeof t.explanation === "string" ? t.explanation : undefined,
      };
    }

    const opts = [...(t.options ?? [])];
    while (opts.length < 4) opts.push("—");
    const options = opts.slice(0, 4);
    let ci =
      typeof t.correctIndex === "number" && Number.isFinite(t.correctIndex)
        ? Math.floor(t.correctIndex)
        : 0;
    ci = Math.max(0, Math.min(options.length - 1, ci));
    const catRaw = t.category;
    const category =
      catRaw === "grammar"
        ? ("grammar" as const)
        : catRaw === "vocabulary"
          ? ("vocabulary" as const)
          : catRaw === "comprehension"
            ? ("comprehension" as const)
            : undefined;

    return {
      id,
      timestamp: "—",
      question: t.question ?? "",
      questionType: "multiple_choice",
      options,
      correct: ci,
      category,
      explanation:
        typeof t.explanation === "string" ? t.explanation : undefined,
    };
  });
}

function rawKeyVocabularyFromTestsPayload(payload: unknown): unknown[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [];
  }
  const o = payload as Record<string, unknown>;
  const nested =
    o.data && typeof o.data === "object" && !Array.isArray(o.data)
      ? (o.data as Record<string, unknown>)
      : null;
  const kv =
    o.keyVocabulary ??
    o.key_vocabulary ??
    nested?.keyVocabulary ??
    nested?.key_vocabulary;
  return Array.isArray(kv) ? kv : [];
}

function normalizeLessonVocabulary(raw: unknown): VocabularyItem[] {
  const rows = Array.isArray(raw) ? raw : [];
  const out: VocabularyItem[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const wordRaw =
      typeof r.word === "string"
        ? r.word
        : typeof r.term === "string"
          ? r.term
          : typeof r.label === "string"
            ? r.label
            : "";
    const word = wordRaw.trim();
    let definition =
      typeof r.definition === "string"
        ? r.definition.trim()
        : typeof r.meaning === "string"
          ? r.meaning.trim()
          : "";
    const translationRaw =
      typeof r.translation === "string" ? r.translation.trim() : "";
    const pronunciationRaw =
      typeof r.pronunciation === "string" ? r.pronunciation.trim() : "";
    if (word.length < 2) continue;
    if (definition.length < 2) {
      definition = `A useful word from this lesson: “${word}”.`;
    }
    out.push({
      word,
      meaning: definition,
      translation: translationRaw.length > 0 ? translationRaw : undefined,
      pronunciation: pronunciationRaw.length > 0 ? pronunciationRaw : undefined,
    });
  }
  return out.slice(0, 16);
}

const TRANSCRIPT_VOCAB_STOP = new Set(
  "the and that this with from your have been were they their what when will would could should about there which more some very just into also than then only over such".split(
    " ",
  ),
);

function buildVocabularyFromTranscript(
  lines: TranscriptLine[],
): VocabularyItem[] {
  const text = lines.map((l) => l.text).join(" ");
  if (text.trim().length < 12) return [];

  const found = new Set<string>();
  const re = /\p{L}[\p{L}\p{M}'-]{1,30}\p{L}|\p{L}{3,32}/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) && found.size < 20) {
    const w = m[0];
    if (w.length < 3 || w.length > 48) continue;
    const low = w.toLowerCase();
    if (low.length <= 5 && TRANSCRIPT_VOCAB_STOP.has(low)) continue;
    found.add(w);
  }

  const words = [...found].slice(0, 10);
  return words.map((word) => ({
    word,
    meaning: "",
  }));
}

function extractQuizKeyVocabTerms(
  vocabulary: VocabularyItem[] | undefined,
): string[] {
  if (!vocabulary?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of vocabulary) {
    const w = v.word?.trim();
    if (!w || w.length < 2 || w.length > 120) continue;
    const key = w.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(w);
    if (out.length >= 50) break;
  }
  return out;
}

function extractQuizKeyVocabDetails(
  vocabulary: VocabularyItem[] | undefined,
  enriched: VocabularyItem[],
): Array<{
  term: string;
  nativeTranslation: string | null;
  learnerDescription: string | null;
}> {
  const terms = extractQuizKeyVocabTerms(vocabulary);
  const map = new Map(
    enriched.map((v) => [v.word.trim().toLowerCase(), v] as const),
  );
  return terms.map((term) => {
    const item = map.get(term.trim().toLowerCase());
    const tr = item?.translation?.trim();
    const mean = item?.meaning?.trim();
    return {
      term,
      nativeTranslation: tr && tr.length > 0 ? tr : null,
      learnerDescription: mean && mean.length > 0 ? mean : null,
    };
  });
}

function applyVocabularyHints(
  items: VocabularyItem[],
  hints: Record<
    string,
    {
      translation: string | null;
      pronunciation: string | null;
      meaning: string | null;
    }
  >,
): VocabularyItem[] {
  return items.map((item) => {
    const h = hints[item.word.toLowerCase()];
    if (!h) return item;
    const t = h.translation?.trim();
    const p = h.pronunciation?.trim();
    const m = h.meaning?.trim();
    const useMeaning =
      m && m.length > 0
        ? m
        : item.meaning.trim().length > 0
          ? item.meaning
          : "";
    return {
      ...item,
      translation: t || item.translation,
      pronunciation: p || item.pronunciation,
      meaning: useMeaning,
    };
  });
}

function extractOpenWrittenAnswer(
  answers: Record<string, number | string>,
  questions: QuizQuestion[],
): string | undefined {
  for (const q of questions) {
    if (q.questionType === "open" || q.category === "open") {
      const v = answers[q.id];
      if (typeof v === "string" && v.trim()) {
        return v.trim();
      }
    }
  }
  let best = "";
  for (const v of Object.values(answers)) {
    if (typeof v !== "string") continue;
    const t = v.trim();
    if (t.length > best.length) best = t;
  }
  return best.length >= 12 ? best : undefined;
}

function readOpenEndedFeedbackFromSubmit(
  data: unknown,
): string | null | undefined {
  if (data == null || typeof data !== "object" || Array.isArray(data)) {
    return undefined;
  }
  const o = data as Record<string, unknown>;
  const raw =
    o.openEndedFeedback ?? o.open_ended_feedback ?? o.openSummaryFeedback;
  if (raw === null) return null;
  if (typeof raw === "string") {
    const t = raw.trim();
    return t.length > 0 ? t : null;
  }
  return undefined;
}

function readWrittenSummaryScoreFromSubmit(
  data: unknown,
): number | null | undefined {
  if (data == null || typeof data !== "object" || Array.isArray(data)) {
    return undefined;
  }
  const o = data as Record<string, unknown>;
  const raw = o.writtenSummaryScore ?? o.written_summary_score;
  if (raw === null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const r = Math.round(raw);
    if (r >= 1 && r <= 10) return r;
    return undefined;
  }
  return undefined;
}

function splitLongTranscriptLines(
  lines: TranscriptLine[],
  maxChars = 80,
): TranscriptLine[] {
  const out: TranscriptLine[] = [];
  const softLimit = Math.floor(maxChars * 0.5);

  for (const line of lines) {
    if (
      !line.text ||
      typeof line.startSec !== "number" ||
      typeof line.endSec !== "number"
    ) {
      out.push(line);
      continue;
    }
    if (line.text.length <= maxChars) {
      out.push(line);
      continue;
    }

    const words = line.text.split(" ");
    const chunks: string[] = [];
    let currentChunk = "";

    for (const word of words) {
      const hasPunctuation = /[.,!?;:]$/.test(word);
      const nextLength =
        (currentChunk ? currentChunk.length + 1 : 0) + word.length;

      if (nextLength > maxChars && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = word;
      } else {
        currentChunk += (currentChunk ? " " : "") + word;
        if (hasPunctuation && currentChunk.length >= softLimit) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
        }
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());

    const totalDuration = line.endSec - line.startSec;
    const totalChars = chunks.reduce((acc, c) => acc + c.length, 0);

    let currentStart = line.startSec;
    for (const chunk of chunks) {
      const chunkDuration = (chunk.length / totalChars) * totalDuration;
      const chunkEnd = currentStart + chunkDuration;

      const m = Math.floor(currentStart / 60);
      const s = Math.floor(currentStart % 60);
      const timeLabel = `${m}:${s.toString().padStart(2, "0")}`;

      out.push({
        ...line,
        time: timeLabel,
        startSec: currentStart,
        endSec: chunkEnd,
        text: chunk,
      });
    }
  }
  return out;
}

type TabId = "vocabulary" | "transcript" | "quiz";
type LessonLabels = typeof appEn.lesson;

const tabsFromLabels = (L: LessonLabels) =>
  [
    { id: "vocabulary" as const, label: L.vocabularyTab, icon: BookOpen },
    { id: "transcript" as const, label: L.transcriptTab, icon: FileText },
    { id: "quiz" as const, label: L.quizTab, icon: HelpCircle },
  ] as const;

function ContentWatchHeader({
  L,
  rightLabel,
  playlistRibbon,
}: {
  L: LessonLabels;
  rightLabel?: string;
  playlistRibbon?: {
    friendlyLink: string;
    prevVideoId: number | null;
    nextVideoId: number | null;
    position: number;
    total: number;
  } | null;
}) {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-border border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="grid grid-cols-3 items-center gap-3">
          <Link
            to="/catalog"
            className="flex shrink-0 items-center gap-2 justify-self-start text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm whitespace-nowrap">{L.backToCatalog}</span>
          </Link>

          <div className="flex min-w-0 items-center justify-center gap-2 justify-self-center">
            <Link to="/catalog">
              <img src="/Icon.svg" className="w-15 h-18 hover:cursor-pointer" />
            </Link>
            <span className="font-display truncate font-bold text-foreground">
              Explys
            </span>
          </div>

          <div className="min-h-[1.25rem] justify-self-end text-right text-xs text-muted-foreground sm:text-sm">
            {rightLabel?.trim() ? rightLabel : null}
          </div>
        </div>
        {playlistRibbon && playlistRibbon.total > 1 ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <div className="flex min-w-0 items-center gap-2">
              {playlistRibbon.prevVideoId != null ? (
                <Link
                  to={`/content/${playlistRibbon.prevVideoId}`}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {L.previous}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1.5 text-sm text-muted-foreground/50">
                  <ChevronLeft className="h-4 w-4" />
                  {L.previous}
                </span>
              )}
            </div>
            <Link
              to={`/catalog/series/${encodeURIComponent(playlistRibbon.friendlyLink)}`}
              className="text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:text-sm"
            >
              {formatMessage(L.seriesProgress, {
                current: String(playlistRibbon.position),
                total: String(playlistRibbon.total),
              })}
            </Link>
            <div className="flex items-center gap-2">
              {playlistRibbon.nextVideoId != null ? (
                <Link
                  to={`/content/${playlistRibbon.nextVideoId}`}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  {L.next}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1.5 text-sm text-muted-foreground/50">
                  {L.next}
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function LoadingView({ L }: { L: LessonLabels }) {
  return (
    <div className="min-h-screen bg-background">
      <ContentWatchHeader L={L} />
      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center gap-4 px-4 pt-20">
        <div
          className="border-muted h-14 w-14 animate-spin rounded-full border-4 border-t-primary border-solid"
          aria-hidden
        />
        <p className="text-sm font-medium text-muted-foreground">
          {L.loadingLesson}
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  L,
  title,
  description,
  cta,
}: {
  L: LessonLabels;
  title: string;
  description: string;
  cta: { to: string; label: string };
}) {
  return (
    <div className="min-h-screen bg-background">
      <ContentWatchHeader L={L} />
      <main className="mx-auto max-w-lg px-4 pt-28 pb-20 text-center sm:px-6">
        <div className="rounded-[2rem] border-2 border-dashed border-border bg-card/50 px-8 py-14">
          <div className="mb-4 text-4xl" aria-hidden>
            🎬
          </div>
          <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <Link
            to={cta.to}
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {cta.label}
          </Link>
        </div>
      </main>
    </div>
  );
}

function TabBar({
  L,
  activeTab,
  onTabChange,
  className,
}: {
  L: LessonLabels;
  activeTab: TabId;
  onTabChange: (t: TabId) => void;
  className?: string;
}) {
  const tabs = tabsFromLabels(L);
  return (
    <div className={cn("flex border-border border-b", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "-mb-px flex flex-1 items-center hover:cursor-pointer justify-center gap-2 border-border border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:flex-none sm:px-4",
            activeTab === tab.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <tab.icon className="h-4 w-4 shrink-0" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

function TabPanels({
  L,
  activeTab,
  vocabulary,
  sideLoading,
  transcriptLines,
  transcriptLoading,
  playbackSec,
  onSeekTranscript,
  quizPanel,
}: {
  L: LessonLabels;
  activeTab: TabId;
  vocabulary: VocabularyItem[];
  sideLoading: boolean;
  transcriptLines: TranscriptLine[];
  transcriptLoading: boolean;
  playbackSec: number;
  onSeekTranscript: (seconds: number) => void;
  quizPanel: ReactNode;
}) {
  return (
    <div className="py-6">
      <div
        className={activeTab === "vocabulary" ? "block" : "hidden"}
        aria-hidden={activeTab !== "vocabulary"}
      >
        {sideLoading ? (
          <p className="text-center text-sm text-muted-foreground">
            {L.preparingVocabulary}
          </p>
        ) : (
          <VideoVocabulary vocabulary={vocabulary} />
        )}
      </div>
      <div
        className={activeTab === "transcript" ? "block" : "hidden"}
        aria-hidden={activeTab !== "transcript"}
      >
        <VideoTranscript
          transcript={transcriptLines}
          loading={transcriptLoading}
          playbackSec={playbackSec}
          onSeek={onSeekTranscript}
          vocabulary={vocabulary}
        />
      </div>
      <div
        className={activeTab === "quiz" ? "block" : "hidden"}
        aria-hidden={activeTab !== "quiz"}
      >
        {quizPanel}
      </div>
    </div>
  );
}

export default function ContentPage() {
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useUser();
  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";
  const L = useAppMessages().lesson;
  const [activeTab, setActiveTab] = useState<TabId>("vocabulary");
  const [isVideoComplete, setIsVideoComplete] = useState(false);
  const [videoData, setVideoData] = useState<{
    videoName: string;
    videoLink: string;
    videoDescription: string | null;
    ageRestriction: string | null;
    content: {
      category: {
        name: string;
        description: string;
        friendlyLink?: string;
      };
      stats?: {
        userTags?: string[];
        systemTags?: string[];
        topics?: { id: number; name: string }[];
      } | null;
    };
  } | null>(null);
  const [playlistRibbon, setPlaylistRibbon] = useState<{
    friendlyLink: string;
    prevVideoId: number | null;
    nextVideoId: number | null;
    position: number;
    total: number;
  } | null>(null);
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
    Record<
      string,
      {
        translation: string | null;
        pronunciation: string | null;
        meaning: string | null;
      }
    >
  >({});

  const isLgUp = useIsLgUp();

  const isAdultUser = useMemo(() => {
    if (!user) return false;
    if (user.role === "adult") return true;
    if (user.dateOfBirth) {
      const dob = new Date(user.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      if (
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
      ) {
        age--;
      }
      return age >= 18;
    }
    return false;
  }, [user]);

  const isLocked = videoData?.ageRestriction === "18+" && !isAdultUser;

  const progressedToWatchedRef = useRef(false);
  const watchCompletePostedRef = useRef(false);
  const playbackStartedForPersonalizeRef = useRef(false);
  const vocabPersonalizeDoneRef = useRef(false);
  const displayVocabularyRef = useRef<VocabularyItem[]>([]);

  const seekToCue = useCallback((seconds: number) => {
    const el = videoElRef.current;
    if (!el || !Number.isFinite(seconds)) return;
    try {
      el.currentTime = Math.max(0, seconds);
    } catch {
      /* ignore invalid seek */
    }
  }, []);

  const postWatchCompleteOnce = useCallback(async () => {
    if (watchCompletePostedRef.current || !id || isLocked) return;
    watchCompletePostedRef.current = true;

    const vid = Number.parseInt(String(id), 10);
    if (!Number.isFinite(vid) || vid <= 0) return;

    try {
      await apiFetch(`/content-video/${vid}/watch-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secondsWatched: 0,
          completed: true,
        }),
      });
    } catch (error) {
      watchCompletePostedRef.current = false;
      console.error("Failed to mark watch complete:", error);
    }
  }, [id, isLocked]);

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
        } else {
          setVideoData(null);
        }
      } catch (error) {
        console.error("Error loading video:", error);
        setVideoData(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchVideo();
  }, [id]);

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
    const vid = Number.parseInt(String(id), 10);
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
        const json: unknown = await r.json();
        const parsed = parseSeriesPlaylistPayload(json);
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
            friendlyLink: fl,
            prevVideoId: prevEp ? prevEp.contentVideoId : null,
            nextVideoId: nextEp ? nextEp.contentVideoId : null,
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
    const vid = Number.parseInt(String(id), 10);
    if (!Number.isFinite(vid) || vid <= 0) return;
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
        setLessonSideBundle({
          vocabulary,
          quizQuestions,
          gradingToken,
        });
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
    const vid = Number.parseInt(String(id), 10);
    if (!Number.isFinite(vid) || vid <= 0) return;
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
        const raw = await r.text();
        const parsed = parseWebVttTranscriptLines(raw);
        setTranscriptLines(splitLongTranscriptLines(parsed, 80));
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

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (heartbeatIntervalRef.current)
      clearInterval(heartbeatIntervalRef.current);

    if (isLocked) return;

    heartbeatIntervalRef.current = setInterval(async () => {
      if (document.hidden || !videoElRef.current || videoElRef.current.paused)
        return;

      try {
        await apiFetch(`/content-video/${id}/watch-complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secondsWatched: 20,
          }),
        });
      } catch (err) {
        console.error("Heartbeat failed:", err);
      }
    }, 20000);

    return () => {
      if (heartbeatIntervalRef.current)
        clearInterval(heartbeatIntervalRef.current);
    };
  }, [id, isLocked]);

  const headerRight = isVideoComplete
    ? L.quizUnlocked
    : formatMessage(L.xpAvailable, { xp: String(LESSON_XP) });

  const displayVocabulary = useMemo((): VocabularyItem[] => {
    const api = lessonSideBundle?.vocabulary;
    if (api && api.length > 0) return api;
    const fromTranscript = buildVocabularyFromTranscript(transcriptLines);
    if (fromTranscript.length > 0) return fromTranscript;
    return defaultVocabulary;
  }, [lessonSideBundle?.vocabulary, transcriptLines]);

  useEffect(() => {
    displayVocabularyRef.current = displayVocabulary;
  }, [displayVocabulary]);

  const vocabularyWordKey = useMemo(
    () => displayVocabulary.map((v) => v.word).join("\n"),
    [displayVocabulary],
  );

  const tryPersonalizeVocabulary = useCallback(async () => {
    if (user?.id == null || !id || isLocked) return;
    if (vocabPersonalizeDoneRef.current) return;
    if (sideBundleLoading) return;
    const vid = Number.parseInt(String(id), 10);
    if (!Number.isFinite(vid) || vid <= 0) return;
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
      if (!r.ok) {
        vocabPersonalizeDoneRef.current = false;
        return;
      }
      const data = (await r.json()) as {
        hints?: Record<
          string,
          {
            translation: string | null;
            pronunciation: string | null;
            meaning: string | null;
          }
        >;
      };
      setVocabularyHintMap((prev) => ({ ...prev, ...(data.hints ?? {}) }));
    } catch {
      vocabPersonalizeDoneRef.current = false;
    }
  }, [user?.id, id, sideBundleLoading, isLocked]);

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
        const data = (await r.json()) as {
          hints?: Record<
            string,
            {
              translation: string | null;
              pronunciation: string | null;
              meaning: string | null;
            }
          >;
        };
        if (!cancelled) setVocabularyHintMap(data.hints ?? {});
      })
      .catch(() => {
        if (!cancelled) setVocabularyHintMap({});
      });
    return () => {
      cancelled = true;
    };
  }, [vocabularyWordKey, user?.id, isLocked]);

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
      if (ready(lessonSideBundleRef.current)) {
        return lessonSideBundleRef.current;
      }
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 50));
        const b = lessonSideBundleRef.current;
        if (ready(b)) {
          return b;
        }
        if (!sideBundleLoadingRef.current && !ready(b)) {
          break;
        }
      }
      return lessonSideBundleRef.current;
    },
    [],
  );

  const handleQuizComplete = useCallback(
    async (summary: VideoQuizCompleteSummary) => {
      if (!id || !videoData || isLocked) return;
      const vid = Number.parseInt(String(id), 10);
      let correctCount = summary.correctCount;
      let totalQuestions = summary.totalQuestions;

      const readyBundle = (b: typeof lessonSideBundle) =>
        Boolean(
          b?.gradingToken &&
          Array.isArray(b.quizQuestions) &&
          b.quizQuestions.length > 0,
        );

      let bundle: typeof lessonSideBundle = readyBundle(lessonSideBundle)
        ? lessonSideBundle
        : null;
      if (!readyBundle(bundle) && Number.isFinite(vid) && vid > 0) {
        bundle = await waitForLessonSideBundleWithToken();
      }

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
            await refreshProfile().catch(() => {});

            const d = (await r.json()) as unknown;
            const fb = readOpenEndedFeedbackFromSubmit(d);
            if (fb !== undefined) {
              writtenSummaryFeedback = fb;
            } else if (writtenSummaryText?.trim()) {
              writtenSummaryFeedback = L.coachCommentFallback;
            }
            const sc = readWrittenSummaryScoreFromSubmit(d);
            if (sc !== undefined) {
              writtenSummaryScore = sc;
            }
            if (d && typeof d === "object" && !Array.isArray(d)) {
              const o = d as Record<string, unknown>;
              if (
                typeof o.correct === "number" &&
                Number.isFinite(o.correct) &&
                typeof o.total === "number" &&
                Number.isFinite(o.total)
              ) {
                correctCount = o.correct;
                totalQuestions = o.total;
              }
            }
          } else if (writtenSummaryText?.trim()) {
            writtenSummaryFeedback = L.gradingFailed;
          }
        } catch {
          if (writtenSummaryText?.trim()) {
            writtenSummaryFeedback = L.gradingUnreachable;
          }
        }
      } else if (writtenSummaryText) {
        writtenSummaryFeedback = L.quizNotReady;
      }
      const stats = videoData.content.stats;
      const lessonTopics = Array.isArray(stats?.topics)
        ? stats!.topics!.map((t) => ({ id: t.id, name: t.name }))
        : [];
      const themeTags = Array.isArray(stats?.userTags) ? stats!.userTags! : [];
      const levelTags = Array.isArray(stats?.systemTags)
        ? stats!.systemTags!
        : [];
      const learnedWords = enrichedDisplayVocabulary
        .map((v) => ({ word: v.word, definition: v.meaning }))
        .slice(0, 12);
      const payload: LessonSummaryState = {
        correctCount,
        totalQuestions,
        xpEarned: writtenSummaryText?.trim() ? 150 : 100,
        videoName: videoData.videoName,
        categoryName: videoData.content.category.name,
        videoDescription: videoData.videoDescription,
        learnedWords,
        lessonTopics,
        themeTags,
        levelTags,
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
      } catch {
        /* ignore quota / private mode */
      }
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

  if (loading) {
    return (
      <>
        <SEO
          title={L.seoLoadingTitle}
          description={L.seoLoadingDescription}
          canonicalUrl={resolveCanonicalUrl(id ? `/content/${id}` : "/catalog")}
          noindex
        />
        <LoadingView L={L} />
      </>
    );
  }

  if (!id) {
    return (
      <>
        <SEO
          title={L.seoPickTitle}
          description={L.seoPickDescription}
          canonicalUrl={resolveCanonicalUrl("/catalog")}
          noindex
        />
        <EmptyState
          L={L}
          title={L.noVideoSelectedTitle}
          description={L.pickLessonDescription}
          cta={{ to: "/catalog", label: L.browseCatalogCta }}
        />
      </>
    );
  }

  if (!videoData) {
    return (
      <>
        <SEO
          title={L.seoNotFoundTitle}
          description={L.seoNotFoundDescription}
          canonicalUrl={resolveCanonicalUrl(`/content/${id}`)}
          noindex
        />
        <EmptyState
          L={L}
          title={L.notFoundTitle}
          description={L.notFoundBody}
          cta={{ to: "/catalog", label: L.backToCatalog }}
        />
      </>
    );
  }

  const descriptionBlurb =
    videoData.videoDescription?.trim() ||
    videoData.content.category.description?.trim() ||
    L.descriptionFallback;

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

  const quizPanel: ReactNode = !isVideoComplete ? (
    <VideoQuiz
      key={`quiz-lock-${id}`}
      questions={defaultQuizQuestions}
      isVideoComplete={false}
      onComplete={handleQuizComplete}
    />
  ) : quizWaitingForServer ? (
    <div className="py-10 text-center">
      <div
        className="border-muted mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-t-primary border-solid"
        aria-hidden
      />
      <p className="text-sm font-medium text-foreground">{L.loadingQuiz}</p>
      <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
        {L.loadingQuizHint}
      </p>
    </div>
  ) : quizServerFailed ? (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center text-sm">
      <p className="font-semibold text-foreground">{L.quizFailedTitle}</p>
      <p className="mt-2 text-muted-foreground">{L.quizFailedBody}</p>
    </div>
  ) : (
    <VideoQuiz
      key={`quiz-${id}-${lessonSideBundle!.gradingToken!.slice(0, 36)}`}
      questions={lessonSideBundle!.quizQuestions}
      isVideoComplete={true}
      onComplete={handleQuizComplete}
    />
  );

  const ageRestriction: Record<string, string> = {
    "0+": "bg-accent/20 text-accent border border-accent/40",
    "6+": "bg-(--light-blue)/20 text-(--light-blue) border border-(--light-blue)/40",
    "12+": "bg-(--yellow)/20 text-(--yellow) border border-(--yellow)/40",
    "16+": "bg-(--orange)/20 text-(--orange) border border-(--orange)/40",
    "18+": "bg-destructive/20 text-destructive border border-destructive/40",
    "21+": "bg-primary/20 text-primary border border-primary/40",
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SEO
        title={videoData.videoName}
        description={descriptionBlurb}
        canonicalUrl={resolveCanonicalUrl(`/content/${id}`)}
        noindex
      />
      <ContentWatchHeader
        L={L}
        rightLabel={headerRight}
        playlistRibbon={playlistRibbon}
      />

      <main
        className={cn(
          playlistRibbon && playlistRibbon.total > 1 ? "pt-28" : "pt-16",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="overflow-hidden rounded-xl mt-5 border border-border bg-muted ring-1 ring-border/40">
                {isLocked ? (
                  <div className="aspect-video flex flex-col items-center justify-center bg-card/80 text-center p-6">
                    <div className="bg-destructive/20 p-4 rounded-full mb-4">
                      <Lock className="w-10 h-10 text-destructive" />
                    </div>
                    <h2 className="text-foreground font-bold text-2xl mb-2">
                      18+ Only
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-md">
                      This content is restricted to adults (18+) and is not
                      available to your profile.
                    </p>
                  </div>
                ) : (
                  <VideoPlayer
                    src={videoData.videoLink}
                    transcript={transcriptLines}
                    onEnded={handleVideoEnded}
                    onPlay={handleVideoPlay}
                    onPlaybackTime={(t) => setPlaybackSec(t)}
                    onPlaybackFraction={handlePlaybackFraction}
                    onVideoMount={(el) => {
                      videoElRef.current = el;
                    }}
                    className="rounded-none border-0"
                  />
                )}
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                    {videoData.content.category.name}
                  </span>
                  {!isLocked &&
                    (isVideoComplete ? (
                      <span className="text-sm text-accent">{L.watched}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {formatMessage(L.watchToUnlock, {
                          pct: String(
                            Math.round(WATCHED_COMPLETED_RATIO * 100),
                          ),
                        })}
                      </span>
                    ))}

                  {(user?.role?.toLowerCase() === "teacher" ||
                    user?.role?.toLowerCase() === "admin") && (
                    <div className="ml-2 z-50">
                      <AssignHomeworkButton
                        contentId={Number(id)}
                        contentName={videoData.videoName}
                      />
                    </div>
                  )}
                </div>
                <h1 className="font-display mb-3 text-2xl font-bold sm:text-3xl">
                  {videoData.videoName}
                </h1>

                {videoData.ageRestriction &&
                  ageRestriction[videoData.ageRestriction] && (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-[15px] px-2 py-0.5 text-xs font-semibold mb-3",
                        ageRestriction[videoData.ageRestriction],
                      )}
                    >
                      <p className="mr-1">{L.warning}</p>
                      {videoData.ageRestriction}
                    </span>
                  )}

                <p className="leading-relaxed text-muted-foreground">
                  {descriptionBlurb}
                </p>
              </div>

              {!isLocked && (
                <div className="lg:hidden">
                  {!isLgUp ? (
                    <>
                      <TabBar
                        L={L}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                      />
                      <TabPanels
                        L={L}
                        activeTab={activeTab}
                        vocabulary={enrichedDisplayVocabulary}
                        sideLoading={sideBundleLoading}
                        transcriptLines={transcriptLines}
                        transcriptLoading={transcriptLoading}
                        playbackSec={playbackSec}
                        onSeekTranscript={seekToCue}
                        quizPanel={quizPanel}
                      />
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {!isLocked && (
              <div className="hidden lg:block">
                {isLgUp ? (
                  <>
                    <TabBar
                      L={L}
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                    />
                    <div className="mt-0 max-h-[min(600px,70vh)] overflow-y-auto rounded-xl border border-border bg-card p-4">
                      <div
                        className={
                          activeTab === "vocabulary" ? "block" : "hidden"
                        }
                        aria-hidden={activeTab !== "vocabulary"}
                      >
                        {sideBundleLoading ? (
                          <p className="text-center text-sm text-muted-foreground">
                            {L.preparingVocabulary}
                          </p>
                        ) : (
                          <VideoVocabulary
                            vocabulary={enrichedDisplayVocabulary}
                          />
                        )}
                      </div>
                      <div
                        className={
                          activeTab === "transcript" ? "block" : "hidden"
                        }
                        aria-hidden={activeTab !== "transcript"}
                      >
                        <VideoTranscript
                          transcript={transcriptLines}
                          loading={transcriptLoading}
                          playbackSec={playbackSec}
                          onSeek={seekToCue}
                          vocabulary={enrichedDisplayVocabulary}
                        />
                      </div>
                      <div
                        className={activeTab === "quiz" ? "block" : "hidden"}
                        aria-hidden={activeTab !== "quiz"}
                      >
                        {quizPanel}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
