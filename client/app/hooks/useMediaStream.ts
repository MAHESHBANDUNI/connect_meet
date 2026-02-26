import { useState, useCallback, useEffect, useRef } from 'react';

type DeviceSelection = {
  cameraId: string;
  micId: string;
  speakerId: string;
};

type AvailableDevices = {
  cameras: MediaDeviceInfo[];
  mics: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
};

interface UseMediaStreamOptions {
  initialCameraEnabled?: boolean;
  initialMicEnabled?: boolean;
  initialCameraId?: string;
  initialMicId?: string;
  initialSpeakerId?: string;
}

const defaultConstraints = (selection: Partial<DeviceSelection>): MediaStreamConstraints => ({
  audio: {
    deviceId: selection.micId ? { exact: selection.micId } : undefined,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: {
    deviceId: selection.cameraId ? { exact: selection.cameraId } : undefined,
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
});

export const useMediaStream = (options?: UseMediaStreamOptions) => {
  const initialCameraEnabled = options?.initialCameraEnabled ?? true;
  const initialMicEnabled = options?.initialMicEnabled ?? true;

  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(!initialMicEnabled);
  const [isVideoOff, setIsVideoOff] = useState(!initialCameraEnabled);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<AvailableDevices>({
    cameras: [],
    mics: [],
    speakers: [],
  });
  const [selectedDevices, setSelectedDevices] = useState<DeviceSelection>({
    cameraId: options?.initialCameraId || '',
    micId: options?.initialMicId || '',
    speakerId: options?.initialSpeakerId || 'default',
  });

  const refreshDevices = useCallback(async () => {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const cameras = allDevices.filter(device => device.kind === 'videoinput');
    const mics = allDevices.filter(device => device.kind === 'audioinput');
    const speakers = allDevices.filter(device => device.kind === 'audiooutput');

    setAvailableDevices({ cameras, mics, speakers });
    setSelectedDevices(prev => ({
      cameraId: prev.cameraId || options?.initialCameraId || cameras[0]?.deviceId || '',
      micId: prev.micId || options?.initialMicId || mics[0]?.deviceId || '',
      speakerId: prev.speakerId || options?.initialSpeakerId || speakers[0]?.deviceId || 'default',
    }));
  }, [options?.initialCameraId, options?.initialMicId, options?.initialSpeakerId]);

  const getMediaStream = useCallback(async (nextSelection?: Partial<DeviceSelection>) => {
    const effectiveSelection = {
      ...selectedDevices,
      ...nextSelection,
    };

    const stream = await navigator.mediaDevices.getUserMedia(
      defaultConstraints(effectiveSelection)
    );

    stream.getAudioTracks().forEach(track => {
      track.enabled = !isAudioMuted;
    });
    stream.getVideoTracks().forEach(track => {
      track.enabled = !isVideoOff;
    });

    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = stream;
    setLocalStream(stream);
    setSelectedDevices(prev => ({
      ...prev,
      cameraId: effectiveSelection.cameraId || prev.cameraId,
      micId: effectiveSelection.micId || prev.micId,
      speakerId: effectiveSelection.speakerId || prev.speakerId,
    }));

    await refreshDevices();
    return stream;
  }, [isAudioMuted, isVideoOff, refreshDevices, selectedDevices]);

  const stopMediaStream = useCallback(() => {
    [localStreamRef.current].forEach(stream => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    });

    localStreamRef.current = null;
    setLocalStream(null);
  }, []);

  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    stream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
      setIsAudioMuted(!track.enabled);
    });
  }, []);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    stream.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
      setIsVideoOff(!track.enabled);
    });
  }, []);

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setScreenStream(null);
    setIsScreenSharing(false);
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      try {
        screenStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        screenStreamRef.current.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };

        setScreenStream(screenStreamRef.current);
        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    }
  }, [isScreenSharing, stopScreenShare]);

  const switchTrackDevice = useCallback(
    async (kind: 'audio' | 'video', deviceId: string) => {
      const trackConstraints: MediaStreamConstraints =
        kind === 'audio'
          ? { audio: { deviceId: { exact: deviceId } }, video: false }
          : { video: { deviceId: { exact: deviceId } }, audio: false };

      const replacementStream = await navigator.mediaDevices.getUserMedia(trackConstraints);
      const replacementTrack =
        kind === 'audio'
          ? replacementStream.getAudioTracks()[0]
          : replacementStream.getVideoTracks()[0];

      if (!replacementTrack) {
        replacementStream.getTracks().forEach(track => track.stop());
        return;
      }

      if (kind === 'audio') {
        replacementTrack.enabled = !isAudioMuted;
      } else {
        replacementTrack.enabled = !isVideoOff;
      }

      const currentStream = localStreamRef.current;
      const currentTracks = currentStream?.getTracks() || [];
      const keptTracks = currentTracks.filter(track => track.kind !== kind);

      currentTracks
        .filter(track => track.kind === kind)
        .forEach(track => track.stop());

      const nextStream = new MediaStream([...keptTracks, replacementTrack]);
      localStreamRef.current = nextStream;
      setLocalStream(nextStream);

      replacementStream.getTracks().forEach(track => {
        if (track.id !== replacementTrack.id) {
          track.stop();
        }
      });

      if (kind === 'audio') {
        setSelectedDevices(prev => ({ ...prev, micId: deviceId }));
      } else {
        setSelectedDevices(prev => ({ ...prev, cameraId: deviceId }));
      }
    },
    [isAudioMuted, isVideoOff]
  );

  const switchMicrophone = useCallback(
    async (micId: string) => {
      await switchTrackDevice('audio', micId);
    },
    [switchTrackDevice]
  );

  const switchCamera = useCallback(
    async (cameraId: string) => {
      await switchTrackDevice('video', cameraId);
    },
    [switchTrackDevice]
  );

  const switchSpeaker = useCallback((speakerId: string) => {
    setSelectedDevices(prev => ({ ...prev, speakerId }));
  }, []);

  useEffect(() => {
    refreshDevices().catch(error => {
      console.error('Failed to enumerate devices:', error);
    });

    navigator.mediaDevices.addEventListener('devicechange', refreshDevices);

    return () => {
      stopMediaStream();
      stopScreenShare();
      navigator.mediaDevices.removeEventListener('devicechange', refreshDevices);
    };
  }, [refreshDevices, stopMediaStream, stopScreenShare]);

  return {
    localStream,
    screenStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    availableDevices,
    selectedDevices,
    getMediaStream,
    refreshDevices,
    stopMediaStream,
    stopScreenShare,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    switchMicrophone,
    switchCamera,
    switchSpeaker,
  };
};
