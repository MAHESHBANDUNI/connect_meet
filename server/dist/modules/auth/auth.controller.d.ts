import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";
export declare class AuthController {
    private readonly service;
    constructor(service?: AuthService);
    signin: (req: Request, res: Response, next: NextFunction) => void;
    signup: (req: Request, res: Response, next: NextFunction) => void;
    googleAuth: (req: Request, res: Response, next: NextFunction) => void;
    googleCallback: (req: Request, res: Response, next: NextFunction) => void;
    logout: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=auth.controller.d.ts.map