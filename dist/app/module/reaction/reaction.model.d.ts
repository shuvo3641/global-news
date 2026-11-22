import { Schema, Types } from "mongoose";
export type IReaction = {
    user: Types.ObjectId;
    targetType: "COMMENT" | "ARTICLE";
    targetId: Types.ObjectId;
    reactionType: "LIKE" | "DISLIKE";
};
export declare const Reaction: import("mongoose").Model<IReaction, {}, {}, {
    id: string;
}, import("mongoose").Document<unknown, {}, IReaction, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<IReaction & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, Schema<IReaction, import("mongoose").Model<IReaction, any, any, any, any, any, IReaction>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IReaction, import("mongoose").Document<unknown, {}, IReaction, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<IReaction & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    user?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, IReaction, import("mongoose").Document<unknown, {}, IReaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IReaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    targetType?: import("mongoose").SchemaDefinitionProperty<"ARTICLE" | "COMMENT", IReaction, import("mongoose").Document<unknown, {}, IReaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IReaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    targetId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, IReaction, import("mongoose").Document<unknown, {}, IReaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IReaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    reactionType?: import("mongoose").SchemaDefinitionProperty<"DISLIKE" | "LIKE", IReaction, import("mongoose").Document<unknown, {}, IReaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<IReaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, IReaction>, IReaction>;
//# sourceMappingURL=reaction.model.d.ts.map