import {z} from "zod";

export const tagValidateSchema = z.object({

    name: z
        .string()
        .trim()
        .nonempty("Tag name is required")
        .min(2, "Tag name must be at least 2 characters")
        .max(100, "Tag name must not exceed 100 characters"),

    status: z
        .boolean({
            error: "Tag status is required"
        }),

    slug: z
        .string()
        .trim()
        .min(2, "Tag slug must be at least 2 characters")
        .max(100, "Tag slug must not exceed 100 characters")
        .optional()
        .or(z.literal("")),

    description: z
        .string()
        .trim()
        .min(2, "Tag description must be at least 2 characters")
        .max(500, "Tag description must not exceed 500 characters")
        .optional()
        .or(z.literal("")),

})