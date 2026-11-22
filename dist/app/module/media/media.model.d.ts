import { Types } from "mongoose";
interface IMedia {
    name: string;
    url: string;
    publicId: string;
    altTag?: string;
    type: "image" | "video" | "audio" | "document" | "other";
    mimeType: string;
    extension: string;
    size: number;
    uploader: Types.ObjectId;
}
export declare const Media: import("mongoose").Model<IMedia, {}, {}, {}, import("mongoose").Document<unknown, {}, IMedia, {}, import("mongoose").DefaultSchemaOptions> & IMedia & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IMedia>;
export {};
//# sourceMappingURL=media.model.d.ts.map