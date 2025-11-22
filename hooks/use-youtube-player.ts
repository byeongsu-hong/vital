"use client";

import { useState, useEffect, useRef } from "react";
import { YouTubeMusicPlayer } from "@/lib/youtube-player";
import type { PlaybackState } from "@/lib/youtube-player";
import {
  loadTracksFromLocalStorage,
  findClosestTrack,
} from "@/lib/youtube-tracks";

export function useYouTubePlayer(currentBpm: number, enabled: boolean = false) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<YouTubeMusicPlayer | null>(null);
  const lastBpmRef = useRef<number>(0);

  // Initialize player
  useEffect(() => {
    if (!enabled) return;

    const tracks = loadTracksFromLocalStorage();
    console.log("[YouTube Player] Loaded", tracks.length, "tracks");
    playerRef.current = new YouTubeMusicPlayer(tracks);

    playerRef.current.onPlaybackChange((state) => {
      setPlaybackState(state);
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [enabled]);

  // Connect to YouTube
  const connect = async () => {
    if (!playerRef.current || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      await playerRef.current.connect();
      setIsConnected(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to YouTube"
      );
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect
  const disconnect = async () => {
    if (!playerRef.current) return;

    try {
      await playerRef.current.disconnect();
      setIsConnected(false);
      setPlaybackState(null);
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  // Play music based on BPM (initial and changes)
  useEffect(() => {
    if (!playerRef.current || !isConnected || !enabled || currentBpm <= 0)
      return;

    const isFirstPlay = lastBpmRef.current === 0;
    const bpmDiff = Math.abs(currentBpm - lastBpmRef.current);

    // Only trigger if:
    // 1. This is the first play (lastBpmRef === 0), OR
    // 2. BPM changed significantly (more than 3 BPM)
    if (!isFirstPlay && bpmDiff < 3) return;

    lastBpmRef.current = currentBpm;

    // For first play, add a small delay to ensure player is fully ready
    const delay = isFirstPlay ? 500 : 0;

    const timer = setTimeout(() => {
      if (!playerRef.current) return;

      const tracks = loadTracksFromLocalStorage();
      const track = findClosestTrack(currentBpm, tracks);

      if (!track) {
        console.log(
          `[YouTube] No track found for BPM ${currentBpm}, ${
            isFirstPlay ? "staying silent" : "pausing playback"
          }`
        );
        if (!isFirstPlay) {
          playerRef.current.pause().catch((err) => {
            console.error("Failed to pause:", err);
          });
        }
        return;
      }

      console.log(
        `[YouTube] ${
          isFirstPlay ? "Initial play" : "BPM changed"
        } at ${currentBpm} BPM:`,
        track.title
      );
      playerRef.current.playTrack(track).catch((err) => {
        console.error("Failed to play track:", err);
        setError(err instanceof Error ? err.message : "Failed to play track");
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [currentBpm, isConnected, enabled]);

  // Playback controls
  const pause = async () => {
    if (!playerRef.current) return;
    try {
      await playerRef.current.pause();
    } catch (err) {
      console.error("Failed to pause:", err);
    }
  };

  const resume = async () => {
    if (!playerRef.current) return;
    try {
      await playerRef.current.resume();
    } catch (err) {
      console.error("Failed to resume:", err);
    }
  };

  const skip = async () => {
    if (!playerRef.current) return;
    try {
      await playerRef.current.skip();
    } catch (err) {
      console.error("Failed to skip:", err);
    }
  };

  const setVolume = (volume: number) => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  };

  const enableAudio = () => {
    if (playerRef.current) {
      playerRef.current.enableAudio();
    }
  };

  return {
    isConnected,
    isConnecting,
    playbackState,
    error,
    connect,
    disconnect,
    pause,
    resume,
    skip,
    setVolume,
    enableAudio,
  };
}
