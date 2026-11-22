import type { Request, Response } from "express";
import { TryCatch } from "../../middleware/TryCatch.js";
import { createArticleSchema, updateArticleSchema } from "./article.validation.js";
import { zodErrorHandler } from "../../utils/zodErrorHandler.js";
import sanitize from "mongo-sanitize";
import { generateSlug } from "../../utils/generateSlug.js";
import mongoose, { Types } from "mongoose";
import { responseHandler } from "../../utils/responseHandler.js";
import { Category } from "../category/category.model.js";
import { Tag } from "../tag/tag.model.js";
import { Article } from "./article.model.js";
import { Media } from "../media/media.model.js";
import { checkArticleExistsBySlug, findArticleById, totalArticleCount } from "./article.service.js";
import { Comment } from "../comment/comment.model.js";
import { Reaction } from "../reaction/reaction.model.js";
import { User } from "../user/user.model.js";
import { Notification } from "../notification/notification.model.js";
import { getIO } from "../../config/socket.js";
import { isUserOnline } from "../../utils/onlineUsers.js";
import { ContactMessage } from "../contact/contact.model.js";


// Create Article
export const createArticle = TryCatch(async (req: Request, res: Response) => {

    // My ID
    const myId = req.user?._id
    if (!myId) {
        return responseHandler(res, 401, "Authentication required");
    }

    // Validate Article Data
    const validate = createArticleSchema.safeParse(req.body)
    if(!validate?.success) {
        return zodErrorHandler(res, validate)
    }

    // Sanitize Data
    const {title, slug, content, excerpt, status, publishAt, coverImage, categories, tags, allowComments, metaTitle, metaDescription, metaKeywords} = sanitize(validate.data)

    // Generate Slug
    let generatedSlug = generateSlug(slug ? slug : title)

    // Validate Cover Image ID
    if(!mongoose.isValidObjectId(coverImage?._id)) {
        return responseHandler(res,400, "Invalid cover image")
    }

    // Validate Categories IDs
    for(let category of categories) {
        if(!mongoose.isValidObjectId(category)) {
            return responseHandler(res, 400, "Invalid category ID")
        }
    }

    // Validate Tags IDs
    if(tags && tags?.length > 0) {
        for(let tag of tags) {
            if(!mongoose.isValidObjectId(tag)) {
                return responseHandler(res, 400, "Invalid tag ID")
            }
        }
    }

    // Check Cover Image Exists
    const coverImageExists = await Media.findOne({
        _id: coverImage?._id,
        url: coverImage?.url
    }).select("_id")
    if(!coverImageExists) {
        return responseHandler(res, 400, "Cover image not found")
    }

    // Check categories Exists
    const existingCategories = await Category.find({
        _id: {$in: categories},
        isActive: true
    }).select("_id")
    if(existingCategories?.length !== categories?.length) {
        return responseHandler(res, 400, "One or more categories not found")
    }

    // Check Tags Exists
    if(Array.isArray(tags) && tags?.length > 0) {
        const existingTags = await Tag.find({
            _id: {$in: tags},
            isActive: true
        }).select("_id")
        if(existingTags?.length !== tags?.length) {
            return responseHandler(res, 400, "One or more tags not found")
        }
    }

    // Check Article Exist With Slug
    let existingArticle = await checkArticleExistsBySlug(generatedSlug)
    if(existingArticle) {

        let count = 1

        while(existingArticle) {
            generatedSlug = `${generatedSlug}-${count}`

            existingArticle = await Article.findOne({
                slug: generatedSlug
            }).select("_id")

            count++
        }

    }

    // Create Article
    const article = await Article.create({
        title,
        slug: generatedSlug,
        coverImage: {
            url: coverImage?.url ? coverImage?.url : "",
            altTag: coverImage?.altTag ? coverImage?.altTag : ""
        },
        author: myId,
        content,
        excerpt,
        status: status === "DRAFT" ? "DRAFT" : "SUBMITTED",
        publishAt: publishAt ? publishAt : null,
        categories,
        tags: tags ? tags : [],
        allowComments,
        metaTitle: metaTitle ? metaTitle : "",
        metaDescription: metaDescription ? metaDescription : "",
        metaKeywords: metaKeywords ? metaKeywords?.split(",")?.map((item)=>item?.trim())?.filter(Boolean) : []
    })

    // Notification
    let notifications = []

    // Editors
    const editors = await User.find({
        role: "EDITOR",
        isBlocked: false,
        isDeleted: false
    }).select("_id")

    // Generate Notifications
    if(editors && Array.isArray(editors) && editors?.length > 0) {
        for(let editor of editors) {
            notifications.push({
                recipient: editor?._id?.toString(),
                sender: myId,
                type: "ARTICLE_SUBMIT",
                title: "New Article Submitted",
                message: `A new article "${article?.title}" has been submitted for review.`,
                targetCategory: "ARTICLE",
                targetId: article?._id?.toString()
            })
        }
    }

    // Save Notifications
    notifications = await Notification.insertMany(notifications)
        
    // Populate Notifications
    notifications = await Notification.populate(notifications, {
        path: "sender",
        select: "name email avatar"
    })

    // Send Live Notification
    const io = getIO()
    for(let notification of notifications) {

        // Recipient ID
        const recipientId = notification?.recipient?.toString()

        // Populated Notification
        let targetItem = null
        if(["ARTICLE", "COMMENT"].includes(notification?.targetCategory)) {
            targetItem = await Article.findOne({
                _id: notification.targetId
            }).lean()
        } else {
            targetItem = await ContactMessage.findOne({
                _id: notification.targetId
            }).lean()
        }

        // Updated Notification
        const updatedNotification = {
            ...notification.toObject(),
            targetId: targetItem
        }

        // Send
        if(isUserOnline(recipientId)) {
            io.to(`user:${recipientId}`).emit("notification:new", updatedNotification)
        }

    }

    return responseHandler(res, 201, "Article created successfully")

})


// Get Articles
export const getArticles = TryCatch(async (req: Request, res: Response) => {

    // Filter Data From Query
    const {search="", category="", isFeatured="", page=1, limit=20} = req.query

    // Normalize
    const normalizePage = Math.max(1, Number(page) || 1)
    const normalizeLimit = Math.min(100, Math.max(1, Number(limit) || 20))

    // Filter
    const filter: any = {
        status: "PUBLISHED",
        $or: [
            {publishAt: null},
            {publishAt: {$lte: new Date()}}
        ]
    }
    if(search && typeof search === "string" && search?.trim()) {
        filter.$text = {
            $search: search?.trim()
        }
    }
    if (category && typeof category === "string" && category.trim()) {
        const categoryData = await Category.findOne({
            slug: category.trim()
        }).select("_id");

        filter.categories = {
            $in: categoryData ? [categoryData._id] : []
        };
    }
    if(isFeatured === "TRUE") {
        filter.isFeatured = isFeatured === "TRUE"
    }

    // Pagination
    const skip = (normalizePage - 1) * normalizeLimit

    // Sort Stage
    const sortStage: any = (search && typeof search === "string" && search.trim()) ? {$sort: {score: {$meta: "textScore"}}} : {$sort: {sortDate: -1}}

    // Find Articles
    const articles = await Article.aggregate([
        // Add Sort Field
        ...(!search ? [
            {
                $addFields: {
                    sortDate: {
                        $ifNull: ["$publishAt", "$createdAt"]
                    }
                }
            }
        ] : []),
        
        // Filter
        {
            $match: filter
        },

        sortStage,

        // Skip
        {
            $skip: skip
        },

        // Limit
        {
            $limit: normalizeLimit
        },

        // Author Lookup
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author"
            }
        },

        {
            $unwind: {
                path: "$author",
                preserveNullAndEmptyArrays: true
            }
        },

        // Categories Lookup
        {
            $lookup: {
                from: "categories",
                localField: "categories",
                foreignField: "_id",
                as: "categories"
            }
        },

        // Tags
        {
            $lookup: {
                from: "tags",
                localField: "tags",
                foreignField: "_id",
                as: "tags"
            }
        },

        // Get Reactions
        {
            $lookup: {
                from: "reactions",
                localField: "_id",
                foreignField: "targetId",
                as: "reactions"
            }
        },
        
        // Count Reactions
        {
            $addFields: {
                like: {
                    $size: {
                        $filter: {
                            input: "$reactions",
                            as: "reaction",
                            cond: {
                                $eq: ["$$reaction.reactionType", "LIKE"]
                            }
                        }
                    }
                },
        
                dislike: {
                    $size: {
                        $filter: {
                            input: "$reactions",
                            as: "reaction",
                            cond: {
                                $eq: ["$$reaction.reactionType", "DISLIKE"]
                            }
                        }
                    }
                }
            }
        },
        
        // Remove Reactions
        {
            $project: {
                reactions: 0
            }
        }
    ])

    // Total Articles
    const totalArticles = await totalArticleCount(filter)

    // Pagination
    const pagination = {
        totalPages: Math.ceil(totalArticles / normalizeLimit),
        totalItems: totalArticles,

        page: normalizePage,
        limit: normalizeLimit,

        hasPrevPage: normalizePage > 1,
        hasNextPage: Math.ceil(totalArticles / normalizeLimit) > normalizePage,

        from: totalArticles === 0 ? 0 : (normalizePage - 1) * normalizeLimit + 1,
        to: Math.min(totalArticles, normalizePage * normalizeLimit)
    }

    return responseHandler(res, 200, "Articles fetched suxccessfully", {
        articles,
        pagination
    })

})


// Get Article Details
export const getArticleDetails = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser: any = req.user;

    // Article Slug
    const {slug} = req.params;

    // Validate
    if(!slug) {
        return responseHandler(res, 400, "Article slug is required")
    }
    if (typeof slug !== "string") {
        return responseHandler(res, 400, "Invalid article slug")
    }

    // Filter
    const filter: any = {
        slug,
        status: "PUBLISHED",
        $or: [
            {publishAt: null},
            {publishAt: {$lte: new Date()}}
        ]
    }

    // Find Article and Populate References
    const article = await Article.findOne(filter)
        .populate({
            path: "author",
            select: "name avatar"
        })
        .populate({
            path: "categories",
            select: "name slug"
        })
        .populate({
            path: "tags",
            select: "name slug"
        })
        .lean()

    // Article Not Found or Not Accessible
    if (!article) {
        return responseHandler(res, 404, "Article not found") 
    }

    // Count Reactions & My Reaction
    const like = await Reaction.countDocuments({
        targetType: "ARTICLE",
        targetId: article._id,
        reactionType: "LIKE"
    })
    const dislike = await Reaction.countDocuments({
        targetType: "ARTICLE",
        targetId: article._id,
        reactionType: "DISLIKE"
    })
    let myReaction: any = null
    if(currentUser?._id) {
        myReaction = await Reaction.findOne({
            user: currentUser._id,
            targetType: "ARTICLE",
            targetId: article._id,
            reactionType: "DISLIKE"
        })
    }

    // like, dislike, myReaction
    const updatedArticle = {
        ...article, 
        like: like, 
        dislike: dislike,
        myReaction: myReaction ? myReaction?.reactionType : null
    }

    return responseHandler(res, 200, "Article details fetched successfully", {
        article: updatedArticle
    })

})


// Get Dashboard Articles
export const getDashboardArticles = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser = req.user
    if(!currentUser || !currentUser?._id || typeof currentUser?._id !== "string") {
        return responseHandler(res, 401, "Authentication required")
    }

    // Filter Data From Query
    const {search, category, tag, status, page=1, limit=20} = req.query

    // Normalize
    const normalizePage = Math.max(1, Number(page) || 1)
    const normalizeLimit = Math.min(100, Math.max(1, Number(limit) || 20))

    // Filter
    const filter: any = {}
    if(currentUser?.role === "JOURNALIST") {
        filter.author = new Types.ObjectId(currentUser._id);
    }
    if(search && typeof search === "string" && search?.trim()) {
        filter.$text = {
            $search: search?.trim()
        }
    }
    if(category && typeof category === "string" && Types.ObjectId.isValid(category)) {
        filter.categories = {
            $in: [new Types.ObjectId(category)]
        }
    }
    if(tag && typeof tag === "string" && Types.ObjectId.isValid(tag)) {
        filter.tags = {
            $in: [new Types.ObjectId(tag)]
        }
    }
    if(status && typeof status === "string" && ["DRAFT", "SUBMITTED", "REJECTED", "PUBLISHED"].includes(status)) {
        filter.status = status
    }

    // Pagination
    const skip = (normalizePage - 1) * normalizeLimit

    // Sort Stage
    const sortStage: any = (search && typeof search === "string" && search.trim()) ? 
        {$sort: {score: {$meta: "textScore"}}} : {$sort: {createdAt: -1}}

    // Find Articles
    const articles = await Article.aggregate([
        {
            $match: filter
        },

        sortStage,

        {
            $lookup: {
                from: "categories",
                localField: "categories",
                foreignField: "_id",
                as: "categories"
            }
        },

        {
            $lookup: {
                from: "tags",
                localField: "tags",
                foreignField: "_id",
                as: "tags"
            }
        },

        {
            $skip: skip
        },

        {
            $limit: normalizeLimit
        },

        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author"
            }
        },

        {
            $unwind: {
                path: "$author",
                preserveNullAndEmptyArrays: true
            }
        },

        // Get Reactions
        {
            $lookup: {
                from: "reactions",
                localField: "_id",
                foreignField: "targetId",
                as: "reactions"
            }
        },
        
        // Count Reactions
        {
            $addFields: {
                myReaction: {
                    $let: {
                        vars: {
                            userReaction: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$reactions",
                                            as: "reaction",
                                            cond: {
                                                $eq: ["$$reaction.user", new Types.ObjectId(currentUser._id)]
                                            }
                                        }
                                    },
                                    0
                                ]
                            }
                        },
                        in: {
                            $ifNull: ["$$userReaction.reactionType", null]
                        }
                    }
                },
        
                like: {
                    $size: {
                        $filter: {
                            input: "$reactions",
                            as: "reaction",
                            cond: {
                                $eq: ["$$reaction.reactionType", "LIKE"]
                            }
                        }
                    }
                },
        
                dislike: {
                    $size: {
                        $filter: {
                            input: "$reactions",
                            as: "reaction",
                            cond: {
                                $eq: ["$$reaction.reactionType", "DISLIKE"]
                            }
                        }
                    }
                }
            }
        },
        
        // Remove Reactions
        {
            $project: {
                reactions: 0
            }
        }
    ])

    // Total Articles
    const totalArticles = await totalArticleCount(filter)

    // Pagination
    const pagination = {
        totalPages: Math.ceil(totalArticles / normalizeLimit),
        totalItems: totalArticles,

        page: normalizePage,
        limit: normalizeLimit,

        hasPrevPage: normalizePage > 1,
        hasNextPage: Math.ceil(totalArticles / normalizeLimit) > normalizePage,

        from: totalArticles === 0 ? 0 : (normalizePage - 1) * normalizeLimit + 1,
        to: Math.min(totalArticles, normalizePage * normalizeLimit)
    }

    return responseHandler(res, 200, "Dashboard articles fetched suxccessfully", {
        articles,
        pagination
    })

})


// Toggle Article Featured Status
export const toggleArticleFeaturedStatus = TryCatch(async (req: Request, res: Response) => {

    // Article ID
    const { id } = req.params;

    // Validate Article ID
    if(!id) {
        return responseHandler(res, 400, "Article ID is required")
    }
    if(id && typeof id === "string" && !Types.ObjectId.isValid(id)) {
        return responseHandler(res, 400, "Invalid article ID");
    }

    // Find Article
    const article = await findArticleById(id?.toString())
    if (!article) {
        return responseHandler(res, 404, "Article not found");
    }

    // Only Published Articles Can Be Featured
    if (article.status !== "PUBLISHED") {
        return responseHandler(res, 400, "Only published articles can be featured");
    }

    // Toggle Featured Status
    article.isFeatured = !article.isFeatured;
    await article.save();

    // Response
    return responseHandler(res, 200, `Article ${article.isFeatured ? "featured" : "unfeatured"} successfully`)}

)


// Get Dashboard Article Details
export const getDashboardArticleDetails = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser = req.user;
    if(!currentUser || !currentUser?._id || typeof currentUser?._id !== "string") {
        return responseHandler(res, 401, "Authentication require")
    }

    // Article ID
    const { id } = req.params;

    // Validate
    if(!id) {
        return responseHandler(res, 400, "Article ID is required")
    }
    if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return responseHandler(res, 400, "Invalid article ID")
    }

    // Filter
    const filter: any = {
        _id: new Types.ObjectId(id)
    }

    // Journalists can only view their own articles
    if (currentUser?.role === "JOURNALIST") {
        filter.author = new Types.ObjectId(currentUser._id);
    }

    // Find Article and Populate References
    const article = await Article.aggregate([
        {
            $match: filter
        },

        {
            $lookup: {
                from: "categories",
                localField: "categories",
                foreignField: "_id",
                as: "categories"
            }
        },

        {
            $lookup: {
                from: "tags",
                localField: "tags",
                foreignField: "_id",
                as: "tags"
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author"
            }
        },

        {
            $unwind: {
                path: "$author",
                preserveNullAndEmptyArrays: true
            }
        },

        // Get Reactions
        {
            $lookup: {
                from: "reactions",
                localField: "_id",
                foreignField: "targetId",
                as: "reactions"
            }
        },
        
        // Count Reactions
        {
            $addFields: {
                myReaction: {
                    $let: {
                        vars: {
                            userReaction: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$reactions",
                                            as: "reaction",
                                            cond: {
                                                $eq: ["$$reaction.user", new Types.ObjectId(currentUser._id)]
                                            }
                                        }
                                    },
                                    0
                                ]
                            }
                        },
                        in: {
                            $ifNull: ["$$userReaction.reactionType", null]
                        }
                    }
                },
        
                like: {
                    $size: {
                        $filter: {
                            input: "$reactions",
                            as: "reaction",
                            cond: {
                                $eq: ["$$reaction.reactionType", "LIKE"]
                            }
                        }
                    }
                },
        
                dislike: {
                    $size: {
                        $filter: {
                            input: "$reactions",
                            as: "reaction",
                            cond: {
                                $eq: ["$$reaction.reactionType", "DISLIKE"]
                            }
                        }
                    }
                }
            }
        },
        
        // Remove Reactions
        {
            $project: {
                reactions: 0
            }
        }
    ])

    // Article Not Found or Not Accessible
    if (!article || article?.length === 0) {
        return responseHandler(res, 400, "Article not found") 
    }

    return responseHandler(res, 200, "Article details fetched successfully", {
        article: article?.[0]
    })

})


// Delete Article
export const deleteArticle = TryCatch(async (req: Request, res: Response) => {

    // Article ID
    const { id } = req.params;

    // Current User
    const currentUser: any = req.user;

    // Validate Article ID
    if(!id) {
        return responseHandler(res, 400, "Article ID is required")
    }
    if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return responseHandler(res, 400, "Invalid article ID");
    }

    // Find Article
    const article = await findArticleById(id);
    if (!article) {
        return responseHandler(res, 404, "Article not found");
    }

    // Journalist Can Delete Own Articles Only
    if (currentUser.role === "JOURNALIST" && article.author.toString() !== currentUser._id.toString()) {
        return responseHandler(res, 403, "You can only delete your own articles");
    }

    // Delete Article
    await Article.findByIdAndDelete(id);

    // Delete Comments
    await Comment.deleteMany({
        article: id
    })

    // Notification
    if(article?.author?.toString() !== currentUser?._id?.toString()) {

        // Create
        let notification = await Notification.create({
            recipient: article.author,
            sender: currentUser._id,
            type: "ARTICLE_DELETE",
            title: "Article Deleted",
            message: `Your article "${article.title}" has been deleted by ${currentUser.role}.`,
            targetCategory: "ARTICLE",
            targetId: article._id
        })

        // Populated Notification
        notification = await Notification.populate(notification, {
            path: "sender",
            select: "name email avatar"
        })

        // Recipient ID
        const recipientId = notification?.recipient?.toString()

        // Populated Notification Target ID
        let targetItem = null
        if(["ARTICLE", "COMMENT"].includes(notification?.targetCategory)) {
            targetItem = await Article.findOne({
                _id: notification.targetId
            }).lean()
        } else {
            targetItem = await ContactMessage.findOne({
                _id: notification.targetId
            }).lean()
        }

        // Updated Notification
        const updatedNotification = {
            ...notification.toObject(),
            targetId: targetItem
        }

        // Send
        const io = getIO()
        if(isUserOnline(recipientId)) {
            io.to(`user:${recipientId}`).emit("notification:new", updatedNotification)
        }

    }

    // Response
    return responseHandler(res, 200, "Article deleted successfully");

})


// Update Article
export const updateArticle = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser: any = req.user

    // Article ID
    const {id} = req.params
    if(!id) {
        return responseHandler(res, 400, "Article ID is required")
    }
    if(typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        return responseHandler(res, 400, "Invalid article ID")
    }

    // Validate Article Data
    const validate = updateArticleSchema.safeParse(req.body)
    if(!validate?.success) {
        return zodErrorHandler(res, validate)
    }

    // Sanitize Data
    const {title, slug, content, excerpt, status, publishAt, coverImage, categories, tags, allowComments, isFeatured, reviewNote, metaTitle, metaDescription, metaKeywords} = sanitize(validate.data)

    // Generate Slug
    let generatedSlug = generateSlug(slug ? slug : title)

    // Validate Categories IDs
    for(let category of categories) {
        if(!mongoose.isValidObjectId(category)) {
            return responseHandler(res, 400, "Invalid category ID")
        }
    }

    // Validate Tags IDs
    if(tags && tags?.length > 0) {
        for(let tag of tags) {
            if(!mongoose.isValidObjectId(tag)) {
                return responseHandler(res, 400, "Invalid tag ID")
            }
        }
    }

    // Check Cover Image Exists
    const coverImageExists = await Media.findOne({
        url: coverImage?.url
    }).select("_id")
    if(!coverImageExists) {
        return responseHandler(res, 400, "Cover image not found")
    }

    // Check categories Exists
    const existingCategories = await Category.find({
        _id: {$in: categories},
        isActive: true
    }).select("_id")
    if(existingCategories?.length !== categories?.length) {
        return responseHandler(res, 400, "One or more categories not found")
    }

    // Check Tags Exists
    if(Array.isArray(tags) && tags?.length > 0) {
        const existingTags = await Tag.find({
            _id: {$in: tags},
            isActive: true
        }).select("_id")
        if(existingTags?.length !== tags?.length) {
            return responseHandler(res, 400, "One or more tags not found")
        }
    }

    // Find Article By ID
    const article = await Article.findById(id)
    if(!article) {
        return responseHandler(res, 404, "Article not found")
    }

    // Check Article Ownership
    if(currentUser?.role === "JOURNALIST" && article.author.toString() !== currentUser._id.toString()) {
        return responseHandler(res, 403, "You are not allowed to update this article")
    }

    // Check Article Exist With Slug
    let existingArticle = await Article.findOne({
        _id: {$ne: id},
        slug: generatedSlug
    })
    if(existingArticle) {

        let count = 1

        while(existingArticle) {
            generatedSlug = `${generatedSlug}-${count}`

            existingArticle = await Article.findOne({
                _id: {$ne: id},
                slug: generatedSlug
            }).select("_id")

            count++
        }

    }

    // Update Article Data
    article.title = title
    article.slug = generatedSlug
    article.content = content
    article.excerpt = excerpt ?? ""
    article.coverImage = {
        url: coverImage.url,
        altTag: coverImage.altTag ?? ""
    }
    article.categories = categories.map((category) => new mongoose.Types.ObjectId(category))
    article.tags = (tags ?? []).map((tag) => new mongoose.Types.ObjectId(tag))
    article.allowComments = allowComments
    article.metaTitle = metaTitle ?? ""
    article.metaDescription = metaDescription ?? ""
    article.metaKeywords = metaKeywords ? metaKeywords.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean) : []
    if(currentUser?.role !== "JOURNALIST") {
        article.isFeatured = isFeatured
        article.reviewNote = reviewNote ?? ""
        article.status = status
    } else {
        article.status = status === "DRAFT" ? "DRAFT" : "SUBMITTED"
    }
    article.publishAt = publishAt ? publishAt : null

    // Save Updated Data
    await article.save()

    // Notification
    if(article?.author?.toString() !== currentUser?._id?.toString()) {
        
        // Create
        let notification = await Notification.create({
            recipient: article.author,
            sender: currentUser._id,
            type: "ARTICLE_UPDATE",
            title: "Article Updated",
            message: `Your article "${article.title}" has been updated by ${currentUser.role}.`,
            targetCategory: "ARTICLE",
            targetId: article._id
        })

        // Populated Notification
        notification = await Notification.populate(notification, {
            path: "sender",
            select: "name email avatar"
        })

        // Recipient ID
        const recipientId = notification?.recipient?.toString()

        // Populated Notification Target ID
        let targetItem = null
        if(["ARTICLE", "COMMENT"].includes(notification?.targetCategory)) {
            targetItem = await Article.findOne({
                _id: notification.targetId
            }).lean()
        } else {
            targetItem = await ContactMessage.findOne({
                _id: notification.targetId
            }).lean()
        }

        // Updated Notification
        const updatedNotification = {
            ...notification.toObject(),
            targetId: targetItem
        }

        // Send
        const io = getIO()
        if(isUserOnline(recipientId)) {
            io.to(`user:${recipientId}`).emit("notification:new", updatedNotification)
        }

    }

    return responseHandler(res, 200, "Article updated successfully")

})


// Update Article Review Status
export const updateArticleReviewStatus = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser: any = req.user

    // Article ID
    const {id} = req.params
    if(!id || !mongoose.isValidObjectId(id)) {
        return responseHandler(res, 400, "Invalid article ID")
    }

    // Validate Status
    const {status} = req.body
    if(!["PUBLISHED", "REJECTED"].includes(status)) {
        return responseHandler(res, 400, "Invalid article status")
    }

    // Find Submitted Article
    const article = await Article.findOne({
        _id: id,
        status: "SUBMITTED"
    })
    if(!article) {
        return responseHandler(res, 404, "Submitted article not found")
    }

    // Update Article Status
    article.status = status
    await article.save()

    // Create Notification
    const isPublished = status === "PUBLISHED";
    let notification = await Notification.create({
        recipient: article.author,
        sender: currentUser._id,
        type: isPublished ? "ARTICLE_PUBLISH" : "ARTICLE_REJECT",
        title: isPublished ? "Article Published" : "Article Rejected",
        message: isPublished ? `Your article "${article.title}" has been approved and published.` : `Your article "${article.title}" has been rejected by ${currentUser.role}.`,
        targetCategory: "ARTICLE",
        targetId: article._id
    })

    // Populated Notification
    notification = await Notification.populate(notification, {
        path: "sender",
        select: "name email avatar"
    })

    // Recipient ID
    const recipientId = notification?.recipient?.toString()

    // Populated Notification Target ID
    let targetItem = null
    if(["ARTICLE", "COMMENT"].includes(notification?.targetCategory)) {
        targetItem = await Article.findOne({
            _id: notification.targetId
        }).lean()
    } else {
        targetItem = await ContactMessage.findOne({
            _id: notification.targetId
        }).lean()
    }

    // Updated Notification
    const updatedNotification = {
        ...notification.toObject(),
        targetId: targetItem
    }

    // Send
    const io = getIO()
    if(isUserOnline(recipientId)) {
        io.to(`user:${recipientId}`).emit("notification:new", updatedNotification)
    }

    return responseHandler(res, 200, status === "PUBLISHED" ? "Article approved and published successfully" : "Article rejected successfully")
    
})


// Toggle Article Reaction
export const toggleArticleReaction = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser = req.user
    if(!currentUser?._id || typeof currentUser?._id !== "string") {
        return responseHandler(res, 401, "Authentication required")
    }

    // Data From body
    const {reactionType, reactionFor: targetType} = req.body

    // Article ID From Params
    const {id} = req.params

    // Validate
    if(!["LIKE", "DISLIKE"].includes(reactionType)) {
        return responseHandler(res, 400, "Invalid reaction type. Allowed values are LIKE or DISLIKE.")
    }
    if(!["ARTICLE"].includes(targetType)) {
        return responseHandler(res, 400, "Invalid reaction target. Allowed values are COMMENT or ARTICLE.")
    }
    if(!id || typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return responseHandler(res, 400, "Invalid ID. Please provide a valid ObjectId.")
    }

    // Target Item Exists
    const targetItem = await Article.findOne({
        _id: id,
        status: "PUBLISHED",
        $or: [
            {publishAt: null},
            {publishAt: {$lt: new Date()}}
        ]
    })
    .select("_id author title")
    if(!targetItem) {
        return responseHandler(res, 404, "Article not found")
    }

    // Own Item
    if(targetItem?.author?.toString() === currentUser?._id?.toString()) {
        return responseHandler(res, 403, "You cannot react to your own article.")
    }

    // My Reaction Exists
    const reaction = await Reaction.findOne({
        user: new Types.ObjectId(currentUser?._id),
        targetId: targetItem?._id,
        targetType: "ARTICLE"
    })

    // Create Reaction
    if(!reaction) {

        // Reaction
        await Reaction.create({
            user: currentUser._id,
            targetType,
            targetId:  targetItem._id,
            reactionType
        })

        // Notification
        let notification = await Notification.create({
            recipient: targetItem?.author?.toString(),
            sender: currentUser._id,
            type: "ARTICLE_REACTION",
            title: "New Article Reaction",
            message: `Someone reacted to your article "${targetItem?.title}".`,
            targetCategory: targetType,
            targetId: targetItem?._id,
        })

        // Populated Notification
        notification = await Notification.populate(notification, {
            path: "sender",
            select: "name email avatar"
        })

        // Recipient ID
        const recipientId = notification?.recipient?.toString()

        // Populated Notification Target ID
        let targetNotificationItem = null
        if(["ARTICLE", "COMMENT"].includes(notification?.targetCategory)) {
            targetNotificationItem = await Article.findOne({
                _id: notification.targetId
            }).lean()
        } else {
            targetNotificationItem = await ContactMessage.findOne({
                _id: notification.targetId
            }).lean()
        }

        // Updated Notification
        const updatedNotification = {
            ...notification.toObject(),
            targetId: targetNotificationItem
        }

        // Send
        const io = getIO()
        if(isUserOnline(recipientId)) {
            io.to(`user:${recipientId}`).emit("notification:new", updatedNotification)
        }

    }else {
        if(reaction.reactionType === reactionType) {
            await Reaction.findByIdAndDelete(reaction._id)
        }else{

            // Toggle Reaction
            reaction.reactionType = reactionType
            await reaction.save()

            // Notification
            let notification = await Notification.create({
                recipient: targetItem?.author?.toString(),
                sender: currentUser._id,
                type: "ARTICLE_REACTION",
                title: "New Article Reaction",
                message: `Someone reacted to your article "${targetItem?.title}".`,
                targetCategory: targetType,
                targetId: targetItem?._id,
            })

            // Populated Notification
            notification = await Notification.populate(notification, {
                path: "sender",
                select: "name email avatar"
            })

            // Recipient ID
            const recipientId = notification?.recipient?.toString()

            // Populated Notification Target ID
            let targetNotificationItem = null
            if(["ARTICLE", "COMMENT"].includes(notification?.targetCategory)) {
                targetNotificationItem = await Article.findOne({
                    _id: notification.targetId
                }).lean()
            } else {
                targetNotificationItem = await ContactMessage.findOne({
                    _id: notification.targetId
                }).lean()
            }

            // Updated Notification
            const updatedNotification = {
                ...notification.toObject(),
                targetId: targetNotificationItem
            }

            // Send
            const io = getIO()
            if(isUserOnline(recipientId)) {
                io.to(`user:${recipientId}`).emit("notification:new", updatedNotification)
            }
            
        }
    }

    return responseHandler(res, 200, "Reaction toggled successfully.");

})