"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const index_1 = require("../drizzle/index");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class UserRepository {
    async create(data) {
        const { roleId = 2, ...rest } = data;
        const userData = { ...rest, roleId };
        const [user] = await index_1.db.insert(schema_1.users).values(userData).returning();
        return user;
    }
    async findAll() {
        return index_1.db.query.users.findMany({
            with: { role: true },
        });
    }
    async findById(userId) {
        return index_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.userId, userId),
            with: { role: true },
        });
    }
    async findByEmail(email) {
        return index_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
        });
    }
    async delete(userId) {
        await index_1.db.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.userId, userId));
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map