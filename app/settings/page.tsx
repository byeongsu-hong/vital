import { YouTubeTrackEditor } from "@/components/youtube-track-editor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Monitor</span>
        </Link>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your YouTube tracks for heart rate sync
          </p>
        </div>

        {/* Settings Component */}
        <YouTubeTrackEditor />
      </div>
    </main>
  );
}
