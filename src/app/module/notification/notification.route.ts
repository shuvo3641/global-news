import express from "express";
import { verifyAuth } from "../../middleware/verify_auth.js";
import { deleteNotification, getNotifications, markNotificationAsRead } from "./notification.controller.js";
import { rateLimiter } from "../../middleware/rate-limiter.middleware.js";

// Router
const router = express.Router()


// Get Notifications
router.get("/",
    verifyAuth,
    rateLimiter(60, 60, "GET_NOTIFICATIONS"),
    getNotifications
)


// Delete Notification
router.delete("/:notificationId",
    verifyAuth,
    rateLimiter(60, 10, "DELETE_NOTIFICATION"),
    deleteNotification
)


// Mark Notification As Read
router.patch("/:notificationId/read",
    verifyAuth,
    rateLimiter(60, 30, "MARK_NOTIFICATION_READ"),
    markNotificationAsRead
)










export const notificationRoute = router;