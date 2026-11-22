import type { NextFunction, Request, Response } from "express";
import { responseHandler } from "../utils/responseHandler.js";

export const authorizedRoles = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        
        // Check User Exists
        if(!req.user || !req.user.role) {
            return responseHandler(res, 401, "Unauthorized");
        }

        // Role Check
        if(!allowedRoles.includes(req.user.role)) {
            return responseHandler(res, 403, "Access denied: insufficient permissions");
        }

        next()

    }
}