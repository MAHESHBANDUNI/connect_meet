import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";
import { UserSigninSchema, UserSignupSchema } from "./auth.validation.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import passport from "passport";

export class AuthController {
  constructor(private readonly service = new AuthService()) { }

  signin = asyncHandler(async (req: Request, res: Response) => {
    const data = UserSigninSchema.parse(req.body);
    const result = await this.service.userSignin(data);
    res.status(200).json({ success: true, ...result });
  });

  signup = asyncHandler(async (req: Request, res: Response) => {
    const data = UserSignupSchema.parse(req.body);
    const result = await this.service.userSignup(data);
    res.status(201).json({ success: true, ...result });
  });

  googleAuth = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: true,
    })(req, res, next);
  };

  googleCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", {
      session: true,
      failureRedirect: `${process.env.CLIENT_URL}/auth/signin?error=oauth_failed`,
    }, (err: any, user: any) => {
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error('Session destroy error:', destroyErr);
        }
        if (err || !user) {
          return res.redirect(`${process.env.CLIENT_URL}/auth/signin?error=oauth_failed`);
        }
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${user.token}`);
      });
    })(req, res, next);
  };

  logout = asyncHandler(async (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Logout failed" });
      }
      res.status(200).json({ success: true, message: "Logged out successfully" });
    });
  });
}
