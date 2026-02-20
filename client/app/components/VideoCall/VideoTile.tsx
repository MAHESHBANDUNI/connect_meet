"use client";

import { useEffect, useRef } from 'react';
import { User } from '@/app/types';
import { MicIcon, MicOff, VideoOffIcon } from 'lucide-react';

interface VideoTileProps {
  user: User;
  screenSharer?: User | null;
}

export const VideoTile = ({ user, screenSharer }: VideoTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current || !user.stream) return;

    videoRef.current.srcObject = user.stream;
    videoRef.current.muted = user.isLocal;
    videoRef.current.play().catch(() => {});
  }, [user.stream, user.isLocal]);
  
  const userName = user.id.split(":")[0];

  return (
    <div className={`relative group rounded-3xl object-cover overflow-hidden bg-[#1a1d23] shadow-2xl border border-white/5 ring-1 ring-white/10 transition-all duration-500 hover:ring-blue-500/50 w-full ${screenSharer ? 'h-[240px]' : 'h-full'}`}>
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
          </div>
        </div>
      )}

      <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
        <div className="flex justify-end">
          {user.isAudioMuted && (
            <div className="bg-blue-400 backdrop-blur-md rounded-full p-2.5 animate-in fade-in zoom-in duration-300">
              <MicOff className="w-6 h-6 text-white" />
            </div>
          ) 
          }
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
