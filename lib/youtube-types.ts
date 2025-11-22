// YouTube IFrame Player API Types
// https://developers.google.com/youtube/iframe_api_reference

export interface YouTubePlaylist {
  id: string;
  name: string;
  bpmRange: {
    min: number;
    max: number;
  };
  youtubePlaylistId?: string; // YouTube playlist ID (PLxxx...)
  videoIds?: string[]; // Array of YouTube video IDs
}

export interface YouTubeConfig {
  playlists: YouTubePlaylist[];
}

// YouTube Player States
export enum YouTubePlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

export interface YouTubePlayerVars {
  autoplay?: 0 | 1;
  controls?: 0 | 1;
  disablekb?: 0 | 1;
  enablejsapi?: 0 | 1;
  fs?: 0 | 1;
  iv_load_policy?: 1 | 3;
  modestbranding?: 0 | 1;
  mute?: 0 | 1;
  origin?: string;
  playsinline?: 0 | 1;
  rel?: 0 | 1;
}

export interface YouTubePlayerOptions {
  height?: string | number;
  width?: string | number;
  videoId?: string;
  playerVars?: YouTubePlayerVars;
  events?: {
    onReady?: (event: YouTubePlayerEvent) => void;
    onStateChange?: (event: YouTubePlayerEvent) => void;
    onError?: (event: YouTubePlayerEvent) => void;
  };
}

export interface YouTubePlayerEvent {
  target: YouTubePlayer;
  data?: number;
}

export interface YouTubeVideoData {
  video_id: string;
  author: string;
  title: string;
}

export interface YouTubePlayer {
  // Playback controls
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  nextVideo(): void;
  previousVideo(): void;

  // Video loading
  loadVideoById(videoId: string, startSeconds?: number): void;
  cueVideoById(videoId: string, startSeconds?: number): void;

  // Playlist functions
  loadPlaylist(
    playlist: string | string[],
    index?: number,
    startSeconds?: number
  ): void;
  cuePlaylist(
    playlist: string | string[],
    index?: number,
    startSeconds?: number
  ): void;

  // Playback status
  getPlayerState(): YouTubePlayerState;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoUrl(): string;
  getVideoData(): YouTubeVideoData;
  getPlaylist(): string[];
  getPlaylistIndex(): number;

  // Volume controls
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volume: number): void;
  getVolume(): number;

  // Cleanup
  destroy(): void;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: YouTubePlayerOptions
      ) => YouTubePlayer;
      PlayerState: typeof YouTubePlayerState;
      loaded?: number;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  track?: {
    id: string;
    title: string;
    artist: string;
  };
}
