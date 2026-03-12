import { Router } from "express";
import { MeetingController } from "./meeting.controller.js";
import { protect } from "../../middleware/authMiddlerware.js";

const router = Router();
const controller = new MeetingController();

router.get("/user/all", protect, controller.getUserMeetings);
router.post("/create", protect, controller.createMeeting);
router.get("/:id", controller.getMeetingById);
router.get("/code/:id", controller.getMeetingByCode);
router.post("/:id/start", protect, controller.startMeeting);
router.post("/:id/update", protect, controller.updateMeeting);
router.post("/:id/invite", protect, controller.sendMeetingInvite);
router.post("/:id/end", protect, controller.endMeeting);
router.post("/:id/join", protect, controller.joinMeeting);
router.post("/:id/exit", protect, controller.exitMeeting);
router.post("/:id/admit", protect, controller.admitParticipant);
router.post("/:id/reject", protect, controller.rejectParticipant);
router.post("/:id/cancel", protect, controller.cancelMeeting);
router.post("/:id/promote", protect, controller.promoteMeetingPartcipant);

export default router;
