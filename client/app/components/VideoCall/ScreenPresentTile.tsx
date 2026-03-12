"use client";

import { useEffect, useRef } from "react";
import { User } from "@/app/types";
import { Maximize, Minimize } from "lucide-react";

interface VideoTileProps {
  user: User;
  speakerId?: string;
  isFullScreenShareTileEnabled: boolean;
  onToggleFullScreenShareTile: () => void;
}

export const ScreenPresentTile = ({
  user,
  speakerId = "default",
  isFullScreenShareTileEnabled,
  onToggleFullScreenShareTile,
}: VideoTileProps) => {
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

  useEffect(() => {
    const video = screenRef.current as
      | (HTMLVideoElement & {
          setSinkId?: (id: string) => Promise<void>;
        })
      | null;

    if (!video || user.isLocal || !video.setSinkId) return;
    video.setSinkId(speakerId).catch(() => {});
  }, [speakerId, user.isLocal]);

  if (!user.screenStream) return null;

  const userName = user.name;

  return (
    <div className="relative group rounded-3xl object-cover overflow-hidden bg-[#1a1d23] shadow-2xl border border-white/5 ring-1 ring-white/10 transition-all duration-500 hover:ring-blue-500/50 w-full h-full">
      <video
        ref={screenRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain bg-black transition-opacity duration-700"
      />

      {/* Overlay */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 shadow-2xl transition-transform duration-300 group-hover:translate-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-white/90 font-bold text-sm tracking-tight">
              {userName} (Presenting)
            </span>
          </div>
        </div>

        {/* Bottom-right Fullscreen Button */}
        <div className="flex justify-end">
          <button
            onClick={onToggleFullScreenShareTile}
            className="pointer-events-auto bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white p-3 rounded-2xl transition-all duration-300 opacity-100 hover:scale-105 active:scale-95"
          >
            {isFullScreenShareTileEnabled ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};