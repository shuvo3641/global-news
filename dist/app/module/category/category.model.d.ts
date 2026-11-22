export interface ICategory {
    image?: {
        url: string;
        publicId: string;
    };
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
}
export declare const Category: import("mongoose").Model<ICategory, {}, {}, {}, import("mongoose").Document<unknown, {}, ICategory, {}, import("mongoose").DefaultSchemaOptions> & ICategory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, ICategory>;
//# sourceMappingURL=category.model.d.ts.map