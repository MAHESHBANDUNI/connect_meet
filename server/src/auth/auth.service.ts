import { AuthRepository } from "./auth.repository.js";
import { UserSigninInput, UserSignupInput } from "./auth.validation.js";
import { ConflictError, NotFoundError, BadRequestError } from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import tokenGeneration from "../utils/jwtToken.js";

export class AuthService {
  constructor(private readonly repo = new AuthRepository()) { }

  async userSignin(data: UserSigninInput) {
    const user = await this.repo.signin(data);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.authProvider !== "local") {
      throw new BadRequestError(`Please login using ${user.authProvider}`);
    }

    if (!user.password) {
      throw new BadRequestError("Password not set for this account");
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new BadRequestError("Invalid password");
    }

    // Generate JWT token
    const token = await tokenGeneration(user);
    if (!token) {
      console.error(`Token generation failed for email: ${user.email}`);
      throw new BadRequestError('Token generation failed.');
    }

    return { user, token };
  }

  async userSignup(data: UserSignupInput) {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw new ConflictError("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // We reuse createOAuthUser logic or just call a direct repository method if added
    // For simplicity, let's use the repo findByEmail/create pattern
    // I'll add a create method to repo if not already there, but repo has createOAuthUser
    // Actually, I should probably add a generic create to repo or use createOAuthUser with local provider

    // Let's assume roleId 2 is User/Student role as seen in UserService
    const user = await this.repo.createOAuthUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      googleId: "", // Not applicable for local
      authProvider: "local",
      isEmailVerified: "false",
      roleId: 2,
    });

    // Manually set password since createOAuthUser might not handle it if I didn't include it in the type
    // Wait, I should update createOAuthUser in repo to be more flexible or add a createLocalUser

    await this.repo.updateOAuthUser(user!.userId, { password: hashedPassword });

    const finalUser = await this.repo.findById(user!.userId);
    const token = await tokenGeneration(finalUser);

    return { user: finalUser, token };
  }

  async handleOAuthUser(profile: any) {
    const { id, name, emails } = profile;
    const email = emails[0].value;
    const firstName = name.givenName || "";
    const lastName = name.familyName || "";

    let user = await this.repo.findByGoogleId(id);

    if (!user) {
      // Check if user exists with same email but different provider
      const existingEmail = await this.repo.findByEmail(email);
      if (existingEmail) {
        // Link account or return error? Usually best to link or tell user to login with original provider
        // For now, let's update existing user with googleId if they are local
        if (existingEmail.authProvider === "local") {
          user = await this.repo.updateOAuthUser(existingEmail.userId, {
            googleId: id,
            authProvider: "google", // Optional: switch to google or keep local
          });
        } else {
          user = existingEmail;
        }
      } else {
        // Create new user
        user = await this.repo.createOAuthUser({
          firstName,
          lastName,
          email,
          googleId: id,
          authProvider: "google",
          isEmailVerified: "true",
          roleId: 2, // Default role
        });
      }
    }

    const token = await tokenGeneration(user);
    return { user, token };
  }
}