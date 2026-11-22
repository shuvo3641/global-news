import express from "express";
import { verifyAuth } from "../../middleware/verify_auth.js";
import { authorizedRoles } from "../../middleware/authorized_roles.js";
import { createTag, deleteTag, getAllTags, getTags, toggleTagStatus, updateTag } from "./tag.controller.js";
import { rateLimiter } from "../../middleware/rate-limiter.middleware.js";
// Router
const router = express.Router();
// Create Tag
router.post("/", verifyAuth, authorizedRoles("ADMIN", "SUPER_ADMIN"), rateLimiter(60, 5, "CREATE_TAG"), createTag);
// Get Tags
router.get("/", verifyAuth, authorizedRoles("JOURNALIST", "EDITOR", "ADMIN", "SUPER_ADMIN"), rateLimiter(60, 30, "GET_TAGS"), getTags);
// Get All Tags
router.get("/all", rateLimiter(60, 60, "GET_ALL_TAGS"), getAllTags);
// Update Tag
router.patch("/:id", verifyAuth, authorizedRoles("ADMIN", "SUPER_ADMIN"), rateLimiter(60, 10, "UPDATE_TAG"), updateTag);
// Toggle Tag Status
router.patch("/:id/status", verifyAuth, authorizedRoles("ADMIN", "SUPER_ADMIN"), rateLimiter(60, 10, "TOGGLE_TAG_STATUS"), toggleTagStatus);
// Delete Tag
router.delete("/:id", verifyAuth, authorizedRoles("ADMIN", "SUPER_ADMIN"), rateLimiter(60, 5, "DELETE_TAG"), deleteTag);
export const tagRouter = router;
//# sourceMappingURL=tag.route.js.map