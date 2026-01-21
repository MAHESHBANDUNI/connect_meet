"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingService = void 0;
exports.generateMeetingCode = generateMeetingCode;
const errorHandler_1 = require("../../utils/errorHandler");
const meeting_repository_1 = require("./meeting.repository");
const emailHandler_1 = require("../../utils/emailHandler");
function generateMeetingCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const parts = [];
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
class MeetingService {
    constructor(repo = new meeting_repository_1.MeetingRepository()) {
        this.repo = repo;
    }
    async createMeeting(data, user) {
        const meetingCode = generateMeetingCode();
        const meeting = await this.repo.createMeeting(data, meetingCode, user);
        const participantEmails = data?.invitees ?? [];
        const cohostEmails = data?.cohosts ?? [];
        const allEmails = Array.from(new Set([user?.email, ...participantEmails, ...cohostEmails]));
        const userMap = await this.repo.mapParticipantsWithUserDetails(allEmails);
        const meetingParticipants = {};
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
        await this.repo.addMeetingParticipant(meeting.meetingId, user.userId, meetingParticipants);
        const meetingDetails = {
            topic: meeting.topic,
            description: meeting.description,
            startTime: meeting.startTime,
            meetingLink: `${process.env.CLIENT_URL}/meeting/${meetingCode}`,
        };
        await Promise.allSettled(Object.entries(meetingParticipants).map(([email, participant]) => {
            if (!email)
                return;
            return (0, emailHandler_1.sendMeetingInvite)({
                email,
                firstName: participant.firstName ?? "Guest",
                lastName: participant.lastName ?? "",
            }, meetingDetails);
        }));
        return meeting;
    }
    async getMeetingById(id) {
        const meeting = await this.repo.getMeetingById(id);
        if (!meeting) {
            throw new errorHandler_1.NotFoundError("Meeting not found");
        }
        return meeting;
    }
    async startMeeting(meetingId, user) {
        const meeting = await this.getMeetingById(meetingId);
        if (meeting.status !== 'SCHEDULED') {
            throw new errorHandler_1.ConflictError("Meeting is not scheduled");
        }
        const status = 'LIVE';
        const checkHost = await this.repo.checkMeetingHost(meetingId, user);
        if (!checkHost) {
            throw new errorHandler_1.ConflictError("User is not the host of the meeting");
        }
        const updatedMeeting = await this.repo.updateMeetingStatus(meetingId, status);
        await this.repo.updateMeetingParticipantStatus(meetingId, user, "JOINED");
        return updatedMeeting;
    }
    async endMeeting(meetingId, user) {
        const meeting = await this.getMeetingById(meetingId);
        if (meeting.status !== 'LIVE') {
            throw new errorHandler_1.ConflictError("Meeting is not live");
        }
        const status = 'ENDED';
        const endTime = new Date();
        const checkHost = await this.repo.checkMeetingHost(meetingId, user);
        if (!checkHost) {
            throw new errorHandler_1.ConflictError("User is not the host of the meeting");
        }
        const updatedMeeting = await this.repo.updateMeetingStatus(meetingId, status, endTime);
        await this.repo.updateMeetingParticipantStatus(meetingId, user, "JOINED");
        return updatedMeeting;
    }
    async joinMeeting(meetingId, user) {
        const meeting = await this.getMeetingById(meetingId);
        if (meeting.status !== 'LIVE') {
            throw new errorHandler_1.ConflictError("Meeting is not live");
        }
        const joinAt = new Date();
        const status = "JOINED";
        await this.repo.checkMeetingParticipant(meetingId, user);
        await this.repo.updateMeetingParticipantStatus(meetingId, user, status, joinAt);
        return meeting;
    }
    async exitMeeting(meetingId, user) {
        const meeting = await this.getMeetingById(meetingId);
        if (meeting.status !== 'LIVE') {
            throw new errorHandler_1.ConflictError("Meeting is not live");
        }
        const leftAt = new Date();
        const status = "LEFT";
        await this.repo.checkMeetingParticipant(meetingId, user);
        await this.repo.updateMeetingParticipantStatus(meetingId, user, status, leftAt);
        return meeting;
    }
    async getUserMeetings(user) {
        const meetings = await this.repo.getMeetingsByUser(user.userId);
        return meetings;
    }
}
exports.MeetingService = MeetingService;
//# sourceMappingURL=meeting.service.js.map