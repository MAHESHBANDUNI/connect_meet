"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../drizzle/index.js");
const schema_js_1 = require("../drizzle/schema.js");
const drizzle_orm_1 = require("drizzle-orm");
const errorHandler_js_1 = require("../utils/errorHandler.js");
const protect = async (req, _res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            throw new errorHandler_js_1.UnauthorizedError("Not authorized, no token");
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await index_js_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_js_1.users.userId, decoded.userId)
        });
        if (!user) {
            throw new errorHandler_js_1.UnauthorizedError("User belonging to this token no longer exists");
        }
        req.user = user;
        next();
    }
    catch (error) {
        next(error instanceof Error
            ? error
            : new errorHandler_js_1.UnauthorizedError("Your session has expired. Please sign in again."));
    }
};
exports.protect = protect;
//# sourceMappingURL=authMiddlerware.js.map