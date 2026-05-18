import { HTMLAttributes, useRef, useState, useEffect, useCallback } from "react";
import { cn } from "../lib/utils";
import { Volume2, VolumeX, Maximize, Play, Pause, ChevronLeft, ChevronRight, RotateCcw, RotateCw } from "lucide-react";

interface VideoPlayerProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  onEnded?: () => void;
  onPlay?: () => void;
  onPlaybackTime?: (seconds: number) => void;
  onPlaybackFraction?: (fraction: number) => void;
  onVideoMount?: (el: HTMLVideoElement | null) => void;
}

export default function VideoPlayer({
  src,
  onEnded,
  onPlay,
  onPlaybackTime,
  onPlaybackFraction,
  onVideoMount,
  className,
  ...rest
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  function setVideoNode(node: HTMLVideoElement | null) {
    videoRef.current = node;
    onVideoMount?.(node);
  }

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const [showLeftAnimation, setShowLeftAnimation] = useState(false);
  const [showRightAnimation, setShowRightAnimation] = useState(false);

  const clickTimerRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  const handleToggle = useCallback(() => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  }, [playing]);

  function handleTimeUpdate() {
    if (isDraggingRef.current) return;

    const video = videoRef.current;
    if (!video) return;

    const { currentTime, duration } = video;
    setCurrentTime(currentTime);
    const dur = duration && Number.isFinite(duration) && duration > 0 ? duration : 0;
    const frac = dur > 0 ? currentTime / dur : 0;
    setProgress(dur > 0 ? frac * 100 : 0);
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

  const handleSkip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    let newTime = videoRef.current.currentTime + seconds;
    if (newTime < 0) newTime = 0;
    if (newTime > videoRef.current.duration) newTime = videoRef.current.duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);

    if (seconds > 0) {
      setShowRightAnimation(true);
      setTimeout(() => setShowRightAnimation(false), 500);
    } else {
      setShowLeftAnimation(true);
      setTimeout(() => setShowLeftAnimation(false), 500);
    }
  }, []);

  const evaluatePosition = (clientX: number, updateVideo = false) => {
    if (!videoRef.current || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const newTime = ratio * videoRef.current.duration;

    setProgress(ratio * 100);
    setCurrentTime(newTime);

    if (updateVideo) {
      videoRef.current.currentTime = newTime;
    } else {
      videoRef.current.currentTime = newTime;
    }

    const dur = videoRef.current.duration;
    if (dur && Number.isFinite(dur) && dur > 0) {
      onPlaybackFraction?.(Math.min(1, Math.max(0, newTime / dur)));
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    if (timelineRef.current) {
      try {
        timelineRef.current.setPointerCapture(e.pointerId);
      } catch (err) {
        console.warn("Pointer capture failed:", err);
      }
    }
    evaluatePosition(e.clientX, true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    evaluatePosition(e.clientX, false); 
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    if (timelineRef.current) {
      try {
        timelineRef.current.releasePointerCapture(e.pointerId);
      } catch (err) {
      }
    }
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (e.detail === 1) {
      clickTimerRef.current = window.setTimeout(() => {
        handleToggle();
      }, 250) as unknown as number;
    } else if (e.detail === 2) {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
      
      if (!videoRef.current) return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const videoWidth = rect.width;

      if (clickX > videoWidth / 2) {
        handleSkip(5);
      } else {
        handleSkip(-5);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    videoRef.current.muted = nextMute;
  };

  const handleSpeedChange = (speed: number) => {
    if (!videoRef.current) return;
    setPlaybackSpeed(speed);
    videoRef.current.playbackRate = speed;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      void containerRef.current.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.getAttribute("role") === "combobox"
      ) {
        return;
      }

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
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggle, handleSkip, volume]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-gray-950 select-none",
        className,
      )}
      {...rest}
    >
      <video
        ref={setVideoNode}
        src={src}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={handleVideoClick}
        onPlay={() => {
          setPlaying(true);
          onPlay?.();
        }}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
      />

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
          <span className="text-xs font-semibold mt-1">10 сек</span>
        </div>
      </div>

      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-20",
          playing ? "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto" : "opacity-100"
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleToggle();
        }}
      >
        <button
          type="button"
          onClick={() => handleSkip(-10)}
          className="relative w-12 h-12 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:scale-105 transition-all shadow"
        >
          <RotateCcw className="size-5" />
          <span className="absolute text-[9px] font-bold mt-1">10</span>
        </button>

        <button
          type="button"
          onClick={handleToggle}
          className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:bg-white/25 transition-all shadow-lg backdrop-blur-xs hover:scale-105 mx-6"
        >
          {playing ? (
            <Pause className="w-8 h-8 text-white/90" />
          ) : (
            <Play className="w-8 h-8 text-white/90 translate-x-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleSkip(10)}
          className="relative w-12 h-12 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:scale-105 transition-all shadow"
        >
          <RotateCw className="size-5" />
          <span className="absolute text-[9px] font-bold mt-1">10</span>
        </button>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-10 bg-linear-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-3 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={timelineRef}
          className="w-full h-2.5 bg-white/20 rounded-full cursor-pointer relative group/timeline transition-all duration-200 touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div
            className="h-full bg-(--purple-default) rounded-full pointer-events-none transition-colors duration-200 group-hover/timeline:bg-purple-500"
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
            <div className="flex items-center gap-2.5 group/volume">
              <button
                type="button"
                onClick={toggleMute}
                className="text-white/80 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="size-5.5" /> : <Volume2 className="size-5.5" />}
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

            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-white/80 hover:text-white transition-colors"
            >
              <Maximize className="size-5.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}