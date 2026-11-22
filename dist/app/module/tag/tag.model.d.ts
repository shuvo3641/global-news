export interface ITag {
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
}
export declare const Tag: import("mongoose").Model<ITag, {}, {}, {}, import("mongoose").Document<unknown, {}, ITag, {}, import("mongoose").DefaultSchemaOptions> & ITag & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, ITag>;
//# sourceMappingURL=tag.model.d.ts.map