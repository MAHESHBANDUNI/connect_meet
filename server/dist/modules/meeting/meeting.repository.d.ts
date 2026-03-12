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
        directJoinPermission: boolean;
        mutePermission: boolean;
        screenSharePermission: boolean;
        dropPermission: boolean;
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
        directJoinPermission: boolean;
        mutePermission: boolean;
        screenSharePermission: boolean;
        dropPermission: boolean;
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
            user: {
                roleId: number;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                firstName: string;
                lastName: string;
                email: string;
                password: string | null;
                googleId: string | null;
                authProvider: string;
                isEmailVerified: boolean;
            } | null;
        }[];
    } | undefined>;
    getMeetingByCode(meetingId: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        meetingId: string;
        meetingCode: string;
        topic: string;
        description: string | null;
        startTime: Date;
        endTime: Date | null;
        status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
        directJoinPermission: boolean;
        mutePermission: boolean;
        screenSharePermission: boolean;
        dropPermission: boolean;
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
            user: {
                roleId: number;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                firstName: string;
                lastName: string;
                email: string;
                password: string | null;
                googleId: string | null;
                authProvider: string;
                isEmailVerified: boolean;
            } | null;
        }[];
    } | undefined>;
    mapParticipantsWithUserDetails(participantList: string[]): Promise<Record<string, {
        userId: string;
        firstName: string;
        lastName: string;
    }[]>>;
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
    updateMeetingStatus(meetingId: string, status: "LIVE" | "ENDED" | "CANCELLED", endTime?: Date): Promise<{
        createdAt: Date;
        updatedAt: Date;
        meetingId: string;
        meetingCode: string;
        topic: string;
        description: string | null;
        startTime: Date;
        endTime: Date | null;
        status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
        directJoinPermission: boolean;
        mutePermission: boolean;
        screenSharePermission: boolean;
        dropPermission: boolean;
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
            user: {
                roleId: number;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                firstName: string;
                lastName: string;
                email: string;
                password: string | null;
                googleId: string | null;
                authProvider: string;
                isEmailVerified: boolean;
            } | null;
        }[];
    } | undefined>;
    checkMeetingParticipant(meetingId: string, user: {
        userId: string;
    }, hasDirectJoinPermission: boolean): Promise<{
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
    }, status: "JOINED" | "WAITING" | "LEFT" | "REJECTED", joinedAt?: Date, leftAt?: Date): Promise<void>;
    getMeetingsByUser(userId: string): Promise<{
        participantCount: number;
        userRole: "HOST" | "CO_HOST" | "PRESENTER" | "PARTICIPANT" | "GUEST";
        participants: {
            email: string;
            participantId: string;
            participantRole: "HOST" | "CO_HOST" | "PRESENTER" | "PARTICIPANT" | "GUEST";
            participantStatus: "INVITED" | "WAITING" | "JOINED" | "LEFT" | "REMOVED" | "REJECTED";
            user: {
                firstName: string;
                lastName: string;
            } | null;
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
        directJoinPermission: boolean;
        mutePermission: boolean;
        screenSharePermission: boolean;
        dropPermission: boolean;
    }[]>;
    updateMeetingDetails(meetingId: string, updateMeetingDetails: CreateMeetingInput): Promise<void>;
    replaceMeetingParticipants(meetingId: string, participantMap: Record<string, {
        userId: string | null;
        participantRole: MeetingParticipantRole;
    }>): Promise<void>;
    checkMeetingJoinedParticipants(meetingId: string, userId: string): Promise<{
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
    promoteMeetingParticipant(meetingId: string, userId: string, role: "CO_HOST" | "HOST"): Promise<boolean>;
}
//# sourceMappingURL=meeting.repository.d.ts.map