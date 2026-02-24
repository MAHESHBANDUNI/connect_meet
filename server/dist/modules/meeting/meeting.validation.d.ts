import { z } from "zod";
export declare const CreateMeetingValidation: z.ZodObject<{
    topic: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    startTime: z.ZodString;
    cohosts: z.ZodOptional<z.ZodArray<z.ZodString>>;
    invitees: z.ZodOptional<z.ZodArray<z.ZodString>>;
    directJoinPermission: z.ZodDefault<z.ZodBoolean>;
    mutePermission: z.ZodDefault<z.ZodBoolean>;
    screenSharePermission: z.ZodDefault<z.ZodBoolean>;
    dropPermission: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateMeetingInput = z.infer<typeof CreateMeetingValidation>;
//# sourceMappingURL=meeting.validation.d.ts.map