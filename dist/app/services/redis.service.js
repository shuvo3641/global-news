import { redisClient } from "../config/redis.js";
// Delete Settings Data
export const deleteRedisData = async (...redisKeys) => {
    try {
        if (redisKeys.length === 0)
            return;
        await redisClient.del(redisKeys);
    }
    catch (error) {
        console.error("Failed to invalidate Redis cache:", error);
    }
};
// Get Redis Data
export const getRedisData = async (key) => {
    try {
        const cachedData = await redisClient.get(key);
        if (cachedData === null)
            return null;
        return JSON.parse(cachedData);
    }
    catch (error) {
        console.error("Failed to read redis cache:", error);
        return null;
    }
};
// Set Redis Data
export const setRedisData = async (redisKey, data, time) => {
    try {
        await redisClient.set(redisKey, JSON.stringify(data), {
            EX: time
        });
    }
    catch (error) {
        console.error("Failed to write redis cache:", error);
    }
};
// Get Redis Cooldown
export const getRedisCooldown = async (key) => {
    try {
        return await redisClient.ttl(key);
    }
    catch (error) {
        console.error("Failed to get Redis cooldown:", error);
        return -1;
    }
};
//# sourceMappingURL=redis.service.js.map