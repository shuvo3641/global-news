import express from "express";
import { verifyAuth } from "../../middleware/verify_auth.js";
import { authorizedRoles } from "../../middleware/authorized_roles.js";
import { getDashboardStats } from "./dashboard.controller.js";
import { rateLimiter } from "../../middleware/rate-limiter.middleware.js";

// Router
const router = express.Router()


// Get Dashboard Stats
router.get("/stats",
    verifyAuth,
    authorizedRoles("JOURNALIST", "EDITOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"),
    rateLimiter(60, 20, "DASHBOARD_STATS"),
    getDashboardStats
)








export const dashboardRouter = router;