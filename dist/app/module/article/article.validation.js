import { z } from "zod";
// Create Article
export const createArticleSchema = z.object({
    title: z
        .string()
        .trim()
        .nonempty("Title is required")
        .min(5, "Title must be at least 5 characters long")
        .max(150, "Title cannot exceed 150 characters"),
    slug: z
        .string()
        .trim()
        .pipe(z.union([
        z.literal(""),
        z.string()
            .min(5, "Slug must be at least 5 characters long")
            .max(150, "Slug cannot exceed 150 characters")
    ]))
        .optional(),
    content: z
        .string()
        .trim()
        .min(50, "Content must be at least 50 characters long"),
    excerpt: z
        .string()
        .trim()
        .pipe(z.union([
        z.literal(""),
        z.string()
            .min(10, "Excerpt must be at least 10 characters long")
            .max(500, "Excerpt cannot exceed 500 characters")
    ]))
        .optional()
        .default(""),
    status: z
        .enum(["DRAFT", "PUBLISH"], {
        message: "Invalid article status"
    })
        .default("DRAFT"),
    publishAt: z.preprocess((value) => value === null || value === "" ? undefined : value, z.coerce.date({
        message: "Invalid publish date",
    }).optional()),
    coverImage: z.object({
        _id: z
            .string()
            .trim()
            .min(1, "Cover image ID is required"),
        url: z
            .string()
            .url("Invalid cover image URL"),
        altTag: z
            .string()
            .trim()
            .max(200, "Alt text cannot exceed 200 characters")
            .optional(),
    }, {
        message: "Cover image is required"
    }),
    categories: z
        .array(z.string().trim().min(1, "Category ID cannot be empty"))
        .min(1, "At least one category is required")
        .refine((ids) => new Set(ids).size === ids.length, "Duplicate category IDs are not allowed"),
    tags: z
        .array(z.string().trim().min(1, "Tag ID cannot be empty"))
        .refine((ids) => new Set(ids).size === ids.length, "Duplicate tag IDs are not allowed")
        .optional(),
    allowComments: z
        .boolean()
        .default(false),
    metaTitle: z
        .string()
        .trim()
        .pipe(z.union([
        z.literal(""),
        z.string()
            .min(5, "Meta title must be at least 5 characters long")
            .max(60, "Meta title cannot exceed 60 characters")
    ]))
        .optional(),
    metaDescription: z
        .string()
        .trim()
        .pipe(z.union([
        z.literal(""),
        z.string()
            .min(10, "Meta description must be at least 10 characters long")
            .max(160, "Meta description cannot exceed 160 characters")
    ]))
        .optional(),
    metaKeywords: z
        .string()
        .trim()
        .pipe(z.union([
        z.literal(""),
        z.string()
            .min(2, "Meta keywords must be at least 2 characters long")
            .max(500, "Meta keywords cannot exceed 500 characters")
    ]))
        .optional()
});
// Update Article
export const updateArticleSchema = z.object({
    title: z
        .string()
        .trim()
        .nonempty("Title is required")
        .min(5, "Title must be at least 5 characters long")
        .max(150, "Title cannot exceed 150 characters"),
    slug: z
        .string()
        .trim()
        .pipe(z.union([
        z.literal(""),
        z.string()
            .min(5, "Slug must be at least 5 characters long")
            .max(150, "Slug cannot exceed 150 characters")
    ]))
        .optional(),
    content: z
        .string()
        .trim()
        .min(50, "Content must be at least 50 characters long"),
    excerpt: z
        .string()
        .trim()
        .pipe(z.union([
        z.literal(""),
        z.string()
            .min(10, "Excerpt must be at least 10 characters long")
            .max(500, "Excerpt cannot exceed 500 characters")
    ]))
        .optional(),
    status: z
        .enum(["DRAFT", "PUBLISHED", "REJECTED", "SUBMITTED"], {
        message: "Invalid article status"
    })
        .default("DRAFT"),
    publishAt: z.preprocess((value) => value === null || value === "" ? undefined : value, z.coerce.date({
        message: "Invalid publish date",
    }).optional()),
    coverImage: z.object({
        url: z
            .string()
            .url("Invalid cover image URL"),
        altTag: z
            .string()
            .trim()
            .max(200, "Alt text cannot exceed 200 characters")
            .optional(),
    }, {
        message: "Cover image is required"
    }),
    categories: z
        .array(z.string().trim().min(1, "Category ID cannot be empty"))
        .min(1, "At least one category is required"),
    tags: z
        .array(z.string().trim().min(1, "Tag ID cannot be empty"))
        .optional(),
    allowComments: z
        .boolean()
        .default(true),
    isFeatured: z
        .boolean()
        .default(false),
    reviewNote: z
        .string()
        .trim()
        .max(2000, "Review note cannot exceed 2000 characters")
        .default(""),
    metaTitle: z
        .string()
        .trim()
        .pipe(z.union([
        z.literal(""),
        z.string()
            .min(5, "Meta title must be at least 5 characters long")
            .max(60, "Meta title cannot exceed 60 characters")
    ]))
        .optional(),
    metaDescription: z
        .string()
        .trim()
        .pipe(z.union([
        z.literal(""),
        z.string()
            .min(10, "Meta description must be at least 10 characters long")
            .max(160, "Meta description cannot exceed 160 characters")
    ]))
        .optional(),
    metaKeywords: z
        .string()
        .trim()
        .pipe(z.union([
        z.literal(""),
        z.string()
            .min(2, "Meta keywords must be at least 2 characters long")
            .max(500, "Meta keywords cannot exceed 500 characters")
    ]))
        .optional()
});
//# sourceMappingURL=article.validation.js.map