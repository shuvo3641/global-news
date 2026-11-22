import express from "express";
import { verifyAuth } from "../../middleware/verify_auth.js";
import { authorizedRoles } from "../../middleware/authorized_roles.js";
import { createArticle, deleteArticle, getArticleDetails, getArticles, getDashboardArticleDetails, getDashboardArticles, toggleArticleFeaturedStatus, toggleArticleReaction, updateArticle, updateArticleReviewStatus } from "./article.controller.js";
import { getCurrentUser } from "../../middleware/get_current_user.js";
import { rateLimiter } from "../../middleware/rate-limiter.middleware.js";
// Router
const router = express.Router();
// Create Article
router.post("/", verifyAuth, authorizedRoles("JOURNALIST"), rateLimiter(60, 5, "CREATE_ARTICLE"), createArticle);
// Get Articles
router.get("/", getCurrentUser, rateLimiter(60, 60, "GET_ARTICLES"), getArticles);
// Get Dashboaed Articles
router.get("/dashboard", verifyAuth, authorizedRoles("JOURNALIST", "EDITOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"), rateLimiter(60, 30, "DASHBOARD_ARTICLES"), getDashboardArticles);
// Get Article Details
router.get("/:slug", getCurrentUser, rateLimiter(60, 60, "ARTICLE_DETAILS"), getArticleDetails);
// Toggle Article Featured Status
router.patch("/:id/featured", verifyAuth, authorizedRoles("EDITOR", "ADMIN", "SUPER_ADMIN"), rateLimiter(60, 10, "TOGGLE_ARTICLE_FEATURED"), toggleArticleFeaturedStatus);
// Get Dashboard Article Details
router.get("/dashboard/:id", verifyAuth, authorizedRoles("JOURNALIST", "EDITOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"), rateLimiter(60, 30, "DASHBOARD_ARTICLE_DETAILS"), getDashboardArticleDetails);
// Delete Article
router.delete("/:id", verifyAuth, authorizedRoles("JOURNALIST", "EDITOR", "ADMIN", "SUPER_ADMIN"), rateLimiter(60, 5, "DELETE_ARTICLE"), deleteArticle);
// Update Article
router.put("/:id", verifyAuth, authorizedRoles("JOURNALIST", "EDITOR", "ADMIN", "SUPER_ADMIN"), rateLimiter(60, 10, "UPDATE_ARTICLE"), updateArticle);
// Update Article Review Status
router.patch("/:id/review-status", verifyAuth, authorizedRoles("EDITOR", "ADMIN", "SUPER_ADMIN"), rateLimiter(60, 10, "ARTICLE_REVIEW_STATUS"), updateArticleReviewStatus);
// Toggle Article Reaction
router.post("/reactions/:id", verifyAuth, rateLimiter(60, 30, "ARTICLE_REACTION"), toggleArticleReaction);
export const articleRouter = router;
//# sourceMappingURL=article.route.js.map