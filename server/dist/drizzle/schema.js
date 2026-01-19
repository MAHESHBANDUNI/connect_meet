"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetingParticipantRelations = exports.meetingRelations = exports.userRelations = exports.roleRelations = exports.meetingParticipants = exports.meetings = exports.users = exports.roles = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_2 = require("drizzle-orm");
exports.roles = (0, pg_core_1.pgTable)("roles", {
    roleId: (0, pg_core_1.serial)("role_id").primaryKey(),
    roleName: (0, pg_core_1.text)("role_name").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date()),
});
exports.users = (0, pg_core_1.pgTable)("users", {
    userId: (0, pg_core_1.uuid)("user_id")
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    firstName: (0, pg_core_1.text)("first_name").notNull(),
    lastName: (0, pg_core_1.text)("last_name").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    password: (0, pg_core_1.text)("password"),
    googleId: (0, pg_core_1.text)("google_id"),
    authProvider: (0, pg_core_1.text)("auth_provider").notNull().default("local"),
    isEmailVerified: (0, pg_core_1.boolean)("is_email_verified").notNull().default(false),
    roleId: (0, pg_core_1.integer)("role_id")
        .notNull()
        .references(() => exports.roles.roleId, { onDelete: "restrict" }),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date()),
});
exports.meetings = (0, pg_core_1.pgTable)("meetings", {
    meetingId: (0, pg_core_1.uuid)("meeting_id")
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    meetingCode: (0, pg_core_1.text)("meeting_code").notNull().unique(),
    topic: (0, pg_core_1.text)("topic").notNull(),
    description: (0, pg_core_1.text)("description"),
    startTime: (0, pg_core_1.timestamp)("start_time").notNull(),
    endTime: (0, pg_core_1.timestamp)("end_time"),
    status: (0, pg_core_1.text)("status", { enum: ['SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED'] }).notNull().default('SCHEDULED'),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date()),
});
exports.meetingParticipants = (0, pg_core_1.pgTable)("meeting_participants", {
    participantId: (0, pg_core_1.uuid)("participant_id")
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    meetingId: (0, pg_core_1.uuid)("meeting_id")
        .notNull()
        .references(() => exports.meetings.meetingId, { onDelete: "cascade" }),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.users.userId, { onDelete: "set null" }),
    email: (0, pg_core_1.text)("email").notNull(),
    participantRole: (0, pg_core_1.text)("participant_role", { enum: ['HOST', 'CO_HOST', 'PRESENTER', 'PARTICIPANT', 'GUEST'] }).notNull().default('PARTICIPANT'),
    participantStatus: (0, pg_core_1.text)("participant_status", { enum: ['INVITED', 'WAITING', 'JOINED', 'LEFT', 'REMOVED', 'REJECTED'] }).notNull().default('INVITED'),
    hasJoined: (0, pg_core_1.boolean)("has_joined").notNull().default(false),
    joinedAt: (0, pg_core_1.timestamp)("joined_at"),
    leftAt: (0, pg_core_1.timestamp)("left_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date()),
});
exports.roleRelations = (0, drizzle_orm_2.relations)(exports.roles, ({ many }) => ({
    users: many(exports.users),
}));
exports.userRelations = (0, drizzle_orm_2.relations)(exports.users, ({ one, many }) => ({
    role: one(exports.roles, {
        fields: [exports.users.roleId],
        references: [exports.roles.roleId],
    }),
    meetingParticipants: many(exports.meetingParticipants),
}));
exports.meetingRelations = (0, drizzle_orm_2.relations)(exports.meetings, ({ many }) => ({
    participants: many(exports.meetingParticipants),
}));
exports.meetingParticipantRelations = (0, drizzle_orm_2.relations)(exports.meetingParticipants, ({ one }) => ({
    meeting: one(exports.meetings, {
        fields: [exports.meetingParticipants.meetingId],
        references: [exports.meetings.meetingId],
    }),
    user: one(exports.users, {
        fields: [exports.meetingParticipants.userId],
        references: [exports.users.userId],
    }),
}));
//# sourceMappingURL=schema.js.map