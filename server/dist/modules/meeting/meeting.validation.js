"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMeetingValidation = exports.CreateMeetingValidation = void 0;
const zod_1 = require("zod");
exports.CreateMeetingValidation = zod_1.z.object({
    topic: zod_1.z.string().min(1, 'Topic is required'),
    description: zod_1.z.string().optional(),
    startTime: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start time' }),
    cohosts: zod_1.z.array(zod_1.z.string().email('Invalid email address')).optional(),
    invitees: zod_1.z.array(zod_1.z.string().email('Invalid email address')).optional(),
    directJoinPermission: zod_1.z.boolean().default(true),
    mutePermission: zod_1.z.boolean().default(false),
    screenSharePermission: zod_1.z.boolean().default(true),
    dropPermission: zod_1.z.boolean().default(false),
});
exports.UpdateMeetingValidation = exports.CreateMeetingValidation;
//# sourceMappingURL=meeting.validation.js.map