import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { send } from "../utils/ApiResponse.js";
import { uploadImage } from "../utils/cloudinary.js";
import { fileFrom } from "../middleware/multer.middleware.js";
import { User } from "../model/user.model.js";
import { env } from "../config/env.js";

const MINUTE = 60 * 1000;
const cookieBase = {
    httpOnly: true,
    secure: env.isProd || env.cookieSameSite === "none",
    sameSite: env.cookieSameSite,
    path: "/",
};
const accessCookie = { ...cookieBase, maxAge: 15 * MINUTE };
const refreshCookie = { ...cookieBase, maxAge: 7 * 24 * 60 * MINUTE };

async function issueTokens(user, res) {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });
    res.cookie("accessToken", accessToken, accessCookie).cookie("refreshToken", refreshToken, refreshCookie);
    return { accessToken };
}

export const register = asyncHandler(async (req, res) => {
    const { fullName, username, email, password, role } = req.body;
    if (!env.signupRoles.includes(role)) {
        throw ApiError.forbidden(`Self sign-up is not enabled for the ${role} role`);
    }

    const exists = await User.exists({ $or: [{ username }, { email }] });
    if (exists) throw ApiError.conflict("An account with this email or username already exists");

    const avatar = await uploadImage(fileFrom(req, "avatar"), "medicare-hms/users");
    const user = await User.create({ fullName, username, email, password, AccountType: role, avatar });

    return send(res, 201, user, "Account created. You can sign in now.");
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    // Same message for unknown email and wrong password, so accounts can't be enumerated.
    if (!user || !(await user.isPasswordCorrect(password))) {
        throw ApiError.unauthorized("Incorrect email or password");
    }

    const { accessToken } = await issueTokens(user, res);
    return send(res, 200, { user, accessToken }, `Welcome back, ${user.fullName.split(" ")[0]}`);
});

export const refresh = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) throw ApiError.unauthorized("No refresh token");

    let decoded;
    try {
        decoded = jwt.verify(token, env.refreshSecret);
    } catch {
        throw ApiError.unauthorized("Session expired. Please sign in again.");
    }

    const user = await User.findById(decoded._id).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
        throw ApiError.unauthorized("Session expired. Please sign in again.");
    }

    const { accessToken } = await issueTokens(user, res);
    return send(res, 200, { user, accessToken }, "Session refreshed");
});

export const logout = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (token) {
        await User.updateOne({ refreshToken: token }, { $unset: { refreshToken: 1 } });
    }
    res.clearCookie("accessToken", cookieBase).clearCookie("refreshToken", cookieBase);
    return send(res, 200, null, "Signed out");
});

export const me = asyncHandler(async (req, res) => send(res, 200, req.user, "Current user"));

export const signupOptions = (_req, res) => send(res, 200, { roles: env.signupRoles }, "Sign-up options");
