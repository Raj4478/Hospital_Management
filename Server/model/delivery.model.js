import mongoose from "mongoose";
import { MEAL_SLOTS } from "./dietPlan.model.js";

// Allowed moves from each status; anything not listed is rejected.
export const DELIVERY_FLOW = {
    pending: ["preparing", "cancelled"],
    preparing: ["out_for_delivery", "cancelled"],
    out_for_delivery: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
};
export const DELIVERY_STATUSES = Object.keys(DELIVERY_FLOW);
export const OPEN_DELIVERY_STATUSES = ["pending", "preparing", "out_for_delivery"];

const eventSchema = new mongoose.Schema(
    {
        status: { type: String, enum: DELIVERY_STATUSES, required: true },
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: { type: String, trim: true, default: "" },
    },
    { _id: false }
);

const deliverySchema = new mongoose.Schema(
    {
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
        staff: { type: mongoose.Schema.Types.ObjectId, ref: "PantryStaff", required: true },
        dietPlan: { type: mongoose.Schema.Types.ObjectId, ref: "DietPlan" },
        mealSlot: { type: String, enum: MEAL_SLOTS, required: true },
        scheduledFor: { type: Date, default: Date.now, index: true },
        status: { type: String, enum: DELIVERY_STATUSES, default: "pending", index: true },
        notes: { type: String, trim: true, default: "" },
        deliveredAt: { type: Date },
        timeline: { type: [eventSchema], default: [] },
    },
    { timestamps: true }
);

export const Delivery = mongoose.models.Delivery || mongoose.model("Delivery", deliverySchema);
