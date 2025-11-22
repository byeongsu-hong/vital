export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  genre: string;
  cover?: string;
  duration: number;
}

const GENRE_COLORS: Record<string, string> = {
  pop: "from-pink-500 to-rose-500",
  rock: "from-red-600 to-orange-600",
  "hip hop": "from-purple-600 to-indigo-600",
  electronic: "from-cyan-500 to-blue-500",
  jazz: "from-yellow-600 to-amber-700",
  classical: "from-slate-600 to-slate-800",
  "r&b": "from-fuchsia-600 to-purple-700",
  disco: "from-yellow-500 to-orange-500",
  "trip hop": "from-indigo-600 to-purple-600",
  "latin pop": "from-orange-500 to-red-500",
  "synth-pop": "from-blue-500 to-purple-500",
};

export const getGenreColor = (genre: string): string => {
  return GENRE_COLORS[genre.toLowerCase()] ?? "from-gray-600 to-gray-800";
};

export const MOCK_TRACKS: Track[] = [
  {
    id: "1",
    title: "Teardrop",
    artist: "Massive Attack",
    bpm: 77,
    genre: "Trip Hop",
    duration: 331,
  },
  {
    id: "2",
    title: "Royals",
    artist: "Lorde",
    bpm: 85,
    genre: "Pop",
    duration: 190,
  },
  {
    id: "3",
    title: "No Diggity",
    artist: "Blackstreet",
    bpm: 89,
    genre: "R&B",
    duration: 305,
  },
  {
    id: "4",
    title: "Crazy in Love",
    artist: "Beyoncé",
    bpm: 99,
    genre: "Pop",
    duration: 236,
  },
  {
    id: "5",
    title: "Hips Don't Lie",
    artist: "Shakira",
    bpm: 104,
    genre: "Latin Pop",
    duration: 218,
  },
  {
    id: "6",
    title: "Rock Your Body",
    artist: "Justin Timberlake",
    bpm: 109,
    genre: "Pop",
    duration: 267,
  },
  {
    id: "7",
    title: "Stayin' Alive",
    artist: "Bee Gees",
    bpm: 114,
    genre: "Disco",
    duration: 285,
  },
  {
    id: "8",
    title: "Get Lucky",
    artist: "Daft Punk",
    bpm: 119,
    genre: "Disco",
    duration: 369,
  },
  {
    id: "9",
    title: "Adventure of a Lifetime",
    artist: "Coldplay",
    bpm: 124,
    genre: "Pop",
    duration: 263,
  },
  {
    id: "10",
    title: "Wake Me Up",
    artist: "Avicii",
    bpm: 129,
    genre: "Electronic",
    duration: 247,
  },
  {
    id: "11",
    title: "Titanium",
    artist: "David Guetta",
    bpm: 134,
    genre: "Electronic",
    duration: 245,
  },
  {
    id: "12",
    title: "Beat It",
    artist: "Michael Jackson",
    bpm: 139,
    genre: "Rock",
    duration: 258,
  },
  {
    id: "13",
    title: "Mr. Brightside",
    artist: "The Killers",
    bpm: 144,
    genre: "Rock",
    duration: 222,
  },
  {
    id: "14",
    title: "Don't Stop Me Now",
    artist: "Queen",
    bpm: 149,
    genre: "Rock",
    duration: 209,
  },
  {
    id: "15",
    title: "Maniac",
    artist: "Michael Sembello",
    bpm: 154,
    genre: "Pop",
    duration: 244,
  },
  {
    id: "16",
    title: "Shake It Off",
    artist: "Taylor Swift",
    bpm: 159,
    genre: "Pop",
    duration: 219,
  },
  {
    id: "17",
    title: "Hey Ya!",
    artist: "OutKast",
    bpm: 164,
    genre: "Hip Hop",
    duration: 235,
  },
  {
    id: "18",
    title: "Take On Me",
    artist: "a-ha",
    bpm: 169,
    genre: "Synth-pop",
    duration: 225,
  },
  {
    id: "19",
    title: "Blinding Lights",
    artist: "The Weeknd",
    bpm: 174,
    genre: "Synth-pop",
    duration: 200,
  },
  {
    id: "20",
    title: "The Pretender",
    artist: "Foo Fighters",
    bpm: 179,
    genre: "Rock",
    duration: 269,
  },
];
