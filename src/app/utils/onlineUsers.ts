type OnlineUsersMap = Map<string, Set<string>>

// Store Online Users
const onlineUsers: OnlineUsersMap = new Map()

// Add User Connection
export const addOnlineUser = (userId: string, socketId: string) => {
    
    const existingSockets = onlineUsers.get(userId)
    
    if (existingSockets) {
        existingSockets.add(socketId)
    } else {
        onlineUsers.set(userId, new Set([socketId]))
    }
}

// Remove User Connection
export const removeOnlineUser = (userId: string, socketId: string) => {

    const existingSockets = onlineUsers.get(userId)

    if (!existingSockets) return

    existingSockets.delete(socketId)

    if (existingSockets.size === 0) {
        onlineUsers.delete(userId)
    }
}

// Check User Online
export const isUserOnline = (userId: string): boolean => {
    return onlineUsers.has(userId)
}

// Get Users Ative Socket Ids
export const getUserSockets = (userId: string): string[] => {
    return Array.from(onlineUsers.get(userId) ?? [])
}

// Get All Online Users Ids
export const getOnlineUsers = (): string[] => {
    return Array.from(onlineUsers.keys())
}