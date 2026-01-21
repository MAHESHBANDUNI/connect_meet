"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import WaitingRoom from "@/app/components/meetings/WaitingRoom";

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingCode = params.id as string;
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = (cameraEnabled: boolean, micEnabled: boolean, cameraId?: string, micId?: string) => {
    // TODO: Initialize WebRTC connection with camera/mic settings
    console.log("Joining meeting with:", { cameraEnabled, micEnabled, cameraId, micId });
    setHasJoined(true);
    // You can redirect to actual meeting interface here
  };

  const handleExit = () => {
    router.push("/dashboard");
  };

  if (hasJoined) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
          <div className="max-w-md w-full text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-blue-100 rounded-full mx-auto"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>
      
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Waiting for Host
            </h1>
            <p className="text-gray-700 mb-8">
              The host will let you in shortly. Please wait...
            </p>
      
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-delay-200"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-delay-400"></div>
                <span className="text-sm text-gray-600 ml-2">Connecting...</span>
              </div>

              <div className="text-sm text-gray-500 mt-6">
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Securing connection
                </div>
              </div>
            </div>
      
            <div className="mt-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center mt-0.5">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
      
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
                    Quick Tip
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Ensure your microphone and camera are ready before joining.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
