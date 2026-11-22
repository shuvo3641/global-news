import { redisClient } from "../config/redis.js"


// Delete Settings Data
export const deleteRedisData = async (...redisKeys: string[]): Promise<void> => {
    try{
        if(redisKeys.length === 0) return
        await redisClient.del(redisKeys)
    }catch(error){
        console.error("Failed to invalidate Redis cache:", error)
    }
}


// Get Redis Data
export const getRedisData = async (key: string): Promise<unknown | null> => {
    try{
        const cachedData = await redisClient.get(key)
        if(cachedData === null) return null
        return JSON.parse(cachedData)
    }catch(error){
        console.error("Failed to read redis cache:", error);
        return null;
    }
}


// Set Redis Data
export const setRedisData = async (redisKey: string, data: unknown, time: number): Promise<void> => {
    try{
        await redisClient.set(redisKey, JSON.stringify(data), {
            EX: time
        })
    }catch(error){
         console.error("Failed to write redis cache:", error);
    }
}


// Get Redis Cooldown
export const getRedisCooldown = async (key: string): Promise<number> => {
    try {
        return await redisClient.ttl(key)
    } catch (error) {
        console.error("Failed to get Redis cooldown:", error)
        return -1
    }
}