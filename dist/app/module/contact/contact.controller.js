import { TryCatch } from "../../middleware/TryCatch.js";
import { createContactMessageSchema } from "./contact.validation.js";
import { zodErrorHandler } from "../../utils/zodErrorHandler.js";
import sanitize from "mongo-sanitize";
import { responseHandler } from "../../utils/responseHandler.js";
import { User } from "../user/user.model.js";
import { Notification } from "../notification/notification.model.js";
import { ContactMessage } from "./contact.model.js";
import { Types } from "mongoose";
import { getIO } from "../../config/socket.js";
import { isUserOnline } from "../../utils/onlineUsers.js";
import { Article } from "../article/article.model.js";
// Get Contact Messages
export const getContactMessages = TryCatch(async (req, res) => {
    // Filter Data From Query
    let { isRead, limit = 20, page = 1 } = req.query;
    // Normalize Data
    limit = Math.max(Math.min(100, !isNaN(Number(limit)) ? Math.floor(Number(limit)) : 20), 20);
    page = Math.max(!isNaN(Number(page)) ? Math.floor(Number(page)) : 1, 1);
    // Filter
    const filter = {};
    if (isRead && typeof isRead === "string" && ["true", "false"].includes(isRead)) {
        filter.isRead = isRead === "true";
    }
    // Messages
    const messages = await ContactMessage.find(filter)
        .populate("sender")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    // Total Messages
    const totalMessages = await ContactMessage.countDocuments(filter);
    // Pagination
    const pagination = {
        totalItems: totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
        page,
        limit,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalMessages / limit),
        from: totalMessages === 0 ? 0 : (page - 1) * limit + 1,
        to: Math.min(totalMessages, page * limit)
    };
    return responseHandler(res, 200, "Contact messages fetched successfully", {
        messages,
        pagination,
    });
});
// Create Contact Message
export const createContactMessage = TryCatch(async (req, res) => {
    // Current User
    const currentUser = req.user;
    // Validate
    const validate = createContactMessageSchema.safeParse(req.body);
    if (!validate?.success) {
        return zodErrorHandler(res, validate);
    }
    // Sanitize Data
    const sanitizedData = sanitize(validate.data);
    // Create Message
    const contact = await ContactMessage.create({
        sender: currentUser._id,
        ...sanitizedData
    });
    // Find Eligible Users
    const eligibleUsers = await User.find({
        role: { $in: ["ADMIN", "SUPER_ADMIN"] },
        isBlocked: false,
        isDeleted: false
    })
        .select("_id")
        .lean();
    // Create Notifications
    if (eligibleUsers.length > 0) {
        // Create Notifications
        const notifications = await Notification.insertMany(eligibleUsers.map((user) => ({
            recipient: user._id,
            sender: currentUser?._id,
            type: "USER_CONTACT",
            title: "New Contact Request",
            message: "A new contact request has been submitted.",
            targetCategory: "CONTACT",
            targetId: contact._id
        })));
        // Populate Sender
        await Notification.populate(notifications, {
            path: "sender",
            select: "name email avatar"
        });
        // Send Notification Real Time
        const io = getIO();
        for (let notification of notifications) {
            // Recipient ID
            const recipientId = notification.recipient.toString();
            // Populated Notification
            let targetItem = null;
            if (["ARTICLE", "COMMENT"].includes(notification?.targetCategory)) {
                targetItem = await Article.findOne({
                    _id: notification.targetId
                }).lean();
            }
            else {
                targetItem = await ContactMessage.findOne({
                    _id: notification.targetId
                }).lean();
            }
            // Updated Notifications
            const updatedNotification = {
                ...notification.toObject(),
                targetId: targetItem
            };
            // Send
            if (isUserOnline(recipientId)) {
                io.to(`user:${recipientId}`).emit("notification:new", updatedNotification);
            }
        }
    }
    return responseHandler(res, 201, "Contact message submitted successfully");
});
// Delete Contact Message
export const deleteContactMessage = TryCatch(async (req, res) => {
    // Contact Message ID From Params
    const { contactMessageId } = req.params;
    // Validate
    if (!contactMessageId || typeof contactMessageId !== "string" || !Types.ObjectId.isValid(contactMessageId)) {
        return responseHandler(res, 400, "Missing or invalid contact message ID");
    }
    // Find & Delete Contact Message
    const message = await ContactMessage.findOneAndDelete({
        _id: contactMessageId
    });
    if (!message) {
        return responseHandler(res, 404, "Contact message not found");
    }
    return responseHandler(res, 200, "Contact message deleted successfully");
});
// Mark Contact Message As Read
export const markContactMessageAsRead = TryCatch(async (req, res) => {
    // Contact Message ID From Params
    const { contactMessageId } = req.params;
    // Validate
    if (!contactMessageId || typeof contactMessageId !== "string" || !Types.ObjectId.isValid(contactMessageId)) {
        return responseHandler(res, 400, "Missing or invalid contact message ID");
    }
    // Find & Update Contact Message Read Status
    const message = await ContactMessage.findOneAndUpdate({
        _id: contactMessageId
    }, {
        isRead: true
    }, {
        returnDocument: "after"
    });
    if (!message) {
        return responseHandler(res, 404, "Contact message not found");
    }
    return responseHandler(res, 200, "Contact message marked as read successfully");
});
// Get Single Contact Message
export const getSingleContactMessage = TryCatch(async (req, res) => {
    // Contact Message ID From Params
    const { contactMessageId } = req.params;
    // Validate
    if (!contactMessageId || typeof contactMessageId !== "string" || !Types.ObjectId.isValid(contactMessageId)) {
        return responseHandler(res, 400, "Missing or invalid contact message ID");
    }
    // Find Contact Message
    const message = await ContactMessage.findById(contactMessageId)
        .populate("sender", "fullName email avatar");
    if (!message) {
        return responseHandler(res, 404, "Contact message not found");
    }
    return responseHandler(res, 200, "Contact message retrieved successfully", {
        message
    });
});
//# sourceMappingURL=contact.controller.js.map