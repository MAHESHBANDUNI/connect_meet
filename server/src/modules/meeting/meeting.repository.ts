import {db} from "../../drizzle/index.js";
import {meetings, users, meetingParticipants} from "../../drizzle/schema.js";
import {and, eq, inArray} from "drizzle-orm";
import {CreateMeetingInput} from "./meeting.validation.js";
import type {MeetingParticipantRole} from "./meeting.types";

export class MeetingRepository {

    async createMeeting(
        data: CreateMeetingInput,
        meetingCode: string,
        user: { userId: string }
    ) {
        const [meeting] = await db
            .insert(meetings)
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

    async getMeetingById(meetingId: string) {
        return db.query.meetings.findFirst({
            where: eq(meetings.meetingId, meetingId)
        });
    }

    async mapParticipantsWithUserDetails(participantList: string[]) {
        const userRecords = await db
            .select({
                email: users.email,
                userId: users.userId,
                firstName: users.firstName,
                lastName: users.lastName,
            })
            .from(users)
            .where(inArray(users.email, participantList));
        
        const userMap = userRecords.reduce<
            Record<
                string,
                {
                    userId: string;
                    firstName: string;
                    lastName: string;
                }[]
            >
        >((acc, user) => {
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
    
        const result: Record<
            string,
            {
                userId: string;
                firstName: string;
                lastName: string;
            }[]
        > = {};
        
        for (const email of participantList) {
            result[email] = userMap[email] ?? [];
        }
    
        return result;
    }

    async addMeetingParticipant(
        meetingId: string,
        addedBy: string,
        participantMap: Record<
            string,
            { userId: string | null; participantRole: MeetingParticipantRole }
        >
    ) {
        const records = [];

        for (const email of Object.keys(participantMap)) {
            const participant = participantMap[email];

            records.push({
                meetingId,
                email,
                userId: participant.userId,
                participantRole: participant.participantRole,
                participantStatus: "INVITED" as const
            });
        }

        if (records.length > 0) {
            await db.insert(meetingParticipants).values(records);
        }

        return true;
    }

    async checkMeetingHost(meetingId: string, user: {userId: string}) {
        const participant = await db.query.meetingParticipants.findFirst({
            where: and(
                eq(meetingParticipants.userId, user.userId),
                eq(meetingParticipants.meetingId, meetingId),
                eq(meetingParticipants.participantRole, 'HOST')
            )
        });
        return participant;
    }

    async updateMeetingStatus(meetingId: string, status: "LIVE" | "ENDED", endTime?: Date) {
        await db.update(meetings).set({ status: status, endTime: endTime ?? endTime }).where(eq(meetings.meetingId, meetingId));
        return this.getMeetingById(meetingId);
    }

    async checkMeetingParticipant(meetingId: string, user: {userId: string}) {
        const participant = await db.query.meetingParticipants.findFirst({
            where: and(
                eq(meetingParticipants.userId, user.userId),
                eq(meetingParticipants.meetingId, meetingId),
                eq(meetingParticipants.participantRole, 'PARTICIPANT')
            )
        });
        return participant;
    }

    async updateMeetingParticipantStatus(meetingId: string, user: {userId: string}, status: "JOINED" | "WAITING" | "LEFT", joinedAt?: Date, leftAt?: Date) {
        await db.update(meetingParticipants).set({ participantStatus: status, joinedAt: joinedAt ?? joinedAt, leftAt: leftAt ?? leftAt }).where(
            and(
                eq(meetingParticipants.userId, user.userId),
                eq(meetingParticipants.meetingId, meetingId)
            )
        );
    }

    async getMeetingsByUser(userId: string) {
        const userMeetings = await db.query.meetingParticipants.findMany({
            where: eq(meetingParticipants.userId, userId),
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