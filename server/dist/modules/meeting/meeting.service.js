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
                participantRole: "CO_HOST"
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
    async getMeetingByCode(meetingCode) {
        const meeting = await this.repo.getMeetingByCode(meetingCode);
        if (!meeting) {
            throw new errorHandler_1.NotFoundError("Meeting not found");
        }
        return meeting;
    }
    async getMeetingById(meetingId) {
        const meeting = await this.repo.getMeetingById(meetingId);
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
        const checkHost = await this.repo.checkMeetingHost(meetingId, user, true);
        if (!checkHost) {
            throw new errorHandler_1.ConflictError("User is not the host of the meeting");
        }
        const updatedMeeting = await this.repo.updateMeetingStatus(meetingId, status);
        const joinedAt = new Date();
        const newStatus = "JOINED";
        await this.repo.updateMeetingParticipantStatus(meetingId, user, newStatus, joinedAt);
        return updatedMeeting;
    }
    async endMeeting(meetingId, user) {
        const meeting = await this.getMeetingById(meetingId);
        if (meeting.status !== 'LIVE') {
            throw new errorHandler_1.ConflictError("Meeting is not live");
        }
        const status = 'ENDED';
        const endTime = new Date();
        const checkHost = await this.repo.checkMeetingHost(meetingId, user, true);
        if (!checkHost) {
            throw new errorHandler_1.ConflictError("User is not the host of the meeting");
        }
        const updatedMeeting = await this.repo.updateMeetingStatus(meetingId, status, endTime);
        await this.repo.updateMeetingParticipantStatus(meetingId, user, "JOINED");
        return updatedMeeting;
    }
    async joinMeeting(meetingId, user) {
        let meeting = await this.getMeetingById(meetingId);
        if (meeting.status !== 'LIVE') {
            throw new errorHandler_1.ConflictError("Meeting is not live");
        }
        const participant = await this.repo.checkMeetingParticipant(meetingId, user, meeting?.directJoinPermission ?? false) || await this.repo.checkMeetingHost(meetingId, user, false);
        if (!participant) {
            throw new errorHandler_1.NotFoundError("Participant not found");
        }
        const joinAt = new Date();
        const isHost = participant.participantRole === 'HOST';
        const status = isHost ? "JOINED" : "WAITING";
        await this.repo.updateMeetingParticipantStatus(meetingId, user, status, joinAt);
        meeting = await this.getMeetingById(meetingId);
        return { ...meeting };
    }
    async admitParticipant(meetingId, hostUserId, targetUserId) {
        const meeting = await this.getMeetingById(meetingId);
        const checkHost = await this.repo.checkMeetingHost(meetingId, { userId: hostUserId }, false);
        if (!checkHost) {
            throw new errorHandler_1.ConflictError("User is not the host of the meeting");
        }
        await this.repo.updateMeetingParticipantStatus(meetingId, { userId: targetUserId }, "JOINED", new Date());
        return { success: true };
    }
    async rejectParticipant(meetingId, hostUserId, targetUserId) {
        const meeting = await this.getMeetingById(meetingId);
        const checkHost = await this.repo.checkMeetingHost(meetingId, { userId: hostUserId }, false);
        if (!checkHost) {
            throw new errorHandler_1.ConflictError("User is not the host of the meeting");
        }
        await this.repo.updateMeetingParticipantStatus(meetingId, { userId: targetUserId }, "REJECTED");
        return { success: true };
    }
    async exitMeeting(meetingId, user) {
        const meeting = await this.getMeetingById(meetingId);
        if (meeting.status !== 'LIVE') {
            throw new errorHandler_1.ConflictError("Meeting is not live");
        }
        const leftAt = new Date();
        const status = "LEFT";
        await this.repo.checkMeetingParticipant(meetingId, user, false);
        await this.repo.updateMeetingParticipantStatus(meetingId, user, status, leftAt);
        return meeting;
    }
    async getUserMeetings(user) {
        const meetings = await this.repo.getMeetingsByUser(user.userId);
        return meetings;
    }
    async cancelMeeting(meetingId, hostUserId) {
        const meeting = await this.getMeetingById(meetingId);
        const checkHost = await this.repo.checkMeetingHost(meetingId, { userId: hostUserId }, true);
        if (!checkHost) {
            throw new errorHandler_1.ConflictError("User is not the host of the meeting");
        }
        await this.repo.updateMeetingStatus(meetingId, "CANCELLED");
        await this.repo.updateMeetingParticipantStatus(meetingId, { userId: hostUserId }, "REJECTED");
        return { success: true };
    }
    async updateMeeting(meetingId, hostUserId, updateMeetingDetails) {
        const meeting = await this.getMeetingById(meetingId);
        const checkHost = await this.repo.checkMeetingHost(meetingId, { userId: hostUserId }, true);
        if (!checkHost) {
            throw new errorHandler_1.ConflictError("User is not the host of the meeting");
        }
        await this.repo.updateMeetingDetails(meetingId, updateMeetingDetails);
        const hostEmails = new Set((meeting.participants ?? [])
            .filter((participant) => participant.participantRole === "HOST")
            .map((participant) => (participant.email || "").trim().toLowerCase())
            .filter(Boolean));
        const cohostSet = new Set((updateMeetingDetails.cohosts ?? [])
            .map((email) => email.trim().toLowerCase())
            .filter((email) => email && !hostEmails.has(email)));
        const inviteeSet = new Set((updateMeetingDetails.invitees ?? [])
            .map((email) => email.trim().toLowerCase())
            .filter((email) => email && !hostEmails.has(email)));
        for (const email of cohostSet) {
            inviteeSet.delete(email);
        }
        const allEmails = Array.from(new Set([...inviteeSet, ...cohostSet]));
        const userMap = await this.repo.mapParticipantsWithUserDetails(allEmails);
        const participantMap = {};
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
    async sendMeetingInvite(hostUserId, meetingId, emails) {
        const meeting = await this.getMeetingById(meetingId);
        const checkHost = await this.repo.checkMeetingHost(meetingId, { userId: hostUserId }, false);
        if (!checkHost) {
            throw new errorHandler_1.ConflictError("User is not the host of the meeting");
        }
        const userMap = await this.repo.mapParticipantsWithUserDetails(emails);
        const meetingParticipants = {};
        for (const email of emails) {
            meetingParticipants[email] = {
                userId: userMap[email][0]?.userId ?? null,
                firstName: userMap[email][0]?.firstName ?? null,
                lastName: userMap[email][0]?.lastName ?? null,
                participantRole: "PARTICIPANT"
            };
        }
        await this.repo.addMeetingParticipant(meeting.meetingId, hostUserId, meetingParticipants);
        const meetingDetails = {
            topic: meeting.topic,
            description: meeting.description,
            startTime: meeting.startTime,
            meetingLink: `${process.env.CLIENT_URL}/meeting/${meeting.meetingCode}`,
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
    async changeMeetingParticipantRole(hostUserId, meetingId, targetUserId) {
        const meeting = await this.getMeetingById(meetingId);
        const isHost = await this.repo.checkMeetingHost(meetingId, {
            userId: hostUserId
        }, true);
        if (!isHost) {
            throw new errorHandler_1.ConflictError("Only host can demote participants");
        }
        const participant = await this.repo.checkMeetingJoinedParticipants(meetingId, targetUserId);
        if (!participant) {
            throw new errorHandler_1.ConflictError("User is not a participant in this meeting");
        }
        let newRole;
        if (participant.participantRole === "PARTICIPANT") {
            newRole = "CO_HOST";
        }
        else if (participant.participantRole === "CO_HOST") {
            newRole = "PARTICIPANT";
        }
        else {
            throw new errorHandler_1.ConflictError("User is already HOST/CO_HOST");
        }
        await this.repo.changeMeetingParticipantRole(meetingId, targetUserId, newRole);
        return {
            meetingId,
            userId: targetUserId,
            newRole,
        };
    }
}
exports.MeetingService = MeetingService;
//# sourceMappingURL=meeting.service.js.map