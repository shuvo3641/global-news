import { Types } from "mongoose";
export interface IArticle {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: {
        url: string;
        altTag: string;
    };
    author: Types.ObjectId;
    categories: Types.ObjectId[];
    tags: Types.ObjectId[];
    isFeatured: boolean;
    allowComments: boolean;
    status: "DRAFT" | "SUBMITTED" | "REJECTED" | "PUBLISHED";
    publishAt: Date | null;
    reviewNote: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
}
export declare const Article: import("mongoose").Model<IArticle, {}, {}, {}, import("mongoose").Document<unknown, {}, IArticle, {}, import("mongoose").DefaultSchemaOptions> & IArticle & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IArticle>;
//# sourceMappingURL=article.model.d.ts.map