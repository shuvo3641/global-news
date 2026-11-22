import type { Request, Response } from "express";
import { TryCatch } from "../../middleware/TryCatch.js";
import { responseHandler } from "../../utils/responseHandler.js";
import mongoose, { Types } from "mongoose";
import { Comment } from "./comment.model.js";
import { createCommentItem } from "./comment.service.js";
import { Article } from "../article/article.model.js";
import { Reaction } from "../reaction/reaction.model.js";
import { Notification } from "../notification/notification.model.js";
import { ContactMessage } from "../contact/contact.model.js";
import { getIO } from "../../config/socket.js";
import { isUserOnline } from "../../utils/onlineUsers.js";


// Create Comment
export const createComment = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUserId = req.user?._id
    const currentUserRole = req.user?.role

    // Data From Body
    const {article, parentComment, content} = req.body

    // Validate
    if(!currentUserId) {
        return responseHandler(res, 401, "Authentication required")
    }
    if(!currentUserRole) {
        return responseHandler(res, 401, "Authentication required")
    }
    if(typeof currentUserRole !== "string" || !["USER", "JOURNALIST", "EDITOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"].includes(currentUserRole)) {
        return responseHandler(res, 401, "Authentication required")
    }
    if(!article) {
        return responseHandler(res, 400, "Article ID is required")
    }
    if(typeof article !== "string" || !Types.ObjectId.isValid(article)) {
        return responseHandler(res, 400, "Invalid article ID")
    }
    let existingParentComment: any
    if(parentComment) {
        if(typeof article !== "string" || !Types.ObjectId.isValid(article)) {
            return responseHandler(res, 400, "Invalid parent comment ID")
        }

        existingParentComment = await Comment.findOne({
            _id: parentComment,
            article: article,
        });

        if (!existingParentComment) {
            return responseHandler(res, 400, "Parent comment does not belong to this article");
        }

        // Prevent Own Replay
        if(existingParentComment?.author?.toString() === currentUserId?.toString()) {
            return responseHandler(res, 403, "You cannot reply to your own comment")
        }
    }
    if(!content || typeof content !== "string" || !content?.trim()) {
        return responseHandler(res, 400, "Comment content is required");
    }

    // Article Exists
    const existingArticle = await Article.findOne({
        _id: article,
        status: "PUBLISHED"
    })
    if(!existingArticle) {
        return responseHandler(res, 404, "Article not found")
    }

    // Create Comment
    await createCommentItem({
        article: new mongoose.Types.ObjectId(article),
        author: new mongoose.Types.ObjectId(currentUserId),
        parentComment: parentComment ? parentComment : null,
        content,
        status: currentUserRole === "USER" ? "PENDING" : (currentUserRole === "JOURNALIST" && currentUserId !== existingArticle?.author?.toString()) ? "PENDING" : "APPROVED",
    })

    // Notification
    if(!parentComment) {
        if(existingArticle?.author?.toString() !== currentUserId?.toString()) {

            // Create
            let notification = await Notification.create({
                recipient: existingArticle?.author,
                sender: currentUserId,
                type: "COMMENT_ARTICLE",
                title: "New Comment on Your Article",
                message: `Someone commented on your article "${existingArticle.title}".`,
                targetCategory: "COMMENT",
                targetId: existingArticle?._id
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
    }else {

        // Create
        let notification = await Notification.create({
            recipient: existingParentComment?.author,
            sender: currentUserId,
            type: "COMMENT_REPLY",
            title: "New Reply to Your Comment",
            message: `Someone replied to your comment on "${existingArticle.title}".`,
            targetCategory: "COMMENT",
            targetId: existingArticle?._id
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

    return responseHandler(res, 201, "Comment created successfully")

})


// Get Dashboard Comments
export const getDashboardComments = TryCatch(async (req: Request, res: Response) => {

    // Current User ID
    const currentUser = req.user
    if(!currentUser || !currentUser._id) {
        return responseHandler(res, 401, "Authentication required")
    }

    // Filter Data From Query
    let {status, page=1, limit=20} = req.query

    // Normalize Data
    page = Math.max(1, parseInt(String(page), 10) || 1)
    limit = Math.min(Math.max(1, parseInt(String(limit), 10) || 20), 100)

    // Filter
    const filter: any = {}
    const countFilter: any = {}
    if(status && typeof status === "string" && ["PENDING", "REJECTED", "APPROVED"].includes(status)) {
        filter.status = status
        countFilter.status = status
    }
    if(currentUser?.role === "JOURNALIST") {
        filter["article.author"] = currentUser._id
        countFilter.article = {
            $in: await Article.find({author: currentUser._id}).distinct("_id")
        }
    }

    // Comments
    const comments = await Comment.aggregate([

        // Article Lookup
        {
            $lookup: {
                from: "articles",
                localField: "article",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            coverImage: 1,
                            author: {$toString: "$author"},
                        }
                    }
                ],
                as: "article"
            }
        },

        // Article Unwind
        {
            $unwind: "$article"
        },




        // Filter
        {
            $match: filter
        },

        // Sort
        {
            $sort: {
                createdAt: -1
            }
        },

        // Skip
        {
            $skip: (page - 1) * limit
        },

        // Limit
        {
            $limit: limit
        },




        // Author Lookup
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            avatar: 1
                        }
                    }
                ],
                as: "author"
            }
        },

        // Author Unwind
        {
            $unwind: "$author"
        },




        // Parent Comment Lookup
        {
            $lookup: {
                from: "comments",
                localField: "parentComment",
                foreignField: "_id",
                as: "parentComment"
            }
        },

        // Parent Comment Unwind
        {
            $unwind: {
                path: "$parentComment",
                preserveNullAndEmptyArrays: true
            }
        },

        // Paerent Author Lookup
        {
            $lookup: {
                from: "users",
                localField: "parentComment.author",
                foreignField: "_id",
                as: "parentComment.author"
            }
        },

        // Parent Comment Author Unwind
        {
            $unwind: {
                path: "$parentComment.author",
                preserveNullAndEmptyArrays: true
            }
        },

        // Parent Comment Fields Filter
        {
            $addFields: {
                parentComment: {
                    $cond: [
                        {
                            $ifNull: ["$parentComment._id", false]
                        },

                        {
                            _id: "$parentComment._id",
                            content: "$parentComment.content",
                            author: {
                                _id: "$parentComment.author._id",
                                name: "$parentComment.author.name",
                                avatar: "$parentComment.author.avatar"
                            }
                        },

                        null
                    ]
                }
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

    // Total Comments
    const totalComments = await Comment.countDocuments(countFilter)

    // Pagination
    const pagination = {
        totalItems: totalComments,
        totalPages: Math.ceil(totalComments / limit),

        page,
        limit,

        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalComments / limit),

        from: totalComments === 0 ? 0 : (page - 1) * limit + 1,
        to: Math.min(totalComments, page * limit)
    }

    return responseHandler(res, 200, "Comments fetched successfully", {
        comments,
        pagination
    })

})


// Get Article Comments
export const getArticleComments = TryCatch(async (req: Request, res: Response) => {

    // Current User ID
    const currentUserId = req.user?._id

    // Filter Data From Query
    let {page=1, limit=20} = req.query

    // Normalize Data
    page = Math.max(1, parseInt(String(page), 10) || 1)
    limit = Math.min(Math.max(1, parseInt(String(limit), 10) || 20), 100)
    
    // Article ID From Params
    const {articleId} = req.params

    // Validate
    if(!articleId) {
        return responseHandler(res, 400, "Article ID is required")
    }
    if(typeof articleId !== "string" || !Types.ObjectId.isValid(articleId)) {
        return responseHandler(res, 400, "Invalid article ID")
    }

    // Verify Article Exists
    const articleExists = await Article.exists({
        _id: articleId,
        status: "PUBLISHED"
    })
    if (!articleExists) {
        return responseHandler(res, 404, "Article not found");
    }

    // Filter
    const filter: any = {
        article: new Types.ObjectId(articleId),
        parentComment: null,
        $or: [
            {status: "APPROVED"}
        ]
    }
    if(currentUserId) {
        filter.$or.push({
            author: new Types.ObjectId(currentUserId)
        })   
    }

    // Get Comments
    const comments = await Comment.aggregate([

        {
            $match: filter
        },

        {
            $sort: {
                createdAt: -1
            }
        },

        {
            $skip: (page - 1) * limit
        },

        {
            $limit: limit
        },



        // Author Lookup
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            avatar: 1
                        }
                    }
                ],
                as: "author"
            }
        },

        // Author Unwind
        {
            $unwind: "$author"
        },



        // Parent Comment Lookup
        {
            $lookup: {
                from: "comments",
                localField: "parentComment",
                foreignField: "_id",
                as: "parentComment"
            }
        },

        // Parent Comment Unwind
        {
            $unwind: {
                path: "$parentComment",
                preserveNullAndEmptyArrays: true
            }
        },

        // Paerent Author Lookup
        {
            $lookup: {
                from: "users",
                localField: "parentComment.author",
                foreignField: "_id",
                as: "parentComment.author"
            }
        },

        // Parent Comment Author Unwind
        {
            $unwind: {
                path: "$parentComment.author",
                preserveNullAndEmptyArrays: true
            }
        },

        // Parent Comment Fields Filter
        {
            $addFields: {
                parentComment: {
                    $cond: [
                        {
                            $ifNull: ["$parentComment._id", false]
                        },

                        {
                            _id: "$parentComment._id",
                            content: "$parentComment.content",
                            author: {
                                _id: "$parentComment.author._id",
                                name: "$parentComment.author.name",
                                avatar: "$parentComment.author.avatar"
                            }
                        },

                        null
                    ]
                }
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
                myReaction: currentUserId ? {
                    $let: {
                        vars: {
                            userReaction: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$reactions",
                                            as: "reaction",
                                            cond: {
                                                $eq: ["$$reaction.user", new Types.ObjectId(currentUserId)]
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
                } : null,

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

    // Total Comments
    const totalComments = await Comment.countDocuments(filter)

    // Pagination
    const pagination = {
        totalItems: totalComments,
        totalPages: Math.ceil(totalComments / limit),

        page,
        limit,

        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalComments / limit),

        from: totalComments === 0 ? 0 : (page - 1) * limit + 1,
        to: Math.min(totalComments, page * limit)
    }

    return responseHandler(res, 200, "Comments fetched successfully", {
        comments,
        pagination
    })

})


// Get Comment Replies
export const getCommentReplies = TryCatch(async (req: Request, res: Response) => {

    // Current User ID
    const currentUserId = req.user?._id

    // Filter Data From Query
    let {page=1, limit=20} = req.query

    // Normalize Data
    page = Math.max(1, parseInt(String(page), 10) || 1)
    limit = Math.min(Math.max(1, parseInt(String(limit), 10) || 20), 100)
    
    // Comment ID From Params
    const {commentId} = req.params

    // Validate
    if(!commentId) {
        return responseHandler(res, 400, "Comment ID is required")
    }
    if(typeof commentId !== "string" || !Types.ObjectId.isValid(commentId)) {
        return responseHandler(res, 400, "Invalid comment ID")
    }

    // Verify Comment Exists
    const commentExists = await Comment.exists({
        _id: commentId,
        status: "APPROVED",
        article: {
            $in: await Article.find({status: "PUBLISHED"}).distinct("_id")
        }
    })
    if (!commentExists) {
        return responseHandler(res, 404, "Comment not found");
    }

    // Filter
    const filter: any = {
        parentComment: new Types.ObjectId(commentId),
        $or: [
            {status: "APPROVED"}
        ]
    }
    if(currentUserId) {
        filter.$or.push({
            author: new Types.ObjectId(currentUserId)
        })   
    }

    // Find Comments
    const comments = await Comment.aggregate([

        {
            $match: filter
        },

        {
            $sort: {
                createdAt: -1
            }
        },

        {
            $skip: (page - 1) * limit
        },

        {
            $limit: limit
        },



        // Author Lookup
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            avatar: 1
                        }
                    }
                ],
                as: "author"
            }
        },

        // Author Unwind
        {
            $unwind: "$author"
        },



        // Parent Comment Lookup
        {
            $lookup: {
                from: "comments",
                localField: "parentComment",
                foreignField: "_id",
                as: "parentComment"
            }
        },

        // Parent Comment Unwind
        {
            $unwind: {
                path: "$parentComment",
                preserveNullAndEmptyArrays: true
            }
        },

        // Paerent Author Lookup
        {
            $lookup: {
                from: "users",
                localField: "parentComment.author",
                foreignField: "_id",
                as: "parentComment.author"
            }
        },

        // Parent Comment Author Unwind
        {
            $unwind: {
                path: "$parentComment.author",
                preserveNullAndEmptyArrays: true
            }
        },

        // Parent Comment Fields Filter
        {
            $addFields: {
                parentComment: {
                    $cond: [
                        {
                            $ifNull: ["$parentComment._id", false]
                        },

                        {
                            _id: "$parentComment._id",
                            content: "$parentComment.content",
                            author: {
                                _id: "$parentComment.author._id",
                                name: "$parentComment.author.name",
                                avatar: "$parentComment.author.avatar"
                            }
                        },

                        null
                    ]
                }
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
                myReaction: currentUserId ? {
                    $let: {
                        vars: {
                            userReaction: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$reactions",
                                            as: "reaction",
                                            cond: {
                                                $eq: ["$$reaction.user", new Types.ObjectId(currentUserId)]
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
                } : null,

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

    // Total Comments
    const totalComments = await Comment.countDocuments(filter)

    // Pagination
    const pagination = {
        totalItems: totalComments,
        totalPages: Math.ceil(totalComments / limit),

        page,
        limit,

        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalComments / limit),

        from: totalComments === 0 ? 0 : (page - 1) * limit + 1,
        to: Math.min(totalComments, page * limit)
    }

    return responseHandler(res, 200, "Comments fetched successfully", {
        comments,
        pagination
    })

})


// Update Comment Status
export const updateCommentStatus = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser: any = req.user

    // Comment ID From Params
    const {commentId} = req.params

    // Status From Body
    const {status} = req.body

    // Validate
    if(!commentId) {
        return responseHandler(res, 400, "Comment ID is required")
    }
    if(typeof commentId !== "string" || !Types.ObjectId.isValid(commentId)) {
        return responseHandler(res, 400, "Invalid comment ID")
    }
    if(!status || typeof status !== "string" || !["PENDING", "REJECTED", "APPROVED"].includes(status)) {
        return responseHandler(res, 400, "Invalid comment status")
    }

    // Find Comment
    const comment: any = await Comment.findOne({_id: commentId})
        .populate("article", "author")
    if(!comment) {
        return responseHandler(res, 404, "Comment not found")
    }

    // Journalist Can Update Own Article Comments Status
    if(currentUser?.role === "JOURNALIST" && comment?.article?.author?.toString() !== currentUser?._id) {
        return responseHandler(res, 403, "You can only update comments on your own articles")
    }

    // Update Comment Status
    comment.status = status;
    await comment.save();

    // Success Response
    return responseHandler(res, 200, "Comment status updated successfully")

})


// Delete Comment
export const deleteComment = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser = req.user

    // Comment ID From Params
    const {commentId} = req.params

    // Validate
    if(!commentId) {
        return responseHandler(res, 400, "Comment ID is required")
    }
    if(typeof commentId !== "string" || !Types.ObjectId.isValid(commentId)) {
        return responseHandler(res, 400, "Invalid comment ID")
    }

    // Find Comment
    const comment: any = await Comment.findOne({_id: commentId})
        .populate("article", "author")
    if(!comment) {
        return responseHandler(res, 404, "Comment not found")
    }

    // Restrict Delete For Journalist & User
    if(currentUser?.role === "JOURNALIST" && comment?.author?.toString() !== currentUser?._id?.toString() && comment?.article?.author?.toString() !== currentUser?._id) {
        return responseHandler(res, 403, "You are not authorized to delete comments")
    }
    if(currentUser?.role === "USER" && comment?.author?.toString() !== currentUser?._id?.toString()) {
        return responseHandler(res, 403, "You can only delete your own comments")
    }

    // Delete Reply Comments
    await Comment.deleteMany({parentComment: commentId})

    // Delete Comment
    await Comment.findByIdAndDelete(commentId);

    // Success Response
    return responseHandler(res, 200, "Comment deleted successfully")

})


// Update Comment
export const updateComment = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUserId = req.user?._id

    // Comment ID From Params
    const {commentId} = req.params

    // Content From Body
    const {content} = req.body

    // Validate
    if(!currentUserId || typeof currentUserId !== "string") {
        return responseHandler(res, 401, "Authentication required")
    }
    if(!commentId) {
        return responseHandler(res, 400, "Comment ID is required")
    }
    if(typeof commentId !== "string" || !Types.ObjectId.isValid(commentId)) {
        return responseHandler(res, 400, "Invalid comment ID")
    }
    if(!content || typeof content !== "string" || !content?.trim()) {
        return responseHandler(res, 400, "Comment content is required");
    }

    // Find Comment
    const comment: any = await Comment.findOne({
        _id: commentId,
        author: currentUserId
    })
    if(!comment) {
        return responseHandler(res, 404, "Comment not found")
    }

    // Update
    comment.content = content?.trim()
    await comment.save()

    return responseHandler(res, 200, "Comment updated successfully")

})


// Toggle Comment Reaction
export const toggleCommentReaction = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser = req.user
    if(!currentUser?._id || typeof currentUser?._id !== "string") {
        return responseHandler(res, 401, "Authentication required")
    }

    // Data From body
    const {reactionType, reactionFor: targetType} = req.body

    // Comment ID From Params
    const {id} = req.params

    // Validate
    if(!["LIKE", "DISLIKE"].includes(reactionType)) {
        return responseHandler(res, 400, "Invalid reaction type. Allowed values are LIKE or DISLIKE.")
    }
    if(!["COMMENT"].includes(targetType)) {
        return responseHandler(res, 400, "Invalid reaction target. Allowed values are COMMENT or ARTICLE.")
    }
    if(!id || typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return responseHandler(res, 400, "Invalid ID. Please provide a valid ObjectId.")
    }

    // Target Item Exists
    const targetItem = await Comment.findOne({
        _id: id,
        status: "APPROVED"
    })
    .select("_id author article")
    if(!targetItem) {
        return responseHandler(res, 404, "Comment not found")
    }

    // Own Item
    if(targetItem?.author?.toString() === currentUser?._id?.toString()) {
        return responseHandler(res, 403, "You cannot react to your own comment.")
    }

    // My Reaction Exists
    const reaction = await Reaction.findOne({
        user: new Types.ObjectId(currentUser?._id),
        targetId: targetItem?._id,
        targetType: "COMMENT"
    })

    // Create Reaction
    if(!reaction) {

        // Create Reaction
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
            type: "COMMENT_REACTION",
            title: "New Reaction on Your Comment",
            message: `Someone ${reactionType === "LIKE" ? "liked" : "disliked"} your comment.`,
            targetCategory: targetType,
            targetId: targetItem?.article,
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

            // Create
            let notification = await Notification.create({
                recipient: targetItem?.author?.toString(),
                sender: currentUser._id,
                type: "COMMENT_REACTION",
                title: "New Reaction on Your Comment",
                message: `Someone ${reactionType === "LIKE" ? "liked" : "disliked"} your comment.`,
                targetCategory: targetType,
                targetId: targetItem?.article,
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