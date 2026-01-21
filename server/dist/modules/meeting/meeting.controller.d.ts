import { Request, Response } from "express";
import { MeetingService } from "./meeting.service";
export declare class MeetingController {
    private readonly service;
    constructor(service?: MeetingService);
    createMeeting: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getMeetingById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    startMeeting: (req: Request, res: Response, next: import("express").NextFunction) => void;
    endMeeting: (req: Request, res: Response, next: import("express").NextFunction) => void;
    joinMeeting: (req: Request, res: Response, next: import("express").NextFunction) => void;
    exitMeeting: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getUserMeetings: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=meeting.controller.d.ts.map