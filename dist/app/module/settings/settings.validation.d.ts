import { z } from "zod";
export declare const appSettingsFieldsSchema: z.ZodObject<{
    appName: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    tagline: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    appDescription: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    metaTitle: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    metaDescription: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    metaKeywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const contactSettingsSchema: z.ZodObject<{
    title: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    description: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodEmail>, z.ZodLiteral<"">]>;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    address: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    workingHours: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    socialLinks: z.ZodObject<{
        facebook: z.ZodUnion<[z.ZodOptional<z.ZodURL>, z.ZodLiteral<"">]>;
        instagram: z.ZodUnion<[z.ZodOptional<z.ZodURL>, z.ZodLiteral<"">]>;
        youtube: z.ZodUnion<[z.ZodOptional<z.ZodURL>, z.ZodLiteral<"">]>;
        linkedin: z.ZodUnion<[z.ZodOptional<z.ZodURL>, z.ZodLiteral<"">]>;
        twitter: z.ZodUnion<[z.ZodOptional<z.ZodURL>, z.ZodLiteral<"">]>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=settings.validation.d.ts.map