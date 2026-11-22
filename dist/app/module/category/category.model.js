import { Schema, model } from "mongoose";
const categorySchema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: {
        url: { type: String, trim: true, default: "" },
        publicId: { type: String, trim: true, default: "" }
    },
    description: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
// Text Index
categorySchema.index({
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
categorySchema.index({
    isActive: 1,
    createdAt: -1
});
export const Category = model("Category", categorySchema);
//# sourceMappingURL=category.model.js.map