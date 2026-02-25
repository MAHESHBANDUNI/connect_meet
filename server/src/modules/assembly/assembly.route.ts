import { Router } from "express";
import { AssemblyController } from "./assembly.controller";

const router = Router();
const controller = new AssemblyController();

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

router.get("/token", controller.generateToken);

export default router;