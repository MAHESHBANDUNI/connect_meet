import { CreateMeetingInput } from "./meeting.validation";
import type { User } from "./meeting.types";
import { MeetingRepository } from "./meeting.repository";
export declare function generateMeetingCode(): string;
export declare class MeetingService {
    private readonly repo;
    constructor(repo?: MeetingRepository);
    createMeeting(data: CreateMeetingInput, user: User): Promise<{
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
    getMeetingById(id: string): Promise<{
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
    startMeeting(meetingId: string, user: User): Promise<{
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
    endMeeting(meetingId: string, user: User): Promise<{
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
    joinMeeting(meetingId: string, user: User): Promise<{
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
    exitMeeting(meetingId: string, user: User): Promise<{
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
    getUserMeetings(user: User): Promise<{
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
//# sourceMappingURL=meeting.service.d.ts.map