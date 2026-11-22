// Store Online Users
const onlineUsers = new Map();
// Add User Connection
export const addOnlineUser = (userId, socketId) => {
    const existingSockets = onlineUsers.get(userId);
    if (existingSockets) {
        existingSockets.add(socketId);
    }
    else {
        onlineUsers.set(userId, new Set([socketId]));
    }
};
// Remove User Connection
export const removeOnlineUser = (userId, socketId) => {
    const existingSockets = onlineUsers.get(userId);
    if (!existingSockets)
        return;
    existingSockets.delete(socketId);
    if (existingSockets.size === 0) {
        onlineUsers.delete(userId);
    }
};
// Check User Online
export const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
};
// Get Users Ative Socket Ids
export const getUserSockets = (userId) => {
    return Array.from(onlineUsers.get(userId) ?? []);
};
// Get All Online Users Ids
export const getOnlineUsers = () => {
    return Array.from(onlineUsers.keys());
};
//# sourceMappingURL=onlineUsers.js.map