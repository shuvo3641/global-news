import { Schema, model } from "mongoose";
const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatar: {
        url: { type: String, trim: true, default: "" },
        publicId: { type: String, trim: true, default: "" }
    },
    provider: { type: String, enum: ["GOOGLE", "CREDENTIALS"], required: true },
    password: { type: String, select: false },
    role: { type: String, enum: ["USER", "JOURNALIST", "EDITOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"], default: "USER" },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });
userSchema.index({
    name: "text",
    email: "text"
}, {
    weights: {
        name: 10,
        email: 5
    }
});
userSchema.index({
    role: 1,
    isBlocked: 1,
    isDeleted: 1,
    createdAt: -1
});
export const User = model("User", userSchema);
//# sourceMappingURL=user.model.js.map