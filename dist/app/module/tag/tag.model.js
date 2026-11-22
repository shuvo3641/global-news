import { Schema, model } from "mongoose";
const tagSchema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
// Text Index
tagSchema.index({
    name: "text",
    slug: "text",
    description: "text"
}, {
    weights: {
        name: 10,
        slug: 5,
        description: 1
    }
});
// Active / Inactive + newest first
tagSchema.index({
    isActive: 1,
    createdAt: -1
});
export const Tag = model("Tag", tagSchema);
//# sourceMappingURL=tag.model.js.map