import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AssemblyService } from "./assembly.service.js";

export class AssemblyController {
  constructor(private readonly service = new AssemblyService()) { }

  generateToken = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.generateToken();
    res.status(200).json({ success: true, token: result });
  });

}
