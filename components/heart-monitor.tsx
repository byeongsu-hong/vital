"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  ManualInputAdapter,
  SimulationAdapter,
  type HeartRateAdapter,
} from "@/lib/heart-rate-types";
import { WebSerialAdapter } from "@/lib/web-serial-adapter";
import { ECGGraph } from "@/components/ecg-graph";
import { BpmPlaylist } from "@/components/bpm-playlist";
import { useSimulatedPlayer } from "@/hooks/use-simulated-player";
import { useYouTubePlayer } from "@/hooks/use-youtube-player";
import { getGenreColor } from "@/lib/track-data";
import {
  Heart,
  Wifi,
  Shuffle,
  Activity,
  Usb,
  Maximize2,
  AlertCircle,
  Music,
  Volume2,
  Settings,
} from "lucide-react";
import Link from "next/link";

export function HeartMonitor() {
  // Architecture: We can swap this adapter later for a Bluetooth or WebSocket one
  const [adapterType, setAdapterType] = useState<
    "manual" | "simulation" | "serial"
  >("simulation");
  const [adapter, setAdapter] = useState<HeartRateAdapter>(
    () => new SimulationAdapter()
  );

  const [bpm, setBpm] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [inputBuffer, setInputBuffer] = useState("60");
  const [statusMessage, setStatusMessage] = useState("SYSTEM IDLE");
  // Show playlist by default on large screens
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScreenTooNarrow, setIsScreenTooNarrow] = useState(false);
  const [currentScreenWidth, setCurrentScreenWidth] = useState(0);
  const [masterVolume, setMasterVolume] = useState(80);
  const [showMusicStartOverlay, setShowMusicStartOverlay] = useState(true);

  // Session tracking
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [bpmHistory, setBpmHistory] = useState<number[]>([]);
  const [avgBpm, setAvgBpm] = useState(0);

  // Get current playing track info (mock for UI)
  const { currentTrack, progress, volumeA } = useSimulatedPlayer(bpm);

  // YouTube real music player (auto-enabled)
  const youtube = useYouTubePlayer(bpm, true);

  // Auto-connect YouTube on mount
  useEffect(() => {
    if (youtube && !youtube.isConnected && !youtube.isConnecting) {
      youtube.connect().catch((err) => {
        console.error("Failed to connect YouTube:", err);
      });
    }
  }, [youtube]);

  // Sync volume with YouTube
  useEffect(() => {
    if (youtube?.setVolume) {
      try {
        youtube.setVolume(masterVolume);
      } catch (err) {
        console.error("Failed to set volume:", err);
      }
    }
  }, [masterVolume, youtube]);

  // Track session time when connected
  useEffect(() => {
    if (isConnected && !sessionStartTime) {
      setSessionStartTime(Date.now());
    } else if (!isConnected) {
      setSessionStartTime(null);
      setSessionDuration(0);
      setBpmHistory([]);
      setAvgBpm(0);
    }
  }, [isConnected, sessionStartTime]);

  // Update session duration every second
  useEffect(() => {
    if (!sessionStartTime || !isConnected) return;

    const interval = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime, isConnected]);

  // Track BPM history and calculate average
  useEffect(() => {
    if (bpm > 0 && isConnected) {
      setBpmHistory((prev) => {
        const newHistory = [...prev, bpm];
        // Keep last 60 readings (1 minute of data if updating every second)
        if (newHistory.length > 60) {
          newHistory.shift();
        }
        // Calculate average
        const sum = newHistory.reduce((acc, val) => acc + val, 0);
        const avg = Math.round(sum / newHistory.length);
        setAvgBpm(avg);
        return newHistory;
      });
    }
  }, [bpm, isConnected]);

  // Handle responsive playlist visibility and screen size check
  useEffect(() => {
    // Initial check on mount
    const isLargeScreen = window.innerWidth >= 1024;
    const isTooNarrow = window.innerWidth < 900;

    if (isLargeScreen) {
      setShowPlaylist(true);
    }
    setIsScreenTooNarrow(isTooNarrow);
    setCurrentScreenWidth(window.innerWidth);

    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1024;
      const isTooNarrow = window.innerWidth < 900;

      setIsScreenTooNarrow(isTooNarrow);
      setCurrentScreenWidth(window.innerWidth);

      // On large screens, always show playlist
      // On small screens, keep current state (user's choice)
      if (isLargeScreen && !showPlaylist) {
        setShowPlaylist(true);
      } else if (!isLargeScreen && showPlaylist) {
        // When going from large to small, close the playlist
        setShowPlaylist(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showPlaylist]);

  useEffect(() => {
    let newAdapter: HeartRateAdapter;

    try {
      switch (adapterType) {
        case "simulation":
          newAdapter = new SimulationAdapter();
          break;
        case "serial":
          newAdapter = new WebSerialAdapter();
          break;
        case "manual":
        default:
          newAdapter = new ManualInputAdapter();
          break;
      }
      setAdapter(newAdapter);
      setError(null);
    } catch (e) {
      console.error("Failed to initialize adapter:", e);
      setError(
        "Failed to initialize adapter. Browser might not support this feature."
      );
      // Fallback
      setAdapter(new ManualInputAdapter());
      setAdapterType("manual");
    }

    setIsConnected(false);
    setBpm(0);
  }, [adapterType]);

  // Connect to the adapter on mount or change
  useEffect(() => {
    let mounted = true;
    // Reset state on new adapter
    setIsConnected(false);

    const init = async () => {
      setStatusMessage(`CONNECTING TO ${adapter.name.toUpperCase()}...`);
      // Web Serial requires user gesture, so we handle it differently
      if (adapter.id === "web-serial") {
        setStatusMessage("WAITING FOR CONNECTION...");
        return;
      }

      try {
        await adapter.connect();
        if (mounted) {
          setIsConnected(true);
          setStatusMessage(`CONNECTED: ${adapter.name.toUpperCase()}`);

          // Subscribe to updates
          adapter.onReading((newBpm) => {
            setBpm(newBpm);
            // Only update input buffer for manual mode
            if (adapter.id === "manual-input") {
              setInputBuffer(newBpm.toString());
            }
          });
        }
      } catch (e) {
        console.error("Connection error:", e);
        if (mounted) {
          setStatusMessage("CONNECTION FAILED");
          setIsConnected(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      try {
        adapter.disconnect();
      } catch (e) {
        console.error("Disconnect error:", e);
      }
    };
  }, [adapter]);

  const handleUpdateBpm = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number.parseInt(inputBuffer);
    if (!isNaN(val) && val > 0 && val < 300) {
      if (adapter.setBpm) {
        adapter.setBpm(val);
        setStatusMessage(`TARGET ADJUSTED: ${val} BPM`);
        // Clear status after a few seconds
        setTimeout(() => setStatusMessage("MONITORING ACTIVE"), 2000);
      }
    }
  };

  const handleRandomize = () => {
    const randomBpm = Math.floor(Math.random() * (160 - 50 + 1)) + 50;
    setInputBuffer(randomBpm.toString());
    if (adapter.setBpm) {
      adapter.setBpm(randomBpm);
      setStatusMessage(`RANDOM SIGNAL: ${randomBpm} BPM`);
      setTimeout(() => setStatusMessage("MONITORING ACTIVE"), 2000);
    }
  };

  const handleConnectSerial = async () => {
    try {
      setStatusMessage("REQUESTING PORT ACCESS...");
      await adapter.connect();
      setIsConnected(true);
      setStatusMessage(`CONNECTED: ${adapter.name.toUpperCase()}`);
      adapter.onReading((newBpm) => {
        setBpm(newBpm);
      });
      setError(null);
    } catch (e) {
      setStatusMessage("CONNECTION FAILED");
      console.error(e);
      setError("Could not connect to serial device. Check permissions.");
    }
  };

  // Determine status color based on BPM
  const getStatusColor = () => {
    if (bpm === 0) return "text-muted-foreground";
    if (bpm < 50) return "text-blue-400"; // Bradycardia
    if (bpm > 120) return "text-red-500"; // Tachycardia
    return "text-primary"; // Normal
  };

  const getStatusText = () => {
    if (bpm === 0) return "NO SIGNAL";
    if (bpm < 50) return "BRADYCARDIA";
    if (bpm > 120) return "TACHYCARDIA";
    return "NORMAL SINUS";
  };

  return (
    <div className="relative w-full max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col gap-4 h-screen max-h-screen overflow-hidden bg-background">
      {/* Screen Too Narrow Warning Modal */}
      {isScreenTooNarrow && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-card border border-red-500/50 rounded-lg p-8 max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-16 h-16 text-red-500" />
              <h2 className="text-2xl font-bold font-mono text-white">
                화면이 너무 좁습니다
              </h2>
              <p className="text-muted-foreground">
                이 애플리케이션은 최소 900px 이상의 화면 너비가 필요합니다.
                <br />
                화면을 넓혀주시거나 더 큰 디바이스를 사용해주세요.
              </p>
              <div className="text-xs font-mono text-primary mt-2">
                현재 화면 너비: {currentScreenWidth}px
              </div>
            </div>
          </div>
        </div>
      )}

      {/* App Start Overlay */}
      {showMusicStartOverlay && youtube.isConnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-card border border-primary/50 rounded-lg p-8 max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in">
            <div className="flex flex-col items-center gap-6 text-center">
              <Activity className="w-16 h-16 text-primary animate-pulse" />
              <h2 className="text-3xl font-bold font-mono text-white">
                VITALSENSE
              </h2>
              <p className="text-muted-foreground">
                Heart Rate Synchronized Music Player
                <br />
                <span className="text-xs opacity-75 mt-2 block">
                  Click to start the experience
                </span>
              </p>
              <button
                onClick={() => {
                  youtube.enableAudio();
                  setShowMusicStartOverlay(false);
                  // Jump to target BPM when entering app
                  if (adapter.setBpm) {
                    adapter.setBpm(145);
                  }
                }}
                className="px-8 py-4 bg-primary text-black font-bold text-lg rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-3 shadow-lg"
              >
                <Heart className="w-6 h-6" />
                ENTER APP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header / Top Bar */}
      <header className="relative border-b border-border/50 pb-4 shrink-0">
        {/* Logo - Vertically Centered */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--primary)]" />
          <h1 className="text-2xl font-mono font-bold tracking-widest text-primary glow-text hidden md:block">
            VITAL<span className="text-white">SENSE</span>
          </h1>
          <h1 className="text-xl font-mono font-bold text-primary md:hidden">
            VITAL<span className="text-white">SENSE</span>
          </h1>
        </div>

        {/* Right Side Content */}
        <div className="flex flex-col items-end gap-2">
          {/* Top Row: Settings + Connection Status */}
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="p-2 hover:bg-accent rounded-lg transition-colors group"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            {/* Connection Status */}
            <div className="flex items-center gap-6 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">
                  {bpmHistory.length > 0 ? `${bpmHistory.length}s` : "NO DATA"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi
                  className={`w-4 h-4 ${
                    isConnected ? "text-primary" : "text-red-500"
                  }`}
                />
                <span className="hidden sm:inline">
                  {isConnected ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Music
                  className={`w-4 h-4 ${
                    youtube.isConnected
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                />
                <span className="hidden sm:inline">
                  {youtube.isConnected ? "YOUTUBE" : "NO MUSIC"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-8 text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase text-muted-foreground/50">
                Avg. HR:
              </span>
              <span className="text-white font-bold">
                {avgBpm > 0 ? `${avgBpm} BPM` : "--"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase text-muted-foreground/50">
                Session:
              </span>
              <span className="text-white font-bold">
                {sessionDuration > 0
                  ? `${String(Math.floor(sessionDuration / 3600)).padStart(
                      2,
                      "0"
                    )}:${String(
                      Math.floor((sessionDuration % 3600) / 60)
                    ).padStart(2, "0")}:${String(sessionDuration % 60).padStart(
                      2,
                      "0"
                    )}`
                  : "--:--:--"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase text-muted-foreground/50">
                Version:
              </span>
              <span className="text-white font-bold">
                {process.env.NEXT_PUBLIC_APP_VERSION || "dev"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase text-muted-foreground/50">
                Commit:
              </span>
              <span className="text-white font-bold">
                {process.env.NEXT_PUBLIC_COMMIT_HASH || "unknown"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 p-2 rounded text-xs font-mono text-red-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {youtube.error && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 p-2 rounded text-xs font-mono text-yellow-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Music className="w-4 h-4" />
          YouTube Music: {youtube.error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 grow min-h-0 overflow-hidden">
        {/* Left Column: ECG & Main Readouts */}
        <div className="flex flex-col gap-4 grow min-w-0 h-full min-h-0">
          {/* Main Graph Container */}
          <div className="relative grow rounded-lg border border-border bg-card overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] flex flex-col min-h-[200px] sm:min-h-[300px]">
            {/* Overlay Grid (CSS handled) */}
            <div className="absolute top-4 left-4 z-10 text-xs font-mono text-primary/50 pointer-events-none">
              LEAD II <br />
              25mm/s 10mm/mV
            </div>

            <div className="absolute top-4 right-4 z-10 text-xs font-mono bg-black/50 px-2 py-1 rounded border border-border text-muted-foreground pointer-events-none">
              SOURCE:{" "}
              <span className="text-white">{adapter.name.toUpperCase()}</span>
            </div>

            <div className="grow relative">
              <ECGGraph bpm={bpm} isRunning={isConnected} />
            </div>

            {/* Bottom status bar in graph */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm border-t border-border p-2 flex justify-between items-center px-4 gap-2">
              <span className="text-xs font-mono text-muted-foreground truncate flex-1">
                {statusMessage}
              </span>
              <span
                className={`text-xs font-mono font-bold whitespace-nowrap ${getStatusColor()}`}
              >
                {getStatusText()}
              </span>
            </div>
          </div>

          {/* Bottom Panels Grid */}
          <div
            className={`grid gap-4 h-[180px] sm:h-[200px] md:h-[240px] shrink-0 ${
              showPlaylist
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 md:grid-cols-3"
            }`}
          >
            {/* BPM Big Display */}
            <div className="rounded-lg border border-border bg-card p-6 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-2 right-2 text-xs font-mono text-muted-foreground">
                HR (BPM)
              </div>
              <div className="flex items-baseline gap-1">
                <Heart
                  className={`w-6 h-6 ${
                    bpm > 0
                      ? "animate-pulse text-red-500"
                      : "text-muted-foreground"
                  }`}
                  fill="currentColor"
                />
                <span
                  className={`text-7xl font-bold font-mono tracking-tighter ${getStatusColor()} glow-text`}
                >
                  {bpm}
                </span>
              </div>
              <div className="w-full grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/30">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    SpO2
                  </div>
                  <div className="text-xl font-mono text-blue-400">98%</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    RESP
                  </div>
                  <div className="text-xl font-mono text-yellow-400">16</div>
                </div>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="rounded-lg border border-border bg-secondary/10 p-4 flex flex-col gap-4 overflow-y-auto">
              <div className="flex items-center gap-2 text-primary/80 border-b border-white/10 pb-2">
                <Activity className="w-4 h-4" />
                <h3 className="text-xs font-mono font-bold uppercase">
                  System Control
                </h3>
              </div>

              {/* Source Toggle */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setAdapterType("manual")}
                  className={`text-[10px] font-mono py-2 rounded border ${
                    adapterType === "manual"
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-black border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  MANUAL
                </button>
                <button
                  onClick={() => setAdapterType("simulation")}
                  className={`text-[10px] font-mono py-2 rounded border ${
                    adapterType === "simulation"
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-black border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  SIM
                </button>
                <button
                  onClick={() => setAdapterType("serial")}
                  className={`text-[10px] font-mono py-2 rounded border ${
                    adapterType === "serial"
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-black border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  USB
                </button>
              </div>

              {/* Dynamic Controls based on Adapter */}
              <div className="h-[140px] flex items-start">
                {adapterType === "manual" && (
                  <div className="space-y-3 animate-in fade-in w-full">
                    <form onSubmit={handleUpdateBpm} className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max="300"
                        value={inputBuffer}
                        onChange={(e) => setInputBuffer(e.target.value)}
                        className="w-full bg-black border border-border rounded px-2 py-1 font-mono text-primary text-sm"
                      />
                      <button
                        type="submit"
                        className="bg-primary text-black px-3 py-1 rounded text-xs font-bold"
                      >
                        SET
                      </button>
                    </form>
                    <div className="grid grid-cols-4 gap-2">
                      {[60, 80, 120, 160].map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            setInputBuffer(p.toString());
                            if (adapter.setBpm) adapter.setBpm(p);
                          }}
                          className="bg-secondary/50 hover:bg-secondary text-[10px] py-1 rounded"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleRandomize}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded bg-secondary/20 hover:bg-secondary/40 text-xs text-primary transition-colors"
                    >
                      <Shuffle className="w-3 h-3" /> RANDOMIZE
                    </button>
                  </div>
                )}
                {adapterType === "serial" && (
                  <div className="space-y-3 animate-in fade-in w-full">
                    {!isConnected ? (
                      <button
                        onClick={handleConnectSerial}
                        className="w-full py-3 bg-primary text-black font-bold text-xs rounded uppercase flex items-center justify-center gap-2"
                      >
                        <Usb className="w-4 h-4" /> Connect Device
                      </button>
                    ) : (
                      <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400 text-center">
                        SIGNAL LOCKED
                      </div>
                    )}
                  </div>
                )}
                {adapterType === "simulation" && (
                  <div className="p-3 bg-primary/5 border border-primary/10 rounded text-xs text-primary/70 font-mono w-full">
                    Auto-generating variable heart rhythm pattern.
                  </div>
                )}
              </div>
            </div>

            {/* Now Playing Panel */}
            <div className="rounded-lg border border-border bg-black/40 p-4 flex flex-col gap-3 overflow-hidden">
              <div className="flex items-center gap-2 text-primary/80 border-b border-white/10 pb-2">
                <Music className="w-4 h-4" />
                <h3 className="text-xs font-mono font-bold uppercase">
                  Now Playing
                </h3>
              </div>

              {currentTrack ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded bg-gradient-to-br ${getGenreColor(
                        currentTrack.genre
                      )} flex items-center justify-center shrink-0 shadow-lg relative`}
                    >
                      <Music className="w-6 h-6 text-white" />
                      {/* Visual volume indicator on album art */}
                      <div
                        className="absolute inset-0 rounded"
                        style={{
                          opacity: volumeA * 0.3,
                          boxShadow: `0 0 ${volumeA * 20}px rgba(0,255,157,${
                            volumeA * 0.5
                          })`,
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-white truncate">
                        {currentTrack.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {currentTrack.artist}
                      </div>
                      <div className="text-[10px] text-primary/70 font-mono">
                        {Math.round(currentTrack.bpm)} BPM •{" "}
                        {currentTrack.genre}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                      <span>
                        {Math.floor(
                          ((progress / 100) * currentTrack.duration) / 60
                        )}
                        :
                        {String(
                          Math.floor(
                            ((progress / 100) * currentTrack.duration) % 60
                          )
                        ).padStart(2, "0")}
                      </span>
                      <span>
                        {Math.floor(currentTrack.duration / 60)}:
                        {String(
                          Math.floor(currentTrack.duration % 60)
                        ).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2 pt-1">
                      <Volume2 className="w-3 h-3 text-primary/70" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={masterVolume}
                        onChange={(e) =>
                          setMasterVolume(Number(e.target.value))
                        }
                        className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                      />
                      <span className="text-[10px] font-mono text-primary/70 w-7 text-right">
                        {masterVolume}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-xs font-mono italic">
                  No track playing
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Playlist / Vertical Carousel */}
        <div
          className={`
            fixed lg:relative top-0 right-0 h-full z-50 
            transition-transform duration-500 ease-in-out
            ${
              showPlaylist
                ? "translate-x-0"
                : "translate-x-full lg:translate-x-0"
            }
            w-full sm:w-[320px] lg:w-[280px] lg:min-w-[280px] lg:max-w-[280px] lg:shrink-0
          `}
        >
          <div className="w-full h-full border-l lg:border lg:rounded-lg border-border/50 overflow-hidden bg-black/20 backdrop-blur-xl shadow-2xl">
            <BpmPlaylist currentBpm={bpm} />
          </div>
        </div>

        {/* Side Tab Button for collapsed playlist on mobile/tablet */}
        {!showPlaylist && (
          <button
            onClick={() => setShowPlaylist(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-40 lg:hidden bg-primary text-black px-2 py-4 rounded-l-lg shadow-lg hover:px-3 transition-all flex flex-col items-center gap-1 font-mono text-xs font-bold"
          >
            <Maximize2 className="w-4 h-4" />
            <span
              style={{ writingMode: "vertical-rl" }}
              className="transform rotate-180"
            >
              PLAYLIST
            </span>
          </button>
        )}

        {/* Overlay for mobile when playlist is open */}
        {showPlaylist && (
          <div
            onClick={() => setShowPlaylist(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </div>
    </div>
  );
}
