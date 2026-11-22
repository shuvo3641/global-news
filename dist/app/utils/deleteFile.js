import cloudinary from "../config/cloudinary.js";
export const deleteFile = async (publicId, type = "auto") => {
    try {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: type
        });
    }
    catch (error) {
        throw new Error("File deletion failed");
    }
};
//# sourceMappingURL=deleteFile.js.map