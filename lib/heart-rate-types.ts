export interface HeartRateAdapter {
  id: string;
  name: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  // Subscribe to updates
  onReading: (callback: (bpm: number) => void) => void;
  // Optional: allows writing data back (used for manual input)
  setBpm?: (bpm: number) => void;
}

// Initial implementation: Manual Input Adapter
export class ManualInputAdapter implements HeartRateAdapter {
  id = "manual-input";
  name = "Manual Override";
  private listeners: ((bpm: number) => void)[] = [];
  private currentBpm = 60;

  async connect() {
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.emit(this.currentBpm);
  }

  disconnect() {
    this.listeners = [];
  }

  onReading(callback: (bpm: number) => void) {
    this.listeners.push(callback);
    // Immediately emit current value to new listener
    callback(this.currentBpm);
  }

  setBpm(bpm: number) {
    this.currentBpm = bpm;
    this.emit(bpm);
  }

  private emit(bpm: number) {
    this.listeners.forEach((listener) => listener(bpm));
  }
}

export class SimulationAdapter implements HeartRateAdapter {
  id = "simulation";
  name = "Demo Simulation";
  private listeners: ((bpm: number) => void)[] = [];
  private active = false;
  private currentBpm = 60;
  private intervalId: NodeJS.Timeout | null = null;

  async connect() {
    this.active = true;
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    this.emit(this.currentBpm);
    this.startSimulation();
  }

  disconnect() {
    this.active = false;
    this.listeners = [];
    if (this.intervalId) clearInterval(this.intervalId);
  }

  onReading(callback: (bpm: number) => void) {
    this.listeners.push(callback);
    callback(this.currentBpm);
  }

  setBpm(bpm: number) {
    this.currentBpm = bpm;
    this.emit(bpm);
  }

  private startSimulation() {
    // Update BPM every 2 seconds with some natural variance
    this.intervalId = setInterval(() => {
      if (!this.active) return;

      // Random walk: usually small changes, occasionally larger ones
      const noise = Math.random();
      let change = 0;

      if (noise > 0.8)
        change = Math.floor(Math.random() * 5) - 2; // Small fluctuation
      else if (noise > 0.95) change = Math.floor(Math.random() * 15) - 7; // Occasional spike

      this.currentBpm += change;

      // Keep within appropriate range based on current BPM
      // If in low range (50-70), keep it there
      if (this.currentBpm >= 50 && this.currentBpm <= 70) {
        if (this.currentBpm < 55) this.currentBpm = 55 + Math.random() * 5;
        if (this.currentBpm > 65) this.currentBpm = 65 - Math.random() * 5;
      }
      // If in high range (140-150), keep it there
      else if (this.currentBpm >= 130) {
        if (this.currentBpm < 140) this.currentBpm = 140 + Math.random() * 5;
        if (this.currentBpm > 150) this.currentBpm = 150 - Math.random() * 5;
      }

      this.emit(Math.round(this.currentBpm));
    }, 1500);
  }

  private emit(bpm: number) {
    this.listeners.forEach((l) => l(bpm));
  }
}
