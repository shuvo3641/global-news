import express from "express";
import { verifyAuth } from "../../middleware/verify_auth.js";
import { authorizedRoles } from "../../middleware/authorized_roles.js";
import { deleteMedia, getMedia, getMediaStats, updateMedia, uploadMedia } from "./media.controller.js";
import { rateLimiter } from "../../middleware/rate-limiter.middleware.js";

// Router
const router = express.Router()


// Upload Media
router.post("/",
    verifyAuth, 
    authorizedRoles("JOURNALIST", "EDITOR", "ADMIN", "SUPER_ADMIN"),
    rateLimiter(3600, 20, "UPLOAD_MEDIA"),
    uploadMedia
)


// Get Media Stats
router.get("/stats",
    verifyAuth,
    authorizedRoles("JOURNALIST", "EDITOR", "ADMIN", "SUPER_ADMIN"),
    rateLimiter(60, 20, "MEDIA_STATS"),
    getMediaStats
)


// Get Media
router.get("/",
    verifyAuth,
    authorizedRoles("JOURNALIST", "EDITOR", "ADMIN", "SUPER_ADMIN"),
    rateLimiter(60, 40, "GET_MEDIA"),
    getMedia
)


// Update Media
router.patch("/:id",
    verifyAuth,
    authorizedRoles("JOURNALIST", "EDITOR", "ADMIN", "SUPER_ADMIN"),
    rateLimiter(60, 10, "UPDATE_MEDIA"),
    updateMedia
)


// Delete Media
router.delete("/:id",
    verifyAuth,
    authorizedRoles("JOURNALIST", "EDITOR", "ADMIN", "SUPER_ADMIN"),
    rateLimiter(60, 10, "DELETE_MEDIA"),
    deleteMedia
)










export const mediaRouter = router;