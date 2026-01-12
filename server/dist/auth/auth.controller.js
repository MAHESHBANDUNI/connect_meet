"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_js_1 = require("./auth.service.js");
const auth_validation_js_1 = require("./auth.validation.js");
const asyncHandler_js_1 = require("../utils/asyncHandler.js");
const passport_1 = __importDefault(require("passport"));
class AuthController {
    constructor(service = new auth_service_js_1.AuthService()) {
        this.service = service;
        this.signin = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
            const data = auth_validation_js_1.UserSigninSchema.parse(req.body);
            const result = await this.service.userSignin(data);
            res.status(200).json({ success: true, ...result });
        });
        this.signup = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
            const data = auth_validation_js_1.UserSignupSchema.parse(req.body);
            const result = await this.service.userSignup(data);
            res.status(201).json({ success: true, ...result });
        });
        this.googleAuth = (req, res, next) => {
            passport_1.default.authenticate("google", {
                scope: ["profile", "email"],
                session: true,
            })(req, res, next);
        };
        this.googleCallback = (req, res, next) => {
            passport_1.default.authenticate("google", {
                session: true,
                failureRedirect: `${process.env.CLIENT_URL}/auth/signin?error=oauth_failed`,
            }, (err, user) => {
                if (err || !user) {
                    return res.redirect(`${process.env.CLIENT_URL}/auth/signin?error=oauth_failed`);
                }
                // On success, redirect to client with token or set cookie
                // Since we use JWT in this app (based on tokenGeneration), we'll pass the token
                res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${user.token}`);
            })(req, res, next);
        };
        this.logout = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
            req.logout((err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: "Logout failed" });
                }
                res.status(200).json({ success: true, message: "Logged out successfully" });
            });
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map