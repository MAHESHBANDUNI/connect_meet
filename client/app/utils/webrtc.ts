export const getRTCPeerConnectionConfig = (): RTCConfiguration => {
  const iceServers = [
    process.env.NEXT_PUBLIC_STUN_SERVER_1,
    process.env.NEXT_PUBLIC_STUN_SERVER_2,
  ]
    .filter(Boolean)
    .map((url) => ({ urls: url as string }));

  return {
    iceServers,
    iceCandidatePoolSize: 10,
  };
};

// export const createPeerConnection = (
//   userId: string,
//   remoteUserId: string,
//   onIceCandidate: (candidate: RTCIceCandidate, targetUserId: string) => void,
//   onTrack: (event: RTCTrackEvent, remoteUserId: string) => void
// ): RTCPeerConnection => {
//   const pc = new RTCPeerConnection(getRTCPeerConnectionConfig());

//   pc.onicecandidate = (event) => {
//     if (event.candidate) {
//       onIceCandidate(event.candidate, remoteUserId);
//     }
//   };

//   pc.ontrack = (event) => {
//     onTrack(event, remoteUserId);
//   };

//   pc.onconnectionstatechange = () => {
//     console.log(`Connection state with ${remoteUserId}:`, pc.connectionState);
//   };

//   pc.oniceconnectionstatechange = () => {
//     console.log(`ICE state with ${remoteUserId}:`, pc.iceConnectionState);
//   };

//   return pc;
// };

export const createPeerConnection = (
  localUserId: string,
  remoteUserId: string,
  localStream: MediaStream | null,
  onIceCandidate: (candidate: RTCIceCandidate, targetUserId: string) => void,
  onTrack: (event: RTCTrackEvent, remoteUserId: string) => void
): RTCPeerConnection => {
  const pc = new RTCPeerConnection(getRTCPeerConnectionConfig());

  if (localStream) {
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });
  }

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate, remoteUserId);
    }
  };

  pc.ontrack = (event) => {
    onTrack(event, remoteUserId);
  };

  pc.onconnectionstatechange = () => {
    console.log(`Connection state with ${remoteUserId}:`, pc.connectionState);
  };

  pc.oniceconnectionstatechange = () => {
    console.log(`ICE state with ${remoteUserId}:`, pc.iceConnectionState);
  };

  return pc;
};

export const createOffer = async (
  pc: RTCPeerConnection
): Promise<RTCSessionDescriptionInit> => {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return offer;
};

export const createAnswer = async (
  pc: RTCPeerConnection,
  remoteDescription: RTCSessionDescriptionInit
): Promise<RTCSessionDescriptionInit> => {
  await pc.setRemoteDescription(new RTCSessionDescription(remoteDescription));

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
};

export const addIceCandidate = async (
  pc: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> => {
  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error('Error adding ICE candidate:', error);
  }
};

export const replaceTrack = async (
  pc: RTCPeerConnection,
  newStream: MediaStream
): Promise<void> => {
  const senders = pc.getSenders();

  for (const sender of senders) {
    if (!sender.track) continue;

    const newTrack = newStream
      .getTracks()
      .find(t => t.kind === sender.track!.kind);

    if (newTrack && sender.track !== newTrack) {
      await sender.replaceTrack(newTrack);
    }
  }
};
