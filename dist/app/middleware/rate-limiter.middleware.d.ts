import type { NextFunction, Request, Response } from "express";
export declare const rateLimiter: (seconds: number, limit: number, key: string) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=rate-limiter.middleware.d.ts.map