import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { send } from "../utils/ApiResponse.js";
import { paginate } from "../utils/query.js";
import { uploadImage } from "../utils/cloudinary.js";
import { fileFrom } from "../middleware/multer.middleware.js";
import { Doctor, Patient } from "../model/index.js";

export const listDoctors = asyncHandler(async (req, res) => {
    const filter = {};
    if (typeof req.query.specialization === "string" && req.query.specialization) {
        filter.specialization = req.query.specialization;
    }
    const result = await paginate(Doctor, req, {
        searchFields: ["fullName", "specialization", "email"],
        filter,
        defaultSort: "fullName",
    });

    // Attach how many admitted patients each doctor on this page is looking after.
    const counts = await Patient.aggregate([
        { $match: { status: "admitted", assignedDoctor: { $in: result.items.map((d) => d._id) } } },
        { $group: { _id: "$assignedDoctor", n: { $sum: 1 } } },
    ]);
    const byId = new Map(counts.map((c) => [String(c._id), c.n]));
    result.items = result.items.map((d) => ({ ...d, patientCount: byId.get(String(d._id)) || 0 }));

    return send(res, 200, result, "Doctors fetched");
});

export const specializations = asyncHandler(async (_req, res) => {
    const list = await Doctor.distinct("specialization");
    return send(res, 200, list.sort(), "Specializations fetched");
});

export const createDoctor = asyncHandler(async (req, res) => {
    const coverImage = await uploadImage(fileFrom(req, "photo"), "medicare-hms/doctors");
    const doctor = await Doctor.create({ ...req.body, coverImage });
    return send(res, 201, doctor, "Doctor added");
});

export const updateDoctor = asyncHandler(async (req, res) => {
    const update = { ...req.body };
    const photo = fileFrom(req, "photo");
    if (photo) update.coverImage = await uploadImage(photo, "medicare-hms/doctors");

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!doctor) throw ApiError.notFound("Doctor");
    return send(res, 200, doctor, "Doctor updated");
});

export const deleteDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) throw ApiError.notFound("Doctor");
    await Patient.updateMany({ assignedDoctor: doctor._id }, { $unset: { assignedDoctor: 1 } });
    return send(res, 200, null, "Doctor removed");
});
