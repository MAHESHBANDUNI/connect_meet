import { useState, useCallback, useEffect, useRef } from 'react';

// interface MediaStreamState {
//   localStream: MediaStream | null;
//   screenStream: MediaStream | null;
//   isAudioMuted: boolean;
//   isVideoOff: boolean;
// //   isScreenSharing: boolean;
// }

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
  // const [state, setState] = useState<MediaStreamState>({
  //   localStream: null,
  //   screenStream: null,
  //   isAudioMuted: false,
  //   isVideoOff: false,
  //   // isScreenSharing: false,
  // });
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

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

//   const toggleScreenShare = useCallback(async () => {
//     if (state.isScreenSharing && state.screenStream) {
//       state.screenStream.getTracks().forEach(track => track.stop());
//       setState(prev => ({ ...prev, screenStream: null, isScreenSharing: false }));
//     } else {
//       try {
//         const screenStream = await navigator.mediaDevices.getDisplayMedia({
//           video: true,
//           audio: true,
//         });
        
//         screenStream.getVideoTracks()[0].onended = () => {
//           setState(prev => ({ ...prev, screenStream: null, isScreenSharing: false }));
//         };
        
//         setState(prev => ({ 
//           ...prev, 
//           screenStream, 
//           isScreenSharing: true 
//         }));
//       } catch (error) {
//         console.error('Error sharing screen:', error);
//       }
//     }
//   }, [state.isScreenSharing, state.screenStream]);
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
    getMediaStream,
    stopMediaStream,
    toggleAudio,
    toggleVideo,
  };
};