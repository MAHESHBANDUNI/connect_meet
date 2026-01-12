import { z } from "zod";
export declare const CreateUserValidation: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    roleId: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type CreateUserInput = z.infer<typeof CreateUserValidation>;
//# sourceMappingURL=user.validation.d.ts.map