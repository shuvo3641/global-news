import { z } from "zod";
export declare const categoryValidateSchema: z.ZodObject<{
    imageFilepath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imageMimetype: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imageSize: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    name: z.ZodString;
    status: z.ZodBoolean;
    slug: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    description: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, z.core.$strip>;
//# sourceMappingURL=category.validation.d.ts.map