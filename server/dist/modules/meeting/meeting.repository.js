"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingRepository = void 0;
const index_js_1 = require("../../drizzle/index.js");
const schema_js_1 = require("../../drizzle/schema.js");
const drizzle_orm_1 = require("drizzle-orm");
class MeetingRepository {
    async createMeeting(data, meetingCode, user) {
        const [meeting] = await index_js_1.db
            .insert(schema_js_1.meetings)
            .values([
            {
                topic: data.topic,
                description: data.description,
                startTime: new Date(data.startTime),
                meetingCode,
                status: 'SCHEDULED'
            }
        ])
            .returning();
        return meeting;
    }
    async getMeetingById(meetingId) {
        return index_js_1.db.query.meetings.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_js_1.meetings.meetingId, meetingId)
        });
    }
    async mapParticipantsWithUserDetails(participantList) {
        const userRecords = await index_js_1.db
            .select({
            email: schema_js_1.users.email,
            userId: schema_js_1.users.userId,
            firstName: schema_js_1.users.firstName,
            lastName: schema_js_1.users.lastName,
        })
            .from(schema_js_1.users)
            .where((0, drizzle_orm_1.inArray)(schema_js_1.users.email, participantList));
        const userMap = userRecords.reduce((acc, user) => {
            if (!acc[user.email]) {
                acc[user.email] = [];
            }
            acc[user.email].push({
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
            });
            return acc;
        }, {});
        const result = {};
        for (const email of participantList) {
            result[email] = userMap[email] ?? [];
        }
        return result;
    }
    async addMeetingParticipant(meetingId, addedBy, participantMap) {
        const records = [];
        for (const email of Object.keys(participantMap)) {
            const participant = participantMap[email];
            records.push({
                meetingId,
                email,
                userId: participant.userId,
                participantRole: participant.participantRole,
                participantStatus: "INVITED"
            });
        }
        if (records.length > 0) {
            await index_js_1.db.insert(schema_js_1.meetingParticipants).values(records);
        }
        return true;
    }
    async checkMeetingHost(meetingId, user) {
        const participant = await index_js_1.db.query.meetingParticipants.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.meetingParticipants.userId, user.userId), (0, drizzle_orm_1.eq)(schema_js_1.meetingParticipants.meetingId, meetingId), (0, drizzle_orm_1.eq)(schema_js_1.meetingParticipants.participantRole, 'HOST'))
        });
        return participant;
    }
    async updateMeetingStatus(meetingId, status, endTime) {
        await index_js_1.db.update(schema_js_1.meetings).set({ status: status, endTime: endTime ?? endTime }).where((0, drizzle_orm_1.eq)(schema_js_1.meetings.meetingId, meetingId));
        return this.getMeetingById(meetingId);
    }
    async checkMeetingParticipant(meetingId, user) {
        const participant = await index_js_1.db.query.meetingParticipants.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.meetingParticipants.userId, user.userId), (0, drizzle_orm_1.eq)(schema_js_1.meetingParticipants.meetingId, meetingId), (0, drizzle_orm_1.eq)(schema_js_1.meetingParticipants.participantRole, 'PARTICIPANT'))
        });
        return participant;
    }
    async updateMeetingParticipantStatus(meetingId, user, status, joinedAt, leftAt) {
        await index_js_1.db.update(schema_js_1.meetingParticipants).set({ participantStatus: status, joinedAt: joinedAt ?? joinedAt, leftAt: leftAt ?? leftAt }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.meetingParticipants.userId, user.userId), (0, drizzle_orm_1.eq)(schema_js_1.meetingParticipants.meetingId, meetingId)));
    }
    async getMeetingsByUser(userId) {
        const userMeetings = await index_js_1.db.query.meetingParticipants.findMany({
            where: (0, drizzle_orm_1.eq)(schema_js_1.meetingParticipants.userId, userId),
            with: {
                meeting: {
                    with: {
                        participants: {
                            columns: {
                                participantId: true,
                                email: true,
                                participantRole: true,
                                participantStatus: true
                            }
                        }
                    }
                }
            }
        });
        return userMeetings.map(mp => ({
            ...mp.meeting,
            participantCount: mp.meeting.participants.length,
            userRole: mp.participantRole,
            participants: mp.meeting.participants
        }));
    }
}
exports.MeetingRepository = MeetingRepository;
//# sourceMappingURL=meeting.repository.js.map