import {z} from "zod"

export const updateMediaSchema = z.object({

    name: z
        .string()
        .trim()
        .nonempty("Media name is required")
        .min(2, "Media name must be at least 2 characters")
        .max(100, "Media name must not exceed 100 characters"),

    altTag: z
        .string()
        .trim()
        .min(2, "Alt text must be at least 2 characters")
        .max(100, "Alt text must not exceed 100 characters")
        .optional()

})