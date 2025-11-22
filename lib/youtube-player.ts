"use client";

import type { YouTubePlayer, YouTubePlayerEvent } from "./youtube-types";
import type { YouTubeTrack } from "./youtube-tracks";

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  track?: {
    id: string;
    title: string;
    artist: string;
    bpm: number;
  };
}

export class YouTubeMusicPlayer {
  private player: YouTubePlayer | null = null;
  private tracks: YouTubeTrack[] = [];
  private currentTrack: YouTubeTrack | null = null;
  private isInitialized = false;
  private playbackState: PlaybackState | null = null;
  private onPlaybackStateChange?: (state: PlaybackState) => void;
  private updateInterval: NodeJS.Timeout | null = null;
  private isFading: boolean = false;
  private hasUserInteracted: boolean = false;

  constructor(tracks?: YouTubeTrack[]) {
    if (tracks) {
      this.tracks = tracks;
    }
  }

  async connect(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadYouTubeAPI();
      await this.createPlayer();
      this.isInitialized = true;
      this.startUpdateLoop();
    } catch (error) {
      console.error("Failed to connect to YouTube:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.player) {
      this.player.destroy();
      this.player = null;
    }

    this.isInitialized = false;
  }

  getStatus(): ConnectionStatus {
    if (!this.isInitialized) return "disconnected";
    if (this.player) return "connected";
    return "connecting";
  }

  getPlaybackState(): PlaybackState | null {
    return this.playbackState;
  }

  setTracks(tracks: YouTubeTrack[]): void {
    this.tracks = tracks;
  }

  onPlaybackChange(callback: (state: PlaybackState) => void): void {
    this.onPlaybackStateChange = callback;
  }

  async playTrack(track: YouTubeTrack): Promise<void> {
    if (!this.player) {
      throw new Error("YouTube player not initialized");
    }

    // Don't switch if already playing this track
    if (this.currentTrack?.id === track.id) {
      console.log(`[YouTube] Already playing ${track.title}, skipping...`);
      return;
    }

    console.log(
      `[YouTube] Playing: ${track.artist} - ${track.title} (${track.bpm} BPM)`
    );

    try {
      await this.crossfadeToVideo(track);
      this.currentTrack = track;
    } catch (error) {
      console.error("Failed to play track:", error);
      throw error;
    }
  }

  async pause(): Promise<void> {
    if (this.player) {
      this.player.pauseVideo();
    }
  }

  async resume(): Promise<void> {
    if (this.player) {
      this.player.playVideo();
    }
  }

  async skip(): Promise<void> {
    // Skip not applicable for single tracks
    console.log("[YouTube] Skip not implemented for single track mode");
  }

  setVolume(volume: number): void {
    if (this.player) {
      this.player.setVolume(volume);
      // If setting volume, assume user wants sound (unmute)
      if (this.player.isMuted && this.player.isMuted()) {
        this.player.unMute();
        this.hasUserInteracted = true;
      }
    }
  }

  enableAudio(): void {
    if (this.player && this.player.isMuted && this.player.isMuted()) {
      console.log("[YouTube] Enabling audio after user interaction");
      this.player.unMute();
      this.hasUserInteracted = true;
    }
  }

  private async loadYouTubeAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;

      window.onYouTubeIframeAPIReady = () => {
        resolve();
      };

      tag.onerror = () => {
        reject(new Error("Failed to load YouTube API"));
      };

      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    });
  }

  private async createPlayer(): Promise<void> {
    return new Promise((resolve, reject) => {
      const playerDiv = document.createElement("div");
      playerDiv.id = "youtube-player-hidden";
      playerDiv.style.position = "absolute";
      playerDiv.style.left = "-9999px";
      playerDiv.style.width = "1px";
      playerDiv.style.height = "1px";
      document.body.appendChild(playerDiv);

      this.player = new window.YT.Player("youtube-player-hidden", {
        height: "1",
        width: "1",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
          enablejsapi: 1,
          mute: 1, // Start muted to bypass autoplay restrictions
        },
        events: {
          onReady: (event: YouTubePlayerEvent) => {
            // Immediately unmute on ready
            if (event.target) {
              event.target.unMute();
              this.hasUserInteracted = true;
              console.log("[YouTube] Player ready and unmuted");
            }
            resolve();
          },
          onStateChange: (event: YouTubePlayerEvent) => {
            this.handleStateChange(event);
          },
          onError: (event: YouTubePlayerEvent) => {
            console.error("YouTube player error:", event.data);
            reject(new Error(`YouTube player error: ${event.data}`));
          },
        },
      });
    });
  }

  private handleStateChange(event: YouTubePlayerEvent): void {
    // Unmute after first successful play (state 1 = playing)
    if (event.data === 1 && !this.hasUserInteracted && this.player) {
      console.log("[YouTube] Unmuting player after successful autoplay");
      this.player.unMute();
      this.hasUserInteracted = true;
    }
    this.updatePlaybackState();
  }

  private startUpdateLoop(): void {
    this.updateInterval = setInterval(() => {
      if (this.player) {
        this.updatePlaybackState();
      }
    }, 500);
  }

  private updatePlaybackState(): void {
    if (!this.player) return;

    const state = this.player.getPlayerState();
    const videoData = this.player.getVideoData();

    this.playbackState = {
      isPlaying: state === 1,
      currentTime: this.player.getCurrentTime(),
      duration: this.player.getDuration(),
      track: this.currentTrack
        ? {
            id: this.currentTrack.id,
            title: this.currentTrack.title,
            artist: this.currentTrack.artist,
            bpm: this.currentTrack.bpm,
          }
        : videoData
        ? {
            id: videoData.video_id,
            title: videoData.title || "Unknown",
            artist: videoData.author || "Unknown Artist",
            bpm: 0,
          }
        : undefined,
    };

    if (this.onPlaybackStateChange && this.playbackState) {
      this.onPlaybackStateChange(this.playbackState);
    }
  }

  private async crossfadeToVideo(track: YouTubeTrack): Promise<void> {
    if (!this.player || this.isFading) return;

    this.isFading = true;
    const startVolume = this.player.getVolume() || 80; // Default to 80 if no video loaded yet

    // If this is the first video, skip fade out
    const isFirstVideo = !this.currentTrack;

    // Fade out (500ms) - skip for first video
    if (!isFirstVideo) {
      const fadeSteps = 10;
      const fadeInterval = 50;

      for (let i = fadeSteps; i >= 0; i--) {
        if (!this.player) break;
        const volume = (startVolume * i) / fadeSteps;
        this.player.setVolume(volume);
        await new Promise((resolve) => setTimeout(resolve, fadeInterval));
      }
    }

    // Load new video
    this.player.loadVideoById(track.videoId);

    // Ensure player is unmuted after first interaction
    if (
      this.hasUserInteracted &&
      this.player.isMuted &&
      this.player.isMuted()
    ) {
      this.player.unMute();
    }

    this.player.playVideo();

    // Fade in (500ms)
    const fadeSteps = 10;
    const fadeInterval = 50;

    for (let i = 0; i <= fadeSteps; i++) {
      if (!this.player) break;
      const volume = (startVolume * i) / fadeSteps;
      this.player.setVolume(volume);
      await new Promise((resolve) => setTimeout(resolve, fadeInterval));
    }

    this.isFading = false;
  }
}
