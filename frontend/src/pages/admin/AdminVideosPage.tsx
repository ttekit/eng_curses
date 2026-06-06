import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Captions,
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
  Image as ImageIcon
} from "lucide-react";
import { apiFetch } from "../../lib/api";
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
  AdminSelectNative,
  AdminTextarea,
} from "../../components/admin/adminUi";
import { cn } from "../../lib/utils";
import {
  AdminRowMenu,
  AdminRowMenuItem,
} from "../../components/admin/AdminRowMenu";
import type { AdminCatalogVideoRow } from "../../lib/adminVideosApi";
import {
  createAdminCatalogVideo,
  deleteAdminCatalogContent,
  fetchAdminCatalogVideos,
  fetchAdminVideoSubtitlesVtt,
  matchesVideoLevelFilter,
  patchAdminSeriesPlaylistOrder,
  postAdminSeriesEpisode,
  regenerateAdminVideoLevelTags,
  regenerateAdminVideoCaptions,
  regenerateAdminVideoThemeTags,
  videoLevelBadge,
} from "../../lib/adminVideosApi";
import { unzipSync } from "fflate";

function generateVideoThumbnailBlob(fileOrUrl: File | Blob | string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.playsInline = true;
    video.muted = true;

    video.src = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);

    video.onloadeddata = () => {
      video.currentTime = 0.5;
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (typeof fileOrUrl !== 'string') URL.revokeObjectURL(video.src);
          if (blob) resolve(blob);
          else reject(new Error("Canvas blob generation failed"));
        },
        "image/jpeg",
        0.85,
      );
    };

    video.onerror = (e) => {
      if (typeof fileOrUrl !== 'string') URL.revokeObjectURL(video.src);
      reject(e);
    };
  });
}

function sortAdminPlaylistRows(
  rows: AdminCatalogVideoRow[],
): AdminCatalogVideoRow[] {
  return [...rows].sort((a, b) => {
    const ma =
      typeof a.content.playlistPosition === "number"
        ? a.content.playlistPosition
        : 0;
    const mb =
      typeof b.content.playlistPosition === "number"
        ? b.content.playlistPosition
        : 0;
    if (ma !== mb) return ma - mb;
    const va = typeof a.playlistPosition === "number" ? a.playlistPosition : 0;
    const vb = typeof b.playlistPosition === "number" ? b.playlistPosition : 0;
    if (va !== vb) return va - vb;
    return a.id - b.id;
  });
}

type AdminVideoSeriesGroup = {
  contentRootId: number;
  seriesName: string;
  friendlyLink: string;
  rows: AdminCatalogVideoRow[];
};

function slugFriendly(label: string): string {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = Date.now().toString(36);
  const slug = `${base}-${suffix}`;
  const trimmed =
    slug.length > 100 ? slug.slice(0, 100).replace(/-[^-]*$/, "") : slug;
  return trimmed?.length >= 4 ? trimmed : `video-${suffix}`;
}

type MetadataInspectTab = "themes" | "levels" | "subs";

function ChipList(props: { tags: string[]; emptyLabel: string }) {
  const { tags, emptyLabel } = props;
  const list = (tags ?? []).filter((t) => t.trim().length > 0);
  if (list.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
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

function getPaginationRange(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function AdminVideosPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<AdminCatalogVideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [seriesFilter, setSeriesFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "link" | "zip">("file");
  const [uploadLink, setUploadLink] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadAge, setUploadAge] = useState("0+");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadThumb, setUploadThumb] = useState<File | null>(null);
  const [uploadSaving, setUploadSaving] = useState(false);

  const [editing, setEditing] = useState<AdminCatalogVideoRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAge, setEditAge] = useState("0+");
  const [editThumb, setEditThumb] = useState<File | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [regenBusy, setRegenBusy] = useState<
    false | "tags" | "cefr" | "captions"
  >(false);

  const [editSeriesGroup, setEditSeriesGroup] = useState<AdminVideoSeriesGroup | null>(null);
  const [editSeriesName, setEditSeriesName] = useState("");
  const [editSeriesSaving, setEditSeriesSaving] = useState(false);

  const [deleteCandidate, setDeleteCandidate] = useState<{
    video: AdminCatalogVideoRow;
    mode: "series" | "episode";
  } | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const [reorderBusy, setReorderBusy] = useState(false);
  const [addEpisodeOpen, setAddEpisodeOpen] = useState(false);
  const [addEpisodeMode, setAddEpisodeMode] = useState<"file" | "link" | "zip">("file");
  const [addEpisodeLink, setAddEpisodeLink] = useState("");
  const [addEpisodeSeries, setAddEpisodeSeries] =
    useState<AdminVideoSeriesGroup | null>(null);
  const [addEpisodeTitle, setAddEpisodeTitle] = useState("");
  const [addEpisodeDesc, setAddEpisodeDesc] = useState("");
  const [addEpisodeAge, setAddEpisodeAge] = useState("0+");
  const [addEpisodeFile, setAddEpisodeFile] = useState<File | null>(null);
  const [addEpisodeThumb, setAddEpisodeThumb] = useState<File | null>(null);
  const [addEpisodeSaving, setAddEpisodeSaving] = useState(false);

  const [inspectMeta, setInspectMeta] = useState<{
    video: AdminCatalogVideoRow;
    tab: MetadataInspectTab;
  } | null>(null);
  const [subtitleText, setSubtitleText] = useState<string | null>(null);
  const [subtitleLoading, setSubtitleLoading] = useState(false);
  const [subtitleError, setSubtitleError] = useState<string | null>(null);

  const seriesNames = useMemo(() => {
    const names = videos
      .map((v) => v.content.category.name.trim())
      .filter(Boolean);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [videos]);

  const loadVideos = useCallback(async (): Promise<
    AdminCatalogVideoRow[] | null
  > => {
    setLoadError(null);
    try {
      setLoading(true);
      const rows = await fetchAdminCatalogVideos();
      setVideos(rows);
      return rows;
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load videos");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVideos();
  }, [loadVideos]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, seriesFilter, levelFilter]);

  useEffect(() => {
    setSubtitleText(null);
    setSubtitleError(null);
    setSubtitleLoading(false);
  }, [inspectMeta?.video.id]);

  useEffect(() => {
    if (!inspectMeta || inspectMeta.tab !== "subs") return;
    const link = inspectMeta.video.videoCaption?.subtitlesFileLink?.trim();
    if (!link) return;
    let cancelled = false;
    setSubtitleLoading(true);
    setSubtitleError(null);
    setSubtitleText(null);
    void fetchAdminVideoSubtitlesVtt(inspectMeta.video.id)
      .then((text) => {
        if (!cancelled) setSubtitleText(text);
      })
      .catch((e) => {
        if (!cancelled) {
          setSubtitleError(
            e instanceof Error ? e.message : "Could not load subtitles",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setSubtitleLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [inspectMeta?.video.id, inspectMeta?.tab]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return videos.filter((v) => {
      const matchSearch =
        v.videoName.toLowerCase().includes(q) ||
        (v.videoDescription ?? "").toLowerCase().includes(q) ||
        v.content.category.name.toLowerCase().includes(q);
      const matchSeries =
        seriesFilter === "all" || v.content.category.name === seriesFilter;
      const matchLevel = matchesVideoLevelFilter(v, levelFilter);
      return matchSearch && matchSeries && matchLevel;
    });
  }, [videos, searchQuery, seriesFilter, levelFilter]);

  const groupedSeries = useMemo((): AdminVideoSeriesGroup[] => {
    const m = new Map<number, AdminCatalogVideoRow[]>();
    for (const v of filtered) {
      const rootId = v.content.category.id;
      const arr = m.get(rootId);
      if (arr) arr.push(v);
      else m.set(rootId, [v]);
    }
    return [...m.entries()]
      .map(([contentRootId, rows]) => {
        const sorted = sortAdminPlaylistRows(rows);
        const first = sorted[0];
        return {
          contentRootId,
          seriesName: first?.content.category.name.trim() ?? "",
          friendlyLink: first?.content.category.friendlyLink.trim() ?? "",
          rows: sorted,
        };
      })
      .sort((a, b) => a.seriesName.localeCompare(b.seriesName));
  }, [filtered]);

  const stats = useMemo(() => {
    const watchers = videos.reduce(
      (a, v) => a + (v.content.stats?.usersWatched ?? 0),
      0,
    );
    let ratingSum = 0;
    let ratingN = 0;
    for (const v of videos) {
      const r = v.content.stats?.rating;
      if (r != null && r > 0) {
        ratingSum += r;
        ratingN += 1;
      }
    }
    const avgRating = ratingN > 0 ? ratingSum / ratingN : 0;
    return {
      total: videos.length,
      watchers,
      avgRating,
      seriesCount: seriesNames.length,
    };
  }, [videos, seriesNames.length]);

  const openEdit = useCallback((v: AdminCatalogVideoRow) => {
    setEditing(v);
    setEditName(v.videoName);
    setEditDesc(v.videoDescription || v.content.category.description || "");
    setEditAge((v as any).ageRestriction || "0+");
    setEditThumb(null);
  }, []);

  const handleSaveEdit = async () => {
    if (!editing) return;
    const name = editName.trim();
    if (name.length < 2) {
      toast.error("Title must be at least 2 characters");
      return;
    }
    setEditSaving(true);
    try {
      const resData = await apiFetch(`/contents/episode/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoName: name,
          videoDescription: editDesc.trim() || null,
          ageRestriction: editAge,
        }),
      });

      if (!resData.ok) {
        throw new Error("Failed to update episode metadata");
      }

      if (editThumb) {
        const fd = new FormData();
        fd.append("thumbnailFile", editThumb);

        const res = await apiFetch(`/contents/episode/${editing.id}/thumbnail`, {
          method: "PATCH",
          body: fd,
        });
        if (!res.ok) throw new Error("Thumbnail update failed");
      }

      toast.success("Video updated");
      setEditing(null);
      setEditThumb(null);
      await loadVideos();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setEditSaving(false);
    }
  };

  const openEditSeries = useCallback((group: AdminVideoSeriesGroup) => {
    setEditSeriesGroup(group);
    setEditSeriesName(group.seriesName);
  }, []);

  const handleSaveSeriesEdit = async () => {
    if (!editSeriesGroup) return;
    const name = editSeriesName.trim();
    if (name.length < 2) {
      toast.error("Series name must be at least 2 characters");
      return;
    }
    setEditSeriesSaving(true);
    try {
      const res = await apiFetch(`/contents/${editSeriesGroup.contentRootId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to update series name");

      toast.success("Series name updated");
      setEditSeriesGroup(null);
      await loadVideos();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setEditSeriesSaving(false);
    }
  };

  const handleRegenThemeTags = async () => {
    if (!editing) return;
    const vid = editing.id;
    setRegenBusy("tags");
    try {
      const r = await regenerateAdminVideoThemeTags(vid);
      if (r.geminiFailed) {
        toast.error("Gemini unavailable — catalog genres unchanged");
      } else {
        toast.success("Catalog genres regenerated");
      }
      const rows = await loadVideos();
      const u = rows?.find((x) => x.id === vid);
      if (u) {
        setEditing(u);
        setEditName(u.videoName);
        setEditDesc(u.videoDescription || u.content.category.description || "");
        setEditAge((u as any).ageRestriction || "0+");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Regeneration failed");
    } finally {
      setRegenBusy(false);
    }
  };

  const handleRegenLevelTags = async () => {
    if (!editing) return;
    const vid = editing.id;
    setRegenBusy("cefr");
    try {
      const r = await regenerateAdminVideoLevelTags(vid);
      if (r.geminiFailed) {
        toast.error("Gemini unavailable — CEFR bands unchanged");
      } else {
        toast.success("CEFR bands regenerated");
      }
      const rows = await loadVideos();
      const u = rows?.find((x) => x.id === vid);
      if (u) {
        setEditing(u);
        setEditName(u.videoName);
        setEditDesc(u.videoDescription || u.content.category.description || "");
        setEditAge((u as any).ageRestriction || "0+");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Regeneration failed");
    } finally {
      setRegenBusy(false);
    }
  };

  const handleRegenCaptions = async () => {
    if (!editing) return;
    const vid = editing.id;
    setRegenBusy("captions");
    try {
      await regenerateAdminVideoCaptions(vid);
      toast.success("Captions regenerated (WebVTT on S3)");
      const rows = await loadVideos();
      const u = rows?.find((x) => x.id === vid);
      if (u) {
        setEditing(u);
        setEditName(u.videoName);
        setEditDesc(u.videoDescription || u.content.category.description || "");
        setEditAge((u as any).ageRestriction || "0+");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Caption generation failed");
    } finally {
      setRegenBusy(false);
    }
  };

  const extractAndGenerateThumbnailFromZip = async (zipFile: File): Promise<Blob | null> => {
    try {
      const arrayBuffer = await zipFile.arrayBuffer();
      const unzipped = unzipSync(new Uint8Array(arrayBuffer));

      let tsFileName = Object.keys(unzipped).find(
        (name) => name.endsWith(".ts") && !name.includes("__MACOSX") && !name.startsWith("._")
      );

      if (!tsFileName) return null;

      const tsData = unzipped[tsFileName];
      if (!tsData) return null;

      const tsBlob = new Blob([tsData], { type: "video/MP2T" });
      return await generateVideoThumbnailBlob(tsBlob);
    } catch (e) {
      console.warn("Failed to extract frame from zip dynamically:", e);
      return null;
    }
  };

  const handleUpload = async () => {
    const name = uploadTitle.trim();
    const description = uploadDesc.trim().slice(0, 250);
    if (name.length < 2 || description.length > 250) {
      toast.error("Title ≥ 2 characters; description ≤ 250.");
      return;
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("friendlyLink", slugFriendly(name));
    fd.append("ageRestriction", uploadAge);
    fd.append(
      "description",
      (description || `${name} — learner catalog.`).slice(0, 250),
    );

    if (uploadMode === "file") {
      if (!uploadFile || !uploadFile.type.startsWith("video/mp4")) {
        toast.error("Choose an MP4 video file.");
        return;
      }
      fd.append("file", uploadFile);
    } else if (uploadMode === "zip") {
      if (!uploadFile || !uploadFile.name.endsWith(".zip")) {
        toast.error("Choose a .zip archive containing your HLS files.");
        return;
      }
      fd.append("file", uploadFile);
    } else {
      const link = uploadLink.trim();
      if (!link.startsWith("https://")) {
        toast.error("Please use a valid HTTPS link to your .m3u8 file.");
        return;
      }
      fd.append("videoLink", link);
    }

    setUploadSaving(true);

    try {
      if (uploadThumb) {
        fd.append("thumbnailFile", uploadThumb);
      } else if (uploadMode === "file" && uploadFile) {
        const thumbBlob = await generateVideoThumbnailBlob(uploadFile);
        fd.append("thumbnailFile", thumbBlob, "thumbnail.jpg");
      } else if (uploadMode === "zip" && uploadFile) {
        const thumbBlob = await extractAndGenerateThumbnailFromZip(uploadFile);
        if (thumbBlob) {
          fd.append("thumbnailFile", thumbBlob, "thumbnail.jpg");
        }
      } else if (uploadMode === "link") {
        try {
          const thumbBlob = await generateVideoThumbnailBlob(uploadLink);
          fd.append("thumbnailFile", thumbBlob, "thumbnail.jpg");
        } catch (e) {
          console.warn("Could not auto-generate thumbnail from link", e);
        }
      }

      await createAdminCatalogVideo(fd);
      toast.success("Video published successfully");
      setUploadOpen(false);
      setUploadTitle("");
      setUploadDesc("");
      setUploadAge("0+");
      setUploadFile(null);
      setUploadLink("");
      setUploadThumb(null);
      await loadVideos();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    setDeleteSaving(true);
    try {
      if (deleteCandidate.mode === "series") {
        const contentRootId = deleteCandidate.video.content.category.id;
        await deleteAdminCatalogContent(contentRootId);
        toast.success(
          `${deleteCandidate.video.videoName} (series) removed from catalog`,
        );
      } else {
        const contentMediaId = deleteCandidate.video.content.id;
        const res = await apiFetch(`/contents/episode/${contentMediaId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete episode");
        toast.success(`Episode ${deleteCandidate.video.videoName} removed`);
      }
      setDeleteCandidate(null);
      await loadVideos();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleteSaving(false);
    }
  };

  const applyPlaylistReorder = useCallback(
    async (
      group: AdminVideoSeriesGroup,
      reorderedRows: AdminCatalogVideoRow[],
    ) => {
      const orderedContentMediaIds = reorderedRows.map((r) => r.content.id);
      const unique = new Set(orderedContentMediaIds);
      if (unique.size !== orderedContentMediaIds.length) {
        toast.error("Cannot reorder when multiple clips share one media slot.");
        return;
      }
      setReorderBusy(true);
      try {
        await patchAdminSeriesPlaylistOrder(
          group.contentRootId,
          orderedContentMediaIds,
        );
        toast.success("Playlist order updated");
        await loadVideos();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Reorder failed");
      } finally {
        setReorderBusy(false);
      }
    },
    [loadVideos],
  );

  const moveEpisodeInSeries = useCallback(
    async (group: AdminVideoSeriesGroup, index: number, delta: -1 | 1) => {
      const next = index + delta;
      if (next < 0 || next >= group.rows.length) return;
      const rows = [...group.rows];
      const tmp = rows[index]!;
      rows[index] = rows[next]!;
      rows[next] = tmp;
      await applyPlaylistReorder(group, rows);
    },
    [applyPlaylistReorder],
  );

  const openAddEpisodeForSeries = useCallback(
    (group: AdminVideoSeriesGroup) => {
      setAddEpisodeSeries(group);
      setAddEpisodeTitle("");
      setAddEpisodeDesc("");
      setAddEpisodeAge("0+");
      setAddEpisodeFile(null);
      setAddEpisodeLink("");
      setAddEpisodeThumb(null);
      setAddEpisodeOpen(true);
    },
    [],
  );

  const handleAddEpisodeSubmit = async () => {
    if (!addEpisodeSeries) return;
    const name = addEpisodeTitle.trim();
    if (name.length < 1) {
      toast.error("Episode title required");
      return;
    }

    const fd = new FormData();
    fd.append("videoName", name);
    fd.append("ageRestriction", addEpisodeAge);
    const d = addEpisodeDesc.trim();
    if (d) fd.append("videoDescription", d);

    if (addEpisodeMode === "file") {
      if (!addEpisodeFile || !addEpisodeFile.type.startsWith("video/mp4")) {
        toast.error("Choose an MP4 video file.");
        return;
      }
      fd.append("file", addEpisodeFile);
    } else if (addEpisodeMode === "zip") {
      if (!addEpisodeFile || !addEpisodeFile.name.endsWith(".zip")) {
        toast.error("Choose a .zip archive containing your HLS files.");
        return;
      }
      fd.append("file", addEpisodeFile);
    } else {
      const link = addEpisodeLink.trim();
      if (!link.startsWith("https://")) {
        toast.error("Please use a valid HTTPS link to your .m3u8 file.");
        return;
      }
      fd.append("videoLink", link);
    }

    setAddEpisodeSaving(true);

    try {
      if (addEpisodeThumb) {
        fd.append("thumbnailFile", addEpisodeThumb);
      } else if (addEpisodeMode === "file" && addEpisodeFile) {
        const thumbBlob = await generateVideoThumbnailBlob(addEpisodeFile);
        fd.append("thumbnailFile", thumbBlob, "thumbnail.jpg");
      } else if (addEpisodeMode === "zip" && addEpisodeFile) {
        const thumbBlob = await extractAndGenerateThumbnailFromZip(addEpisodeFile);
        if (thumbBlob) {
          fd.append("thumbnailFile", thumbBlob, "thumbnail.jpg");
        }
      } else if (addEpisodeMode === "link") {
        try {
          const thumbBlob = await generateVideoThumbnailBlob(addEpisodeLink);
          fd.append("thumbnailFile", thumbBlob, "thumbnail.jpg");
        } catch (e) {
          console.warn("Could not auto-generate thumbnail from link", e);
        }
      }

      await postAdminSeriesEpisode(addEpisodeSeries.contentRootId, fd);
      toast.success("Episode added to series");
      setAddEpisodeOpen(false);
      setAddEpisodeSeries(null);
      setAddEpisodeThumb(null);
      await loadVideos();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Add episode failed");
    } finally {
      setAddEpisodeSaving(false);
    }
  };

  const levelFor = videoLevelBadge;
  const ratingProgress = (r: number) =>
    Math.min(100, Math.round((Math.max(0, r) / 5) * 100));

  const scrollToListTop = () => {
    if (listTopRef.current) {
      const y = listTopRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const ADMIN_PAGE_SIZE = 10;
  const totalPages = Math.ceil(groupedSeries.length / ADMIN_PAGE_SIZE);
  const paginatedSeries = groupedSeries.slice((currentPage - 1) * ADMIN_PAGE_SIZE, currentPage * ADMIN_PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Videos
          </h1>
          <p className="text-muted-foreground">
            Catalog from <code className="text-xs">GET /content-video</code>;
            upload <code className="text-xs">POST /contents/create</code>;
            series order{" "}
            <code className="text-xs">PATCH /contents/:id/playlist</code>.
          </p>
        </div>
        <AdminButton
          className="gap-2 flex rounded-[15px] bg-primary px-6 py-3 text-sm font-semibold items-center justify-center text-foreground/70 hover:bg-purple-hover hover:text-white transition-all hover:cursor-pointer shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
          onClick={() => setUploadOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Upload video
        </AdminButton>
      </div>

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
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${uploadMode === 'file' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setUploadMode('file')}
            >
              MP4 File
            </button>
            <button
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${uploadMode === 'zip' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setUploadMode('zip')}
            >
              ZIP (HLS)
            </button>
            <button
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${uploadMode === 'link' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setUploadMode('link')}
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
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setUploadFile(f);
                }}
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
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setUploadFile(f);
                }}
              />
              <FileArchive className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Browse for ZIP archive</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[250px] mx-auto">
                {uploadFile ? uploadFile.name : "Select a .zip containing your .m3u8 and .ts files."}
              </p>
            </label>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" /> HLS Playlist URL (.m3u8)
              </label>
              <AdminInput
                placeholder="https://cdn.explys.com/video/playlist.m3u8"
                value={uploadLink}
                onChange={(e) => setUploadLink(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2 mt-4 border-t border-border pt-4">
            <label className="text-sm font-medium">Custom Thumbnail (Cover)</label>
            <label className="block cursor-pointer rounded-lg border-2 border-dashed border-border p-4 text-center transition-colors hover:border-primary/50">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setUploadThumb(f);
                }}
              />
              {uploadThumb ? (
                <p className="text-sm font-medium text-primary">{uploadThumb.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Click to upload cover image (.jpg, .png)</p>
              )}
            </label>
            <p className="text-[11px] text-muted-foreground">
              Optional. If not provided, it auto-generates directly from the MP4 or ZIP contents.
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
            <label className="text-sm font-medium">Age Restriction / Возрастное ограничение</label>
            <select
              value={uploadAge}
              onChange={(e) => setUploadAge(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="0+">0+</option>
              <option value="6+">6+</option>
              <option value="12+">12+</option>
              <option value="16+">16+</option>
              <option value="18+">18+</option>
              <option value="21+">21+</option>
            </select>
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
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${addEpisodeMode === 'file' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setAddEpisodeMode('file')}
            >
              MP4 File
            </button>
            <button
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${addEpisodeMode === 'zip' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setAddEpisodeMode('zip')}
            >
              ZIP (HLS)
            </button>
            <button
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${addEpisodeMode === 'link' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setAddEpisodeMode('link')}
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
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setAddEpisodeFile(f);
                }}
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
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setAddEpisodeFile(f);
                }}
              />
              <FileArchive className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">ZIP Archive</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[250px] mx-auto">
                {addEpisodeFile ? addEpisodeFile.name : "Select a .zip containing your HLS files."}
              </p>
            </label>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" /> HLS Playlist URL (.m3u8)
              </label>
              <AdminInput
                placeholder="https://cdn.explys.com/video/playlist.m3u8"
                value={addEpisodeLink}
                onChange={(e) => setAddEpisodeLink(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2 mt-4 border-t border-border pt-4">
            <label className="text-sm font-medium">Custom Thumbnail (Cover)</label>
            <label className="block cursor-pointer rounded-lg border-2 border-dashed border-border p-4 text-center transition-colors hover:border-primary/50">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setAddEpisodeThumb(f);
                }}
              />
              {addEpisodeThumb ? (
                <p className="text-sm font-medium text-primary">{addEpisodeThumb.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Click to upload cover image (.jpg, .png)</p>
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
            <label className="text-sm font-medium">Age Restriction / Возрастное ограничение</label>
            <select
              value={addEpisodeAge}
              onChange={(e) => setAddEpisodeAge(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="0+">0+</option>
              <option value="6+">6+</option>
              <option value="12+">12+</option>
              <option value="16+">16+</option>
              <option value="18+">18+</option>
              <option value="21+">21+</option>
            </select>
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
            <label className="text-sm font-medium">Age Restriction / Возрастное ограничение</label>
            <select
              value={editAge}
              onChange={(e) => setEditAge(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="0+">0+</option>
              <option value="6+">6+</option>
              <option value="12+">12+</option>
              <option value="16+">16+</option>
              <option value="18+">18+</option>
              <option value="21+">21+</option>
            </select>
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
              <ImageIcon className="w-4 h-4 text-muted-foreground" /> Change Thumbnail / Cover Image
            </label>
            <label className="block cursor-pointer rounded-lg border border-border p-3 text-center bg-muted/40 transition-colors hover:border-primary/50">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setEditThumb(f);
                }}
              />
              {editThumb ? (
                <p className="text-sm font-medium text-primary truncate">{editThumb.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Click to upload a new cover image (.jpg, .png)</p>
              )}
            </label>
          </div>

          <div className="space-y-2 border-border border-t pt-4">
            <p className="text-sm font-medium">Transcript metadata</p>
            <p className="text-xs text-muted-foreground">
              <strong>Captions:</strong> the server FFmpeg-decodes speech to
              WAV, then Deepgram Listen (default{" "}
              <code className="text-[11px]">nova-3</code>;{" "}
              <code className="text-[11px]">DEEPGRAM_TRANSCRIBE_MODEL</code>)
              needs <code className="text-[11px]">DEEPGRAM_API_KEY</code> plus
              an audible soundtrack in the video. <strong>Catalog genres</strong>{" "}
              and <strong>CEFR bands</strong> use WebVTT + Gemini afterward
              (genres must exist in the genres table).
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
            </span>{" "}
            — change catalog structure in CMS if needed later.
          </p>
        </div>
      </AdminModal>

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
            <label className="text-sm font-medium" htmlFor="admin-edit-series-name">
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
            catalog entry ( series{" "}
            <strong>{deleteCandidate.video.content.category.name}</strong>)?
            This uses <code>cascade delete</code> from the backend content row.
          </p>
        ) : (
          <p className="text-sm text-foreground">
            Delete the episode{" "}
            <strong>{deleteCandidate?.video.videoName}</strong> from the series{" "}
            <strong>{deleteCandidate?.video.content.category.name}</strong>?
          </p>
        )}
      </AdminModal>

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
                  Catalog genres (database allow-list)
                </p>
                <ChipList
                  tags={inspectMeta.video.content.stats?.userTags ?? []}
                  emptyLabel="No genres yet. Edit this video → “Regenerate genres”."
                />
              </div>
            ) : null}

            {inspectMeta.tab === "levels" ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    CEFR bands (system tags)
                  </p>
                  <ChipList
                    tags={inspectMeta.video.content.stats?.systemTags ?? []}
                    emptyLabel="No CEFR bands yet. Edit → “Regenerate CEFR”."
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
                      </code>{" "}
                      (same API token as admin).
                    </p>
                    <a
                      href={inspectMeta.video.videoCaption.subtitlesFileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-sm text-primary underline-offset-4 hover:underline"
                    >
                      Open raw file on storage
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No captions row yet. Open Edit → Regenerate captions.
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

      {loadError ? (
        <AdminCard className="border-destructive/40">
          <AdminCardContent className="p-6 text-sm text-destructive">
            {loadError}
          </AdminCardContent>
        </AdminCard>
      ) : null}

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
              <p className="text-sm text-muted-foreground">
                Completed watches (stored)
              </p>
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
              <p className="text-sm text-muted-foreground">
                Avg rating (videos with scores)
              </p>
            </div>
          </AdminCardContent>
        </AdminCard>
      </div>

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
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <AdminSelectNative
                value={seriesFilter}
                onChange={(e) => setSeriesFilter(e.target.value)}
              >
                <option value="all">All series</option>
                {seriesNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </AdminSelectNative>

              <AdminSelectNative
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="all">All levels</option>
                {(["A1", "A2", "B1", "B2", "C1", "C2"] as const).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
                <option value="__misc">Other / no CEFR tag</option>
              </AdminSelectNative>
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
                          title="Edit playlist name"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {group.rows.length}{" "}
                        {group.rows.length === 1 ? "episode" : "episodes"}
                        {group.rows.length > 1
                          ? " · use arrows to set playlist order"
                          : null}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {group.friendlyLink ? (
                        <Link
                          to={`/catalog/series/${encodeURIComponent(group.friendlyLink)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-primary transition-colors hover:bg-muted"
                        >
                          <ListVideo className="h-4 w-4" />
                          Learner playlist
                          <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                        </Link>
                      ) : null}
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
                            {(video as any).thumbnailUrl ? (
                              <img
                                src={(video as any).thumbnailUrl}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-accent/20" />
                            )}
                            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                              {(video as any).ageRestriction ? (
                                <AdminBadge variant="accent">
                                  {(video as any).ageRestriction}
                                </AdminBadge>
                              ) : (
                                <AdminBadge variant="accent">0+</AdminBadge>
                              )}
                              {group.rows.length > 1 ? (
                                <AdminBadge variant="secondary">
                                  #{episodeIndex + 1}
                                </AdminBadge>
                              ) : null}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                              <a
                                href={`/content/${video.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 shadow-lg"
                                aria-label="Preview in new tab"
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
                              <AdminRowMenu>
                                <AdminRowMenuItem
                                  onClick={() => {
                                    window.open(
                                      `/content/${video.id}`,
                                      "_blank",
                                      "noopener,noreferrer",
                                    );
                                  }}
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
                            </div>
                            {group.rows.length > 1 ? (
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
                            ) : null}
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
                <div className="flex items-center justify-center gap-2 mt-12 mb-4">
                  <button
                    type="button"
                    onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); scrollToListTop(); }}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center px-4 py-2 min-h-[40px] rounded-lg bg-card border border-border text-foreground font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
                  >
                    Prev
                  </button>

                  {getPaginationRange(currentPage, totalPages).map((p, i) => (
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="flex items-center justify-center px-2 py-2 min-h-[40px] text-muted-foreground font-medium">
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        type="button"
                        onClick={() => { setCurrentPage(p as number); scrollToListTop(); }}
                        className={cn(
                          "flex items-center justify-center min-w-[40px] px-3 py-2 min-h-[40px] rounded-lg font-medium text-sm transition-colors cursor-pointer",
                          currentPage === p
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-card border border-border text-foreground hover:bg-muted"
                        )}
                      >
                        {p}
                      </button>
                    )
                  ))}

                  <button
                    type="button"
                    onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); scrollToListTop(); }}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center px-4 py-2 min-h-[40px] rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-hover transition-all cursor-pointer shadow-md"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
          {!loading ? (
            <p className="mt-6 text-center text-sm text-muted-foreground border-t border-border pt-6">
              Showing series {(currentPage - 1) * ADMIN_PAGE_SIZE + 1} - {Math.min(currentPage * ADMIN_PAGE_SIZE, groupedSeries.length)} of {groupedSeries.length} (filtered, {filtered.length} total episodes)
            </p>
          ) : null}
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}