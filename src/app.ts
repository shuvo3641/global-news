import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
import { responseHandler } from "./app/utils/responseHandler.js";
import { authRouter } from "./app/module/auth/auth.route.js";
import { config } from "./app/config/config.js";
import { settingsRouter } from "./app/module/settings/settings.route.js";
import { userRouter } from "./app/module/user/user.route.js";
import { mediaRouter } from "./app/module/media/media.route.js";
import { categoryRouter } from "./app/module/category/category.route.js";
import { tagRouter } from "./app/module/tag/tag.route.js";
import { articleRouter } from "./app/module/article/article.route.js";
import { commentRouter } from "./app/module/comment/comment.route.js";
import { notificationRoute } from "./app/module/notification/notification.route.js";
import { contactRouter } from "./app/module/contact/contact.route.js";
import { dashboardRouter } from "./app/module/dashboard/dashboard.route.js";

// App Instance
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: config.clientUrl,
    credentials: true
}))



// Auth Router
app.use("/api/v1/auth", authRouter)

// Dashboard
app.use("/api/v1/dashboard", dashboardRouter)

// User Router
app.use("/api/v1/users", userRouter)

// Article router
app.use("/api/v1/articles", articleRouter)

// Comment router
app.use("/api/v1/comments", commentRouter)

// Category Router
app.use("/api/v1/categories", categoryRouter)

// Tag Router
app.use("/api/v1/tags", tagRouter)

// Contact Router
app.use("/api/v1/contacts", contactRouter)

// Notification Router
app.use("/api/v1/notifications", notificationRoute)

// Media Router
app.use("/api/v1/media", mediaRouter)

// Settings Router
app.use("/api/v1/settings", settingsRouter)










export default app;