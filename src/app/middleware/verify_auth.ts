import type { NextFunction, Request, Response } from "express";
import { TryCatch } from "./TryCatch.js";
import { responseHandler } from "../utils/responseHandler.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { User } from "../module/user/user.model.js";
import { redisClient } from "../config/redis.js";
import { getRedisData } from "../services/redis.service.js";


// Request User Interface
declare global {
    namespace Express {
        interface Request {
            user?: {
                _id: string;
                name: string;
                email: string;
                role: string;
                provider: "GOOGLE" | "CREDENTIALS"
            }
        }
    }
}


// Middleware
export const verifyAuth = TryCatch(async (req: Request, res: Response, next: NextFunction) => {

    // Access Token From Headers
    const accessToken = req.headers?.authorization
    if(!accessToken || !accessToken.startsWith("Bearer ")){
        return responseHandler(res, 401, "Unauthorized access")
    }

    // Exac Token
    const token = accessToken?.split(" ")?.[1]
    if(!token){
        return responseHandler(res, 401, "Unauthorized access");
    }

    // Payload
    let payload: {
        userId: string
    }

    try {
        payload = jwt.verify(token, config.jwtAccessSecret) as typeof payload
    } catch(err) {
        return responseHandler(res, 401, "Invalid or expired token")
    }

    // Get User Id
    const userId = payload?.userId
    if(!userId){
        return responseHandler(res, 401, "Invalid token payload.");
    }

    // Find User
    const user = await User.findById(userId)
    if(!user) {
        return responseHandler(res, 404, "User not found");
    }

    // Redis Key
    const redisUserSessionKey = `USER_SESSION:${user._id}`

    // Deleted Account
    if(user.isDeleted) {
        await redisClient.del(redisUserSessionKey)
        return responseHandler(res, 403, "This account has been deleted.")
    }

    // Blocked Account
    if(user.isBlocked) {
        await redisClient.del(redisUserSessionKey)
        return responseHandler(res, 403, "This account has been blocked.")
    }

    // Get User Session Data From Redis
    const redisUserSessionData = await getRedisData(redisUserSessionKey)
    if(!redisUserSessionData) {
        return responseHandler(res, 401, "Session expired.")
    }

    // Attach User to Request
    req.user = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider
    };

    // Continue
    next();

})