import { useState, useEffect } from 'react';
import { useMediaStream } from '@/app/hooks/useMediaStream';
import { useWebRTC } from '@/app/hooks/useWebRTC';
import { LocalVideo } from './LocalVideo';
import { RemoteVideo } from './RemoteVideo';
import { Controls } from './Controls';
import { Chat } from './Chat';

interface VideoCallProps {
  roomId: string;
  userId: string;
  onLeave: () => void;
}

export const VideoCall = ({ roomId, userId, onLeave }: VideoCallProps) => {
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    localStream,
    screenStream,
    isAudioMuted,
    isVideoOff,
    // isScreenSharing,
    toggleAudio,
    toggleVideo,
    // toggleScreenShare,
    stopMediaStream,
    getMediaStream,
  } = useMediaStream();

//   const activeStream = isScreenSharing && screenStream ? screenStream : localStream;
    const activeStream = localStream;

  const {
    users,
    messages,
    sendChatMessage,
    sendUserAction,
  } = useWebRTC(userId, roomId, activeStream);

  useEffect(() => {
    const initialize = async () => {
      try {
        await getMediaStream();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize media:', error);
      }
    };

    initialize();
  }, [getMediaStream]);

//   useEffect(() => {
//     if (isInitialized) {
//       sendUserAction(roomId, userId, 'toggle-audio', isAudioMuted);
//       sendUserAction(roomId, userId, 'toggle-video', isVideoOff);
//     }
//   }, [isAudioMuted, isVideoOff, isInitialized, roomId, userId, sendUserAction]);

  const handleToggleAudio = () => {
  toggleAudio();
  sendUserAction(roomId, userId, 'toggle-audio', !isAudioMuted);
};

const handleToggleVideo = () => {
  toggleVideo();
  sendUserAction(roomId, userId, 'toggle-video', !isVideoOff);
};
//   const handleToggleScreenShare = () => toggleScreenShare();

  const handleEndCall = () => {
    stopMediaStream();
    onLeave();
  };

  const handleSendMessage = (content: string) => {
    sendChatMessage(content);
  };

  const totalUsers = users.length + 1;

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
    if (showChat) setShowChat(false);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (showParticipants) setShowParticipants(false);
  };

  return (
    <div className="fixed inset-0 bg-[#0f1115] flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md border-b border-white/5 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
            <span className="text-white/90 font-semibold tracking-tight text-sm uppercase">Rec</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
          <div className="flex items-center gap-2">
            <h1 className="text-white/50 text-sm font-medium">Meeting ID:</h1>
            <span className="text-white/90 font-mono text-sm tracking-widest">{roomId}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={toggleParticipants}>
            <svg className="w-4 h-4 text-white/40 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-white/60 text-sm font-medium group-hover:text-white transition-colors">
              {totalUsers} Participants
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Video Grid Section */}
        <div className={`flex-1 transition-all duration-300 ease-in-out p-6 grid gap-4 content-center overflow-y-auto ${totalUsers === 1 ? 'max-w-4xl mx-auto w-full' :
            totalUsers === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-7xl mx-auto w-full' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-[1600px] mx-auto w-full'
          }`}>
          {/* Local Video */}
          <div className="transition-all duration-500 hover:scale-[1.02]">
            <LocalVideo
              stream={activeStream}
              isVideoOff={isVideoOff}
              isAudioMuted={isAudioMuted}
            //   isScreenSharing={isScreenSharing}
              userName={userId}
            />
          </div>

          {/* Remote Videos */}
          {users.map((user) => (
            <div key={user.id} className="transition-all duration-500 hover:scale-[1.02]">
              <RemoteVideo user={user} />
            </div>
          ))}
        </div>

        {/* Combined Sidebar for Chat and Participants */}
        <aside className={`
          fixed right-0 top-16 bottom-[88px] w-[380px] bg-[#1a1d23] border-l border-white/5 
          transition-transform duration-300 ease-in-out shadow-[-10px_0_30px_rgba(0,0,0,0.3)] z-10
          ${showChat || showParticipants ? 'translate-x-0' : 'translate-x-full'}
        `}>
          {showChat && (
            <Chat
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUserId={userId}
            />
          )}
          {showParticipants && (
            <div className="flex flex-col h-full bg-[#1a1d23]">
              <div className="px-6 py-5 border-b border-white/5 bg-black/10">
                <h3 className="text-sm font-bold text-white tracking-tight">Participants</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                  {totalUsers} People in this meeting
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {/* Local Participant */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20 text-blue-400 font-bold">
                      {userId.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{userId} (You)</p>
                      <p className="text-[10px] text-white/40">Host</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isAudioMuted && <span className="p-1 rounded-lg bg-red-500/20 text-red-400"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12.196 1.513c-.33-.192-.73-.192-1.06 0l-7.51 4.382c-.313.182-.51.522-.51.89v6.43c0 .368.197.708.51.89l7.51 4.382c.33.192.73.192 1.06 0l7.51-4.382c.313-.182.51-.522.51-.89v-6.43c0-.368-.197-.708-.51-.89l-7.51-4.382zM11 14a1 1 0 11-2 0 1 1 0 012 0zm1-3a1 1 0 11-2 0V7a1 1 0 112 0v4z" /></svg></span>}
                    {isVideoOff && <span className="p-1 rounded-lg bg-red-500/20 text-red-400"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg></span>}
                  </div>
                </div>
                {/* Remote Participants */}
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-white/60 font-medium">
                        {(user.name || user.id).charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-white/90">{user.name || user.id}</p>
                    </div>
                    <div className="flex gap-2">
                      {user.isAudioMuted && <span className="p-1 rounded-lg bg-red-500/20 text-red-400"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12.196 1.513c-.33-.192-.73-.192-1.06 0l-7.51 4.382c-.313.182-.51.522-.51.89v6.43c0 .368.197.708.51.89l7.51 4.382c.33.192.73.192 1.06 0l7.51-4.382c.313-.182.51-.522.51-.89v-6.43c0-.368-.197-.708-.51-.89l-7.51-4.382zM11 14a1 1 0 11-2 0 1 1 0 012 0zm1-3a1 1 0 11-2 0V7a1 1 0 112 0v4z" /></svg></span>}
                      {user.isVideoOff && <span className="p-1 rounded-lg bg-red-500/20 text-red-400"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>

      {/* Modern Bottom Controls */}
      <footer className="h-[88px] bg-[#0f1115] border-t border-white/5 flex items-center justify-between px-8 z-20">
        <div className="w-1/4">
          <div className="flex flex-col">
            <span className="text-white/90 font-semibold text-sm">Meeting Room</span>
            <span className="text-white/40 text-xs">Encryption Active</span>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <Controls
            isAudioMuted={isAudioMuted}
            isVideoOff={isVideoOff}
            // isScreenSharing={isScreenSharing}
            onToggleAudio={handleToggleAudio}
            onToggleVideo={handleToggleVideo}
            // onToggleScreenShare={handleToggleScreenShare}
            onEndCall={handleEndCall}
          />
        </div>

        <div className="w-1/4 flex justify-end gap-3">
          <button
            onClick={toggleChat}
            className={`
              p-3 rounded-2xl transition-all duration-200 flex items-center gap-2
              ${showChat ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}
            `}
            title="Chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {showChat && <span className="text-sm font-medium pr-1">Chat</span>}
          </button>

          <button
            onClick={toggleParticipants}
            className={`
              p-3 rounded-2xl transition-all duration-200 flex items-center gap-2
              ${showParticipants ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}
            `}
            title="Participants"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {showParticipants && <span className="text-sm font-medium pr-1">Participants</span>}
          </button>
        </div>
      </footer>
    </div>
  );
};
