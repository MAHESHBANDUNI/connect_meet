import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();
const controller = new AuthController();

router.post("/signin", controller.signin);
router.post("/signup", controller.signup);
router.get("/google", controller.googleAuth);
router.get("/google/callback", controller.googleCallback);
router.post("/logout", controller.logout);

export default router;
