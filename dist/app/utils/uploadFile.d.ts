import type { Response } from "express";
export declare const uploadFile: (res: Response, filePath: string, folder: string, resourceType: "image" | "video" | "raw" | "auto") => Promise<{
    url: any;
    publicId: any;
}>;
//# sourceMappingURL=uploadFile.d.ts.map