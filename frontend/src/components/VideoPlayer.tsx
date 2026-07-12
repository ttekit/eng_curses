import {
  HTMLAttributes,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import Hls from "hls.js";
import { cn } from "../lib/utils";
import {
  Volume2,
  VolumeX,
  Maximize,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RotateCw,
  Loader2,
  Captions,
  Check,
} from "lucide-react";

export interface SubtitleCue {
  startSec?: number;
  endSec?: number;
  text: string;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  cues: SubtitleCue[];
}

interface VideoPlayerProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  transcript?: SubtitleCue[];
  transcripts?: SubtitleTrack[];
  onEnded?: () => void;
  onPlay?: () => void;
  onPlaybackTime?: (seconds: number) => void;
  onPlaybackFraction?: (fraction: number) => void;
  onVideoMount?: (el: HTMLVideoElement | null) => void;
  onClose?: () => void;
}

export default function VideoPlayer({
  src,
  transcript,
  transcripts,
  onEnded,
  onPlay,
  onPlaybackTime,
  onPlaybackFraction,
  onVideoMount,
  onClose,
  className,
  ...rest
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const setVideoNode = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (node) {
        onVideoMount?.(node);
      }
    },
    [onVideoMount]
  );

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !src) return;

    if (src.includes(".m3u8")) {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls({
          maxMaxBufferLength: 10,
          enableWorker: true,
        });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(node);
      } else if (node.canPlayType("application/vnd.apple.mpegurl")) {
        node.src = src;
      }
    } else {
      node.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>("auto");
  const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false);

  const [showLeftAnimation, setShowLeftAnimation] = useState(false);
  const [showRightAnimation, setShowRightAnimation] = useState(false);

  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);

  const showControlsRef = useRef(true);
  const playingRef = useRef(false);
  const hideControlsTimerRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const isBufferingRef = useRef(true);

  const lastTapRef = useRef<{ time: number; clientX: number } | null>(null);
  const singleTapTimerRef = useRef<number | null>(null);

  const [bufferedProgress, setBufferedProgress] = useState(0);

  const availableTracks = useMemo(() => {
    if (transcripts && transcripts.length > 0) return transcripts;
    if (transcript && transcript.length > 0) {
      return [{ id: "default", label: "Субтитри", cues: transcript }];
    }
    return [];
  }, [transcripts, transcript]);

  const activeTrack = useMemo(() => {
    if (availableTracks.length === 0 || selectedTrackId === null) return null;
    if (selectedTrackId === "auto") {
      const ukTrack = availableTracks.find(
        (t) =>
          t.id === "uk" ||
          t.id === "ua" ||
          t.id.includes("uk") ||
          t.id.includes("ua") ||
          t.label.toLowerCase().includes("укр")
      );
      return ukTrack || availableTracks[0];
    }
    return availableTracks.find((t) => t.id === selectedTrackId) || null;
  }, [availableTracks, selectedTrackId]);

  const activeSubtitle = useMemo(() => {
    if (!activeTrack || !activeTrack.cues || activeTrack.cues.length === 0) return null;
    for (let i = 0; i < activeTrack.cues.length; i++) {
      const cue = activeTrack.cues[i];
      if (typeof cue.startSec === "number" && typeof cue.endSec === "number") {
        if (currentTime >= cue.startSec && currentTime <= cue.endSec) {
          return cue.text;
        }
      }
    }
    return null;
  }, [currentTime, activeTrack]);

  const setBufferingState = useCallback((val: boolean) => {
    setIsBuffering(val);
    isBufferingRef.current = val;
  }, []);

  const setControlsVisible = (val: boolean) => {
    showControlsRef.current = val;
    setShowControls(val);
    if (!val) {
      setShowSubtitlesMenu(false);
    }
  };

  const clearHideTimer = () => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
      hideControlsTimerRef.current = null;
    }
  };

  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    clearHideTimer();
    if (playingRef.current) {
      hideControlsTimerRef.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }
  }, []);

  useEffect(() => {
    showControlsRef.current = showControls;
  }, [showControls]);

  const [prevPlaying, setPrevPlaying] = useState(playing);
  if (playing !== prevPlaying) {
    setPrevPlaying(playing);
    setShowControls(true);
  }

  useEffect(() => {
    if (!playing) {
      clearHideTimer();
      return;
    }
    hideControlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
    return () => clearHideTimer();
  }, [playing]);

  const handleToggle = useCallback(() => {
    if (!videoRef.current) return;
    if (playingRef.current) {
      videoRef.current.pause();
    } else {
      void videoRef.current.play();
    }
  }, []);

  function handleTimeUpdate() {
    if (isDraggingRef.current) return;
    const video = videoRef.current;
    if (!video) return;

    const { currentTime, duration } = video;
    setCurrentTime(currentTime);
    const dur =
      duration && Number.isFinite(duration) && duration > 0 ? duration : 0;
    const frac = dur > 0 ? currentTime / dur : 0;
    setProgress(dur > 0 ? frac * 100 : 0);

    if (dur > 0 && video.buffered.length > 0) {
      for (let i = 0; i < video.buffered.length; i++) {
        if (
          video.buffered.start(i) <= currentTime &&
          video.buffered.end(i) >= currentTime
        ) {
          const bufferedEnd = video.buffered.end(i);
          setBufferedProgress((bufferedEnd / dur) * 100);
          break;
        }
      }
    }

    onPlaybackTime?.(currentTime);
    if (dur > 0) onPlaybackFraction?.(Math.min(1, Math.max(0, frac)));
  }

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const handleSkip = useCallback(
    (seconds: number) => {
      if (isBufferingRef.current || !videoRef.current) return;
      let newTime = videoRef.current.currentTime + seconds;
      if (newTime < 0) newTime = 0;
      if (newTime > videoRef.current.duration)
        newTime = videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);

      if (seconds > 0) {
        setShowRightAnimation(true);
        setTimeout(() => setShowRightAnimation(false), 500);
      } else {
        setShowLeftAnimation(true);
        setTimeout(() => setShowLeftAnimation(false), 500);
      }
      showControlsTemporarily();
    },
    [showControlsTemporarily]
  );

  const evaluatePosition = (clientX: number) => {
    if (!videoRef.current || !timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const newTime = ratio * videoRef.current.duration;
    setProgress(ratio * 100);
    setCurrentTime(newTime);
    videoRef.current.currentTime = newTime;
    const dur = videoRef.current.duration;
    if (dur && Number.isFinite(dur) && dur > 0) {
      onPlaybackFraction?.(Math.min(1, Math.max(0, newTime / dur)));
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isBufferingRef.current) return;
    isDraggingRef.current = true;
    if (timelineRef.current) {
      try {
        timelineRef.current.setPointerCapture(e.pointerId);
      } catch { }
    }
    evaluatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    evaluatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    if (timelineRef.current) {
      try {
        timelineRef.current.releasePointerCapture(e.pointerId);
      } catch { }
    }
    if (videoRef.current) {
      const t = videoRef.current.currentTime;
      if (Number.isFinite(t)) {
        setCurrentTime(t);
      }
    }
  };

  const handleGesture = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const now = Date.now();
      const DOUBLE_TAP_MS = 280;

      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }

      const lastTap = lastTapRef.current;
      const isDoubleTap = lastTap && now - lastTap.time < DOUBLE_TAP_MS;

      if (isDoubleTap) {
        lastTapRef.current = null;
        const rect = e.currentTarget.getBoundingClientRect();
        const tapX = e.clientX - rect.left;

        if (tapX > rect.width / 2) {
          handleSkip(10);
        } else {
          handleSkip(-10);
        }
      } else {
        lastTapRef.current = { time: now, clientX: e.clientX };
        singleTapTimerRef.current = window.setTimeout(() => {
          lastTapRef.current = null;

          if (!showControlsRef.current) {
            showControlsTemporarily();
          } else {
            onClose?.();
          }
        }, DOUBLE_TAP_MS);
      }
    },
    [handleSkip, onClose, showControlsTemporarily]
  );

  useEffect(() => {
    return () => {
      clearHideTimer();
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
    };
  }, []);

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) {
        videoRef.current.muted = next;
      }
      return next;
    });
  }, []);

  const handleSpeedChange = (speed: number) => {
    if (!videoRef.current) return;
    setPlaybackSpeed(speed);
    videoRef.current.playbackRate = speed;
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        if (screen.orientation && "lock" in screen.orientation) {
          await (
            screen.orientation as ScreenOrientation & {
              lock: (orientation: string) => Promise<void>;
            }
          )
            .lock("landscape")
            .catch(() => { });
        }
      } catch {
        /* ignore fullscreen errors */
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch {
        /* ignore exit fullscreen errors */
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.getAttribute("role") === "combobox"
      )
        return;

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          handleToggle();
          break;
        case "arrowright":
          e.preventDefault();
          handleSkip(5);
          break;
        case "arrowleft":
          e.preventDefault();
          handleSkip(-5);
          break;
        case "arrowup":
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.05));
          break;
        case "arrowdown":
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.05));
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "c":
          e.preventDefault();
          setSelectedTrackId((prev) => {
            if (prev !== null) return null;
            const ukTrack = availableTracks.find(
              (t) =>
                t.id === "uk" ||
                t.id === "ua" ||
                t.id.includes("uk") ||
                t.id.includes("ua") ||
                t.label.toLowerCase().includes("укр")
            );
            return ukTrack ? ukTrack.id : availableTracks[0]?.id || null;
          });
          showControlsTemporarily();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleToggle,
    handleSkip,
    volume,
    showControlsTemporarily,
    toggleMute,
    availableTracks,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-gray-950 select-none",
        className
      )}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => {
        if (playing) {
          setControlsVisible(false);
        }
        setShowSubtitlesMenu(false);
      }}
      {...rest}
    >
      <video
        ref={setVideoNode}
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadStart={() => setBufferingState(true)}
        onWaiting={() => setBufferingState(true)}
        onPlaying={() => setBufferingState(false)}
        onCanPlay={() => setBufferingState(false)}
        onLoadedData={() => setBufferingState(false)}
        onPlay={() => {
          playingRef.current = true;
          setPlaying(true);
          onPlay?.();
        }}
        onPause={() => {
          playingRef.current = false;
          setPlaying(false);
        }}
        onEnded={() => {
          playingRef.current = false;
          setPlaying(false);
          onEnded?.();
        }}
      />

      {isBuffering ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin opacity-90" />
        </div>
      ) : null}

      <div
        className="absolute inset-0 z-10 cursor-pointer"
        style={{ touchAction: "manipulation" }}
        onClick={handleGesture}
      />

      {activeSubtitle ? (
        <div
          className={cn(
            "absolute left-4 right-4 z-20 flex justify-center pointer-events-none transition-all duration-300",
            showControls ? "bottom-24" : "bottom-8"
          )}
        >
          <span
            className="bg-black/60 text-white px-4 py-1.5 text-center text-sm md:text-base lg:text-lg font-medium rounded-lg backdrop-blur-md drop-shadow-md max-w-4xl"
            style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.8)" }}
          >
            {activeSubtitle}
          </span>
        </div>
      ) : null}

      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-center bg-black/20 rounded-r-full pointer-events-none transition-all duration-300 transform -translate-x-10 opacity-0 backdrop-blur-xs z-10",
          showLeftAnimation && "translate-x-0 opacity-100 duration-150"
        )}
      >
        <div className="flex flex-col items-center text-white text-center">
          <div className="flex animate-pulse">
            <ChevronLeft className="size-6" />
            <ChevronLeft className="size-6 -ml-3" />
          </div>
          <span className="text-xs font-semibold mt-1">-10 сек</span>
        </div>
      </div>

      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center bg-black/20 rounded-l-full pointer-events-none transition-all duration-300 transform translate-x-10 opacity-0 backdrop-blur-xs z-10",
          showRightAnimation && "translate-x-0 opacity-100 duration-150"
        )}
      >
        <div className="flex flex-col items-center text-white text-center">
          <div className="flex animate-pulse">
            <ChevronRight className="size-6" />
            <ChevronRight className="size-6 -ml-3" />
          </div>
          <span className="text-xs font-semibold mt-1">+10 сек</span>
        </div>
      </div>

      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center gap-8 transition-opacity duration-300 z-30 pointer-events-none",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          type="button"
          disabled={isBuffering}
          className={cn(
            "relative w-12 h-12 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 active:scale-95 transition-all shadow-md",
            showControls
              ? "pointer-events-auto cursor-pointer"
              : "pointer-events-none",
            isBuffering && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
          style={{ touchAction: "manipulation" }}
          onClick={(e) => {
            e.stopPropagation();
            handleSkip(-10);
          }}
        >
          <RotateCcw className="w-5 h-5 pointer-events-none" />
          <span className="absolute text-[9px] font-bold mt-1 pointer-events-none">
            10
          </span>
        </button>

        <button
          type="button"
          className={cn(
            "w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all shadow-lg backdrop-blur-sm",
            showControls
              ? "pointer-events-auto cursor-pointer"
              : "pointer-events-none"
          )}
          style={{ touchAction: "manipulation" }}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
        >
          {playing ? (
            <Pause className="w-8 h-8 text-white/90 pointer-events-none" />
          ) : (
            <Play className="w-8 h-8 text-white/90 translate-x-0.5 pointer-events-none" />
          )}
        </button>

        <button
          type="button"
          disabled={isBuffering}
          className={cn(
            "relative w-12 h-12 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 active:scale-95 transition-all shadow-md",
            showControls
              ? "pointer-events-auto cursor-pointer"
              : "pointer-events-none",
            isBuffering && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
          style={{ touchAction: "manipulation" }}
          onClick={(e) => {
            e.stopPropagation();
            handleSkip(10);
          }}
        >
          <RotateCw className="w-5 h-5 pointer-events-none" />
          <span className="absolute text-[9px] font-bold mt-1 pointer-events-none">
            10
          </span>
        </button>
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 px-5 pb-4 pt-20 bg-linear-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 flex flex-col gap-3 z-20",
          showControls
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div
          ref={timelineRef}
          className={cn(
            "w-full h-2.5 bg-white/20 rounded-full relative group/timeline transition-all duration-200 touch-none",
            isBuffering ? "cursor-not-allowed" : "cursor-pointer"
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div
            className="h-full bg-white/30 rounded-full absolute left-0 top-0 pointer-events-none transition-all duration-150"
            style={{ width: `${bufferedProgress}%` }}
          />

          <div
            className="h-full bg-(--purple-default) rounded-full absolute left-0 top-0 pointer-events-none transition-colors duration-200 group-hover/timeline:bg-purple-500"
            style={{ width: `${progress}%` }}
          />

          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md pointer-events-none scale-0 group-hover/timeline:scale-100 transition-transform duration-150"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>

        <div className="flex items-center justify-between text-white/90">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium tabular-nums space-x-1">
              <span className="text-white">{formatTime(currentTime)}</span>
              <span className="text-white/40">/</span>
              <span className="text-white/50">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5 group/volume hidden sm:flex">
              <button
                type="button"
                onClick={toggleMute}
                className="text-white/80 hover:text-white transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="size-5.5" />
                ) : (
                  <Volume2 className="size-5.5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white transition-all duration-300"
              />
            </div>

            <select
              value={playbackSpeed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="bg-transparent text-white text-xs font-medium outline-none cursor-pointer hover:text-white border border-white/20 bg-zinc-950/50 rounded-lg px-2.5 py-1 [&>option]:bg-zinc-900"
            >
              <option value="0.5">0.5x</option>
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>

            {availableTracks.length > 0 && (
              <div className="relative flex items-center">
                {showSubtitlesMenu && (
                  <div className="absolute bottom-9 right-0 bg-zinc-900/95 border border-white/20 rounded-lg shadow-xl py-1 min-w-[130px] backdrop-blur-md z-50 flex flex-col text-xs text-white overflow-hidden">
                    <div className="px-3 py-1.5 font-semibold text-white/50 border-b border-white/10 select-none">
                      Субтитри
                    </div>
                  <button
                      type="button"
                      onClick={() => {
                        setSelectedTrackId(null);
                        setShowSubtitlesMenu(false);
                      }}
                      className={cn(
                        "flex items-center justify-between px-3 py-1.5 hover:bg-white/10 transition-colors text-left cursor-pointer",
                        selectedTrackId === null &&
                        "text-(--purple-default) font-semibold"
                      )}
                    >
                      <span>Вимкнено</span>
                      {selectedTrackId === null && (
                        <Check className="size-3.5" />
                      )}
                    </button>
                    {availableTracks.map((track) => {
                      const isSelected = activeTrack?.id === track.id;
                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => {
                            setSelectedTrackId(track.id);
                            setShowSubtitlesMenu(false);
                          }}
                          className={cn(
                            "flex items-center justify-between px-3 py-1.5 hover:bg-white/10 transition-colors text-left cursor-pointer",
                            isSelected &&
                            "text-(--purple-default) font-semibold"
                          )}
                        >
                          <span className="truncate pr-2">{track.label}</span>
                          {isSelected && (
                            <Check className="size-3.5 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowSubtitlesMenu((prev) => !prev)}
                  className={cn(
                    "transition-colors",
                    activeTrack !== null
                      ? "text-white drop-shadow-md"
                      : "text-white/50 hover:text-white/80"
                  )}
                  title="Toggle Captions (C)"
                >
                  <Captions className="size-5.5 hover:cursor-pointer" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-white/80 hover:text-white transition-colors"
              title="Fullscreen (F)"
            >
              <Maximize className="size-5.5 hover:cursor-pointer" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}