"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const index_js_1 = require("../../drizzle/index.js");
const schema_js_1 = require("../../drizzle/schema.js");
const drizzle_orm_1 = require("drizzle-orm");
class AuthRepository {
    async signin(data) {
        return index_js_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_js_1.users.email, data.email),
            with: {
                role: true,
            },
        });
    }
    async findByEmail(email) {
        return index_js_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_js_1.users.email, email),
            with: {
                role: true,
            },
        });
    }
    async findByGoogleId(googleId) {
        return index_js_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_js_1.users.googleId, googleId),
            with: {
                role: true,
            },
        });
    }
    async findById(userId) {
        return index_js_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_js_1.users.userId, userId),
            with: {
                role: true,
            },
        });
    }
    async createOAuthUser(data) {
        const [user] = await index_js_1.db.insert(schema_js_1.users).values(data).returning();
        return this.findById(user.userId);
    }
    async updateOAuthUser(userId, data) {
        await index_js_1.db.update(schema_js_1.users).set(data).where((0, drizzle_orm_1.eq)(schema_js_1.users.userId, userId));
        return this.findById(userId);
    }
}
exports.AuthRepository = AuthRepository;
//# sourceMappingURL=auth.repository.js.map