"use client";

import { VideoIcon, VideoOffIcon, MicIcon, MicOff, Ellipsis, Phone, ScreenShare, ScreenShareOff } from "lucide-react";

interface ControlsProps {
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  roomId: string;
}

export const Controls = ({
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  roomId
}: ControlsProps) => {
  return (
    <div className="w-full flex items-center justify-between px-4 md:px-6">
      
      <div className="hidden md:flex items-center gap-2">
        <h1 className="text-white/50 text-sm font-medium">Meeting ID:</h1>
        <span className="text-white/90 font-mono text-sm tracking-widest">
          {roomId}
        </span>
      </div>

      <div className="flex flex-1 justify-center">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          
          {/* Audio */}
          <button
            onClick={onToggleAudio}
            className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all ${
              isAudioMuted
                ? 'bg-red-500'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {isAudioMuted ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <MicIcon className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Video */}
          <button
            onClick={onToggleVideo}
            className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all ${
              isVideoOff
                ? 'bg-red-500'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {isVideoOff ? (
              <VideoOffIcon className="w-5 h-5 text-white" />
            ) : (
              <VideoIcon className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Screen Share */}
          <button
            onClick={onToggleScreenShare}
            className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all ${
              isScreenSharing
                ? 'bg-red-500'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {isScreenSharing ? (
              <ScreenShareOff className="w-5 h-5 text-white" />
            ) : (
              <ScreenShare className="w-5 h-5 text-white" />
            )}
          </button>

          {/* More */}
          <div className="flex items-center justify-center w-4 sm:w-5 md:w-6 h-10 sm:h-12 md:h-14 bg-white/10 rounded-xl sm:rounded-2xl">
            <Ellipsis className="w-4 h-4 sm:w-5 sm:h-5 text-white rotate-90" />
          </div>

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-red-500 rounded-xl sm:rounded-2xl hover:bg-red-700 transition"
          >
            <Phone className="w-5 h-5 text-white rotate-135" />
          </button>
        </div>
      </div>
    </div>
  );
};

