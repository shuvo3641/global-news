import type { NextFunction, Request, Response } from "express";
export declare const authorizedRoles: (...allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authorized_roles.d.ts.map