import { VideoIcon, VideoOffIcon, MicIcon, MicOff, Ellipsis, Phone } from "lucide-react";

interface ControlsProps {
  isAudioMuted: boolean;
  isVideoOff: boolean;
//   isScreenSharing: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
//   onToggleScreenShare: () => void;
  onEndCall: () => void;
}

export const Controls = ({
  isAudioMuted,
  isVideoOff,
//   isScreenSharing,
  onToggleAudio,
  onToggleVideo,
//   onToggleScreenShare,
  onEndCall
}: ControlsProps) => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
      {/* Audio Control */}
      <button
        onClick={onToggleAudio}
        className={`group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all duration-300 ${
          isAudioMuted
            ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)] sm:shadow-[0_0_20px_rgba(239,68,68,0.3)]'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        title={isAudioMuted ? 'Unmute' : 'Mute'}
      >
        {isAudioMuted ? (
          <MicOff className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
        ) : (
          <MicIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
        )}
      </button>

      {/* Video Control */}
      <button
        onClick={onToggleVideo}
        className={`group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl transition-all duration-300 ${
          isVideoOff
            ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)] sm:shadow-[0_0_20px_rgba(239,68,68,0.3)]'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
      >
        {isVideoOff ? (
          <VideoOffIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-transparent text-white" />
        ) : (
          <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-transparent text-white" />
        )}
      </button>

      {/* Screen Share Control */}
      {/* <button
        onClick={onToggleScreenShare}
        className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${isScreenSharing
            ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
            : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button> */}

      {/* Ellipsis Menu */}
      <div className="group relative flex items-center justify-center w-4 h-10 sm:w-5 sm:h-12 md:w-6 md:h-14 bg-white/10 rounded-xl sm:rounded-2xl">
        <Ellipsis className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white transform rotate-90" />
      </div>

      {/* End Call Control */}
      <button
        onClick={onEndCall}
        className="group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-red-500 text-white rounded-xl sm:rounded-2xl hover:bg-red-700 transition-all duration-300 shadow-[0_0_10px_rgba(220,38,38,0.3)] sm:shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:w-14 sm:hover:w-16 md:hover:w-28 active:scale-95 overflow-hidden"
        title="Leave Meeting"
      >
        <Phone className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transform rotate-135" />
      </button>
    </div>
  );
};
