import express from "express"
import { verifyAuth } from "../../middleware/verify_auth.js";
import { getSettings, updateAppSettings, updateContactSettings } from "./settings.controller.js";
import { authorizedRoles } from "../../middleware/authorized_roles.js";
import { rateLimiter } from "../../middleware/rate-limiter.middleware.js";

// Router
const router = express.Router()


// Update App Settings
router.put("/app",
    verifyAuth, 
    authorizedRoles("ADMIN", "SUPER_ADMIN"),
    rateLimiter(60, 5, "UPDATE_APP_SETTINGS"),
    updateAppSettings
)


// Update Contact Settings
router.put("/contact",
    verifyAuth,
    authorizedRoles("ADMIN", "SUPER_ADMIN"),
    rateLimiter(60, 5, "UPDATE_CONTACT_SETTINGS"),
    updateContactSettings
)


// Get Settings
router.get("/:type",
    rateLimiter(60, 30, "GET_SETTINGS"),
    getSettings
)









export const settingsRouter = router;