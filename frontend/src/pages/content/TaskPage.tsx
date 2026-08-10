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
    const [phraseInput, setPhraseInput] = useState("");
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

    const isPhraseValid = () => {
        if (star?.type !== "PHRASE" || !star?.metadata?.targetPhrase) return true;
        const target = star.metadata.targetPhrase.toLowerCase().replace(/[^a-z0-9]/g, "");
        const input = phraseInput.toLowerCase().replace(/[^a-z0-9]/g, "");
        return target === input;
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
                    <button onClick={() => navigate("/watched-lessons")} className="text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
                            {star.type === "GRAMMAR" ? "Grammar Rules" : star.type === "READING" ? "Reading Practice" : "Phrase Building"}
                        </div>
                        <h1 className="font-display font-bold text-lg">{star.name}</h1>
                    </div>
                </div>
            </header>

            <main className="pt-24 px-4 mx-auto max-w-3xl">
                {star.type === "GRAMMAR" && (
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                                <Sparkles className="w-6 h-6 text-purple-400" />
                            </div>
                            <h2 className="text-xl font-bold mb-4">Правило</h2>
                            <p className="text-muted-foreground leading-relaxed mb-6">
                                {star.metadata?.rule || "Правило не знайдено."}
                            </p>
                            <div className="bg-muted/50 rounded-xl p-4 border border-border">
                                <span className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Приклад</span>
                                <p className="font-medium text-lg">"{star.metadata?.example || "Приклад відсутній"}"</p>
                            </div>
                        </div>
                    </div>
                )}

                {star.type === "READING" && (
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                                <BookOpen className="w-6 h-6 text-blue-400" />
                            </div>
                            <h2 className="text-xl font-bold mb-4">Прочитайте текст</h2>
                            <p className="text-foreground leading-relaxed mb-6 text-lg">
                                {star.metadata?.text || "Текст відсутній."}
                            </p>
                            <div className="bg-muted/50 rounded-xl p-4 border border-border mt-4">
                                <span className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Запитання</span>
                                <p className="font-medium">{star.metadata?.question || "Прочитайте та запам'ятайте."}</p>
                            </div>
                        </div>
                    </div>
                )}

                {star.type === "PHRASE" && (
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
                                <PenTool className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold mb-4">Побудуйте фразу</h2>
                            <p className="text-muted-foreground leading-relaxed mb-6">
                                Контекст: {star.metadata?.context || "Введіть цільову фразу"}
                            </p>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={phraseInput}
                                    onChange={(e) => setPhraseInput(e.target.value)}
                                    placeholder="Введіть фразу англійською..."
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                {phraseInput.length > 0 && isPhraseValid() && (
                                    <div className="text-emerald-400 text-sm flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Відмінно!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <button
                        onClick={handleComplete}
                        disabled={completing || (star.type === "PHRASE" && !isPhraseValid())}
                        className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                    >
                        {completing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        Завершити та продовжити
                    </button>
                </div>
            </main>
        </div>
    );
}