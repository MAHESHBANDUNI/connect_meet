"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRelations = exports.roleRelations = exports.users = exports.roles = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_2 = require("drizzle-orm");
exports.roles = (0, pg_core_1.pgTable)("roles", {
    roleId: (0, pg_core_1.integer)("role_id")
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    roleName: (0, pg_core_1.text)("role_name").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at")
        .notNull()
        .defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdateFn(() => new Date()),
});
exports.users = (0, pg_core_1.pgTable)("users", {
    userId: (0, pg_core_1.uuid)("user_id")
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    firstName: (0, pg_core_1.text)("first_name").notNull(),
    lastName: (0, pg_core_1.text)("last_name").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    password: (0, pg_core_1.text)("password"),
    googleId: (0, pg_core_1.text)("google_id").unique(),
    authProvider: (0, pg_core_1.text)("auth_provider").notNull().default("local"),
    isEmailVerified: (0, pg_core_1.text)("is_email_verified").notNull().default("false"),
    roleId: (0, pg_core_1.integer)("role_id")
        .notNull()
        .references(() => exports.roles.roleId, { onDelete: "restrict" }),
    createdAt: (0, pg_core_1.timestamp)("created_at")
        .notNull()
        .defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdateFn(() => new Date()),
});
exports.roleRelations = (0, drizzle_orm_2.relations)(exports.roles, ({ many }) => ({
    users: many(exports.users),
}));
exports.userRelations = (0, drizzle_orm_2.relations)(exports.users, ({ one }) => ({
    role: one(exports.roles, {
        fields: [exports.users.roleId],
        references: [exports.roles.roleId],
    }),
}));
//# sourceMappingURL=schema.js.map