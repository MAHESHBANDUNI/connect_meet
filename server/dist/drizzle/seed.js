"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const bcrypt_1 = __importDefault(require("bcrypt"));
const schema_js_1 = require("./schema.js");
const client = new pg_1.Client({
    connectionString: process.env.DATABASE_URL,
});
async function main() {
    await client.connect();
    const db = (0, node_postgres_1.drizzle)(client);
    const hashedPasswordAdmin = await bcrypt_1.default.hash("admin123", 10);
    await db.insert(schema_js_1.users).values({
        email: "admin@gmail.com",
        password: hashedPasswordAdmin,
        firstName: "admin",
        lastName: "admin",
        roleId: 1,
        authProvider: "local",
        isEmailVerified: true,
    });
    console.log("Users seeded successfully!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await client.end();
});
//# sourceMappingURL=seed.js.map