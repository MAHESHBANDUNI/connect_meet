"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const auth_repository_js_1 = require("./auth.repository.js");
const errorHandler_js_1 = require("../../utils/errorHandler.js");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwtToken_js_1 = __importDefault(require("../../utils/jwtToken.js"));
class AuthService {
    constructor(repo = new auth_repository_js_1.AuthRepository()) {
        this.repo = repo;
    }
    async userSignin(data) {
        const user = await this.repo.signin(data);
        if (!user) {
            throw new errorHandler_js_1.NotFoundError("User not found");
        }
        if (user.authProvider !== "local") {
            throw new errorHandler_js_1.BadRequestError(`Please login using ${user.authProvider}`);
        }
        if (!user.password) {
            throw new errorHandler_js_1.BadRequestError("Password not set for this account");
        }
        const valid = await bcrypt_1.default.compare(data.password, user.password);
        if (!valid) {
            throw new errorHandler_js_1.BadRequestError("Invalid password");
        }
        const token = await (0, jwtToken_js_1.default)(user);
        if (!token) {
            console.error(`Token generation failed for email: ${user.email}`);
            throw new errorHandler_js_1.BadRequestError('Token generation failed.');
        }
        return { user, token };
    }
    async userSignup(data) {
        const existing = await this.repo.findByEmail(data.email);
        if (existing) {
            throw new errorHandler_js_1.ConflictError("Email already exists");
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        const user = await this.repo.createOAuthUser({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            googleId: "", // Not applicable for local
            authProvider: "local",
            isEmailVerified: false,
            roleId: 2,
            password: hashedPassword
        });
        const finalUser = await this.repo.findById(user.userId);
        const token = await (0, jwtToken_js_1.default)(finalUser);
        return { user: finalUser, token };
    }
    async handleOAuthUser(profile) {
        const { id, name, emails } = profile;
        const email = emails[0].value;
        const firstName = name.givenName || "";
        const lastName = name.familyName || "";
        let user = await this.repo.findByGoogleId(id);
        if (!user) {
            const existingEmail = await this.repo.findByEmail(email);
            if (existingEmail) {
                if (existingEmail.authProvider === "local") {
                    user = await this.repo.updateOAuthUser(existingEmail.userId, {
                        googleId: id,
                        authProvider: "google",
                    });
                }
                else {
                    user = existingEmail;
                }
            }
            else {
                // Create new user
                user = await this.repo.createOAuthUser({
                    firstName,
                    lastName,
                    email,
                    googleId: id,
                    authProvider: "google",
                    isEmailVerified: true,
                    roleId: 2, // Default role
                });
            }
        }
        const token = await (0, jwtToken_js_1.default)(user);
        return { user, token };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map