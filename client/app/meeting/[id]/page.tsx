"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import WaitingRoom from "@/app/components/meetings/WaitingRoom";
import { VideoCall } from "@/app/components/VideoCall/VideoCall";
import { useSession } from "next-auth/react";

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingCode = params.id as string;

  const { data: session } = useSession();

  const [roomId, setRoomId] = useState<string>(meetingCode);
  const [userId, setUserId] = useState<string>("");
  const [isInCall, setIsInCall] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.name as string);
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
    setRoomId("");
    setUserId("");
  };

  const handleExit = () => {
    router.push("/dashboard");
  };

  if (isInCall) {
    return (
      <VideoCall
        roomId={roomId}
        userId={userId}
        onLeave={handleLeaveRoom}
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
