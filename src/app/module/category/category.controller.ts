import type { Request, Response } from "express";
import { TryCatch } from "../../middleware/TryCatch.js";
import formidable from "formidable";
import { responseHandler } from "../../utils/responseHandler.js";
import { categoryValidateSchema } from "./category.validation.js";
import { zodErrorHandler } from "../../utils/zodErrorHandler.js";
import sanitize from "mongo-sanitize";
import { generateSlug } from "../../utils/generateSlug.js";
import { createCategoryItem, deleteCategoryById, findCategoryById, findCategoryBySlug, getTotalCategories } from "./category.service.js";
import { uploadFile } from "../../utils/uploadFile.js";
import { Category } from "./category.model.js";
import type { PipelineStage } from "mongoose";
import mongoose from "mongoose";
import { deleteFile } from "../../utils/deleteFile.js";
import { Article } from "../article/article.model.js";
import { checkArticleExistsByCategoryID } from "../article/article.service.js";
import { deleteRedisData, getRedisData, setRedisData } from "../../services/redis.service.js";


// Create Category
export const createCategory = TryCatch(async (req: Request, res: Response) => {

    // Formidable
    const form = formidable({})

    let fields
    let files

    try{
        [fields, files] = await form.parse(req)
    }catch(err){
        return responseHandler(res, 500, "Failed to parse form data")
    }

    // Data
    let name = null
    let slug = null
    let description = null
    let status = null

    let imageFilepath = null
    let imageMimetype = null
    let imageSize = null

    // Extract Fields
    if(fields?.name && Array.isArray(fields?.name) && fields?.name?.length > 0 && fields?.name?.[0] !== "undefined") {
        name = fields?.name?.[0]
    }
    if(fields?.slug && Array.isArray(fields?.slug) && fields?.slug?.length > 0 && fields?.slug?.[0] !== "undefined") {
        slug = fields?.slug?.[0]
    }
    if(fields?.description && Array.isArray(fields?.description) && fields?.description?.length > 0 && fields?.description?.[0] !== "undefined") {
        description = fields?.description?.[0]
    }
    if(fields?.status && Array.isArray(fields?.status) && fields?.status?.length > 0 && fields?.status?.[0] !== "undefined" && (fields?.status?.[0] === "true" || fields?.status?.[0] === "false")) {
        status = fields.status[0] === "true"
    }

    // Extract Files
    if(files?.image && Array.isArray(files?.image) && files?.image?.length > 0) {
        imageFilepath = files?.image?.[0]?.filepath
        imageMimetype = files?.image?.[0]?.mimetype
        imageSize = files?.image?.[0]?.size
    }

    // Validate
    const validate = categoryValidateSchema.safeParse({
        name,
        slug,
        description,
        status,
        imageFilepath,
        imageMimetype,
        imageSize
    })
    if(!validate?.success) {
        return zodErrorHandler(res, validate)
    }

    // Sanitize Validated Data
    const sanitizeData = sanitize(validate.data)

    // Extract Sanitized Data
    const {name: categoryName, slug: categorySlug, description: categoryDescription, status: categoryStatus, imageFilepath: categoryImageFilePath} = sanitizeData

    // Category Data
    const categoryData = {
        image: {
            url: "",
            publicId: ""
        },
        name: categoryName,
        slug: generateSlug(categorySlug || categoryName),
        description: categoryDescription || "",
        isActive: categoryStatus
    }

    // Check Existing Category By Name (Case-Insensitive)
    const existingCategory = await Category.findOne({
        name: {
            $regex: categoryData?.name,
            $options: "i"
        }
    })
    if(existingCategory) {
        return responseHandler(res, 409, "Category name already exists")
    }

    // Check Existing Category By Slug
    let isExist = await findCategoryBySlug(categoryData?.slug)
    if(isExist) {
        let number = 1
        while(isExist) {
            const newSlug = `${categoryData?.slug}${number}`
            isExist = await findCategoryBySlug(newSlug)
            if(!isExist) {
                categoryData.slug = newSlug
                break
            }
            number++
        }
    }

    // Upload File
    let fileUploadResult = null
    if(categoryImageFilePath) {
        fileUploadResult = await uploadFile(res, categoryImageFilePath, "categories", "image")
    }

    // Set Data To Category Data
    if(fileUploadResult?.url && fileUploadResult?.publicId) {
        categoryData.image = {
            url: fileUploadResult?.url,
            publicId: fileUploadResult?.publicId
        }
    }

    // Create Category
    await createCategoryItem(categoryData)

    return responseHandler(res, 201, "Category created successfully")

})


// Get Categories
export const getCategories = TryCatch(async (req: Request, res: Response) => {

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

    // Find Categories
    const sortStage: PipelineStage = {
        $sort: search ? {score: {$meta: "textScore"}} : {createdAt: -1}
    }
    const categories = await Category.aggregate([

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
                foreignField: "categories",
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
            $unset: "articles"
        }

    ])

    // Total Categories
    const totalCategories = await getTotalCategories(filter)

    // Pagination
    const pagination = {
        totalPages: Math.ceil(totalCategories / limit),
        totalItems: totalCategories,

        page,
        limit,

        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalCategories / limit),

        from: totalCategories === 0 ? 0 : (page - 1) * limit + 1,
        to: Math.min(page * limit, totalCategories)
    }

    return responseHandler(res, 200, "Categories fetched successfully", {
        categories,
        pagination
    })

})


// Get All Categories
export const getAllCategories = TryCatch(async (req: Request, res: Response) => {

    // Redis Categories Key
    const redisCategoriesKey = `CATEGORIES:all`

    // Find Categories From Redis
    const cachedAllCategories = await getRedisData(redisCategoriesKey)
    if(cachedAllCategories !== null) {
        return responseHandler(res, 200, "Categories fetched successfully", {
            categories: cachedAllCategories
        })
    }

    // Find All Categories
    const categories = await Category.find({
        isActive: true
    })
    .select("name slug description")
    .sort({name: 1})
    .lean()

    // Set Tags To Redis
    await setRedisData(redisCategoriesKey, categories, 300)

    return responseHandler(res, 200, "Categories fetched successfully", {
        categories
    })
    
})


// Update category
export const updateCategory = TryCatch(async (req: Request, res: Response) => {

    // Category Id From Params
    const {id} = req.params

    // Validate Category ID
    if(!id) {
        return responseHandler(res, 400, "Category ID is required")
    }
    if(typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        return responseHandler(res, 400, "Invalid category ID")
    }

    // Formidable
    const form = formidable({})

    let fields
    let files
    try{
        [fields, files] = await form.parse(req)
    }catch(err){
        return responseHandler(res, 500, "Failed to parse form data")
    }

    // Data
    let name = null
    let slug = null
    let description = null
    let status = null

    let imageFilepath = null
    let imageMimetype = null
    let imageSize = null

    // Extract Fields
    if(fields?.name && Array.isArray(fields?.name) && fields?.name?.length > 0 && fields?.name?.[0] !== "undefined") {
        name = fields?.name?.[0]
    }
    if(fields?.slug && Array.isArray(fields?.slug) && fields?.slug?.length > 0 && fields?.slug?.[0] !== "undefined") {
        slug = fields?.slug?.[0]
    }
    if(fields?.description && Array.isArray(fields?.description) && fields?.description?.length > 0 && fields?.description?.[0] !== "undefined") {
        description = fields?.description?.[0]
    }
    if(fields?.status && Array.isArray(fields?.status) && fields?.status?.length > 0 && fields?.status?.[0] !== "undefined" && (fields?.status?.[0] === "true" || fields?.status?.[0] === "false")) {
        status = fields.status[0] === "true"
    }

    // Extract Files
    if(files?.image && Array.isArray(files?.image) && files?.image?.length > 0) {
        imageFilepath = files?.image?.[0]?.filepath
        imageMimetype = files?.image?.[0]?.mimetype
        imageSize = files?.image?.[0]?.size
    }

    // Validate
    const validate = categoryValidateSchema.safeParse({
        name,
        slug,
        description,
        status,
        imageFilepath,
        imageMimetype,
        imageSize
    })
    if(!validate?.success) {
        return zodErrorHandler(res, validate)
    }

    // Sanitize Validated Data
    const sanitizeData = sanitize(validate.data)

    // Extract Sanitized Data
    const {name: categoryName, slug: categorySlug, description: categoryDescription, status: categoryStatus, imageFilepath: categoryImageFilePath} = sanitizeData

    // Category Data
    const categoryData = {
        image: {
            url: "",
            publicId: ""
        },
        name: categoryName,
        slug: "",
        description: categoryDescription || "",
        isActive: categoryStatus
    }

    // Find Category By ID
    const category = await findCategoryById(id)
    if(!category) {
        return responseHandler(res, 404, "Category not found")
    }

    // Check Existing Category By Name (Case-Insensitive)
    const existingCategory = await Category.findOne({
        _id: { $ne: id },
        name: {
            $regex: categoryName,
            $options: "i"
        }
    })
    if(existingCategory) {
        return responseHandler(res, 409, "Category name already exists")
    }

    // Slug
    if(categorySlug?.trim()) {
        categoryData.slug = generateSlug(categorySlug)
    }else{
        categoryData.slug = category?.slug
    }

    // Check Existing Category By Slug
    let isExist = await Category.findOne({
        _id: {$ne: id},
        slug: generateSlug(categoryData?.slug)
    })
    if(isExist) {
        let number = 1
        while(isExist) {
            const newSlug = `${categoryData?.slug}${number}`
            isExist = await findCategoryBySlug(newSlug)
            if(!isExist) {
                categoryData.slug = newSlug
                break
            }
            number++
        }
    }

    // Upload File
    let fileUploadResult = null
    if(categoryImageFilePath) {
        fileUploadResult = await uploadFile(res, categoryImageFilePath, "categories", "image")
    }

    // Set Data To Category Data
    if(fileUploadResult?.url && fileUploadResult?.publicId) {
        categoryData.image = {
            url: fileUploadResult?.url,
            publicId: fileUploadResult?.publicId
        }

        // Delete Old File
        if(category?.image?.publicId) {
            await deleteFile(category?.image?.publicId, "image")
        }
    }else{
        categoryData.image = {
            url: category?.image?.url || "",
            publicId: category?.image?.publicId || ""
        }
    }

    // Update Category Data
    category.name = categoryData?.name
    category.slug = categoryData?.slug
    category.image = categoryData?.image
    category.description = categoryData?.description
    category.isActive = categoryData?.isActive
    await category.save()

    // Delete Cached Categories
    await deleteRedisData(`CATEGORIES:all`)
    
    return responseHandler(res, 200, "Category updated successfully")

})


// Toggle Category Status
export const toggleCategoryStatus = TryCatch(async (req: Request, res: Response) => {

    // Category Id From Params
    const {id} = req.params

    // Validate Category ID
    if(!id) {
        return responseHandler(res, 400, "Category ID is required")
    }
    if(typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        return responseHandler(res, 400, "Invalid category ID")
    }

    // Find Category By ID
    const category = await findCategoryById(id)
    if(!category) {
        return responseHandler(res, 404, "Category not found")
    }

    // Toggle Status
    category.isActive = !category.isActive
    await category.save()

    // Delete Cached Categories
    await deleteRedisData(`CATEGORIES:all`)

    return responseHandler(res, 200, `Category ${category.isActive ? "activated" : "deactivated"} successfully`)

})


// Delete Category
export const deleteCategory = TryCatch(async (req: Request, res: Response) => {
  
    // Category Id From Params
    const {id} = req.params

    // Validate Category ID
    if(!id) {
        return responseHandler(res, 400, "Category ID is required")
    }
    if(typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        return responseHandler(res, 400, "Invalid category ID")
    }

    // Find Category By ID
    const category = await findCategoryById(id)
    if(!category) {
        return responseHandler(res, 404, "Category not found")
    }

    // Check Article Exists
    const articles = await checkArticleExistsByCategoryID(category?._id?.toString())
    if(articles) {
        return responseHandler(res, 400, "This category cannot be deleted because it is assigned to one or more articles")
    }

    // Delete Category
    await deleteCategoryById(category?.id?.toString())

    // Delete Cached Categories
    await deleteRedisData(`CATEGORIES:all`)

    return responseHandler(res, 200, "Category deleted successfully")

})