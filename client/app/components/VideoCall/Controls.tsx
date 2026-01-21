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
  onEndCall
//   onToggleScreenShare,
}: ControlsProps) => {
  return (
    <div className="flex items-center gap-4">
      {/* Audio Control */}
      <button
        onClick={onToggleAudio}
        className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${isAudioMuted
            ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
            : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        title={isAudioMuted ? 'Unmute' : 'Mute'}
      >
        {isAudioMuted ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      {/* Video Control */}
      <button
        onClick={onToggleVideo}
        className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${isVideoOff
            ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
            : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
      >
        {isVideoOff ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
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

      <div className="h-8 w-[1px] bg-white/10 mx-2"></div>

      {/* End Call Control */}
      <button
        onClick={onEndCall}
        className="group relative flex items-center justify-center w-20 h-14 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:w-28 active:scale-95 overflow-hidden"
        title="Leave Meeting"
      >
        <div className="flex items-center gap-2 px-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">Leave</span>
        </div>
      </button>
    </div>
  );
};
