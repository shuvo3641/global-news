import { TryCatch } from "../../middleware/TryCatch.js";
import { responseHandler } from "../../utils/responseHandler.js";
import { Settings } from "./settings.model.js";
import { appSettingsFieldsSchema, contactSettingsSchema } from "./settings.validation.js";
import { zodErrorHandler } from "../../utils/zodErrorHandler.js";
import sanitize from "mongo-sanitize";
import { uploadFile } from "../../utils/uploadFile.js";
import formidable from "formidable";
import cloudinary from "../../config/cloudinary.js";
import { deleteRedisData, getRedisData, setRedisData } from "../../services/redis.service.js";
// Update App Settings
export const updateAppSettings = TryCatch(async (req, res) => {
    // Parse Form Data
    const form = formidable({});
    let fields;
    let files;
    try {
        [fields, files] = await form.parse(req);
    }
    catch (err) {
        return responseHandler(res, 500, "Failed to parse form data");
    }
    // Extract Fields
    const fieldsData = {
        appName: "",
        tagline: "",
        appDescription: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: []
    };
    if (fields?.appName && Array.isArray(fields?.appName) && fields?.appName?.length > 0) {
        fieldsData.appName = fields.appName[0];
    }
    if (fields?.tagline && Array.isArray(fields?.tagline) && fields?.tagline?.length > 0) {
        fieldsData.tagline = fields.tagline[0];
    }
    if (fields?.appDescription && Array.isArray(fields?.appDescription) && fields?.appDescription?.length > 0) {
        fieldsData.appDescription = fields.appDescription[0];
    }
    if (fields?.metaTitle && Array.isArray(fields?.metaTitle) && fields?.metaTitle?.length > 0) {
        fieldsData.metaTitle = fields.metaTitle[0];
    }
    if (fields?.metaDescription && Array.isArray(fields?.metaDescription) && fields?.metaDescription?.length > 0) {
        fieldsData.metaDescription = fields.metaDescription[0];
    }
    if (fields?.metaKeywords && Array.isArray(fields?.metaKeywords) && fields?.metaKeywords?.length > 0) {
        fieldsData.metaKeywords = fields.metaKeywords[0].split(",").map((item) => item.trim());
    }
    // Validate Fields
    const validate = appSettingsFieldsSchema.safeParse(fieldsData);
    if (!validate.success) {
        return zodErrorHandler(res, validate);
    }
    // Sanitize Data
    const { appName, tagline, appDescription, metaTitle, metaDescription, metaKeywords } = sanitize(validate.data);
    // Files From Formidable
    let logo = {};
    let favicon = {};
    if (files?.logo && Array.isArray(files.logo) && files?.logo?.length > 0) {
        logo.filePath = files?.logo?.[0]?.filepath;
        logo.mimetype = files?.logo?.[0]?.mimetype;
        logo.size = files?.logo?.[0]?.size;
    }
    if (files?.favicon && Array.isArray(files.favicon) && files?.favicon?.length > 0) {
        favicon.filePath = files?.favicon?.[0]?.filepath;
        favicon.mimetype = files?.favicon?.[0]?.mimetype;
        favicon.size = files?.favicon?.[0]?.size;
    }
    // Validate Files
    if (logo?.filePath) {
        if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(logo?.mimetype)) {
            return responseHandler(res, 400, "Only PNG, JPG, WEBP or SVG files are allowed");
        }
        if (logo?.size > 5 * 1024 * 1024) {
            return responseHandler(res, 400, "Image size must be less than 5MB");
        }
    }
    if (favicon?.filePath) {
        if (!["image/png", "image/x-icon", "image/svg+xml"].includes(favicon?.mimetype)) {
            return responseHandler(res, 400, "Only PNG, ICO or SVG files are allowed");
        }
        if (favicon?.size > 1024 * 1024) {
            return responseHandler(res, 400, "Favicon size must be less than 1MB");
        }
    }
    // Uploaded Files Data
    let uploadedLogo = {
        url: "",
        publicId: ""
    };
    let uploadedFavicon = {
        url: "",
        publicId: ""
    };
    // Upload Files to Cloudinary
    if (logo?.filePath) {
        uploadedLogo = await uploadFile(res, logo?.filePath, "settings", "image");
    }
    if (favicon?.filePath) {
        uploadedFavicon = await uploadFile(res, favicon?.filePath, "settings", "image");
    }
    // Find App Settings
    const settings = await Settings.findOne({
        type: "app"
    });
    // Create New Settings
    if (!settings) {
        await Settings.create({
            type: "app",
            data: {
                appName,
                tagline,
                appDescription,
                logo: {
                    url: uploadedLogo?.url ? uploadedLogo?.url : "",
                    publicId: uploadedLogo?.publicId ? uploadedLogo?.publicId : ""
                },
                favicon: {
                    url: uploadedFavicon?.url ? uploadedFavicon?.url : "",
                    publicId: uploadedFavicon?.publicId ? uploadedFavicon?.publicId : ""
                },
                metaTitle,
                metaDescription,
                metaKeywords
            }
        });
        return responseHandler(res, 200, "App settings updated successfully");
    }
    // Delete Prev Images
    if (uploadedLogo?.url && settings?.data?.logo?.publicId) {
        await cloudinary.uploader.destroy(settings.data.logo.publicId);
    }
    if (uploadedFavicon?.url && settings?.data?.favicon?.publicId) {
        await cloudinary.uploader.destroy(settings.data.favicon.publicId);
    }
    // Update Existing
    settings.data = {
        appName,
        tagline,
        appDescription,
        logo: {
            url: uploadedLogo?.url ? uploadedLogo?.url : settings?.data?.logo?.url,
            publicId: uploadedLogo?.publicId ? uploadedLogo?.publicId : settings?.data?.logo?.publicId
        },
        favicon: {
            url: uploadedFavicon?.url ? uploadedFavicon?.url : settings?.data?.favicon?.url,
            publicId: uploadedFavicon?.publicId ? uploadedFavicon?.publicId : settings?.data?.favicon?.publicId
        },
        metaTitle,
        metaDescription,
        metaKeywords
    };
    // Save Updated
    await settings.save();
    // Delete Redis Keys
    await deleteRedisData("SETTINGS:app", "SETTINGS:all");
    return responseHandler(res, 200, "App settings updated successfully");
});
// Update Contact Settings
export const updateContactSettings = TryCatch(async (req, res) => {
    // Validate
    const validate = contactSettingsSchema.safeParse(req.body);
    if (!validate?.success) {
        return zodErrorHandler(res, validate);
    }
    // Find Contact Settings
    const settings = await Settings.findOne({
        type: "contact"
    });
    // Create New Settings
    if (!settings) {
        await Settings.create({
            type: "contact",
            data: validate.data
        });
        return responseHandler(res, 200, "Contact settings updated successfully");
    }
    // Extract Validated Data
    const { title, description, email, phone, address, workingHours, socialLinks } = validate.data;
    // Update Existing
    settings.data = {
        title,
        description,
        email,
        phone,
        address,
        workingHours,
        socialLinks
    };
    // Save Updated
    await settings.save();
    // Delete Redis Keys
    await deleteRedisData("SETTINGS:contact", "SETTINGS:all");
    return responseHandler(res, 200, "Contact settings updated successfully");
});
// Get Settings
export const getSettings = TryCatch(async (req, res) => {
    // Type From params
    const { type } = req.params;
    // Validate Type
    if (type && (typeof type !== "string" || !["app", "contact"].includes(type))) {
        return responseHandler(res, 400, "Invalid settings type");
    }
    // Generate Redis Cache Key
    const cacheKey = type ? `SETTINGS:${type}` : "SETTINGS:all";
    // Get Cached Settings
    const cachedSettings = await getRedisData(cacheKey);
    if (cachedSettings !== null) {
        return responseHandler(res, 200, "Settings retrieved successfully", cachedSettings);
    }
    // Get Settings From DB
    const settings = type
        ? await Settings.findOne({ type: type }).lean()
        : await Settings.find().lean();
    // Check Settings
    if (Array.isArray(settings) ? settings.length === 0 : !settings) {
        return responseHandler(res, 404, "Settings not found");
    }
    // Set Settings To Redis
    await setRedisData(cacheKey, settings, 300);
    return responseHandler(res, 200, "Settings retrieved successfully", settings);
});
//# sourceMappingURL=settings.controller.js.map