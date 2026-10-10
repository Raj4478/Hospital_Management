import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { send } from "../utils/ApiResponse.js";
import { paginate, toCsv } from "../utils/query.js";
import { uploadImage } from "../utils/cloudinary.js";
import { fileFrom } from "../middleware/multer.middleware.js";
import { Patient, DietPlan, Delivery, PATIENT_STATUSES, OPEN_DELIVERY_STATUSES } from "../model/index.js";

const SEARCH = ["patientName", "disease", "roomNumber", "bedNumber", "allergies"];

const listFilter = (query) => {
    const filter = {};
    if (PATIENT_STATUSES.includes(query.status)) filter.status = query.status;
    if (typeof query.floor === "string" && query.floor) filter.floorNumber = query.floor;
    return filter;
};

export const listPatients = asyncHandler(async (req, res) => {
    const result = await paginate(Patient, req, {
        searchFields: SEARCH,
        filter: listFilter(req.query),
        populate: [{ path: "assignedDoctor", select: "fullName specialization" }],
    });
    return send(res, 200, result, "Patients fetched");
});

export const getPatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id).populate("assignedDoctor", "fullName specialization Contact_Number");
    if (!patient) throw ApiError.notFound("Patient");

    const [dietPlan, deliveries] = await Promise.all([
        DietPlan.findOne({ patient: patient._id, active: true }).sort("-createdAt"),
        Delivery.find({ patient: patient._id }).sort("-scheduledFor").limit(10).populate("staff", "name"),
    ]);
    return send(res, 200, { ...patient.toObject(), dietPlan, deliveries }, "Patient fetched");
});

export const createPatient = asyncHandler(async (req, res) => {
    const coverImage = await uploadImage(fileFrom(req, "photo"), "medicare-hms/patients");
    const patient = await Patient.create({ ...req.body, coverImage });
    return send(res, 201, patient, "Patient admitted");
});

export const updatePatient = asyncHandler(async (req, res) => {
    const update = { ...req.body };
    const photo = fileFrom(req, "photo");
    if (photo) update.coverImage = await uploadImage(photo, "medicare-hms/patients");

    if (update.status === "discharged") update.dischargedAt = new Date();
    if (update.status === "admitted") update.$unset = { dischargedAt: 1 };

    const patient = await Patient.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!patient) throw ApiError.notFound("Patient");
    return send(res, 200, patient, "Patient updated");
});

export const dischargePatient = asyncHandler(async (req, res) => {
    const existing = await Patient.findById(req.params.id).select("status");
    if (!existing) throw ApiError.notFound("Patient");
    if (existing.status === "discharged") throw ApiError.badRequest("Patient is already discharged");

    // updateOne-style write: v1 records may hold values (e.g. lowercase blood groups) that full validation would reject.
    const patient = await Patient.findByIdAndUpdate(
        req.params.id,
        { status: "discharged", dischargedAt: new Date() },
        { new: true }
    );

    // Stop feeding a discharged patient: close the diet plan and cancel open deliveries.
    await Promise.all([
        DietPlan.updateMany({ patient: patient._id, active: true }, { active: false }),
        Delivery.updateMany(
            { patient: patient._id, status: { $in: OPEN_DELIVERY_STATUSES } },
            { status: "cancelled", $push: { timeline: { status: "cancelled", by: req.user._id, note: "Patient discharged" } } }
        ),
    ]);
    return send(res, 200, patient, "Patient discharged");
});

export const exportPatients = asyncHandler(async (req, res) => {
    const patients = await Patient.find(listFilter(req.query)).sort("patientName").populate("assignedDoctor", "fullName").lean();
    const csv = toCsv(patients, [
        { label: "Name", value: (p) => p.patientName },
        { label: "Status", value: (p) => p.status },
        { label: "Age", value: (p) => p.age },
        { label: "Gender", value: (p) => p.gender },
        { label: "Blood group", value: (p) => p.bloodGroup },
        { label: "Condition", value: (p) => p.disease },
        { label: "Allergies", value: (p) => p.allergies },
        { label: "Floor", value: (p) => p.floorNumber },
        { label: "Room", value: (p) => p.roomNumber },
        { label: "Bed", value: (p) => p.bedNumber },
        { label: "Doctor", value: (p) => p.assignedDoctor?.fullName },
        { label: "Contact", value: (p) => p.contactInformation },
        { label: "Emergency contact", value: (p) => p.emergencyContact },
        { label: "Admitted", value: (p) => p.admittedAt?.toISOString().slice(0, 10) },
    ]);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="patients-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
});
