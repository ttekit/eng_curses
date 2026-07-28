import { useState, useMemo } from "react";
import { CheckCircle2, Lock, Play, Star as StarIcon, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Constellation, Star, StarProgress } from "../../lib/constellationApi";

interface ConstellationPlanProps {
    constellation: Constellation;
    progress: StarProgress[];
    onCompleteStar?: (starId: number) => void;
    onFinishCategory?: (constellationId: number) => void;
}

export function ConstellationPlan({
    constellation,
    progress,
    onCompleteStar,
    onFinishCategory,
}: ConstellationPlanProps) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [hoveredStar, setHoveredStar] = useState<Star | null>(null);

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
            const radius = 35 + (index % 2) * 15;
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            return { x, y };
        });
    }, [constellation.stars]);

    const getStatusStyles = (status?: string) => {
        switch (status) {
            case "COMPLETED":
                return "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.8)] border-purple-400";
            case "IN_PROGRESS":
                return "bg-purple-900/80 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.5)] border-purple-500 animate-pulse";
            case "AVAILABLE":
                return "bg-card text-purple-400 border-purple-500/50 hover:border-purple-400 hover:shadow-[0_0_10px_rgba(168,85,247,0.4)]";
            default:
                return "bg-muted/40 text-muted-foreground border-border opacity-50";
        }
    };

    const renderStarsGraph = (interactive: boolean) => (
        <div className="relative w-full h-48 my-4 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-purple-500/30 stroke-2">
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
                            strokeDasharray="4 4"
                        />
                    );
                })}
            </svg>

            {constellation.stars.map((star, i) => {
                const pos = starPositions[i];
                const status = starStatusMap.get(star.id) || "LOCKED";
                const styles = getStatusStyles(status);

                return (
                    <div
                        key={star.id}
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                    >
                        <button
                            type="button"
                            disabled={!interactive || status === "LOCKED"}
                            onClick={() => {
                                if (interactive && status === "AVAILABLE" && onCompleteStar) {
                                    onCompleteStar(star.id);
                                }
                            }}
                            onMouseEnter={() => interactive && setHoveredStar(star)}
                            onMouseLeave={() => interactive && setHoveredStar(null)}
                            className={cn(
                                "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                styles,
                                interactive && status !== "LOCKED" && "cursor-pointer hover:scale-110",
                            )}
                        >
                            {status === "COMPLETED" ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : status === "LOCKED" ? (
                                <Lock className="w-4 h-4" />
                            ) : status === "IN_PROGRESS" ? (
                                <Play className="w-4 h-4 fill-current" />
                            ) : (
                                <StarIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
    );

    return (
        <>
            <div
                onClick={() => !isZoomed && setIsZoomed(true)}
                className={cn(
                    "relative flex flex-col justify-between p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-card/40 transition-all duration-300",
                    !isZoomed && "cursor-pointer hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:scale-[1.02]",
                )}
            >
                <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        {constellation.name}
                    </h3>
                    {isCategoryCompleted && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                            Completed
                        </span>
                    )}
                </div>

                {renderStarsGraph(false)}

                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{constellation.stars.length} stars</span>
                    <span className="text-purple-400 font-medium">Click to inspect</span>
                </div>
            </div>

            {isZoomed && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <div className="relative w-full max-w-3xl rounded-3xl border border-purple-500/40 bg-card p-8 shadow-2xl flex flex-col md:flex-row gap-8">
                        <button
                            type="button"
                            onClick={() => setIsZoomed(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-sm font-semibold px-3 py-1 rounded-lg bg-muted/50 hover:bg-muted"
                        >
                            ✕ Close
                        </button>

                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                                    Constellation Plan
                                </span>
                                <h2 className="text-2xl font-bold font-display text-foreground mt-1">
                                    {constellation.name}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                    {constellation.description ||
                                        "Complete each star in the path to unlock the next level and master this topic."}
                                </p>
                            </div>

                            {renderStarsGraph(true)}

                            {isCategoryCompleted && onFinishCategory && (
                                <button
                                    type="button"
                                    onClick={() => onFinishCategory(constellation.id)}
                                    className="w-full mt-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all shadow-[0_0_15px_rgba(147,51,234,0.5)]"
                                >
                                    Finish Category & Claim Reward
                                </button>
                            )}
                        </div>

                        <div className="w-full md:w-72 rounded-2xl bg-muted/30 border border-border p-5 flex flex-col justify-between">
                            <div>
                                <h4 className="font-semibold text-sm text-foreground border-b border-border pb-2">
                                    Star Details
                                </h4>
                                {hoveredStar ? (
                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-purple-300">
                                                {hoveredStar.name}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                                                {starStatusMap.get(hoveredStar.id) || "LOCKED"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-normal mt-2">
                                            {hoveredStar.description ||
                                                "No specific details provided for this star."}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground mt-4 italic">
                                        Hover over any star on the left to see its description and objective.
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-border text-[11px] text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Completed
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-purple-900 border border-purple-500" /> In Progress
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-card border border-purple-500/50" /> Available
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}