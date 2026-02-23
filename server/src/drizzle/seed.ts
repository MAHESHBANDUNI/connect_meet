import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import bcrypt from "bcrypt";
import { users } from "./schema.js";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  const db = drizzle(client);

  const hashedPasswordAdmin = await bcrypt.hash("admin123", 10);

  await db.insert(users).values({
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