import { z } from "zod";
export declare const UserSigninSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const UserSignupSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type UserSigninInput = z.infer<typeof UserSigninSchema>;
export type UserSignupInput = z.infer<typeof UserSignupSchema>;
//# sourceMappingURL=auth.validation.d.ts.map