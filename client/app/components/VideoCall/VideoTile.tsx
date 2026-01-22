import { useEffect, useRef } from 'react';
import { User } from '@/app/types';

interface VideoTileProps {
  user: User;
}

export const VideoTile = ({ user }: VideoTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current || !user.stream) return;

    videoRef.current.srcObject = user.stream;
    videoRef.current.muted = user.isLocal;
    videoRef.current.play().catch(() => {});
  }, [user.stream, user.isLocal]);

  const userName = user.name || user.id;

  return (
    <div className="relative group rounded-3xl overflow-hidden bg-[#1a1d23] aspect-video shadow-2xl border border-white/5 ring-1 ring-white/10 transition-all duration-500 hover:ring-blue-500/50">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-700`}
        // className={`w-full h-full object-cover transition-opacity duration-700 ${user.isVideoOff ? 'opacity-0' : 'opacity-100'}`}
      />

      {user.isVideoOff && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1d23] to-[#2a2d35]">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
              <span className="text-3xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-red-500 rounded-full p-2 border-4 border-[#1a1d23]">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Overlay Information */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
        <div className="flex justify-end">
          {user.isAudioMuted && (
            <div className="bg-red-500/90 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-red-400/20 animate-in fade-in zoom-in duration-300">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 shadow-2xl transition-transform duration-300 group-hover:translate-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-white/90 font-bold text-sm tracking-tight text-shadow-sm">
              {userName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
