import { User } from "./user.model.js";
// Find User By Email
export const findUserByEmail = async (email) => {
    const user = await User.findOne({ email });
    return user;
};
// Find User By Email With Password
export const findUserByEmailWithPassword = async (email) => {
    const user = await User.findOne({ email }).select("+password");
    return user;
};
// Find User By ID
export const findUserById = async (id) => {
    const user = await User.findById(id);
    return user;
};
// Find Users
export const findUsers = async (filter, skip, limit) => {
    const users = await User.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(filter?.$text?.$search ? { score: { $meta: "textScore" } } : { createdAt: -1 });
    return users;
};
// Get Total Users
export const getTotalUsers = async (filter) => {
    const count = await User.countDocuments(filter);
    return count;
};
// Create User
export const createUserAccount = async (userData) => {
    const createdUser = await User.create(userData);
    return createdUser;
};
//# sourceMappingURL=user.service.js.map