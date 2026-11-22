import { User } from "./user.model.js"

// Find User By Email
export const findUserByEmail = async (email: string) => {
    const user = await User.findOne({email})
    return user
}


// Find User By Email With Password
export const findUserByEmailWithPassword = async (email: string) => {
    const user = await User.findOne({email}).select("+password")
    return user
}


// Find User By ID
export const findUserById = async (id: string) => {
    const user = await User.findById(id)
    return user
}


// Find Users
export const findUsers = async (filter: any, skip: number, limit: number) => {
    const users = await User.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(filter?.$text?.$search ? {score: {$meta: "textScore"}} : {createdAt: -1})

    return users
}


// Get Total Users
export const getTotalUsers = async (filter: any) => {
    const count = await User.countDocuments(filter)
    return count
}


// Create User
export const createUserAccount = async (userData: {
    name: string,
    email: string,
    provider?: "GOOGLE" | "CREDENTIALS",
    password?: string,
    role?: "USER" | "JOURNALIST" | "EDITOR" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN"
}) => {
    const createdUser = await User.create(userData)
    return createdUser
}