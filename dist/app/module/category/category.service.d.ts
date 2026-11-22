import { type ICategory } from "./category.model.js";
export declare const findCategoryById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, ICategory, {}, import("mongoose").DefaultSchemaOptions> & ICategory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const findCategoryBySlug: (slug: string) => Promise<(import("mongoose").Document<unknown, {}, ICategory, {}, import("mongoose").DefaultSchemaOptions> & ICategory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const createCategoryItem: (categoryData: ICategory) => Promise<import("mongoose").Document<unknown, {}, ICategory, {}, import("mongoose").DefaultSchemaOptions> & ICategory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}>;
export declare const getTotalCategories: (filter: any) => Promise<number>;
export declare const deleteCategoryById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, ICategory, {}, import("mongoose").DefaultSchemaOptions> & ICategory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
//# sourceMappingURL=category.service.d.ts.map