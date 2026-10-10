import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        specialization: { type: String, required: true, trim: true, index: true },
        email: { type: String, required: true, trim: true, lowercase: true, unique: true },
        // Field name kept from v1 so existing records still load.
        Contact_Number: { type: String, required: true, trim: true },
        website: { type: String, trim: true, default: "" },
        bio: { type: String, trim: true, maxlength: 500, default: "" },
        age: { type: Number, min: 18, max: 100 },
        experience: { type: Number, min: 0, max: 80 },
        available: { type: Boolean, default: true },
        coverImage: { type: String, default: "" },
    },
    { timestamps: true }
);

export const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
