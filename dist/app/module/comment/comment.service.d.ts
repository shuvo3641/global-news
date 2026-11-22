import { type IComment } from "./comment.model.js";
export declare const createCommentItem: (data: IComment) => Promise<import("mongoose").Document<unknown, {}, IComment, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<IComment & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>>;
//# sourceMappingURL=comment.service.d.ts.map