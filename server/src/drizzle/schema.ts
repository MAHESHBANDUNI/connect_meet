import { sql } from "drizzle-orm";
import { pgTable, text, uuid, timestamp, serial, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roles = pgTable("roles", {
  roleId: serial("role_id").primaryKey(),
  roleName: text("role_name").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const users = pgTable("users", {
  userId: uuid("user_id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),

  email: text("email").notNull().unique(),
  password: text("password"),

  googleId: text("google_id"),
  authProvider: text("auth_provider").notNull().default("local"),

  isEmailVerified: boolean("is_email_verified").notNull().default(false),

  roleId: integer("role_id")
    .notNull()
    .references(() => roles.roleId, { onDelete: "restrict" }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const meetings = pgTable("meetings",{
  meetingId: uuid("meeting_id")
  .primaryKey()
  .default(sql`gen_random_uuid()`),
  meetingCode: text("meeting_code").notNull().unique(),
  topic: text("topic").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  status: text("status", {enum: [ 'SCHEDULED','LIVE','ENDED','CANCELLED']}).notNull().default('SCHEDULED'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date()),
})

export const meetingParticipants = pgTable("meeting_participants",{
  participantId: uuid("participant_id")
  .primaryKey()
  .default(sql`gen_random_uuid()`),
  meetingId: uuid("meeting_id")
  .notNull()
  .references(() => meetings.meetingId, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .references(() => users.userId, { onDelete: "set null" }),
  email: text("email").notNull(),
  participantRole: text("participant_role", {enum: [ 'HOST','CO_HOST','PRESENTER','PARTICIPANT','GUEST']}).notNull().default('PARTICIPANT'),
  participantStatus: text("participant_status", {enum: [ 'INVITED','WAITING','JOINED','LEFT','REMOVED','REJECTED']}).notNull().default('INVITED'),
  hasJoined: boolean("has_joined").notNull().default(false),
  joinedAt: timestamp("joined_at"),
  leftAt: timestamp("left_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const roleRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.roleId],
  }),
  meetingParticipants: many(meetingParticipants),
}));

export const meetingRelations = relations(meetings, ({many }) => ({
  participants: many(meetingParticipants),
}));

export const meetingParticipantRelations = relations(meetingParticipants, ({ one }) => ({
  meeting: one(meetings, {
    fields: [meetingParticipants.meetingId],
    references: [meetings.meetingId],
  }),
  user: one(users, {
    fields: [meetingParticipants.userId],
    references: [users.userId],
  }),
}));