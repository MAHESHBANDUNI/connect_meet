import { Request, Response, NextFunction } from "express";
import { AssemblyService } from "./assembly.service.js";
export declare class AssemblyController {
    private readonly service;
    constructor(service?: AssemblyService);
    generateToken: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=assembly.controller.d.ts.map