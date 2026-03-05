"use client";

import { VideoIcon, VideoOffIcon, MicIcon, MicOff, Phone, ScreenShare, ScreenShareOff, LucideCaptions, Settings } from "lucide-react";

interface ControlsProps {
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isScreenSharingEnabled: boolean;
  isCaptionsEnabled: boolean;
  onStartCaptions: () => void;
  onStopCaptions: () => void;
  isUserHost: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleLiveCaptions: () => void;
  onOpenDeviceSettings: () => void;
  onEndCall: () => void;
  roomId: string;
}

export const Controls = ({
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  isScreenSharingEnabled,
  isCaptionsEnabled,
  isUserHost,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onStartCaptions,
  onStopCaptions,
  onOpenDeviceSettings,
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
            className={`cursor-pointer flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all ${
              isAudioMuted
                ? 'bg-red-500'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {isAudioMuted ? (
              <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <MicIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>

          {/* Video */}
          <button
            onClick={onToggleVideo}
            className={`cursor-pointer flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all ${
              isVideoOff
                ? 'bg-red-500'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {isVideoOff ? (
              <VideoOffIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <VideoIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>

          {/* Screen Share */}
          {(isScreenSharingEnabled === true || (isScreenSharingEnabled === false && isUserHost)) && <button
            onClick={onToggleScreenShare}
            className={`cursor-pointer hidden md:flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all ${
              isScreenSharing
                ? 'bg-red-500'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {isScreenSharing ? (
              <ScreenShareOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <ScreenShare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>}

          {/* Live Captions */}
          <button
            onClick={isCaptionsEnabled ? onStopCaptions : onStartCaptions}
            className={`cursor-pointer flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all ${
              isCaptionsEnabled
                ? 'bg-blue-400'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {isCaptionsEnabled ? (
              <LucideCaptions className="w-5 h-5 sm:w-6 sm:h-6 text-white font-bold" />
            ) : (
              <LucideCaptions className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>

          {/* Device Settings */}
          <button
            onClick={onOpenDeviceSettings}
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all"
            title="Audio and video settings"
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-red-500 rounded-xl sm:rounded-2xl hover:bg-red-700 transition"
          >
            <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white rotate-135" />
          </button>
        </div>
      </div>
    </div>
  );
};

