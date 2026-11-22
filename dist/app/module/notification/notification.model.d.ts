import { Schema, Types } from "mongoose";
declare const NOTIFICATION_TYPES: readonly ["COMMENT_ARTICLE", "COMMENT_REPLY", "COMMENT_REACTION", "ARTICLE_SUBMIT", "ARTICLE_DELETE", "ARTICLE_UPDATE", "ARTICLE_PUBLISH", "ARTICLE_REJECT", "ARTICLE_REACTION", "USER_CONTACT"];
type NotificationType = (typeof NOTIFICATION_TYPES)[number];
declare const TARGET_CATEGORIES: readonly ["ARTICLE", "COMMENT", "CONTACT"];
type TargetCategory = (typeof TARGET_CATEGORIES)[number];
export type INotification = {
    recipient: Types.ObjectId;
    sender: Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    targetCategory: TargetCategory;
    targetId?: Types.ObjectId | null;
    isRead: boolean;
};
export declare const Notification: import("mongoose").Model<INotification, {}, {}, {
    id: string;
}, import("mongoose").Document<unknown, {}, INotification, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<INotification & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, Schema<INotification, import("mongoose").Model<INotification, any, any, any, any, any, INotification>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, INotification, import("mongoose").Document<unknown, {}, INotification, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<INotification & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    recipient?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, INotification, import("mongoose").Document<unknown, {}, INotification, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<INotification & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    sender?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, INotification, import("mongoose").Document<unknown, {}, INotification, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<INotification & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    type?: import("mongoose").SchemaDefinitionProperty<"ARTICLE_DELETE" | "ARTICLE_PUBLISH" | "ARTICLE_REACTION" | "ARTICLE_REJECT" | "ARTICLE_SUBMIT" | "ARTICLE_UPDATE" | "COMMENT_ARTICLE" | "COMMENT_REACTION" | "COMMENT_REPLY" | "USER_CONTACT", INotification, import("mongoose").Document<unknown, {}, INotification, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<INotification & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    title?: import("mongoose").SchemaDefinitionProperty<string, INotification, import("mongoose").Document<unknown, {}, INotification, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<INotification & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    message?: import("mongoose").SchemaDefinitionProperty<string, INotification, import("mongoose").Document<unknown, {}, INotification, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<INotification & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    targetCategory?: import("mongoose").SchemaDefinitionProperty<"ARTICLE" | "COMMENT" | "CONTACT", INotification, import("mongoose").Document<unknown, {}, INotification, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<INotification & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    targetId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null | undefined, INotification, import("mongoose").Document<unknown, {}, INotification, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<INotification & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
    isRead?: import("mongoose").SchemaDefinitionProperty<boolean, INotification, import("mongoose").Document<unknown, {}, INotification, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<INotification & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>>;
}, INotification>, INotification>;
export {};
//# sourceMappingURL=notification.model.d.ts.map