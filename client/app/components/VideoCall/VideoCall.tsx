"use client";

import { useState, useEffect, useRef } from 'react';
import { useMediaStream } from '@/app/hooks/useMediaStream';
import { useWebRTC } from '@/app/hooks/useWebRTC';
import { VideoTile } from './VideoTile';
import { Controls } from './Controls';
import { Chat } from './Chat';
import { VideoIcon, VideoOffIcon, MicIcon, MicOff, UserPlusIcon, Phone, X, Camera, Headphones, ChevronDown, Hand } from "lucide-react";
import { ScreenPresentTile } from './ScreenPresentTile';
import { Whiteboard } from './Whiteboard';
import { errorToast } from '../ui/toast';
import { MeetingEventPopups } from './MeetingEventPopups';

interface VideoCallProps {
  roomId: string;
  userId: string;
  onEnd: () => void | Promise<void>;
  meetingDetails: {
    title: string;
    meetingId: string;
    meetingCode: string,
    participants: {
      userId: string;
      firstName: string;
      lastName: string;
      participantRole: "HOST" | "PARTICIPANT";
      hasJoined: boolean;
    }[];
    screenSharePermission: boolean;
    directJoinPermission: boolean;
    mutePermission: boolean;
    dropPermission: boolean;
  };
  user: {
    id: string;
    name: string;
    role: string;
  };
  onLeave: () => void;
  onMeetingEndedByHost?: () => void;
  onAddParticipant: () => void;
  onAdmitted?: () => void;
  onRejected?: () => void;
  onAdmitParticipant?: (targetUserId: string) => void;
  onRejectParticipant?: (targetUserId: string) => void;
  initialMediaConfig?: {
    cameraEnabled: boolean;
    micEnabled: boolean;
    cameraId?: string;
    micId?: string;
    speakerId?: string;
  };
}

export const VideoCall = ({
  roomId,
  userId,
  onLeave,
  onEnd,
  onMeetingEndedByHost,
  onAddParticipant,
  meetingDetails,
  user,
  onAdmitted,
  onRejected,
  onAdmitParticipant,
  onRejectParticipant,
  initialMediaConfig
}: VideoCallProps) => {
  const hasInitializedMediaRef = useRef(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [isCaptionEnabled, setIsCaptionEnabled] = useState(false);
  const [isFullScreenShareTileEnabled, setIsFullScreenShareTileEnabled] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<string>('all');

  const isCurrentUserHost = meetingDetails?.participants?.some(
    (participant: any) =>
      participant.userId === user?.id &&
      participant.participantRole === "HOST"
  );

  const {
    localStream,
    screenStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    availableDevices,
    deviceCapabilities,
    selectedDevices,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    stopScreenShare,
    stopMediaStream,
    getMediaStream,
    switchCamera,
    switchMicrophone,
    switchSpeaker,
  } = useMediaStream({
    initialCameraEnabled: initialMediaConfig?.cameraEnabled,
    initialMicEnabled: initialMediaConfig?.micEnabled,
    initialCameraId: initialMediaConfig?.cameraId,
    initialMicId: initialMediaConfig?.micId,
    initialSpeakerId: initialMediaConfig?.speakerId,
  });

  const activeStream = localStream;

  const {
    users,
    messages,
    sendChatMessage,
    sendUserAction,
    endMeetingForAll,
    setUsersLocalMedia,
    admitParticipant,
    rejectParticipant,
    waitingUsers,
    partialText,
    finalText,
    startCaptions,
    stopCaptions,
    eventPopups,
    dismissEventPopup,
    whiteboardData,
    sendWhiteboardData
  } = useWebRTC(userId, roomId, activeStream, screenStream, {
    onForceStopScreen: stopScreenShare,
    isHost: isCurrentUserHost,
    initialStatus: meetingDetails
      ? (meetingDetails.directJoinPermission || isCurrentUserHost)
          ? 'JOINED'
          : 'WAITING'
      : undefined,
    onAdmitted,
    onRejected,
    onHostMuteAudio: () => {
      if (!isAudioMuted) {
        handleToggleAudio();
      }
    },
    onHostMuteVideo: () => {
      if (!isVideoOff) {
        handleToggleVideo();
      }
    },
    onHostDrop: () => {
      handleEndCall();
    },
    onMeetingEnded: (endedBy) => {
      if (endedBy === userId) return;
      stopMediaStream();
      onMeetingEndedByHost?.();
    },
    onAdmitParticipant,
    onRejectParticipant
  });

  console.log("Partial captions: ", partialText);
  console.log("Final captions: ", finalText);
  console.log('Available devices: ', availableDevices);
  console.log('Selected devices: ',selectedDevices);

  const getParticipantName = (participantId: string) => {
    const participant = meetingDetails?.participants?.find(
      (p: any) => p.userId === participantId || `${p.firstName}:${p.userId}` === participantId
    );
    if (participant) {
      return `${participant.firstName} ${participant.lastName}`;
    }
    return participantId.split(':')[0];
  };

  console.log('Current Users in Call:', users);

  console.log('User Media Status:', { isAudioMuted, isVideoOff, isScreenSharing, localStream, screenStream });

  const screenSharer = users.find(
    user => user.screenStream
  );

  useEffect(() => {
    if (hasInitializedMediaRef.current) return;
    hasInitializedMediaRef.current = true;

    const initialize = async () => {
      try {
        await getMediaStream({
          cameraId: initialMediaConfig?.cameraId,
          micId: initialMediaConfig?.micId,
          speakerId: initialMediaConfig?.speakerId,
        });
      } catch (error) {
        console.error('Failed to initialize media:', error);
      }
    };

    initialize();
  }, []);

  const handleDeviceChange = async (
    kind: 'cameraId' | 'micId' | 'speakerId',
    value: string
  ) => {
    try {
      if (kind === 'cameraId') {
        await switchCamera(value);
      } else if (kind === 'micId') {
        await switchMicrophone(value);
      } else {
        switchSpeaker(value);
      }
    } catch (error) {
      console.error(`Failed to switch ${kind}:`, error);
      errorToast('Failed to switch media device.');
    }
  };

  const handleMobileCameraSwitch = async () => {
    try {
      await switchCamera('');
    } catch (error) {
      console.error('Failed to toggle mobile camera:', error);
      errorToast('Unable to switch mobile camera.');
    }
  };

  const toggleFullScreenShareTile = async () => {
    setIsFullScreenShareTileEnabled(!isFullScreenShareTileEnabled);
  }

  const useMobileCameraFallback =
    deviceCapabilities.isMobile && !deviceCapabilities.supportsCameraSelection;

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

  const handleToggleHand = () => {
    const localUser = users.find(u => u.isLocal);
    const newValue = !localUser?.isHandRaised;
    setUsersLocalMedia('toggle-hand', newValue);
    sendUserAction(roomId, userId, 'toggle-hand', newValue);
  };

  const handleEndCall = () => {
    stopMediaStream();
    const isCurrentUserHost = meetingDetails?.participants?.some(
      (participant: any) =>
        participant.userId === user?.id &&
        participant.participantRole === "HOST"
    );
    if (isCurrentUserHost) {
      endMeetingForAll();
      Promise.resolve(onEnd()).catch((error) => {
        console.error('Failed to end meeting:', error);
      });
    } else {
      onLeave();
    }
  };

  const handleHostMuteAudio = (targetUserId: string) => {
    sendUserAction(roomId, userId, 'host-mute-audio', true, targetUserId);
  };

  const handleHostMuteVideo = (targetUserId: string) => {
    sendUserAction(roomId, userId, 'host-mute-video', true, targetUserId);
  };

  const handleHostDropUser = (targetUserId: string) => {
    sendUserAction(roomId, userId, 'host-drop-user', true, targetUserId);
  };

  const handleSendMessage = (content: string, targetUserId?: string) => {
    sendChatMessage(content, targetUserId);
  };

  const totalUsers = users.length;

  const participantCount = users.length;

const layoutMode = screenSharer
  ? isFullScreenShareTileEnabled
    ? "presentation-full"
    : "presentation"
  : participantCount <= 2
  ? "grid-small"
  : participantCount <= 6
  ? "grid-medium"
  : "grid-large";

const gridClassMap: Record<string, string> = {
  "grid-small": "grid-cols-1 md:grid-cols-2",
  "grid-medium": "grid-cols-2 md:grid-cols-3",
  "grid-large": "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
    if (showChat) setShowChat(false);
  };

  const toggleChat = () => {
    const nextShowChat = !showChat;
    if (nextShowChat) {
      setChatRecipient('all');
    }
    setShowChat(nextShowChat);
    if (showParticipants) setShowParticipants(false);
  };

  const openDirectChat = (targetUserId: string) => {
    if (targetUserId === userId) return;
    setChatRecipient(targetUserId);
    setShowParticipants(false);
    setShowChat(true);
  };

  const onStartCaptions = () =>{
    setIsCaptionEnabled(true);
    startCaptions();
  }

  const onStopCaptions = () =>{
    setIsCaptionEnabled(false);
    stopCaptions();
  }

  console.log("Waiting users: ",waitingUsers);

  useEffect(() => {
    if (eventPopups.length === 0) return;

    const timers = eventPopups.map((event) =>
      window.setTimeout(() => dismissEventPopup(event.id), 5000)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [eventPopups, dismissEventPopup]);

  console.log("waitingUsers", waitingUsers);

  return (
    <div className="fixed inset-0 bg-[#363738] flex flex-col overflow-hidden">
      <MeetingEventPopups events={eventPopups} onDismiss={dismissEventPopup} />
      
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
      <main className="flex-1 flex overflow-hidden relative bg-[#3e3f41]">
        {showWhiteboard ? (
          <div className="flex-1 p-4 bg-[#26282c]">
            <Whiteboard 
              onDraw={sendWhiteboardData} 
              externalData={whiteboardData} 
              className="h-full"
            />
          </div>
        ) : screenSharer ? (
          <div className="flex flex-col lg:flex-row w-full h-full">
            {/* Share Screen Area */}
            <div className="flex-1 bg-[#26282c] flex items-center justify-center p-4 w-full lg:min-w-3/4 h-2/3 sm:h-full">
              <div className='w-full h-full flex items-center justify-center'>
                <ScreenPresentTile user={screenSharer} speakerId={selectedDevices.speakerId} isFullScreenShareTileEnabled={isFullScreenShareTileEnabled} onToggleFullScreenShareTile={toggleFullScreenShareTile} />
              </div>
            </div>

            {!isFullScreenShareTileEnabled && <div
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
                  <VideoTile key={user.id} user={user} screenSharer={screenSharer} speakerId={selectedDevices.speakerId} />
                </>
              ))}
            </div>}

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
                <VideoTile key={user.id} user={user} speakerId={selectedDevices.speakerId} />
              </>
            ))}
          </div>
        )}

        {/* Combined Sidebar */}
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
              participants={users.map((participant) => ({
                id: participant.id,
                name: getParticipantName(participant.id),
              }))}
              selectedRecipient={chatRecipient}
              onRecipientChange={setChatRecipient}
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
                  <UserPlusIcon className="w-5 h-5 text-white m-1" />
                  <p className='text-white text-sm'>Add people</p>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {users.filter(u => u.isHandRaised).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold px-2">Raised Hands</h4>
                    {users
                      .filter(u => u.isHandRaised)
                      .sort((a, b) => (a.handRaisedTimestamp || 0) - (b.handRaisedTimestamp || 0))
                      .map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                              {getParticipantName(u.id).charAt(0).toUpperCase()}
                            </div>
                            <p className="text-sm font-medium text-white">
                              {getParticipantName(u.id)}
                              {u.isLocal && " (You)"}
                            </p>
                          </div>
                          <Hand className="w-5 h-5 text-blue-400" />
                        </div>
                      ))}
                  </div>
                )}
                
                {isCurrentUserHost && waitingUsers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-yellow-500 uppercase tracking-widest font-bold px-2">Awaiting Admission</h4>
                    {waitingUsers
                      .filter(wUser => {
                        const userIdOnly = wUser.id.split(":")[1];
                      
                        const participantDetail = meetingDetails?.participants?.find(
                          (p: any) => p.userId === userIdOnly
                        );
                      
                        return participantDetail?.participantRole === "PARTICIPANT";
                      })
                      .map((wUser) => (
                        <div key={wUser.id} className="flex items-center justify-between p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold text-xs">
                              {getParticipantName(wUser.id).charAt(0).toUpperCase()}
                            </div>
                            <p className="text-sm font-medium text-white">{getParticipantName(wUser.id)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => admitParticipant(wUser.id)}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded-lg transition-colors"
                            >
                              Admit
                            </button>
                            <button
                              onClick={() => rejectParticipant(wUser.id)}
                              className="px-2 py-1 bg-red-600/20 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg transition-colors border border-red-500/30"
                            >
                              Deny
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold px-2">In Call</h4>
                  {(() => {
                    const presentingUser = users.find(user => user.isScreenSharing)
                    return (
                      <>
                        {presentingUser && (
                          <div className="mb-4 p-4 rounded-2xl bg-emerald-600/10 border border-emerald-500/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30 text-emerald-400 font-bold">
                                  {presentingUser.id.split(":")[0].charAt(0).toUpperCase()}
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    {presentingUser.id.split(":")[0]}{" "}
                                    {presentingUser.isLocal && "(You)"}
                                  </p>
                                  <p className="text-xs text-emerald-400 font-medium">
                                    Presenting now
                                  </p>
                                </div>
                              </div>

                            </div>
                          </div>
                        )}

                        {users.map((user) => {
                          const isLocal = user.isLocal
                          const displayName = user.id.split(":")[0]
                          const firstLetter = displayName.charAt(0).toUpperCase()

                          return (
                            <>
                              <div
                                key={user.id}
                                className={`flex items-center justify-between p-3 rounded-2xl transition-colors ${isLocal
                                  ? "bg-white/5 border border-white/5"
                                  : "hover:bg-white/5"
                                  }`}
                              >
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => openDirectChat(user.id)}
                                    disabled={isLocal}
                                    className={`flex items-center gap-3 text-left ${isLocal ? "cursor-default" : "cursor-pointer hover:opacity-90"}`}
                                    title={isLocal ? undefined : `Message ${displayName}`}
                                  >
                                    <div
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium ${isLocal
                                        ? "bg-blue-600/20 border border-blue-500/20 text-blue-400 font-bold"
                                        : "bg-white/5 border border-white/5 text-white/60"
                                        }`}
                                    >
                                      {firstLetter}
                                    </div>

                                    <div>
                                      <p
                                        className={`text-sm ${isLocal
                                          ? "font-semibold text-white"
                                          : "font-medium text-white/90"
                                          }`}
                                      >
                                        {displayName} {isLocal && "(You)"}
                                      </p>
                                    </div>
                                  </button>
                                </div>

                                <div className="flex gap-2">
                                  {/* Audio */}
                                  {(() => {
                                    const muted = isLocal ? isAudioMuted : user.isAudioMuted;
                                  
                                    return (
                                      <>
                                        {(!isCurrentUserHost || (isLocal && isCurrentUserHost)) && 
                                          <span
                                            className={`p-1 rounded-xl ${
                                              muted ? "text-red-400" : "text-white"
                                            }`}
                                          >
                                            {muted ? (
                                              <MicOff className="w-5 h-5" />
                                            ) : (
                                              <MicIcon className="w-5 h-5" />
                                            )}
                                          </span>
                                        }
                                        
                                        {/* Host Control Button */}
                                        {!isLocal && isCurrentUserHost && meetingDetails?.mutePermission && (
                                          <>
                                          { user?.isAudioMuted === true ? (
                                            <button
                                              onClick={() => handleHostMuteAudio(user.id)}
                                              className="p-1 rounded-xl text-red-400"
                                            >
                                            <MicOff className="w-5 h-5" />
                                            </button>
                                            ):(
                                            <button
                                              onClick={() => handleHostMuteAudio(user.id)}
                                              className="p-1 rounded-xl text-white"
                                              title="Mute Participant"
                                            >
                                            <MicIcon className="w-5 h-5" />
                                            </button>
                                          )
                                          }
                                          </>
                                        )}
                                      </>
                                    );
                                  })()}
                                  <div className="flex gap-2">
                                    {/* Video */}
                                    {(() => {
                                      const videoOff = isLocal ? isVideoOff : user.isVideoOff;
                                    
                                      return (
                                        <>
                                          {(!isCurrentUserHost || (isLocal && isCurrentUserHost)) && 
                                          <span
                                            className={`p-1 rounded-xl ${
                                              videoOff ? "text-red-400" : "text-white"
                                            }`}
                                          >
                                            {videoOff ? (
                                              <VideoOffIcon className="w-5 h-5" />
                                            ) : (
                                              <VideoIcon className="w-5 h-5" />
                                            )}
                                          </span>
                                          }
                                          
                                          {/* Host Control Button */}
                                          {!isLocal && isCurrentUserHost && meetingDetails?.mutePermission && (
                                          <>
                                          { user?.isVideoOff === true ? (
                                            <button
                                              onClick={() => handleHostMuteVideo(user.id)}
                                              className="p-1 rounded-xl text-red-400"
                                            >
                                              <VideoOffIcon className="w-5 h-5" />
                                            </button>
                                            ):(
                                            <button
                                              onClick={() => handleHostMuteVideo(user.id)}
                                              className="p-1 rounded-xl text-white"
                                              title="Stop Participant Video"
                                            >
                                              <VideoIcon className="w-5 h-5" />
                                            </button>
                                            )
                                          }
                                          </>
                                          )}
                                        </>
                                      );
                                    })()}

                                    {/* Drop */}
                                    {!isLocal && isCurrentUserHost && meetingDetails?.dropPermission && (
                                      <button
                                        onClick={() => handleHostDropUser(user.id)}
                                        className="p-1 bg-transparent backdrop-blur-md rounded-xl text-white"
                                        title="Remove Participant"
                                      >
                                        <Phone className="w-5 h-5 text-white rotate-135" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </>
                          )
                        })}
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          )}
        </aside>

        {isCaptionEnabled && (finalText || partialText) && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 max-w-2xl w-[60%] bg-black/70 backdrop-blur-md text-white text-center rounded-2xl shadow-xl">
            <p className="text-sm md:text-base font-medium leading-relaxed">
              <span>{finalText} </span>
              <span className="opacity-60">{partialText}</span>
            </p>
          </div>
        )}
      </main>

      <footer className="h-[88px] bg-[#0f1115] border-t border-white/5 flex items-center justify-between px-8 z-20">
        <div className="flex-1 flex justify-between">
          <Controls
            isAudioMuted={isAudioMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            isScreenSharingEnabled={meetingDetails?.screenSharePermission}
            isCaptionsEnabled={isCaptionEnabled}
            onStartCaptions={onStartCaptions}
            onStopCaptions={onStopCaptions}
            isUserHost={meetingDetails?.participants?.some(
              (participant: any) =>
                participant.userId === user?.id &&
                participant.participantRole === "HOST"
            )}
            onToggleAudio={handleToggleAudio}
            onToggleVideo={handleToggleVideo}
            onToggleScreenShare={handleToggleScreenShare}
            onToggleLiveCaptions={()=> {}}
            onOpenDeviceSettings={() => setShowDeviceSettings(true)}
            onEndCall={handleEndCall}
            roomId={roomId}
            showWhiteboard={showWhiteboard}
            onToggleWhiteboard={() => setShowWhiteboard(!showWhiteboard)}
            isHandRaised={users.find(u => u.isLocal)?.isHandRaised ?? false}
            onToggleHand={handleToggleHand}
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

      {showDeviceSettings && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-xl sm:rounded-xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-3 sm:p-4 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Device Settings
              </h3>
              <button
                onClick={() => setShowDeviceSettings(false)}
                className="cursor-pointer p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close settings"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  Camera
                </label>
                {useMobileCameraFallback ? (
                  <button
                    onClick={handleMobileCameraSwitch}
                    className="w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Switch front/back camera
                  </button>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedDevices.cameraId}
                      onChange={e => handleDeviceChange('cameraId', e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      {availableDevices.cameras.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
                        </option>
                      ))}
                      {availableDevices.cameras.length === 0 && (
                        <option value="">No cameras found</option>
                      )}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                )}
                {useMobileCameraFallback && (
                  <p className="text-xs text-slate-500 mt-1">
                    On mobile, camera routing is handled as front/back switching.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                  <MicIcon className="w-3 h-3" />
                  Microphone
                </label>
                <div className="relative">
                  <select
                    value={selectedDevices.micId}
                    onChange={e => handleDeviceChange('micId', e.target.value)}
                    disabled={!deviceCapabilities.supportsMicSelection}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {availableDevices.mics.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Mic ${device.deviceId.slice(0, 8)}...`}
                      </option>
                    ))}
                    {availableDevices.mics.length === 0 && (
                      <option value="">No microphones found</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {!deviceCapabilities.supportsMicSelection && (
                  <p className="text-xs text-slate-500 mt-1">
                    Microphone source is controlled by your mobile device/OS route.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                  <Headphones className="w-3 h-3" />
                  Speaker
                </label>
                <div className="relative">
                  <select
                    value={selectedDevices.speakerId}
                    onChange={e => handleDeviceChange('speakerId', e.target.value)}
                    disabled={!deviceCapabilities.supportsSpeakerSelection}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {availableDevices.speakers.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Speaker ${device.deviceId.slice(0, 8)}...`}
                      </option>
                    ))}
                    {availableDevices.speakers.length === 0 && (
                      <option value="default">Default System Output</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {!deviceCapabilities.supportsSpeakerSelection && (
                  <p className="text-xs text-slate-500 mt-1">
                    Speaker output selection is not supported on this browser/device.
                  </p>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-3 sm:p-4">
              <button
                onClick={() => setShowDeviceSettings(false)}
                className="cursor-pointer w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
