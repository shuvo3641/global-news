import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export declare const verifyAccountSchema: z.ZodObject<{
    token: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
    rememberMe: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodEmail;
}, z.core.$strip>;
export declare const resendOtpSchema: z.ZodObject<{
    token: z.ZodString;
}, z.core.$strip>;
export declare const verifyOtpSchema: z.ZodObject<{
    token: z.ZodString;
    otp: z.ZodString;
}, z.core.$strip>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const googleLoginSchema: z.ZodObject<{
    idToken: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=auth.validation.d.ts.map