"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssemblyService = void 0;
const assembly_1 = __importDefault(require("../../utils/assembly"));
class AssemblyService {
    async generateToken() {
        return await (0, assembly_1.default)(process.env.ASSEMBLY_API_KEY || '');
    }
}
exports.AssemblyService = AssemblyService;
//# sourceMappingURL=assembly.service.js.map