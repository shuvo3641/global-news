export const responseHandler = (res, statusCode, message, data, error) => {
    if (error !== undefined && error !== null) {
        console.error(error);
    }
    return res.status(statusCode).json({
        success: statusCode < 400,
        message,
        ...((data !== undefined && data !== null) && { data })
    });
};
//# sourceMappingURL=responseHandler.js.map