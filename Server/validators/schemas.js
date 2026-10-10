import { z } from "zod";
import mongoose from "mongoose";
import { ROLES } from "../model/user.model.js";
import { BLOOD_GROUPS, GENDERS, PATIENT_STATUSES } from "../model/patient.model.js";
import { MEAL_SLOTS } from "../model/dietPlan.model.js";
import { STAFF_STATUSES, SHIFTS } from "../model/pantryStaff.model.js";
import { DELIVERY_STATUSES } from "../model/delivery.model.js";

// Form posts send "" for untouched fields; treat that as "not provided".
const blank = (schema) => z.preprocess((v) => (v === "" || v === null ? undefined : v), schema);
const text = (max = 200) => z.string().trim().min(1, "Required").max(max);
const optText = (max = 200) => blank(z.string().trim().max(max).optional());
const optNumber = (min, max) => blank(z.coerce.number().int().min(min).max(max).optional());
const phone = z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, "Enter a valid phone number");
const bool = z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean());

export const objectId = z.string().refine((v) => mongoose.isValidObjectId(v), "Invalid id");

export const idParam = z.object({ id: objectId });

export const registerSchema = z.object({
    fullName: text(80),
    username: z.string().trim().toLowerCase().regex(/^[a-z0-9_.]{3,30}$/, "3–30 letters, numbers, dots or underscores"),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters").max(72)
        .regex(/[A-Za-z]/, "Include a letter").regex(/\d/, "Include a number"),
    role: z.enum(ROLES),
});

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

export const patientSchema = z.object({
    patientName: text(80),
    disease: text(120),
    allergies: optText(200),
    organAffected: optText(80),
    bloodGroup: z.preprocess((v) => (typeof v === "string" ? v.trim().toUpperCase() : v), z.enum(BLOOD_GROUPS)),
    age: optNumber(0, 130),
    gender: blank(z.enum(GENDERS).optional()),
    floorNumber: optText(10),
    roomNumber: text(10),
    bedNumber: text(10),
    contactInformation: blank(phone.optional()),
    emergencyContact: blank(phone.optional()),
    assignedDoctor: blank(objectId.optional()),
});
export const patientUpdateSchema = patientSchema.partial().extend({
    status: z.enum(PATIENT_STATUSES).optional(),
});

export const doctorSchema = z.object({
    fullName: text(80),
    specialization: text(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    Contact_Number: phone,
    website: blank(z.string().trim().url("Enter a full URL, e.g. https://…").optional()),
    bio: optText(500),
    age: optNumber(18, 100),
    experience: optNumber(0, 80),
    available: blank(bool.optional()),
});
export const doctorUpdateSchema = doctorSchema.partial();

const mealFields = Object.fromEntries(MEAL_SLOTS.flatMap((slot) => [
    [`${slot}Meal`, text(120)],
    [`${slot}Ingredients`, optText(300)],
]));
export const dietPlanSchema = z.object({
    patient: objectId,
    ...mealFields,
    specialInstructions: optText(500),
});
export const dietPlanUpdateSchema = dietPlanSchema.omit({ patient: true }).partial().extend({
    active: blank(bool.optional()),
});

export const staffSchema = z.object({
    name: text(80),
    contactInfo: phone,
    shift: blank(z.enum(SHIFTS).optional()),
    deliveryStatus: blank(z.enum(STAFF_STATUSES).optional()),
});
export const staffUpdateSchema = staffSchema.partial();

export const deliverySchema = z.object({
    patient: objectId,
    staff: objectId,
    mealSlot: z.enum(MEAL_SLOTS),
    scheduledFor: blank(z.coerce.date().optional()),
    notes: optText(300),
});
export const deliveryStatusSchema = z.object({
    status: z.enum(DELIVERY_STATUSES),
    note: optText(200),
});
