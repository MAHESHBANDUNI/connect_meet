"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const tokenGeneration = async (user) => {
    return jsonwebtoken_1.default.sign({
        userId: user.userId,
        email: user.email,
        roleId: user.roleId,
        firstName: user.firstName,
        lastName: user.lastName,
    }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
exports.default = tokenGeneration;
//# sourceMappingURL=jwtToken.js.map