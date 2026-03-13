"use client";

import { VideoIcon, VideoOffIcon, MicIcon, MicOff, Phone, ScreenShare, ScreenShareOff, LucideCaptions, Settings, Pencil, Hand, MessageCircleMoreIcon, Ellipsis } from "lucide-react";

interface ControlsProps {
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isScreenSharingEnabled: boolean;
  isCaptionsEnabled: boolean;
  onStartCaptions: () => void;
  onStopCaptions: () => void;
  isUserHost: boolean;
  isUserCoHost?: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleLiveCaptions: () => void;
  onOpenDeviceSettings: () => void;
  onEndCall: () => void;
  roomId: string;
  showWhiteboard?: boolean;
  onToggleWhiteboard?: () => void;
  isHandRaised: boolean;
  onToggleHand: () => void;
  onToggleChat: () => void;
  showChat: boolean;
}

export const Controls = ({
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  isScreenSharingEnabled,
  isCaptionsEnabled,
  isUserHost,
  isUserCoHost,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onStartCaptions,
  onStopCaptions,
  onOpenDeviceSettings,
  onEndCall,
  roomId,
  showWhiteboard,
  onToggleWhiteboard,
  isHandRaised,
  onToggleHand,
  onToggleChat,
  showChat
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
            className={`cursor-pointer flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all ${
              isAudioMuted
                ? 'bg-red-500'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {isAudioMuted ? (
              <MicOff className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <MicIcon className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>

          {/* Video */}
          <button
            onClick={onToggleVideo}
            className={`cursor-pointer flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all ${
              isVideoOff
                ? 'bg-red-500'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {isVideoOff ? (
              <VideoOffIcon className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <VideoIcon className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>

          {/* Screen Share */}
          {(isScreenSharingEnabled === true || (isScreenSharingEnabled === false && (isUserHost || isUserCoHost))) && <button
            onClick={onToggleScreenShare}
            className={`cursor-pointer hidden md:flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all ${
              isScreenSharing
                ? 'bg-red-500'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {isScreenSharing ? (
              <ScreenShareOff className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <ScreenShare className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>}

          {/* Live Captions */}
          <button
            onClick={isCaptionsEnabled ? onStopCaptions : onStartCaptions}
            className={`cursor-pointer hidden sm:flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all ${
              isCaptionsEnabled
                ? 'bg-blue-400'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >

            <LucideCaptions className={`w-4.5 h-4.5 sm:w-6 sm:h-6 text-white ${isCaptionsEnabled ? 'font-bold' : ''}`} />
          </button>
          
          {/* Raise Hand */}
          <button
            onClick={onToggleHand}
            className={`cursor-pointer hidden sm:flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all ${
              isHandRaised
                ? 'bg-blue-400'
                : 'bg-white/10 hover:bg-white/20'
            }`}
            title={isHandRaised ? "Lower Hand" : "Raise Hand"}
          >
            <Hand className={`w-4.5 h-4.5 sm:w-6 sm:h-6 text-white ${isHandRaised ? 'font-bold' : ''}`} />
          </button>

          {/* Whiteboard */}
          <button
            onClick={onToggleWhiteboard}
            className={`cursor-pointer hidden sm:flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all ${
              showWhiteboard
                ? 'bg-blue-400'
                : 'bg-white/10 hover:bg-white/20'
            }`}
            title="Toggle Whiteboard"
          >
            <Pencil className={`w-4.5 h-4.5 sm:w-6 sm:h-6 text-white ${showWhiteboard ? 'font-bold' : ''}`} />
          </button>

          <button className="cursor-pointer flex sm:hidden items-center justify-center w-4 h-8 rounded-xl sm:rounded-2xl transition-all bg-white/10 hover:bg-white/20">
            <Ellipsis className={`w-5 h-5 rotate-90 text-white`}/>
          </button>

          {/* Device Settings */}
          <button
            onClick={onOpenDeviceSettings}
            className="hidden sm:flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all"
            title="Audio and video settings"
          >
            <Settings className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-white" />
          </button>

          <div className="sm:hidden flex justify-end gap-3">
            <button
              onClick={onToggleChat}
              className={`
                p-2 sm:p-3 rounded-2xl transition-all duration-200 flex items-center gap-2
                ${showChat ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}
              `}
              title="Chat"
            >
              <MessageCircleMoreIcon className="w-5 h-5 text-white"/>
            </button>
          </div>

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-red-500 rounded-xl sm:rounded-2xl hover:bg-red-700 transition"
          >
            <Phone className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-white rotate-135" />
          </button>
        </div>
      </div>
    </div>
  );
};

