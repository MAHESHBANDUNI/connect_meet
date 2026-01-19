import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();
const controller = new UserController();

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.delete("/:id", controller.delete);

export default router;
