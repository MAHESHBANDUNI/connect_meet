import {Router} from "express";
import {MeetingController} from "./meeting.controller.js";
import { protect } from "../../middleware/authMiddlerware.js";

const router = Router();
const controller = new MeetingController();

router.get("/user/all", protect, controller.getUserMeetings);
router.post("/create", protect,controller.createMeeting);
router.get("/:id",controller.getMeetingById);
router.post("/:id/start", protect, controller.startMeeting);
router.post("/:id/end", protect, controller.endMeeting);
router.post("/join", protect, controller.joinMeeting);
router.post("/:id/exit", protect, controller.exitMeeting);

export default router;