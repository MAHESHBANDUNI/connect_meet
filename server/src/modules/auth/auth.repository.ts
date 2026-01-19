import { db } from "../../drizzle/index.js";
import { users } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { UserSigninInput } from "./auth.validation.js";

export class AuthRepository {
  async signin(data: UserSigninInput) {
    return db.query.users.findFirst({
      where: eq(users.email, data.email),
      with: {
        role: true,
      },
    });
  }

  async findByEmail(email: string) {
    return db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        role: true,
      },
    });
  }

  async findByGoogleId(googleId: string) {
    return db.query.users.findFirst({
      where: eq(users.googleId, googleId),
      with: {
        role: true,
      },
    });
  }

  async findById(userId: string) {
    return db.query.users.findFirst({
      where: eq(users.userId, userId),
      with: {
        role: true,
      },
    });
  }

  async createOAuthUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    googleId: string;
    authProvider: string;
    isEmailVerified: boolean;
    roleId: number;
    password?: string;
  }) {
    const [user] = await db.insert(users).values(data).returning();
    return this.findById(user.userId);
  }

  async updateOAuthUser(userId: string, data: Partial<typeof users.$inferInsert>) {
    await db.update(users).set(data).where(eq(users.userId, userId));
    return this.findById(userId);
  }
}
