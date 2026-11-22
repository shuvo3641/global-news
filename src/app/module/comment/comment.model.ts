import { Schema, Types, model} from "mongoose";

export type IComment = {
    article: Types.ObjectId,
    author: Types.ObjectId,
    parentComment: Types.ObjectId | null,
    content: string,
    status?: "PENDING" | "REJECTED" | "APPROVED"
}

const commentSchema = new Schema<IComment>({

    article: {type: Schema.Types.ObjectId, ref: "Article", required: true},

    author: {type: Schema.Types.ObjectId, ref: "User", required: true},

    parentComment: {type: Schema.Types.ObjectId, ref: "Comment", default: null},

    content: {type: String, trim: true, minlength: 1},

    status: {type: String, enum: ["PENDING", "REJECTED", "APPROVED"], default: "APPROVED"}

}, {timestamps: true})

commentSchema.index({
    status: 1,
    createdAt: -1
})

commentSchema.index({
    article: 1,
    status: 1,
    createdAt: -1
})

export const Comment = model("Comment", commentSchema)