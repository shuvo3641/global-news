import type { HydratedDocument } from "mongoose";
import { type IArticle } from "./article.model.js";
export declare const checkArticleExistsByCategoryID: (id: string) => Promise<{
    _id: import("mongodb").ObjectId;
} | null>;
export declare const checkArticleExistsByTagID: (id: string) => Promise<{
    _id: import("mongodb").ObjectId;
} | null>;
export declare const checkArticleExistsBySlug: (slug: string) => Promise<{
    _id: import("mongodb").ObjectId;
} | null>;
export declare const findArticleById: (id: string) => Promise<HydratedDocument<IArticle> | null>;
export declare const totalArticleCount: (filter: any) => Promise<number>;
//# sourceMappingURL=article.service.d.ts.map