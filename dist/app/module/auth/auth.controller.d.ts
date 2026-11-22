import type { Request, Response } from "express";
export declare const registerUser: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const verifyAccount: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const loginUser: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const forgotPassword: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const resendOtp: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const verifyOtp: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const resetPassword: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const loginUserByGoogle: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const refreshAccessToken: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const logoutUser: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const getCurrentSession: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
//# sourceMappingURL=auth.controller.d.ts.map