import mongoose from "mongoose";

export const MEAL_SLOTS = ["morning", "evening", "night"];

const mealSchema = new mongoose.Schema(
    {
        meal: { type: String, required: true, trim: true },
        ingredients: { type: String, trim: true, default: "" },
        image: { type: String, default: "" },
    },
    { _id: false }
);

const dietPlanSchema = new mongoose.Schema(
    {
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
        morning: { type: mealSchema, required: true },
        evening: { type: mealSchema, required: true },
        night: { type: mealSchema, required: true },
        specialInstructions: { type: String, trim: true, default: "" },
        active: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export const DietPlan = mongoose.models.DietPlan || mongoose.model("DietPlan", dietPlanSchema);
