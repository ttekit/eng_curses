import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Captions,
  ChevronDown,
  Eye,
  ExternalLink,
  Layers,
  ListVideo,
  Play,
  Plus,
  RefreshCw,
  Search,
  Tags,
  Trash2,
  Upload,
  Video,
  Edit,
  X,
  Link as LinkIcon,
  FileArchive,
  Image as ImageIcon,
} from "lucide-react";
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
  AdminInput,
  AdminModal,
  AdminProgress,
  AdminTextarea,
} from "../../components/admin/adminUi";
import { cn } from "../../lib/utils";
import {
  AdminRowMenu,
  AdminRowMenuItem,
} from "../../components/admin/AdminRowMenu";
import { videoLevelBadge } from "../../lib/adminVideosApi";

import {
  useAdminVideos,
  getPaginationRange,
  ADMIN_PAGE_SIZE,
} from "../../hooks/useAdminVideos";

export const genres = [
  { name: "Action" },
  { name: "Adventure" },
  { name: "Animation" },
  { name: "Comedy" },
  { name: "Crime" },
  { name: "Documentary" },
  { name: "Drama" },
  { name: "Family" },
  { name: "Fantasy" },
  { name: "History" },
  { name: "Horror" },
  { name: "Musical" },
  { name: "Mystery" },
  { name: "Noir" },
  { name: "Romance" },
  { name: "Sci-Fi" },
  { name: "Sports" },
  { name: "Thriller" },
  { name: "War" },
  { name: "Western" },
];

function CustomSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);
  return (
    <div className={cn("relative w-full text-sm", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2.5 text-left text-foreground focus:outline-none transition-colors cursor-pointer shadow-sm focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 ring-offset-background",
          isOpen ? "border-primary" : "border-input hover:border-primary/50",
        )}
      >
        <span className="truncate">{selectedOption?.label || value}</span>
        <ChevronDown
          className={cn(
            "ml-2 size-4 shrink-0 transition-transform opacity-70",
            isOpen && "rotate-180 text-primary",
          )}
        />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl animate-in fade-in zoom-in-95">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center px-3 py-2 text-left transition-colors hover:bg-muted cursor-pointer",
                value === opt.value
                  ? "text-primary font-medium bg-primary/10"
                  : "text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChipList({
  tags,
  emptyLabel,
}: {
  tags: string[];
  emptyLabel: string;
}) {
  const list = (tags ?? []).filter((t) => t.trim().length > 0);
  if (list.length === 0)
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {list.map((t, i) => (
        <AdminBadge
          key={`${t}-${i}`}
          variant="secondary"
          className="max-w-full truncate font-normal"
        >
          {t}
        </AdminBadge>
      ))}
    </div>
  );
}

export default function AdminVideosPage() {
  const navigate = useNavigate();
  const adminData = useAdminVideos();
  const {
    loading,
    loadError,
    searchQuery,
    setSearchQuery,
    ageFilter,
    setAgeFilter,
    genreFilter,
    setGenreFilter,
    levelFilter,
    setLevelFilter,
    currentPage,
    setCurrentPage,
    listTopRef,
    scrollToListTop,
    uploadOpen,
    setUploadOpen,
    uploadMode,
    setUploadMode,
    uploadLink,
    setUploadLink,
    uploadTitle,
    setUploadTitle,
    uploadDesc,
    setUploadDesc,
    uploadAge,
    setUploadAge,
    uploadFile,
    setUploadFile,
    uploadThumb,
    setUploadThumb,
    uploadSaving,
    handleUpload,
    editing,
    setEditing,
    editName,
    setEditName,
    editDesc,
    setEditDesc,
    editAge,
    setEditAge,
    editThumb,
    setEditThumb,
    editSaving,
    regenBusy,
    openEdit,
    handleSaveEdit,
    handleRegenThemeTags,
    handleRegenLevelTags,
    handleRegenCaptions,
    editSeriesGroup,
    setEditSeriesGroup,
    editSeriesName,
    setEditSeriesName,
    editSeriesSaving,
    openEditSeries,
    handleSaveSeriesEdit,
    deleteCandidate,
    setDeleteCandidate,
    deleteSaving,
    handleConfirmDelete,
    reorderBusy,
    moveEpisodeInSeries,
    addEpisodeOpen,
    setAddEpisodeOpen,
    addEpisodeMode,
    setAddEpisodeMode,
    addEpisodeLink,
    setAddEpisodeLink,
    addEpisodeSeries,
    addEpisodeTitle,
    setAddEpisodeTitle,
    addEpisodeDesc,
    setAddEpisodeDesc,
    addEpisodeAge,
    setAddEpisodeAge,
    addEpisodeFile,
    setAddEpisodeFile,
    addEpisodeThumb,
    setAddEpisodeThumb,
    addEpisodeSaving,
    openAddEpisodeForSeries,
    handleAddEpisodeSubmit,
    inspectMeta,
    setInspectMeta,
    subtitleText,
    subtitleLoading,
    subtitleError,
    stats,
    totalPages,
    paginatedSeries,
    filtered,
    groupedSeries,
    loadVideos,
  } = adminData;

  const levelFor = videoLevelBadge;
  const ratingProgress = (r: number) =>
    Math.min(100, Math.round((Math.max(0, r) / 5) * 100));

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden min-w-0 pb-10">
      {/* Шапка */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Videos
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground break-words whitespace-normal">
            Catalog from{" "}
            <code className="text-[11px] whitespace-normal break-all rounded bg-muted/50 px-1 py-0.5">
              GET /content-video
            </code>
            ; upload{" "}
            <code className="text-[11px] whitespace-normal break-all rounded bg-muted/50 px-1 py-0.5">
              POST /contents/create
            </code>
            ; series order{" "}
            <code className="text-[11px] whitespace-normal break-all rounded bg-muted/50 px-1 py-0.5">
              PATCH /contents/:id/playlist
            </code>
            .
          </p>
        </div>
        <AdminButton
          className="gap-2 flex shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-semibold items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
          onClick={() => setUploadOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Upload video
        </AdminButton>
      </div>

      {/* Модалка: Upload */}
      <AdminModal
        open={uploadOpen}
        onClose={() => !uploadSaving && setUploadOpen(false)}
        title="Upload new video"
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setUploadOpen(false)}
              disabled={uploadSaving}
            >
              Cancel
            </AdminButton>
            <AdminButton
              disabled={uploadSaving}
              onClick={() => void handleUpload()}
            >
              {uploadSaving ? "Publishing…" : "Publish"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${uploadMode === "file" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setUploadMode("file")}
            >
              MP4 File
            </button>
            <button
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${uploadMode === "zip" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setUploadMode("zip")}
            >
              ZIP (HLS)
            </button>
            <button
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${uploadMode === "link" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setUploadMode("link")}
            >
              M3U8 Link
            </button>
          </div>
          {uploadMode === "file" ? (
            <label className="block cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50">
              <input
                type="file"
                accept="video/mp4"
                className="hidden"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              />
              <Upload className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Browse for MP4 video</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {uploadFile ? uploadFile.name : "Single MP4 file"}
              </p>
            </label>
          ) : uploadMode === "zip" ? (
            <label className="block cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50">
              <input
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              />
              <FileArchive className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Browse for ZIP archive</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[250px] mx-auto">
                {uploadFile
                  ? uploadFile.name
                  : "Select a .zip containing your .m3u8 and .ts files."}
              </p>
            </label>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" /> HLS
                Playlist URL (.m3u8)
              </label>
              <AdminInput
                placeholder="https://cdn.explys.com/video/playlist.m3u8"
                value={uploadLink}
                onChange={(e) => setUploadLink(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2 mt-4 border-t border-border pt-4">
            <label className="text-sm font-medium">
              Custom Thumbnail (Cover)
            </label>
            <label className="block cursor-pointer rounded-lg border-2 border-dashed border-border p-4 text-center transition-colors hover:border-primary/50">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setUploadThumb(e.target.files?.[0] ?? null)}
              />
              {uploadThumb ? (
                <p className="text-sm font-medium text-primary">
                  {uploadThumb.name}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click to upload cover image (.jpg, .png)
                </p>
              )}
            </label>
            <p className="text-[11px] text-muted-foreground">
              Optional. If not provided, it auto-generates directly from the MP4
              or ZIP contents.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2 border-t border-border pt-4">
              <label className="text-sm font-medium" htmlFor="admin-vid-title">
                Title (video name)
              </label>
              <AdminInput
                id="admin-vid-title"
                placeholder="Title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Age Restriction / Возрастное ограничение
            </label>
            <CustomSelect
              value={uploadAge}
              onChange={setUploadAge}
              options={[
                { value: "0+", label: "0+" },
                { value: "6+", label: "6+" },
                { value: "12+", label: "12+" },
                { value: "16+", label: "16+" },
                { value: "18+", label: "18+" },
                { value: "21+", label: "21+" },
              ]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="admin-vid-desc">
              Lesson / series description
            </label>
            <AdminTextarea
              id="admin-vid-desc"
              className="min-h-[96px]"
              placeholder="Shown in catalog (max 250 characters)…"
              value={uploadDesc}
              maxLength={250}
              onChange={(e) => setUploadDesc(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Friendly URL slug is generated automatically.
            </p>
          </div>
        </div>
      </AdminModal>

      {/* Модалка: Add Episode */}
      <AdminModal
        open={addEpisodeOpen}
        onClose={() => !addEpisodeSaving && setAddEpisodeOpen(false)}
        title={
          addEpisodeSeries
            ? `Add episode · ${addEpisodeSeries.seriesName}`
            : "Add episode"
        }
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setAddEpisodeOpen(false)}
              disabled={addEpisodeSaving}
            >
              Cancel
            </AdminButton>
            <AdminButton
              disabled={addEpisodeSaving}
              onClick={() => void handleAddEpisodeSubmit()}
            >
              {addEpisodeSaving ? "Uploading…" : "Add episode"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${addEpisodeMode === "file" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setAddEpisodeMode("file")}
            >
              MP4 File
            </button>
            <button
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${addEpisodeMode === "zip" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setAddEpisodeMode("zip")}
            >
              ZIP (HLS)
            </button>
            <button
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${addEpisodeMode === "link" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setAddEpisodeMode("link")}
            >
              M3U8 Link
            </button>
          </div>
          {addEpisodeMode === "file" ? (
            <label className="block cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50">
              <input
                type="file"
                accept="video/mp4"
                className="hidden"
                onChange={(e) => setAddEpisodeFile(e.target.files?.[0] ?? null)}
              />
              <Upload className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Video file</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {addEpisodeFile ? addEpisodeFile.name : "Required"}
              </p>
            </label>
          ) : addEpisodeMode === "zip" ? (
            <label className="block cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50">
              <input
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => setAddEpisodeFile(e.target.files?.[0] ?? null)}
              />
              <FileArchive className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">ZIP Archive</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[250px] mx-auto">
                {addEpisodeFile
                  ? addEpisodeFile.name
                  : "Select a .zip containing your HLS files."}
              </p>
            </label>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" /> HLS
                Playlist URL (.m3u8)
              </label>
              <AdminInput
                placeholder="https://cdn.explys.com/video/playlist.m3u8"
                value={addEpisodeLink}
                onChange={(e) => setAddEpisodeLink(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2 mt-4 border-t border-border pt-4">
            <label className="text-sm font-medium">
              Custom Thumbnail (Cover)
            </label>
            <label className="block cursor-pointer rounded-lg border-2 border-dashed border-border p-4 text-center transition-colors hover:border-primary/50">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setAddEpisodeThumb(e.target.files?.[0] ?? null)
                }
              />
              {addEpisodeThumb ? (
                <p className="text-sm font-medium text-primary">
                  {addEpisodeThumb.name}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click to upload cover image (.jpg, .png)
                </p>
              )}
            </label>
          </div>
          <div className="space-y-2 border-t border-border pt-4">
            <label className="text-sm font-medium" htmlFor="admin-ep-title">
              Episode title
            </label>
            <AdminInput
              id="admin-ep-title"
              placeholder="Episode title"
              value={addEpisodeTitle}
              onChange={(e) => setAddEpisodeTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Age Restriction / Возрастное ограничение
            </label>
            <CustomSelect
              value={addEpisodeAge}
              onChange={setAddEpisodeAge}
              options={[
                { value: "0+", label: "0+" },
                { value: "6+", label: "6+" },
                { value: "12+", label: "12+" },
                { value: "16+", label: "16+" },
                { value: "18+", label: "18+" },
                { value: "21+", label: "21+" },
              ]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="admin-ep-desc">
              Description (optional)
            </label>
            <AdminTextarea
              id="admin-ep-desc"
              className="min-h-[72px]"
              placeholder="Shown on catalog cards…"
              value={addEpisodeDesc}
              maxLength={2000}
              onChange={(e) => setAddEpisodeDesc(e.target.value)}
            />
          </div>
        </div>
      </AdminModal>

      {/* Модалка: Edit */}
      <AdminModal
        open={editing != null}
        onClose={() => !editSaving && !regenBusy && setEditing(null)}
        title={`Edit · ${editing?.videoName ?? ""}`}
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={editSaving || !!regenBusy}
            >
              Cancel
            </AdminButton>
            <AdminButton
              disabled={editSaving || !!regenBusy}
              onClick={() => void handleSaveEdit()}
            >
              {editSaving ? "Saving…" : "Save"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="admin-edit-vid-name"
            >
              Video title
            </label>
            <AdminInput
              id="admin-edit-vid-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Age Restriction</label>
            <CustomSelect
              value={editAge}
              onChange={setEditAge}
              options={[
                { value: "0+", label: "0+" },
                { value: "6+", label: "6+" },
                { value: "12+", label: "12+" },
                { value: "16+", label: "16+" },
                { value: "18+", label: "18+" },
                { value: "21+", label: "21+" },
              ]}
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="admin-edit-vid-desc"
            >
              Description
            </label>
            <AdminTextarea
              id="admin-edit-vid-desc"
              className="min-h-[96px]"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
          </div>
          <div className="space-y-2 border-border border-t pt-4">
            <label className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-muted-foreground" /> Change
              Thumbnail
            </label>
            <label className="block cursor-pointer rounded-lg border border-border p-3 text-center bg-muted/40 transition-colors hover:border-primary/50">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setEditThumb(e.target.files?.[0] ?? null)}
              />
              {editThumb ? (
                <p className="text-sm font-medium text-primary truncate">
                  {editThumb.name}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click to upload a new cover image
                </p>
              )}
            </label>
          </div>
          <div className="space-y-2 border-border border-t pt-4">
            <p className="text-sm font-medium">Transcript metadata</p>
            <p className="text-xs text-muted-foreground">
              <strong>Captions:</strong> the server FFmpeg-decodes speech to
              WAV. <strong>Catalog genres</strong> and{" "}
              <strong>CEFR bands</strong> use WebVTT + Gemini.
            </p>
            <div className="flex flex-wrap gap-2">
              <AdminButton
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={editSaving || !!regenBusy}
                onClick={() => void handleRegenCaptions()}
              >
                <Captions className="h-4 w-4" />
                {regenBusy === "captions" ? "Working…" : "Regenerate captions"}
              </AdminButton>
              <AdminButton
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={editSaving || !!regenBusy}
                onClick={() => void handleRegenThemeTags()}
              >
                <Tags className="h-4 w-4" />
                {regenBusy === "tags" ? "Working…" : "Regenerate genres"}
              </AdminButton>
              <AdminButton
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={editSaving || !!regenBusy}
                onClick={() => void handleRegenLevelTags()}
              >
                <Layers className="h-4 w-4" />
                {regenBusy === "cefr" ? "Working…" : "Regenerate CEFR"}
              </AdminButton>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Series label:{" "}
            <span className="text-foreground">
              {editing?.content.category.name ?? ""}
            </span>
          </p>
        </div>
      </AdminModal>

      {/* Модалка: Edit Series */}
      <AdminModal
        open={editSeriesGroup != null}
        onClose={() => !editSeriesSaving && setEditSeriesGroup(null)}
        title="Edit series name"
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setEditSeriesGroup(null)}
              disabled={editSeriesSaving}
            >
              Cancel
            </AdminButton>
            <AdminButton
              disabled={editSeriesSaving}
              onClick={() => void handleSaveSeriesEdit()}
            >
              {editSeriesSaving ? "Saving…" : "Save"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="admin-edit-series-name"
            >
              Playlist (Series) Name
            </label>
            <AdminInput
              id="admin-edit-series-name"
              value={editSeriesName}
              onChange={(e) => setEditSeriesName(e.target.value)}
            />
          </div>
        </div>
      </AdminModal>

      {/* Модалка: Delete */}
      <AdminModal
        open={deleteCandidate != null}
        onClose={() => !deleteSaving && setDeleteCandidate(null)}
        title={
          deleteCandidate?.mode === "series"
            ? "Remove series from catalog"
            : "Remove episode"
        }
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setDeleteCandidate(null)}
              disabled={deleteSaving}
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              disabled={deleteSaving}
              onClick={() => void handleConfirmDelete()}
            >
              {deleteSaving ? "Removing…" : "Delete"}
            </AdminButton>
          </>
        }
      >
        {deleteCandidate?.mode === "series" ? (
          <p className="text-sm text-foreground">
            Delete <strong>{deleteCandidate.video.videoName}</strong> and its
            catalog entry (series{" "}
            <strong>{deleteCandidate.video.content.category.name}</strong>)?
          </p>
        ) : (
          <p className="text-sm text-foreground">
            Delete the episode{" "}
            <strong>{deleteCandidate?.video.videoName}</strong> from the series{" "}
            <strong>{deleteCandidate?.video.content.category.name}</strong>?
          </p>
        )}
      </AdminModal>

      {/* Модалка: Inspect Meta */}
      <AdminModal
        open={inspectMeta != null}
        onClose={() => setInspectMeta(null)}
        title={inspectMeta?.video.videoName ?? "Video metadata"}
        footer={
          <AdminButton variant="outline" onClick={() => setInspectMeta(null)}>
            Close
          </AdminButton>
        }
      >
        {inspectMeta ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 border-border border-b pb-3">
              <AdminButton
                type="button"
                size="sm"
                variant={inspectMeta.tab === "themes" ? "primary" : "outline"}
                className="gap-1.5"
                onClick={() =>
                  setInspectMeta({ ...inspectMeta, tab: "themes" })
                }
              >
                <Tags className="h-4 w-4" />
                Genres
              </AdminButton>
              <AdminButton
                type="button"
                size="sm"
                variant={inspectMeta.tab === "levels" ? "primary" : "outline"}
                className="gap-1.5"
                onClick={() =>
                  setInspectMeta({ ...inspectMeta, tab: "levels" })
                }
              >
                <Layers className="h-4 w-4" />
                CEFR level
              </AdminButton>
              <AdminButton
                type="button"
                size="sm"
                variant={inspectMeta.tab === "subs" ? "primary" : "outline"}
                className="gap-1.5"
                onClick={() => setInspectMeta({ ...inspectMeta, tab: "subs" })}
              >
                <Captions className="h-4 w-4" />
                Subtitles
              </AdminButton>
            </div>
            {inspectMeta.tab === "themes" ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Catalog genres
                </p>
                <ChipList
                  tags={inspectMeta.video.content.stats?.userTags ?? []}
                  emptyLabel="No genres yet."
                />
              </div>
            ) : null}
            {inspectMeta.tab === "levels" ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    CEFR bands
                  </p>
                  <ChipList
                    tags={inspectMeta.video.content.stats?.systemTags ?? []}
                    emptyLabel="No CEFR bands yet."
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Processing complexity:{" "}
                  <span className="font-medium text-foreground">
                    {inspectMeta.video.content.stats?.processingComplexity !=
                    null
                      ? inspectMeta.video.content.stats.processingComplexity
                      : "—"}
                  </span>
                </p>
              </div>
            ) : null}
            {inspectMeta.tab === "subs" ? (
              <div className="space-y-3">
                {inspectMeta.video.videoCaption?.subtitlesFileLink ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Loaded via{" "}
                      <code className="text-[11px]">
                        GET /content-video/:id/subtitles
                      </code>
                    </p>
                    <a
                      href={inspectMeta.video.videoCaption.subtitlesFileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-sm text-primary underline-offset-4 hover:underline break-all"
                    >
                      Open raw file on storage
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No captions row yet.
                  </p>
                )}
                {subtitleLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading WebVTT…
                  </p>
                ) : null}
                {subtitleError ? (
                  <p className="text-sm text-destructive">{subtitleError}</p>
                ) : null}
                {subtitleText ? (
                  <pre className="max-h-[min(420px,50vh)] overflow-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-[11px] whitespace-pre-wrap break-all">
                    {subtitleText}
                  </pre>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </AdminModal>

      {/* Ошибки загрузки и Статистика */}
      {loadError && (
        <AdminCard className="border-destructive/40">
          <AdminCardContent className="p-6 text-sm text-destructive">
            {loadError}
          </AdminCardContent>
        </AdminCard>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminCard>
          <AdminCardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loading ? "…" : stats.total}
              </p>
              <p className="text-sm text-muted-foreground">Videos</p>
            </div>
          </AdminCardContent>
        </AdminCard>
        <AdminCard>
          <AdminCardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Video className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loading ? "…" : stats.seriesCount}
              </p>
              <p className="text-sm text-muted-foreground">Series titles</p>
            </div>
          </AdminCardContent>
        </AdminCard>
        <AdminCard>
          <AdminCardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Eye className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loading ? "…" : stats.watchers.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Completed watches</p>
            </div>
          </AdminCardContent>
        </AdminCard>
        <AdminCard>
          <AdminCardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
              <BarChart3 className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loading ? "…" : stats.avgRating.toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Avg rating</p>
            </div>
          </AdminCardContent>
        </AdminCard>
      </div>

      {/* Главный блок со списком */}
      <AdminCard>
        <div ref={listTopRef} className="scroll-mt-24" />
        <AdminCardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-border border-b pt-6">
          <AdminButton
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={loading}
            onClick={() => void loadVideos()}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin opacity-70" : ""}`}
            />
            Refresh
          </AdminButton>
        </AdminCardHeader>
        <AdminCardHeader className="border-border border-b pb-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 opacity-70" />
              <AdminInput
                className="pl-10 pr-10"
                placeholder="Search videos…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50 flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <CustomSelect
                value={ageFilter}
                onChange={setAgeFilter}
                className="w-[140px]"
                options={[
                  { value: "all", label: "All ages" },
                  { value: "0+", label: "0+" },
                  { value: "6+", label: "6+" },
                  { value: "12+", label: "12+" },
                  { value: "16+", label: "16+" },
                  { value: "18+", label: "18+" },
                  { value: "21+", label: "21+" },
                ]}
              />
              <CustomSelect
                value={genreFilter}
                onChange={setGenreFilter}
                className="w-[160px]"
                options={[
                  { value: "all", label: "All genres" },
                  ...genres.map((g) => ({ value: g.name, label: g.name })),
                ]}
              />
              <CustomSelect
                value={levelFilter}
                onChange={setLevelFilter}
                className="w-[160px]"
                options={[
                  { value: "all", label: "All levels" },
                  ...["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => ({
                    value: l,
                    label: l,
                  })),
                  { value: "__misc", label: "Other / no CEFR tag" },
                ]}
              />
            </div>
          </div>
        </AdminCardHeader>
        <AdminCardContent className="p-6">
          {loading ? (
            <p className="py-16 text-center text-muted-foreground">
              Loading catalog…
            </p>
          ) : groupedSeries.length === 0 ? (
            <div className="py-12 text-center">
              <Video className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No videos match filters</p>
            </div>
          ) : (
            <div className="space-y-10">
              {paginatedSeries.map((group) => (
                <div key={group.contentRootId} className="space-y-4">
                  <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          {group.seriesName}
                        </h3>
                        <button
                          type="button"
                          onClick={() => openEditSeries(group)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {group.rows.length}{" "}
                        {group.rows.length === 1 ? "episode" : "episodes"}
                        {group.rows.length > 1 &&
                          " · use arrows to set playlist order"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {group.friendlyLink && (
                        <Link
                          to={`/catalog/series/${encodeURIComponent(group.friendlyLink)}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-primary transition-colors hover:bg-muted"
                        >
                          <ListVideo className="h-4 w-4" />
                          Learner playlist
                          <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                        </Link>
                      )}
                      <AdminButton
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => openAddEpisodeForSeries(group)}
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                        Add episode
                      </AdminButton>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {group.rows.map((video, episodeIndex) => {
                      const watchers = video.content.stats?.usersWatched ?? 0;
                      const rating = video.content.stats?.rating ?? 0;
                      const lvl = levelFor(video);
                      return (
                        <div
                          key={video.id}
                          className="rounded-lg border border-border bg-muted/30 transition-colors hover:border-primary/40"
                        >
                          <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-accent/20" />
                            )}
                            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                              <AdminBadge variant="accent">
                                {video.ageRestriction || "0+"}
                              </AdminBadge>
                              {group.rows.length > 1 && (
                                <AdminBadge variant="secondary">
                                  #{episodeIndex + 1}
                                </AdminBadge>
                              )}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                              <a
                                href={`/content/${video.id}`}
                                target="_blank"
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 shadow-lg"
                              >
                                <Play className="ml-1 h-6 w-6 text-primary-foreground" />
                              </a>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <AdminCardTitle className="truncate text-base">
                                  {video.videoName}
                                </AdminCardTitle>
                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                  {video.videoDescription?.trim() ||
                                    video.content.category.description}
                                </p>
                              </div>
                              <AdminCardHeader className="p-0 border-0 flex bg-transparent">
                                <AdminRowMenu>
                                  <AdminRowMenuItem
                                    onClick={() =>
                                      void window.open(
                                        `/content/${video.id}`,
                                        "_blank",
                                      )
                                    }
                                  >
                                    <Play className="h-4 w-4" /> Preview
                                  </AdminRowMenuItem>
                                  <AdminRowMenuItem
                                    onClick={() =>
                                      setInspectMeta({ video, tab: "themes" })
                                    }
                                  >
                                    <Tags className="h-4 w-4" /> Genres
                                  </AdminRowMenuItem>
                                  <AdminRowMenuItem
                                    onClick={() =>
                                      setInspectMeta({ video, tab: "levels" })
                                    }
                                  >
                                    <Layers className="h-4 w-4" /> CEFR level
                                  </AdminRowMenuItem>
                                  <AdminRowMenuItem
                                    onClick={() =>
                                      setInspectMeta({ video, tab: "subs" })
                                    }
                                  >
                                    <Captions className="h-4 w-4" /> Subtitles
                                  </AdminRowMenuItem>
                                  <AdminRowMenuItem
                                    onClick={() => openEdit(video)}
                                  >
                                    <Edit className="h-4 w-4" /> Edit
                                  </AdminRowMenuItem>
                                  <AdminRowMenuItem
                                    onClick={() => navigate("/admin/analytics")}
                                  >
                                    <BarChart3 className="h-4 w-4" /> Analytics
                                  </AdminRowMenuItem>
                                  <AdminRowMenuItem
                                    danger
                                    onClick={() =>
                                      setDeleteCandidate({
                                        video,
                                        mode: "series",
                                      })
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" /> Delete series
                                  </AdminRowMenuItem>
                                </AdminRowMenu>
                              </AdminCardHeader>
                            </div>
                            {group.rows.length > 1 && (
                              <div className="mt-2 flex gap-2">
                                <AdminButton
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="gap-1"
                                  disabled={reorderBusy || episodeIndex === 0}
                                  onClick={() =>
                                    void moveEpisodeInSeries(
                                      group,
                                      episodeIndex,
                                      -1,
                                    )
                                  }
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                  Up
                                </AdminButton>
                                <AdminButton
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="gap-1"
                                  disabled={
                                    reorderBusy ||
                                    episodeIndex >= group.rows.length - 1
                                  }
                                  onClick={() =>
                                    void moveEpisodeInSeries(
                                      group,
                                      episodeIndex,
                                      1,
                                    )
                                  }
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                  Down
                                </AdminButton>
                              </div>
                            )}
                            <div className="mt-3 flex flex-wrap gap-2">
                              <AdminBadge variant="secondary">{lvl}</AdminBadge>
                              <AdminBadge variant="outline">
                                {video.content.category.name}
                              </AdminBadge>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-border border-t pt-4">
                              <span className="flex min-w-[4rem] items-center gap-1 text-sm text-muted-foreground">
                                <Eye className="h-4 w-4" />
                                {watchers.toLocaleString()}
                              </span>
                              <div className="flex max-w-[120px] flex-1 items-center gap-2">
                                <AdminProgress value={ratingProgress(rating)} />
                                <span className="text-xs whitespace-nowrap text-muted-foreground">
                                  {rating > 0 ? rating.toFixed(1) : "—"}
                                </span>
                              </div>
                              <AdminButton
                                variant="outline"
                                size="sm"
                                className="shrink-0 gap-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                                onClick={() =>
                                  setDeleteCandidate({ video, mode: "episode" })
                                }
                                type="button"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete episode
                              </AdminButton>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-12 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      scrollToListTop();
                    }}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center px-4 py-2 min-h-[40px] rounded-lg bg-card border border-border text-foreground font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
                  >
                    Prev
                  </button>
                  {getPaginationRange(currentPage, totalPages).map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="flex items-center justify-center px-2 py-2 min-h-[40px] text-muted-foreground font-medium"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        type="button"
                        onClick={() => {
                          setCurrentPage(p as number);
                          scrollToListTop();
                        }}
                        className={cn(
                          "flex items-center justify-center min-w-[40px] px-3 py-2 min-h-[40px] rounded-lg font-medium text-sm transition-colors cursor-pointer",
                          currentPage === p
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-card border border-border text-foreground hover:bg-muted",
                        )}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      scrollToListTop();
                    }}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center px-4 py-2 min-h-[40px] rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-hover transition-all cursor-pointer shadow-md"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
          {!loading && (
            <p className="mt-6 text-center text-sm text-muted-foreground border-t border-border pt-6">
              Showing series {(currentPage - 1) * ADMIN_PAGE_SIZE + 1} &mdash;{" "}
              {Math.min(currentPage * ADMIN_PAGE_SIZE, groupedSeries.length)} of{" "}
              {groupedSeries.length} (filtered, {filtered.length} total
              episodes)
            </p>
          )}
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
