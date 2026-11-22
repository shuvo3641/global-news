import type { Response } from "express"
import fs from "fs"
import cloudinary from "../config/cloudinary.js"
import { config } from "../config/config.js"

export const uploadFile = async (res: Response, filePath: string, folder: string, resourceType: "image" | "video" | "raw" | "auto") => {
    try {
        const result: any = await cloudinary.uploader.upload(filePath, {
            folder: `${config.appName}/${folder}`,
            resource_type: resourceType
        })

        return {
            url: result?.secure_url, 
            publicId: result?.public_id
        }
    } catch (error) {
        throw new Error("File upload failed")
    } finally {
        await fs.promises.unlink(filePath)
    }
}