import { createServer } from "node:http";
import app from "./app.js";
import { config } from "./app/config/config.js";
import { connectDB } from "./app/config/db.js";
import { connectRedis } from "./app/config/redis.js";
import { initializeSocket } from "./app/config/socket.js";

// Http Server
const httpServer = createServer(app)

async function startServer () {
    await connectDB()
    await connectRedis()
    initializeSocket(httpServer)
    httpServer.listen(config.port, ()=>{
        console.log(`Server running on port: ${config.port}`)
    });
}

startServer()