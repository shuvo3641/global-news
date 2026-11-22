import { z } from "zod";
export declare const createUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    role: z.ZodEnum<{
        ADMIN: "ADMIN";
        EDITOR: "EDITOR";
        JOURNALIST: "JOURNALIST";
        MODERATOR: "MODERATOR";
        USER: "USER";
    }>;
    password: z.ZodString;
}, z.core.$strip>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=user.validation.d.ts.map