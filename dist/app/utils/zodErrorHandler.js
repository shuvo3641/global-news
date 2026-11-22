import { responseHandler } from "./responseHandler.js";
export const zodErrorHandler = (res, validation) => {
    const mainError = validation?.error?.issues?.map((issue) => issue?.message)?.[0];
    return responseHandler(res, 400, mainError || "");
};
//# sourceMappingURL=zodErrorHandler.js.map