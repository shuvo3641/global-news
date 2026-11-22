export declare const findUserByEmail: (email: string) => Promise<(import("mongoose").Document<unknown, {}, import("./user.model.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & import("./user.model.js").IUser & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const findUserByEmailWithPassword: (email: string) => Promise<(import("mongoose").Document<unknown, {}, import("./user.model.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & import("./user.model.js").IUser & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const findUserById: (id: string) => Promise<(import("mongoose").Document<unknown, {}, import("./user.model.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & import("./user.model.js").IUser & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const findUsers: (filter: any, skip: number, limit: number) => Promise<(import("mongoose").Document<unknown, {}, import("./user.model.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & import("./user.model.js").IUser & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
})[]>;
export declare const getTotalUsers: (filter: any) => Promise<number>;
export declare const createUserAccount: (userData: {
    name: string;
    email: string;
    provider?: "GOOGLE" | "CREDENTIALS";
    password?: string;
    role?: "USER" | "JOURNALIST" | "EDITOR" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
}) => Promise<import("mongoose").Document<unknown, {}, import("./user.model.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & import("./user.model.js").IUser & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}>;
//# sourceMappingURL=user.service.d.ts.map