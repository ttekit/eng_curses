import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2, Sparkles, BookOpen, PenTool, Loader2 } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { completeStar } from "../../lib/constellationApi";

export default function TaskPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [star, setStar] = useState<any>(null);
    const [completing, setCompleting] = useState(false);

    // Стейты для массивов ответов
    const [phraseInputs, setPhraseInputs] = useState<Record<number, string>>({});
    const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});

    const [error, setError] = useState(false);

    useEffect(() => {
        apiFetch(`/constellations/star/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load task");
                return res.json();
            })
            .then((data) => setStar(data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [id]);

    const handleComplete = async () => {
        if (!star?.id || completing) return;
        setCompleting(true);
        try {
            await completeStar(star.id);
            navigate("/watched-lessons");
        } catch {
            alert("Помилка завершення завдання");
            setCompleting(false);
        }
    };

    const handlePhraseChange = (idx: number, val: string) => {
        setPhraseInputs(prev => ({ ...prev, [idx]: val }));
    };

    const handleOptionSelect = (idx: number, val: string) => {
        setSelectedOptions(prev => ({ ...prev, [idx]: val }));
    };

    const isTaskValid = () => {
        if (!star?.metadata) return true;

        if (star.type === "PHRASE" && Array.isArray(star.metadata.phrases)) {
            return star.metadata.phrases.every((p: any, i: number) => {
                const target = (p.targetPhrase || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                const input = (phraseInputs[i] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                return target === input && target.length > 0;
            });
        }

        if (star.type === "READING" && Array.isArray(star.metadata.questions)) {
            return star.metadata.questions.every((q: any, i: number) => {
                return selectedOptions[i] === q.correctAnswer;
            });
        }

        if (star.type === "GRAMMAR" && Array.isArray(star.metadata.quiz)) {
            return star.metadata.quiz.every((q: any, i: number) => {
                return selectedOptions[i] === q.correctAnswer;
            });
        }

        return true;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
                <p className="text-muted-foreground">Завантаження завдання...</p>
            </div>
        );
    }

    if (error || !star) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
                <p className="text-destructive mb-4">Помилка завантаження</p>
                <button onClick={() => navigate("/watched-lessons")} className="text-purple-400 hover:underline">
                    Повернутися назад
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground antialiased pb-20">
            <header className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
                <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-4">
                    <button onClick={() => navigate("/watched-lessons")} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1 truncate">
                            {star.type === "GRAMMAR" ? "Grammar Lesson" : star.type === "READING" ? "Reading Practice" : "Vocabulary & Phrases"}
                        </div>
                        <h1 className="font-display font-bold text-lg truncate">{star.name}</h1>
                    </div>
                </div>
            </header>

            <main className="pt-24 px-4 mx-auto max-w-3xl">

                {/* === GRAMMAR === */}
                {star.type === "GRAMMAR" && (
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 shrink-0">
                                <Sparkles className="w-6 h-6 text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4">Правило</h2>
                            <p className="text-foreground text-lg leading-relaxed mb-8 whitespace-pre-wrap break-words">
                                {star.metadata?.rule || "Правило не знайдено."}
                            </p>

                            {Array.isArray(star.metadata?.examples) && star.metadata.examples.length > 0 && (
                                <div className="space-y-3 mb-8">
                                    <h3 className="font-bold text-muted-foreground uppercase text-xs mb-2">Приклади:</h3>
                                    {star.metadata.examples.map((ex: any, i: number) => (
                                        <div key={i} className="bg-muted/30 rounded-xl p-4 border border-border">
                                            <p className="font-medium text-lg text-foreground break-words">"{ex.en}"</p>
                                            <p className="text-sm text-muted-foreground mt-1 break-words">{ex.uk}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {Array.isArray(star.metadata?.quiz) && star.metadata.quiz.length > 0 && (
                                <div className="border-t border-border pt-6 mt-6 space-y-6">
                                    <h3 className="font-bold text-xl mb-4">Перевірка знань:</h3>
                                    {star.metadata.quiz.map((q: any, i: number) => (
                                        <div key={i} className="bg-background rounded-xl p-5 border border-border">
                                            <p className="font-bold mb-4 break-words">{i + 1}. {q.question}</p>
                                            <div className="space-y-2">
                                                {q.options.map((opt: string, optIdx: number) => (
                                                    <button
                                                        key={optIdx}
                                                        type="button"
                                                        onClick={() => handleOptionSelect(i, opt)}
                                                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer break-words ${selectedOptions[i] === opt
                                                            ? "border-purple-500 bg-purple-500/10 text-purple-200 ring-1 ring-purple-500"
                                                            : "border-border hover:border-purple-500/50 hover:bg-muted/50"
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* === READING === */}
                {star.type === "READING" && (
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 shrink-0">
                                <BookOpen className="w-6 h-6 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4">Прочитайте текст</h2>
                            <div className="bg-muted/20 p-6 rounded-2xl border border-border/50 mb-8">
                                <p className="text-foreground leading-relaxed text-lg whitespace-pre-wrap break-words font-serif">
                                    {star.metadata?.text || "Текст відсутній."}
                                </p>
                            </div>

                            {Array.isArray(star.metadata?.questions) && star.metadata.questions.length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="font-bold text-xl mb-4">Дайте відповіді на запитання:</h3>
                                    {star.metadata.questions.map((q: any, i: number) => (
                                        <div key={i} className="bg-background rounded-xl p-5 border border-border">
                                            <span className="font-bold text-foreground mb-4 block break-words">
                                                {i + 1}. {q.question}
                                            </span>
                                            <div className="space-y-2">
                                                {q.options.map((opt: string, optIdx: number) => (
                                                    <button
                                                        key={optIdx}
                                                        type="button"
                                                        onClick={() => handleOptionSelect(i, opt)}
                                                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer break-words ${selectedOptions[i] === opt
                                                            ? "border-blue-500 bg-blue-500/10 text-blue-200 ring-1 ring-blue-500"
                                                            : "border-border hover:border-blue-500/50 hover:bg-muted/50"
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* === PHRASE === */}
                {star.type === "PHRASE" && (
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 shrink-0">
                                <PenTool className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-6">Вивчіть фрази</h2>

                            {Array.isArray(star.metadata?.phrases) ? (
                                <div className="space-y-8">
                                    {star.metadata.phrases.map((p: any, i: number) => {
                                        const targetClean = (p.targetPhrase || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                                        const inputClean = (phraseInputs[i] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                                        const isCorrect = targetClean === inputClean && targetClean.length > 0;

                                        return (
                                            <div key={i} className="bg-muted/20 rounded-2xl p-5 border border-border">
                                                <div className="mb-4">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Фраза {i + 1}:</span>
                                                    <p className="font-bold text-2xl text-emerald-400 select-all break-words mb-1">
                                                        {p.targetPhrase}
                                                    </p>
                                                    <p className="text-sm text-foreground break-words font-medium">
                                                        {p.translation}
                                                    </p>
                                                </div>

                                                <p className="text-muted-foreground text-sm leading-relaxed mb-4 whitespace-pre-wrap break-words">
                                                    {p.context}
                                                </p>

                                                {p.dialogue && (
                                                    <div className="mb-6">
                                                        <span className="text-xs font-bold text-muted-foreground uppercase mb-2 block">У діалозі:</span>
                                                        <p className="text-sm text-foreground whitespace-pre-wrap italic break-words bg-background/50 p-3 rounded-lg border border-border/50">
                                                            {p.dialogue}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="space-y-3">
                                                    <label className="text-sm font-bold text-foreground">Надрукуйте фразу:</label>
                                                    <input
                                                        type="text"
                                                        value={phraseInputs[i] || ""}
                                                        onChange={(e) => handlePhraseChange(i, e.target.value)}
                                                        placeholder="Введіть фразу..."
                                                        className={`w-full bg-background border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${isCorrect ? "border-emerald-500/50 focus:ring-emerald-500" : "border-border focus:ring-emerald-500"
                                                            }`}
                                                    />
                                                    {isCorrect && (
                                                        <div className="text-emerald-400 text-xs flex items-center gap-1.5 font-medium">
                                                            <CheckCircle2 className="w-4 h-4 shrink-0" /> Зараховано!
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Немає фраз для відображення (старий формат).</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <button
                        onClick={handleComplete}
                        disabled={completing || !isTaskValid()}
                        className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                    >
                        {completing ? <Loader2 className="w-5 h-5 animate-spin shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                        Завершити та продовжити
                    </button>
                    {!isTaskValid() && (
                        <p className="text-center text-xs text-muted-foreground mt-3">
                            Виконайте всі завдання вище (введіть фрази / оберіть відповіді), щоб продовжити.
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}