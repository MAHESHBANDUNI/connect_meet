import { Request, Response } from "express";
import { MeetingService } from "./meeting.service";
import { CreateMeetingValidation, UpdateMeetingValidation } from "./meeting.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import type { User } from "./meeting.types";

export class MeetingController {
    constructor(private readonly service = new MeetingService()) { }

    createMeeting = asyncHandler(async (req: Request, res: Response) => {
        const user = req?.user as User;
        const data = CreateMeetingValidation.parse(req.body);
        const meeting = await this.service.createMeeting(data, user);
        res.status(201).json({ success: true, data: meeting });
    });

    getMeetingByCode = asyncHandler(async (req: Request, res: Response) => {
        const meeting = await this.service.getMeetingByCode(req.params.id as string);
        res.json({ success: true, data: meeting });
    });

    getMeetingById = asyncHandler(async (req: Request, res: Response) => {
        const meeting = await this.service.getMeetingById(req.params.id as string);
        res.json({ success: true, data: meeting });
    });

    startMeeting = asyncHandler(async (req: Request, res: Response) => {
        const user = req?.user as User;
        const meetingId = req.params.id as string;
        const meeting = await this.service.startMeeting(meetingId, user);
        res.status(200).json({ success: true, data: meeting });
    });

    endMeeting = asyncHandler(async (req: Request, res: Response) => {
        const meetingId = req.params.id as string;
        const user = req?.user as User;
        const meeting = await this.service.endMeeting(meetingId, user);
        res.status(200).json({ success: true, data: meeting });
    });

    joinMeeting = asyncHandler(async (req: Request, res: Response) => {
        const  meetingId = req.params.id as string;
        const user = req?.user as User;
        const meeting = await this.service.joinMeeting(meetingId, user);
        res.status(200).json({ success: true, data: meeting });
    });

    exitMeeting = asyncHandler(async (req: Request, res: Response) => {
        const meetingId = req.params.id as string;
        const user = req?.user as User;
        const meeting = await this.service.exitMeeting(meetingId, user);
        res.status(200).json({ success: true, data: meeting });
    });

    getUserMeetings = asyncHandler(async (req: Request, res: Response) => {
        const user = req?.user as User;
        const meetings = await this.service.getUserMeetings(user);
        res.status(200).json({ success: true, data: meetings });
    });

    admitParticipant = asyncHandler(async (req: Request, res: Response) => {
        const user = req?.user as User;
        const meetingId = req.params.id as string;
        const { userId } = req.body;
        const result = await this.service.admitParticipant(meetingId, user.userId, userId);
        res.status(200).json(result);
    });

    rejectParticipant = asyncHandler(async (req: Request, res: Response) => {
        const user = req?.user as User;
        const meetingId = req.params.id as string;
        const { userId } = req.body;
        const result = await this.service.rejectParticipant(meetingId, user.userId, userId);
        res.status(200).json(result);
    });

    cancelMeeting = asyncHandler(async (req: Request, res: Response) => {
        const user = req?.user as User;
        const meetingId = req.params.id as string;
        const result = await this.service.cancelMeeting(meetingId, user.userId);
        res.status(200).json(result);
    });

    updateMeeting = asyncHandler(async (req: Request, res: Response) => {
        const user = req?.user as User;
        const meetingId = req.params.id as string;
        const updateMeetingDetails = UpdateMeetingValidation.parse(req.body);
        const result = await this.service.updateMeeting(meetingId, user.userId, updateMeetingDetails);
        res.status(200).json(result);
    });

    sendMeetingInvite = asyncHandler(async (req: Request, res: Response) => {
        const user = req?.user as User;
        const meetingId = req.params.id as string;
        const emails = req.body.emails as string[];
        const meeting = await this.service.sendMeetingInvite(user.userId, meetingId, emails);
        res.status(201).json({ success: true, data: meeting });
    });
}
