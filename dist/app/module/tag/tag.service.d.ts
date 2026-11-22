import { type ITag } from "./tag.model.js";
export declare const findTagById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, ITag, {}, import("mongoose").DefaultSchemaOptions> & ITag & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const findTagBySlug: (slug: string) => Promise<(import("mongoose").Document<unknown, {}, ITag, {}, import("mongoose").DefaultSchemaOptions> & ITag & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const createTagItem: (tagData: ITag) => Promise<import("mongoose").Document<unknown, {}, ITag, {}, import("mongoose").DefaultSchemaOptions> & ITag & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}>;
export declare const getTotalTags: (filter: any) => Promise<number>;
export declare const deleteTagById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, ITag, {}, import("mongoose").DefaultSchemaOptions> & ITag & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
//# sourceMappingURL=tag.service.d.ts.map