import { Schema, Types } from "mongoose";
export type IComment = {
    article: Types.ObjectId;
    author: Types.ObjectId;
    parentComment: Types.ObjectId | null;
    content: string;
    status?: "PENDING" | "REJECTED" | "APPROVED";
};
export declare const Comment: import("mongoose").Model<IComment, {}, {}, {
    id: string;
}, import("mongoose").Document<unknown, {}, IComment, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<IComment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, Schema<IComment, import("mongoose").Model<IComment, any, any, any, any, any, IComment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IComment, import("mongoose").Document<unknown, {}, IComment, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<IComment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    article?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, IComment, import("mongoose").Document<unknown, {}, IComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    author?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, IComment, import("mongoose").Document<unknown, {}, IComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    parentComment?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, IComment, import("mongoose").Document<unknown, {}, IComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    content?: import("mongoose").SchemaDefinitionProperty<string, IComment, import("mongoose").Document<unknown, {}, IComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    status?: import("mongoose").SchemaDefinitionProperty<"APPROVED" | "PENDING" | "REJECTED" | undefined, IComment, import("mongoose").Document<unknown, {}, IComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, IComment>, IComment>;
//# sourceMappingURL=comment.model.d.ts.map