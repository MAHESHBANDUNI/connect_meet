export interface User {
  id: string;
  name?: string;
  stream?: MediaStream;
  isAudioMuted: boolean;
  isVideoOff: boolean;
}

export interface Message {
  id: string;
  userId: string;
  userName?: string;
  content: string;
  timestamp: Date;
  isLocal: boolean;
}

export interface RoomState {
  roomId: string;
  userId: string;
  users: Map<string, User>;
  messages: Message[];
  isConnected: boolean;
  isCallActive: boolean;
}

export interface SignalData {
  to: string;
  from: string;
  signal: any;
}

export interface UserAction {
  userId: string;
  action: 'toggle-audio' | 'toggle-video' | 'toggle-screen-share';
  value: boolean;
}