import mongoose from "mongoose";

export const STAFF_STATUSES = ["available", "busy", "off_duty"];
export const SHIFTS = ["morning", "evening", "night"];

const pantryStaffSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        contactInfo: { type: String, required: true, trim: true },
        shift: { type: String, enum: SHIFTS, default: "morning" },
        // Field name kept from v1; the delivery flow keeps it in sync automatically.
        deliveryStatus: { type: String, enum: STAFF_STATUSES, default: "available" },
        coverImage: { type: String, default: "" },
    },
    { timestamps: true }
);

export const PantryStaff = mongoose.models.PantryStaff || mongoose.model("PantryStaff", pantryStaffSchema);
