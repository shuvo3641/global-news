import {Server} from "socket.io";
import type { Server as HttpServer } from "node:http";
import { config } from "./config.js";
import { socketAuth } from "./socket.auth.js";
import { addOnlineUser, getOnlineUsers, removeOnlineUser } from "../utils/onlineUsers.js";

// Socket.IO Instance
let io: Server | null = null

// Initialize Socket.io
export const initializeSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: config.clientUrl,
            credentials: true,
        }
    })

    io.use(socketAuth);

    io.on("connection", (socket) => {

        // Authenticated User ID
        const userId = socket.data.user._id

        // Add User Connection
        addOnlineUser(userId, socket.id)

        // Join Socket
        socket.join(`user:${userId}`)

        // Socket Disconnection
        socket.on("disconnect", () => {
            
            // Remove User Connection
            removeOnlineUser(userId, socket.id) 
        })

    })

    console.log("Socket.IO server initialized")

    return io
}

// Get Socket.IO Instance
export const getIO = (): Server => {
    if(!io) {
        throw new Error("Socket.IO has not been initialized")
    }

    return io
}