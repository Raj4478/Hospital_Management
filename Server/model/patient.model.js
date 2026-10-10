import mongoose from "mongoose";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const GENDERS = ["male", "female", "other"];
export const PATIENT_STATUSES = ["admitted", "discharged"];

const patientSchema = new mongoose.Schema(
    {
        patientName: { type: String, required: true, trim: true },
        disease: { type: String, required: true, trim: true },
        allergies: { type: String, trim: true, default: "" },
        organAffected: { type: String, trim: true, default: "" },
        bloodGroup: { type: String, enum: BLOOD_GROUPS, uppercase: true, trim: true, required: true },
        age: { type: Number, min: 0, max: 130 },
        gender: { type: String, enum: GENDERS },
        floorNumber: { type: String, trim: true, default: "" },
        roomNumber: { type: String, required: true, trim: true },
        bedNumber: { type: String, required: true, trim: true },
        contactInformation: { type: String, trim: true, default: "" },
        emergencyContact: { type: String, trim: true, default: "" },
        assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
        status: { type: String, enum: PATIENT_STATUSES, default: "admitted", index: true },
        admittedAt: { type: Date, default: Date.now },
        dischargedAt: { type: Date },
        coverImage: { type: String, default: "" },
    },
    { timestamps: true }
);

// A bed can only hold one admitted patient at a time.
patientSchema.index(
    { floorNumber: 1, roomNumber: 1, bedNumber: 1 },
    { unique: true, partialFilterExpression: { status: "admitted" } }
);

export const Patient = mongoose.models.Patient || mongoose.model("Patient", patientSchema);
