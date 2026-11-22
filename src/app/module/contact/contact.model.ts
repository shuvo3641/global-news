import { model, Schema, Types } from "mongoose";

export type IContactMessage = {
    sender: Types.ObjectId,
    fullName: string,
    subject: string,
    message: string,
    isRead: boolean
}

const contactMessageSchema = new Schema<IContactMessage>({

    sender: {type: Schema.Types.ObjectId, ref: "User", required: true},

    fullName: {type: String, required: true, trim: true},

    subject: {type: String, required: true, trim: true},

    message: {type: String, required: true, trim: true},

    isRead: {type: Boolean, default: false}

}, {timestamps: true})

contactMessageSchema.index({
    isRead: 1,
    createdAt: -1
})

export const ContactMessage = model<IContactMessage>("ContactMessages", contactMessageSchema, "contact_messages")