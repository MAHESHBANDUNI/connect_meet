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

  // ⚠️ FIX: boolean, not text
  isEmailVerified: boolean("is_email_verified").notNull().default(false),

  roleId: integer("role_id")
    .notNull()
    .references(() => roles.roleId, { onDelete: "restrict" }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const roleRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const userRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.roleId],
  }),
}));
