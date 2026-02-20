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
    [localStreamRef.current, screenStreamRef.current].forEach(stream => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    });

    localStreamRef.current = null;
    screenStreamRef.current = null;
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

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing && screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      setIsScreenSharing(false);
      screenStreamRef.current = null;
    } else {
      try {
        screenStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        
        screenStreamRef.current.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          screenStreamRef.current = null;
        };
        
        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    }
  }, [isScreenSharing]);
    const hasStoppedRef = useRef(false);
    
  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, [stopMediaStream]);

  return {
    localStream: localStreamRef.current,
    screenStream: screenStreamRef.current,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    getMediaStream,
    stopMediaStream,
    toggleAudio,
    toggleVideo,
    toggleScreenShare
  };
};