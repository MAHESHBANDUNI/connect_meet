import { CreateMeetingInput } from "./meeting.validation.js";
import type { MeetingParticipantRole } from "./meeting.types";
export declare class MeetingRepository {
    createMeeting(data: CreateMeetingInput, meetingCode: string, user: {
        userId: string;
    }): Promise<{
        createdAt: Date;
        updatedAt: Date;
        meetingId: string;
        meetingCode: string;
        topic: string;
        description: string | null;
        startTime: Date;
        endTime: Date | null;
        status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
    }>;
    getMeetingById(meetingId: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        meetingId: string;
        meetingCode: string;
        topic: string;
        description: string | null;
        startTime: Date;
        endTime: Date | null;
        status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
    } | undefined>;
    mapParticipantsWithUserId(participantList: string[]): Promise<Record<string, string | null>>;
    addMeetingParticipant(meetingId: string, addedBy: string, participantMap: Record<string, {
        userId: string | null;
        participantRole: MeetingParticipantRole;
    }>): Promise<boolean>;
    checkMeetingHost(meetingId: string, user: {
        userId: string;
    }): Promise<{
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        email: string;
        meetingId: string;
        participantId: string;
        participantRole: "HOST" | "CO_HOST" | "PRESENTER" | "PARTICIPANT" | "GUEST";
        participantStatus: "INVITED" | "WAITING" | "JOINED" | "LEFT" | "REMOVED" | "REJECTED";
        hasJoined: boolean;
        joinedAt: Date | null;
        leftAt: Date | null;
    } | undefined>;
    updateMeetingStatus(meetingId: string, status: "LIVE" | "ENDED", endTime?: Date): Promise<{
        createdAt: Date;
        updatedAt: Date;
        meetingId: string;
        meetingCode: string;
        topic: string;
        description: string | null;
        startTime: Date;
        endTime: Date | null;
        status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
    } | undefined>;
    checkMeetingParticipant(meetingId: string, user: {
        userId: string;
    }): Promise<{
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        email: string;
        meetingId: string;
        participantId: string;
        participantRole: "HOST" | "CO_HOST" | "PRESENTER" | "PARTICIPANT" | "GUEST";
        participantStatus: "INVITED" | "WAITING" | "JOINED" | "LEFT" | "REMOVED" | "REJECTED";
        hasJoined: boolean;
        joinedAt: Date | null;
        leftAt: Date | null;
    } | undefined>;
    updateMeetingParticipantStatus(meetingId: string, user: {
        userId: string;
    }, status: "JOINED" | "WAITING" | "LEFT", joinedAt?: Date, leftAt?: Date): Promise<void>;
    getMeetingsByUser(userId: string): Promise<{
        participantCount: number;
        userRole: "HOST" | "CO_HOST" | "PRESENTER" | "PARTICIPANT" | "GUEST";
        participants: {
            email: string;
            participantId: string;
            participantRole: "HOST" | "CO_HOST" | "PRESENTER" | "PARTICIPANT" | "GUEST";
            participantStatus: "INVITED" | "WAITING" | "JOINED" | "LEFT" | "REMOVED" | "REJECTED";
        }[];
        createdAt: Date;
        updatedAt: Date;
        meetingId: string;
        meetingCode: string;
        topic: string;
        description: string | null;
        startTime: Date;
        endTime: Date | null;
        status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
    }[]>;
}
//# sourceMappingURL=meeting.repository.d.ts.map