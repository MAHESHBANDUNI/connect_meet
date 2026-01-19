import { z } from "zod";
export declare const CreateMeetingValidation: z.ZodObject<{
    topic: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    startTime: z.ZodString;
    cohosts: z.ZodOptional<z.ZodArray<z.ZodString>>;
    invitees: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type CreateMeetingInput = z.infer<typeof CreateMeetingValidation>;
//# sourceMappingURL=meeting.validation.d.ts.map