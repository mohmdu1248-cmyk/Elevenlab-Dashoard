'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2, Download, Ban } from 'lucide-react';

interface AudioPlayerProps {
    src: string;
    isActive?: boolean;
    onPlay?: () => void;
}

export default function AudioPlayer({ src, isActive = false, onPlay }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Watch for external active state changes
    useEffect(() => {
        if (!isActive && isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive, isPlaying]);

    const togglePlay = () => {
        if (!audioRef.current || isError) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            // Notify parent we are starting
            if (onPlay) onPlay();

            setIsLoading(true);
            setIsError(false);
            audioRef.current.play()
                .then(() => setIsLoading(false))
                .catch((e) => {
                    console.error("Playback failed attempt", e);
                    setIsLoading(false);
                });
        }
        setIsPlaying(!isPlaying);
    };

    if (isError) {
        return (
            <div className="flex items-center gap-3 opacity-50 cursor-not-allowed">
                <button
                    disabled
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-gray-500"
                    title="Recording Unavailable"
                >
                    <Ban className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-600 font-mono">NO DATA</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={togglePlay}
                className="
          flex items-center justify-center w-8 h-8 rounded-full 
          bg-indigo-600 hover:bg-indigo-500 text-white transition-all 
          shadow-[0_0_15px_rgba(99,102,241,0.5)] 
        "
                title={isPlaying ? "Pause" : "Play Recording"}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
            </button>

            {/* Download Button */}
            <a
                href={src}
                download={`recording-${src.split('/').pop()}.mp3`}
                className="
            flex items-center justify-center w-8 h-8 rounded-full
            bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors
        "
                title="Download Recording"
                target="_blank"
                rel="noopener noreferrer"
            >
                <Download className="w-4 h-4" />
            </a>

            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                src={src}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onError={() => {
                    setIsPlaying(false);
                    setIsLoading(false);
                    setIsError(true);
                }}
            />
        </div>
    );
}
