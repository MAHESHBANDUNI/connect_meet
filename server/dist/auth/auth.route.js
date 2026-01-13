"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const router = (0, express_1.Router)();
const controller = new auth_controller_1.AuthController();
// Session config for OAuth routes
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
};
// Apply session and passport only to OAuth routes
router.get("/google", (0, express_session_1.default)(sessionConfig), passport_1.default.initialize(), passport_1.default.session(), controller.googleAuth);
router.get("/google/callback", (0, express_session_1.default)(sessionConfig), passport_1.default.initialize(), passport_1.default.session(), controller.googleCallback);
// Other routes without sessions
router.post("/signin", controller.signin);
router.post("/signup", controller.signup);
router.post("/logout", controller.logout);
exports.default = router;
//# sourceMappingURL=auth.route.js.map