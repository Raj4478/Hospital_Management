import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

const configured = Boolean(env.cloudinary.cloud_name && env.cloudinary.api_key && env.cloudinary.api_secret);
if (configured) cloudinary.config(env.cloudinary);

/**
 * Uploads an in-memory file (from multer.memoryStorage) and returns its HTTPS URL.
 * Returns "" when there is no file or Cloudinary is not configured, so records still save.
 */
export async function uploadImage(file, folder = "medicare-hms") {
    if (!file?.buffer || !configured) return "";
    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image", transformation: [{ width: 800, height: 800, crop: "limit" }] },
            (err, res) => (err ? reject(err) : resolve(res))
        );
        stream.end(file.buffer);
    });
    return result?.secure_url || "";
}

export const isCloudinaryConfigured = configured;
