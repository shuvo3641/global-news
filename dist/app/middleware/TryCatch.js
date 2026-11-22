import { responseHandler } from "../utils/responseHandler.js";
export const TryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            return await handler(req, res, next);
        }
        catch (error) {
            console.error(error);
            return responseHandler(res, 500, "Internal server error");
        }
    };
};
//# sourceMappingURL=TryCatch.js.map