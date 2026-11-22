import { Types } from "mongoose";
export type IContactMessage = {
    sender: Types.ObjectId;
    fullName: string;
    subject: string;
    message: string;
    isRead: boolean;
};
export declare const ContactMessage: import("mongoose").Model<IContactMessage, {}, {}, {}, import("mongoose").Document<unknown, {}, IContactMessage, {}, import("mongoose").DefaultSchemaOptions> & IContactMessage & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IContactMessage>;
//# sourceMappingURL=contact.model.d.ts.map