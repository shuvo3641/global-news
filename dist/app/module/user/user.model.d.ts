export interface IUser {
    name: string;
    email: string;
    avatar: {
        url: string;
        publicId: string;
    };
    provider: "GOOGLE" | "CREDENTIALS";
    password: string;
    role: "USER" | "JOURNALIST" | "EDITOR" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
    isBlocked: boolean;
    isDeleted: boolean;
}
export declare const User: import("mongoose").Model<IUser, {}, {}, {}, import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
//# sourceMappingURL=user.model.d.ts.map