"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
const controller = new user_controller_1.UserController();
router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.delete("/:id", controller.delete);
exports.default = router;
//# sourceMappingURL=user.route.js.map