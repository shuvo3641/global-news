import express from "express";
import { verifyAuth } from "../../middleware/verify_auth.js";
import { authorizedRoles } from "../../middleware/authorized_roles.js";
import { createCategory, deleteCategory, getAllCategories, getCategories, toggleCategoryStatus, updateCategory } from "./category.controller.js";
import { rateLimiter } from "../../middleware/rate-limiter.middleware.js";
// Router
const router = express.Router();
// Create Category
router.post("/", verifyAuth, authorizedRoles("ADMIN", "SUPER_ADMIN"), rateLimiter(60, 5, "CREATE_CATEGORY"), createCategory);
// Get Categories
router.get("/", verifyAuth, authorizedRoles("JOURNALIST", "EDITOR", "ADMIN", "SUPER_ADMIN"), rateLimiter(60, 30, "GET_CATEGORIES"), getCategories);
// Get All Categories
router.get("/all", rateLimiter(60, 60, "GET_ALL_CATEGORIES"), getAllCategories);
// Update Category
router.patch("/:id", verifyAuth, authorizedRoles("ADMIN", "SUPER_ADMIN"), rateLimiter(60, 10, "UPDATE_CATEGORY"), updateCategory);
// Toggle Category Status
router.patch("/:id/status", verifyAuth, authorizedRoles("ADMIN", "SUPER_ADMIN"), rateLimiter(60, 10, "TOGGLE_CATEGORY_STATUS"), toggleCategoryStatus);
// Delete Category
router.delete("/:id", verifyAuth, authorizedRoles("ADMIN", "SUPER_ADMIN"), rateLimiter(60, 5, "DELETE_CATEGORY"), deleteCategory);
export const categoryRouter = router;
//# sourceMappingURL=category.route.js.map