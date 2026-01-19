import { UserRepository } from "./user.repository";
import { CreateUserInput } from "./user.validation";
import { ConflictError, NotFoundError } from "../../utils/errorHandler";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private readonly repo = new UserRepository()) {}

  async createUser(data: CreateUserInput) {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw new ConflictError("Email already exists");
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
    data.roleId=2;

    return this.repo.create(data);
  }

  async getUsers() {
    return this.repo.findAll();
  }

  async getUserById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await this.repo.delete(id);
  }
}
