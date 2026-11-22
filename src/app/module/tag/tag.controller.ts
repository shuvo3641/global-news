import type { Request, Response } from "express";
import { TryCatch } from "../../middleware/TryCatch.js";
import { responseHandler } from "../../utils/responseHandler.js";
import { zodErrorHandler } from "../../utils/zodErrorHandler.js";
import sanitize from "mongo-sanitize";
import { generateSlug } from "../../utils/generateSlug.js";
import { tagValidateSchema } from "./tag.validation.js";
import { createTagItem, deleteTagById, findTagById, findTagBySlug, getTotalTags } from "./tag.service.js";
import { Tag } from "./tag.model.js";
import type { PipelineStage } from "mongoose";
import mongoose from "mongoose";
import { checkArticleExistsByTagID } from "../article/article.service.js";
import { deleteRedisData, getRedisData, setRedisData } from "../../services/redis.service.js";


// Create Tag
export const createTag = TryCatch(async (req: Request, res: Response) => {

    // Validate
    const validate = tagValidateSchema.safeParse(req.body)
    if(!validate?.success) {
        return zodErrorHandler(res, validate)
    }

    // Sanitize Validated Data
    const {name: tagName, slug: tagSlug, description: tagDescription, status: tagStatus} = sanitize(validate.data)

    // CTag Data
    const tagData = {
        name: tagName,
        slug: generateSlug(tagSlug || tagName),
        description: tagDescription || "",
        isActive: tagStatus
    }

    // Check Existing Tag By Name (Case-Insensitive)
    const existingTag = await Tag.findOne({
        name: {
            $regex: tagName?.trim(),
            $options: "i"
        }
    })
    if(existingTag) {
        return responseHandler(res, 409, "Tag name already exists")
    }

    // Check Existing Tag By Slug
    let isExist = await findTagBySlug(tagData?.slug)
    if(isExist) {
        let number = 1
        while(isExist) {
            const newSlug = `${tagData?.slug}${number}`
            isExist = await findTagBySlug(newSlug)
            if(!isExist) {
                tagData.slug = newSlug
                break
            }
            number++
        }
    }

    // Create Tag
    await createTagItem(tagData)

    return responseHandler(res, 201, "Tag created successfully")

})


// Get Tags
export const getTags = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser = req.user

    // Query Data From Req.query
    const {search: rawSearch, status: rawStatus, limit: rawLimit, page: rawPage} = req.query

    let search = typeof rawSearch === "string" ? rawSearch?.trim() : ""
    let status = (typeof rawStatus === "string" && ["active", "inactive"].includes(rawStatus)) ? rawStatus : ""
    let limit = typeof Number(rawLimit) === "number" ? Math.min(Number(rawLimit), 100) : 20
    let page = typeof Number(rawPage) === "number" ? Number(rawPage) : 1

    // Filter
    const filter: any = {}

    if(search) {
        filter.$text = {
            $search: search
        }
    }
    if(currentUser?.role && ["EDITOR", "ADMIN", "SUPER_ADMIN"].includes(currentUser?.role)) {
        if(status === "active") {
            filter.isActive = true
        }

        if(status === "inactive") {
            filter.isActive = false
        }
    }else{
        filter.isActive = true
    }

    // Skip
    const skip = (page - 1) * limit

    // Find Tags
    const sortStage: PipelineStage = {
        $sort: search ? {score: {$meta: "textScore"}} : {createdAt: -1}
    }
    const tags = await Tag.aggregate([

        {
            $match: filter
        },

        sortStage,

        {
            $skip: skip
        },

        {
            $limit: limit
        },

        {
            $lookup: {
                from: "articles",
                localField: "_id",
                foreignField: "tags",
                as: "articles"
            }
        },

        {
            $set: {
                postsCount: {
                    $size: "$articles"
                }
            }
        },

        {
            $unset: ["articles"],
        }

    ])


    // Total Tags
    const totalTags = await getTotalTags(filter)

    // Pagination
    const pagination = {
        totalPages: Math.ceil(totalTags / limit),
        totalItems: totalTags,

        page,
        limit,

        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalTags / limit),

        from: totalTags === 0 ? 0 : (page - 1) * limit + 1,
        to: Math.min(page * limit, totalTags)
    }

    return responseHandler(res, 200, "Tags fetched successfully", {
        tags,
        pagination
    })

})


// Get All Tags
export const getAllTags = TryCatch(async (req: Request, res: Response) => {

    // Redis Tags Key
    const redisTagsKey = `TAGS:all`

    // Find Tags From Redis
    const cachedAllTags = await getRedisData(redisTagsKey)
    if(cachedAllTags !== null) {
        return responseHandler(res, 200, "Tags fetched successfully", {
            tags: cachedAllTags
        })
    }

    // Find All Tags
    const tags = await Tag.find({
        isActive: true
    })
    .select("name slug description")
    .sort({name: 1})
    .lean()

    // Set Tags To Redis
    await setRedisData(redisTagsKey, tags, 300)

    return responseHandler(res, 200, "Tags fetched successfully", {
        tags
    })
    
})


// Update Tag
export const updateTag = TryCatch(async (req: Request, res: Response) => {

    // Tag Id From Params
    const {id} = req.params

    // Validate Tag ID
    if(!id) {
        return responseHandler(res, 400, "Tag ID is required")
    }
    if(typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        return responseHandler(res, 400, "Invalid tag ID")
    }

    // Validate
    const validate = tagValidateSchema.safeParse(req.body)
    if(!validate?.success) {
        return zodErrorHandler(res, validate)
    }

    // Sanitize Validated Data
    const {name: tagName, slug: tagSlug, description: tagDescription, status: tagStatus}  = sanitize(validate.data)

    // Tag Data
    const tagData = {
        name: tagName,
        slug: "",
        description: tagDescription || "",
        isActive: tagStatus
    }

    // Find Tag By ID
    const tag = await findTagById(id)
    if(!tag) {
        return responseHandler(res, 404, "Tag not found")
    }

    // Check Existing Tag By Name (Case-Insensitive)
    const existingTag = await Tag.findOne({
        _id: { $ne: id },
        name: {
            $regex: tagName?.trim(),
            $options: "i"
        }
    })
    if(existingTag) {
        return responseHandler(res, 409, "Tag name already exists")
    }

    // Slug
    if(tagSlug?.trim()) {
        tagData.slug = generateSlug(tagSlug)
    }else{
        tagData.slug = tag?.slug
    }

    // Check Existing Tag By Slug
    let isExist = await Tag.findOne({
        _id: {$ne: id},
        slug: generateSlug(tagData?.slug)
    })
    if(isExist) {
        let number = 1
        while(isExist) {
            const newSlug = `${tagData?.slug}${number}`
            isExist = await findTagBySlug(newSlug)
            if(!isExist) {
                tagData.slug = newSlug
                break
            }
            number++
        }
    }

    // Update Tag Data
    tag.name = tagData?.name
    tag.slug = tagData?.slug
    tag.description = tagData?.description
    tag.isActive = tagData?.isActive
    await tag.save()

    // Delete Cached Tags
    await deleteRedisData(`TAGS:all`)
    
    return responseHandler(res, 200, "Tag updated successfully")

})


// Toggle Tag Status
export const toggleTagStatus = TryCatch(async (req: Request, res: Response) => {

    // Tag Id From Params
    const {id} = req.params

    // Validate Tag ID
    if(!id) {
        return responseHandler(res, 400, "Tag ID is required")
    }
    if(typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        return responseHandler(res, 400, "Invalid tag ID")
    }

    // Find Tag By ID
    const tag = await findTagById(id)
    if(!tag) {
        return responseHandler(res, 404, "Tag not found")
    }

    // Toggle Status
    tag.isActive = !tag.isActive
    await tag.save()

    // Delete Cached Tags
    await deleteRedisData(`TAGS:all`)

    return responseHandler(res, 200, `Tag ${tag.isActive ? "activated" : "deactivated"} successfully`)

})


// Delete Tag
export const deleteTag = TryCatch(async (req: Request, res: Response) => {
  
    // Tag Id From Params
    const {id} = req.params

    // Validate Tag ID
    if(!id) {
        return responseHandler(res, 400, "Tag ID is required")
    }
    if(typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        return responseHandler(res, 400, "Invalid tag ID")
    }

    // Find Tag By ID
    const tag = await findTagById(id)
    if(!tag) {
        return responseHandler(res, 404, "Tag not found")
    }

    // Check Article Exists
    const articles = await checkArticleExistsByTagID(tag?._id?.toString())
    if(articles) {
        return responseHandler(res, 400, "This tag cannot be deleted because it is assigned to one or more articles")
    }

    // Delete Tag
    await deleteTagById(tag?.id?.toString())

    // Delete Cached Tags
    await deleteRedisData(`TAGS:all`)

    return responseHandler(res, 200, "Tag deleted successfully")

})