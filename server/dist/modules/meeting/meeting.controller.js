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
        this.getMeetingByCode = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const meeting = await this.service.getMeetingByCode(req.params.id);
            res.json({ success: true, data: meeting });
        });
        this.getMeetingById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const meeting = await this.service.getMeetingById(req.params.id);
            res.json({ success: true, data: meeting });
        });
        this.startMeeting = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = req?.user;
            const meetingId = req.params.id;
            const meeting = await this.service.startMeeting(meetingId, user);
            res.status(200).json({ success: true, data: meeting });
        });
        this.endMeeting = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const meetingId = req.params.id;
            const user = req?.user;
            const meeting = await this.service.endMeeting(meetingId, user);
            res.status(200).json({ success: true, data: meeting });
        });
        this.joinMeeting = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const meetingId = req.params.id;
            const user = req?.user;
            const meeting = await this.service.joinMeeting(meetingId, user);
            res.status(200).json({ success: true, data: meeting });
        });
        this.exitMeeting = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const meetingId = req.params.id;
            const user = req?.user;
            const meeting = await this.service.exitMeeting(meetingId, user);
            res.status(200).json({ success: true, data: meeting });
        });
        this.getUserMeetings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = req?.user;
            const meetings = await this.service.getUserMeetings(user);
            res.status(200).json({ success: true, data: meetings });
        });
        this.admitParticipant = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = req?.user;
            const meetingId = req.params.id;
            const { userId } = req.body;
            const result = await this.service.admitParticipant(meetingId, user.userId, userId);
            res.status(200).json(result);
        });
        this.rejectParticipant = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = req?.user;
            const meetingId = req.params.id;
            const { userId } = req.body;
            const result = await this.service.rejectParticipant(meetingId, user.userId, userId);
            res.status(200).json(result);
        });
        this.cancelMeeting = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = req?.user;
            const meetingId = req.params.id;
            const result = await this.service.cancelMeeting(meetingId, user.userId);
            res.status(200).json(result);
        });
        this.updateMeeting = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = req?.user;
            const meetingId = req.params.id;
            const updateMeetingDetails = meeting_validation_1.UpdateMeetingValidation.parse(req.body);
            const result = await this.service.updateMeeting(meetingId, user.userId, updateMeetingDetails);
            res.status(200).json(result);
        });
    }
}
exports.MeetingController = MeetingController;
//# sourceMappingURL=meeting.controller.js.map