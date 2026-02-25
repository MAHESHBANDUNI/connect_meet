"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assembly_controller_1 = require("./assembly.controller");
const router = (0, express_1.Router)();
const controller = new assembly_controller_1.AssemblyController();
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
router.get("/token", controller.generateToken);
exports.default = router;
//# sourceMappingURL=assembly.route.js.map