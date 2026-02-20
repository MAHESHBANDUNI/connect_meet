"use client";

import { useState, useEffect } from 'react';
import { useMediaStream } from '@/app/hooks/useMediaStream';
import { useWebRTC } from '@/app/hooks/useWebRTC';
import { VideoTile } from './VideoTile';
import { Controls } from './Controls';
import { Chat } from './Chat';
import { VideoIcon, VideoOffIcon, MicIcon, MicOff, UserPenIcon, UserPlus, UserPlusIcon } from "lucide-react";
import {ScreenPresentTile} from './ScreenPresentTile';

interface VideoCallProps {
  roomId: string;
  userId: string;
  onLeave: () => void;
  onAddParticipant: () => void;
}

export const VideoCall = ({ roomId, userId, onLeave, onAddParticipant }: VideoCallProps) => {
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    localStream,
    screenStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    stopMediaStream,
    getMediaStream,
  } = useMediaStream();

  const activeStream = localStream;

  const {
    users,
    messages,
    sendChatMessage,
    sendUserAction,
    setUsersLocalMedia
  } = useWebRTC(userId, roomId, activeStream, screenStream);

  // console.log('Current Users in Call:', users);
  const screenSharer = users.find(
    user => user.screenStream
  );

  const gridUsers = users.filter(
    user => user.id !== screenSharer?.id
  );

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

  const handleToggleAudio = () => {
    const newValue = !isAudioMuted;
    toggleAudio();
    setUsersLocalMedia('toggle-audio', newValue);
    sendUserAction(roomId, userId, 'toggle-audio', newValue);
  };

  const handleToggleVideo = () => {
    const newValue = !isVideoOff;
    toggleVideo();
    setUsersLocalMedia('toggle-video', newValue);
    sendUserAction(roomId, userId, 'toggle-video', newValue);
  };

  const handleToggleScreenShare = () => {
    const newValue = !isScreenSharing;
    toggleScreenShare();
    setUsersLocalMedia('toggle-screen', newValue);
    sendUserAction(roomId, userId, 'toggle-screen', newValue);
  };

  const handleEndCall = () => {
    stopMediaStream();
    onLeave();
  };

  const handleSendMessage = (content: string) => {
    sendChatMessage(content);
  };

  const totalUsers = users.length;

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
      <header className="h-16 flex items-center justify-end px-6 bg-black/20 backdrop-blur-md border-b border-white/5 z-20">

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={toggleParticipants}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium text-white pt-0.5">
              {totalUsers === 1 ? '1 Participant' : `${totalUsers} Participants`}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative bg-[#26282c]">

        {screenSharer ? (
          <div className="flex flex-col lg:flex-row w-full h-full">
          
            {/* Share Screen Area */}
            <div className="flex-1 bg-[#26282c] flex items-center justify-center p-4 w-full lg:min-w-3/4 h-2/3 sm:h-full">
               <div className='w-full h-full flex items-center justify-center'>
                  <ScreenPresentTile user={screenSharer} />
                </div>
            </div>

            <div
              className={`
                grid
                grid-cols-2
                md:grid-cols-3
                lg:grid-cols-1
                gap-2
                w-full lg:w-1/4
                h-full
                overflow-x-auto
                lg:overflow-y-auto
                p-4
              `}
            >
              {users.map(user => (
                <>
                <VideoTile key={user.id} user={user} screenSharer={screenSharer}/>
                </>
              ))}
            </div>
            
          </div>

        ) : (
          <div className={`
            flex-1 p-6 grid gap-4 content-center overflow-y-auto
            ${totalUsers === 1
              ? 'max-w-4xl mx-auto grid-cols-1'
              : totalUsers === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }
          `}>
            {users.map(user => (
              <>
              <VideoTile key={user.id} user={user} />
              </>
            ))}
          </div>
        )}

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
              <div className='flex flex-row justify-around items-center'>
              <div className="px-6 py-5 border-b border-white/5 bg-black/10">
                <h3 className="text-sm font-bold text-white tracking-tight">Participants</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                  {totalUsers} People in this meeting
                </p>
              </div>
              <button onClick={onAddParticipant} className='inline-flex justify-center items-center cursor-pointer hover:bg-white/10 rounded-2xl p-2 m-2'>
                <UserPlusIcon className="w-5 h-5 text-white m-1"/>
                <p className='text-white text-sm'>Add people</p>
              </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {/* Local Participant */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20 text-blue-400 font-bold">
                      {userId.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{userId.split(":")[0]} (You)</p>
                      {/* <p className="text-[10px] text-white/40">Host</p> */}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isAudioMuted ? <span className="p-1 bg-transparent backdrop-blur-md rounded-xl text-red-400"><MicOff className="w-5 h-5" /></span>:<span className="p-1 bg-transparent backdrop-blur-md rounded-xl text-white"><MicIcon className="w-5 h-5" /></span>}
                    {isVideoOff ? <span className="p-1 bg-transparent backdrop-blur-md rounded-xl text-red-400"><VideoOffIcon className="w-5 h-5" /></span>:<span className="p-1 bg-transparent backdrop-blur-md rounded-xl text-white"><VideoIcon className="w-5 h-5" /></span>}
                  </div>
                </div>
                {/* Remote Participants */}
                {users.filter((user) => !user.isLocal).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-white/60 font-medium">
                        {(user.id.split(":")[0]).charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-white/90">{user.id.split(":")[0]}</p>
                    </div>
                    <div className="flex gap-2">
                      {user.isAudioMuted && <span className="p-1 bg-transparent backdrop-blur-md rounded-xl "><MicOff className="w-4 h-4 " /></span>}
                      {user.isVideoOff && <span className="p-1 bg-transparent backdrop-blur-md rounded-xl "><VideoOffIcon className="w-4 h-4" /></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>

      <footer className="h-[88px] bg-[#0f1115] border-t border-white/5 flex items-center justify-between px-8 z-20">
        <div className="flex-1 flex justify-between">
          <Controls
            isAudioMuted={isAudioMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            onToggleAudio={handleToggleAudio}
            onToggleVideo={handleToggleVideo}
            onToggleScreenShare={handleToggleScreenShare}
            onEndCall={handleEndCall}
            roomId={roomId}
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
        </div>
      </footer>
    </div>
  );
};
