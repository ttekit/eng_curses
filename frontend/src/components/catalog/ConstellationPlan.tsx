import { useState, useMemo } from "react";
import { Link } from "react-router";
import { CheckCircle2, Lock, Play, Star as StarIcon, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Constellation, Star, StarProgress } from "../../lib/constellationApi";

interface ConstellationPlanProps {
    constellation: Constellation;
    progress: StarProgress[];
    onCompleteStar?: (starId: number) => Promise<void> | void;
    onFinishCategory?: (constellationId: number) => void;
}

export function ConstellationPlan({
    constellation,
    progress,
    onCompleteStar,
    onFinishCategory,
}: ConstellationPlanProps) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [selectedStar, setSelectedStar] = useState<Star | null>(null);
    const [completingId, setCompletingId] = useState<number | null>(null);

    const starStatusMap = useMemo(() => {
        const map = new Map<number, string>();
        progress.forEach((p) => map.set(p.starId, p.status));
        return map;
    }, [progress]);

    const isCategoryCompleted = useMemo(() => {
        if (!constellation.stars.length) return false;
        return constellation.stars.every(
            (s) => starStatusMap.get(s.id) === "COMPLETED",
        );
    }, [constellation.stars, starStatusMap]);

    const starPositions = useMemo(() => {
        const total = constellation.stars.length;
        return constellation.stars.map((_, index) => {
            const angle = (index / total) * Math.PI * 1.5 + 0.5;
            const radius = 25 + (index % 2) * 15;
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            return { x, y };
        });
    }, [constellation.stars]);

    const getEffectiveStatus = (star: Star, index: number): string => {
        const raw = starStatusMap.get(star.id) || "LOCKED";
        if (index === 0 && raw === "LOCKED") {
            return "AVAILABLE";
        }
        return raw;
    };

    const getStatusStyles = (status?: string) => {
        switch (status) {
            case "COMPLETED":
                return "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.8)] border-purple-400";
            case "IN_PROGRESS":
                return "bg-purple-900 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.6)] border-purple-400 animate-pulse";
            case "AVAILABLE":
                return "bg-card text-purple-400 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]";
            default:
                return "bg-muted/60 text-muted-foreground border-border/80 opacity-75";
        }
    };

    const getRequiredPrerequisiteName = (star: Star): string | null => {
        const index = constellation.stars.findIndex((s) => s.id === star.id);
        if (index <= 0) return null;

        if (star.prerequisites && star.prerequisites.length > 0) {
            const reqId = star.prerequisites[0].prerequisiteId;
            const reqStar = constellation.stars.find((s) => s.id === reqId);
            if (reqStar) return reqStar.name;
        }

        return constellation.stars[index - 1].name;
    };

    const handleActionClick = async (starId: number) => {
        if (!onCompleteStar || completingId !== null) return;
        try {
            setCompletingId(starId);
            await Promise.resolve(onCompleteStar(starId));
        } catch (error) {
            alert("Помилка сервера (429): Занадто багато запитів. Будь ласка, зачекайте хвилину, поки сервер зніме блокування.");
        } finally {
            setCompletingId(null);
        }
    };

    const renderStarsGraph = (interactive: boolean) => (
        <div className="relative w-full h-56 my-4 flex items-center justify-center select-none">
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <defs>
                    <marker
                        id={`arrow-${constellation.id}`}
                        viewBox="0 0 10 10"
                        refX="22"
                        refY="5"
                        markerWidth="5"
                        markerHeight="5"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 1 L 10 5 L 0 9 z" className="fill-purple-500/50" />
                    </marker>
                </defs>
                {constellation.stars.map((star, i) => {
                    if (i === 0) return null;
                    const prev = starPositions[i - 1];
                    const curr = starPositions[i];
                    return (
                        <line
                            key={`line-${star.id}`}
                            x1={`${prev.x}%`}
                            y1={`${prev.y}%`}
                            x2={`${curr.x}%`}
                            y2={`${curr.y}%`}
                            className="stroke-purple-500/40 stroke-2"
                            strokeDasharray="4 4"
                            markerEnd={`url(#arrow-${constellation.id})`}
                        />
                    );
                })}
            </svg>

            {constellation.stars.map((star, i) => {
                const pos = starPositions[i];
                const status = getEffectiveStatus(star, i);
                const styles = getStatusStyles(status);
                const isSelected = selectedStar?.id === star.id;

                return (
                    <div
                        key={star.id}
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center z-10"
                    >
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-950 border border-purple-500/50 text-[10px] font-bold text-purple-300 flex items-center justify-center shadow-sm z-20">
                            {i + 1}
                        </span>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (interactive) {
                                    setSelectedStar(star);
                                }
                            }}
                            className={cn(
                                "w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ease-out cursor-pointer",
                                styles,
                                interactive && "hover:scale-110",
                                isSelected && "scale-110 ring-4 ring-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.8)]",
                            )}
                        >
                            {status === "COMPLETED" ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : status === "LOCKED" ? (
                                <Lock className="w-4 h-4" />
                            ) : status === "IN_PROGRESS" ? (
                                <Play className="w-4 h-4 fill-current" />
                            ) : (
                                <StarIcon className="w-5 h-5 fill-purple-400/20" />
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
    );

    const selectedIndex = selectedStar ? constellation.stars.findIndex((s) => s.id === selectedStar.id) : -1;
    const selectedStatus = selectedStar ? getEffectiveStatus(selectedStar, selectedIndex) : "LOCKED";

    return (
        <>
            <div
                onClick={() => {
                    if (!isZoomed) {
                        setSelectedStar(constellation.stars[0] || null);
                        setIsZoomed(true);
                    }
                }}
                className={cn(
                    "relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-card/40 transition-colors duration-300 w-full",
                    !isZoomed && "cursor-pointer hover:border-purple-500/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] hover:bg-card/60",
                )}
            >
                <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-semibold text-base sm:text-lg text-foreground flex items-center gap-2 truncate">
                        <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                        <span className="truncate">{constellation.name}</span>
                    </h3>
                    {isCategoryCompleted && (
                        <span className="text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium shrink-0">
                            Completed
                        </span>
                    )}
                </div>

                {renderStarsGraph(false)}

                <div className="mt-4 flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                    <span>{constellation.stars.length} stars</span>
                    <span className="text-purple-400 font-medium flex items-center gap-1">
                        Click to inspect <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
            </div>

            {isZoomed && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div
                        className="relative w-full max-w-[calc(100vw-1rem)] lg:max-w-4xl rounded-2xl sm:rounded-3xl border border-purple-500/40 bg-card p-4 sm:p-6 lg:p-8 shadow-2xl flex flex-col lg:flex-row gap-6 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setIsZoomed(false)}
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground hover:text-foreground text-xs sm:text-sm font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer z-20"
                        >
                            ✕ Close
                        </button>

                        <div className="flex-1 flex flex-col justify-between min-w-0 pr-8 lg:pr-0">
                            <div>
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-400">
                                    Constellation Plan
                                </span>
                                <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground mt-1 truncate">
                                    {constellation.name}
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                                    {constellation.description ||
                                        "Complete each star in the path to unlock the next level and master this topic."}
                                </p>
                            </div>

                            {renderStarsGraph(true)}

                            {isCategoryCompleted && onFinishCategory && (
                                <button
                                    type="button"
                                    onClick={() => onFinishCategory(constellation.id)}
                                    className="w-full mt-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all shadow-[0_0_15px_rgba(147,51,234,0.5)] cursor-pointer text-sm"
                                >
                                    Finish Category & Claim Reward
                                </button>
                            )}
                        </div>

                        <div className="w-full lg:w-80 rounded-xl sm:rounded-2xl bg-muted/30 border border-border p-4 sm:p-5 flex flex-col justify-between shrink-0">
                            <div>
                                <h4 className="font-semibold text-xs sm:text-sm text-foreground border-b border-border pb-2.5 flex items-center justify-between">
                                    <span>Star Details</span>
                                    {selectedStar && (
                                        <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono uppercase">
                                            {selectedStatus}
                                        </span>
                                    )}
                                </h4>

                                {selectedStar ? (
                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-purple-900 border border-purple-500 text-[11px] font-bold text-purple-200 flex items-center justify-center shrink-0">
                                                {selectedIndex + 1}
                                            </span>
                                            <h5 className="font-bold text-sm sm:text-base text-purple-300 leading-snug break-words">
                                                {selectedStar.name}
                                            </h5>
                                        </div>

                                        <p className="text-xs text-muted-foreground leading-relaxed break-words">
                                            {selectedStar.description ||
                                                "No specific details provided for this star."}
                                        </p>

                                        {selectedStatus === "LOCKED" && selectedIndex > 0 && (
                                            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
                                                🔒 <strong>Зірка заблокована.</strong>
                                                {getRequiredPrerequisiteName(selectedStar) ? (
                                                    <span className="block mt-1 text-amber-200/90">
                                                        Щоб відкрити цей урок, спочатку пройдіть попередній етап: <br />
                                                        <strong className="text-white font-semibold">«{getRequiredPrerequisiteName(selectedStar)}»</strong>.
                                                    </span>
                                                ) : (
                                                    <span className="block mt-1">
                                                        Пройдіть попередні уроки у цьому сузір'ї, щоб отримати доступ.
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {selectedStatus === "LOCKED" && selectedIndex === 0 && (
                                            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
                                                🔒 <strong>Стартовий урок заблоковано.</strong>
                                                <span className="block mt-1 text-amber-200/90">
                                                    Будь ласка, оновіть сторінку або зверніться до підтримки для розблокування цього сузір'я.
                                                </span>
                                            </div>
                                        )}

                                        {(selectedStatus === "AVAILABLE" || selectedStatus === "IN_PROGRESS") && (
                                            <div className="mt-4 pt-3 border-t border-border/60">
                                                <p className="text-xs text-purple-300 mb-3">
                                                    ✨ <strong>Тема доступна!</strong> Натисніть кнопку нижче, щоб перейти до виконання завдання:
                                                </p>

                                                {selectedStar.contentVideoId ? (
                                                    <Link
                                                        to={`/content/${selectedStar.contentVideoId}`}
                                                        className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                                                    >
                                                        <Play className="w-4 h-4 fill-current shrink-0" />
                                                        <span>Дивитись відео-урок</span>
                                                    </Link>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={completingId === selectedStar.id}
                                                        onClick={() => void handleActionClick(selectedStar.id)}
                                                        className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                                                    >
                                                        {completingId === selectedStar.id ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                                                <span>Завершення...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                                <span>Завершити цей етап</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {selectedStatus === "COMPLETED" && (
                                            <div className="mt-3 p-3 rounded-xl bg-purple-600/10 border border-purple-500/30 text-purple-300 text-xs leading-relaxed flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                                                <span>Цей етап успішно пройдено! Ви можете обрати наступну доступну зірку.</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-6 text-center py-6 border border-dashed border-border/60 rounded-xl p-4">
                                        <Sparkles className="w-6 h-6 text-purple-400/40 mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Натисніть на будь-яку зірку зліва, щоб побачити опис уроку, перевірити статус або перейти до відео.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-border text-[10px] sm:text-[11px] text-muted-foreground space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                                    <span>Completed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-purple-900 border border-purple-400 shrink-0" />
                                    <span>In Progress</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-card border border-purple-400 shrink-0" />
                                    <span>Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-muted/60 border border-border shrink-0" />
                                    <span>Locked</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}