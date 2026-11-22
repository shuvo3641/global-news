import type { Request, Response } from "express";
import { TryCatch } from "../../middleware/TryCatch.js";
import { responseHandler } from "../../utils/responseHandler.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./user.model.js";
import { changePasswordSchema, createUserSchema } from "./user.validation.js";
import { zodErrorHandler } from "../../utils/zodErrorHandler.js";
import { createUserAccount, findUserByEmail, findUserById, findUsers, getTotalUsers } from "./user.service.js";
import sanitize from "mongo-sanitize";
import { redisClient } from "../../config/redis.js";


// Get My Data
export const getMyData = TryCatch(async (req: Request, res: Response) => {

    // Req.user Check
    if(!req.user){
        return responseHandler(res, 401, "Unauthorized access");
    }

    // My Id From Req.user
    const myId = req.user._id

    // Find User By ID
    const user = await findUserById(myId)
    if(!user) {
        return responseHandler(res, 404, "User not found")
    }

    return responseHandler(res, 200, "Current user retrieved successfully", {
        user
    })

})


// Get Users
export const getUsers = TryCatch(async (req: Request, res: Response) => {

    // Query Params
    let {search="", role="", status="", limit, page} = req.query

    // Validate
    const searchValue = typeof search === "string" ? search.trim() : ""
    const roleValue = typeof role === "string" ? role.trim() : ""
    const statusValue = typeof status === "string" ? status.trim() : ""
    let numberLimit = Number(limit) || 20
    let numberPage = Number(page) || 1

    // Validate
    if(numberLimit > 100) {
        numberLimit = 100
    }

    // Filter
    const filter: any = {}

    if(searchValue?.trim()) {
        filter.$text = {
            $search: searchValue?.trim()
        }
    }
    if(["USER", "JOURNALIST", "EDITOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"].includes(roleValue?.trim())) {
        filter.role = roleValue?.trim()
    }
    if(["blocked", "deleted", "active"].includes(statusValue?.trim())) {
        if(statusValue?.trim() === "active") {
            filter.isBlocked = false
            filter.isDeleted = false
        }else if(statusValue?.trim() === "deleted") {
            filter.isDeleted = true
        }else if(statusValue?.trim() === "blocked"){
            filter.isBlocked = true
            filter.isDeleted = false
        }
    }

    // Skip
    const skip = (numberPage - 1) * numberLimit

    // Find Users
    const users = await findUsers(filter, skip, numberLimit)

    // Total Users
    const totalUsers = await getTotalUsers(filter)

    // Pagination
    const pagination = {
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / numberLimit),

        page: numberPage,
        limit: numberLimit,

        hasPrevPage: numberPage > 1,
        hasNextPage: Math.ceil(totalUsers / numberLimit) > numberPage,

        from : totalUsers === 0 ? 0 : (numberPage - 1) * numberLimit + 1,
        to: Math.min(numberPage * numberLimit, totalUsers),
    }

    return responseHandler(res, 200, "Users fetched successfully", {
        users,
        pagination
    })
      
})


// Change Password
export const changePassword = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser: any = req.user

    // Check Provider
    if(currentUser?.provider === "GOOGLE") {
        return responseHandler(res, 400, "Password change is only available for credential-based accounts")
    }

    // Validate Body Data
    const validate = changePasswordSchema.safeParse(req.body)
    if(!validate?.success) {
        return zodErrorHandler(res, validate)
    }

    // Find User
    const user: any = await User.findOne({
        _id: currentUser._id,
        isDeleted: false
    }).select("+password")
    if(user.isBlocked) {
        return responseHandler(res, 403, "Your account has been blocked")
    }

    // Extract Validated Data
    const {currentPassword, newPassword} = validate.data

    // Compare Password
    const isMatched = await bcrypt.compare(currentPassword, user?.password)
    if(!isMatched) {
        return responseHandler(res, 400, "Current password is incorrect")
    }

    // Check New Password
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if(isSamePassword) {
        return responseHandler(res, 400, "New password must be different from current password")
    }

    // Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update Password
    user.password = hashedPassword
    await user.save()

    return responseHandler(res, 200, "Password changed successfully")

})


// Toggle User Block Status
export const toggleUserBlockStatus = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser = req?.user

    // User ID From Params
    const {userId} = req.params

    // Validate
    if(!userId) {
        return responseHandler(res, 400, "User ID is required")
    }
    if(!mongoose.isValidObjectId(userId)) {
        return responseHandler(res, 400, "Invalid user ID")
    }

    // Find User
    const user = await findUserById(userId?.toString())
    if(!user) {
        return responseHandler(res, 404, "User not found")
    }

    // Check Own Account
    if(user?._id?.toString() === currentUser?._id?.toString()) {
        return responseHandler(res, 403, "You cannot block or unblock your own account.")
    }

    // Check Deleted Account
    if(user?.isDeleted) {
        return responseHandler(res, 400, "Deleted users cannot be blocked or unblocked.");
    }

    // Role & Permission Manage
    if(currentUser?.role === "ADMIN" && !["USER", "JOURNALIST", "EDITOR", "MODERATOR"].includes(user?.role)) {
        return responseHandler(res, 403, "You do not have permission to manage this user.")
    }
    if(currentUser?.role === "SUPER_ADMIN" && !["USER", "JOURNALIST", "EDITOR", "MODERATOR", "ADMIN"].includes(user?.role)) {
        return responseHandler(res, 403, "You do not have permission to manage this user.")
    }
    
    // Toggle Block Status
    user.isBlocked = !user.isBlocked
    await user.save()

    // Delete User Session From Redis
    const userSessionRedisKey = `USER_SESSION:${user._id}`
    await redisClient.del(userSessionRedisKey)

    return responseHandler(res, 200, user.isBlocked ? "User blocked successfully." : "User unblocked successfully.")

})


// Toggle User Delete Status
export const toggleUserDeleteStatus = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser = req?.user

    // User ID From Params
    const {userId} = req.params

    // Validate
    if(!userId) {
        return responseHandler(res, 400, "User ID is required")
    }
    if(!mongoose.isValidObjectId(userId)) {
        return responseHandler(res, 400, "Invalid user ID")
    }

    // Find User
    const user = await findUserById(userId?.toString())
    if(!user) {
        return responseHandler(res, 404, "User not found")
    }

    // Check Own Account
    if(user?._id?.toString() === currentUser?._id?.toString()) {
        return responseHandler(res, 403, "You cannot delete or restore your own account.")
    }

    // Role & Permission Manage
    if(currentUser?.role === "ADMIN" && !["USER", "JOURNALIST", "EDITOR", "MODERATOR"].includes(user?.role)) {
        return responseHandler(res, 403, "You do not have permission to manage this user.")
    }
    if(currentUser?.role === "SUPER_ADMIN" && !["USER", "JOURNALIST", "EDITOR", "MODERATOR", "ADMIN"].includes(user?.role)) {
        return responseHandler(res, 403, "You do not have permission to manage this user.")
    }
    
    // Toggle Delete Status
    user.isDeleted = !user.isDeleted
    await user.save()

    return responseHandler(res, 200, user.isDeleted ? "User deleted successfully." : "User restored successfully.")

})


// Create User
export const createUser = TryCatch(async (req: Request, res: Response) => {

    // Current User
    const currentUser = req.user

    // Validate
    const validate = createUserSchema.safeParse(req.body)
    if(!validate?.success) {
        return zodErrorHandler(res, validate)
    }

    // Sanitize Data
    const {name, email, role, password} = sanitize(validate.data)

    // User Already Exist
    const isExists = await findUserByEmail(email)
    if(isExists) {
        return responseHandler(res, 409, "User with this email already exists")
    }

    // Restrice Role
    if(currentUser?.role === "ADMIN" && !["USER", "JOURNALIST", "EDITOR", "MODERATOR"].includes(role)) {
        return responseHandler(res, 403, "You are not allowed to create this role")
    }
    if(currentUser?.role === "SUPER_ADMIN" && !["USER", "JOURNALIST", "EDITOR", "MODERATOR", "ADMIN"].includes(role)) {
        return responseHandler(res, 403, "You are not allowed to create this role")
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create User
    await createUserAccount({
        name,
        email,
        provider: "CREDENTIALS",
        role,
        password: hashedPassword
    })

    return responseHandler(res, 201, "User created successfully")

})