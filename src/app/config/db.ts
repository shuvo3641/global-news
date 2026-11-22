import mongoose from "mongoose"
import { config } from "./config.js"

export const connectDB = async (): Promise<void> => {
    try{
        await mongoose.connect(config.mongodbUri)
        console.log("MongoB connected successfully")
    }catch(error){
        console.error("MongoDB connection failed: ", error)
        process.exit(1)
    }
}