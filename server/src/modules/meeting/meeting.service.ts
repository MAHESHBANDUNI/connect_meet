import { CreateMeetingInput } from "./meeting.validation";
import { ConflictError, NotFoundError } from "../../utils/errorHandler";
import type {User, MeetingParticipantRole, MeetingDetails} from "./meeting.types";
import { MeetingRepository } from "./meeting.repository";
import { sendMeetingInvite } from "../../utils/emailHandler";

export function generateMeetingCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const parts: string[] = [];
  
  // Generate 4 parts of 4 characters each
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
    constructor(private readonly repo = new MeetingRepository()) {}

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
                participantRole: "PARTICIPANT"
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

    async getMeetingById(id: string) {
        const meeting = await this.repo.getMeetingById(id);
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
        const checkHost = await this.repo.checkMeetingHost(meetingId, user);
        if (!checkHost) {
            throw new ConflictError("User is not the host of the meeting");
        }
        const updatedMeeting = await this.repo.updateMeetingStatus(meetingId, status);
        await this.repo.updateMeetingParticipantStatus(meetingId, user, "JOINED");
        return updatedMeeting;
    }

    async endMeeting(meetingId: string, user: User) {
        const meeting = await this.getMeetingById(meetingId);
        if (meeting.status !== 'LIVE') {
            throw new ConflictError("Meeting is not live");
        }
        const status = 'ENDED';
        const endTime = new Date();
        const checkHost = await this.repo.checkMeetingHost(meetingId, user);
        if (!checkHost) {
            throw new ConflictError("User is not the host of the meeting");
        }
        const updatedMeeting = await this.repo.updateMeetingStatus(meetingId, status, endTime);
        await this.repo.updateMeetingParticipantStatus(meetingId, user, "JOINED");
        return updatedMeeting;
    }

    async joinMeeting(meetingId: string, user: User) {
        const meeting = await this.getMeetingById(meetingId);
        if (meeting.status !== 'LIVE') {
            throw new ConflictError("Meeting is not live");
        }
        const joinAt = new Date();
        const status = "JOINED";
        await this.repo.checkMeetingParticipant(meetingId, user);
        await this.repo.updateMeetingParticipantStatus(meetingId, user, status, joinAt);
        return meeting;
    }

    async exitMeeting(meetingId: string, user: User) {
        const meeting = await this.getMeetingById(meetingId);
        if (meeting.status !== 'LIVE') {
            throw new ConflictError("Meeting is not live");
        }
        const leftAt = new Date();
        const status = "LEFT";
        await this.repo.checkMeetingParticipant(meetingId, user);
        await this.repo.updateMeetingParticipantStatus(meetingId, user, status, leftAt);
        return meeting;
    }

    async getUserMeetings(user: User) {
        const meetings = await this.repo.getMeetingsByUser(user.userId);
        return meetings;
    }
}