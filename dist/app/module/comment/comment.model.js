import { Schema, Types, model } from "mongoose";
const commentSchema = new Schema({
    article: { type: Schema.Types.ObjectId, ref: "Article", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    content: { type: String, trim: true, minlength: 1 },
    status: { type: String, enum: ["PENDING", "REJECTED", "APPROVED"], default: "APPROVED" }
}, { timestamps: true });
commentSchema.index({
    status: 1,
    createdAt: -1
});
commentSchema.index({
    article: 1,
    status: 1,
    createdAt: -1
});
export const Comment = model("Comment", commentSchema);
//# sourceMappingURL=comment.model.js.map