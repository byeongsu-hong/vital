"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Music, Disc3, Activity, Radio } from "lucide-react";
import { useSimulatedPlayer } from "@/hooks/use-simulated-player";
import { MOCK_TRACKS, getGenreColor } from "@/lib/track-data";

interface BpmPlaylistProps {
  currentBpm: number;
}

const MIN_BPM = 40;
const MAX_BPM = 200;
const PIXELS_PER_BPM = 60;
const BPM_RANGE = 2;

export function BpmPlaylist({ currentBpm }: BpmPlaylistProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [scrollBpm, setScrollBpm] = useState(0);
  const [paddingTop, setPaddingTop] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const { currentTrack, nextTrack, progress, isTransitioning } =
    useSimulatedPlayer(currentBpm);

  // Prepare track ranges - each track spans ±5 BPM
  const trackRanges = useMemo(() => {
    return MOCK_TRACKS.map((track) => {
      const centerBpm = Math.round(track.bpm);
      return {
        track,
        startBpm: centerBpm - BPM_RANGE,
        endBpm: centerBpm + BPM_RANGE,
        centerBpm,
        heightInPixels: (BPM_RANGE * 2 + 1) * PIXELS_PER_BPM,
      };
    });
  }, []);

  // Initialize padding and update on resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updatePadding = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const padding = containerHeight / 2;
        setPaddingTop(padding);
        if (!isInitialized) {
          setIsInitialized(true);
        }
      }
    };

    // Initial calculation
    updatePadding();

    // Watch for container size changes
    const resizeObserver = new ResizeObserver(() => {
      updatePadding();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isInitialized]);

  // Calculate BPM at scroll position
  const handleScroll = useCallback(() => {
    if (containerRef.current && paddingTop > 0) {
      const scrollTop = containerRef.current.scrollTop;
      const containerHeight = containerRef.current.clientHeight;

      // Sticky line is always at viewport center (containerHeight / 2)
      // Content position that the sticky line points to:
      const contentPositionAtCenter = scrollTop + containerHeight / 2;

      // BPM position in content (accounting for padding):
      // BPM X center is at: padding + (X - MIN_BPM + 0.5) * PIXELS_PER_BPM
      // Solve for X: X = MIN_BPM + (contentPos - padding) / PIXELS_PER_BPM - 0.5
      const bpmAtCenter =
        MIN_BPM + (contentPositionAtCenter - paddingTop) / PIXELS_PER_BPM - 0.5;

      setScrollBpm(
        Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(bpmAtCenter)))
      );
    }
  }, [paddingTop]);

  useEffect(() => {
    if (
      isHovering ||
      !containerRef.current ||
      currentBpm < MIN_BPM ||
      currentBpm > MAX_BPM ||
      paddingTop === 0
    )
      return;

    const containerHeight = containerRef.current.clientHeight;

    // Position of the BPM row center in content: (bpm - MIN_BPM + 0.5) * PIXELS_PER_BPM
    const bpmCenterInContent = (currentBpm - MIN_BPM + 0.5) * PIXELS_PER_BPM;

    // Scroll so that BPM center aligns with viewport center
    const scrollTarget = bpmCenterInContent + paddingTop - containerHeight / 2;

    containerRef.current.scrollTo({
      top: scrollTarget,
      behavior: "smooth",
    });

    // Update scroll BPM after scrolling
    setTimeout(() => handleScroll(), 100);
  }, [currentBpm, isHovering, paddingTop, handleScroll]);

  // Initialize scroll BPM on mount
  useEffect(() => {
    handleScroll();
  }, [handleScroll]);

  return (
    <div className="h-full flex flex-col bg-black/40 border-l border-border/50 backdrop-blur-sm overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-background/50 z-30 backdrop-blur text-center shrink-0">
        <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">
          {isTransitioning ? "MIXING TRACKS..." : "AUTO-SYNC ACTIVE"}
        </div>
        <div className="flex items-center justify-center gap-2 text-primary">
          <Radio
            className={`w-4 h-4 ${isTransitioning ? "animate-spin" : ""}`}
          />
          <span className="font-bold font-mono text-sm">SPOTIFY LINK</span>
        </div>
      </div>

      {/* Ruler / Playlist Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-hide relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onScroll={handleScroll}
      >
        {/* Scroll-following Center Line (sticky, dashed) */}
        <div className="sticky top-[50%] left-0 w-full h-0 border-t-2 border-dashed border-white/30 z-20 pointer-events-none">
          <div className="absolute right-2 top-0 -translate-y-1/2 text-[10px] font-mono bg-black/80 text-white/70 px-1 py-0.5 rounded border border-white/20">
            {scrollBpm.toFixed(0)}
          </div>
        </div>

        {/* Current BPM Line (absolute position) */}
        <div
          className="absolute left-0 w-full h-0 border-t-2 border-primary/80 z-25 shadow-[0_0_10px_rgba(0,255,157,0.5)] pointer-events-none mix-blend-screen transition-all duration-300"
          style={{
            top: `${
              paddingTop + (currentBpm - MIN_BPM + 0.5) * PIXELS_PER_BPM
            }px`,
          }}
        >
          <div className="absolute right-2 top-0 -translate-y-1/2 text-[10px] font-mono bg-primary/90 text-black px-1 py-0.5 rounded">
            {currentBpm.toFixed(1)}
          </div>
        </div>

        <div
          style={{
            paddingTop: `${paddingTop}px`,
            paddingBottom: `${paddingTop}px`,
          }}
        >
          {/* Render BPM ruler */}
          {Array.from({ length: MAX_BPM - MIN_BPM + 1 }, (_, i) => {
            const bpm = MIN_BPM + i;
            const distance = Math.abs(currentBpm - bpm);

            // Find track that covers this BPM
            const coveringTrack = trackRanges.find(
              (tr) => bpm >= tr.startBpm && bpm <= tr.endBpm
            );

            // Check if this is the first BPM of a track range (to render the track card)
            const shouldRenderTrack =
              coveringTrack && bpm === coveringTrack.startBpm;

            const isActiveA = currentTrack?.id === coveringTrack?.track.id;
            const isActiveB = nextTrack?.id === coveringTrack?.track.id;
            const isPlaying = isActiveA || isActiveB;

            return (
              <div
                key={bpm}
                className="relative flex items-center transition-all duration-300"
                style={{
                  height: `${PIXELS_PER_BPM}px`,
                }}
              >
                {/* BPM Label Column */}
                <div className="w-14 shrink-0 flex flex-col items-end justify-center pr-4 border-r border-white/10 h-full relative">
                  {bpm % 5 === 0 && (
                    <span
                      className={`font-mono text-sm transition-all ${
                        distance < 0.5
                          ? "text-primary"
                          : "text-muted-foreground/70"
                      }`}
                    >
                      {bpm}
                    </span>
                  )}
                  {/* Every 10 BPM: large tick */}
                  {bpm % 10 === 0 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-[2px] bg-white/20" />
                  )}
                  {/* Every 5 BPM (but not 10): medium tick */}
                  {bpm % 5 === 0 && bpm % 10 !== 0 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-px bg-white/10" />
                  )}
                  {/* Every other BPM: small tick */}
                  {bpm % 5 !== 0 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-px bg-white/5" />
                  )}
                </div>

                {/* Track Card Column */}
                <div className="flex-1 pl-3 pr-3 min-w-0 relative">
                  {shouldRenderTrack && coveringTrack ? (
                    <div
                      className={`
                        absolute left-3 right-3 top-0
                        rounded border transition-all duration-500 overflow-hidden
                        bg-white/3
                        ${
                          isPlaying
                            ? "border-primary/50 bg-white/5"
                            : "border-white/20"
                        }
                      `}
                      style={{
                        height: `${coveringTrack.heightInPixels}px`,
                      }}
                    >
                      {/* Progress Bar */}
                      {isActiveA && (
                        <div
                          className="absolute inset-0 bg-primary/10 z-0 transition-all duration-1000"
                          style={{ width: `${progress}%` }}
                        />
                      )}

                      <div className="relative z-10 h-full flex flex-col justify-center p-2.5 gap-2">
                        {/* Compact Album Art & Info */}
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div
                            className={`
                              w-14 h-14 rounded flex items-center justify-center shrink-0 
                              bg-gradient-to-br ${getGenreColor(
                                coveringTrack.track.genre
                              )}
                              ${
                                isPlaying
                                  ? "shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                  : "opacity-70 grayscale"
                              }
                            `}
                          >
                            {isPlaying ? (
                              <Activity className="w-7 h-7 text-white animate-pulse" />
                            ) : (
                              <Disc3 className="w-7 h-7 text-white/50" />
                            )}
                          </div>

                          <div className="min-w-0 w-full">
                            <div
                              className={`text-xs font-bold truncate ${
                                isPlaying
                                  ? "text-white"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {coveringTrack.track.title}
                            </div>
                            <div className="text-[10px] text-muted-foreground/70 truncate">
                              {coveringTrack.track.artist}
                            </div>
                          </div>
                        </div>

                        {/* BPM Range Badge - Stacked */}
                        <div className="flex flex-col items-center gap-1 text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-mono font-bold">
                            {coveringTrack.startBpm}-{coveringTrack.endBpm} BPM
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white/50 truncate max-w-full">
                            {coveringTrack.track.genre}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : !coveringTrack ? (
                    <div className="w-full h-px border-t border-dashed border-white/5" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Player Footer */}
      <div className="p-4 border-t border-border/50 bg-black/80 backdrop-blur-md z-30 shadow-2xl shrink-0">
        {currentTrack ? (
          <div className="flex flex-col gap-3">
            {isTransitioning && (
              <div className="flex items-center justify-center text-[10px] font-mono text-primary animate-pulse mb-1">
                <span>CROSSFADING...</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded bg-gradient-to-br ${getGenreColor(
                  currentTrack.genre
                )} flex items-center justify-center`}
              >
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate">
                  {currentTrack.title}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {currentTrack.artist}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>
                  {Math.floor(((progress / 100) * currentTrack.duration) / 60)}:
                  {String(
                    Math.floor(((progress / 100) * currentTrack.duration) % 60)
                  ).padStart(2, "0")}
                </span>
                <span>
                  {Math.floor(currentTrack.duration / 60)}:
                  {String(Math.floor(currentTrack.duration % 60)).padStart(
                    2,
                    "0"
                  )}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-xs font-mono italic">
            INITIALIZING PLAYER...
          </div>
        )}
      </div>
    </div>
  );
}
