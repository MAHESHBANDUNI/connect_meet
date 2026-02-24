import { useState, useCallback, useEffect, useRef } from 'react';

const defaultConstraints: MediaStreamConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
};

export const useMediaStream = () => {
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const getMediaStream = useCallback(async (constraints?: MediaStreamConstraints) => {
    const stream = await navigator.mediaDevices.getUserMedia(
      constraints || defaultConstraints
    );

    localStreamRef.current = stream;
    return stream;
  }, []);

  const stopMediaStream = useCallback(() => {
    [localStreamRef.current].forEach(stream => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    });

    localStreamRef.current = null;
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

        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    }
  }, [isScreenSharing, stopScreenShare]);
  const hasStoppedRef = useRef(false);

  useEffect(() => {
    return () => {
      stopMediaStream();
      stopScreenShare();
    };
  }, [stopMediaStream, stopScreenShare]);

  return {
    localStream: localStreamRef.current,
    screenStream: screenStreamRef.current,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    getMediaStream,
    stopMediaStream,
    stopScreenShare,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
};