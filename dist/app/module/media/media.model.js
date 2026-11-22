import { Schema, Types, model } from "mongoose";
const mediaSchema = new Schema({
    name: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    publicId: { type: String, required: true },
    altTag: { type: String, trim: true, default: "" },
    type: { type: String, enum: ["image", "video", "audio", "document", "other"], required: true },
    mimeType: { type: String, trim: true, default: "" },
    extension: { type: String, required: true, lowercase: true },
    size: { type: Number, required: true },
    uploader: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
mediaSchema.index({
    name: "text"
});
mediaSchema.index({
    uploader: 1,
    createdAt: -1
});
mediaSchema.index({
    type: 1,
    createdAt: -1
});
mediaSchema.index({
    type: 1,
    uploader: 1,
    createdAt: -1
});
export const Media = model("Media", mediaSchema);
//# sourceMappingURL=media.model.js.map