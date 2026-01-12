import { Request, Response } from "express";
import { UserService } from "./user.service";
import { CreateUserValidation } from "./user.validation";
import { asyncHandler } from "../utils/asyncHandler";

export class UserController {
  constructor(private readonly service = new UserService()) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = CreateUserValidation.parse(req.body);
    const user = await this.service.createUser(data);
    res.status(201).json({ success: true, data: user });
  });

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const users = await this.service.getUsers();
    res.json({ success: true, data: users });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.getUserById(req.params.id as string);
    res.json({ success: true, data: user });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteUser(req.params.id as string);
    res.status(204).send();
  });
}
