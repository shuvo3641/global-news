import { model, Schema, Types } from "mongoose";
const contactMessageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });
contactMessageSchema.index({
    isRead: 1,
    createdAt: -1
});
export const ContactMessage = model("ContactMessages", contactMessageSchema, "contact_messages");
//# sourceMappingURL=contact.model.js.map