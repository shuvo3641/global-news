import {z} from "zod"

// Create User Schema
export const createUserSchema = z.object({

    name: z
        .string()
        .trim()
        .nonempty("Enter your full name")
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters"),

    email: z
        .email("Invalid email address")
        .nonempty("Enter your email address")
        .trim()
        .toLowerCase(),

    role: z
        .enum(["USER", "JOURNALIST", "MODERATOR", "EDITOR", "ADMIN"], {
            message: "Invalid user role"
        }),

    password: z
        .string()
        .nonempty("Enter your password")
        .min(8, "Password must be at least 8 characters")
        .regex(/[0-9]/, "Password must contain at least 1 number")
        .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
        .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character")
        .max(100, "Password must not exceed 100 characters")

})


// Change Password Schema
export const changePasswordSchema = z.object({

    currentPassword: z
        .string()
        .min(1, "Current password is required"),

    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

}).refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
});