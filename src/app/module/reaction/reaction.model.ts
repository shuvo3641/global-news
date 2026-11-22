import { Schema, Types, model } from "mongoose";

export type IReaction = {
    user: Types.ObjectId;
    targetType: "COMMENT" | "ARTICLE";
    targetId: Types.ObjectId;
    reactionType: "LIKE" | "DISLIKE";
};

const reactionSchema = new Schema<IReaction>({

    user: {type: Schema.Types.ObjectId, ref: "User", required: true},

    targetType: {type: String, enum: ["COMMENT", "ARTICLE"], required: true},

    targetId: {type: Schema.Types.ObjectId, required: true},

    reactionType: {type: String, enum: ["LIKE", "DISLIKE"], required: true},

}, {timestamps: true});

reactionSchema.index({
    user: 1,
    targetId: 1,
    targetType: 1
}, {
    unique: true,
    name: "unique_user_target_reaction"
})

export const Reaction = model("Reaction", reactionSchema);