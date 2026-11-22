import nodemailer from "nodemailer"
import { config } from "./config.js"
import type { Response } from "express"
import { responseHandler } from "../utils/responseHandler.js"


const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: Boolean(config.smtpSecure),
    auth: {
        user: config.smtpUser,
        pass: config.smtpPassword
    }
})


export const sendMail = async (res: Response, receiver: string, subject: string, text: string, html: string) => {
    try{
        await transporter.sendMail({
            from: config.smtpUser,
            to: receiver,
            subject,
            text,
            html
        })
    }catch(error){
        return responseHandler(res, 500, "Failed to send email")
    }
}