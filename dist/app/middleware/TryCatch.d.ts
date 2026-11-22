import type { NextFunction, Request, Response } from "express";
export declare const TryCatch: (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
//# sourceMappingURL=TryCatch.d.ts.map