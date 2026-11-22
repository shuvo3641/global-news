import type { NextFunction, Request, Response } from "express";
import { TryCatch } from "./TryCatch.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { User } from "../module/user/user.model.js";
import { getRedisData } from "../services/redis.service.js";

// Middleware
export const getCurrentUser = TryCatch(async (req: Request, res: Response, next: NextFunction) => {

    // Access Token From Headers
    const accessToken = req.headers?.authorization
    if(!accessToken || !accessToken.startsWith("Bearer ")){
        return next()
    }

    // Exac Token
    const token = accessToken?.split(" ")?.[1]
    if(!token){
        return next();
    }

    // Payload
    let payload: {
        userId: string
    }

    try {
        payload = jwt.verify(token, config.jwtAccessSecret) as typeof payload
    } catch(err) {
        return next();
    }

    // Get User Id
    const userId = payload?.userId
    if(!userId){
        return next();
    }

    // Find User
    const user = await User.findById(userId)
    if(!user) {
        return next();
    }

    // Redis Key
    const redisUserSessionKey = `USER_SESSION:${user._id}`

    // Deleted Account
    if(user.isDeleted) {
        return next();
    }

    // Blocked Account
    if(user.isBlocked) {
        return next();
    }

    // Get User Session Data From Redis
    const redisUserSessionData = await getRedisData(redisUserSessionKey)
    if(!redisUserSessionData) {
        return next();
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