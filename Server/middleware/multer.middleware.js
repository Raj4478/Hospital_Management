import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

// Files stay in memory and go straight to Cloudinary: serverless hosts have no writable disk.
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024, files: 3 },
    fileFilter: (_req, file, cb) => {
        if (/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) return cb(null, true);
        cb(ApiError.badRequest("Only PNG, JPG, WEBP or GIF images are allowed"));
    },
});

/** Picks a single uploaded file by field name from upload.fields()/upload.single(). */
export const fileFrom = (req, field) => req.file?.fieldname === field ? req.file : req.files?.[field]?.[0];
