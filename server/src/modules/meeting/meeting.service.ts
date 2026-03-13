import { CreateMeetingInput, UpdateMeetingInput } from "./meeting.validation";
import { ConflictError, NotFoundError } from "../../utils/errorHandler";
import type { User, MeetingParticipantRole, MeetingDetails } from "./meeting.types";
import { MeetingRepository } from "./meeting.repository";
import { sendMeetingInvite } from "../../utils/emailHandler";
import { fa } from "zod/v4/locales";

export function generateMeetingCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const parts: string[] = [];

    for (let i = 0; i < 4; i++) {
        let part = '';
        for (let j = 0; j < 4; j++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            part += chars[randomIndex];
        }
        parts.push(part);
    }

    return parts.join('-');
}

export class MeetingService {
    constructor(private readonly repo = new MeetingRepository()) { }

    async createMeeting(data: CreateMeetingInput, user: User) {
        const meetingCode = generateMeetingCode();

        const meeting = await this.repo.createMeeting(
            data,
            meetingCode,
            user
        );

        const participantEmails = data?.invitees ?? [];
        const cohostEmails = data?.cohosts ?? [];

        const allEmails = Array.from(
            new Set([user?.email, ...participantEmails, ...cohostEmails])
        );

        const userMap = await this.repo.mapParticipantsWithUserDetails(allEmails);

        const meetingParticipants: Record<
            string,
            { userId: string | null; firstName: string | null; lastName: string | null; participantRole: MeetingParticipantRole }
        > = {};

        meetingParticipants[user.email] = {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            participantRole: "HOST",
        };

        for (const email of participantEmails) {
            meetingParticipants[email] = {
                userId: userMap[email][0]?.userId ?? null,
                firstName: userMap[email][0]?.firstName ?? null,
                lastName: userMap[email][0]?.lastName ?? null,
                participantRole: "PARTICIPANT"
            };
        }

        for (const email of cohostEmails) {
            meetingParticipants[email] = {
                userId: userMap[email][0]?.userId ?? null,
                firstName: userMap[email][0]?.firstName ?? null,
                lastName: userMap[email][0]?.lastName ?? null,
                participantRole: "CO_HOST"
            };
        }

        await this.repo.addMeetingParticipant(
            meeting.meetingId,
            user.userId,
            meetingParticipants
        );

        const meetingDetails = {
            topic: meeting.topic,
            description: meeting.description,
            startTime: meeting.startTime,
            meetingLink: `${process.env.CLIENT_URL}/meeting/${meetingCode}`,
        };

        await Promise.allSettled(
            Object.entries(meetingParticipants).map(([email, participant]) => {
                if (!email) return;

                return sendMeetingInvite(
                    {
                        email,
                        firstName: participant.firstName ?? "Guest",
                        lastName: participant.lastName ?? "",
                    },
                    meetingDetails as MeetingDetails
                );
            })
        );
        return meeting;
    }

    async getMeetingByCode(meetingCode: string) {
        const meeting = await this.repo.getMeetingByCode(meetingCode);
        if (!meeting) {
            throw new NotFoundError("Meeting not found");
        }
        return meeting;
    }

    async getMeetingById(meetingId: string) {
        const meeting = await this.repo.getMeetingById(meetingId);
        if (!meeting) {
            throw new NotFoundError("Meeting not found");
        }
        return meeting;
    }

    async startMeeting(meetingId: string, user: User) {
        const meeting = await this.getMeetingById(meetingId);
        if (meeting.status !== 'SCHEDULED') {
            throw new ConflictError("Meeting is not scheduled");
        }
        const status = 'LIVE';
        const checkHost = await this.repo.checkMeetingHost(meetingId, user, true);
        if (!checkHost) {
            throw new ConflictError("User is not the host of the meeting");
        }
        const updatedMeeting = await this.repo.updateMeetingStatus(meetingId, status);
        const joinedAt = new Date();
        const newStatus = "JOINED";
        await this.repo.updateMeetingParticipantStatus(meetingId, user, newStatus, joinedAt);
        return updatedMeeting;
    }

    async endMeeting(meetingId: string, user: User) {
        const meeting = await this.getMeetingById(meetingId);
        if (meeting.status !== 'LIVE') {
            throw new ConflictError("Meeting is not live");
        }
        const status = 'ENDED';
        const endTime = new Date();
        const checkHost = await this.repo.checkMeetingHost(meetingId, user, true);
        if (!checkHost) {
            throw new ConflictError("User is not the host of the meeting");
        }
        const updatedMeeting = await this.repo.updateMeetingStatus(meetingId, status, endTime);
        await this.repo.updateMeetingParticipantStatus(meetingId, user, "JOINED");
        return updatedMeeting;
    }

    async joinMeeting(meetingId: string, user: User) {
        let meeting = await this.getMeetingById(meetingId);
        if (meeting.status !== 'LIVE') {
            throw new ConflictError("Meeting is not live");
        }

        const participant =
            await this.repo.checkMeetingParticipant(
                meetingId,
                user,
                meeting?.directJoinPermission ?? false
            ) || await this.repo.checkMeetingHost(meetingId, user, false);

        if (!participant) {
            throw new NotFoundError("Participant not found");
        }

        const joinAt = new Date();
        const isHost=
            participant.participantRole === 'HOST';
        const status = isHost ? "JOINED" : "WAITING";

        await this.repo.updateMeetingParticipantStatus(meetingId, user, status, joinAt);
        meeting = await this.getMeetingById(meetingId);
        return { ...meeting };
    }

    async admitParticipant(meetingId: string, hostUserId: string, targetUserId: string) {
        const meeting = await this.getMeetingById(meetingId);
        const checkHost = await this.repo.checkMeetingHost(meetingId, { userId: hostUserId }, false);
        if (!checkHost) {
            throw new ConflictError("User is not the host of the meeting");
        }

        await this.repo.updateMeetingParticipantStatus(meetingId, { userId: targetUserId }, "JOINED", new Date());
        return { success: true };
    }

    async rejectParticipant(meetingId: string, hostUserId: string, targetUserId: string) {
        const meeting = await this.getMeetingById(meetingId);
        const checkHost = await this.repo.checkMeetingHost(meetingId, { userId: hostUserId }, false);
        if (!checkHost) {
            throw new ConflictError("User is not the host of the meeting");
        }

        await this.repo.updateMeetingParticipantStatus(meetingId, { userId: targetUserId }, "REJECTED");
        return { success: true };
    }

    async exitMeeting(meetingId: string, user: User) {
        const meeting = await this.getMeetingById(meetingId);
        if (meeting.status !== 'LIVE') {
            throw new ConflictError("Meeting is not live");
        }
        const leftAt = new Date();
        const status = "LEFT";
        await this.repo.checkMeetingParticipant(meetingId, user, false);
        await this.repo.updateMeetingParticipantStatus(meetingId, user, status, leftAt);
        return meeting;
    }

    async getUserMeetings(user: User) {
        const meetings = await this.repo.getMeetingsByUser(user.userId);
        return meetings;
    }

    async cancelMeeting(meetingId: string, hostUserId: string) {
        const meeting = await this.getMeetingById(meetingId);
        const checkHost = await this.repo.checkMeetingHost(meetingId, { userId: hostUserId }, true);
        if (!checkHost) {
            throw new ConflictError("User is not the host of the meeting");
        }
        await this.repo.updateMeetingStatus(meetingId, "CANCELLED");
        await this.repo.updateMeetingParticipantStatus(meetingId, { userId: hostUserId }, "REJECTED");
        return { success: true };
    }

    async updateMeeting(meetingId: string, hostUserId: string, updateMeetingDetails: UpdateMeetingInput) {
        const meeting = await this.getMeetingById(meetingId);
        const checkHost = await this.repo.checkMeetingHost(meetingId, { userId: hostUserId }, true);
        if (!checkHost) {
            throw new ConflictError("User is not the host of the meeting");
        }

        await this.repo.updateMeetingDetails(meetingId, updateMeetingDetails);

        const hostEmails = new Set(
            (meeting.participants ?? [])
                .filter((participant: any) => participant.participantRole === "HOST")
                .map((participant: any) => (participant.email || "").trim().toLowerCase())
                .filter(Boolean)
        );

        const cohostSet = new Set(
            (updateMeetingDetails.cohosts ?? [])
                .map((email) => email.trim().toLowerCase())
                .filter((email) => email && !hostEmails.has(email))
        );

        const inviteeSet = new Set(
            (updateMeetingDetails.invitees ?? [])
                .map((email) => email.trim().toLowerCase())
                .filter((email) => email && !hostEmails.has(email))
        );

        for (const email of cohostSet) {
            inviteeSet.delete(email);
        }

        const allEmails = Array.from(new Set([...inviteeSet, ...cohostSet]));
        const userMap = await this.repo.mapParticipantsWithUserDetails(allEmails);

        const participantMap: Record<
            string,
            { userId: string | null; participantRole: MeetingParticipantRole }
        > = {};

        for (const email of inviteeSet) {
            participantMap[email] = {
                userId: userMap[email][0]?.userId ?? null,
                participantRole: "PARTICIPANT",
            };
        }

        for (const email of cohostSet) {
            participantMap[email] = {
                userId: userMap[email][0]?.userId ?? null,
                participantRole: "CO_HOST",
            };
        }

        await this.repo.replaceMeetingParticipants(meetingId, participantMap);
        return { success: true };
    }

    async sendMeetingInvite(hostUserId: string, meetingId: string, emails: string[]) {
        const meeting = await this.getMeetingById(meetingId);
        const checkHost = await this.repo.checkMeetingHost(meetingId, { userId: hostUserId }, false);
        if (!checkHost) {
            throw new ConflictError("User is not the host of the meeting");
        }
        const userMap = await this.repo.mapParticipantsWithUserDetails(emails);
        const meetingParticipants: Record<
            string,
            { userId: string | null; firstName: string | null; lastName: string | null; participantRole: MeetingParticipantRole }
        > = {};


        for (const email of emails) {
            meetingParticipants[email] = {
                userId: userMap[email][0]?.userId ?? null,
                firstName: userMap[email][0]?.firstName ?? null,
                lastName: userMap[email][0]?.lastName ?? null,
                participantRole: "PARTICIPANT"
            };
        }

        await this.repo.addMeetingParticipant(
            meeting.meetingId,
            hostUserId,
            meetingParticipants
        );

        const meetingDetails = {
            topic: meeting.topic,
            description: meeting.description,
            startTime: meeting.startTime,
            meetingLink: `${process.env.CLIENT_URL}/meeting/${meeting.meetingCode}`,
        };

        await Promise.allSettled(
            Object.entries(meetingParticipants).map(([email, participant]) => {
                if (!email) return;

                return sendMeetingInvite(
                    {
                        email,
                        firstName: participant.firstName ?? "Guest",
                        lastName: participant.lastName ?? "",
                    },
                    meetingDetails as MeetingDetails
                );
            })
        );
        return meeting;
    }

    async changeMeetingParticipantRole(
        hostUserId: string,
        meetingId: string,
        targetUserId: string
    ) {
        const meeting = await this.getMeetingById(meetingId);

        const isHost = await this.repo.checkMeetingHost(meetingId, {
            userId: hostUserId
        }, true
        );

        if (!isHost) {
            throw new ConflictError("Only host can demote participants");
        }

        const participant = await this.repo.checkMeetingJoinedParticipants(
            meetingId,
            targetUserId
        );

        if (!participant) {
            throw new ConflictError("User is not a participant in this meeting");
        }

        let newRole: "CO_HOST" | "PARTICIPANT";

        if (participant.participantRole === "PARTICIPANT") {
            newRole = "CO_HOST";
        } 
        else if (participant.participantRole === "CO_HOST") {
            newRole = "PARTICIPANT";
        } else {
            throw new ConflictError("User is already HOST/CO_HOST");
        }

        await this.repo.changeMeetingParticipantRole(meetingId, targetUserId, newRole);

        return {
            meetingId,
            userId: targetUserId,
            newRole,
        };
    }
}
