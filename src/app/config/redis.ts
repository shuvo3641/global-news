import {createClient} from "redis"
import { config } from "./config.js"

export const redisClient = await createClient({
    url: config.redisUri
})

export const connectRedis = async (): Promise<void> => {
    try{
        await redisClient.connect()
        console.log("Redis connected successfully")
    }catch(error){
        console.error("Redis connection failed: ", error)
        process.exit(1)
    }
}