import { model, Schema } from "mongoose";
const settingsSchema = new Schema({
    type: { type: String, enum: ["app", "about", "contact"], required: true, unique: true },
    data: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });
export const Settings = model("Settings", settingsSchema);
//# sourceMappingURL=settings.model.js.map