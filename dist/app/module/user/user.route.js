import express from "express";
import { verifyAuth } from "../../middleware/verify_auth.js";
import { changePassword, createUser, getMyData, getUsers, toggleUserBlockStatus, toggleUserDeleteStatus } from "./user.controller.js";
import { authorizedRoles } from "../../middleware/authorized_roles.js";
import { rateLimiter } from "../../middleware/rate-limiter.middleware.js";
// Router
const router = express.Router();
// Get My Data
router.get("/me", verifyAuth, rateLimiter(60, 60, "GET_MY_DATA"), getMyData);
// Get Users
router.get("/", verifyAuth, authorizedRoles("MODERATOR", "ADMIN", "SUPER_ADMIN"), rateLimiter(60, 30, "GET_USERS"), getUsers);
// Change Password
router.patch("/change-password", verifyAuth, rateLimiter(900, 5, "CHANGE_PASSWORD"), changePassword);
// Toggle User Block Status
router.patch("/:userId/block-status", verifyAuth, authorizedRoles("ADMIN", "SUPER_ADMIN"), rateLimiter(60, 10, "TOGGLE_USER_BLOCK_STATUS"), toggleUserBlockStatus);
// Toggle User Delete Status
router.patch("/:userId/delete-status", verifyAuth, authorizedRoles("ADMIN", "SUPER_ADMIN"), rateLimiter(60, 5, "TOGGLE_USER_DELETE_STATUS"), toggleUserDeleteStatus);
// Create User
router.post("/", verifyAuth, authorizedRoles("ADMIN", "SUPER_ADMIN"), rateLimiter(60, 5, "CREATE_USER"), createUser);
export const userRouter = router;
//# sourceMappingURL=user.route.js.map