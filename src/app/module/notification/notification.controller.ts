import type { Request, Response } from "express";
import { TryCatch } from "../../middleware/TryCatch.js";
import { Notification } from "./notification.model.js";
import { Types } from "mongoose";
import { responseHandler } from "../../utils/responseHandler.js";
import { isUserOnline } from "../../utils/onlineUsers.js";
import { getIO } from "../../config/socket.js";


// Get Notifications
export const getNotifications = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser: any = req.user

    // Filter Data From Query
    let {isRead, limit=20, page=1} = req.query

    // Normalize Data
    limit = Math.max(Math.min(100, !isNaN(Number(limit)) ? Math.floor(Number(limit)) : 20), 20)
    page = Math.max(!isNaN(Number(page)) ? Math.floor(Number(page)) : 1, 1)

    // Filter
    const filter: any = {
        recipient: new Types.ObjectId(currentUser._id)
    }
    if(isRead && typeof isRead === "string" && ["true", "false"].includes(isRead)) {
        filter.isRead = isRead === "true"
    }

    // Notifications
    const notifications = await Notification.aggregate([

        // Filter
        {
            $match: filter
        },

        // Sender
        {
            $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            email: 1
                        }
                    }
                ],
                as: "sender"
            }
        },

        {
            $unwind: {
                path: "$sender",
                preserveNullAndEmptyArrays: true
            }
        },

        // Article / Comment Lookup
        {
            $lookup: {
                from: "articles",
                let: {
                    targetId: "$targetId",
                    category: "$targetCategory"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {$eq: ["$$targetId", "$_id"]},
                                    {$in: ["$$category", ["ARTICLE", "COMMENT"]]}
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            slug: 1
                        }
                    }
                ],
                as: "articleTarget"
            }
        },

        // Contact Lookup
        {
            $lookup: {
                from: "contact_messages",
                let: {
                    targetId: "$targetId",
                    category: "$targetCategory"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {$eq: ["$$targetId", "$_id"]},
                                    {$eq: ["$$category", "CONTACT"]}
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            subject: 1,
                            fullName: 1
                        }
                    }
                ],
                as: "contactTarget"
            }
        },

        // Merge Target
        {
            $addFields: {
                targetId: {
                    $cond: [
                        {$eq: ["$targetCategory", "CONTACT"]},
                        {$arrayElemAt: ["$contactTarget", 0]},
                        {$arrayElemAt: ["$articleTarget", 0]}
                    ]
                }
            }
        },

        // Cleanup
        {
            $project: {
                articleTarget: 0,
                contactTarget: 0
            }
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
        }

    ])

    // Total Notifications
    const totalNotifications = await Notification.countDocuments(filter)

    // Unread Notification Count
    const unreadNotificationCount = await Notification.countDocuments({
        recipient: new Types.ObjectId(currentUser._id),
        isRead: false
    })

    // Pagination
    const pagination = {
        totalItems: totalNotifications,
        totalPages: Math.ceil(totalNotifications / limit),

        page,
        limit,

        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalNotifications / limit),

        from: totalNotifications === 0 ? 0 : (page - 1) * limit + 1,
        to: Math.min(totalNotifications, page * limit)
    }

    return responseHandler(res, 200, "Notifications fetched successfully", {
        notifications,
        pagination,
        unreadNotificationCount
    })

})


// Delete Notifications
export const deleteNotification = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser: any = req.user

    // Notification ID From Params
    const {notificationId} = req.params

    // Validate
    if(!notificationId || typeof notificationId !== "string" || !Types.ObjectId.isValid(notificationId)) {
        return responseHandler(res, 400, "Missing or invalid notification ID")
    }

    // Find & Delete Notification
    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: currentUser._id
    })
    if(!notification) {
        return responseHandler(res, 404, "Notification not found")
    }

    // Send Notification
    const io = getIO()
    const recipientId = notification.recipient.toString()
    if(isUserOnline(recipientId)) {
        io.to(`user:${recipientId}`).emit("notification:delete", {
            notification: notification?._id?.toString(),
            isRead: notification?.isRead
        })
    }

    return responseHandler(res, 200, "Notification deleted successfully")

})


// Mark Notification As Read
export const markNotificationAsRead = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser: any = req.user

    // Notification ID From Params
    const {notificationId} = req.params

    // Validate
    if(!notificationId || typeof notificationId !== "string" || !Types.ObjectId.isValid(notificationId)) {
        return responseHandler(res, 400, "Missing or invalid notification ID")
    }

    // Find Notification
    const notification = await Notification.findOneAndUpdate({
        _id: notificationId,
        recipient: currentUser._id
    }, {
        $set: {
            isRead: true
        }
    }, {
        returnDocument: "after"
    })
    if(!notification) {
        return responseHandler(res, 404, "Notification not found")
    }

    // Send Notification
    const io = getIO()
    const recipientId = notification.recipient.toString()
    if(isUserOnline(recipientId)) {
        io.to(`user:${recipientId}`).emit("notification:mark-read", notification?._id?.toString())
    }

    return responseHandler(res, 200, "Notification marked as read")

})