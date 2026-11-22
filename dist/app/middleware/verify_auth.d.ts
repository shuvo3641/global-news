import type { NextFunction, Request, Response } from "express";
declare global {
    namespace Express {
        interface Request {
            user?: {
                _id: string;
                name: string;
                email: string;
                role: string;
                provider: "GOOGLE" | "CREDENTIALS";
            };
        }
    }
}
export declare const verifyAuth: (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
//# sourceMappingURL=verify_auth.d.ts.map