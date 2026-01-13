import { Router } from "express";
import { AuthController } from "./auth.controller";
import session from 'express-session';
import passport from 'passport';

const router = Router();
const controller = new AuthController();

// Session config for OAuth routes
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

// Apply session and passport only to OAuth routes
router.get("/google", session(sessionConfig), passport.initialize(), passport.session(), controller.googleAuth);
router.get("/google/callback", session(sessionConfig), passport.initialize(), passport.session(), controller.googleCallback);

// Other routes without sessions
router.post("/signin", controller.signin);
router.post("/signup", controller.signup);
router.post("/logout", controller.logout);

export default router;