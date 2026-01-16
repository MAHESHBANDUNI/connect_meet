"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSignupSchema = exports.UserSigninSchema = void 0;
const zod_1 = require("zod");
exports.UserSigninSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: 'Invalid email format' }),
    password: zod_1.z.string().min(6, { message: 'Password must be at least 6 characters' }),
});
exports.UserSignupSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, { message: 'First name must be at least 2 characters' }),
    lastName: zod_1.z.string().min(2, { message: 'Last name must be at least 2 characters' }),
    email: zod_1.z.string().email({ message: 'Invalid email format' }),
    password: zod_1.z.string().min(6, { message: 'Password must be at least 6 characters' }),
});
//# sourceMappingURL=auth.validation.js.map