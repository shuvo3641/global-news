import nodemailer from "nodemailer";
import { config } from "./config.js";
import { responseHandler } from "../utils/responseHandler.js";
const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: Boolean(config.smtpSecure),
    auth: {
        user: config.smtpUser,
        pass: config.smtpPassword
    }
});
export const sendMail = async (res, receiver, subject, text, html) => {
    try {
        await transporter.sendMail({
            from: config.smtpUser,
            to: receiver,
            subject,
            text,
            html
        });
    }
    catch (error) {
        return responseHandler(res, 500, "Failed to send email");
    }
};
//# sourceMappingURL=nodemailer.js.map