import { Request, Response } from "express";
import {MeetingService} from "./meeting.service";
import { CreateMeetingValidation } from "./meeting.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import type {User} from "./meeting.types";

export class MeetingController {
    constructor(private readonly service = new MeetingService()) {}

    createMeeting = asyncHandler(async (req: Request, res: Response) => {
        const user = req?.user as User;
        const data = CreateMeetingValidation.parse(req.body);
        const meeting = await this.service.createMeeting(data, user);
        res.status(201).json({ success: true, data: meeting });
    });

    getMeetingById = asyncHandler(async (req: Request, res: Response) => {
        const meeting = await this.service.getMeetingById(req.body.id as string);
        res.json({success: true, data: meeting});
    });

    startMeeting = asyncHandler(async (req: Request, res: Response) => {
        const user = req?.user as User;
        const { meetingId } = req.body;
        const meeting = await this.service.startMeeting(meetingId, user);
        res.status(200).json({ success: true, data: meeting });
    });

    endMeeting = asyncHandler(async (req: Request, res: Response) => {
        const { meetingId } = req.body;
        const user = req?.user as User;
        const meeting = await this.service.endMeeting(meetingId, user);
        res.status(200).json({ success: true, data: meeting });
    });

    joinMeeting = asyncHandler(async (req: Request, res: Response) => {
        const { meetingId } = req.body;
        const user = req?.user as User;
        const meeting = await this.service.joinMeeting(meetingId, user);
        res.status(200).json({ success: true, data: meeting });
    });
    
    exitMeeting = asyncHandler(async (req: Request, res: Response) => {
        const { meetingId } = req.body;
        const user = req?.user as User;
        const meeting = await this.service.exitMeeting(meetingId, user);
        res.status(200).json({ success: true, data: meeting });
    });
}
