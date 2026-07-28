import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Sparkles, Trash2, RefreshCw } from "lucide-react";
import {
    AdminBadge,
    AdminButton,
    AdminCard,
    AdminCardContent,
    AdminInput,
    AdminModal,
    AdminSelectNative,
    AdminTable,
} from "../../components/admin/adminUi";
import {
    AdminRowMenu,
    AdminRowMenuItem,
} from "../../components/admin/AdminRowMenu";
import type { Constellation } from "../../lib/constellationApi";
import {
    deleteAdminConstellation,
    fetchAdminConstellations,
    generateAdminConstellation,
} from "../../lib/adminConstellationsApi";

export default function AdminConstellationsPage() {
    const [constellations, setConstellations] = useState<Constellation[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [genOpen, setGenOpen] = useState(false);
    const [domain, setDomain] = useState("");
    const [cefrLevel, setCefrLevel] = useState("B1");
    const [generating, setGenerating] = useState(false);

    const [deleteCandidate, setDeleteCandidate] = useState<Constellation | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadData = useCallback(async () => {
        setLoadError(null);
        try {
            setLoading(true);
            const rows = await fetchAdminConstellations();
            setConstellations(rows);
        } catch (e) {
            setLoadError(e instanceof Error ? e.message : "Failed to load constellations");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const handleGenerate = async () => {
        const cleanDomain = domain.trim();
        if (!cleanDomain) {
            toast.error("Please enter a domain or topic (e.g. IT & Technology)");
            return;
        }
        setGenerating(true);
        try {
            await generateAdminConstellation({
                domain: cleanDomain,
                cefrLevel,
            });
            toast.success(`Constellation generated successfully for ${cefrLevel}!`);
            setGenOpen(false);
            setDomain("");
            setCefrLevel("B1");
            await loadData();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "AI Generation failed");
        } finally {
            setGenerating(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteCandidate) return;
        setDeleting(true);
        try {
            await deleteAdminConstellation(deleteCandidate.id);
            toast.success(`Constellation "${deleteCandidate.name}" deleted`);
            setDeleteCandidate(null);
            await loadData();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Delete failed");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-purple-500" />
                        Constellations & Learning Plan
                    </h1>
                    <p className="text-muted-foreground">
                        Manage interactive star paths and generate new learning maps using Gemini AI.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <AdminButton
                        variant="outline"
                        onClick={() => void loadData()}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </AdminButton>
                    <AdminButton
                        className="gap-2 flex rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 transition-colors shadow-sm"
                        onClick={() => setGenOpen(true)}
                    >
                        <Sparkles className="h-4 w-4" />
                        Generate with AI
                    </AdminButton>
                </div>
            </div>

            <AdminModal
                open={genOpen}
                onClose={() => !generating && setGenOpen(false)}
                title="Generate Constellation with Gemini AI"
                footer={
                    <>
                        <AdminButton
                            variant="outline"
                            onClick={() => setGenOpen(false)}
                            disabled={generating}
                        >
                            Cancel
                        </AdminButton>
                        <AdminButton
                            onClick={() => void handleGenerate()}
                            disabled={generating}
                            className="bg-purple-600 hover:bg-purple-500 text-white"
                        >
                            {generating ? "Generating (~10s)..." : "Generate Now"}
                        </AdminButton>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="gen-domain">
                            Topic / Domain
                        </label>
                        <AdminInput
                            id="gen-domain"
                            placeholder="e.g. IT & Technology, Business English, Everyday Grammar"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            disabled={generating}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="gen-level">
                            CEFR Target Level
                        </label>
                        <AdminSelectNative
                            id="gen-level"
                            className="w-full"
                            value={cefrLevel}
                            onChange={(e) => setCefrLevel(e.target.value)}
                            disabled={generating}
                        >
                            {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                                <option key={lvl} value={lvl}>
                                    {lvl} — {lvl === "A1" || lvl === "A2" ? "Beginner/Elementary" : lvl === "B1" || lvl === "B2" ? "Intermediate" : "Advanced"}
                                </option>
                            ))}
                        </AdminSelectNative>
                    </div>
                </div>
            </AdminModal>

            <AdminModal
                open={deleteCandidate != null}
                onClose={() => !deleting && setDeleteCandidate(null)}
                title="Delete Constellation"
                footer={
                    <>
                        <AdminButton
                            variant="outline"
                            onClick={() => setDeleteCandidate(null)}
                            disabled={deleting}
                        >
                            Cancel
                        </AdminButton>
                        <AdminButton
                            variant="danger"
                            disabled={deleting}
                            onClick={() => void handleConfirmDelete()}
                        >
                            {deleting ? "Deleting…" : "Delete permanently"}
                        </AdminButton>
                    </>
                }
            >
                <p className="text-sm text-foreground">
                    Permanently remove <strong>{deleteCandidate?.name}</strong>? All associated stars and learner progress for this constellation will be removed.
                </p>
            </AdminModal>

            {loadError ? (
                <AdminCard className="border-destructive/40">
                    <AdminCardContent className="p-6 text-sm text-destructive">
                        {loadError}
                    </AdminCardContent>
                </AdminCard>
            ) : null}

            <AdminCard>
                <AdminTable>
                    <thead>
                        <tr className="border-border border-b">
                            <th className="p-4 text-left text-muted-foreground">ID</th>
                            <th className="p-4 text-left text-muted-foreground">Constellation Name</th>
                            <th className="p-4 text-left text-muted-foreground">Description</th>
                            <th className="p-4 text-left text-muted-foreground">Stars Count</th>
                            <th className="w-14 p-4" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    Loading constellations…
                                </td>
                            </tr>
                        ) : constellations.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    No constellations found. Click "Generate with AI" above to create one!
                                </td>
                            </tr>
                        ) : (
                            constellations.map((item) => (
                                <tr key={item.id} className="border-border border-b hover:bg-muted/40">
                                    <td className="p-4 font-mono text-xs text-muted-foreground">
                                        #{item.id}
                                    </td>
                                    <td className="p-4 font-semibold text-foreground">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
                                            {item.name}
                                        </div>
                                    </td>
                                    <td className="p-4 text-muted-foreground max-w-md truncate">
                                        {item.description || "—"}
                                    </td>
                                    <td className="p-4">
                                        <AdminBadge variant="secondary">
                                            {item.stars?.length ?? 0} stars
                                        </AdminBadge>
                                    </td>
                                    <td className="p-4">
                                        <AdminRowMenu>
                                            <AdminRowMenuItem
                                                danger
                                                onClick={() => setDeleteCandidate(item)}
                                            >
                                                <Trash2 className="h-4 w-4" /> Delete
                                            </AdminRowMenuItem>
                                        </AdminRowMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </AdminTable>
            </AdminCard>
        </div>
    );
}