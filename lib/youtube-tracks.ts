// Individual track configuration with BPM
export interface YouTubeTrack {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  bpm: number;
  genre: string;
}

// Pre-loaded tracks with BPM info
export const DEFAULT_TRACKS: YouTubeTrack[] = [
  {
    id: "1",
    videoId: "u7K72X4eo_s",
    title: "Teardrop",
    artist: "Massive Attack",
    bpm: 77,
    genre: "Trip Hop",
  },
  {
    id: "2",
    videoId: "nlcIKh6sBtc",
    title: "Royals",
    artist: "Lorde",
    bpm: 85,
    genre: "Pop",
  },
  {
    id: "3",
    videoId: "3KL9mRus19o",
    title: "No Diggity",
    artist: "Blackstreet",
    bpm: 89,
    genre: "R&B",
  },
  {
    id: "4",
    videoId: "ViwtNLUqkMY",
    title: "Crazy in Love",
    artist: "Beyoncé",
    bpm: 99,
    genre: "Pop",
  },
  {
    id: "5",
    videoId: "DUT5rEU6pqM",
    title: "Hips Don't Lie",
    artist: "Shakira",
    bpm: 104,
    genre: "Latin Pop",
  },
  {
    id: "6",
    videoId: "TSVHoHyErBQ",
    title: "Rock Your Body",
    artist: "Justin Timberlake",
    bpm: 109,
    genre: "Pop",
  },
  {
    id: "7",
    videoId: "I_izvAbhExY",
    title: "Stayin' Alive",
    artist: "Bee Gees",
    bpm: 114,
    genre: "Disco",
  },
  {
    id: "8",
    videoId: "5NV6Rdv1a3I",
    title: "Get Lucky",
    artist: "Daft Punk",
    bpm: 119,
    genre: "Disco",
  },
  {
    id: "9",
    videoId: "QtXby3twMmI",
    title: "Adventure of a Lifetime",
    artist: "Coldplay",
    bpm: 124,
    genre: "Pop",
  },
  {
    id: "10",
    videoId: "IcrbM1l_BoI",
    title: "Wake Me Up",
    artist: "Avicii",
    bpm: 129,
    genre: "Electronic",
  },
  {
    id: "11",
    videoId: "JRfuAukYTKg",
    title: "Titanium",
    artist: "David Guetta",
    bpm: 134,
    genre: "Electronic",
  },
  {
    id: "12",
    videoId: "oRdxUFDoQe0",
    title: "Beat It",
    artist: "Michael Jackson",
    bpm: 139,
    genre: "Rock",
  },
  {
    id: "13",
    videoId: "gGdGFtwCNBE",
    title: "Mr. Brightside",
    artist: "The Killers",
    bpm: 144,
    genre: "Rock",
  },
  {
    id: "14",
    videoId: "HgzGwKwLmgM",
    title: "Don't Stop Me Now",
    artist: "Queen",
    bpm: 149,
    genre: "Rock",
  },
  {
    id: "15",
    videoId: "QWfZ5ZZZ5TQ",
    title: "Maniac",
    artist: "Michael Sembello",
    bpm: 154,
    genre: "Pop",
  },
  {
    id: "16",
    videoId: "nfWlot6h_JM",
    title: "Shake It Off",
    artist: "Taylor Swift",
    bpm: 159,
    genre: "Pop",
  },
  {
    id: "17",
    videoId: "PWgvGjAhvIw",
    title: "Hey Ya!",
    artist: "OutKast",
    bpm: 164,
    genre: "Hip Hop",
  },
  {
    id: "18",
    videoId: "djV11Xbc914",
    title: "Take On Me",
    artist: "a-ha",
    bpm: 169,
    genre: "Synth-pop",
  },
  {
    id: "19",
    videoId: "4NRXx6U8ABQ",
    title: "Blinding Lights",
    artist: "The Weeknd",
    bpm: 174,
    genre: "Synth-pop",
  },
  {
    id: "20",
    videoId: "SBjQ9tuuTJQ",
    title: "The Pretender",
    artist: "Foo Fighters",
    bpm: 179,
    genre: "Rock",
  },
];

// Find closest track by BPM
export function findClosestTrack(
  bpm: number,
  tracks: YouTubeTrack[] = DEFAULT_TRACKS
): YouTubeTrack | null {
  if (tracks.length === 0 || bpm <= 0) return null;

  // Only consider tracks within ±5 BPM range
  const BPM_TOLERANCE = 5;
  const tracksInRange = tracks.filter(
    (track) => Math.abs(track.bpm - bpm) <= BPM_TOLERANCE
  );

  if (tracksInRange.length === 0) {
    console.log(
      `[YouTube] No tracks found within ±${BPM_TOLERANCE} BPM of ${bpm}`
    );
    return null;
  }

  // Sort by BPM difference and return closest
  const sorted = tracksInRange.sort((a, b) => {
    const diffA = Math.abs(a.bpm - bpm);
    const diffB = Math.abs(b.bpm - bpm);
    return diffA - diffB;
  });

  return sorted[0];
}

// Save tracks to localStorage
export function saveTracksToLocalStorage(tracks: YouTubeTrack[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("youtube-tracks", JSON.stringify(tracks));
  }
}

// Load tracks from localStorage
export function loadTracksFromLocalStorage(): YouTubeTrack[] {
  if (typeof window === "undefined") return DEFAULT_TRACKS;

  try {
    const stored = localStorage.getItem("youtube-tracks");
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log(
        "[Tracks] Loaded from localStorage:",
        parsed.length,
        "tracks"
      );
      return parsed;
    }
  } catch (error) {
    console.error("Failed to load tracks from localStorage:", error);
  }

  console.log("[Tracks] Using DEFAULT_TRACKS");
  return DEFAULT_TRACKS;
}
