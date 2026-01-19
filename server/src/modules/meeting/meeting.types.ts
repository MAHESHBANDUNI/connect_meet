export interface User {
    userId: string;
    email: string;
}

export type MeetingParticipantRole =
  | "HOST"
  | "CO_HOST"
  | "PARTICIPANT";