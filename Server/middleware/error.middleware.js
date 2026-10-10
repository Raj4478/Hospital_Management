import multer from "multer";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export const notFound = (req, _res, next) => next(ApiError.notFound(`Route ${req.method} ${req.originalUrl}`));

// Turns every error into the same JSON shape: { success: false, statusCode, message, errors }.
export const errorHandler = (err, req, res, _next) => {
    let error = err;

    if (err instanceof multer.MulterError) {
        error = ApiError.badRequest(err.code === "LIMIT_FILE_SIZE" ? "Image must be 2 MB or smaller" : err.message);
    } else if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
        error = ApiError.badRequest(errors[0]?.message || "Invalid data", errors);
    } else if (err instanceof mongoose.Error.CastError) {
        error = ApiError.badRequest(`Invalid ${err.path}`);
    } else if (err?.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "value";
        const message = field === "floorNumber" || field === "roomNumber" || field === "bedNumber"
            ? "That bed is already occupied by an admitted patient"
            : `A record with this ${field} already exists`;
        error = ApiError.conflict(message);
    } else if (err?.type === "entity.parse.failed") {
        error = ApiError.badRequest("Malformed JSON body");
    } else if (!(err instanceof ApiError)) {
        if (!env.isTest) console.error(`[${req.method} ${req.originalUrl}]`, err);
        error = new ApiError(500, env.isProd ? "Something went wrong. Please try again." : err.message);
    }

    res.status(error.statusCode).json({
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors || [],
    });
};
