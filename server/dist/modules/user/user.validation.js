"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserValidation = void 0;
const zod_1 = require("zod");
exports.CreateUserValidation = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    roleId: zod_1.z.number().min(1, 'Role ID is required').optional(),
});
//# sourceMappingURL=user.validation.js.map