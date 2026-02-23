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
    getMeetingByCode(meetingCode: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        meetingId: string;
        meetingCode: string;
        topic: string;
        description: string | null;
        startTime: Date;
        endTime: Date | null;
        status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
        participants: {
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
        }[];
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
        participants: {
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
        }[];
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
        participants: {
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
        }[];
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
        participants: {
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
        }[];
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
        participants: {
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
        }[];
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
        participants: {
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
        }[];
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