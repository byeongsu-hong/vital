"use client";

import { useState, useEffect } from "react";
import { Music, Plus, Trash2, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DEFAULT_TRACKS,
  loadTracksFromLocalStorage,
  saveTracksToLocalStorage,
  type YouTubeTrack,
} from "@/lib/youtube-tracks";

export function YouTubeTrackEditor() {
  const [tracks, setTracks] = useState<YouTubeTrack[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loaded = loadTracksFromLocalStorage();
    setTracks(loaded);
  }, []);

  const handleAddTrack = () => {
    const newTrack: YouTubeTrack = {
      id: Date.now().toString(),
      videoId: "",
      title: "New Track",
      artist: "Unknown Artist",
      bpm: 120,
      genre: "Pop",
    };
    setTracks([...tracks, newTrack]);
  };

  const handleRemoveTrack = (id: string) => {
    setTracks(tracks.filter((t) => t.id !== id));
  };

  const handleUpdateTrack = (
    id: string,
    field: keyof YouTubeTrack,
    value: string | number
  ) => {
    setTracks(tracks.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleSave = () => {
    setIsSaving(true);
    saveTracksToLocalStorage(tracks);
    setTimeout(() => {
      setIsSaving(false);
      window.location.reload();
    }, 500);
  };

  const handleReset = () => {
    if (
      confirm(
        "Reset to default tracks? This will delete all your custom tracks."
      )
    ) {
      setTracks(DEFAULT_TRACKS);
      saveTracksToLocalStorage(DEFAULT_TRACKS);
      window.location.reload();
    }
  };

  // Sort by BPM for display
  const sortedTracks = [...tracks].sort((a, b) => a.bpm - b.bpm);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              YouTube Tracks Configuration
            </CardTitle>
            <CardDescription>
              Each track will play when your heart rate matches its BPM
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save & Apply"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {sortedTracks.map((track) => (
            <div
              key={track.id}
              className="p-4 border rounded-lg space-y-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      YouTube Video ID
                    </Label>
                    <Input
                      value={track.videoId}
                      onChange={(e) =>
                        handleUpdateTrack(track.id, "videoId", e.target.value)
                      }
                      placeholder="dQw4w9WgXcQ"
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">BPM</Label>
                    <Input
                      type="number"
                      value={track.bpm}
                      onChange={(e) =>
                        handleUpdateTrack(
                          track.id,
                          "bpm",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min={40}
                      max={220}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Title
                    </Label>
                    <Input
                      value={track.title}
                      onChange={(e) =>
                        handleUpdateTrack(track.id, "title", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Artist
                    </Label>
                    <Input
                      value={track.artist}
                      onChange={(e) =>
                        handleUpdateTrack(track.id, "artist", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTrack(track.id)}
                  className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={handleAddTrack}
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Track
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
