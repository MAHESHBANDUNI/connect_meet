import { db } from "../../drizzle/index";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { CreateUserInput } from "./user.validation";

export class UserRepository {
  async create(data: CreateUserInput) {
    const { roleId = 2, ...rest } = data;
    const userData = { ...rest, roleId };
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async findAll() {
    return db.query.users.findMany({
      with: { role: true },
    });
  }

  async findById(userId: string) {
    return db.query.users.findFirst({
      where: eq(users.userId, userId),
      with: { role: true },
    });
  }

  async findByEmail(email: string) {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async delete(userId: string) {
    await db.delete(users).where(eq(users.userId, userId));
  }
}
