import type { Request, Response } from "express";
import { TryCatch } from "../../middleware/TryCatch.js";
import { responseHandler } from "../../utils/responseHandler.js";
import { User } from "../user/user.model.js";
import { Article } from "../article/article.model.js";
import { ContactMessage } from "../contact/contact.model.js";
import { Comment } from "../comment/comment.model.js";
import { Types } from "mongoose";

// Get Dashboard Stats
export const getDashboardStats = TryCatch(async (req: Request, res: Response) => {

    // User Data
    const userId = req.user?._id
    const role: any = req.user?.role

    // Dashboard Data
    let dashboardData: any = {}

    // Find Data
    if (["ADMIN", "SUPER_ADMIN"].includes(role)) {

        const [
            totalUsers,
            totalJournalists,
            totalArticles,
            totalPublishedArticles,
            totalSubmittedArticles,
            totalRejectedArticles,
            totalContactMessages,
            totalUnreadContactMessages
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({role: "JOURNALIST"}),
            Article.countDocuments(),
            Article.countDocuments({status: "PUBLISHED"}),
            Article.countDocuments({status: "SUBMITTED"}),
            Article.countDocuments({status: "REJECTED"}),
            ContactMessage.countDocuments(),
            ContactMessage.countDocuments({isRead: false})
        ])

        dashboardData = {
            totalUsers,
            totalJournalists,
            totalArticles,
            totalPublishedArticles,
            totalSubmittedArticles,
            totalRejectedArticles,
            totalContactMessages,
            totalUnreadContactMessages
        }

    } else if(role === "MODERATOR") {

        const [
            totalComments,
            totalArticles,
            totalPublishedArticles,
            totalSubmittedArticles,
            totalRejectedArticles
        ] = await Promise.all([
            Comment.countDocuments(),
            Article.countDocuments(),
            Article.countDocuments({status: "PUBLISHED"}),
            Article.countDocuments({status: "SUBMITTED"}),
            Article.countDocuments({status: "REJECTED"})
        ])

        dashboardData = {
            totalComments,
            totalArticles,
            totalPublishedArticles,
            totalSubmittedArticles,
            totalRejectedArticles
        }

    } else if(role === "EDITOR") {

        const [
            totalComments,
            totalArticles,
            totalPublishedArticles,
            totalSubmittedArticles,
            totalRejectedArticles
        ] = await Promise.all([
            Comment.countDocuments(),
            Article.countDocuments(),
            Article.countDocuments({status: "PUBLISHED"}),
            Article.countDocuments({status: "SUBMITTED"}),
            Article.countDocuments({status: "REJECTED"})
        ])

        dashboardData = {
            totalComments,
            totalArticles,
            totalPublishedArticles,
            totalSubmittedArticles,
            totalRejectedArticles
        }

    } else if(role === "JOURNALIST") {

        const [
            totalArticles,
            totalPublishedArticles,
            totalSubmittedArticles,
            totalRejectedArticles
        ] = await Promise.all([
            Article.countDocuments({author: new Types.ObjectId(userId)}),
            Article.countDocuments({status: "PUBLISHED", author: new Types.ObjectId(userId)}),
            Article.countDocuments({status: "SUBMITTED", author: new Types.ObjectId(userId)}),
            Article.countDocuments({status: "REJECTED", author: new Types.ObjectId(userId)}),
        ])

        dashboardData = {
            totalArticles,
            totalPublishedArticles,
            totalSubmittedArticles,
            totalRejectedArticles,
        }

    } else {
        return responseHandler(res, 403, "You are not allowed to access this dashboard")
    }

    return responseHandler(res, 200, "Dashboard stats fetched successfully", {
        stats: dashboardData
    })

})