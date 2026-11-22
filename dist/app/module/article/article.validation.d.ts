import { z } from "zod";
export declare const createArticleSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodString]>>>;
    content: z.ZodString;
    excerpt: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodString]>>>>;
    status: z.ZodDefault<z.ZodEnum<{
        DRAFT: "DRAFT";
        PUBLISH: "PUBLISH";
    }>>;
    publishAt: z.ZodPreprocess<z.ZodOptional<z.ZodCoercedDate<unknown>>, unknown>;
    coverImage: z.ZodObject<{
        _id: z.ZodString;
        url: z.ZodString;
        altTag: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    categories: z.ZodArray<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    allowComments: z.ZodDefault<z.ZodBoolean>;
    metaTitle: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodString]>>>;
    metaDescription: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodString]>>>;
    metaKeywords: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodString]>>>;
}, z.core.$strip>;
export declare const updateArticleSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodString]>>>;
    content: z.ZodString;
    excerpt: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodString]>>>;
    status: z.ZodDefault<z.ZodEnum<{
        DRAFT: "DRAFT";
        PUBLISHED: "PUBLISHED";
        REJECTED: "REJECTED";
        SUBMITTED: "SUBMITTED";
    }>>;
    publishAt: z.ZodPreprocess<z.ZodOptional<z.ZodCoercedDate<unknown>>, unknown>;
    coverImage: z.ZodObject<{
        url: z.ZodString;
        altTag: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    categories: z.ZodArray<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    allowComments: z.ZodDefault<z.ZodBoolean>;
    isFeatured: z.ZodDefault<z.ZodBoolean>;
    reviewNote: z.ZodDefault<z.ZodString>;
    metaTitle: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodString]>>>;
    metaDescription: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodString]>>>;
    metaKeywords: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodString]>>>;
}, z.core.$strip>;
//# sourceMappingURL=article.validation.d.ts.map