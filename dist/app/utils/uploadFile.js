import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import { config } from "../config/config.js";
export const uploadFile = async (res, filePath, folder, resourceType) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `${config.appName}/${folder}`,
            resource_type: resourceType
        });
        return {
            url: result?.secure_url,
            publicId: result?.public_id
        };
    }
    catch (error) {
        throw new Error("File upload failed");
    }
    finally {
        await fs.promises.unlink(filePath);
    }
};
//# sourceMappingURL=uploadFile.js.map