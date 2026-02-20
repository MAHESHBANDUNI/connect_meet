"use client";

import { useEffect, useRef } from "react";
import { User } from "@/app/types";
import { MicOff } from "lucide-react";

interface VideoTileProps {
  user: User;
}

export const ScreenPresentTile = ({ user }: VideoTileProps) => {
  const screenRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = screenRef.current;

    if (!video) return;

    if (user.screenStream) {
      video.srcObject = user.screenStream;
      video.muted = user.isLocal;
      video.playsInline = true;

      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }

    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [user.screenStream, user.isLocal]);

  if (!user.screenStream) return null;

  const userName = user.id.split(":")[0];

  return (
    <div className="relative group rounded-3xl aspect-video overflow-hidden bg-[#1a1d23] shadow-2xl border border-white/5 ring-1 ring-white/10 transition-all duration-500 hover:ring-blue-500/50 w-full h-full">
      <video
        ref={screenRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain bg-black transition-opacity duration-700"
      />

      <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 shadow-2xl transition-transform duration-300 group-hover:translate-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-white/90 font-bold text-sm tracking-tight">
              {userName} (Presenting)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};