import { model, Schema } from "mongoose";

interface ISettings {
    type: "app" | "about" | "contact",
    data: any
}

const settingsSchema = new Schema<ISettings>({

    type: {type: String, enum: ["app", "about", "contact"], required: true, unique: true},

    data: {type: Schema.Types.Mixed, default: {}}

}, {timestamps: true})

export const Settings = model<ISettings>("Settings", settingsSchema)