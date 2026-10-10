import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/user.model.js";
import { env } from "../config/env.js";

export const verifyJWT = asyncHandler(async (req, _res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) throw ApiError.unauthorized();

    let decoded;
    try {
        decoded = jwt.verify(token, env.accessSecret);
    } catch (err) {
        throw ApiError.unauthorized(err.name === "TokenExpiredError" ? "Session expired" : "Invalid access token");
    }

    const user = await User.findById(decoded._id);
    if (!user) throw ApiError.unauthorized("Account no longer exists");

    req.user = user;
    next();
});

/** Restricts a route to the given roles. Use after verifyJWT. */
export const authorize = (...roles) => (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.AccountType)) {
        return next(ApiError.forbidden());
    }
    next();
};
