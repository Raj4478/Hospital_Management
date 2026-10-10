import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // pure JS: no native build on serverless hosts
import { env } from "../config/env.js";

export const ROLES = ["Manager", "Pantry"];

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, lowercase: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        fullName: { type: String, required: true, trim: true },
        avatar: { type: String, default: "" },
        // Stored as AccountType so accounts created by v1 keep working; exposed as `role`.
        AccountType: { type: String, required: true, enum: ROLES },
        refreshToken: { type: String, select: false },
        lastLoginAt: { type: Date },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                ret.role = ret.AccountType;
                delete ret.AccountType;
                delete ret.password;
                delete ret.refreshToken;
                delete ret.__v;
                return ret;
            },
        },
    }
);

userSchema.pre("save", async function hashPassword(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = function isPasswordCorrect(password) {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function generateAccessToken() {
    return jwt.sign({ _id: this._id, role: this.AccountType }, env.accessSecret, { expiresIn: env.accessExpiry });
};

userSchema.methods.generateRefreshToken = function generateRefreshToken() {
    return jwt.sign({ _id: this._id }, env.refreshSecret, { expiresIn: env.refreshExpiry });
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
