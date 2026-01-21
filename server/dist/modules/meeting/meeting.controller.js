"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingController = void 0;
const meeting_service_1 = require("./meeting.service");
const meeting_validation_1 = require("./meeting.validation");
const asyncHandler_1 = require("../../utils/asyncHandler");
class MeetingController {
    constructor(service = new meeting_service_1.MeetingService()) {
        this.service = service;
        this.createMeeting = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = req?.user;
            const data = meeting_validation_1.CreateMeetingValidation.parse(req.body);
            const meeting = await this.service.createMeeting(data, user);
            res.status(201).json({ success: true, data: meeting });
        });
        this.getMeetingById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const meeting = await this.service.getMeetingById(req.body.id);
            res.json({ success: true, data: meeting });
        });
        this.startMeeting = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = req?.user;
            const { meetingId } = req.body;
            const meeting = await this.service.startMeeting(meetingId, user);
            res.status(200).json({ success: true, data: meeting });
        });
        this.endMeeting = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { meetingId } = req.body;
            const user = req?.user;
            const meeting = await this.service.endMeeting(meetingId, user);
            res.status(200).json({ success: true, data: meeting });
        });
        this.joinMeeting = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { meetingId } = req.body;
            const user = req?.user;
            const meeting = await this.service.joinMeeting(meetingId, user);
            res.status(200).json({ success: true, data: meeting });
        });
        this.exitMeeting = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { meetingId } = req.body;
            const user = req?.user;
            const meeting = await this.service.exitMeeting(meetingId, user);
            res.status(200).json({ success: true, data: meeting });
        });
        this.getUserMeetings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = req?.user;
            const meetings = await this.service.getUserMeetings(user);
            res.status(200).json({ success: true, data: meetings });
        });
    }
}
exports.MeetingController = MeetingController;
//# sourceMappingURL=meeting.controller.js.map