"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import WaitingRoom from "@/app/components/meetings/WaitingRoom";
import { VideoCall } from "@/app/components/VideoCall/VideoCall";
import { PlusIcon, X, Send, Mail } from "lucide-react";
import { MeetingEnd } from "@/app/components/MeetingEnd";

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingCode = params.id as string;
  const { data: session } = useSession();

  const [roomId] = useState<string>(meetingCode);
  const [userId, setUserId] = useState<string>("");
  const [isInCall, setIsInCall] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [emailList, setEmailList] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAddEmail = () => {
    const trimmedEmail = newEmail.trim();
    if (!trimmedEmail) return;

    if (emailList.includes(trimmedEmail)) {
      alert("This email has already been added.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    setEmailList([...emailList, trimmedEmail]);
    setNewEmail('');
  };

  const handleRemoveEmail = (index: number) => {
    setEmailList(emailList.filter((_, i) => i !== index));
  };

  const handleSendInvites = async () => {
    if (emailList.length === 0) return;

    setIsSending(true);
    try {
      await fetch('/api/meetings/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingCode,
          emails: emailList,
          inviterName: session?.user?.name,
          inviterEmail: session?.user?.email,
        }),
      });
      
      alert(`Invitations sent to ${emailList.length} participant${emailList.length > 1 ? 's' : ''}`);
      setIsInviteModalOpen(false);
      setEmailList([]);
    } catch (error) {
      console.error('Failed to send invitations:', error);
      alert('Failed to send invitations. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(`${session.user.name}:${session.user.id}`);
    }
  }, [session]);

  const handleJoin = (
    cameraEnabled: boolean,
    micEnabled: boolean,
    cameraId?: string,
    micId?: string
  ) => {
    console.log("Joining meeting with:", {
      cameraEnabled,
      micEnabled,
      cameraId,
      micId,
    });
    setIsInCall(true);
  };

  const handleLeaveRoom = () => {
    setIsInCall(false);
    setMeetingEnded(true);
  };

  const handleExit = () => {
    router.push("/meetings");
  };

  if (isInCall) {
    return (
      <>
        <VideoCall
          roomId={roomId}
          userId={userId}
          onLeave={handleLeaveRoom}
          onAddParticipant={() => setIsInviteModalOpen(true)}
        />
        
        {isInviteModalOpen && (
          <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6" />
                    <div>
                      <h2 className="text-xl font-bold">Invite Participants</h2>
                      {/* <p className="text-blue-100 text-sm mt-1">
                        Share this meeting with others
                      </p> */}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsInviteModalOpen(false)}
                    className="text-white/80 hover:text-white transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter email addresses
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="email-input"
                      type="email"
                      placeholder="participant@example.com"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSending}
                    />
                    <button
                      onClick={handleAddEmail}
                      disabled={isSending || !newEmail.trim()}
                      className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 min-w-[80px] justify-center"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Participants to invite
                    </span>
                    <span className="text-sm text-gray-500">
                      {emailList.length} added
                    </span>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-2 min-h-[100px] max-h-[200px] overflow-y-auto bg-gray-50">
                    {emailList.length === 0 ? (
                      <div className="text-center py-8">
                        <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">
                          No email addresses added yet
                        </p>
                        <p className="text-gray-300 text-xs mt-1">
                          Add email addresses above
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {emailList.map((email, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 justify-between bg-white p-3 rounded-lg border border-gray-100 hover:bg-blue-50 transition-colors group"
                          >
                            <span className="text-sm font-medium text-gray-800 truncate">
                              {email}
                            </span>
                            <button
                              onClick={() => handleRemoveEmail(index)}
                              disabled={isSending}
                              className="text-gray-400 hover:text-red-500"
                              aria-label={`Remove ${email}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {emailList.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Invitation will be sent as:
                    </p>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">
                        {session?.user?.name}
                      </p>
                      <p className="text-gray-600">
                        &lt;{session?.user?.email}&gt;
                      </p>
                      <p className="text-gray-500 mt-2 text-xs">
                        Via Connect Meet • Meeting Code: {meetingCode}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setIsInviteModalOpen(false);
                      setEmailList([]);
                    }}
                    disabled={isSending}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInvites}
                    disabled={emailList.length === 0 || isSending}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Invitation{emailList.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (meetingEnded) {
      return (
          <MeetingEnd
              redirectUrl="/meetings"
          />
      );
  }

  return (
    <WaitingRoom
      meetingCode={meetingCode}
      meetingTitle={`Meeting ${meetingCode}`}
      onJoin={handleJoin}
      onExit={handleExit}
    />
  );
}