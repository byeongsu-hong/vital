"use client";

import { useState, useEffect, useCallback } from "react";
import { type Track, MOCK_TRACKS } from "@/lib/track-data";

const BPM_RANGE = 5;
const BPM_CHANGE_THRESHOLD = 3;
const FADE_STEP = 0.05;
const FADE_INTERVAL_MS = 100;
const PROGRESS_UPDATE_INTERVAL_MS = 1000;
const MAX_VOLUME = 1;
const MIN_VOLUME = 0;
const MAX_PROGRESS = 100;
const LARGE_BPM_DIFF = 999;

export function useSimulatedPlayer(currentBpm: number) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [nextTrack, setNextTrack] = useState<Track | null>(null);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [volumeA, setVolumeA] = useState(MAX_VOLUME);
  const [volumeB, setVolumeB] = useState(MIN_VOLUME);

  const findClosestTrack = useCallback((bpm: number): Track | null => {
    const tracksInRange = MOCK_TRACKS.filter(
      (track) => Math.abs(track.bpm - bpm) <= BPM_RANGE
    );

    if (tracksInRange.length === 0) return null;

    return tracksInRange.sort(
      (a, b) => Math.abs(a.bpm - bpm) - Math.abs(b.bpm - bpm)
    )[0];
  }, []);

  const triggerTransition = useCallback(
    (newTrack: Track) => {
      if (isTransitioning) return;

      if (!currentTrack) {
        setCurrentTrack(newTrack);
        setVolumeA(MAX_VOLUME);
        return;
      }

      setNextTrack(newTrack);
      setIsTransitioning(true);
      setVolumeB(MIN_VOLUME);
    },
    [currentTrack, isTransitioning]
  );

  const shouldSwitchTrack = useCallback(
    (bestMatch: Track | null, currentBpm: number): boolean => {
      if (!bestMatch) return false;
      if (bestMatch.id === currentTrack?.id || bestMatch.id === nextTrack?.id) {
        return false;
      }

      const currentDiff = currentTrack
        ? Math.abs(currentTrack.bpm - currentBpm)
        : LARGE_BPM_DIFF;
      const newDiff = Math.abs(bestMatch.bpm - currentBpm);

      return (
        !currentTrack ||
        currentDiff > BPM_RANGE ||
        newDiff < currentDiff - BPM_CHANGE_THRESHOLD
      );
    },
    [currentTrack, nextTrack]
  );

  useEffect(() => {
    if (currentBpm <= 0) return;

    const bestMatch = findClosestTrack(currentBpm);

    if (!bestMatch) {
      if (currentTrack && !isTransitioning && volumeA > MIN_VOLUME) {
        setIsTransitioning(true);
        setNextTrack(null);
      }
      return;
    }

    if (shouldSwitchTrack(bestMatch, currentBpm)) {
      triggerTransition(bestMatch);
    }
  }, [
    currentBpm,
    currentTrack,
    isTransitioning,
    volumeA,
    findClosestTrack,
    shouldSwitchTrack,
    triggerTransition,
  ]);

  useEffect(() => {
    if (!isTransitioning) return;

    const interval = setInterval(() => {
      setVolumeA((prev) => Math.max(MIN_VOLUME, prev - FADE_STEP));

      if (nextTrack) {
        setVolumeB((prev) => Math.min(MAX_VOLUME, prev + FADE_STEP));
      }
    }, FADE_INTERVAL_MS);

    const resetState = () => {
      setIsTransitioning(false);
      setProgress(0);
    };

    if (nextTrack && volumeA <= MIN_VOLUME && volumeB >= MAX_VOLUME) {
      setCurrentTrack(nextTrack);
      setNextTrack(null);
      setVolumeA(MAX_VOLUME);
      setVolumeB(MIN_VOLUME);
      resetState();
      clearInterval(interval);
    } else if (!nextTrack && volumeA <= MIN_VOLUME) {
      setCurrentTrack(null);
      setVolumeA(MIN_VOLUME);
      setVolumeB(MIN_VOLUME);
      resetState();
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isTransitioning, volumeA, volumeB, nextTrack]);

  useEffect(() => {
    if (!currentTrack) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= MAX_PROGRESS) return 0;
        return prev + MAX_PROGRESS / currentTrack.duration;
      });
    }, PROGRESS_UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [currentTrack]);

  return {
    currentTrack,
    nextTrack,
    progress,
    isTransitioning,
    volumeA,
    volumeB,
  };
}
