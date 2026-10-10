import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { send } from "../utils/ApiResponse.js";
import { paginate, escapeRegex } from "../utils/query.js";
import { uploadImage } from "../utils/cloudinary.js";
import { fileFrom } from "../middleware/multer.middleware.js";
import { DietPlan, Patient, MEAL_SLOTS } from "../model/index.js";

// The API takes flat form fields (morningMeal, morningIngredients, morningImage…)
// and stores them nested as { morning: { meal, ingredients, image } }.
async function mealsFrom(req, existing) {
    const meals = {};
    for (const slot of MEAL_SLOTS) {
        const meal = req.body[`${slot}Meal`];
        const ingredients = req.body[`${slot}Ingredients`];
        const file = fileFrom(req, `${slot}Image`);
        if (meal === undefined && ingredients === undefined && !file) continue;
        const prev = existing?.[slot] || {};
        meals[slot] = {
            meal: meal ?? prev.meal,
            ingredients: ingredients ?? prev.ingredients ?? "",
            image: file ? await uploadImage(file, "medicare-hms/meals") : prev.image || "",
        };
    }
    return meals;
}

export const listDietPlans = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.active !== "all") filter.active = req.query.active !== "false";
    if (typeof req.query.patient === "string" && req.query.patient) filter.patient = req.query.patient;

    // Search covers the patient's name (a separate collection) as well as the meals.
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q) {
        const rx = new RegExp(escapeRegex(q), "i");
        const patientIds = await Patient.find({ patientName: rx }).distinct("_id");
        filter.$or = [{ patient: { $in: patientIds } }, ...MEAL_SLOTS.map((s) => ({ [`${s}.meal`]: rx }))];
    }

    const result = await paginate(DietPlan, req, {
        filter,
        populate: [{ path: "patient", select: "patientName roomNumber bedNumber floorNumber allergies status" }],
    });
    return send(res, 200, result, "Diet plans fetched");
});

export const createDietPlan = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.body.patient);
    if (!patient) throw ApiError.notFound("Patient");
    if (patient.status !== "admitted") throw ApiError.badRequest("Diet plans can only be created for admitted patients");

    // One active plan per patient: the new plan replaces the old one.
    await DietPlan.updateMany({ patient: patient._id, active: true }, { active: false });

    const plan = await DietPlan.create({
        patient: patient._id,
        ...(await mealsFrom(req)),
        specialInstructions: req.body.specialInstructions,
        createdBy: req.user._id,
    });
    return send(res, 201, plan, "Diet plan created");
});

export const updateDietPlan = asyncHandler(async (req, res) => {
    const plan = await DietPlan.findById(req.params.id);
    if (!plan) throw ApiError.notFound("Diet plan");

    Object.assign(plan, await mealsFrom(req, plan.toObject()));
    if (req.body.specialInstructions !== undefined) plan.specialInstructions = req.body.specialInstructions;
    if (req.body.active !== undefined) plan.active = req.body.active;
    await plan.save();

    return send(res, 200, plan, "Diet plan updated");
});
