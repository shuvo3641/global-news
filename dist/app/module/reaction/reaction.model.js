import { Schema, Types, model } from "mongoose";
const reactionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["COMMENT", "ARTICLE"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reactionType: { type: String, enum: ["LIKE", "DISLIKE"], required: true },
}, { timestamps: true });
reactionSchema.index({
    user: 1,
    targetId: 1,
    targetType: 1
}, {
    unique: true,
    name: "unique_user_target_reaction"
});
export const Reaction = model("Reaction", reactionSchema);
//# sourceMappingURL=reaction.model.js.map