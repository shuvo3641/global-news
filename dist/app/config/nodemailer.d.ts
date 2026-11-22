import type { Response } from "express";
export declare const sendMail: (res: Response, receiver: string, subject: string, text: string, html: string) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=nodemailer.d.ts.map