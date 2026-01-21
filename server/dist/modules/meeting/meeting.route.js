"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const meeting_controller_js_1 = require("./meeting.controller.js");
const authMiddlerware_js_1 = require("../../middleware/authMiddlerware.js");
const router = (0, express_1.Router)();
const controller = new meeting_controller_js_1.MeetingController();
router.get("/user/all", authMiddlerware_js_1.protect, controller.getUserMeetings);
router.post("/create", authMiddlerware_js_1.protect, controller.createMeeting);
router.get("/:id", controller.getMeetingById);
router.post("/:id/start", authMiddlerware_js_1.protect, controller.startMeeting);
router.post("/:id/end", authMiddlerware_js_1.protect, controller.endMeeting);
router.post("/join", authMiddlerware_js_1.protect, controller.joinMeeting);
router.post("/:id/exit", authMiddlerware_js_1.protect, controller.exitMeeting);
exports.default = router;
//# sourceMappingURL=meeting.route.js.map