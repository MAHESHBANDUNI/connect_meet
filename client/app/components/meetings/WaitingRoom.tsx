"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Mic, MicOff, Video, VideoOff, Copy, LogOut, Settings,
  Camera, Volume2, Headphones, Monitor, ChevronDown
} from "lucide-react";
import { successToast, errorToast } from "@/app/components/ui/toast";

interface WaitingRoomProps {
  meetingCode: string;
  meetingTitle: string;
  onJoin: (cameraEnabled: boolean, micEnabled: boolean, cameraId?: string, micId?: string) => void;
  onExit: () => void;
}

export default function WaitingRoom({
  meetingCode,
  meetingTitle,
  onJoin,
  onExit,
}: WaitingRoomProps) {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [devices, setDevices] = useState<{
    cameras: MediaDeviceInfo[];
    mics: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }>({
    cameras: [],
    mics: [],
    speakers: [],
  });

  const [selectedDevices, setSelectedDevices] = useState({
    cameraId: "",
    micId: "",
    speakerId: "",
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Enumerate devices on mount and when permissions might have changed
  useEffect(() => {
    const getDevices = async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();

        const cameras = allDevices.filter(d => d.kind === "videoinput");
        const mics = allDevices.filter(d => d.kind === "audioinput");
        const speakers = allDevices.filter(d => d.kind === "audiooutput");

        setDevices({ cameras, mics, speakers });

        // Set default devices if not already set
        setSelectedDevices(prev => ({
          cameraId: prev.cameraId || cameras[0]?.deviceId || "",
          micId: prev.micId || mics[0]?.deviceId || "",
          speakerId: prev.speakerId || speakers[0]?.deviceId || "default",
        }));
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    };

    getDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener("devicechange", getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getDevices);
    };
  }, []);

  // Update stream when camera settings change
  useEffect(() => {
    if (cameraEnabled) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [cameraEnabled, selectedDevices.cameraId]);

  const startCamera = async () => {
    stopCamera();
    try {
      const constraints = {
        video: {
          deviceId: selectedDevices.cameraId ? { exact: selectedDevices.cameraId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // If we got labels now (first time), refresh device list
      if (devices.cameras.length > 0 && !devices.cameras[0].label) {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        setDevices({
          cameras: allDevices.filter(d => d.kind === "videoinput"),
          mics: allDevices.filter(d => d.kind === "audioinput"),
          speakers: allDevices.filter(d => d.kind === "audiooutput"),
        });
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraEnabled(false);
      errorToast("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleJoin = () => {
    onJoin(cameraEnabled, micEnabled, selectedDevices.cameraId, selectedDevices.micId);
  };

  const copyMeetingCode = () => {
    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingCode}`);
    successToast("Meeting code copied to clipboard!");
  };

  const handleDeviceChange = (kind: keyof typeof selectedDevices, value: string) => {
    setSelectedDevices(prev => ({ ...prev, [kind]: value }));

    // If it's a speaker change, we try to set it on the video element if it has audio (it doesn't usually in preview)
    if (kind === "speakerId" && videoRef.current && (videoRef.current as any).setSinkId) {
      (videoRef.current as any).setSinkId(value);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full text-slate-900 bg-slate-50 overflow-hidden">
      {/* Left Side - Camera Preview & Settings */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 space-y-8 min-h-0 overflow-y-auto">
        <div className="w-full max-w-3xl space-y-6">
          <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-200 group">
            {cameraEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800">
                <div className="relative">
                  <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center animate-pulse">
                    <VideoOff className="w-12 h-12 text-slate-400" />
                  </div>
                </div>
                <p className="mt-4 text-slate-400 font-medium">Camera is off</p>
              </div>
            )}

            {/* Floating Top Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/10 shadow-lg">
                <span className="text-sm font-mono text-white/90 font-medium">{meetingCode}</span>
                <button
                  onClick={copyMeetingCode}
                  className="p-1.5 hover:bg-white/20 rounded-xl transition-all text-white/80 hover:text-white"
                  title="Copy meeting code"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Controls Overlay */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-slate-900/40 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-4 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${micEnabled
                    ? "bg-slate-100 text-slate-900 shadow-lg"
                    : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                  }`}
              >
                {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>
              <button
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={`p-4 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${cameraEnabled
                    ? "bg-slate-100 text-slate-900 shadow-lg"
                    : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                  }`}
              >
                {cameraEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>

              <div className="w-px h-8 bg-white/20 mx-2" />

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-4 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${showSettings ? "bg-blue-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Quick Info & Feedback */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-300 ${micEnabled ? "bg-blue-50 border-blue-100 text-blue-700" : "bg-slate-100 border-slate-200 text-slate-500"
              }`}>
              <div className={`p-2 rounded-full ${micEnabled ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"}`}>
                {micEnabled ? <Volume2 className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
              </div>
              <span className="text-sm font-semibold">{micEnabled ? "Microphone active" : "Microphone muted"}</span>
            </div>
            <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-300 ${cameraEnabled ? "bg-blue-50 border-blue-100 text-blue-700" : "bg-slate-100 border-slate-200 text-slate-500"
              }`}>
              <div className={`p-2 rounded-full ${cameraEnabled ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"}`}>
                {cameraEnabled ? <Monitor className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </div>
              <span className="text-sm font-semibold">{cameraEnabled ? "Video sharing" : "Camera off"}</span>
            </div>
          </div>

          {/* Settings Section (Conditional) */}
          {showSettings && (
            <div className="mt-8 p-6 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-6 animate-in slide-in-from-bottom-4 transition-all overflow-hidden relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Device Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors font-medium text-sm"
                >
                  Done
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Camera Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                    <Camera className="w-3.5 h-3.5" />
                    Camera
                  </label>
                  <div className="relative group">
                    <select
                      value={selectedDevices.cameraId}
                      onChange={(e) => handleDeviceChange("cameraId", e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer group-hover:border-slate-300"
                    >
                      {devices.cameras.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 5)}...`}</option>
                      ))}
                      {devices.cameras.length === 0 && <option value="">No cameras found</option>}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-slate-600" />
                  </div>
                </div>

                {/* Microphone Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                    <Mic className="w-3.5 h-3.5" />
                    Microphone
                  </label>
                  <div className="relative group">
                    <select
                      value={selectedDevices.micId}
                      onChange={(e) => handleDeviceChange("micId", e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer group-hover:border-slate-300"
                    >
                      {devices.mics.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 5)}...`}</option>
                      ))}
                      {devices.mics.length === 0 && <option value="">No microphones found</option>}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-slate-600" />
                  </div>
                </div>

                {/* Speaker Selection */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                    <Headphones className="w-3.5 h-3.5" />
                    Speaker
                  </label>
                  <div className="relative group">
                    <select
                      value={selectedDevices.speakerId}
                      onChange={(e) => handleDeviceChange("speakerId", e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer group-hover:border-slate-300"
                    >
                      {devices.speakers.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Speaker ${d.deviceId.slice(0, 5)}...`}</option>
                      ))}
                      {devices.speakers.length === 0 && <option value="default">Default System Output</option>}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-slate-600" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Action Panel */}
      <div className="w-full lg:w-[420px] bg-white lg:border-l border-slate-200 shadow-[-20px_0_40px_rgba(0,0,0,0.02)] z-10 p-8 lg:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-semibold text-slate-900 leading-tight">Ready to <span className="text-blue-600">Join?</span></h1>
            {/* <p className="text-slate-500 text-lg leading-relaxed">Everything is set. Your colleagues are waiting for you in the room.</p> */}
          </div>

          {/* <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Meeting Topic</p>
                <p className="text-xl font-bold text-slate-800 break-words line-clamp-2">{meetingTitle}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Video className="w-6 h-6" />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center gap-4 text-slate-500 font-medium">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-${200 + i * 100} flex items-center justify-center text-[10px] text-white font-bold`}>
                      U{i}
                    </div>
                  ))}
                </div>
                <span className="text-sm">No one else is here yet</span>
              </div>
            </div>
          </div> */}

          <div className="space-y-4">
            <Button
              onClick={handleJoin}
              size="lg"
              className="w-full h-16 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-3xl shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              Join now
            </Button>

            <button
              onClick={onExit}
              className="w-full py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center gap-2 group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Return Home
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
