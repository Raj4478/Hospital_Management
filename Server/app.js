import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import router from "./router/user.router.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1); // behind Vercel / Render proxies, so rate limits see the real client IP

app.use(helmet());
app.use(cors({
    origin(origin, cb) {
        // Same-origin requests and tools like curl send no Origin header.
        if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
        cb(new ApiError(403, `Origin ${origin} is not allowed`));
    },
    credentials: true,
}));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    res.json({
        success: true,
        status: "ok",
        database: states[mongoose.connection.readyState] || "unknown",
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

// Lazily connect so the same app works as a long-running server and as a serverless function.
app.use("/api", async (_req, _res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        if (!env.isTest) console.error("MongoDB connection failed:", err.message);
        next(new ApiError(503, "Database is unavailable. Please try again shortly."));
    }
});

app.use("/api/v1", router);

app.use(notFound);
app.use(errorHandler);

export default app;
