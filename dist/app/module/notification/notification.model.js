import { model, Schema, Types } from "mongoose";
// Notification Types
const NOTIFICATION_TYPES = [
    "COMMENT_ARTICLE",
    "COMMENT_REPLY",
    "COMMENT_REACTION",
    "ARTICLE_SUBMIT",
    "ARTICLE_DELETE",
    "ARTICLE_UPDATE",
    "ARTICLE_PUBLISH",
    "ARTICLE_REJECT",
    "ARTICLE_REACTION",
    "USER_CONTACT"
];
// Target Categories
const TARGET_CATEGORIES = [
    "ARTICLE",
    "COMMENT",
    "CONTACT"
];
const notificationSchema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, trim: true, required: true },
    message: { type: String, trim: true, required: true },
    targetCategory: { type: String, enum: TARGET_CATEGORIES, required: true },
    targetId: { type: Schema.Types.ObjectId, default: null },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });
notificationSchema.index({
    isRead: 1,
    createdAt: -1
});
export const Notification = model("Notification", notificationSchema);
//# sourceMappingURL=notification.model.js.map