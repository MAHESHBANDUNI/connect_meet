import { AuthRepository } from "./auth.repository.js";
import { UserSigninInput, UserSignupInput } from "./auth.validation.js";
import { ConflictError, NotFoundError, BadRequestError } from "../../utils/errorHandler.js";
import bcrypt from "bcrypt";
import tokenGeneration from "../../utils/jwtToken.js";

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
      const existingEmail = await this.repo.findByEmail(email);
      if (existingEmail) {
        if (existingEmail.authProvider === "local") {
          user = await this.repo.updateOAuthUser(existingEmail.userId, {
            googleId: id,
            authProvider: "google",
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
          isEmailVerified: true,
          roleId: 2, // Default role
        });
      }
    }

    const token = await tokenGeneration(user);
    return { user, token };
  }
}