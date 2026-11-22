import type { Response } from "express"

export const responseHandler = (res: Response, statusCode: number, message: string, data?: unknown, error?: unknown) => {

    if(error !== undefined && error !== null){
        console.error(error)
    }

    return res.status(statusCode).json({
        success: statusCode < 400,
        message,
        ...((data !== undefined && data !== null) && {data})
    })
    
}