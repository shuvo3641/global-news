import type { Response } from "express"
import { responseHandler } from "./responseHandler.js"

export const zodErrorHandler = (res: Response, validation: any) =>{
    const mainError = validation?.error?.issues?.map((issue: any)=>issue?.message)?.[0]
    return responseHandler(res, 400, mainError || "")
}