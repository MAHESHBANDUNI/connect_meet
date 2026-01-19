import {z} from "zod";

export const CreateMeetingValidation = z.object({
    topic: z.string().min(1, 'Topic is required'),
    description: z.string().optional(),
    startTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start time' }),
    cohosts: z.array(z.string().email('Invalid email address')).optional(),
    invitees: z.array(z.string().email('Invalid email address')).optional(),
});

export type CreateMeetingInput = z.infer<typeof CreateMeetingValidation>;