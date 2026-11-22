import { responseHandler } from "../utils/responseHandler.js";
export const authorizedRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Check User Exists
        if (!req.user || !req.user.role) {
            return responseHandler(res, 401, "Unauthorized");
        }
        // Role Check
        if (!allowedRoles.includes(req.user.role)) {
            return responseHandler(res, 403, "Access denied: insufficient permissions");
        }
        next();
    };
};
//# sourceMappingURL=authorized_roles.js.map