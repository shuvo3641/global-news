import type { NextFunction, Request, Response } from "express";
import { responseHandler } from "../utils/responseHandler.js";

export const TryCatch = (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try{
            return await handler(req, res, next)
        }catch(error){
            console.error(error)
            return responseHandler(res, 500, "Internal server error")
        }
    }
}