import CallTable from '@/components/CallTable';
import { Activity } from 'lucide-react';

export const metadata = {
  title: 'Voice Agent Dashboard - Transmission Log',
  description: 'Monitor your AI Voice Agent conversations in real-time.',
};

export default function Home() {
  return (
    <main className="min-h-screen p-8 md:p-12 lg:p-16 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white glow-text">
            Transmission Log
          </h1>
          <p className="text-gray-400 text-lg">
            Incoming signals from ElevenLabs Neural Network.
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-sm animate-float">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
          <span className="text-indigo-300 font-medium text-sm tracking-wide">SYSTEM ONLINE</span>
        </div>
      </header>

      <section>
        <CallTable />
      </section>

      <footer className="text-center text-gray-600 text-sm py-12">
        <p>End of Transmission.</p>
      </footer>
    </main>
  );
}
