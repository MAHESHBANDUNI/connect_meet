import { Request, Response } from "express";
import { UserService } from "./user.service";
export declare class UserController {
    private readonly service;
    constructor(service?: UserService);
    create: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getAll: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    delete: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=user.controller.d.ts.map