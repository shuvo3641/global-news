import type { Request, Response } from "express";
import { TryCatch } from "../../middleware/TryCatch.js";
import formidable from "formidable";
import { responseHandler } from "../../utils/responseHandler.js";
import path from "path";
import { uploadFile } from "../../utils/uploadFile.js";
import { Media } from "./media.model.js";
import { updateMediaSchema } from "./media.validation.js";
import { zodErrorHandler } from "../../utils/zodErrorHandler.js";
import sanitize from "mongo-sanitize";
import { deleteFile } from "../../utils/deleteFile.js";
import mongoose from "mongoose";


// Upload Media
export const uploadMedia = TryCatch(async (req: Request, res: Response) => {

    // My ID
    const myId: string = req?.user?._id?.toString() || ""

    // Parse Form Data
    const form = formidable({})
    let fields
    let files: any
    try {
        [fields, files] = await form.parse(req)
    } catch (err) {
        return responseHandler(res, 500, "Failed to fetch form data")
    }

    // Files Data
    const filesData: {
        filepath: string,
        originalFilename: string,
        mimetype: string,
        size: number,
        fileExtension: string,
        type: string
    }[] = []
    if(files?.file && Array.isArray(files?.file) && files?.file?.length > 0) {
        files?.file?.forEach((item: any) => {
            filesData.push({
                filepath: item?.filepath,
                originalFilename: item?.originalFilename,
                mimetype: item?.mimetype,
                size: item?.size,
                fileExtension: path.extname(item?.originalFilename),
                type: item?.mimetype?.startsWith("image") ? "image" : item?.mimetype?.startsWith("video") ? "video" : item?.mimetype?.startsWith("audio") ? "audio" : item?.mimetype?.startsWith("application/pdf") ? "document" : "other"
            })
        });
    }

    // Validate
    let totalFilesSize = 0
    for(let item of filesData) {
        totalFilesSize += item?.size
        if(item?.size > 512 * 1024 * 1024) {
            return responseHandler(res, 400, "Each file size must not exceed 512 MB")
        }
    }
    if(totalFilesSize > 1024 * 1024 * 1024) {
        return responseHandler(res, 400, "Total upload size must not exceed 1 GB")
    }

    // Upload Files To Cloudinary
    const uploadedFilesData: {
        name: string,
        url: string,
        publicId: string,
        altTag: string,
        type: string,
        mimeType: string,
        extension: string,
        size: number,
        uploader: string
    }[] = []
    for(let item of filesData) {
        // Find Type
        let type: "image" | "video" | "auto" | "raw" = "auto"
        if(item?.type === "image") {
            type = "image"
        }else if(item?.type === "video" || item?.type === "audio") {
            type = "video"
        }else {
            type = "raw"
        }

        // Upload File
        const fileUploadResult: any = await uploadFile(res, item?.filepath, "uploads", type)

        // Extract Uploaded Data
        uploadedFilesData.push({
            name: item?.originalFilename,
            url: fileUploadResult?.url,
            publicId: fileUploadResult?.publicId,
            altTag: "",
            type: item?.type,
            mimeType: item?.mimetype,
            extension: item?.fileExtension,
            size: item?.size,
            uploader: myId
        })
    }

    // Save Data To DB
    await Media.insertMany(uploadedFilesData)

    return responseHandler(res, 201, "Media uploaded successfully")

})


// Get Media Stats
export const getMediaStats = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser = req?.user

    // Filter
    const filter: any = {}
    if(currentUser?.role === "JOURNALIST") {
        filter.uploader = currentUser?._id
    }

    // Recent Date
    const recentDate = new Date()
    recentDate.setDate(recentDate.getDate() - 7)

    // Stats
    const stats = await Media.aggregate([

        {
            $match: filter
        },

        {
            $facet: {

                // Total files
                totalFiles: [
                    {
                        $count: "count"
                    }
                ],

                // Total Size
                totalSize: [
                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: "$size"
                            }
                        }
                    }
                ],

                // File Types
                fileTypes: [
                    {
                        $group: {
                            _id: null,
                            types: {
                                $addToSet: "$extension"
                            }
                        }
                    },

                    {
                        $project: {
                            _id: 0,
                            types: {
                                $size: "$types"
                            }
                        }
                    }
                ],

                recentUploads: [
                    {
                        $match: {
                            createdAt: {
                                $gte: recentDate
                            }
                        }
                    },

                    {
                        $count: "count"
                    }
                ]

            }
        },

        {
            $project: {
                totalFiles: {
                    $ifNull: [
                        {
                            $arrayElemAt: ["$totalFiles.count", 0]
                        },
                        0
                    ]
                },
                totalSize: {
                    $ifNull: [
                        {
                            $arrayElemAt: ["$totalSize.total", 0]
                        },
                        0
                    ]
                },
                fileTypes: {
                    $ifNull: [
                        {
                            $arrayElemAt: ["$fileTypes.types", 0]
                        },
                        0
                    ]
                },
                recentUploads: {
                    $ifNull: [
                        {
                            $arrayElemAt: ["$recentUploads.count", 0]
                        },
                        0
                    ]
                }
            }
        }

    ])

    return responseHandler(res, 200, "Media stats fetched successfully", {
        stats: stats[0]
    })

})


// Get Media
export const getMedia = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser = req?.user

    // Filter Data
    let {type="", search="", limit=30, page=1} = req.query
    
    // Convert Type
    type = type?.toString().trim() || ""
    search = search?.toString().trim() || ""
    limit = Number(limit)
    page = Number(page)

    // Validate
    if(limit > 100) {
        limit = 100
    }

    // Filter
    const filter: any = {}
    if(type !== "" && type !== "all" && ["image", "video", "audio", "document", "other"].includes(type)) {
        filter.type = type
    }
    if(search) {
        filter.$text = {
            $search: search
        }
    }
    if(currentUser?.role === "JOURNALIST") {
        filter.uploader = currentUser?._id
    }

    // Pagination
    const skip = (page - 1) * limit

    // Find Media
    const media = await Media.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(search ? {score: {$meta: "textScore"}} : {createdAt: -1})

    // Total Items
    const totalItems = await Media.countDocuments(filter)

    // Pagination
    const pagination = {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),

        page,
        limit,

        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalItems / limit),

        from: totalItems === 0 ? 0 : (page - 1) * limit + 1,
        to: Math.min(page * limit, totalItems)
    }

    return responseHandler(res, 200, "Media fetched successfully", {
        media,
        pagination
    })

})


// Update Media
export const updateMedia = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser = req.user

    // ID From Params
    const {id} = req.params

    // Data From Body
    const {name, altTag} = req.body

    // Validate ID
    if(!id) {
        return responseHandler(res, 400, "Media ID is required")
    }
    if(!mongoose.isValidObjectId(id)) {
        return responseHandler(res, 400, "Invalid media ID")
    }

    // Validate Body Data
    const validate = updateMediaSchema.safeParse({name, altTag})
    if(!validate?.success) {
        return zodErrorHandler(res, validate)
    }

    // Sanitize
    const {name: mediaName, altTag: mediaAltTag} = sanitize(validate?.data)
    
    // Find Media By ID
    let media
    if(currentUser?.role === "JOURNALIST") {
        media = await Media.findOne({
            _id: id,
            uploader: currentUser?._id
        })
    }else {
        media = await Media.findOne({_id: id})
    }

    // Check Media Found
    if(!media) {
        return responseHandler(res, 404, "Media not found")
    }

    // Set Updated Data
    media.name = mediaName
    media.altTag = mediaAltTag || ""
    await media.save()

    return responseHandler(res, 200, "Media updated successfully")

})


// Delete Media
export const deleteMedia = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser = req.user

    // ID From Params
    const {id} = req.params

    // Validate ID
    if(!id) {
        return responseHandler(res, 400, "Media ID is required")
    }
    if(!mongoose.isValidObjectId(id)) {
        return responseHandler(res, 400, "Invalid media ID")
    }
    
    // Find Media By ID
    let media
    if(currentUser?.role === "JOURNALIST") {
        media = await Media.findOne({
            _id: id,
            uploader: currentUser?._id
        })
    }else {
        media = await Media.findOne({_id: id})
    }

    // Check Media Found
    if(!media) {
        return responseHandler(res, 404, "Media not found")
    }

    // Delete Files From DB
    // Find Type
    let type: "image" | "video" | "auto" | "raw" = "auto"
    if(media?.type === "image") {
        type = "image"
    }else if(media?.type === "video" || media?.type === "audio") {
        type = "video"
    }else {
        type = "raw"
    }
    await deleteFile(media.publicId, type)

    // Delete
    await Media.findByIdAndDelete(media._id)

    return responseHandler(res, 200, "Media deleted successfully")

})