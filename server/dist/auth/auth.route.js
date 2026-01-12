"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
const controller = new auth_controller_1.AuthController();
router.post("/signin", controller.signin);
router.post("/signup", controller.signup);
router.get("/google", controller.googleAuth);
router.get("/google/callback", controller.googleCallback);
router.post("/logout", controller.logout);
exports.default = router;
//# sourceMappingURL=auth.route.js.map