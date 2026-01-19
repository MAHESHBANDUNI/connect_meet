"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("./user.repository");
const errorHandler_1 = require("../../utils/errorHandler");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserService {
    constructor(repo = new user_repository_1.UserRepository()) {
        this.repo = repo;
    }
    async createUser(data) {
        const existing = await this.repo.findByEmail(data.email);
        if (existing) {
            throw new errorHandler_1.ConflictError("Email already exists");
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        data.password = hashedPassword;
        data.roleId = 2;
        return this.repo.create(data);
    }
    async getUsers() {
        return this.repo.findAll();
    }
    async getUserById(id) {
        const user = await this.repo.findById(id);
        if (!user) {
            throw new errorHandler_1.NotFoundError("User not found");
        }
        return user;
    }
    async deleteUser(id) {
        const user = await this.repo.findById(id);
        if (!user) {
            throw new errorHandler_1.NotFoundError("User not found");
        }
        await this.repo.delete(id);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map