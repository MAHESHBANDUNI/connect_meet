"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssemblyController = void 0;
const asyncHandler_js_1 = require("../../utils/asyncHandler.js");
const assembly_service_js_1 = require("./assembly.service.js");
class AssemblyController {
    constructor(service = new assembly_service_js_1.AssemblyService()) {
        this.service = service;
        this.generateToken = (0, asyncHandler_js_1.asyncHandler)(async (req, res) => {
            const result = await this.service.generateToken();
            res.status(200).json({ success: true, token: result });
        });
    }
}
exports.AssemblyController = AssemblyController;
//# sourceMappingURL=assembly.controller.js.map