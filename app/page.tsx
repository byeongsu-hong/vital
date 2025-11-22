import { HeartMonitor } from "@/components/heart-monitor"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background selection:bg-primary selection:text-black">
      <HeartMonitor />
    </main>
  )
}
