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

export const createPeerConnection = (
  userId: string,
  remoteUserId: string,
  onIceCandidate: (candidate: RTCIceCandidate, targetUserId: string) => void,
  onTrack: (event: RTCTrackEvent, remoteUserId: string) => void
): RTCPeerConnection => {
  const pc = new RTCPeerConnection(getRTCPeerConnectionConfig());

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
  pc: RTCPeerConnection,
  localStream: MediaStream
): Promise<RTCSessionDescriptionInit> => {
  localStream.getTracks().forEach(track => {
    if (localStream) {
      pc.addTrack(track, localStream);
    }
  });

  const offer = await pc.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  });

  await pc.setLocalDescription(offer);
  return offer;
};

export const createAnswer = async (
  pc: RTCPeerConnection,
  localStream: MediaStream,
  remoteDescription: RTCSessionDescriptionInit
): Promise<RTCSessionDescriptionInit> => {
  await pc.setRemoteDescription(new RTCSessionDescription(remoteDescription));

  localStream.getTracks().forEach(track => {
    if (localStream) {
      pc.addTrack(track, localStream);
    }
  });

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
  const tracks = newStream.getTracks();

  for (const track of tracks) {
    const sender = senders.find((s) => s.track?.kind === track.kind);
    if (sender) {
      console.log(`Replacing ${track.kind} track`);
      await sender.replaceTrack(track);
    } else {
      console.log(`Adding new ${track.kind} track`);
      pc.addTrack(track, newStream);
    }
  }
};