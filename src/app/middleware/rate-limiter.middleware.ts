import type { NextFunction, Request, Response } from "express";
import { redisClient } from "../config/redis.js";
import { responseHandler } from "../utils/responseHandler.js";

export const rateLimiter = (seconds: number, limit: number, key:string) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        // Identifier
        let identifier: string;

        // Check
        if (req.user?._id) {
            identifier = `user:${req.user._id}`;
        } else if (typeof req.body?.email === "string" && req.body?.email?.trim()) {
            identifier = `email:${req.body?.email?.trim().toLowerCase()}:ip:${req.ip}`
        } else {
            identifier = `ip:${req.ip}`
        }

        // Redis Key
        const redisKey = `RATE_LIMIT:${key}:${identifier}`

        // Redis Implementation
        const redisData = await redisClient.get(redisKey)

        // No redis Data
        if (!redisData) {
            await redisClient.set(redisKey, "1", {
                EX: seconds
            })
            return next()
        }

        // Redis Data Exists
        const count = Number(redisData)
        if (count >= limit) {
            return responseHandler(res, 429, "Too many requests. Please try again later.")
        } else {
            await redisClient.set(redisKey, JSON.stringify(count + 1), {
                KEEPTTL: true
            })
        }

        next()

    }
}