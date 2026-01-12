"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const user_validation_1 = require("./user.validation");
const asyncHandler_1 = require("../utils/asyncHandler");
class UserController {
    constructor(service = new user_service_1.UserService()) {
        this.service = service;
        this.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const data = user_validation_1.CreateUserValidation.parse(req.body);
            const user = await this.service.createUser(data);
            res.status(201).json({ success: true, data: user });
        });
        this.getAll = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
            const users = await this.service.getUsers();
            res.json({ success: true, data: users });
        });
        this.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = await this.service.getUserById(req.params.id);
            res.json({ success: true, data: user });
        });
        this.delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await this.service.deleteUser(req.params.id);
            res.status(204).send();
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map