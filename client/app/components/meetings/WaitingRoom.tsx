"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Mic, MicOff, Video, VideoOff, Copy, LogOut, Settings,
  Camera, Volume2, Headphones, Monitor, ChevronDown, X
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
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 overflow-auto">
      {/* Main Content Area - Left Side on Desktop */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12 min-h-screen lg:min-h-0">
        <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6">
          {/* Camera Preview Card */}
          <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl md:shadow-2xl">
            {cameraEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="relative">
                  <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-slate-700/50 rounded-full flex items-center justify-center animate-pulse">
                    <VideoOff className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 text-slate-400" />
                  </div>
                </div>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-400 font-medium">Camera is off</p>
              </div>
            )}

            {/* Meeting Code Badge - Responsive positioning */}
            <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4">
              <div className="bg-black/40 backdrop-blur-md px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full sm:rounded-xl md:rounded-2xl flex items-center gap-1 sm:gap-2 border border-white/10 shadow-lg">
                <span className="text-xs sm:text-sm font-mono text-white/90 font-medium truncate max-w-[80px] sm:max-w-[120px] md:max-w-full">
                  {meetingCode}
                </span>
                <button
                  onClick={copyMeetingCode}
                  className="p-1 sm:p-1.5 hover:bg-white/20 rounded-full sm:rounded-lg transition-all text-white/80 hover:text-white"
                  title="Copy meeting code"
                >
                  <Copy className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Controls - Responsive sizing */}
            <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-2 sm:p-3 md:p-4 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  micEnabled
                    ? "bg-white text-slate-900 shadow-lg"
                    : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                }`}
                aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
              >
                {micEnabled ? <Mic className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" /> : <MicOff className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" />}
              </button>
              
              <button
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={`p-2 sm:p-3 md:p-4 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  cameraEnabled
                    ? "bg-white text-slate-900 shadow-lg"
                    : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                }`}
                aria-label={cameraEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {cameraEnabled ? <Video className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" /> : <VideoOff className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" />}
              </button>

              <div className="w-px h-4 sm:h-6 md:h-8 bg-white/20 mx-0 sm:mx-1 md:mx-2" />

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 sm:p-3 md:p-4 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  showSettings ? "bg-blue-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                }`}
                aria-label="Settings"
              >
                <Settings className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" />
              </button>
            </div>
          </div>

          {/* Settings Section - Responsive */}
          {showSettings && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm lg:relative lg:inset-auto lg:bg-transparent lg:p-0 lg:backdrop-blur-none animate-in fade-in lg:animate-none">
              <div className="w-full max-w-lg lg:max-w-none bg-white rounded-t-2xl sm:rounded-2xl lg:rounded-3xl border border-slate-200 shadow-xl lg:shadow-lg p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6 animate-in slide-in-from-bottom lg:slide-in-from-bottom-0 lg:animate-none">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Settings className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                    Device Settings
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-full transition-colors"
                    aria-label="Close settings"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="hidden lg:block text-xs sm:text-sm text-slate-400 hover:text-slate-600 transition-colors font-medium"
                  >
                    Done
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  {/* Camera Selection */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5 tracking-wider">
                      <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Camera
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDevices.cameraId}
                        onChange={(e) => handleDeviceChange("cameraId", e.target.value)}
                        className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-2 sm:py-2.5 md:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        {devices.cameras.map((d) => (
                          <option key={d.deviceId} value={d.deviceId} className="text-xs sm:text-sm">
                            {d.label || `Camera ${d.deviceId.slice(0, 5)}...`}
                          </option>
                        ))}
                        {devices.cameras.length === 0 && <option value="">No cameras found</option>}
                      </select>
                      <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Microphone Selection */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5 tracking-wider">
                      <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Microphone
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDevices.micId}
                        onChange={(e) => handleDeviceChange("micId", e.target.value)}
                        className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-2 sm:py-2.5 md:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        {devices.mics.map((d) => (
                          <option key={d.deviceId} value={d.deviceId} className="text-xs sm:text-sm">
                            {d.label || `Mic ${d.deviceId.slice(0, 5)}...`}
                          </option>
                        ))}
                        {devices.mics.length === 0 && <option value="">No microphones found</option>}
                      </select>
                      <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Speaker Selection - Full width on mobile */}
                  <div className="sm:col-span-2 space-y-1.5 sm:space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5 tracking-wider">
                      <Headphones className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Speaker
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDevices.speakerId}
                        onChange={(e) => handleDeviceChange("speakerId", e.target.value)}
                        className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-2 sm:py-2.5 md:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        {devices.speakers.map((d) => (
                          <option key={d.deviceId} value={d.deviceId} className="text-xs sm:text-sm">
                            {d.label || `Speaker ${d.deviceId.slice(0, 5)}...`}
                          </option>
                        ))}
                        {devices.speakers.length === 0 && <option value="default">Default System Output</option>}
                      </select>
                      <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Action Buttons */}
      <div className="w-full lg:w-80 xl:w-96 bg-white lg:bg-transparent lg:border-l border-slate-200 p-4 sm:p-6 md:p-8 lg:p-10 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto space-y-4 sm:space-y-6">
          {/* Meeting Title - Visible on all screens */}
          <div className="text-center lg:text-left">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900 mb-1">
              {meetingTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Ready to join the meeting?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 sm:space-y-4">
            <Button
              onClick={handleJoin}
              size="lg"
              className="w-full h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] sm:hover:scale-[1.02] active:scale-95"
            >
              Join Meeting
            </Button>

            <button
              onClick={onExit}
              className="w-full py-3 sm:py-3.5 md:py-4 text-red-500 font-medium hover:bg-red-50 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              <LogOut className="w-4 sm:w-5 h-4 sm:h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm sm:text-base">Return Home</span>
            </button>
          </div>

          {/* Meeting Code - Mobile only */}
          <div className="lg:hidden flex items-center justify-center gap-2 p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
            <span className="text-xs sm:text-sm text-slate-600">Meeting Code:</span>
            <code className="text-xs sm:text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {meetingCode}
            </code>
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