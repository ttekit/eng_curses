import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { unzipSync } from "fflate";
import { apiFetch } from "../lib/api";
import type { AdminCatalogVideoRow } from "../lib/adminVideosApi";
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
} from "../lib/adminVideosApi";

export const ADMIN_PAGE_SIZE = 10;

export type AdminVideoSeriesGroup = {
  contentRootId: number;
  seriesName: string;
  friendlyLink: string;
  rows: AdminCatalogVideoRow[];
};

export type MetadataInspectTab = "themes" | "levels" | "subs";

// --- Вспомогательные функции (Утилиты) ---
function generateVideoThumbnailBlob(
  fileOrUrl: File | Blob | string,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.playsInline = true;
    video.muted = true;
    video.src =
      typeof fileOrUrl === "string"
        ? fileOrUrl
        : URL.createObjectURL(fileOrUrl);
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
          if (typeof fileOrUrl !== "string") URL.revokeObjectURL(video.src);
          if (blob) resolve(blob);
          else reject(new Error("Canvas blob generation failed"));
        },
        "image/jpeg",
        0.85,
      );
    };
    video.onerror = (e) => {
      if (typeof fileOrUrl !== "string") URL.revokeObjectURL(video.src);
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

export function getPaginationRange(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

// --- ГЛАВНЫЙ ХУК ---
export function useAdminVideos() {
  const [videos, setVideos] = useState<AdminCatalogVideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement>(null);

  // Upload States
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "link" | "zip">("file");
  const [uploadLink, setUploadLink] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadAge, setUploadAge] = useState("0+");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadThumb, setUploadThumb] = useState<File | null>(null);
  const [uploadSaving, setUploadSaving] = useState(false);

  // Edit Video States
  const [editing, setEditing] = useState<AdminCatalogVideoRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAge, setEditAge] = useState("0+");
  const [editThumb, setEditThumb] = useState<File | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [regenBusy, setRegenBusy] = useState<
    false | "tags" | "cefr" | "captions"
  >(false);

  // Edit Series States
  const [editSeriesGroup, setEditSeriesGroup] =
    useState<AdminVideoSeriesGroup | null>(null);
  const [editSeriesName, setEditSeriesName] = useState("");
  const [editSeriesSaving, setEditSeriesSaving] = useState(false);

  // Delete States
  const [deleteCandidate, setDeleteCandidate] = useState<{
    video: AdminCatalogVideoRow;
    mode: "series" | "episode";
  } | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  // Add Episode States
  const [reorderBusy, setReorderBusy] = useState(false);
  const [addEpisodeOpen, setAddEpisodeOpen] = useState(false);
  const [addEpisodeMode, setAddEpisodeMode] = useState<"file" | "link" | "zip">(
    "file",
  );
  const [addEpisodeLink, setAddEpisodeLink] = useState("");
  const [addEpisodeSeries, setAddEpisodeSeries] =
    useState<AdminVideoSeriesGroup | null>(null);
  const [addEpisodeTitle, setAddEpisodeTitle] = useState("");
  const [addEpisodeDesc, setAddEpisodeDesc] = useState("");
  const [addEpisodeAge, setAddEpisodeAge] = useState("0+");
  const [addEpisodeFile, setAddEpisodeFile] = useState<File | null>(null);
  const [addEpisodeThumb, setAddEpisodeThumb] = useState<File | null>(null);
  const [addEpisodeSaving, setAddEpisodeSaving] = useState(false);

  // Inspect Meta States
  const [inspectMeta, setInspectMeta] = useState<{
    video: AdminCatalogVideoRow;
    tab: MetadataInspectTab;
  } | null>(null);
  const [subtitleText, setSubtitleText] = useState<string | null>(null);
  const [subtitleLoading, setSubtitleLoading] = useState(false);
  const [subtitleError, setSubtitleError] = useState<string | null>(null);

  // Load Logic
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
  }, [searchQuery, ageFilter, genreFilter, levelFilter]);
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
        if (!cancelled)
          setSubtitleError(
            e instanceof Error ? e.message : "Could not load subtitles",
          );
      })
      .finally(() => {
        if (!cancelled) setSubtitleLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [inspectMeta]);

  // Derived Data (Filters & Grouping)
  const seriesNames = useMemo(
    () =>
      [
        ...new Set(
          videos.map((v) => v.content.category.name.trim()).filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [videos],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return videos.filter((v) => {
      const matchSearch =
        v.videoName.toLowerCase().includes(q) ||
        (v.videoDescription ?? "").toLowerCase().includes(q) ||
        v.content.category.name.toLowerCase().includes(q);
      const matchAge =
        ageFilter === "all" || (v.ageRestriction || "0+") === ageFilter;
      const matchGenre =
        genreFilter === "all" ||
        (v.content.stats?.userTags ?? []).includes(genreFilter);
      const matchLevel = matchesVideoLevelFilter(v, levelFilter);
      return matchSearch && matchAge && matchGenre && matchLevel;
    });
  }, [videos, searchQuery, ageFilter, genreFilter, levelFilter]);

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
        return {
          contentRootId,
          seriesName: sorted[0]?.content.category.name.trim() ?? "",
          friendlyLink: sorted[0]?.content.category.friendlyLink.trim() ?? "",
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
    return {
      total: videos.length,
      watchers,
      avgRating: ratingN > 0 ? ratingSum / ratingN : 0,
      seriesCount: seriesNames.length,
    };
  }, [videos, seriesNames.length]);

  const totalPages = Math.ceil(groupedSeries.length / ADMIN_PAGE_SIZE);
  const paginatedSeries = groupedSeries.slice(
    (currentPage - 1) * ADMIN_PAGE_SIZE,
    currentPage * ADMIN_PAGE_SIZE,
  );

  const scrollToListTop = () => {
    if (listTopRef.current) {
      const y =
        listTopRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // --- Actions ---
  const openEdit = useCallback((v: AdminCatalogVideoRow) => {
    setEditing(v);
    setEditName(v.videoName);
    setEditDesc(v.videoDescription || v.content.category.description || "");
    setEditAge(v.ageRestriction || "0+");
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
      const resData = await apiFetch(`/content-video/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoName: name,
          videoDescription: editDesc.trim() || null,
          ageRestriction: editAge,
        }),
      });
      if (!resData.ok) throw new Error("Failed to update episode metadata");
      if (editThumb) {
        const fd = new FormData();
        fd.append("thumbnailFile", editThumb);
        const res = await apiFetch(
          `/contents/episode/${editing.id}/thumbnail`,
          { method: "PATCH", body: fd },
        );
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

  const wrapRegen = async (
    fn: (vid: number) => Promise<any>,
    successMsg: string,
    failMsg: string,
    busyState: "tags" | "cefr" | "captions",
  ) => {
    if (!editing) return;
    const vid = editing.id;
    setRegenBusy(busyState);
    try {
      const r = await fn(vid);
      if (r?.geminiFailed) toast.error("Gemini unavailable — unchanged");
      else toast.success(successMsg);
      const rows = await loadVideos();
      const u = rows?.find((x) => x.id === vid);
      if (u) {
        setEditing(u);
        setEditName(u.videoName);
        setEditDesc(u.videoDescription || u.content.category.description || "");
        setEditAge(u.ageRestriction || "0+");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : failMsg);
    } finally {
      setRegenBusy(false);
    }
  };

  const handleRegenThemeTags = () =>
    wrapRegen(
      regenerateAdminVideoThemeTags,
      "Catalog genres regenerated",
      "Regeneration failed",
      "tags",
    );
  const handleRegenLevelTags = () =>
    wrapRegen(
      regenerateAdminVideoLevelTags,
      "CEFR bands regenerated",
      "Regeneration failed",
      "cefr",
    );
  const handleRegenCaptions = () =>
    wrapRegen(
      regenerateAdminVideoCaptions,
      "Captions regenerated",
      "Caption generation failed",
      "captions",
    );

  const extractAndGenerateThumbnailFromZip = async (
    zipFile: File,
  ): Promise<Blob | null> => {
    try {
      const arrayBuffer = await zipFile.arrayBuffer();
      const unzipped = unzipSync(new Uint8Array(arrayBuffer));
      const tsFileName = Object.keys(unzipped).find(
        (name) =>
          name.endsWith(".ts") &&
          !name.includes("__MACOSX") &&
          !name.startsWith("._"),
      );
      if (!tsFileName || !unzipped[tsFileName]) return null;
      return await generateVideoThumbnailBlob(
        new Blob([unzipped[tsFileName]], { type: "video/MP2T" }),
      );
    } catch (e) {
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
        toast.error("Choose a .zip archive.");
        return;
      }
      fd.append("file", uploadFile);
    } else {
      const link = uploadLink.trim();
      if (!link.startsWith("https://")) {
        toast.error("Valid HTTPS link to .m3u8 file required.");
        return;
      }
      fd.append("videoLink", link);
    }

    setUploadSaving(true);
    try {
      if (uploadThumb) fd.append("thumbnailFile", uploadThumb);
      else if (uploadMode === "file" && uploadFile)
        fd.append(
          "thumbnailFile",
          await generateVideoThumbnailBlob(uploadFile),
          "thumbnail.jpg",
        );
      else if (uploadMode === "zip" && uploadFile) {
        const thumb = await extractAndGenerateThumbnailFromZip(uploadFile);
        if (thumb) fd.append("thumbnailFile", thumb, "thumbnail.jpg");
      } else if (uploadMode === "link") {
        try {
          fd.append(
            "thumbnailFile",
            await generateVideoThumbnailBlob(uploadLink),
            "thumbnail.jpg",
          );
        } catch (e) { }
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
        await deleteAdminCatalogContent(
          deleteCandidate.video.content.category.id,
        );
        toast.success(
          `${deleteCandidate.video.videoName} (series) removed from catalog`,
        );
      } else {
        const res = await apiFetch(
          `/content-video/${deleteCandidate.video.content.id}`,
          { method: "DELETE" },
        );
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
      if (
        new Set(orderedContentMediaIds).size !== orderedContentMediaIds.length
      ) {
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
      [rows[index], rows[next]] = [rows[next]!, rows[index]!];
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
    if (addEpisodeDesc.trim())
      fd.append("videoDescription", addEpisodeDesc.trim());

    if (addEpisodeMode === "file") {
      if (!addEpisodeFile || !addEpisodeFile.type.startsWith("video/mp4")) {
        toast.error("Choose an MP4 video file.");
        return;
      }
      fd.append("file", addEpisodeFile);
    } else if (addEpisodeMode === "zip") {
      if (!addEpisodeFile || !addEpisodeFile.name.endsWith(".zip")) {
        toast.error("Choose a .zip archive.");
        return;
      }
      fd.append("file", addEpisodeFile);
    } else {
      const link = addEpisodeLink.trim();
      if (!link.startsWith("https://")) {
        toast.error("HTTPS link required.");
        return;
      }
      fd.append("videoLink", link);
    }

    setAddEpisodeSaving(true);
    try {
      if (addEpisodeThumb) fd.append("thumbnailFile", addEpisodeThumb);
      else if (addEpisodeMode === "file" && addEpisodeFile)
        fd.append(
          "thumbnailFile",
          await generateVideoThumbnailBlob(addEpisodeFile),
          "thumbnail.jpg",
        );
      else if (addEpisodeMode === "zip" && addEpisodeFile) {
        const thumb = await extractAndGenerateThumbnailFromZip(addEpisodeFile);
        if (thumb) fd.append("thumbnailFile", thumb, "thumbnail.jpg");
      } else if (addEpisodeMode === "link") {
        try {
          fd.append(
            "thumbnailFile",
            await generateVideoThumbnailBlob(addEpisodeLink),
            "thumbnail.jpg",
          );
        } catch (e) { }
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

  return {
    videos,
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
  };
}
