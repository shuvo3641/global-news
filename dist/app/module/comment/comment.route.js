import express from "express";
import { verifyAuth } from "../../middleware/verify_auth.js";
import { createComment, deleteComment, getArticleComments, getCommentReplies, getDashboardComments, toggleCommentReaction, updateComment, updateCommentStatus } from "./comment.controller.js";
import { authorizedRoles } from "../../middleware/authorized_roles.js";
import { rateLimiter } from "../../middleware/rate-limiter.middleware.js";
// Router
const router = express.Router();
// Create Comment
router.post("/", verifyAuth, rateLimiter(60, 10, "CREATE_COMMENT"), createComment);
// Get Dashboard Comments
router.get("/dashboard", verifyAuth, authorizedRoles("JOURNALIST", "EDITOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"), rateLimiter(60, 30, "DASHBOARD_COMMENTS"), getDashboardComments);
// Get Article Comments
router.get("/:articleId", rateLimiter(60, 60, "ARTICLE_COMMENTS"), getArticleComments);
// Get Comment Replies
router.get("/:commentId/replies", rateLimiter(60, 60, "COMMENT_REPLIES"), getCommentReplies);
// Update Comment Status
router.patch("/:commentId/status", verifyAuth, authorizedRoles("JOURNALIST", "EDITOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"), rateLimiter(60, 10, "UPDATE_COMMENT_STATUS"), updateCommentStatus);
// Delete Comment
router.delete("/:commentId", verifyAuth, rateLimiter(60, 5, "DELETE_COMMENT"), deleteComment);
// Update Comment
router.patch("/:commentId", verifyAuth, rateLimiter(60, 10, "UPDATE_COMMENT"), updateComment);
// Toggle Comment Reaction
router.post("/reactions/:id", verifyAuth, rateLimiter(60, 30, "COMMENT_REACTION"), toggleCommentReaction);
export const commentRouter = router;
//# sourceMappingURL=comment.route.js.map