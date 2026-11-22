import {Schema, Types, model} from "mongoose"

interface IMedia {
    name: string,
    url: string,
    publicId: string,
    altTag?: string,
    type: "image" | "video" | "audio" | "document" | "other",
    mimeType: string,
    extension: string,
    size: number,
    uploader: Types.ObjectId
}

const mediaSchema = new Schema<IMedia>({

    name: {type: String, required: true},

    url: {type: String, required: true, unique: true},

    publicId: {type: String, required: true},

    altTag: {type: String, trim: true, default: ""},

    type: {type: String, enum: ["image", "video", "audio", "document", "other"], required: true},

    mimeType: {type: String, trim: true, default: ""},

    extension: {type: String, required: true, lowercase: true},

    size: {type: Number, required: true},

    uploader: {type: Schema.Types.ObjectId, ref: "User", required: true}

}, {timestamps: true})

mediaSchema.index({
    name: "text"
})

mediaSchema.index({
    uploader: 1,
    createdAt: -1
})

mediaSchema.index({
    type: 1,
    createdAt: -1
})

mediaSchema.index({
    type: 1,
    uploader: 1,
    createdAt: -1
})

export const Media = model<IMedia>("Media", mediaSchema)