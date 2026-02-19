"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Copy,
  LogOut,
  Settings,
  Camera,
  Headphones,
  ChevronDown,
  X,
} from "lucide-react";
import { successToast, errorToast } from "@/app/components/ui/toast";

interface WaitingRoomProps {
  meetingCode: string;
  meetingTitle: string;
  onJoin: (
    cameraEnabled: boolean,
    micEnabled: boolean,
    cameraId?: string,
    micId?: string
  ) => void;
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

  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

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
    speakerId: "default",
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);


  const getDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();

      const cameras = allDevices.filter((d) => d.kind === "videoinput");
      const mics = allDevices.filter((d) => d.kind === "audioinput");
      const speakers = allDevices.filter((d) => d.kind === "audiooutput");

      setDevices({ cameras, mics, speakers });

      setSelectedDevices((prev) => ({
        cameraId: prev.cameraId || cameras[0]?.deviceId || "",
        micId: prev.micId || mics[0]?.deviceId || "",
        speakerId: prev.speakerId || speakers[0]?.deviceId || "default",
      }));
    } catch (err) {
      console.error("Error enumerating devices:", err);
      errorToast("Unable to access media devices.");
    }
  }, []);

  useEffect(() => {
    getDevices();
    navigator.mediaDevices.addEventListener("devicechange", getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getDevices);
    };
  }, [getDevices]);

  const stopMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startMedia = useCallback(async () => {
    stopMedia();

    try {
      const constraints: MediaStreamConstraints = {
        video: cameraEnabled
          ? {
              deviceId: selectedDevices.cameraId
                ? { exact: selectedDevices.cameraId }
                : undefined,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          : false,
        audio: micEnabled
          ? {
              deviceId: selectedDevices.micId
                ? { exact: selectedDevices.micId }
                : undefined,
            }
          : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = stream;

      setHasCameraPermission(cameraEnabled);
      setHasMicPermission(micEnabled);

      if (videoRef.current && cameraEnabled) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media:", error);

      if (cameraEnabled) {
        setCameraEnabled(false);
        setHasCameraPermission(false);
      }

      if (micEnabled) {
        setMicEnabled(false);
        setHasMicPermission(false);
      }

      errorToast("Permission denied or media device unavailable.");
    }
  }, [cameraEnabled, micEnabled, selectedDevices, stopMedia]);

  useEffect(() => {
    if (cameraEnabled || micEnabled) {
      startMedia();
    } else {
      stopMedia();
    }

    return () => {
      stopMedia();
    };
  }, [cameraEnabled, micEnabled, selectedDevices, startMedia, stopMedia]);

  const handleJoin = () => {
    onJoin(
      cameraEnabled,
      micEnabled,
      selectedDevices.cameraId,
      selectedDevices.micId
    );
  };

  const copyMeetingCode = async () => {
    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingCode}`
      );
      successToast("Meeting link copied to clipboard!");
    } catch {
      errorToast("Failed to copy meeting link.");
    }
  };

  const handleDeviceChange = async (
    kind: keyof typeof selectedDevices,
    value: string
  ) => {
    setSelectedDevices((prev) => ({ ...prev, [kind]: value }));

    if (
      kind === "speakerId" &&
      videoRef.current &&
      "setSinkId" in videoRef.current
    ) {
      try {
        await (videoRef.current as HTMLMediaElement & {
          setSinkId: (id: string) => Promise<void>;
        }).setSinkId(value);
      } catch {
        errorToast("Failed to switch audio output device.");
      }
    }
  };

  useEffect(() => {
    return () => {
      stopMedia();
    };
  }, [stopMedia]);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 h-full overflow-hidden">
        <div className="w-full max-w-5xl h-full flex flex-col justify-center gap-2 sm:gap-3 md:gap-4">
          {/* Camera Preview Card */}
          <div className="relative aspect-video w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl md:shadow-2xl">
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
                  <div className="w-12 sm:w-16 md:w-20 lg:w-24 h-12 sm:h-16 md:h-20 lg:h-24 bg-slate-700/50 rounded-full flex items-center justify-center animate-pulse">
                    <VideoOff className="w-6 sm:w-8 md:w-10 lg:w-12 h-6 sm:h-8 md:h-10 lg:h-12 text-slate-400" />
                  </div>
                </div>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-slate-400 font-medium">Camera is off</p>
              </div>
            )}

            {/* Meeting Code Badge */}
            <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4">
              <div className="bg-black/40 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-full sm:rounded-lg md:rounded-xl flex items-center gap-1 sm:gap-2 border border-white/10 shadow-lg">
                <span className="text-xs sm:text-sm font-mono text-white/90 font-medium truncate max-w-[70px] sm:max-w-[100px] md:max-w-[120px]">
                  {meetingCode}
                </span>
                <button
                  onClick={copyMeetingCode}
                  className="p-1 hover:bg-white/20 rounded-full transition-all text-white/80 hover:text-white"
                  title="Copy meeting code"
                >
                  <Copy className="w-2.5 sm:w-3 md:w-3.5 h-2.5 sm:h-3 md:h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute z-50 bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1 sm:gap-2 md:gap-3 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  micEnabled
                    ? "bg-white text-slate-900 shadow-lg"
                    : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                }`}
                aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
              >
                {micEnabled ? <Mic className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" /> : <MicOff className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />}
              </button>
              
              <button
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={`p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  cameraEnabled
                    ? "bg-white text-slate-900 shadow-lg"
                    : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                }`}
                aria-label={cameraEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {cameraEnabled ? <Video className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" /> : <VideoOff className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />}
              </button>

              <div className="w-px h-3 sm:h-4 md:h-5 bg-white/20 mx-0 sm:mx-0.5 md:mx-1" />

              <button
                onClick={() => setShowSettings(true)}
                className={`p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 bg-white/10 text-white hover:bg-white/20`}
                aria-label="Settings"
              >
                <Settings className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full lg:w-72 xl:w-80 bg-white lg:bg-transparent lg:border-l border-slate-200 p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-end sm:justify-center h-content">
        <div className="w-full max-w-sm mx-auto space-y-3 sm:space-y-4 md:space-y-5">
          {/* Meeting Title */}
          <div className="text-center lg:text-left">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-slate-900 mb-0.5 sm:mb-1 line-clamp-2">
              {meetingTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Ready to join the meeting?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3">
            <Button
              onClick={handleJoin}
              className="w-full h-10 sm:h-11 md:h-12 text-sm sm:text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-95"
            >
              Join Meeting
            </Button>

            <button
              onClick={onExit}
              className="w-full py-2 sm:py-2.5 text-red-500 font-medium hover:bg-red-50 rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 group"
            >
              <LogOut className="w-3.5 sm:w-4 h-3.5 sm:h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs sm:text-sm">Return Home</span>
            </button>
          </div>

        </div>
      </div>

      {/* Settings Modal*/}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-xl sm:rounded-xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-3 sm:p-4 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                Advanced Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close settings"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {/* Camera Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  Camera
                </label>
                <div className="relative">
                  <select
                    value={selectedDevices.cameraId}
                    onChange={(e) => handleDeviceChange("cameraId", e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {devices.cameras.map((d) => (
                      <option key={d.deviceId} value={d.deviceId} className="text-sm">
                        {d.label || `Camera ${d.deviceId.slice(0, 8)}...`}
                      </option>
                    ))}
                    {devices.cameras.length === 0 && <option value="">No cameras found</option>}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {devices.cameras.length} camera(s) detected
                </p>
              </div>

              {/* Microphone Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                  <Mic className="w-3 h-3" />
                  Microphone
                </label>
                <div className="relative">
                  <select
                    value={selectedDevices.micId}
                    onChange={(e) => handleDeviceChange("micId", e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {devices.mics.map((d) => (
                      <option key={d.deviceId} value={d.deviceId} className="text-sm">
                        {d.label || `Mic ${d.deviceId.slice(0, 8)}...`}
                      </option>
                    ))}
                    {devices.mics.length === 0 && <option value="">No microphones found</option>}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {devices.mics.length} microphone(s) detected
                </p>
              </div>

              {/* Speaker Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                  <Headphones className="w-3 h-3" />
                  Speaker
                </label>
                <div className="relative">
                  <select
                    value={selectedDevices.speakerId}
                    onChange={(e) => handleDeviceChange("speakerId", e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {devices.speakers.map((d) => (
                      <option key={d.deviceId} value={d.deviceId} className="text-sm">
                        {d.label || `Speaker ${d.deviceId.slice(0, 8)}...`}
                      </option>
                    ))}
                    {devices.speakers.length === 0 && <option value="default">Default System Output</option>}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {devices.speakers.length > 0 ? `${devices.speakers.length} speaker(s) detected` : 'Using default output'}
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-3 sm:p-4">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}