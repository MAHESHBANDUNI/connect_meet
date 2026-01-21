import { useState, useCallback, useEffect, useRef } from 'react';

interface MediaStreamState {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  isAudioMuted: boolean;
  isVideoOff: boolean;
//   isScreenSharing: boolean;
}

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
  const [state, setState] = useState<MediaStreamState>({
    localStream: null,
    screenStream: null,
    isAudioMuted: false,
    isVideoOff: false,
    // isScreenSharing: false,
  });

  const getMediaStream = useCallback(async (constraints?: MediaStreamConstraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        constraints || defaultConstraints
      );
      
      setState(prev => ({ ...prev, localStream: stream }));
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, []);

  const stopMediaStream = useCallback(() => {
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
      setState(prev => ({ ...prev, localStream: null }));
    }
    if (state.screenStream) {
      state.screenStream.getTracks().forEach(track => track.stop());
      setState(prev => ({ ...prev, screenStream: null, isScreenSharing: false }));
    }
  }, [state.localStream, state.screenStream]);

  const toggleAudio = useCallback(() => {
    if (state.localStream) {
      const audioTrack = state.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setState(prev => ({ ...prev, isAudioMuted: !audioTrack.enabled }));
      }
    }
  }, [state.localStream]);

  const toggleVideo = useCallback(() => {
    if (state.localStream) {
      const videoTrack = state.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setState(prev => ({ ...prev, isVideoOff: !videoTrack.enabled }));
      }
    }
  }, [state.localStream]);

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
        if (!hasStoppedRef.current) {
          hasStoppedRef.current = true;
          stopMediaStream();
        }
      };
    }, [stopMediaStream]);

  return {
    ...state,
    getMediaStream,
    stopMediaStream,
    toggleAudio,
    toggleVideo,
    // toggleScreenShare,
  };
};