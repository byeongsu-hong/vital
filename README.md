# 🫀 Vital Monitor

**Real-time cardiac visualization system** that syncs music playback with your heart rate.

## ✨ Features

- 📊 **Real-time ECG Visualization** - Smooth cardiac waveform rendering
- 💓 **Heart Rate Monitoring** - Live BPM tracking
- 🎵 **BPM-Synced Music** - Automatic YouTube music matching to your heart rate
- 🎨 **Beautiful UI** - Modern, responsive design with dark mode
- 🔌 **Flexible Input Sources**:
  - Manual BPM control
  - Simulated heart rate
  - Arduino serial input (coming soon)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎵 Music Sync

Music automatically changes based on your heart rate using YouTube videos:

- **40-80 BPM**: Calm, relaxing tracks
- **80-100 BPM**: Light activity music
- **100-120 BPM**: Moderate workout tracks
- **120-140 BPM**: Vigorous exercise music
- **140-160 BPM**: High intensity tracks
- **160-200 BPM**: Maximum intensity music

### Customize Your Tracks

1. Click the ⚙️ Settings button in the top right
2. Edit, add, or remove tracks
3. Each track needs:
   - YouTube Video ID (e.g., `dQw4w9WgXcQ` from `youtube.com/watch?v=dQw4w9WgXcQ`)
   - BPM value (40-220)
   - Title and Artist (for display)
4. Click "Save & Apply" to reload

The system will automatically play the track with the closest BPM to your current heart rate.

## 🛠️ Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **YouTube IFrame Player API** - Music playback

## 📝 Configuration

### Default Tracks

The system comes pre-configured with 20 tracks spanning 77-179 BPM. You can customize these in the Settings page or directly in `lib/youtube-tracks.ts`.

### BPM Matching Logic

- Tracks are matched to the **closest BPM** value
- A minimum 3 BPM change is required to trigger a track switch
- Smooth crossfade transitions between tracks (1 second fade out/in)

## 🔧 Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📦 Project Structure

```
/app                    - Next.js pages
/components             - React components
  - heart-monitor.tsx   - Main dashboard
  - ecg-graph.tsx       - ECG visualization
  - bpm-playlist.tsx    - Track list display
  - youtube-track-editor.tsx - Settings UI
/hooks                  - React hooks
  - use-youtube-player.ts - YouTube integration
/lib                    - Core utilities
  - youtube-player.ts   - YouTube player wrapper
  - youtube-tracks.ts   - Track configuration
  - youtube-types.ts    - TypeScript types
/arduino                - Hardware integration (WIP)
```

## 🎯 How It Works

1. **BPM Detection**: System monitors heart rate from selected source (manual/simulation/serial)
2. **Track Matching**: When BPM changes significantly (>3 BPM), finds the closest matching track
3. **Smooth Transition**: Crossfades between current and next track
4. **Continuous Playback**: Each track loops until BPM changes

## 🚧 Roadmap

- [x] Real-time ECG rendering
- [x] BPM tracking
- [x] YouTube music integration
- [x] Track-based BPM matching
- [x] Smooth crossfade transitions
- [x] Track editor UI
- [ ] Arduino MAX30102 sensor integration
- [ ] Bluetooth heart rate monitor support
- [ ] Workout history tracking
- [ ] Custom ECG themes

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

Built with ❤️ for fitness enthusiasts and music lovers
