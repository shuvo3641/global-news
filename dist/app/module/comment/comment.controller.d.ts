import type { Request, Response } from "express";
export declare const createComment: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const getDashboardComments: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const getArticleComments: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const getCommentReplies: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const updateCommentStatus: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const deleteComment: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const updateComment: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
export declare const toggleCommentReaction: (req: Request, res: Response, next: import("express").NextFunction) => Promise<unknown>;
//# sourceMappingURL=comment.controller.d.ts.map