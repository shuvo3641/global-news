import { z } from "zod";
export declare const tagValidateSchema: z.ZodObject<{
    name: z.ZodString;
    status: z.ZodBoolean;
    slug: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    description: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, z.core.$strip>;
//# sourceMappingURL=tag.validation.d.ts.map