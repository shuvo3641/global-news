import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { getRedisData } from "../services/redis.service.js";
import { User } from "../module/user/user.model.js";

export const socketAuth = async (socket: any, next: any) => {
    try {
        // Get Access Token
        const token = socket.handshake.auth?.token
        if (!token || typeof token !== "string") {
            return next(new Error("Unauthorized access"));
        }

        // Verify JWT
        let payload: any
        try {
            payload = jwt.verify(token, config.jwtAccessSecret)
        } catch {
            return next(new Error("Invalid or expired token"));
        }

        // Get User ID
        const userId = payload?.userId;
        if (!userId) {
            return next(new Error("Invalid token payload"));
        }

        // Find User
        const user = await User.findById(userId);
        if (!user) {
            return next(new Error("User not found"));
        }

        // Redis Session Key
        const redisUserSessionKey = `USER_SESSION:${user._id}`;

        // Deleted Account
        if (user.isDeleted) {
            return next(new Error("This account has been deleted"));
        }

        // Blocked Account
        if (user.isBlocked) {
            return next(new Error("This account has been blocked"));
        }

        // Check Redis Session
        const redisUserSessionData = await getRedisData(redisUserSessionKey);
        if (!redisUserSessionData) {
            return next(new Error("Session expired"));
        }

        // Attach Authenticated User
        const socketUser = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            provider: user.provider
        };

        socket.data.user = socketUser;

        next();
    } catch (error) {
        next(new Error("Socket authentication failed"));
    }
}