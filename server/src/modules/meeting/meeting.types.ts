export interface User {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
}

export type MeetingParticipantRole =
  | "HOST"
  | "CO_HOST"
  | "PARTICIPANT";

export interface MeetingDetails {
  topic: string;
  description: string;
  startTime: Date;
  meetingLink: string;
}